import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type SleepLog = Database['public']['Tables']['sleep_logs']['Row'];
type SleepLogInsert = Database['public']['Tables']['sleep_logs']['Insert'];
type SleepLogUpdate = Database['public']['Tables']['sleep_logs']['Update'];

export class SleepService {
  static async create(data: Omit<SleepLogInsert, 'user_id'>, userId: string): Promise<{ data: SleepLog | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('sleep_logs')
        .insert({ ...data, user_id: userId })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getAll(userId: string): Promise<{ data: SleepLog[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getById(id: string, userId: string): Promise<{ data: SleepLog | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('sleep_logs')
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
  ): Promise<{ data: SleepLog[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('sleep_logs')
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

  static async getByDate(userId: string, date: string): Promise<{ data: SleepLog | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('sleep_logs')
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
    data: Omit<SleepLogUpdate, 'user_id'>, 
    userId: string
  ): Promise<{ data: SleepLog | null; error: any }> {
    try {
      const { data: updatedData, error } = await supabase
        .from('sleep_logs')
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
        .from('sleep_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  static async upsert(data: Omit<SleepLogInsert, 'user_id'>, userId: string): Promise<{ data: SleepLog | null; error: any }> {
    try {
      const { data: result, error } = await supabase
        .from('sleep_logs')
        .upsert({ ...data, user_id: userId })
        .select()
        .single();

      return { data: result, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getAverageHours(userId: string, days: number = 7): Promise<{ data: number | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('sleep_logs')
        .select('hours')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(days);

      if (error) return { data: null, error };

      if (!data || data.length === 0) return { data: null, error: null };

      const average = data.reduce((sum, log) => sum + Number(log.hours), 0) / data.length;
      return { data: Number(average.toFixed(1)), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getQualityTrend(userId: string, days: number = 7): Promise<{ data: number[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('sleep_logs')
        .select('quality')
        .eq('user_id', userId)
        .order('date', { ascending: true })
        .limit(days);

      if (error) return { data: null, error };

      const trend = data?.map(log => log.quality) || [];
      return { data: trend, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}
