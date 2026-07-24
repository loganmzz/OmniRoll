import {
  Component,
  inject,
  input,
} from '@angular/core';
import {
  Documentation,
  DocumentationLinks,
} from '@project/services/documentation/documentation';

@Component({
  selector: 'app-help',
  imports: [],
  templateUrl: './help.html',
  styleUrl: './help.css',
})
export class Help {
  documentation = inject(Documentation);

  link = input.required<DocumentationLinks>();
}
