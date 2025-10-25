import { Route } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { GamePage } from './pages/game-page/game-page';

export const appRoutes: Route[] = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'game/:key',
    component: GamePage,
  },
];
