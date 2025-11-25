import { supabase } from '@/lib/supabase';

export interface MentalClarityTestResult {
  id?: string;
  user_id: string;
  test_type: 'focus' | 'flexibility' | 'speed' | 'memory';
  score: number;
  date: string;
  metrics: {
    // Focus Test
    correctTaps?: number;
    missedTargets?: number;
    falseTaps?: number;
    avgReactionTime?: number;
    focusAccuracy?: number;

    // Flexibility Test
    switchReactionTime?: number;
    accuracyBefore?: number;
    accuracyAfter?: number;
    switchCost?: number;
    errorRate?: number;
    correctResponses?: number;
    errors?: number;
    flexibilityAccuracy?: number;

    // Speed Test
    speedCorrectMatches?: number;
    incorrectMatches?: number;
    totalAttempts?: number;

    // Memory Test
    memoryCorrectMatches?: number;
    missedMatches?: number;
    falsePositives?: number;
    nLevel?: number;
    memoryAccuracy?: number;
  };
  clarity_index?: number;
  timestamp: string;
  synced: boolean;
}

export interface ClarityIndex {
  id?: string;
  user_id: string;
  focus_score: number;
  flexibility_score: number;
  speed_score: number;
  memory_score: number;
  combined_score: number;
  date: string;
  timestamp: string;
}

export class MentalClarityService {
  // Save individual test result
  static async saveTestResult(result: Omit<MentalClarityTestResult, 'id'>) {
    try {
      const { data, error } = await supabase
        .from('mental_clarity_tests')
        .insert([result])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error saving mental clarity test:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to save test result' };
    }
  }

  // Calculate and save clarity index
  static async calculateClarityIndex(userId: string, date: string) {
    try {
      // Get all tests from today
      const { data: tests, error } = await supabase
        .from('mental_clarity_tests')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', `${date}T00:00:00`)
        .lte('timestamp', `${date}T23:59:59`);

      if (error) throw error;

      if (!tests || tests.length === 0) {
        return { data: null, error: 'No tests found for today' };
      }

      // Get latest score for each test type
      const focusScore = tests.filter(t => t.test_type === 'focus').sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0]?.score || 0;

      const flexibilityScore = tests.filter(t => t.test_type === 'flexibility').sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0]?.score || 0;

