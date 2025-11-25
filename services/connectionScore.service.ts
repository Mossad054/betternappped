import { supabase } from '@/lib/supabase';

export interface IntimacyMetrics {
  id?: string;
  user_id: string;
  date: string;
  intimacy_frequency: number;
  activity_types: string[];
  quality_rating?: number;
  satisfaction_rating?: number;
  emotional_connection?: number;
  time_spent?: number;
  notes?: string;
  mood_before?: string;
  mood_after?: string;
  timestamp?: string;
}

export interface ConnectionScore {
  id?: string;
  user_id: string;
  date: string;
  frequency_score: number;
  quality_score: number;
  emotional_score: number;
  consistency_score: number;
  variety_score: number;
  total_score: number;
  current_streak: number;
  longest_streak: number;
  calculation_metadata?: any;
  timestamp?: string;
}

export interface ScoreBreakdown {
  total: number;
  components: {
    frequency: { score: number; weight: number; description: string };
    quality: { score: number; weight: number; description: string };
    emotional: { score: number; weight: number; description: string };
    consistency: { score: number; weight: number; description: string };
    variety: { score: number; weight: number; description: string };
  };
  streak: {
    current: number;
    longest: number;
  };
  insights: string[];
}

export class ConnectionScoreService {
  // Calculate connection score for a specific date
  static async calculateDailyScore(
    userId: string,
    date: string
  ): Promise<{ data: ConnectionScore | null; error: any }> {
    try {
      // Get last 30 days of metrics for trend analysis
      const startDate = new Date(date);
      startDate.setDate(startDate.getDate() - 30);

      const { data: metrics, error: metricsError } = await supabase
        .from('intimacy_metrics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', date)
        .order('date', { ascending: false });

      if (metricsError) throw metricsError;

      if (!metrics || metrics.length === 0) {
        return { data: null, error: 'No metrics found' };
      }

      const todayMetrics = metrics.find((m) => m.date === date);

      // Calculate frequency score (30%)
      const frequencyScore = this.calculateFrequencyScore(metrics);

      // Calculate quality score (25%)
      const qualityScore = this.calculateQualityScore(todayMetrics);

      // Calculate emotional score (20%)
      const emotionalScore = this.calculateEmotionalScore(todayMetrics);

      // Calculate consistency score (15%)
      const consistencyScore = this.calculateConsistencyScore(metrics);

      // Calculate variety score (10%)
      const varietyScore = this.calculateVarietyScore(metrics);

      // Calculate total weighted score
      const totalScore = Math.round(
        frequencyScore * 0.3 +
          qualityScore * 0.25 +
          emotionalScore * 0.2 +
          consistencyScore * 0.15 +
          varietyScore * 0.1
      );

      // Calculate streak
      const { currentStreak, longestStreak } = this.calculateStreak(metrics);

      const score: Omit<ConnectionScore, 'id'> = {
        user_id: userId,
        date,
        frequency_score: frequencyScore,
        quality_score: qualityScore,
        emotional_score: emotionalScore,
        consistency_score: consistencyScore,
        variety_score: varietyScore,
        total_score: totalScore,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        calculation_metadata: {
          metrics_analyzed: metrics.length,
          has_today_data: !!todayMetrics,
        },
        timestamp: new Date().toISOString(),
      };

      // Upsert score
      const { data: scoreData, error: scoreError } = await supabase
        .from('connection_score')
        .upsert(score, {
          onConflict: 'user_id,date',
        })
        .select()
        .single();

      if (scoreError) throw scoreError;

      return { data: scoreData, error: null };
    } catch (error) {
      console.error('Error calculating connection score:', error);
      return { data: null, error };
    }
  }

  // Calculate frequency score based on activity count
  private static calculateFrequencyScore(metrics: any[]): number {
    if (!metrics || metrics.length === 0) return 0;

    // Calculate average weekly frequency
    const totalFrequency = metrics.reduce(
      (sum, m) => sum + (m.intimacy_frequency || 0),
      0
    );
    const avgWeeklyFrequency = (totalFrequency / metrics.length) * 7;

    // Score based on frequency (optimal is 2-3 times per week)
    if (avgWeeklyFrequency >= 2 && avgWeeklyFrequency <= 4) return 100;
    if (avgWeeklyFrequency >= 1 && avgWeeklyFrequency < 2) return 70;
    if (avgWeeklyFrequency > 4 && avgWeeklyFrequency <= 7) return 85;
    if (avgWeeklyFrequency > 0 && avgWeeklyFrequency < 1) return 40;
    if (avgWeeklyFrequency > 7) return 60;
    return 0;
  }

  // Calculate quality score from ratings
  private static calculateQualityScore(todayMetrics: any): number {
    if (!todayMetrics) return 50; // neutral if no data

    const quality = todayMetrics.quality_rating || 5;
    const satisfaction = todayMetrics.satisfaction_rating || 5;

    // Average of quality and satisfaction, normalized to 100
    return Math.round(((quality + satisfaction) / 20) * 100);
  }

  // Calculate emotional connection score
  private static calculateEmotionalScore(todayMetrics: any): number {
    if (!todayMetrics) return 50; // neutral if no data

    const emotional = todayMetrics.emotional_connection || 5;

    // Normalize to 100
    return Math.round((emotional / 10) * 100);
  }

