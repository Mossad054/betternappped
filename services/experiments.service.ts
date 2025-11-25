import { SupabaseSafe } from '@/lib/supabaseSafe';
import { Database } from '@/lib/supabase';
import { isGuestMode, guestDataStore } from '@/lib/guestDataStore';
import { NotificationTriggerService } from './notificationTrigger.service';

type Experiment = Database['public']['Tables']['experiments']['Row'];
type ExperimentInsert = Database['public']['Tables']['experiments']['Insert'];
type ExperimentUpdate = Database['public']['Tables']['experiments']['Update'];
type ExperimentLog = Database['public']['Tables']['experiment_logs']['Row'];
type ExperimentLogInsert = Database['public']['Tables']['experiment_logs']['Insert'];

export class ExperimentsService {
  // Experiment CRUD operations
  static async create(data: Omit<ExperimentInsert, 'user_id'>, userId: string): Promise<{ data: Experiment | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.create('experiments', data);
    }
    const result = await SupabaseSafe.insert('experiments', data, userId);
    return { data: result.data, error: result.error };
  }

  static async getAll(userId: string): Promise<{ data: Experiment[] | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getAll('experiments');
    }
    const result = await SupabaseSafe.select('experiments', { order: { created_at: 'desc' } }, userId);
    return { data: result.data, error: result.error };
  }

  static async getById(id: string, userId: string): Promise<{ data: Experiment | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.getById('experiments', id);
    }
    const result = await SupabaseSafe.select('experiments', { eq: { id } }, userId);
    return { data: result.data?.[0] || null, error: result.error };
  }

  static async getActive(userId: string): Promise<{ data: Experiment[] | null; error: any }> {
    const result = await SupabaseSafe.select('experiments', { 
      eq: { status: 'active' },
      order: { created_at: 'desc' }
    }, userId);
    return { data: result.data, error: result.error };
  }

  static async getCompleted(userId: string): Promise<{ data: Experiment[] | null; error: any }> {
    const result = await SupabaseSafe.select('experiments', {
      eq: { status: 'completed' },
      order: { created_at: 'desc' }
    }, userId);
    return { data: result.data, error: result.error };
  }

  /**
   * Get all experiments that were active on a specific date
   * An experiment is active on a date if:
   * - created_at <= date AND (status = 'active' OR the experiment was still running on that date)
   */
  static async getExperimentsForDate(userId: string, date: string): Promise<{ data: any[] | null; error: any }> {
    if (await isGuestMode()) {
      const result = await guestDataStore.getAll('experiments');
      return { data: result.data || [], error: result.error };
    }

    try {
      // Get all experiments
      const result = await SupabaseSafe.select('experiments', {
        order: { created_at: 'desc' }
      }, userId);

      if (result.error) return { data: null, error: result.error };

      const experiments = result.data || [];
      const selectedDate = new Date(date + 'T00:00:00');

      // Filter experiments that were active on the selected date
      const activeOnDate = [];

      for (const exp of experiments) {
        const createdDate = new Date(exp.created_at);
        createdDate.setHours(0, 0, 0, 0);

        // Calculate end date based on duration
        const endDate = new Date(createdDate);
        endDate.setDate(endDate.getDate() + (exp.duration || 0));

        // Check if experiment was active on selected date
        const wasActiveOnDate = selectedDate >= createdDate && selectedDate <= endDate;

        if (wasActiveOnDate) {
          // Get the log for this specific date if it exists
          const logResult = await this.getExperimentLogByDate(exp.id, date, userId);

          activeOnDate.push({
            experiment_id: exp.id,
            experiment_name: exp.activity_name,
            experiment_emoji: exp.activity_emoji || '🧪',
            experiment_description: exp.description || '',
            experiment_category: exp.category || 'General',
            experiment_status: exp.status,
            current_day: exp.current_day || 0,
            total_days: exp.duration || 0,
            logged: !!logResult.data,
            log_data: logResult.data,
            created_at: exp.created_at
          });
        }
      }

      return { data: activeOnDate, error: null };
    } catch (error) {
      console.error('Error getting experiments for date:', error);
      return { data: null, error };
    }
  }

  static async update(
    id: string, 
    data: Omit<ExperimentUpdate, 'user_id'>, 
    userId: string
  ): Promise<{ data: Experiment | null; error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.update('experiments', id, data);
    }
    const result = await SupabaseSafe.update('experiments', id, data, userId);
    return { data: result.data, error: result.error };
  }

  static async delete(id: string, userId: string): Promise<{ error: any }> {
    if (await isGuestMode()) {
      return guestDataStore.delete('experiments', id);
    }
    const result = await SupabaseSafe.delete('experiments', id, userId);
    return { error: result.error };
  }

  static async completeExperiment(id: string, userId: string, resultsData: any, insights?: string): Promise<{ data: Experiment | null; error: any }> {
    const result = await SupabaseSafe.update('experiments', id, { 
      status: 'completed',
      results_data: resultsData,
      insights: insights
    }, userId);
    return { data: result.data, error: result.error };
  }

  // Experiment Log operations
  static async logExperiment(
    experimentId: string,
    data: Omit<ExperimentLogInsert, 'experiment_id' | 'user_id'>,
    userId: string
  ): Promise<{ data: ExperimentLog | null; error: any }> {
    console.log('🧪 === ExperimentsService.logExperiment START ===');
    console.log('📝 Input params:', { experimentId, userId, data });

    try {
      // Check if log already exists for this experiment and date (prevent duplicates)
      console.log('🔍 Checking for existing log...');
      const existing = await this.getExperimentLogByDate(experimentId, data.date, userId);
      console.log('📊 Existing log:', existing.data ? 'FOUND' : 'NOT FOUND');

      if (existing.data) {
        console.log('📝 Updating existing log with ID:', existing.data.id);
        // Update existing log instead of creating duplicate
        const result = await SupabaseSafe.update('experiment_logs', existing.data.id, data, userId);

        console.log('📦 Update result:', { data: result.data, error: result.error });

        if (result.error) {
          console.error('❌ Update error:', result.error);
          return { data: null, error: result.error };
        }

        // Update experiment current_day if completed
        if (data.completed && !existing.data.completed) {
          console.log('📈 Updating experiment progress...');
          await this.updateExperimentProgress(experimentId, userId);
        }

        console.log('✅ Experiment log updated successfully');
        return { data: result.data, error: null };
      } else {
        console.log('➕ Creating new log...');
        // Create new log
        const insertData = { ...data, experiment_id: experimentId };
        console.log('📦 Insert data:', JSON.stringify(insertData, null, 2));

        const result = await SupabaseSafe.insert('experiment_logs', insertData, userId);

        console.log('📨 Insert result:', { data: result.data, error: result.error });

        if (result.error) {
          console.error('❌ Insert error:', result.error);
          return { data: null, error: result.error };
        }

        // Update experiment current_day if completed
        if (data.completed) {
          console.log('📈 Updating experiment progress...');
          await this.updateExperimentProgress(experimentId, userId);

          // Trigger notification
          const experimentResult = await this.getById(experimentId, userId);
          if (experimentResult.data) {
            const experiment = experimentResult.data as any;
            await NotificationTriggerService.onExperimentLogged(
              userId,
              experiment.activity_name,
              experiment.current_day || 0,
              experiment.duration || 0
            );

            // Check if experiment is now completed
            if (experiment.current_day >= experiment.duration) {
              await NotificationTriggerService.onExperimentCompleted(
                userId,
                experiment.activity_name,
                experiment.duration,
                experiment.insights || 'View your detailed results'
              );
            }
          }
        }

        console.log('✅ Experiment log created successfully');
        return { data: result.data, error: null };
      }
    } catch (error) {
      console.error('❌ Exception in logExperiment:', error);
      console.error('Exception type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Exception message:', error instanceof Error ? error.message : String(error));
      return { data: null, error };
    } finally {
      console.log('🧪 === ExperimentsService.logExperiment END ===');
    }
  }

  // Upsert experiment log (update if exists, insert if not)
  static async upsertExperimentLog(
    experimentId: string,
    data: Omit<ExperimentLogInsert, 'experiment_id' | 'user_id'>,
    userId: string
  ): Promise<{ data: ExperimentLog | null; error: any }> {
    return await this.logExperiment(experimentId, data, userId);
  }

  static async getExperimentLogs(experimentId: string, userId: string): Promise<{ data: ExperimentLog[] | null; error: any }> {
    const result = await SupabaseSafe.select('experiment_logs', { 
      eq: { experiment_id: experimentId },
      order: { date: 'asc' }
    }, userId);
    return { data: result.data, error: result.error };
  }

  static async getExperimentLogByDate(experimentId: string, date: string, userId: string): Promise<{ data: ExperimentLog | null; error: any }> {
    const result = await SupabaseSafe.select('experiment_logs', { 
      eq: { experiment_id: experimentId, date }
    }, userId);
    return { data: result.data?.[0] || null, error: result.error };
  }

  static async updateExperimentProgress(experimentId: string, userId: string): Promise<{ error: any }> {
    // Get experiment details
    const experimentResult = await SupabaseSafe.select('experiments', { eq: { id: experimentId } }, userId);
    if (experimentResult.error) return { error: experimentResult.error };
    
    const experiment = experimentResult.data?.[0];
    if (!experiment) return { error: 'Experiment not found' };

    const newCurrentDay = Math.min((experiment.current_day || 0) + 1, experiment.duration || 0);
    const isCompleted = newCurrentDay >= (experiment.duration || 0);

    // Update experiment
    const result = await SupabaseSafe.update('experiments', experimentId, { 
      current_day: newCurrentDay,
      status: isCompleted ? 'completed' : 'active'
    }, userId);

    return { error: result.error };
  }

  static async getExperimentWithLogs(experimentId: string, userId: string): Promise<{ data: any | null; error: any }> {
    // Get experiment
    const experimentResult = await SupabaseSafe.select('experiments', { eq: { id: experimentId } }, userId);
    if (experimentResult.error) return { data: null, error: experimentResult.error };
    
    const experiment = experimentResult.data?.[0];
    if (!experiment) return { data: null, error: 'Experiment not found' };

    // Get experiment logs
    const logsResult = await SupabaseSafe.select('experiment_logs', { 
      eq: { experiment_id: experimentId },
      order: { date: 'asc' }
    }, userId);
    
    if (logsResult.error) return { data: null, error: logsResult.error };

    return { 
      data: { 
        ...experiment, 
        experiment_logs: logsResult.data || [] 
      }, 
      error: null 
    };
  }

  static async convertToHabit(experimentId: string, userId: string): Promise<{ data: any | null; error: any }> {
    // Get experiment details
    const experimentResult = await SupabaseSafe.select('experiments', { eq: { id: experimentId } }, userId);
    if (experimentResult.error) return { data: null, error: experimentResult.error };
    
    const experiment = experimentResult.data?.[0];
    if (!experiment) return { data: null, error: 'Experiment not found' };

    // Check if habit with same name already exists
    const existingHabitResult = await SupabaseSafe.select('habits', { 
      eq: { name: experiment.activity_name } 
    }, userId);
    
    if (existingHabitResult.data && existingHabitResult.data.length > 0) {
      return { data: null, error: `A habit named "${experiment.activity_name}" already exists in your library.` };
    }

    // Create habit from experiment with detailed information
    const habitResult = await SupabaseSafe.insert('habits', {
      name: experiment.activity_name,
      description: `Converted from ${experiment.duration}-day experiment. Showed positive impact on your wellness.`,
      category: 'Wellness', // Default category for experiment-based habits
      emoji: experiment.activity_emoji || '⭐',
      total_days: 30, // Default 30-day tracking period
      streak: 0,
      reminder_enabled: false,
      instruction: `Continue this activity that showed positive results during your experiment.`
    }, userId);

    if (habitResult.error) return { data: null, error: habitResult.error };

    // Optionally update experiment status to indicate it's been converted
    await SupabaseSafe.update('experiments', experimentId, {
      insights: experiment.insights 
        ? `${experiment.insights}\n\nConverted to habit on ${new Date().toLocaleDateString()}.`
        : `Converted to habit on ${new Date().toLocaleDateString()}.`
    }, userId);

    return { data: habitResult.data, error: null };
  }

  /**
   * Analyze experiment with advanced correlation and statistical analysis
   */
  static async analyzeExperiment(experimentId: string, userId: string): Promise<{ data: any | null; error: any }> {
    const { ExperimentCorrelationService } = await import('./analytics/experimentCorrelation.service');
    return await ExperimentCorrelationService.analyzeExperiment(userId, experimentId);
  }

  /**
   * Get experiment insights showing how it affects Mood, Sleep, Clarity, and Productivity
   */
  static async getExperimentInsights(experimentId: string, userId: string): Promise<{ data: any | null; error: any }> {
    try {
      const analysisResult = await this.analyzeExperiment(experimentId, userId);
      
      if (analysisResult.error || !analysisResult.data) {
        return analysisResult;
      }

      const analysis = analysisResult.data;

      // Format insights for frontend display
      const insights = {
        experimentId: analysis.experimentId,
        experimentName: analysis.experimentName,
        emoji: analysis.emoji,
        status: analysis.status,
        
        // Progress
        progress: {
          completedDays: analysis.completedDays,
          totalDays: analysis.totalDays,
          completionRate: analysis.completionRate,
          confidence: analysis.confidence
        },
        
        // Wellness Impact (4 key metrics)
        wellnessImpact: [
          {
            metric: 'Mood',
            emoji: '😊',
            change: analysis.moodImpact.absoluteChange,
            percentageChange: analysis.moodImpact.percentageChange,
            direction: analysis.moodImpact.direction,
            strength: analysis.moodImpact.strength,
            isSignificant: analysis.moodImpact.isSignificant,
            interpretation: analysis.moodImpact.interpretation,
            baseline: analysis.moodImpact.baselineAverage,
            current: analysis.moodImpact.duringAverage
          },
          {
            metric: 'Sleep',
            emoji: '😴',
            change: analysis.sleepImpact.absoluteChange,
            percentageChange: analysis.sleepImpact.percentageChange,
            direction: analysis.sleepImpact.direction,
            strength: analysis.sleepImpact.strength,
            isSignificant: analysis.sleepImpact.isSignificant,
            interpretation: analysis.sleepImpact.interpretation,
            baseline: analysis.sleepImpact.baselineAverage,
            current: analysis.sleepImpact.duringAverage
          },
          {
            metric: 'Clarity',
            emoji: '🧠',
            change: analysis.clarityImpact.absoluteChange,
            percentageChange: analysis.clarityImpact.percentageChange,
            direction: analysis.clarityImpact.direction,
            strength: analysis.clarityImpact.strength,
            isSignificant: analysis.clarityImpact.isSignificant,
            interpretation: analysis.clarityImpact.interpretation,
            baseline: analysis.clarityImpact.baselineAverage,
            current: analysis.clarityImpact.duringAverage
          },
          {
            metric: 'Productivity',
            emoji: '⚡',
            change: analysis.productivityImpact.absoluteChange,
            percentageChange: analysis.productivityImpact.percentageChange,
            direction: analysis.productivityImpact.direction,
            strength: analysis.productivityImpact.strength,
            isSignificant: analysis.productivityImpact.isSignificant,
            interpretation: analysis.productivityImpact.interpretation,
            baseline: analysis.productivityImpact.baselineAverage,
            current: analysis.productivityImpact.duringAverage
          }
        ],
        
        // Overall assessment
        overall: {
          score: analysis.overallImpactScore,
          level: analysis.impactLevel,
          recommendation: analysis.recommendation,
          shouldContinue: analysis.shouldContinue,
          convertToHabit: analysis.convertToHabit
        },
        
        // Key findings
        keyFindings: analysis.keyFindings,
        
        // Time series data for visualization
        timeSeriesData: analysis.timeSeriesData
      };

      return { data: insights, error: null };
    } catch (error) {
      console.error('Error getting experiment insights:', error);
      return { data: null, error };
    }
  }

  // ==========================================
  // EXPERIMENTS LIBRARY METHODS
  // Methods for accessing pre-defined experiment templates
  // ==========================================

  /**
   * Get all experiments from the library
   * @param category Optional category filter (Sleep, Mood, Focus, Energy, Anxiety, Productivity)
   * @returns Array of experiment templates
   */
  static async getExperimentsLibrary(
    category?: 'Sleep' | 'Mood' | 'Focus' | 'Energy' | 'Anxiety' | 'Productivity'
  ): Promise<{ data: any[] | null; error: any }> {
    try {
      const { supabase } = await import('@/lib/supabase');

      let query = supabase
        .from('experiments_library')
        .select('*')
        .order('name');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching experiments library:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch library' };
    }
  }

  /**
   * Get experiment template by ID
   * @param id Experiment library ID
   * @returns Single experiment template
   */
  static async getExperimentTemplate(id: string): Promise<{ data: any | null; error: any }> {
    try {
      const { supabase } = await import('@/lib/supabase');

      const { data, error } = await supabase
        .from('experiments_library')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching experiment template:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch template' };
    }
  }

  /**
   * Filter experiments by difficulty
   * @param difficulty Easy, Medium, or Hard
   * @param category Optional category filter
   * @returns Array of filtered experiment templates
   */
  static async getExperimentsByDifficulty(
    difficulty: 'Easy' | 'Medium' | 'Hard',
    category?: string
  ): Promise<{ data: any[] | null; error: any }> {
    try {
      const { supabase } = await import('@/lib/supabase');

      let query = supabase
        .from('experiments_library')
        .select('*')
        .eq('difficulty', difficulty)
        .order('category', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching by difficulty:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch' };
    }
  }

  /**
   * Search experiments by name
   * @param searchTerm Text to search for in experiment names
   * @returns Array of matching experiment templates
   */
  static async searchExperiments(searchTerm: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { supabase } = await import('@/lib/supabase');

      const { data, error } = await supabase
        .from('experiments_library')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .order('category', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error searching experiments:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to search' };
    }
  }

  /**
   * Get random experiment suggestion
   * @param category Optional category to filter by
   * @returns Single random experiment template
   */
  static async getRandomExperiment(category?: string): Promise<{ data: any | null; error: any }> {
    try {
      const { supabase } = await import('@/lib/supabase');

      let query = supabase
        .from('experiments_library')
        .select('*');

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Select random from results
      if (data && data.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.length);
        return { data: data[randomIndex], error: null };
      }

      return { data: null, error: 'No experiments found' };
    } catch (error) {
      console.error('Error getting random experiment:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to get random' };
    }
  }

  /**
   * Get popular experiments (Easy difficulty, diverse categories)
   * @returns Array of popular/beginner-friendly experiments
   */
  static async getPopularExperiments(): Promise<{ data: any[] | null; error: any }> {
    try {
      const { supabase } = await import('@/lib/supabase');

      const { data, error } = await supabase
        .from('experiments_library')
        .select('*')
        .eq('difficulty', 'Easy')
        .limit(10)
        .order('category', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching popular experiments:', error);
      return { data: null, error: error instanceof Error ? error.message : 'Failed to fetch popular' };
    }
  }
}
