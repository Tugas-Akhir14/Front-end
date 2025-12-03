// contexts/NotificationContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Notification = {
  id: number;
  bookingId: number;
  title: string;
  message: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out';
  createdAt: string;
  read: boolean;
};

type NotificationContextType = {
  notifications: Notification[];
  addNotifications: (notifs: Notification[]) => void;
  markAllAsRead: () => void;
  unreadCount: number;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotifications = (newNotifs: Notification[]) => {
    setNotifications(prev => {
      const existingIds = new Set(prev.map(n => n.bookingId));
      const filtered = newNotifs.filter(n => !existingIds.has(n.bookingId));
      return [...filtered, ...prev];
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    if (typeof window !== 'undefined') {
      const userJson = sessionStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        localStorage.setItem(`booking_notif_last_seen_${user.id}`, new Date().toISOString());
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotifications, markAllAsRead, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};