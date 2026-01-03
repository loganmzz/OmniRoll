import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CompiledGame } from '@project/model/compiled';

@Component({
  selector: 'app-game-home-page',
  imports: [RouterLink],
  templateUrl: './game-home-page.html',
  styleUrl: './game-home-page.css',
})
export class GameHomePage {
  game = input.required<CompiledGame>();
}
