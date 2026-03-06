export type long = number;
export type double = number;
export type integer = number;
export type float = number;

export type Name = string;
export type Field = string;
export type FieldValue = long | double | string | boolean | null | any;

export type Fields = Field | Field[];

export type Id = string;
export type SequenceNumber = long;
export type IndexName = string;
export type Routing = string;

export type Decorator = {
  type: 'map' | 'icon' | 'img';
  map?: Record<string, string>;
  prefix?: string;
  expression?: string;
};

export type AggregationLayout = 'checkbox' | 'select' | 'multiselect' | 'button' | 'card' | 'tree';

export type Metadata = Record<string, any> & {
  collapsed?: boolean;
  placement?: 'side' | 'primary' | 'secondary';
  decorator?: Decorator;
  refreshPolicy?: 'none';
  icon?: string;
  layout?: AggregationLayout;
  orderByTranslation?: boolean;
  userHasRole?: string;
};

export interface AggregationsMultiBucketBase {
  doc_count: long;
}

export type TimeZone = string;
export type DateFormat = string;
export type Duration = string | -1 | 0;
export type UnitMillis = long;
export type EpochTime<Unit = unknown> = Unit;
export type DateMath = string | Date;
export type DateTime = string | EpochTime<UnitMillis> | Date;
export type Distance = string;
export type DistanceUnit = 'in' | 'ft' | 'yd' | 'mi' | 'nmi' | 'km' | 'm' | 'cm' | 'mm';

export interface LatLonGeoLocation {
  lat: double;
  lon: double;
}
export type GeoHash = string;
export interface GeoHashLocation {
  geohash: GeoHash;
}
export type GeoLocation = LatLonGeoLocation | GeoHashLocation | double[] | string;

export type AggregationsTermsExclude = string | string[];
export type AggregationsTermsInclude = string | string[];

export type AggregationsMissing = string | integer | double | boolean;
export type AggregationsMissingOrder = 'first' | 'last' | 'default';

export type SortResults = FieldValue[];
export type SortOptions = {
  [property: string]: SortOrder;
};
export type SortOrder = 'asc' | 'desc';

export type AggregationsAggregateOrder =
  | Partial<Record<Field, SortOrder>>
  | Partial<Record<Field, SortOrder>>[];

export interface AggregationsFiltersBucketKeys extends AggregationsMultiBucketBase {}

export type AggregationsFiltersBucket = AggregationsFiltersBucketKeys & {
  [property: string]: AggregationsAggregate | long;
};
export interface AggregationsFiltersAggregate extends AggregationsMultiBucketAggregateBase<AggregationsFiltersBucket> {}
export interface AggregationsFiltersAggregation extends AggregationsBucketAggregationBase {
  filters?: AggregationsBuckets<QueryDslQueryContainer>;
  other_bucket?: boolean;
  other_bucket_key?: string;
  keyed?: boolean;
}
export interface AggregationsHistogramBucketKeys extends AggregationsMultiBucketBase {
  key_as_string?: string;
  key: double;
}
export type AggregationsHistogramBucket = AggregationsHistogramBucketKeys & {
  [property: string]: AggregationsAggregate | string | double | long;
};
export interface AggregationsHistogramAggregate extends AggregationsMultiBucketAggregateBase<AggregationsHistogramBucket> {}

export type AggregationsAggregate =
  | AggregationsHistogramAggregate
  | AggregationsStringTermsAggregate
  | AggregationsFiltersAggregate;

export interface AggregationsAggregateBase {
  meta?: Metadata;
}

export type AggregationsBuckets<TBucket = unknown> = Record<string, TBucket> | TBucket[];

export interface AggregationsMultiBucketAggregateBase<
  TBucket = unknown,
> extends AggregationsAggregateBase {
  buckets: AggregationsBuckets<TBucket>;
}

export interface AggregationsTermsAggregateBase<
  TBucket = unknown,
> extends AggregationsMultiBucketAggregateBase<TBucket> {
  doc_count_error_upper_bound?: long;
  sum_other_doc_count?: long;
}

export interface AggregationsTermsBucketBase extends AggregationsMultiBucketBase {
  doc_count_error_upper_bound?: long;
}

