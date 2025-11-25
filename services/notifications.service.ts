/**
 * Notification Service
 * Date: 2025-11-05
 * Purpose: Service layer for notification preferences, overrides, history, and device management
 */

import { SupabaseSafe } from '@/lib/supabaseSafe';
import { Database } from '@/lib/supabase';
import { isGuestMode, guestDataStore } from '@/lib/guestDataStore';
import {
  NotificationPreference,
  NotificationPreferenceInput,
  ItemNotificationOverride,
  ItemNotificationOverrideInput,
  Notification,
  NotificationInput,
  UserDevice,
  DeviceRegistrationInput,
  NotificationType,
  NotificationChannel,
  NotificationFrequency,
  NotificationPriority,
  NotificationStatus,
  DEFAULT_REMINDER_TIME,
  formatTimeString,
} from '@/lib/notificationConstants';

// Database types
type NotificationPreferenceRow = Database['public']['Tables']['notification_preferences']['Row'];
type NotificationPreferenceInsert = Database['public']['Tables']['notification_preferences']['Insert'];
type NotificationPreferenceUpdate = Database['public']['Tables']['notification_preferences']['Update'];

type ItemOverrideRow = Database['public']['Tables']['item_notification_overrides']['Row'];
type ItemOverrideInsert = Database['public']['Tables']['item_notification_overrides']['Insert'];
type ItemOverrideUpdate = Database['public']['Tables']['item_notification_overrides']['Update'];

type NotificationRow = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

type UserDeviceRow = Database['public']['Tables']['user_devices']['Row'];
type UserDeviceInsert = Database['public']['Tables']['user_devices']['Insert'];

/**
 * Service class for managing notification system
 */
export class NotificationService {
  // ============================================================
  // Notification Preferences
  // ============================================================

  /**
   * Get all notification preferences for a user
   */
  static async getAllPreferences(userId: string): Promise<{
    data: NotificationPreference[] | null;
    error: any;
  }> {
    if (await isGuestMode()) {
      // Return mock preferences for guest mode
      return {
        data: this.getMockPreferences(),
        error: null,
      };
    }

    const result = await SupabaseSafe.select(
      'notification_preferences',
      { order: { type: 'asc' } },
      userId
    );

    return { 
      data: result.success ? (result.data as NotificationPreference[] | null) : null, 
      error: result.success ? null : result.error 
    };
  }

  /**
   * Get preference for specific notification type
   */
  static async getPreference(
    userId: string,
    type: NotificationType
  ): Promise<{
    data: NotificationPreference | null;
    error: any;
  }> {
    if (await isGuestMode()) {
      const mockPrefs = this.getMockPreferences();
      const pref = mockPrefs.find((p) => p.type === type) || null;
      return { data: pref, error: null };
    }

    const result = await SupabaseSafe.select(
      'notification_preferences',
      { eq: { type } },
      userId
    );

    return {
      data: result.success && result.data ? (result.data[0] as NotificationPreference) : null,
      error: result.success ? null : result.error,
    };
  }

