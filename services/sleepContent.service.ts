import { supabase } from '@/lib/supabase';

export interface SleepContent {
  id: string;
  title: string;
  category: 'guided_meditation' | 'bedtime_stories' | 'nature_sounds' | 'ambient' | 'sleep_hypnosis' | 'quick_tools';
  youtube_id: string;
  thumbnail_url?: string;
  description?: string;
  duration: string;
  duration_minutes?: number;
  type?: string;
  tags?: string[];
  emoji?: string;
  language?: string;
  voice_type?: string;
  best_for?: string[];
  is_public_domain?: boolean;
  is_featured?: boolean;
  play_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SleepFavorite {
  id: string;
  user_id: string;
  content_id: string;
  created_at: string;
}

export class SleepContentService {
  // Get all content
  static async getAll(): Promise<{ data: SleepContent[] | null; error: any }> {
    const { data, error } = await supabase
      .from('sleep_content_library')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('play_count', { ascending: false });

    if (error) {
      console.error('SleepContentService.getAll error:', error);
    } else {
      console.log('SleepContentService.getAll loaded:', data?.length || 0, 'items');
    }

    return { data, error };
  }

  // Get content by category
  static async getByCategory(category: string): Promise<{ data: SleepContent[] | null; error: any }> {
    const { data, error } = await supabase
      .from('sleep_content_library')
      .select('*')
      .eq('category', category)
      .order('is_featured', { ascending: false })
      .order('play_count', { ascending: false });

    return { data, error };
  }

  // Get featured content
  static async getFeatured(): Promise<{ data: SleepContent[] | null; error: any }> {
    const { data, error } = await supabase
      .from('sleep_content_library')
      .select('*')
      .eq('is_featured', true)
      .order('play_count', { ascending: false });

    return { data, error };
  }

  // Search content
  static async search(query: string): Promise<{ data: SleepContent[] | null; error: any }> {
    const { data, error } = await supabase
      .from('sleep_content_library')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('play_count', { ascending: false });

    return { data, error };
  }

  // Get content by ID
  static async getById(id: string): Promise<{ data: SleepContent | null; error: any }> {
    const { data, error } = await supabase
      .from('sleep_content_library')
      .select('*')
      .eq('id', id)
      .single();

    return { data, error };
  }

  // Increment play count
  static async incrementPlayCount(contentId: string): Promise<{ error: any }> {
    const { error } = await supabase.rpc('increment_sleep_content_play_count', {
      content_id: contentId
    });

    // Fallback if RPC doesn't exist
    if (error) {
      const { data: current } = await supabase
        .from('sleep_content_library')
        .select('play_count')
        .eq('id', contentId)
        .single();

      if (current) {
        await supabase
          .from('sleep_content_library')
          .update({ play_count: (current.play_count || 0) + 1 })
          .eq('id', contentId);
      }
    }

    return { error: null };
  }

  // Get user favorites
  static async getFavorites(userId: string): Promise<{ data: SleepContent[] | null; error: any }> {
    const { data, error } = await supabase
      .from('sleep_favorites')
      .select(`
        content_id,
        sleep_content_library (*)
      `)
      .eq('user_id', userId);

    if (error) return { data: null, error };

    const content = data?.map((fav: any) => fav.sleep_content_library) || [];
    return { data: content, error: null };
  }

  // Get favorite IDs for user
  static async getFavoriteIds(userId: string): Promise<{ data: string[] | null; error: any }> {
    const { data, error } = await supabase
      .from('sleep_favorites')
      .select('content_id')
      .eq('user_id', userId);

    if (error) return { data: null, error };

    const ids = data?.map((fav: any) => fav.content_id) || [];
    return { data: ids, error: null };
  }

  // Add to favorites
  static async addFavorite(userId: string, contentId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('sleep_favorites')
      .insert({
        user_id: userId,
        content_id: contentId
      });

    return { error };
  }

  // Remove from favorites
  static async removeFavorite(userId: string, contentId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('sleep_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', contentId);

    return { error };
  }

  // Toggle favorite
  static async toggleFavorite(userId: string, contentId: string): Promise<{ isFavorite: boolean; error: any }> {
    // Check if already favorited
    const { data } = await supabase
      .from('sleep_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .single();

    if (data) {
      // Remove
      const { error } = await this.removeFavorite(userId, contentId);
      return { isFavorite: false, error };
    } else {
      // Add
      const { error } = await this.addFavorite(userId, contentId);
      return { isFavorite: true, error };
    }
  }

  // Check if content is favorited
  static async isFavorite(userId: string, contentId: string): Promise<boolean> {
    const { data } = await supabase
      .from('sleep_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .single();

    return !!data;
  }

  // Get content by best_for purpose
  static async getByPurpose(purpose: string): Promise<{ data: SleepContent[] | null; error: any }> {
    const { data, error } = await supabase
      .from('sleep_content_library')
      .select('*')
      .contains('best_for', [purpose])
      .order('play_count', { ascending: false });

    return { data, error };
  }

  // Get quick tools (short duration content)
  static async getQuickTools(): Promise<{ data: SleepContent[] | null; error: any }> {
    const { data, error } = await supabase
      .from('sleep_content_library')
      .select('*')
      .or('category.eq.quick_tools,duration_minutes.lte.10')
      .order('duration_minutes', { ascending: true });

    return { data, error };
  }

  // Map category display name to database value
  static categoryToDbValue(displayName: string): string {
    const mapping: Record<string, string> = {
      'Guided Meditations': 'guided_meditation',
      'Guided Meditation': 'guided_meditation',
      'Bedtime Stories': 'bedtime_stories',
      'Nature Sounds': 'nature_sounds',
      'Ambient/Nature Soundscapes': 'ambient',
      'Ambient': 'ambient',
      'Sleep Hypnosis': 'sleep_hypnosis',
      'Quick Tools': 'quick_tools'
    };
    return mapping[displayName] || displayName;
  }

  // Map database category to display name
  static dbValueToCategory(dbValue: string): string {
    const mapping: Record<string, string> = {
      'guided_meditation': 'Guided Meditations',
      'bedtime_stories': 'Bedtime Stories',
      'nature_sounds': 'Nature Sounds',
      'ambient': 'Ambient',
      'sleep_hypnosis': 'Sleep Hypnosis',
      'quick_tools': 'Quick Tools'
    };
    return mapping[dbValue] || dbValue;
  }
}
