export * from './capabilities.service';
export * from './collection.service';
export * from './collections.service';
export * from './conformance.service';
export * from './indexingController.service';
export * from './meApi.service';
export * from './record.service';
export * from './records.service';
export * from './searchController.service';
export * from './sortables.service';
import { CapabilitiesService } from './capabilities.service';
import { CollectionService } from './collection.service';
import { CollectionsService } from './collections.service';
import { ConformanceService } from './conformance.service';
import { IndexingControllerService } from './indexingController.service';
import { MeApiService } from './meApi.service';
import { RecordService } from './record.service';
import { RecordsService } from './records.service';
import { SearchControllerService } from './searchController.service';
import { SortablesService } from './sortables.service';
export const APIS = [
  CapabilitiesService,
  CollectionService,
  CollectionsService,
  ConformanceService,
  IndexingControllerService,
  MeApiService,
  RecordService,
  RecordsService,
  SearchControllerService,
  SortablesService,
];
