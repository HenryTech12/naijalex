#!/usr/bin/env bash
set -eo pipefail
BASE="http://127.0.0.1:8000/api/v1"
TMPDIR="/tmp/naijalex_curl_test"
mkdir -p "$TMPDIR"

echo "Running curl-based smoke tests against $BASE"

# pretty print helper: use jq if available, otherwise python
pretty_print_json(){
  if command -v jq >/dev/null 2>&1; then
    jq .
  else
    # Python fallback: read stdin safely, handle empty bodies and invalid JSON
    python - <<'PY'
import sys, json
s = sys.stdin.read()
if not s or not s.strip():
    print('(no body)')
    sys.exit(0)
try:
    obj = json.loads(s)
    print(json.dumps(obj, indent=2))
except Exception:
    # If not JSON, print raw
    print(s)
PY
  fi
}

# 1) Health
echo "\n==> Health check"
# Capture response to avoid pipefail causing script exit on broken/empty responses
HEALTH_BODY=$(curl -sS "$BASE/health" || true)
if [ -z "$HEALTH_BODY" ]; then
  echo "(no body)"
else
  printf "%s" "$HEALTH_BODY" | pretty_print_json || printf "%s" "$HEALTH_BODY"
fi

# 2) Create user
echo "\n==> Create user"
USER_JSON="$TMPDIR/user.json"
curl -sS -X POST "$BASE/users/" -H 'Content-Type: application/json' -d '{"business_type":"Freelance"}' -o "$USER_JSON" || true
if [ ! -s "$USER_JSON" ]; then
  echo "Create user failed; response:" && cat "$USER_JSON" || true
  exit 1
fi
# Convert POSIX path to Windows path for Windows-native python (Git Bash)
if command -v cygpath >/dev/null 2>&1; then
  PY_USER_JSON=$(cygpath -w "$USER_JSON")
else
  PY_USER_JSON="$USER_JSON"
fi
USER_ID=$(python -c "import sys,json;print(json.load(open(r'$PY_USER_JSON'))['id'])")
echo "Created user: $USER_ID"

# 3) Get user profile
echo "\n==> Get user profile"
PROFILE_BODY=$(curl -sS "$BASE/users/$USER_ID/profile" || true)
if [ -z "$PROFILE_BODY" ]; then
  echo "(no body)"
else
  printf "%s" "$PROFILE_BODY" | pretty_print_json || printf "%s" "$PROFILE_BODY"
fi

# 4) Upload a document to analyze
echo "\n==> Upload document for analysis"
DOC_FILE="$TMPDIR/test_contract.txt"
echo "This is a sample Nigerian contract for testing. The governing law is Lagos State." > "$DOC_FILE"
if command -v cygpath >/dev/null 2>&1; then
  UPLOAD_DOC_PATH=$(cygpath -w "$DOC_FILE")
else
  UPLOAD_DOC_PATH="$DOC_FILE"
fi
UPLOAD_JSON="$TMPDIR/upload.json"
curl -sS -X POST "$BASE/documents/analyze" \
  -F "file=@$UPLOAD_DOC_PATH;type=text/plain" \
  -F "user_id=$USER_ID" \
  -F "language_mode=english" -o "$UPLOAD_JSON" || true
if [ ! -s "$UPLOAD_JSON" ]; then
  echo "Document upload failed; response:" && cat "$UPLOAD_JSON" || true
  exit 1
fi
if command -v cygpath >/dev/null 2>&1; then
  PY_UPLOAD_JSON=$(cygpath -w "$UPLOAD_JSON")
else
  PY_UPLOAD_JSON="$UPLOAD_JSON"
fi
ANALYSIS_ID=$(python -c "import sys,json;print(json.load(open(r'$PY_UPLOAD_JSON'))['analysis_id'])")
echo "Uploaded, analysis_id: $ANALYSIS_ID"

# 5) Poll analysis (single immediate check)
echo "\n==> Get analysis (immediate)"
ANALYSIS_BODY=$(curl -sS "$BASE/documents/analysis/$ANALYSIS_ID" || true)
if [ -z "$ANALYSIS_BODY" ]; then
  echo "(no body)"
else
  printf "%s" "$ANALYSIS_BODY" | pretty_print_json || printf "%s" "$ANALYSIS_BODY"
fi

# 6) WhatsApp webhook onboarding (form POST)
echo "\n==> WhatsApp webhook onboarding"
WH_JSON="$TMPDIR/wh.json"
curl -sS -X POST "$BASE/webhook/whatsapp" \
  -F "From=whatsapp:+2348011223344" \
  -F "Body=Hello" \
  -F "NumMedia=0" -F "SmsMessageSid=SM123" -o "$WH_JSON" || true
if [ -s "$WH_JSON" ]; then
  cat "$WH_JSON"
else
  echo "(no body)"
fi

# 7) Risk card (likely not generated yet) — attempt
echo "\n==> Get risk card (may 404)"
curl -sS -D - "$BASE/risk-card/$ANALYSIS_ID" -o "$TMPDIR/risk_output" || true
if [ -s "$TMPDIR/risk_output" ]; then
  echo "Risk card output saved to $TMPDIR/risk_output"
fi

echo "\nCurl smoke tests complete. Temporary files: $TMPDIR"
