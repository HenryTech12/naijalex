#!/usr/bin/env bash
set -euo pipefail
BASE_URL="http://127.0.0.1:8000/api/v1"
TMPDIR="./scripts/tmp_api_test"
mkdir -p "$TMPDIR"
TESTFILE="$TMPDIR/test_contract.txt"
printf "This is a test contract content for API tests." > "$TESTFILE"

echo "=== 1) Health Check ==="
curl -sS -X GET "$BASE_URL/health" || true

echo "\n=== 2) Create User ==="
CREATE_USER_RES=$(curl -sS -X POST "$BASE_URL/users/" -H "Content-Type: application/json" -d '{"business_type":"Freelance"}') || true
echo "$CREATE_USER_RES"
USER_ID=$(echo "$CREATE_USER_RES" | python - <<'PY'
import sys, json
try:
  print(json.load(sys.stdin)['id'])
except Exception:
  print('')
PY
)
echo "Created user id: $USER_ID"

echo "\n=== 3) Upload Document (analyze) ==="
UPLOAD_RES=$(curl -sS -X POST "$BASE_URL/documents/analyze" \
  -F "file=@$TESTFILE;type=text/plain" \
  -F "user_id=$USER_ID" \
  -F "language_mode=english") || true
echo "$UPLOAD_RES"
ANALYSIS_ID=$(echo "$UPLOAD_RES" | python - <<'PY'
import sys, json
try:
    print(json.load(sys.stdin)['analysis_id'])
except Exception:
    print('')
PY
)
echo "Analysis id: $ANALYSIS_ID"

echo "\n=== 4) Get Analysis (may be processing) ==="
ANALYSIS_RES=$(curl -sS -X GET "$BASE_URL/documents/analysis/$ANALYSIS_ID" ) || true
echo "$ANALYSIS_RES"

echo "\n=== 5) Trigger WhatsApp webhook (onboarding) ==="
WHATSAPP_RES=$(curl -sS -X POST "$BASE_URL/webhook/whatsapp" \
  -F "From=whatsapp:+2348011223344" \
  -F "Body=Hello" \
  -F "NumMedia=0" \
  -F "SmsMessageSid=SM123") || true
echo "$WHATSAPP_RES"

echo "\n=== 6) Fetch Risk Card (likely 404 or processing) ==="
RISK_RES_CODE=0
RISK_RES=$(curl -sS -w "HTTPSTATUS:%{http_code}" "$BASE_URL/risk-card/$ANALYSIS_ID" || true)
HTTP_STATUS=$(echo "$RISK_RES" | tr -d '\n' | sed -E 's/.*HTTPSTATUS:([0-9]{3})$/\1/')
BODY=$(echo "$RISK_RES" | sed -E 's/HTTPSTATUS:[0-9]{3}$//')
echo "HTTP $HTTP_STATUS"
if [[ "$HTTP_STATUS" == "200" ]]; then
  echo "Received file response (saved to $TMPDIR/risk_card.pdf)"
  echo "$BODY" > "$TMPDIR/risk_card.pdf"
else
  echo "Body: $BODY"
fi

echo "\n=== Done ==="
