import { Injectable } from '@angular/core';
import environment from '@project/../environments/environment';

export type DocumentationLinks =
  'home' |
  'referential' |
  'collection'
;

@Injectable({
  providedIn: 'root'
})
export class Documentation {

  linkTo(link: DocumentationLinks): string {
    let path = '';
    switch (link) {
      case 'home':
        path = '/';
        break;
      case 'referential':
        path = '/#referential';
        break;
      case 'collection':
        path = '/#collection';
        break;
      default:
        throw new Error(`Documentation link ${JSON.stringify(link)} is not implemented yet.`);
    }
    return `${environment.docs.baseUrl}${path}`;
  }
}
