import { Component, computed, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidPlus } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { BadgeModule } from 'primeng/badge';
import { ButtonDirective, ButtonSeverity } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { RecordActionService } from '../record-action.service';

/**
 * Button that links to the GeoNetwork editor to create a new record.
 * It fetches the number of available templates and shows it as a badge.
 * The button is disabled when no templates are available.
 *
 * Can be used as a standalone button or as a menu item trigger.
 */
@Component({
  selector: 'app-record-add-button',
  imports: [NgIcon, TranslatePipe, BadgeModule, ButtonDirective, TooltipModule],
  viewProviders: [provideIcons({ faSolidPlus })],
  template: `
    <span
      [pTooltip]="
        hasTemplates()
          ? ('record.action.addRecord.xTemplateAvailable' | translate: { count: templateCount() })
          : ('record.action.addRecord.noTemplates' | translate)
      "
      tooltipPosition="bottom"
    >
      <a
        pButton
        [href]="addRecordUrl()"
        (click)="!hasTemplates() ? $event.preventDefault() : null"
        [class.p-disabled]="!hasTemplates()"
        [target]="target()"
        [severity]="severity()"
      >
        <ng-icon name="faSolidPlus" pButtonIcon />
        <span pButtonLabel>{{ 'record.action.addRecord.label' | translate }}</span>
      </a>
    </span>
  `,
})
export class RecordAddButton {
  target = input<string>('_blank');
  severity = input<ButtonSeverity>('primary');

  private readonly recordActionService = inject(RecordActionService);

  templateCount = this.recordActionService.templateCount;
  hasTemplates = this.recordActionService.hasTemplates;

  addRecordUrl = computed(() => this.recordActionService.getCreateRecordUrl());

  ngOnInit() {
    this.recordActionService.refreshTemplateCount();
  }
}
