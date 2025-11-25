import { supabase } from '@/lib/supabase';
import { HabitImpactData } from '@/components/HabitImpactFeedbackModal';

export interface HabitImpactFeedback {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  overall_feeling: 'good' | 'neutral' | 'bad';
  mood_impact?: number;
  sleep_impact?: number;
  anxiety_impact?: number;
  productivity_impact?: number;
  energy_impact?: number;
  difficulty_level?: number;
  enjoyment_level?: number;
  time_taken?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface HabitCorrelation {
  id: string;
  habit_id: string;
  user_id: string;
  mood_correlation?: number;
  sleep_correlation?: number;
  anxiety_correlation?: number;
  productivity_correlation?: number;
  energy_correlation?: number;
  total_completions: number;
  avg_mood_impact?: number;
  avg_sleep_impact?: number;
  avg_anxiety_impact?: number;
  avg_productivity_impact?: number;
  avg_energy_impact?: number;
  avg_difficulty?: number;
  avg_enjoyment?: number;
  confidence_score?: number;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

export interface HabitWithImpact {
  id: string;
  name: string;
  category: string;
  emoji?: string;
  streak: number;
  total_completions: number;
  avg_mood_impact?: number;
  avg_sleep_impact?: number;
  avg_anxiety_impact?: number;
  avg_productivity_impact?: number;
  avg_energy_impact?: number;
  avg_difficulty?: number;
  avg_enjoyment?: number;
  confidence_score?: number;
}

export const HabitImpactService = {
  /**
   * Save or update habit impact feedback for a specific day
   */
  async saveFeedback(
    habitId: string,
    userId: string,
    data: HabitImpactData,
    date?: string
  ): Promise<{ data?: HabitImpactFeedback; error?: any }> {
    try {
      const feedbackDate = date || new Date().toISOString().split('T')[0];

      const feedbackData = {
        habit_id: habitId,
        user_id: userId,
        date: feedbackDate,
        overall_feeling: data.overallFeeling,
        mood_impact: data.moodImpact,
        sleep_impact: data.sleepImpact,
        anxiety_impact: data.anxietyImpact,
        productivity_impact: data.productivityImpact,
        energy_impact: data.energyImpact,
        difficulty_level: data.difficultyLevel,
        enjoyment_level: data.enjoymentLevel,
        time_taken: data.timeTaken,
        notes: data.notes,
        updated_at: new Date().toISOString(),
      };

      const { data: result, error } = await supabase
        .from('habit_impact_feedback')
        .upsert(feedbackData, {
          onConflict: 'habit_id,user_id,date',
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving habit impact feedback:', error);
        return { error };
      }

      return { data: result };
    } catch (error) {
      console.error('Exception saving habit impact feedback:', error);
      return { error };
    }
  },

  /**
   * Get feedback for a specific habit and date
   */
  async getFeedbackByDate(
    habitId: string,
    userId: string,
    date: string
  ): Promise<{ data?: HabitImpactFeedback; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('habit_impact_feedback')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found", which is ok
        console.error('Error fetching habit feedback:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Exception fetching habit feedback:', error);
      return { error };
    }
  },

  /**
   * Get all feedback for a specific habit
   */
  async getAllFeedbackForHabit(
    habitId: string,
    userId: string,
    limit?: number
  ): Promise<{ data?: HabitImpactFeedback[]; error?: any }> {
    try {
      let query = supabase
        .from('habit_impact_feedback')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching habit feedback history:', error);
        return { error };
      }

      return { data: data || [] };
    } catch (error) {
      console.error('Exception fetching habit feedback history:', error);
      return { error };
    }
  },

  /**
   * Get correlation data for a specific habit
   */
  async getHabitCorrelation(
    habitId: string,
    userId: string
  ): Promise<{ data?: HabitCorrelation; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('habit_correlations')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching habit correlation:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Exception fetching habit correlation:', error);
      return { error };
    }
  },

  /**
   * Get all habits with their impact correlations
   */
  async getAllHabitsWithImpact(
    userId: string
  ): Promise<{ data?: HabitWithImpact[]; error?: any }> {
    try {
      // Join habits with their correlation data
      const { data, error } = await supabase
        .from('habits')
        .select(
          `
          id,
          name,
          category,
          emoji,
          streak,
          habit_correlations (
            total_completions,
            avg_mood_impact,
            avg_sleep_impact,
            avg_anxiety_impact,
            avg_productivity_impact,
            avg_energy_impact,
            avg_difficulty,
            avg_enjoyment,
            confidence_score
          )
        `
        )
        .eq('user_id', userId)
        .order('streak', { ascending: false });

      if (error) {
        console.error('Error fetching habits with impact:', error);
        return { error };
      }

      // Transform the data
      const transformedData: HabitWithImpact[] = (data || []).map((habit: any) => ({
        id: habit.id,
        name: habit.name,
        category: habit.category,
        emoji: habit.emoji,
        streak: habit.streak,
        total_completions: habit.habit_correlations?.[0]?.total_completions || 0,
        avg_mood_impact: habit.habit_correlations?.[0]?.avg_mood_impact,
        avg_sleep_impact: habit.habit_correlations?.[0]?.avg_sleep_impact,
        avg_anxiety_impact: habit.habit_correlations?.[0]?.avg_anxiety_impact,
        avg_productivity_impact: habit.habit_correlations?.[0]?.avg_productivity_impact,
        avg_energy_impact: habit.habit_correlations?.[0]?.avg_energy_impact,
        avg_difficulty: habit.habit_correlations?.[0]?.avg_difficulty,
        avg_enjoyment: habit.habit_correlations?.[0]?.avg_enjoyment,
        confidence_score: habit.habit_correlations?.[0]?.confidence_score,
      }));

      return { data: transformedData };
    } catch (error) {
      console.error('Exception fetching habits with impact:', error);
      return { error };
    }
  },

