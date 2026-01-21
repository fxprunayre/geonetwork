import { Routes, UrlMatchResult, UrlSegment } from '@angular/router';
import { Home } from './components/home/home';
import { Search } from './components/search/search';
import { ResultDetailComponent } from './components/result-detail/result-detail';
import { MultisearchTest } from './components/multisearch-test/multisearch-test';
import { RECORD_SLUG, SEARCH_SLUG } from 'gn-library';

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
  { path: SEARCH_SLUG, component: Search },
  // { path: 'catalogue/record/:uuid', component: ResultDetailComponent },
  {
    matcher: recordMatcher,
    component: ResultDetailComponent,
  },
  { path: 'test', component: MultisearchTest },
  { path: '**', redirectTo: '' },
];
