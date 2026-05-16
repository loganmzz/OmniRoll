import {
  Component,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Collection } from '@project/services/collection/collection';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';

@Component({
  selector: 'app-game-home-page',
  imports: [
    RouterLink,
    ButtonModule,
    CardModule,
    DataViewModule,
  ],
  templateUrl: './game-home-page.html',
  styleUrl: './game-home-page.css',
})
export class GameHomePage {
  collection = inject(Collection);

  trackByKey(o: {key: string}): string {
    return o.key;
  }
}
