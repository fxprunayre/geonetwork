import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageService } from 'primeng/api';
import { provideMockTranslateService } from '../../translate-service.mock';
import { CopyInput } from './copy-input';

describe('CopyInput', () => {
  let component: CopyInput;
  let fixture: ComponentFixture<CopyInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideMockTranslateService(), MessageService],
      imports: [CopyInput],
    }).compileComponents();

    fixture = TestBed.createComponent(CopyInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
