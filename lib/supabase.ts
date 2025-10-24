import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';

// Check if Supabase is properly configured
const isSupabaseConfigured = SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL !== 'https://your-project-id.supabase.co' && 
  SUPABASE_ANON_KEY !== 'your-anon-key-here';

console.log('🔧 Supabase Configuration:');
console.log('📡 SUPABASE_URL:', SUPABASE_URL);
console.log('🔑 SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Set' : 'Not set');
console.log('✅ isSupabaseConfigured:', isSupabaseConfigured);

// Create Supabase client with fallback for development
export const supabase = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : createClient('https://mock.supabase.co', 'mock-key', {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });

console.log('🚀 Supabase client created:', isSupabaseConfigured ? 'Real Supabase' : 'Mock Supabase');

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
          metadata: any;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
          metadata?: any;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
          metadata?: any;
        };
      };
      mood_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          moods: any[];
          triggers: any;
          score: number;
          emoji: string;
          notes?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          moods: any[];
          triggers?: any;
          score: number;
          emoji: string;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          moods?: any[];
          triggers?: any;
          score?: number;
          emoji?: string;
          notes?: string;
          created_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          category: string;
          name: string;
          duration?: number;
          emoji?: string;
          follow_up_answer?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          category: string;
          name: string;
          duration?: number;
          emoji?: string;
          follow_up_answer?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          category?: string;
          name?: string;
          duration?: number;
          emoji?: string;
          follow_up_answer?: string;
          created_at?: string;
        };
      };
      sleep_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          bedtime: string;
          wake_time: string;
          hours: number;
          quality: number;
          waking_feeling: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          bedtime: string;
          wake_time: string;
          hours: number;
          quality: number;
          waking_feeling: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          bedtime?: string;
          wake_time?: string;
          hours?: number;
          quality?: number;
          waking_feeling?: string;
          created_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          category: string;
          total_days: number;
          streak: number;
          reminder_enabled: boolean;
          reminder_time?: string;
          quote?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          category: string;
          total_days: number;
          streak?: number;
          reminder_enabled?: boolean;
          reminder_time?: string;
          quote?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          category?: string;
          total_days?: number;
          streak?: number;
          reminder_enabled?: boolean;
          reminder_time?: string;
          quote?: string;
          created_at?: string;
        };
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          date: string;
          completed: boolean;
          feedback?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          date: string;
          completed: boolean;
          feedback?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          date?: string;
          completed?: boolean;
          feedback?: string;
          created_at?: string;
        };
      };
      experiments: {
        Row: {
          id: string;
          user_id: string;
          activity_name: string;
          activity_emoji: string;
          outcomes: any[];
          start_date: string;
          end_date: string;
          duration: number;
          status: string;
          current_day: number;
          baseline_data?: any;
          results_data?: any;
          insights?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          activity_name: string;
          activity_emoji: string;
          outcomes: any[];
          start_date: string;
          end_date: string;
          duration: number;
          status: string;
          current_day?: number;
          baseline_data?: any;
          results_data?: any;
          insights?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          activity_name?: string;
          activity_emoji?: string;
          outcomes?: any[];
          start_date?: string;
          end_date?: string;
          duration?: number;
          status?: string;
          current_day?: number;
          baseline_data?: any;
          results_data?: any;
          insights?: string;
          created_at?: string;
        };
      };
      experiment_logs: {
        Row: {
          id: string;
          experiment_id: string;
          user_id: string;
          date: string;
          completed: boolean;
          skipped: boolean;
          outcome_scores?: any;
          notes?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          experiment_id: string;
          user_id: string;
          date: string;
          completed: boolean;
          skipped?: boolean;
          outcome_scores?: any;
          notes?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          experiment_id?: string;
          user_id?: string;
          date?: string;
          completed?: boolean;
          skipped?: boolean;
          outcome_scores?: any;
          notes?: string;
          created_at?: string;
        };
      };
      productivity_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          rating: number;
          focused_hours?: number;
          factors: any[];
          other_factor?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          rating: number;
          focused_hours?: number;
          factors?: any[];
          other_factor?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          rating?: number;
          focused_hours?: number;
          factors?: any[];
          other_factor?: string;
          created_at?: string;
        };
      };
      intimacy_logs: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          type: string;
          orgasm: boolean;
          location?: string;
          toy_used: boolean;
          time_to_sleep: number;
          mood_before: number;
          mood_after: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          type: string;
          orgasm: boolean;
          location?: string;
          toy_used: boolean;
          time_to_sleep: number;
          mood_before: number;
          mood_after: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          type?: string;
          orgasm?: boolean;
          location?: string;
          toy_used?: boolean;
          time_to_sleep?: number;
          mood_before?: number;
          mood_after?: number;
          created_at?: string;
        };
      };
      mental_clarity_tests: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          score: number;
          factors: any[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          score: number;
          factors?: any[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          score?: number;
          factors?: any[];
          created_at?: string;
        };
      };
    };
  };
};
