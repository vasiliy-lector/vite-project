#!/usr/bin/env bash
set -euo pipefail

# Runs Playwright e2e in the same official Playwright image as CI
# (.github/workflows/ci.yml): a single group of Linux screenshot baselines
# serves both local development and CI.
#
# Modes:
#   test    (default) — run the e2e tests
#   update  — regenerate baselines and copy them back into the repo

IMAGE='mcr.microsoft.com/playwright:v1.62.1-noble'
VOLUME='vite-app-e2e-work'
SNAPSHOT_DIR='e2e/counter.spec.ts-snapshots'
MODE="${1:-test}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v docker >/dev/null; then
  echo 'Docker is not installed or not in PATH' >&2
  exit 1
fi

PREAMBLE='
  set -euo pipefail
  tar -C /src \
    --exclude=./node_modules \
    --exclude=./.git \
    --exclude=./.yarn/cache \
    --exclude=./dist \
    --exclude=./coverage \
    --exclude=./test-results \
    --exclude=./playwright-report \
    -cf - . | tar -C /work -xf -
  YARN_REL="$(sed -n "s/^yarnPath: //p" .yarnrc.yml)"
  [ -n "$YARN_REL" ] || { echo "yarnPath not found in .yarnrc.yml" >&2; exit 1; }
  node "$YARN_REL" install --immutable
'

case "$MODE" in
  test)
    docker run --rm -v "$ROOT":/src:ro -v "$VOLUME":/work -w /work "$IMAGE" bash -c "$PREAMBLE
node \"\$YARN_REL\" test:e2e:ci"
    ;;
  update)
    docker run --rm -v "$ROOT":/src:ro -v "$VOLUME":/work -v "$ROOT/$SNAPSHOT_DIR":/out -w /work "$IMAGE" bash -c "$PREAMBLE
node \"\$YARN_REL\" exec playwright test --update-snapshots
cp -a $SNAPSHOT_DIR/. /out/"
    ;;
  *)
    echo "Unknown mode: $MODE (use test or update)" >&2
    exit 1
    ;;
esac
