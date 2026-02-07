import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Collection } from '@project/services/collection/collection';

@Component({
  selector: 'app-game-home-page',
  imports: [RouterLink],
  templateUrl: './game-home-page.html',
  styleUrl: './game-home-page.css',
})
export class GameHomePage {
  collection = inject(Collection);
}
