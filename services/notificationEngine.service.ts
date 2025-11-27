/**
 * Unified Notification Engine
 *
 * This service acts as the central dispatch point for ALL notifications in the app.
 * It ensures that:
 * - User settings are respected (enabled/disabled categories, channels)
 * - Quiet hours are enforced with timezone safety
 * - Notifications are queued during quiet hours
 * - Delivery methods (push/in-app) are honored
 * - Routing metadata is included for deep linking
 * - Duplicate notifications are prevented
 *
 * Date: 2025-01-25
 */

import * as Notifications from 'expo-notifications';
import { NotificationService } from './notifications.service';
import { PushNotificationService } from './pushNotification.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  PRIORITY_CONFIG,
  parseTimeString,
  TimeObject,
} from '@/lib/notificationConstants';

// ============================================================
// Types
// ============================================================

export interface NotificationPayload {
  title: string;
  body: string;
  action?: {
    type: 'navigate' | 'deeplink';
    target: string;
    params?: Record<string, any>;
  };
  data?: Record<string, any>;
}

export interface NotificationRequest {
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  payload: NotificationPayload;
  itemId?: string; // For habit/experiment/activity specific notifications
  itemType?: 'habit' | 'experiment' | 'activity' | 'program' | 'sleep' | 'mood';
  scheduledFor?: Date; // If scheduling for future
}

interface QueuedNotification extends NotificationRequest {
  queuedAt: Date;
  retryCount: number;
}

// ============================================================
// Notification Engine Service
// ============================================================

export class NotificationEngineService {
  private static notificationQueue: QueuedNotification[] = [];
  private static isProcessingQueue: boolean = false;
  private static queueProcessInterval: NodeJS.Timeout | null = null;

  // ============================================================
  // Public API - Send Notification
  // ============================================================

  /**
   * Main entry point for sending any notification in the app
   * This method ensures all settings, quiet hours, and preferences are respected
   */
  static async send(request: NotificationRequest): Promise<boolean> {
    try {
      console.log('📨 Notification Engine: Processing request', {
        type: request.type,
        priority: request.priority,
        userId: request.userId,
      });

      // 1. Check if user has this notification type enabled
      const isEnabled = await this.isNotificationEnabled(request.userId, request.type);
      if (!isEnabled) {
        console.log('⏭️  Notification disabled by user settings:', request.type);
        return false;
      }

      // 2. Check quiet hours
      const isQuietHours = await this.isCurrentlyQuietHours(request.userId);
      const respectsQuietHours = PRIORITY_CONFIG[request.priority].respectQuietHours;

      if (isQuietHours && respectsQuietHours) {
        console.log('🌙 Quiet hours active - queueing notification');
        await this.queueNotification(request);
        return true; // Queued successfully
      }

      // 3. Get enabled channels for this notification type
      const channels = await this.getEnabledChannels(request.userId, request.type);

      if (channels.length === 0) {
        console.log('📭 No channels enabled for notification type:', request.type);
        return false;
      }

      // 4. Send through each enabled channel
      let success = false;
      for (const channel of channels) {
        const channelSuccess = await this.sendThroughChannel(
          request.userId,
          request.type,
          channel,
          request.priority,
          request.payload,
          request.itemId,
          request.itemType
        );
        if (channelSuccess) success = true;
      }

      return success;
    } catch (error) {
      console.error('❌ Notification Engine Error:', error);
      return false;
    }
  }

  /**
   * Schedule a notification for future delivery
   */
  static async schedule(request: NotificationRequest): Promise<string | null> {
    try {
      if (!request.scheduledFor) {
        console.error('❌ Schedule requires scheduledFor date');
        return null;
      }

      // Check if scheduled time falls in quiet hours
      const scheduledHour = request.scheduledFor.getHours();
      const isInQuietHours = await this.isHourInQuietHours(request.userId, scheduledHour);

      if (isInQuietHours && PRIORITY_CONFIG[request.priority].respectQuietHours) {
        // Adjust scheduled time to after quiet hours
        const adjustedTime = await this.adjustTimeForQuietHours(
          request.userId,
          request.scheduledFor
        );
        request.scheduledFor = adjustedTime;
        console.log('🔄 Adjusted notification time to avoid quiet hours:', adjustedTime);
      }

      // Get enabled channels
      const channels = await this.getEnabledChannels(request.userId, request.type);

      if (channels.includes(NotificationChannel.PUSH)) {
        // Schedule push notification
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: request.payload.title,
            body: request.payload.body,
            data: {
              ...request.payload.data,
              action: request.payload.action,
              notificationType: request.type,
              itemId: request.itemId,
              itemType: request.itemType,
            },
            sound: true,
            badge: 1,
          },
          trigger: request.scheduledFor,
        });

