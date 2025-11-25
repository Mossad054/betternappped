/**
 * Habit Correlation Engine Service
 * Computes correlations between habits and wellness metrics
 */

import { SupabaseSafe } from '@/lib/supabaseSafe';
import { isGuestMode, guestDataStore } from '@/lib/guestDataStore';
import {
  getScoreFromEmoji,
  getCorrelationLabel,
  getCorrelationColor,
  ACTIVITY_FEEDBACK_OPTIONS,
} from '@/constants/emojiScoreMapping';

export interface HabitFeedback {
  habit_id: string;
  habit_name: string;
  date: string;
  emoji_id: string;
  score?: number;
  notes?: string;
}

export interface HabitCorrelationResult {
  habit_id: string;
  habit_name: string;
  correlation_with_mood: number;
  correlation_with_clarity: number;
  correlation_with_sleep_quality: number;
  correlation_with_sleep_duration: number;
  correlation_with_energy: number;
  sample_size: number;
  avg_mood_with_habit: number;
  avg_mood_without_habit: number;
  is_beneficial: boolean;
  impact_score: number;
  recommendation: string;
}

export interface HabitInsights {
  habits: HabitCorrelationResult[];
  insights: string[];
  topBeneficial: string[];
  areasToImprove: string[];
}

export class HabitCorrelationService {
  /**
   * Log habit feedback with emoji score
   */
  static async logHabitFeedback(
    userId: string,
    feedback: HabitFeedback
  ): Promise<{ data: any; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.create('habit_feedback', {
        ...feedback,
        user_id: userId,
        score: feedback.score || getScoreFromEmoji(feedback.emoji_id, 'activity'),
      });
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      // Calculate score from emoji
      const score = feedback.score || getScoreFromEmoji(feedback.emoji_id, 'activity');

      const { data, error } = await supabase
        .from('habit_feedback_log')
        .upsert({
          user_id: userId,
          habit_id: feedback.habit_id,
          habit_name: feedback.habit_name,
          date: feedback.date,
          emoji_id: feedback.emoji_id,
          score,
          notes: feedback.notes,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,habit_id,date',
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging habit feedback:', error);
        return { data: null, error };
      }

      // Trigger correlation recalculation
      this.recalculateHabitCorrelations(userId, feedback.habit_id, feedback.habit_name);

      return { data, error: null };
    } catch (error) {
      console.error('Error in logHabitFeedback:', error);
      return { data: null, error };
    }
  }

  /**
   * Get feedback history for a habit
   */
  static async getHabitFeedbackHistory(
    userId: string,
    habitId: string,
    days: number = 30
  ): Promise<{ data: any[]; error: any }> {
    if (await isGuestMode()) {
      return { data: [], error: null };
    }

    try {
      const { supabase } = await import('@/lib/supabase');
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('habit_feedback_log')
        .select('*')
        .eq('user_id', userId)
        .eq('habit_id', habitId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      console.error('Error getting habit feedback history:', error);
      return { data: [], error };
    }
  }

  /**
   * Calculate Pearson correlation
   */
  private static calculatePearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length < 3) {
      return 0;
    }

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    if (denominator === 0) return 0;

