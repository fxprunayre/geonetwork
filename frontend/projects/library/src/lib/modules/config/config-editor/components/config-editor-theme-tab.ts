import { Component, Input } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { faSolidPaintRoller } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { Preset } from '@primeuix/themes/types';
import { ThemeDesigner } from '../../../../shared/widgets/theme-designer/theme-designer';

@Component({
  selector: 'app-config-editor-theme-tab',
  standalone: true,
  imports: [NgIconComponent, ThemeDesigner, TranslatePipe],
  viewProviders: [
    provideIcons({
      faSolidPaintRoller,
    }),
  ],
  template: `
    <div class="flex flex-col gap-4">
      <div class="text-xl font-bold mb-2 flex items-center">
        <ng-icon name="faSolidPaintRoller" class="mr-2"></ng-icon>
        {{ 'config.editor.themeConfiguration' | translate }}
      </div>
      <app-theme-designer [theme]="theme"></app-theme-designer>
    </div>
  `,
})
export class ConfigEditorThemeTabComponent {
  @Input({ required: true }) theme!: Preset;
}
