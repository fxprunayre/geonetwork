import { Component, Input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidMagnifyingGlass } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NgIcon],
  viewProviders: [provideIcons({ faSolidMagnifyingGlass })],
  templateUrl: './empty-state.html',
})
export class EmptyStateComponent {
  @Input() title: string = 'No results found';
  @Input() message: string = 'Try adjusting your search terms or filters';
}
