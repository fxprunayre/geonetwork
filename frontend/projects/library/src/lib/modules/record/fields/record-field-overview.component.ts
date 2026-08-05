import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faImage } from '@ng-icons/font-awesome/regular';
import { TranslatePipe } from '@ngx-translate/core';
import { Overview } from 'gn-api-client';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';

@Component({
  selector: 'app-record-field-overview',
  templateUrl: './record-field-overview.component.html',
  standalone: true,
  imports: [GalleriaModule, ImageModule, NgIcon, TranslatePipe],
  viewProviders: [
    provideIcons({
      faImage,
    }),
  ],
})
export class RecordFieldOverviewComponent {
  field = input<Overview | Overview[] | null>();
  overviewList = computed<Overview[]>(() => {
    const field = this.field();
    if (!field) {
      return [];
    } else if (Array.isArray(field)) {
      return field;
    } else {
      return [field];
    }
  });
  styleClass = input<string>('');
  preview = input<boolean>(true);

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }
}
