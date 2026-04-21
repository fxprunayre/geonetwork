import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { RegistriesService } from 'gn4-api-client';
import { of } from 'rxjs';
import { provideMockTranslateService } from '../../../shared/translate-service.mock.spec';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';
import { provideMockSearchService } from '../../search/search-store.mock.spec';
import { KeywordList } from './keyword-list';

describe('KeywordList', () => {
  let component: KeywordList;
  let fixture: ComponentFixture<KeywordList>;

  beforeEach(async () => {
    let mockRegistriesService = jasmine.createSpyObj('RegistriesService', ['searchKeywords']);
    mockRegistriesService.searchKeywords.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      providers: [
        provideMockSearchService(),
        provideMockTranslateService(),
        { provide: RegistriesService, useValue: mockRegistriesService },
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
      ],
      imports: [KeywordList],
    }).compileComponents();

    fixture = TestBed.createComponent(KeywordList);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('vocabulary', {
      title: 'Multilingual Title',
      keywords: [],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
