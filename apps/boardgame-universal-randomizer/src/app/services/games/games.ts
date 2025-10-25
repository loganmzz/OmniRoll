import { Injectable } from '@angular/core';
import { CompiledGame } from '@project/model/compiled';

@Injectable({
  providedIn: 'root'
})
export class Games {
  private _content: CompiledGame[] = [];

  constructor() {
    let game;
    game = new CompiledGame();
    game.key = "aeons-end";
    game.name = "Aeon's End";
    this._content.push(game);
    game = new CompiledGame();
    game.key = "skytear-horde";
    game.name = "Skytear Horde";
    this._content.push(game);

    for (let i = 0; i < 10; i++) {
      game = new CompiledGame();
      game.key = String.fromCharCode("a".charCodeAt(0) + i);
      game.name = String.fromCharCode("A".charCodeAt(0) + i);
      this._content.push(game);
    }
  }

  list(): CompiledGame[] {
    return this._content;
  }

  get(key: string): CompiledGame|undefined {
    return this._content.find(game => game.key === key);
  }
}
