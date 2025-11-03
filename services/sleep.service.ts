import { SupabaseSafe } from '@/lib/supabaseSafe';
import { Database } from '@/lib/supabase';
import { isGuestMode, guestDataStore } from '@/lib/guestDataStore';

type SleepLog = Database['public']['Tables']['sleep_logs']['Row'];
type SleepLogInsert = Database['public']['Tables']['sleep_logs']['Insert'];
type SleepLogUpdate = Database['public']['Tables']['sleep_logs']['Update'];

export class SleepService {
  static async create(data: Omit<SleepLogInsert, 'user_id'>, userId: string): Promise<{ data: SleepLog | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.create('sleep', data);
    }
    const result = await SupabaseSafe.insert('sleep_logs', data, userId);
    return { data: result.data, error: result.error };
  }

  static async getAll(userId: string): Promise<{ data: SleepLog[] | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getAll('sleep');
    }
    const result = await SupabaseSafe.select('sleep_logs', { order: { date: 'desc' } }, userId);
    return { data: result.data, error: result.error };
  }

  static async getById(id: string, userId: string): Promise<{ data: SleepLog | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getById('sleep', id);
    }
    const result = await SupabaseSafe.select('sleep_logs', { eq: { id } }, userId);
    return { data: result.data?.[0] || null, error: result.error };
  }

  static async getByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<{ data: SleepLog[] | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getByDateRange('sleep', startDate, endDate);
    }
    const result = await SupabaseSafe.select('sleep_logs', { 
      gte: { date: startDate },
      lte: { date: endDate },
      order: { date: 'asc' }
    }, userId);
    return { data: result.data, error: result.error };
  }

  static async getByDate(userId: string, date: string): Promise<{ data: SleepLog | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getByDate('sleep', date);
    }
    const result = await SupabaseSafe.select('sleep_logs', { eq: { date } }, userId);
    return { data: result.data?.[0] || null, error: result.error };
  }

  static async update(
    id: string, 
    data: Omit<SleepLogUpdate, 'user_id'>, 
    userId: string
  ): Promise<{ data: SleepLog | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.update('sleep', id, data);
    }
    const result = await SupabaseSafe.update('sleep_logs', id, data, userId);
    return { data: result.data, error: result.error };
  }

  static async delete(id: string, userId: string): Promise<{ error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.delete('sleep', id);
    }
    const result = await SupabaseSafe.delete('sleep_logs', id, userId);
    return { error: result.error };
  }

  static async upsert(data: Omit<SleepLogInsert, 'user_id'>, userId: string): Promise<{ data: SleepLog | null; error: any }> {
    // For upsert, we'll try to get existing record first, then update or insert
    const existing = await this.getByDate(userId, data.date);
    
    if (existing.data) {
      return await this.update(existing.data.id, data, userId);
    } else {
      return await this.create(data, userId);
    }
  }

  static async getAverageHours(userId: string, days: number = 7): Promise<{ data: number | null; error: any }> {
    const result = await SupabaseSafe.select('sleep_logs', { 
      limit: days,
      order: { date: 'desc' }
    }, userId);

    if (result.error) return { data: null, error: result.error };
    if (!result.data || result.data.length === 0) return { data: null, error: null };

    const average = result.data.reduce((sum, log) => sum + Number(log.hours), 0) / result.data.length;
    return { data: Number(average.toFixed(1)), error: null };
  }

  static async getQualityTrend(userId: string, days: number = 7): Promise<{ data: number[] | null; error: any }> {
    const result = await SupabaseSafe.select('sleep_logs', { 
      limit: days,
      order: { date: 'asc' }
    }, userId);

    if (result.error) return { data: null, error: result.error };

    const trend = result.data?.map(log => log.quality) || [];
    return { data: trend, error: null };
  }
}