  /**
   * Create or update notification preference (upsert)
   */
  static async upsertPreference(
    userId: string,
    input: NotificationPreferenceInput
  ): Promise<{
    data: NotificationPreference | null;
    error: any;
  }> {
    if (await isGuestMode()) {
      // For guest mode, just return mock data
      return {
        data: {
          id: 'guest_pref_' + input.type,
          user_id: userId,
          type: input.type,
          channels: input.channels || [NotificationChannel.IN_APP],
          frequency: input.frequency || NotificationFrequency.IMMEDIATE,
          priority: input.priority || NotificationPriority.NORMAL,
          time_of_day: input.time_of_day,
          quiet_hours_start: input.quiet_hours_start,
          quiet_hours_end: input.quiet_hours_end,
          enabled: input.enabled !== undefined ? input.enabled : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      };
    }

    // Check if preference exists
    const existing = await this.getPreference(userId, input.type);

    if (existing.data) {
      // Update existing
      const result = await SupabaseSafe.update(
        'notification_preferences',
        existing.data.id,
        input as NotificationPreferenceUpdate,
        userId
      );
      return { 
        data: result.success ? (result.data as NotificationPreference | null) : null, 
        error: result.success ? null : result.error 
      };
    } else {
      // Create new
      const result = await SupabaseSafe.insert(
        'notification_preferences',
        {
          ...input,
          type: input.type,
        } as NotificationPreferenceInsert,
        userId
      );
      return { 
        data: result.success ? (result.data as NotificationPreference | null) : null, 
        error: result.success ? null : result.error 
      };
    }
  }

  /**
   * Update multiple preferences at once
   */
  static async updateMultiplePreferences(
    userId: string,
    preferences: NotificationPreferenceInput[]
  ): Promise<{
    data: NotificationPreference[] | null;
    error: any;
  }> {
    const results: NotificationPreference[] = [];
    let lastError: any = null;

    for (const pref of preferences) {
      const result = await this.upsertPreference(userId, pref);
      if (result.error) {
        lastError = result.error;
      } else if (result.data) {
        results.push(result.data);
      }
    }

    return { data: results.length > 0 ? results : null, error: lastError };
  }

  /**
   * Toggle notification type enabled/disabled
   */
  static async togglePreference(
    userId: string,
    type: NotificationType,
    enabled: boolean
  ): Promise<{
    data: NotificationPreference | null;
    error: any;
  }> {
    return this.upsertPreference(userId, { type, enabled });
  }

  /**
   * Update quiet hours for all preferences
   */
  static async updateQuietHours(
    userId: string,
    quietHoursStart?: string,
    quietHoursEnd?: string
  ): Promise<{ error: any }> {
    if (await isGuestMode()) {
      return { error: null };
    }

    // Update all preferences with new quiet hours
    const allPrefs = await this.getAllPreferences(userId);
    if (allPrefs.error || !allPrefs.data) {
      return { error: allPrefs.error };
    }

    const updates = allPrefs.data.map((pref) => ({
      type: pref.type,
      quiet_hours_start: quietHoursStart,
      quiet_hours_end: quietHoursEnd,
    }));

    const result = await this.updateMultiplePreferences(userId, updates);
    return { error: result.error };
  }

  // ============================================================
  // Item Notification Overrides (Per-Habit / Per-Experiment)
  // ============================================================

  /**
   * Get all overrides for a user
   */
  static async getAllOverrides(userId: string): Promise<{
    data: ItemNotificationOverride[] | null;
    error: any;
  }> {
    if (await isGuestMode()) {
      return { data: [], error: null };
    }

    const result = await SupabaseSafe.select(
      'item_notification_overrides',
      { order: { created_at: 'desc' } },
      userId
    );

    return { 
      data: result.success ? (result.data as ItemNotificationOverride[] | null) : null, 
      error: result.success ? null : result.error 
    };
  }

  /**
   * Get override for specific item
   */
  static async getOverride(
    userId: string,
    itemId: string,
    itemType: 'habit' | 'experiment'
  ): Promise<{
    data: ItemNotificationOverride | null;
    error: any;
  }> {
    if (await isGuestMode()) {
      return { data: null, error: null };
    }

    const result = await SupabaseSafe.select(
      'item_notification_overrides',
      { eq: { item_id: itemId, item_type: itemType } },
      userId
    );

    return {
      data: result.success && result.data ? (result.data[0] as ItemNotificationOverride) : null,
      error: result.success ? null : result.error,
    };
  }

  /**
   * Create or update item override (upsert)
   */
  static async upsertOverride(
    userId: string,
    input: ItemNotificationOverrideInput
  ): Promise<{
    data: ItemNotificationOverride | null;
    error: any;
  }> {
    if (await isGuestMode()) {
      return { data: null, error: null };
    }

    // Check if override exists
    const existing = await this.getOverride(userId, input.item_id, input.item_type);

    if (existing.data) {
      // Update existing
      const result = await SupabaseSafe.update(
        'item_notification_overrides',
        existing.data.id,
        input as ItemOverrideUpdate,
        userId
      );
      return { 
        data: result.success ? (result.data as ItemNotificationOverride | null) : null, 
        error: result.success ? null : result.error 
      };
    } else {
      // Create new
      const result = await SupabaseSafe.insert(
        'item_notification_overrides',
        input as ItemOverrideInsert,
        userId
      );
      return { 
        data: result.success ? (result.data as ItemNotificationOverride | null) : null, 
        error: result.success ? null : result.error 
      };
    }
  }

  /**
   * Delete item override
   */
  static async deleteOverride(
    userId: string,
    itemId: string,
    itemType: 'habit' | 'experiment'
  ): Promise<{ error: any }> {
    if (await isGuestMode()) {
      return { error: null };
    }

    const override = await this.getOverride(userId, itemId, itemType);
    if (!override.data) {
      return { error: null };
    }

    const result = await SupabaseSafe.delete(
      'item_notification_overrides',
      override.data.id,
      userId
    );
    return { error: result.success ? null : result.error };
  }

  // ============================================================
  // Notification History & Queue
  // ============================================================

  /**
   * Get all notifications for a user (with filters)
   */
  static async getNotifications(
    userId: string,
    options?: {
      status?: NotificationStatus;
      channel?: NotificationChannel;
      limit?: number;
      unreadOnly?: boolean;
    }
  ): Promise<{
    data: Notification[] | null;
    error: any;
  }> {
    if (await isGuestMode()) {
      return { data: [], error: null };
    }

    let query: any = { order: { created_at: 'desc' } };

    if (options?.status) {
      query.eq = { ...query.eq, status: options.status };
    }

    if (options?.channel) {
      query.eq = { ...query.eq, channel: options.channel };
    }

    if (options?.unreadOnly) {
      query.is = { ...query.is, read_at: null };
    }

    if (options?.limit) {
      query.limit = options.limit;
    }

    const result = await SupabaseSafe.select('notifications', query, userId);

    return { 
      data: result.success ? (result.data as Notification[] | null) : null, 
      error: result.success ? null : result.error 
    };
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<{
    count: number;
    error: any;
  }> {
    if (await isGuestMode()) {
      return { count: 0, error: null };
    }

    const result = await this.getNotifications(userId, { unreadOnly: true });

    return {
      count: result.data?.length || 0,
      error: result.error,
    };
  }

  /**
   * Check if current time is within quiet hours
   */
  static async isInQuietHours(userId: string): Promise<boolean> {
    const prefs = await this.getAllPreferences(userId);
    if (prefs.error || !prefs.data || prefs.data.length === 0) {
      return false;
    }

    const firstPref = prefs.data[0];
    if (!firstPref.quiet_hours_start || !firstPref.quiet_hours_end) {
      return false;
    }

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Parse quiet hours
    const [startHour, startMin] = firstPref.quiet_hours_start.split(':').map(Number);
    const [endHour, endMin] = firstPref.quiet_hours_end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Handle overnight quiet hours (e.g., 22:00 - 07:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes < endMinutes;
    }

    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  }

  /**
   * Create new notification (queue for delivery)
   * Respects quiet hours - suppresses non-critical notifications
   */
  static async createNotification(
    userId: string,
    input: NotificationInput
  ): Promise<{
    data: Notification | null;
    error: any;
  }> {
    if (await isGuestMode()) {
      return { data: null, error: null };
    }

    // Check if we're in quiet hours and this isn't a high-priority notification
    const isQuiet = await this.isInQuietHours(userId);
    if (isQuiet && input.priority !== NotificationPriority.HIGH && input.priority !== NotificationPriority.CRITICAL) {
      // Schedule for after quiet hours end
      const prefs = await this.getAllPreferences(userId);
      if (prefs.data && prefs.data[0]?.quiet_hours_end) {
        const [endHour, endMin] = prefs.data[0].quiet_hours_end.split(':').map(Number);
        const tomorrow = new Date();
        tomorrow.setHours(endHour, endMin, 0, 0);
        if (tomorrow <= new Date()) {
          tomorrow.setDate(tomorrow.getDate() + 1);
        }
        input.send_after = tomorrow.toISOString();
      }
    }

    const result = await SupabaseSafe.insert(
      'notifications',
      {
        ...input,
        status: NotificationStatus.QUEUED,
        send_after: input.send_after || new Date().toISOString(),
      } as NotificationInsert,
      userId
    );

    return {
      data: result.success ? (result.data as Notification | null) : null,
      error: result.success ? null : result.error
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(
    userId: string,
    notificationId: string
  ): Promise<{ error: any }> {
    if (await isGuestMode()) {
      return { error: null };
    }

    const result = await SupabaseSafe.update(
      'notifications',
      notificationId,
      {
        status: NotificationStatus.READ,
        read_at: new Date().toISOString(),
      },
      userId
    );

    return { error: result.success ? null : result.error };
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string): Promise<{ error: any }> {
    if (await isGuestMode()) {
      return { error: null };
    }

    const unread = await this.getNotifications(userId, { unreadOnly: true });
    if (unread.error || !unread.data) {
      return { error: unread.error };
    }

    for (const notification of unread.data) {
      await this.markAsRead(userId, notification.id);
    }

    return { error: null };
  }

  /**
   * Delete notification
   */
  static async deleteNotification(
    userId: string,
    notificationId: string
  ): Promise<{ error: any }> {
    if (await isGuestMode()) {
      return { error: null };
    }

    const result = await SupabaseSafe.delete('notifications', notificationId, userId);
    return { error: result.success ? null : result.error };
  }

  // ============================================================
  // Device Management
  // ============================================================

  /**
   * Register device for push notifications
   */
  static async registerDevice(
    userId: string,
    input: DeviceRegistrationInput
  ): Promise<{
    data: UserDevice | null;
    error: any;
  }> {
    if (await isGuestMode()) {
      return { data: null, error: null };
    }

    // Check if device already exists
    const existing = await SupabaseSafe.select(
      'user_devices',
      { eq: { device_token: input.device_token } },
      userId
    );

    if (existing.success && existing.data && existing.data.length > 0) {
      // Update last_seen
      const device = existing.data[0] as UserDevice;
      const result = await SupabaseSafe.update(
        'user_devices',
        device.id,
        {
          last_seen: new Date().toISOString(),
          push_enabled: input.push_enabled !== undefined ? input.push_enabled : true,
        },
        userId
      );
      return { 
        data: result.success ? (result.data as UserDevice | null) : null, 
        error: result.success ? null : result.error 
      };
    } else {
      // Create new
      const result = await SupabaseSafe.insert(
        'user_devices',
        {
          ...input,
          push_enabled: input.push_enabled !== undefined ? input.push_enabled : true,
        } as UserDeviceInsert,
        userId
      );
      return { 
        data: result.success ? (result.data as UserDevice | null) : null, 
        error: result.success ? null : result.error 
      };
    }
  }

  /**
   * Get all devices for a user
   */
  static async getUserDevices(userId: string): Promise<{
    data: UserDevice[] | null;
    error: any;
  }> {
    if (await isGuestMode()) {
      return { data: [], error: null };
    }

    const result = await SupabaseSafe.select(
      'user_devices',
      { order: { last_seen: 'desc' } },
      userId
    );

    return { 
      data: result.success ? (result.data as UserDevice[] | null) : null, 
      error: result.success ? null : result.error 
    };
  }

  /**
   * Unregister device (e.g., on sign out)
   */
  static async unregisterDevice(
    userId: string,
    deviceToken: string
  ): Promise<{ error: any }> {
    if (await isGuestMode()) {
      return { error: null };
    }

    const device = await SupabaseSafe.select(
      'user_devices',
      { eq: { device_token: deviceToken } },
      userId
    );

    if (!device.success || !device.data || device.data.length === 0) {
      return { error: null };
    }

    const deviceData = device.data[0] as UserDevice;
    const result = await SupabaseSafe.delete('user_devices', deviceData.id, userId);
    return { error: result.success ? null : result.error };
  }

  // ============================================================
  // Utility Functions
  // ============================================================

  /**
   * Generate mock preferences for guest mode
   */
  private static getMockPreferences(): NotificationPreference[] {
    const now = new Date().toISOString();
    const defaultTime = formatTimeString(DEFAULT_REMINDER_TIME);

    return [
      {
        id: 'guest_pref_1',
        user_id: 'guest_user',
        type: NotificationType.DAILY_REMINDER,
        channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
        frequency: NotificationFrequency.IMMEDIATE,
        priority: NotificationPriority.NORMAL,
        time_of_day: defaultTime,
        enabled: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'guest_pref_2',
        user_id: 'guest_user',
        type: NotificationType.STREAK_ALERT,
        channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
        frequency: NotificationFrequency.IMMEDIATE,
        priority: NotificationPriority.HIGH,
        enabled: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'guest_pref_3',
        user_id: 'guest_user',
        type: NotificationType.EXPERIMENT_REMINDER,
        channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
        frequency: NotificationFrequency.IMMEDIATE,
        priority: NotificationPriority.NORMAL,
        time_of_day: '19:00:00',
        enabled: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'guest_pref_4',
        user_id: 'guest_user',
        type: NotificationType.ACTIVITY_INSIGHT,
        channels: [NotificationChannel.IN_APP],
        frequency: NotificationFrequency.DAILY_DIGEST,
        priority: NotificationPriority.NORMAL,
        enabled: false,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'guest_pref_5',
        user_id: 'guest_user',
        type: NotificationType.SLEEP_TIP,
        channels: [NotificationChannel.IN_APP],
        frequency: NotificationFrequency.WEEKLY_DIGEST,
        priority: NotificationPriority.NORMAL,
        enabled: false,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'guest_pref_6',
        user_id: 'guest_user',
        type: NotificationType.HABIT_SUGGESTION,
        channels: [NotificationChannel.IN_APP],
        frequency: NotificationFrequency.WEEKLY_DIGEST,
        priority: NotificationPriority.NORMAL,
        enabled: false,
        created_at: now,
        updated_at: now,
      },
      {
        id: 'guest_pref_7',
        user_id: 'guest_user',
        type: NotificationType.MISSED_LOG,
        channels: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
        frequency: NotificationFrequency.IMMEDIATE,
        priority: NotificationPriority.NORMAL,
        time_of_day: '21:00:00',
        enabled: true,
        created_at: now,
        updated_at: now,
      },
    ];
  }

  /**
   * Test notification send (for preview/testing)
   */
  static async sendTestNotification(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel
  ): Promise<{ success: boolean; error?: any }> {
    const testPayload = {
      title: `Test: ${type}`,
      body: 'This is a test notification from Betternapped',
      data: {
        test: true,
        type,
      },
    };

    const result = await this.createNotification(userId, {
      type,
      channel,
      payload: testPayload,
    });

    if (result.error) {
      return { success: false, error: result.error };
    }

    // In a real implementation, this would trigger the delivery worker
    console.log('Test notification queued:', result.data);

    return { success: true };
  }

  // ============================================================
  // Helper methods for Notification Widget
  // ============================================================

  /**
   * Get all notifications with limit (alias for widget)
   */
  static async getAllNotifications(
    userId: string,
    limit: number = 50
  ): Promise<{
    data: Notification[] | null;
    error: any;
  }> {
    return this.getNotifications(userId, { limit });
  }

  /**
   * Update notification status (alias for widget)
   */
  static async updateNotificationStatus(
    userId: string,
    notificationId: string,
    status: NotificationStatus
  ): Promise<{ error: any }> {
    if (await isGuestMode()) {
      return { error: null };
    }

    const updateData: any = {
      status,
    };

    if (status === NotificationStatus.READ) {
      updateData.read_at = new Date().toISOString();
    }

    const result = await SupabaseSafe.update(
      'notifications',
      notificationId,
      updateData,
      userId
    );

    return { error: result.success ? null : result.error };
  }
}
