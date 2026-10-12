export enum EventType {
  POST_UPDATED = 'POST_UPDATED',
  NEW_COMMENT = 'NEW_COMMENT',
  JOIN_REQUEST = 'JOIN_REQUEST',
  JOIN_ACCEPT = 'JOIN_ACCEPT',
  RIDE_DELETE = 'RIDE_DELETE',
  RIDE_START = 'RIDE_START',
  REVIEW_ADDED = 'REVIEW_ADDED',
  REPORT_ADDED = 'REPORT_ADDED',
  MESSAGE = 'MESSAGE',
}


export interface SSEEventData {
  type: EventType | 'connection' | 'heartbeat';
  message?: string;
  timestamp: string;
  userId?: string;
  chatId?: string;
  notificationId?: string;
  postId?: string;
  rideId?: string;
  groupId?: string;
  commentId?: string;
  reviewId?: string;
  reportId?: string;
  groupName?: string;
  postTitle?: string;
  userName?: string;
  rideTitle?: string;
  [key: string]: any;
}