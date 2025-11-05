import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociatedRecordsPanel } from './associated-records-panel';

describe('AssociatedRecordsPanel', () => {
  let component: AssociatedRecordsPanel;
  let fixture: ComponentFixture<AssociatedRecordsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociatedRecordsPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(AssociatedRecordsPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
