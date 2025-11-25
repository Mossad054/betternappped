import { SupabaseSafe } from '@/lib/supabaseSafe';
import { Database } from '@/lib/supabase';
import { isGuestMode, guestDataStore } from '@/lib/guestDataStore';
import { supabase } from '@/lib/supabase';

type IntimacyLog = Database['public']['Tables']['intimacy_logs']['Row'];
type IntimacyLogInsert = Database['public']['Tables']['intimacy_logs']['Insert'];
type IntimacyLogUpdate = Database['public']['Tables']['intimacy_logs']['Update'];

// New comprehensive Intimacy Hub types
export interface IntimacyCheckIn {
  id?: string;
  user_id?: string;
  date: string;
  mood: number;
  stress_level: number;
  connection_self: number;
  connection_partner?: number;
  energy_level: number;
  intimacy_frequency?: number;
  intimacy_quality?: number;
  emotional_distance?: boolean;
  what_made_close?: string;
  what_appreciated?: string;
  notes?: string;
  timestamp?: string;
}

export interface IntimacyProgram {
  id?: string;
  user_id?: string;
  program_type: string;
  title: string;
  description?: string;
  start_date: string;
  target_end_date?: string;
  current_lesson: number;
  total_lessons: number;
  pace?: 'daily' | 'custom';
  status?: 'active' | 'paused' | 'completed';
  created_at?: string;
  updated_at?: string;
}

export interface ProgramLesson {
  id?: string;
  program_id: string;
  lesson_number: number;
  title: string;
  content: string;
  action_item?: string;
  practice_timeline?: string;
  reminder_date?: string;
  completed?: boolean;
  completed_at?: string;
  feedback_rating?: number;
  feedback_note?: string;
}

export interface IntimacyExperiment {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  hypothesis?: string;
  duration_days: number;
  start_date: string;
  end_date: string;
  parameters_tracked: string[];
  frequency?: 'daily' | 'alternate';
  reminder_time?: string;
  status?: 'active' | 'completed' | 'archived';
  completion_rate?: number;
  created_at?: string;
}

export interface ExperimentLog {
  id?: string;
  experiment_id: string;
  date: string;
  completed?: boolean;
  mood_after?: number;
  connection_after?: number;
  stress_after?: number;
  satisfaction_after?: number;
  communication_after?: number;
  notes?: string;
  timestamp?: string;
}

export interface ConnectionScore {
  id?: string;
  user_id?: string;
  date: string;
  score: number;
  mood_contribution?: number;
  intimacy_contribution?: number;
  communication_contribution?: number;
  stress_penalty?: number;
  trend?: 'up' | 'down' | 'stable';
  calculated_at?: string;
}

export interface IntimacyAssessment {
  id?: string;
  user_id?: string;
  assessment_type: string;
  score: number;
  metrics?: any;
  date: string;
  timestamp?: string;
}

export class IntimacyService {
  // Intimacy data is only for authenticated users - guests cannot access

  static async create(data: Omit<IntimacyLogInsert, 'user_id'>, userId: string): Promise<{ data: IntimacyLog | null; error: any }> {
    if (await isGuestMode()) {
      return { data: null, error: 'Intimacy tracking requires authentication' };
    }
    const result = await SupabaseSafe.insert('intimacy_logs', data, userId);
    return { data: result.data, error: result.error };
  }

  static async getAll(userId: string): Promise<{ data: IntimacyLog[] | null; error: any }> {
    if (await isGuestMode()) {
      return { data: [], error: null };
    }
    const result = await SupabaseSafe.select('intimacy_logs', { order: { date: 'desc' } }, userId);
    return { data: result.data, error: result.error };
  }

  static async getById(id: string, userId: string): Promise<{ data: IntimacyLog | null; error: any }> {
    if (await isGuestMode()) {
      return { data: null, error: null };
    }
    const result = await SupabaseSafe.select('intimacy_logs', { eq: { id } }, userId);
    return { data: result.data?.[0] || null, error: result.error };
  }

