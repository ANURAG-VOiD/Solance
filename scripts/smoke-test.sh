#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Solance E2E smoke test — validates the critical happy-path endpoints against
# a running local or staging stack. Uses only curl + bash (no extra deps).
#
# Usage:
#   ./scripts/smoke-test.sh                        # default: localhost:8080
#   BASE_URL=https://api.staging.example.com ./scripts/smoke-test.sh
#
# Exit code: 0 if all checks pass, 1 if any check fails.
# ---------------------------------------------------------------------------

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"

PASS=0
FAIL=0
RESULTS=()

# ── Helpers ────────────────────────────────────────────────────────────────

check() {
  local name="$1"
  local method="$2"
  local path="$3"
  local expected_status="$4"
  local body_assertion="${5:-}"   # optional: substring that must appear in body
  local extra_args="${6:-}"       # optional: extra curl args (e.g. -d '...')

  local url="${BASE_URL}${path}"
  local tmpfile
  tmpfile=$(mktemp)

  # Build curl command
  local -a curl_cmd=(curl -s -o "$tmpfile" -w "%{http_code}" -X "$method")
  if [[ -n "$extra_args" ]]; then
    curl_cmd+=($extra_args)
  fi
  curl_cmd+=("$url")

  local status
  status=$("${curl_cmd[@]}" 2>/dev/null) || status="000"

  local body
  body=$(cat "$tmpfile" 2>/dev/null || echo "")
  rm -f "$tmpfile"

  local ok=true
  local reason=""

  if [[ "$status" != "$expected_status" ]]; then
    ok=false
    reason="expected HTTP $expected_status, got $status"
  fi

  if [[ -n "$body_assertion" ]] && ! echo "$body" | grep -q "$body_assertion"; then
    ok=false
    reason="${reason:+$reason; }response body missing '$body_assertion'"
  fi

  if $ok; then
    PASS=$((PASS + 1))
    RESULTS+=("  ✅ PASS  $name")
  else
    FAIL=$((FAIL + 1))
    RESULTS+=("  ❌ FAIL  $name — $reason")
  fi
}

# ── Checks ─────────────────────────────────────────────────────────────────

echo ""
echo "🔍 Solance smoke test — ${BASE_URL}"
echo "─────────────────────────────────────────"

# 1. Health endpoint
check "GET /api/health/"                  GET  "/api/health/"              200

# 2. Request nonce (dummy wallet)
check "POST /api/auth/request-nonce"      POST "/api/auth/request-nonce"   200 "nonce" \
  "-H 'Content-Type: application/json' -d '{\"wallet_address\":\"SmokeTst1111111111111111111111111111111111111\"}'"

# 3. Open tasks list
check "GET /api/tasks/"                   GET  "/api/tasks/"               200 "["

# 4. Featured talent
check "GET /api/users/talent"             GET  "/api/users/talent"         200

# 5. Notifications without auth → 401
check "GET /api/notifications/ (no auth)" GET  "/api/notifications/"       401

# ── Summary ────────────────────────────────────────────────────────────────

echo ""
for line in "${RESULTS[@]}"; do
  echo "$line"
done

echo ""
echo "─────────────────────────────────────────"
echo "  Total: $((PASS + FAIL))  |  ✅ $PASS passed  |  ❌ $FAIL failed"
echo "─────────────────────────────────────────"
echo ""

if [[ "$FAIL" -gt 0 ]]; then
  exit 1
fi

exit 0
