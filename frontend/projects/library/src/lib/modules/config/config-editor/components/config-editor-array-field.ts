import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { faSolidPlus, faSolidTrash } from '@ng-icons/font-awesome/solid';
import { ButtonModule } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputText } from 'primeng/inputtext';
import { OrderList } from 'primeng/orderlist';
import { Select } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Apps } from '../../model/gnConfig';

type ArrayItemKind = 'string' | 'number' | 'boolean';
interface ArrayEditableField {
  path: string;
  label: string;
  kind: string;
  value?: unknown;
  options?: readonly string[];
  arrayItemKind?: ArrayItemKind;
}

interface AggregationPresetOption {
  key: string;
  label: string;
}

interface AggregationPresetOptionGroup {
  label: string;
  items: AggregationPresetOption[];
}

@Component({
  selector: 'app-config-editor-array-field',
  standalone: true,
  imports: [
    FormsModule,
    InputGroup,
    Select,
    OrderList,
    ButtonModule,
    InputText,
    TextareaModule,
    NgIconComponent,
  ],
  viewProviders: [
    provideIcons({
      faSolidPlus,
      faSolidTrash,
    }),
  ],
  template: `
    <div class="border border-surface-200 dark:border-surface-700 rounded-lg p-3">
      <div class="flex items-center justify-between mb-3">
        <div class="text-sm font-medium">{{ entry.label }}</div>
        @if (isAggregation) {
          <div class="clear-both w-full max-w-160">
            <p-inputgroup>
              <p-select
                class="w-full"
                [options]="aggregationPresetOptions"
                [group]="true"
                optionLabel="label"
                optionGroupLabel="label"
                optionGroupChildren="items"
                optionValue="key"
                placeholder="Choose an aggregation"
                [ngModel]="aggregationPickerValue"
                (ngModelChange)="aggregationPickerValueChange.emit($event)"
              ></p-select>
              <p-button
                size="small"
                [text]="true"
                [rounded]="true"
                ariaLabel="Add aggregation"
                (onClick)="addAggregation.emit()"
              >
                <ng-icon name="faSolidPlus" pButtonIcon></ng-icon>
              </p-button>
            </p-inputgroup>
          </div>
        } @else {
          <p-button
            size="small"
            [text]="true"
            [rounded]="true"
            ariaLabel="Add entry"
            (onClick)="addArrayEntry.emit()"
          >
            <ng-icon name="faSolidPlus" pButtonIcon></ng-icon>
          </p-button>
        }
      </div>

      @if (isArrayEmpty) {
        <div class="text-xs text-surface-500 dark:text-surface-400">No entries yet.</div>
      }

      @if (isAggregation) {
        <p-orderList
          [value]="arrayItems"
          [trackBy]="trackByItem"
          [dragdrop]="true"
          [metaKeySelection]="false"
          [stripedRows]="true"
          [responsive]="true"
          [listStyle]="{ 'max-height': '60vh', height: '60vh' }"
          (onReorder)="reorder.emit(arrayItems)"
        >
          <ng-template #item let-arrayItem>
            <div class="flex flex-row gap-2 w-full ">
              <div class="grow">
                <textarea
                  pTextarea
                  class="w-full"
                  [value]="getAggregationJsonValueFn(appName, entry.path, arrayItem)"
                  (input)="onAggregationInput(arrayItem, $event)"
                  rows="6"
                ></textarea>
              </div>
              <p-button
                size="small"
                severity="danger"
                [text]="true"
                [rounded]="true"
                ariaLabel="Remove entry"
                (onClick)="removeAggregation.emit(arrayItem)"
              >
                <ng-icon name="faSolidTrash" pButtonIcon></ng-icon>
              </p-button>
            </div>
          </ng-template>
        </p-orderList>
      } @else {
        <p-orderList
          [value]="arrayItems"
          [trackBy]="trackByItem"
          [dragdrop]="true"
          [metaKeySelection]="false"
          [stripedRows]="true"
          [responsive]="true"
          [listStyle]="{ 'max-height': '14vh', height: '14vh' }"
          (onReorder)="reorder.emit(arrayItems)"
        >
          <ng-template #item let-arrayItem let-index="index">
            <div class="flex items-center gap-2 w-full mb-2">
              @if (entry.kind === 'select-array') {
                <select
                  class="w-full p-inputtext"
                  [ngModel]="arrayItem"
                  (ngModelChange)="selectArrayItemChange.emit({ index, value: $event })"
                >
                  @for (option of entry.options || []; track option) {
                    <option [value]="option">{{ option }}</option>
                  }
                </select>
              } @else {
                <input
                  [type]="entry.arrayItemKind === 'number' ? 'number' : 'text'"
                  class="w-full"
                  pInputText
                  [ngModel]="arrayItem"
                  (ngModelChange)="
                    primitiveArrayItemChange.emit({
                      index,
                      itemKind: entry.arrayItemKind,
                      value: $event,
                    })
                  "
                />
              }
              <p-button
                size="small"
                severity="danger"
                [text]="true"
                [rounded]="true"
                ariaLabel="Remove entry"
                (onClick)="removeArrayItem.emit(index)"
              >
                <ng-icon name="faSolidTrash" pButtonIcon></ng-icon>
              </p-button>
            </div>
          </ng-template>
        </p-orderList>
      }
    </div>
  `,
})
export class ConfigEditorArrayFieldComponent {
  @Input({ required: true }) appName!: keyof Apps;
  @Input({ required: true }) entry!: ArrayEditableField;
  @Input() isAggregation = false;
  @Input() arrayItems: unknown[] = [];
  @Input() aggregationPresetOptions: AggregationPresetOptionGroup[] = [];
  @Input() aggregationPickerValue = '';
  @Input() trackByItem: (index: number, item: unknown) => string = (index, item) =>
    `item-${index}-${String(item)}`;
  @Input()
  getAggregationJsonValueFn: (appName: keyof Apps, path: string, item: unknown) => string = () =>
    '';

  @Output() aggregationPickerValueChange = new EventEmitter<string>();
  @Output() addAggregation = new EventEmitter<void>();
  @Output() addArrayEntry = new EventEmitter<void>();
  @Output() aggregationJsonChange = new EventEmitter<{ item: unknown; value: string }>();
  @Output() removeAggregation = new EventEmitter<unknown>();
  @Output() reorder = new EventEmitter<unknown[]>();
  @Output() selectArrayItemChange = new EventEmitter<{ index: number; value: unknown }>();
  @Output() primitiveArrayItemChange = new EventEmitter<{
    index: number;
    itemKind: ArrayItemKind | undefined;
    value: unknown;
  }>();
  @Output() removeArrayItem = new EventEmitter<number>();

  get isArrayEmpty(): boolean {
    return this.arrayItems.length === 0;
  }

  onAggregationInput(item: unknown, event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) {
      return;
    }

    this.aggregationJsonChange.emit({ item, value: target.value });
  }
}
