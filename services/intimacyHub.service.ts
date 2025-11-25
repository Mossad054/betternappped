/**
 * Intimacy Hub Service
 * Comprehensive service layer for all Intimacy Growth Hub operations
 * Handles programs, experiments, check-ins, assessments, achievements, and analytics
 */

import { SupabaseSafe } from '@/lib/supabaseSafe';

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface Program {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  total_lessons: number;
  category: 'communication' | 'connection' | 'desire' | 'conflict' | 'self-love' | 'exploration';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  cover_image_url?: string;
  tags: string[];
  prerequisites: string[];
  is_premium: boolean;
}

export interface Lesson {
  id: string;
  program_id: string;
  order_index: number;
  title: string;
  subtitle?: string;
  duration_minutes: number;
  content_type: 'text' | 'video' | 'audio' | 'interactive';
  content_text?: string;
  content_media_url?: string;
  objectives: string[];
  action_task: string;
  reflection_prompts: string[];
  unlock_criteria: Record<string, any>;
}

export interface UserLesson {
  id: string;
  user_id: string;
  lesson_id: string;
  program_id: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  started_at?: Date;
  completed_at?: Date;
  task_timeline?: 'tonight' | '3_days' | '7_days' | '14_days' | '21_days';
  task_scheduled_for?: Date;
  task_completed: boolean;
  task_completed_at?: Date;
  effectiveness_rating?: number;
  feeling_after?: string;
  reflection_text?: string;
  notes?: string;
}

export interface UserProgram {
  id: string;
  user_id: string;
  program_id: string;
  status: 'enrolled' | 'active' | 'paused' | 'completed' | 'abandoned';
  progress_percentage: number;
  enrolled_at: Date;
  started_at?: Date;
  completed_at?: Date;
  last_accessed_at?: Date;
  reminder_enabled: boolean;
  reminder_time: string;
}

export interface Experiment {
  id: string;
  title: string;
  description: string;
  type: 'habit' | 'behavioral' | 'communication' | 'physical' | 'emotional' | 'environmental';
  recommended_duration: number;
  difficulty: 'easy' | 'moderate' | 'challenging';
  default_metrics: string[];
  success_criteria: string;
  instructions: string;
  tips: string[];
  example_schedule: string;
  is_template: boolean;
  created_by?: string;
  is_public: boolean;
  usage_count: number;
}

export interface UserExperiment {
  id: string;
  user_id: string;
  experiment_id: string;
  custom_title?: string;
  duration_days: number;
  start_date: Date;
  end_date: Date;
  metrics_to_track: string[];
  baseline_metrics?: Record<string, any>;
  expected_outcomes?: string;
  status: 'planned' | 'active' | 'completed' | 'converted_to_habit' | 'abandoned';
  completion_percentage: number;
  success_rating?: number;
  result_summary?: string;
  data_insights?: Record<string, any>;
  reminder_times: string[];
  reminder_enabled: boolean;
}

export interface ExperimentLog {
  id: string;
  user_experiment_id: string;
  user_id: string;
  log_date: Date;
  day_number: number;
  completed: boolean;
  completion_time?: Date;
  mood_score?: number;
  energy_score?: number;
  intimacy_score?: number;
  anxiety_score?: number;
  custom_metrics?: Record<string, any>;
  reflection_text?: string;
  challenges?: string;
  wins?: string;
  notes?: string;
}

export interface DailyCheckin {
  id: string;
  user_id: string;
  checkin_date: Date;
  checkin_type: 'morning' | 'evening' | 'general' | 'pre_intimacy' | 'post_intimacy';
  mood?: number;
  stress?: number;
  energy?: number;
  intimacy_level?: number;
  desire_level?: number;
  comfort_level?: number;
  communication_quality?: number;
  sleep_quality?: number;
  physical_wellbeing?: number;
  gratitude_note?: string;
  challenge_note?: string;
  win_note?: string;
  general_notes?: string;
  had_intimacy: boolean;
  intimacy_type?: string;
  intimacy_satisfaction?: number;
}

