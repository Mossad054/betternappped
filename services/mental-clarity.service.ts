import { supabase } from '@/lib/supabase';

export interface MentalClarityTestResult {
  id?: string;
  user_id: string;
  test_type: 'focus' | 'flexibility' | 'speed' | 'memory' | 'subjective';
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
    
    // Subjective Test
    mentalFog?: number;
    concentration?: number;
    energy?: number;
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
  subjective_score: number;
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

      const subjectiveScore = tests.filter(t => t.test_type === 'subjective').sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0]?.score || 0;

      // Calculate combined clarity index
      const combinedScore = (
        focusScore * 0.25 +
        flexibilityScore * 0.2 +
        speedScore * 0.2 +
        memoryScore * 0.25 +
        subjectiveScore * 0.1
      );

      const clarityIndex: Omit<ClarityIndex, 'id'> = {
        user_id: userId,
        focus_score: focusScore,
        flexibility_score: flexibilityScore,
        speed_score: speedScore,
        memory_score: memoryScore,
        subjective_score: subjectiveScore,
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
      const allTypes: Set<string> = new Set(['focus', 'flexibility', 'speed', 'memory', 'subjective']);
      
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
        remaining: ['focus', 'flexibility', 'speed', 'memory', 'subjective'],
      };
    }
  }
}
