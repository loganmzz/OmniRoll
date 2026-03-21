import { pathToFileURL } from 'node:url';
import {
  FileDataFetcher,
  GAME_DATA_DIR,
} from '@project/../test-utils';
import { CompiledGame } from '@project/model/compiled';
import { fetchModule } from '@project/services/referential/referential';

describe('referential/OmniRoll', () => {
  test('Load OmniRoll referential', async () => {
    const omnirollModuleUrl = pathToFileURL(`${GAME_DATA_DIR}/index.yaml`);
    console.log(omnirollModuleUrl.toString());
    const referential = await fetchModule('Source "OmniRoll"', new FileDataFetcher(omnirollModuleUrl));

    for (const content of referential.games) {
      console.log(`Try to compile game ${JSON.stringify(content.name)} (${content.key})`);
      CompiledGame.newFromDataModel(content).expect();
    }
  });
});
