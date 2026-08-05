import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoResultFound } from './no-result-found';

describe('NoResultFound', () => {
  let component: NoResultFound;
  let fixture: ComponentFixture<NoResultFound>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoResultFound],
    }).compileComponents();

    fixture = TestBed.createComponent(NoResultFound);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
