import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';

// ✅ Configuration checks for safety
const isSupabaseConfigured =
  !!SUPABASE_URL &&
  !!SUPABASE_ANON_KEY &&
  SUPABASE_URL !== 'https://your-project-id.supabase.co' &&
  SUPABASE_ANON_KEY !== 'your-anon-key-here';

console.log('🔧 Supabase Config Check');
console.log('📡 URL:', SUPABASE_URL);
console.log('🔑 Key:', SUPABASE_ANON_KEY ? 'Set' : 'Missing');
console.log('✅ Configured:', isSupabaseConfigured);

export const supabase = createClient(
  SUPABASE_URL || 'https://mock.supabase.co',
  SUPABASE_ANON_KEY || 'mock-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  }
);

console.log('🚀 Supabase client initialized:', isSupabaseConfigured ? 'Real' : 'Mock');

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
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          profile_picture: string | null;
          pin_code_hash: string | null;
          pin_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          profile_picture?: string | null;
          pin_code_hash?: string | null;
          pin_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          profile_picture?: string | null;
          pin_code_hash?: string | null;
          pin_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          color_theme: string;
          theme_mode: string;
          icon_pack: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          color_theme?: string;
          theme_mode?: string;
          icon_pack?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          color_theme?: string;
          theme_mode?: string;
          icon_pack?: string;
          created_at?: string;
          updated_at?: string;
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
          instruction?: string;
          emoji?: string;
          total_days: number;
          streak: number;
          streak_goal: number;
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
          instruction?: string;
          emoji?: string;
          total_days: number;
          streak?: number;
          streak_goal?: number;
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
          instruction?: string;
          emoji?: string;
          total_days?: number;
          streak?: number;
          streak_goal?: number;
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
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          channels: any[];
          frequency: string;
          priority: string;
          time_of_day?: string;
          quiet_hours_start?: string;
          quiet_hours_end?: string;
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          channels?: any[];
          frequency?: string;
          priority?: string;
          time_of_day?: string;
          quiet_hours_start?: string;
          quiet_hours_end?: string;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          channels?: any[];
          frequency?: string;
          priority?: string;
          time_of_day?: string;
          quiet_hours_start?: string;
          quiet_hours_end?: string;
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      item_notification_overrides: {
        Row: {
          id: string;
          user_id: string;
          item_id: string;
          item_type: string;
          channels: any[];
          frequency: string;
          time_of_day?: string;
          weekdays: any[];
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_id: string;
          item_type: string;
          channels?: any[];
          frequency?: string;
          time_of_day?: string;
          weekdays?: any[];
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          item_id?: string;
          item_type?: string;
          channels?: any[];
          frequency?: string;
          time_of_day?: string;
          weekdays?: any[];
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          channel: string;
          status: string;
          payload: any;
          send_after: string;
          sent_at?: string;
          delivered_at?: string;
          read_at?: string;
          error_message?: string;
          retry_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          channel: string;
          status?: string;
          payload: any;
          send_after?: string;
          sent_at?: string;
          delivered_at?: string;
          read_at?: string;
          error_message?: string;
          retry_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          channel?: string;
          status?: string;
          payload?: any;
          send_after?: string;
          sent_at?: string;
          delivered_at?: string;
          read_at?: string;
          error_message?: string;
          retry_count?: number;
          created_at?: string;
        };
      };
      user_devices: {
        Row: {
          id: string;
          user_id: string;
          device_token: string;
          platform: string;
          push_enabled: boolean;
          last_seen: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_token: string;
          platform: string;
          push_enabled?: boolean;
          last_seen?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_token?: string;
          platform?: string;
          push_enabled?: boolean;
          last_seen?: string;
          created_at?: string;
        };
      };
    };
  };
};
