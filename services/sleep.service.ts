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
      order: { date: 'desc' }  // Changed to desc to get most recent first
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

  // Calculate actual sleep duration from bedtime and wake time
  static calculateSleepDuration(bedtime: string, wakeTime: string): number {
    if (!bedtime || !wakeTime) return 0;

    try {
      // Parse times
      const [bedHour, bedMin] = bedtime.split(':').map(Number);
      const [wakeHour, wakeMin] = wakeTime.split(':').map(Number);

      // Convert to minutes since midnight
      let bedMinutes = bedHour * 60 + bedMin;
      let wakeMinutes = wakeHour * 60 + wakeMin;

      // Handle midnight crossing (bedtime before midnight, wake after)
      if (wakeMinutes < bedMinutes) {
        wakeMinutes += 24 * 60; // Add 24 hours
      }

      const durationMinutes = wakeMinutes - bedMinutes;
      const durationHours = durationMinutes / 60;

      return Number(durationHours.toFixed(1));
    } catch (error) {
      console.error('Error calculating sleep duration:', error);
      return 0;
    }
  }

  // Get last night's sleep with calculated duration
  static async getLastNightSleep(userId: string): Promise<{ data: any | null; error: any }> {
    if (await isGuestMode()) {
      const result = await guestDataStore.getAll('sleep');
      const lastSleep = result.data?.[0] || null;
      if (lastSleep && lastSleep.bedtime && lastSleep.wake_time) {
        lastSleep.calculatedHours = this.calculateSleepDuration(lastSleep.bedtime, lastSleep.wake_time);
      }
      return { data: lastSleep, error: null };
    }

    const result = await SupabaseSafe.select('sleep_logs', {
      limit: 1,
      order: { date: 'desc' }
    }, userId);

    if (result.error) return { data: null, error: result.error };

    const lastSleep = result.data?.[0] || null;
    if (lastSleep && lastSleep.bedtime && lastSleep.wake_time) {
      lastSleep.calculatedHours = this.calculateSleepDuration(lastSleep.bedtime, lastSleep.wake_time);
    }

    return { data: lastSleep, error: null };
  }

  // Get comprehensive sleep analytics
  static async getSleepAnalytics(userId: string, days: number = 30): Promise<{ data: any | null; error: any }> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const result = await this.getByDateRange(userId, startDate, endDate);
    if (result.error) return { data: null, error: result.error };

    const logs = result.data || [];
    if (logs.length === 0) {
      return {
        data: {
          avgDuration: 0,
          avgQuality: 0,
          efficiency: 0,
          consistency: 0,
          optimalBedtime: null,
          trend: [],
          weeklyAvg: 0,
          monthlyAvg: 0
        },
        error: null
      };
    }

    // Calculate average duration (using calculated hours when available)
    const durations = logs.map(log => {
      if (log.bedtime && log.wake_time) {
        return this.calculateSleepDuration(log.bedtime, log.wake_time);
      }
      return Number(log.hours) || 0;
    });
    const avgDuration = durations.reduce((sum, h) => sum + h, 0) / durations.length;

    // Calculate average quality
    const qualities = logs.filter(log => log.quality).map(log => Number(log.quality));
    const avgQuality = qualities.length > 0
      ? qualities.reduce((sum, q) => sum + q, 0) / qualities.length
      : 0;

    // Calculate sleep efficiency (actual sleep / time in bed)
    let totalEfficiency = 0;
    let efficiencyCount = 0;
    logs.forEach(log => {
      if (log.bedtime && log.wake_time && log.hours) {
        const timeInBed = this.calculateSleepDuration(log.bedtime, log.wake_time);
        if (timeInBed > 0) {
          const efficiency = (Number(log.hours) / timeInBed) * 100;
          totalEfficiency += Math.min(efficiency, 100);
          efficiencyCount++;
        }
      }
    });
    const efficiency = efficiencyCount > 0 ? totalEfficiency / efficiencyCount : 0;

    // Calculate bedtime consistency
    const bedtimes = logs
      .filter(log => log.bedtime)
      .map(log => {
        const [h, m] = log.bedtime.split(':').map(Number);
        return h * 60 + m;
      });

    let consistency = 0;
    if (bedtimes.length > 1) {
      const avgBedtime = bedtimes.reduce((sum, t) => sum + t, 0) / bedtimes.length;
      const variance = bedtimes.reduce((sum, t) => sum + Math.pow(t - avgBedtime, 2), 0) / bedtimes.length;
      const stdDev = Math.sqrt(variance);
      // Convert to 0-100 score (lower variance = higher consistency)
      consistency = Math.max(0, 100 - (stdDev / 30) * 100);
    }

    // Calculate optimal bedtime (time that correlates with best quality sleep)
    let optimalBedtime = null;
    if (logs.length >= 7) {
      const bedtimeQuality = logs
        .filter(log => log.bedtime && log.quality)
        .map(log => ({
          bedtime: log.bedtime,
          quality: Number(log.quality)
        }))
        .sort((a, b) => b.quality - a.quality);

      if (bedtimeQuality.length > 0) {
        // Get average of top 3 quality nights' bedtimes
        const topBedtimes = bedtimeQuality.slice(0, 3).map(item => {
          const [h, m] = item.bedtime.split(':').map(Number);
          return h * 60 + m;
        });
        const avgOptimal = topBedtimes.reduce((sum, t) => sum + t, 0) / topBedtimes.length;
        const optimalHour = Math.floor(avgOptimal / 60);
        const optimalMin = Math.round(avgOptimal % 60);
        optimalBedtime = `${optimalHour.toString().padStart(2, '0')}:${optimalMin.toString().padStart(2, '0')}`;
      }
    }

    // Create trend data
    const trend = logs.map(log => ({
      date: log.date,
      hours: log.bedtime && log.wake_time
        ? this.calculateSleepDuration(log.bedtime, log.wake_time)
        : Number(log.hours) || 0,
      quality: Number(log.quality) || 0
    })).reverse(); // Oldest first for charts

    // Weekly and monthly averages
    const last7 = durations.slice(0, 7);
    const weeklyAvg = last7.length > 0
      ? last7.reduce((sum, h) => sum + h, 0) / last7.length
      : 0;
    const monthlyAvg = avgDuration;

    return {
      data: {
        avgDuration: Number(avgDuration.toFixed(1)),
        avgQuality: Number(avgQuality.toFixed(1)),
        efficiency: Number(efficiency.toFixed(0)),
        consistency: Number(consistency.toFixed(0)),
        optimalBedtime,
        trend,
        weeklyAvg: Number(weeklyAvg.toFixed(1)),
        monthlyAvg: Number(monthlyAvg.toFixed(1)),
        totalLogs: logs.length
      },
      error: null
    };
  }

  // Generate personalized recommendations based on sleep data
  static async getRecommendations(userId: string): Promise<{ data: any[] | null; error: any }> {
    const analyticsResult = await this.getSleepAnalytics(userId, 14);
    if (analyticsResult.error) return { data: null, error: analyticsResult.error };

    const analytics = analyticsResult.data;
    const recommendations = [];

    // Poor sleep duration recommendations
    if (analytics.avgDuration < 7) {
      recommendations.push({
        id: 'duration',
        type: 'sleep',
        title: 'Increase Sleep Duration',
        description: analytics.avgDuration < 6
          ? `You're averaging ${analytics.avgDuration}h. Try going to bed 1-2 hours earlier to reach 7-9 hours.`
          : `You're averaging ${analytics.avgDuration}h. Try going to bed 30-60 minutes earlier.`,
        priority: analytics.avgDuration < 6 ? 'high' : 'medium',
        action: 'Set a bedtime reminder'
      });
    }

    // Poor efficiency recommendations
    if (analytics.efficiency < 85) {
      recommendations.push({
        id: 'efficiency',
        type: 'sleep',
        title: 'Improve Sleep Efficiency',
        description: `Your sleep efficiency is ${analytics.efficiency}%. Try only going to bed when sleepy and avoiding screens 1 hour before bed.`,
        priority: analytics.efficiency < 75 ? 'high' : 'medium',
        action: 'Create a wind-down routine'
      });
    }

    // Inconsistent bedtime recommendations
    if (analytics.consistency < 70) {
      recommendations.push({
        id: 'consistency',
        type: 'sleep',
        title: 'Maintain Consistent Bedtime',
        description: `Your bedtime consistency is ${analytics.consistency}%. Try going to bed at the same time daily, even on weekends.`,
        priority: analytics.consistency < 50 ? 'high' : 'medium',
        action: 'Set a consistent bedtime alarm'
      });
    }

    // Optimal bedtime recommendation
    if (analytics.optimalBedtime) {
      recommendations.push({
        id: 'optimal',
        type: 'sleep',
        title: 'Your Optimal Bedtime',
        description: `Based on your best sleep quality nights, your optimal bedtime is around ${analytics.optimalBedtime}.`,
        priority: 'low',
        action: 'Try this bedtime tonight'
      });
    }

    // Quality recommendations
    if (analytics.avgQuality < 3) {
      recommendations.push({
        id: 'quality',
        type: 'sleep',
        title: 'Improve Sleep Quality',
        description: 'Your sleep quality is below average. Consider optimizing your sleep environment: keep room cool, dark, and quiet.',
        priority: 'high',
        action: 'Review sleep environment'
      });
    }

    // Default recommendation if no issues
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'maintain',
        type: 'sleep',
        title: 'Great Sleep Habits!',
        description: 'You\'re maintaining good sleep patterns. Keep up the consistency for optimal wellness.',
        priority: 'low',
        action: 'Continue current routine'
      });
    }

    return { data: recommendations, error: null };
  }
}
