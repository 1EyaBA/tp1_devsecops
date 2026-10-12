import { useQuery, useMutation } from '@apollo/client';
import { GET_UNREAD_COUNT, GET_USER_NOTIFICATIONS, MARK_ALL_NOTIFICATIONS_READ, MARK_NOTIFICATION_READ } from '../graphQl/queries/notifications';

export const useUserNotifications = (userId: number, limit?: number) => {
  return useQuery(GET_USER_NOTIFICATIONS, {
    variables: { userId, limit },
    skip: !userId,
    pollInterval: 30000, // Poll every 30 seconds as backup
  });
};


export const useMarkAsRead = () => {
  return useMutation(MARK_NOTIFICATION_READ, {
    refetchQueries: [GET_UNREAD_COUNT],
  });
};

export const useMarkAllAsRead = () => {
  return useMutation(MARK_ALL_NOTIFICATIONS_READ, {
    refetchQueries: [GET_USER_NOTIFICATIONS, GET_UNREAD_COUNT],
  });
};


export const useUnreadCount = (userId: number) => {
  return useQuery(GET_UNREAD_COUNT, {
    variables: { userId },
    skip: !userId,
    pollInterval: 30000,
  });
};


