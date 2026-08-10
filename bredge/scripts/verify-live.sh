#!/usr/bin/env bash
# Read-only production launch verifier for The Bredge.
# Usage:  scripts/verify-live.sh <host> <expect-index|expect-noindex>
# Example (post-cutover): scripts/verify-live.sh https://thebredge.com expect-index
#         (preview):      scripts/verify-live.sh https://bredge.thebredge.workers.dev expect-noindex
# Nothing here mutates state. Exit code 0 = all critical checks passed.
set -u
HOST="${1:-https://bredge.thebredge.workers.dev}"
MODE="${2:-expect-noindex}"   # expect-index | expect-noindex
CB="cb=$RANDOM$RANDOM"
pass=0; fail=0
ok(){ echo "  ✓ $1"; pass=$((pass+1)); }
bad(){ echo "  ✗ $1"; fail=$((fail+1)); }
get(){ curl -s -m 20 "$1"; }
code(){ curl -s -m 20 -o /dev/null -w "%{http_code}" "$1"; }

echo "== Verifying $HOST ($MODE) =="

echo "[TLS / reachability]"
C=$(curl -s -m 20 -o /dev/null -w "%{http_code}|ssl=%{ssl_verify_result}" "$HOST/?$CB")
[ "${C%%|*}" = "200" ] && ok "GET / -> 200 ($C)" || bad "GET / -> $C"

echo "[www -> apex 301, path+query preserved]"
if [[ "$HOST" == *thebredge.com* ]]; then
  R=$(curl -s -m 20 -o /dev/null -w "%{http_code}|%{redirect_url}" "https://www.thebredge.com/insights?foo=bar")
  echo "    www/insights?foo=bar -> $R"
  case "$R" in 301*|308*) case "$R" in *"https://thebredge.com/insights?foo=bar"*) ok "www 301 preserves path+query";; *) bad "www redirect target wrong: $R";; esac;; *) bad "www not 301: $R";; esac
else echo "    (skipped: not the apex host)"; fi

echo "[robots.txt]"
RB=$(get "$HOST/robots.txt?$CB")
echo "$RB" | grep -qi "OAI-SearchBot" && ok "robots lists OAI-SearchBot" || bad "robots missing OAI-SearchBot"
echo "$RB" | grep -qi "Disallow: /api/" && ok "robots disallows /api/" || bad "robots missing /api/ disallow"
echo "$RB" | grep -qi "sitemap:.*thebredge.com/sitemap.xml" && ok "robots sitemap -> thebredge.com" || bad "robots sitemap wrong"

echo "[sitemap.xml]"
SM=$(get "$HOST/sitemap.xml?$CB")
N=$(echo "$SM" | grep -c "<loc>"); A=$(echo "$SM" | grep -c "/insights/"); RS=$(echo "$SM" | grep -c "/resources/"); W=$(echo "$SM" | grep -c "workers.dev")
[ "$N" -ge 24 ] && ok "sitemap has $N urls" || bad "sitemap only $N urls"
[ "$A" -eq 10 ] && ok "10 insight articles" || bad "insight articles = $A (want 10)"
[ "$RS" -eq 6 ] && ok "6 resources" || bad "resources = $RS (want 6)"
[ "$W" -eq 0 ] && ok "no workers.dev in sitemap" || bad "workers.dev present in sitemap ($W)"

echo "[canonical host on key pages]"
for p in "/" "/services" "/insights" "/insights/why-dashboards-disagree" "/resources/data-quality-checklist"; do
  CAN=$(get "$HOST$p?$CB" | grep -o '<link rel="canonical" href="[^"]*"' | head -1)
  echo "$CAN" | grep -q 'https://thebredge.com' && ok "canonical ok: $p" || bad "canonical wrong: $p -> $CAN"
done

echo "[indexability]"
RM=$(get "$HOST/?$CB" | grep -o '<meta name="robots" content="[^"]*"' | head -1)
if [ "$MODE" = "expect-index" ]; then
  echo "$RM" | grep -qi "noindex" && bad "PROD homepage is noindex! ($RM)" || ok "prod homepage indexable ($RM or none)"
else
  echo "$RM" | grep -qi "noindex" && ok "preview noindex ($RM)" || bad "preview NOT noindex ($RM)"
fi

echo "[structured data types]"
get "$HOST/?$CB" | grep -o '"@type":"[A-Za-z]*"' | sort -u | tr '\n' ' '; echo
get "$HOST/insights/why-dashboards-disagree?$CB" | grep -oq '"@type":"Article"' && ok "Article schema on article" || bad "no Article schema"
get "$HOST/insights/why-dashboards-disagree?$CB" | grep -oq '"@type":"BreadcrumbList"' && ok "BreadcrumbList on article" || bad "no BreadcrumbList on article"
get "$HOST/services?$CB" | grep -oq '"@type":"Service"' && ok "Service schema on /services" || bad "no Service schema"

echo "[favicon]"
FC=$(curl -s -m 20 "$HOST/favicon.ico?$CB" | head -c 4 | xxd -p)
[ "$FC" = "00000100" ] && ok "favicon.ico is a real ICO (magic 00000100)" || bad "favicon.ico magic = $FC"

echo "[crawler access — 200, no challenge]"
for ua in "OAI-SearchBot/1.0" "ChatGPT-User/1.0" "Googlebot/2.1" "Bingbot/2.0"; do
  c=$(curl -s -m 20 -A "$ua" -o /dev/null -w "%{http_code}" "$HOST/?$CB")
  ch=$(curl -s -m 20 -A "$ua" "$HOST/?$CB" | grep -ciE "Just a moment|cf_chl|challenge-platform")
  { [ "$c" = "200" ] && [ "$ch" = "0" ]; } && ok "$ua -> 200, no challenge" || bad "$ua -> $c challenge=$ch"
done

echo "[all 10 articles + 6 resources + legal + 404]"
SLUGS=$(echo "$SM" | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g' | sed "s#https://thebredge.com##")
for p in $SLUGS "/privacy" "/cookies" "/terms" "/schedule"; do
  c=$(code "$HOST$p?$CB"); [ "$c" = "200" ] && pass=$((pass+1)) || bad "$p -> $c"
done
ok "all sitemap+legal URLs checked (failures listed above if any)"
c404=$(code "$HOST/this-does-not-exist-$RANDOM"); [ "$c404" = "404" ] && ok "404 route returns 404" || bad "404 route -> $c404"

echo "== $pass passed, $fail failed =="
[ "$fail" -eq 0 ]
