import { elasticsearch } from 'gn-api-client';
import { DEFAULT_THEME } from './default-theme';
import {
  DEFAULT_APPS_CONFIGURATION,
  DEFAULT_AUTHENTICATION_APP_CONFIGURATION,
  DEFAULT_HEADER_APP_CONFIGURATION,
  DEFAULT_HOME_APP_CONFIGURATION,
  DEFAULT_LANGUAGE,
  DEFAULT_MAP_CONTEXT,
  DEFAULT_RECORD_DETAILS_APP_CONFIGURATION,
  DEFAULT_SEARCH_APP_CONFIGURATION,
} from './gn-constants';
import { DEFAULT_GN4_UI_CONFIGURATION } from './gn4constants';
import {
  Authentication,
  Header,
  Home,
  Map,
  Recordview,
  Search,
  UiConfiguration,
} from './model/gn4config';
import { AppsConfiguration } from './model/gnConfig';

export function migrateGn4AggregationConfig(
  gn4AggConfig: Record<string, elasticsearch.AggregationsAggregationContainer>,
): (string | Record<string, elasticsearch.AggregationsAggregationContainer>)[] {
  // Filter entries with property gnBuildFilterForRange
  const filteredEntries = Object.entries(gn4AggConfig).filter(
    ([, value]) => !(value as any).gnBuildFilterForRange,
  );
  return filteredEntries.map(([key, value]) => ({
    [key]: value,
  }));
}

export function migrateGn4Config(gn4config: UiConfiguration): AppsConfiguration {
  const conf: AppsConfiguration = {
    apps: {},
    proxyUrl: '/geonetwork/proxy?url=',
    theme: DEFAULT_THEME,
  };

  if (!gn4config || !gn4config.mods || Object.keys(gn4config.mods).length === 0) {
    return { ...DEFAULT_APPS_CONFIGURATION };
  }

  for (const modKey of Object.keys(gn4config.mods)) {
    const module = gn4config.mods[modKey as keyof UiConfiguration['mods']];

    if (modKey === 'search') {
      const searchConfig = module as Search;

      conf.apps.search = {
        enabled: searchConfig.enabled ?? true,
        aggregations: searchConfig.facetConfig
          ? migrateGn4AggregationConfig(searchConfig.facetConfig)
          : DEFAULT_SEARCH_APP_CONFIGURATION.aggregations,
        sort: searchConfig.sortbyValues
          ? searchConfig.sortbyValues.map((sortOpt) => {
              const sortField = sortOpt.sortBy === 'relevance' ? '_score' : sortOpt.sortBy;
              const sortOrder = sortOpt.sortOrder === 'desc' ? '-' : '';
              return sortOrder + sortField;
            })
          : DEFAULT_SEARCH_APP_CONFIGURATION.sort,
        currentSort:
          searchConfig.sortBy === 'relevance'
            ? '_score'
            : searchConfig.sortBy || DEFAULT_SEARCH_APP_CONFIGURATION.currentSort,
        hitsPerPageOptions:
          searchConfig.hitsperpageValues || DEFAULT_SEARCH_APP_CONFIGURATION.hitsPerPageOptions,
        resultsLayoutOptions: searchConfig.resultViewTpls
          ? searchConfig.resultViewTpls
              .map((layout) => {
                if (layout.tplUrl.indexOf('grid.html') !== -1) {
                  return 'grid';
                } else if (layout.tplUrl.indexOf('list.html') !== -1) {
                  return 'list';
                }
                return undefined;
              })
              .filter((layout) => layout !== undefined)
          : DEFAULT_SEARCH_APP_CONFIGURATION.resultsLayoutOptions,
        filterPosition: DEFAULT_SEARCH_APP_CONFIGURATION.filterPosition,
      };
      if (searchConfig.facetTabField && searchConfig.facetConfig[searchConfig.facetTabField]) {
        conf.apps.search.topTabAggregation = searchConfig.facetTabField;
        conf.apps.search.filter = searchConfig.filters;
      } else if (DEFAULT_SEARCH_APP_CONFIGURATION.topTabAggregation) {
        conf.apps.search.topTabAggregation = DEFAULT_SEARCH_APP_CONFIGURATION.topTabAggregation;
      }
    } else if (modKey === 'header') {
      const headerConfig = module as Header;
      conf.apps.i18n = {
        enabled: headerConfig.enabled || true,
        languages: headerConfig.languages || DEFAULT_GN4_UI_CONFIGURATION.mods.header.languages,
        language: (gn4config.langDetector && gn4config.langDetector.default) || DEFAULT_LANGUAGE,
      };
    } else if (modKey === 'recordview') {
      const recordConfig = module as Recordview;
      conf.apps.record = {
        enabled: true,
        mainThesaurus:
          recordConfig.mainThesaurus || DEFAULT_RECORD_DETAILS_APP_CONFIGURATION.mainThesaurus,
        distribution:
          recordConfig.distributionConfig || DEFAULT_RECORD_DETAILS_APP_CONFIGURATION.distribution,
      };
    } else if (modKey === 'map') {
      const mapConfig = module as Map;
      conf.apps.map = {
        enabled: mapConfig.enabled ?? true,
        context: DEFAULT_MAP_CONTEXT,
      };
    } else if (modKey === 'home') {
      const homeConfig = module as Home;
      conf.apps.home = {
        ...DEFAULT_HOME_APP_CONFIGURATION,
        enabled: homeConfig.enabled ?? true,
        aggregations: homeConfig.facetConfig
          ? Object.entries(homeConfig.facetConfig).map(([key, value]) => ({
              [key]: value,
            }))
          : DEFAULT_HOME_APP_CONFIGURATION.aggregations,
      };
    } else if (modKey === 'authentication') {
      const authConfig = module as Authentication;
      conf.apps.authentication = {
        enabled: authConfig.enabled ?? true,
      };
    }
  }

  const hasHeader = Object.keys(gn4config.mods).includes('header');
  if (!hasHeader) {
    conf.apps.i18n = DEFAULT_HEADER_APP_CONFIGURATION;
  }
  const hasRecordDetails = Object.keys(gn4config.mods).includes('recordview');
  if (!hasRecordDetails) {
    conf.apps.record = DEFAULT_RECORD_DETAILS_APP_CONFIGURATION;
  }
  const hasHome = Object.keys(gn4config.mods).includes('home');
  if (!hasHome) {
    conf.apps.home = DEFAULT_HOME_APP_CONFIGURATION;
  }
  const hasAuthentication = Object.keys(gn4config.mods).includes('authentication');
  if (!hasAuthentication) {
    conf.apps.authentication = DEFAULT_AUTHENTICATION_APP_CONFIGURATION;
  }
  const hasMap = Object.keys(gn4config.mods).includes('map');
  if (!hasMap) {
    conf.apps.map = {
      enabled: true,
      context: DEFAULT_MAP_CONTEXT,
    };
  }
  conf.apps.menu = {
    enabled: true,
  };
  console.log(conf);
  return conf;
}
