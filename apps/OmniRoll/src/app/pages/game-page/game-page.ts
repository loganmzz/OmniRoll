import { Component, inject, input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Collection, CollectionGame } from '@project/services/collection/collection';
import { NavigationContext } from '@project/services/navigation/navigation';

@Component({
  selector: 'app-game-page',
  imports: [RouterModule],
  templateUrl: './game-page.html',
  styleUrl: './game-page.css',
})
export class GamePage implements OnInit {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  navigationContext = input.required<NavigationContext>();
  collection = inject(Collection);
  game = input.required<CollectionGame|undefined>();

  ngOnInit(): void {
    const game = this.game();
    if (game !== undefined) {
      this.navigationContext().title.set(game.name);
    }
  }

  async enableGame(gameKey: string) {
    await this.collection.updateGameStatus(gameKey, true);
    await this.router.navigate(['.'], { relativeTo: this.route, onSameUrlNavigation: 'reload' });
  }
}
