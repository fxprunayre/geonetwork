import { Component, computed, input, output, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidCodeBranch } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { IndexRecord } from 'gn-api-client';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { Popover } from 'primeng/popover';
import { ResultItemList } from '../../search-results/result-item-list/result-item-list';
import { RECORD_SLUG } from '../../search/search-constant';

@Component({
  selector: 'app-record-versions',
  templateUrl: './record-versions.html',
  standalone: true,
  imports: [NgIcon, OverlayBadgeModule, Popover, ResultItemList, RouterLink, TranslatePipe],
  viewProviders: [
    provideIcons({
      faSolidCodeBranch,
    }),
  ],
})
export class RecordVersions {
  protected readonly RECORD_ROUTE_PATH = RECORD_SLUG;

  record = input.required<IndexRecord>();
  onRecordClick = output<string>();

  @ViewChild('popover') popover: Popover | undefined;

  versions = computed<IndexRecord[]>(
    () => (this.record().related?.['versions'] as IndexRecord[]) || [],
  );

  isLatest = computed(() => {
    const versions = this.versions();
    if (versions.length === 0) return true;
    return versions[0]?.uuid === this.record().uuid;
  });

  latestVersion = computed<IndexRecord | null>(() => {
    const versions = this.versions();
    return versions.length > 0 ? versions[0] : null;
  });

  hasVersions = computed(() => this.versions().length > 0);

  togglePopover(event: MouseEvent) {
    this.popover?.toggle(event);
  }

  handleRecordClick(uuid: string) {
    this.popover?.hide();
    this.onRecordClick.emit(uuid);
  }
}
