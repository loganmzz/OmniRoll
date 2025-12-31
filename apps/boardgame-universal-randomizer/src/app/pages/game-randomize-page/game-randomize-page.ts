import { Component, inject, model } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompiledGame, CompiledRandomizer } from '@project/model/compiled';
import { Games } from '@project/services/games/games';
import { Randomizer } from '@project/services/randomizer/randomizer';

type LoadingState = {
  state: 'loading';
};
type GameNotFoundState = {
  state: 'game_not_found';
  gameKey: string;
};
type RandomizerNotFoundState = {
  state: 'randomizer_not_found';
  game: CompiledGame;
  randomizerKey: string;
};
type LoadedState = {
  state: 'loaded';
  game: CompiledGame;
  randomizer: CompiledRandomizer;
  slots: {
    key: string;
    title: string;
    text: string;
  }[];
};
type PageState = LoadingState | GameNotFoundState | RandomizerNotFoundState | LoadedState;

@Component({
  selector: 'app-game-randomize-page',
  imports: [],
  templateUrl: './game-randomize-page.html',
  styleUrl: './game-randomize-page.css',
})
export class GameRandomizePage {
  private activatedRoute = inject(ActivatedRoute);
  private gameService = inject(Games);
  private randomizer = inject(Randomizer);
  data = model<PageState>({
    state: 'loading',
  });

  constructor() {
    this.activatedRoute.params.subscribe(params => this.loadGame({
      gameKey: params['game'],
      randomizerKey: params['randomizer']
    }));
  }

  private loadGame({gameKey, randomizerKey}: {gameKey: string, randomizerKey: string}) {
    this.data.set({
      state: 'loading',
    });
    const game = this.gameService.get(gameKey);
    if (game === undefined) {
      this.data.set({
        state: 'game_not_found',
        gameKey,
      });
    } else {
      const randomizer = game.randomizers.find(r => r.key === randomizerKey);
      if (randomizer === undefined) {
        this.data.set({
          state: 'randomizer_not_found',
          game,
          randomizerKey,
        });
      } else {
        this.data.set({
          state: 'loaded',
          game,
          randomizer,
          slots: randomizer.slots.map(slot => ({
            key: slot.key,
            title: slot.key,
            text: '',
          })),
        });
      }
    }
  }

  roll(state: LoadedState) {
    const roll = this.randomizer.randomize(
      state.game.components,
      state.randomizer,
    );
    for (const slot of state.slots) {
      slot.text = roll[slot.key].name ?? '';
    }
  }
}
