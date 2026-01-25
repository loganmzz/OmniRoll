import { Component, inject, input } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Collection, CollectionGame } from '@project/services/collection/collection';

@Component({
  selector: 'app-game-page',
  imports: [RouterModule],
  templateUrl: './game-page.html',
  styleUrl: './game-page.css',
})
export class GamePage {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  collection = inject(Collection);
  game = input.required<CollectionGame|undefined>();

  async enableGame(gameKey: string) {
    await this.collection.updateGameStatus(gameKey, true);
    await this.router.navigate(['.'], { relativeTo: this.route, onSameUrlNavigation: 'reload' });
  }
}
