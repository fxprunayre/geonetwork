import { Component, Input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidMagnifyingGlass } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-no-result-found',
  standalone: true,
  imports: [NgIcon],
  viewProviders: [provideIcons({ faSolidMagnifyingGlass })],
  templateUrl: './no-result-found.html',
})
export class NoResultFound {
  @Input() title: string = 'No results found';
  @Input() message: string = 'Try adjusting your search terms or filters';
}
