import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateParser } from './date-parser';

describe('DateParser', () => {
  let component: DateParser;
  let fixture: ComponentFixture<DateParser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateParser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateParser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
