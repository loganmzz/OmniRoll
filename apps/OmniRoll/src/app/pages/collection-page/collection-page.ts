import {
  Component,
  OnChanges,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Collection,
  CollectionGame,
} from '@project/services/collection/collection';

@Component({
  selector: 'app-collection-page',
  imports: [FormsModule],
  templateUrl: './collection-page.html',
  styleUrl: './collection-page.css',
})
export class CollectionPage implements OnInit, OnChanges {
  collectionService = inject(Collection);

  games = signal<CollectionGame[]>([]);

  ngOnInit() {
    this.ngOnChanges();
  }
  async ngOnChanges() {
    const games = await this.collectionService.getAvailableGames();
    this.games.set(games);
  }

  async reverse(game: CollectionGame): Promise<void> {
    await this.collectionService.updateGameStatus(game.key, !game.enabled);
    await this.ngOnInit();
  }
}
