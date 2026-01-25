import { Component, inject, model, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Collection, CollectionGame } from '@project/services/collection/collection';
import { GameMetadata, Games } from '@project/services/games/games';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  private gameService = inject(Games);
  private collectionService = inject(Collection);

  dataGames = model<GameMetadata[]>([]);
  games = model<CollectionGame[]>([]);

  async ngOnInit() {
    const dataGames = await this.gameService.list();
    this.dataGames.update(() => dataGames);
    const games = await this.collectionService.listGames();
    this.games.update(() => games.filter(game => game.enabled));
  }
}
