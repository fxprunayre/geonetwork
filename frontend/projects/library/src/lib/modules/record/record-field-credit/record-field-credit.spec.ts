import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordFieldCredit } from './record-field-credit';

describe('RecordFieldCredit', () => {
  let component: RecordFieldCredit;
  let fixture: ComponentFixture<RecordFieldCredit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordFieldCredit],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordFieldCredit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
