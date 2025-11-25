import { SupabaseSafe } from '@/lib/supabaseSafe';
import { Database } from '@/lib/supabase';
import { isGuestMode, guestDataStore } from '@/lib/guestDataStore';

type MoodLog = Database['public']['Tables']['mood_logs']['Row'];
type MoodLogInsert = Database['public']['Tables']['mood_logs']['Insert'];
type MoodLogUpdate = Database['public']['Tables']['mood_logs']['Update'];

export interface MoodLogWithUser extends MoodLog {
  user_id: string;
}

export class MoodsService {
  static async create(moodData: Omit<MoodLogInsert, 'user_id'>, userId: string): Promise<{ data: MoodLog | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.create('moods', moodData);
    }
    const result = await SupabaseSafe.insert('mood_logs', moodData, userId);
    return { data: result.data, error: result.error };
  }

  static async getAll(userId: string): Promise<{ data: MoodLog[] | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getAll('moods');
    }
    const result = await SupabaseSafe.select('mood_logs', { order: { date: 'desc' } }, userId);
    return { data: result.data, error: result.error };
  }

  static async getById(id: string, userId: string): Promise<{ data: MoodLog | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getById('moods', id);
    }
    const result = await SupabaseSafe.select('mood_logs', { eq: { id } }, userId);
    return { data: result.data?.[0] || null, error: result.error };
  }

  static async getByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<{ data: MoodLog[] | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getByDateRange('moods', startDate, endDate);
    }
    const result = await SupabaseSafe.select('mood_logs', { 
      gte: { date: startDate },
      lte: { date: endDate },
      order: { date: 'asc' }
    }, userId);
    return { data: result.data, error: result.error };
  }

  static async getByDate(userId: string, date: string): Promise<{ data: MoodLog | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getByDate('moods', date);
    }
    const result = await SupabaseSafe.select('mood_logs', { eq: { date } }, userId);
    return { data: result.data?.[0] || null, error: result.error };
  }

  static async update(
    id: string, 
    data: Omit<MoodLogUpdate, 'user_id'>, 
    userId: string
  ): Promise<{ data: MoodLog | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.update('moods', id, data);
    }
    const result = await SupabaseSafe.update('mood_logs', id, data, userId);
    return { data: result.data, error: result.error };
  }

  static async delete(id: string, userId: string): Promise<{ error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.delete('moods', id);
    }
    const result = await SupabaseSafe.delete('mood_logs', id, userId);
    return { error: result.error };
  }

  static async upsert(data: Omit<MoodLogInsert, 'user_id'>, userId: string): Promise<{ data: MoodLog | null; error: any }> {
    // For upsert, we'll try to get existing record first, then update or insert
    const existing = await this.getByDate(userId, data.date);
    
    if (existing.data) {
      return await this.update(existing.data.id, data, userId);
    } else {
      return await this.create(data, userId);
    }
  }
}
