import { Component } from '@angular/core';
import { AggregationsPanel, SearchActiveFilters } from 'gn-library';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.html',
  standalone: true,
  imports: [FormsModule, CommonModule, AggregationsPanel],
})
export class SidePanel {}
