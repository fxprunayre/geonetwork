import { Component, computed, forwardRef, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidReply } from '@ng-icons/font-awesome/solid';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { Rating } from 'primeng/rating';
import { TimeAgoPipe } from '../../shared/time-ago.pipe';
import { DeleteConfirmationDialog } from '../../shared/widgets/delete-confirmation-dialog/delete-confirmation-dialog';
import { FeedbackCommentNode } from './feedback-comment-node';
import { FeedbackModeration } from './feedback-moderation';

@Component({
  selector: 'app-feedback-thread-item',
  imports: [
    ButtonModule,
    Card,
    DeleteConfirmationDialog,
    FeedbackModeration,
    FormsModule,
    Rating,
    TimeAgoPipe,
    TranslatePipe,
    forwardRef(() => FeedbackThreadItem),
    NgIcon,
  ],
  viewProviders: [provideIcons({ faSolidReply })],
  templateUrl: './feedback-thread-item.html',
})
export class FeedbackThreadItem {
  node = input.required<FeedbackCommentNode>();
  canEditCurrentRecord = input(false);
  approvingCommentUuid = input<string | null>(null);
  deletingCommentUuid = input<string | null>(null);
  depth = input(0);

  approve = output<string>();
  remove = output<string>();
  reply = output<string>();

  showDeleteConfirmation = false;
  readonly confirmationWord = 'DELETE';

  readonly ratingValue = computed(() => {
    const comment = this.node().comment;
    if (typeof comment.ratingAVG === 'number') {
      return Math.max(0, Math.min(5, Math.round(comment.ratingAVG)));
    }

    const values = Object.values(comment.rating || {}).filter((value) => value > 0);
    if (!values.length) {
      return 0;
    }

    const total = values.reduce((sum, value) => sum + value, 0);
    return Math.max(0, Math.min(5, Math.round(total / values.length)));
  });

  readonly deleteMessageParams = computed(() => ({ author: this.getAuthorName() }));

  getAuthorName(): string {
    const author = this.node().comment.authorName?.trim();
    return author || 'Anonymous';
  }

  requestReply() {
    const uuid = this.node().comment.uuid;
    if (uuid) {
      this.reply.emit(uuid);
    }
  }

  onApprove(uuid: string) {
    this.approve.emit(uuid);
  }

  requestRemove() {
    if (!this.node().comment.uuid) {
      return;
    }
    this.showDeleteConfirmation = true;
  }

  confirmRemove() {
    const uuid = this.node().comment.uuid;
    if (!uuid) {
      return;
    }
    this.remove.emit(uuid);
  }

  isApproving(): boolean {
    return this.approvingCommentUuid() === this.node().comment.uuid;
  }

  isDeleting(): boolean {
    return this.deletingCommentUuid() === this.node().comment.uuid;
  }
}
