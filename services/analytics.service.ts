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

export interface MonthlySummary {
  summary: {
    avgMood: number;
    avgSleep: number;
    avgClarity: number;
    avgProductivity: number;
    topActivities: string[];
    totalDaysLogged: number;
    bestMoodDays: number;
    worstMoodDays: number;
  };
  insights: string[];
  correlations: {
    sleepMoodCorrelation: number;
    exerciseMoodCorrelation: number;
    sleepClarityCorrelation: number;
  };
}

export interface WellBeingLegend {
  summary: {
    greatDays: number;
    goodDays: number;
    fairDays: number;
    toughDays: number;
    totalDays: number;
  };
  percentages: {
    greatDays: number;
    goodDays: number;
    fairDays: number;
    toughDays: number;
  };
  impactInsights: string[];
}

export interface ActivityImpactData {
  activityName: string;
  category: string;
  emoji: string;
  totalOccurrences: number;
  frequencyPercent: number;
  avgMoodChange: number;
  avgSleepChange: number;
  avgClarityChange: number;
  avgProductivityChange: number;
  impactScore: number; // 0-100 composite score
  trend: 'up' | 'down' | 'flat';
  confidence: 'high' | 'medium' | 'low';
  correlations: {
    mood: number;
    sleep: number;
    clarity: number;
    productivity: number;
  };
}

export interface ActivityImpactResult {
  activities: ActivityImpactData[];
  insights: string[];
  period: string;
  totalActivities: number;
}

export interface MoodScoreAnalysis {
  averageMood: number;
  trend: 'up' | 'down' | 'stable';
  moodDistribution: {
    great: number;
    good: number;
    fair: number;
    tough: number;
  };
  bestMoodDay: { date: string; score: number; emoji: string } | null;
  lowestMoodDay: { date: string; score: number; emoji: string } | null;
  period: string;
  totalEntries: number;
  weekComparison: {
    thisWeekAvg: number;
    lastWeekAvg: number;
    change: number;
  } | null;
  insights: string[];
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

      if (!moodData || moodData.length === 0) {
        return { data: { trend: 'stable', average: 3, insights: [] }, error: null };
      }

      const scores = moodData.map(m => m.score);
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

  /**
   * Generate comprehensive monthly summary with insights
   * Analyzes user data for correlations and patterns
   */
  static async getMonthlySummary(userId: string, year: number, month: number): Promise<{ data: MonthlySummary | null; error: any }> {
    try {
      console.log(`📊 Generating monthly summary for user ${userId}, ${year}-${month}`);
      
      // Calculate date range for the month
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      // Fetch calendar data for the month
      const { data: calendarData, error: calendarError } = await this.getCalendarData(userId, startDate, endDate);
      
      if (calendarError || !calendarData) {
        console.error('Error fetching calendar data:', calendarError);
        return { data: null, error: calendarError || 'No calendar data' };
      }

      // Filter days with actual data
      const daysWithData = calendarData.filter(day => 
        day.mood || day.sleep || (day.activities && day.activities.length > 0)
      );

      console.log(`📊 Found ${daysWithData.length} days with data`);

      if (daysWithData.length === 0) {
        return {
          data: {
            summary: {
              avgMood: 0,
              avgSleep: 0,
              avgClarity: 0,
              avgProductivity: 0,
              topActivities: [],
              totalDaysLogged: 0,
              bestMoodDays: 0,
              worstMoodDays: 0,
            },
            insights: ['Start logging data to see personalized insights about your wellness patterns.'],
            correlations: {
              sleepMoodCorrelation: 0,
              exerciseMoodCorrelation: 0,
              sleepClarityCorrelation: 0,
            }
          },
          error: null
        };
      }

      // Fetch detailed data for mental clarity and productivity
      const detailedDataPromises = daysWithData.map(day => 
        this.getDailyDetailData(userId, day.date)
      );
      const detailedDataResults = await Promise.all(detailedDataPromises);
      const detailedData = detailedDataResults
        .filter(result => result.data !== null)
        .map(result => result.data!);

      // Calculate averages
      const moodScores = daysWithData
        .filter(day => day.mood)
        .map(day => day.mood!.score);
      const avgMood = moodScores.length > 0 
        ? moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length 
        : 0;

      const sleepHours = daysWithData
        .filter(day => day.sleep)
        .map(day => day.sleep!.hours);
      const avgSleep = sleepHours.length > 0
        ? sleepHours.reduce((sum, hours) => sum + hours, 0) / sleepHours.length
        : 0;

      const clarityScores = detailedData
        .filter(day => day.mentalClarity?.score)
        .map(day => day.mentalClarity.score);
      const avgClarity = clarityScores.length > 0
        ? clarityScores.reduce((sum, score) => sum + score, 0) / clarityScores.length
        : 0;

      const productivityRatings = detailedData
        .filter(day => day.productivity?.rating)
        .map(day => day.productivity.rating);
      const avgProductivity = productivityRatings.length > 0
        ? productivityRatings.reduce((sum, rating) => sum + rating, 0) / productivityRatings.length
        : 0;

      // Count best and worst mood days
      const bestMoodDays = moodScores.filter(score => score >= 4).length;
      const worstMoodDays = moodScores.filter(score => score <= 2).length;

      // Calculate top activities
      const activityCounts: { [key: string]: number } = {};
      daysWithData.forEach(day => {
        if (day.activities) {
          day.activities.forEach(activity => {
            activityCounts[activity] = (activityCounts[activity] || 0) + 1;
          });
        }
      });
      const topActivities = Object.entries(activityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([activity]) => activity);

      // Calculate correlations and generate insights
      const insights: string[] = [];
      const correlations = {
        sleepMoodCorrelation: 0,
        exerciseMoodCorrelation: 0,
        sleepClarityCorrelation: 0,
      };

      // Sleep-Mood Correlation
      const sleepMoodPairs = daysWithData
        .filter(day => day.sleep && day.mood)
        .map(day => ({ sleep: day.sleep!.hours, mood: day.mood!.score }));
      
      if (sleepMoodPairs.length >= 3) {
        correlations.sleepMoodCorrelation = this.calculateCorrelation(
          sleepMoodPairs.map(p => p.sleep),
          sleepMoodPairs.map(p => p.mood)
        );

        if (correlations.sleepMoodCorrelation > 0.3) {
          const goodSleepDays = sleepMoodPairs.filter(p => p.sleep >= 7);
          const avgMoodGoodSleep = goodSleepDays.length > 0
            ? goodSleepDays.reduce((sum, p) => sum + p.mood, 0) / goodSleepDays.length
            : 0;
          const poorSleepDays = sleepMoodPairs.filter(p => p.sleep < 6);
          const avgMoodPoorSleep = poorSleepDays.length > 0
            ? poorSleepDays.reduce((sum, p) => sum + p.mood, 0) / poorSleepDays.length
            : 0;
          
          if (avgMoodGoodSleep > avgMoodPoorSleep) {
            insights.push(`Your mood improves by ${Math.round((avgMoodGoodSleep - avgMoodPoorSleep) / avgMoodPoorSleep * 100)}% on days with 7+ hours of sleep.`);
          }
        } else if (correlations.sleepMoodCorrelation < -0.3) {
          insights.push('Interestingly, shorter sleep durations correlate with better mood for you. This may warrant further investigation.');
        }
      }

      // Exercise-Mood Correlation
      const exerciseDays = daysWithData.filter(day => 
        day.activities && day.activities.some(a => 
          a.toLowerCase().includes('exercise') || 
          a.toLowerCase().includes('workout') ||
          a.toLowerCase().includes('gym') ||
          a.toLowerCase().includes('run') ||
          a.toLowerCase().includes('yoga')
        )
      );
      
      if (exerciseDays.length >= 2 && moodScores.length >= 3) {
        const exerciseMoodAvg = exerciseDays
          .filter(day => day.mood)
          .reduce((sum, day) => sum + day.mood!.score, 0) / exerciseDays.filter(day => day.mood).length;
        const nonExerciseMoodAvg = daysWithData
          .filter(day => day.mood && !exerciseDays.includes(day))
          .reduce((sum, day) => sum + day.mood!.score, 0) / daysWithData.filter(day => day.mood && !exerciseDays.includes(day)).length;
        
        if (exerciseMoodAvg > nonExerciseMoodAvg + 0.5) {
          const improvement = Math.round((exerciseMoodAvg - nonExerciseMoodAvg) / nonExerciseMoodAvg * 100);
          insights.push(`Exercise days show ${improvement}% higher mood scores. Keep it up!`);
          correlations.exerciseMoodCorrelation = 0.5; // Positive correlation detected
        }
      }

      // Sleep-Clarity Correlation
      const sleepClarityPairs = detailedData
        .filter(day => day.sleep && day.mentalClarity?.score)
        .map(day => ({ sleep: day.sleep.hours, clarity: day.mentalClarity.score }));
      
      if (sleepClarityPairs.length >= 3) {
        correlations.sleepClarityCorrelation = this.calculateCorrelation(
          sleepClarityPairs.map(p => p.sleep),
          sleepClarityPairs.map(p => p.clarity)
        );

        if (correlations.sleepClarityCorrelation > 0.3) {
          const lowSleepClarity = sleepClarityPairs.filter(p => p.sleep < 6);
          if (lowSleepClarity.length > 0) {
            const avgClarityLowSleep = lowSleepClarity.reduce((sum, p) => sum + p.clarity, 0) / lowSleepClarity.length;
            if (avgClarityLowSleep < 6) {
              insights.push('Mental clarity dips significantly when sleep drops below 6 hours.');
            }
          }
        }
      }

      // Consistency insights
      if (daysWithData.length >= 20) {
        insights.push(`Great consistency! You've logged data for ${daysWithData.length} days this month.`);
      } else if (daysWithData.length >= 10) {
        insights.push(`You're building good tracking habits with ${daysWithData.length} days logged.`);
      }

      // Mood trend insight
      if (bestMoodDays > worstMoodDays * 2) {
        insights.push(`This was a great month! You had ${bestMoodDays} days with excellent mood.`);
      } else if (worstMoodDays > bestMoodDays) {
        insights.push(`Focus on self-care. Consider activities that typically boost your mood.`);
      }

      // Top activity insight
      if (topActivities.length > 0) {
        insights.push(`Your most frequent activities: ${topActivities.slice(0, 2).join(', ')}.`);
      }

      // Default insight if no specific patterns found
      if (insights.length === 0) {
        insights.push('Keep tracking to discover personalized patterns in your wellness data.');
      }

      console.log(`📊 Generated ${insights.length} insights`);

      return {
        data: {
          summary: {
            avgMood: Math.round(avgMood * 10) / 10,
            avgSleep: Math.round(avgSleep * 10) / 10,
            avgClarity: Math.round(avgClarity * 10) / 10,
            avgProductivity: Math.round(avgProductivity * 10) / 10,
            topActivities,
            totalDaysLogged: daysWithData.length,
            bestMoodDays,
            worstMoodDays,
          },
          insights,
          correlations,
        },
        error: null
      };
    } catch (error) {
      console.error('Error generating monthly summary:', error);
      return { data: null, error };
    }
  }