export interface AggregationsStringTermsAggregate extends AggregationsTermsAggregateBase<AggregationsStringTermsBucket> {}
export interface AggregationsStringTermsBucketKeys extends AggregationsTermsBucketBase {
  key: FieldValue;
}
export type AggregationsStringTermsBucket = AggregationsStringTermsBucketKeys & {
  [property: string]: AggregationsAggregate | FieldValue | long;
};

export interface AggregationsBucketAggregationBase {}

export interface AggregationsTermsAggregation extends AggregationsBucketAggregationBase {
  // collect_mode?: AggregationsTermsAggregationCollectMode;
  exclude?: AggregationsTermsExclude;
  // execution_hint?: AggregationsTermsAggregationExecutionHint;
  field?: Field;
  include?: AggregationsTermsInclude;
  min_doc_count?: integer;
  missing?: AggregationsMissing;
  missing_order?: AggregationsMissingOrder;
  missing_bucket?: boolean;
  value_type?: string;
  order?: AggregationsAggregateOrder;
  // script?: Script | string;
  shard_min_doc_count?: long;
  shard_size?: integer;
  show_term_doc_count_error?: boolean;
  size?: integer;
  format?: string;
}

export interface AggregationsExtendedBounds<T = unknown> {
  max?: T;
  min?: T;
}

export interface AggregationsHistogramAggregation extends AggregationsBucketAggregationBase {
  extended_bounds?: AggregationsExtendedBounds<double>;
  hard_bounds?: AggregationsExtendedBounds<double>;
  field?: Field;
  interval?: double;
  min_doc_count?: integer;
  missing?: double;
  offset?: double;
  order?: AggregationsAggregateOrder;
  script?: Script | string;
  format?: string;
  keyed?: boolean;
}
export interface AggregationsAggregation {}
export interface AggregationsAggregationContainer {
  aggregations?: Record<string, AggregationsAggregationContainer>;
  meta?: Metadata;
  terms?: AggregationsTermsAggregation;
  filters?: AggregationsFiltersAggregation;
  histogram?: AggregationsHistogramAggregation;
}

export interface SpecUtilsCommonQueryParameters {
  error_trace?: boolean;
  filter_path?: string | string[];
  human?: boolean;
  pretty?: boolean;
}
export interface RequestBase extends SpecUtilsCommonQueryParameters {}

export type QueryDslOperator = 'and' | 'AND' | 'or' | 'OR';

export interface QueryDslFieldAndFormat {
  field: Field;
  format?: string;
  include_unmapped?: boolean;
}
export type ScriptLanguage = 'painless';

export interface Script {
  source?: string;
  id?: Id;
  params?: Record<string, any>;
  lang?: ScriptLanguage;
  options?: Record<string, string>;
}
export interface ScriptField {
  script: Script | string;
  ignore_failure?: boolean;
}

export type SortCombinations = Field | SortOptions;
export type Sort = SortCombinations | SortCombinations[];
export interface SearchSourceFilter {
  excludes?: Fields;
  exclude?: Fields;
  includes?: Fields;
  include?: Fields;
}
export type SearchSourceConfig = boolean | SearchSourceFilter | Fields;

export interface SearchInnerHits {
  name?: Name;
  size?: integer;
  from?: integer;
  collapse?: SearchFieldCollapse;
  docvalue_fields?: (QueryDslFieldAndFormat | Field)[];
  explain?: boolean;
  ignore_unmapped?: boolean;
  script_fields?: Record<Field, ScriptField>;
  seq_no_primary_term?: boolean;
  fields?: Fields;
  sort?: Sort;
  _source?: SearchSourceConfig;
  stored_fields?: Fields;
  track_scores?: boolean;
  version?: boolean;
}

export interface SearchFieldCollapse {
  field: Field;
  inner_hits?: SearchInnerHits | SearchInnerHits[];
  max_concurrent_group_searches?: integer;
  collapse?: SearchFieldCollapse;
}

export type SearchTrackHits = boolean | integer;

export interface QueryDslQueryBase {
  boost?: float;
  _name?: string;
}

export type MinimumShouldMatch = integer | string;

export interface QueryDslBoolQuery extends QueryDslQueryBase {
  filter?: QueryDslQueryContainer | QueryDslQueryContainer[];
  minimum_should_match?: MinimumShouldMatch;
  must?: QueryDslQueryContainer | QueryDslQueryContainer[];
  must_not?: QueryDslQueryContainer | QueryDslQueryContainer[];
  should?: QueryDslQueryContainer | QueryDslQueryContainer[];
}
export interface QueryDslBoostingQuery extends QueryDslQueryBase {
  negative_boost: double;
  negative: QueryDslQueryContainer;
  positive: QueryDslQueryContainer;
}

