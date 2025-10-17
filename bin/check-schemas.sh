#!/usr/bin/env bash
set -o pipefail

bindir="$(cd "$(dirname "${BASH_SOURCE}")" >/dev/null; pwd)" &&
source "${bindir}/__init.shrc" &&
true || exit $?

function main.run() {
  files.set_schema_files 'data-model' &&
  schema.validate_schema 'module.json' &&
  true
}

main "$@"
