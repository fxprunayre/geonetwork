import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociatedPanel } from './associated-panel';

describe('AssociatedPanel', () => {
  let component: AssociatedPanel;
  let fixture: ComponentFixture<AssociatedPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociatedPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(AssociatedPanel);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('record', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
