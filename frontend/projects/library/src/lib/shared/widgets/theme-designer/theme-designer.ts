import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidPaintRoller } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { Preset } from '@primeuix/themes/types';
import { ButtonModule } from 'primeng/button';
import { PrimeNG } from 'primeng/config';
import { FloatLabel } from 'primeng/floatlabel';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import {
  APPLICATION_CONFIGURATION,
  ApplicationConfiguration,
} from '../../../modules/config/config.loader';
import { ThemingService } from '../../theming-service';
import { ColorPicker } from '../color-picker/color-picker';

@Component({
  selector: 'app-theme-designer',
  standalone: true,
  viewProviders: [provideIcons({ faSolidPaintRoller })],
  imports: [
    ButtonModule,
    NgIcon,
    FormsModule,
    InputText,
    FloatLabel,
    ColorPicker,
    InputNumber,
    TranslatePipe,
  ],
  templateUrl: './theme-designer.html',
})
export class ThemeDesigner implements OnInit {
  theme = input.required<Preset>();

  primeng = inject(PrimeNG);
  themingService = inject(ThemingService);
  appConfig = inject(APPLICATION_CONFIGURATION);

  primaryColor = signal('#093564');
  surfaceColor = signal('#565658');
  infoColor = signal('#2563EB');
  successColor = signal('#10B981');
  warningColor = signal('#F59E0B');
  dangerColor = signal('#EF4444');
  backgroundColor = signal('#f1f5f9');
  bannerTextColor = signal('#ffffff');
  font = signal('Inter');
  borderRadius = signal(0);
  bannerBackground = signal('');

  themePropertiesByColor = {
    primary: 'myprimary',
    info: 'sky',
    success: 'green',
    warning: 'orange',
    danger: 'red',
    surface: 'slate',
  };

  ngOnInit() {
    this.initFromCssVariables();
    const config = this.appConfig().config;
    if (config?.bannerBackground) {
      this.bannerBackground.set(config.bannerBackground);
    }
    if (config?.bannerTextColor) {
      this.bannerTextColor.set(config.bannerTextColor);
    }
  }

  initFromCssVariables() {
    Object.entries(this.themePropertiesByColor).forEach(([key, colorName]) => {
      const cssVar = `--p-${colorName}-500`;
      const color = this.themingService.getCssVariable(cssVar);
      if (color) {
        (this as any)[key + 'Color'].set(color);
      }
    });

    this.font.set(this.themingService.getCssVariable('--app-font-family-sans'));
    const bannerTextColor = this.themingService
      .getCssVariable('--app-background-text-color')
      .trim();
    if (bannerTextColor) {
      this.bannerTextColor.set(bannerTextColor);
    }
    this.borderRadius.set(
      parseInt(this.themingService.getCssVariable('--p-border-radius-md'), 10) || 0,
    );
  }

  setTheme() {
    const t = JSON.parse(JSON.stringify(this.theme())) as Preset;
    if (!t) return;
    const primitive = (t.primitive as Record<string, any>) || (t.primitive = {});

    for (const [key, color] of Object.entries(this.themePropertiesByColor)) {
      primitive[color] = this.themingService.generateColorScale((this as any)[key + 'Color']());
    }

    primitive['borderRadius'] = {
      none: '0',
      xs: this.borderRadius() === 0 ? '0' : this.borderRadius() * 0.25 + 'px',
      sm: this.borderRadius() === 0 ? '0' : this.borderRadius() * 0.5 + 'px',
      md: this.borderRadius() === 0 ? '0' : this.borderRadius() * 1 + 'px',
      lg: this.borderRadius() === 0 ? '0' : this.borderRadius() * 2 + 'px',
      xl: this.borderRadius() === 0 ? '0' : this.borderRadius() * 3 + 'px',
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

    const currentConfig = this.appConfig() as ApplicationConfiguration;
    if (currentConfig.config) {
      currentConfig.config.theme = t;
      currentConfig.config.bannerBackground = this.bannerBackground();
      currentConfig.config.bannerTextColor = this.bannerTextColor();
      currentConfig.config.font = this.font();
      (this.appConfig as any).set({ ...currentConfig });
    }

    this.themingService.updateCssVariable('--app-font-family-sans', this.font());
    this.themingService.updateCssVariable('--app-background-text-color', this.bannerTextColor());
  }
}
