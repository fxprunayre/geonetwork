import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordField } from './record-field';
import { MockProvider } from 'ng-mocks';
import { TranslateService } from '@ngx-translate/core';

describe('RecordField', () => {
  let component: RecordField;
  let fixture: ComponentFixture<RecordField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordField],
      providers: [
        MockProvider(TranslateService, {
          instant: (key: string) => key.toUpperCase(),
        }),
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
