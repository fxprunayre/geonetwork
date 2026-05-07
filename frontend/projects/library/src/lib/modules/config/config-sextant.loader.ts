import { elasticsearch } from 'gn-api-client';
import {
  DEFAULT_RECORD_DOWNLOAD_PROTOCOLS,
  DEFAULT_RECORD_VIEW_PROTOCOLS,
  INSPIRE_AGGREGATION,
  RESOURCE_TYPE_AGGREGATION,
} from './gn-constants';
import { UiConfiguration } from './model/gn4config';
import { SextantLegacyFacet } from './model/sextantConfig';

/**
 * Known legacy Sextant v6 facet keys → ES aggregation templates.
 * Add entries here to override the generic terms-based fallback.
 */
const SEXTANT_LEGACY_FACET_MAPPING: Record<
  string,
  Record<string, elasticsearch.AggregationsAggregationContainer>
> = {
  keyword: {
    'tag.default': {
      terms: {
        field: 'tag.default',
        size: 15,
      },
    },
  },
  'keywordType-parameter': {
    'keywordType-parameter.default': {
      terms: {
        field: 'keywordType-parameter.default',
        size: 300,
      },
    },
  },
  sextantTheme: {
    'th_sextant-theme_tree.key': {
      terms: {
        field: 'th_sextant-theme_tree.key',
        size: 300,
        order: { _key: 'asc' },
      },
      meta: {
        collapsed: true,
      },
    },
  },
  topicCat: {
    'cl_topic.key': {
      terms: {
        field: 'cl_topic.key',
        size: 20,
      },
    },
  },
  category: {
    cat: {
      terms: {
        field: 'cat',
        size: 99,
        order: { _key: 'asc' },
      },
    },
  },
  inspireTheme: {
    'th_httpinspireeceuropaeutheme-theme_tree.key': INSPIRE_AGGREGATION,
  },
  inspireTheme_en: {
    'th_httpinspireeceuropaeutheme-theme_tree.key': INSPIRE_AGGREGATION,
  },
  inspireTheme_fr: {
    'th_httpinspireeceuropaeutheme-theme_tree.key': INSPIRE_AGGREGATION,
  },
  inspireThemeWithAc: {
    'th_httpinspireeceuropaeutheme-theme_tree.key': INSPIRE_AGGREGATION,
  },
  inspireThemeURI: {
    'th_httpinspireeceuropaeutheme-theme_tree.key': INSPIRE_AGGREGATION,
  },
  denominator: {
    resolutionScaleDenominator: {
      histogram: {
        field: 'resolutionScaleDenominator',
        interval: 10000,
        keyed: true,
        min_doc_count: 1,
      },
    },
  },
  resolution: {
    resolutionDistance: {
      terms: {
        field: 'resolutionDistance',
        include: '.* (m|km)',
      },
    },
  },
  spatialRepresentationType: {
    'cl_spatialRepresentationType.key': {
      terms: {
        field: 'cl_spatialRepresentationType.key',
        size: 10,
      },
    },
  },
  orgName: {
    OrgForResource: {
      terms: {
        field: 'OrgForResource',
        include: '.*',
        size: 15,
      },
      meta: {
        caseInsensitiveInclude: true,
      },
    },
  },
  metadataPOC: {
    Org: {
      terms: {
        field: 'Org',
        include: '.*',
        size: 15,
      },
      meta: {
        caseInsensitiveInclude: true,
      },
    },
  },
  serviceType: {
    serviceType: {
      terms: {
        field: 'serviceType',
        size: 10,
      },
    },
  },
  type: {
    resourceType: RESOURCE_TYPE_AGGREGATION,
  },
  resourceType: {
    resourceType: RESOURCE_TYPE_AGGREGATION,
  },
  createDateYear: {
    creationYearForResource: {
      histogram: {
        field: 'creationYearForResource',
        interval: 1,
        min_doc_count: 1,
      },
      //   terms: {
      //     field: 'creationYearForResource',
      //     size: 20,
      //     order: { _key: 'desc' },
      //   },
      meta: {
        layout: 'bar',
        refreshPolicy: 'none',
      },
    },
  },
  format: {
    format: {
      terms: {
        field: 'format',
        size: 15,
        order: { _key: 'asc' },
      },
    },
  },
  title: {
    'resourceTitleObject.default.keyword': {
      terms: {
        field: 'resourceTitleObject.default.keyword',
        size: 100,
      },
    },
  },
  metadataType: {
    isTemplate: {
      terms: {
        field: 'isTemplate',
        size: 3,
        order: { _key: 'asc' },
      },
    },
  },
  isValid: {
    valid: {
      terms: {
        field: 'valid',
        size: 3,
        order: { _key: 'asc' },
      },
    },
  },
  isValidInspire: {
    valid_inspire: {
      terms: {
        field: 'valid_inspire',
        size: 3,
        order: { _key: 'asc' },
      },
    },
  },
  isHarvested: {
    isHarvested: {
      terms: {
        field: 'isHarvested',
        size: 2,
        order: { _key: 'asc' },
      },
    },
  },
  mdStatus: {
    mdStatus: {
      terms: {
        field: 'mdStatus',
        size: 10,
        order: { _key: 'asc' },
      },
    },
  },
  status: {
    'cl_status.key': {
      terms: {
        field: 'cl_status.key',
        size: 10,
      },
    },
  },
  sourceCatalog: {
    'cl_status.key': {
      terms: {
        field: 'cl_status.key',
        size: 10,
      },
    },
  },
  standard: {
    documentStandard: {
      terms: {
        field: 'documentStandard',
        size: 15,
        order: { _key: 'asc' },
      },
    },
  },
  subTemplateType: {
    root: {
      terms: {
        field: 'root',
        size: 10,
      },
    },
  },
  recordOwner: {
    recordOwner: {
      terms: {
        field: 'recordOwner',
        size: 45,
        order: { _key: 'asc' },
      },
    },
  },
  groupOwner: {
    groupOwner: {
      terms: {
        field: 'groupOwner',
        size: 300,
        order: { _key: 'asc' },
      },
    },
  },
  publishedForGroup: {
    groupPublishedId: {
      terms: {
        field: 'groupPublishedId',
        size: 300,
        include: '.*',
        exclude: '1',
      },
      meta: {
        field: 'groupPublishedId',
        orderByTranslation: true,
        filterByTranslation: true,
        displayFilter: true,
        collapsed: false,
        layout: 'multiselect',
      },
    },
  },
  _groupPublished: {
    groupPublishedId: {
      terms: {
        field: 'groupPublishedId',
        size: 300,
        include: '.*',
        exclude: '1',
      },
      meta: {
        field: 'groupPublishedId',
        orderByTranslation: true,
        filterByTranslation: true,
        displayFilter: true,
        collapsed: false,
        layout: 'multiselect',
      },
    },
  },
  isPublishedToAll: {
    isPublishedToAll: {
      terms: {
        field: 'isPublishedToAll',
        size: 2,
        order: { _key: 'asc' },
      },
    },
  },
  p01: {
    'th_BODC-Parameter-Usage-Vocabulary.default': {
      terms: {
        field: 'th_BODC-Parameter-Usage-Vocabulary.default',
        size: 300,
      },
    },
  },
  p02: {
    'th_NVS-P02.default': {
      terms: {
        field: 'th_NVS-P02.default',
        size: 300,
      },
    },
  },
  p03: {
    'th_NVS-P03.default': {
      terms: {
        field: 'th_NVS-P03.default',
        size: 300,
      },
    },
  },
  p35: {
    'th_NVS-P35.default': {
      terms: {
        field: 'th_NVS-P35.default',
        size: 300,
      },
    },
  },
  A05: {
    'th_NVS-A05.default': {
      terms: {
        field: 'th_NVS-A05.default',
        size: 300,
      },
    },
  },
  C19: {
    'th_NVS-C19.default': {
      terms: {
        field: 'th_NVS-C19.default',
        size: 300,
      },
    },
  },
  L04: {
    'th_NVS-L04.default': {
      terms: {
        field: 'th_NVS-L04.default',
        size: 300,
      },
    },
  },
  P36: {
    'th_NVS-P36.default': {
      terms: {
        field: 'th_NVS-P36.default',
        size: 300,
      },
    },
  },
  P08: {
    'th_NVS-P08.default': {
      terms: {
        field: 'th_NVS-P08.default',
        size: 300,
      },
    },
  },
  atlantos_element: {
    'th_atlantos_element.default': {
      terms: {
        field: 'th_atlantos_element.default',
        size: 300,
      },
    },
  },
  'portail-donnees-facette-discipline': {
    'th_portail-donnees-facette-comment.default': {
      terms: {
        field: 'th_portail-donnees-facette-comment.default',
        size: 300,
      },
    },
  },
  'portail-donnees-facette-type': {
    'th_portail-donnees-facette-type.default': {
      terms: {
        field: 'th_portail-donnees-facette-type.default',
        size: 300,
      },
    },
  },
  'portail-donnees-facette-comment': {
    'th_portail-donnees-facette-comment.default': {
      terms: {
        field: 'th_portail-donnees-facette-comment.default',
        size: 300,
      },
    },
  },
  SIH_Especes_commerciales: {
    'th_SIH_Especes_commerciales.default': {
      terms: {
        field: 'th_SIH_Especes_commerciales.default',
        size: 300,
      },
    },
  },
  SIH_Groupes_Especes: {
    'th_SIH_Groupes_Especes.default': {
      terms: {
        field: 'th_SIH_Groupes_Especes.default',
        size: 300,
      },
    },
  },
  SIH_Engins_valides: {
    'th_SIH_Engins_valides.default': {
      terms: {
        field: 'th_SIH_Engins_valides.default',
        size: 300,
      },
    },
  },
  SIH_Categories_Engins: {
    'th_SIH_Categories_Engins.default': {
      terms: {
        field: 'th_SIH_Categories_Engins.default',
        size: 300,
      },
    },
  },
  SIH_Types_donnees: {
    'th_sih_type_donnees_tree.key': {
      terms: {
        field: 'th_sih_type_donnees_tree.key',
        size: 300,
      },
    },
  },
  SIH_Facade_maritime: {
    'th_sih_facade_maritime.default': {
      terms: {
        field: 'th_sih_facade_maritime.default',
        size: 300,
      },
    },
  },
  'emodnet-checkpoint.environmental.matrix': {
    'th_emodnet-checkpoint-environmental-matrix.default': {
      terms: {
        field: 'th_emodnet-checkpoint-environmental-matrix.default',
        size: 300,
      },
    },
  },
  'emodnet-checkpoint.challenges': {
    'th_emodnet-checkpoint-challenges.default': {
      terms: {
        field: 'th_emodnet-checkpoint-challenges.default',
        size: 300,
      },
    },
  },
  'emodnet-checkpoint.level.of.characteristics': {
    'th_emodnet-checkpoint-level-of-characteristics.default': {
      terms: {
        field: 'th_emodnet-checkpoint-level-of-characteristics.default',
        size: 300,
      },
    },
  },
  'emodnet-checkpoint.production.mode': {
    'th_emodnet-checkpoint-production-mode.default': {
      terms: {
        field: 'th_emodnet-checkpoint-production-mode.default',
        size: 300,
      },
    },
  },
  'ParameterUsageVocabulary-other': {
    'th_NVS-P01.default': {
      terms: {
        field: 'th_NVS-P01.default',
        size: 300,
      },
    },
  },
  'dcsmm-methode': {
    'th_dcsmm-methode.default': {
      terms: {
        field: 'th_dcsmm-methode.default',
        size: 300,
      },
    },
  },
  'dcsmm-type-espace': {
    'th_dcsmm-type-espace.default': {
      terms: {
        field: 'th_dcsmm-type-espace.default',
        size: 300,
      },
    },
  },
  'dcsmm-area': {
    'th_dcsmm-area_tree.key': {
      terms: {
        field: 'th_dcsmm-area_tree.key',
        size: 300,
      },
      meta: {
        thesaurus: 'dcsmm.area',
      },
    },
  },
  'dcsmm-descripteur': {
    'th_dcsmm-descripteur.default': {
      terms: {
        field: 'th_dcsmm-descripteur.default',
        size: 300,
      },
    },
  },
  maintenanceAndUpdateFrequency: {
    'cl_maintenanceAndUpdateFrequency.default': {
      terms: {
        field: 'cl_maintenanceAndUpdateFrequency.default',
        size: 10,
      },
    },
  },
  odatis_variables: {
    'th_odatis_variables_tree.key': {
      terms: {
        field: 'th_odatis_variables_tree.key',
        size: 300,
      },
    },
  },
  odatis_centre_donnees: {
    'th_odatis_centre_donnees.default': {
      terms: {
        field: 'th_odatis_centre_donnees.default',
        size: 300,
      },
    },
  },
  odatis_type_jeux_donnee: {
    'th_type_jeux_donnee_tree.key': {
      terms: {
        field: 'th_type_jeux_donnee_tree.key',
        size: 300,
      },
    },
  },
  'lops-projets': {
    'th_lops_projets.default': {
      terms: {
        field: 'th_lops_projets.default',
        size: 300,
      },
    },
  },
  'simm-reglementaire': {
    'th_simm-reglementaire.default': {
      terms: {
        field: 'th_simm-reglementaire.default',
        size: 300,
      },
    },
  },
  'simm-thematiques': {
    'th_simm-thematiques_tree.key': {
      terms: {
        field: 'th_simm-thematiques_tree.key',
        size: 300,
      },
      meta: {
        thesaurus: 'simm.thematiques',
      },
    },
  },
  'cersat-latency': {
    'th_cersat_latency.default': {
      terms: {
        field: 'th_cersat_latency.default',
        size: 300,
      },
    },
  },
  'cersat-parameter': {
    'th_cersat_parameter.default': {
      terms: {
        field: 'th_cersat_parameter.default',
        size: 300,
      },
    },
  },
  'cersat-processing-level': {
    'th_cersat_processing_level.default': {
      terms: {
        field: 'th_cersat_processing_level.default',
        size: 300,
      },
    },
  },
  'cersat-project': {
    'th_cersat_project.default': {
      terms: {
        field: 'th_cersat_project.default',
        size: 300,
      },
    },
  },
  'myocean-reference-geographical-area': {
    'th_myocean-reference-geographical-area.default': {
      terms: {
        field: 'th_myocean-reference-geographical-area.default',
        size: 300,
      },
    },
  },
  'theme-GCMDparameter': {
    'th_GCMDparameter_tree.key': {
      terms: {
        field: 'th_GCMDparameter_tree.key',
        size: 300,
      },
    },
  },
  mdActions: {
    availableInServices: {
      filters: {
        //"other_bucket_key": "others",
        // But does not support to click on it
        filters: {
          availableInViewService: {
            query_string: {
              query: '+linkProtocol:/' + DEFAULT_RECORD_VIEW_PROTOCOLS.join('|') + '/',
            },
          },
          availableInDownloadService: {
            query_string: {
              query: '+linkProtocol:/' + DEFAULT_RECORD_DOWNLOAD_PROTOCOLS.join('|') + '/',
            },
          },
        },
      },
    },
  },
  'mission-atlantic-resources': {
    'th_mission-atlantic-resources.default': {
      terms: {
        field: 'th_mission-atlantic-resources.default',
        size: 300,
      },
    },
  },
  'mission-atlantic-case-studies': {
    'th_mission-atlantic-case-studies.default': {
      terms: {
        field: 'th_mission-atlantic-case-studies.default',
        size: 300,
      },
    },
  },
  'mission-atlantic-odemm': {
    'th_mission-atlantic-odemm_tree.key': {
      terms: {
        field: 'th_mission-atlantic-odemm_tree.key',
        size: 300,
      },
    },
  },
  'mission-atlantic-bodc-parameters': {
    'th_mission-atlantic-bodc-parameters_tree.key': {
      terms: {
        field: 'th_mission-atlantic-bodc-parameters_tree.key',
        size: 300,
      },
    },
  },
  'mission-atlantic-data-type': {
    'th_mission-atlantic-data-type.default': {
      terms: {
        field: 'th_mission-atlantic-data-type.default',
        size: 300,
      },
    },
  },
  'mission-atlantic-work-package': {
    'th_mission-atlantic-work-package.default': {
      terms: {
        field: 'th_mission-atlantic-work-package.default',
        size: 300,
      },
    },
  },
  credit: {
    'resourceCreditObject.default.keyword': {
      terms: {
        field: 'resourceCreditObject.default.keyword',
        size: 300,
      },
    },
  },
};

