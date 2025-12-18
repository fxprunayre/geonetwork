import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordFieldContact } from './record-field-contact';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';

describe('RecordFieldContact', () => {
  let component: RecordFieldContact;
  let fixture: ComponentFixture<RecordFieldContact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordFieldContact],
      providers: [{ provide: APPLICATION_CONFIGURATION, useValue: DEFAULT_TEST_CONFIG }],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordFieldContact);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('record', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
