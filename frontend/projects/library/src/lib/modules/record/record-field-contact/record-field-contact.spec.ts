import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordFieldContact } from './record-field-contact';

describe('RecordFieldContact', () => {
  let component: RecordFieldContact;
  let fixture: ComponentFixture<RecordFieldContact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordFieldContact],
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
