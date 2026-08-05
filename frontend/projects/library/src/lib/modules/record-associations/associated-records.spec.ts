import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMarkdown } from 'ngx-markdown';
import { provideMockTranslateService } from '../../shared/translate-service.mock';

import { AssociatedRecords } from './associated-records';

describe('AssociatedRecordsPanel', () => {
  let component: AssociatedRecords;
  let fixture: ComponentFixture<AssociatedRecords>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssociatedRecords],
      providers: [provideMockTranslateService(), provideMarkdown()],
    }).compileComponents();

    fixture = TestBed.createComponent(AssociatedRecords);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