export type QueryDslFieldValueFactorModifier =
  | 'none'
  | 'log'
  | 'log1p'
  | 'log2p'
  | 'ln'
  | 'ln1p'
  | 'ln2p'
  | 'square'
  | 'sqrt'
  | 'reciprocal';
export interface QueryDslFieldValueFactorScoreFunction {
  field: Field;
  factor?: double;
  missing?: double;
  modifier?: QueryDslFieldValueFactorModifier;
}
export type QueryDslMultiValueMode = 'min' | 'max' | 'avg' | 'sum';
export interface QueryDslDecayFunctionBase<TOrigin = unknown, TScale = unknown> {
  multi_value_mode?: QueryDslMultiValueMode;
}
export interface QueryDslDecayPlacement<TOrigin = unknown, TScale = unknown> {
  decay?: double;
  offset?: TScale;
  scale?: TScale;
  origin?: TOrigin;
}
export interface QueryDslUntypedDecayFunctionKeys extends QueryDslDecayFunctionBase<any, any> {}
export type QueryDslUntypedDecayFunction = QueryDslUntypedDecayFunctionKeys & {
  [property: string]: QueryDslDecayPlacement | QueryDslMultiValueMode;
};
export interface QueryDslDateDecayFunctionKeys extends QueryDslDecayFunctionBase<
  DateMath,
  Duration
> {}

export type QueryDslDateDecayFunction = QueryDslDateDecayFunctionKeys & {
  [property: string]: QueryDslDecayPlacement | QueryDslMultiValueMode;
};
export interface QueryDslNumericDecayFunctionKeys extends QueryDslDecayFunctionBase<
  double,
  double
> {}

export type QueryDslNumericDecayFunction = QueryDslNumericDecayFunctionKeys & {
  [property: string]: QueryDslDecayPlacement | QueryDslMultiValueMode;
};
export interface QueryDslGeoDecayFunctionKeys extends QueryDslDecayFunctionBase<
  GeoLocation,
  Distance
> {}
export type QueryDslGeoDecayFunction = QueryDslGeoDecayFunctionKeys & {
  [property: string]: QueryDslDecayPlacement | QueryDslMultiValueMode;
};
export type QueryDslDecayFunction =
  | QueryDslUntypedDecayFunction
  | QueryDslDateDecayFunction
  | QueryDslNumericDecayFunction
  | QueryDslGeoDecayFunction;

export interface QueryDslScriptScoreFunction {
  script: Script | string;
}
export interface QueryDslRandomScoreFunction {
  field?: Field;
  seed?: long | string;
}
export type QueryDslFunctionBoostMode = 'multiply' | 'replace' | 'sum' | 'avg' | 'max' | 'min';
export interface QueryDslFunctionScoreContainer {
  exp?: QueryDslDecayFunction;
  gauss?: QueryDslDecayFunction;
  linear?: QueryDslDecayFunction;
  field_value_factor?: QueryDslFieldValueFactorScoreFunction;
  random_score?: QueryDslRandomScoreFunction;
  script_score?: QueryDslScriptScoreFunction;
  filter?: QueryDslQueryContainer;
  weight?: double;
}
export type QueryDslFunctionScoreMode = 'multiply' | 'sum' | 'avg' | 'first' | 'max' | 'min';
export interface QueryDslFunctionScoreQuery extends QueryDslQueryBase {
  boost_mode?: QueryDslFunctionBoostMode;
  functions?: QueryDslFunctionScoreContainer[];
  max_boost?: double;
  min_score?: double;
  query?: QueryDslQueryContainer;
  score_mode?: QueryDslFunctionScoreMode;
}
export type Fuzziness = string | integer;

export type MultiTermQueryRewrite = string;

export type QueryDslZeroTermsQuery = 'all' | 'none';