export interface UserMetrics {
  user_id: string;
  connection_score: number;
  connection_trend: number;
  avg_mood: number;
  avg_intimacy: number;
  avg_stress: number;
  avg_energy: number;
  avg_communication: number;
  total_programs_completed: number;
  total_experiments_completed: number;
  total_lessons_completed: number;
  total_checkins: number;
  current_daily_streak: number;
  longest_daily_streak: number;
  days_active_last_30: number;
  top_activity?: string;
  top_program?: string;
  best_mood_days: string[];
  correlation_insights?: Record<string, any>;
  data_insights?: string[];
  last_calculated: Date;
}

export interface Assessment {
  id: string;
  name: string;
  description: string;
  category: 'connection' | 'communication' | 'desire' | 'satisfaction' | 'compatibility';
  duration_minutes: number;
  questions: any[];
  scoring_rules: Record<string, any>;
  recommendation_rules?: Record<string, any>;
  is_active: boolean;
}

export interface UserAssessment {
  id: string;
  user_id: string;
  assessment_id: string;
  taken_at: Date;
  answers: Record<string, any>;
  score: number;
  max_score: number;
  percentage: number;
  result_category: string;
  result_summary: string;
  recommended_programs: string[];
  recommended_experiments: string[];
  recommended_practices: string[];
  action_taken: boolean;
  follow_up_notes?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'programs' | 'experiments' | 'streaks' | 'checkins' | 'growth' | 'milestones';
  criteria_type: string;
  criteria_value: number;
  reward_points: number;
  badge_color: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
  progress: number;
  viewed: boolean;
  // Populated achievement details
  title?: string;
  description?: string;
  icon?: string;
  points?: number;
}

// =====================================================
// COACHING PROGRAMS SERVICE
// =====================================================

export class IntimacyHubService {
  
  /**
   * Get all available programs
   */
  static async getPrograms(userId: string): Promise<Program[]> {
    // Don't pass userId - programs is a template table without user_id column
    const result = await SupabaseSafe.select('programs', {}, undefined);

    if (result.error || !result.data) {
      console.warn('Error fetching programs:', result.error);
      return [];
    }

    return result.data as Program[];
  }

  /**
   * Get program by ID with lessons
   */
  static async getProgramWithLessons(userId: string, programId: string): Promise<{
    program: Program;
    lessons: Lesson[];
    userProgress?: UserProgram;
  } | null> {
    // Don't pass userId for template tables (programs, lessons)
    const [programResult, lessonsResult, progressResult] = await Promise.all([
      SupabaseSafe.select('programs', { id: programId }, undefined),
      SupabaseSafe.select('lessons', { program_id: programId }, undefined),
      SupabaseSafe.select('user_programs', { user_id: userId, program_id: programId }, userId),
    ]);

    if (programResult.error || !programResult.data || programResult.data.length === 0) {
      return null;
    }

    const program = programResult.data[0] as Program;
    const lessons = (lessonsResult.data || []) as Lesson[];
    const userProgress = progressResult.data?.[0] as UserProgram | undefined;

    // Sort lessons by order_index
    lessons.sort((a, b) => a.order_index - b.order_index);

    return { program, lessons, userProgress };
  }

  /**
   * Enroll user in a program
   */
  static async enrollInProgram(userId: string, programId: string): Promise<boolean> {
    const enrollmentData = {
      user_id: userId,
      program_id: programId,
      status: 'enrolled',
      progress_percentage: 0,
      enrolled_at: new Date().toISOString(),
      reminder_enabled: true,
      reminder_time: '20:00:00',
    };

    const result = await SupabaseSafe.insert('user_programs', enrollmentData, userId);
    
    if (result.error) {
      console.warn('Error enrolling in program:', result.error);
      return false;
    }

    // Create locked user_lessons for all lessons in program
    // Don't pass userId - lessons is a template table without user_id column
    const lessonsResult = await SupabaseSafe.select('lessons', { program_id: programId }, undefined);
    
    if (lessonsResult.data) {
      const userLessonsData = (lessonsResult.data as Lesson[]).map((lesson, index) => ({
        user_id: userId,
        lesson_id: lesson.id,
        program_id: programId,
        status: index === 0 ? 'available' : 'locked', // First lesson available
      }));

      await SupabaseSafe.insert('user_lessons', userLessonsData, userId);
    }

    return true;
  }

