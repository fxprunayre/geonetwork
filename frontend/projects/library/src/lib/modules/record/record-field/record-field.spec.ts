import { EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecordField } from './record-field';

import {
  DefaultLangChangeEvent,
  LangChangeEvent,
  TranslateService,
  TranslationChangeEvent,
} from '@ngx-translate/core';
import { of } from 'rxjs';

describe('RecordField', () => {
  let component: RecordField;
  let fixture: ComponentFixture<RecordField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordField],
      providers: [
        {
          provide: TranslateService,
          useValue: {
            instant: (key: string) => key.toUpperCase(),
            get: (key: string) => of(key),
            getCurrentLang: () => 'fr',
            getParsedResult: (translations: any, key: any, _interpolateParams?: any) => key,
            onLangChange: new EventEmitter<LangChangeEvent>(),
            onTranslationChange: new EventEmitter<TranslationChangeEvent>(),
            onDefaultLangChange: new EventEmitter<DefaultLangChangeEvent>(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordField);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
