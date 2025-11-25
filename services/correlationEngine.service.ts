/**
 * Correlation Engine Service
 * Computes correlations between activities and wellness metrics
 */

import { SupabaseSafe } from '@/lib/supabaseSafe';
import { isGuestMode, guestDataStore } from '@/lib/guestDataStore';
import {
  getScoreFromEmoji,
  getCorrelationLabel,
  getCorrelationColor,
  ACTIVITY_EMOJI_SCORES
} from '@/constants/emojiScoreMapping';

export interface ActivityFeedback {
  activity_id?: string;
  activity_type: string;
  activity_name?: string;
  date: string;
  emoji_id: string;
  mood_score?: number;
  sleep_score?: number;
  clarity_score?: number;
  energy_score?: number;
  notes?: string;
}

export interface CorrelationResult {
  activity_type: string;
  correlation_with_mood: number;
  correlation_with_clarity: number;
  correlation_with_sleep_quality: number;
  correlation_with_sleep_duration: number;
  correlation_with_energy: number;
  correlation_with_next_day_mood: number;
  sample_size: number;
  avg_mood_with_activity: number;
  avg_mood_without_activity: number;
  is_beneficial: boolean;
  recommendation: string;
}

export interface WellnessCorrelations {
  activities: CorrelationResult[];
  insights: string[];
  topBeneficial: string[];
  areasToImprove: string[];
}

export class CorrelationEngineService {
  /**
   * Log activity feedback with emoji scores
   */
  static async logActivityFeedback(
    userId: string,
    feedback: ActivityFeedback
  ): Promise<{ data: any; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.create('activity_feedback', {
        ...feedback,
        user_id: userId,
      });
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      // Calculate scores from emoji
      const moodScore = feedback.mood_score || getScoreFromEmoji(feedback.emoji_id, 'mood');
      const energyScore = feedback.energy_score || getScoreFromEmoji(feedback.emoji_id, 'energy');

      const { data, error } = await supabase
        .from('activity_feedback_log')
        .upsert({
          user_id: userId,
          activity_id: feedback.activity_id,
          activity_type: feedback.activity_type,
          activity_name: feedback.activity_name,
          date: feedback.date,
          emoji_id: feedback.emoji_id,
          mood_score: moodScore,
          sleep_score: feedback.sleep_score,
          clarity_score: feedback.clarity_score,
          energy_score: energyScore,
          notes: feedback.notes,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,activity_id,date',
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging activity feedback:', error);
        return { data: null, error };
      }

      // Trigger correlation recalculation for this activity type
      this.recalculateCorrelations(userId, feedback.activity_type);

      return { data, error: null };
    } catch (error) {
      console.error('Error in logActivityFeedback:', error);
      return { data: null, error };
    }
  }

