import { Component, inject, model, OnChanges, OnInit } from '@angular/core';
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
  collection = inject(Collection);
  games = inject(Games);

  options = model<UIGame[]>([]);

  ngOnInit() {
    this.ngOnChanges();
  }
  async ngOnChanges() {
    const games = await this.games.list();
    const collection = await this.collection.listGames();
    const collectionByKey = new Map<string, CollectionGame>();
    for (const game of collection) {
      collectionByKey.set(game.key, game);
    }

    const options: UIGame[] = [];
    for (const game of games) {
      options.push(new UIGame(game, collectionByKey.get(game.key)));
    }
    this.options.update(() => options);
  }

  async reverse(game: UIGame) {
    await this.collection.updateGameStatus(game.model, !game.enabled);
    await this.ngOnInit();
  }
}
