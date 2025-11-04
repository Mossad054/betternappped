/**
 * Notification System Constants and Types
 * Date: 2025-11-05
 * Purpose: Centralized types, enums, and constants for the notification system
 */

// ============================================================
// Notification Types
// ============================================================

/**
 * Notification type categories
 */
export enum NotificationType {
  DAILY_REMINDER = 'daily_reminder',
  STREAK_ALERT = 'streak_alert',
  EXPERIMENT_REMINDER = 'experiment_reminder',
  ACTIVITY_INSIGHT = 'activity_insight',
  SLEEP_TIP = 'sleep_tip',
  HABIT_SUGGESTION = 'habit_suggestion',
  MISSED_LOG = 'missed_log',
}

/**
 * User-friendly labels for notification types
 */
export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.DAILY_REMINDER]: 'Daily Reminders',
  [NotificationType.STREAK_ALERT]: 'Streak Alerts',
  [NotificationType.EXPERIMENT_REMINDER]: 'Experiment Reminders',
  [NotificationType.ACTIVITY_INSIGHT]: 'Activity Insights',
  [NotificationType.SLEEP_TIP]: 'Sleep Tips',
  [NotificationType.HABIT_SUGGESTION]: 'Habit Suggestions',
  [NotificationType.MISSED_LOG]: 'Missed Log Reminders',
};

/**
 * Descriptions for each notification type
 */
export const NOTIFICATION_TYPE_DESCRIPTIONS: Record<NotificationType, string> = {
  [NotificationType.DAILY_REMINDER]: 'Get reminded to log your daily entries',
  [NotificationType.STREAK_ALERT]: 'Celebrate habit streaks and milestones',
  [NotificationType.EXPERIMENT_REMINDER]: 'Get notified about ongoing experiments',
  [NotificationType.ACTIVITY_INSIGHT]: 'Receive insights about your activity patterns',
  [NotificationType.SLEEP_TIP]: 'Get personalized sleep improvement tips',
  [NotificationType.HABIT_SUGGESTION]: 'Discover new habits based on your data',
  [NotificationType.MISSED_LOG]: 'Reminders when you miss daily tracking',
};

// ============================================================
// Channels
// ============================================================

/**
 * Notification delivery channels
 */
export enum NotificationChannel {
  PUSH = 'push',
  EMAIL = 'email',
  IN_APP = 'in_app',
}

/**
 * User-friendly labels for channels
 */
export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  [NotificationChannel.PUSH]: 'Push Notifications',
  [NotificationChannel.EMAIL]: 'Email',
  [NotificationChannel.IN_APP]: 'In-App',
};

// ============================================================
// Frequency
// ============================================================

/**
 * Notification frequency options
 */
export enum NotificationFrequency {
  IMMEDIATE = 'immediate',
  DAILY_DIGEST = 'daily_digest',
  WEEKLY_DIGEST = 'weekly_digest',
  ON_MILESTONE = 'on_milestone', // For item overrides
  WHEN_MISSED = 'when_missed',   // For item overrides
}

/**
 * User-friendly labels for frequency
 */
export const FREQUENCY_LABELS: Record<NotificationFrequency, string> = {
  [NotificationFrequency.IMMEDIATE]: 'Immediate',
  [NotificationFrequency.DAILY_DIGEST]: 'Daily Digest',
  [NotificationFrequency.WEEKLY_DIGEST]: 'Weekly Digest',
  [NotificationFrequency.ON_MILESTONE]: 'On Milestones',
  [NotificationFrequency.WHEN_MISSED]: 'When Missed',
};

/**
 * Descriptions for frequency options
 */
export const FREQUENCY_DESCRIPTIONS: Record<NotificationFrequency, string> = {
  [NotificationFrequency.IMMEDIATE]: 'Receive notifications as events happen',
  [NotificationFrequency.DAILY_DIGEST]: 'One summary notification per day',
  [NotificationFrequency.WEEKLY_DIGEST]: 'One summary notification per week',
  [NotificationFrequency.ON_MILESTONE]: 'Only on milestones (e.g., 7-day streak)',
  [NotificationFrequency.WHEN_MISSED]: 'Only when you miss the activity',
};

// ============================================================
// Priority
// ============================================================

/**
 * Notification priority levels
 */
export enum NotificationPriority {
  NORMAL = 'normal',
  HIGH = 'high',
}

/**
 * Priority configuration (determines batching and quiet hour behavior)
 */
