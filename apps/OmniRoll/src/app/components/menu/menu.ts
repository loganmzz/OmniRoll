import {
  Component,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';
import { Documentation } from '@project/services/documentation/documentation';
import { NavigationService } from '@project/services/navigation/navigation';
import { APP_VERSION } from '@project/services/version';
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
  version = inject(APP_VERSION);
  documentation = inject(Documentation);

  @Output() event = new EventEmitter<MenuEvent>();

  forwardEvent(event: MenuEvent) {
    this.event.emit(event);
  }
}
