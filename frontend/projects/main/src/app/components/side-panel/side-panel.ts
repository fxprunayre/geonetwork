import { Component, OnInit } from '@angular/core';
import { AggregationsComponent } from 'gn-library';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface BucketUI {
  key: string;
  name: string;
  count: number;
}

interface AggregationBucket {
  key: string;
  doc_count: number;
}

interface AggregationsAggregate {
  buckets: AggregationBucket[];
}

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.scss',
  standalone: true,
  imports: [FormsModule, CommonModule, AggregationsComponent, AggregationsComponent],
})
export class SidePanel implements OnInit {
  selectedFilters: Record<string, Record<string, boolean>> = {};

  ngOnInit(): void {}
}