    return numerator / denominator;
  }

  /**
   * Recalculate correlations for a specific habit
   */
  static async recalculateHabitCorrelations(
    userId: string,
    habitId: string,
    habitName: string
  ): Promise<{ data: HabitCorrelationResult | null; error: any }> {
    if (await isGuestMode()) {
      return { data: null, error: null };
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      // Get daily wellness summaries
      const { data: summaries, error: summaryError } = await supabase
        .from('daily_wellness_summary')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (summaryError || !summaries || summaries.length < 5) {
        return { data: null, error: summaryError || 'Not enough data' };
      }

      // Get habit feedback for all dates
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('habit_feedback_log')
        .select('date, score')
        .eq('user_id', userId)
        .eq('habit_id', habitId);

      if (feedbackError) {
        return { data: null, error: feedbackError };
      }

      // Create a map of dates with feedback
      const feedbackMap = new Map<string, number>();
      (feedbackData || []).forEach(f => {
        feedbackMap.set(f.date, f.score);
      });

      // Prepare data arrays
      const habitFlags: number[] = [];
      const moodScores: number[] = [];
      const clarityScores: number[] = [];
      const sleepQualityScores: number[] = [];
      const sleepDurationScores: number[] = [];
      const energyScores: number[] = [];

      const withHabitMoods: number[] = [];
      const withoutHabitMoods: number[] = [];
      const withHabitClarity: number[] = [];
      const withoutHabitClarity: number[] = [];
      const withHabitSleep: number[] = [];
      const withoutHabitSleep: number[] = [];

      for (const summary of summaries) {
        const dateStr = summary.date;
        const hadHabit = feedbackMap.has(dateStr);
        const feedbackScore = feedbackMap.get(dateStr) || 0;

        if (summary.mood_score !== null) {
          habitFlags.push(hadHabit ? feedbackScore : 0);
          moodScores.push(summary.mood_score);

          if (hadHabit) {
            withHabitMoods.push(summary.mood_score);
          } else {
            withoutHabitMoods.push(summary.mood_score);
          }
        }

        if (summary.clarity_score !== null) {
          clarityScores.push(summary.clarity_score);
          if (hadHabit) {
            withHabitClarity.push(summary.clarity_score);
          } else {
            withoutHabitClarity.push(summary.clarity_score);
          }
        }

        if (summary.sleep_quality_score !== null) {
          sleepQualityScores.push(summary.sleep_quality_score);
          if (hadHabit) {
            withHabitSleep.push(summary.sleep_quality_score);
          } else {
            withoutHabitSleep.push(summary.sleep_quality_score);
          }
        }

        if (summary.sleep_duration_hours !== null) {
          sleepDurationScores.push(summary.sleep_duration_hours);
        }

        if (summary.energy_score !== null) {
          energyScores.push(summary.energy_score);
        }
      }

      // Calculate correlations
      const correlationWithMood = this.calculatePearsonCorrelation(habitFlags, moodScores);
      const correlationWithClarity = this.calculatePearsonCorrelation(habitFlags, clarityScores);
      const correlationWithSleepQuality = this.calculatePearsonCorrelation(habitFlags, sleepQualityScores);
      const correlationWithSleepDuration = this.calculatePearsonCorrelation(habitFlags, sleepDurationScores);
      const correlationWithEnergy = this.calculatePearsonCorrelation(habitFlags, energyScores);

      // Calculate averages
      const avgMoodWith = withHabitMoods.length > 0
        ? withHabitMoods.reduce((a, b) => a + b, 0) / withHabitMoods.length
        : 0;
      const avgMoodWithout = withoutHabitMoods.length > 0
        ? withoutHabitMoods.reduce((a, b) => a + b, 0) / withoutHabitMoods.length
        : 0;
      const avgClarityWith = withHabitClarity.length > 0
        ? withHabitClarity.reduce((a, b) => a + b, 0) / withHabitClarity.length
        : 0;
      const avgClarityWithout = withoutHabitClarity.length > 0
        ? withoutHabitClarity.reduce((a, b) => a + b, 0) / withoutHabitClarity.length
        : 0;
      const avgSleepWith = withHabitSleep.length > 0
        ? withHabitSleep.reduce((a, b) => a + b, 0) / withHabitSleep.length
        : 0;
      const avgSleepWithout = withoutHabitSleep.length > 0
        ? withoutHabitSleep.reduce((a, b) => a + b, 0) / withoutHabitSleep.length
        : 0;

      // Calculate avg completion score
      const totalCompletions = feedbackData?.length || 0;
      const avgCompletionScore = totalCompletions > 0
        ? (feedbackData || []).reduce((sum, f) => sum + f.score, 0) / totalCompletions
        : 3;

      // Determine if beneficial
      const avgCorrelation = (correlationWithMood + correlationWithClarity + correlationWithSleepQuality) / 3;
      const isBeneficial = avgCorrelation > 0.1;

      // Calculate impact score (1-5)
      const impactScore = 3 + (avgCorrelation * 2);
      const clampedImpact = Math.max(1, Math.min(5, impactScore));

      // Generate recommendation
      const recommendation = this.generateRecommendation(
        habitName,
        correlationWithMood,
        correlationWithClarity,
        correlationWithSleepQuality,
        avgMoodWith - avgMoodWithout
      );

      // Store results
      const result: HabitCorrelationResult = {
        habit_id: habitId,
        habit_name: habitName,
        correlation_with_mood: correlationWithMood,
        correlation_with_clarity: correlationWithClarity,
        correlation_with_sleep_quality: correlationWithSleepQuality,
        correlation_with_sleep_duration: correlationWithSleepDuration,
        correlation_with_energy: correlationWithEnergy,
        sample_size: habitFlags.length,
        avg_mood_with_habit: avgMoodWith,
        avg_mood_without_habit: avgMoodWithout,
        is_beneficial: isBeneficial,
        impact_score: clampedImpact,
        recommendation,
      };

      // Save to database
      const { error: upsertError } = await supabase
        .from('habit_correlation_summary')
        .upsert({
          user_id: userId,
          habit_id: habitId,
          habit_name: habitName,
          ...result,
          total_completions: totalCompletions,
          avg_completion_score: avgCompletionScore,
          avg_clarity_with_habit: avgClarityWith,
          avg_clarity_without_habit: avgClarityWithout,
          avg_sleep_with_habit: avgSleepWith,
          avg_sleep_without_habit: avgSleepWithout,
          last_calculated: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,habit_id',
        });

      if (upsertError) {
        console.error('Error saving habit correlation:', upsertError);
        return { data: null, error: upsertError };
      }

      return { data: result, error: null };
    } catch (error) {
      console.error('Error recalculating habit correlations:', error);
      return { data: null, error };
    }
  }

  /**
   * Get all habit correlations for a user
   */
  static async getAllHabitCorrelations(userId: string): Promise<{ data: HabitInsights | null; error: any }> {
    if (await isGuestMode()) {
      return { data: null, error: null };
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const { data: correlations, error } = await supabase
        .from('habit_correlation_summary')
        .select('*')
        .eq('user_id', userId)
        .order('impact_score', { ascending: false });

      if (error) {
        return { data: null, error };
      }

      // Generate insights
      const insights: string[] = [];
      const topBeneficial: string[] = [];
      const areasToImprove: string[] = [];

      for (const corr of correlations || []) {
        if (corr.is_beneficial && corr.sample_size >= 5) {
          topBeneficial.push(corr.habit_name);

          if (corr.correlation_with_mood > 0.3) {
            insights.push(`${corr.habit_name} has a strong positive effect on your mood`);
          }
          if (corr.correlation_with_sleep_quality > 0.3) {
            insights.push(`${corr.habit_name} improves your sleep quality`);
          }
        }

        if (corr.correlation_with_mood < -0.2 && corr.sample_size >= 5) {
          areasToImprove.push(corr.habit_name);
        }
      }

      return {
        data: {
          habits: correlations || [],
          insights,
          topBeneficial,
          areasToImprove,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error getting habit correlations:', error);
      return { data: null, error };
    }
  }

  /**
   * Get correlation for specific habit
   */
  static async getHabitCorrelation(
    userId: string,
    habitId: string
  ): Promise<{ data: HabitCorrelationResult | null; error: any }> {
    if (await isGuestMode()) {
      return { data: null, error: null };
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const { data, error } = await supabase
        .from('habit_correlation_summary')
        .select('*')
        .eq('user_id', userId)
        .eq('habit_id', habitId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error getting habit correlation:', error);
      return { data: null, error };
    }
  }

  /**
   * Generate habit recommendation
   */
  private static generateRecommendation(
    habitName: string,
    moodCorr: number,
    clarityCorr: number,
    sleepCorr: number,
    moodDiff: number
  ): string {
    const avgCorr = (moodCorr + clarityCorr + sleepCorr) / 3;

    if (avgCorr > 0.4) {
      return `${habitName} has a strong positive impact on your wellness. Keep up the great work!`;
    } else if (avgCorr > 0.2) {
      return `${habitName} shows moderate benefits. Try to be consistent with this habit.`;
    } else if (avgCorr > 0) {
      return `${habitName} has slight positive effects. Track more data for better insights.`;
    } else if (avgCorr > -0.2) {
      return `${habitName} shows neutral effects. Consider timing or frequency adjustments.`;
    } else {
      return `${habitName} may not be optimal. Consider modifying when or how you do it.`;
    }
  }

  /**
   * Get top beneficial habits
   */
  static async getTopBeneficialHabits(
    userId: string,
    limit: number = 5
  ): Promise<{ data: any[]; error: any }> {
    if (await isGuestMode()) {
      return { data: [], error: null };
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const { data, error } = await supabase
        .from('habit_correlation_summary')
        .select('*')
        .eq('user_id', userId)
        .eq('is_beneficial', true)
        .gte('sample_size', 3)
        .order('impact_score', { ascending: false })
        .limit(limit);

      return { data: data || [], error };
    } catch (error) {
      console.error('Error getting top beneficial habits:', error);
      return { data: [], error };
    }
  }

  /**
   * Get habit impact summary for dashboard
   */
  static async getHabitImpactSummary(userId: string): Promise<{ data: any; error: any }> {
    if (await isGuestMode()) {
      return { data: null, error: null };
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      // Get all correlations
      const { data: correlations } = await supabase
        .from('habit_correlation_summary')
        .select('*')
        .eq('user_id', userId)
        .gte('sample_size', 3)
        .order('impact_score', { ascending: false });

      // Get recent feedback stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentFeedback } = await supabase
        .from('habit_feedback_log')
        .select('habit_name, score')
        .eq('user_id', userId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      const summary = {
        totalCompletions: recentFeedback?.length || 0,
        avgFeelingScore: recentFeedback && recentFeedback.length > 0
          ? recentFeedback.reduce((sum, f) => sum + f.score, 0) / recentFeedback.length
          : 0,
        topHabits: correlations?.slice(0, 3).map(c => ({
          name: c.habit_name,
          impactScore: c.impact_score,
          moodImpact: c.correlation_with_mood,
          recommendation: c.recommendation,
        })) || [],
        correlations: correlations || [],
      };

      return { data: summary, error: null };
    } catch (error) {
      console.error('Error getting habit impact summary:', error);
      return { data: null, error };
    }
  }
}
