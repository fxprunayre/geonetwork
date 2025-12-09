import {
  AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  QueryList,
  signal,
  TemplateRef,
  ViewChildren,
} from '@angular/core';
import { AsyncPipe, JsonPipe, NgTemplateOutlet, ViewportScroller } from '@angular/common';
import { IndexRecord, RelatedItemType } from 'gn-api-client';
import { SearchService } from '../../search/search.service';
import { faImage } from '@ng-icons/font-awesome/regular';
import {
  faSolidCircleExclamation,
  faSolidDatabase,
  faSolidDownload,
  faSolidShareNodes,
} from '@ng-icons/font-awesome/solid';
import { provideIcons } from '@ng-icons/core';
import { MarkdownPipe } from 'ngx-markdown';
import { ShowMoreToggle } from '../../../shared/widgets/show-more-toggle/show-more-toggle';
import { RecordField } from '../record-field/record-field';
import { RecordFieldContact } from '../record-field-contact/record-field-contact';
import { RecordFieldCredit } from '../record-field-credit/record-field-credit';
import { TranslatePipe } from '@ngx-translate/core';
import { RecordDistributionPanel } from '../distributions/record-distribution-panel/record-distribution-panel';
import { RecordViewHeader } from '../record-view-header/record-view-header';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { FeedbackPanel } from '../../feedbacks/feedback-panel/feedback-panel';
import { RecordFieldVocabulary } from '../record-field-vocabulary/record-field-vocabulary';
import { RecordFieldType } from '../record-field-type/record-field-type';
import { Chip } from 'primeng/chip';
import { DataModelPanel } from '../datamodel/data-model-panel/data-model-panel';
import { ActivatedRoute } from '@angular/router';
import { filter, first } from 'rxjs';
import { RecordFieldDates } from '../record-field-dates/record-field-dates';
import { AssociatedPanel } from '../associated/associated-panel/associated-panel';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { Card } from 'primeng/card';
import { CitationComponent } from '../citation-component/citation.component';
import { ExplorePanel } from '../../data/explore-panel/explore-panel';
import { ScrollSpy } from '../../../shared/widgets/scroll-spy/scroll-spy';
import { RecordHarvesterLogo } from '../record-harvester-logo/record-harvester-logo';
import { RecordFieldConstraints } from '../record-field-constraints/record-field-constraints';
import { RecordFieldCodelist } from '../record-field-codelist/record-field-codelist';
import { RecordFieldCoverageSpatial } from '../record-field-coverage-spatial/record-field-coverage-spatial';
import { RecordFieldCoverageTemporal } from '../record-field-coverage-temporal/record-field-coverage-temporal';
import { RecordFieldCoverageVertical } from '../record-field-coverage-vertical/record-field-coverage-vertical';

export const DEFAULT_TAB = 'about';

@Component({
  selector: 'app-record-view',
  templateUrl: './record-view.component.html',
  standalone: true,
  imports: [
    AccordionModule,
    MarkdownPipe,
    ShowMoreToggle,
    RecordField,
    RecordFieldContact,
    RecordFieldCredit,
    RecordFieldConstraints,
    RecordDistributionPanel,
    RecordViewHeader,
    TranslatePipe,
    Tabs,
    Tab,
    TabPanels,
    TabPanel,
    TabList,
    FeedbackPanel,
    RecordFieldVocabulary,
    RecordFieldType,
    Chip,
    AssociatedPanel,
    DataModelPanel,
    RecordFieldDates,
    FormsModule,
    NgTemplateOutlet,
    AsyncPipe,
    Card,
    CitationComponent,
    ExplorePanel,
    ScrollSpy,
    RecordHarvesterLogo,
    RecordFieldCodelist,
    RecordFieldCoverageSpatial,
    RecordFieldCoverageTemporal,
    RecordFieldCoverageVertical,
  ],
  viewProviders: [
    provideIcons({
      faImage,
      faSolidDownload,
      faSolidShareNodes,
      faSolidCircleExclamation,
      faSolidDatabase,
    }),
  ],
})
export class RecordViewComponent implements AfterViewInit {
  uuid = input<string | null>();
  tab = input<string>(DEFAULT_TAB);
  layout = input<'fieldset' | 'panel' | ''>('');
  backButtonTplRef = input<TemplateRef<unknown>>();

  record = signal<IndexRecord | undefined>(undefined);
  recordStatus = signal<string | undefined>(undefined);
  mainVocabularies = signal(['th_sextant-theme']);

  onRecordClick = output<string>();

  searchService = inject(SearchService);
  scroller = inject(ViewportScroller);
  route = inject(ActivatedRoute);

  constructor() {
    effect(() => {
      const uuid = this.uuid();
      if (!uuid) {
        this.record.set(undefined);
        return;
      }
      this.searchService
        .getById(uuid, [
          RelatedItemType.Parent,
          RelatedItemType.Children,
          RelatedItemType.Services,
          RelatedItemType.Sources,
          RelatedItemType.Hassources,
          RelatedItemType.BrothersAndSisters,
          RelatedItemType.Datasets,
          RelatedItemType.Siblings,
          RelatedItemType.Fcats,
          RelatedItemType.Hasfeaturecats,
          RelatedItemType.Associated,
        ])
        .subscribe({
          next: (result) => this.record.set(result ?? undefined),
          error: () => this.recordStatus.set('not-found-or-not-shared-with-you'),
        });
    });
  }

  getSectionIds(sections: any[]): string[] {
    return sections.map((s) => s.label);
  }

  hasDataModel(): boolean {
    const record = this.record();
    return record?.featureTypes !== undefined && record?.featureTypes.length > 0;
  }

  handleRecordClick(uuid: string) {
    this.onRecordClick.emit(uuid);
  }

  ngAfterViewInit(): void {
    this.route.fragment.pipe(filter(Boolean)).subscribe((fragment) => {
      setTimeout(() => this.scroller.scrollToAnchor(fragment), 100);
    });
  }

  getLineage(): string {
    return (this.record()?.lineageObject as any)?.['default'] ?? '';
  }

  protected readonly RelatedItemType = RelatedItemType;
}
