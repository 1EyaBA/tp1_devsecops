/*
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { Notification } from '../../types/Notification';
import { EventType, SSEEventData } from '../../types/events';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  unreadCount: number;
  isConnected: boolean;
  reconnect: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectAttempts = useRef(0);

  // Get user from localStorage or your auth context
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const getNotificationTitle = (type: EventType): string => {
    const titles: Record<EventType, string> = {
      [EventType.MESSAGE]: 'New Message',
      [EventType.POST_UPDATED]: 'Post Updated',
      [EventType.NEW_COMMENT]: 'New Comment',
      [EventType.JOIN_REQUEST]: 'Join Request',
      [EventType.JOIN_ACCEPT]: 'Join Accepted',
      [EventType.RIDE_DELETE]: 'Ride Deleted',
      [EventType.REPORT_ADDED]: 'New Report',
      [EventType.RIDE_START]: 'Ride Started',
      [EventType.REVIEW_ADDED]: 'New Review',
    };
    return titles[type] || 'New Notification';
  };

  const getActionUrl = (data: SSEEventData): string => {
    switch (data.type) {
      case EventType.POST_UPDATED:
      case EventType.NEW_COMMENT:
        return `/posts/${data.postId}`;
      case EventType.RIDE_DELETE:
      case EventType.RIDE_START:
        return `/rides/${data.rideId}`;
      case EventType.JOIN_REQUEST:
      case EventType.JOIN_ACCEPT:
        return `/groups/${data.groupId}`;
      case EventType.REVIEW_ADDED:
        return `/users/${data.userId}`;
      default:
        return '/notifications';
    }
  };

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      // Prevent duplicate notifications
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;
      
      // Limit to last 100 notifications to prevent memory issues
      const updated = [notification, ...prev];
      return updated.slice(0, 100);
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true })),
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter(n => n.id !== id));
  }, []);

  const connectSSE = useCallback(() => {
    if (!user?.id) {
      console.warn('No user ID available for SSE connection');
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const eventSource = new EventSource(`${apiUrl}/events/stream/${user.id}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE connection established');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      // Clear any pending reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SSEEventData = JSON.parse(event.data);
        
        
        switch (data.type) {
          case 'connection':
            console.log('SSE connection confirmed:', data.message);
            break;
          case 'heartbeat':
            
            console.debug('SSE heartbeat received');
            break;
          default:
            
            if (Object.values(EventType).includes(data.type as EventType)) {
              const notification: Notification = {
                id: `sse-${Date.now()}-${Math.random()}`,
                type: data.type,
                title: getNotificationTitle(data.type as EventType),
                message: data.message || 'New notification',
                timestamp: new Date(data.timestamp),
                read: false,
                actionUrl: getActionUrl(data),
                metadata: data,
              };
              addNotification(notification);
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setIsConnected(false);
      eventSource.close();
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 1s, 2s, 4s, 8s, 16s
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          connectSSE();
        }, delay);
      } else {
        console.error('Max reconnection attempts reached');
      }
    };
  }, [user?.id, addNotification]);

  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    connectSSE();
  }, [connectSSE]);

  
  useEffect(() => {
    if (user?.id) {
      connectSSE();
    }

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user?.id, connectSSE]);

  // Handle page visibility changes to reconnect when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected && user?.id) {
        console.log('Tab became visible, checking SSE connection...');
        setTimeout(() => {
          if (!isConnected) {
            reconnect();
          }
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, user?.id, reconnect]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ 
        notifications, 
        addNotification, 
        markAsRead, 
        markAllAsRead,
        removeNotification,
        unreadCount,
        isConnected,
        reconnect
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }
  return context;
};

export default NotificationProvider;*/
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Notification } from '../../types/Notification';
import { EventType, SSEEventData } from '../../types/event';
import { DELETE_NOTIFICATION, GET_NOTIFICATIONS, GET_UNREAD_COUNT, MARK_ALL_NOTIFICATIONS_READ, MARK_NOTIFICATION_READ } from '../../graphQl/queries/notifications';
import ViewPostModal from '../posts/ViewPostModal';
import { GET_POST_BY_ID } from '../../graphQl/queries/posts';
import { CarpoolPost } from '../../types/posts';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  unreadCount: number;
  isConnected: boolean;
  reconnect: () => void;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  loadMore: () => void;
  hasMore: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [offset, setOffset] = useState(0);
   const [postId, setPostId] = useState(0);
  const [post, setPost] = useState<CarpoolPost | null>(null);
  const [hasMore, setHasMore] = useState(true);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const reconnectAttempts = useRef(0);
  const NOTIFICATIONS_LIMIT = 20;

  // Get user from localStorage or your auth context
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // GraphQL hooks
  const { 
    data: notificationsData, 
    loading, 
    error: queryError, 
    refetch: refetchNotifications,
    fetchMore 
  } = useQuery(GET_NOTIFICATIONS, {
    variables: { 
      userId: user?.id, 
      limit: NOTIFICATIONS_LIMIT, 
      offset: 0 
    },
    skip: !user?.id,
    notifyOnNetworkStatusChange: true,
    errorPolicy: 'all'
  });

  const { data: unreadCountData } = useQuery(GET_UNREAD_COUNT, {
    variables: { userId: user?.id },
    skip: !user?.id,
    pollInterval: 30000, // Poll every 30 seconds for unread count
  });

  const [markNotificationReadMutation] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllNotificationsReadMutation] = useMutation(MARK_ALL_NOTIFICATIONS_READ);
  const [deleteNotificationMutation] = useMutation(DELETE_NOTIFICATION);

  // Update notifications when GraphQL data changes
  useEffect(() => {
    if (notificationsData?.notifications) {
      setNotifications(notificationsData.notifications);
      setHasMore(notificationsData.notifications.length === NOTIFICATIONS_LIMIT);
    }
  }, [notificationsData]);
  useEffect(() => {
      if (isViewModalOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
      
      return () => {
        document.body.style.overflow = 'auto';
      };
    }, [ isViewModalOpen]);
  const getNotificationTitle = (type: EventType): string => {
    const titles: Record<EventType, string> = {
      [EventType.MESSAGE]: 'New Message',
      [EventType.POST_UPDATED]: 'Post Updated',
      [EventType.NEW_COMMENT]: 'New Comment',
      [EventType.JOIN_REQUEST]: 'Join Request',
      [EventType.JOIN_ACCEPT]: 'Join Accepted',
      [EventType.RIDE_DELETE]: 'Ride Deleted',
      [EventType.REPORT_ADDED]: 'New Report',
      [EventType.RIDE_START]: 'Ride Started',
      [EventType.REVIEW_ADDED]: 'New Review',
    };
    return titles[type] || 'New Notification';
  };

  const getActionUrl = (data: SSEEventData): string => {
    if (data.type === EventType.POST_UPDATED || data.type === EventType.NEW_COMMENT) {
      setIsViewModalOpen(true);
      setPostId(Number(data.postId));
      const { data:data1 } = useQuery(GET_POST_BY_ID, {
      variables: { id: postId },
      });
      setPost(data1?.post);

    }
    switch (data.type) {
      case EventType.MESSAGE:
        return `/chat/${data.metadata.chatId}`;

      case EventType.POST_UPDATED:
      case EventType.NEW_COMMENT:
        return `/post/${data.postId}`;
      case EventType.RIDE_DELETE:
      case EventType.RIDE_START:

      case EventType.JOIN_REQUEST:
        
      case EventType.JOIN_ACCEPT:
        return `/rides`;
      case EventType.REVIEW_ADDED:
        return `/users/:${data.userId}/reviews`;
      default:
        return '/notifications';
    }
  };

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      // Prevent duplicate 
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;
      
      const updated = [notification, ...prev];
      return updated.slice(0, 100); // Limit  100 
    });
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationReadMutation({
        variables: { notificationId: id },
        optimisticResponse: {
          markNotificationRead: {
            id,
            read: true,
            __typename: 'Notification'
          }
        }
      });
      
      // Update local 
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [markNotificationReadMutation]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      await markAllNotificationsReadMutation({
        variables: { userId: user.id }
      });
      
      // Update local 
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true })),
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [markAllNotificationsReadMutation, user?.id]);

  const removeNotification = useCallback(async (id: string) => {
    try {
      await deleteNotificationMutation({
        variables: { notificationId: id },
        optimisticResponse: {
          deleteNotification: {
            id,
            __typename: 'Notification'
          }
        }
      });
      
      // Update local 
      setNotifications((prev) => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [deleteNotificationMutation]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      const result = await fetchMore({
        variables: {
          offset: notifications.length,
          limit: NOTIFICATIONS_LIMIT
        }
      });

      if (result.data?.notifications) {
        const newNotifications = result.data.notifications;
        setNotifications(prev => [...prev, ...newNotifications]);
        setHasMore(newNotifications.length === NOTIFICATIONS_LIMIT);
      }
    } catch (error) {
      console.error('Error loading more notifications:', error);
    }
  }, [fetchMore, notifications.length, hasMore, loading]);

  const refetch = useCallback(() => {
    refetchNotifications();
  }, [refetchNotifications]);

  const connectSSE = useCallback(() => {
    if (!user?.id) {
      console.warn('No user ID available for SSE connection');
      return;
    }

    // Close connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const eventSource = new EventSource(`${apiUrl}/events/stream/${user.id}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE connection established');
      setIsConnected(true);
      reconnectAttempts.current = 0;
      
      // Clear ay pending  timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    eventSource.onmessage = (event) => {
      try {
        const data: SSEEventData = JSON.parse(event.data);
        
        switch (data.type) {
          case 'connection':
            console.log('SSE connection confirmed:', data.message);
            break;
          case 'heartbeat':
            console.debug('SSE heartbeat received');
            break;
          default:
            if (Object.values(EventType).includes(data.type as EventType)) {
              const notification: Notification = {
                id: `sse-${Date.now()}-${Math.random()}`,
                type: data.type,
                title: getNotificationTitle(data.type as EventType),
                message: data.message || 'New notification',
                timestamp: new Date(data.timestamp),
                read: false,
                actionUrl: getActionUrl(data),
                metadata: data,
              };
              addNotification(notification);
              
              // sync with backend
              refetch();
            }
            break;
        }
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setIsConnected(false);
      eventSource.close();
      
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.pow(2, reconnectAttempts.current) * 1000;
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          connectSSE();
        }, delay);
      } else {
        console.error('Max reconnection attempts reached');
      }
    };
  }, [user?.id, addNotification, refetch]);

  const reconnect = useCallback(() => {
    reconnectAttempts.current = 0;
    connectSSE();
  }, [connectSSE]);

  useEffect(() => {
    if (user?.id) {
      connectSSE();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user?.id, connectSSE]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected && user?.id) {
        console.log('Tab became visible, checking SSE connection...');
        setTimeout(() => {
          if (!isConnected) {
            reconnect();
          }
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isConnected, user?.id, reconnect]);

  const unreadCount = unreadCountData?.unreadNotificationsCount ?? 
    notifications.filter((n) => !n.read).length;

  const error = queryError?.message || null;

  return (
    <>
    <NotificationContext.Provider
      value={{ 
        notifications, 
        addNotification, 
        markAsRead, 
        markAllAsRead,
        removeNotification,
        unreadCount,
        isConnected,
        reconnect,
        loading,
        error,
        refetch,
        loadMore,
        hasMore
      }}
    >
      {children}
    </NotificationContext.Provider>
    <ViewPostModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        post={post}
        userData={user}
      />
    </>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }
  return context;
};

export default NotificationProvider;