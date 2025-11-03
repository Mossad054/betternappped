import { SupabaseSafe } from '@/lib/supabaseSafe';
import { Database } from '@/lib/supabase';
import { isGuestMode, guestDataStore } from '@/lib/guestDataStore';

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
    const result = await SupabaseSafe.insert('experiment_logs', { ...data, experiment_id: experimentId }, userId);
    
    if (result.error) return { data: null, error: result.error };

    // Update experiment current_day if completed
    if (data.completed) {
      await this.updateExperimentProgress(experimentId, userId);
    }

    return { data: result.data, error: null };
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

    // Create habit from experiment
    const habitResult = await SupabaseSafe.insert('habits', {
      name: experiment.activity_name,
      description: `Converted from experiment: ${experiment.activity_name}`,
      category: 'Health', // Default category
      total_days: 30,
      streak: 0,
      reminder_enabled: false
    }, userId);

    return { data: habitResult.data, error: habitResult.error };
  }
}
