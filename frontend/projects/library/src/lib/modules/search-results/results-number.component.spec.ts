import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideMockTranslateService } from '../../shared/translate-service.mock';
import { provideMockSearchService } from '../search/search-store.mock';
import { ResultsNumberComponent } from './results-number.component';

describe('ResultsNumberComponent', () => {
  let component: ResultsNumberComponent;
  let fixture: ComponentFixture<ResultsNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsNumberComponent],
      providers: [provideMockSearchService(), provideMockTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