export const PRIORITY_CONFIG = {
  [NotificationPriority.NORMAL]: {
    label: 'Normal',
    description: 'Can be batched into digests',
    respectQuietHours: true,
    minIntervalMinutes: 15,
  },
  [NotificationPriority.HIGH]: {
    label: 'High',
    description: 'Always delivered immediately',
    respectQuietHours: false, // High priority notifications override quiet hours
    minIntervalMinutes: 0,
  },
};

// ============================================================
// Status
// ============================================================

/**
 * Notification lifecycle status
 */
export enum NotificationStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  FAILED = 'failed',
  DELIVERED = 'delivered',
  READ = 'read',
}

// ============================================================
// Item Types (for overrides)
// ============================================================

/**
 * Item types that can have notification overrides
 */
export enum NotificationItemType {
  HABIT = 'habit',
  EXPERIMENT = 'experiment',
}

// ============================================================
// Time Presets
// ============================================================

/**
 * Quick time presets for user convenience
 */
export const TIME_PRESETS = {
  MORNING: { hour: 8, minute: 0, label: 'Morning (8:00 AM)' },
  AFTERNOON: { hour: 14, minute: 0, label: 'Afternoon (2:00 PM)' },
  EVENING: { hour: 20, minute: 0, label: 'Evening (8:00 PM)' },
  NIGHT: { hour: 21, minute: 0, label: 'Night (9:00 PM)' },
} as const;

/**
 * Default quiet hours (10 PM - 7 AM)
 */
export const DEFAULT_QUIET_HOURS = {
  start: { hour: 22, minute: 0 }, // 10:00 PM
  end: { hour: 7, minute: 0 },    // 7:00 AM
};

/**
 * Default reminder time (8 PM)
 */
export const DEFAULT_REMINDER_TIME = {
  hour: 20,
  minute: 0,
};

/**
 * Default digest times
 */
export const DEFAULT_DIGEST_TIMES = {
  daily: { hour: 20, minute: 0, label: '8:00 PM' },
  weekly: { day: 0, hour: 9, minute: 0, label: 'Sunday 9:00 AM' }, // 0 = Sunday
};

// ============================================================
// Weekday Constants
// ============================================================

/**
 * Weekday numbers (0 = Sunday, 6 = Saturday)
 */
export const WEEKDAYS = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

/**
 * Weekday labels
 */
export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAY_FULL_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Weekday presets
 */
export const WEEKDAY_PRESETS = {
  ALL: [0, 1, 2, 3, 4, 5, 6],
  WEEKDAYS: [1, 2, 3, 4, 5],
  WEEKENDS: [0, 6],
};

// ============================================================
// Priority Mapping (Event Type → Priority)
// ============================================================

/**
 * Maps event types to priority levels
 * Used by server-side logic to determine notification handling
 */
export const EVENT_PRIORITY_MAPPING = {
  // High priority events (always immediate, override quiet hours)
  HIGH: [
    'streak_milestone', // User reached 7, 30, 60, 100 day streak
    'experiment_complete', // Experiment finished
    'critical_alert', // System alerts
  ],
  
  // Medium priority events (immediate but respect quiet hours)
  MEDIUM: [
    'missed_day_reminder', // User missed logging for X consecutive days
    'habit_uncompleted', // Habit not completed for X days
    'experiment_reminder', // Daily experiment log reminder
  ],
  
  // Low priority events (batchable into digests)
  LOW: [
    'activity_tip', // General wellness tips
    'gentle_nudge', // Soft encouragement
    'insight_available', // New correlation insight
    'habit_suggestion', // New habit recommendation
  ],
} as const;

// ============================================================
// Flood Control Settings
// ============================================================

/**
 * Flood control and batching configuration
 */
export const FLOOD_CONTROL = {
  // Minimum interval between push notifications (minutes)
  MIN_PUSH_INTERVAL: 15,
  
  // Maximum notifications per day per user
  MAX_PER_DAY: 10,
  
  // Batch size for digest notifications
  DIGEST_BATCH_SIZE: 5,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY_MINUTES: [5, 15, 60], // Progressive delay
} as const;

// ============================================================
// Timezone
// ============================================================

/**
 * Default timezone (Nairobi, Kenya)
 */
export const DEFAULT_TIMEZONE = 'Africa/Nairobi';

/**
 * Timezone offset from UTC (EAT is UTC+3)
 */
export const DEFAULT_TIMEZONE_OFFSET = 3;

// ============================================================
// Database Types
// ============================================================

/**
 * Notification preference database record
 */
