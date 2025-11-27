/**
 * Notification Scheduler Service
 * Comprehensive notification scheduling for all app features
 * Handles time-based reminders, smart scheduling, and quiet hours
 */

import * as Notifications from 'expo-notifications';
import { NotificationService } from './notifications.service';
import { NotificationEngineService, NotificationRequest } from './notificationEngine.service';
import { HabitsService } from './habits.service';
import { ExperimentsService } from './experiments.service';
import { MoodsService } from './moods.service';
import { SleepService } from './sleep.service';
import { IntimacyCheckInService } from './intimacyCheckIn.service';
import { UserPreferencesService } from './userPreferences.service';
import {
  NotificationType,
  NotificationPriority,
} from '@/lib/notificationConstants';

interface ScheduledNotification {
  id: string;
  userId: string;
  type: NotificationType;
  scheduledFor: Date;
  itemId?: string; // For habit/experiment specific notifications
  metadata?: Record<string, any>;
}

interface ReminderTime {
  hour: number;
  minute: number;
}

export class NotificationSchedulerService {
  // Track scheduled notifications to prevent duplicates
  private static scheduledNotifications: Map<string, string> = new Map();

  // =============================================================================
  // Core Scheduling Functions
  // =============================================================================

  /**
   * Schedule a local notification with Expo
   */
  private static async scheduleLocalNotification(
    title: string,
    body: string,
    trigger: Date | ReminderTime & { repeats: boolean },
    data?: any
  ): Promise<string | null> {
    try {
      const { status } = await Notifications.getPermissionsAsync();

      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
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

      // Check quiet hours before scheduling
      const isQuietHours = await this.isQuietHours(trigger);
      if (isQuietHours && data?.priority !== 'high') {
        console.log('Notification suppressed due to quiet hours');
        return null;
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
          sound: true,
          badge: 1,
        },
        trigger: notificationTrigger,
      });

