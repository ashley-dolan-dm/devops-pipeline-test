#!/usr/bin/env bash
# Builds the delta package in ./delta. Called by the delta action.
# Inputs (environment): MODE (merge-base | commit | full), BASE_REF, FROM_SHA, SOURCE_DIR.
set -euo pipefail

rm -rf delta
mkdir -p delta
ZERO="0000000000000000000000000000000000000000"

if [ "$MODE" = "merge-base" ]; then
  git fetch --no-tags origin "$BASE_REF" >/dev/null 2>&1 || true
  FROM=$(git merge-base "origin/$BASE_REF" HEAD)
  LABEL="merge base of origin/$BASE_REF and HEAD"
elif [ "$MODE" = "commit" ]; then
  if [ -z "$FROM_SHA" ] || [ "$FROM_SHA" = "$ZERO" ] || ! git cat-file -e "${FROM_SHA}^{commit}" 2>/dev/null; then
    echo "::warning::No usable previous commit. Using a full package instead."
    MODE="full"
  else
    FROM="$FROM_SHA"
    LABEL="previous commit on this branch"
  fi
fi

if [ "$MODE" = "full" ]; then
  echo "=== Full package from $SOURCE_DIR ==="
  sf project generate manifest --source-dir "$SOURCE_DIR" --output-dir delta/package --name package
  mkdir -p "delta/$(dirname "$SOURCE_DIR")"
  cp -R "$SOURCE_DIR" "delta/$SOURCE_DIR"
  {
    echo "has_changes=true"
    echo "has_destructive=false"
    echo "from_sha=full"
  } >> "$GITHUB_OUTPUT"
  exit 0
fi

echo "=== Delta package ==="
echo "From : $(git rev-parse --short "$FROM") ($LABEL)"
echo "To   : $(git rev-parse --short HEAD) (HEAD)"
echo
echo "Commits in range:"
git log --oneline "$FROM..HEAD" | head -50 || true
echo

IGNORE_ARGS=()
if [ -f .forceignore ]; then
  IGNORE_ARGS=(--ignore-file .forceignore)
fi

sf sgd source delta \
  --from "$FROM" \
  --to HEAD \
  --source-dir "$SOURCE_DIR" \
  --output-dir delta \
  --generate-delta \
  "${IGNORE_ARGS[@]}"

HAS_CHANGES=false
HAS_DESTRUCTIVE=false
if [ -f delta/package/package.xml ] && grep -q "<members>" delta/package/package.xml; then
  HAS_CHANGES=true
fi
# An empty destructiveChanges.xml (no members) is not a destructive change.
if [ -f delta/destructiveChanges/destructiveChanges.xml ] && grep -q "<members>" delta/destructiveChanges/destructiveChanges.xml; then
  HAS_DESTRUCTIVE=true
  HAS_CHANGES=true
fi

{
  echo "has_changes=$HAS_CHANGES"
  echo "has_destructive=$HAS_DESTRUCTIVE"
  echo "from_sha=$FROM"
} >> "$GITHUB_OUTPUT"

python3 .github/scripts/summarise_manifest.py delta/package/package.xml "Components to deploy" >> "$GITHUB_STEP_SUMMARY" || true
if [ "$HAS_DESTRUCTIVE" = "true" ]; then
  python3 .github/scripts/summarise_manifest.py delta/destructiveChanges/destructiveChanges.xml "Components to delete" >> "$GITHUB_STEP_SUMMARY" || true
fi
echo "Changes: $HAS_CHANGES. Destructive changes: $HAS_DESTRUCTIVE."
