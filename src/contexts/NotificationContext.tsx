import React, { createContext, useState, useContext, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Notification, NotificationDisplay } from '../components/shared/Notification';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationPayload {
  message: string;
  type: NotificationType;
  duration?: number;
}

interface NotificationContextType {
  addNotification: (payload: NotificationPayload) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<(NotificationPayload & { id: number })[]>([]);

  const addNotification = useCallback((payload: NotificationPayload) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...payload, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, payload.duration || 4000);
  }, []);

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <NotificationDisplay notifications={notifications} />
    </NotificationContext.Provider>
  );
};
