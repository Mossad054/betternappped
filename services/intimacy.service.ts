import { SupabaseSafe } from '@/lib/supabaseSafe';
import { Database } from '@/lib/supabase';
import { isGuestMode, guestDataStore } from '@/lib/guestDataStore';

type IntimacyLog = Database['public']['Tables']['intimacy_logs']['Row'];
type IntimacyLogInsert = Database['public']['Tables']['intimacy_logs']['Insert'];
type IntimacyLogUpdate = Database['public']['Tables']['intimacy_logs']['Update'];

export class IntimacyService {
  static async create(data: Omit<IntimacyLogInsert, 'user_id'>, userId: string): Promise<{ data: IntimacyLog | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.create('intimacy', data);
    }
    const result = await SupabaseSafe.insert('intimacy_logs', data, userId);
    return { data: result.data, error: result.error };
  }

  static async getAll(userId: string): Promise<{ data: IntimacyLog[] | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getAll('intimacy');
    }
    const result = await SupabaseSafe.select('intimacy_logs', { order: { date: 'desc' } }, userId);
    return { data: result.data, error: result.error };
  }

  static async getById(id: string, userId: string): Promise<{ data: IntimacyLog | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getById('intimacy', id);
    }
    const result = await SupabaseSafe.select('intimacy_logs', { eq: { id } }, userId);
    return { data: result.data?.[0] || null, error: result.error };
  }

  static async getByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<{ data: IntimacyLog[] | null; error: any }> {
    const result = await SupabaseSafe.select('intimacy_logs', { 
      gte: { date: startDate },
      lte: { date: endDate },
      order: { date: 'asc' }
    }, userId);
    return { data: result.data, error: result.error };
  }

  static async getByDate(userId: string, date: string): Promise<{ data: IntimacyLog | null; error: any }> {
    const result = await SupabaseSafe.select('intimacy_logs', { eq: { date } }, userId);
    return { data: result.data?.[0] || null, error: result.error };
  }

  static async update(
    id: string, 
    data: Omit<IntimacyLogUpdate, 'user_id'>, 
    userId: string
  ): Promise<{ data: IntimacyLog | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.update('intimacy', id, data);
    }
    const result = await SupabaseSafe.update('intimacy_logs', id, data, userId);
    return { data: result.data, error: result.error };
  }

  static async delete(id: string, userId: string): Promise<{ error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.delete('intimacy', id);
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
}
