import {
  Component,
  OnInit,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { Breadcrumb } from './components/breadcrumb/breadcrumb';
import { Menu } from './components/menu/menu';
import { Collection } from './services/collection/collection';
import {
  MenuSection,
  NavigationContext,
  NavigationService,
} from './services/navigation/navigation';

interface MainMenuEntry {
  path: string[];
  context: NavigationContext;
}

@Component({
  imports: [RouterModule, Breadcrumb, Menu],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'OmniRoll';
  navigation = inject(NavigationService);
  collection = inject(Collection);
  mainMenu = signal<MainMenuEntry[]>([]);
  menuOpen = signal(false);

  constructor() {
    effect(() => {
      const games = this.collection.games();
      const menu: MenuSection = {
        section: {
          title: {
            text: this.title,
            routerLink: ['/'],
          },
          entries: [
            ...this.mainMenu().map(entry => signal({
              link: {
                title: entry.context.title(),
                routerLink: entry.path,
              },
            })),
            signal({
              separator: {},
            }),
            ...games.map(game => signal({
              link: {
                title: game.name,
                routerLink: ['/', 'game', game.key],
              },
            })),
            signal({
              separator: {},
            }),
          ]
        },
      };
      this.navigation.root.menu.set(menu);
    });
  }

  ngOnInit() {
    const mainMenu: MainMenuEntry[] = [];
    this.navigation.browseRoutes((route, path) => {
      if (route.data?.['mainMenu'] && route.data?.['navigationContext']) {
        mainMenu.push({
          path: path.map(node => node.path ?? ''),
          context: route.data['navigationContext']
        });
      }
    });
    this.mainMenu.set(mainMenu);
  }

  toggleMenu() {
    this.menuOpen.update(value => !value);
  }
  closeMenu() {
    this.menuOpen.set(false);
  }
}
