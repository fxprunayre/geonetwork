import { Pipe, PipeTransform } from '@angular/core';
import { MeResponse } from 'gn4-api-client';

@Pipe({
  name: 'userFullName',
  standalone: true,
})
export class UserFullNamePipe implements PipeTransform {
  transform(user: MeResponse | null | undefined): string {
    if (!user) {
      return '';
    }
    return `${user.name} ${user.surname}`.trim() || user.username || '';
  }
}
