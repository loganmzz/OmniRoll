import { Component, inject, model, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Games } from '@project/services/games/games';
import { CompiledGame } from '@project/model/compiled';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  private gameService = inject(Games);

  games = model<CompiledGame[]>([]);

  ngOnInit() {
    this.games.update(() => this.gameService.list());
  }
}