export interface QueryDslMatchQuery extends QueryDslQueryBase {
  analyzer?: string;
  auto_generate_synonyms_phrase_query?: boolean;
  cutoff_frequency?: double;
  fuzziness?: Fuzziness;
  fuzzy_rewrite?: MultiTermQueryRewrite;
  fuzzy_transpositions?: boolean;
  lenient?: boolean;
  max_expansions?: integer;
  minimum_should_match?: MinimumShouldMatch;
  operator?: QueryDslOperator;
  prefix_length?: integer;
  query: string | float | boolean;
  zero_terms_query?: QueryDslZeroTermsQuery;
}
export interface QueryDslMatchAllQuery extends QueryDslQueryBase {}
export interface QueryDslMatchBoolPrefixQuery extends QueryDslQueryBase {
  analyzer?: string;
  fuzziness?: Fuzziness;
  fuzzy_rewrite?: MultiTermQueryRewrite;
  fuzzy_transpositions?: boolean;
  max_expansions?: integer;
  minimum_should_match?: MinimumShouldMatch;
  operator?: QueryDslOperator;
  prefix_length?: integer;
  query: string;
}
export interface QueryDslMatchNoneQuery extends QueryDslQueryBase {}

export interface QueryDslMatchPhraseQuery extends QueryDslQueryBase {
  analyzer?: string;
  query: string;
  slop?: integer;
  zero_terms_query?: QueryDslZeroTermsQuery;
}
export interface QueryDslMatchPhrasePrefixQuery extends QueryDslQueryBase {
  analyzer?: string;
  max_expansions?: integer;
  query: string;
  slop?: integer;
  zero_terms_query?: QueryDslZeroTermsQuery;
}
export interface QueryDslTermQuery extends QueryDslQueryBase {
  value: FieldValue;
  case_insensitive?: boolean;
}
export type QueryDslRangeRelation = 'within' | 'contains' | 'intersects';

export interface QueryDslRangeQueryBase<T = unknown> extends QueryDslQueryBase {
  relation?: QueryDslRangeRelation;
  gt?: T;
  gte?: T;
  lt?: T;
  lte?: T;
  from?: T | null;
  to?: T | null;
}

export interface QueryDslUntypedRangeQuery extends QueryDslRangeQueryBase<any> {
  format?: DateFormat;
  time_zone?: TimeZone;
}
export interface QueryDslDateRangeQuery extends QueryDslRangeQueryBase<DateMath> {
  format?: DateFormat;
  time_zone?: TimeZone;
}
export interface QueryDslNumberRangeQuery extends QueryDslRangeQueryBase<double> {}
export interface QueryDslTermRangeQuery extends QueryDslRangeQueryBase<string> {}

export type QueryDslRangeQuery =
  | QueryDslUntypedRangeQuery
  | QueryDslDateRangeQuery
  | QueryDslNumberRangeQuery
  | QueryDslTermRangeQuery;

export interface QueryDslRegexpQuery extends QueryDslQueryBase {
  case_insensitive?: boolean;
  flags?: string;
  max_determinized_states?: integer;
  rewrite?: MultiTermQueryRewrite;
  value: string;
}

export interface QueryDslQueryContainer {
  bool?: QueryDslBoolQuery;
  boosting?: QueryDslBoostingQuery;
  function_score?: QueryDslFunctionScoreQuery | QueryDslFunctionScoreContainer[];
  match?: Partial<Record<Field, QueryDslMatchQuery | string | float | boolean>>;
  match_all?: QueryDslMatchAllQuery;
  match_bool_prefix?: Partial<Record<Field, QueryDslMatchBoolPrefixQuery | string>>;
  match_none?: QueryDslMatchNoneQuery;
  match_phrase?: Partial<Record<Field, QueryDslMatchPhraseQuery | string>>;
  match_phrase_prefix?: Partial<Record<Field, QueryDslMatchPhrasePrefixQuery | string>>;
  more_like_this?: QueryDslMoreLikeThisQuery;
  multi_match?: QueryDslMultiMatchQuery;
  nested?: QueryDslNestedQuery;
  query_string?: QueryDslQueryStringQuery;
  range?: Partial<Record<Field, QueryDslRangeQuery>>;
  regexp?: Partial<Record<Field, QueryDslRegexpQuery | string>>;
  simple_query_string?: QueryDslSimpleQueryStringQuery;
  term?: Partial<Record<Field, QueryDslTermQuery | FieldValue>>;
  terms?: QueryDslTermsQuery;
  terms_set?: Partial<Record<Field, QueryDslTermsSetQuery>>;
}
export type QueryDslSimpleQueryStringFlag =
  | 'NONE'
  | 'AND'
  | 'NOT'
  | 'OR'
  | 'PREFIX'
  | 'PHRASE'
  | 'PRECEDENCE'
  | 'ESCAPE'
  | 'WHITESPACE'
  | 'FUZZY'
  | 'NEAR'
  | 'SLOP'
  | 'ALL';

