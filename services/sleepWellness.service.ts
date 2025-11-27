import { SupabaseSafe } from '@/lib/supabaseSafe';
import { supabase } from '@/lib/supabase';
import { isGuestMode } from '@/lib/guestDataStore';

/**
 * SleepWellnessService
 *
 * Comprehensive service for Sleep Wellness Hub analytics and recommendations.
 * Provides all backend logic for dynamic, database-driven sleep insights.
 */

// =====================================================
// TYPE DEFINITIONS
// =====================================================

export interface LastNightSummary {
  target_hours: number;
  window_days: number;
  last_night_hours: number | null;
  last_night_date: string | null;
  nights_meeting_target: number;
  nights_total: number;
  meets_all_nights: boolean;
  message: string;
}

export interface WeeklyOverviewDay {
  date: string;
  hours_slept: number | null;
  sleep_quality: number | null;
  habits_completed: {
    habit_id: string;
    habit_name: string;
    type: string;
    completed: boolean;
  }[];
}

export interface ThisWeekSummary {
  week_start: string;
  week_end: string;
  average_sleep_hours: number;
  target_hours: number;
  nights_target_met: number;
  nights_total: number;
  percent_target_achievement: number;
}

export interface SleepDurationTrend {
  date: string;
  hours: number;
  quality: number | null;
}

export interface ConsistencySummary {
  consistency_percent: number;
  avg_bedtime_variance_minutes: number;
  days_analyzed: number;
}

export interface WeekdayWeekendComparison {
  weekday_avg: number;
  weekend_avg: number;
  weekday_count: number;
  weekend_count: number;
  difference: number;
}

export interface OptimalBedtime {
  optimal_bedtime_start: string; // HH:MM format
  optimal_bedtime_end: string;   // HH:MM format
  confidence: number;
  sample_size: number;
  explanation: string;
}

export interface DetectedPattern {
  pattern: string;
  impact: string;
  explanation: string;
  confidence: number;
}

export interface PatternsAnalysis {
  positive_patterns: DetectedPattern[];
  negative_patterns: DetectedPattern[];
}

