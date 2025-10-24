import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type Activity = Database['public']['Tables']['activities']['Row'];
type ActivityInsert = Database['public']['Tables']['activities']['Insert'];
type ActivityUpdate = Database['public']['Tables']['activities']['Update'];

export class ActivitiesService {
  static async create(activityData: Omit<ActivityInsert, 'user_id'>, userId: string): Promise<{ data: Activity | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert({ ...activityData, user_id: userId })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async createMany(activities: Omit<ActivityInsert, 'user_id'>[], userId: string): Promise<{ data: Activity[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .insert(activities.map(activity => ({ ...activity, user_id: userId })))
        .select();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getAll(userId: string): Promise<{ data: Activity[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getById(id: string, userId: string): Promise<{ data: Activity | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('activities')
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
  ): Promise<{ data: Activity[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('activities')
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

  static async getByDate(userId: string, date: string): Promise<{ data: Activity[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('created_at', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getByCategory(userId: string, category: string): Promise<{ data: Activity[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .order('date', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async update(
    id: string, 
    data: Omit<ActivityUpdate, 'user_id'>, 
    userId: string
  ): Promise<{ data: Activity | null; error: any }> {
    try {
      const { data: updatedData, error } = await supabase
        .from('activities')
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
        .from('activities')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  static async deleteByDate(userId: string, date: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('user_id', userId)
        .eq('date', date);

      return { error };
    } catch (error) {
      return { error };
    }
  }
}
