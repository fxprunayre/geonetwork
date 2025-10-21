import { Routes, UrlMatchResult, UrlSegment } from '@angular/router';
import { HomeComponent } from './components/home-component/home-component';
import { CatalogueComponent } from './components/catalogue-component/catalogue-component';
import { MapComponent } from './components/map-component/map-component';
import { ResultDetailComponent } from './components/result-detail/result-detail';

export function recordMatcher(url: UrlSegment[]): UrlMatchResult | null {
  if (url.length === 3 && url[0].path === 'search' && url[1].path === 'record') {
    return {
      consumed: url, // Consume all three segments
      posParams: {
        uuid: url[2],
      },
    };
  }
  return null;
}

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: CatalogueComponent },
  // { path: 'catalogue/record/:uuid', component: ResultDetailComponent },
  {
    matcher: recordMatcher,
    component: ResultDetailComponent,
  },
  { path: 'map', component: MapComponent },
  { path: '**', redirectTo: '' },
];
