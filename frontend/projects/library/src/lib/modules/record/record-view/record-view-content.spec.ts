import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';
import { RecordViewContent } from './record-view-content';

describe('RecordViewContent', () => {
  let component: RecordViewContent;
  let fixture: ComponentFixture<RecordViewContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordViewContent],
      providers: [
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RecordViewContent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use dataset access label for dataset resource type', () => {
    fixture.componentRef.setInput('record', { resourceType: ['dataset'] } as any);

    expect(component.dataAccessSectionLabelKey()).toBe('record.view.section.datasetAccess');
  });

  it('should use service access label for service resource type', () => {
    fixture.componentRef.setInput('record', { resourceType: ['service'] } as any);

    expect(component.dataAccessSectionLabelKey()).toBe('record.view.section.serviceAccess');
  });

  it('should use software download label for software resource type', () => {
    fixture.componentRef.setInput('record', { resourceType: ['software'] } as any);

    expect(component.dataAccessSectionLabelKey()).toBe('record.view.section.softwareAccess');
  });

  it('should use software download label for application resource type', () => {
    fixture.componentRef.setInput('record', { resourceType: ['application'] } as any);

    expect(component.dataAccessSectionLabelKey()).toBe('record.view.section.softwareAccess');
  });

  it('should fallback to distributions label for unsupported resource type', () => {
    fixture.componentRef.setInput('record', { resourceType: ['map'] } as any);

    expect(component.dataAccessSectionLabelKey()).toBe('record.view.section.distributions');
  });
});
