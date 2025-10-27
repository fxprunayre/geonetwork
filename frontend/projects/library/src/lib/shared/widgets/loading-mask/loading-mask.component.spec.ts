import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingMask } from './loading-mask.component';

describe('LoadingComponent', () => {
  let component: LoadingMask;
  let fixture: ComponentFixture<LoadingMask>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingMask],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingMask);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