      const speedScore = tests.filter(t => t.test_type === 'speed').sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0]?.score || 0;

      const memoryScore = tests.filter(t => t.test_type === 'memory').sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0]?.score || 0;

      // Calculate combined clarity index (adjusted weights without subjective test)
      // Focus: 30%, Memory: 30%, Flexibility: 20%, Speed: 20%
      const combinedScore = (
        focusScore * 0.30 +
        memoryScore * 0.30 +
        flexibilityScore * 0.20 +
        speedScore * 0.20
      );

      const clarityIndex: Omit<ClarityIndex, 'id'> = {
        user_id: userId,
        focus_score: focusScore,
        flexibility_score: flexibilityScore,
        speed_score: speedScore,
        memory_score: memoryScore,
        combined_score: Math.round(combinedScore),
        date,
        timestamp: new Date().toISOString(),
      };

      // Upsert clarity index
      const { data: indexData, error: indexError } = await supabase
        .from('clarity_index')
        .upsert([clarityIndex], { onConflict: 'user_id,date' })
        .select()
        .single();

      if (indexError) throw indexError;
      return { data: indexData, error: null };
    } catch (error) {
      console.error('Error calculating clarity index:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to calculate clarity index' };
    }
  }

  // Get test results by date range
  static async getTestResults(userId: string, startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from('mental_clarity_tests')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', `${startDate}T00:00:00`)
        .lte('timestamp', `${endDate}T23:59:59`)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching mental clarity tests:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Failed to fetch test results' };
    }
  }

  // Get clarity indices
  static async getClarityIndices(userId: string, startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from('clarity_index')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching clarity indices:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Failed to fetch clarity indices' };
    }
  }

  // Get latest clarity index
  static async getLatestClarityIndex(userId: string) {
    try {
      const { data, error } = await supabase
        .from('clarity_index')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: data || null, error: null };
    } catch (error) {
      console.error('Error fetching latest clarity index:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch latest clarity index' };
    }
  }

  // Get test history for specific test type
  static async getTestHistory(userId: string, testType: string, limit: number = 30) {
    try {
      const { data, error } = await supabase
        .from('mental_clarity_tests')
        .select('*')
        .eq('user_id', userId)
        .eq('test_type', testType)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error fetching test history:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Failed to fetch test history' };
    }
  }

  // Check if all tests completed today
  static async checkDailyCompletion(userId: string, date: string) {
    try {
      const { data, error } = await supabase
        .from('mental_clarity_tests')
        .select('test_type')
        .eq('user_id', userId)
        .gte('timestamp', `${date}T00:00:00`)
        .lte('timestamp', `${date}T23:59:59`);

      if (error) throw error;

      const completedTypes = new Set(data?.map(t => t.test_type) || []);
      const allTypes: Set<string> = new Set(['focus', 'flexibility', 'speed', 'memory']);

      return {
        allCompleted: completedTypes.size === allTypes.size,
        completed: Array.from(completedTypes),
        remaining: Array.from(allTypes).filter(t => !completedTypes.has(t)),
      };
    } catch (error) {
      console.error('Error checking daily completion:', error);
      return {
        allCompleted: false,
        completed: [],
        remaining: ['focus', 'flexibility', 'speed', 'memory'],
      };
    }
  }

  // Get today's clarity score
  static async getTodayScore(userId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('clarity_index')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        data: data ? {
          score: data.combined_score,
          focus: data.focus_score,
          flexibility: data.flexibility_score,
          speed: data.speed_score,
          memory: data.memory_score,
          date: data.date
        } : null,
        error: null
      };
    } catch (error) {
      console.error('Error fetching today clarity score:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch today score' };
    }
  }

  // Get weekly clarity scores with average
  static async getWeeklyScores(userId: string) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const { data, error } = await supabase
        .from('clarity_index')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      const scores = data || [];
      const average = scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.combined_score, 0) / scores.length)
        : 0;

      return {
        data: {
          scores: scores.map(s => ({
            date: s.date,
            score: s.combined_score,
            focus: s.focus_score,
            flexibility: s.flexibility_score,
            speed: s.speed_score,
            memory: s.memory_score
          })),
          average,
          count: scores.length
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching weekly clarity scores:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch weekly scores' };
    }
  }

  // Get monthly clarity scores with average
  static async getMonthlyScores(userId: string, month?: number, year?: number) {
    try {
      const now = new Date();
      const targetMonth = month !== undefined ? month : now.getMonth();
      const targetYear = year !== undefined ? year : now.getFullYear();

      const startDate = new Date(targetYear, targetMonth, 1);
      const endDate = new Date(targetYear, targetMonth + 1, 0);

      const { data, error } = await supabase
        .from('clarity_index')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      const scores = data || [];
      const average = scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s.combined_score, 0) / scores.length)
        : 0;

      return {
        data: {
          scores: scores.map(s => ({
            date: s.date,
            score: s.combined_score,
            focus: s.focus_score,
            flexibility: s.flexibility_score,
            speed: s.speed_score,
            memory: s.memory_score
          })),
          average,
          count: scores.length,
          month: targetMonth,
          year: targetYear
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching monthly clarity scores:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch monthly scores' };
    }
  }

  // Get clarity score for a specific date
  static async getScoreByDate(userId: string, date: string) {
    try {
      const { data, error } = await supabase
        .from('clarity_index')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return {
        data: data ? {
          score: data.combined_score,
          focus: data.focus_score,
          flexibility: data.flexibility_score,
          speed: data.speed_score,
          memory: data.memory_score,
          date: data.date
        } : null,
        error: null
      };
    } catch (error) {
      console.error('Error fetching clarity score by date:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch score' };
    }
  }

  // Get clarity index by date - used by analytics service
  static async getByDate(userId: string, date: string) {
    try {
      const { data, error } = await supabase
        .from('clarity_index')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Transform to expected format with 'score' and 'factors'
      return {
        data: data ? {
          score: data.combined_score, // Map combined_score to score (0-100)
          clarity_score: data.combined_score,
          focus_score: data.focus_score,
          flexibility_score: data.flexibility_score,
          speed_score: data.speed_score,
          memory_score: data.memory_score,
          date: data.date,
          created_at: data.created_at,
          factors: [] // Can be populated from test metrics if needed
        } : null,
        error: null
      };
    } catch (error) {
      console.error('Error fetching clarity by date:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch clarity data' };
    }
  }

  // Get clarity indices by date range - used by analytics service and home screen
  static async getByDateRange(userId: string, startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from('clarity_index')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;

      // Transform to expected format with 'score' field
      const transformedData = (data || []).map(item => ({
        score: item.combined_score, // Map combined_score to score (0-100)
        clarity_score: item.combined_score,
        focus_score: item.focus_score,
        flexibility_score: item.flexibility_score,
        speed_score: item.speed_score,
        memory_score: item.memory_score,
        date: item.date,
        created_at: item.created_at,
        factors: [] // Can be populated from test metrics if needed
      }));

      return { data: transformedData, error: null };
    } catch (error) {
      console.error('Error fetching clarity by date range:', error);
      return { data: [], error: error instanceof Error ? error.message : 'Failed to fetch clarity data' };
    }
  }

  // Get activity-clarity correlation for a date
  static async getActivityCorrelation(userId: string, date: string) {
    try {
      // Get clarity score for the date
      const { data: clarityData } = await supabase
        .from('clarity_index')
        .select('combined_score')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      // Get activities for the date
      const { data: activities } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date);

      if (!clarityData || !activities || activities.length === 0) {
        return { data: null, error: null };
      }

      // Get historical data to calculate correlations
      const startDate = new Date(date);
      startDate.setDate(startDate.getDate() - 30);

      const { data: historicalClarity } = await supabase
        .from('clarity_index')
        .select('date, combined_score')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', date);

      const { data: historicalActivities } = await supabase
        .from('activities')
        .select('date, name, category')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', date);

      // Calculate correlations for each activity
      const correlations = activities.map((activity: any) => {
        // Find days when this activity was done
        const activityDates = (historicalActivities || [])
          .filter((a: any) => a.name === activity.name)
          .map((a: any) => a.date);

        // Get clarity scores for those days
        const scoresWithActivity = (historicalClarity || [])
          .filter((c: any) => activityDates.includes(c.date))
          .map((c: any) => c.combined_score);

        // Get clarity scores for days without this activity
        const scoresWithoutActivity = (historicalClarity || [])
          .filter((c: any) => !activityDates.includes(c.date))
          .map((c: any) => c.combined_score);

        const avgWithActivity = scoresWithActivity.length > 0
          ? scoresWithActivity.reduce((a: number, b: number) => a + b, 0) / scoresWithActivity.length
          : 0;

        const avgWithoutActivity = scoresWithoutActivity.length > 0
          ? scoresWithoutActivity.reduce((a: number, b: number) => a + b, 0) / scoresWithoutActivity.length
          : 0;

        const impact = avgWithActivity - avgWithoutActivity;
        let impactType: 'positive' | 'negative' | 'neutral' = 'neutral';
        if (impact > 5) impactType = 'positive';
        else if (impact < -5) impactType = 'negative';

        return {
          activityName: activity.name,
          activityCategory: activity.category,
          impact: Math.round(impact),
          impactType,
          sampleSize: scoresWithActivity.length,
          avgWithActivity: Math.round(avgWithActivity),
          avgWithoutActivity: Math.round(avgWithoutActivity)
        };
      });

      return {
        data: {
          date,
          clarityScore: clarityData.combined_score,
          activities: activities.map((a: any) => ({
            name: a.name,
            category: a.category
          })),
          correlations
        },
        error: null
      };
    } catch (error) {
      console.error('Error calculating activity-clarity correlation:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to calculate correlation' };
    }
  }

  // Get clarity trend data
  static async getClarityTrend(userId: string, days: number = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const { data, error } = await supabase
        .from('clarity_index')
        .select('date, combined_score')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      const scores = data || [];

      // Calculate trend
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (scores.length >= 7) {
        const recent = scores.slice(-7);
        const older = scores.slice(-14, -7);

        if (older.length > 0) {
          const recentAvg = recent.reduce((s, d) => s + d.combined_score, 0) / recent.length;
          const olderAvg = older.reduce((s, d) => s + d.combined_score, 0) / older.length;

          if (recentAvg > olderAvg + 5) trend = 'improving';
          else if (recentAvg < olderAvg - 5) trend = 'declining';
        }
      }

      return {
        data: {
          scores: scores.map(s => ({ date: s.date, score: s.combined_score })),
          trend,
          count: scores.length
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching clarity trend:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch trend' };
    }
  }
}
