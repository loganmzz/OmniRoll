import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Breadcrumb } from './components/breadcrumb/breadcrumb';
import { Menu } from './components/menu/menu';
import { Collection } from './services/collection/collection';
import { MenuEntry, MenuSection, NavigationService } from './services/navigation/navigation';

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
  menuOpen = signal(false);

  async ngOnInit() {
    const menu = signal<MenuEntry>({
      section: {
        title: {
          text: '',
          routerLink: ['/'],
        },
        entries: [],
      },
    });
    this.navigation.root.set({
      menu,
    });
    const games = await this.collection.listGames();
    const section: MenuSection['section'] = {
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
    };
    menu.set({section});
  }

  toggleMenu() {
    this.menuOpen.update(value => !value);
  }
  closeMenu() {
    this.menuOpen.set(false);
  }
}
