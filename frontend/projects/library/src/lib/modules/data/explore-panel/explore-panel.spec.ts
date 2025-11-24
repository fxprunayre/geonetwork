import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorePanel } from './explore-panel';

describe('ExplorePanel', () => {
  let component: ExplorePanel;
  let fixture: ComponentFixture<ExplorePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorePanel],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorePanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
