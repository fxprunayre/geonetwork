import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideMockTranslateService } from '../../../shared/translate-service.mock';
import { provideMockSearchService } from '../../search/search-store.mock';
import { AggregationsPanel } from './aggregations-panel.component';

describe('AggregationsComponent', () => {
  let component: AggregationsPanel;
  let fixture: ComponentFixture<AggregationsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AggregationsPanel],
      providers: [
        provideMockTranslateService(),
        provideMockSearchService(),
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AggregationsPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
