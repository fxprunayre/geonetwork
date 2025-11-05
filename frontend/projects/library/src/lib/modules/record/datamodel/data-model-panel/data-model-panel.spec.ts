import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataModelPanel } from './data-model-panel';

describe('DataModelPanel', () => {
  let component: DataModelPanel;
  let fixture: ComponentFixture<DataModelPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataModelPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(DataModelPanel);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('record', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
