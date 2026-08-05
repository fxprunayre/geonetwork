import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarkdownService } from 'ngx-markdown';
import { provideMockTranslateService } from '../../../shared/translate-service.mock';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';
import { RecordViewHeader } from './record-view-header';

describe('RecordViewHeader', () => {
  let component: RecordViewHeader;
  let fixture: ComponentFixture<RecordViewHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordViewHeader],
      providers: [
        provideMockTranslateService(),
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
        {
          provide: MarkdownService,
          useValue: {
            compile: (text: string) => text,
            parse: (text: string) => text,
            render: (text: string) => text,
          },
        },
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
