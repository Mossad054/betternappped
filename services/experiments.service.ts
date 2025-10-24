import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type Experiment = Database['public']['Tables']['experiments']['Row'];
type ExperimentInsert = Database['public']['Tables']['experiments']['Insert'];
type ExperimentUpdate = Database['public']['Tables']['experiments']['Update'];
type ExperimentLog = Database['public']['Tables']['experiment_logs']['Row'];
type ExperimentLogInsert = Database['public']['Tables']['experiment_logs']['Insert'];

export class ExperimentsService {
  // Experiment CRUD operations
  static async create(data: Omit<ExperimentInsert, 'user_id'>, userId: string): Promise<{ data: Experiment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .insert({ ...data, user_id: userId })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getAll(userId: string): Promise<{ data: Experiment[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getById(id: string, userId: string): Promise<{ data: Experiment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getActive(userId: string): Promise<{ data: Experiment[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getCompleted(userId: string): Promise<{ data: Experiment[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async update(
    id: string, 
    data: Omit<ExperimentUpdate, 'user_id'>, 
    userId: string
  ): Promise<{ data: Experiment | null; error: any }> {
    try {
      const { data: updatedData, error } = await supabase
        .from('experiments')
        .update(data)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      return { data: updatedData, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async delete(id: string, userId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('experiments')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  static async completeExperiment(id: string, userId: string, resultsData: any, insights?: string): Promise<{ data: Experiment | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .update({ 
          status: 'completed',
          results_data: resultsData,
          insights: insights
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Experiment Log operations
  static async logExperiment(
    experimentId: string, 
    data: Omit<ExperimentLogInsert, 'experiment_id' | 'user_id'>, 
    userId: string
  ): Promise<{ data: ExperimentLog | null; error: any }> {
    try {
      const { data: result, error } = await supabase
        .from('experiment_logs')
        .upsert({ ...data, experiment_id: experimentId, user_id: userId })
        .select()
        .single();

      if (error) return { data: null, error };

      // Update experiment current_day if completed
      if (data.completed) {
        await this.updateExperimentProgress(experimentId, userId);
      }

      return { data: result, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getExperimentLogs(experimentId: string, userId: string): Promise<{ data: ExperimentLog[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('experiment_logs')
        .select('*')
        .eq('experiment_id', experimentId)
        .eq('user_id', userId)
        .order('date', { ascending: true });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getExperimentLogByDate(experimentId: string, date: string, userId: string): Promise<{ data: ExperimentLog | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('experiment_logs')
        .select('*')
        .eq('experiment_id', experimentId)
        .eq('date', date)
        .eq('user_id', userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async updateExperimentProgress(experimentId: string, userId: string): Promise<{ error: any }> {
    try {
      // Get experiment details
      const { data: experiment, error: expError } = await supabase
        .from('experiments')
        .select('current_day, duration')
        .eq('id', experimentId)
        .eq('user_id', userId)
        .single();

      if (expError) return { error: expError };

      const newCurrentDay = Math.min((experiment?.current_day || 0) + 1, experiment?.duration || 0);
      const isCompleted = newCurrentDay >= (experiment?.duration || 0);

      // Update experiment
      const { error } = await supabase
        .from('experiments')
        .update({ 
          current_day: newCurrentDay,
          status: isCompleted ? 'completed' : 'active'
        })
        .eq('id', experimentId)
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  }

  static async getExperimentWithLogs(experimentId: string, userId: string): Promise<{ data: any | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('experiments')
        .select(`
          *,
          experiment_logs (*)
        `)
        .eq('id', experimentId)
        .eq('user_id', userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async convertToHabit(experimentId: string, userId: string): Promise<{ data: any | null; error: any }> {
    try {
      // Get experiment details
      const { data: experiment, error: expError } = await supabase
        .from('experiments')
        .select('*')
        .eq('id', experimentId)
        .eq('user_id', userId)
        .single();

      if (expError) return { data: null, error: expError };

      // Create habit from experiment
      const { data: habit, error: habitError } = await supabase
        .from('habits')
        .insert({
          user_id: userId,
          name: experiment.activity_name,
          description: `Converted from experiment: ${experiment.activity_name}`,
          category: 'Health', // Default category
          total_days: 30,
          streak: 0,
          reminder_enabled: false
        })
        .select()
        .single();

      return { data: habit, error: habitError };
    } catch (error) {
      return { data: null, error };
    }
  }
}
