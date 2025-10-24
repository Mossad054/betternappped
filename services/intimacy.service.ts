import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type IntimacyLog = Database['public']['Tables']['intimacy_logs']['Row'];
type IntimacyLogInsert = Database['public']['Tables']['intimacy_logs']['Insert'];
type IntimacyLogUpdate = Database['public']['Tables']['intimacy_logs']['Update'];

export class IntimacyService {
  static async create(data: Omit<IntimacyLogInsert, 'user_id'>, userId: string): Promise<{ data: IntimacyLog | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('intimacy_logs')
        .insert({ ...data, user_id: userId })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getAll(userId: string): Promise<{ data: IntimacyLog[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('intimacy_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getById(id: string, userId: string): Promise<{ data: IntimacyLog | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('intimacy_logs')
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
  ): Promise<{ data: IntimacyLog[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('intimacy_logs')
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

  static async getByDate(userId: string, date: string): Promise<{ data: IntimacyLog | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('intimacy_logs')
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
    data: Omit<IntimacyLogUpdate, 'user_id'>, 
    userId: string
  ): Promise<{ data: IntimacyLog | null; error: any }> {
    try {
      const { data: updatedData, error } = await supabase
        .from('intimacy_logs')
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
        .from('intimacy_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  static async upsert(data: Omit<IntimacyLogInsert, 'user_id'>, userId: string): Promise<{ data: IntimacyLog | null; error: any }> {
    try {
      const { data: result, error } = await supabase
        .from('intimacy_logs')
        .upsert({ ...data, user_id: userId })
        .select()
        .single();

      return { data: result, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getMoodImpact(userId: string, days: number = 30): Promise<{ data: { before: number; after: number; difference: number } | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('intimacy_logs')
        .select('mood_before, mood_after')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(days);

      if (error) return { data: null, error };

      if (!data || data.length === 0) return { data: null, error: null };

      const before = data.reduce((sum, log) => sum + log.mood_before, 0) / data.length;
      const after = data.reduce((sum, log) => sum + log.mood_after, 0) / data.length;
      const difference = Number((after - before).toFixed(1));

      return { 
        data: { 
          before: Number(before.toFixed(1)), 
          after: Number(after.toFixed(1)), 
          difference 
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getFrequency(userId: string, days: number = 30): Promise<{ data: number | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('intimacy_logs')
        .select('id')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(days);

      if (error) return { data: null, error };

      const frequency = data ? data.length : 0;
      return { data: frequency, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getTypeDistribution(userId: string, days: number = 30): Promise<{ data: { solo: number; couple: number } | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('intimacy_logs')
        .select('type')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(days);

      if (error) return { data: null, error };

      if (!data) return { data: { solo: 0, couple: 0 }, error: null };

      const solo = data.filter(log => log.type === 'solo').length;
      const couple = data.filter(log => log.type === 'couple').length;

      return { data: { solo, couple }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}