export interface SleepRecommendation {
  id: string;
  recommendation_text: string;
  reason: string;
  confidence_score: number;
  tags: string[];
  rule_name: string;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Calculate date N days ago from today
 */
function getDateNDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * Format date range
 */
function getDateRange(days: number): { start: string; end: string } {
  const end = new Date().toISOString().split('T')[0];
  const start = getDateNDaysAgo(days);
  return { start, end };
}

/**
 * Calculate sleep hours from bedtime and wake time (handles midnight crossing)
 */
function calculateSleepDuration(bedtime: string, wakeTime: string): number {
  const bedDate = new Date(`2000-01-01T${bedtime}`);
  let wakeDate = new Date(`2000-01-01T${wakeTime}`);

  // If wake time is before bedtime, it means next day
  if (wakeDate <= bedDate) {
    wakeDate = new Date(`2000-01-02T${wakeTime}`);
  }

  const diffMs = wakeDate.getTime() - bedDate.getTime();
  return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
}

/**
 * Parse time string to minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to HH:MM format
 */
function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.round(minutes % 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// =====================================================
// SERVICE CLASS
// =====================================================

export class SleepWellnessService {

  /**
   * 1. GET LAST NIGHT SUMMARY
   *
   * Calculate whether user is within or out of target for configured window.
   */
  static async getLastNightSummary(
    userId: string,
    windowDays: number = 7,
    targetHours?: number
  ): Promise<{ data: LastNightSummary | null; error: any }> {
    try {
      // Get user's target from most recent log or use provided/default
      let userTarget = targetHours || 8.0;

      // Get date range
      const { start, end } = getDateRange(windowDays);

      // Fetch sleep logs for the window
      const { data: logs, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false });

      if (error) throw error;

      // If no logs, return empty summary
      if (!logs || logs.length === 0) {
        return {
          data: {
            target_hours: userTarget,
            window_days: windowDays,
            last_night_hours: null,
            last_night_date: null,
            nights_meeting_target: 0,
            nights_total: 0,
            meets_all_nights: false,
            message: 'No sleep data available. Start tracking to see your progress!'
          },
          error: null
        };
      }

      // Get target from most recent log if available
      if (logs[0]?.sleep_target) {
        userTarget = Number(logs[0].sleep_target);
      }

      // Calculate last night hours
      const lastNight = logs[0];
      let lastNightHours = lastNight?.hours ? Number(lastNight.hours) : null;

      // Try calculating from bedtime/wake_time if available
      if (!lastNightHours && lastNight?.bedtime && lastNight?.wake_time) {
        lastNightHours = calculateSleepDuration(lastNight.bedtime, lastNight.wake_time);
      }

      // Count nights meeting target
      const nightsMeetingTarget = logs.filter(log => {
        const hours = log.hours ||
          (log.bedtime && log.wake_time ? calculateSleepDuration(log.bedtime, log.wake_time) : 0);
        return hours >= userTarget;
      }).length;

      const nightsTotal = logs.length;
      const meetsAllNights = nightsMeetingTarget === nightsTotal;

      // Generate message
      let message: string;
      if (meetsAllNights && nightsTotal >= windowDays) {
        message = `Excellent! You met your target of ${userTarget}h for all ${nightsTotal} nights.`;
      } else if (lastNightHours && lastNightHours < userTarget) {
        message = `Last night you slept ${lastNightHours}h (target: ${userTarget}h). You've met your target ${nightsMeetingTarget}/${nightsTotal} nights.`;
      } else if (nightsMeetingTarget > 0) {
        message = `You met your target ${nightsMeetingTarget}/${nightsTotal} nights (target: ${userTarget}h).`;
      } else {
        message = `You haven't met your target of ${userTarget}h in the last ${nightsTotal} nights. Try getting to bed earlier tonight.`;
      }

      return {
        data: {
          target_hours: userTarget,
          window_days: windowDays,
          last_night_hours: lastNightHours,
          last_night_date: lastNight.date,
          nights_meeting_target: nightsMeetingTarget,
          nights_total: nightsTotal,
          meets_all_nights: meetsAllNights,
          message
        },
        error: null
      };

    } catch (error) {
      console.error('Error fetching last night summary:', error);
      return { data: null, error };
    }
  }

  /**
   * 2. GET WEEKLY OVERVIEW
   *
   * Returns sleep hours and habit completions for each day of the week.
   */
  static async getWeeklyOverview(
    userId: string,
    startDate: string
  ): Promise<{ data: WeeklyOverviewDay[] | null; error: any }> {
    try {
      // Calculate end date (6 days after start)
      const start = new Date(startDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const endDate = end.toISOString().split('T')[0];

      // Fetch sleep logs for the week
      const { data: sleepLogs, error: sleepError } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (sleepError) throw sleepError;

      // Fetch habit completions for the week (sleep-related habits)
      const { data: habits, error: habitsError } = await supabase
        .from('user_habits')
        .select(`
          *,
          habits_library (
            id,
            name,
            category,
            emoji
          )
        `)
        .eq('user_id', userId)
        .eq('habits_library.category', 'Sleep');

      if (habitsError) throw habitsError;

      // Fetch habit completion logs for the week
      const habitIds = habits?.map(h => h.habit_id) || [];
      const { data: completions, error: completionsError } = await supabase
        .from('habit_completion_log')
        .select('*')
        .eq('user_id', userId)
        .in('habit_id', habitIds)
        .gte('date', startDate)
        .lte('date', endDate);

      if (completionsError) throw completionsError;

      // Build array of 7 days
      const weekDays: WeeklyOverviewDay[] = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];

        // Find sleep log for this date
        const sleepLog = sleepLogs?.find(log => log.date === dateStr);
        let hoursSlept = sleepLog?.hours ? Number(sleepLog.hours) : null;

        // Calculate from bedtime/wake if not available
        if (!hoursSlept && sleepLog?.bedtime && sleepLog?.wake_time) {
          hoursSlept = calculateSleepDuration(sleepLog.bedtime, sleepLog.wake_time);
        }

        // Find habit completions for this date
        const dayCompletions = completions?.filter(c => c.date === dateStr) || [];
        const habitsCompleted = habits?.map(habit => {
          const completion = dayCompletions.find(c => c.habit_id === habit.habit_id);
          return {
            habit_id: habit.habit_id,
            habit_name: habit.habits_library?.name || 'Unknown',
            type: habit.habits_library?.category || 'Sleep',
            completed: completion?.completed || false
          };
        }) || [];

        weekDays.push({
          date: dateStr,
          hours_slept: hoursSlept,
          sleep_quality: sleepLog?.quality ? Number(sleepLog.quality) : null,
          habits_completed: habitsCompleted
        });
      }

      return { data: weekDays, error: null };

    } catch (error) {
      console.error('Error fetching weekly overview:', error);
      return { data: null, error };
    }
  }

