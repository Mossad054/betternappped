import { SupabaseSafe } from '@/lib/supabaseSafe';
import { ProgramRecommendationService } from './programRecommendation.service';

/**
 * Enhanced program service for fetching programs, lessons, and habits
 * with recommendation engine integration
 */
export class ProgramEnhancedService {
  /**
   * Get habits linked to a specific lesson
   */
  static async getLessonHabits(lessonId: string): Promise<any[]> {
    try {
      const junctionResult = await SupabaseSafe.select('lesson_habits', {
        eq: { lesson_id: lessonId },
        order: { column: 'order_index', ascending: true },
      }, 'public');

      if (!junctionResult.data || junctionResult.data.length === 0) {
        return [];
      }

      const habitIds = junctionResult.data.map((lh: any) => lh.habit_id);
      const habitsResult = await SupabaseSafe.select('habits', {}, 'public');

      if (!habitsResult.data) return [];

      const habitMap = new Map(habitsResult.data.map((h: any) => [h.id, h]));
      return junctionResult.data
        .map((lh: any) => habitMap.get(lh.habit_id))
        .filter(Boolean);
    } catch (error) {
      console.error('Error fetching lesson habits:', error);
      return [];
    }
  }

  /**
   * Get all habits for a program
   */
  static async getProgramHabits(programId: string): Promise<any[]> {
    try {
      const result = await SupabaseSafe.select('habits', {
        eq: { program_id: programId, is_from_program: true },
      }, 'public');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching program habits:', error);
      return [];
    }
  }

  /**
   * Add habit from program to user's library
   */
  static async addHabitToLibrary(userId: string, habitId: string): Promise<boolean> {
    try {
      const existing = await SupabaseSafe.select('user_habits', {
        eq: { user_id: userId, habit_id: habitId },
      }, userId);

      if (existing.data && existing.data.length > 0) return true;

      const result = await SupabaseSafe.insert('user_habits', {
        user_id: userId,
        habit_id: habitId,
        status: 'active',
      }, userId);

      return !result.error;
    } catch (error) {
      console.error('Error adding habit to library:', error);
      return false;
    }
  }

  /**
   * Get recommended programs with full program details
   */
  static async getRecommendedPrograms(userId: string): Promise<any[]> {
    try {
      // Analyze and generate new recommendations
      await ProgramRecommendationService.analyzeAndRecommend(userId);

      // Get recommendations with program details
      return await ProgramRecommendationService.getRecommendations(userId);
    } catch (error) {
      console.error('Error getting recommended programs:', error);
      return [];
    }
  }

  /**
   * Dismiss a program recommendation
   */
  static async dismissRecommendation(userId: string, recommendationId: string): Promise<boolean> {
    return ProgramRecommendationService.dismissRecommendation(userId, recommendationId);
  }

  /**
   * Get program with lessons and habits
   */
  static async getProgramComplete(programId: string): Promise<{
    program: any;
    lessons: any[];
    habits: any[];
  }> {
    try {
      const [programResult, lessonsResult, habitsResult] = await Promise.all([
        SupabaseSafe.select('programs', { eq: { id: programId } }, 'public'),
        SupabaseSafe.select('lessons', {
          eq: { program_id: programId },
          order: { column: 'order_index', ascending: true },
        }, 'public'),
        this.getProgramHabits(programId),
      ]);

      return {
        program: programResult.data?.[0] || null,
        lessons: lessonsResult.data || [],
        habits: habitsResult,
      };
    } catch (error) {
      console.error('Error fetching complete program:', error);
      return { program: null, lessons: [], habits: [] };
    }
  }

  /**
   * Get lesson with its habits
   */
  static async getLessonComplete(lessonId: string): Promise<{
    lesson: any;
    habits: any[];
  }> {
    try {
      const [lessonResult, habits] = await Promise.all([
        SupabaseSafe.select('lessons', { eq: { id: lessonId } }, 'public'),
        this.getLessonHabits(lessonId),
      ]);

      return {
        lesson: lessonResult.data?.[0] || null,
        habits,
      };
    } catch (error) {
      console.error('Error fetching complete lesson:', error);
      return { lesson: null, habits: [] };
    }
  }

  /**
   * Search programs by keyword
   */
  static async searchPrograms(keyword: string): Promise<any[]> {
    try {
      const result = await SupabaseSafe.select('programs', {}, 'public');
      if (!result.data) return [];

      const lowerKeyword = keyword.toLowerCase();
      return result.data.filter((p: any) =>
        p.title.toLowerCase().includes(lowerKeyword) ||
        p.description.toLowerCase().includes(lowerKeyword) ||
        p.tags?.some((t: string) => t.toLowerCase().includes(lowerKeyword))
      );
    } catch (error) {
      console.error('Error searching programs:', error);
      return [];
    }
  }

  /**
   * Get programs filtered by difficulty
   */
  static async getProgramsByDifficulty(difficulty: string): Promise<any[]> {
    try {
      const result = await SupabaseSafe.select('programs', {
        eq: { difficulty },
      }, 'public');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching programs by difficulty:', error);
      return [];
    }
  }

  /**
   * Get solo-specific programs
   */
  static async getSoloPrograms(): Promise<any[]> {
    try {
      const result = await SupabaseSafe.select('programs', {}, 'public');
      if (!result.data) return [];

      return result.data.filter((p: any) =>
        p.tags?.includes('solo') && !p.tags?.includes('couples')
      );
    } catch (error) {
      console.error('Error fetching solo programs:', error);
      return [];
    }
  }

  /**
   * Get couples-specific programs
   */
  static async getCouplesPrograms(): Promise<any[]> {
    try {
      const result = await SupabaseSafe.select('programs', {}, 'public');
      if (!result.data) return [];

      return result.data.filter((p: any) => p.tags?.includes('couples'));
    } catch (error) {
      console.error('Error fetching couples programs:', error);
      return [];
    }
  }
}

export default ProgramEnhancedService;
