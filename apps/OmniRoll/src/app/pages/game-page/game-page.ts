import { Component, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Collection } from '@project/services/collection/collection';
import { NavigationContext } from '@project/services/navigation/navigation';

@Component({
  selector: 'app-game-page',
  imports: [RouterModule],
  templateUrl: './game-page.html',
  styleUrl: './game-page.css',
})
export class GamePage {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  navigationContext = input.required<NavigationContext>();
  collection = inject(Collection);

  constructor() {
    effect(() => {
      const game = this.collection.game();
      const content = this.collection.content();

      this.navigationContext().title.set(game?.name ?? '');

      const randomizers = (content?.components.length ?? 0 > 0 ? content : undefined)?.randomizers ?? [];
      this.navigationContext().menu.set({
        section: {
          title: {
            text: game?.name ?? '',
            routerLink: ['/', 'game', game?.key ?? ''],
          },
          entries: randomizers.map(r => signal({
            link: {
              title: r.name,
              routerLink: ['/', 'game', game?.key ?? '', 'randomizer', r.key],
            }
          })),
        }
      });
    });
  }

  async enableGame(gameKey: string) {
    await this.collection.updateGameStatus(gameKey, true);
    await this.router.navigate(['.'], { relativeTo: this.route, onSameUrlNavigation: 'reload' });
  }
}