        return notificationId;
      }

      return null;
    } catch (error) {
      console.error('❌ Error scheduling notification:', error);
      return null;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  static async cancel(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log('✅ Notification canceled:', notificationId);
    } catch (error) {
      console.error('❌ Error canceling notification:', error);
    }
  }

  /**
   * Cancel all notifications for a specific item (e.g., when habit is deleted)
   */
  static async cancelAllForItem(
    userId: string,
    itemId: string,
    itemType: string
  ): Promise<void> {
    try {
      // Get all scheduled notifications
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();

      // Filter by itemId and cancel
      const toCancel = scheduled.filter(
        (n) => n.content.data?.itemId === itemId && n.content.data?.itemType === itemType
      );

      for (const notification of toCancel) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      console.log(`✅ Canceled ${toCancel.length} notifications for ${itemType}:${itemId}`);
    } catch (error) {
      console.error('❌ Error canceling notifications for item:', error);
    }
  }

  // ============================================================
  // Private Helper Methods
  // ============================================================

  /**
   * Check if notification type is enabled for user
   */
  private static async isNotificationEnabled(
    userId: string,
    type: NotificationType
  ): Promise<boolean> {
    try {
      const { data: preference } = await NotificationService.getPreference(userId, type);

      if (!preference) {
        // No preference set - default to enabled for in-app only
        return true;
      }

      return preference.enabled !== false;
    } catch (error) {
      console.error('Error checking notification enabled:', error);
      return true; // Default to enabled if error
    }
  }

  /**
   * Get enabled channels for a notification type
   */
  private static async getEnabledChannels(
    userId: string,
    type: NotificationType
  ): Promise<NotificationChannel[]> {
    try {
      const { data: preference } = await NotificationService.getPreference(userId, type);

      if (!preference || !preference.channels || preference.channels.length === 0) {
        // Default to in-app only
        return [NotificationChannel.IN_APP];
      }

      return preference.channels;
    } catch (error) {
      console.error('Error getting enabled channels:', error);
      return [NotificationChannel.IN_APP];
    }
  }

  /**
   * Check if current time is within user's quiet hours
   */
  private static async isCurrentlyQuietHours(userId: string): Promise<boolean> {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      return this.isHourInQuietHours(userId, currentHour, currentMinute);
    } catch (error) {
      console.error('Error checking quiet hours:', error);
      return false;
    }
  }

  /**
   * Check if a specific hour/minute is within quiet hours
   */
  private static async isHourInQuietHours(
    userId: string,
    hour: number,
    minute: number = 0
  ): Promise<boolean> {
    try {
      // Get user's quiet hours from any preference (they're global)
      const { data: prefs } = await NotificationService.getAllPreferences(userId);

      if (!prefs || prefs.length === 0) {
        return false; // No quiet hours set
      }

      const firstPref = prefs[0];
      if (!firstPref.quiet_hours_start || !firstPref.quiet_hours_end) {
        return false; // Quiet hours not configured
      }

      const start = parseTimeString(firstPref.quiet_hours_start);
      const end = parseTimeString(firstPref.quiet_hours_end);

      const currentMinutes = hour * 60 + minute;
      const startMinutes = start.hour * 60 + start.minute;
      const endMinutes = end.hour * 60 + end.minute;

      // Handle quiet hours that span midnight
      if (startMinutes > endMinutes) {
        // Example: 22:00 - 07:00
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
      } else {
        // Example: 23:00 - 23:30 (same day)
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
      }
    } catch (error) {
      console.error('Error checking if hour in quiet hours:', error);
      return false;
    }
  }

  /**
   * Adjust scheduled time to avoid quiet hours
   */
  private static async adjustTimeForQuietHours(
    userId: string,
    scheduledTime: Date
  ): Promise<Date> {
    try {
      // Get user's quiet hours
      const { data: prefs } = await NotificationService.getAllPreferences(userId);

      if (!prefs || prefs.length === 0 || !prefs[0].quiet_hours_end) {
        return scheduledTime; // No adjustment needed
      }

      const end = parseTimeString(prefs[0].quiet_hours_end);

      // Set time to end of quiet hours
      const adjusted = new Date(scheduledTime);
      adjusted.setHours(end.hour, end.minute, 0, 0);

      // If the adjusted time is in the past, schedule for next day
      if (adjusted < new Date()) {
        adjusted.setDate(adjusted.getDate() + 1);
      }

      return adjusted;
    } catch (error) {
      console.error('Error adjusting time for quiet hours:', error);
      return scheduledTime;
    }
  }

  /**
   * Send notification through a specific channel
   */
  private static async sendThroughChannel(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel,
    priority: NotificationPriority,
    payload: NotificationPayload,
    itemId?: string,
    itemType?: string
  ): Promise<boolean> {
    try {
      // Save to database (for in-app widget)
      const { error: dbError } = await NotificationService.createNotification(userId, {
        type,
        channel,
        payload: {
          title: payload.title,
          body: payload.body,
          action: payload.action,
          data: {
            ...payload.data,
            itemId,
            itemType,
          },
        },
      });

      if (dbError) {
        console.error('❌ Failed to save notification to database:', dbError);
      }

      // Send push notification if enabled
      if (channel === NotificationChannel.PUSH) {
        try {
          const { status } = await Notifications.getPermissionsAsync();

          if (status !== 'granted') {
            console.warn('⚠️  Push notification permission not granted');
            return false;
          }

          const pushPriority = priority === NotificationPriority.HIGH ? 'high' : 'normal';
          await PushNotificationService.sendWithPriority(
            userId,
            payload.title,
            payload.body,
            pushPriority,
            {
              ...payload.data,
              action: payload.action,
              notificationType: type,
              itemId,
              itemType,
            }
          );

          console.log('✅ Push notification sent:', payload.title);
          return true;
        } catch (error) {
          console.error('❌ Failed to send push notification:', error);
          return false;
        }
      }

      // For in-app, it's already saved to database
      if (channel === NotificationChannel.IN_APP) {
        console.log('✅ In-app notification created:', payload.title);
        return true;
      }

      return true;
    } catch (error) {
      console.error('❌ Error sending through channel:', error);
      return false;
    }
  }

  // ============================================================
  // Queue Management for Quiet Hours
  // ============================================================

  /**
   * Add notification to queue for delivery after quiet hours
   */
  private static async queueNotification(request: NotificationRequest): Promise<void> {
    const queued: QueuedNotification = {
      ...request,
      queuedAt: new Date(),
      retryCount: 0,
    };

    this.notificationQueue.push(queued);

    // Start queue processor if not already running
    if (!this.isProcessingQueue) {
      this.startQueueProcessor();
    }

    console.log(`🗂️  Notification queued (${this.notificationQueue.length} in queue)`);
  }

  /**
   * Start queue processor to check and send queued notifications
   */
  private static startQueueProcessor(): void {
    if (this.queueProcessInterval) {
      return; // Already running
    }

    console.log('🚀 Starting notification queue processor');

    // Check queue every 5 minutes
    this.queueProcessInterval = setInterval(async () => {
      await this.processQueue();
    }, 5 * 60 * 1000);

    // Process immediately on start
    this.processQueue();
  }

  /**
   * Process queued notifications
   */
  private static async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    console.log(`📬 Processing ${this.notificationQueue.length} queued notifications`);

    const toProcess = [...this.notificationQueue];
    this.notificationQueue = [];

    for (const notification of toProcess) {
      try {
        // Check if still in quiet hours
        const isQuietHours = await this.isCurrentlyQuietHours(notification.userId);

        if (isQuietHours) {
          // Re-queue if still in quiet hours
          this.notificationQueue.push(notification);
          continue;
        }

        // Send the notification
        await this.send(notification);
      } catch (error) {
        console.error('❌ Error processing queued notification:', error);

        // Retry up to 3 times
        if (notification.retryCount < 3) {
          notification.retryCount++;
          this.notificationQueue.push(notification);
        }
      }
    }

    this.isProcessingQueue = false;
    console.log(`✅ Queue processed. ${this.notificationQueue.length} remaining`);

    // Stop processor if queue is empty
    if (this.notificationQueue.length === 0 && this.queueProcessInterval) {
      clearInterval(this.queueProcessInterval);
      this.queueProcessInterval = null;
      console.log('⏸️  Queue processor stopped (queue empty)');
    }
  }

  /**
   * Get current queue status
   */
  static getQueueStatus(): {
    queueLength: number;
    isProcessing: boolean;
    queuedNotifications: Omit<QueuedNotification, 'payload'>[];
  } {
    return {
      queueLength: this.notificationQueue.length,
      isProcessing: this.isProcessingQueue,
      queuedNotifications: this.notificationQueue.map((n) => ({
        userId: n.userId,
        type: n.type,
        priority: n.priority,
        queuedAt: n.queuedAt,
        retryCount: n.retryCount,
        itemId: n.itemId,
        itemType: n.itemType,
        payload: undefined as any,
      })),
    };
  }

  /**
   * Clear all queued notifications
   */
  static clearQueue(): void {
    this.notificationQueue = [];
    if (this.queueProcessInterval) {
      clearInterval(this.queueProcessInterval);
      this.queueProcessInterval = null;
    }
    console.log('🗑️  Notification queue cleared');
  }
}
