import { Component, computed, inject, OnInit, signal, ViewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidGripVertical } from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Source, SourcesService } from 'gn4-api-client';
import { MenuItem, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { ConfigService } from '../config/config-service';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { TranslationsService } from '../i18n/translations-service';
import { DEFAULT_SPACE } from './config/space-config';

@Component({
  selector: 'app-space-selector',
  imports: [Popover, TranslatePipe, Button, NgIcon],
  viewProviders: [provideIcons({ faSolidGripVertical })],
  template: `
    @if (spaceList().length > 0) {
      <p-button
        #spaceSelectorButton
        title="{{ 'Select Space' | translate }}"
        icon="faSolidFile"
        (click)="popover?.toggle($event)"
      >
        <ng-icon name="faSolidGripVertical" pButtonIcon></ng-icon>
      </p-button>
      <p-popover #popover appendTo="body">
        <div
          [class]="
            useTwoColumns()
              ? 'grid grid-cols-1 md:grid-cols-4 gap-1 md:gap-x-2 min-w-48 max-w-[80vh] max-h-[80vh] overflow-y-auto'
              : 'grid grid-cols-1 gap-1 min-w-48 max-w-md max-h-[80vh] overflow-y-auto'
          "
        >
          @for (item of spaceList(); track item.label) {
            <p-button
              [severity]="item.id === DEFAULT_SPACE ? 'primary' : 'secondary'"
              [disabled]="item.id === currentSpace()"
              [fluid]="true"
              (click)="selectSpace(item)"
              [styleClass]="'flex flex-col'"
            >
              @if (item.icon) {
                <img
                  [src]="apiBase() + '/images/harvesting/' + item.icon"
                  [alt]="item.label || ''"
                  class="m-w-full h-20 object-contain my-4"
                />
              }
              {{ item.label }}
            </p-button>
          }
        </div>
      </p-popover>
    }
  `,
})
export class SpaceSelector implements OnInit {
  readonly DEFAULT_SPACE = DEFAULT_SPACE;
  @ViewChild('popover') popover: Popover | undefined;

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  apiBase = computed(() => this.appConfiguration().catalogueUrl);

  space = signal(DEFAULT_SPACE);
  currentSpace = computed(() => this.appConfiguration().space || DEFAULT_SPACE);

  spaces: Source[] = [
    {
      name: DEFAULT_SPACE,
    },
  ];

  spaceList = signal<MenuItem[]>([]);

  configService = inject(ConfigService);
  messageService = inject(MessageService);
  sourceService = inject(SourcesService);
  translateService = inject(TranslateService);
  translationsService = inject(TranslationsService);

  currentLang = signal(
    this.translationsService.getIso3Code(this.translateService.getCurrentLang()),
    { equal: () => false },
  );
  useTwoColumns = computed(() => this.spaceList().length > 10);

  ngOnInit(): void {
    this.sourceService.getSources(undefined, 'subportal').subscribe((sources) => {
      if (sources.length > 0) {
        this.spaces.push(...sources);
        this.spaceList.set(
          this.spaces.map((space) => ({
            id: space.name,
            label: this.getSpaceLabel(space),
            icon: space.logo,
            command: () => {
              this.configService.updateConfiguration(undefined, space.name);
            },
          })),
        );
      }
    });
  }

  getSpaceLabel(space: Source | undefined): string {
    if (space) {
      if (space.name === DEFAULT_SPACE) {
        return this.translateService.instant('space.main');
      }
      return (space.label && space.label[this.currentLang()]) || space.name || '';
    }
    return '';
  }

  selectSpace(item: MenuItem): void {
    item.command?.({} as Parameters<NonNullable<MenuItem['command']>>[0]);
    this.popover?.hide();
  }
}
