import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Perspective } from './perspective';

describe('Perspective', () => {
  let component: Perspective;
  let fixture: ComponentFixture<Perspective>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Perspective],
    }).compileComponents();

    fixture = TestBed.createComponent(Perspective);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
