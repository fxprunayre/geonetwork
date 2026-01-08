import { AsyncPipe, NgTemplateOutlet, ViewportScroller } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  OnInit,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { faImage } from '@ng-icons/font-awesome/regular';
import {
  faSolidCircleExclamation,
  faSolidDatabase,
  faSolidDownload,
  faSolidShareNodes,
} from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { IndexRecord, RelatedItemType } from 'gn-api-client';
import { MarkdownPipe } from 'ngx-markdown';
import { AccordionModule } from 'primeng/accordion';
import { Chip } from 'primeng/chip';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { filter } from 'rxjs';
import { ScrollSpy } from '../../../shared/widgets/scroll-spy/scroll-spy';
import { ShowMoreToggle } from '../../../shared/widgets/show-more-toggle/show-more-toggle';
import { ExplorePanel } from '../../data/explore-panel/explore-panel';
import { FeedbackPanel } from '../../feedbacks/feedback-panel/feedback-panel';
import { SearchService } from '../../search/search.service';
import { AssociatedPanel } from '../associated/associated-panel/associated-panel';
import { CitationComponent } from '../citation-component/citation.component';
import { DataModelPanel } from '../datamodel/data-model-panel/data-model-panel';
import { RecordDistributionFormat } from '../distributions/record-distribution-format/record-distribution-format';
import { RecordDistributionPanel } from '../distributions/record-distribution-panel/record-distribution-panel';
import { RecordFieldCodelist } from '../record-field-codelist/record-field-codelist';
import { RecordFieldConstraints } from '../record-field-constraints/record-field-constraints';
import { RecordFieldContact } from '../record-field-contact/record-field-contact';
import { RecordFieldCoverageSpatial } from '../record-field-coverage-spatial/record-field-coverage-spatial';
import { RecordFieldCoverageTemporal } from '../record-field-coverage-temporal/record-field-coverage-temporal';
import { RecordFieldCoverageVertical } from '../record-field-coverage-vertical/record-field-coverage-vertical';
import { RecordFieldCredit } from '../record-field-credit/record-field-credit';
import { RecordFieldDates } from '../record-field-dates/record-field-dates';
import { RecordFieldType } from '../record-field-type/record-field-type';
import { RecordFieldVocabulary } from '../record-field-vocabulary/record-field-vocabulary';
import { RecordField } from '../record-field/record-field';
import { RecordHarvesterLogo } from '../record-harvester-logo/record-harvester-logo';
import { RecordViewHeader } from '../record-view-header/record-view-header';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { RECORD_ROUTE_PATH } from 'gn-library';

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
    CitationComponent,
    ExplorePanel,
    ScrollSpy,
    RecordHarvesterLogo,
    RecordFieldCodelist,
    RecordFieldCoverageSpatial,
    RecordFieldCoverageTemporal,
    RecordFieldCoverageVertical,
    RecordDistributionFormat,
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

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  el = inject(ElementRef);
  router = inject(Router);

  mainVocabularies = computed(
    () => this.appConfiguration().config?.apps.record?.mainThesaurus || [],
  );

  contactRoles = computed(() => {
    const contacts = this.record()?.['contactForResource'] || [];
    const roles = new Set(contacts.map((c: any) => c.role).filter((r: any) => !!r));
    return Array.from(roles);
  });

  expandedSections = computed(() => {
    const staticSections = [
      'about',
      'dates',
      'usageAndAccess',
      'dataModel',
      'coverage',
      'spatialInfo',
      'lineage',
      'classification',
    ];
    const contactSections = this.contactRoles().map((role: any) => 'contact-' + role);
    return [...staticSections, ...contactSections];
  });

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

  handleRecordClick(uuid: string) {
    this.onRecordClick.emit(uuid);
  }

  ngAfterViewInit(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (event.urlAfterRedirects.includes(RECORD_ROUTE_PATH)) {
          this.handleScrollOnNavigation();
        }
      });
  }

  private handleScrollOnNavigation() {
    if (this.el.nativeElement.isConnected) {
      setTimeout(
        () => this.el.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        100,
      );
    }
  }

  getLineage(): string {
    return (this.record()?.lineageObject as any)?.['default'] ?? '';
  }

  protected readonly RelatedItemType = RelatedItemType;
}
