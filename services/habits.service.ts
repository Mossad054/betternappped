import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type Habit = Database['public']['Tables']['habits']['Row'];
type HabitInsert = Database['public']['Tables']['habits']['Insert'];
type HabitUpdate = Database['public']['Tables']['habits']['Update'];
type HabitLog = Database['public']['Tables']['habit_logs']['Row'];
type HabitLogInsert = Database['public']['Tables']['habit_logs']['Insert'];

export class HabitsService {
  // Habit CRUD operations
  static async create(data: Omit<HabitInsert, 'user_id'>, userId: string): Promise<{ data: Habit | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('habits')
        .insert({ ...data, user_id: userId })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getAll(userId: string): Promise<{ data: Habit[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getById(id: string, userId: string): Promise<{ data: Habit | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async update(
    id: string, 
    data: Omit<HabitUpdate, 'user_id'>, 
    userId: string
  ): Promise<{ data: Habit | null; error: any }> {
    try {
      const { data: updatedData, error } = await supabase
        .from('habits')
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
        .from('habits')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  // Habit Log operations
  static async logHabit(
    habitId: string, 
    data: Omit<HabitLogInsert, 'habit_id' | 'user_id'>, 
    userId: string
  ): Promise<{ data: HabitLog | null; error: any }> {
    try {
      const { data: result, error } = await supabase
        .from('habit_logs')
        .upsert({ ...data, habit_id: habitId, user_id: userId })
        .select()
        .single();

      if (error) return { data: null, error };

      // Update habit streak
      if (data.completed) {
        await this.updateHabitStreak(habitId, userId);
      }

      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getHabitLogs(habitId: string, userId: string): Promise<{ data: HabitLog[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .order('date', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getHabitLogByDate(habitId: string, date: string, userId: string): Promise<{ data: HabitLog | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .eq('date', date)
        .eq('user_id', userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getHabitsWithLogs(userId: string, date?: string): Promise<{ data: any[] | null; error: any }> {
    try {
      let query = supabase
        .from('habits')
        .select(`
          *,
          habit_logs (*)
        `)
        .eq('user_id', userId);

      if (date) {
        query = query.eq('habit_logs.date', date);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async updateHabitStreak(habitId: string, userId: string): Promise<{ error: any }> {
    try {
      // Get current streak from habit_logs
      const { data: logs, error: logsError } = await supabase
        .from('habit_logs')
        .select('date, completed')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .eq('completed', true)
        .order('date', { ascending: false });

      if (logsError) return { error: logsError };

      // Calculate current streak
      let streak = 0;
      const today = new Date();
      
      for (const log of logs || []) {
        const logDate = new Date(log.date);
        const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === streak) {
          streak++;
        } else {
          break;
        }
      }

      // Update habit streak
      const { error } = await supabase
        .from('habits')
        .update({ streak })
        .eq('id', habitId)
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  static async getHabitCompletionRate(habitId: string, userId: string, days: number = 30): Promise<{ data: number | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('completed')
        .eq('habit_id', habitId)
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(days);

      if (error) return { data: null, error };

      if (!data || data.length === 0) return { data: 0, error: null };

      const completed = data.filter(log => log.completed).length;
      const rate = Math.round((completed / data.length) * 100);
      
      return { data: rate, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}