  // Calculate consistency score based on regular activity
  private static calculateConsistencyScore(metrics: any[]): number {
    if (!metrics || metrics.length < 7) return 50; // need at least a week

    // Count days with activity in last 30 days
    const activeDays = metrics.filter((m) => m.intimacy_frequency > 0).length;
    const totalDays = Math.min(metrics.length, 30);

    // Calculate percentage of active days
    const activePercentage = (activeDays / totalDays) * 100;

    // Score based on consistency (aim for 20-40% of days)
    if (activePercentage >= 20 && activePercentage <= 40) return 100;
    if (activePercentage >= 10 && activePercentage < 20) return 70;
    if (activePercentage > 40 && activePercentage <= 60) return 85;
    if (activePercentage > 60) return 60;
    return Math.round(activePercentage * 1.5);
  }

  // Calculate variety score based on different activity types
  private static calculateVarietyScore(metrics: any[]): number {
    if (!metrics || metrics.length === 0) return 0;

    // Collect all unique activity types
    const allTypes = new Set<string>();
    metrics.forEach((m) => {
      if (m.activity_types && Array.isArray(m.activity_types)) {
        m.activity_types.forEach((type: string) => allTypes.add(type));
      }
    });

    const varietyCount = allTypes.size;

    // Score based on variety (1-2: low, 3-4: good, 5+: excellent)
    if (varietyCount >= 5) return 100;
    if (varietyCount >= 3) return 75;
    if (varietyCount >= 2) return 50;
    if (varietyCount >= 1) return 25;
    return 0;
  }

  // Calculate streak
  private static calculateStreak(metrics: any[]): {
    currentStreak: number;
    longestStreak: number;
  } {
    if (!metrics || metrics.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Sort by date ascending
    const sorted = [...metrics].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].intimacy_frequency > 0) {
        tempStreak++;
        if (i === sorted.length - 1) {
          currentStreak = tempStreak;
        }
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 0;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak);

    return { currentStreak, longestStreak };
  }

  // Get score history
  static async getScoreHistory(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ data: ConnectionScore[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('connection_score')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching score history:', error);
      return { data: null, error };
    }
  }

  // Get latest score
  static async getLatestScore(
    userId: string
  ): Promise<{ data: ConnectionScore | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('connection_score')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows

      return { data: data || null, error: null };
    } catch (error) {
      console.error('Error fetching latest score:', error);
      return { data: null, error };
    }
  }

  // Get score breakdown with insights
  static async getScoreBreakdown(
    userId: string,
    date: string
  ): Promise<{ data: ScoreBreakdown | null; error: any }> {
    try {
      const { data: score, error } = await supabase
        .from('connection_score')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error) throw error;

      const insights = this.generateInsights(score);

      const breakdown: ScoreBreakdown = {
        total: score.total_score,
        components: {
          frequency: {
            score: score.frequency_score,
            weight: 30,
            description: 'How often you connect',
          },
          quality: {
            score: score.quality_score,
            weight: 25,
            description: 'Satisfaction and quality of experiences',
          },
          emotional: {
            score: score.emotional_score,
            weight: 20,
            description: 'Emotional connection depth',
          },
          consistency: {
            score: score.consistency_score,
            weight: 15,
            description: 'Regularity of connection',
          },
          variety: {
            score: score.variety_score,
            weight: 10,
            description: 'Diversity of intimate experiences',
          },
        },
        streak: {
          current: score.current_streak,
          longest: score.longest_streak,
        },
        insights,
      };

      return { data: breakdown, error: null };
    } catch (error) {
      console.error('Error fetching score breakdown:', error);
      return { data: null, error };
    }
  }

  // Generate insights based on scores
  private static generateInsights(score: ConnectionScore): string[] {
    const insights: string[] = [];

    // Total score insights
    if (score.total_score >= 80) {
      insights.push('🌟 Excellent connection! You\'re maintaining a strong intimate bond.');
    } else if (score.total_score >= 60) {
      insights.push('✨ Good connection! There\'s room for even deeper intimacy.');
    } else if (score.total_score >= 40) {
      insights.push('💫 Moderate connection. Consider focusing on quality time together.');
    } else {
      insights.push('💭 Your connection needs attention. Let\'s work on rebuilding intimacy.');
    }

    // Component-specific insights
    if (score.frequency_score < 50) {
      insights.push('Try scheduling regular quality time to increase connection frequency.');
    }

    if (score.quality_score < 60) {
      insights.push('Focus on presence and mindfulness during intimate moments.');
    }

    if (score.emotional_score < 60) {
      insights.push('Deepen emotional intimacy through vulnerable conversations and sharing.');
    }

    if (score.consistency_score < 50) {
      insights.push('Build a consistent rhythm for connection - it helps strengthen your bond.');
    }

    if (score.variety_score < 50) {
      insights.push('Explore new ways to connect and keep the spark alive with variety.');
    }

    // Streak insights
    if (score.current_streak >= 7) {
      insights.push(`🔥 Amazing ${score.current_streak}-day streak! Consistency is key.`);
    }

    return insights;
  }

  // Save intimacy metrics
  static async saveMetrics(
    metrics: Omit<IntimacyMetrics, 'id'>
  ): Promise<{ data: IntimacyMetrics | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('intimacy_metrics')
        .upsert(
          {
            ...metrics,
            timestamp: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,date',
          }
        )
        .select()
        .single();

      if (error) throw error;

      // Recalculate score after saving metrics
      await this.calculateDailyScore(metrics.user_id, metrics.date);

      return { data, error: null };
    } catch (error) {
      console.error('Error saving intimacy metrics:', error);
      return { data: null, error };
    }
  }

  // Get metrics for date range
  static async getMetrics(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ data: IntimacyMetrics[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('intimacy_metrics')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching intimacy metrics:', error);
      return { data: null, error };
    }
  }
}