      return id;
    } catch (error) {
      console.error('Error scheduling local notification:', error);
      return null;
    }
  }

  /**
   * Check if current time is within quiet hours
   */
  private static async isQuietHours(
    trigger: Date | ReminderTime
  ): Promise<boolean> {
    try {
      // Get user's quiet hours preference
      // For now, default quiet hours: 10 PM - 7 AM
      const quietStart = 22; // 10 PM
      const quietEnd = 7;    // 7 AM

      let hour: number;
      if (trigger instanceof Date) {
        hour = trigger.getHours();
      } else {
        hour = trigger.hour;
      }

      return hour >= quietStart || hour < quietEnd;
    } catch (error) {
      console.error('Error checking quiet hours:', error);
      return false;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  private static async cancelScheduledNotification(
    notificationKey: string
  ): Promise<void> {
    try {
      const notificationId = this.scheduledNotifications.get(notificationKey);
      if (notificationId) {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        this.scheduledNotifications.delete(notificationKey);
      }
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  /**
   * Get unique key for notification to prevent duplicates
   */
  private static getNotificationKey(
    userId: string,
    type: string,
    itemId?: string
  ): string {
    return `${userId}_${type}${itemId ? `_${itemId}` : ''}`;
  }

  // =============================================================================
  // Habit Reminders
  // =============================================================================

  /**
   * Schedule daily reminder for a habit
   * Now uses unified NotificationEngineService
   */
  static async scheduleHabitReminder(
    userId: string,
    habitId: string,
    habitName: string,
    habitEmoji: string,
    reminderTime: ReminderTime
  ): Promise<void> {
    try {
      const key = this.getNotificationKey(userId, 'habit_reminder', habitId);

      // Cancel existing reminder for this habit
      await this.cancelScheduledNotification(key);

      // Create scheduled date
      const scheduledDate = new Date();
      scheduledDate.setHours(reminderTime.hour, reminderTime.minute, 0, 0);

      // If time is in the past today, schedule for tomorrow
      if (scheduledDate < new Date()) {
        scheduledDate.setDate(scheduledDate.getDate() + 1);
      }

      // Schedule through unified engine (handles quiet hours, settings, etc.)
      const notificationId = await NotificationEngineService.schedule({
        userId,
        type: NotificationType.DAILY_REMINDER,
        priority: NotificationPriority.NORMAL,
        payload: {
          title: `Time for ${habitEmoji} ${habitName}`,
          body: `Don't forget to complete your ${habitName} habit today.`,
          action: {
            type: 'navigate',
            target: '/habits',
            params: { habitId },
          },
          data: { habitId, habitName },
        },
        itemId: habitId,
        itemType: 'habit',
        scheduledFor: scheduledDate,
      });

      if (notificationId) {
        this.scheduledNotifications.set(key, notificationId);
      }
    } catch (error) {
      console.error('Error scheduling habit reminder:', error);
    }
  }

  /**
   * Schedule all habit reminders for a user
   */
  static async scheduleAllHabitReminders(userId: string): Promise<void> {
    try {
      const { data: habits } = await HabitsService.getAll(userId);

      if (!habits) return;

      // Filter for active habits only
      const activeHabits = habits.filter(h => h.is_active);

      for (const habit of activeHabits) {
        // Check if habit has a reminder time set
        if (habit.reminder_time) {
          const [hour, minute] = habit.reminder_time.split(':').map(Number);
          await this.scheduleHabitReminder(userId, habit.id, habit.name, {
            hour,
            minute,
          });
        } else {
          // Use default time from user preferences or 9 AM
          const defaultTime = { hour: 9, minute: 0 };
          await this.scheduleHabitReminder(
            userId,
            habit.id,
            habit.name,
            defaultTime
          );
        }
      }
    } catch (error) {
      console.error('Error scheduling all habit reminders:', error);
    }
  }

  /**
   * Cancel habit reminder
   */
  static async cancelHabitReminder(
    userId: string,
    habitId: string
  ): Promise<void> {
    const key = this.getNotificationKey(userId, 'habit_reminder', habitId);
    await this.cancelScheduledNotification(key);
  }

  /**
   * Check for missed habits and send end-of-day reminder
   */
  static async checkMissedHabits(userId: string): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: habits } = await HabitsService.getAll(userId);

      if (!habits) return;

      // Get logs for today across all habits
      const { data: logs } = await HabitsService.getHabitLogsByDateRange(userId, today, today);
      const loggedHabitIds = new Set(logs?.map(log => log.habit_id) || []);

      const missedHabits = habits.filter(
        habit => habit.is_active && !loggedHabitIds.has(habit.id)
      );

      if (missedHabits.length > 0) {
        await NotificationTriggerService.onMissedHabitLog(
          userId,
          missedHabits.map(h => h.name)
        );
      }
    } catch (error) {
      console.error('Error checking missed habits:', error);
    }
  }

  // =============================================================================
  // Experiment Reminders
  // =============================================================================

  /**
   * Schedule daily experiment reminder
   */
  static async scheduleExperimentReminder(
    userId: string,
    experimentId: string,
    experimentName: string,
    reminderTime: ReminderTime
  ): Promise<void> {
    try {
      const key = this.getNotificationKey(
        userId,
        'experiment_reminder',
        experimentId
      );

      await this.cancelScheduledNotification(key);

      const notificationId = await this.scheduleLocalNotification(
        `Log Your Experiment 📊`,
        `How's the "${experimentName}" experiment going today?`,
        { ...reminderTime, repeats: true },
        {
          type: 'experiment_reminder',
          experimentId,
          userId,
          action: { type: 'navigate', target: '/experiments-hub' },
        }
      );

      if (notificationId) {
        this.scheduledNotifications.set(key, notificationId);
      }
    } catch (error) {
      console.error('Error scheduling experiment reminder:', error);
    }
  }

  /**
   * Schedule all active experiment reminders
   */
  static async scheduleAllExperimentReminders(userId: string): Promise<void> {
    try {
      const { data: experiments } = await ExperimentsService.getActive(userId);

      if (!experiments) return;

      for (const experiment of experiments) {
        // Default to 8 PM for experiment logging
        const defaultTime = { hour: 20, minute: 0 };
        await this.scheduleExperimentReminder(
          userId,
          experiment.id,
          experiment.name,
          defaultTime
        );
      }
    } catch (error) {
      console.error('Error scheduling all experiment reminders:', error);
    }
  }

  /**
   * Cancel experiment reminder
   */
  static async cancelExperimentReminder(
    userId: string,
    experimentId: string
  ): Promise<void> {
    const key = this.getNotificationKey(userId, 'experiment_reminder', experimentId);
    await this.cancelScheduledNotification(key);
  }

  // =============================================================================
  // Mood Check-in Reminders
  // =============================================================================

  /**
   * Schedule morning mood check-in
   */
  static async scheduleMorningMoodReminder(userId: string): Promise<void> {
    try {
      const key = this.getNotificationKey(userId, 'mood_morning');

      await this.cancelScheduledNotification(key);

      // Default: 8 AM
      const notificationId = await this.scheduleLocalNotification(
        'Good Morning! ☀️',
        'How are you feeling today? Take a moment to check in.',
        { hour: 8, minute: 0, repeats: true },
        {
          type: 'mood_reminder',
          timing: 'morning',
          userId,
          action: { type: 'navigate', target: '/journal' },
        }
      );

      if (notificationId) {
        this.scheduledNotifications.set(key, notificationId);
      }
    } catch (error) {
      console.error('Error scheduling morning mood reminder:', error);
    }
  }

  /**
   * Schedule evening mood check-in
   */
  static async scheduleEveningMoodReminder(userId: string): Promise<void> {
    try {
      const key = this.getNotificationKey(userId, 'mood_evening');

      await this.cancelScheduledNotification(key);

      // Default: 8 PM
      const notificationId = await this.scheduleLocalNotification(
        'Evening Reflection 🌙',
        'How was your day? Log your evening mood.',
        { hour: 20, minute: 0, repeats: true },
        {
          type: 'mood_reminder',
          timing: 'evening',
          userId,
          action: { type: 'navigate', target: '/journal' },
        }
      );

      if (notificationId) {
        this.scheduledNotifications.set(key, notificationId);
      }
    } catch (error) {
      console.error('Error scheduling evening mood reminder:', error);
    }
  }

  /**
   * Schedule both mood check-ins
   */
  static async scheduleMoodReminders(userId: string): Promise<void> {
    await this.scheduleMorningMoodReminder(userId);
    await this.scheduleEveningMoodReminder(userId);
  }

  // =============================================================================
  // Sleep Reminders
  // =============================================================================

  /**
   * Schedule morning sleep logging reminder
   */
  static async scheduleSleepLoggingReminder(userId: string): Promise<void> {
    try {
      const key = this.getNotificationKey(userId, 'sleep_logging');

      await this.cancelScheduledNotification(key);

      // Default: 7:30 AM
      const notificationId = await this.scheduleLocalNotification(
        'Log Your Sleep 😴',
        'How did you sleep last night?',
        { hour: 7, minute: 30, repeats: true },
        {
          type: 'sleep_reminder',
          action: { type: 'navigate', target: '/sleep-wellness-hub' },
          userId,
        }
      );

      if (notificationId) {
        this.scheduledNotifications.set(key, notificationId);
      }
    } catch (error) {
      console.error('Error scheduling sleep logging reminder:', error);
    }
  }

  /**
   * Schedule bedtime reminder
   */
  static async scheduleBedtimeReminder(
    userId: string,
    bedtime?: ReminderTime
  ): Promise<void> {
    try {
      const key = this.getNotificationKey(userId, 'bedtime');

      await this.cancelScheduledNotification(key);

      // Default: 10 PM, or use user's preferred bedtime
      const time = bedtime || { hour: 22, minute: 0 };

      const notificationId = await this.scheduleLocalNotification(
        'Time to Wind Down 🌙',
        'Start your bedtime routine for better sleep.',
        { ...time, repeats: true },
        {
          type: 'bedtime_reminder',
          action: { type: 'navigate', target: '/sleep-wellness/wind-down' },
          userId,
        }
      );

      if (notificationId) {
        this.scheduledNotifications.set(key, notificationId);
      }
    } catch (error) {
      console.error('Error scheduling bedtime reminder:', error);
    }
  }

  /**
   * Schedule all sleep reminders
   */
  static async scheduleSleepReminders(
    userId: string,
    bedtime?: ReminderTime
  ): Promise<void> {
    await this.scheduleSleepLoggingReminder(userId);
    await this.scheduleBedtimeReminder(userId, bedtime);
  }

  // =============================================================================
  // Mental Clarity Test Reminders
  // =============================================================================

  /**
   * Schedule mental clarity test reminder
   */
  static async scheduleMentalClarityReminder(
    userId: string,
    preferredTime?: ReminderTime
  ): Promise<void> {
    try {
      const key = this.getNotificationKey(userId, 'mental_clarity');

      await this.cancelScheduledNotification(key);

      // Default: 10 AM, or use user's preferred time
      const time = preferredTime || { hour: 10, minute: 0 };

      const notificationId = await this.scheduleLocalNotification(
        'Test Your Mental Clarity 🧠',
        'Take a few minutes to assess your cognitive performance.',
        { ...time, repeats: true },
        {
          type: 'mental_clarity_reminder',
          action: { type: 'navigate', target: '/mental-clarity-test' },
          userId,
        }
      );

      if (notificationId) {
        this.scheduledNotifications.set(key, notificationId);
      }
    } catch (error) {
      console.error('Error scheduling mental clarity reminder:', error);
    }
  }

  // =============================================================================
  // Intimacy Check-in Reminders
  // =============================================================================

  /**
   * Schedule intimacy check-in reminder
   */
  static async scheduleIntimacyCheckInReminder(
    userId: string,
    preferredTime?: ReminderTime
  ): Promise<void> {
    try {
      const key = this.getNotificationKey(userId, 'intimacy_checkin');

      await this.cancelScheduledNotification(key);

      // Default: 9 PM
      const time = preferredTime || { hour: 21, minute: 0 };

      const notificationId = await this.scheduleLocalNotification(
        'Relationship Check-in 💕',
        'Take a moment to reflect on your connection.',
        { ...time, repeats: true },
        {
          type: 'intimacy_reminder',
          action: { type: 'navigate', target: '/intimacy-hub-main' },
          userId,
        }
      );

      if (notificationId) {
        this.scheduledNotifications.set(key, notificationId);
      }
    } catch (error) {
      console.error('Error scheduling intimacy check-in reminder:', error);
    }
  }

  // =============================================================================
  // Activity Tracking Reminders
  // =============================================================================

  /**
   * Schedule activity logging reminder
   */
  static async scheduleActivityReminder(userId: string): Promise<void> {
    try {
      const key = this.getNotificationKey(userId, 'activity_logging');

      await this.cancelScheduledNotification(key);

      // Default: 7 PM
      const notificationId = await this.scheduleLocalNotification(
        'Log Your Activities 📝',
        'What did you do today?',
        { hour: 19, minute: 0, repeats: true },
        {
          type: 'activity_reminder',
          action: { type: 'navigate', target: '/activity' },
          userId,
        }
      );

      if (notificationId) {
        this.scheduledNotifications.set(key, notificationId);
      }
    } catch (error) {
      console.error('Error scheduling activity reminder:', error);
    }
  }

  // =============================================================================
  // Streak Alerts
  // =============================================================================

  /**
   * Check for at-risk streaks and send alerts
   */
  static async checkStreakAlerts(userId: string): Promise<void> {
    try {
      const { data: habits } = await HabitsService.getAll(userId);

      if (!habits) return;

      const today = new Date().toISOString().split('T')[0];
      const { data: logs } = await HabitsService.getHabitLogsByDateRange(userId, today, today);
      const loggedHabitIds = new Set(logs?.map(log => log.habit_id) || []);

      // Find habits with streaks at risk
      const atRiskHabits = habits.filter(habit => {
        const hasStreak = (habit.current_streak || 0) >= 3;
        const notLoggedToday = !loggedHabitIds.has(habit.id);
        return habit.is_active && hasStreak && notLoggedToday;
      });

      if (atRiskHabits.length > 0) {
        // Send notification at 8 PM if streaks are at risk
        const now = new Date();
        const hour = now.getHours();

        if (hour >= 20) {
          for (const habit of atRiskHabits) {
            // Calculate hours remaining until midnight
            const hoursRemaining = 24 - hour;
            await NotificationTriggerService.onStreakAtRisk(
              userId,
              habit.name,
              habit.current_streak || 0,
              hoursRemaining
            );
          }
        }
      }
    } catch (error) {
      console.error('Error checking streak alerts:', error);
    }
  }

  // =============================================================================
  // Weekly Summary
  // =============================================================================

  /**
   * Schedule weekly summary notification
   */
  static async scheduleWeeklySummary(userId: string): Promise<void> {
    try {
      const key = this.getNotificationKey(userId, 'weekly_summary');

      await this.cancelScheduledNotification(key);

      // Every Sunday at 7 PM
      const nextSunday = new Date();
      nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
      nextSunday.setHours(19, 0, 0, 0);

      const notificationId = await this.scheduleLocalNotification(
        'Your Weekly Progress 📊',
        'Check out your achievements this week!',
        nextSunday,
        {
          type: 'weekly_summary',
          action: { type: 'navigate', target: '/calendar' },
          userId,
        }
      );

      if (notificationId) {
        this.scheduledNotifications.set(key, notificationId);
      }
    } catch (error) {
      console.error('Error scheduling weekly summary:', error);
    }
  }

  // =============================================================================
  // Master Scheduling Functions
  // =============================================================================

  /**
   * Initialize all notifications for a user
   * Call this when user logs in or updates notification preferences
   */
  static async initializeAllNotifications(userId: string): Promise<void> {
    try {
      console.log('Initializing all notifications for user:', userId);

      // Check notification permissions first
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted, requesting...');
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          console.warn('User denied notification permissions');
          return;
        }
      }

      // Schedule all notification types
      await Promise.all([
        this.scheduleAllHabitReminders(userId),
        this.scheduleAllExperimentReminders(userId),
        this.scheduleMoodReminders(userId),
        this.scheduleSleepReminders(userId),
        this.scheduleMentalClarityReminder(userId),
        this.scheduleIntimacyCheckInReminder(userId),
        this.scheduleActivityReminder(userId),
        this.scheduleWeeklySummary(userId),
      ]);

      console.log('All notifications initialized successfully');
    } catch (error) {
      console.error('Error initializing all notifications:', error);
    }
  }

  /**
   * Cancel all notifications for a user
   * Call this when user logs out or disables all notifications
   */
  static async cancelAllNotifications(userId: string): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      this.scheduledNotifications.clear();
      console.log('All notifications canceled for user:', userId);
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Refresh all notifications
   * Call this when user updates preferences or adds/removes habits/experiments
   */
  static async refreshAllNotifications(userId: string): Promise<void> {
    await this.cancelAllNotifications(userId);
    await this.initializeAllNotifications(userId);
  }

  // =============================================================================
  // Daily Checks (Run via background task or cron)
  // =============================================================================

  /**
   * Daily maintenance - check for missed logs, streaks at risk, etc.
   * Should be run every evening (e.g., 8 PM)
   */
  static async runDailyChecks(userId: string): Promise<void> {
    try {
      console.log('Running daily checks for user:', userId);

      await Promise.all([
        this.checkMissedHabits(userId),
        this.checkStreakAlerts(userId),
      ]);

      console.log('Daily checks completed');
    } catch (error) {
      console.error('Error running daily checks:', error);
    }
  }

  /**
   * Get all scheduled notifications for debugging
   */
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }
}