  /**
   * Get user's enrolled programs
   */
  static async getUserPrograms(userId: string, status?: string): Promise<UserProgram[]> {
    const filters: any = { user_id: userId };
    if (status) {
      filters.status = status;
    }

    const result = await SupabaseSafe.select('user_programs', filters, userId);

    if (result.error || !result.data) {
      return [];
    }

    return result.data as UserProgram[];
  }

  /**
   * Get user's lesson progress for a program
   */
  static async getUserLessons(userId: string, programId: string): Promise<UserLesson[]> {
    const result = await SupabaseSafe.select('user_lessons', {
      user_id: userId,
      program_id: programId,
    }, userId);

    if (result.error || !result.data) {
      return [];
    }

    return result.data as UserLesson[];
  }

  /**
   * Start a lesson
   */
  static async startLesson(userId: string, lessonId: string): Promise<boolean> {
    // Find the user_lesson record
    const findResult = await SupabaseSafe.select('user_lessons', {
      user_id: userId,
      lesson_id: lessonId,
    }, userId);

    if (findResult.error || !findResult.data || findResult.data.length === 0) {
      return false;
    }

    const userLesson = findResult.data[0] as any;

    const updateData = {
      status: 'in_progress',
      started_at: new Date().toISOString(),
    };

    const result = await SupabaseSafe.update('user_lessons', userLesson.id, updateData, userId);
    return !result.error;
  }

  /**
   * Complete a lesson with reflection
   */
  static async completeLesson(
    userId: string,
    lessonId: string,
    data: {
      taskTimeline?: string;
      effectivenessRating?: number;
      feelingAfter?: string;
      reflectionText?: string;
      notes?: string;
    }
  ): Promise<boolean> {
    const findResult = await SupabaseSafe.select('user_lessons', {
      user_id: userId,
      lesson_id: lessonId,
    }, userId);

    if (findResult.error || !findResult.data || findResult.data.length === 0) {
      return false;
    }

    const userLesson = findResult.data[0] as any;

    // Calculate task scheduled date based on timeline
    let taskScheduledFor: string | undefined;
    if (data.taskTimeline) {
      const now = new Date();
      switch (data.taskTimeline) {
        case 'tonight':
          taskScheduledFor = now.toISOString().split('T')[0];
          break;
        case '3_days':
          now.setDate(now.getDate() + 3);
          taskScheduledFor = now.toISOString().split('T')[0];
          break;
        case '7_days':
          now.setDate(now.getDate() + 7);
          taskScheduledFor = now.toISOString().split('T')[0];
          break;
        case '14_days':
          now.setDate(now.getDate() + 14);
          taskScheduledFor = now.toISOString().split('T')[0];
          break;
        case '21_days':
          now.setDate(now.getDate() + 21);
          taskScheduledFor = now.toISOString().split('T')[0];
          break;
      }
    }

    const updateData = {
      status: 'completed',
      completed_at: new Date().toISOString(),
      task_timeline: data.taskTimeline,
      task_scheduled_for: taskScheduledFor,
      effectiveness_rating: data.effectivenessRating,
      feeling_after: data.feelingAfter,
      reflection_text: data.reflectionText,
      notes: data.notes,
    };

    const result = await SupabaseSafe.update('user_lessons', userLesson.id, updateData, userId);
    
    if (result.error) {
      return false;
    }

    // Unlock next lesson
    await this.unlockNextLesson(userId, lessonId, userLesson.program_id);

    return true;
  }

