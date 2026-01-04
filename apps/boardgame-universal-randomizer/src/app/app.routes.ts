import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Route } from '@angular/router';
import { CompiledGame } from './model/compiled';
import { GameHomePage } from './pages/game-home-page/game-home-page';
import { GamePage } from './pages/game-page/game-page';
import { GameRandomizePage } from './pages/game-randomize-page/game-randomize-page';
import { HomePage } from './pages/home-page/home-page';
import { Games } from './services/games/games';

export const appRoutes: Route[] = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'game/:game',
    component: GamePage,
    resolve: {
      game: async (route: ActivatedRouteSnapshot) => {
        const gameService = inject(Games);
        const gameKey = route.paramMap.get('game') ?? '<unknown>';
        const game = await gameService.get(gameKey);
        return game;
      },
    },
    children: [
      {
        path: '',
        component: GameHomePage,
      },
      {
        path: 'randomizer/:randomizer',
        component: GameRandomizePage,
        resolve: {
          randomizer: (route: ActivatedRouteSnapshot) => {
            const randomizerKey = route.paramMap.get('randomizer');
            const game = route.parent?.data['game'] as CompiledGame;
            const randomizer = game.randomizers.find(r => r.key === randomizerKey);
            return randomizer;
          }
        }
      },
    ],
  },
];
