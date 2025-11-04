import { SupabaseSafe } from '@/lib/supabaseSafe';
import { Database } from '@/lib/supabase';
import { isGuestMode, guestDataStore } from '@/lib/guestDataStore';

type Habit = Database['public']['Tables']['habits']['Row'];
type HabitInsert = Database['public']['Tables']['habits']['Insert'];
type HabitUpdate = Database['public']['Tables']['habits']['Update'];
type HabitLog = Database['public']['Tables']['habit_logs']['Row'];
type HabitLogInsert = Database['public']['Tables']['habit_logs']['Insert'];
type HabitLogUpdate = Database['public']['Tables']['habit_logs']['Update'];

export class HabitsService {
  // Habit CRUD operations
  static async create(data: Omit<HabitInsert, 'user_id'>, userId: string): Promise<{ data: Habit | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.create('habits', data);
    }
    const result = await SupabaseSafe.insert('habits', data, userId);
    return { data: result.data, error: result.error };
  }

  static async getAll(userId: string): Promise<{ data: Habit[] | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getAll('habits');
    }
    const result = await SupabaseSafe.select('habits', { order: { created_at: 'desc' } }, userId);
    return { data: result.data, error: result.error };
  }

  static async getById(id: string, userId: string): Promise<{ data: Habit | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getById('habits', id);
    }
    const result = await SupabaseSafe.select('habits', { eq: { id } }, userId);
    return { data: result.data?.[0] || null, error: result.error };
  }

  static async update(
    id: string, 
    data: Omit<HabitUpdate, 'user_id'>, 
    userId: string
  ): Promise<{ data: Habit | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.update('habits', id, data);
    }
    const result = await SupabaseSafe.update('habits', id, data, userId);
    return { data: result.data, error: result.error };
  }

  static async delete(id: string, userId: string): Promise<{ error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.delete('habits', id);
    }
    const result = await SupabaseSafe.delete('habits', id, userId);
    return { error: result.error };
  }

  // Habit Log operations
  static async logHabit(
    habitId: string, 
    data: Omit<HabitLogInsert, 'habit_id' | 'user_id'>, 
    userId: string
  ): Promise<{ data: HabitLog | null; error: any }> {
    if (await isGuestMode()) {
      const result = await guestDataStore.create('habits', { ...data, habit_id: habitId });
      if (data.completed) {
        await this.updateHabitStreak(habitId, userId);
      }
      return result;
    }
    
    // Check if a log exists for today
    const today = new Date().toISOString().split('T')[0];
    const existingLog = await SupabaseSafe.select('habit_logs', {
      eq: { habit_id: habitId, date: today }
    }, userId);

    if (existingLog.data?.[0]) {
      // Update existing log
      const result = await SupabaseSafe.update(
        'habit_logs',
        existingLog.data[0].id,
        { ...data },
        userId
      );
      
      if (result.error) return { data: null, error: result.error };
      
      // Update habit streak if completed
      if (data.completed) {
        await this.updateHabitStreak(habitId, userId);
      }

      return { data: result.data, error: null };
    } else {
      // Create new log
      const result = await SupabaseSafe.insert('habit_logs', { 
        ...data, 
        habit_id: habitId,
        date: today
      }, userId);
      
      if (result.error) return { data: null, error: result.error };

      // Update habit streak if completed
      if (data.completed) {
        await this.updateHabitStreak(habitId, userId);
      }

      return { data: result.data, error: null };
    }
  }

  static async getHabitLogs(habitId: string, userId: string): Promise<{ data: HabitLog[] | null; error: any }> {
    if (await isGuestMode()) {
      // For guest mode, we'll return empty array as habit logs are stored differently
      return { data: [], error: null };
    }
    const result = await SupabaseSafe.select('habit_logs', { 
      eq: { habit_id: habitId },
      order: { date: 'desc' }
    }, userId);
    return { data: result.data, error: result.error };
  }

  static async getHabitLogByDate(habitId: string, date: string, userId: string): Promise<{ data: HabitLog | null; error: any }> {
    if (await isGuestMode()) {
      // For guest mode, return null as habit logs are stored differently
      return { data: null, error: null };
    }
    const result = await SupabaseSafe.select('habit_logs', { 
      eq: { habit_id: habitId, date }
    }, userId);
    return { data: result.data?.[0] || null, error: result.error };
  }

  static async getHabitsWithLogs(userId: string, date?: string): Promise<{ data: any[] | null; error: any }> {
    if (await isGuestMode()) {
      const habitsResult = await guestDataStore.getAll('habits');
      if (habitsResult.error) return { data: null, error: habitsResult.error };
      
      const habits = habitsResult.data || [];
      const habitsWithLogs = habits.map(habit => ({
        ...habit,
        habit_logs: [] // Guest mode doesn't store separate habit logs
      }));
      
      return { data: habitsWithLogs, error: null };
    }
    
    // This is a complex query that joins habits with habit_logs
    // For now, we'll get habits and logs separately and combine them
    const habitsResult = await SupabaseSafe.select('habits', {}, userId);
    if (habitsResult.error) return { data: null, error: habitsResult.error };

    const habits = habitsResult.data || [];
    const habitsWithLogs = [];

    for (const habit of habits) {
      const logsResult = await SupabaseSafe.select('habit_logs', { 
        eq: { habit_id: habit.id },
        ...(date && { eq: { date } })
      }, userId);
      
      habitsWithLogs.push({
        ...habit,
        habit_logs: logsResult.data || []
      });
    }

    return { data: habitsWithLogs, error: null };
  }

  static async updateHabitStreak(habitId: string, userId: string): Promise<{ error: any }> {
    if (await isGuestMode()) {
      // For guest mode, we'll update the streak in the habit directly
      const habitResult = await guestDataStore.getById('habits', habitId);
      if (habitResult.data) {
        const newStreak = (habitResult.data.streak || 0) + 1;
        await guestDataStore.update('habits', habitId, { streak: newStreak });
      }
      return { error: null };
    }
    
    // Get completed habit logs
    const logsResult = await SupabaseSafe.select('habit_logs', {
      eq: { habit_id: habitId, completed: true },
      order: { date: 'desc' }
    }, userId);

    if (logsResult.error) return { error: logsResult.error };

    // Calculate current streak - count consecutive days from today backward
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create a map of log dates for quick lookup
    const logDates = new Set(
      (logsResult.data || []).map(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime();
      })
    );
    
    // Check consecutive days from today backward
    let checkDate = new Date(today);
    while (logDates.has(checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1); // Go to previous day
    }

    // Update habit streak
    const updateResult = await SupabaseSafe.update('habits', habitId, { streak }, userId);
    return { error: updateResult.error };
  }

  static async getHabitCompletionRate(habitId: string, userId: string, days: number = 30): Promise<{ data: number | null; error: any }> {
    if (await isGuestMode()) {
      // For guest mode, return a mock completion rate based on streak
      const habitResult = await guestDataStore.getById('habits', habitId);
      if (habitResult.data) {
        const streak = habitResult.data.streak || 0;
        const rate = Math.min(Math.round((streak / days) * 100), 100);
        return { data: rate, error: null };
      }
      return { data: 0, error: null };
    }
    
    const result = await SupabaseSafe.select('habit_logs', {
      eq: { habit_id: habitId },
      limit: days,
      order: { date: 'desc' }
    }, userId);

    if (result.error) return { data: null, error: result.error };
    if (!result.data || result.data.length === 0) return { data: 0, error: null };

    const completed = result.data.filter(log => log.completed).length;
    const rate = Math.round((completed / result.data.length) * 100);
    
    return { data: rate, error: null };
  }

  /**
   * Get all habit logs for a user within a date range
   * Used for correlation analysis with wellness metrics
   */
  static async getHabitLogsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<{ data: HabitLog[] | null; error: any }> {
    if (await isGuestMode()) {
      // For guest mode, return empty array
      return { data: [], error: null };
    }

    try {
      const result = await SupabaseSafe.select('habit_logs', {
        eq: { user_id: userId },
        gte: { date: startDate },
        lte: { date: endDate },
        order: { date: 'desc' }
      }, userId);

      return { data: result.data || [], error: result.error };
    } catch (error) {
      console.error('Error fetching habit logs by date range:', error);
      return { data: null, error };
    }
  }
}
