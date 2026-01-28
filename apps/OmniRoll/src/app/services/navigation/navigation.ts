import { inject, Injectable, Signal, signal, WritableSignal } from "@angular/core";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, EventType, Router, RouterLink, UrlSegment, UrlSegmentGroup, UrlTree } from "@angular/router";

export interface NavigationContextHolder {
  navigationContext: NavigationContext;
}
export function isNavigationContextHolder(object: unknown): object is NavigationContextHolder {
  return typeof object === "object" && object !== null && 'navigationContext' in object;
}
export interface NavigationContext {
  title: WritableSignal<string>;
}

export interface BreadcrumbSegment {
  label: Signal<string>;
  routerLink?: RouterLink["routerLink"];
}

export class UrlTreeBuilder {
  nodes: {segments: UrlSegment[], key: string}[] = [];

  pushRoute(route: ActivatedRouteSnapshot) {
    this.nodes.push({segments: route.url, key: route.outlet});
  }

  build(): UrlTree {
    const root = new UrlSegmentGroup([], {});
    let currentGroup = root;
    for (const node of this.nodes) {
      const childGroup = new UrlSegmentGroup(node.segments, {});
      currentGroup.children[node.key] = childGroup;
      currentGroup = childGroup;
    }
    return new UrlTree(root);
  }
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private router = inject(Router);
  segments = signal<BreadcrumbSegment[]>([]);

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      switch (event.type) {
        case EventType.NavigationEnd:
        {
          const segments: BreadcrumbSegment[] = [
            {
              label: signal('🏠'),
              routerLink: ['/'],
            }
          ];
          let route: ActivatedRouteSnapshot|null = this.router.routerState.snapshot.root;
          const routePath = new UrlTreeBuilder();
          while (route !== null) {
            routePath.pushRoute(route);
            if (isNavigationContextHolder(route.routeConfig?.data)) {
              segments.push({
                label: route.routeConfig.data.navigationContext.title,
                routerLink: routePath.build(),
              });
            }
            route = route.firstChild;
          }
          if (segments.length === 1) {
            segments.pop();
          }
          this.segments.set(segments);
        }
        break;
      }
    });
  }
}
