import { Component, input, model } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ColorPicker as PrimeNGColorPicker } from 'primeng/colorpicker';
import { FloatLabel } from 'primeng/floatlabel';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Popover } from 'primeng/popover';

@Component({
  selector: 'app-color-picker',
  imports: [
    PrimeNGColorPicker,
    FloatLabel,
    InputGroup,
    InputGroupAddon,
    InputText,
    Popover,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './color-picker.html',
})
export class ColorPicker {
  label = input('Pick a color');
  color = model('#ffffff');
}