  static async getByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ data: IntimacyLog[] | null; error: any }> {
    // Intimacy data is only for authenticated users - guests cannot access
    if (await isGuestMode()) {
      return { data: [], error: null };
    }
    const result = await SupabaseSafe.select('intimacy_logs', {
      gte: { date: startDate },
      lte: { date: endDate },
      order: { date: 'asc' }
    }, userId);
    return { data: result.data, error: result.error };
  }

  static async getByDate(userId: string, date: string): Promise<{ data: IntimacyLog | null; error: any }> {
    if (await isGuestMode()) {
      return { data: null, error: null };
    }
    const result = await SupabaseSafe.select('intimacy_logs', { eq: { date } }, userId);
    return { data: result.data?.[0] || null, error: result.error };
  }

  static async update(
    id: string,
    data: Omit<IntimacyLogUpdate, 'user_id'>,
    userId: string
  ): Promise<{ data: IntimacyLog | null; error: any }> {
    if (await isGuestMode()) {
      return { data: null, error: 'Intimacy tracking requires authentication' };
    }
    const result = await SupabaseSafe.update('intimacy_logs', id, data, userId);
    return { data: result.data, error: result.error };
  }

  static async delete(id: string, userId: string): Promise<{ error: any }> {
    if (await isGuestMode()) {
      return { error: 'Intimacy tracking requires authentication' };
    }
    const result = await SupabaseSafe.delete('intimacy_logs', id, userId);
    return { error: result.error };
  }

  static async upsert(data: Omit<IntimacyLogInsert, 'user_id'>, userId: string): Promise<{ data: IntimacyLog | null; error: any }> {
    // For upsert, we'll try to get existing record first, then update or insert
    const existing = await this.getByDate(userId, data.date);
    
    if (existing.data) {
      return await this.update(existing.data.id, data, userId);
    } else {
      return await this.create(data, userId);
    }
  }

  static async getMoodImpact(userId: string, days: number = 30): Promise<{ data: { before: number; after: number; difference: number } | null; error: any }> {
    const result = await SupabaseSafe.select('intimacy_logs', { 
      limit: days,
      order: { date: 'desc' }
    }, userId);

    if (result.error) return { data: null, error: result.error };
    if (!result.data || result.data.length === 0) return { data: null, error: null };

    const before = result.data.reduce((sum, log) => sum + log.mood_before, 0) / result.data.length;
    const after = result.data.reduce((sum, log) => sum + log.mood_after, 0) / result.data.length;
    const difference = Number((after - before).toFixed(1));

    return { 
      data: { 
        before: Number(before.toFixed(1)), 
        after: Number(after.toFixed(1)), 
        difference 
      }, 
      error: null 
    };
  }

  static async getFrequency(userId: string, days: number = 30): Promise<{ data: number | null; error: any }> {
    const result = await SupabaseSafe.select('intimacy_logs', { 
      limit: days,
      order: { date: 'desc' }
    }, userId);

    if (result.error) return { data: null, error: result.error };

    const frequency = result.data ? result.data.length : 0;
    return { data: frequency, error: null };
  }

  static async getTypeDistribution(userId: string, days: number = 30): Promise<{ data: { solo: number; couple: number } | null; error: any }> {
    const result = await SupabaseSafe.select('intimacy_logs', { 
      limit: days,
      order: { date: 'desc' }
    }, userId);

    if (result.error) return { data: null, error: result.error };
    if (!result.data) return { data: { solo: 0, couple: 0 }, error: null };

    const solo = result.data.filter(log => log.type === 'solo').length;
    const couple = result.data.filter(log => log.type === 'couple').length;

    return { data: { solo, couple }, error: null };
  }

  // ============================================
  // COMPREHENSIVE INTIMACY HUB METHODS
  // ============================================

  // Check-Ins
  static async saveCheckIn(checkIn: IntimacyCheckIn, userId: string): Promise<{ data: IntimacyCheckIn | null; error: any }> {
    const { data, error } = await supabase
      .from('intimacy_check_ins')
      .upsert({
        ...checkIn,
        user_id: userId,
      })
      .select()
      .single();

    return { data, error };
  }

  static async getCheckIns(userId: string, limit: number = 30): Promise<{ data: IntimacyCheckIn[] | null; error: any }> {
    const { data, error } = await supabase
      .from('intimacy_check_ins')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    return { data, error };
  }

  static async getCheckInByDate(userId: string, date: string): Promise<{ data: IntimacyCheckIn | null; error: any }> {
    const { data, error } = await supabase
      .from('intimacy_check_ins')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    return { data, error };
  }

  // Programs
  static async createProgram(program: IntimacyProgram, userId: string): Promise<{ data: IntimacyProgram | null; error: any }> {
    const { data, error } = await supabase
      .from('intimacy_programs')
      .insert({
        ...program,
        user_id: userId,
      })
      .select()
      .single();

    return { data, error };
  }

  static async getActiveProgram(userId: string): Promise<{ data: IntimacyProgram | null; error: any }> {
    const { data, error } = await supabase
      .from('intimacy_programs')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return { data, error };
  }

  static async updateProgram(programId: string, updates: Partial<IntimacyProgram>, userId: string): Promise<{ data: IntimacyProgram | null; error: any }> {
    const { data, error } = await supabase
      .from('intimacy_programs')
      .update(updates)
      .eq('id', programId)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  }

  // Program Lessons
  static async getProgramLessons(programId: string): Promise<{ data: ProgramLesson[] | null; error: any }> {
    const { data, error } = await supabase
      .from('program_lessons')
      .select('*')
      .eq('program_id', programId)
      .order('lesson_number', { ascending: true });

    return { data, error };
  }

  static async createLesson(lesson: ProgramLesson): Promise<{ data: ProgramLesson | null; error: any }> {
    const { data, error } = await supabase
      .from('program_lessons')
      .insert(lesson)
      .select()
      .single();

    return { data, error };
  }

  static async updateLesson(lessonId: string, updates: Partial<ProgramLesson>): Promise<{ data: ProgramLesson | null; error: any }> {
    const { data, error } = await supabase
      .from('program_lessons')
      .update(updates)
      .eq('id', lessonId)
      .select()
      .single();

    return { data, error };
  }

  // Experiments
  static async createExperiment(experiment: IntimacyExperiment, userId: string): Promise<{ data: IntimacyExperiment | null; error: any }> {
    const { data, error } = await supabase
      .from('intimacy_experiments')
      .insert({
        ...experiment,
        user_id: userId,
      })
      .select()
      .single();

    return { data, error };
  }

  static async getActiveExperiment(userId: string): Promise<{ data: IntimacyExperiment | null; error: any }> {
    const { data, error } = await supabase
      .from('intimacy_experiments')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return { data, error };
  }

  static async updateExperiment(experimentId: string, updates: Partial<IntimacyExperiment>, userId: string): Promise<{ data: IntimacyExperiment | null; error: any }> {
    const { data, error } = await supabase
      .from('intimacy_experiments')
      .update(updates)
      .eq('id', experimentId)
      .eq('user_id', userId)
      .select()
      .single();

    return { data, error };
  }

  // Experiment Logs
  static async logExperimentDay(log: ExperimentLog): Promise<{ data: ExperimentLog | null; error: any }> {
    const { data, error } = await supabase
      .from('experiment_logs')
      .upsert(log)
      .select()
      .single();

    return { data, error };
  }

  static async getExperimentLogs(experimentId: string): Promise<{ data: ExperimentLog[] | null; error: any }> {
    const { data, error } = await supabase
      .from('experiment_logs')
      .select('*')
      .eq('experiment_id', experimentId)
      .order('date', { ascending: true });

    return { data, error };
  }

  // Connection Scores
  static async calculateConnectionScore(userId: string, checkIn: IntimacyCheckIn): Promise<number> {
    // Formula: Base score from mood, intimacy quality, communication
    // Penalty from stress
    const moodScore = (checkIn.mood / 10) * 40;
    const intimacyScore = checkIn.intimacy_quality ? (checkIn.intimacy_quality / 10) * 30 : 0;
    const connectionScore = (checkIn.connection_self / 10) * 20;
    const stressPenalty = (checkIn.stress_level / 10) * 10;

    const totalScore = Math.max(0, Math.min(100, moodScore + intimacyScore + connectionScore - stressPenalty));
    return Math.round(totalScore);
  }

  static async saveConnectionScore(score: ConnectionScore, userId: string): Promise<{ data: ConnectionScore | null; error: any }> {
    const { data, error } = await supabase
      .from('connection_scores')
      .upsert({
        ...score,
        user_id: userId,
      })
      .select()
      .single();

    return { data, error };
  }

  static async getConnectionScores(userId: string, limit: number = 30): Promise<{ data: ConnectionScore[] | null; error: any }> {
    const { data, error } = await supabase
      .from('connection_scores')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);

    return { data, error };
  }

  static async getLatestConnectionScore(userId: string): Promise<{ data: ConnectionScore | null; error: any }> {
    const { data, error } = await supabase
      .from('connection_scores')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    return { data, error };
  }

  static async calculateConnectionTrend(userId: string): Promise<'up' | 'down' | 'stable'> {
    const { data } = await this.getConnectionScores(userId, 7);
    if (!data || data.length < 2) return 'stable';

    const recent = data.slice(0, 3).reduce((sum, s) => sum + s.score, 0) / Math.min(3, data.length);
    const older = data.slice(3, 7).reduce((sum, s) => sum + s.score, 0) / Math.max(1, data.length - 3);

    const diff = recent - older;
    if (diff > 5) return 'up';
    if (diff < -5) return 'down';
    return 'stable';
  }

  // Assessments
  static async saveAssessment(assessment: IntimacyAssessment, userId: string): Promise<{ data: IntimacyAssessment | null; error: any }> {
    const { data, error } = await supabase
      .from('intimacy_assessments')
      .insert({
        ...assessment,
        user_id: userId,
      })
      .select()
      .single();

    return { data, error };
  }

  static async getAssessments(userId: string, type?: string): Promise<{ data: IntimacyAssessment[] | null; error: any }> {
    let query = supabase
      .from('intimacy_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (type) {
      query = query.eq('assessment_type', type);
    }

    const { data, error } = await query;
    return { data, error };
  }
}
