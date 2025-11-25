/**
 * Activity Feedback Service
 * Handles capturing and storing activity feedback with emoji scores
 */

import { SupabaseSafe } from '@/lib/supabaseSafe';
import { isGuestMode, guestDataStore } from '@/lib/guestDataStore';
import { CorrelationEngineService } from './correlationEngine.service';
import {
  getScoreFromEmoji,
  ACTIVITY_FEEDBACK_OPTIONS,
  SLEEP_FEEDBACK_OPTIONS,
  CLARITY_FEEDBACK_OPTIONS,
  ENERGY_FEEDBACK_OPTIONS,
} from '@/constants/emojiScoreMapping';

export interface ActivityRatings {
  moodRating: number | null;
  sleepRating: number | null;
  clarityRating: number | null;
  energyRating: number | null;
}

export interface ActivityFeedbackData {
  activity_id?: string;
  activity_type: string;
  activity_name: string;
  category?: string;
  date?: string;
  ratings: ActivityRatings;
  notes?: string;
}

export class ActivityFeedbackService {
  /**
   * Submit activity feedback with ratings
   */
  static async submitFeedback(
    userId: string,
    feedback: ActivityFeedbackData
  ): Promise<{ data: any; error: any }> {
    const date = feedback.date || new Date().toISOString().split('T')[0];

    // Map numeric ratings to emoji IDs
    const moodEmoji = feedback.ratings.moodRating
      ? ACTIVITY_FEEDBACK_OPTIONS.find(o => o.score === feedback.ratings.moodRating)?.emoji || '😐'
      : '😐';

    // Use the correlation engine to log the feedback
    const result = await CorrelationEngineService.logActivityFeedback(userId, {
      activity_id: feedback.activity_id,
      activity_type: feedback.activity_type,
      activity_name: feedback.activity_name,
      date,
      emoji_id: moodEmoji,
      mood_score: feedback.ratings.moodRating || undefined,
      sleep_score: feedback.ratings.sleepRating || undefined,
      clarity_score: feedback.ratings.clarityRating || undefined,
      energy_score: feedback.ratings.energyRating || undefined,
      notes: feedback.notes,
    });

    // Also update the activity record if we have an activity_id
    if (feedback.activity_id && result.data) {
      await this.updateActivityWithFeedback(userId, feedback.activity_id, feedback.ratings);
    }

    return result;
  }

  /**
   * Update activity record with feedback scores
   */
  static async updateActivityWithFeedback(
    userId: string,
    activityId: string,
    ratings: ActivityRatings
  ): Promise<{ error: any }> {
    if (await isGuestMode()) {
      return { error: null };
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const { error } = await supabase
        .from('activities')
        .update({
          mood_score: ratings.moodRating,
          sleep_impact_score: ratings.sleepRating,
          clarity_score: ratings.clarityRating,
          energy_score: ratings.energyRating,
          has_feedback: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activityId)
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      console.error('Error updating activity with feedback:', error);
      return { error };
    }
  }

  /**
   * Get feedback for a specific activity
   */
  static async getActivityFeedback(
    userId: string,
    activityId: string
  ): Promise<{ data: any; error: any }> {
    if (await isGuestMode()) {
      return { data: null, error: null };
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const { data, error } = await supabase
        .from('activity_feedback_log')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_id', activityId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error getting activity feedback:', error);
      return { data: null, error };
    }
  }

