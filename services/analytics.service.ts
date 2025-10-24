import { supabase } from '@/lib/supabase';
import { MoodsService } from './moods.service';
import { ActivitiesService } from './activities.service';
import { SleepService } from './sleep.service';
import { HabitsService } from './habits.service';
import { ExperimentsService } from './experiments.service';
import { ProductivityService } from './productivity.service';
import { IntimacyService } from './intimacy.service';
import { MentalClarityService } from './mentalClarity.service';

export interface CalendarData {
  date: string;
  mood?: {
    score: number;
    emoji: string;
  };
  sleep?: {
    hours: number;
    quality: number;
  };
  activities?: string[];
  habits?: {
    completed: number;
    total: number;
  };
  experiments?: {
    active: number;
    completed: number;
  };
}

export interface DailyDetailData {
  date: string;
  mood?: any;
  activities: any[];
  sleep?: any;
  habits: any[];
  experiments: any[];
  productivity?: any;
  intimacy?: any;
  mentalClarity?: any;
}

export interface AIRecommendation {
  id: string;
  type: 'mood' | 'sleep' | 'activity' | 'habit' | 'experiment';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: string;
  data?: any;
}

export class AnalyticsService {
  static async getCalendarData(userId: string, startDate: string, endDate: string): Promise<{ data: CalendarData[] | null; error: any }> {
    try {
      // Fetch all data types for the date range
      const [moodData, sleepData, activitiesData, habitsData, experimentsData] = await Promise.all([
        MoodsService.getByDateRange(userId, startDate, endDate),
        SleepService.getByDateRange(userId, startDate, endDate),
        ActivitiesService.getByDateRange(userId, startDate, endDate),
        HabitsService.getHabitsWithLogs(userId),
        ExperimentsService.getAll(userId)
      ]);

      if (moodData.error || sleepData.error || activitiesData.error || habitsData.error || experimentsData.error) {
        return { data: null, error: 'Failed to fetch calendar data' };
      }

      // Create calendar data structure
      const calendarData: CalendarData[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        const dayMood = moodData.data?.find(m => m.date === dateStr);
        const daySleep = sleepData.data?.find(s => s.date === dateStr);
        const dayActivities = activitiesData.data?.filter(a => a.date === dateStr) || [];
        const dayHabits = habitsData.data?.filter(h => 
          h.habit_logs?.some((log: any) => log.date === dateStr)
        ) || [];
        const activeExperiments = experimentsData.data?.filter(e => 
          e.status === 'active' && 
          new Date(e.start_date) <= d && 
          new Date(e.end_date) >= d
        ) || [];

        calendarData.push({
          date: dateStr,
          mood: dayMood ? { score: dayMood.score, emoji: dayMood.emoji } : undefined,
          sleep: daySleep ? { hours: daySleep.hours, quality: daySleep.quality } : undefined,
          activities: dayActivities.map(a => a.name),
          habits: {
            completed: dayHabits.filter(h => 
              h.habit_logs?.some((log: any) => log.date === dateStr && log.completed)
            ).length,
            total: dayHabits.length
          },
          experiments: {
            active: activeExperiments.length,
            completed: 0 // Could be calculated if needed
          }
        });
      }

      return { data: calendarData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getDailyDetailData(userId: string, date: string): Promise<{ data: DailyDetailData | null; error: any }> {
    try {
      const [moodData, activitiesData, sleepData, habitsData, experimentsData, productivityData, intimacyData, mentalClarityData] = await Promise.all([
        MoodsService.getByDate(userId, date),
        ActivitiesService.getByDate(userId, date),
        SleepService.getByDate(userId, date),
        HabitsService.getHabitsWithLogs(userId, date),
        ExperimentsService.getAll(userId),
        ProductivityService.getByDate(userId, date),
        IntimacyService.getByDate(userId, date),
        MentalClarityService.getByDate(userId, date)
      ]);

      const dailyData: DailyDetailData = {
        date,
        mood: moodData.data,
        activities: activitiesData.data || [],
        sleep: sleepData.data,
        habits: habitsData.data || [],
        experiments: experimentsData.data || [],
        productivity: productivityData.data,
        intimacy: intimacyData.data,
        mentalClarity: mentalClarityData.data
      };

      return { data: dailyData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async calculateMoodTrends(userId: string, days: number = 7): Promise<{ data: any | null; error: any }> {
    try {
      const { data: moodData, error } = await MoodsService.getByDateRange(
        userId, 
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );

      if (error) return { data: null, error };

      if (!data || data.length === 0) {
        return { data: { trend: 'stable', average: 3, insights: [] }, error: null };
      }

      const scores = data.map(m => m.score);
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      
      // Calculate trend
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));
      const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
      
      let trend = 'stable';
      if (secondAvg > firstAvg + 0.5) trend = 'improving';
      else if (secondAvg < firstAvg - 0.5) trend = 'declining';

      const insights = [];
      if (trend === 'improving') insights.push('Your mood has been improving recently');
      else if (trend === 'declining') insights.push('Your mood has been declining recently');
      else insights.push('Your mood has been stable');

      return { 
        data: { 
          trend, 
          average: Number(average.toFixed(1)), 
          insights,
          scores 
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async calculateActivityImpact(userId: string, days: number = 14): Promise<{ data: any | null; error: any }> {
    try {
      const { data: activitiesData, error: activitiesError } = await ActivitiesService.getByDateRange(
        userId,
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );

      if (activitiesError) return { data: null, error: activitiesError };

      if (!activitiesData || activitiesData.length === 0) {
        return { data: { correlations: [], insights: [] }, error: null };
      }

      // Group activities by category
      const categoryGroups: { [key: string]: any[] } = {};
      activitiesData.forEach(activity => {
        if (!categoryGroups[activity.category]) {
          categoryGroups[activity.category] = [];
        }
        categoryGroups[activity.category].push(activity);
      });

      const correlations = Object.entries(categoryGroups).map(([category, activities]) => ({
        category,
        count: activities.length,
        impact: 'positive' // This would need more sophisticated analysis
      }));

      return { 
        data: { 
          correlations,
          insights: ['Regular activities show positive impact on wellbeing']
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async calculateSleepPatterns(userId: string, days: number = 14): Promise<{ data: any | null; error: any }> {
    try {
      const { data: sleepData, error } = await SleepService.getByDateRange(
        userId,
        new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        new Date().toISOString().split('T')[0]
      );

      if (error) return { data: null, error };

      if (!sleepData || sleepData.length === 0) {
        return { data: { averageHours: 0, quality: 0, insights: [] }, error: null };
      }

      const hours = sleepData.map(s => s.hours);
      const qualities = sleepData.map(s => s.quality);
      
      const averageHours = hours.reduce((sum, h) => sum + h, 0) / hours.length;
      const averageQuality = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;

      const insights = [];
      if (averageHours < 7) insights.push('You might benefit from more sleep');
      if (averageQuality < 3) insights.push('Consider improving your sleep environment');
      if (averageHours >= 7 && averageQuality >= 4) insights.push('Great sleep patterns!');

      return { 
        data: { 
          averageHours: Number(averageHours.toFixed(1)),
          quality: Number(averageQuality.toFixed(1)),
          insights,
          hours,
          qualities
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async calculateHabitEffectiveness(userId: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data: habitsData, error } = await HabitsService.getAll(userId);

      if (error) return { data: null, error };

      if (!habitsData || habitsData.length === 0) {
        return { data: { effectiveness: [], insights: [] }, error: null };
      }

      const effectiveness = await Promise.all(
        habitsData.map(async (habit) => {
          const { data: completionRate } = await HabitsService.getHabitCompletionRate(habit.id, userId);
          return {
            habit: habit.name,
            completionRate: completionRate || 0,
            streak: habit.streak
          };
        })
      );

      const insights = [];
      const highPerformers = effectiveness.filter(h => h.completionRate >= 80);
      if (highPerformers.length > 0) {
        insights.push(`Great job with ${highPerformers.map(h => h.habit).join(', ')}!`);
      }

      return { 
        data: { 
          effectiveness,
          insights
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async generateAIRecommendations(userId: string): Promise<{ data: AIRecommendation[] | null; error: any }> {
    try {
      const [moodTrends, sleepPatterns, habitEffectiveness] = await Promise.all([
        this.calculateMoodTrends(userId, 7),
        this.calculateSleepPatterns(userId, 7),
        this.calculateHabitEffectiveness(userId)
      ]);

      const recommendations: AIRecommendation[] = [];

      // Mood-based recommendations
      if (moodTrends.data && moodTrends.data.trend === 'declining') {
        recommendations.push({
          id: 'mood-1',
          type: 'mood',
          title: 'Focus on Mood Improvement',
          description: 'Your mood has been declining. Try some mood-boosting activities.',
          priority: 'high',
          action: 'Try meditation or exercise'
        });
      }

      // Sleep-based recommendations
      if (sleepPatterns.data && sleepPatterns.data.averageHours < 7) {
        recommendations.push({
          id: 'sleep-1',
          type: 'sleep',
          title: 'Improve Sleep Duration',
          description: 'You\'re getting less than 7 hours of sleep. Consider going to bed earlier.',
          priority: 'high',
          action: 'Set a consistent bedtime'
        });
      }

      // Habit-based recommendations
      if (habitEffectiveness.data) {
        const lowPerformers = habitEffectiveness.data.effectiveness.filter((h: any) => h.completionRate < 50);
        if (lowPerformers.length > 0) {
          recommendations.push({
            id: 'habit-1',
            type: 'habit',
            title: 'Strengthen Habit Routine',
            description: `Consider adjusting your routine for ${lowPerformers[0].habit}.`,
            priority: 'medium',
            action: 'Review habit timing and triggers'
          });
        }
      }

      // Default recommendations if no specific issues found
      if (recommendations.length === 0) {
        recommendations.push({
          id: 'general-1',
          type: 'activity',
          title: 'Keep Up the Great Work!',
          description: 'Your wellness patterns look good. Continue your current routine.',
          priority: 'low',
          action: 'Maintain current habits'
        });
      }

      return { data: recommendations, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}
