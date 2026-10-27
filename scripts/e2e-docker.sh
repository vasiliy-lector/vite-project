#!/usr/bin/env bash
set -euo pipefail

# Runs Playwright e2e in the same official Playwright image as CI
# (.github/workflows/ci.yml): a single group of Linux screenshot baselines
# serves both local development and CI.
#
# Modes:
#   test    (default) — run the e2e tests
#   update  — regenerate baselines and copy them back into the repo

IMAGE='mcr.microsoft.com/playwright:v1.64.1-noble'
VOLUME='vite-app-e2e-work'
MODE="${1:-test}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if ! command -v docker >/dev/null; then
  echo 'Docker is not installed or not in PATH' >&2
  exit 1
fi

# Re-sync the repo into the work volume on every run (rsync --delete keeps
# the installed node_modules but removes stale files from other branches,
# which used to break the in-container build). pnpm is provided via corepack
# from the pinned packageManager in package.json.
# If your proxy is only reachable from the host, run with
#   docker run --network=host ...   or adjust the proxy URLs below.
PREAMBLE='
  set -euo pipefail
  mkdir -p /work
  rsync -a --delete --exclude=node_modules --exclude=.git --exclude=dist --exclude=coverage --exclude=test-results --exclude=playwright-report /src/ /work/
  PM=$(node -e "process.stdout.write(require('"'"'./package.json'"'"').packageManager)")
  corepack enable
  corepack prepare "$PM" --activate
  pnpm install --frozen-lockfile
'

# Baseline directories to copy back: one mount per e2e/<spec>-snapshots dir
EXTRA_MOUNTS=()
if [ "$MODE" = "update" ]; then
  for spec in "$ROOT"/e2e/*.spec.ts; do
    mkdir -p "${spec%.spec.ts}.spec.ts-snapshots"
  done
  while IFS= read -r snap_dir; do
    EXTRA_MOUNTS+=(-v "$snap_dir":"/out/${snap_dir#"$ROOT"/}")
  done < <(find "$ROOT/e2e" -maxdepth 1 -type d -name '*-snapshots')
fi

case "$MODE" in
  test)
    docker run --rm -v "$ROOT":/src:ro -v "$VOLUME":/work -w /work "$IMAGE" bash -c "$PREAMBLE
pnpm test:e2e:ci"
    ;;
  update)
    docker run --rm -v "$ROOT":/src:ro -v "$VOLUME":/work "${EXTRA_MOUNTS[@]}" -w /work "$IMAGE" bash -c "$PREAMBLE
pnpm exec playwright test --update-snapshots
for d in \$(find /work/e2e -maxdepth 1 -type d -name '*-snapshots'); do
  rel=\${d#/work/}
  mkdir -p \"/out/\$rel\" && cp -a \"\$d/.\" \"/out/\$rel/\"
done"
    ;;
  *)
    echo "Unknown mode: $MODE (use test or update)" >&2
    exit 1
    ;;
esac
