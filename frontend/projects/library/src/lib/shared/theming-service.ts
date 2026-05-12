import { Injectable } from '@angular/core';
import { palette } from '@primeuix/themes';

@Injectable({
  providedIn: 'root',
})
export class ThemingService {
  generateColorScale(baseColor: string) {
    return palette(baseColor);
  }

  updateCssVariable(variableName: string, cssValue: string): void {
    document.documentElement.style.setProperty(variableName, cssValue);
  }

  getCssVariable(variableName: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(variableName);
  }

  /**
   * Determines if a banner background value is a URL or a color code.
   * @param value The banner background value (URL or color)
   * @returns true if it's a URL, false if it's a color
   */
  isBannerBackgroundUrl(value: string): boolean {
    return /^(https?:\/\/|\/|.*\.)/.test(value);
  }

  /**
   * Converts a banner background value (URL or color) to CSS styles.
   * @param value The banner background value (URL or color)
   * @returns An object with 'background-image' for URLs or 'background-color' for colors
   */
  getBannerBackgroundStyle(value: string): Record<string, string> {
    if (!value) return {};
    if (this.isBannerBackgroundUrl(value)) {
      return {
        'background-image': `url(${value})`,
        'background-color': '#000000',
      };
    }
    return { 'background-color': value };
  }
}
