import { inject, signal } from '@angular/core';
import { ActivatedRouteSnapshot, RedirectCommand, Route, Router } from '@angular/router';
import { CollectionPage } from './pages/collection-page/collection-page';
import { GameCollectionPage } from './pages/game-collection-page/game-collection-page';
import { GameHomePage } from './pages/game-home-page/game-home-page';
import { GamePage } from './pages/game-page/game-page';
import { GameRandomizePage } from './pages/game-randomize-page/game-randomize-page';
import { HomePage } from './pages/home-page/home-page';
import { Collection, CollectionGame } from './services/collection/collection';
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
      'navigationContext': {
        title: signal('Collection'),
      } as NavigationContext,
    },
  },
  {
    path: 'game/:game',
    component: GamePage,
    data: {
      'navigationContext': {
        title: signal(''),
        menu: signal({
          section: {
            title: {
              text: '',
            },
            entries: [],
          },
        }),
      } as NavigationContext,
    },
    resolve: {
      game: async (route: ActivatedRouteSnapshot) => {
        const service = inject(Collection);
        const router = inject(Router);
        const gameKey = route.paramMap.get('game') ?? '<unknown>';
        const game = await service.getGame(gameKey);
        if (game !== undefined) {
          return game;
        }
        return new RedirectCommand(router.parseUrl(`/`));
      },
    },
    runGuardsAndResolvers: 'always',
    children: [
      {
        path: '',
        component: GameHomePage,
      },
      {
        path: 'collection',
        component: GameCollectionPage,
        data: {
          'navigationContext': {
            title: signal('Collection ✏️'),
          } as NavigationContext,
        },
      },
      {
        path: 'randomizer/:randomizer',
        component: GameRandomizePage,
        data: {
          'navigationContext': {
            title: signal(''),
          } as NavigationContext,
        },
        resolve: {
          randomizer: async (route: ActivatedRouteSnapshot) => {
            const collection = inject(Collection);
            const router = inject(Router);
            const meta = route.parent?.data['game'] as CollectionGame;
            const content = await collection.getContent(meta);
            if (content !== undefined) {
              const randomizerKey = route.paramMap.get('randomizer');
              const randomizer = content.randomizers.find(r => r.key === randomizerKey);
              if (randomizer !== undefined) {
                return {content,randomizer};
              }
            }
            return new RedirectCommand(
              router.parseUrl(`/game/${meta.key}`),
            );
          },
        }
      },
    ],
  },
];
