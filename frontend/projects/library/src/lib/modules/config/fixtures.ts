export const DEFAULT_TEST_CONFIG = {
  apps: {
    i18n: {
      enabled: true,
      languages: {
        eng: 'en',
        fre: 'fr',
      },
      language: 'eng',
    },
    search: {
      enabled: true,
      aggregations: [
        {
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
        {
          'th_sextant-theme_tree.key': {
            terms: {
              field: 'th_sextant-theme_tree.key',
              size: 300,
              order: {
                _key: 'asc',
              },
            },
            meta: {
              collapsed: true,
              orderByTranslation: true,
              translateOnLoad: true,
            },
          },
        },
        {
          'th_httpinspireeceuropaeutheme-theme_tree.key': {
            terms: {
              field: 'th_httpinspireeceuropaeutheme-theme_tree.key',
              size: 34,
              order: {
                _key: 'asc',
              },
            },
            meta: {
              collapsed: true,
              translateOnLoad: true,
              orderByTranslation: true,
            },
          },
        },
        {
          'tag.default': {
            terms: {
              field: 'tag.default',
              include: '.*',
              size: 10,
            },
            meta: {
              collapsed: true,
              caseInsensitiveInclude: true,
            },
          },
        },
        {
          creationYearForResource: {
            terms: {
              field: 'creationYearForResource',
              size: 10,
              order: {
                _key: 'desc',
              },
            },
            meta: {
              collapsed: false,
            },
          },
        },
        {
          OrgForResource: {
            terms: {
              field: 'OrgForResource',
              include: '.*',
              size: 10,
            },
            meta: {
              collapsed: true,
              caseInsensitiveInclude: true,
            },
          },
        },
        {
          resourceType: {
            terms: {
              field: 'resourceType',
              size: 10,
              exclude: 'map/.*',
            },
            meta: {
              collapsed: true,
              refreshPolicy: 'none',
              decorator: {
                type: 'icon',
                map: {
                  dataset: 'faSolidDatabase',
                  map: 'faSolidMap',
                  featureCatalog: 'faSolidTable',
                  document: 'faSolidCopy',
                  service: 'faSolidCloud',
                  series: 'faSolidCopy',
                  nonGeographicDataset: 'faSolidChartColumn',
                  publication: 'faSolidBook',
                },
              },
            },
          },
        },
      ],
      sort: [
        '_score',
        '-changeDate',
        '-createDate',
        'resourceTitleObject.default.sort',
        '-rating',
        '-popularity',
      ],
      currentSort: '_score',
      hitsPerPageOptions: [10, 20, 60],
      resultsLayoutOptions: ['list', 'grid'],
      topTabFilter: 'resourceType',
      filter: null,
    },
    record: {
      enabled: true,
      distribution: {
        layout: '',
        sections: [
          {
            filter: 'protocol:OGC:WMS|OGC:WMTS|ESRI:.*|atom.*|REST|OGC API Maps|OGC API Records',
            title: 'API',
          },
          {
            filter:
              'protocol:OGC:WFS|OGC:WCS|.*DOWNLOAD.*|DB:.*|FILE:.*|OGC API Features|OGC API Coverages',
            title: 'download',
          },
          {
            filter: 'function:legend',
            title: 'mapLegend',
          },
          {
            filter: 'function:featureCatalogue',
            title: 'featureCatalog',
          },
          {
            filter: 'function:dataQualityReport',
            title: 'quality',
          },
          {
            filter:
              '-protocol:OGC.*|REST|ESRI:.*|atom.*|.*DOWNLOAD.*|DB:.*|FILE:.* AND -function:legend|featureCatalogue|dataQualityReport',
            title: 'links',
          },
        ],
      },
    },
  },
};
