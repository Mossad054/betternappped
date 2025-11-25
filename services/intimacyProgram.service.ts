import { supabase } from '@/lib/supabase';

export interface IntimacyProgram {
  id?: string;
  title: string;
  description: string;
  category: 'communication' | 'emotional' | 'physical' | 'conflict' | 'self-awareness' | 'relationship-skills';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  total_lessons: number;
  learning_outcomes: string[];
  prerequisites: string[];
  icon?: string;
  color?: string;
  cover_image?: string;
  is_active: boolean;
  featured: boolean;
  order_index?: number;
  created_at?: string;
}

export interface ProgramLesson {
  id?: string;
  program_id: string;
  title: string;
  order_index: number;
  lesson_type: 'reading' | 'reflection' | 'exercise' | 'quiz' | 'action';
  content: string;
  duration_minutes: number;
  key_takeaways: string[];
  reflection_prompts: any[];
  action_items: any[];
  quiz_questions: any[];
  resources: any[];
  is_locked: boolean;
  unlock_after_lesson?: string;
  created_at?: string;
}

export interface UserProgramProgress {
  id?: string;
  user_id: string;
  program_id: string;
  enrolled_at: string;
  started_at?: string;
  completed_at?: string;
  current_lesson_id?: string;
  lessons_completed: number;
  progress_percentage: number;
  last_accessed?: string;
  total_time_minutes: number;
  status: 'enrolled' | 'in_progress' | 'completed' | 'paused';
  notes?: string;
}

