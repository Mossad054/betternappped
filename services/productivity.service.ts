import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type ProductivityLog = Database['public']['Tables']['productivity_logs']['Row'];
type ProductivityLogInsert = Database['public']['Tables']['productivity_logs']['Insert'];
type ProductivityLogUpdate = Database['public']['Tables']['productivity_logs']['Update'];

export class ProductivityService {
  static async create(data: Omit<ProductivityLogInsert, 'user_id'>, userId: string): Promise<{ data: ProductivityLog | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('productivity_logs')
        .insert({ ...data, user_id: userId })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getAll(userId: string): Promise<{ data: ProductivityLog[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('productivity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getById(id: string, userId: string): Promise<{ data: ProductivityLog | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('productivity_logs')
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
  ): Promise<{ data: ProductivityLog[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('productivity_logs')
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

  static async getByDate(userId: string, date: string): Promise<{ data: ProductivityLog | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('productivity_logs')
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
    data: Omit<ProductivityLogUpdate, 'user_id'>, 
    userId: string
  ): Promise<{ data: ProductivityLog | null; error: any }> {
    try {
      const { data: updatedData, error } = await supabase
        .from('productivity_logs')
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
        .from('productivity_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  static async upsert(data: Omit<ProductivityLogInsert, 'user_id'>, userId: string): Promise<{ data: ProductivityLog | null; error: any }> {
    try {
      const { data: result, error } = await supabase
        .from('productivity_logs')
        .upsert({ ...data, user_id: userId })
        .select()
        .single();

      return { data: result, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getAverageRating(userId: string, days: number = 7): Promise<{ data: number | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('productivity_logs')
        .select('rating')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(days);

      if (error) return { data: null, error };

      if (!data || data.length === 0) return { data: null, error: null };

      const average = data.reduce((sum, log) => sum + log.rating, 0) / data.length;
      return { data: Number(average.toFixed(1)), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getProductivityTrend(userId: string, days: number = 7): Promise<{ data: number[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('productivity_logs')
        .select('rating')
        .eq('user_id', userId)
        .order('date', { ascending: true })
        .limit(days);

      if (error) return { data: null, error };

      const trend = data?.map(log => log.rating) || [];
      return { data: trend, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getTopFactors(userId: string, days: number = 30): Promise<{ data: { factor: string; count: number }[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('productivity_logs')
        .select('factors')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(days);

      if (error) return { data: null, error };

      if (!data) return { data: [], error: null };

      // Count factor occurrences
      const factorCounts: { [key: string]: number } = {};
      data.forEach(log => {
        if (log.factors && Array.isArray(log.factors)) {
          log.factors.forEach((factor: string) => {
            factorCounts[factor] = (factorCounts[factor] || 0) + 1;
          });
        }
      });

      // Convert to array and sort by count
      const topFactors = Object.entries(factorCounts)
        .map(([factor, count]) => ({ factor, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return { data: topFactors, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}
