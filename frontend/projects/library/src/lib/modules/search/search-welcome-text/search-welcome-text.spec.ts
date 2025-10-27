import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchWelcomeText } from './search-welcome-text';

describe('SearchWelcomeText', () => {
  let component: SearchWelcomeText;
  let fixture: ComponentFixture<SearchWelcomeText>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchWelcomeText],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchWelcomeText);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
