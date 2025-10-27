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