  /**
   * Unlock the next lesson in sequence
   */
  private static async unlockNextLesson(userId: string, currentLessonId: string, programId: string): Promise<void> {
    // Get current lesson order
    // Don't pass userId - lessons is a template table without user_id column
    const lessonResult = await SupabaseSafe.select('lessons', { id: currentLessonId }, undefined);
    if (lessonResult.error || !lessonResult.data || lessonResult.data.length === 0) {
      return;
    }

    const currentLesson = lessonResult.data[0] as Lesson;
    const nextOrderIndex = currentLesson.order_index + 1;

    // Find next lesson
    // Don't pass userId - lessons is a template table without user_id column
    const nextLessonResult = await SupabaseSafe.select('lessons', {
      program_id: programId,
      order_index: nextOrderIndex,
    }, undefined);

    if (nextLessonResult.data && nextLessonResult.data.length > 0) {
      const nextLesson = nextLessonResult.data[0] as Lesson;

      // Update user_lesson to available
      const userLessonResult = await SupabaseSafe.select('user_lessons', {
        user_id: userId,
        lesson_id: nextLesson.id,
      }, userId);

      if (userLessonResult.data && userLessonResult.data.length > 0) {
        const userLesson = userLessonResult.data[0] as any;
        await SupabaseSafe.update('user_lessons', userLesson.id, { status: 'available' }, userId);
      }
    }
  }

  /**
   * Mark task as completed
   */
  static async completeTask(userId: string, lessonId: string): Promise<boolean> {
    const findResult = await SupabaseSafe.select('user_lessons', {
      user_id: userId,
      lesson_id: lessonId,
    }, userId);

    if (findResult.error || !findResult.data || findResult.data.length === 0) {
      return false;
    }

    const userLesson = findResult.data[0] as any;

    const updateData = {
      task_completed: true,
      task_completed_at: new Date().toISOString(),
    };

    const result = await SupabaseSafe.update('user_lessons', userLesson.id, updateData, userId);
    return !result.error;
  }

  // =====================================================
  // EXPERIMENTS SERVICE
  // =====================================================

  /**
   * Get all experiment templates
   */
  static async getExperimentTemplates(userId: string): Promise<Experiment[]> {
    const result = await SupabaseSafe.select('experiments', { is_template: true }, userId);
    
    if (result.error || !result.data) {
      return [];
    }
    
    return result.data as Experiment[];
  }

  /**
   * Create a new user experiment
   */
  static async createUserExperiment(
    userId: string,
    experimentId: string,
    config: {
      customTitle?: string;
      durationDays: number;
      startDate: Date;
      metricsToTrack: string[];
      expectedOutcomes?: string;
      reminderTimes?: string[];
    }
  ): Promise<string | null> {
    const endDate = new Date(config.startDate);
    endDate.setDate(endDate.getDate() + config.durationDays);

    const experimentData = {
      user_id: userId,
      experiment_id: experimentId,
      custom_title: config.customTitle,
      duration_days: config.durationDays,
      start_date: config.startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      metrics_to_track: config.metricsToTrack,
      expected_outcomes: config.expectedOutcomes,
      status: 'active',
      completion_percentage: 0,
      reminder_times: config.reminderTimes || ['20:00:00'],
      reminder_enabled: true,
    };

    const result = await SupabaseSafe.insert('user_experiments', experimentData, userId);

    if (result.error || !result.data) {
      console.warn('Error creating user experiment:', result.error);
      return null;
    }

    return (result.data as any).id;
  }

  /**
   * Get user's active experiments
   */
  static async getUserExperiments(
    userId: string,
    status?: 'active' | 'completed' | 'planned'
  ): Promise<UserExperiment[]> {
    const query: any = { user_id: userId };
    if (status) {
      query.status = status;
    }

    const result = await SupabaseSafe.select('user_experiments', query, userId);

    if (result.error || !result.data) {
      return [];
    }

    return result.data as UserExperiment[];
  }

