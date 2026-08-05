import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faCircleCheck, faUser } from '@ng-icons/font-awesome/regular';
import { faSolidReply } from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MeResponse, RatingCriteria, UserFeedbackDTO } from 'gn4-api-client';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Rating } from 'primeng/rating';
import { TextareaModule } from 'primeng/textarea';
import { TranslationsService } from '../i18n/translations-service';

export interface NewFeedbackPayload {
  comment: string;
  parentUuid?: string;
  rating: Record<string, number>;
  ratingAverage: number;
  authorName?: string;
  authorEmail?: string;
  authorOrganization?: string;
  optionPrivacy?: boolean;
}

@Component({
  selector: 'app-feedback-new-form',
  imports: [
    ButtonModule,
    FormsModule,
    InputText,
    Message,
    Rating,
    TextareaModule,
    TranslatePipe,
    NgIcon,
  ],
  viewProviders: [provideIcons({ faUser, faCircleCheck, faSolidReply })],
  templateUrl: './feedback-new-form.html',
})
export class FeedbackNewForm {
  private readonly translate = inject(TranslateService);
  private readonly translationsService = inject(TranslationsService);

  criteria = input<Array<RatingCriteria>>([]);
  parentComment = input<UserFeedbackDTO | null>(null);
  isAuthenticated = input(false);
  currentUser = input<MeResponse | null>(null);
  submitting = input(false);

  submitFeedback = output<NewFeedbackPayload>();
  cancelReply = output<void>();

  commentText = '';
  authorName = '';
  authorEmail = '';
  authorOrganization = '';
  optionPrivacy = false;
  validationErrorKey = signal('');

  ratings: Record<string, number> = {};

  readonly ratingAverage = computed(() => {
    const values = this.criteria()
      .filter((criterion) => !this.isAverageCriterion(criterion))
      .map((criterion) => this.getRatingValue(criterion))
      .filter((value) => value > 0);

    if (!values.length) {
      return 0;
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    return Number((total / values.length).toFixed(1));
  });

  constructor() {
    effect(() => {
      const criteria = this.criteria();
      const nextRatings: Record<string, number> = {};

      for (const criterion of criteria) {
        const key = this.getCriterionKey(criterion);
        if (!key) {
          continue;
        }
        nextRatings[key] = this.ratings[key] ?? 0;
      }

      this.ratings = nextRatings;
    });
  }

  getCriterionKey(criterion: RatingCriteria): string | null {
    if (criterion.id === undefined || criterion.id === null) {
      return null;
    }
    return String(criterion.id);
  }

  getRatingValue(criterion: RatingCriteria): number {
    const key = this.getCriterionKey(criterion);
    if (!key) {
      return 0;
    }
    return this.ratings[key] ?? 0;
  }

  setRatingValue(criterion: RatingCriteria, value: number) {
    const key = this.getCriterionKey(criterion);
    if (!key) {
      return;
    }

    // Average is derived from all other criteria and should not be set directly.
    if (this.isAverageCriterion(criterion)) {
      return;
    }

    const nextRatings: Record<string, number> = {
      ...this.ratings,
      [key]: Number(value),
    };

    const averageCriterion = this.criteria().find((item) => this.isAverageCriterion(item));
    const averageKey = averageCriterion ? this.getCriterionKey(averageCriterion) : null;

    if (averageKey) {
      nextRatings[averageKey] = this.computeAverageFromNonAverageCriteria(nextRatings);
    }

    this.ratings = nextRatings;
  }

  private isAverageCriterion(criterion: RatingCriteria): boolean {
    return (criterion.name || '').trim().toLowerCase() === 'average';
  }

  private computeAverageFromNonAverageCriteria(ratings: Record<string, number>): number {
    const values = this.criteria()
      .filter((criterion) => !this.isAverageCriterion(criterion))
      .map((criterion) => {
        const criterionKey = this.getCriterionKey(criterion);
        if (!criterionKey) {
          return 0;
        }
        return ratings[criterionKey] ?? 0;
      })
      .filter((criterionValue) => criterionValue > 0);

    if (!values.length) {
      return 0;
    }

    const total = values.reduce((sum, criterionValue) => sum + criterionValue, 0);
    return Number((total / values.length).toFixed(1));
  }

  getCriterionLabel(criterion: RatingCriteria): string {
    const raw = this.getLocalizedCriterionText(criterion);
    if (!raw) {
      return criterion.name || 'Rating';
    }
    return raw.split('#')[0]?.trim() || criterion.name || 'Rating';
  }

  getCriterionTooltip(criterion: RatingCriteria): string {
    const raw = this.getLocalizedCriterionText(criterion);
    if (!raw) {
      return '';
    }
    const parts = raw.split('#');
    return parts.slice(1).join('#').trim();
  }

  private getLocalizedCriterionText(criterion: RatingCriteria): string {
    const labels = criterion.label;
    if (!labels) {
      return '';
    }

    const iso2language = this.translate.getCurrentLang() || 'en';
    const language = this.translationsService.getIso3Code(iso2language);
    const localized = labels[language] || labels[language.split('-')[0]] || labels['eng'];
    if (localized) {
      return localized;
    }

    const fallback = Object.values(labels)[0];
    return fallback || '';
  }

  submit() {
    this.validationErrorKey.set('');

    const trimmedComment = this.commentText.trim();
    if (!trimmedComment) {
      return;
    }

    if (!this.isAuthenticated()) {
      const trimmedName = this.authorName.trim();
      const trimmedEmail = this.authorEmail.trim();
      const trimmedOrganization = this.authorOrganization.trim();

      if (!trimmedName || !trimmedEmail || !trimmedOrganization) {
        this.validationErrorKey.set('feedbacks.form.errors.requiredGuestFields');
        return;
      }

      if (!this.isValidEmail(trimmedEmail)) {
        this.validationErrorKey.set('feedbacks.form.errors.invalidEmail');
        return;
      }
    }

    const parentUuid = this.parentComment()?.uuid;

    this.submitFeedback.emit({
      comment: trimmedComment,
      parentUuid,
      rating: this.ratings,
      ratingAverage: this.ratingAverage(),
      authorName: this.authorName.trim() || undefined,
      authorEmail: this.authorEmail.trim() || undefined,
      authorOrganization: this.authorOrganization.trim() || undefined,
      optionPrivacy: this.optionPrivacy,
    });

    this.commentText = '';
    this.ratings = Object.fromEntries(Object.keys(this.ratings).map((key) => [key, 0]));

    if (!this.isAuthenticated()) {
      this.authorName = '';
      this.authorEmail = '';
      this.authorOrganization = '';
      this.optionPrivacy = false;
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  getAuthenticatedDisplayName() {
    const user = this.currentUser();
    if (!user) {
      return '';
    }

    const fullName = [user.name, user.surname].filter(Boolean).join(' ').trim();
    return fullName || user.username || '';
  }
}
