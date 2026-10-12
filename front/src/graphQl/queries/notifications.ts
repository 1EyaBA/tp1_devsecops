import { gql } from '@apollo/client';

// Queries
export const GET_NOTIFICATIONS = gql`
  query GetNotifications($userId: Int!, $limit: Int, $offset: Int) {
    notifications(userId: $userId, limit: $limit, offset: $offset) {
      id
      type
      title
      message
      status
      read
      timestamp
      actionUrl
      metadata
      userId
      relatedEntityId
      relatedEntityType
      createdAt
      updatedAt
    }
  }
`;

export const GET_UNREAD_NOTIFICATIONS = gql`
  query GetUnreadNotifications($userId: Int!) {
    unreadNotifications(userId: $userId) {
      id
      type
      title
      message
      status
      read
      timestamp
      actionUrl
      metadata
      createdAt
    }
  }
`;

export const GET_UNREAD_COUNT = gql`
  query GetUnreadCount($userId: Int!) {
    unreadNotificationsCount(userId: $userId)
  }
`;

export const GET_SINGLE_NOTIFICATION = gql`
  query GetNotification($id: Int!) {
    notification(id: $id) {
      id
      type
      title
      message
      status
      read
      timestamp
      actionUrl
      metadata
      userId
      relatedEntityId
      relatedEntityType
      createdAt
      updatedAt
    }
  }
`;

// Mutations
export const CREATE_NOTIFICATION = gql`
  mutation CreateNotification($createNotificationInput: CreateNotificationInput!) {
    createNotification(createNotificationInput: $createNotificationInput) {
      id
      type
      title
      message
      status
      read
      actionUrl
      userId
      createdAt
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($notificationId: Int!) {
    markNotificationRead(notificationId: $notificationId) {
      id
      status
      read
      updatedAt
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead($userId: Int!) {
    markAllNotificationsRead(userId: $userId) {
      count
    }
  }
`;

export const UPDATE_NOTIFICATION = gql`
  mutation UpdateNotification($updateNotificationInput: UpdateNotificationInput!) {
    updateNotification(updateNotificationInput: $updateNotificationInput) {
      id
      status
      read
      updatedAt
    }
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($notificationId: Int!) {
    deleteNotification(notificationId: $notificationId) {
      id
    }
  }
`;

// Alternative queries for backwards compatibility
export const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications($userId: Int!, $limit: Int) {
    notifications(userId: $userId, limit: $limit) {
      id
      type
      title
      message
      status
      read
      actionUrl
      metadata
      relatedEntityId
      relatedEntityType
      createdAt
      updatedAt
    }
  }
`;