  /**
   * Log daily experiment check-in
   */
  static async logExperimentCheckin(
    userId: string,
    userExperimentId: string,
    data: {
      logDate: Date;
      dayNumber: number;
      completed: boolean;
      moodScore?: number;
      energyScore?: number;
      intimacyScore?: number;
      anxietyScore?: number;
      customMetrics?: Record<string, any>;
      reflectionText?: string;
      challenges?: string;
      wins?: string;
      notes?: string;
    }
  ): Promise<boolean> {
    const logData = {
      user_experiment_id: userExperimentId,
      user_id: userId,
      log_date: data.logDate.toISOString().split('T')[0],
      day_number: data.dayNumber,
      completed: data.completed,
      completion_time: data.completed ? new Date().toISOString() : undefined,
      mood_score: data.moodScore,
      energy_score: data.energyScore,
      intimacy_score: data.intimacyScore,
      anxiety_score: data.anxietyScore,
      custom_metrics: data.customMetrics,
      reflection_text: data.reflectionText,
      challenges: data.challenges,
      wins: data.wins,
      notes: data.notes,
    };

    const result = await SupabaseSafe.insert('experiment_logs', logData, userId);
    return !result.error;
  }

  /**
   * Get experiment logs for a user experiment
   */
  static async getExperimentLogs(
    userId: string,
    userExperimentId: string
  ): Promise<ExperimentLog[]> {
    const result = await SupabaseSafe.select('experiment_logs', {
      user_id: userId,
      user_experiment_id: userExperimentId,
    }, userId);
    
    if (result.error || !result.data) {
      return [];
    }
    
    return result.data as ExperimentLog[];
  }

  /**
   * Complete an experiment and generate summary
   */
  static async completeExperiment(
    userId: string,
    userExperimentId: string,
    data: {
      successRating: number;
      resultSummary: string;
    }
  ): Promise<boolean> {
    const updateData = {
      status: 'completed',
      completion_percentage: 100,
      completed_at: new Date().toISOString(),
      success_rating: data.successRating,
      result_summary: data.resultSummary,
    };

    const result = await SupabaseSafe.update('user_experiments', userExperimentId, updateData, userId);
    return !result.error;
  }

  // =====================================================
  // DAILY CHECK-INS SERVICE
  // =====================================================

  /**
   * Create or update daily check-in
   */
  static async createDailyCheckin(userId: string, data: Partial<DailyCheckin>): Promise<boolean> {
    const checkinDate = (data.checkin_date || new Date()).toISOString().split('T')[0];
    const checkinType = data.checkin_type || 'general';

    const checkinData = {
      user_id: userId,
      checkin_date: checkinDate,
      checkin_type: checkinType,
      mood: data.mood,
      stress: data.stress,
      energy: data.energy,
      intimacy_level: data.intimacy_level,
      desire_level: data.desire_level,
      comfort_level: data.comfort_level,
      communication_quality: data.communication_quality,
      sleep_quality: data.sleep_quality,
      physical_wellbeing: data.physical_wellbeing,
      gratitude_note: data.gratitude_note,
      challenge_note: data.challenge_note,
      win_note: data.win_note,
      general_notes: data.general_notes,
      had_intimacy: data.had_intimacy || false,
      intimacy_type: data.intimacy_type,
      intimacy_satisfaction: data.intimacy_satisfaction,
    };

    // Check if check-in already exists for this date/type
    const existing = await SupabaseSafe.select('daily_checkins', {
      eq: { checkin_date: checkinDate, checkin_type: checkinType }
    }, userId);

    let result;
    if (existing.data && existing.data.length > 0) {
      // Update existing check-in
      result = await SupabaseSafe.update('daily_checkins', existing.data[0].id, checkinData, userId);
    } else {
      // Insert new check-in
      result = await SupabaseSafe.insert('daily_checkins', checkinData, userId);
    }

    if (!result.error) {
      // Update streak
      await this.updateStreak(userId, 'daily_checkin');
    }

    return !result.error;
  }

