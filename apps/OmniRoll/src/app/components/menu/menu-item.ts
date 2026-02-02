import { Component, input, Signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { isMenuLink, isMenuSection, MenuEntry, MenuLink, MenuSection } from '@project/services/navigation/navigation';

@Component({
  selector: 'app-menu-item',
  imports: [RouterLink],
  templateUrl: './menu-item.html',
  styleUrl: './menu-item.css',
})
export class MenuItem {
  entry = input.required<Signal<MenuEntry>>();

  asSection(): MenuSection['section']|null {
    const entry = this.entry()();
    if (isMenuSection(entry)) {
      return entry.section;
    }
    return null;
  }
  asLink(): MenuLink['link']|null {
    const entry = this.entry()();
    if (isMenuLink(entry)) {
      return entry.link;
    }
    return null;
  }
}
