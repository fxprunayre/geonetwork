import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBase } from './search-base';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideMockTranslateService } from '../../../shared/translate-service.mock';
import { provideMockSearchService } from '../search-store.mock';

@Component({
  standalone: true,
  hostDirectives: [SearchBase],
  template: '',
})
class TestHostComponent {
  scope = input<string>('main');
}

describe('SearchBase', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        provideMockTranslateService(),
        provideMockSearchService(),
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
