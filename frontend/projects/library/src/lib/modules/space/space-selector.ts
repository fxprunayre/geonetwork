import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidGripVertical } from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Source, SourcesService } from 'gn4-api-client';
import { MenuItem, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { TieredMenu } from 'primeng/tieredmenu';
import { ConfigService } from '../config/config-service';

@Component({
  selector: 'app-space-selector',
  imports: [TieredMenu, TranslatePipe, Button, NgIcon],
  viewProviders: [provideIcons({ faSolidGripVertical })],
  template: `
    @if (spaceList().length > 0) {
      <p-button
        title="{{ 'Select Space' | translate }}"
        icon="faSolidFile"
        (click)="menu?.toggle($event)"
      >
        <ng-icon name="faSolidGripVertical" pButtonIcon></ng-icon>
      </p-button>
      <p-tieredmenu #menu [model]="spaceList()" [popup]="true" appendTo="body"></p-tieredmenu>
    }
  `,
})
export class SpaceSelector implements OnInit {
  @ViewChild('menu') menu: TieredMenu | undefined;

  space = signal('srv');
  spaces: Source[] = [];
  spaceList = signal<MenuItem[]>([]);

  configService = inject(ConfigService);
  messageService = inject(MessageService);
  sourceService = inject(SourcesService);
  translateService = inject(TranslateService);

  currentLang = signal(this.translateService.getCurrentLang(), { equal: () => false });

  ngOnInit(): void {
    this.sourceService.getSources(undefined, 'subportal').subscribe((sources) => {
      if (sources.length > 0) {
        this.spaces.push(...sources);
        this.spaceList.set(
          this.spaces.map((space) => ({
            label: this.getSpaceLabel(space),
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
      return (space.label && space.label[this.currentLang()]) || space.name || '';
    }
    return '';
  }
}
