import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidComment, faSolidComments } from '@ng-icons/font-awesome/solid';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IndexRecord } from 'gn-api-client';
import {
  RatingAverage,
  RatingCriteria,
  UserFeedbackDTO,
  UserfeedbackService,
} from 'gn4-api-client';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Message } from 'primeng/message';
import { Rating } from 'primeng/rating';
import { Skeleton } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { catchError, finalize, forkJoin, of, switchMap } from 'rxjs';
import { AuthStore } from '../../authentication/auth.store';
import { FeedbackCommentNode } from '../feedback-comment-node';
import { FeedbackNewForm, NewFeedbackPayload } from '../feedback-new-form/feedback-new-form';
import { FeedbackThreadItem } from '../feedback-thread-item/feedback-thread-item';

@Component({
  selector: 'app-feedback-panel',
  imports: [
    ButtonModule,
    DialogModule,
    FeedbackNewForm,
    FeedbackThreadItem,
    FormsModule,
    Message,
    NgIcon,
    Skeleton,
    ToastModule,
    TranslatePipe,
    Rating,
  ],
  templateUrl: './feedback-panel.html',
  viewProviders: [provideIcons({ faSolidComment, faSolidComments })],
  providers: [MessageService],
})
export class FeedbackPanel {
  record = input<IndexRecord | undefined>();

