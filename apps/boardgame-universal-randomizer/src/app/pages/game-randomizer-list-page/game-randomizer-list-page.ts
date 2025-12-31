import { Component, inject, model } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CompiledGame } from '@project/model/compiled';
import { Games } from '@project/services/games/games';


type LoadingState = {
  state: 'loading';
};
type GameNotFoundState = {
  state: 'game_not_found';
  gameKey: string;
};
type LoadedState = {
  state: 'loaded';
  game: CompiledGame;
};
type PageState = LoadingState | GameNotFoundState | LoadedState;

@Component({
  selector: 'app-game-randomizer-list-page',
  imports: [RouterLink],
  templateUrl: './game-randomizer-list-page.html',
  styleUrl: './game-randomizer-list-page.css',
})
export class GameRandomizerListPage {
  private activatedRoute = inject(ActivatedRoute);
  private gameService = inject(Games)
  data = model<PageState>({
    state: 'loading',
  });

  constructor() {
    this.activatedRoute.params.subscribe(params => this.loadGame(params['game']));
  }

  private loadGame(key: string) {
    this.data.set({
      state: 'loading',
    });
    const game = this.gameService.get(key);
    if (game === undefined) {
      this.data.set({
        state: 'game_not_found',
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
