import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordFieldVocabulary } from './record-field-vocabulary';

describe('RecordFieldVocabulary', () => {
  let component: RecordFieldVocabulary;
  let fixture: ComponentFixture<RecordFieldVocabulary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordFieldVocabulary],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordFieldVocabulary);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('record', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
