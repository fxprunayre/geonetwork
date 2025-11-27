import { Component, inject, input, signal } from '@angular/core';
import { PrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { ThemingService } from '../../theming.service';
import { ColorPicker } from '../color-picker/color-picker';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidPaintRoller } from '@ng-icons/font-awesome/solid';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { Popover } from 'primeng/popover';
import { InputText } from 'primeng/inputtext';
import { FloatLabel } from 'primeng/floatlabel';
import { Preset } from '@primeuix/themes/types';
import { InputNumber } from 'primeng/inputnumber';

@Component({
  selector: 'app-theme-designer',
  standalone: true,
  viewProviders: [provideIcons({ faSolidPaintRoller })],
  imports: [
    ButtonModule,
    NgIcon,
    FormsModule,
    Popover,
    InputText,
    FloatLabel,
    ColorPicker,
    InputNumber,
  ],
  templateUrl: './theme-designer.html',
})
export class ThemeDesigner {
  theme = input.required<Preset>();

  primeng = inject(PrimeNG);
  themingService = inject(ThemingService);

  primaryColor = signal('#093564');
  surfaceColor = signal('#565658');
  infoColor = signal('#2563EB');
  successColor = signal('#10B981');
  warningColor = signal('#F59E0B');
  dangerColor = signal('#EF4444');
  backgroundColor = signal('#f1f5f9');
  font = signal('Roboto, sans-serif');
  borderRadius = signal(0);

  themePropertiesByColor = {
    primary: 'myprimary',
    info: 'sky',
    success: 'green',
    warning: 'orange',
    danger: 'red',
    surface: 'slate',
  };

  setTheme() {
    const t = JSON.parse(JSON.stringify(this.theme())) as Preset;
    if (!t) return;
    const primitive = (t.primitive as Record<string, any>) || (t.primitive = {});

    for (const [key, color] of Object.entries(this.themePropertiesByColor)) {
      primitive[color] = this.themingService.generateColorScale((this as any)[key + 'Color']());
    }

    primitive['borderRadius'] = {
      none: '0',
      xs: this.borderRadius() === 0 ? '0' : this.borderRadius() * 1 + 'px',
      sm: this.borderRadius() === 0 ? '0' : this.borderRadius() * 2 + 'px',
      md: this.borderRadius() === 0 ? '0' : this.borderRadius() * 3 + 'px',
      lg: this.borderRadius() === 0 ? '0' : this.borderRadius() * 4 + 'px',
      xl: this.borderRadius() === 0 ? '0' : this.borderRadius() * 5 + 'px',
    };

    const semantic = (t.semantic as Record<string, any>) || (t.semantic = {});
    semantic['colorScheme'] = semantic['colorScheme'] || {};
    semantic['colorScheme']['light'] = semantic['colorScheme']['light'] || {};
    semantic['colorScheme']['light']['surface'] = this.themingService.generateColorScale(
      this.surfaceColor(),
    );

    console.log('Current theme', t);
    this.primeng.setThemeConfig({
      theme: {
        preset: definePreset(Aura, t),
        options: {
          darkModeSelector: '.no-dark-mode',
        },
      },
    });

    this.themingService.updateCssVariable('--app-font-family-sans', this.font());
  }
}
