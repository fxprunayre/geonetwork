import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';
import { RecordHarvesterLogo } from './record-harvester-logo';

describe('RecordFieldDates', () => {
  let component: RecordHarvesterLogo;
  let fixture: ComponentFixture<RecordHarvesterLogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordHarvesterLogo],
      providers: [{ provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) }],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordHarvesterLogo);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('record', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
