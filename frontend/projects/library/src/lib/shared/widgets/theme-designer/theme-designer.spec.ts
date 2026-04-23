import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { APPLICATION_CONFIGURATION } from '../../../modules/config/config.loader';
import { DEFAULT_THEME } from '../../../modules/config/default-theme';
import { ThemeDesigner } from './theme-designer';

describe('ThemeDesigner', () => {
  let component: ThemeDesigner;
  let fixture: ComponentFixture<ThemeDesigner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeDesigner],
      providers: [
        {
          provide: APPLICATION_CONFIGURATION,
          useValue: signal({ config: { theme: DEFAULT_THEME } }),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeDesigner);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('theme', DEFAULT_THEME);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
