import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { getAssociationLabel } from './association-utils';

@Pipe({
  name: 'associationLabel',
  standalone: true,
})
export class AssociationLabelPipe implements PipeTransform {
  private translateService = inject(TranslateService);

  transform(type: string, count?: number): string {
    return getAssociationLabel(this.translateService, type, count);
  }
}
