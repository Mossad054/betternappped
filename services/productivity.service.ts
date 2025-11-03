import { SupabaseSafe } from '@/lib/supabaseSafe';
import { Database } from '@/lib/supabase';
import { isGuestMode, guestDataStore } from '@/lib/guestDataStore';

type ProductivityLog = Database['public']['Tables']['productivity_logs']['Row'];
type ProductivityLogInsert = Database['public']['Tables']['productivity_logs']['Insert'];
type ProductivityLogUpdate = Database['public']['Tables']['productivity_logs']['Update'];

export class ProductivityService {
  static async create(data: Omit<ProductivityLogInsert, 'user_id'>, userId: string): Promise<{ data: ProductivityLog | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.create('productivity', data);
    }
    const result = await SupabaseSafe.insert('productivity_logs', data, userId);
    return { data: result.data, error: result.error };
  }

  static async getAll(userId: string): Promise<{ data: ProductivityLog[] | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getAll('productivity');
    }
    const result = await SupabaseSafe.select('productivity_logs', { order: { date: 'desc' } }, userId);
    return { data: result.data, error: result.error };
  }

  static async getById(id: string, userId: string): Promise<{ data: ProductivityLog | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getById('productivity', id);
    }
    const result = await SupabaseSafe.select('productivity_logs', { eq: { id } }, userId);
    return { data: result.data?.[0] || null, error: result.error };
  }

  static async getByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<{ data: ProductivityLog[] | null; error: any }> {
    const result = await SupabaseSafe.select('productivity_logs', { 
      gte: { date: startDate },
      lte: { date: endDate },
      order: { date: 'asc' }
    }, userId);
    return { data: result.data, error: result.error };
  }

  static async getByDate(userId: string, date: string): Promise<{ data: ProductivityLog | null; error: any }> {
    const result = await SupabaseSafe.select('productivity_logs', { eq: { date } }, userId);
    return { data: result.data?.[0] || null, error: result.error };
  }

  static async update(
    id: string, 
    data: Omit<ProductivityLogUpdate, 'user_id'>, 
    userId: string
  ): Promise<{ data: ProductivityLog | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.update('productivity', id, data);
    }
    const result = await SupabaseSafe.update('productivity_logs', id, data, userId);
    return { data: result.data, error: result.error };
  }

  static async delete(id: string, userId: string): Promise<{ error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.delete('productivity', id);
    }
    const result = await SupabaseSafe.delete('productivity_logs', id, userId);
    return { error: result.error };
  }

  static async upsert(data: Omit<ProductivityLogInsert, 'user_id'>, userId: string): Promise<{ data: ProductivityLog | null; error: any }> {
    // For upsert, we'll try to get existing record first, then update or insert
    const existing = await this.getByDate(userId, data.date);
    
    if (existing.data) {
      return await this.update(existing.data.id, data, userId);
    } else {
      return await this.create(data, userId);
    }
  }

  static async getAverageRating(userId: string, days: number = 7): Promise<{ data: number | null; error: any }> {
    const result = await SupabaseSafe.select('productivity_logs', { 
      limit: days,
      order: { date: 'desc' }
    }, userId);

    if (result.error) return { data: null, error: result.error };
    if (!result.data || result.data.length === 0) return { data: null, error: null };

    const average = result.data.reduce((sum, log) => sum + log.rating, 0) / result.data.length;
    return { data: Number(average.toFixed(1)), error: null };
  }

  static async getProductivityTrend(userId: string, days: number = 7): Promise<{ data: number[] | null; error: any }> {
    const result = await SupabaseSafe.select('productivity_logs', { 
      limit: days,
      order: { date: 'asc' }
    }, userId);

    if (result.error) return { data: null, error: result.error };

    const trend = result.data?.map(log => log.rating) || [];
    return { data: trend, error: null };
  }

  static async getTopFactors(userId: string, days: number = 30): Promise<{ data: { factor: string; count: number }[] | null; error: any }> {
    const result = await SupabaseSafe.select('productivity_logs', { 
      limit: days,
      order: { date: 'desc' }
    }, userId);

    if (result.error) return { data: null, error: result.error };
    if (!result.data) return { data: [], error: null };

    // Count factor occurrences
    const factorCounts: { [key: string]: number } = {};
    result.data.forEach(log => {
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
  }
}