  /**
   * Get all feedback for a user
   */
  static async getFeedbackHistory(
    userId: string,
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
        .from('activity_feedback_log')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      return { data: data || [], error };
    } catch (error) {
      console.error('Error getting feedback history:', error);
      return { data: [], error };
    }
  }

  /**
   * Calculate Pearson correlation coefficient
   */
  static calculatePearsonCorrelation(x: number[], y: number[]): number {
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
   * Recalculate correlations for a specific activity type
   */
  static async recalculateCorrelations(
    userId: string,
    activityType: string
  ): Promise<{ data: CorrelationResult | null; error: any }> {
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

      // Prepare data arrays
      const activityFlags: number[] = [];
      const moodScores: number[] = [];
      const clarityScores: number[] = [];
      const sleepQualityScores: number[] = [];
      const sleepDurationScores: number[] = [];
      const energyScores: number[] = [];
      const nextDayMoods: number[] = [];

      const withActivityMoods: number[] = [];
      const withoutActivityMoods: number[] = [];
      const withActivityClarity: number[] = [];
      const withoutActivityClarity: number[] = [];
      const withActivitySleep: number[] = [];
      const withoutActivitySleep: number[] = [];

      for (let i = 0; i < summaries.length; i++) {
        const summary = summaries[i];
        const hadActivity = this.checkActivityType(summary, activityType);

        if (summary.mood_score !== null) {
          activityFlags.push(hadActivity ? 1 : 0);
          moodScores.push(summary.mood_score);

          if (hadActivity) {
            withActivityMoods.push(summary.mood_score);
          } else {
            withoutActivityMoods.push(summary.mood_score);
          }

          // Next day mood
          if (i < summaries.length - 1 && summaries[i + 1].mood_score !== null) {
            nextDayMoods.push(summaries[i + 1].mood_score);
          }
        }

        if (summary.clarity_score !== null) {
          clarityScores.push(summary.clarity_score);
          if (hadActivity) {
            withActivityClarity.push(summary.clarity_score);
          } else {
            withoutActivityClarity.push(summary.clarity_score);
          }
        }

        if (summary.sleep_quality_score !== null) {
          sleepQualityScores.push(summary.sleep_quality_score);
          if (hadActivity) {
            withActivitySleep.push(summary.sleep_quality_score);
          } else {
            withoutActivitySleep.push(summary.sleep_quality_score);
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
      const correlationWithMood = this.calculatePearsonCorrelation(activityFlags, moodScores);
      const correlationWithClarity = this.calculatePearsonCorrelation(activityFlags, clarityScores);
      const correlationWithSleepQuality = this.calculatePearsonCorrelation(activityFlags, sleepQualityScores);
      const correlationWithSleepDuration = this.calculatePearsonCorrelation(activityFlags, sleepDurationScores);
      const correlationWithEnergy = this.calculatePearsonCorrelation(activityFlags, energyScores);
      const correlationWithNextDayMood = this.calculatePearsonCorrelation(
        activityFlags.slice(0, nextDayMoods.length),
        nextDayMoods
      );

      // Calculate averages
      const avgMoodWith = withActivityMoods.length > 0
        ? withActivityMoods.reduce((a, b) => a + b, 0) / withActivityMoods.length
        : 0;
      const avgMoodWithout = withoutActivityMoods.length > 0
        ? withoutActivityMoods.reduce((a, b) => a + b, 0) / withoutActivityMoods.length
        : 0;
      const avgClarityWith = withActivityClarity.length > 0
        ? withActivityClarity.reduce((a, b) => a + b, 0) / withActivityClarity.length
        : 0;
      const avgClarityWithout = withoutActivityClarity.length > 0
        ? withoutActivityClarity.reduce((a, b) => a + b, 0) / withoutActivityClarity.length
        : 0;
      const avgSleepWith = withActivitySleep.length > 0
        ? withActivitySleep.reduce((a, b) => a + b, 0) / withActivitySleep.length
        : 0;
      const avgSleepWithout = withoutActivitySleep.length > 0
        ? withoutActivitySleep.reduce((a, b) => a + b, 0) / withoutActivitySleep.length
        : 0;

      // Determine if beneficial
      const isBeneficial = (correlationWithMood + correlationWithClarity + correlationWithSleepQuality) / 3 > 0.1;

      // Generate recommendation
      const recommendation = this.generateRecommendation(
        activityType,
        correlationWithMood,
        correlationWithClarity,
        correlationWithSleepQuality,
        avgMoodWith - avgMoodWithout
      );

      // Store results
      const result: CorrelationResult = {
        activity_type: activityType,
        correlation_with_mood: correlationWithMood,
        correlation_with_clarity: correlationWithClarity,
        correlation_with_sleep_quality: correlationWithSleepQuality,
        correlation_with_sleep_duration: correlationWithSleepDuration,
        correlation_with_energy: correlationWithEnergy,
        correlation_with_next_day_mood: correlationWithNextDayMood,
        sample_size: activityFlags.length,
        avg_mood_with_activity: avgMoodWith,
        avg_mood_without_activity: avgMoodWithout,
        is_beneficial: isBeneficial,
        recommendation,
      };

      // Save to database
      const { error: upsertError } = await supabase
        .from('activity_correlation_summary')
        .upsert({
          user_id: userId,
          activity_type: activityType,
          ...result,
          avg_clarity_with_activity: avgClarityWith,
          avg_clarity_without_activity: avgClarityWithout,
          avg_sleep_with_activity: avgSleepWith,
          avg_sleep_without_activity: avgSleepWithout,
          last_calculated: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,activity_type',
        });

      if (upsertError) {
        console.error('Error saving correlation:', upsertError);
        return { data: null, error: upsertError };
      }

      return { data: result, error: null };
    } catch (error) {
      console.error('Error recalculating correlations:', error);
      return { data: null, error };
    }
  }

  /**
   * Get all correlations for a user
   */
  static async getAllCorrelations(userId: string): Promise<{ data: WellnessCorrelations | null; error: any }> {
    if (await isGuestMode()) {
      return { data: null, error: null };
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const { data: correlations, error } = await supabase
        .from('activity_correlation_summary')
        .select('*')
        .eq('user_id', userId)
        .order('correlation_with_mood', { ascending: false });

      if (error) {
        return { data: null, error };
      }

      // Generate insights
      const insights: string[] = [];
      const topBeneficial: string[] = [];
      const areasToImprove: string[] = [];

      for (const corr of correlations || []) {
        if (corr.is_beneficial && corr.sample_size >= 5) {
          topBeneficial.push(corr.activity_type);

          if (corr.correlation_with_mood > 0.3) {
            insights.push(`${corr.activity_type} has a ${getCorrelationLabel(corr.correlation_with_mood).toLowerCase()} positive effect on your mood`);
          }
          if (corr.correlation_with_sleep_quality > 0.3) {
            insights.push(`${corr.activity_type} improves your sleep quality`);
          }
        }

        if (corr.correlation_with_mood < -0.2 && corr.sample_size >= 5) {
          areasToImprove.push(corr.activity_type);
        }
      }

      return {
        data: {
          activities: correlations || [],
          insights,
          topBeneficial,
          areasToImprove,
        },
        error: null,
      };
    } catch (error) {
      console.error('Error getting correlations:', error);
      return { data: null, error };
    }
  }

  /**
   * Get correlation for specific activity
   */
  static async getActivityCorrelation(
    userId: string,
    activityType: string
  ): Promise<{ data: CorrelationResult | null; error: any }> {
    if (await isGuestMode()) {
      return { data: null, error: null };
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const { data, error } = await supabase
        .from('activity_correlation_summary')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_type', activityType)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error getting activity correlation:', error);
      return { data: null, error };
    }
  }

  /**
   * Helper to check activity type from summary
   */
  private static checkActivityType(summary: any, activityType: string): boolean {
    switch (activityType.toLowerCase()) {
      case 'exercise':
        return summary.had_exercise;
      case 'meditation':
        return summary.had_meditation;
      case 'journaling':
        return summary.had_journaling;
      case 'social':
        return summary.had_social;
      case 'outdoor':
        return summary.had_outdoor;
      case 'creative':
        return summary.had_creative;
      default:
        return summary.activities_completed?.includes(activityType) || false;
    }
  }

  /**
   * Generate activity recommendation based on correlations
   */
  private static generateRecommendation(
    activityType: string,
    moodCorr: number,
    clarityCorr: number,
    sleepCorr: number,
    moodDiff: number
  ): string {
    const avgCorr = (moodCorr + clarityCorr + sleepCorr) / 3;

    if (avgCorr > 0.4) {
      return `${activityType} has a strong positive impact on your overall wellness. Keep it up!`;
    } else if (avgCorr > 0.2) {
      return `${activityType} shows moderate benefits. Consider doing it more regularly.`;
    } else if (avgCorr > 0) {
      return `${activityType} has slight positive effects. Track more data for better insights.`;
    } else if (avgCorr > -0.2) {
      return `${activityType} shows neutral effects on your wellness metrics.`;
    } else {
      return `${activityType} may negatively affect your wellness. Consider timing or frequency.`;
    }
  }

  /**
   * Calculate cross-activity correlations
   */
  static async calculateCrossActivityCorrelations(
    userId: string
  ): Promise<{ data: any[]; error: any }> {
    if (await isGuestMode()) {
      return { data: [], error: null };
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      const activityTypes = ['exercise', 'meditation', 'journaling', 'social', 'outdoor', 'creative'];
      const results = [];

      const { data: summaries } = await supabase
        .from('daily_wellness_summary')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true });

      if (!summaries || summaries.length < 5) {
        return { data: [], error: 'Not enough data' };
      }

      for (let i = 0; i < activityTypes.length; i++) {
        for (let j = i + 1; j < activityTypes.length; j++) {
          const typeA = activityTypes[i];
          const typeB = activityTypes[j];

          const flagsA = summaries.map(s => this.checkActivityType(s, typeA) ? 1 : 0);
          const flagsB = summaries.map(s => this.checkActivityType(s, typeB) ? 1 : 0);

          const correlation = this.calculatePearsonCorrelation(flagsA, flagsB);

          if (Math.abs(correlation) > 0.1) {
            results.push({
              activity_type_a: typeA,
              activity_type_b: typeB,
              correlation,
              sample_size: summaries.length,
            });

            // Save to database
            await supabase
              .from('cross_activity_correlations')
              .upsert({
                user_id: userId,
                activity_type_a: typeA,
                activity_type_b: typeB,
                correlation,
                sample_size: summaries.length,
                last_calculated: new Date().toISOString(),
              }, {
                onConflict: 'user_id,activity_type_a,activity_type_b',
              });
          }
        }
      }

      return { data: results, error: null };
    } catch (error) {
      console.error('Error calculating cross-activity correlations:', error);
      return { data: [], error };
    }
  }

  /**
   * Get activity impact summary for dashboard
   */
  static async getActivityImpactSummary(userId: string): Promise<{ data: any; error: any }> {
    if (await isGuestMode()) {
      return { data: null, error: null };
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      // Get correlations
      const { data: correlations } = await supabase
        .from('activity_correlation_summary')
        .select('*')
        .eq('user_id', userId)
        .gte('sample_size', 3)
        .order('correlation_with_mood', { ascending: false });

      // Get recent feedback stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: recentFeedback } = await supabase
        .from('activity_feedback_log')
        .select('activity_type, mood_score, energy_score')
        .eq('user_id', userId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      // Calculate summary
      const summary = {
        totalActivities: recentFeedback?.length || 0,
        avgMoodScore: recentFeedback?.reduce((sum, f) => sum + (f.mood_score || 0), 0) / (recentFeedback?.length || 1),
        avgEnergyScore: recentFeedback?.reduce((sum, f) => sum + (f.energy_score || 0), 0) / (recentFeedback?.length || 1),
        topActivities: correlations?.slice(0, 3).map(c => ({
          type: c.activity_type,
          moodImpact: c.correlation_with_mood,
          recommendation: c.recommendation,
        })) || [],
        correlations: correlations || [],
      };

      return { data: summary, error: null };
    } catch (error) {
      console.error('Error getting activity impact summary:', error);
      return { data: null, error };
    }
  }
}
