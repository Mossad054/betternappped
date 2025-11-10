import { SupabaseSafe } from '@/lib/supabaseSafe';
import { Database } from '@/lib/supabase';
import { isGuestMode, guestDataStore } from '@/lib/guestDataStore';

type Activity = Database['public']['Tables']['activities']['Row'];
type ActivityInsert = Database['public']['Tables']['activities']['Insert'];
type ActivityUpdate = Database['public']['Tables']['activities']['Update'];

export class ActivitiesService {
  static async create(activityData: Omit<ActivityInsert, 'user_id'>, userId: string): Promise<{ data: Activity | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.create('activities', activityData);
    }
    const result = await SupabaseSafe.insert('activities', activityData, userId);
    return { data: result.data, error: result.error };
  }

  static async createMany(activities: Omit<ActivityInsert, 'user_id'>[], userId: string): Promise<{ data: Activity[] | null; error: any }> {
    if (await isGuestMode()) {
      const results = await Promise.all(
        activities.map(activity => guestDataStore.create('activities', activity))
      );
      
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        return { data: null, error: errors[0].error };
      }
      
      const data = results.map(r => r.data).filter(Boolean);
      return { data, error: null };
    }
    
    const results = await Promise.all(
      activities.map(activity => SupabaseSafe.insert('activities', activity, userId))
    );
    
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      return { data: null, error: errors[0].error };
    }
    
    const data = results.map(r => r.data).filter(Boolean);
    return { data, error: null };
  }

  static async getAll(userId: string): Promise<{ data: Activity[] | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getAll('activities');
    }
    const result = await SupabaseSafe.select('activities', { order: { date: 'desc' } }, userId);
    return { data: result.data, error: result.error };
  }

  static async getById(id: string, userId: string): Promise<{ data: Activity | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getById('activities', id);
    }
    const result = await SupabaseSafe.select('activities', { eq: { id } }, userId);
    return { data: result.data?.[0] || null, error: result.error };
  }

  static async getByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<{ data: Activity[] | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getByDateRange('activities', startDate, endDate);
    }
    const result = await SupabaseSafe.select('activities', { 
      gte: { date: startDate },
      lte: { date: endDate },
      order: { date: 'asc' }
    }, userId);
    return { data: result.data, error: result.error };
  }

  static async getByDate(userId: string, date: string): Promise<{ data: Activity[] | null; error: any }> {
    if (await isGuestMode()) {
      const allActivities = await guestDataStore.getAll('activities');
      if (allActivities.error) return { data: null, error: allActivities.error };
      const filtered = allActivities.data?.filter(activity => activity.date === date) || [];
      return { data: filtered, error: null };
    }
    const result = await SupabaseSafe.select('activities', { 
      eq: { date },
      order: { created_at: 'asc' }
    }, userId);
    return { data: result.data, error: result.error };
  }

  static async getByCategory(userId: string, category: string): Promise<{ data: Activity[] | null; error: any }> {
    if (await isGuestMode()) {
      const allActivities = await guestDataStore.getAll('activities');
      if (allActivities.error) return { data: null, error: allActivities.error };
      const filtered = allActivities.data?.filter(activity => activity.category === category) || [];
      return { data: filtered, error: null };
    }
    const result = await SupabaseSafe.select('activities', { 
      eq: { category },
      order: { date: 'desc' }
    }, userId);
    return { data: result.data, error: result.error };
  }

  static async update(
    id: string, 
    data: Omit<ActivityUpdate, 'user_id'>, 
    userId: string
  ): Promise<{ data: Activity | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.update('activities', id, data);
    }
    const result = await SupabaseSafe.update('activities', id, data, userId);
    return { data: result.data, error: result.error };
  }

  static async delete(id: string, userId: string): Promise<{ error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.delete('activities', id);
    }
    const result = await SupabaseSafe.delete('activities', id, userId);
    return { error: result.error };
  }

  static async deleteByDate(userId: string, date: string): Promise<{ error: any }> {
    // Get all activities for the date first, then delete them
    const activities = await this.getByDate(userId, date);
    if (activities.error) return { error: activities.error };
    
    if (activities.data && activities.data.length > 0) {
      const deletePromises = activities.data.map(activity => 
        SupabaseSafe.delete('activities', activity.id, userId)
      );
      await Promise.all(deletePromises);
    }
    
    return { error: null };
  }

  // Upsert activity (check for existing activity by date+name, update if exists, insert if not)
  static async upsert(
    activityData: Omit<ActivityInsert, 'user_id'>,
    userId: string
  ): Promise<{ data: Activity | null; error: any }> {
    // Check if activity with same name exists for this date
    const existing = await this.getByDate(userId, activityData.date);
    
    if (existing.error) return { data: null, error: existing.error };
    
    // Find activity with same name and category
    const duplicateActivity = existing.data?.find(
      activity => activity.name === activityData.name && activity.category === activityData.category
    );
    
    if (duplicateActivity) {
      // Update existing activity instead of creating duplicate
      return await this.update(duplicateActivity.id, activityData, userId);
    } else {
      // Create new activity
      return await this.create(activityData, userId);
    }
  }

  // Upsert multiple activities (useful for batch operations)
  static async upsertMany(
    activities: Omit<ActivityInsert, 'user_id'>[],
    userId: string
  ): Promise<{ data: Activity[] | null; error: any }> {
    const results = await Promise.all(
      activities.map(activity => this.upsert(activity, userId))
    );
    
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      return { data: null, error: errors[0].error };
    }
    
    const data = results.map(r => r.data).filter(Boolean) as Activity[];
    return { data, error: null };
  }
}
