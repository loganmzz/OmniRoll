import { Component, inject, model } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Games } from '@project/services/games/games';
import { CompiledGame } from '@project/model/compiled';

type LoadingState = {
  state: 'loading';
};
type NotFoundState = {
  state: 'not_found';
  gameKey: string;
};
type LoadedState = {
  state: 'loaded';
  game: CompiledGame;
};
type PageState = LoadingState | NotFoundState | LoadedState;

@Component({
  selector: 'app-game-page',
  imports: [],
  templateUrl: './game-page.html',
  styleUrl: './game-page.css',
})
export class GamePage {
  private activatedRoute = inject(ActivatedRoute);

  private gameService = inject(Games)
  data = model<PageState>({
    state: 'loading',
  });

  constructor() {
    this.activatedRoute.params.subscribe(params => this.loadGame(params['key']));
  }

  private loadGame(key: string) {
    this.data.set({
      state: 'loading',
    });
    const game = this.gameService.get(key);
    if (game === undefined) {
      this.data.set({
        state: 'not_found',
        gameKey: key,
      });
    } else {
      this.data.set({
        state: 'loaded',
        game,
      });
    }
  }
}
