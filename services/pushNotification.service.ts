/**
 * Push Notification Service
 * Handles Expo Push Notification delivery
 * Manages device tokens and sends remote push notifications
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

export interface PushNotificationPayload {
  to: string | string[]; // Expo push token(s)
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: boolean | string;
  badge?: number;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;
}

export interface DeviceInfo {
  device_token: string;
  device_type: 'ios' | 'android' | 'web';
  device_name?: string;
  is_active: boolean;
}

export class PushNotificationService {
  private static readonly EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

  // =============================================================================
  // Device Token Management
  // =============================================================================

  /**
   * Register or update device token for a user
   */
  static async registerDeviceToken(
    userId: string,
    deviceToken: string,
    deviceName?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const deviceType = Platform.OS as 'ios' | 'android' | 'web';

      // Check if device already exists
      const { data: existing } = await supabase
        .from('user_devices')
        .select('*')
        .eq('user_id', userId)
        .eq('device_token', deviceToken)
        .single();

      if (existing) {
        // Update existing device
        const { error } = await supabase
          .from('user_devices')
          .update({
            is_active: true,
            device_name: deviceName || existing.device_name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new device
        const { error } = await supabase.from('user_devices').insert({
          user_id: userId,
          device_token: deviceToken,
          device_type: deviceType,
          device_name: deviceName || `${Platform.OS} Device`,
          is_active: true,
        });

        if (error) throw error;
      }

      console.log('Device token registered successfully:', deviceToken);
      return { success: true };
    } catch (error) {
      console.error('Error registering device token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to register device',
      };
    }
  }

  /**
   * Get all active device tokens for a user
   */
  static async getUserDeviceTokens(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_devices')
        .select('device_token')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      return data?.map(d => d.device_token) || [];
    } catch (error) {
      console.error('Error getting user device tokens:', error);
      return [];
    }
  }

  /**
   * Deactivate a device token
   */
  static async deactivateDeviceToken(
    userId: string,
    deviceToken: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_devices')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('device_token', deviceToken);

      if (error) throw error;

      console.log('Device token deactivated:', deviceToken);
    } catch (error) {
      console.error('Error deactivating device token:', error);
    }
  }

  /**
   * Deactivate all device tokens for a user (on logout)
   */
  static async deactivateAllUserDevices(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_devices')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (error) throw error;

      console.log('All devices deactivated for user:', userId);
    } catch (error) {
      console.error('Error deactivating all devices:', error);
    }
  }

  // =============================================================================
  // Push Notification Sending
  // =============================================================================

  /**
   * Send push notification to specific device tokens
   * Uses Expo's push notification service
   */
  static async sendPushNotification(
    payload: PushNotificationPayload
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate Expo push token format
      const tokens = Array.isArray(payload.to) ? payload.to : [payload.to];
      const validTokens = tokens.filter(token =>
        token.startsWith('ExponentPushToken[') || token.startsWith('ExpoPushToken[')
      );

      if (validTokens.length === 0) {
        console.warn('No valid Expo push tokens found');
        return { success: false, error: 'No valid push tokens' };
      }

      const message = {
        to: validTokens,
        sound: payload.sound ?? 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
        badge: payload.badge,
        priority: payload.priority || 'high',
        channelId: payload.channelId || 'default',
      };

      // Send using Expo's push notification API
      const response = await fetch(this.EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();

      if (result.data && result.data[0]?.status === 'error') {
        const errorMessage = result.data[0].message;
        console.error('Expo push notification error:', errorMessage);

        // Handle specific error cases
        if (errorMessage.includes('DeviceNotRegistered')) {
          // Token is invalid, should deactivate it
          console.warn('Device token is invalid, should deactivate');
        }

        return { success: false, error: errorMessage };
      }

      console.log('Push notification sent successfully:', payload.title);
      return { success: true };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send push',
      };
    }
  }

  /**
   * Send push notification to a user (all their devices)
   */
  static async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const deviceTokens = await this.getUserDeviceTokens(userId);

      if (deviceTokens.length === 0) {
        console.log('No active devices for user:', userId);
        return { success: false, error: 'No active devices' };
      }

      return await this.sendPushNotification({
        to: deviceTokens,
        title,
        body,
        data,
        sound: true,
        priority: 'high',
      });
    } catch (error) {
      console.error('Error sending push to user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send push',
      };
    }
  }

  /**
   * Send push notification with custom priority
   */
  static async sendWithPriority(
    userId: string,
    title: string,
    body: string,
    priority: 'default' | 'normal' | 'high',
    data?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const deviceTokens = await this.getUserDeviceTokens(userId);

      if (deviceTokens.length === 0) {
        return { success: false, error: 'No active devices' };
      }

      return await this.sendPushNotification({
        to: deviceTokens,
        title,
        body,
        data,
        sound: priority === 'high',
        priority,
      });
    } catch (error) {
      console.error('Error sending priority push:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send push',
      };
    }
  }

  /**
   * Send scheduled push notification (for future delivery)
   * Note: This schedules locally on the device, not on Expo's servers
   */
  static async scheduleLocalPush(
    title: string,
    body: string,
    trigger: Date | { hour: number; minute: number; repeats: boolean },
    data?: Record<string, any>
  ): Promise<string | null> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      let notificationTrigger: Notifications.NotificationTriggerInput;

      if (trigger instanceof Date) {
        notificationTrigger = trigger;
      } else {
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
      console.error('Error scheduling local push:', error);
      return null;
    }
  }

  // =============================================================================
  // Batch Sending
  // =============================================================================

  /**
   * Send notifications to multiple users
   */
  static async sendToMultipleUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<{ successful: number; failed: number }> {
    let successful = 0;
    let failed = 0;

    for (const userId of userIds) {
      const result = await this.sendToUser(userId, title, body, data);
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    }

    return { successful, failed };
  }

  // =============================================================================
  // Helper Methods
  // =============================================================================

  /**
   * Request notification permissions and get push token
   */
  static async requestPermissionsAndGetToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        console.warn('Push notifications not supported on web');
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return null;
      }

      try {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log('Expo push token obtained:', token);
        return token;
      } catch (tokenError: any) {
        // This is OK in development or if Expo project ID is not configured
        console.warn('Could not get Expo push token (OK in development):', tokenError.message);
        return null;
      }
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Test push notification
   */
  static async sendTestNotification(userId: string): Promise<boolean> {
    const result = await this.sendToUser(
      userId,
      'Test Notification 🔔',
      'This is a test notification from Betternapped!',
      { type: 'test', timestamp: new Date().toISOString() }
    );

    return result.success;
  }
}
