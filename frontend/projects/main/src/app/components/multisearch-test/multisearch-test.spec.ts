import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultisearchTest } from './multisearch-test';

describe('MultisearchTest', () => {
  let component: MultisearchTest;
  let fixture: ComponentFixture<MultisearchTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultisearchTest],
    }).compileComponents();

    fixture = TestBed.createComponent(MultisearchTest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
