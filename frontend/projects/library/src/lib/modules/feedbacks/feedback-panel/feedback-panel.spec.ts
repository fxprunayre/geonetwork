import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideMockTranslateService } from '../../../shared/translate-service.mock.spec';
import { FeedbackPanel } from './feedback-panel';

describe('FeedbackPanel', () => {
  let component: FeedbackPanel;
  let fixture: ComponentFixture<FeedbackPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackPanel],
      providers: [provideMockTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
