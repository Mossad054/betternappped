/**
 * Intimacy Streaks Service
 * Handles streak goals creation, tracking, and progress calculation
 */

import { SupabaseSafe } from '@/lib/supabaseSafe';

export interface StreakGoal {
  id: string;
  user_id: string;
  goal_name: string;
  goal_type: 'frequency' | 'consistency' | 'orgasm' | 'custom';
  target_frequency: number; // e.g., 3 times per week
  target_period: 'daily' | 'weekly' | 'monthly';
  target_duration_days: number; // e.g., 30 days
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'failed' | 'paused';
  current_streak: number;
  longest_streak: number;
  success_count: number;
  missed_count: number;
  reminder_enabled: boolean;
  reminder_times: string[];
  created_at: string;
  updated_at: string;
}

export interface StreakLog {
  id: string;
  user_id: string;
  streak_goal_id: string;
  log_date: string;
  target_met: boolean;
  intimacy_count: number;
  notes?: string;
  created_at: string;
}

export interface StreakProgress {
  goal: StreakGoal;
  daysElapsed: number;
  daysRemaining: number;
  totalDays: number;
  progressPercentage: number;
  successRate: number;
  recentLogs: StreakLog[];
  isOnTrack: boolean;
}

export class IntimacyStreaksService {
  /**
   * Create a new streak goal
   */
  static async createStreakGoal(
    userId: string,
    goalData: {
      goalName: string;
      goalType: 'frequency' | 'consistency' | 'orgasm' | 'custom';
      targetFrequency: number;
      targetPeriod: 'daily' | 'weekly' | 'monthly';
      targetDurationDays: number;
      reminderEnabled?: boolean;
      reminderTimes?: string[];
    }
  ): Promise<StreakGoal | null> {
    try {
      const now = new Date();
      const startDate = now.toISOString().split('T')[0];

      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + goalData.targetDurationDays);
      const endDateStr = endDate.toISOString().split('T')[0];

      const streakGoalData = {
        user_id: userId,
        goal_name: goalData.goalName,
        goal_type: goalData.goalType,
        target_frequency: goalData.targetFrequency,
        target_period: goalData.targetPeriod,
        target_duration_days: goalData.targetDurationDays,
        start_date: startDate,
        end_date: endDateStr,
        status: 'active',
        current_streak: 0,
        longest_streak: 0,
        success_count: 0,
        missed_count: 0,
        reminder_enabled: goalData.reminderEnabled !== undefined ? goalData.reminderEnabled : true,
        reminder_times: goalData.reminderTimes || ['20:00:00'],
      };

      const result = await SupabaseSafe.insert('intimacy_streak_goals', streakGoalData, userId);

      if (result.error || !result.data) {
        console.error('Error creating streak goal:', result.error);
        return null;
      }

      return result.data as any;
    } catch (error) {
      console.error('Error in createStreakGoal:', error);
      return null;
    }
  }

  /**
   * Get user's streak goals
   */
  static async getStreakGoals(
    userId: string,
    status?: 'active' | 'completed' | 'failed' | 'paused'
  ): Promise<StreakGoal[]> {
    try {
      const filters: any = { user_id: userId };
      if (status) {
        filters.status = status;
      }

      const result = await SupabaseSafe.select('intimacy_streak_goals', filters, userId);

      if (result.error || !result.data) {
        return [];
      }

      return result.data as StreakGoal[];
    } catch (error) {
      console.error('Error in getStreakGoals:', error);
      return [];
    }
  }

  /**
   * Get streak goal by ID with full details
   */
  static async getStreakGoalById(userId: string, goalId: string): Promise<StreakGoal | null> {
    try {
      const result = await SupabaseSafe.select('intimacy_streak_goals', {
        id: goalId,
        user_id: userId,
      }, userId);

      if (result.error || !result.data || result.data.length === 0) {
        return null;
      }

      return result.data[0] as StreakGoal;
    } catch (error) {
      console.error('Error in getStreakGoalById:', error);
      return null;
    }
  }

  /**
   * Get streak progress with detailed analytics
   */
  static async getStreakProgress(userId: string, goalId: string): Promise<StreakProgress | null> {
    try {
      const [goalResult, logsResult] = await Promise.all([
        SupabaseSafe.select('intimacy_streak_goals', {
          id: goalId,
          user_id: userId,
        }, userId),
        SupabaseSafe.select('intimacy_streak_logs', {
          streak_goal_id: goalId,
          user_id: userId,
        }, userId),
      ]);

      if (goalResult.error || !goalResult.data || goalResult.data.length === 0) {
        return null;
      }

      const goal = goalResult.data[0] as StreakGoal;
      const logs = (logsResult.data || []) as StreakLog[];

      // Calculate progress metrics
      const now = new Date();
      const startDate = new Date(goal.start_date);
      const endDate = new Date(goal.end_date);

      const daysElapsed = Math.max(0, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const totalDays = goal.target_duration_days;
      const daysRemaining = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      const progressPercentage = Math.min(100, Math.round((daysElapsed / totalDays) * 100));
      const successRate = logs.length > 0
        ? Math.round((goal.success_count / logs.length) * 100)
        : 0;

      // Determine if on track
      const expectedSuccesses = Math.floor((daysElapsed / goal.target_duration_days) * goal.target_duration_days);
      const isOnTrack = goal.success_count >= expectedSuccesses * 0.8; // Within 80% of expected

      // Get recent logs (last 7 days)
      const recentLogs = logs
        .sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime())
        .slice(0, 7);

      return {
        goal,
        daysElapsed,
        daysRemaining,
        totalDays,
        progressPercentage,
        successRate,
        recentLogs,
        isOnTrack,
      };
    } catch (error) {
      console.error('Error in getStreakProgress:', error);
      return null;
    }
  }

  /**
   * Log a streak day (met or missed)
   */
  static async logStreakDay(
    userId: string,
    goalId: string,
    data: {
      logDate: Date;
      targetMet: boolean;
      intimacyCount: number;
      notes?: string;
    }
  ): Promise<boolean> {
    try {
      const logData = {
        user_id: userId,
        streak_goal_id: goalId,
        log_date: data.logDate.toISOString().split('T')[0],
        target_met: data.targetMet,
        intimacy_count: data.intimacyCount,
        notes: data.notes,
      };

      // Check if log already exists for this date
      const existingResult = await SupabaseSafe.select('intimacy_streak_logs', {
        streak_goal_id: goalId,
        log_date: logData.log_date,
      }, userId);

      let result;
      if (existingResult.data && existingResult.data.length > 0) {
        // Update existing log
        const existingLog = existingResult.data[0] as any;
        result = await SupabaseSafe.update('intimacy_streak_logs', existingLog.id, logData, userId);
      } else {
        // Insert new log
        result = await SupabaseSafe.insert('intimacy_streak_logs', logData, userId);
      }

      return !result.error;
    } catch (error) {
      console.error('Error in logStreakDay:', error);
      return false;
    }
  }

  /**
   * Auto-log streak based on intimacy activity
   */
  static async autoUpdateStreakFromIntimacy(
    userId: string,
    date: Date,
    hadIntimacy: boolean,
    hadOrgasm?: boolean
  ): Promise<void> {
    try {
      // Get active streak goals for this user
      const activeGoals = await this.getStreakGoals(userId, 'active');

      for (const goal of activeGoals) {
        let targetMet = false;
        let intimacyCount = hadIntimacy ? 1 : 0;

        // Determine if target was met based on goal type
        switch (goal.goal_type) {
          case 'frequency':
            // For frequency goals, check if intimacy happened
            targetMet = hadIntimacy;
            break;

          case 'consistency':
            // For consistency goals, any intimacy counts
            targetMet = hadIntimacy;
            break;

          case 'orgasm':
            // For orgasm goals, check if orgasm happened
            targetMet = hadOrgasm === true;
            break;

          case 'custom':
            // For custom goals, use intimacy as default
            targetMet = hadIntimacy;
            break;
        }

        // Log the day
        await this.logStreakDay(userId, goal.id, {
          logDate: date,
          targetMet,
          intimacyCount,
        });
      }
    } catch (error) {
      console.error('Error in autoUpdateStreakFromIntimacy:', error);
    }
  }

  /**
   * Update streak goal status or settings
   */
  static async updateStreakGoal(
    userId: string,
    goalId: string,
    updates: {
      status?: 'active' | 'completed' | 'failed' | 'paused';
      reminderEnabled?: boolean;
      reminderTimes?: string[];
    }
  ): Promise<boolean> {
    try {
      const result = await SupabaseSafe.update('intimacy_streak_goals', goalId, updates, userId);
      return !result.error;
    } catch (error) {
      console.error('Error in updateStreakGoal:', error);
      return false;
    }
  }

  /**
   * Delete a streak goal
   */
  static async deleteStreakGoal(userId: string, goalId: string): Promise<boolean> {
    try {
      const result = await SupabaseSafe.delete('intimacy_streak_goals', goalId, userId);
      return !result.error;
    } catch (error) {
      console.error('Error in deleteStreakGoal:', error);
      return false;
    }
  }

  /**
   * Get streak summary for dashboard
   */
  static async getStreakSummary(userId: string): Promise<{
    activeStreaks: number;
    longestStreak: number;
    currentBestStreak: number;
    totalDaysTracked: number;
  }> {
    try {
      const activeGoals = await this.getStreakGoals(userId, 'active');

      const longestStreak = Math.max(...activeGoals.map(g => g.longest_streak), 0);
      const currentBestStreak = Math.max(...activeGoals.map(g => g.current_streak), 0);

      const logsResult = await SupabaseSafe.select('intimacy_streak_logs', {
        user_id: userId,
      }, userId);

      const totalDaysTracked = logsResult.data?.length || 0;

      return {
        activeStreaks: activeGoals.length,
        longestStreak,
        currentBestStreak,
        totalDaysTracked,
      };
    } catch (error) {
      console.error('Error in getStreakSummary:', error);
      return {
        activeStreaks: 0,
        longestStreak: 0,
        currentBestStreak: 0,
        totalDaysTracked: 0,
      };
    }
  }
}
