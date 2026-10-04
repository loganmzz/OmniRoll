import { MenuEntry } from '@project/services/navigation/navigation';

export type MenuEvent = MenuRouterLinkClicked;

export class MenuRouterLinkClicked {
  readonly entry: MenuEntry;

  constructor({entry}: {entry: MenuEntry}) {
    this.entry = entry;
  }
}
