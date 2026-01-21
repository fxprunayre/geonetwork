import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregationBucket } from './aggregation-bucket';
import { provideMockTranslateService } from '../../../shared/translate.service.mock.spec';
import { provideMockSearchService } from '../search.store.mock.spec';
import { signal } from '@angular/core';

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
