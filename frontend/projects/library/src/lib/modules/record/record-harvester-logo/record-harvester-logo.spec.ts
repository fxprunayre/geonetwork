import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordHarvesterLogo } from './record-harvester-logo';

describe('RecordFieldDates', () => {
  let component: RecordHarvesterLogo;
  let fixture: ComponentFixture<RecordHarvesterLogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordHarvesterLogo],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordHarvesterLogo);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('record', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