  /**
   * Calculate Pearson correlation coefficient between two arrays
   */
  private static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;
    return numerator / denominator;
  }

  /**
   * Generate well-being legend with day classifications and impact insights
   * Classifies days based on comprehensive well-being scores
   */
  static async getWellBeingLegend(userId: string, year: number, month: number): Promise<{ data: WellBeingLegend | null; error: any }> {
    try {
      console.log(`📊 Generating well-being legend for user ${userId}, ${year}-${month}`);
      
      // Calculate date range for the month
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      // Fetch calendar data for the month
      const { data: calendarData, error: calendarError } = await this.getCalendarData(userId, startDate, endDate);
      
      if (calendarError || !calendarData) {
        console.error('Error fetching calendar data:', calendarError);
        return { data: null, error: calendarError || 'No calendar data' };
      }

      // Filter days with mood data (primary classification criterion)
      const daysWithMood = calendarData.filter(day => day.mood?.score);

      console.log(`📊 Found ${daysWithMood.length} days with mood data`);

      if (daysWithMood.length === 0) {
        return {
          data: {
            summary: {
              greatDays: 0,
              goodDays: 0,
              fairDays: 0,
              toughDays: 0,
              totalDays: 0,
            },
            percentages: {
              greatDays: 0,
              goodDays: 0,
              fairDays: 0,
              toughDays: 0,
            },
            impactInsights: ['Start logging mood data to see your well-being distribution and patterns.'],
          },
          error: null
        };
      }

      // Classify each day based on mood score
      // Great Day: mood >= 4.5
      // Good Day: 3.5 <= mood < 4.5
      // Fair Day: 2.5 <= mood < 3.5
      // Tough Day: mood < 2.5
      let greatDays = 0;
      let goodDays = 0;
      let fairDays = 0;
      let toughDays = 0;

      const dayClassifications: { date: string; classification: string; mood: number; activities: string[] }[] = [];

      daysWithMood.forEach(day => {
        const moodScore = day.mood!.score;
        let classification = '';

        if (moodScore >= 4.5) {
          greatDays++;
          classification = 'great';
        } else if (moodScore >= 3.5) {
          goodDays++;
          classification = 'good';
        } else if (moodScore >= 2.5) {
          fairDays++;
          classification = 'fair';
        } else {
          toughDays++;
          classification = 'tough';
        }

        dayClassifications.push({
          date: day.date,
          classification,
          mood: moodScore,
          activities: day.activities || [],
        });
      });

      const totalDays = daysWithMood.length;

      // Calculate percentages
      const percentages = {
        greatDays: totalDays > 0 ? Math.round((greatDays / totalDays) * 1000) / 10 : 0,
        goodDays: totalDays > 0 ? Math.round((goodDays / totalDays) * 1000) / 10 : 0,
        fairDays: totalDays > 0 ? Math.round((fairDays / totalDays) * 1000) / 10 : 0,
        toughDays: totalDays > 0 ? Math.round((toughDays / totalDays) * 1000) / 10 : 0,
      };

      // Generate impact insights by analyzing activity-mood correlations
      const impactInsights: string[] = [];

      // Analyze activity correlations
      const activityMoodMap: { [activity: string]: { count: number; classifications: string[] } } = {};

      dayClassifications.forEach(day => {
        day.activities.forEach(activity => {
          if (!activityMoodMap[activity]) {
            activityMoodMap[activity] = { count: 0, classifications: [] };
          }
          activityMoodMap[activity].count++;
          activityMoodMap[activity].classifications.push(day.classification);
        });
      });

      // Find frequent activities (>= 5 occurrences) and their dominant mood classification
      const frequentActivities = Object.entries(activityMoodMap)
        .filter(([_, data]) => data.count >= 5)
        .sort((a, b) => b[1].count - a[1].count);

      frequentActivities.forEach(([activity, data]) => {
        const classificationCounts = {
          great: data.classifications.filter(c => c === 'great').length,
          good: data.classifications.filter(c => c === 'good').length,
          fair: data.classifications.filter(c => c === 'fair').length,
          tough: data.classifications.filter(c => c === 'tough').length,
        };

        const dominantClassification = Object.entries(classificationCounts)
          .sort((a, b) => b[1] - a[1])[0];

        const percentage = Math.round((dominantClassification[1] / data.count) * 100);

        if (percentage >= 60) {
          if (dominantClassification[0] === 'great') {
            impactInsights.push(`${data.count} days of ${activity} correlated with great mood (${percentage}%).`);
          } else if (dominantClassification[0] === 'good') {
            impactInsights.push(`${activity} appeared on ${data.count} good mood days.`);
          } else if (dominantClassification[0] === 'tough') {
            impactInsights.push(`${activity} present on ${data.count} tough days - consider alternatives.`);
          }
        }
      });

      // Analyze sleep patterns if available
      const daysWithSleep = calendarData.filter(day => day.sleep?.hours);
      if (daysWithSleep.length >= 5) {
        const greatDaysWithSleep = daysWithSleep.filter(day => {
          const classification = dayClassifications.find(d => d.date === day.date);
          return classification && classification.classification === 'great';
        });

        const avgSleepGreatDays = greatDaysWithSleep.length > 0
          ? greatDaysWithSleep.reduce((sum, day) => sum + (day.sleep?.hours || 0), 0) / greatDaysWithSleep.length
          : 0;

        const toughDaysWithSleep = daysWithSleep.filter(day => {
          const classification = dayClassifications.find(d => d.date === day.date);
          return classification && classification.classification === 'tough';
        });

        const avgSleepToughDays = toughDaysWithSleep.length > 0
          ? toughDaysWithSleep.reduce((sum, day) => sum + (day.sleep?.hours || 0), 0) / toughDaysWithSleep.length
          : 0;

        if (avgSleepGreatDays > avgSleepToughDays + 1) {
          impactInsights.push(`Great days averaged ${avgSleepGreatDays.toFixed(1)}h sleep vs ${avgSleepToughDays.toFixed(1)}h on tough days.`);
        } else if (avgSleepToughDays > 0 && avgSleepToughDays < 6) {
          impactInsights.push(`Low sleep (<6h) increased tough days by ${Math.round((toughDaysWithSleep.length / daysWithSleep.length) * 100)}%.`);
        }
      }

      // General distribution insights
      if (greatDays > totalDays * 0.4) {
        impactInsights.push(`Excellent month! ${Math.round((greatDays / totalDays) * 100)}% great days shows strong well-being.`);
      } else if (toughDays > totalDays * 0.3) {
        impactInsights.push(`${toughDays} tough days detected. Consider focusing on self-care activities.`);
      } else if (goodDays + greatDays > totalDays * 0.6) {
        impactInsights.push(`${Math.round(((goodDays + greatDays) / totalDays) * 100)}% positive days - great consistency!`);
      }

      // If no specific insights generated, provide general message
      if (impactInsights.length === 0) {
        impactInsights.push('Continue logging to reveal patterns between activities and mood.');
      }

      console.log(`📊 Generated ${impactInsights.length} impact insights`);

      return {
        data: {
          summary: {
            greatDays,
            goodDays,
            fairDays,
            toughDays,
            totalDays,
          },
          percentages,
          impactInsights: impactInsights.slice(0, 3), // Limit to top 3 insights
        },
        error: null
      };
    } catch (error) {
      console.error('Error generating well-being legend:', error);
      return { data: null, error };
    }
  }

  static async getActivityImpact(
    userId: string, 
    period: 'today' | 'week' | 'month' | 'year'
  ): Promise<{ data: ActivityImpactResult | null; error: any }> {
    try {
      console.log(`🎯 Calculating activity impact for period: ${period}`);

      // Calculate date range
      const now = new Date();
      let startDate: Date;
      let endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch all relevant data
      const [activitiesResult, moodsResult, sleepResult, clarityResult, productivityResult] = await Promise.all([
        ActivitiesService.getByDateRange(userId, startDateStr, endDateStr),
        MoodsService.getByDateRange(userId, startDateStr, endDateStr),
        SleepService.getByDateRange(userId, startDateStr, endDateStr),
        MentalClarityService.getByDateRange(userId, startDateStr, endDateStr),
        ProductivityService.getByDateRange(userId, startDateStr, endDateStr),
      ]);

      if (activitiesResult.error || moodsResult.error || sleepResult.error) {
        return { data: null, error: 'Failed to fetch activity impact data' };
      }

      const activities = activitiesResult.data || [];
      const moods = moodsResult.data || [];
      const sleepLogs = sleepResult.data || [];
      const clarityTests = clarityResult.data || [];
      const productivityLogs = productivityResult.data || [];

      if (activities.length === 0) {
        return {
          data: {
            activities: [],
            insights: ['Log activities to see their impact on your well-being.'],
            period,
            totalActivities: 0,
          },
          error: null
        };
      }

      // Group activities by name
      const activityGroups = new Map<string, any[]>();
      activities.forEach(activity => {
        const key = activity.name;
        if (!activityGroups.has(key)) {
          activityGroups.set(key, []);
        }
        activityGroups.get(key)!.push(activity);
      });

      console.log(`📊 Analyzing ${activityGroups.size} unique activities from ${activities.length} total logs`);

      // Calculate impact for each activity
      const activityImpacts: ActivityImpactData[] = [];

      for (const [activityName, activityLogs] of activityGroups.entries()) {
        const totalOccurrences = activityLogs.length;
        const frequencyPercent = Math.round((totalOccurrences / activities.length) * 100);

        // Get the first log for category/emoji
        const sampleActivity = activityLogs[0];

        // Calculate changes and correlations
        let moodChanges: number[] = [];
        let sleepChanges: number[] = [];
        let clarityChanges: number[] = [];
        let productivityChanges: number[] = [];

        // For each activity occurrence, calculate before/after changes
        activityLogs.forEach(activity => {
          const activityDate = new Date(activity.date);

          // Mood impact: compare day of activity vs day before
          const dayOfMood = moods.find(m => m.date === activity.date);
          const dayBefore = new Date(activityDate);
          dayBefore.setDate(dayBefore.getDate() - 1);
          const dayBeforeMood = moods.find(m => m.date === dayBefore.toISOString().split('T')[0]);

          if (dayOfMood && dayBeforeMood) {
            moodChanges.push(dayOfMood.score - dayBeforeMood.score);
          }

          // Sleep impact: compare night after activity vs night before
          const nightAfterSleep = sleepLogs.find(s => s.date === activity.date);
          const nightBeforeSleep = sleepLogs.find(s => s.date === dayBefore.toISOString().split('T')[0]);

          if (nightAfterSleep && nightBeforeSleep) {
            sleepChanges.push(nightAfterSleep.quality - nightBeforeSleep.quality);
          }

          // Clarity impact: compare same-day or day after vs day before
          const dayOfClarity = clarityTests.find(c => c.date === activity.date);
          const dayBeforeClarity = clarityTests.find(c => c.date === dayBefore.toISOString().split('T')[0]);

          if (dayOfClarity && dayBeforeClarity) {
            clarityChanges.push(dayOfClarity.score - dayBeforeClarity.score);
          }

          // Productivity impact: compare day of vs day before
          const dayOfProductivity = productivityLogs.find(p => p.date === activity.date);
          const dayBeforeProductivity = productivityLogs.find(p => p.date === dayBefore.toISOString().split('T')[0]);

          if (dayOfProductivity && dayBeforeProductivity) {
            productivityChanges.push(dayOfProductivity.rating - dayBeforeProductivity.rating);
          }
        });

        // Calculate averages
        const avgMoodChange = moodChanges.length > 0
          ? moodChanges.reduce((a, b) => a + b, 0) / moodChanges.length
          : 0;

        const avgSleepChange = sleepChanges.length > 0
          ? sleepChanges.reduce((a, b) => a + b, 0) / sleepChanges.length
          : 0;

        const avgClarityChange = clarityChanges.length > 0
          ? clarityChanges.reduce((a, b) => a + b, 0) / clarityChanges.length
          : 0;

        const avgProductivityChange = productivityChanges.length > 0
          ? productivityChanges.reduce((a, b) => a + b, 0) / productivityChanges.length
          : 0;

        // Calculate Pearson correlations
        const moodCorrelation = this.calculateCorrelation(
          activityLogs.map(() => 1), // presence of activity
          moodChanges.length > 0 ? moodChanges : [0]
        );

        const sleepCorrelation = this.calculateCorrelation(
          activityLogs.map(() => 1),
          sleepChanges.length > 0 ? sleepChanges : [0]
        );

        const clarityCorrelation = this.calculateCorrelation(
          activityLogs.map(() => 1),
          clarityChanges.length > 0 ? clarityChanges : [0]
        );

        const productivityCorrelation = this.calculateCorrelation(
          activityLogs.map(() => 1),
          productivityChanges.length > 0 ? productivityChanges : [0]
        );

        // Calculate composite impact score (0-100)
        const impactScore = Math.min(100, Math.max(0, Math.round(
          (avgMoodChange * 10) +
          (avgSleepChange * 10) +
          (avgClarityChange * 10) +
          (avgProductivityChange * 10) +
          50 // baseline
        )));

        // Determine trend
        let trend: 'up' | 'down' | 'flat' = 'flat';
        const totalChange = avgMoodChange + avgSleepChange + avgClarityChange + avgProductivityChange;
        if (totalChange > 0.5) trend = 'up';
        else if (totalChange < -0.5) trend = 'down';

        // Determine confidence based on sample size
        let confidence: 'high' | 'medium' | 'low' = 'low';
        const totalDataPoints = moodChanges.length + sleepChanges.length + clarityChanges.length + productivityChanges.length;
        if (totalDataPoints >= 20) confidence = 'high';
        else if (totalDataPoints >= 10) confidence = 'medium';

        activityImpacts.push({
          activityName,
          category: sampleActivity.category,
          emoji: sampleActivity.emoji || '📌',
          totalOccurrences,
          frequencyPercent,
          avgMoodChange,
          avgSleepChange,
          avgClarityChange,
          avgProductivityChange,
          impactScore,
          trend,
          confidence,
          correlations: {
            mood: moodCorrelation,
            sleep: sleepCorrelation,
            clarity: clarityCorrelation,
            productivity: productivityCorrelation,
          },
        });
      }

      // Sort by impact score descending
      activityImpacts.sort((a, b) => b.impactScore - a.impactScore);

      // Generate insights
      const insights: string[] = [];

      // Top positive impact
      const topPositive = activityImpacts.filter(a => a.impactScore > 55).slice(0, 3);
      if (topPositive.length > 0) {
        const names = topPositive.map(a => a.activityName).join(', ');
        insights.push(`${names} showed the strongest positive impact on your well-being.`);
      }

      // Top negative impact
      const topNegative = activityImpacts.filter(a => a.impactScore < 45).slice(0, 2);
      if (topNegative.length > 0) {
        const names = topNegative.map(a => a.activityName).join(', ');
        insights.push(`${names} correlated with lower well-being metrics - consider alternatives.`);
      }

      // Most frequent activity
      const mostFrequent = activityImpacts.sort((a, b) => b.frequencyPercent - a.frequencyPercent)[0];
      if (mostFrequent && mostFrequent.frequencyPercent >= 15) {
        insights.push(`${mostFrequent.activityName} accounted for ${mostFrequent.frequencyPercent}% of your activities.`);
      }

      // Strong mood booster
      const strongMoodBooster = activityImpacts.find(a => a.avgMoodChange > 0.5 && a.confidence !== 'low');
      if (strongMoodBooster) {
        insights.push(`${strongMoodBooster.activityName} consistently improved mood by ${strongMoodBooster.avgMoodChange.toFixed(1)} points.`);
      }

      // Sleep quality impact
      const sleepBooster = activityImpacts.find(a => a.avgSleepChange > 0.5 && a.confidence !== 'low');
      if (sleepBooster) {
        insights.push(`${sleepBooster.activityName} enhanced sleep quality by ${sleepBooster.avgSleepChange.toFixed(1)} points.`);
      }

      // Default insight
      if (insights.length === 0) {
        insights.push('Continue logging to reveal activity impact patterns.');
      }

      console.log(`✅ Generated ${activityImpacts.length} activity impacts with ${insights.length} insights`);

      // Re-sort by impact score for final output
      activityImpacts.sort((a, b) => b.impactScore - a.impactScore);

      return {
        data: {
          activities: activityImpacts,
          insights: insights.slice(0, 3), // Top 3 insights
          period,
          totalActivities: activities.length,
        },
        error: null
      };
    } catch (error) {
      console.error('Error calculating activity impact:', error);
      return { data: null, error };
    }
  }

  static async getMoodScoreAnalysis(
    userId: string,
    period: 'today' | 'week' | 'month' | 'year' = 'month'
  ): Promise<{ data: MoodScoreAnalysis | null; error: any }> {
    try {
      console.log(`📊 Calculating mood score analysis for period: ${period}`);

      // Calculate date range
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          break;
        case 'week':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          break;
        case 'month':
          startDate = new Date(now);
          startDate.setMonth(now.getMonth() - 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          break;
        case 'year':
          startDate = new Date(now);
          startDate.setFullYear(now.getFullYear() - 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          break;
      }

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      console.log(`📅 Date range: ${startDateStr} to ${endDateStr}`);

      // Fetch mood data
      const moodsResult = await MoodsService.getByDateRange(userId, startDateStr, endDateStr);

      if (moodsResult.error) {
        return { data: null, error: moodsResult.error };
      }

      const moods = moodsResult.data || [];
      
      console.log(`✅ Fetched ${moods.length} mood entries for period: ${period}`);
      if (moods.length > 0) {
        console.log(`📊 Mood dates range from ${moods[0].date} to ${moods[moods.length - 1].date}`);
        console.log('📝 Mood entries:', moods.map(m => `${m.date}: ${m.score} ${m.emoji}`).join(', '));
      }

      if (moods.length === 0) {
        return {
          data: {
            averageMood: 0,
            trend: 'stable',
            moodDistribution: { great: 0, good: 0, fair: 0, tough: 0 },
            bestMoodDay: null,
            lowestMoodDay: null,
            period: this.getPeriodLabel(period),
            totalEntries: 0,
            weekComparison: null,
            insights: ['No mood data logged yet. Start tracking today!'],
          },
          error: null
        };
      }

      // Calculate average mood
      const totalScore = moods.reduce((sum, mood) => sum + mood.score, 0);
      const averageMood = parseFloat((totalScore / moods.length).toFixed(2));

      // Calculate mood distribution
      const moodDistribution = {
        great: moods.filter(m => m.score === 5).length,
        good: moods.filter(m => m.score === 4).length,
        fair: moods.filter(m => m.score === 3).length,
        tough: moods.filter(m => m.score <= 2).length,
      };

      console.log(`📊 Calculations - Average: ${averageMood}, Total Entries: ${moods.length}`);
      console.log(`📊 Distribution - Great: ${moodDistribution.great}, Good: ${moodDistribution.good}, Fair: ${moodDistribution.fair}, Tough: ${moodDistribution.tough}`);

      // Find best and worst mood days
      const sortedByScore = [...moods].sort((a, b) => b.score - a.score);
      const bestMoodDay = sortedByScore[0] ? {
        date: sortedByScore[0].date,
        score: sortedByScore[0].score,
        emoji: sortedByScore[0].emoji
      } : null;

      const lowestMoodDay = sortedByScore[sortedByScore.length - 1] ? {
        date: sortedByScore[sortedByScore.length - 1].date,
        score: sortedByScore[sortedByScore.length - 1].score,
        emoji: sortedByScore[sortedByScore.length - 1].emoji
      } : null;

      // Calculate trend (compare first half vs second half)
      const midpoint = Math.floor(moods.length / 2);
      const firstHalf = moods.slice(0, midpoint);
      const secondHalf = moods.slice(midpoint);

      const firstHalfAvg = firstHalf.length > 0
        ? firstHalf.reduce((sum, m) => sum + m.score, 0) / firstHalf.length
        : 0;

      const secondHalfAvg = secondHalf.length > 0
        ? secondHalf.reduce((sum, m) => sum + m.score, 0) / secondHalf.length
        : 0;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (secondHalfAvg > firstHalfAvg + 0.3) trend = 'up';
      else if (secondHalfAvg < firstHalfAvg - 0.3) trend = 'down';

      // Week comparison (only for month/year periods, not today or week)
      let weekComparison = null;
      if (period !== 'today' && period !== 'week' && moods.length >= 7) {
        const last7Days = moods.filter(m => {
          const moodDate = new Date(m.date);
          const daysDiff = Math.floor((now.getTime() - moodDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7;
        });

        const previous7Days = moods.filter(m => {
          const moodDate = new Date(m.date);
          const daysDiff = Math.floor((now.getTime() - moodDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff > 7 && daysDiff <= 14;
        });

        if (last7Days.length > 0 && previous7Days.length > 0) {
          const thisWeekAvg = last7Days.reduce((sum, m) => sum + m.score, 0) / last7Days.length;
          const lastWeekAvg = previous7Days.reduce((sum, m) => sum + m.score, 0) / previous7Days.length;
          const change = parseFloat((thisWeekAvg - lastWeekAvg).toFixed(2));

          weekComparison = {
            thisWeekAvg: parseFloat(thisWeekAvg.toFixed(2)),
            lastWeekAvg: parseFloat(lastWeekAvg.toFixed(2)),
            change,
          };
        }
      }

      // Generate insights
      const insights: string[] = [];

      // Trend insight
      if (trend === 'up') {
        insights.push(`Your mood is improving! Average ${averageMood}/5 and trending upward.`);
      } else if (trend === 'down') {
        insights.push(`Your mood has been declining. Consider self-care activities.`);
      } else {
        insights.push(`Your mood is stable at ${averageMood}/5. Keep up the consistency!`);
      }

      // Week comparison insight
      if (weekComparison) {
        if (weekComparison.change > 0.5) {
          insights.push(`This week feels better than last (+${weekComparison.change.toFixed(1)} points).`);
        } else if (weekComparison.change < -0.5) {
          insights.push(`This week is tougher than last (${weekComparison.change.toFixed(1)} points).`);
        }
      }

      // Distribution insight
      const totalDays = moods.length;
      const greatPercentage = Math.round((moodDistribution.great / totalDays) * 100);
      const toughPercentage = Math.round((moodDistribution.tough / totalDays) * 100);

      if (greatPercentage >= 50) {
        insights.push(`${greatPercentage}% of days were great! Excellent well-being.`);
      } else if (toughPercentage >= 30) {
        insights.push(`${toughPercentage}% tough days. Try stress-relief activities.`);
      } else if (moodDistribution.good + moodDistribution.great >= totalDays * 0.7) {
        insights.push(`${Math.round(((moodDistribution.good + moodDistribution.great) / totalDays) * 100)}% positive days - great consistency!`);
      }

      // Best day insight
      if (bestMoodDay && bestMoodDay.score === 5) {
        const date = new Date(bestMoodDay.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        insights.push(`Your best day was ${dayName} ${bestMoodDay.emoji}`);
      }

      console.log(`✅ Generated mood analysis: ${averageMood}/5, ${trend} trend, ${insights.length} insights`);

      return {
        data: {
          averageMood,
          trend,
          moodDistribution,
          bestMoodDay,
          lowestMoodDay,
          period: this.getPeriodLabel(period),
          totalEntries: moods.length,
          weekComparison,
          insights: insights.slice(0, 3), // Top 3 insights
        },
        error: null
      };
    } catch (error) {
      console.error('Error calculating mood score analysis:', error);
      return { data: null, error };
    }
  }

  private static getPeriodLabel(period: 'today' | 'week' | 'month' | 'year' | 'all'): string {
    const now = new Date();
    switch (period) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'year':
        return now.getFullYear().toString();
      case 'all':
        return 'All Time';
      default:
        return 'Unknown Period';
    }
  }

  /**
   * Comprehensive sleep tracking analysis
   * Analyzes sleep patterns across different time periods with visualizations
   */
  static async getSleepTrackingAnalysis(
    userId: string,
    period: 'week' | 'month' | 'year',
    sleepTarget: number = 8.0
  ): Promise<{
    data: {
      summary: {
        avgSleep: number;
        target: number;
        daysMetTarget: number;
        daysBelowTarget: number;
        bestNight: { date: string; hours: number } | null;
        worstNight: { date: string; hours: number } | null;
        totalNights: number;
        consistency: number; // 0-100 score
        qualityAvg: number; // 1-5
      };
      dailyData: Array<{
        date: string;
        duration: number;
        quality: number;
        metTarget: boolean;
        status: 'excellent' | 'good' | 'fair' | 'poor';
        bedtime: string;
        wakeTime: string;
      }>;
      weeklyData?: Array<{
        weekStart: string;
        weekEnd: string;
        avgDuration: number;
        avgQuality: number;
        daysLogged: number;
      }>;
      monthlyData?: Array<{
        month: string;
        year: number;
        avgDuration: number;
        avgQuality: number;
        daysLogged: number;
      }>;
      insights: string[];
      period: string;
    } | null;
    error: any;
  }> {
    try {
      console.log(`🛌 Analyzing sleep data for ${period}...`);

      // Calculate date range
      const now = new Date();
      const endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      
      let startDate = new Date(now);
      
      if (period === 'week') {
        startDate.setDate(now.getDate() - 6);
      } else if (period === 'month') {
        startDate.setDate(1);
      } else if (period === 'year') {
        startDate.setMonth(0, 1);
      }
      startDate.setHours(0, 0, 0, 0);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      console.log(`📅 Sleep date range: ${startDateStr} to ${endDateStr}`);

      // Fetch sleep logs
      const sleepResult = await SleepService.getByDateRange(userId, startDateStr, endDateStr);

      if (sleepResult.error) {
        console.error('❌ Error fetching sleep logs:', sleepResult.error);
        return { data: null, error: sleepResult.error };
      }

      const sleepLogs = sleepResult.data || [];
      console.log(`✅ Fetched ${sleepLogs.length} sleep logs`);

      if (sleepLogs.length === 0) {
        return {
          data: {
            summary: {
              avgSleep: 0,
              target: sleepTarget,
              daysMetTarget: 0,
              daysBelowTarget: 0,
              bestNight: null,
              worstNight: null,
              totalNights: 0,
              consistency: 0,
              qualityAvg: 0,
            },
            dailyData: [],
            insights: ['No sleep data logged yet. Start tracking your sleep to see patterns!'],
            period: this.getPeriodLabel(period),
          },
          error: null,
        };
      }

      // Process daily data
      const dailyData = sleepLogs.map(log => {
        const hours = Number(log.hours);
        const quality = Number(log.quality);
        const metTarget = hours >= sleepTarget - 0.5 && hours <= sleepTarget + 2;
        
        let status: 'excellent' | 'good' | 'fair' | 'poor';
        if (hours >= sleepTarget && quality >= 4) status = 'excellent';
        else if (hours >= sleepTarget - 1 && quality >= 3) status = 'good';
        else if (hours >= sleepTarget - 2) status = 'fair';
        else status = 'poor';

        return {
          date: log.date,
          duration: hours,
          quality,
          metTarget,
          status,
          bedtime: log.bedtime,
          wakeTime: log.wake_time,
        };
      });

      // Calculate summary statistics
      const totalHours = dailyData.reduce((sum, d) => sum + d.duration, 0);
      const avgSleep = totalHours / dailyData.length;
      const daysMetTarget = dailyData.filter(d => d.metTarget).length;
      const daysBelowTarget = dailyData.length - daysMetTarget;
      
      const avgQuality = dailyData.reduce((sum, d) => sum + d.quality, 0) / dailyData.length;
      
      // Find best and worst nights
      const sortedByDuration = [...dailyData].sort((a, b) => b.duration - a.duration);
      const bestNight = sortedByDuration[0] ? { date: sortedByDuration[0].date, hours: sortedByDuration[0].duration } : null;
      const worstNight = sortedByDuration[sortedByDuration.length - 1] ? { date: sortedByDuration[sortedByDuration.length - 1].date, hours: sortedByDuration[sortedByDuration.length - 1].duration } : null;

      // Calculate consistency score (based on standard deviation)
      const mean = avgSleep;
      const variance = dailyData.reduce((sum, d) => sum + Math.pow(d.duration - mean, 2), 0) / dailyData.length;
      const stdDev = Math.sqrt(variance);
      const consistency = Math.max(0, Math.min(100, 100 - (stdDev * 20))); // Lower stdDev = higher consistency

      // Calculate weekly data (for month and year views)
      let weeklyData: Array<{
        weekStart: string;
        weekEnd: string;
        avgDuration: number;
        avgQuality: number;
        daysLogged: number;
      }> | undefined;

      if (period === 'month' || period === 'year') {
        const weeks = new Map<string, typeof dailyData>();
        
        dailyData.forEach(day => {
          const date = new Date(day.date);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
          const weekKey = weekStart.toISOString().split('T')[0];
          
          if (!weeks.has(weekKey)) {
            weeks.set(weekKey, []);
          }
          weeks.get(weekKey)!.push(day);
        });

        weeklyData = Array.from(weeks.entries()).map(([weekStart, days]) => {
          const weekStartDate = new Date(weekStart);
          const weekEndDate = new Date(weekStartDate);
          weekEndDate.setDate(weekStartDate.getDate() + 6);
          
          return {
            weekStart,
            weekEnd: weekEndDate.toISOString().split('T')[0],
            avgDuration: days.reduce((sum, d) => sum + d.duration, 0) / days.length,
            avgQuality: days.reduce((sum, d) => sum + d.quality, 0) / days.length,
            daysLogged: days.length,
          };
        }).sort((a, b) => a.weekStart.localeCompare(b.weekStart));
      }

      // Calculate monthly data (for year view)
      let monthlyData: Array<{
        month: string;
        year: number;
        avgDuration: number;
        avgQuality: number;
        daysLogged: number;
      }> | undefined;

      if (period === 'year') {
        const months = new Map<string, typeof dailyData>();
        
        dailyData.forEach(day => {
          const date = new Date(day.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!months.has(monthKey)) {
            months.set(monthKey, []);
          }
          months.get(monthKey)!.push(day);
        });

        monthlyData = Array.from(months.entries()).map(([monthKey, days]) => {
          const [year, month] = monthKey.split('-');
          const monthName = new Date(parseInt(year), parseInt(month) - 1, 1).toLocaleDateString('en-US', { month: 'long' });
          
          return {
            month: monthName,
            year: parseInt(year),
            avgDuration: days.reduce((sum, d) => sum + d.duration, 0) / days.length,
            avgQuality: days.reduce((sum, d) => sum + d.quality, 0) / days.length,
            daysLogged: days.length,
          };
        }).sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return new Date(`${a.month} 1, ${a.year}`).getMonth() - new Date(`${b.month} 1, ${b.year}`).getMonth();
        });
      }

      // Generate insights
      const insights: string[] = [];

      // Target achievement insight
      const targetPercentage = Math.round((daysMetTarget / dailyData.length) * 100);
      if (targetPercentage >= 80) {
        insights.push(`🎉 Excellent! You met your sleep target ${targetPercentage}% of the time.`);
      } else if (targetPercentage >= 60) {
        insights.push(`👍 You met your sleep target ${daysMetTarget} out of ${dailyData.length} nights (${targetPercentage}%).`);
      } else {
        insights.push(`💡 You're achieving your sleep target ${targetPercentage}% of nights. Aim for consistency!`);
      }

      // Average sleep insight
      if (avgSleep >= sleepTarget) {
        insights.push(`✨ Great job! Average sleep: ${avgSleep.toFixed(1)}h (target: ${sleepTarget}h).`);
      } else {
        const shortfall = sleepTarget - avgSleep;
        insights.push(`⏰ You're averaging ${avgSleep.toFixed(1)}h, about ${shortfall.toFixed(1)}h below your ${sleepTarget}h target.`);
      }

      // Quality insight
      if (avgQuality >= 4) {
        insights.push(`😴 Sleep quality is excellent (${avgQuality.toFixed(1)}/5). Keep up your routine!`);
      } else if (avgQuality >= 3) {
        insights.push(`😊 Sleep quality is good (${avgQuality.toFixed(1)}/5).`);
      } else {
        insights.push(`😔 Sleep quality could improve (${avgQuality.toFixed(1)}/5). Consider sleep hygiene tips.`);
      }

      // Consistency insight
      if (consistency >= 80) {
        insights.push(`📊 Your sleep schedule is very consistent (${Math.round(consistency)}% score)!`);
      } else if (consistency < 60) {
        insights.push(`📊 Your sleep timing varies. Try going to bed at the same time each night.`);
      }

      // Best/worst night insight
      if (bestNight && worstNight && bestNight.hours - worstNight.hours >= 3) {
        insights.push(`📉 Sleep varies from ${worstNight.hours}h to ${bestNight.hours}h. Aim for more consistency.`);
      }

      // Day-of-week pattern insight (for week/month)
      if (period === 'week' || period === 'month') {
        const dayOfWeekMap = new Map<number, number[]>();
        dailyData.forEach(day => {
          const dayOfWeek = new Date(day.date).getDay();
          if (!dayOfWeekMap.has(dayOfWeek)) {
            dayOfWeekMap.set(dayOfWeek, []);
          }
          dayOfWeekMap.get(dayOfWeek)!.push(day.duration);
        });

        const dayAverages = Array.from(dayOfWeekMap.entries()).map(([day, hours]) => ({
          day,
          avg: hours.reduce((sum, h) => sum + h, 0) / hours.length,
          count: hours.length,
        })).filter(d => d.count >= 2); // Only consider days with at least 2 data points

        if (dayAverages.length >= 3) {
          const sortedDays = dayAverages.sort((a, b) => a.avg - b.avg);
          const worstDay = sortedDays[0];
          const bestDay = sortedDays[sortedDays.length - 1];
          
          if (bestDay.avg - worstDay.avg >= 1.5) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            insights.push(`📅 You sleep best on ${dayNames[bestDay.day]}s (${bestDay.avg.toFixed(1)}h) and least on ${dayNames[worstDay.day]}s (${worstDay.avg.toFixed(1)}h).`);
          }
        }
      }

      console.log(`✅ Sleep analysis complete: ${avgSleep.toFixed(1)}h avg, ${targetPercentage}% target achievement`);

      return {
        data: {
          summary: {
            avgSleep: parseFloat(avgSleep.toFixed(1)),
            target: sleepTarget,
            daysMetTarget,
            daysBelowTarget,
            bestNight,
            worstNight,
            totalNights: dailyData.length,
            consistency: Math.round(consistency),
            qualityAvg: parseFloat(avgQuality.toFixed(1)),
          },
          dailyData,
          weeklyData,
          monthlyData,
          insights: insights.slice(0, 4), // Top 4 insights
          period: this.getPeriodLabel(period),
        },
        error: null,
      };
    } catch (error) {
      console.error('❌ Error analyzing sleep data:', error);
      return { data: null, error };
    }
  }

  /**
   * Intelligent Habit Tracking Analysis
   * Correlates habit completion with wellness outcomes (mood, sleep, clarity)
   */
  static async analyzeUserHabits(
    userId: string,
    period: 'week' | 'month' | 'all' = 'month'
  ): Promise<{
    data: {
      habits: Array<{
        id: string;
        name: string;
        category: string;
        emoji: string;
        progress: number;
        completionRate: number;
        currentStreak: number;
        bestStreak: number;
        status: 'active' | 'completed' | 'paused';
        correlations: {
          mood: number;
          sleep: number;
          clarity: number;
        };
        impact: 'high' | 'medium' | 'low' | 'none';
        recommendation: string;
        trend: 'up' | 'down' | 'stable';
      }>;
      summary: {
        totalActive: number;
        totalCompleted: number;
        avgProgress: number;
        avgCompletionRate: number;
        mostPositiveHabit: string | null;
        needsAttention: string | null;
        bestCategory: string | null;
      };
      insights: string[];
      period: string;
    } | null;
    error: any;
  }> {
    try {
      console.log(`💪 Analyzing habits for period: ${period}...`);

      // Calculate date range
      const now = new Date();
      const endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      
      let startDate = new Date(now);
      if (period === 'week') {
        startDate.setDate(now.getDate() - 6);
      } else if (period === 'month') {
        startDate.setDate(now.getDate() - 29);
      } else {
        startDate.setDate(now.getDate() - 89); // 90 days for 'all'
      }
      startDate.setHours(0, 0, 0, 0);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      console.log(`📅 Habit analysis date range: ${startDateStr} to ${endDateStr}`);

      // Fetch habits and their logs in parallel
      const [habitsResult, habitLogsResult, moodsResult, sleepResult, clarityResult] = await Promise.all([
        HabitsService.getAll(userId),
        HabitsService.getHabitLogsByDateRange(userId, startDateStr, endDateStr),
        MoodsService.getByDateRange(userId, startDateStr, endDateStr),
        SleepService.getByDateRange(userId, startDateStr, endDateStr),
        MentalClarityService.getByDateRange(userId, startDateStr, endDateStr),
      ]);

      if (habitsResult.error || !habitsResult.data) {
        console.error('❌ Error fetching habits:', habitsResult.error);
        return { data: null, error: habitsResult.error };
      }

      const habits = habitsResult.data || [];
      const habitLogs = habitLogsResult.data || [];
      const moods = moodsResult.data || [];
      const sleeps = sleepResult.data || [];
      const clarityTests = clarityResult.data || [];

      console.log(`✅ Fetched ${habits.length} habits, ${habitLogs.length} logs`);

      if (habits.length === 0) {
        return {
          data: {
            habits: [],
            summary: {
              totalActive: 0,
              totalCompleted: 0,
              avgProgress: 0,
              avgCompletionRate: 0,
              mostPositiveHabit: null,
              needsAttention: null,
              bestCategory: null,
            },
            insights: ['Start tracking habits to see how they impact your wellness!'],
            period: this.getPeriodLabel(period),
          },
          error: null,
        };
      }

      // Create wellness data maps by date
      const moodMap = new Map(moods.map(m => [m.date, m.score]));
      const sleepMap = new Map(sleeps.map(s => [s.date, Number(s.hours)]));
      const clarityMap = new Map(clarityTests.map(c => [c.date, c.score]));

      // Group logs by habit
      const logsByHabit = new Map<string, any[]>();
      habitLogs.forEach(log => {
        if (!logsByHabit.has(log.habit_id)) {
          logsByHabit.set(log.habit_id, []);
        }
        logsByHabit.get(log.habit_id)!.push(log);
      });

      // Calculate days in period
      const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      // Analyze each habit
      const analyzedHabits = habits.map(habit => {
        const logs = logsByHabit.get(habit.id) || [];
        const completedLogs = logs.filter(log => log.completed);

        // Calculate completion rate
        const completionRate = daysInPeriod > 0 ? (completedLogs.length / daysInPeriod) * 100 : 0;

        // Calculate current streak
        let currentStreak = 0;
        const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        for (const log of sortedLogs) {
          if (log.completed) {
            currentStreak++;
          } else {
            break;
          }
        }

        // Calculate best streak
        let bestStreak = 0;
        let tempStreak = 0;
        const chronologicalLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        chronologicalLogs.forEach(log => {
          if (log.completed) {
            tempStreak++;
            bestStreak = Math.max(bestStreak, tempStreak);
          } else {
            tempStreak = 0;
          }
        });

        // Calculate correlations with wellness metrics
        const correlations = this.calculateHabitWellnessCorrelations(
          completedLogs.map(l => l.date),
          moodMap,
          sleepMap,
          clarityMap
        );

        // Determine impact level
        const avgCorrelation = (Math.abs(correlations.mood) + Math.abs(correlations.sleep) + Math.abs(correlations.clarity)) / 3;
        let impact: 'high' | 'medium' | 'low' | 'none';
        if (avgCorrelation >= 0.3) impact = 'high';
        else if (avgCorrelation >= 0.15) impact = 'medium';
        else if (avgCorrelation >= 0.05) impact = 'low';
        else impact = 'none';

        // Determine trend
        const recentLogs = logs.slice(-7);
        const olderLogs = logs.slice(-14, -7);
        const recentRate = recentLogs.filter(l => l.completed).length / Math.max(recentLogs.length, 1);
        const olderRate = olderLogs.filter(l => l.completed).length / Math.max(olderLogs.length, 1);
        let trend: 'up' | 'down' | 'stable';
        if (recentRate > olderRate + 0.2) trend = 'up';
        else if (recentRate < olderRate - 0.2) trend = 'down';
        else trend = 'stable';

        // Generate smart recommendation
        const recommendation = this.generateHabitRecommendation(
          habit.name,
          completionRate,
          correlations,
          impact,
          trend,
          currentStreak
        );

        // Calculate progress (percentage toward streak goal)
        const progress = habit.streak_goal ? Math.min((currentStreak / habit.streak_goal) * 100, 100) : completionRate;

        return {
          id: habit.id,
          name: habit.name,
          category: habit.category,
          emoji: habit.emoji || '✨',
          progress: Math.round(progress),
          completionRate: Math.round(completionRate),
          currentStreak,
          bestStreak,
          status: 'active' as const,
          correlations,
          impact,
          recommendation,
          trend,
        };
      });

      // Sort by impact and completion rate
      analyzedHabits.sort((a, b) => {
        const impactWeight = { high: 3, medium: 2, low: 1, none: 0 };
        return (impactWeight[b.impact] * 100 + b.completionRate) - (impactWeight[a.impact] * 100 + a.completionRate);
      });

      // Calculate summary statistics
      const activeHabits = analyzedHabits.filter(h => h.status === 'active');
      const totalActive = activeHabits.length;
      const totalCompleted = 0; // Would need status field in habits table
      const avgProgress = totalActive > 0 ? analyzedHabits.reduce((sum, h) => sum + h.progress, 0) / totalActive : 0;
      const avgCompletionRate = totalActive > 0 ? analyzedHabits.reduce((sum, h) => sum + h.completionRate, 0) / totalActive : 0;

      // Find most positive habit (highest positive correlations)
      const positiveHabits = analyzedHabits.filter(h => 
        h.correlations.mood > 0 || h.correlations.sleep > 0 || h.correlations.clarity > 0
      );
      const mostPositiveHabit = positiveHabits.length > 0 ? positiveHabits[0].name : null;

      // Find habit needing attention (low completion + declining trend)
      const needsAttentionHabits = analyzedHabits.filter(h => h.completionRate < 50 && h.trend === 'down');
      const needsAttention = needsAttentionHabits.length > 0 ? needsAttentionHabits[0].name : null;

      // Find best category
      const categoryScores = new Map<string, number>();
      analyzedHabits.forEach(h => {
        const score = categoryScores.get(h.category) || 0;
        categoryScores.set(h.category, score + h.completionRate);
      });
      let bestCategory: string | null = null;
      let bestScore = 0;
      categoryScores.forEach((score, category) => {
        if (score > bestScore) {
          bestScore = score;
          bestCategory = category;
        }
      });

      // Generate insights
      const insights = this.generateHabitInsights(
        analyzedHabits,
        avgCompletionRate,
        mostPositiveHabit,
        needsAttention,
        bestCategory
      );

      console.log(`✅ Habit analysis complete: ${totalActive} active habits, ${avgCompletionRate.toFixed(0)}% avg completion`);

      return {
        data: {
          habits: analyzedHabits,
          summary: {
            totalActive,
            totalCompleted,
            avgProgress: Math.round(avgProgress),
            avgCompletionRate: Math.round(avgCompletionRate),
            mostPositiveHabit,
            needsAttention,
            bestCategory,
          },
          insights,
          period: this.getPeriodLabel(period),
        },
        error: null,
      };
    } catch (error) {
      console.error('❌ Error analyzing habits:', error);
      return { data: null, error };
    }
  }

  /**
   * Calculate correlations between habit completion and wellness metrics
   */
  private static calculateHabitWellnessCorrelations(
    completedDates: string[],
    moodMap: Map<string, number>,
    sleepMap: Map<string, number>,
    clarityMap: Map<string, number>
  ): { mood: number; sleep: number; clarity: number } {
    if (completedDates.length === 0) {
      return { mood: 0, sleep: 0, clarity: 0 };
    }

    // Calculate average wellness on days habit was completed vs. not completed
    const completedSet = new Set(completedDates);
    
    let moodOnCompleted: number[] = [];
    let moodOnNotCompleted: number[] = [];
    let sleepOnCompleted: number[] = [];
    let sleepOnNotCompleted: number[] = [];
    let clarityOnCompleted: number[] = [];
    let clarityOnNotCompleted: number[] = [];

    // Collect wellness scores for completed and non-completed days
    const allDates = new Set([...moodMap.keys(), ...sleepMap.keys(), ...clarityMap.keys()]);
    
    allDates.forEach(date => {
      const isCompleted = completedSet.has(date);
      
      if (moodMap.has(date)) {
        const mood = moodMap.get(date)!;
        (isCompleted ? moodOnCompleted : moodOnNotCompleted).push(mood);
      }
      
      if (sleepMap.has(date)) {
        const sleep = sleepMap.get(date)!;
        (isCompleted ? sleepOnCompleted : sleepOnNotCompleted).push(sleep);
      }
      
      if (clarityMap.has(date)) {
        const clarity = clarityMap.get(date)!;
        (isCompleted ? clarityOnCompleted : clarityOnNotCompleted).push(clarity);
      }
    });

    // Calculate simple correlation (difference in averages, normalized)
    const calcCorr = (completed: number[], notCompleted: number[]) => {
      if (completed.length === 0 || notCompleted.length === 0) return 0;
      const avgCompleted = completed.reduce((sum, v) => sum + v, 0) / completed.length;
      const avgNotCompleted = notCompleted.reduce((sum, v) => sum + v, 0) / notCompleted.length;
      // Normalize to -1 to 1 range
      return parseFloat(((avgCompleted - avgNotCompleted) / Math.max(avgCompleted, avgNotCompleted, 1)).toFixed(2));
    };

    return {
      mood: calcCorr(moodOnCompleted, moodOnNotCompleted),
      sleep: calcCorr(sleepOnCompleted, sleepOnNotCompleted),
      clarity: calcCorr(clarityOnCompleted, clarityOnNotCompleted),
    };
  }

  /**
   * Generate smart recommendation based on habit performance and correlations
   */
  private static generateHabitRecommendation(
    habitName: string,
    completionRate: number,
    correlations: { mood: number; sleep: number; clarity: number },
    impact: 'high' | 'medium' | 'low' | 'none',
    trend: 'up' | 'down' | 'stable',
    currentStreak: number
  ): string {
    // High positive impact + high completion
    if (impact === 'high' && completionRate >= 80) {
      const topMetric = this.getTopCorrelationMetric(correlations);
      return `🌟 Excellent! This habit significantly improves your ${topMetric}. Keep it up!`;
    }

    // High positive impact + declining
    if (impact === 'high' && trend === 'down') {
      return `⚠️ This habit really helps your wellness. Try to get back on track!`;
    }

    // Medium/High impact + medium completion
    if ((impact === 'high' || impact === 'medium') && completionRate >= 50 && completionRate < 80) {
      return `💪 You're making progress! Stay consistent to maximize the benefits.`;
    }

    // Low completion + declining
    if (completionRate < 50 && trend === 'down') {
      return `📉 Your progress is slipping. Consider adjusting this habit or removing it.`;
    }

    // Good streak going
    if (currentStreak >= 7) {
      return `🔥 ${currentStreak}-day streak! Don't break the chain now!`;
    }

    // Improving trend
    if (trend === 'up') {
      return `📈 You're building momentum! Keep pushing forward.`;
    }

    // No clear impact
    if (impact === 'none' && completionRate >= 70) {
      return `🤔 Consistent completion, but unclear impact. Consider modifying this habit.`;
    }

    // Default encouragement
    return `💫 Stay committed to this habit to see results!`;
  }

  /**
   * Get the wellness metric with highest positive correlation
   */
  private static getTopCorrelationMetric(correlations: { mood: number; sleep: number; clarity: number }): string {
    const { mood, sleep, clarity } = correlations;
    if (mood >= sleep && mood >= clarity) return 'mood';
    if (sleep >= clarity) return 'sleep quality';
    return 'mental clarity';
  }

  /**
   * Generate overall insights about habit patterns
   */
  private static generateHabitInsights(
    habits: any[],
    avgCompletionRate: number,
    mostPositiveHabit: string | null,
    needsAttention: string | null,
    bestCategory: string | null
  ): string[] {
    const insights: string[] = [];

    // Overall completion insight
    if (avgCompletionRate >= 80) {
      insights.push(`🎯 Outstanding! You're maintaining ${avgCompletionRate.toFixed(0)}% completion rate across all habits.`);
    } else if (avgCompletionRate >= 60) {
      insights.push(`👍 Good consistency at ${avgCompletionRate.toFixed(0)}% completion. Push for 80%+ for best results.`);
    } else if (avgCompletionRate >= 40) {
      insights.push(`📊 ${avgCompletionRate.toFixed(0)}% completion rate. Focus on 2-3 key habits to build momentum.`);
    } else {
      insights.push(`💡 ${avgCompletionRate.toFixed(0)}% completion rate. Start small with just 1-2 habits you can do daily.`);
    }

    // Most positive habit
    if (mostPositiveHabit) {
      insights.push(`⭐ '${mostPositiveHabit}' shows the strongest positive impact on your wellness.`);
    }

    // Category performance
    if (bestCategory) {
      insights.push(`🏆 You're most consistent with ${bestCategory.toLowerCase()} habits.`);
    }

    // Needs attention
    if (needsAttention) {
      insights.push(`⚠️ '${needsAttention}' needs attention. Your wellness may improve if you recommit.`);
    }

    // High impact habits
    const highImpactCount = habits.filter(h => h.impact === 'high').length;
    if (highImpactCount > 0) {
      insights.push(`💎 You have ${highImpactCount} habit${highImpactCount > 1 ? 's' : ''} with high wellness impact. Prioritize these!`);
    }

    // Streaks
    const longStreaks = habits.filter(h => h.currentStreak >= 7);
    if (longStreaks.length > 0) {
      insights.push(`🔥 ${longStreaks.length} habit${longStreaks.length > 1 ? 's' : ''} with 7+ day streaks! Amazing consistency.`);
    }

    return insights.slice(0, 4); // Top 4 insights
  }

  /**
   * Intelligent Experiment Results Analysis
   * Correlates experiment outcomes with wellness metrics (mood, sleep, clarity, productivity)
   */
  static async analyzeUserExperiments(
    userId: string,
    filter: 'all' | 'active' | 'completed' = 'all'
  ): Promise<{
    data: {
      experiments: Array<{
        id: string;
        name: string;
        emoji: string;
        status: 'active' | 'completed' | 'paused';
        progress: number;
        startDate: string;
        endDate: string;
        duration: number;
        currentDay: number;
        outcomes: string[];
        impact: {
          mood: number;
          sleep: number;
          clarity: number;
          productivity: number;
        };
        impactLevel: 'positive' | 'neutral' | 'negative';
        summary: string;
        recommendation: string;
        changeDetails: {
          mood: { before: number; after: number; change: number };
          sleep: { before: number; after: number; change: number };
          clarity: { before: number; after: number; change: number };
          productivity: { before: number; after: number; change: number };
        };
      }>;
      summary: {
        active: number;
        completed: number;
        paused: number;
        positiveExperiments: number;
        neutralExperiments: number;
        negativeExperiments: number;
        totalExperiments: number;
      };
      insights: string[];
    } | null;
    error: any;
  }> {
    try {
      console.log(`🧪 Analyzing experiments with filter: ${filter}...`);

      // Fetch experiments
      const experimentsResult = await ExperimentsService.getAll(userId);
      if (experimentsResult.error || !experimentsResult.data) {
        console.error('❌ Error fetching experiments:', experimentsResult.error);
        return { data: null, error: experimentsResult.error };
      }

      let experiments = experimentsResult.data || [];

      // Apply filter
      if (filter !== 'all') {
        experiments = experiments.filter(exp => exp.status === filter);
      }

      console.log(`✅ Fetched ${experiments.length} experiments`);

      if (experiments.length === 0) {
        return {
          data: {
            experiments: [],
            summary: {
              active: 0,
              completed: 0,
              paused: 0,
              positiveExperiments: 0,
              neutralExperiments: 0,
              negativeExperiments: 0,
              totalExperiments: 0,
            },
            insights: ['Start an experiment to discover how activities impact your wellness!'],
          },
          error: null,
        };
      }

      // Fetch wellness data for correlation analysis (last 90 days)
      const now = new Date();
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(now.getDate() - 90);
      
      const startDateStr = ninetyDaysAgo.toISOString().split('T')[0];
      const endDateStr = now.toISOString().split('T')[0];

      const [moodsResult, sleepResult, clarityResult, productivityResult] = await Promise.all([
        MoodsService.getByDateRange(userId, startDateStr, endDateStr),
        SleepService.getByDateRange(userId, startDateStr, endDateStr),
        MentalClarityService.getByDateRange(userId, startDateStr, endDateStr),
        ProductivityService.getByDateRange(userId, startDateStr, endDateStr),
      ]);

      const moods = moodsResult.data || [];
      const sleeps = sleepResult.data || [];
      const clarityTests = clarityResult.data || [];
      const productivityLogs = productivityResult.data || [];

      // Create wellness data maps by date
      const moodMap = new Map(moods.map(m => [m.date, m.score]));
      const sleepMap = new Map(sleeps.map(s => [s.date, Number(s.hours)]));
      const clarityMap = new Map(clarityTests.map(c => [c.date, c.score]));
      const productivityMap = new Map(productivityLogs.map(p => [p.date, p.rating]));

      // Analyze each experiment
      const analyzedExperiments = await Promise.all(
        experiments.map(async (experiment) => {
          const startDate = new Date(experiment.start_date);
          const endDate = new Date(experiment.end_date);
          const now = new Date();

          // Calculate progress
          const totalDays = experiment.duration;
          const currentDay = experiment.current_day || 1;
          const progress = Math.min((currentDay / totalDays) * 100, 100);

          // Fetch experiment logs
          const logsResult = await ExperimentsService.getExperimentLogs(experiment.id, userId);
          const logs = logsResult.data || [];
          const completedDays = logs.filter(log => log.completed).length;

          // Calculate baseline (14 days before experiment start)
          const baselineStart = new Date(startDate);
          baselineStart.setDate(startDate.getDate() - 14);
          
          // Calculate experiment period wellness scores
          const duringPeriod = { mood: [], sleep: [], clarity: [], productivity: [] };
          const beforePeriod = { mood: [], sleep: [], clarity: [], productivity: [] };

          // Collect baseline data (before experiment)
          for (let d = new Date(baselineStart); d < startDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            if (moodMap.has(dateStr)) beforePeriod.mood.push(moodMap.get(dateStr)!);
            if (sleepMap.has(dateStr)) beforePeriod.sleep.push(sleepMap.get(dateStr)!);
            if (clarityMap.has(dateStr)) beforePeriod.clarity.push(clarityMap.get(dateStr)!);
            if (productivityMap.has(dateStr)) beforePeriod.productivity.push(productivityMap.get(dateStr)!);
          }

          // Collect during experiment data
          const experimentEndDate = endDate < now ? endDate : now;
          for (let d = new Date(startDate); d <= experimentEndDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            if (moodMap.has(dateStr)) duringPeriod.mood.push(moodMap.get(dateStr)!);
            if (sleepMap.has(dateStr)) duringPeriod.sleep.push(sleepMap.get(dateStr)!);
            if (clarityMap.has(dateStr)) duringPeriod.clarity.push(clarityMap.get(dateStr)!);
            if (productivityMap.has(dateStr)) duringPeriod.productivity.push(productivityMap.get(dateStr)!);
          }

          // Calculate averages
          const calcAvg = (arr: number[]) => arr.length > 0 ? arr.reduce((sum, v) => sum + v, 0) / arr.length : 0;
          
          const beforeAvg = {
            mood: calcAvg(beforePeriod.mood),
            sleep: calcAvg(beforePeriod.sleep),
            clarity: calcAvg(beforePeriod.clarity),
            productivity: calcAvg(beforePeriod.productivity),
          };

          const duringAvg = {
            mood: calcAvg(duringPeriod.mood),
            sleep: calcAvg(duringPeriod.sleep),
            clarity: calcAvg(duringPeriod.clarity),
            productivity: calcAvg(duringPeriod.productivity),
          };

          // Calculate percentage changes
          const calcChange = (before: number, after: number) => {
            if (before === 0) return after > 0 ? 1 : 0;
            return (after - before) / before;
          };

          const impact = {
            mood: calcChange(beforeAvg.mood, duringAvg.mood),
            sleep: calcChange(beforeAvg.sleep, duringAvg.sleep),
            clarity: calcChange(beforeAvg.clarity, duringAvg.clarity),
            productivity: calcChange(beforeAvg.productivity, duringAvg.productivity),
          };

          // Determine impact level
          const positiveCount = Object.values(impact).filter(v => v >= 0.05).length;
          const negativeCount = Object.values(impact).filter(v => v <= -0.05).length;
          
          let impactLevel: 'positive' | 'neutral' | 'negative';
          if (positiveCount >= 2 && negativeCount === 0) {
            impactLevel = 'positive';
          } else if (negativeCount >= 2) {
            impactLevel = 'negative';
          } else {
            impactLevel = 'neutral';
          }

          // Generate summary and recommendation
          const { summary, recommendation } = this.generateExperimentInsights(
            experiment.activity_name,
            impact,
            impactLevel,
            experiment.status,
            progress,
            completedDays,
            totalDays
          );

          return {
            id: experiment.id,
            name: experiment.activity_name,
            emoji: experiment.activity_emoji || '🧪',
            status: experiment.status as 'active' | 'completed' | 'paused',
            progress: Math.round(progress),
            startDate: experiment.start_date,
            endDate: experiment.end_date,
            duration: experiment.duration,
            currentDay: experiment.current_day || 1,
            outcomes: (experiment.outcomes as string[]) || [],
            impact,
            impactLevel,
            summary,
            recommendation,
            changeDetails: {
              mood: { before: beforeAvg.mood, after: duringAvg.mood, change: impact.mood },
              sleep: { before: beforeAvg.sleep, after: duringAvg.sleep, change: impact.sleep },
              clarity: { before: beforeAvg.clarity, after: duringAvg.clarity, change: impact.clarity },
              productivity: { before: beforeAvg.productivity, after: duringAvg.productivity, change: impact.productivity },
            },
          };
        })
      );

      // Sort by impact level (positive first) and progress
      analyzedExperiments.sort((a, b) => {
        const impactWeight = { positive: 3, neutral: 2, negative: 1 };
        return (impactWeight[b.impactLevel] * 100 + b.progress) - (impactWeight[a.impactLevel] * 100 + a.progress);
      });

      // Calculate summary statistics
      const summary = {
        active: analyzedExperiments.filter(e => e.status === 'active').length,
        completed: analyzedExperiments.filter(e => e.status === 'completed').length,
        paused: analyzedExperiments.filter(e => e.status === 'paused').length,
        positiveExperiments: analyzedExperiments.filter(e => e.impactLevel === 'positive').length,
        neutralExperiments: analyzedExperiments.filter(e => e.impactLevel === 'neutral').length,
        negativeExperiments: analyzedExperiments.filter(e => e.impactLevel === 'negative').length,
        totalExperiments: analyzedExperiments.length,
      };

      // Generate insights
      const insights = this.generateExperimentSummaryInsights(analyzedExperiments, summary);

      console.log(`✅ Experiment analysis complete: ${summary.totalExperiments} experiments analyzed`);

      return {
        data: {
          experiments: analyzedExperiments,
          summary,
          insights,
        },
        error: null,
      };
    } catch (error) {
      console.error('❌ Error analyzing experiments:', error);
      return { data: null, error };
    }
  }

  /**
   * Generate summary and recommendation for a single experiment
   */
  private static generateExperimentInsights(
    name: string,
    impact: { mood: number; sleep: number; clarity: number; productivity: number },
    impactLevel: 'positive' | 'neutral' | 'negative',
    status: string,
    progress: number,
    completedDays: number,
    totalDays: number
  ): { summary: string; recommendation: string } {
    const formatChange = (val: number, metric: string) => {
      const pct = Math.abs(val * 100).toFixed(0);
      const direction = val > 0 ? 'improved' : 'decreased';
      return `${metric} ${direction} ${pct}%`;
    };

    // Generate summary
    let summary = '';
    const significantChanges: string[] = [];
    
    if (Math.abs(impact.mood) >= 0.05) {
      significantChanges.push(formatChange(impact.mood, 'Mood'));
    }
    if (Math.abs(impact.sleep) >= 0.05) {
      significantChanges.push(formatChange(impact.sleep, 'Sleep'));
    }
    if (Math.abs(impact.clarity) >= 0.05) {
      significantChanges.push(formatChange(impact.clarity, 'Clarity'));
    }
    if (Math.abs(impact.productivity) >= 0.05) {
      significantChanges.push(formatChange(impact.productivity, 'Productivity'));
    }

    if (significantChanges.length > 0) {
      summary = significantChanges.join(', ') + '.';
    } else {
      summary = 'No significant changes detected yet.';
    }

    // Generate recommendation
    let recommendation = '';
    
    if (impactLevel === 'positive' && status === 'completed') {
      recommendation = `🌟 Great results! Convert '${name}' into a long-term habit to maintain these benefits.`;
    } else if (impactLevel === 'positive' && status === 'active') {
      recommendation = `💪 You're seeing positive results! Keep going to validate these improvements.`;
    } else if (impactLevel === 'negative' && completedDays >= totalDays * 0.7) {
      recommendation = `⚠️ This experiment shows negative impact. Consider stopping or modifying your approach.`;
    } else if (impactLevel === 'negative' && status === 'active') {
      recommendation = `🔄 Early data shows decline. Consider tweaking the experiment or trying a different approach.`;
    } else if (impactLevel === 'neutral' && progress < 50) {
      recommendation = `⏳ Keep running for more data. Changes may become clearer over time.`;
    } else if (impactLevel === 'neutral' && status === 'completed') {
      recommendation = `🤔 No clear impact detected. This activity may not significantly affect your tracked metrics.`;
    } else {
      recommendation = `📊 Continue tracking to gather more data for meaningful insights.`;
    }

    return { summary, recommendation };
  }

  /**
   * Generate overall insights about experiment patterns
   */
  private static generateExperimentSummaryInsights(
    experiments: any[],
    summary: any
  ): string[] {
    const insights: string[] = [];

    // Overall completion insight
    if (summary.completed > 0) {
      insights.push(`✅ You've completed ${summary.completed} experiment${summary.completed > 1 ? 's' : ''}. Great dedication to self-improvement!`);
    }

    // Positive experiments
    if (summary.positiveExperiments > 0) {
      const positiveExp = experiments.filter(e => e.impactLevel === 'positive')[0];
      if (positiveExp) {
        insights.push(`🌟 '${positiveExp.name}' shows the strongest positive results. Consider making it a habit!`);
      }
    }

    // Active experiments
    if (summary.active > 0) {
      insights.push(`🧪 ${summary.active} active experiment${summary.active > 1 ? 's' : ''} in progress. Stay consistent for best results.`);
    }

    // Negative experiments warning
    if (summary.negativeExperiments > 0) {
      const negativeExp = experiments.filter(e => e.impactLevel === 'negative')[0];
      if (negativeExp) {
        insights.push(`⚠️ '${negativeExp.name}' may not be working for you. Review and adjust as needed.`);
      }
    }

    // Success rate
    const successRate = summary.totalExperiments > 0 
      ? Math.round((summary.positiveExperiments / summary.totalExperiments) * 100)
      : 0;
    
    if (successRate >= 60) {
      insights.push(`🎯 ${successRate}% of your experiments show positive results. You're great at identifying what works!`);
    }

    return insights.slice(0, 4); // Top 4 insights
  }
}
