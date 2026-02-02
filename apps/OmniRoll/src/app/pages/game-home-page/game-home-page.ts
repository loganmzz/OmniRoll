import { Component, inject, input, OnChanges, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CompiledGame } from '@project/model/compiled';
import { Collection, CollectionGame } from '@project/services/collection/collection';

@Component({
  selector: 'app-game-home-page',
  imports: [RouterLink],
  templateUrl: './game-home-page.html',
  styleUrl: './game-home-page.css',
})
export class GameHomePage implements OnInit, OnChanges {
  collection = inject(Collection);
  game = input.required<CollectionGame>();
  content = signal<CompiledGame|undefined>(undefined);

  ngOnInit() {
    return this.ngOnChanges();
  }
  async ngOnChanges() {
    this.content.set(await this.collection.getContent(this.game()));
  }
}
