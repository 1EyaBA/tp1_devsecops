import React from 'react';
import { Bell, Loader2, RefreshCw } from 'lucide-react';
import NotificationCard from './NotificationCard';
import { useNotifications } from './NotificationProvider';

const Notifications: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error, 
    refetch, 
    loadMore, 
    hasMore,
    markAllAsRead,
    isConnected 
  } = useNotifications();

  const handleRefresh = () => {
    refetch();
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-b pb-2 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Notifications
          </h1>
          <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            isConnected 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Bell size={20} />
            <span>{unreadCount}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Mark All Read
              </button>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
              title="Refresh notifications"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <RefreshCw size={20} />
              )}
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-300">
          <p className="text-sm">Error loading notifications: {error}</p>
          <button
            onClick={handleRefresh}
            className="text-sm underline hover:no-underline mt-1"
          >
            Try again
          </button>
        </div>
      )}

      <div className="space-y-4">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={32} className="animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading notifications...</span>
          </div>
        ) : notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
            
            {hasMore && (
              <div className="flex justify-center py-4">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="inline animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500 dark:text-gray-400">
            <Bell size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No notifications yet</p>
            <p className="text-sm">You'll see notifications here when you have new activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
