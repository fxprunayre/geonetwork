export const SEARCH_SOURCE_MINIMAL = [
  'cl_status*',
  'dateStamp',
  'documentStandard',
  'draft',
  'draftId',
  'geom',
  'groupOwner',
  'id',
  'isHarvested',
  'isTemplate',
  'mdStatus*',
  'owner',
  'resourceTitle*',
  'resourceType',
  'status*',
  'uuid',
  'valid',
];

export const SEARCH_SOURCE = [
  ...SEARCH_SOURCE_MINIMAL,
  'link',
  'rating',
  'resourceAbstract*',
  'resourceCreditObject',
  'logo',
  'overview',
];

export const SIGNIN_SLUG = 'signin';
export const SEARCH_SLUG = 'search';
export const MAP_SLUG = 'map';
export const RECORD_SLUG = 'record';

export const SIGNIN_ROUTE_PATH = '/' + SIGNIN_SLUG;
export const SEARCH_ROUTE_PATH = '/' + SEARCH_SLUG;
export const RECORD_ROUTE_PATH = '/' + RECORD_SLUG;
export const MAP_ROUTE_PATH = '/' + MAP_SLUG;
