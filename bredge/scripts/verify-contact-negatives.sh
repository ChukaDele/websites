#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:?Usage: verify-contact-negatives.sh https://host local|production}"
MODE="${2:?Specify local or production}"
[[ "$MODE" == "local" || "$MODE" == "production" ]] || { echo "Invalid test mode"; exit 2; }
BASE_URL="${BASE_URL%/}"
if [[ "$BASE_URL" == "https://thebredge.com" ]]; then
  [[ "$MODE" == "production" ]] || { echo "Cannot classify public production as local"; exit 2; }
fi
ORIGIN="https://thebredge.com"
if [[ "$MODE" == "local" ]]; then ORIGIN="http://localhost:3100"; fi

reply="$(mktemp)"
trap 'rm -f "$reply"' EXIT
check_rejection() {
  local case_name="$1" elapsed="$2" honeypot="$3" expect="$4"
  local need="${5:-Data engineering}"
  local response status
  response="$(jq -nc --argjson elapsed "$elapsed" --arg trap "$honeypot" --arg need "$need" '
    {
      formType: "contact",
      name: "Release SOP Negative Test",
      email: "qa-check@invalid.example",
      company: "Internal QA",
      message: "Intentional negative verification. Must never create a saved lead.",
      needs: [$need],
      company_website: $trap,
      elapsedMs: $elapsed
    }')"
  status="$(printf '%s' "$response" | curl --silent --show-error --max-time 20 \
    -o "$reply" -w '%{http_code}' -X POST "$BASE_URL/api/contact" \
    -H "Origin: $ORIGIN" -H 'Content-Type: application/json' --data-binary @-)"
  if [[ "$status" != "$expect" ]]; then
    echo "FAIL $case_name: expected HTTP $expect; observed $status"
    exit 1
  fi
  if ! jq -e '(.ok // false) == false and (.error | type == "string")' <"$reply" >/dev/null; then
    echo "FAIL $case_name: unexpected successful or malformed response"
    exit 1
  fi
  echo "PASS $case_name: correctly rejected HTTP $status"
}
check_rejection "too-fast submission" 250 "" 422
check_rejection "autofilled honeypot" 5000 "autofilled.example" 422
check_rejection "unknown service category" 5000 "" 400 "fabricated-skill"
echo "CONTACT_NEGATIVE_TESTS_PASS ($MODE)"
