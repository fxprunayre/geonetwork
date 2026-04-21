import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideMockTranslateService } from '../../../shared/translate-service.mock.spec';
import { provideMockSearchService } from '../../search/search-store.mock.spec';
import { DatasourceSelect } from './datasource-select';

describe('DatasourceSelect', () => {
  let component: DatasourceSelect;
  let fixture: ComponentFixture<DatasourceSelect>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideMockTranslateService(), provideMockSearchService()],
      imports: [DatasourceSelect],
    }).compileComponents();

    fixture = TestBed.createComponent(DatasourceSelect);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
