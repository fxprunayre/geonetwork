import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { CheckboxModule } from 'primeng/checkbox';
import { FloatLabel } from 'primeng/floatlabel';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputText } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ColorPicker } from '../../../../shared/widgets/color-picker/color-picker';
import { Apps } from '../../model/gnConfig';
import { ConfigEditorArrayFieldComponent } from './config-editor-array-field';

type FieldKind =
  | 'section'
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'array'
  | 'select-array'
  | 'json';

type ArrayItemKind = 'string' | 'number' | 'boolean';

interface EditableField {
  path: string;
  label: string;
  kind: FieldKind;
  value?: unknown;
  options?: readonly string[];
  arrayItemKind?: ArrayItemKind;
}

@Component({
  selector: 'app-config-editor-fields',
  standalone: true,
  imports: [
    FormsModule,
    IftaLabelModule,
    CheckboxModule,
    ColorPicker,
    FloatLabel,
    InputText,
    TextareaModule,
    TranslatePipe,
    ConfigEditorArrayFieldComponent,
  ],
  template: `
    <div class="rounded-xl border border-surface-200 bg-surface-0 p-4">
      <div class="grid grid-cols-1 gap-2">
        @for (entry of entries; track entry.path) {
          @if (entry.kind === 'section') {
            <div class="pt-2">
              <div class="text-sm font-semibold text-surface-700 dark:text-surface-200">
                {{ entry.label }}
              </div>
            </div>
          }

          @if (entry.kind === 'string' || entry.kind === 'number') {
            @if (appName === 'banner' && entry.path === 'textColor') {
              <div class="pt-2">
                <app-color-picker
                  [label]="'config.theme.designer.field.apps.banner.textColor' | translate"
                  [color]="asColorFn(entry.value)"
                  (colorChange)="updateBannerTextColorFn($event)"
                ></app-color-picker>
              </div>
            } @else {
              <p-float-label class="my-4">
                <input
                  [type]="entry.kind === 'number' ? 'number' : 'text'"
                  [id]="appName + '-' + entry.path"
                  class="w-full"
                  pInputText
                  [ngModel]="entry.value"
                  (ngModelChange)="updatePrimitiveFieldFn(appName, entry.path, entry.kind, $event)"
                />
                <label [for]="appName + '-' + entry.path">{{ entry.label }}</label>
              </p-float-label>
            }
          }

          @if (entry.kind === 'boolean') {
            <div
              class="h-full border border-surface-200 dark:border-surface-700 rounded-lg px-3 py-2 flex items-center gap-3"
            >
              <p-checkbox
                [inputId]="appName + '-' + entry.path"
                [binary]="true"
                [ngModel]="entry.value"
                (ngModelChange)="updateBooleanFieldFn(appName, entry.path, $event)"
              />
              <label [for]="appName + '-' + entry.path" class="text-sm">{{ entry.label }}</label>
            </div>
          }

          @if (entry.kind === 'select') {
            <p-iftalabel>
              <select
                [id]="appName + '-' + entry.path"
                class="w-full p-inputtext"
                [ngModel]="entry.value"
                (ngModelChange)="updateStringFieldFn(appName, entry.path, $event)"
              >
                @for (option of entry.options || []; track option) {
                  <option [value]="option">{{ option }}</option>
                }
              </select>
              <label [for]="appName + '-' + entry.path">{{ entry.label }}</label>
            </p-iftalabel>
          }

          @if (entry.kind === 'array' || entry.kind === 'select-array') {
            <app-config-editor-array-field
              [appName]="appName"
              [entry]="entry"
              [isAggregation]="isAggregationPathFn(entry.path)"
              [arrayItems]="asArrayFn(entry.value)"
              [aggregationPresetOptions]="getAggregationPresetOptionsFn(appName, entry.path)"
              [aggregationPickerValue]="getAggregationPickerValueFn(appName, entry.path)"
              [trackByItem]="trackByItemFn"
              [getAggregationJsonValueFn]="aggregationJsonValueFn"
              (aggregationPickerValueChange)="
                setAggregationPickerValueFn(appName, entry.path, $event)
              "
              (addAggregation)="addWellKnownAggregationFn(appName, entry.path)"
              (addArrayEntry)="
                addArrayEntryFn(
                  appName,
                  entry.path,
                  entry.kind,
                  entry.arrayItemKind,
                  entry.options || []
                )
              "
              (aggregationJsonChange)="
                updateAggregationItemByRefFn(appName, entry.path, $event.item, $event.value)
              "
              (removeAggregation)="removeAggregationItemFn(appName, entry.path, $event)"
              (reorder)="
                isAggregationPathFn(entry.path)
                  ? persistAggregationOrderFn(appName, entry.path, $event)
                  : persistArrayOrderFn(appName, entry.path, $event)
              "
              (selectArrayItemChange)="
                updateArrayEntryFn(appName, entry.path, $event.index, $event.value)
              "
              (primitiveArrayItemChange)="
                updateArrayPrimitiveEntryFn(
                  appName,
                  entry.path,
                  $event.index,
                  $event.itemKind,
                  $event.value
                )
              "
              (removeArrayItem)="removeArrayEntryFn(appName, entry.path, $event)"
            ></app-config-editor-array-field>
          }

          @if (entry.kind === 'json') {
            <div>
              <p-iftalabel>
                <textarea
                  pTextarea
                  [id]="appName + '-' + entry.path"
                  [ngModel]="toJsonFn(entry.value)"
                  (ngModelChange)="updateJsonFieldFn(appName, entry.path, $event)"
                  rows="7"
                  style="resize: vertical; width: 100%; font-family: monospace; font-size: 0.875rem;"
                ></textarea>
                <label [for]="appName + '-' + entry.path">{{ entry.label }} (JSON)</label>
              </p-iftalabel>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class ConfigEditorFieldsComponent {
  @Input({ required: true }) appName!: keyof Apps;
  @Input({ required: true }) entries: EditableField[] = [];

  @Input({ required: true }) asColorFn!: (value: unknown) => string;
  @Input({ required: true }) asArrayFn!: (value: unknown) => unknown[];
  @Input({ required: true }) toJsonFn!: (value: unknown) => string;
  @Input({ required: true }) isAggregationPathFn!: (path: string) => boolean;
  @Input({ required: true }) getAggregationPresetOptionsFn!: (
    appName: keyof Apps,
    path: string,
  ) => Array<{ label: string; items: Array<{ key: string; label: string }> }>;
  @Input({ required: true }) getAggregationPickerValueFn!: (
    appName: keyof Apps,
    path: string,
  ) => string;
  @Input({ required: true }) setAggregationPickerValueFn!: (
    appName: keyof Apps,
    path: string,
    value: string,
  ) => void;
  @Input({ required: true }) addWellKnownAggregationFn!: (
    appName: keyof Apps,
    path: string,
  ) => void;
  @Input({ required: true }) addArrayEntryFn!: (
    appName: keyof Apps,
    path: string,
    kind: 'array' | 'select-array',
    itemKind: ArrayItemKind | undefined,
    options: readonly string[],
  ) => void;
  @Input({ required: true }) updateAggregationItemByRefFn!: (
    appName: keyof Apps,
    path: string,
    item: unknown,
    jsonValue: string,
  ) => void;
  @Input({ required: true }) removeAggregationItemFn!: (
    appName: keyof Apps,
    path: string,
    item: unknown,
  ) => void;
  @Input({ required: true }) persistAggregationOrderFn!: (
    appName: keyof Apps,
    path: string,
    reorderedValues: unknown[],
  ) => void;
  @Input({ required: true }) persistArrayOrderFn!: (
    appName: keyof Apps,
    path: string,
    reorderedValues: unknown[],
  ) => void;
  @Input({ required: true }) updateArrayEntryFn!: (
    appName: keyof Apps,
    path: string,
    index: number,
    value: unknown,
  ) => void;
  @Input({ required: true }) updateArrayPrimitiveEntryFn!: (
    appName: keyof Apps,
    path: string,
    index: number,
    itemKind: ArrayItemKind | undefined,
    value: unknown,
  ) => void;
  @Input({ required: true }) removeArrayEntryFn!: (
    appName: keyof Apps,
    path: string,
    index: number,
  ) => void;
  @Input({ required: true }) updatePrimitiveFieldFn!: (
    appName: keyof Apps,
    path: string,
    kind: 'string' | 'number',
    value: unknown,
  ) => void;
  @Input({ required: true }) updateStringFieldFn!: (
    appName: keyof Apps,
    path: string,
    value: string,
  ) => void;
  @Input({ required: true }) updateBooleanFieldFn!: (
    appName: keyof Apps,
    path: string,
    value: boolean,
  ) => void;
  @Input({ required: true }) updateBannerTextColorFn!: (value: string) => void;
  @Input({ required: true }) updateJsonFieldFn!: (
    appName: keyof Apps,
    path: string,
    jsonValue: string,
  ) => void;
  @Input({ required: true }) trackByItemFn!: (index: number, item: unknown) => string;
  @Input({ required: true }) aggregationJsonValueFn!: (
    appName: keyof Apps,
    path: string,
    item: unknown,
  ) => string;
}
