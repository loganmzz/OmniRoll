import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, EventType, Router, RouterLink, UrlSegment, UrlSegmentGroup, UrlTree } from '@angular/router';

export interface NavigationContextHolder {
  navigationContext: NavigationContext;
}
export function isNavigationContextHolder(object: unknown): object is NavigationContextHolder {
  return typeof object === 'object' && object !== null && 'navigationContext' in object;
}
export interface NavigationContext {
  title?: WritableSignal<string>;
  menu?: WritableSignal<MenuEntry>;
}

export interface BreadcrumbSegment {
  label: Signal<string>;
  routerLink?: RouterLink['routerLink'];
}

export type MenuEntry = MenuSection | MenuLink;
export interface MenuSection {
  section: {
    title: {
      text: string;
      routerLink?: RouterLink['routerLink'];
    };
    entries: WritableSignal<MenuEntry>[];
  };
}
export interface MenuLink {
  link: {
    title: string;
    routerLink: RouterLink['routerLink'];
  };
}
export function isMenuSection(entry: unknown): entry is MenuSection {
  return typeof entry === 'object' && entry !== null && 'section' in entry;
}
export function isMenuLink(entry: unknown): entry is MenuLink {
  return typeof entry === 'object' && entry !== null && 'link' in entry;
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
  root = signal<NavigationContext|null>(null);
  segments = signal<BreadcrumbSegment[]>([]);
  menu = signal<MenuEntry>({
    section: {
      title: {
        text: '',
      },
      entries: [],
    },
  });

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      switch (event.type) {
        case EventType.NavigationEnd:
          this.refreshBreadcrumbs();
          this.refreshMenu();
          break;
      }
    });
  }

  private browseNavigationContext(process: (context: NavigationContext, path: UrlTreeBuilder) => void) {
    let route: ActivatedRouteSnapshot|null = this.router.routerState.snapshot.root;
    const routePath = new UrlTreeBuilder();

    const root = this.root();
    if (root !== null) {
      process(root, routePath);
    }

    while (route !== null) {
      routePath.pushRoute(route);
      const data = route.routeConfig?.data;
      if (isNavigationContextHolder(data)) {
        process(data.navigationContext, routePath);
      }
      route = route.firstChild
    }
  }

  private refreshBreadcrumbs() {
    const segments: BreadcrumbSegment[] = [
      {
        label: signal('🏠'),
        routerLink: ['/'],
      }
    ];
    this.browseNavigationContext((context, path) => {
      if (context.title) {
        segments.push({
          label: context.title,
          routerLink: path.build(),
        });
      }
    });
    this.segments.set(segments.length === 1 ? [] : segments);
  }

  private refreshMenu() {
    const menu: MenuSection = {
      section: {
        title: {
          text: '',
        },
        entries: [],
      },
    }
    this.browseNavigationContext((context) => {
      if (context.menu) {
        menu.section.entries.push(context.menu);
      }
    });
    this.menu.set(menu);
  }
}
