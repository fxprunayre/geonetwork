import { Component, Input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidMagnifyingGlass } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-no-result-found',
  standalone: true,
  imports: [NgIcon],
  viewProviders: [provideIcons({ faSolidMagnifyingGlass })],
  template: `
    <div class="text-center py-12">
      <ng-icon name="faSolidMagnifyingGlass" class="text-6xl text-300"></ng-icon>
      <h3 class="text-xl font-medium text-800 mt-4 mb-2">{{ title }}</h3>
      <p class="text-muted-color">{{ message }}</p>
    </div>
  `,
})
export class NoResultFound {
  @Input() title = 'No results found';
  @Input() message = 'Try adjusting your search terms or filters';
}
