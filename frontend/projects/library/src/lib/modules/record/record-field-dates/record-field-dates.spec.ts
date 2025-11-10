import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordFieldDates } from './record-field-dates';

describe('RecordFieldDates', () => {
  let component: RecordFieldDates;
  let fixture: ComponentFixture<RecordFieldDates>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordFieldDates],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordFieldDates);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
