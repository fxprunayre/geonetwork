import { Injectable } from '@angular/core';
import chroma from 'chroma-js';

@Injectable({
  providedIn: 'root',
})
export class ThemingService {
  generateColorScale(baseColor: string, steps?: number): Record<number, string> {
    const stepValues = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    const scale = chroma.scale(['white', baseColor, 'black']).mode('lab').colors(stepValues.length);
    const colorMap: Record<number, string> = {};

    stepValues.forEach((value, index) => {
      colorMap[value] = scale[index];
    });

    return colorMap;
  }
}
