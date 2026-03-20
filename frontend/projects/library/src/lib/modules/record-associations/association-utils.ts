import { TranslateService } from '@ngx-translate/core';

export function getAssociationLabel(
  translateService: TranslateService,
  type: string,
  count?: number,
): string {
  if (type.startsWith('siblings_')) {
    const parts = type.split('_');
    const associationType = parts[1] ?? '';
    const initiativeType = parts[2] ?? '';
    const labels = [
      translateService.instant(associationType),
      translateService.instant(initiativeType),
    ];
    return labels.join(' - ') + (count !== undefined ? ` (${count})` : '');
  }
  return translateService.instant('record.association.' + type, {
    count: count,
  });
}