export type SpecUtilsPipeSeparatedFlags<T = unknown> = T | string;

export type QueryDslSimpleQueryStringFlags =
  SpecUtilsPipeSeparatedFlags<QueryDslSimpleQueryStringFlag>;

export interface QueryDslSimpleQueryStringQuery extends QueryDslQueryBase {
  analyzer?: string;
  analyze_wildcard?: boolean;
  auto_generate_synonyms_phrase_query?: boolean;
  default_operator?: QueryDslOperator;
  fields?: Field[];
  flags?: QueryDslSimpleQueryStringFlags;
  fuzzy_max_expansions?: integer;
  fuzzy_prefix_length?: integer;
  fuzzy_transpositions?: boolean;
  lenient?: boolean;
  minimum_should_match?: MinimumShouldMatch;
  query: string;
  quote_field_suffix?: string;
}

export interface QueryDslTermsQueryKeys extends QueryDslQueryBase {}

export interface QueryDslTermsLookup {
  index: IndexName;
  id: Id;
  path: Field;
  routing?: Routing;
}

export type QueryDslTermsQueryField = FieldValue[] | QueryDslTermsLookup;

export type QueryDslTermsQuery = QueryDslTermsQueryKeys & {
  [property: string]: QueryDslTermsQueryField | float | string;
};
export interface QueryDslTermsSetQuery extends QueryDslQueryBase {
  minimum_should_match?: MinimumShouldMatch;
  minimum_should_match_field?: Field;
  minimum_should_match_script?: Script | string;
  terms: string[];
}
export type QueryDslTextQueryType =
  | 'best_fields'
  | 'most_fields'
  | 'cross_fields'
  | 'phrase'
  | 'phrase_prefix'
  | 'bool_prefix';
export interface QueryDslMultiMatchQuery extends QueryDslQueryBase {
  analyzer?: string;
  auto_generate_synonyms_phrase_query?: boolean;
  cutoff_frequency?: double;
  fields?: Fields;
  fuzziness?: Fuzziness;
  fuzzy_rewrite?: MultiTermQueryRewrite;
  fuzzy_transpositions?: boolean;
  lenient?: boolean;
  max_expansions?: integer;
  minimum_should_match?: MinimumShouldMatch;
  operator?: QueryDslOperator;
  prefix_length?: integer;
  query: string;
  slop?: integer;
  tie_breaker?: double;
  type?: QueryDslTextQueryType;
  zero_terms_query?: QueryDslZeroTermsQuery;
}
export type QueryDslLike = string | QueryDslLikeDocument;

export type QueryDslChildScoreMode = 'none' | 'avg' | 'sum' | 'max' | 'min';
export interface QueryDslNestedQuery extends QueryDslQueryBase {
  ignore_unmapped?: boolean;
  inner_hits?: SearchInnerHits;
  path: Field;
  query: QueryDslQueryContainer;
  score_mode?: QueryDslChildScoreMode;
}
export type VersionNumber = long;
export type VersionString = string;
export type VersionType = 'internal' | 'external' | 'external_gte' | 'force';

