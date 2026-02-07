import { Component, computed, inject, input } from '@angular/core';
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
  default = input<string>('');
  segments = computed(() => {
    const segments = this.navigation.segments();
    const defaultLabel = this.default();
    const active = segments.flatMap(segment => {
      const label = segment.label();
      if (label === undefined) {
        return [];
      }
      return [{label, routerLink: segment.routerLink}];
    });
    if (active.length === 1 && defaultLabel) {
      active[0].label = defaultLabel;
    }
    return active;
  });
}
