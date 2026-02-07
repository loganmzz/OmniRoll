import { Route } from '@angular/router';
import { CollectionPage } from './pages/collection-page/collection-page';
import { GameCollectionPage } from './pages/game-collection-page/game-collection-page';
import { GameHomePage } from './pages/game-home-page/game-home-page';
import { GamePage } from './pages/game-page/game-page';
import { GameRandomizePage } from './pages/game-randomize-page/game-randomize-page';
import { HomePage } from './pages/home-page/home-page';
import { NavigationContext } from './services/navigation/navigation';

export const appRoutes: Route[] = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'collection',
    component: CollectionPage,
    data: {
      'navigationContext': new NavigationContext(),
    },
  },
  {
    path: 'game/:collection-game',
    component: GamePage,
    data: {
      'navigationContext': new NavigationContext(),
    },
    children: [
      {
        path: '',
        component: GameHomePage,
      },
      {
        path: 'collection',
        component: GameCollectionPage,
        data: {
          'navigationContext': new NavigationContext(),
        },
      },
      {
        path: 'randomizer/:randomizerKey',
        component: GameRandomizePage,
        data: {
          'navigationContext': new NavigationContext(),
        },
      },
    ],
  },
];