/**
 * Converts a single legacy Sextant v6 facet descriptor into an ES-compatible
 * aggregation entry and merges it into `esFacetConfig`.
 */
function migrateSextantFacetConfig(
  esFacetConfig: Record<string, elasticsearch.AggregationsAggregationContainer>,
  sxtFacet: SextantLegacyFacet,
  currentLang: string,
): void {
  try {
    // Resolve language-variant key
    if (sxtFacet.langs) {
      sxtFacet.key = sxtFacet.langs[currentLang] ?? Object.values(sxtFacet.langs)[0];
    }

    if (!sxtFacet.key) return;

    let esFacetTemplate: Record<string, elasticsearch.AggregationsAggregationContainer> =
      SEXTANT_LEGACY_FACET_MAPPING[sxtFacet.key];

    if (!esFacetTemplate) {
      esFacetTemplate = {};
      if (sxtFacet.terms || sxtFacet.gnBuildFilterForRange || sxtFacet.filters) {
        // Already an ES-shaped aggregation — pass through as-is
        esFacetTemplate[sxtFacet.key] = sxtFacet as any;
      } else {
        esFacetTemplate[sxtFacet.key] = {
          terms: { field: sxtFacet.key, size: 300 },
        };
      }
    }

    const facetName = Object.keys(esFacetTemplate)[0];
    // Deep-clone so we don't mutate the template
    const esFacet: Record<string, any> = {
      [facetName]: { ...esFacetTemplate[facetName] },
    };

    // Ensure meta exists
    esFacet[facetName].meta = {
      ...esFacetTemplate[facetName]?.meta,
      collapsed: !sxtFacet.opened,
      labels: sxtFacet.labels,
    };

    if (sxtFacet.orderBy === 'alphabetical') {
      esFacet[facetName].meta.orderByTranslation = true;
      esFacet[facetName].terms ??= {};
      esFacet[facetName].terms.order = { _key: 'asc' };
    }

    if (sxtFacet.thesaurusKey) {
      esFacet[facetName].meta.thesaurus = sxtFacet.thesaurusKey;
    }

    if (sxtFacet.key.match(/th_(.*)_tree.*/)) {
      esFacet[facetName].meta.translateOnLoad = true;
    }

    if (sxtFacet.filter) {
      esFacet[facetName].terms ??= {};
      esFacet[facetName].terms.include = '.*';
      esFacet[facetName].meta.displayFilter = true;
      esFacet[facetName].meta.filterByTranslation = true;
      esFacet[facetName].meta.caseInsensitiveInclude = true;
    }

    if (sxtFacet.include) {
      esFacet[facetName].terms ??= {};
      esFacet[facetName].terms.include = sxtFacet.include;
    }

    if (sxtFacet.exclude) {
      esFacet[facetName].terms ??= {};
      esFacet[facetName].terms.exclude = sxtFacet.exclude;
    }

    Object.assign(esFacetConfig, esFacet);
  } catch (e: any) {
    console.warn(
      'A legacy Sextant v6 facet could not be migrated to v7\n' +
        'The following error was thrown: ' +
        e.message,
      sxtFacet,
    );
  }
}

