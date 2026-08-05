import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordFieldTitle } from './record-field-title';

describe('RecordFieldTitle', () => {
  let component: RecordFieldTitle;
  let fixture: ComponentFixture<RecordFieldTitle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordFieldTitle],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordFieldTitle);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('record', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
