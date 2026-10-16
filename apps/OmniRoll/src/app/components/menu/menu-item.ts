import {
  Component,
  EventEmitter,
  Output,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Help } from '@project/components/help/help';
import {
  MenuEntry,
  MenuLink,
  MenuSection,
  MenuSeparator,
  isMenuLink,
  isMenuSection,
  isMenuSeparator,
} from '@project/services/navigation/navigation';
import {
  MenuEvent,
  MenuRouterLinkClicked,
} from './api';

@Component({
  selector: 'app-menu-item',
  imports: [
    RouterLink,
    Help,
  ],
  templateUrl: './menu-item.html',
  styleUrl: './menu-item.css',
})
export class MenuItem {
  entry = input.required<MenuEntry>();
  @Output() event = new EventEmitter<MenuEvent>();

  asSection(): MenuSection['section']|null {
    const entry = this.entry();
    if (isMenuSection(entry)) {
      return entry.section;
    }
    return null;
  }
  asLink(): MenuLink['link']|null {
    const entry = this.entry();
    if (isMenuLink(entry)) {
      return entry.link;
    }
    return null;
  }
  asSeparator(): MenuSeparator['separator']|null {
    const entry = this.entry();
    if (isMenuSeparator(entry)) {
      return entry.separator;
    }
    return null;
  }

  forwardEvent(event: MenuEvent) {
    this.event.emit(event);
  }
  fireRouterLinkClicked() {
    this.forwardEvent(new MenuRouterLinkClicked({entry: this.entry()}));
  }
}
