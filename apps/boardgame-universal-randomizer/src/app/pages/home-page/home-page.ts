import { Component, inject, model, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CompiledGame } from '@project/model/compiled';
import { Games } from '@project/services/games/games';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  private gameService = inject(Games);

  games = model<CompiledGame[]>([]);

  async ngOnInit() {
    const games = await this.gameService.list();
    this.games.update(() => games);
  }
}
