import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { faSolidCode } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { IftaLabelModule } from 'primeng/iftalabel';
import { Panel } from 'primeng/panel';
import { TextareaModule } from 'primeng/textarea';
import { CopyInput } from '../../../../shared/widgets/copy-input/copy-input';

@Component({
  selector: 'app-config-editor-raw-tab',
  standalone: true,
  imports: [
    FormsModule,
    TextareaModule,
    IftaLabelModule,
    TranslatePipe,
    CopyInput,
    Panel,
    NgIconComponent,
  ],
  viewProviders: [
    provideIcons({
      faSolidCode,
    }),
  ],
  template: `
    <div class="flex flex-col gap-4">
      <div class="text-xl font-bold mb-2 flex items-center">
        <ng-icon name="faSolidCode" class="mr-2"></ng-icon>
        {{ 'config.editor.rawConfiguration' | translate }}
      </div>
      <p-iftalabel>
        <textarea
          pTextarea
          id="raw-config"
          [ngModel]="appConfigJson"
          (ngModelChange)="rawConfigChange.emit($event)"
          rows="25"
          style="resize: none; width: 100%; font-family: monospace; font-size: 0.875rem;"
        ></textarea>
        <label for="raw-config">{{ 'config.editor.fullJson' | translate }}</label>
      </p-iftalabel>

      <div class="text-xl font-bold mt-4">
        {{ 'config.editor.embedApplication' | translate }}
      </div>
      <app-copy-input [value]="embedSnippet" layout="buttonWithIcon"></app-copy-input>
      <p-panel class="bg-neutral-900! text-neutral-200! w-full overflow-auto">
        <pre class="">{{ embedSnippet }}</pre>
      </p-panel>
    </div>
  `,
})
export class ConfigEditorRawTabComponent {
  @Input({ required: true }) appConfigJson!: string;
  @Input({ required: true }) embedSnippet!: string;
  @Output() rawConfigChange = new EventEmitter<string>();
}