  /**
   * 3. GET THIS WEEK SUMMARY
   *
   * Returns average sleep, target achievement for the current week.
   */
  static async getThisWeekSummary(
    userId: string
  ): Promise<{ data: ThisWeekSummary | null; error: any }> {
    try {
      // Calculate week start (last Monday or today if Monday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - daysToMonday);
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEndStr = today.toISOString().split('T')[0];

      // Fetch sleep logs for this week
      const { data: logs, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', weekStartStr)
        .lte('date', weekEndStr)
        .order('date', { ascending: false });

      if (error) throw error;

      if (!logs || logs.length === 0) {
        return {
          data: {
            week_start: weekStartStr,
            week_end: weekEndStr,
            average_sleep_hours: 0,
            target_hours: 8.0,
            nights_target_met: 0,
            nights_total: 0,
            percent_target_achievement: 0
          },
          error: null
        };
      }

      // Get target from most recent log
      const targetHours = logs[0]?.sleep_target ? Number(logs[0].sleep_target) : 8.0;

      // Calculate average and target achievement
      let totalHours = 0;
      let nightsTargetMet = 0;

      logs.forEach(log => {
        const hours = log.hours ||
          (log.bedtime && log.wake_time ? calculateSleepDuration(log.bedtime, log.wake_time) : 0);
        totalHours += hours;
        if (hours >= targetHours) {
          nightsTargetMet++;
        }
      });

      const averageSleepHours = totalHours / logs.length;
      const percentTargetAchievement = (nightsTargetMet / logs.length) * 100;

      return {
        data: {
          week_start: weekStartStr,
          week_end: weekEndStr,
          average_sleep_hours: Number(averageSleepHours.toFixed(2)),
          target_hours: targetHours,
          nights_target_met: nightsTargetMet,
          nights_total: logs.length,
          percent_target_achievement: Number(percentTargetAchievement.toFixed(2))
        },
        error: null
      };

    } catch (error) {
      console.error('Error fetching this week summary:', error);
      return { data: null, error };
    }
  }

  /**
   * 4. GET SLEEP DURATION TREND
   *
   * Returns daily sleep duration for the specified range.
   */
  static async getSleepDurationTrend(
    userId: string,
    rangeDays: number = 30
  ): Promise<{ data: SleepDurationTrend[] | null; error: any }> {
    try {
      const { start, end } = getDateRange(rangeDays);

      const { data: logs, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true });

      if (error) throw error;

      const trend = (logs || []).map(log => ({
        date: log.date,
        hours: Number(log.hours ||
          (log.bedtime && log.wake_time ? calculateSleepDuration(log.bedtime, log.wake_time) : 0)),
        quality: log.quality ? Number(log.quality) : null
      }));

      return { data: trend, error: null };

    } catch (error) {
      console.error('Error fetching sleep duration trend:', error);
      return { data: null, error };
    }
  }

