/**
 * Notification Widget Context
 * Manages in-app notification widget state and interactions
 * Aligned with Betternapped wellness app design
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { NotificationService } from '@/services/notifications.service';
import { NotificationStatus } from '@/lib/notificationConstants';
import { useAuth } from '@/contexts/AuthContext';

export type NotificationCategory = 
  | 'all'
  | 'experiments' 
  | 'habits'
  | 'moods'
  | 'sleep'
  | 'clarity'
  | 'recommendations'
  | 'achievements';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: string; // emoji
  actionLabel?: string;
  actionRoute?: string;
  data?: any;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  isPanelOpen: boolean;
  activeCategory: NotificationCategory;
  setActiveCategory: (category: NotificationCategory) => void;
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: (category?: NotificationCategory) => void;
  deleteNotification: (notificationId: string) => void;
  clearAll: (category?: NotificationCategory) => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>('all');

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Load notifications from backend
  const refreshNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await NotificationService.getAllNotifications(user.id, 50);
      
      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      if (data) {
        // Transform backend notifications to app notifications
        const appNotifications: AppNotification[] = data.map(n => ({
          id: n.id,
          category: mapNotificationTypeToCategory(n.type),
          title: n.payload.title,
          message: n.payload.body,
          timestamp: new Date(n.created_at),
          read: n.status === NotificationStatus.READ,
          icon: getIconForCategory(mapNotificationTypeToCategory(n.type)),
          actionLabel: n.payload.action?.type === 'navigate' ? 'View' : undefined,
          actionRoute: n.payload.action?.target,
          data: n.payload.data,
        }));

        setNotifications(appNotifications);
      }
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  }, [user]);

  // Load notifications on mount and user change
  useEffect(() => {
    refreshNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const openPanel = useCallback(() => setIsPanelOpen(true), []);
  const closePanel = useCallback(() => setIsPanelOpen(false), []);
  const togglePanel = useCallback(() => setIsPanelOpen(prev => !prev), []);

  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );

    // Update backend
    if (user) {
      await NotificationService.updateNotificationStatus(
        user.id,
        notificationId,
        NotificationStatus.READ
      );
    }
  }, [user]);

  const markAllAsRead = useCallback(async (category?: NotificationCategory) => {
    const idsToMark = notifications
      .filter(n => !n.read && (!category || category === 'all' || n.category === category))
      .map(n => n.id);

    if (idsToMark.length === 0) return;

    // Optimistic update
    setNotifications(prev =>
      prev.map(n =>
        idsToMark.includes(n.id) ? { ...n, read: true } : n
      )
    );

    // Update backend
    if (user) {
      await Promise.all(
        idsToMark.map(id =>
          NotificationService.updateNotificationStatus(user.id, id, NotificationStatus.READ)
        )
      );
    }
  }, [notifications, user]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    // Optimistic update
    setNotifications(prev => prev.filter(n => n.id !== notificationId));

    // Update backend
    if (user) {
      await NotificationService.deleteNotification(user.id, notificationId);
    }
  }, [user]);

  const clearAll = useCallback(async (category?: NotificationCategory) => {
    const idsToDelete = notifications
      .filter(n => !category || category === 'all' || n.category === category)
      .map(n => n.id);

    if (idsToDelete.length === 0) return;

    // Optimistic update
    setNotifications(prev =>
      prev.filter(n => !idsToDelete.includes(n.id))
    );

    // Update backend
    if (user) {
      await Promise.all(
        idsToDelete.map(id =>
          NotificationService.deleteNotification(user.id, id)
        )
      );
    }
  }, [notifications, user]);

  const addNotification = useCallback((
    notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>
  ) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `temp-${Date.now()}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    isPanelOpen,
    activeCategory,
    setActiveCategory,
    openPanel,
    closePanel,
    togglePanel,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationWidget() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationWidget must be used within NotificationProvider');
  }
  return context;
}

// Helper functions
function mapNotificationTypeToCategory(type: string): NotificationCategory {
  const mapping: Record<string, NotificationCategory> = {
    experiment_reminder: 'experiments',
    experiment_milestone: 'experiments',
    habit_reminder: 'habits',
    habit_streak: 'habits',
    mood_check: 'moods',
    mood_insight: 'moods',
    sleep_reminder: 'sleep',
    sleep_analysis: 'sleep',
    clarity_test: 'clarity',
    clarity_insight: 'clarity',
    wellness_recommendation: 'recommendations',
    achievement_unlocked: 'achievements',
    daily_summary: 'recommendations',
  };

  return mapping[type] || 'all';
}

function getIconForCategory(category: NotificationCategory): string {
  const icons: Record<NotificationCategory, string> = {
    all: '🔔',
    experiments: '🧪',
    habits: '🎯',
    moods: '😊',
    sleep: '😴',
    clarity: '🧠',
    recommendations: '💡',
    achievements: '🏆',
  };

  return icons[category];
}
