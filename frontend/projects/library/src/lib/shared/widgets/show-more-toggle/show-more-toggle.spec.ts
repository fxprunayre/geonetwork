import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowMoreToggle } from './show-more-toggle';

describe('ShowMoreToggle', () => {
  let component: ShowMoreToggle;
  let fixture: ComponentFixture<ShowMoreToggle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowMoreToggle],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowMoreToggle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
