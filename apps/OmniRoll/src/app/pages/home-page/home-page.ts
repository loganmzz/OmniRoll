import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Collection } from '@project/services/collection/collection';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  collection = inject(Collection);
}
