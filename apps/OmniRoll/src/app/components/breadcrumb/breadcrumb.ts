import {
  Component,
  computed,
  inject,
} from '@angular/core';
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
  segments = computed(() => {
    const segments = this.navigation.segments();
    const active = segments.flatMap(segment => {
      const label = segment.label();
      if (label === undefined) {
        return [];
      }
      return [{
        logo: segment.logo(),
        label,
        routerLink: segment.routerLink,
      }];
    });
    return active;
  });
}
