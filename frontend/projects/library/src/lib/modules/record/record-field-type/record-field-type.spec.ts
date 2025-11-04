import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordFieldType } from './record-field-type';

describe('RecordFieldType', () => {
  let component: RecordFieldType;
  let fixture: ComponentFixture<RecordFieldType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordFieldType],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordFieldType);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('record', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
