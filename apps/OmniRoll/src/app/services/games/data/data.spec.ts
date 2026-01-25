import { CompiledGame } from '@project/model/compiled';
import { data } from '.';

describe('games/data', () => {

  for (const [gameKey, gameLoader] of Object.entries(data)) {
    test(gameKey, async () => {
      const model = await gameLoader.load();
      const compilResult = CompiledGame.newFromDataModel(model);
      if (compilResult.err !== undefined) {
        throw new Error(compilResult.err.join('\n'));
      }
    });
  }
});