  /**
   * Get check-ins for date range
   */
  static async getCheckins(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<DailyCheckin[]> {
    // Note: Supabase doesn't support date range queries directly with our safe wrapper
    // In production, you'd implement a custom query here
    const result = await SupabaseSafe.select('daily_checkins', { user_id: userId }, userId);
    
    if (result.error || !result.data) {
      return [];
    }

    // Filter by date range in memory (not ideal for large datasets)
    const checkins = result.data as DailyCheckin[];
    return checkins.filter(c => {
      const date = new Date(c.checkin_date);
      return date >= startDate && date <= endDate;
    });
  }

  /**
   * Update user streak
   */
  private static async updateStreak(userId: string, streakType: string): Promise<void> {
    // Check if user has a streak record
    const streakResult = await SupabaseSafe.select('user_streaks', {
      user_id: userId,
      streak_type: streakType,
    }, userId);

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (streakResult.data && streakResult.data.length > 0) {
      const streak = streakResult.data[0] as any;
      const lastCheckinDate = streak.last_checkin_date;

      let newStreak = streak.current_streak;
      
      if (lastCheckinDate === yesterdayStr) {
        // Continue streak
        newStreak += 1;
      } else if (lastCheckinDate !== today) {
        // Streak broken, reset
        newStreak = 1;
      }

      const updateData = {
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, streak.longest_streak),
        last_checkin_date: today,
        updated_at: new Date().toISOString(),
      };

      await SupabaseSafe.update('user_streaks', streak.id, updateData, userId);
    } else {
      // Create new streak
      const streakData = {
        user_id: userId,
        streak_type: streakType,
        current_streak: 1,
        longest_streak: 1,
        last_checkin_date: today,
      };

      await SupabaseSafe.insert('user_streaks', streakData, userId);
    }
  }

  // =====================================================
  // ASSESSMENTS SERVICE
  // =====================================================

  /**
   * Get all active assessments
   */
  static async getAssessments(userId: string): Promise<Assessment[]> {
    // Don't pass userId - assessments is a template table without user_id column
    const result = await SupabaseSafe.select('assessments', { is_active: true }, undefined);

    if (result.error || !result.data) {
      return [];
    }

    return result.data as Assessment[];
  }

  /**
   * Submit assessment and get results
   */
  static async submitAssessment(
    userId: string,
    assessmentId: string,
    answers: Record<string, any>
  ): Promise<UserAssessment | null> {
    // Get assessment to calculate score
    // Don't pass userId - assessments is a template table without user_id column
    const assessmentResult = await SupabaseSafe.select('assessments', { id: assessmentId }, undefined);
    
    if (assessmentResult.error || !assessmentResult.data || assessmentResult.data.length === 0) {
      return null;
    }

    const assessment = assessmentResult.data[0] as Assessment;
    
    // Calculate score based on scoring_rules (simplified)
    const maxScore = assessment.scoring_rules.max_score || 100;
    let score = 0;
    
    // This is a simplified scoring logic - in production, you'd have more complex rules
    const answerValues = Object.values(answers);
    if (answerValues.length > 0) {
      const avgAnswer = answerValues.reduce((sum: number, val: any) => sum + (parseInt(val) || 0), 0) / answerValues.length;
      score = Math.round((avgAnswer / 10) * maxScore); // Assuming 1-10 scale
    }

    const percentage = Math.round((score / maxScore) * 100);
    
    // Determine result category
    let resultCategory = 'growing';
    let resultSummary = 'You\'re making progress in your intimacy journey.';
    
    if (percentage >= 80) {
      resultCategory = 'thriving';
      resultSummary = 'Your intimacy health is flourishing! Keep nurturing these positive patterns.';
    } else if (percentage < 40) {
      resultCategory = 'struggling';
      resultSummary = 'This area needs attention. Consider starting with foundational programs.';
    }

    const assessmentData = {
      user_id: userId,
      assessment_id: assessmentId,
      taken_at: new Date().toISOString(),
      answers: answers,
      score: score,
      max_score: maxScore,
      percentage: percentage,
      result_category: resultCategory,
      result_summary: resultSummary,
      recommended_programs: [],
      recommended_experiments: [],
      recommended_practices: [],
      action_taken: false,
    };

    const result = await SupabaseSafe.insert('user_assessments', assessmentData, userId);
    
    if (result.error || !result.data) {
      return null;
    }

    return result.data as any;
  }

