/**
 * Notification Initializer Component
 * Automatically sets up all notifications when user logs in
 * Manages push token registration and notification scheduling
 */

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationSchedulerService } from '@/services/notificationScheduler.service';
import { PushNotificationService } from '@/services/pushNotification.service';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export function NotificationInitializer() {
  const { user } = useAuth();
  const isInitialized = useRef(false);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    if (user && !isInitialized.current) {
      initializeNotifications();
      isInitialized.current = true;
    }

    if (!user && isInitialized.current) {
      // User logged out, clean up
      cleanup();
      isInitialized.current = false;
    }

    // Set up notification listeners
    setupNotificationListeners();

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);

  const setupNotificationListeners = () => {
    // Listener for when a notification is received while app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📬 Notification received:', notification.request.content.title);
        // The NotificationContext will handle showing the in-app notification
      }
    );

    // Listener for when user taps on a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        console.log('👆 Notification tapped:', data);

        // Handle navigation based on notification action
        if (data?.action?.type === 'navigate' && data?.action?.target) {
          // TODO: Navigate to the target screen
          // This will be handled by your navigation system
          console.log('Navigate to:', data.action.target);
        }
      }
    );
  };

  const initializeNotifications = async () => {
    if (!user) return;

    try {
      console.log('🔔 Initializing notifications for user:', user.id);

      // Step 1: Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('⚠️ Notification permissions not granted');
        return;
      }

      console.log('✅ Notification permissions granted');

      // Step 2: Get and register push token
      if (Platform.OS !== 'web') {
        try {
          const token = await PushNotificationService.requestPermissionsAndGetToken();

          if (token) {
            await PushNotificationService.registerDeviceToken(
              user.id,
              token,
              `${Platform.OS} Device`
            );
            console.log('✅ Push token registered');
          } else {
            console.warn('⚠️ Push token not available (OK in development)');
          }
        } catch (error) {
          console.warn('⚠️ Failed to get push token (OK in development):', error);
          // Continue anyway - local notifications will still work
        }
      }

      // Step 3: Initialize all notification schedules
      await NotificationSchedulerService.initializeAllNotifications(user.id);

      // Step 4: Schedule daily checks
      scheduleDailyChecks(user.id);

      console.log('🎉 Notification system fully initialized!');
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
    }
  };

  const scheduleDailyChecks = (userId: string) => {
    // Schedule a daily check at 8 PM to check for missed logs and at-risk streaks
    // This runs locally on the device
    NotificationSchedulerService.scheduleLocalNotification(
      'Daily Check',
      'Checking habits and experiments...',
      { hour: 20, minute: 0, repeats: true },
      {
        type: 'daily_check',
        userId,
        silent: true, // Don't show this to user, it's for background processing
      }
    );
  };

  const cleanup = async () => {
    if (!user) return;

    try {
      console.log('🧹 Cleaning up notifications...');

      // Deactivate device tokens (but don't delete - user might log back in)
      // await PushNotificationService.deactivateAllUserDevices(user.id);

      // Cancel all scheduled local notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      console.log('✅ Notifications cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up notifications:', error);
    }
  };

  // This component doesn't render anything
  return null;
}
