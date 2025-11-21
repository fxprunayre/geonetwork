import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeDesigner } from './theme-designer';

describe('ThemeDesigner', () => {
  let component: ThemeDesigner;
  let fixture: ComponentFixture<ThemeDesigner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeDesigner],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeDesigner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
