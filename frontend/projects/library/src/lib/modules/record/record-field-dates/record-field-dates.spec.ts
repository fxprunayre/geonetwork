import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideMockTranslateService } from '../../../shared/translate-service.mock.spec';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';
import { RecordFieldDates } from './record-field-dates';

describe('RecordFieldDates', () => {
  let component: RecordFieldDates;
  let fixture: ComponentFixture<RecordFieldDates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordFieldDates],
      providers: [
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
        provideMockTranslateService(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordFieldDates);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('record', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
