import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordDistributionFieldBase } from './record-distribution-field-base';

describe('RecordDistributionFieldBase', () => {
  let component: RecordDistributionFieldBase;
  let fixture: ComponentFixture<RecordDistributionFieldBase>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordDistributionFieldBase],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordDistributionFieldBase);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
