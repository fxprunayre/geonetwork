import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortResults } from './sort-results';

describe('SortResults', () => {
  let component: SortResults;
  let fixture: ComponentFixture<SortResults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SortResults],
    }).compileComponents();

    fixture = TestBed.createComponent(SortResults);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
