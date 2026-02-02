import { Component, inject, input, OnChanges, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CompiledRandomizer } from '@project/model/compiled';
import { Collection, CollectionGame } from '@project/services/collection/collection';
import { NavigationContext } from '@project/services/navigation/navigation';

@Component({
  selector: 'app-game-page',
  imports: [RouterModule],
  templateUrl: './game-page.html',
  styleUrl: './game-page.css',
})
export class GamePage implements OnInit, OnChanges {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  navigationContext = input.required<NavigationContext>();
  collection = inject(Collection);
  game = input.required<CollectionGame|undefined>();

  ngOnInit() {
    this.ngOnChanges();
  }
  async ngOnChanges() {
    const game = this.game();
    const name = game?.name ?? '';
    this.navigationContext().title?.set(name);
    let randomizers: CompiledRandomizer[] = [];
    if (game !== undefined) {
      const content = await this.collection.getContent(game);
      randomizers = content?.randomizers ?? [];
    }
    this.navigationContext().menu?.set({
      section: {
        title: {
          text: name,
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
  }

  async enableGame(gameKey: string) {
    await this.collection.updateGameStatus(gameKey, true);
    await this.router.navigate(['.'], { relativeTo: this.route, onSameUrlNavigation: 'reload' });
  }
}
