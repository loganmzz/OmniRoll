import { Route } from '@angular/router';
import { GamePage } from './pages/game-page/game-page';
import { GameRandomizePage } from './pages/game-randomize-page/game-randomize-page';
import { GameRandomizerListPage } from './pages/game-randomizer-list-page/game-randomizer-list-page';
import { HomePage } from './pages/home-page/home-page';

export const appRoutes: Route[] = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'game/:game',
    component: GamePage,
  },
  {
    path: 'game/:game/randomizer',
    component: GameRandomizerListPage,
  },
  {
    path: 'game/:game/randomizer/:randomizer',
    component: GameRandomizePage,
  },
];
