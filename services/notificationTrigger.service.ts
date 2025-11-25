/**
 * Notification Trigger Service
 * Handles automatic notification creation based on user preferences and app events
 * Respects user settings for channels (push, in-app, email) and frequency
 */

import { NotificationService } from './notifications.service';
import { PushNotificationService } from './pushNotification.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationFrequency,
  NotificationPriority,
} from '@/lib/notificationConstants';

export interface NotificationPayload {
  title: string;
  body: string;
  action?: {
    type: 'navigate' | 'deeplink';
    target: string;
  };
  data?: Record<string, any>;
}

export class NotificationTriggerService {
  /**
   * Check if notification should be sent based on user preferences
   */
  private static async shouldSendNotification(
    userId: string,
    type: NotificationType,
    channel: NotificationChannel
  ): Promise<boolean> {
    const { data: pref } = await NotificationService.getPreference(userId, type);
    
    if (!pref) {
      // No preference set, use defaults
      return channel === NotificationChannel.IN_APP;
    }

    // Check if notifications are enabled for this type
    if (!pref.enabled) {
      return false;
    }

    // Check if this channel is enabled
    if (!pref.channels.includes(channel)) {
      return false;
    }

    return true;
  }

  /**
   * Send notification through appropriate channels based on user preferences
   */
  private static async sendThroughChannels(
    userId: string,
    type: NotificationType,
    priority: NotificationPriority,
    payload: NotificationPayload
  ): Promise<void> {
    // Check each channel and send if enabled
    const channels = [
      NotificationChannel.IN_APP,
      NotificationChannel.PUSH,
      NotificationChannel.EMAIL,
    ];

    for (const channel of channels) {
      const shouldSend = await this.shouldSendNotification(userId, type, channel);
      
      if (shouldSend) {
        await NotificationService.createNotification(userId, {
          type,
          channel,
          payload,
        });

        // If it's a push notification, send it immediately
        if (channel === NotificationChannel.PUSH) {
          try {
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
              }
            );
            console.log('✅ Push notification sent:', payload.title);
          } catch (error) {
            console.error('❌ Failed to send push notification:', error);
          }
        }
      }
    }
  }

  // =============================================================================
  // Habit Notifications
  // =============================================================================

  /**
   * Send notification when a habit is completed
   */
  static async onHabitCompleted(
    userId: string,
    habitName: string,
    streak: number,
    currentDay: number,
    totalDays: number
  ): Promise<void> {
    const encouragements = [
      'Great job! 🎉',
      'Awesome! 💪',
      'Well done! ⭐',
      'Fantastic! 🌟',
      'Keep it up! 🔥',
    ];
    const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];

    await this.sendThroughChannels(
      userId,
      NotificationType.DAILY_REMINDER,
      NotificationPriority.NORMAL,
      {
        title: `${habitName} Completed!`,
        body: `${randomEncouragement} Day ${currentDay}/${totalDays} • ${streak} day streak`,
        action: {
          type: 'navigate',
          target: '/home',
        },
        data: { habitName, streak, currentDay, totalDays },
      }
    );
  }

  /**
   * Send notification when streak is at risk
   */
  static async onStreakAtRisk(
    userId: string,
    habitName: string,
    streak: number,
    hoursRemaining: number
  ): Promise<void> {
    await this.sendThroughChannels(
      userId,
      NotificationType.STREAK_ALERT,
      NotificationPriority.HIGH,
      {
        title: `Don't Break Your Streak! 🔥`,
        body: `${habitName} - ${streak} day streak. Log within ${hoursRemaining} hours!`,
        action: {
          type: 'navigate',
          target: '/home',
        },
        data: { habitName, streak, hoursRemaining },
      }
    );
  }

  /**
   * Send notification for missed habit logs
   */
  static async onMissedHabitLog(
    userId: string,
    habitNames: string[]
  ): Promise<void> {
    if (habitNames.length === 0) return;

    const title = habitNames.length === 1
      ? 'Missed Habit'
      : 'Missed Habits';

    const body = habitNames.length === 1
      ? `Don't forget to log ${habitNames[0]} today!`
      : `You haven't logged ${habitNames.length} habits today: ${habitNames.join(', ')}`;

    await this.sendThroughChannels(
      userId,
      NotificationType.MISSED_LOG,
      NotificationPriority.NORMAL,
      {
        title,
        body,
        action: {
          type: 'navigate',
          target: '/home',
        },
        data: { habitNames },
      }
    );
  }

  /**
   * Send daily habit reminder
   */
  static async sendHabitReminder(
    userId: string,
    habitName: string,
    habitEmoji: string,
    streak: number
  ): Promise<void> {
    await this.sendThroughChannels(
      userId,
      NotificationType.DAILY_REMINDER,
      NotificationPriority.NORMAL,
      {
        title: `Time for ${habitEmoji} ${habitName}`,
        body: streak > 0 ? `Keep your ${streak} day streak alive! 🔥` : 'Start building your habit streak today!',
        action: {
          type: 'navigate',
          target: '/home',
        },
        data: { habitName, streak },
      }
    );
  }

  // =============================================================================
  // Experiment Notifications
  // =============================================================================

  /**
   * Send notification when experiment day is logged
   */
  static async onExperimentLogged(
    userId: string,
    experimentName: string,
    currentDay: number,
    totalDays: number
  ): Promise<void> {
    const progress = Math.round((currentDay / totalDays) * 100);

    await this.sendThroughChannels(
      userId,
      NotificationType.EXPERIMENT_REMINDER,
      NotificationPriority.NORMAL,
      {
        title: `${experimentName} - Day ${currentDay} Logged!`,
        body: `${progress}% complete • ${totalDays - currentDay} days remaining`,
        action: {
          type: 'navigate',
          target: '/experiments-hub',
        },
        data: { experimentName, currentDay, totalDays, progress },
      }
    );
  }

  /**
   * Send notification when experiment is completed
   */
  static async onExperimentCompleted(
    userId: string,
    experimentName: string,
    duration: number,
    insights: string
  ): Promise<void> {
    await this.sendThroughChannels(
      userId,
      NotificationType.ACTIVITY_INSIGHT,
      NotificationPriority.HIGH,
      {
        title: `🎉 Experiment Complete!`,
        body: `${experimentName} (${duration} days) - View your results and insights`,
        action: {
          type: 'navigate',
          target: '/experiments-hub',
        },
        data: { experimentName, duration, insights },
      }
    );
  }

  /**
   * Send experiment reminder
   */
  static async sendExperimentReminder(
    userId: string,
    experimentName: string,
    experimentEmoji: string,
    currentDay: number,
    totalDays: number
  ): Promise<void> {
    await this.sendThroughChannels(
      userId,
      NotificationType.EXPERIMENT_REMINDER,
      NotificationPriority.NORMAL,
      {
        title: `${experimentEmoji} Log ${experimentName}`,
        body: `Day ${currentDay + 1}/${totalDays} - Track your experiment progress today`,
        action: {
          type: 'navigate',
          target: '/experiments-hub',
        },
        data: { experimentName, currentDay, totalDays },
      }
    );
  }

  // =============================================================================
  // Wellness Insights
  // =============================================================================

  /**
   * Send activity insight notification
   */
  static async sendActivityInsight(
    userId: string,
    insightTitle: string,
    insightBody: string,
    data?: Record<string, any>
  ): Promise<void> {
    await this.sendThroughChannels(
      userId,
      NotificationType.ACTIVITY_INSIGHT,
      NotificationPriority.NORMAL,
      {
        title: `💡 ${insightTitle}`,
        body: insightBody,
        action: {
          type: 'navigate',
          target: '/home',
        },
        data: data || {},
      }
    );
  }

  /**
   * Send sleep tip notification
   */
  static async sendSleepTip(
    userId: string,
    tipTitle: string,
    tipBody: string
  ): Promise<void> {
    await this.sendThroughChannels(
      userId,
      NotificationType.SLEEP_TIP,
      NotificationPriority.NORMAL,
      {
        title: `😴 ${tipTitle}`,
        body: tipBody,
        action: {
          type: 'navigate',
          target: '/sleep',
        },
      }
    );
  }

  /**
   * Send habit suggestion notification
   */
  static async sendHabitSuggestion(
    userId: string,
    suggestionTitle: string,
    suggestionBody: string,
    habitCategory: string
  ): Promise<void> {
    await this.sendThroughChannels(
      userId,
      NotificationType.HABIT_SUGGESTION,
      NotificationPriority.NORMAL,
      {
        title: `💡 ${suggestionTitle}`,
        body: suggestionBody,
        action: {
          type: 'navigate',
          target: '/home',
        },
        data: { category: habitCategory },
      }
    );
  }

  // =============================================================================
  // Streak & Achievement Notifications
  // =============================================================================

  /**
   * Send milestone achievement notification
   */
  static async onMilestoneReached(
    userId: string,
    milestone: string,
    description: string,
    emoji: string
  ): Promise<void> {
    await this.sendThroughChannels(
      userId,
      NotificationType.STREAK_ALERT,
      NotificationPriority.HIGH,
      {
        title: `${emoji} Milestone Reached!`,
        body: `${milestone} - ${description}`,
        action: {
          type: 'navigate',
          target: '/home',
        },
        data: { milestone, description },
      }
    );
  }

  /**
   * Send weekly streak summary
   */
  static async sendWeeklyStreakSummary(
    userId: string,
    totalLogs: number,
    longestStreak: number,
    habitsCompleted: number
  ): Promise<void> {
    await this.sendThroughChannels(
      userId,
      NotificationType.ACTIVITY_INSIGHT,
      NotificationPriority.NORMAL,
      {
        title: '📊 Your Weekly Summary',
        body: `${totalLogs} logs • ${habitsCompleted} habits completed • ${longestStreak} day best streak`,
        action: {
          type: 'navigate',
          target: '/home',
        },
        data: { totalLogs, longestStreak, habitsCompleted },
      }
    );
  }

  // =============================================================================
  // Mood & Mental Clarity
  // =============================================================================

  /**
   * Send mood check-in reminder
   */
  static async sendMoodReminder(userId: string): Promise<void> {
    await this.sendThroughChannels(
      userId,
      NotificationType.DAILY_REMINDER,
      NotificationPriority.NORMAL,
      {
        title: '😊 How are you feeling?',
        body: 'Take a moment to log your mood and mental clarity',
        action: {
          type: 'navigate',
          target: '/moods',
        },
      }
    );
  }

  /**
   * Send mood insight based on patterns
   */
  static async sendMoodInsight(
    userId: string,
    insight: string,
    recommendation: string
  ): Promise<void> {
    await this.sendThroughChannels(
      userId,
      NotificationType.ACTIVITY_INSIGHT,
      NotificationPriority.NORMAL,
      {
        title: '🧠 Mood Pattern Detected',
        body: `${insight} ${recommendation}`,
        action: {
          type: 'navigate',
          target: '/moods',
        },
      }
    );
  }
}
