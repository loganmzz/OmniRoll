import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavigationService } from '@project/services/navigation/navigation';

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css',
})
export class Breadcrumb {
  navigation = inject(NavigationService);
  default = input<string>();
}