export interface NotificationPreference {
  id: string;
  user_id: string;
  type: NotificationType;
  channels: NotificationChannel[];
  frequency: NotificationFrequency;
  priority: NotificationPriority;
  time_of_day?: string; // HH:MM:SS format
  quiet_hours_start?: string; // HH:MM:SS format
  quiet_hours_end?: string; // HH:MM:SS format
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Item notification override database record
 */
export interface ItemNotificationOverride {
  id: string;
  user_id: string;
  item_id: string;
  item_type: NotificationItemType;
  channels: NotificationChannel[];
  frequency: NotificationFrequency;
  time_of_day?: string; // HH:MM:SS format
  weekdays: number[]; // 0-6 (Sunday-Saturday)
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Notification database record
 */
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  payload: NotificationPayload;
  send_after: string; // ISO timestamp
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  error_message?: string;
  retry_count: number;
  created_at: string;
}

/**
 * Notification payload structure
 */
export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    [key: string]: any;
  };
  action?: {
    type: 'navigate' | 'deep_link';
    target: string;
  };
}

/**
 * User device database record
 */
export interface UserDevice {
  id: string;
  user_id: string;
  device_token: string;
  platform: 'ios' | 'android' | 'web';
  push_enabled: boolean;
  last_seen: string;
  created_at: string;
}

// ============================================================
// Input Types (for service layer)
// ============================================================

/**
 * Input for creating/updating notification preference
 */
export interface NotificationPreferenceInput {
  type: NotificationType;
  channels?: NotificationChannel[];
  frequency?: NotificationFrequency;
  priority?: NotificationPriority;
  time_of_day?: string;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  enabled?: boolean;
}

/**
 * Input for creating/updating item override
 */
export interface ItemNotificationOverrideInput {
  item_id: string;
  item_type: NotificationItemType;
  channels?: NotificationChannel[];
  frequency?: NotificationFrequency;
  time_of_day?: string;
  weekdays?: number[];
  enabled?: boolean;
}

/**
 * Input for creating notification
 */
export interface NotificationInput {
  type: string;
  channel: NotificationChannel;
  payload: NotificationPayload;
  send_after?: string; // ISO timestamp
}

/**
 * Input for registering device
 */
export interface DeviceRegistrationInput {
  device_token: string;
  platform: 'ios' | 'android' | 'web';
  push_enabled?: boolean;
}

// ============================================================
// Utility Types
// ============================================================

/**
 * Time object for easy manipulation
 */
export interface TimeObject {
  hour: number; // 0-23
  minute: number; // 0-59
}

/**
 * Quiet hours configuration
 */
export interface QuietHoursConfig {
  enabled: boolean;
  start: TimeObject;
  end: TimeObject;
}

/**
 * Notification summary for digest
 */
export interface DigestSummary {
  period: 'daily' | 'weekly';
  start_date: string;
  end_date: string;
  notifications: Notification[];
  grouped_by_type: {
    [key: string]: Notification[];
  };
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Convert time string (HH:MM:SS) to TimeObject
 */
export function parseTimeString(timeStr: string): TimeObject {
  const [hour, minute] = timeStr.split(':').map(Number);
  return { hour, minute };
}

/**
 * Convert TimeObject to time string (HH:MM:SS)
 */
export function formatTimeString(time: TimeObject): string {
  const hour = String(time.hour).padStart(2, '0');
  const minute = String(time.minute).padStart(2, '0');
  return `${hour}:${minute}:00`;
}

/**
 * Check if current time is within quiet hours
 */
export function isInQuietHours(
  currentTime: TimeObject,
  quietHours: QuietHoursConfig
): boolean {
  if (!quietHours.enabled) return false;

  const { start, end } = quietHours;
  const current = currentTime.hour * 60 + currentTime.minute;
  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;

  // Handle overnight quiet hours (e.g., 22:00 - 07:00)
  if (startMinutes > endMinutes) {
    return current >= startMinutes || current < endMinutes;
  }

  // Normal quiet hours (e.g., 13:00 - 15:00)
  return current >= startMinutes && current < endMinutes;
}

/**
 * Get user-friendly time label
 */
export function formatTimeLabel(time: TimeObject): string {
  const hour = time.hour === 0 ? 12 : time.hour > 12 ? time.hour - 12 : time.hour;
  const minute = String(time.minute).padStart(2, '0');
  const period = time.hour < 12 ? 'AM' : 'PM';
  return `${hour}:${minute} ${period}`;
}

/**
 * Check if today is in allowed weekdays
 */
export function isTodayAllowed(weekdays: number[]): boolean {
  const today = new Date().getDay();
  return weekdays.includes(today);
}