  /**
   * Get all feedback for a specific date
   */
  static async getFeedbackForDate(
    userId: string,
    date: string
  ): Promise<{ data: any[]; error: any }> {
    if (await isGuestMode()) {
      return { data: [], error: null };
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const { data, error } = await supabase
        .from('activity_feedback_log')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('created_at', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      console.error('Error getting feedback for date:', error);
      return { data: [], error };
    }
  }

  /**
   * Get activity statistics with correlations
   */
  static async getActivityStatistics(
    userId: string,
    activityType: string,
    days: number = 30
  ): Promise<{ data: any; error: any }> {
    if (await isGuestMode()) {
      return { data: null, error: null };
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get feedback history
      const { data: feedback, error: feedbackError } = await supabase
        .from('activity_feedback_log')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', activityType)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (feedbackError) {
        return { data: null, error: feedbackError };
      }

      // Get correlation data
      const { data: correlation } = await CorrelationEngineService.getActivityCorrelation(
        userId,
        activityType
      );

      // Calculate statistics
      const stats = {
        totalOccurrences: feedback?.length || 0,
        avgMoodScore: feedback && feedback.length > 0
          ? feedback.reduce((sum, f) => sum + (f.mood_score || 0), 0) / feedback.length
          : 0,
        avgEnergyScore: feedback && feedback.length > 0
          ? feedback.reduce((sum, f) => sum + (f.energy_score || 0), 0) / feedback.length
          : 0,
        avgSleepScore: feedback && feedback.length > 0
          ? feedback.reduce((sum, f) => sum + (f.sleep_score || 0), 0) / feedback.length
          : 0,
        avgClarityScore: feedback && feedback.length > 0
          ? feedback.reduce((sum, f) => sum + (f.clarity_score || 0), 0) / feedback.length
          : 0,
        recentFeedback: feedback?.slice(0, 5) || [],
        correlation,
        trend: this.calculateTrend(feedback || []),
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error('Error getting activity statistics:', error);
      return { data: null, error };
    }
  }

  /**
   * Calculate trend from feedback data
   */
  private static calculateTrend(feedback: any[]): 'improving' | 'declining' | 'stable' {
    if (feedback.length < 3) return 'stable';

    const recent = feedback.slice(0, 3).map(f => f.mood_score || 3);
    const older = feedback.slice(-3).map(f => f.mood_score || 3);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

    if (recentAvg - olderAvg > 0.5) return 'improving';
    if (olderAvg - recentAvg > 0.5) return 'declining';
    return 'stable';
  }

  /**
   * Get top performing activities
   */
  static async getTopActivities(
    userId: string,
    limit: number = 5
  ): Promise<{ data: any[]; error: any }> {
    if (await isGuestMode()) {
      return { data: [], error: null };
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const { data, error } = await supabase
        .from('activity_correlation_summary')
        .select('*')
        .eq('user_id', userId)
        .gte('sample_size', 3)
        .order('correlation_with_mood', { ascending: false })
        .limit(limit);

      return { data: data || [], error };
    } catch (error) {
      console.error('Error getting top activities:', error);
      return { data: [], error };
    }
  }

  /**
   * Get activity recommendations based on current mood
   */
  static async getRecommendations(
    userId: string,
    currentMood?: number
  ): Promise<{ data: any[]; error: any }> {
    if (await isGuestMode()) {
      return { data: [], error: null };
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      // Get beneficial activities
      const { data: beneficial, error } = await supabase
        .from('activity_correlation_summary')
        .select('*')
        .eq('user_id', userId)
        .eq('is_beneficial', true)
        .gte('sample_size', 3)
        .order('correlation_with_mood', { ascending: false })
        .limit(5);

      if (error) {
        return { data: [], error };
      }

      // Generate recommendations
      const recommendations = beneficial?.map(activity => ({
        activity_type: activity.activity_type,
        reason: this.generateRecommendationReason(activity, currentMood),
        impact: {
          mood: activity.correlation_with_mood,
          clarity: activity.correlation_with_clarity,
          sleep: activity.correlation_with_sleep_quality,
        },
        priority: this.calculatePriority(activity, currentMood),
      })) || [];

      // Sort by priority
      recommendations.sort((a, b) => b.priority - a.priority);

      return { data: recommendations, error: null };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return { data: [], error };
    }
  }

  /**
   * Generate recommendation reason
   */
  private static generateRecommendationReason(activity: any, currentMood?: number): string {
    if (currentMood && currentMood < 3) {
      if (activity.correlation_with_mood > 0.3) {
        return `${activity.activity_type} typically improves your mood by ${Math.round(activity.avg_mood_with_activity - activity.avg_mood_without_activity)} points`;
      }
    }

    if (activity.correlation_with_sleep_quality > 0.3) {
      return `${activity.activity_type} helps improve your sleep quality`;
    }

    if (activity.correlation_with_clarity > 0.3) {
      return `${activity.activity_type} enhances your mental clarity`;
    }

    return activity.recommendation || `${activity.activity_type} has positive effects on your wellness`;
  }

  /**
   * Calculate recommendation priority
   */
  private static calculatePriority(activity: any, currentMood?: number): number {
    let priority = 0;

    // Higher priority for mood-boosting activities when mood is low
    if (currentMood && currentMood < 3) {
      priority += activity.correlation_with_mood * 2;
    } else {
      priority += activity.correlation_with_mood;
    }

    // Add other correlations
    priority += activity.correlation_with_clarity * 0.5;
    priority += activity.correlation_with_sleep_quality * 0.5;

    // Bonus for sample size (more reliable data)
    priority += Math.min(activity.sample_size / 20, 0.5);

    return priority;
  }
}
