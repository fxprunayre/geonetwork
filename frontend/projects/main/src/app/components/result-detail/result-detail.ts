import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonIcon, ButtonLabel, ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidArrowLeft } from '@ng-icons/font-awesome/solid';
import { RecordViewComponent } from 'gn-library';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    TranslatePipe,
  ],
  viewProviders: [
    provideIcons({
      faSolidArrowLeft,
    }),
  ],
  templateUrl: './result-detail.html',
})
export class ResultDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  uuid = signal<string | null>(null);

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      console.log(params);
      this.uuid.set(params.get('uuid'));
    });
  }

  goBack() {
    this.router.navigate(['/search']);
  }
}
