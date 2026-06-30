import { TestBed } from '@angular/core/testing';
import { provideMockTranslateService } from '../../../shared/translate-service.mock';
import { SearchWelcomeTextPipe } from './search-welcome-text-pipe';

describe('SearchWelcomeTextPipe', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockTranslateService()],
    });
  });

  it('create an instance', () => {
    TestBed.runInInjectionContext(() => {
      const pipe = new SearchWelcomeTextPipe();
      expect(pipe).toBeTruthy();
    });
  });
});
