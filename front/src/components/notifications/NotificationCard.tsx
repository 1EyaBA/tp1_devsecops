import React from 'react';
import { formatTimeAgo } from './utils';
import { Notification } from '../../types/Notification';
import { useNotifications } from './NotificationProvider';
import { EventType } from '../../types/event';
import { X, ExternalLink } from 'lucide-react';
import { formatDate } from '../../utils/dateTime';

const getNotificationIcon = (type: string) => {
  const icons: Record<string, string> = {
    [EventType.MESSAGE]: '✉️',
    [EventType.POST_UPDATED]: '📝',
    [EventType.NEW_COMMENT]: '💬',
    [EventType.JOIN_REQUEST]: '🙋',
    [EventType.JOIN_ACCEPT]: '✅',
    [EventType.RIDE_DELETE]: '❌',
    [EventType.RIDE_START]: '🚗',
    [EventType.REVIEW_ADDED]: '⭐',
    [EventType.REPORT_ADDED]: '🚨',
  };
  return icons[type] || '🔔';
};

interface NotificationCardProps {
  notification: Notification;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification }) => {
  const { markAsRead, removeNotification } = useNotifications();

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      // Check if it's an external URL or internal route
      if (notification.actionUrl.startsWith('http')) {
        window.open(notification.actionUrl, '_blank');
      } else {
        window.location.href = notification.actionUrl;
      }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(notification.id);
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      className={`group flex gap-4 p-4 rounded-lg cursor-pointer shadow-sm transition-all duration-200 hover:shadow-md
        ${notification.read 
          ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700' 
          : 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 shadow-sm'
        }
        text-gray-800 dark:text-gray-100 
        hover:bg-gray-50 dark:hover:bg-gray-750`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className="text-2xl flex-shrink-0">
        {getNotificationIcon(notification.type)}
      </div>

      <div className="flex flex-col flex-grow min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-grow min-w-0">
            <h3 className={`font-medium text-sm mb-1 ${
              !notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
            }`}>
              {notification.title}
            </h3>
            <p className={`text-sm leading-relaxed ${
              !notification.read ? 'text-gray-700 dark:text-gray-200' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {notification.message}
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {formatDate(new Date(notification.timestamp).toISOString())}
            </span>
            
            {/* Action buttons - only show on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.read && (
                <button
                  onClick={handleMarkAsRead}
                  className="p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400"
                  title="Mark as read"
                >
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                </button>
              )}
              
              {notification.actionUrl && (
                <ExternalLink 
                  size={14} 
                  className="text-gray-400 dark:text-gray-500" 
                />
              )}
              
              <button
                onClick={handleDelete}
                className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-800 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete notification"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Metadata display - if available */}
        {notification.metadata && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {notification.metadata.groupName && (
              <span className="inline-flex items-center gap-1">
                Group: <span className="font-medium">{notification.metadata.groupName}</span>
              </span>
            )}
            {notification.metadata.postTitle && (
              <span className="inline-flex items-center gap-1">
                Post: <span className="font-medium">{notification.metadata.postTitle}</span>
              </span>
            )}
            {notification.metadata.userName && (
              <span className="inline-flex items-center gap-1">
                User: <span className="font-medium">{notification.metadata.userName}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <div className="flex items-center">
          <span 
            className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" 
            aria-label="Unread notification"
          ></span>
        </div>
      )}
    </div>
  );
};

export default NotificationCard;