import { Component, computed, inject, OnChanges, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Collection, CollectionGame } from '@project/services/collection/collection';
import { GameMetadata, Games } from '@project/services/games/games';

class UIGame {
  key: string;
  name: string;
  enabled: boolean;

  constructor(public model: GameMetadata, public collection: CollectionGame|undefined) {
    this.key  = model.key;
    this.name = model.name;
    this.enabled = collection?.enabled ?? false;
  }
}

@Component({
  selector: 'app-collection-page',
  imports: [FormsModule],
  templateUrl: './collection-page.html',
  styleUrl: './collection-page.css',
})
export class CollectionPage implements OnInit, OnChanges {
  collectionService = inject(Collection);
  gamesService = inject(Games);

  metadatas = signal<GameMetadata[]>([]);
  options = computed(() => {
    const metadatas  = this.metadatas();
    const collection = this.collectionService.games();

    const collectionByKey = new Map<string, CollectionGame>();
    for (const game of collection) {
      collectionByKey.set(game.key, game);
    }

    const options: UIGame[] = [];
    for (const metadata of metadatas) {
      options.push(new UIGame(metadata, collectionByKey.get(metadata.key)));
    }

    return options;
  });

  ngOnInit() {
    this.ngOnChanges();
  }
  async ngOnChanges() {
    this.metadatas.set(await this.gamesService.list());
  }

  async reverse(game: UIGame) {
    await this.collectionService.updateGameStatus(game.model, !game.enabled);
    await this.ngOnInit();
  }
}
