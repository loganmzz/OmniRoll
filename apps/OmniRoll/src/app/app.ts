import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Breadcrumb } from './components/breadcrumb/breadcrumb';

@Component({
  imports: [RouterModule, Breadcrumb],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'OmniRoll';
}
