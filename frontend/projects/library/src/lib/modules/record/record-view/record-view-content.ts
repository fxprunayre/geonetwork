import { AsyncPipe, NgTemplateOutlet, ViewportScroller } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
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
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { ExplorePanel } from '../../data/explore-panel/explore-panel';
import { FeedbackPanel } from '../../feedbacks/feedback-panel/feedback-panel';
import { AssociatedPanel } from '../../record-associations/associated-panel/associated-panel';
import { RecordDistributionFormat } from '../../record-distributions/record-distribution-format/record-distribution-format';
import { RecordDistributionPanel } from '../../record-distributions/record-distribution-panel/record-distribution-panel';
import { RECORD_ROUTE_PATH } from '../../search/search-constant';
import { DataModelPanel } from '../datamodel/data-model-panel/data-model-panel';
import { RecordCitation } from '../record-citation/record-citation';
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
import { RecordViewTitle } from '../record-view-title/record-view-title';

export const DEFAULT_TAB = 'about';
export const VALID_TABS = [
  'about',
  'data-access',
  'explore',
  'associated-resources',
  'citation',
  'discussions',
];

@Component({
  selector: 'app-record-view-content',
  templateUrl: './record-view-content.html',
  standalone: true,
  imports: [
    AccordionModule,
    AssociatedPanel,
    AsyncPipe,
    Chip,
    DataModelPanel,
    ExplorePanel,
    FeedbackPanel,
    FormsModule,
    MarkdownPipe,
    NgTemplateOutlet,
    RecordCitation,
    RecordDistributionFormat,
    RecordDistributionPanel,
    RecordField,
    RecordFieldCodelist,
    RecordFieldConstraints,
    RecordFieldContact,
    RecordFieldCoverageSpatial,
    RecordFieldCoverageTemporal,
    RecordFieldCoverageVertical,
    RecordFieldCredit,
    RecordFieldDates,
    RecordFieldType,
    RecordFieldVocabulary,
    RecordHarvesterLogo,
    RecordViewHeader,
    RecordViewTitle,
    ScrollSpy,
    ShowMoreToggle,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    TranslatePipe,
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
export class RecordViewContent implements AfterViewInit {
  record = input<IndexRecord | undefined>();
  tab = input<string>(DEFAULT_TAB);
  layout = input<'fieldset' | 'panel' | ''>('');
  backButtonTplRef = input<TemplateRef<unknown>>();
  headerTplRef = input<TemplateRef<unknown>>();

  scroller = inject(ViewportScroller);
  route = inject(ActivatedRoute);

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  el = inject(ElementRef);
  router = inject(Router);

  mainVocabularies = computed(
    () => this.appConfiguration().config?.apps.record?.mainThesaurus || [],
  );

  mapLayerDisplayTarget = computed(
    () => this.appConfiguration().config?.apps?.record?.mapLayerDisplayTarget || 'main-map-tab',
  );

  hasWmsLink = computed(() => {
    const links = this.record()?.link || [];
    return links.some((link) => !!link?.protocol?.match('OGC:WMS|application/vnd.ogc.wms_xml'));
  });

  showExploreTab = computed(
    () =>
      !!this.record()?.info?.hasDatasource ||
      (this.mapLayerDisplayTarget() === 'explore-embedded-map' && this.hasWmsLink()),
  );

  contactRoles = computed(() => {
    const contacts = this.record()?.['contactForResource'] || [];
    const roles = new Set(contacts.map((c: any) => c.role).filter((r: any) => !!r));
    return Array.from(roles);
  });

  excludedTypesForAssociatedTab: RelatedItemType[] = [
    RelatedItemType.Sources,
    RelatedItemType.Hassources,
  ];

  recordHasAssociatedRecords = computed(() => {
    const record = this.record();
    if (!record) {
      return false;
    }
    const related = record.related;
    if (!related) {
      return false;
    }

    const nonExcludedTypes = Object.keys(related)
      .filter((type) => related[type].length > 0)
      .filter((type) => !this.excludedTypesForAssociatedTab.includes(type as RelatedItemType));
    return nonExcludedTypes.length > 0;
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

  onTabChange(tab: string | number | undefined) {
    if (!!tab && this.tab() === tab) return;

    if (this.record()?.uuid) {
      if (this.tab() === 'explore' && tab !== 'explore') {
        this.router.navigate([RECORD_ROUTE_PATH, this.record()!.uuid, tab], {
          queryParams: { datasource: null },
          queryParamsHandling: 'merge',
        });
      } else {
        this.router.navigate([RECORD_ROUTE_PATH, this.record()!.uuid, tab], {
          queryParamsHandling: 'preserve',
        });
      }
    }
  }

  protected readonly RelatedItemType = RelatedItemType;
}
