import { NgClass, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { faCompass } from '@ng-icons/font-awesome/regular';
import {
  faSolidCode,
  faSolidCube,
  faSolidFile,
  faSolidGear,
  faSolidHouse,
  faSolidLanguage,
  faSolidLock,
  faSolidMagnifyingGlass,
  faSolidMap,
  faSolidPaintRoller,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { IftaLabelModule } from 'primeng/iftalabel';
import { Menu } from 'primeng/menu';
import { Panel } from 'primeng/panel';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CopyInput } from '../../../shared/widgets/copy-input/copy-input';
import { ThemeDesigner } from '../../../shared/widgets/theme-designer/theme-designer';
import { APPLICATION_CONFIGURATION } from '../config.loader';
import { DEFAULT_THEME } from '../default-theme';
import { App, Apps } from '../model/gnConfig';

@Component({
  selector: 'app-config-editor',
  standalone: true,
  imports: [
    NgClass,
    TitleCasePipe,
    FormsModule,
    ToggleSwitchModule,
    TextareaModule,
    IftaLabelModule,
    CopyInput,
    ThemeDesigner,
    Menu,
    NgIconComponent,
    Panel,
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
              (click)="item.command()"
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
              <div class="text-xl font-bold mb-2">
                {{ appName | titlecase }} {{ 'config.editor.title' | translate }}
              </div>

              <div class="flex items-center gap-2 mb-2">
                <p-toggleswitch
                  [ngModel]="apps[appName]?.enabled"
                  (ngModelChange)="updateAppEnabled(appName, $event)"
                >
                </p-toggleswitch>
                <label>{{ 'config.editor.enabled' | translate }}</label>
              </div>

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
              <div class="text-xl font-bold mb-2">
                {{ 'config.editor.themeConfiguration' | translate }}
              </div>
              <app-theme-designer [theme]="theme()" />
            </div>
          } @else if (selectedTab() === 'raw') {
            <div class="flex flex-col gap-4">
              <div class="text-xl font-bold mb-2">
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
      'home',
      'search',
      'map',
      'record',
      'i18n',
      'authentication',
    ];
    const keys = Object.keys(apps) as Array<keyof Apps>;

    return keys.sort((a, b) => {
      const idxA = predefinedOrder.indexOf(a);
      const idxB = predefinedOrder.indexOf(b);

      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  });

  menuItems = computed<MenuItem[]>(() => {
    const apps = this.appNames();
    const currentTab = this.selectedTab();

    const iconMap: Record<string, string> = {
      home: 'faCompass',
      search: 'faSolidMagnifyingGlass',
      map: 'faSolidMap',
      i18n: 'faSolidLanguage',
      authentication: 'faSolidLock',
      record: 'faSolidFile',
    };

    return [
      {
        label: 'Apps',
        items: apps.map((appName) => ({
          label: appName.charAt(0).toUpperCase() + appName.slice(1),
          icon: iconMap[appName] || 'faSolidGear',
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

  getAppConfigJson(appName: keyof Apps): string {
    const app = this.appConfig().config?.apps?.[appName];
    if (!app) return '{}';
    const { enabled, ...rest } = app as any;
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
      (currentConfig.config.apps as any)[appName] = { enabled: isEnabled } as App;
    } else {
      (currentConfig.config.apps[appName] as App).enabled = isEnabled;
    }

    this.appConfig.set({ ...currentConfig });
  }

  updateAppConfig(appName: keyof Apps, jsonStr: string) {
    try {
      const parsed = JSON.parse(jsonStr);
      const currentConfig = this.appConfig();
      const app = currentConfig.config?.apps?.[appName];
      if (app) {
        const enabled = app.enabled;
        (currentConfig.config!.apps as any)[appName] = { ...parsed, enabled };
        this.appConfig.set({ ...currentConfig });
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }

  updateRawConfig(event: string) {
    try {
      this.appConfig.set(JSON.parse(event));
    } catch (e) {
      // Ignore parse errors while typing
    }
  }
}
