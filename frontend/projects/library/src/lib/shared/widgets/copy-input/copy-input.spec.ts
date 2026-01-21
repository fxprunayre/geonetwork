import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideMockTranslateService } from '../../translate-service.mock.spec';
import { CopyInput } from './copy-input';

describe('CopyInput', () => {
  let component: CopyInput;
  let fixture: ComponentFixture<CopyInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideMockTranslateService()],
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
