import { SupabaseSafe } from '@/lib/supabaseSafe';
import { Database } from '@/lib/supabase';
import { isGuestMode, guestDataStore } from '@/lib/guestDataStore';

type MentalClarityTest = Database['public']['Tables']['mental_clarity_tests']['Row'];
type MentalClarityTestInsert = Database['public']['Tables']['mental_clarity_tests']['Insert'];
type MentalClarityTestUpdate = Database['public']['Tables']['mental_clarity_tests']['Update'];

export class MentalClarityService {
  static async create(data: Omit<MentalClarityTestInsert, 'user_id'>, userId: string): Promise<{ data: MentalClarityTest | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.create('mentalClarity', data);
    }
    const result = await SupabaseSafe.insert('mental_clarity_tests', data, userId);
    return { data: result.data, error: result.error };
  }

  static async getAll(userId: string): Promise<{ data: MentalClarityTest[] | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getAll('mentalClarity');
    }
    const result = await SupabaseSafe.select('mental_clarity_tests', { order: { date: 'desc' } }, userId);
    return { data: result.data, error: result.error };
  }

  static async getById(id: string, userId: string): Promise<{ data: MentalClarityTest | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getById('mentalClarity', id);
    }
    const result = await SupabaseSafe.select('mental_clarity_tests', { eq: { id } }, userId);
    return { data: result.data?.[0] || null, error: result.error };
  }

  static async getByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<{ data: MentalClarityTest[] | null; error: any }> {
    const result = await SupabaseSafe.select('mental_clarity_tests', { 
      gte: { date: startDate },
      lte: { date: endDate },
      order: { date: 'asc' }
    }, userId);
    return { data: result.data, error: result.error };
  }

  static async getByDate(userId: string, date: string): Promise<{ data: MentalClarityTest | null; error: any }> {
    const result = await SupabaseSafe.select('mental_clarity_tests', { eq: { date } }, userId);
    return { data: result.data?.[0] || null, error: result.error };
  }

  static async update(
    id: string, 
    data: Omit<MentalClarityTestUpdate, 'user_id'>, 
    userId: string
  ): Promise<{ data: MentalClarityTest | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.update('mentalClarity', id, data);
    }
    const result = await SupabaseSafe.update('mental_clarity_tests', id, data, userId);
    return { data: result.data, error: result.error };
  }

  static async delete(id: string, userId: string): Promise<{ error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.delete('mentalClarity', id);
    }
    const result = await SupabaseSafe.delete('mental_clarity_tests', id, userId);
    return { error: result.error };
  }

  static async upsert(data: Omit<MentalClarityTestInsert, 'user_id'>, userId: string): Promise<{ data: MentalClarityTest | null; error: any }> {
    // For upsert, we'll try to get existing record first, then update or insert
    const existing = await this.getByDate(userId, data.date);
    
    if (existing.data) {
      return await this.update(existing.data.id, data, userId);
    } else {
      return await this.create(data, userId);
    }
  }

  static async getAverageScore(userId: string, days: number = 7): Promise<{ data: number | null; error: any }> {
    const result = await SupabaseSafe.select('mental_clarity_tests', { 
      limit: days,
      order: { date: 'desc' }
    }, userId);

    if (result.error) return { data: null, error: result.error };
    if (!result.data || result.data.length === 0) return { data: null, error: null };

    const average = result.data.reduce((sum, test) => sum + test.score, 0) / result.data.length;
    return { data: Number(average.toFixed(1)), error: null };
  }

  static async getScoreTrend(userId: string, days: number = 7): Promise<{ data: number[] | null; error: any }> {
    const result = await SupabaseSafe.select('mental_clarity_tests', { 
      limit: days,
      order: { date: 'asc' }
    }, userId);

    if (result.error) return { data: null, error: result.error };

    const trend = result.data?.map(test => test.score) || [];
    return { data: trend, error: null };
  }

  static async getTopFactors(userId: string, days: number = 30): Promise<{ data: { factor: string; count: number }[] | null; error: any }> {
    const result = await SupabaseSafe.select('mental_clarity_tests', { 
      limit: days,
      order: { date: 'desc' }
    }, userId);

    if (result.error) return { data: null, error: result.error };
    if (!result.data) return { data: [], error: null };

    // Count factor occurrences
    const factorCounts: { [key: string]: number } = {};
    result.data.forEach(test => {
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
  }
}
