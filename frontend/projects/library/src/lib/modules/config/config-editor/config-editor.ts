import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { faCompass } from '@ng-icons/font-awesome/regular';
import {
  faSolidBars,
  faSolidBookmark,
  faSolidCube,
  faSolidFile,
  faSolidGear,
  faSolidImage,
  faSolidLanguage,
  faSolidLock,
  faSolidMagnifyingGlass,
  faSolidMap,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { WELL_KNOWN_HOME_AGGREGATION_GROUPS } from '../../home/config/home-config';
import {
  MAP_LAYER_DISPLAY_TARGET_EXPLORE_EMBEDDED_MAP,
  MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB,
} from '../../record';
import {
  type AggregationItem,
  WELL_KNOWN_AGGREGATION_GROUPS,
} from '../../search/config/search-config';
import { DEFAULT_THEME } from '../default-theme';
import {
  App,
  Apps,
  COVERAGE_SPATIAL_DISPLAY_TYPE_OPTIONS,
  I18N_DETECTION_OPTIONS,
  MAP_TYPE_OPTIONS,
  SEARCH_FILTER_POSITION_OPTIONS,
  SEARCH_LAYOUT_OPTIONS,
  SHARING_MODE_OPTIONS,
} from '../model/gnConfig';
import { ConfigEditorFieldsComponent } from './components/config-editor-fields';
import { ConfigEditorRawTabComponent } from './components/config-editor-raw-tab';
import { ConfigEditorSidebarComponent } from './components/config-editor-sidebar';
import { ConfigEditorThemeTabComponent } from './components/config-editor-theme-tab';
import { ConfigEditorStateService } from './state/config-editor-state.service';

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

interface AggregationPresetOption {
  key: string;
  label: string;
  aggregation?: AggregationItem;
}

interface AggregationPresetOptionGroup {
  label: string;
  items: AggregationPresetOption[];
}

@Component({
  selector: 'app-config-editor',
  standalone: true,
  imports: [
    FormsModule,
    ToggleSwitchModule,
    NgIconComponent,
    TranslatePipe,
    ConfigEditorFieldsComponent,
    ConfigEditorRawTabComponent,
    ConfigEditorSidebarComponent,
    ConfigEditorThemeTabComponent,
  ],
  providers: [ConfigEditorStateService],
  viewProviders: [
    provideIcons({
      faSolidCube,
      faCompass,
      faSolidMagnifyingGlass,
      faSolidMap,
      faSolidLanguage,
      faSolidLock,
      faSolidFile,
      faSolidGear,
      faSolidBars,
      faSolidImage,
      faSolidBookmark,
    }),
  ],
  template: `
    @if (appConfig().config?.apps; as apps) {
      <div class="flex flex-row gap-4 h-full min-h-125">
        <app-config-editor-sidebar
          class="w-1/4"
          [appNames]="appNames()"
          [selectedTab]="selectedTab()"
          (selectedTabChange)="selectedTab.set($event)"
        ></app-config-editor-sidebar>
        <div class="flex-1 w-3/4 pl-2 overflow-y-auto">
          @if (selectedApp(); as appName) {
            <div class="flex flex-col gap-4">
              <div class="text-xl font-bold mb-2 flex items-center">
                <ng-icon [name]="iconMap[appName]" class="mr-2"></ng-icon>
                {{ getAppDisplayLabel(appName) }} {{ 'config.editor.title' | translate }}
              </div>

              <div class="flex items-center gap-2 mb-2">
                <p-toggleswitch
                  [ngModel]="apps[appName]?.enabled"
                  (ngModelChange)="updateAppEnabled(appName, $event)"
                  [inputId]="appName + '-enabled'"
                >
                </p-toggleswitch>
                <label [for]="appName + '-enabled'">{{
                  'config.editor.enabled' | translate
                }}</label>
              </div>

              @if (getAppEditableEntries(appName); as entries) {
                @if (entries.length > 0) {
                  <app-config-editor-fields
                    [appName]="appName"
                    [entries]="entries"
                    [asColorFn]="asColorFn"
                    [asArrayFn]="asArrayFn"
                    [toJsonFn]="toJsonFn"
                    [isAggregationPathFn]="isAggregationPathFn"
                    [getAggregationPresetOptionsFn]="getAggregationPresetOptionsFn"
                    [getAggregationPickerValueFn]="getAggregationPickerValueFn"
                    [setAggregationPickerValueFn]="setAggregationPickerValueFn"
                    [addWellKnownAggregationFn]="addWellKnownAggregationFn"
                    [addArrayEntryFn]="addArrayEntryFn"
                    [updateAggregationItemByRefFn]="updateAggregationItemByRefFn"
                    [removeAggregationItemFn]="removeAggregationItemFn"
                    [persistAggregationOrderFn]="persistAggregationOrderFn"
                    [persistArrayOrderFn]="persistArrayOrderFn"
                    [updateArrayEntryFn]="updateArrayEntryFn"
                    [updateArrayPrimitiveEntryFn]="updateArrayPrimitiveEntryFn"
                    [removeArrayEntryFn]="removeArrayEntryFn"
                    [updatePrimitiveFieldFn]="updatePrimitiveFieldFn"
                    [updateStringFieldFn]="updateStringFieldFn"
                    [updateBooleanFieldFn]="updateBooleanFieldFn"
                    [updateBannerTextColorFn]="updateBannerTextColorFn"
                    [updateJsonFieldFn]="updateJsonFieldFn"
                    [trackByItemFn]="trackByAggregationItem"
                    [aggregationJsonValueFn]="aggregationJsonValueFn"
                  ></app-config-editor-fields>
                }
              }
            </div>
          } @else if (selectedTab() === 'theme') {
            <app-config-editor-theme-tab [theme]="theme()"></app-config-editor-theme-tab>
          } @else if (selectedTab() === 'raw') {
            <app-config-editor-raw-tab
              [appConfigJson]="appConfigJson()"
              [embedSnippet]="embedSnippet()"
              (rawConfigChange)="updateRawConfig($event)"
            ></app-config-editor-raw-tab>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class ConfigEditorComponent {
  private readonly defaultTermAggregationPresetKey = '__default_term__';

  private readonly selectOptions: Record<string, readonly string[]> = {
    'map.type': MAP_TYPE_OPTIONS,
    'i18n.detection': I18N_DETECTION_OPTIONS,
    'sharing.sharingMode': SHARING_MODE_OPTIONS,
    'search.filterPosition': SEARCH_FILTER_POSITION_OPTIONS,
    'search.resultsLayoutOptions': SEARCH_LAYOUT_OPTIONS,
    'record.mapLayerDisplayTarget': [
      MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB,
      MAP_LAYER_DISPLAY_TARGET_EXPLORE_EMBEDDED_MAP,
    ],
    'record.coverageSpatialDisplayType': COVERAGE_SPATIAL_DISPLAY_TYPE_OPTIONS,
  };

  private readonly jsonFallbackKeys = new Set([
    'search.filter',
    'search.functionScore',
    'search.knn',
    'map.sextant.context',
    'record.distribution',
    'i18n.languages',
  ]);

  readonly wellKnownAggregationGroups = WELL_KNOWN_AGGREGATION_GROUPS;
  readonly wellKnownHomeAggregationGroups = WELL_KNOWN_HOME_AGGREGATION_GROUPS;
  private readonly aggregationPickerByPath = signal<Record<string, string>>({});
  private readonly aggregationJsonDraftByItem = signal<Record<string, string>>({});
  private readonly aggregationTrackKeys = new WeakMap<object, string>();
  private aggregationTrackCounter = 0;
  private readonly state = inject(ConfigEditorStateService);

  readonly asColorFn = (value: unknown) => this.asColor(value);
  readonly asArrayFn = (value: unknown) => this.asArray(value);
  readonly toJsonFn = (value: unknown) => this.toJson(value);
  readonly isAggregationPathFn = (path: string) => this.isAggregationPath(path);
  readonly getAggregationPresetOptionsFn = (appName: keyof Apps, path: string) =>
    this.getAggregationPresetOptions(appName, path);
  readonly getAggregationPickerValueFn = (appName: keyof Apps, path: string) =>
    this.getAggregationPickerValue(appName, path);
  readonly setAggregationPickerValueFn = (appName: keyof Apps, path: string, value: string) =>
    this.setAggregationPickerValue(appName, path, value);
  readonly addWellKnownAggregationFn = (appName: keyof Apps, path: string) =>
    this.addWellKnownAggregation(appName, path);
  readonly addArrayEntryFn = (
    appName: keyof Apps,
    path: string,
    kind: 'array' | 'select-array',
    itemKind: ArrayItemKind | undefined,
    options: readonly string[],
  ) => this.addArrayEntry(appName, path, kind, itemKind, options);
  readonly updateAggregationItemByRefFn = (
    appName: keyof Apps,
    path: string,
    item: unknown,
    jsonValue: string,
  ) => this.updateAggregationItemByRef(appName, path, item, jsonValue);
  readonly removeAggregationItemFn = (appName: keyof Apps, path: string, item: unknown) =>
    this.removeAggregationItem(appName, path, item);
  readonly persistAggregationOrderFn = (appName: keyof Apps, path: string, values: unknown[]) =>
    this.persistAggregationOrder(appName, path, values);
  readonly persistArrayOrderFn = (appName: keyof Apps, path: string, values: unknown[]) =>
    this.persistArrayOrder(appName, path, values);
  readonly updateArrayEntryFn = (
    appName: keyof Apps,
    path: string,
    index: number,
    value: unknown,
  ) => this.updateArrayEntry(appName, path, index, value);
  readonly updateArrayPrimitiveEntryFn = (
    appName: keyof Apps,
    path: string,
    index: number,
    itemKind: ArrayItemKind | undefined,
    value: unknown,
  ) => this.updateArrayPrimitiveEntry(appName, path, index, itemKind, value);
  readonly removeArrayEntryFn = (appName: keyof Apps, path: string, index: number) =>
    this.removeArrayEntry(appName, path, index);
  readonly updatePrimitiveFieldFn = (
    appName: keyof Apps,
    path: string,
    kind: 'string' | 'number',
    value: unknown,
  ) => this.updatePrimitiveField(appName, path, kind, value);
  readonly updateStringFieldFn = (appName: keyof Apps, path: string, value: string) =>
    this.updateStringField(appName, path, value);
  readonly updateBooleanFieldFn = (appName: keyof Apps, path: string, value: boolean) =>
    this.updateBooleanField(appName, path, value);
  readonly updateBannerTextColorFn = (value: string) => this.updateBannerTextColor(value);
  readonly updateJsonFieldFn = (appName: keyof Apps, path: string, jsonValue: string) =>
    this.updateJsonField(appName, path, jsonValue);
  readonly aggregationJsonValueFn = (appName: keyof Apps, path: string, item: unknown) =>
    this.getAggregationJsonValue(appName, path, item);

  appConfig = this.state.appConfig;
  theme = computed(() => this.appConfig().config?.theme || DEFAULT_THEME);

  selectedTab = signal<string>('theme');
  selectedApp = computed(() => {
    const tab = this.selectedTab() as keyof Apps;
    return this.appNames().includes(tab) ? tab : null;
  });

  appNames = computed(() => {
    const apps = this.appConfig().config?.apps;
    if (!apps) return [];

    // Sort logic: home, search, map, record first, then others, alphabetically
    const predefinedOrder: (keyof Apps)[] = [
      'banner',
      'menu',
      'home',
      'search',
      'map',
      'record',
      'i18n',
      'authentication',
      'userSelections',
    ];
    const keys = Object.keys(apps) as (keyof Apps)[];

    return keys.sort((a, b) => {
      const idxA = predefinedOrder.indexOf(a);
      const idxB = predefinedOrder.indexOf(b);

      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  });

  iconMap: Record<string, string> = {
    home: 'faCompass',
    search: 'faSolidMagnifyingGlass',
    map: 'faSolidMap',
    i18n: 'faSolidLanguage',
    authentication: 'faSolidLock',
    userSelections: 'faSolidBookmark',
    record: 'faSolidFile',
    menu: 'faSolidBars',
    banner: 'faSolidImage',
  };

  appLabelMap: Partial<Record<keyof Apps, string>> = {
    userSelections: 'Bookmark',
  };

  appConfigJson = computed(() => JSON.stringify(this.appConfig(), null, 2));
  embedSnippet = computed(() => {
    const escapedConfig = JSON.stringify(this.appConfig()).replace(/"/g, '&quot;');
    const assetBaseUrl = this.getEmbedAssetBaseUrl();
    const catalogueUrl = this.appConfig().catalogueUrl;
    return [
      `<script src="${assetBaseUrl}/sextant-app.js" type="module"></script>`,
      `<link rel="stylesheet" href="${assetBaseUrl}/styles.css" />`,
      `<sextant-app url="${catalogueUrl}" config="${escapedConfig}"></sextant-app>`,
    ].join('\n');
  });

  private getEmbedAssetBaseUrl(): string {
    return `${this.appConfig().catalogueUrl}/dist/webcomponent/browser`;
  }

  getAppDisplayLabel(appName: keyof Apps): string {
    return this.appLabelMap[appName] || appName.charAt(0).toUpperCase() + appName.slice(1);
  }

  getAppEditableEntries(appName: keyof Apps): EditableField[] {
    const app = this.appConfig().config?.apps?.[appName] as
      | (App & Record<string, unknown>)
      | undefined;
    if (!app) {
      return [];
    }

    const { enabled: _enabled, ...rest } = app;
    return this.buildFields(appName, rest, '');
  }

  private buildFields(
    appName: keyof Apps,
    source: Record<string, unknown>,
    parentPath: string,
  ): EditableField[] {
    const entries: EditableField[] = [];

    for (const key of Object.keys(source)) {
      const value = source[key];
      if (value === undefined) {
        continue;
      }

      const path = parentPath ? `${parentPath}.${key}` : key;
      const label = this.humanizeKey(key);
      const enumOptions = this.getSelectOptions(appName, path);

      if (this.isJsonFallback(appName, path)) {
        entries.push({ path, label, kind: 'json', value });
        continue;
      }

      if (enumOptions && !Array.isArray(value)) {
        entries.push({ path, label, kind: 'select', value, options: enumOptions });
        continue;
      }

      if (Array.isArray(value)) {
        if (this.isAggregationPath(path)) {
          entries.push({
            path,
            label,
            kind: 'array',
            value,
            arrayItemKind: 'string',
          });
          continue;
        }

        if (enumOptions) {
          entries.push({
            path,
            label,
            kind: 'select-array',
            value,
            options: enumOptions,
            arrayItemKind: 'string',
          });
          continue;
        }

        if (value.every((item) => ['string', 'number', 'boolean'].includes(typeof item))) {
          entries.push({
            path,
            label,
            kind: 'array',
            value,
            arrayItemKind: this.detectArrayItemKind(value),
          });
        } else {
          entries.push({ path, label, kind: 'json', value });
        }
        continue;
      }

      if (value && typeof value === 'object') {
        entries.push({ path, label, kind: 'section' });
        const nestedEntries = this.buildFields(appName, value as Record<string, unknown>, path);
        if (nestedEntries.length === 0) {
          entries.push({ path, label, kind: 'json', value });
        } else {
          entries.push(...nestedEntries);
        }
        continue;
      }

      if (typeof value === 'boolean') {
        entries.push({ path, label, kind: 'boolean', value });
        continue;
      }

      if (typeof value === 'number') {
        entries.push({ path, label, kind: 'number', value });
        continue;
      }

      entries.push({ path, label, kind: 'string', value: value ?? '' });
    }

    return entries;
  }

  private isJsonFallback(appName: keyof Apps, path: string): boolean {
    const fullPath = `${appName}.${path}`;
    return (
      this.jsonFallbackKeys.has(fullPath) ||
      fullPath.includes('.distribution.sections') ||
      fullPath.includes('.context.backgroundLayers')
    );
  }

  private getSelectOptions(appName: keyof Apps, path: string): readonly string[] | null {
    return this.selectOptions[`${appName}.${path}`] || null;
  }

  private humanizeKey(key: string): string {
    const spaced = key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[_-]/g, ' ')
      .trim();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }

  private detectArrayItemKind(value: unknown[]): ArrayItemKind {
    if (value.every((item) => typeof item === 'number')) {
      return 'number';
    }
    if (value.every((item) => typeof item === 'boolean')) {
      return 'boolean';
    }
    return 'string';
  }

  updateAppEnabled(appName: keyof Apps, isEnabled: boolean) {
    const currentConfig = this.appConfig();
    if (!currentConfig.config?.apps?.[appName]) {
      if (!currentConfig.config) {
        currentConfig.config = { apps: {} };
      }
      if (!currentConfig.config.apps) {
        currentConfig.config.apps = {};
      }
      (currentConfig.config.apps as Record<string, App>)[appName] = { enabled: isEnabled };
    } else {
      (currentConfig.config.apps[appName] as App).enabled = isEnabled;
    }

    this.appConfig.set({ ...currentConfig });
  }

  updatePrimitiveField(
    appName: keyof Apps,
    path: string,
    kind: 'string' | 'number',
    value: unknown,
  ) {
    if (kind === 'number') {
      const parsed = Number(value);
      this.updateField(appName, path, Number.isNaN(parsed) ? 0 : parsed);
      return;
    }
    this.updateField(appName, path, String(value ?? ''));
  }

  updateStringField(appName: keyof Apps, path: string, value: string) {
    this.updateField(appName, path, value);
  }

  updateBooleanField(appName: keyof Apps, path: string, value: boolean) {
    this.updateField(appName, path, value);
  }

  updateBannerTextColor(value: string) {
    this.updateField('banner', 'textColor', value);
    document.documentElement.style.setProperty('--app-background-text-color', value);
  }

  asColor(value: unknown): string {
    return typeof value === 'string' && value.trim() ? value : '#ffffff';
  }

  asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  isAggregationPath(path: string): boolean {
    return path.endsWith('aggregations');
  }

  isHomeAggregationPath(appName: keyof Apps, path: string): boolean {
    return appName === 'home' && this.isAggregationPath(path);
  }

  getAggregationPresetOptions(appName: keyof Apps, path: string): AggregationPresetOptionGroup[] {
    const baseGroups = this.isHomeAggregationPath(appName, path)
      ? this.wellKnownHomeAggregationGroups
      : this.wellKnownAggregationGroups;

    return [
      {
        label: 'Quick Add',
        items: [{ key: this.defaultTermAggregationPresetKey, label: 'Default term aggregation' }],
      },
      ...baseGroups.map((group) => ({
        label: group.label,
        items: group.presets.map((preset) => ({
          key: preset.key,
          label: preset.label,
          aggregation: preset.aggregation,
        })),
      })),
    ];
  }

  getAggregationPickerValue(appName: keyof Apps, path: string): string {
    const key = this.getAggregationPickerPathKey(appName, path);
    return (
      this.aggregationPickerByPath()[key] ||
      this.getAggregationPresetOptions(appName, path)[0]?.items[0]?.key ||
      ''
    );
  }

  setAggregationPickerValue(appName: keyof Apps, path: string, selectedKey: string) {
    const key = this.getAggregationPickerPathKey(appName, path);
    this.aggregationPickerByPath.update((state) => ({
      ...state,
      [key]: selectedKey,
    }));
  }

  addWellKnownAggregation(appName: keyof Apps, path: string) {
    const selectedKey = this.getAggregationPickerValue(appName, path);

    if (selectedKey === this.defaultTermAggregationPresetKey) {
      this.addEmptyAggregation(appName, path);
      return;
    }

    const selected = this.getAggregationPresetOptions(appName, path)
      .flatMap((group) => group.items)
      .find((item) => item.key === selectedKey);
    if (!selected) {
      return;
    }

    if (!selected.aggregation) {
      return;
    }

    const currentValue = this.getFieldValue(appName, path);
    const currentArray = Array.isArray(currentValue) ? [...currentValue] : [];
    currentArray.push(this.cloneAggregationItem(selected.aggregation));
    this.updateField(appName, path, currentArray);
  }

  addEmptyAggregation(appName: keyof Apps, path: string) {
    const currentValue = this.getFieldValue(appName, path);
    const currentArray = Array.isArray(currentValue) ? [...currentValue] : [];
    currentArray.push(this.createDefaultTermAggregation());
    this.updateField(appName, path, currentArray);
  }

  updateAggregationItem(appName: keyof Apps, path: string, index: number, jsonValue: string) {
    try {
      const parsed = JSON.parse(jsonValue) as AggregationItem;
      this.updateArrayEntry(appName, path, index, parsed);
    } catch {
      // Keep current value while JSON is invalid.
    }
  }

  moveAggregationItem(appName: keyof Apps, path: string, index: number, offset: -1 | 1) {
    const currentValue = this.getFieldValue(appName, path);
    if (!Array.isArray(currentValue)) {
      return;
    }

    const targetIndex = index + offset;
    if (targetIndex < 0 || targetIndex >= currentValue.length) {
      return;
    }

    const nextArray = [...currentValue];
    const [movedItem] = nextArray.splice(index, 1);
    nextArray.splice(targetIndex, 0, movedItem);
    this.updateField(appName, path, nextArray);
  }

  updateAggregationItemByRef(appName: keyof Apps, path: string, item: unknown, jsonValue: string) {
    this.setAggregationJsonValue(appName, path, item, jsonValue);
    const index = this.getAggregationItemIndex(appName, path, item);
    if (index < 0) {
      return;
    }
    this.updateAggregationItem(appName, path, index, jsonValue);
  }

  removeAggregationItem(appName: keyof Apps, path: string, item: unknown) {
    const index = this.getAggregationItemIndex(appName, path, item);
    if (index < 0) {
      return;
    }
    this.removeArrayEntry(appName, path, index);
  }

  persistAggregationOrder(appName: keyof Apps, path: string, reorderedValues: unknown[]) {
    if (!Array.isArray(reorderedValues)) {
      return;
    }
    this.updateField(appName, path, [...reorderedValues]);
  }

  persistArrayOrder(appName: keyof Apps, path: string, reorderedValues: unknown[]) {
    if (!Array.isArray(reorderedValues)) {
      return;
    }
    this.updateField(appName, path, [...reorderedValues]);
  }

  trackByAggregationItem = (index: number, item: unknown): string => {
    if (item && typeof item === 'object') {
      return this.getAggregationItemIdentity(item);
    }

    return `agg-primitive-${index}-${String(item)}`;
  };

  addArrayEntry(
    appName: keyof Apps,
    path: string,
    kind: 'array' | 'select-array',
    itemKind: ArrayItemKind | undefined,
    options: readonly string[],
  ) {
    const currentValue = this.getFieldValue(appName, path);
    const currentArray = Array.isArray(currentValue) ? [...currentValue] : [];

    if (kind === 'select-array') {
      currentArray.push(options[0] ?? '');
    } else if (itemKind === 'number') {
      currentArray.push(0);
    } else if (itemKind === 'boolean') {
      currentArray.push(false);
    } else {
      currentArray.push('');
    }

    this.updateField(appName, path, currentArray);
  }

  removeArrayEntry(appName: keyof Apps, path: string, index: number) {
    const currentValue = this.getFieldValue(appName, path);
    if (!Array.isArray(currentValue)) {
      return;
    }
    const nextArray = [...currentValue];
    nextArray.splice(index, 1);
    this.updateField(appName, path, nextArray);
  }

  updateArrayEntry(appName: keyof Apps, path: string, index: number, value: unknown) {
    const currentValue = this.getFieldValue(appName, path);
    if (!Array.isArray(currentValue)) {
      return;
    }
    const nextArray = [...currentValue];
    nextArray[index] = value;
    this.updateField(appName, path, nextArray);
  }

  updateArrayPrimitiveEntry(
    appName: keyof Apps,
    path: string,
    index: number,
    itemKind: ArrayItemKind | undefined,
    value: unknown,
  ) {
    if (itemKind === 'number') {
      const parsed = Number(value);
      this.updateArrayEntry(appName, path, index, Number.isNaN(parsed) ? 0 : parsed);
      return;
    }
    if (itemKind === 'boolean') {
      this.updateArrayEntry(appName, path, index, Boolean(value));
      return;
    }
    this.updateArrayEntry(appName, path, index, String(value ?? ''));
  }

  toJson(value: unknown): string {
    return JSON.stringify(value ?? {}, null, 2);
  }

  getAggregationJsonValue(appName: keyof Apps, path: string, item: unknown): string {
    const key = this.getAggregationJsonDraftKey(appName, path, item);
    return this.aggregationJsonDraftByItem()[key] || this.toJson(item);
  }

  updateJsonField(appName: keyof Apps, path: string, jsonValue: string) {
    try {
      const parsed = JSON.parse(jsonValue);
      this.updateField(appName, path, parsed);
    } catch {
      // Keep current value while JSON is invalid.
    }
  }

  private getFieldValue(appName: keyof Apps, path: string): unknown {
    return this.state.getFieldValue(appName, path);
  }

  private updateField(appName: keyof Apps, path: string, value: unknown) {
    this.state.updateField(appName, path, value);
  }

  private getAggregationPickerPathKey(appName: keyof Apps, path: string): string {
    return `${appName}.${path}`;
  }

  private getAggregationJsonDraftKey(appName: keyof Apps, path: string, item: unknown): string {
    return `${this.getAggregationPickerPathKey(appName, path)}.${this.getAggregationItemIdentity(item)}`;
  }

  private getAggregationItemIdentity(item: unknown): string {
    if (item && typeof item === 'object') {
      const objectItem = item as object;
      const existing = this.aggregationTrackKeys.get(objectItem);
      if (existing) {
        return existing;
      }

      const createdKey = `agg-${++this.aggregationTrackCounter}`;
      this.aggregationTrackKeys.set(objectItem, createdKey);
      return createdKey;
    }

    return `agg-primitive-${String(item)}`;
  }

  private setAggregationJsonValue(
    appName: keyof Apps,
    path: string,
    item: unknown,
    jsonValue: string,
  ) {
    const key = this.getAggregationJsonDraftKey(appName, path, item);
    this.aggregationJsonDraftByItem.update((state) => ({
      ...state,
      [key]: jsonValue,
    }));
  }

  private getAggregationItemIndex(appName: keyof Apps, path: string, item: unknown): number {
    const currentValue = this.getFieldValue(appName, path);
    if (!Array.isArray(currentValue)) {
      return -1;
    }
    return currentValue.indexOf(item);
  }

  private cloneAggregationItem(item: AggregationItem): AggregationItem {
    if (typeof structuredClone === 'function') {
      return structuredClone(item);
    }
    return JSON.parse(JSON.stringify(item)) as AggregationItem;
  }

  private createDefaultTermAggregation(): AggregationItem {
    return {
      newAggregation: {
        terms: {
          field: 'fieldName.keyword',
          size: 10,
        },
        meta: {
          collapsed: false,
        },
      },
    };
  }

  updateRawConfig(event: string) {
    this.state.updateRawConfig(event);
  }
}