export interface LessonReflection {
  id?: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at?: string;
  reflection_responses: any;
  notes?: string;
  insights?: string;
  action_items_completed: string[];
  habits_created: string[];
  quiz_score?: number;
  quiz_answers?: any;
  time_spent_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export class IntimacyProgramService {
  // Get all active programs
  static async getPrograms(
    category?: string,
    difficulty?: string
  ): Promise<{ data: IntimacyProgram[] | null; error: any }> {
    try {
      let query = supabase
        .from('intimacy_programs')
        .select('*')
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category);
      }

      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      const { data, error } = await query.order('featured', { ascending: false }).order('order_index');

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching programs:', error);
      return { data: null, error };
    }
  }

  // Get program by ID with lessons
  static async getProgramWithLessons(
    programId: string
  ): Promise<{ data: { program: IntimacyProgram; lessons: ProgramLesson[] } | null; error: any }> {
    try {
      const { data: program, error: programError } = await supabase
        .from('intimacy_programs')
        .select('*')
        .eq('id', programId)
        .single();

      if (programError) throw programError;

      const { data: lessons, error: lessonsError } = await supabase
        .from('program_lessons')
        .select('*')
        .eq('program_id', programId)
        .order('order_index');

      if (lessonsError) throw lessonsError;

      return { data: { program, lessons }, error: null };
    } catch (error) {
      console.error('Error fetching program with lessons:', error);
      return { data: null, error };
    }
  }

  // Enroll in a program
  static async enrollInProgram(
    userId: string,
    programId: string
  ): Promise<{ data: UserProgramProgress | null; error: any }> {
    try {
      const enrollment: Omit<UserProgramProgress, 'id'> = {
        user_id: userId,
        program_id: programId,
        enrolled_at: new Date().toISOString(),
        lessons_completed: 0,
        progress_percentage: 0,
        total_time_minutes: 0,
        status: 'enrolled',
      };

      const { data, error } = await supabase
        .from('user_program_progress')
        .upsert(enrollment, {
          onConflict: 'user_id,program_id',
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error enrolling in program:', error);
      return { data: null, error };
    }
  }

  // Get user's program progress
  static async getUserProgramProgress(
    userId: string,
    programId?: string
  ): Promise<{ data: UserProgramProgress[] | null; error: any }> {
    try {
      let query = supabase
        .from('user_program_progress')
        .select('*, intimacy_programs(*)')
        .eq('user_id', userId);

      if (programId) {
        query = query.eq('program_id', programId);
      }

      const { data, error } = await query.order('last_accessed', { ascending: false, nullsFirst: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user program progress:', error);
      return { data: null, error };
    }
  }

  // Start a lesson
  static async startLesson(
    userId: string,
    programId: string,
    lessonId: string
  ): Promise<{ error: any }> {
    try {
      // Update program progress
      const { error: progressError } = await supabase
        .from('user_program_progress')
        .update({
          current_lesson_id: lessonId,
          last_accessed: new Date().toISOString(),
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('program_id', programId);

      if (progressError) throw progressError;

      return { error: null };
    } catch (error) {
      console.error('Error starting lesson:', error);
      return { error };
    }
  }

  // Complete a lesson
  static async completeLesson(
    userId: string,
    programId: string,
    lessonId: string,
    reflection?: Partial<LessonReflection>
  ): Promise<{ error: any }> {
    try {
      // Save or update reflection
      const lessonReflection: Omit<LessonReflection, 'id'> = {
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
        reflection_responses: reflection?.reflection_responses || {},
        notes: reflection?.notes || '',
        insights: reflection?.insights || '',
        action_items_completed: reflection?.action_items_completed || [],
        habits_created: reflection?.habits_created || [],
        quiz_score: reflection?.quiz_score,
        quiz_answers: reflection?.quiz_answers || {},
        time_spent_minutes: reflection?.time_spent_minutes || 0,
        updated_at: new Date().toISOString(),
      };

      const { error: reflectionError } = await supabase
        .from('lesson_reflections')
        .upsert(lessonReflection, {
          onConflict: 'user_id,lesson_id',
        });

      if (reflectionError) throw reflectionError;

      // Update program progress
      const { data: progress, error: progressFetchError } = await supabase
        .from('user_program_progress')
        .select('*, intimacy_programs(total_lessons)')
        .eq('user_id', userId)
        .eq('program_id', programId)
        .single();

      if (progressFetchError) throw progressFetchError;

      // Count completed lessons
      const { count, error: countError } = await supabase
        .from('lesson_reflections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('completed', true)
        .in(
          'lesson_id',
          await this.getProgramLessonIds(programId)
        );

      if (countError) throw countError;

      const lessonsCompleted = count || 0;
      const totalLessons = progress.intimacy_programs?.total_lessons || 1;
      const progressPercentage = Math.round((lessonsCompleted / totalLessons) * 100);
      const isCompleted = progressPercentage >= 100;

      const { error: updateError } = await supabase
        .from('user_program_progress')
        .update({
          lessons_completed: lessonsCompleted,
          progress_percentage: progressPercentage,
          status: isCompleted ? 'completed' : 'in_progress',
          completed_at: isCompleted ? new Date().toISOString() : null,
          last_accessed: new Date().toISOString(),
          total_time_minutes: progress.total_time_minutes + (reflection?.time_spent_minutes || 0),
        })
        .eq('user_id', userId)
        .eq('program_id', programId);

      if (updateError) throw updateError;

      return { error: null };
    } catch (error) {
      console.error('Error completing lesson:', error);
      return { error };
    }
  }

  // Helper to get lesson IDs for a program
  private static async getProgramLessonIds(programId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('program_lessons')
      .select('id')
      .eq('program_id', programId);

    if (error || !data) return [];

    return data.map((lesson) => lesson.id!);
  }

  // Get lesson reflection
  static async getLessonReflection(
    userId: string,
    lessonId: string
  ): Promise<{ data: LessonReflection | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('lesson_reflections')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return { data: data || null, error: null };
    } catch (error) {
      console.error('Error fetching lesson reflection:', error);
      return { data: null, error };
    }
  }

  // Convert lesson action item to habit
  static async convertActionToHabit(
    userId: string,
    lessonId: string,
    actionItem: any
  ): Promise<{ data: any | null; error: any }> {
    try {
      // Create habit (assuming habits table structure from your app)
      const habit = {
        user_id: userId,
        name: actionItem.title || actionItem.name,
        category: 'intimacy',
        frequency: actionItem.frequency || 'daily',
        description: actionItem.description,
        goal_days: 30,
        is_active: true,
        source: 'intimacy_program',
        source_lesson_id: lessonId,
      };

      const { data, error } = await supabase
        .from('habits')
        .insert(habit)
        .select()
        .single();

      if (error) throw error;

      // Update lesson reflection to track habit creation
      const { data: reflection } = await supabase
        .from('lesson_reflections')
        .select('habits_created')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single();

      const habitsCreated = reflection?.habits_created || [];
      habitsCreated.push(data.id);

      await supabase
        .from('lesson_reflections')
        .update({ habits_created: habitsCreated })
        .eq('user_id', userId)
        .eq('lesson_id', lessonId);

      return { data, error: null };
    } catch (error) {
      console.error('Error converting action to habit:', error);
      return { data: null, error };
    }
  }

  // Get user's reflections for a program
  static async getProgramReflections(
    userId: string,
    programId: string
  ): Promise<{ data: LessonReflection[] | null; error: any }> {
    try {
      // Get lesson IDs for program
      const lessonIds = await this.getProgramLessonIds(programId);

      const { data, error } = await supabase
        .from('lesson_reflections')
        .select('*, program_lessons(*)')
        .eq('user_id', userId)
        .in('lesson_id', lessonIds)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching program reflections:', error);
      return { data: null, error };
    }
  }

  // Pause/resume program
  static async updateProgramStatus(
    userId: string,
    programId: string,
    status: 'in_progress' | 'paused'
  ): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('user_program_progress')
        .update({ status, last_accessed: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('program_id', programId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error('Error updating program status:', error);
      return { error };
    }
  }

  // Get recommended programs based on user needs
  static async getRecommendedPrograms(
    userId: string
  ): Promise<{ data: IntimacyProgram[] | null; error: any }> {
    try {
      // Get user's recent check-ins to understand needs
      const today = new Date();
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const { data: checkIns } = await supabase
        .from('intimacy_check_ins')
        .select('needs_attention, overall_feeling')
        .eq('user_id', userId)
        .gte('date', lastWeek.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(7);

      // Analyze needs and recommend programs
      const allNeeds = new Set<string>();
      let needsHelp = false;

      checkIns?.forEach((checkIn) => {
        if (checkIn.overall_feeling === 'struggling' || checkIn.overall_feeling === 'disconnected') {
          needsHelp = true;
        }
        checkIn.needs_attention?.forEach((need: string) => allNeeds.add(need));
      });

      // Get recommended categories based on needs
      const recommendedCategories: string[] = [];

      if (allNeeds.has('communication') || needsHelp) {
        recommendedCategories.push('communication');
      }
      if (allNeeds.has('emotional-closeness')) {
        recommendedCategories.push('emotional');
      }
      if (allNeeds.has('physical-intimacy')) {
        recommendedCategories.push('physical');
      }
      if (allNeeds.has('conflict')) {
        recommendedCategories.push('conflict');
      }

      // If no specific needs, recommend beginner programs
      if (recommendedCategories.length === 0) {
        const { data, error } = await supabase
          .from('intimacy_programs')
          .select('*')
          .eq('is_active', true)
          .eq('difficulty', 'beginner')
          .eq('featured', true)
          .order('order_index')
          .limit(3);

        if (error) throw error;
        return { data, error: null };
      }

      // Get programs matching recommended categories
      const { data, error } = await supabase
        .from('intimacy_programs')
        .select('*')
        .eq('is_active', true)
        .in('category', recommendedCategories)
        .order('featured', { ascending: false })
        .order('order_index')
        .limit(5);

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching recommended programs:', error);
      return { data: null, error };
    }
  }
}
