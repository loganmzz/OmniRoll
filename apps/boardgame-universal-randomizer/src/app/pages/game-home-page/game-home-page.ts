import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CompiledGame } from '@project/model/compiled';
import { Collection, CollectionGame } from '@project/services/collection/collection';

@Component({
  selector: 'app-game-home-page',
  imports: [RouterLink],
  templateUrl: './game-home-page.html',
  styleUrl: './game-home-page.css',
})
export class GameHomePage implements OnInit {
  collection = inject(Collection);
  game = input.required<CollectionGame>();
  content = signal<CompiledGame|undefined>(undefined);

  async ngOnInit() {
    this.content.set(await this.collection.getContent(this.game()));
  }
}
