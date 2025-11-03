import { SupabaseSafe } from '@/lib/supabaseSafe';
import { MoodsService } from './moods.service';
import { ActivitiesService } from './activities.service';
import { SleepService } from './sleep.service';
import { HabitsService } from './habits.service';
import { ExperimentsService } from './experiments.service';
import { ProductivityService } from './productivity.service';
import { IntimacyService } from './intimacy.service';
import { MentalClarityService } from './mentalClarity.service';
import { isGuestMode, guestDataStore } from '@/lib/guestDataStore';

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
      // For guest mode, return empty calendar data
      if (await isGuestMode()) {
        return { data: [], error: null };
      }
      
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

      // Transform mood data
      const mood = moodData.data ? {
        score: moodData.data.score,
        emoji: moodData.data.emoji,
        note: moodData.data.notes
      } : undefined;

      // Transform activities data - calculate impact based on mood correlation
      const activities = (activitiesData.data || []).map(activity => ({
        name: activity.name,
        emoji: activity.emoji || '📝',
        category: activity.category,
        duration: activity.duration || 0,
        impact: 0 // TODO: Calculate actual impact based on mood correlation over time
      }));

      // Transform sleep data
      const sleep = sleepData.data ? {
        hours: Number(sleepData.data.hours),
        emoji: sleepData.data.hours >= 8 ? '😴' : sleepData.data.hours >= 7 ? '😌' : '🥱',
        quality: ['poor', 'fair', 'good', 'very good', 'excellent'][sleepData.data.quality - 1] || 'good',
        bedtime: sleepData.data.bedtime,
        wakeTime: sleepData.data.wake_time
      } : undefined;

      // Transform habits data - get habits with logs for this date
      const habits = (habitsData.data || []).map(habit => {
        // If date was provided to getHabitsWithLogs, logs are already filtered
        // Otherwise, find the log for this date
        const logForDate = habit.habit_logs?.find((log: any) => log.date === date) || habit.habit_logs?.[0];
        return {
          name: habit.name,
          emoji: habit.emoji || '🔥',
          completed: logForDate?.completed || false
        };
      });

      // Transform experiments data - filter by date and status
      const allExperiments = experimentsData.data || [];
      const experimentsForDate = [];
      
      for (const exp of allExperiments) {
        const expDate = new Date(date);
        const startDate = new Date(exp.start_date);
        const endDate = new Date(exp.end_date);
        
        // Check if this date falls within the experiment period
        if (expDate >= startDate && expDate <= endDate) {
          // Get experiment log for this date
          const logResult = await ExperimentsService.getExperimentLogByDate(exp.id, date, userId);
          const logForDate = logResult.data;
          
          let status: 'completed' | 'skipped' | 'pending' = 'pending';
          if (logForDate?.completed) status = 'completed';
          else if (logForDate?.skipped) status = 'skipped';

          // Transform outcomes
          const outcomes = exp.outcomes && logForDate?.outcome_scores 
            ? exp.outcomes.map((outcome: string) => {
                const score = logForDate.outcome_scores[outcome] || 3;
                return { type: outcome, value: score };
              })
            : undefined;

          experimentsForDate.push({
            name: exp.activity_name,
            emoji: exp.activity_emoji,
            status,
            outcomes
          });
        }
      }
      
      const experiments = experimentsForDate.length > 0 ? experimentsForDate : undefined;

      // Transform mental clarity data
      const mentalClarity = mentalClarityData.data ? {
        score: mentalClarityData.data.score,
        factors: mentalClarityData.data.factors || []
      } : {
        score: 0,
        factors: []
      };

      const dailyData: DailyDetailData = {
        date,
        mood,
        activities,
        sleep,
        habits,
        experiments,
        mentalClarity
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

      if (!moodData.data || moodData.data.length === 0) {
        return { data: { trend: 'stable', average: 3, insights: [] }, error: null };
      }

      const scores = moodData.data.map(m => m.score);
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
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch all required data
      const [activitiesResult, moodsResult, sleepResult, mentalClarityResult] = await Promise.all([
        ActivitiesService.getByDateRange(userId, startDate, endDate),
        MoodsService.getByDateRange(userId, startDate, endDate),
        SleepService.getByDateRange(userId, startDate, endDate),
        MentalClarityService.getByDateRange(userId, startDate, endDate)
      ]);

      if (!activitiesResult.data || activitiesResult.data.length === 0) {
        return { data: { correlations: [], insights: [] }, error: null };
      }

      const activities = activitiesResult.data;
      const moods = moodsResult.data || [];
      const sleep = sleepResult.data || [];
      const mentalClarity = mentalClarityResult.data || [];

      // Group activities by category
      const categoryGroups: { [key: string]: any[] } = {};
      activities.forEach(activity => {
        if (!categoryGroups[activity.category]) {
          categoryGroups[activity.category] = [];
        }
        categoryGroups[activity.category].push(activity);
      });

      const correlations = await Promise.all(
        Object.entries(categoryGroups).map(async ([category, categoryActivities]) => {
          // Calculate impact scores for each metric
          const moodImpact = this.calculateMoodImpactForCategory(categoryActivities, moods);
          const sleepImpact = this.calculateSleepImpactForCategory(categoryActivities, sleep);
          const clarityImpact = this.calculateClarityImpactForCategory(categoryActivities, mentalClarity);
          
          // Calculate overall impact score
          const overallScore = (moodImpact.score + sleepImpact.score + clarityImpact.score) / 3;
          
          // Generate impact insights
          let impact = 'neutral';
          let insights = [];
          
          if (overallScore >= 0.7) {
            impact = 'very-positive';
            insights.push(`${category} activities consistently improve your wellbeing`);
          } else if (overallScore >= 0.5) {
            impact = 'positive';
            insights.push(`${category} activities generally have a positive effect`);
          } else if (overallScore <= 0.3) {
            impact = 'negative';
            insights.push(`${category} activities might be affecting you negatively`);
          }

          // Add specific metric insights
          if (moodImpact.score > 0.7) insights.push(`Great for mood improvement`);
          if (sleepImpact.score > 0.7) insights.push(`Helps with better sleep`);
          if (clarityImpact.score > 0.7) insights.push(`Enhances mental clarity`);

          return {
            category,
            count: categoryActivities.length,
            impact,
            score: overallScore,
            metrics: {
              mood: moodImpact.score,
              sleep: sleepImpact.score,
              clarity: clarityImpact.score
            },
            insights
          };
        })
      );

      // Sort correlations by impact score
      correlations.sort((a, b) => b.score - a.score);

      // Generate overall insights
      const insights = [];
      const positiveCategories = correlations.filter(c => c.impact === 'very-positive' || c.impact === 'positive');
      const negativeCategories = correlations.filter(c => c.impact === 'negative');

      if (positiveCategories.length > 0) {
        insights.push(`${positiveCategories.map(c => c.category).join(', ')} have the most positive impact on your wellbeing`);
      }

      if (negativeCategories.length > 0) {
        insights.push(`Consider adjusting your approach to ${negativeCategories.map(c => c.category).join(', ')} activities`);
      }

      const mostFrequent = correlations.sort((a, b) => b.count - a.count)[0];
      insights.push(`You're most consistent with ${mostFrequent.category} activities`);

      return { 
        data: { 
          correlations,
          insights,
          summary: {
            totalActivities: activities.length,
            positiveImpact: positiveCategories.length,
            needsAttention: negativeCategories.length
          }
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  private static calculateMoodImpactForCategory(activities: any[], moods: any[]): { score: number } {
    let score = 0.5; // neutral baseline
    
    if (activities.length === 0 || moods.length === 0) {
      return { score };
    }

    // Map activities to mood scores on the same day
    const moodScores = activities.map(activity => {
      const dayMood = moods.find(m => m.date === activity.date);
      return dayMood ? dayMood.score : null;
    }).filter(score => score !== null);

    if (moodScores.length === 0) return { score };

    // Calculate average mood score for days with these activities
    const avgMoodWithActivity = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
    
    // Calculate average mood score for days without these activities
    const daysWithoutActivities = moods.filter(mood => 
      !activities.some(activity => activity.date === mood.date)
    );
    
    const avgMoodWithoutActivity = daysWithoutActivities.length > 0
      ? daysWithoutActivities.reduce((sum, mood) => sum + mood.score, 0) / daysWithoutActivities.length
      : 3; // neutral baseline if no comparison data

    // Normalize to 0-1 scale
    score = Math.min(1, Math.max(0, (avgMoodWithActivity - avgMoodWithoutActivity + 5) / 10));
    
    return { score };
  }

  private static calculateSleepImpactForCategory(activities: any[], sleep: any[]): { score: number } {
    let score = 0.5; // neutral baseline
    
    if (activities.length === 0 || sleep.length === 0) {
      return { score };
    }

    // Map activities to sleep quality on the same day
    const sleepScores = activities.map(activity => {
      const daySleep = sleep.find(s => s.date === activity.date);
      return daySleep ? daySleep.quality : null;
    }).filter(score => score !== null);

    if (sleepScores.length === 0) return { score };

    // Calculate average sleep quality for days with these activities
    const avgSleepWithActivity = sleepScores.reduce((sum, score) => sum + score, 0) / sleepScores.length;
    
    // Calculate average sleep quality for days without these activities
    const daysWithoutActivities = sleep.filter(s => 
      !activities.some(activity => activity.date === s.date)
    );
    
    const avgSleepWithoutActivity = daysWithoutActivities.length > 0
      ? daysWithoutActivities.reduce((sum, s) => sum + s.quality, 0) / daysWithoutActivities.length
      : 3; // neutral baseline if no comparison data

    // Normalize to 0-1 scale
    score = Math.min(1, Math.max(0, (avgSleepWithActivity - avgSleepWithoutActivity + 5) / 10));
    
    return { score };
  }

  private static calculateClarityImpactForCategory(activities: any[], clarity: any[]): { score: number } {
    let score = 0.5; // neutral baseline
    
    if (activities.length === 0 || clarity.length === 0) {
      return { score };
    }

    // Map activities to mental clarity scores on the same day
    const clarityScores = activities.map(activity => {
      const dayClarity = clarity.find(c => c.date === activity.date);
      return dayClarity ? dayClarity.score : null;
    }).filter(score => score !== null);

    if (clarityScores.length === 0) return { score };

    // Calculate average clarity score for days with these activities
    const avgClarityWithActivity = clarityScores.reduce((sum, score) => sum + score, 0) / clarityScores.length;
    
    // Calculate average clarity score for days without these activities
    const daysWithoutActivities = clarity.filter(c => 
      !activities.some(activity => activity.date === c.date)
    );
    
    const avgClarityWithoutActivity = daysWithoutActivities.length > 0
      ? daysWithoutActivities.reduce((sum, c) => sum + c.score, 0) / daysWithoutActivities.length
      : 3; // neutral baseline if no comparison data

    // Normalize to 0-1 scale
    score = Math.min(1, Math.max(0, (avgClarityWithActivity - avgClarityWithoutActivity + 5) / 10));
    
    return { score };
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
      // For guest mode, return sample recommendations
      if (await isGuestMode()) {
        return {
          data: [
            {
              id: 'guest-1',
              type: 'mood',
              title: 'Welcome to Betternapped!',
              description: 'Start tracking your mood, sleep, and activities to get personalized insights.',
              priority: 'high',
              action: 'Try logging your first mood entry'
            },
            {
              id: 'guest-2',
              type: 'sleep',
              title: 'Track Your Sleep',
              description: 'Consistent sleep tracking helps identify patterns and improve your rest.',
              priority: 'medium',
              action: 'Log your sleep hours tonight'
            }
          ],
          error: null
        };
      }
      
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
