import { Component, OnInit } from '@angular/core';
import { AggregationsComponent, SearchActiveFilters } from 'gn-library';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.scss',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    AggregationsComponent,
    AggregationsComponent,
    SearchActiveFilters,
  ],
})
export class SidePanel {}
