import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { Component, DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideMockTranslateService } from '../../../shared/translate-service.mock';
import { provideMockSearchService } from '../../search/search-store.mock';
import { Aggregation } from './aggregation';

@Component({
  standalone: true,
  template: `<app-aggregation [keyName]="field" />`,
  imports: [Aggregation],
})
class TestHostComponent {
  field = 'resourceType';
}

describe('AggregationComponent', () => {
  let hostFixture: ComponentFixture<TestHostComponent>;
  let aggregationComponent: Aggregation;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideMockTranslateService(),
        provideMockSearchService(),
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    const componentDebugEl: DebugElement = hostFixture.debugElement.query(
      By.directive(Aggregation),
    );
    aggregationComponent = componentDebugEl.componentInstance;

    hostFixture.detectChanges();
  });

  it('should create', () => {
    expect(aggregationComponent).toBeTruthy();
  });
});
