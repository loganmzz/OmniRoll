import {
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Collection } from '@project/services/collection/collection';
import { Referential } from '@project/services/referential/referential';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';

@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    ButtonModule,
    CardModule,
    DataViewModule,
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {
  collection = inject(Collection);
  referential = inject(Referential);

  async ngOnInit(): Promise<void> {
    await this.referential.init();
  }

  trackByKey(o: {key: string}): string {
    return o.key;
  }
}
