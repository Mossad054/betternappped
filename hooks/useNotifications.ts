import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications should be handled when the app is running
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: Notifications.PermissionStatus;
}

export function useNotifications() {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Check current permission status
    checkPermissionStatus();

    // Set up listeners for notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  const checkPermissionStatus = async () => {
    const { status, canAskAgain } = await Notifications.getPermissionsAsync();
    setPermissionStatus({
      granted: status === 'granted',
      canAskAgain,
      status,
    });
    return status === 'granted';
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status, canAskAgain } = await Notifications.requestPermissionsAsync();
      setPermissionStatus({
        granted: status === 'granted',
        canAskAgain,
        status,
      });
      
      if (status === 'granted') {
        // Get push token if needed for future remote notifications
        if (Platform.OS !== 'web') {
          try {
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            setExpoPushToken(token);
          } catch (error) {
            console.warn('Failed to get push token:', error);
          }
        }
      }
      
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  };

  /**
   * Schedule a notification for a specific time
   * @param title Notification title
   * @param body Notification body
   * @param trigger Notification trigger (date/time)
   * @param data Additional data to pass with notification
   * @returns Notification identifier
   */
  const scheduleNotification = async (
    title: string,
    body: string,
    trigger: Date | { hour: number; minute: number; repeats: boolean },
    data?: any
  ): Promise<string | null> => {
    try {
      const hasPermission = permissionStatus?.granted || (await requestPermissions());
      
      if (!hasPermission) {
        console.warn('No notification permission');
        return null;
      }

      let notificationTrigger: Notifications.NotificationTriggerInput;

      if (trigger instanceof Date) {
        notificationTrigger = trigger;
      } else {
        // Daily repeating notification at specific time
        notificationTrigger = {
          hour: trigger.hour,
          minute: trigger.minute,
          repeats: trigger.repeats,
        };
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
        },
        trigger: notificationTrigger,
      });

      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  };

  /**
   * Cancel a scheduled notification by ID
   */
  const cancelNotification = async (notificationId: string): Promise<void> => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  };

  /**
   * Cancel all scheduled notifications
   */
  const cancelAllNotifications = async (): Promise<void> => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  };

  /**
   * Get all scheduled notifications
   */
  const getAllScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  };

  /**
   * Schedule a daily habit reminder
   * @param habitName Name of the habit
   * @param habitId Unique identifier for the habit
   * @param hour Hour (0-23)
   * @param minute Minute (0-59)
   * @returns Notification identifier
   */
  const scheduleHabitReminder = async (
    habitName: string,
    habitId: string,
    hour: number,
    minute: number
  ): Promise<string | null> => {
    return scheduleNotification(
      `Time for ${habitName}! 🎯`,
      `Don't forget to complete your ${habitName} habit today.`,
      { hour, minute, repeats: true },
      { habitId, type: 'habit_reminder' }
    );
  };

  /**
   * Cancel a habit reminder by habit ID
   * This searches for the notification by habit ID in the data and cancels it
   */
  const cancelHabitReminder = async (habitId: string): Promise<void> => {
    try {
      const scheduled = await getAllScheduledNotifications();
      const habitNotification = scheduled.find(
        n => n.content.data?.habitId === habitId && n.content.data?.type === 'habit_reminder'
      );
      
      if (habitNotification) {
        await cancelNotification(habitNotification.identifier);
      }
    } catch (error) {
      console.error('Error canceling habit reminder:', error);
    }
  };

  return {
    permissionStatus,
    expoPushToken,
    requestPermissions,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    getAllScheduledNotifications,
    scheduleHabitReminder,
    cancelHabitReminder,
    checkPermissionStatus,
  };
}

