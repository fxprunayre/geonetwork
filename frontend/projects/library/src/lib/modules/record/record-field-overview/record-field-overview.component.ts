import { Component, computed, input } from '@angular/core';
import { ImageModule } from 'primeng/image';
import { GalleriaModule } from 'primeng/galleria';
import { Overview } from 'gn-api-client';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { TranslatePipe } from '@ngx-translate/core';
import { faImage } from '@ng-icons/font-awesome/regular';

@Component({
  selector: 'app-record-field-overview',
  templateUrl: './record-field-overview.component.html',
  standalone: true,
  imports: [ImageModule, GalleriaModule, NgIcon, TranslatePipe],
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
