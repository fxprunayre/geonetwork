import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordField } from './record-field';

describe('RecordField', () => {
  let component: RecordField;
  let fixture: ComponentFixture<RecordField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordField],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
