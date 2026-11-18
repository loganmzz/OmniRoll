#!/usr/bin/env bash
set -o pipefail

bindir="$(cd "$(dirname "${BASH_SOURCE}")" >/dev/null; pwd)" &&
source "${bindir}/__init.shrc" &&
true || exit $?

function main.run() {
  npx nx run-many -t test --tui=false &&
  npx nx run-many -t e2e --tui=false &&
  true
}

main "$@"
