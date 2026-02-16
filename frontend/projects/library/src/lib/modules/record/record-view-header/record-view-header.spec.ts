import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarkdownService } from 'ngx-markdown';
import { provideMockTranslateService } from '../../../shared/translate-service.mock.spec';
import { RecordViewHeader } from './record-view-header';

describe('RecordViewHeader', () => {
  let component: RecordViewHeader;
  let fixture: ComponentFixture<RecordViewHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordViewHeader],
      providers: [
        provideMockTranslateService(),
        { provide: MarkdownService, useValue: { compile: (text: string) => text } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordViewHeader);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('record', {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
