import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type MentalClarityTest = Database['public']['Tables']['mental_clarity_tests']['Row'];
type MentalClarityTestInsert = Database['public']['Tables']['mental_clarity_tests']['Insert'];
type MentalClarityTestUpdate = Database['public']['Tables']['mental_clarity_tests']['Update'];

export class MentalClarityService {
  static async create(data: Omit<MentalClarityTestInsert, 'user_id'>, userId: string): Promise<{ data: MentalClarityTest | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('mental_clarity_tests')
        .insert({ ...data, user_id: userId })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getAll(userId: string): Promise<{ data: MentalClarityTest[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('mental_clarity_tests')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getById(id: string, userId: string): Promise<{ data: MentalClarityTest | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('mental_clarity_tests')
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
  ): Promise<{ data: MentalClarityTest[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('mental_clarity_tests')
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

  static async getByDate(userId: string, date: string): Promise<{ data: MentalClarityTest | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('mental_clarity_tests')
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
    data: Omit<MentalClarityTestUpdate, 'user_id'>, 
    userId: string
  ): Promise<{ data: MentalClarityTest | null; error: any }> {
    try {
      const { data: updatedData, error } = await supabase
        .from('mental_clarity_tests')
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
        .from('mental_clarity_tests')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  static async upsert(data: Omit<MentalClarityTestInsert, 'user_id'>, userId: string): Promise<{ data: MentalClarityTest | null; error: any }> {
    try {
      const { data: result, error } = await supabase
        .from('mental_clarity_tests')
        .upsert({ ...data, user_id: userId })
        .select()
        .single();

      return { data: result, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getAverageScore(userId: string, days: number = 7): Promise<{ data: number | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('mental_clarity_tests')
        .select('score')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(days);

      if (error) return { data: null, error };

      if (!data || data.length === 0) return { data: null, error: null };

      const average = data.reduce((sum, test) => sum + test.score, 0) / data.length;
      return { data: Number(average.toFixed(1)), error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getScoreTrend(userId: string, days: number = 7): Promise<{ data: number[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('mental_clarity_tests')
        .select('score')
        .eq('user_id', userId)
        .order('date', { ascending: true })
        .limit(days);

      if (error) return { data: null, error };

      const trend = data?.map(test => test.score) || [];
      return { data: trend, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getTopFactors(userId: string, days: number = 30): Promise<{ data: { factor: string; count: number }[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('mental_clarity_tests')
        .select('factors')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(days);

      if (error) return { data: null, error };

      if (!data) return { data: [], error: null };

      // Count factor occurrences
      const factorCounts: { [key: string]: number } = {};
      data.forEach(test => {
        if (test.factors && Array.isArray(test.factors)) {
          test.factors.forEach((factor: string) => {
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
