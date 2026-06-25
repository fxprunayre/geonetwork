import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideMockTranslateService } from '../../../shared/translate-service.mock';
import { provideMockSearchService } from '../../search/search-store.mock';
import { AggregationBucket } from './aggregation-bucket';

describe('AggregationBucket', () => {
  let component: AggregationBucket;
  let fixture: ComponentFixture<AggregationBucket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AggregationBucket],
      providers: [provideMockTranslateService(), provideMockSearchService()],
    }).compileComponents();

    fixture = TestBed.createComponent(AggregationBucket);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('keyName', 'resourceType');
    fixture.componentRef.setInput('bucket', {
      key: 'Test Key',
      doc_count: 10,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