  private readonly route = inject(ActivatedRoute);
  private readonly userfeedbackService = inject(UserfeedbackService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  readonly authStore = inject(AuthStore);

  comments = signal<Array<UserFeedbackDTO>>([]);
  ratingCriteria = signal<Array<RatingCriteria>>([]);
  metadataRating = signal<RatingAverage | null>(null);
  loading = signal(false);
  submitting = signal(false);
  errorMessage = signal('');
  feedbackDialogVisible = false;
  selectedParentCommentUuid = signal<string | null>(null);
  approvingCommentUuid = signal<string | null>(null);
  deletingCommentUuid = signal<string | null>(null);

  readonly canEditCurrentRecord = computed(
    () => this.authStore.isAuthenticated() && !!this.record()?.info?.edit,
  );

  readonly metadataUuid = computed(
    () => this.record()?.uuid || this.route.snapshot.paramMap.get('uuid') || '',
  );

  readonly commentTree = computed(() => this.buildCommentTree(this.comments()));

  readonly metadataReviewCount = computed(() => {
    const summary = this.metadataRating();
    return summary?.userfeedbackCount ?? summary?.ratingCount ?? this.comments().length;
  });

  readonly metadataAverage = computed(() => {
    const summary = this.metadataRating();
    const byCriteria = Object.values(summary?.ratingAverages || {}).filter((value) => value > 0);
    if (!byCriteria.length) {
      return 0;
    }
    const total = byCriteria.reduce((acc, value) => acc + value, 0);
    return Number((total / byCriteria.length).toFixed(1));
  });

  readonly replyTarget = computed(() => {
    const parentUuid = this.selectedParentCommentUuid();
    if (!parentUuid) {
      return null;
    }
    return this.comments().find((comment) => comment.uuid === parentUuid) ?? null;
  });

  constructor() {
    effect(() => {
      const uuid = this.metadataUuid();
      if (!uuid) {
        this.comments.set([]);
        this.ratingCriteria.set([]);
        this.metadataRating.set(null);
        return;
      }

      this.loadPanelData(uuid);
    });

    effect(() => {
      const errorMessage = this.errorMessage();
      if (!errorMessage) {
        return;
      }

      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('error'),
        detail: errorMessage,
      });
    });
  }

  private setError(errorKey: string) {
    this.errorMessage.set(this.translate.instant(errorKey));
  }

  private loadPanelData(metadataUuid: string) {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      criteria: this.userfeedbackService.getRatingCriteria().pipe(catchError(() => of([]))),
      comments: this.userfeedbackService
        .getUserCommentsOnARecord(metadataUuid, 200)
        .pipe(catchError(() => of([]))),
      metadataRating: this.userfeedbackService
        .getMetadataRating(metadataUuid)
        .pipe(catchError(() => of(null))),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ criteria, comments, metadataRating }) => {
          this.ratingCriteria.set(criteria || []);
          this.comments.set(this.sortComments(comments || []));
          this.metadataRating.set(metadataRating);
        },
        error: () => {
          this.setError('feedbacks.errors.loadRecord');
          this.ratingCriteria.set([]);
          this.comments.set([]);
          this.metadataRating.set(null);
        },
      });
  }

  private sortComments(comments: Array<UserFeedbackDTO>): Array<UserFeedbackDTO> {
    return [...comments].sort(
      (a, b) => this.getDateSortValue(b.date) - this.getDateSortValue(a.date),
    );
  }

  private getDateSortValue(date: string | undefined): number {
    if (!date) {
      return 0;
    }

    const timestamp = new Date(date).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  openNewFeedback() {
    this.selectedParentCommentUuid.set(null);
    this.feedbackDialogVisible = true;
  }

  startReply(parentUuid: string) {
    this.selectedParentCommentUuid.set(parentUuid);
    this.feedbackDialogVisible = true;
  }

  clearReplyTarget() {
    this.selectedParentCommentUuid.set(null);
  }

  onDialogClose() {
    this.clearReplyTarget();
  }

  cancelReplyFromDialog() {
    this.clearReplyTarget();
    this.feedbackDialogVisible = false;
  }

  approveFeedback(uuid: string) {
    this.approvingCommentUuid.set(uuid);
    this.userfeedbackService
      .publishFeedback(uuid)
      .pipe(finalize(() => this.approvingCommentUuid.set(null)))
      .subscribe({
        next: () => {
          this.updateComment(uuid, { showApproveButton: false, published: true });
        },
        error: () => {
          this.setError('feedbacks.errors.approve');
        },
      });
  }

  removeFeedback(uuid: string) {
    this.deletingCommentUuid.set(uuid);
    this.userfeedbackService
      .deleteUserFeedback(uuid)
      .pipe(finalize(() => this.deletingCommentUuid.set(null)))
      .subscribe({
        next: () => {
          const metadataUuid = this.metadataUuid();
          if (metadataUuid) {
            this.loadPanelData(metadataUuid);
            return;
          }

          this.comments.set(this.comments().filter((comment) => comment.uuid !== uuid));
        },
        error: () => {
          this.setError('feedbacks.errors.remove');
        },
      });
  }

  submitFeedback(payload: NewFeedbackPayload) {
    const metadataUuid = this.metadataUuid();
    if (!metadataUuid) {
      this.setError('feedbacks.errors.missingRecordUuid');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    const user = this.authStore.user();
    const dto: UserFeedbackDTO = {
      metadataUUID: metadataUuid,
      parentUuid: payload.parentUuid,
      comment: payload.comment,
      rating: payload.rating,
      ratingAVG: payload.ratingAverage,
      optionPrivacy: payload.optionPrivacy,
    };

    if (this.authStore.isAuthenticated() && user) {
      dto.authorName = [user.name, user.surname].filter(Boolean).join(' ').trim() || user.username;
      dto.authorEmail = user.email;
      dto.authorOrganization = user.organisation;
      dto.authorUserId = user.id ? Number(user.id) : undefined;
    } else {
      dto.authorName = payload.authorName;
      dto.authorEmail = payload.authorEmail;
      dto.authorOrganization = payload.authorOrganization;
    }

    this.userfeedbackService
      .newUserFeedback(dto)
      .pipe(
        switchMap((createdUuid) => {
          const uuid = this.normalizeCreatedUuid(createdUuid);
          if (!uuid) {
            return of(null);
          }
          return this.userfeedbackService.getUserComment(uuid);
        }),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: (createdComment) => {
          this.feedbackDialogVisible = false;
          this.selectedParentCommentUuid.set(null);
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('feedbacks.success.title'),
            detail: this.translate.instant('feedbacks.success.submittedModerationSoon'),
          });
          if (createdComment) {
            this.comments.set(this.sortComments([createdComment, ...this.comments()]));
            return;
          }
          this.loadPanelData(metadataUuid);
        },
        error: () => {
          this.setError('feedbacks.errors.create');
        },
      });
  }

  private normalizeCreatedUuid(rawUuid: string | null | undefined): string {
    if (!rawUuid) {
      return '';
    }
    return rawUuid.replaceAll('"', '').trim();
  }

  private updateComment(uuid: string, patch: Partial<UserFeedbackDTO>) {
    this.comments.set(
      this.comments().map((comment) =>
        comment.uuid === uuid ? { ...comment, ...patch } : comment,
      ),
    );
  }

  private buildCommentTree(comments: Array<UserFeedbackDTO>): Array<FeedbackCommentNode> {
    const nodeByUuid = new Map<string, FeedbackCommentNode>();
    const roots: Array<FeedbackCommentNode> = [];

    const sortedComments = this.sortComments(comments);
    for (const comment of sortedComments) {
      const uuid = comment.uuid;
      if (!uuid) {
        continue;
      }
      nodeByUuid.set(uuid, { comment, replies: [] });
    }

    for (const comment of sortedComments) {
      const uuid = comment.uuid;
      if (!uuid) {
        continue;
      }

      const node = nodeByUuid.get(uuid);
      if (!node) {
        continue;
      }

      const parentUuid = comment.parentUuid;
      if (parentUuid && nodeByUuid.has(parentUuid)) {
        nodeByUuid.get(parentUuid)?.replies.push(node);
      } else {
        roots.push(node);
      }
    }

    const sortRecursively = (nodes: Array<FeedbackCommentNode>) => {
      nodes.sort(
        (a, b) => this.getDateSortValue(b.comment.date) - this.getDateSortValue(a.comment.date),
      );
      for (const node of nodes) {
        sortRecursively(node.replies);
      }
    };

    sortRecursively(roots);
    return roots;
  }
}
