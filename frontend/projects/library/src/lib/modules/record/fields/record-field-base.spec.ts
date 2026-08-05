import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordFieldBase } from './record-field-base';

describe('RecordFieldBase', () => {
  let component: RecordFieldBase;
  let fixture: ComponentFixture<RecordFieldBase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordFieldBase],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordFieldBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
