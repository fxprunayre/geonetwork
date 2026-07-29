import { UserFeedbackDTO } from 'gn4-api-client';

export interface FeedbackCommentNode {
  comment: UserFeedbackDTO;
  replies: Array<FeedbackCommentNode>;
}
