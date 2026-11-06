#!/usr/bin/env bash
# Starts a Salesforce deployment without blocking, then checks progress every 15 seconds
# so the log shows what is happening. Prints a summary and itemised failures at the end.
#
# Environment:
#   MODE          validate (check-only), deploy, or quick (quick deploy of a validated job)
#   TARGET_ORG    org alias from the login step
#   TEST_LEVEL    NoTestRun, RunLocalTests or RunAllTestsInOrg (not used for quick)
#   JOB_ID        validated job ID (quick mode only)
#   WAIT_MINUTES  how long to wait before giving up (default 90)
#   POLL_SECONDS  how often to check progress (default 15)
# Writes job_id to GITHUB_OUTPUT.
set -uo pipefail

MANIFEST="delta/package/package.xml"
DESTRUCTIVE="delta/destructiveChanges/destructiveChanges.xml"
WAIT_MINUTES="${WAIT_MINUTES:-90}"
INTERVAL="${POLL_SECONDS:-15}"

case "$MODE" in
  validate|deploy)
    ARGS=(project deploy start --manifest "$MANIFEST" --target-org "$TARGET_ORG"
          --test-level "$TEST_LEVEL" --ignore-conflicts --async --json)
    if [ -f "$DESTRUCTIVE" ] && grep -q "<members>" "$DESTRUCTIVE"; then
      ARGS+=(--post-destructive-changes "$DESTRUCTIVE")
    fi
    if [ "$MODE" = "validate" ]; then
      ARGS+=(--dry-run)
    fi
    ;;
  quick)
    ARGS=(project deploy quick --job-id "$JOB_ID" --target-org "$TARGET_ORG" --async --json)
    ;;
  *)
    echo "::error::Unknown MODE '$MODE'."
    exit 1
    ;;
esac

echo "Running: sf ${ARGS[*]}"
START_JSON=$(sf "${ARGS[@]}" 2>/dev/null)
ID=$(echo "$START_JSON" | jq -r '.result.id // empty')
if [ -z "$ID" ]; then
  echo "::error::The deployment did not start."
  echo "$START_JSON" | jq -r '.message // .' || echo "$START_JSON"
  exit 1
fi
echo "job_id=$ID" >> "$GITHUB_OUTPUT"
echo "Job ID: $ID"

MAX_CHECKS=$(( WAIT_MINUTES * 60 / INTERVAL ))
CHECK=0
STATUS=""
REPORT=""
while [ "$CHECK" -lt "$MAX_CHECKS" ]; do
  sleep "$INTERVAL"
  CHECK=$(( CHECK + 1 ))
  REPORT=$(sf project deploy report --job-id "$ID" --target-org "$TARGET_ORG" --json 2>/dev/null || true)
  STATUS=$(echo "$REPORT" | jq -r '.result.status // "Unknown"')
  printf '[%3d min] %-16s components %s/%s  tests %s/%s\n' \
    $(( CHECK * INTERVAL / 60 )) "$STATUS" \
    "$(echo "$REPORT" | jq -r '.result.numberComponentsDeployed // 0')" \
    "$(echo "$REPORT" | jq -r '.result.numberComponentsTotal // 0')" \
    "$(echo "$REPORT" | jq -r '.result.numberTestsCompleted // 0')" \
    "$(echo "$REPORT" | jq -r '.result.numberTestsTotal // 0')"
  case "$STATUS" in
    Succeeded|SucceededPartial|Failed|Canceled) break ;;
  esac
done

case "$STATUS" in
  Succeeded|SucceededPartial|Failed|Canceled) ;;
  *)
    echo "::error::Gave up waiting after $WAIT_MINUTES minutes. Job $ID may still be running in the org (Setup, Deployment Status)."
    exit 1
    ;;
esac

{
  echo "### Deployment: $MODE to $TARGET_ORG"
  echo
  echo "| Status | Components | Component errors | Tests | Test failures | Job ID |"
  echo "|---|---|---|---|---|---|"
  echo "$REPORT" | jq -r '"| \(.result.status) | \(.result.numberComponentsDeployed // 0)/\(.result.numberComponentsTotal // 0) | \(.result.numberComponentErrors // 0) | \(.result.numberTestsCompleted // 0)/\(.result.numberTestsTotal // 0) | \(.result.numberTestErrors // 0) | \(.result.id) |"'
  echo
} >> "$GITHUB_STEP_SUMMARY"

if [ "$STATUS" = "Succeeded" ]; then
  echo "Finished: $STATUS."
  exit 0
fi

echo "::group::Component failures"
echo "$REPORT" | jq -r '[.result.details.componentFailures // []] | flatten | .[] | "- \(.componentType // "") \(.fullName // ""): \(.problem // "") (\(.fileName // ""), line \(.lineNumber // "-"))"'
echo "::endgroup::"
echo "::group::Apex test failures"
echo "$REPORT" | jq -r '[.result.details.runTestResult.failures // []] | flatten | .[] | "- \(.name // "").\(.methodName // ""): \(.message // "")\n  \(.stackTrace // "")"'
echo "::endgroup::"
{
  echo "#### Failures"
  echo
  echo "$REPORT" | jq -r '[.result.details.componentFailures // []] | flatten | .[] | "- Component `\(.fullName // "")` (\(.componentType // "")): \(.problem // "")"'
  echo "$REPORT" | jq -r '[.result.details.runTestResult.failures // []] | flatten | .[] | "- Test `\(.name // "").\(.methodName // "")`: \(.message // "")"'
  echo
} >> "$GITHUB_STEP_SUMMARY"
echo "::error::Deployment finished with status $STATUS. See the failures above and the run summary."
exit 1
