import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonIcon, ButtonLabel, ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowLeft } from '@ng-icons/font-awesome/solid';
import { RecordViewComponent } from 'gn-library';

@Component({
  selector: 'app-result-detail',
  standalone: true,
  imports: [
    RecordViewComponent,
    CommonModule,
    ButtonModule,
    ButtonLabel,
    ButtonIcon,
    CardModule,
    NgIcon,
  ],
  viewProviders: [
    provideIcons({
      faSolidArrowLeft,
    }),
  ],
  templateUrl: './result-detail.html',
})
export class ResultDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  uuid = signal<string | null>(null);
  ngOnInit() {
    this.uuid.set(this.route.snapshot.paramMap.get('uuid'));
  }

  goBack() {
    this.router.navigate(['/search']);
  }
}
