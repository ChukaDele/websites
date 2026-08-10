#!/usr/bin/env bash
# Regression guard for the Reference Work / Invisible-90% scroll-scene collision.
# Asserts the architecture invariant that caused the zoom overlap can't return:
#   - no .reference-case is position:sticky (was 3 independent sticky cards)
#   - all three WORK cards render
#   - /__build is reachable (build fingerprint)
# Usage: scripts/rw-regression.sh [host]   (default production)
set -u
HOST="${1:-https://thebredge.com}"; CB="cb=$RANDOM$RANDOM"; fail=0
CSS=$(curl -s -m 20 "$HOST/?$CB" | grep -oE '/_next/static/css/[^"]+\.css' | head -1)
CSSTXT=$(curl -s -m 20 "$HOST$CSS")
# 1) no reference-case sticky
if echo "$CSSTXT" | grep -oE '\.reference-case[^{]*\{[^}]*position:sticky[^}]*\}' | grep -q .; then
  echo "✗ FAIL: a .reference-case rule uses position:sticky (collision can recur)"; fail=1
else echo "✓ no .reference-case is position:sticky"; fi
# 2) three WORK cards present
HTML=$(curl -s -m 20 "$HOST/?$CB")
for w in "WORK 01" "WORK 02" "WORK 03"; do
  echo "$HTML" | grep -q "$w" && echo "✓ $w renders" || { echo "✗ FAIL: $w missing"; fail=1; }
done
# 3) build fingerprint reachable
code=$(curl -s -m 15 -o /dev/null -w "%{http_code}" "$HOST/__build")
[ "$code" = "200" ] && echo "✓ /__build 200" || { echo "✗ FAIL: /__build $code"; fail=1; }
echo "$([ $fail -eq 0 ] && echo PASS || echo FAIL)"; exit $fail
