import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociatedRecords } from './associated-records';

describe('AssociatedRecordsPanel', () => {
  let component: AssociatedRecords;
  let fixture: ComponentFixture<AssociatedRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociatedRecords],
    }).compileComponents();

    fixture = TestBed.createComponent(AssociatedRecords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