  /**
   * Get user's assessment history
   */
  static async getUserAssessments(userId: string): Promise<UserAssessment[]> {
    const result = await SupabaseSafe.select('user_assessments', { user_id: userId }, userId);
    
    if (result.error || !result.data) {
      return [];
    }
    
    return result.data as UserAssessment[];
  }

  // =====================================================
  // METRICS & ANALYTICS SERVICE
  // =====================================================

  /**
   * Calculate and update user metrics
   */
  static async calculateUserMetrics(userId: string): Promise<UserMetrics | null> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days

    // Get all relevant data
    const [checkins, programs, experiments, lessons] = await Promise.all([
      this.getCheckins(userId, startDate, endDate),
      SupabaseSafe.select('user_programs', { user_id: userId, status: 'completed' }, userId),
      SupabaseSafe.select('user_experiments', { user_id: userId, status: 'completed' }, userId),
      SupabaseSafe.select('user_lessons', { user_id: userId, status: 'completed' }, userId),
    ]);

    if (checkins.length === 0) {
      return null;
    }

    // Calculate averages
    const avgMood = checkins.reduce((sum, c) => sum + (c.mood || 0), 0) / checkins.length;
    const avgIntimacy = checkins.reduce((sum, c) => sum + (c.intimacy_level || 0), 0) / checkins.length;
    const avgStress = checkins.reduce((sum, c) => sum + (c.stress || 0), 0) / checkins.length;
    const avgEnergy = checkins.reduce((sum, c) => sum + (c.energy || 0), 0) / checkins.length;
    const avgCommunication = checkins.reduce((sum, c) => sum + (c.communication_quality || 0), 0) / checkins.length;

    // Calculate connection score (weighted average)
    const connectionScore = Math.round(
      (avgMood * 0.2 + avgIntimacy * 0.3 + avgCommunication * 0.3 + avgEnergy * 0.1 + (10 - avgStress) * 0.1) * 10
    );

    // Determine trend (simplified)
    const recentCheckins = checkins.slice(-7); // Last 7 days
    const olderCheckins = checkins.slice(0, 7); // Previous 7 days
    const recentAvg = recentCheckins.reduce((sum, c) => sum + (c.intimacy_level || 0), 0) / recentCheckins.length;
    const olderAvg = olderCheckins.reduce((sum, c) => sum + (c.intimacy_level || 0), 0) / olderCheckins.length;
    
