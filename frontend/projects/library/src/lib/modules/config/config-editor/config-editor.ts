import { NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { faCompass } from '@ng-icons/font-awesome/regular';
import {
  faSolidBars,
  faSolidBookmark,
  faSolidCode,
  faSolidCube,
  faSolidFile,
  faSolidGear,
  faSolidHouse,
  faSolidImage,
  faSolidLanguage,
  faSolidLock,
  faSolidMagnifyingGlass,
  faSolidMap,
  faSolidPaintRoller,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { FloatLabel } from 'primeng/floatlabel';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputText } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';
import { Panel } from 'primeng/panel';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ColorPicker } from '../../../shared/widgets/color-picker/color-picker';
import { CopyInput } from '../../../shared/widgets/copy-input/copy-input';
import { ThemeDesigner } from '../../../shared/widgets/theme-designer/theme-designer';
import { APPLICATION_CONFIGURATION } from '../config.loader';
import { DEFAULT_THEME } from '../default-theme';
import { App, Apps, MapApp, MapType } from '../model/gnConfig';

@Component({
  selector: 'app-config-editor',
  standalone: true,
  imports: [
    NgClass,
    FormsModule,
    ToggleSwitchModule,
    TextareaModule,
    IftaLabelModule,
    CopyInput,
    ThemeDesigner,
    Menu,
    NgIconComponent,
    Panel,
    FloatLabel,
    InputText,
    ColorPicker,
    TranslatePipe,
  ],
  viewProviders: [
    provideIcons({
      faSolidCube,
      faSolidPaintRoller,
      faSolidCode,
      faSolidHouse,
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
        <p-menu [model]="menuItems()" styleClass="w-1/4">
          <ng-template #item let-item let-options="options">
            <a
              pRipple
              class="flex items-center py-2 px-3 no-underline cursor-pointer rounded transition-colors text-surface-700 dark:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800"
              [ngClass]="item.styleClass"
              tabindex="0"
              (click)="item.command()"
              (keydown.enter)="item.command()"
              (keydown.space)="item.command(); $event.preventDefault()"
            >
              @if (item.icon) {
                <ng-icon [name]="item.icon" class="mr-2"></ng-icon>
              }
              <span>{{ item.label }}</span>
            </a>
          </ng-template>
        </p-menu>
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

              @if (appName === 'banner') {
                <div class="flex flex-col gap-6 mt-4 mb-4">
                  <p-float-label>
                    <label for="bannerBackground">{{
                      'config.theme.designer.field.apps.banner.background' | translate
                    }}</label>
                    <input
                      type="text"
                      id="bannerBackground"
                      class="w-full"
                      pInputText
                      [ngModel]="apps.banner?.background"
                      (ngModelChange)="updateBannerProperty('background', $event)"
                    />
                  </p-float-label>

                  <p-float-label>
                    <label for="bannerTitle">{{
                      'config.theme.designer.field.apps.banner.title' | translate
                    }}</label>
                    <input
                      type="text"
                      id="bannerTitle"
                      class="w-full"
                      pInputText
                      [ngModel]="apps.banner?.title"
                      (ngModelChange)="updateBannerProperty('title', $event)"
                    />
                  </p-float-label>

                  <p-float-label>
                    <label for="bannerSubTitle">{{
                      'config.theme.designer.field.apps.banner.subTitle' | translate
                    }}</label>
                    <input
                      type="text"
                      id="bannerSubTitle"
                      class="w-full"
                      pInputText
                      [ngModel]="apps.banner?.subTitle"
                      (ngModelChange)="updateBannerProperty('subTitle', $event)"
                    />
                  </p-float-label>

                  <app-color-picker
                    [label]="'config.theme.designer.field.apps.banner.textColor' | translate"
                    [color]="apps.banner?.textColor || '#ffffff'"
                    (colorChange)="updateBannerProperty('textColor', $event)"
                  ></app-color-picker>
                </div>
              }

              @if (appName === 'map') {
                <p-iftalabel>
                  <select
                    [id]="appName + '-map-type'"
                    class="w-full p-inputtext"
                    [ngModel]="apps.map?.type || 'geospatialsdk'"
                    (ngModelChange)="updateMapType($event)"
                  >
                    <option value="geospatialsdk">geospatialsdk</option>
                    <option value="geolibre">geolibre</option>
                  </select>
                  <label [for]="appName + '-map-type'">Map type</label>
                </p-iftalabel>
              }

              <p-iftalabel>
                <textarea
                  pTextarea
                  [id]="appName + '-config'"
                  [ngModel]="getAppConfigJson(appName)"
                  (ngModelChange)="updateAppConfig(appName, $event)"
                  rows="20"
                  style="resize: none; width: 100%; font-family: monospace; font-size: 0.875rem;"
                ></textarea>
                <label [for]="appName + '-config'">{{
                  'config.editor.advancedProperties' | translate
                }}</label>
              </p-iftalabel>
            </div>
          } @else if (selectedTab() === 'theme') {
            <div class="flex flex-col gap-4">
              <div class="text-xl font-bold mb-2 flex items-center">
                <ng-icon name="faSolidPaintRoller" class="mr-2"></ng-icon>
                {{ 'config.editor.themeConfiguration' | translate }}
              </div>
              <app-theme-designer [theme]="theme()" />
            </div>
          } @else if (selectedTab() === 'raw') {
            <div class="flex flex-col gap-4">
              <div class="text-xl font-bold mb-2 flex items-center">
                <ng-icon name="faSolidCode" class="mr-2"></ng-icon>
                {{ 'config.editor.rawConfiguration' | translate }}
              </div>
              <p-iftalabel>
                <textarea
                  pTextarea
                  id="raw-config"
                  [ngModel]="appConfigJson()"
                  (ngModelChange)="updateRawConfig($event)"
                  rows="25"
                  style="resize: none; width: 100%; font-family: monospace; font-size: 0.875rem;"
                ></textarea>
                <label for="raw-config">{{ 'config.editor.fullJson' | translate }}</label>
              </p-iftalabel>

              <div class="text-xl font-bold mt-4">
                {{ 'config.editor.embedApplication' | translate }}
              </div>
              <app-copy-input [value]="embedSnippet()" layout="buttonWithIcon"></app-copy-input>
              <p-panel class="bg-neutral-900! text-neutral-200! w-full overflow-auto">
                <pre class="">{{ embedSnippet() }}</pre>
              </p-panel>
            </div>
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
  appConfig = inject(APPLICATION_CONFIGURATION);
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

  menuItems = computed<MenuItem[]>(() => {
    const apps = this.appNames();
    const currentTab = this.selectedTab();

    return [
      {
        label: 'Apps',
        items: apps.map((appName) => ({
          label: this.getAppDisplayLabel(appName),
          icon: this.iconMap[appName] || 'faSolidGear',
          command: () => this.selectedTab.set(appName),
          styleClass:
            currentTab === appName ? 'bg-primary-100/50 dark:bg-primary-900/50 font-bold' : '',
        })),
      },
      {
        label: 'Settings',
        items: [
          {
            label: 'Theme',
            icon: 'faSolidPaintRoller',
            command: () => this.selectedTab.set('theme'),
            styleClass:
              currentTab === 'theme' ? 'bg-primary-100/50 dark:bg-primary-900/50 font-bold' : '',
          },
          {
            label: 'Raw Configuration',
            icon: 'faSolidCode',
            command: () => this.selectedTab.set('raw'),
            styleClass:
              currentTab === 'raw' ? 'bg-primary-100/50 dark:bg-primary-900/50 font-bold' : '',
          },
        ],
      },
    ];
  });

  appConfigJson = computed(() => JSON.stringify(this.appConfig(), null, 2));
  embedSnippet = computed(() => {
    const escapedConfig = JSON.stringify(this.appConfig()).replace(/"/g, '&quot;');
    const assetBaseUrl = this.getEmbedAssetBaseUrl();
    const catalogueUrl = this.appConfig().catalogueUrl;
    return [
      `<script src="${assetBaseUrl}/main.js" type="module"></script>`,
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

  getAppConfigJson(appName: keyof Apps): string {
    const app = this.appConfig().config?.apps?.[appName];
    if (!app) return '{}';
    const { enabled: _enabled, ...rest } = app as App & Record<string, unknown>;
    return JSON.stringify(rest, null, 2);
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

  updateBannerProperty(property: string, value: string) {
    const config = this.appConfig().config;
    if (config?.apps?.banner) {
      (config.apps.banner as unknown as Record<string, string>)[property] = value;
      this.appConfig.set({ ...this.appConfig(), config });

      if (property === 'textColor') {
        document.documentElement.style.setProperty('--app-background-text-color', value);
      }
    }
  }

  updateMapType(type: MapType) {
    const current = this.appConfig();
    const config = current.config ?? { apps: {} };
    const apps = config.apps ?? {};
    const currentMap = apps.map;

    const nextMap: MapApp = {
      enabled: currentMap?.enabled ?? true,
      type,
      geolibre: currentMap?.geolibre,
      geospatialsdk: currentMap?.geospatialsdk,
    };

    this.appConfig.set({
      ...current,
      config: {
        ...config,
        apps: {
          ...apps,
          map: nextMap,
        },
      },
    });
  }

  updateAppConfig(appName: keyof Apps, jsonStr: string) {
    try {
      const parsed = JSON.parse(jsonStr);
      const currentConfig = this.appConfig();
      const app = currentConfig.config?.apps?.[appName];
      if (app) {
        const enabled = app.enabled;
        (currentConfig.config!.apps as Record<string, App>)[appName] = { ...parsed, enabled };
        this.appConfig.set({ ...currentConfig });
      }
    } catch {
      // Ignore parsing errors
    }
  }

  updateRawConfig(event: string) {
    try {
      this.appConfig.set(JSON.parse(event));
    } catch {
      // Ignore parse errors while typing
    }
  }
}
