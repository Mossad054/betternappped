/**
 * Notification Trigger Service
 * Handles automatic notification creation based on user preferences and app events
 * Respects user settings for channels (push, in-app, email) and frequency
 *
 * UPDATED: Now uses unified NotificationEngineService for all dispatching
 */

import { NotificationEngineService, NotificationPayload, NotificationRequest } from './notificationEngine.service';
import {
  NotificationType,
  NotificationPriority,
} from '@/lib/notificationConstants';

export class NotificationTriggerService {
  /**
   * Send notification through unified engine
   * This ensures all settings, quiet hours, and preferences are respected
   */
  private static async sendThroughEngine(
    userId: string,
    type: NotificationType,
    priority: NotificationPriority,
    payload: NotificationPayload,
    itemId?: string,
    itemType?: 'habit' | 'experiment' | 'activity' | 'program' | 'sleep' | 'mood'
  ): Promise<boolean> {
    const request: NotificationRequest = {
      userId,
      type,
      priority,
      payload,
      itemId,
      itemType,
    };

    return NotificationEngineService.send(request);
  }

  // =============================================================================
  // Habit Notifications
  // =============================================================================

  /**
   * Send notification when a habit is completed
   */
  static async onHabitCompleted(
    userId: string,
    habitId: string,
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

    await this.sendThroughEngine(
      userId,
      NotificationType.DAILY_REMINDER,
      NotificationPriority.NORMAL,
      {
        title: `${habitName} Completed!`,
        body: `${randomEncouragement} Day ${currentDay}/${totalDays} • ${streak} day streak`,
        action: {
          type: 'navigate',
          target: '/habits',
          params: { habitId },
        },
        data: { habitName, streak, currentDay, totalDays },
      },
      habitId,
      'habit'
    );
  }

  /**
   * Send notification when streak is at risk
   */
  static async onStreakAtRisk(
    userId: string,
    habitId: string,
    habitName: string,
    streak: number,
    hoursRemaining: number
  ): Promise<void> {
    await this.sendThroughEngine(
      userId,
      NotificationType.STREAK_ALERT,
      NotificationPriority.HIGH,
      {
        title: `Don't Break Your Streak! 🔥`,
        body: `${habitName} - ${streak} day streak. Log within ${hoursRemaining} hours!`,
        action: {
          type: 'navigate',
          target: '/habits',
          params: { habitId },
        },
        data: { habitName, streak, hoursRemaining },
      },
      habitId,
      'habit'
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

    await this.sendThroughEngine(
      userId,
      NotificationType.MISSED_LOG,
      NotificationPriority.NORMAL,
      {
        title,
        body,
        action: {
          type: 'navigate',
          target: '/habits',
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
    habitId: string,
    habitName: string,
    habitEmoji: string,
    streak: number
  ): Promise<void> {
    await this.sendThroughEngine(
      userId,
      NotificationType.DAILY_REMINDER,
      NotificationPriority.NORMAL,
      {
        title: `Time for ${habitEmoji} ${habitName}`,
        body: streak > 0 ? `Keep your ${streak} day streak alive! 🔥` : 'Start building your habit streak today!',
        action: {
          type: 'navigate',
          target: '/habits',
          params: { habitId },
        },
        data: { habitName, streak },
      },
      habitId,
      'habit'
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

    await this.sendThroughEngine(
      userId,
      NotificationType.EXPERIMENT_REMINDER,
      NotificationPriority.NORMAL,
      {
        title: `${experimentName} - Day ${currentDay} Logged!`,
        body: `${progress}% complete • ${totalDays - currentDay} days remaining`,
        action: {
          type: 'navigate',
          target: '/create-experiment',
          params: { experimentId: experimentName },
        },
        data: { experimentName, currentDay, totalDays, progress },
      },
      experimentName,
      'experiment'
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
    await this.sendThroughEngine(
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
    await this.sendThroughEngine(
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
    await this.sendThroughEngine(
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
    await this.sendThroughEngine(
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
    await this.sendThroughEngine(
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
    await this.sendThroughEngine(
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
    await this.sendThroughEngine(
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
    await this.sendThroughEngine(
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
    await this.sendThroughEngine(
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
