import { TestBed } from '@angular/core/testing';
import chroma from 'chroma-js';

import { ThemingService } from './theming.service';

describe('Theming', () => {
  let service: ThemingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemingService);
  });

  it('500 step should match the provided base color (normalized)', () => {
    const base = '#093564';
    const scale = service.generateColorScale(base);
    expect(scale[500].toLowerCase()).toBe(chroma(base).hex().toLowerCase());
  });

  it('all generated colors should be valid 6-digit hex strings', () => {
    const scale = service.generateColorScale('#093564');
    const hexRegex = /^#([0-9a-f]{6})$/i;
    Object.values(scale).forEach((value) => {
      expect(typeof value).toBe('string');
      expect(hexRegex.test(value)).toBeTrue();
    });
  });

  it('should throw when provided an invalid base color', () => {
    expect(() => service.generateColorScale('not-a-color')).toThrow();
  });
});
