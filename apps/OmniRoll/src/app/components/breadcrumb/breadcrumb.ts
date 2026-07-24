import {
  Component,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Help } from '@project/components/help/help';
import { NavigationService } from '@project/services/navigation/navigation';


@Component({
  selector: 'app-breadcrumb',
  imports: [
    RouterLink,
    Help,
  ],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css',
})
export class Breadcrumb {
  navigation = inject(NavigationService);
  context$ = computed(() => {
    const segments = this.navigation.segments();
    const active = segments.flatMap(segment => {
      const label = segment.label();
      if (label === undefined) {
        return [];
      }
      const help = segment.help();
      return [{
        logo: segment.logo(),
        label,
        help,
        routerLink: segment.routerLink,
      }];
    });
    return {
      segments: active,
      help: active.length > 0 ? active[active.length - 1].help : undefined,
    };
  });
}