export interface QueryDslLikeDocument {
  doc?: any;
  fields?: Field[];
  _id?: Id;
  _index?: IndexName;
  per_field_analyzer?: Record<Field, string>;
  routing?: Routing;
  version?: VersionNumber;
  version_type?: VersionType;
}
export type AnalysisStopWords = string | string[];
export interface QueryDslMoreLikeThisQuery extends QueryDslQueryBase {
  analyzer?: string;
  boost_terms?: double;
  fail_on_unsupported_field?: boolean;
  fields?: Field[];
  include?: boolean;
  like: QueryDslLike | QueryDslLike[];
  max_doc_freq?: integer;
  max_query_terms?: integer;
  max_word_length?: integer;
  min_doc_freq?: integer;
  minimum_should_match?: MinimumShouldMatch;
  min_term_freq?: integer;
  min_word_length?: integer;
  routing?: Routing;
  stop_words?: AnalysisStopWords;
  unlike?: QueryDslLike | QueryDslLike[];
  version?: VersionNumber;
  version_type?: VersionType;
}
export interface QueryDslQueryStringQuery extends QueryDslQueryBase {
  allow_leading_wildcard?: boolean;
  analyzer?: string;
  analyze_wildcard?: boolean;
  auto_generate_synonyms_phrase_query?: boolean;
  default_field?: Field;
  default_operator?: QueryDslOperator;
  enable_position_increments?: boolean;
  escape?: boolean;
  fields?: Field[];
  fuzziness?: Fuzziness;
  fuzzy_max_expansions?: integer;
  fuzzy_prefix_length?: integer;
  fuzzy_rewrite?: MultiTermQueryRewrite;
  fuzzy_transpositions?: boolean;
  lenient?: boolean;
  max_determinized_states?: integer;
  minimum_should_match?: MinimumShouldMatch;
  phrase_slop?: double;
  query: string;
  quote_analyzer?: string;
  quote_field_suffix?: string;
  rewrite?: MultiTermQueryRewrite;
  tie_breaker?: double;
  time_zone?: TimeZone;
  type?: QueryDslTextQueryType;
}

export type SearchStringDistance =
  | 'internal'
  | 'damerau_levenshtein'
  | 'levenshtein'
  | 'jaro_winkler'
  | 'ngram';

export interface SearchRequest extends RequestBase {
  default_operator?: QueryDslOperator;
  aggregations?: Record<string, AggregationsAggregationContainer>;
  collapse?: SearchFieldCollapse;
  explain?: boolean;
  from?: integer;
  track_total_hits?: SearchTrackHits;
  query?: QueryDslQueryContainer;
  script_fields?: Record<string, ScriptField>;
  size?: integer;
  sort?: Sort;
  _source?: SearchSourceConfig;
  fields?: (QueryDslFieldAndFormat | Field)[];
}
export interface ExplainExplanation {
  description: string;
  details: ExplainExplanationDetail[];
  value: float;
}
export interface ExplainExplanationDetail {
  description: string;
  details?: ExplainExplanationDetail[];
  value: float;
}

export type AggregateName = string;

export interface SearchInnerHitsResult {
  hits: SearchHitsMetadata<any>;
}

export interface SearchNestedIdentity {
  field: Field;
  offset: integer;
  _nested?: SearchNestedIdentity;
}

export interface SearchHit<TDocument = unknown> {
  _index: IndexName;
  _id?: Id;
  _score?: double | null;
  _explanation?: ExplainExplanation;
  fields?: Record<string, any>;
  highlight?: Record<string, string[]>;
  inner_hits?: Record<string, SearchInnerHitsResult>;
  matched_queries?: string[] | Record<string, double>;
  _nested?: SearchNestedIdentity;
  _ignored?: string[];
  ignored_field_values?: Record<string, FieldValue[]>;
  _shard?: string;
  _node?: string;
  _routing?: string;
  _source?: TDocument;
  _rank?: integer;
  _seq_no?: SequenceNumber;
  _primary_term?: long;
  _version?: VersionNumber;
  sort?: SortResults;
  // GN specific
  view?: boolean;
  edit?: boolean;
  selected?: boolean;
  related?: Record<string, SearchHit<TDocument>[] | TDocument[]>;
  origin: 'catalog' | 'remote';
  properties?: Record<string, any>;
}
export type SearchTotalHitsRelation = 'eq' | 'gte';
export interface SearchTotalHits {
  relation: SearchTotalHitsRelation;
  value: long;
}
export interface SearchHitsMetadata<T = unknown> {
  total?: SearchTotalHits;
  hits: SearchHit<T>[];
  max_score?: double | null;
}

export type SearchResponse<
  TDocument = unknown,
  TAggregations = Record<AggregateName, AggregationsAggregate>,
> = SearchResponseBody<TDocument, TAggregations>;

export interface SearchResponseBody<
  TDocument = unknown,
  TAggregations = Record<AggregateName, AggregationsAggregate>,
> {
  took: long;
  timed_out: boolean;
  hits: SearchHitsMetadata<TDocument>;
  aggregations?: TAggregations;
  fields?: Record<string, any>;
}