  /**
   * 5. GET SLEEP CONSISTENCY
   *
   * Calculate consistency percentage based on bedtime variance.
   */
  static async getSleepConsistency(
    userId: string,
    rangeDays: number = 30
  ): Promise<{ data: ConsistencySummary | null; error: any }> {
    try {
      const { start, end } = getDateRange(rangeDays);

      const { data: logs, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true });

      if (error) throw error;

      if (!logs || logs.length < 2) {
        return {
          data: {
            consistency_percent: 0,
            avg_bedtime_variance_minutes: 0,
            days_analyzed: logs?.length || 0
          },
          error: null
        };
      }

      // Extract bedtimes as minutes since midnight
      const bedtimes = logs
        .filter(log => log.bedtime)
        .map(log => timeToMinutes(log.bedtime!));

      if (bedtimes.length < 2) {
        return {
          data: {
            consistency_percent: 0,
            avg_bedtime_variance_minutes: 0,
            days_analyzed: logs.length
          },
          error: null
        };
      }

      // Calculate mean bedtime
      const meanBedtime = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;

      // Calculate variance
      const variance = bedtimes.reduce((sum, time) => {
        return sum + Math.pow(time - meanBedtime, 2);
      }, 0) / bedtimes.length;

      const stdDev = Math.sqrt(variance);

      // Consistency score: 100% if std dev is 0, decreases as variance increases
      // We use 60 minutes as the baseline (1 hour variance = ~50% consistency)
      const consistencyPercent = Math.max(0, Math.min(100, 100 - (stdDev / 60) * 100));

      return {
        data: {
          consistency_percent: Number(consistencyPercent.toFixed(2)),
          avg_bedtime_variance_minutes: Number(stdDev.toFixed(2)),
          days_analyzed: logs.length
        },
        error: null
      };

    } catch (error) {
      console.error('Error calculating sleep consistency:', error);
      return { data: null, error };
    }
  }

  /**
   * 6. GET WEEKDAY VS WEEKEND COMPARISON
   *
   * Compare average sleep hours between weekdays and weekends.
   */
  static async getWeekdayWeekendComparison(
    userId: string,
    rangeDays: number = 30
  ): Promise<{ data: WeekdayWeekendComparison | null; error: any }> {
    try {
      const { start, end } = getDateRange(rangeDays);

      const { data: logs, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', start)
        .lte('date', end);

      if (error) throw error;

      if (!logs || logs.length === 0) {
        return {
          data: {
            weekday_avg: 0,
            weekend_avg: 0,
            weekday_count: 0,
            weekend_count: 0,
            difference: 0
          },
          error: null
        };
      }

      // Separate weekday and weekend logs
      const weekdayLogs = logs.filter(log => {
        const date = new Date(log.date);
        const day = date.getDay();
        return day !== 0 && day !== 6; // Mon-Fri
      });

      const weekendLogs = logs.filter(log => {
        const date = new Date(log.date);
        const day = date.getDay();
        return day === 0 || day === 6; // Sat-Sun
      });

      // Calculate averages
      const weekdayAvg = weekdayLogs.length > 0
        ? weekdayLogs.reduce((sum, log) => {
            const hours = log.hours ||
              (log.bedtime && log.wake_time ? calculateSleepDuration(log.bedtime, log.wake_time) : 0);
            return sum + hours;
          }, 0) / weekdayLogs.length
        : 0;

      const weekendAvg = weekendLogs.length > 0
        ? weekendLogs.reduce((sum, log) => {
            const hours = log.hours ||
              (log.bedtime && log.wake_time ? calculateSleepDuration(log.bedtime, log.wake_time) : 0);
            return sum + hours;
          }, 0) / weekendLogs.length
        : 0;

      return {
        data: {
          weekday_avg: Number(weekdayAvg.toFixed(2)),
          weekend_avg: Number(weekendAvg.toFixed(2)),
          weekday_count: weekdayLogs.length,
          weekend_count: weekendLogs.length,
          difference: Number((weekendAvg - weekdayAvg).toFixed(2))
        },
        error: null
      };

    } catch (error) {
      console.error('Error comparing weekday vs weekend:', error);
      return { data: null, error };
    }
  }

  /**
   * 7. GET OPTIMAL BEDTIME
   *
   * Analyze nights with best sleep and extract typical bedtime window.
   */
  static async getOptimalBedtime(
    userId: string,
    rangeDays: number = 60
  ): Promise<{ data: OptimalBedtime | null; error: any }> {
    try {
      const { start, end } = getDateRange(rangeDays);

      const { data: logs, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', start)
        .lte('date', end)
        .not('bedtime', 'is', null)
        .not('quality', 'is', null);

      if (error) throw error;

      if (!logs || logs.length < 7) {
        return {
          data: {
            optimal_bedtime_start: '22:00',
            optimal_bedtime_end: '23:00',
            confidence: 0,
            sample_size: logs?.length || 0,
            explanation: 'Not enough data to determine optimal bedtime. Track for at least 7 nights.'
          },
          error: null
        };
      }

      // Calculate sleep efficiency: (hours / target) * quality
      const logsWithEfficiency = logs.map(log => {
        const hours = log.hours ||
          (log.bedtime && log.wake_time ? calculateSleepDuration(log.bedtime, log.wake_time) : 0);
        const target = log.sleep_target || 8.0;
        const quality = log.quality || 3;
        const efficiency = (hours / target) * (quality / 5);

        return {
          ...log,
          efficiency,
          hours,
          bedtimeMinutes: timeToMinutes(log.bedtime!)
        };
      });

      // Sort by efficiency and take top 25%
      logsWithEfficiency.sort((a, b) => b.efficiency - a.efficiency);
      const topLogs = logsWithEfficiency.slice(0, Math.ceil(logsWithEfficiency.length * 0.25));

      if (topLogs.length === 0) {
        return {
          data: {
            optimal_bedtime_start: '22:00',
            optimal_bedtime_end: '23:00',
            confidence: 0,
            sample_size: 0,
            explanation: 'Unable to determine optimal bedtime from current data.'
          },
          error: null
        };
      }

      // Calculate average bedtime from top performers
      const avgBedtime = topLogs.reduce((sum, log) => sum + log.bedtimeMinutes, 0) / topLogs.length;

      // Calculate standard deviation
      const variance = topLogs.reduce((sum, log) => {
        return sum + Math.pow(log.bedtimeMinutes - avgBedtime, 2);
      }, 0) / topLogs.length;
      const stdDev = Math.sqrt(variance);

      // Optimal window: avgBedtime ± 15 minutes (or stdDev if smaller)
      const windowSize = Math.min(15, stdDev);
      const startMinutes = avgBedtime - windowSize;
      const endMinutes = avgBedtime + windowSize;

      // Calculate confidence based on sample size and consistency
      const confidence = Math.min(100, (topLogs.length / 15) * 100 * (1 - stdDev / 60));

      const avgHours = topLogs.reduce((sum, log) => sum + log.hours, 0) / topLogs.length;
      const avgQuality = topLogs.reduce((sum, log) => sum + (log.quality || 3), 0) / topLogs.length;

      return {
        data: {
          optimal_bedtime_start: minutesToTime(startMinutes),
          optimal_bedtime_end: minutesToTime(endMinutes),
          confidence: Number(confidence.toFixed(2)),
          sample_size: topLogs.length,
          explanation: `Based on ${topLogs.length} high-quality nights (avg ${avgHours.toFixed(1)}h sleep, ${avgQuality.toFixed(1)}/5 quality), your best sleep occurs when you go to bed between these times.`
        },
        error: null
      };

    } catch (error) {
      console.error('Error determining optimal bedtime:', error);
      return { data: null, error };
    }
  }

  /**
   * 8. GET DETECTED PATTERNS
   *
   * Analyze correlations and patterns in sleep data.
   * This is a simplified implementation - in production, you'd use more sophisticated
   * correlation analysis.
   */
  static async getDetectedPatterns(
    userId: string,
    rangeDays: number = 60
  ): Promise<{ data: PatternsAnalysis | null; error: any }> {
    try {
      const { start, end } = getDateRange(rangeDays);

      const { data: logs, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true });

      if (error) throw error;

      if (!logs || logs.length < 14) {
        return {
          data: {
            positive_patterns: [],
            negative_patterns: [{
              pattern: 'Insufficient data',
              impact: 'Cannot detect patterns yet',
              explanation: 'Track sleep for at least 14 days to see pattern detection.',
              confidence: 0
            }]
          },
          error: null
        };
      }

      const positivePatterns: DetectedPattern[] = [];
      const negativePatterns: DetectedPattern[] = [];

      // Pattern 1: Consistency leads to better quality
      const bedtimes = logs.filter(l => l.bedtime).map(l => timeToMinutes(l.bedtime!));
      if (bedtimes.length >= 7) {
        const avgBedtime = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
        const variance = bedtimes.reduce((sum, time) => sum + Math.pow(time - avgBedtime, 2), 0) / bedtimes.length;
        const stdDev = Math.sqrt(variance);

        const avgQuality = logs.filter(l => l.quality).reduce((sum, l) => sum + (l.quality || 0), 0) / logs.filter(l => l.quality).length;

        if (stdDev < 30 && avgQuality >= 3.5) {
          positivePatterns.push({
            pattern: 'Consistent bedtime',
            impact: `+${((avgQuality - 3) * 0.5).toFixed(1)}h better sleep quality`,
            explanation: `Your consistent bedtime (within ${Math.round(stdDev)} minutes) correlates with high sleep quality (${avgQuality.toFixed(1)}/5).`,
            confidence: 0.8
          });
        } else if (stdDev > 60) {
          negativePatterns.push({
            pattern: 'Irregular bedtime',
            impact: `-${((stdDev / 60) * 0.5).toFixed(1)}h avg sleep quality`,
            explanation: `Your bedtime varies by ${Math.round(stdDev)} minutes on average, which may be affecting sleep quality.`,
            confidence: 0.75
          });
        }
      }

      // Pattern 2: Weekend sleep difference
      const weekdayLogs = logs.filter(log => {
        const day = new Date(log.date).getDay();
        return day !== 0 && day !== 6;
      });
      const weekendLogs = logs.filter(log => {
        const day = new Date(log.date).getDay();
        return day === 0 || day === 6;
      });

      if (weekdayLogs.length >= 3 && weekendLogs.length >= 2) {
        const weekdayAvg = weekdayLogs.reduce((sum, l) => sum + (l.hours || 0), 0) / weekdayLogs.length;
        const weekendAvg = weekendLogs.reduce((sum, l) => sum + (l.hours || 0), 0) / weekendLogs.length;
        const diff = Math.abs(weekendAvg - weekdayAvg);

        if (diff > 2) {
          negativePatterns.push({
            pattern: 'Social jet lag',
            impact: `-${diff.toFixed(1)}h weekend sleep difference`,
            explanation: `You sleep ${diff.toFixed(1)}h ${weekendAvg > weekdayAvg ? 'more' : 'less'} on weekends, creating "social jet lag" that disrupts your rhythm.`,
            confidence: 0.8
          });
        }
      }

      // Pattern 3: Late bedtimes and quality
      const lateBedtimeLogs = logs.filter(log => {
        if (!log.bedtime) return false;
        const hour = parseInt(log.bedtime.split(':')[0]);
        return hour >= 0 && hour < 6 || hour >= 24; // After midnight
      });

      if (lateBedtimeLogs.length >= 3) {
        const lateAvgQuality = lateBedtimeLogs.filter(l => l.quality)
          .reduce((sum, l) => sum + (l.quality || 0), 0) / lateBedtimeLogs.filter(l => l.quality).length;
        const allAvgQuality = logs.filter(l => l.quality)
          .reduce((sum, l) => sum + (l.quality || 0), 0) / logs.filter(l => l.quality).length;

        if (lateAvgQuality < allAvgQuality - 0.5) {
          negativePatterns.push({
            pattern: 'Late bedtime impact',
            impact: `-${((allAvgQuality - lateAvgQuality) * 20).toFixed(0)}% quality on late nights`,
            explanation: `Going to bed after midnight reduces your sleep quality by ${((1 - lateAvgQuality / allAvgQuality) * 100).toFixed(0)}%.`,
            confidence: 0.7
          });
        }
      }

      // Pattern 4: Duration sweet spot
      const optimalLogs = logs.filter(log => {
        const hours = log.hours || 0;
        return hours >= 7 && hours <= 9;
      });

      if (optimalLogs.length >= 7) {
        const optimalAvgQuality = optimalLogs.filter(l => l.quality)
          .reduce((sum, l) => sum + (l.quality || 0), 0) / optimalLogs.filter(l => l.quality).length;

        if (optimalAvgQuality >= 3.5) {
          positivePatterns.push({
            pattern: '7-9 hour sweet spot',
            impact: `+${((optimalAvgQuality - 3) * 0.3).toFixed(1)}h quality boost`,
            explanation: `Your best sleep occurs when you get 7-9 hours (avg quality: ${optimalAvgQuality.toFixed(1)}/5).`,
            confidence: 0.85
          });
        }
      }

      // If no patterns detected, provide generic insight
      if (positivePatterns.length === 0 && negativePatterns.length === 0) {
        positivePatterns.push({
          pattern: 'Building baseline',
          impact: 'Collecting data',
          explanation: 'Continue tracking to detect personalized patterns in your sleep data.',
          confidence: 0.5
        });
      }

      return {
        data: {
          positive_patterns: positivePatterns,
          negative_patterns: negativePatterns
        },
        error: null
      };

    } catch (error) {
      console.error('Error detecting patterns:', error);
      return { data: null, error };
    }
  }

  /**
   * 9. GET RECOMMENDATIONS
   *
   * Fetch personalized recommendations based on user's sleep patterns.
   * Matches against recommendation rules in the database.
   */
  static async getRecommendations(
    userId: string,
    context: 'today' | 'week' | 'month' | 'trends' = 'week',
    limit: number = 3
  ): Promise<{ data: SleepRecommendation[] | null; error: any }> {
    try {
      // Determine date range based on context
      let rangeDays = 7;
      if (context === 'month') rangeDays = 30;
      else if (context === 'trends') rangeDays = 30;
      else if (context === 'today') rangeDays = 1;

      const { start, end } = getDateRange(rangeDays);

      // Fetch sleep logs
      const { data: logs, error: logsError } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('date', start)
        .lte('date', end);

      if (logsError) throw logsError;

      // Calculate user metrics
      const metrics: any = {
        totalNights: logs?.length || 0
      };

      if (logs && logs.length > 0) {
        // Average sleep hours
        metrics.avgSleepHours = logs.reduce((sum, l) => {
          const hours = l.hours ||
            (l.bedtime && l.wake_time ? calculateSleepDuration(l.bedtime, l.wake_time) : 0);
          return sum + hours;
        }, 0) / logs.length;

        // Average quality
        const qualityLogs = logs.filter(l => l.quality);
        if (qualityLogs.length > 0) {
          metrics.avgQuality = qualityLogs.reduce((sum, l) => sum + (l.quality || 0), 0) / qualityLogs.length;
        }

        // Consistency score
        const bedtimes = logs.filter(l => l.bedtime).map(l => timeToMinutes(l.bedtime!));
        if (bedtimes.length >= 2) {
          const avgBedtime = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
          const variance = bedtimes.reduce((sum, time) => sum + Math.pow(time - avgBedtime, 2), 0) / bedtimes.length;
          const stdDev = Math.sqrt(variance);
          metrics.consistencyScore = Math.max(0, Math.min(100, 100 - (stdDev / 60) * 100));
        }

        // Wake up consistency
        const wakeTimes = logs.filter(l => l.wake_time).map(l => timeToMinutes(l.wake_time!));
        if (wakeTimes.length >= 2) {
          const avgWake = wakeTimes.reduce((sum, time) => sum + time, 0) / wakeTimes.length;
          const wakeVariance = wakeTimes.reduce((sum, time) => sum + Math.pow(time - avgWake, 2), 0) / wakeTimes.length;
          const wakeStdDev = Math.sqrt(wakeVariance);
          metrics.wakeUpConsistency = wakeStdDev < 30 ? 'High' : wakeStdDev < 60 ? 'Medium' : 'Low';
        }

        // Weekend difference
        const weekdayLogs = logs.filter(log => {
          const day = new Date(log.date).getDay();
          return day !== 0 && day !== 6;
        });
        const weekendLogs = logs.filter(log => {
          const day = new Date(log.date).getDay();
          return day === 0 || day === 6;
        });

        if (weekdayLogs.length > 0 && weekendLogs.length > 0) {
          const weekdayAvg = weekdayLogs.reduce((sum, l) => sum + (l.hours || 0), 0) / weekdayLogs.length;
          const weekendAvg = weekendLogs.reduce((sum, l) => sum + (l.hours || 0), 0) / weekendLogs.length;
          metrics.weekendDifference = Math.abs(weekendAvg - weekdayAvg);
        }

        // Average bedtime hour
        if (bedtimes.length > 0) {
          const avgBedtimeMinutes = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
          metrics.avgBedtimeHour = Math.floor(avgBedtimeMinutes / 60);
        }
      }

      // Fetch all active recommendation rules
      const { data: rules, error: rulesError } = await supabase
        .from('sleep_recommendation_rules')
        .select('*')
        .eq('active', true)
        .order('priority', { ascending: false });

      if (rulesError) throw rulesError;

      // Match rules against user metrics
      const matchedRecommendations: SleepRecommendation[] = [];

      for (const rule of rules || []) {
        const criteria = rule.pattern_criteria;
        let matches = true;

        // Check each criterion in the pattern
        for (const [key, value] of Object.entries(criteria)) {
          const userValue = metrics[key];

          if (userValue === undefined) {
            matches = false;
            break;
          }

          const condition = value as any;

          // Handle numeric range conditions
          if (condition.min !== undefined && userValue < condition.min) {
            matches = false;
            break;
          }
          if (condition.max !== undefined && userValue > condition.max) {
            matches = false;
            break;
          }

          // Handle string equality
          if (typeof condition === 'string' && userValue !== condition) {
            matches = false;
            break;
          }
        }

        if (matches) {
          // Replace placeholders in reason template
          let reason = rule.reason_template;
          for (const [key, value] of Object.entries(metrics)) {
            const placeholder = `{${key}}`;
            if (typeof value === 'number') {
              reason = reason.replace(placeholder, value.toFixed(1));
            } else {
              reason = reason.replace(placeholder, String(value));
            }
          }

          matchedRecommendations.push({
            id: rule.id,
            recommendation_text: rule.recommendation_text,
            reason,
            confidence_score: rule.min_confidence,
            tags: rule.tags || [],
            rule_name: rule.rule_name
          });
        }
      }

      // Sort by confidence and priority, then take top N
      matchedRecommendations.sort((a, b) => b.confidence_score - a.confidence_score);
      const topRecommendations = matchedRecommendations.slice(0, limit);

      // Store recommendations for user (optional - for tracking)
      // You can uncomment this to save recommendations to user_sleep_recommendations table
      /*
      for (const rec of topRecommendations) {
        await supabase.from('user_sleep_recommendations').insert({
          user_id: userId,
          rule_id: rec.id,
          recommendation_text: rec.recommendation_text,
          reason: rec.reason,
          confidence_score: rec.confidence_score
        });
      }
      */

      return { data: topRecommendations, error: null };

    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return { data: null, error };
    }
  }
}
