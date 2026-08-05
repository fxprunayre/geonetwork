import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  TemplateRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { ScrollSpy } from '../../../shared/widgets/scroll-spy/scroll-spy';
import { ShowMoreToggle } from '../../../shared/widgets/show-more-toggle/show-more-toggle';
import { selectRecordAppConfiguration } from '../../config/app-config.selectors';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { ExplorePanel } from '../../data/explore-panel/explore-panel';
import { FeedbackPanel } from '../../feedbacks/feedback-panel/feedback-panel';
import { AssociatedPanel } from '../../record-associations/associated-panel/associated-panel';
import { RecordDistributionFormat } from '../../record-distributions/record-distribution-format/record-distribution-format';
import { RecordDistributionPanel } from '../../record-distributions/record-distribution-panel/record-distribution-panel';
import { RECORD_ROUTE_PATH } from '../../search/search-constant';
import {
  MAP_LAYER_DISPLAY_TARGET_EXPLORE_EMBEDDED_MAP,
  MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB,
} from '../config/record-config';
import { DataModelPanel } from '../datamodel/data-model-panel/data-model-panel';
import {
  RecordCitation,
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
} from '../field-components';
import { RecordViewHeader, RecordViewTitle } from '../view-components';

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
export class RecordViewContent {
  record = input<IndexRecord | undefined>();
  tab = input<string>(DEFAULT_TAB);
  layout = input<'fieldset' | 'panel' | ''>('');
  backButtonTplRef = input<TemplateRef<unknown>>();
  headerTplRef = input<TemplateRef<unknown>>();

  appConfiguration = inject(APPLICATION_CONFIGURATION);
  router = inject(Router);
  route = inject(ActivatedRoute);
  hostElement = inject<ElementRef<HTMLElement>>(ElementRef);

  private pendingScrollTarget = signal<string | undefined>(undefined);

  private recordConfig = computed(() => selectRecordAppConfiguration(this.appConfiguration()));

  mainVocabularies = computed(() => this.recordConfig().mainThesaurus || []);

  mapLayerDisplayTarget = computed(
    () => this.recordConfig().mapLayerDisplayTarget || MAP_LAYER_DISPLAY_TARGET_MAIN_MAP_TAB,
  );

  hasWmsLink = computed(() => {
    const links = this.record()?.link || [];
    return links.some(
      (link) => !!link?.protocol?.match('OGC:WMS|OGC:WMTS|application/vnd.ogc.wms_xml'),
    );
  });

  hasDatavizLink = computed(() => {
    const links = this.record()?.link || [];
    return links.some(
      (link) =>
        link?.protocol === 'WWW:LINK:JUPYTER-NOTEBOOK' || link?.protocol === 'WWW:LINK:DATAVIZ',
    );
  });

  showExploreTab = computed(
    () =>
      !!this.record()?.info?.hasDatasource ||
      (this.mapLayerDisplayTarget() === MAP_LAYER_DISPLAY_TARGET_EXPLORE_EMBEDDED_MAP &&
        this.hasWmsLink()) ||
      this.hasDatavizLink() ||
      !!this.record()?.info?.hasDataModel,
  );

  showDiscussionTab = computed(() => this.recordConfig().showDiscussionTab ?? true);

  dataAccessSectionLabelKey = computed(() => {
    const resourceTypes = this.record()?.resourceType || [];
    const normalizedTypes = resourceTypes.map((type) => (type || '').toLowerCase());

    if (normalizedTypes.includes('software') || normalizedTypes.includes('application')) {
      return 'record.view.section.softwareAccess';
    }

    if (normalizedTypes.includes('service')) {
      return 'record.view.section.serviceAccess';
    }

    if (normalizedTypes.includes('dataset')) {
      return 'record.view.section.datasetAccess';
    }

    return 'record.view.section.distributions';
  });

  contactRoles = computed(() => {
    const contacts = (this.record()?.['contactForResource'] || []) as Array<{ role: string }>;
    const roles = new Set<string>(contacts.map((c) => c.role).filter((r): r is string => !!r));
    return Array.from(roles);
  });

  excludedTypesForAssociatedTab: RelatedItemType[] = [];

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

