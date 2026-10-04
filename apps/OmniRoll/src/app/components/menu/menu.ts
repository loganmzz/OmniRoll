import {
  Component,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';
import { NavigationService } from '@project/services/navigation/navigation';
import type { MenuEvent } from './api';
import { MenuItem } from './menu-item';

@Component({
  selector: 'app-menu',
  imports: [MenuItem],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  navigation = inject(NavigationService);
  @Output() event = new EventEmitter<MenuEvent>();

  forwardEvent(event: MenuEvent) {
    this.event.emit(event);
  }
}
