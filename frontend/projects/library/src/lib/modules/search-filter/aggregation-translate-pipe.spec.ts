import { TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { provideMockTranslateService } from '../../shared/translate-service.mock';
import { AggregationTranslatePipe } from './aggregation-translate-pipe';

describe('AggregationTranslatePipe', () => {
  let pipe: AggregationTranslatePipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [provideMockTranslateService(), AggregationTranslatePipe],
    });
    pipe = TestBed.inject(AggregationTranslatePipe);
  });

  it('returns the translation for a known aggregation and value', () => {
    expect(pipe.transform('1', 'group')).toBe('Odatis');
  });

  it('returns the translation for a know value and unknown aggregation', () => {
    expect(pipe.transform('dataset', 'xyz')).toBe('Dataset');
  });

  it('returns the translation for a know value in local translations', () => {
    expect(pipe.transform('availableInServices', 'availableInViewService')).toBe('View service');
  });

  it('returns the value if translation is missing', () => {
    expect(pipe.transform('adz', 'xyz')).toBe('adz');
  });

  it('returns the number as is when value is a number', () => {
    expect(pipe.transform(42, 'isTemplate')).toBe('42');
  });
});
