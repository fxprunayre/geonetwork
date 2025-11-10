import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrollSpy } from './scroll-spy';

describe('ScrollSpy', () => {
  let component: ScrollSpy;
  let fixture: ComponentFixture<ScrollSpy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollSpy],
    }).compileComponents();

    fixture = TestBed.createComponent(ScrollSpy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
