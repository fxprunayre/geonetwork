import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { WmsEndpoint } from '@camptocamp/ogc-client';
import { Configuration as GnConfiguration, Link } from 'gn-api-client';
import { Configuration as Gn4Configuration } from 'gn4-api-client';
import { provideMockTranslateService } from '../../../shared/translate-service.mock.spec';
import { APPLICATION_CONFIGURATION } from '../../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../../config/fixtures';
import { AddAllLayersToMap } from './add-all-layers-to-map';

describe('AddAllLayersToMap', () => {
  let component: AddAllLayersToMap;
  let fixture: ComponentFixture<AddAllLayersToMap>;

  beforeEach(async () => {
    spyOn(WmsEndpoint.prototype, 'isReady').and.resolveTo(undefined as any);
    spyOn(WmsEndpoint.prototype, 'getFlattenedLayers').and.returnValue([
      { name: 'layer-a', title: 'Layer A' },
      { name: 'layer-b', title: 'Layer B' },
    ] as any);

    await TestBed.configureTestingModule({
      imports: [AddAllLayersToMap],
      providers: [
        provideMockTranslateService(),
        { provide: APPLICATION_CONFIGURATION, useValue: signal(DEFAULT_TEST_CONFIG) },
        { provide: GnConfiguration, useValue: new GnConfiguration() },
        { provide: Gn4Configuration, useValue: new Gn4Configuration() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddAllLayersToMap);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('record', { uuid: 'record-1' } as any);
    fixture.componentRef.setInput('links', [
      {
        protocol: 'OGC:WMS',
        urlObject: { default: 'https://example.org/wms-a' },
        nameObject: { default: 'layer-a' },
      },
      {
        protocol: 'OGC:WMS',
        urlObject: { default: 'https://example.org/wms-b' },
        nameObject: { default: 'layer-b' },
      },
    ] as Link[]);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('enables the bulk action when all WMS layers are found', () => {
    expect(component.status()).toBe('found');
    expect(component.validLinks().length).toBe(2);
    expect(component.matchingLayersLabel()).toBe('Layer A, Layer B');
  });
});
