/**
 * Onboarding Service
 * Date: 2025-11-24
 * Purpose: Service for saving onboarding data and generating personalized programs
 */

import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingData {
  goals: string[];
  primaryGoal: string;
  answers: Record<string, string>;
}

export class OnboardingService {
  /**
   * Get stored onboarding data from AsyncStorage
   */
  static async getStoredOnboardingData(): Promise<OnboardingData | null> {
    try {
      const goalsJson = await AsyncStorage.getItem('onboarding_goals');
      const primaryGoal = await AsyncStorage.getItem('onboarding_primary_goal');
      const answersJson = await AsyncStorage.getItem('onboarding_answers');

      if (!goalsJson) return null;

      return {
        goals: JSON.parse(goalsJson),
        primaryGoal: primaryGoal || '',
        answers: answersJson ? JSON.parse(answersJson) : {},
      };
    } catch (error) {
      console.error('Error getting stored onboarding data:', error);
      return null;
    }
  }

  /**
   * Save user goals to database
   */
  static async saveUserGoals(userId: string, goals: string[], primaryGoal: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Insert goals
      for (const goalType of goals) {
        const { error } = await supabase
          .from('user_goals')
          .upsert({
            user_id: userId,
            goal_type: goalType,
            is_primary: goalType === primaryGoal,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,goal_type',
          });

        if (error) {
          console.error(`Error saving goal ${goalType}:`, error);
          return { success: false, error: error.message };
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error saving user goals:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Save onboarding answers (metadata)
   */
  static async saveOnboardingAnswers(
    userId: string,
    answers: Record<string, string>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      for (const [questionId, answer] of Object.entries(answers)) {
        // Determine goal type from question ID
        const goalType = questionId.split('_')[0];

        const { error } = await supabase
          .from('onboarding_metadata')
          .upsert({
            user_id: userId,
            question_id: questionId,
            answer: answer,
            goal_type: goalType,
          }, {
            onConflict: 'user_id,question_id',
          });

        if (error) {
          console.error(`Error saving answer for ${questionId}:`, error);
          return { success: false, error: error.message };
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error saving onboarding answers:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate personalized programs based on goals and answers
   */
  static async generatePersonalizedPrograms(
    userId: string,
    goals: string[],
    answers: Record<string, string>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Program mapping based on goals and answers
      const programMappings: Record<string, { category: string; keywords: string[] }> = {
        sleep: { category: 'Sleep', keywords: ['sleep', 'rest', 'wind-down'] },
        energy: { category: 'Energy', keywords: ['energy', 'vitality', 'boost'] },
        stress: { category: 'Wellness', keywords: ['stress', 'calm', 'relaxation'] },
        intimacy: { category: 'Intimacy', keywords: ['intimacy', 'connection', 'relationship'] },
        clarity: { category: 'Mental', keywords: ['focus', 'clarity', 'mental'] },
      };

      for (const goalType of goals) {
        const mapping = programMappings[goalType];
        if (!mapping) continue;

        // Find a suitable program based on the goal
        const { data: programs, error: queryError } = await supabase
          .from('programs')
          .select('id, title, category')
          .eq('category', mapping.category)
          .limit(1);

        if (queryError) {
          console.error(`Error finding program for ${goalType}:`, queryError);
          continue;
        }

        if (programs && programs.length > 0) {
          // Create user generated program entry
          const { error: insertError } = await supabase
            .from('user_generated_programs')
            .insert({
              user_id: userId,
              program_id: programs[0].id,
              goal_type: goalType,
              generated_from_onboarding: true,
              is_active: true,
            });

          if (insertError) {
            console.error(`Error creating generated program for ${goalType}:`, insertError);
          }
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Error generating personalized programs:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Complete onboarding process - save all data and generate programs
   */
  static async completeOnboarding(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get stored onboarding data
      const data = await this.getStoredOnboardingData();
      if (!data) {
        console.log('No onboarding data found, skipping...');
        return { success: true };
      }

      // Save goals
      const goalsResult = await this.saveUserGoals(userId, data.goals, data.primaryGoal);
      if (!goalsResult.success) {
        return goalsResult;
      }

      // Save answers
      const answersResult = await this.saveOnboardingAnswers(userId, data.answers);
      if (!answersResult.success) {
        return answersResult;
      }

      // Generate personalized programs
      const programsResult = await this.generatePersonalizedPrograms(userId, data.goals, data.answers);
      if (!programsResult.success) {
        return programsResult;
      }

      // Mark onboarding as completed in profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });

      if (profileError) {
        console.error('Error updating profile onboarding status:', profileError);
      }

      // Clean up AsyncStorage
      await AsyncStorage.multiRemove([
        'onboarding_goals',
        'onboarding_primary_goal',
        'onboarding_answers',
      ]);

      console.log('✅ Onboarding completed successfully');
      return { success: true };
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's goals from database
   */
  static async getUserGoals(userId: string): Promise<{
    data: { goal_type: string; is_primary: boolean }[] | null;
    error: any;
  }> {
    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('goal_type, is_primary')
        .eq('user_id', userId);

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get user's primary goal
   */
  static async getPrimaryGoal(userId: string): Promise<string | null> {
    const { data } = await this.getUserGoals(userId);
    if (data) {
      const primary = data.find(g => g.is_primary);
      return primary?.goal_type || data[0]?.goal_type || null;
    }
    return null;
  }
}
