import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchRouteService } from './search-route-service';

@Injectable()
export class SearchRouteSyncService {
  activeRoute = inject(ActivatedRoute);
  router = inject(Router);
  searchRouteService = inject(SearchRouteService);
}
