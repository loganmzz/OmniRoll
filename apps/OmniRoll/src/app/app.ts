import { Component, effect, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Breadcrumb } from './components/breadcrumb/breadcrumb';
import { Menu } from './components/menu/menu';
import { Collection } from './services/collection/collection';
import { MenuSection, NavigationService } from './services/navigation/navigation';

@Component({
  imports: [RouterModule, Breadcrumb, Menu],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'OmniRoll';
  navigation = inject(NavigationService);
  collection = inject(Collection);
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
          entries: games.map(game => signal({
            link: {
              title: game.name,
              routerLink: ['/', 'game', game.key],
            },
          })),
        },
      };
      this.navigation.root.menu.set(menu);
    });
  }

  toggleMenu() {
    this.menuOpen.update(value => !value);
  }
  closeMenu() {
    this.menuOpen.set(false);
  }
}
