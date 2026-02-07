import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, EventType, Router, RouterLink, UrlSegment, UrlSegmentGroup, UrlTree } from '@angular/router';

export interface NavigationContextHolder {
  navigationContext: NavigationContext;
}
export function isNavigationContextHolder(object: unknown): object is NavigationContextHolder {
  return typeof object === 'object' && object !== null && 'navigationContext' in object;
}
export class NavigationContext {
  title: WritableSignal<string|undefined> = signal(undefined);
  menu: WritableSignal<MenuEntry|undefined> = signal(undefined);
}

export interface BreadcrumbSegment {
  label: Signal<string|undefined>;
  routerLink?: RouterLink['routerLink'];
}

export type MenuEntry = MenuSection | MenuLink;
export interface MenuSection {
  section: {
    title: {
      text: string|undefined;
      routerLink?: RouterLink['routerLink'];
    };
    entries: Signal<MenuEntry|undefined>[];
  };
}
export interface MenuLink {
  link: {
    title: string|undefined;
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
  root = new NavigationContext();
  segments = signal<BreadcrumbSegment[]>([]);
  menu = signal<MenuEntry>({
    section: {
      title: {
        text: '',
      },
      entries: [],
    },
  });
  private readonly _contexts = signal<NavigationContext[]>([]);
  readonly contexts = this._contexts.asReadonly();

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      switch (event.type) {
        case EventType.NavigationEnd:
          this.refreshContext();
          this.refreshBreadcrumbs();
          this.refreshMenu();
          break;
      }
    });
  }

  private browseNavigationContext(process: (context: NavigationContext, path: UrlTreeBuilder) => void) {
    let route: ActivatedRouteSnapshot|null = this.router.routerState.snapshot.root;
    const routePath = new UrlTreeBuilder();

    const root = this.root;
    if (root !== null) {
      process(root, routePath);
    }

    while (route !== null) {
      routePath.pushRoute(route);
      const configData = route.routeConfig?.data;
      if (isNavigationContextHolder(configData)) {
        const routeData = route.data;
        if (isNavigationContextHolder(routeData)) {
          process(routeData.navigationContext, routePath);
        }
      }
      route = route.firstChild
    }
  }

  private refreshContext() {
    const contexts: NavigationContext[] = [];
    this.browseNavigationContext((context) => {
      contexts.push(context);
    });
    this._contexts.set(contexts);
  }

  private refreshBreadcrumbs() {
    const segments: BreadcrumbSegment[] = [
      {
        label: signal('🏠'),
        routerLink: ['/'],
      }
    ];
    this.browseNavigationContext((context, path) => {
      segments.push({
        label: context.title,
        routerLink: path.build(),
      });
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
      menu.section.entries.push(context.menu);
    });
    this.menu.set(menu);
  }
}
