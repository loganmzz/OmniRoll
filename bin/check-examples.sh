#!/usr/bin/env bash
set -o pipefail

bindir="$(cd "$(dirname "${BASH_SOURCE}")" >/dev/null; pwd)" &&
source "${bindir}/__init.shrc" &&
true || exit $?

function main.run() {
  files.set_schema_files 'data-model' || return $?

  example_root="${basedir}/examples/data-model"

  schema_keys=()
  local schema_key=''
  for schema_key in $(ls -1 "${example_root}" | sort); do
    [[ -d "${example_root}/${schema_key}" ]] || continue
    schema_keys+=("${schema_key}")
  done

  for schema_key in "${schema_keys[@]}"; do
    echo "Checking examples for schema '${schema_key}'..."

    for example_file in $(ls -1 "${example_root}/${schema_key}" | sort); do
      example_path="${example_root}/${schema_key}/${example_file}"
      [[ -f "${example_path}" ]] || continue
      echo "  - ${schema_key}  /  ${example_file}"
      schema.validate_json "${schema_key}.json" "${example_path}" || return $?
    done

  done

  return 0
}

main "$@"
