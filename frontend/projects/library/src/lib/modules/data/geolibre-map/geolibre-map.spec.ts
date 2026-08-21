import '@angular/compiler';

import { describe, expect, it } from 'vitest';

import { buildGeoLibreEmbedUrl, buildGeoLibreProjectUrl } from './geolibre-map';

describe('buildGeoLibreEmbedUrl', () => {
  it('preserves existing query parameters while appending settingUrl', () => {
    const url = buildGeoLibreEmbedUrl({
      embedUrl: 'https://example.com/geolibre/?embed=1&foo=bar',
      settingUrl: 'https://example.com/settings.json',
    });

    expect(url).toBe(
      'https://example.com/geolibre/?embed=1&foo=bar&settingUrl=https%3A%2F%2Fexample.com%2Fsettings.json',
    );
  });

  it('falls back to the default GeoLibre URL when no embedUrl is configured', () => {
    const url = buildGeoLibreEmbedUrl({
      settingUrl: 'https://example.com/settings.json',
      embedUrl: '',
    });

    expect(url).toBe(
      'https://web.geolibre.app/?embed=1&settingUrl=https%3A%2F%2Fexample.com%2Fsettings.json',
    );
  });
});

describe('buildGeoLibreProjectUrl', () => {
  it('keeps existing embed query params and injects the project url param', () => {
    const url = buildGeoLibreProjectUrl(
      'https://example.com/geolibre/?embed=1&foo=bar',
      '/project.json',
    );

    expect(url).toBe(
      'https://example.com/geolibre/?embed=1&foo=bar&url=http%3A%2F%2Flocalhost%2Fproject.json',
    );
  });

  it('accepts an absolute projectUrl without disturbing the embed URL', () => {
    const url = buildGeoLibreProjectUrl(
      'https://example.com/geolibre/?embed=1',
      'https://cdn.example.com/project.json',
    );

    expect(url).toBe(
      'https://example.com/geolibre/?embed=1&url=https%3A%2F%2Fcdn.example.com%2Fproject.json',
    );
  });
});