  /**
   * Get top impact habits by category
   */
  async getTopImpactHabits(
    userId: string,
    impactType: 'mood' | 'sleep' | 'anxiety' | 'productivity' | 'energy',
    limit: number = 5
  ): Promise<{ data?: HabitWithImpact[]; error?: any }> {
    try {
      const impactColumn = `avg_${impactType}_impact`;

      const { data, error } = await supabase
        .from('habits')
        .select(
          `
          id,
          name,
          category,
          emoji,
          streak,
          habit_correlations (
            total_completions,
            avg_mood_impact,
            avg_sleep_impact,
            avg_anxiety_impact,
            avg_productivity_impact,
            avg_energy_impact,
            avg_difficulty,
            avg_enjoyment,
            confidence_score
          )
        `
        )
        .eq('user_id', userId)
        .not('habit_correlations', 'is', null)
        .order(`habit_correlations.${impactColumn}`, { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching top impact habits:', error);
        return { error };
      }

      // Transform and filter
      const transformedData: HabitWithImpact[] = (data || [])
        .map((habit: any) => ({
          id: habit.id,
          name: habit.name,
          category: habit.category,
          emoji: habit.emoji,
          streak: habit.streak,
          total_completions: habit.habit_correlations?.[0]?.total_completions || 0,
          avg_mood_impact: habit.habit_correlations?.[0]?.avg_mood_impact,
          avg_sleep_impact: habit.habit_correlations?.[0]?.avg_sleep_impact,
          avg_anxiety_impact: habit.habit_correlations?.[0]?.avg_anxiety_impact,
          avg_productivity_impact: habit.habit_correlations?.[0]?.avg_productivity_impact,
          avg_energy_impact: habit.habit_correlations?.[0]?.avg_energy_impact,
          avg_difficulty: habit.habit_correlations?.[0]?.avg_difficulty,
          avg_enjoyment: habit.habit_correlations?.[0]?.avg_enjoyment,
          confidence_score: habit.habit_correlations?.[0]?.confidence_score,
        }))
        .filter((habit) => habit.total_completions >= 3); // Minimum 3 completions for reliability

      return { data: transformedData };
    } catch (error) {
      console.error('Exception fetching top impact habits:', error);
      return { error };
    }
  },

  /**
   * Get feedback summary statistics for a habit
   */
  async getFeedbackSummary(
    habitId: string,
    userId: string
  ): Promise<{
    data?: {
      totalFeedback: number;
      goodCount: number;
      neutralCount: number;
      badCount: number;
      avgMoodImpact: number;
      avgSleepImpact: number;
      avgAnxietyImpact: number;
      avgProductivityImpact: number;
      avgEnergyImpact: number;
      avgDifficulty: number;
      avgEnjoyment: number;
    };
    error?: any;
  }> {
    try {
      const { data: feedbacks, error } = await supabase
        .from('habit_impact_feedback')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching feedback summary:', error);
        return { error };
      }

      const summary = {
        totalFeedback: feedbacks?.length || 0,
        goodCount: feedbacks?.filter((f) => f.overall_feeling === 'good').length || 0,
        neutralCount: feedbacks?.filter((f) => f.overall_feeling === 'neutral').length || 0,
        badCount: feedbacks?.filter((f) => f.overall_feeling === 'bad').length || 0,
        avgMoodImpact:
          feedbacks?.reduce((sum, f) => sum + (f.mood_impact || 0), 0) /
            (feedbacks?.length || 1) || 0,
        avgSleepImpact:
          feedbacks?.reduce((sum, f) => sum + (f.sleep_impact || 0), 0) /
            (feedbacks?.length || 1) || 0,
        avgAnxietyImpact:
          feedbacks?.reduce((sum, f) => sum + (f.anxiety_impact || 0), 0) /
            (feedbacks?.length || 1) || 0,
        avgProductivityImpact:
          feedbacks?.reduce((sum, f) => sum + (f.productivity_impact || 0), 0) /
            (feedbacks?.length || 1) || 0,
        avgEnergyImpact:
          feedbacks?.reduce((sum, f) => sum + (f.energy_impact || 0), 0) /
            (feedbacks?.length || 1) || 0,
        avgDifficulty:
          feedbacks?.reduce((sum, f) => sum + (f.difficulty_level || 0), 0) /
            (feedbacks?.length || 1) || 0,
        avgEnjoyment:
          feedbacks?.reduce((sum, f) => sum + (f.enjoyment_level || 0), 0) /
            (feedbacks?.length || 1) || 0,
      };

      return { data: summary };
    } catch (error) {
      console.error('Exception calculating feedback summary:', error);
      return { error };
    }
  },

  /**
   * Delete feedback for a specific date
   */
  async deleteFeedback(
    habitId: string,
    userId: string,
    date: string
  ): Promise<{ error?: any }> {
    try {
      const { error } = await supabase
        .from('habit_impact_feedback')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .eq('date', date);

      if (error) {
        console.error('Error deleting habit feedback:', error);
        return { error };
      }

      return {};
    } catch (error) {
      console.error('Exception deleting habit feedback:', error);
      return { error };
    }
  },
};
