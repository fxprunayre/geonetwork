import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregationsPanel } from './aggregations-panel.component';
import { provideMockTranslateService } from '../../../shared/translate-service.mock.spec';
import { provideMockSearchService } from '../search-store.mock.spec';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

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
