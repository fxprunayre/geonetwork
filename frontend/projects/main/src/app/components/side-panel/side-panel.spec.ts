import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidePanel } from './side-panel';
import { MockProvider } from 'ng-mocks';
import { TranslateService } from '@ngx-translate/core';

describe('SidePanel', () => {
  let component: SidePanel;
  let fixture: ComponentFixture<SidePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidePanel],
      providers: [
        MockProvider(TranslateService, {
          instant: (key: string) => key.toUpperCase(),
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidePanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