    let connectionTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recentAvg > olderAvg + 0.5) connectionTrend = 'improving';
    else if (recentAvg < olderAvg - 0.5) connectionTrend = 'declining';

    // Get streak
    const streakResult = await SupabaseSafe.select('user_streaks', {
      user_id: userId,
      streak_type: 'daily_checkin',
    }, userId);
    
    const streak = streakResult.data?.[0] as any;

    const metricsData = {
      user_id: userId,
      connection_score: connectionScore,
      connection_trend: connectionTrend,
      avg_mood: parseFloat(avgMood.toFixed(1)),
      avg_intimacy: parseFloat(avgIntimacy.toFixed(1)),
      avg_stress: parseFloat(avgStress.toFixed(1)),
      avg_energy: parseFloat(avgEnergy.toFixed(1)),
      avg_communication: parseFloat(avgCommunication.toFixed(1)),
      total_programs_completed: programs.data?.length || 0,
      total_experiments_completed: experiments.data?.length || 0,
      total_lessons_completed: lessons.data?.length || 0,
      total_checkins: checkins.length,
      current_daily_streak: streak?.current_streak || 0,
      longest_daily_streak: streak?.longest_streak || 0,
      days_active_last_30: checkins.length,
      best_mood_days: [], // Would calculate from checkins
      last_calculated: new Date().toISOString(),
    };

    // Check if metrics exist
    const existingMetrics = await SupabaseSafe.select('user_metrics', { user_id: userId }, userId);
    
    if (existingMetrics.data && existingMetrics.data.length > 0) {
      const existing = existingMetrics.data[0] as any;
      await SupabaseSafe.update('user_metrics', existing.id, metricsData, userId);
    } else {
      await SupabaseSafe.insert('user_metrics', metricsData, userId);
    }

    return metricsData as any;
  }

  /**
   * Get user metrics
   */
  static async getUserMetrics(userId: string): Promise<UserMetrics | null> {
    const result = await SupabaseSafe.select('user_metrics', { user_id: userId }, userId);
    
    if (result.error || !result.data || result.data.length === 0) {
      // Calculate if not exists
      return await this.calculateUserMetrics(userId);
    }
    
    return result.data[0] as UserMetrics;
  }

  // =====================================================
  // ACHIEVEMENTS SERVICE
  // =====================================================

  /**
   * Get all achievements
   */
  static async getAchievements(userId: string): Promise<Achievement[]> {
    // Don't pass userId - achievements is a template table without user_id column
    const result = await SupabaseSafe.select('achievements', {}, undefined);

    if (result.error || !result.data) {
      return [];
    }

    return result.data as Achievement[];
  }

  /**
   * Get user's unlocked achievements with details
   */
  static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const result = await SupabaseSafe.select('user_achievements', { user_id: userId }, userId);
    
    if (result.error || !result.data) {
      return [];
    }
    
    const userAchievements = result.data as UserAchievement[];

    // Fetch achievement details for each user achievement
    // Don't pass userId - achievements is a template table without user_id column
    const achievementsResult = await SupabaseSafe.select('achievements', {}, undefined);
    const achievements = (achievementsResult.data || []) as Achievement[];
    
    // Merge achievement details into user achievements
    return userAchievements.map(ua => {
      const achievement = achievements.find(a => a.id === ua.achievement_id);
      return {
        ...ua,
        title: achievement?.title,
        description: achievement?.description,
        icon: achievement?.icon,
        points: achievement?.reward_points,
      };
    });
  }

  /**
   * Check and unlock achievements
   */
  static async checkAndUnlockAchievements(userId: string): Promise<Achievement[]> {
    const [allAchievements, userAchievements, metrics] = await Promise.all([
      this.getAchievements(userId),
      this.getUserAchievements(userId),
      this.getUserMetrics(userId),
    ]);

    if (!metrics) {
      return [];
    }

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) {
        continue; // Already unlocked
      }

      let shouldUnlock = false;

      // Check criteria
      switch (achievement.criteria_type) {
        case 'total_lessons':
          shouldUnlock = metrics.total_lessons_completed >= achievement.criteria_value;
          break;
        case 'program_complete':
          shouldUnlock = metrics.total_programs_completed >= achievement.criteria_value;
          break;
        case 'experiment_complete':
          shouldUnlock = metrics.total_experiments_completed >= achievement.criteria_value;
          break;
        case 'streak_days':
          shouldUnlock = metrics.current_daily_streak >= achievement.criteria_value;
          break;
        case 'total_checkins':
          shouldUnlock = metrics.total_checkins >= achievement.criteria_value;
          break;
      }

      if (shouldUnlock) {
        // Unlock achievement
        const achievementData = {
          user_id: userId,
          achievement_id: achievement.id,
          unlocked_at: new Date().toISOString(),
          progress: 100,
          viewed: false,
        };

        const result = await SupabaseSafe.insert('user_achievements', achievementData, userId);
        
        if (!result.error) {
          newlyUnlocked.push(achievement);
        }
      }
    }

    return newlyUnlocked;
  }

  /**
   * Mark achievement as viewed
   */
  static async markAchievementViewed(userId: string, achievementId: string): Promise<boolean> {
    const findResult = await SupabaseSafe.select('user_achievements', {
      user_id: userId,
      achievement_id: achievementId,
    }, userId);

    if (findResult.error || !findResult.data || findResult.data.length === 0) {
      return false;
    }

    const userAchievement = findResult.data[0] as any;
    const result = await SupabaseSafe.update('user_achievements', userAchievement.id, { viewed: true }, userId);
    
    return !result.error;
  }
}

export default IntimacyHubService;
