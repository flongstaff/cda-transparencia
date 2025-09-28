import React, { useState, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, Info, AlertTriangle, AlertCircle } from 'lucide-react';

// Notification types
export type NotificationType = 'success' | 'info' | 'warning' | 'error';

// Notification interface
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // Auto-dismiss after duration (ms), 0 for persistent
  timestamp: Date;
  action?: {
    label: string;
    handler: () => void;
  };
}

// Notification context
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Notification provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Add a new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date()
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-dismiss if duration is specified
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, notification.duration);
    }
  }, []);

  // Remove a notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearNotifications
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Notification container component
export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();
  
  if (notifications.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
};

// Notification item component
interface NotificationItemProps {
  notification: Notification;
  onDismiss: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onDismiss }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const getTitleColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-800';
      case 'info':
        return 'text-blue-800';
      case 'warning':
        return 'text-yellow-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  const getMessageColor = () => {
    switch (notification.type) {
      case 'success':
        return 'text-green-700';
      case 'info':
        return 'text-blue-700';
      case 'warning':
        return 'text-yellow-700';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div 
      className={`max-w-sm w-full rounded-lg shadow-lg border p-4 ${getBackgroundColor()} transition-all duration-300 ease-in-out transform hover:scale-105`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className={`text-sm font-medium ${getTitleColor()}`}>
            {notification.title}
          </p>
          {notification.message && (
            <p className={`mt-1 text-sm ${getMessageColor()}`}>
              {notification.message}
            </p>
          )}
          {notification.action && (
            <div className="mt-3 flex">
              <button
                type="button"
                className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800 hover:text-green-900' :
                  notification.type === 'info' ? 'text-blue-800 hover:text-blue-900' :
                  notification.type === 'warning' ? 'text-yellow-800 hover:text-yellow-900' :
                  'text-red-800 hover:text-red-900'
                }`}
                onClick={notification.action.handler}
              >
                {notification.action.label}
              </button>
            </div>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className={`${
              notification.type === 'success' ? 'text-green-500 hover:text-green-700' :
              notification.type === 'info' ? 'text-blue-500 hover:text-blue-700' :
              notification.type === 'warning' ? 'text-yellow-500 hover:text-yellow-700' :
              'text-red-500 hover:text-red-700'
            } rounded-md inline-flex focus:outline-none`}
            onClick={onDismiss}
          >
            <span className="sr-only">Close</span>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};