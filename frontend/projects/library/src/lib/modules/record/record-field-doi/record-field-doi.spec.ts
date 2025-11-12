import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordFieldDoi } from './record-field-doi';

describe('RecordFieldDoi', () => {
  let component: RecordFieldDoi;
  let fixture: ComponentFixture<RecordFieldDoi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordFieldDoi],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordFieldDoi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
