import '@angular/compiler';

import {
  createEnvironmentInjector,
  EnvironmentInjector,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { Link } from 'gn-api-client';
import { APPLICATION_CONFIGURATION } from '../config/config.loader';
import { DEFAULT_TEST_CONFIG } from '../config/fixtures';
import { MapService } from './map-service';

const mocks = vi.hoisted(() => ({
  wfsEndpoint: vi.fn(),
  wmsEndpoint: vi.fn(),
  wmtsEndpoint: vi.fn(),
}));

vi.mock('@camptocamp/ogc-client', () => {
  mocks.wfsEndpoint.mockImplementation(() => {
    return {
      isReady: vi.fn().mockResolvedValue(undefined),
      getServiceInfo: vi.fn().mockReturnValue({
        outputFormats: ['text/xml; subtype=gml/3.1.1', 'application/json'],
      }),
    };
  });

  mocks.wmsEndpoint.mockImplementation((url: string) => {
    return {
      isReady: vi.fn().mockImplementation(() => {
        if (url.startsWith('/geonetwork/proxy?url=')) {
          return Promise.resolve();
        }

        return Promise.reject(new Error('CORS'));
      }),
      getFlattenedLayers: vi.fn().mockReturnValue([{ name: 'layer-a', title: 'Layer A' }]),
    };
  });

  mocks.wmtsEndpoint.mockImplementation(() => {
    return {
      isReady: vi.fn().mockResolvedValue(undefined),
      getLayers: vi.fn().mockReturnValue([]),
    };
  });

  return {
    WfsEndpoint: mocks.wfsEndpoint,
    WmsEndpoint: mocks.wmsEndpoint,
    WmtsEndpoint: mocks.wmtsEndpoint,
  };
});

describe('MapService', () => {
  let service: MapService;

  beforeEach(() => {
    mocks.wfsEndpoint.mockClear();
    mocks.wmsEndpoint.mockClear();
    mocks.wmtsEndpoint.mockClear();

    const appConfiguration = {
      config: {
        ...(DEFAULT_TEST_CONFIG as unknown as Record<string, unknown>),
        proxyUrl: '/geonetwork/proxy?url=',
      },
      space: 'srv',
      catalogueUrl: '/',
    };

    const injector = createEnvironmentInjector(
      [
        {
          provide: Router,
          useValue: {
            navigate: vi.fn(),
          },
        },
        {
          provide: APPLICATION_CONFIGURATION,
          useValue: signal(appConfiguration),
        },
      ],
      undefined as unknown as EnvironmentInjector,
    );

    service = runInInjectionContext(injector, () => new MapService());
  });

  it('retries WMS capabilities through the configured proxy when the direct request fails', async () => {
    const link = {
      protocol: 'OGC:WMS',
      urlObject: {
        default: 'https://example.org/wms',
      },
    } as Link;

    const layers = await service.resolveEndpointLayers(link);

    expect(layers).toEqual([{ name: 'layer-a', title: 'Layer A' }]);
    expect(mocks.wmsEndpoint).toHaveBeenCalledTimes(2);
    expect(mocks.wmsEndpoint.mock.calls[0][0]).toBe('https://example.org/wms');
    expect(mocks.wmsEndpoint.mock.calls[1][0]).toBe(
      '/geonetwork/proxy?url=https%3A%2F%2Fexample.org%2Fwms',
    );
  });

  it('detects GeoJSON output support on WFS services', async () => {
    const supported = await service.supportsWfsGeoJsonOutput({
      protocol: 'OGC:WFS',
      urlObject: { default: 'https://example.org/wfs' },
    } as Link);

    expect(supported).toBe(true);
    expect(mocks.wfsEndpoint).toHaveBeenCalledWith('https://example.org/wfs');
  });
});
