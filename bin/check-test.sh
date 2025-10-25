#!/usr/bin/env bash
set -o pipefail

bindir="$(cd "$(dirname "${BASH_SOURCE}")" >/dev/null; pwd)" &&
source "${bindir}/__init.shrc" &&
true || exit $?

function main.run() {
  npx nx run-many --all --target=test &&
  npx nx run-many --all --target=e2e &&
  true
}

main "$@"
