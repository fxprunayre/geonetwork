import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatasourceSelect } from './datasource-select';

describe('DatasourceSelect', () => {
  let component: DatasourceSelect;
  let fixture: ComponentFixture<DatasourceSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatasourceSelect],
    }).compileComponents();

    fixture = TestBed.createComponent(DatasourceSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
