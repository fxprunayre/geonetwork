import { NgStyle } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Chip } from 'primeng/chip';
import { RecordFieldBase } from '../record-field-base/record-field-base';

type CodelistDecorator = {
  type: 'badge';
  map: Record<string, string>; // Maps to PrimeNG CSS variable names
};

@Component({
  selector: 'app-record-field-codelist',
  imports: [TranslatePipe, Chip, NgStyle],
  templateUrl: 'record-field-codelist.html',
})
export class RecordFieldCodelist extends RecordFieldBase {
  codelist = input<string | undefined>();

  codelistDecorators: Record<string, CodelistDecorator> = {
    cl_status: {
      type: 'badge',
      map: {
        obsolete: '--p-red-500',
        superseded: '--p-red-500',
        historicalArchive: '--p-red-500',
        completed: '--p-green-500',
        onGoing: '--p-blue-500',
        inProgress: '--p-blue-500',
      },
    },
  };

  getChipStyle = (variableName: string) => {
    return { 'background-color': `var(${variableName})`, color: 'white' };
  };

  values = computed<{ default: string; link: string; key: string }[]>(() => {
    const codelist = this.codelist();
    if (!codelist) {
      return [];
    }
    return this.record()?.[codelist] || [];
  });

  decorator = computed(() => {
    const codelist = this.codelist();
    if (!codelist) {
      return null;
    }
    return this.codelistDecorators[codelist];
  });
}