  private hasContent(value: unknown): boolean {
    if (value == null) {
      return false;
    }
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    if (Array.isArray(value)) {
      return value.some((entry) => this.hasContent(entry));
    }
    if (typeof value === 'object') {
      return Object.values(value as Record<string, unknown>).some((entry) =>
        this.hasContent(entry),
      );
    }
    return true;
  }

  private hasRelatedItems(type: RelatedItemType): boolean {
    const related = this.record()?.related;
    if (!related) {
      return false;
    }
    return (related[type as keyof typeof related]?.length || 0) > 0;
  }

  aboutSectionVisibility = computed(() => {
    const record = this.record();
    if (!record) {
      return {
        about: false,
        lineage: false,
        dates: false,
        coverage: false,
        spatialInfo: false,
        dataModel: false,
        usageAndAccess: false,
        classification: false,
      };
    }

    const recordAny = record as Record<string, unknown>;
    const hasAbout = this.hasContent([
      recordAny['resourceCreditObject'],
      recordAny['lineageObject'],
    ]);

    // const hasLineage =
    //   this.hasContent(this.getLineage()) ||
    //   this.hasRelatedItems(RelatedItemType.Sources) ||
    //   this.hasRelatedItems(RelatedItemType.Hassources);

    const hasDates = this.hasContent([
      recordAny['resourceDate'],
      recordAny['resourceTemporalExtentDetails'],
    ]);

    const hasCoverage = this.hasContent([
      recordAny['shape'],
      recordAny['geom'],
      recordAny['extentDescription'],
      recordAny['extentIdentifier'],
      recordAny['verticalRange'],
    ]);

    const hasSpatialInfo = this.hasContent([
      record.resourceType,
      record.resolutionDistance,
      record.resolutionScaleDenominator,
      record.coordinateSystem,
    ]);

    const hasUsageAndAccess = this.hasContent([
      recordAny['MD_LegalConstraintsUseLimitationObject'],
      recordAny['cl_accessConstraints'],
      recordAny['MD_LegalConstraintsOtherConstraintsObject'],
    ]);

    const hasClassification = this.hasContent([recordAny['allKeywords']]);

    return {
      about: hasAbout,
      // lineage: hasLineage,
      dates: hasDates,
      coverage: hasCoverage,
      spatialInfo: hasSpatialInfo,
      dataModel: !!record.info?.hasDataModel,
      usageAndAccess: hasUsageAndAccess,
      classification: hasClassification,
    };
  });

  expandedSections = computed(() => {
    const visibility = this.aboutSectionVisibility();
    const staticSections = [
      'about',
      'dates',
      'usageAndAccess',
      'dataModel',
      'coverage',
      'spatialInfo',
      'lineage',
      'classification',
    ].filter((section) => visibility[section as keyof typeof visibility]);
    const contactSections = this.contactRoles().map((role: string) => 'contact-' + role);
    return [...staticSections, ...contactSections];
  });

  recordClick = output<string>();
  sharingChanged = output<void>();

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      this.pendingScrollTarget.set(params.get('scrollTo') ?? undefined);
    });

    effect(() => {
      const sectionId = this.pendingScrollTarget();
      if (!sectionId || this.tab() !== 'data-access') {
        return;
      }

      setTimeout(() => {
        const section = this.hostElement.nativeElement.querySelector<HTMLElement>(`#${sectionId}`);
        if (!section) {
          return;
        }

        section.scrollIntoView({ behavior: 'instant', block: 'start' });
      }, 100);
    });
  }

  handleRecordClick(uuid: string) {
    this.recordClick.emit(uuid);
  }

  getLineage(): string {
    return (
      ((this.record() as Record<string, unknown>)?.['lineageObject'] as Record<string, string>)?.[
        'default'
      ] ?? ''
    );
  }

  onTabChange(tab: string | number | undefined) {
    if (!!tab && this.tab() === tab) return;

    if (this.record()?.uuid) {
      if (this.tab() === 'explore' && tab !== 'explore') {
        this.router.navigate([RECORD_ROUTE_PATH, this.record()!.uuid, tab], {
          queryParams: { datasource: null, dataviz: null, notebook: null },
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
