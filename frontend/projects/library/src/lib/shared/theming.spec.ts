import { TestBed } from '@angular/core/testing';

import { ThemingService } from './theming.service';

describe('Theming', () => {
  let service: ThemingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemingService);
  });
});
