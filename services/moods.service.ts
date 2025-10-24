import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type MoodLog = Database['public']['Tables']['mood_logs']['Row'];
type MoodLogInsert = Database['public']['Tables']['mood_logs']['Insert'];
type MoodLogUpdate = Database['public']['Tables']['mood_logs']['Update'];

export interface MoodLogWithUser extends MoodLog {
  user_id: string;
}

export class MoodsService {
  static async create(moodData: Omit<MoodLogInsert, 'user_id'>, userId: string): Promise<{ data: MoodLog | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('mood_logs')
        .insert({ ...moodData, user_id: userId })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getAll(userId: string): Promise<{ data: MoodLog[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getById(id: string, userId: string): Promise<{ data: MoodLog | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<{ data: MoodLog[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getByDate(userId: string, date: string): Promise<{ data: MoodLog | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('mood_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async update(
    id: string, 
    data: Omit<MoodLogUpdate, 'user_id'>, 
    userId: string
  ): Promise<{ data: MoodLog | null; error: any }> {
    try {
      const { data: updatedData, error } = await supabase
        .from('mood_logs')
        .update(data)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      return { data: updatedData, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async delete(id: string, userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('mood_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  static async upsert(data: Omit<MoodLogInsert, 'user_id'>, userId: string): Promise<{ data: MoodLog | null; error: any }> {
    try {
      const { data: result, error } = await supabase
        .from('mood_logs')
        .upsert({ ...data, user_id: userId })
        .select()
        .single();

      return { data: result, error };
    } catch (error) {
      return { data: null, error };
    }
  }
}
