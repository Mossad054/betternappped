/**
 * Notification Router
 *
 * Handles deep linking and navigation from notification clicks.
 * Works for notifications received when app is:
 * - Completely closed
 * - In background
 * - In foreground
 *
 * Date: 2025-01-25
 */

import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

export function NotificationRouter() {
  const router = useRouter();

  useEffect(() => {
    // Handle notification when app is in foreground or background
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotificationResponse(response);
    });

    // Handle notification when app was opened from closed state
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationResponse(response);
      }
    });

    return () => subscription.remove();
  }, []);

  const handleNotificationResponse = (
    response: Notifications.NotificationResponse
  ) => {
    try {
      const data = response.notification.request.content.data;

      console.log('📲 Notification clicked:', {
        type: data.notificationType,
        itemId: data.itemId,
        itemType: data.itemType,
        action: data.action,
      });

      // Extract action data
      const action = data.action;
      const itemId = data.itemId;
      const itemType = data.itemType;

      if (!action) {
        console.warn('⚠️  No action specified in notification');
        return;
      }

      // Navigate based on action type
      if (action.type === 'navigate') {
        navigateToScreen(action.target, {
          ...action.params,
          itemId,
          itemType,
          fromNotification: 'true',
        });
      } else if (action.type === 'deeplink') {
        // Handle deep link URL
        // For now, just navigate to screen
        navigateToScreen(action.target, {
          itemId,
          itemType,
          fromNotification: 'true',
        });
      }

      // Mark notification as delivered/interacted
      markNotificationInteracted(data.notificationId);
    } catch (error) {
      console.error('❌ Error handling notification response:', error);
    }
  };

  const navigateToScreen = (target: string, params?: Record<string, any>) => {
    try {
      // Small delay to ensure navigation is ready
      setTimeout(() => {
        if (params && Object.keys(params).length > 0) {
          router.push({
            pathname: target as any,
            params,
          });
        } else {
          router.push(target as any);
        }

        console.log('✅ Navigated to:', target, params);
      }, 100);
    } catch (error) {
      console.error('❌ Navigation error:', error);

      // Fallback to home screen
      router.push('/home');
    }
  };

  const markNotificationInteracted = (notificationId?: string) => {
    if (notificationId) {
      // Update notification status in database if needed
      console.log('📊 Notification interacted:', notificationId);
    }
  };

  return null; // This is a logic-only component
}

/**
 * Hook for handling notification navigation in screens
 */
export function useNotificationNavigation() {
  const router = useRouter();

  const handleNotificationClick = (data: any) => {
    const { action, itemId, itemType } = data;

    if (!action) return;

    if (action.type === 'navigate') {
      router.push({
        pathname: action.target,
        params: {
          ...action.params,
          itemId,
          itemType,
          fromNotification: 'true',
        },
      });
    }
  };

  return { handleNotificationClick };
}
