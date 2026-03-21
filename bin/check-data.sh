#!/usr/bin/env bash
set -o pipefail

bindir="$(cd "$(dirname "${BASH_SOURCE}")" >/dev/null; pwd)" &&
source "${bindir}/__init.shrc" &&
true || exit $?

function main.run() {
  files.set_schema_files 'referential' || return $?

  local app_data="${basedir}/apps/OmniRoll/public/data/games"

  echo
  echo '- Checking OmniRoll module'
  schema.validate_json 'module.json' "${app_data}/index.yaml" || return $?

  for game_file in "${app_data}"/*.yaml; do
    local game_key="$(basename "${game_file}" '.yaml')"
    [[ "${game_key}" == 'index' ]] && continue
    echo
    echo "- Checking OmniRoll game '${game_key}'"
    schema.validate_json 'game.json' "${app_data}/${game_key}.yaml" || return $?
  done

  for set_file in $(cd "${app_data}" && find -mindepth 2 -type f | sort); do
    echo
    echo "- Checking OmniRoll set file '${set_file#*/}'"
    schema.validate_json 'set.json' "${app_data}/${set_file}" || return $?
  done

  return 0
}

main "$@"
