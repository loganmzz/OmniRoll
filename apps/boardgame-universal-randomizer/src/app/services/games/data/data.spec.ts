import { CompiledGame } from '@project/model/compiled';
import { data } from '.';

describe('games/data', () => {

  for (const [gameKey, gameLoader] of Object.entries(data)) {
    test(gameKey, () => {
      const model = gameLoader();
      const compilResult = CompiledGame.newFromDataModel(model);
      if (compilResult.err !== undefined) {
        throw new Error(compilResult.err.join('\n'));
      }
    });
  }
});
