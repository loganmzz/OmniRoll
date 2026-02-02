import { Component, inject, output } from '@angular/core';
import { NavigationService } from '@project/services/navigation/navigation';
import { MenuItem } from './menu-item';

@Component({
  selector: 'app-menu',
  imports: [MenuItem],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  navigation = inject(NavigationService);
  closing = output<void>();
}
