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
}
