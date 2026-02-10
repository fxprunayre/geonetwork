import { Routes, UrlMatchResult, UrlSegment } from '@angular/router';
import { Home } from './components/home/home';
import { Search } from './components/search/search';
import { RecordComponent } from './components/record/record';
import { MultisearchTest } from './components/multisearch-test/multisearch-test';
import { MAP_SLUG, RECORD_SLUG, SEARCH_SLUG, SIGNIN_SLUG } from 'gn-library';
import { MapComponent } from './components/map/map';
import { EmptyComponent } from './components/empty/empty';
import { SigninComponent } from './components/signin/signin';

export function recordMatcher(url: UrlSegment[]): UrlMatchResult | null {
  if ((url.length === 2 || url.length === 3) && url[0].path === RECORD_SLUG) {
    return {
      consumed: url, // Consume all segments
      posParams: {
        uuid: url[1],
        tab: url[2] || new UrlSegment('', {}),
      },
    };
  }
  return null;
}

export const routes: Routes = [
  { path: '', component: Home },
  { path: SIGNIN_SLUG, component: SigninComponent },
  { path: SEARCH_SLUG, component: EmptyComponent },
  { path: MAP_SLUG, component: EmptyComponent },
  // { path: 'catalogue/record/:uuid', component: RecordComponent },
  {
    matcher: recordMatcher,
    component: RecordComponent,
  },
  { path: 'test', component: MultisearchTest },
  { path: '**', redirectTo: '' },
];