/**
 * If the parsed `UiConfiguration` carries a `sextant` property (legacy v6 marker),
 * migrates `mods.search.facetConfig` from the legacy array format to the
 * ES-compatible `Record<string, AggregationsAggregationContainer>` expected by v7.
 *
 * The current language (ISO3) is resolved from `langDetector.default`.
 */
export function migrateSextantConfig(config: UiConfiguration): UiConfiguration {
  if (!config?.sextant) {
    return config;
  }

  const searchMod = config.mods?.search;
  if (searchMod && searchMod.facetConfig) {
    return config;
  }

  const currentLang: string = config.langDetector?.default ?? 'eng';
  const legacyFacets = config.sextant.facetConfig || [];
  const esFacetConfig: Record<string, elasticsearch.AggregationsAggregationContainer> = {};

  for (const sxtFacet of legacyFacets) {
    migrateSextantFacetConfig(esFacetConfig, sxtFacet, currentLang);
  }

  const tabOverflow = config.sextant.tabOverflow;
  // TODO: Check sextant if undefined means no module? and it is active status?
  const searchEnabled = tabOverflow?.search !== undefined ? true : false;
  const mapEnabled = tabOverflow?.map;

  return {
    ...config,
    mods: {
      ...config.mods,
      search: {
        ...searchMod,
        enabled: searchEnabled !== undefined ? searchEnabled : (searchMod?.enabled ?? true),
        facetConfig: esFacetConfig,
      },
      map: {
        ...config.mods?.map,
        enabled: mapEnabled !== undefined ? mapEnabled : (config.mods?.map?.enabled ?? true),
      },
    },
  };
}
