/**
 * User Preferences Service
 * Date: 2025-11-05
 * Purpose: Manage user theme and appearance preferences
 */

import { SupabaseSafe } from '@/lib/supabaseSafe';
import { supabase } from '@/lib/supabase';
import { isGuestMode } from '@/lib/guestDataStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserPreferences {
  id: string;
  color_theme: string;
  theme_mode: 'light' | 'dark' | 'system';
  icon_pack: string;
  emoji_palette: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferencesInput {
  color_theme?: string;
  theme_mode?: 'light' | 'dark' | 'system';
  icon_pack?: string;
  emoji_palette?: string;
}

const GUEST_PREFS_KEY = '@guest_user_preferences';

/**
 * Service class for managing user preferences
 */
export class UserPreferencesService {
  // ============================================================
  // Preferences CRUD Operations
  // ============================================================

  /**
   * Get user preferences
   */
  static async getUserPreferences(userId: string): Promise<{
    data: UserPreferences | null;
    error: any;
  }> {
    if (await isGuestMode()) {
      // Load from AsyncStorage for guest users
      try {
        const stored = await AsyncStorage.getItem(GUEST_PREFS_KEY);
        if (stored) {
          return { data: JSON.parse(stored), error: null };
        }
        // Return default preferences for new guest
        return {
          data: {
            id: 'guest',
            color_theme: 'default',
            theme_mode: 'system',
            icon_pack: 'default',
            emoji_palette: 'apple',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          error: null,
        };
      } catch (error) {
        return { data: null, error };
      }
    }

    const result = await SupabaseSafe.select<UserPreferences>(
      'user_preferences',
      { id: userId },
      userId
    );
    
    if (result.success && result.data && result.data.length > 0) {
      return { data: result.data[0], error: null };
    }

    // If no preferences exist, return defaults (they should be auto-created on signup)
    if (!result.data || result.data.length === 0) {
      return {
        data: {
          id: userId,
          color_theme: 'default',
          theme_mode: 'system',
          icon_pack: 'default',
          emoji_palette: 'apple',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      };
    }

    return { data: null, error: result.error };
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(
    userId: string,
    preferences: UserPreferencesInput
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (await isGuestMode()) {
      // Save to AsyncStorage for guest users
      try {
        const current = await this.getUserPreferences(userId);
        const updated = {
          ...current.data,
          ...preferences,
          updated_at: new Date().toISOString(),
        };
        await AsyncStorage.setItem(GUEST_PREFS_KEY, JSON.stringify(updated));
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to save preferences',
        };
      }
    }

    const result = await SupabaseSafe.update(
      'user_preferences',
      userId,
      preferences,
      userId
    );

    if (result.success) {
      return { success: true };
    }

    // If update fails because row doesn't exist, try insert
    if (!result.success) {
      const insertResult = await SupabaseSafe.insert(
        'user_preferences',
        {
          id: userId,
          ...preferences,
        },
        userId
      );

      if (insertResult.success) {
        return { success: true };
      }

      return {
        success: false,
        error: insertResult.error || 'Failed to update preferences',
      };
    }

    return {
      success: false,
      error: result.error || 'Failed to update preferences',
    };
  }

  /**
   * Update color theme only
   */
  static async updateColorTheme(
    userId: string,
    colorTheme: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    return this.updateUserPreferences(userId, { color_theme: colorTheme });
  }

  /**
   * Update theme mode only
   */
  static async updateThemeMode(
    userId: string,
    themeMode: 'light' | 'dark' | 'system'
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    return this.updateUserPreferences(userId, { theme_mode: themeMode });
  }

  /**
   * Update icon pack only
   */
  static async updateIconPack(
    userId: string,
    iconPack: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    return this.updateUserPreferences(userId, { icon_pack: iconPack });
  }

  /**
   * Update emoji palette only
   */
  static async updateEmojiPalette(
    userId: string,
    emojiPalette: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    return this.updateUserPreferences(userId, { emoji_palette: emojiPalette });
  }

  /**
   * Reset preferences to defaults
   */
  static async resetToDefaults(userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    return this.updateUserPreferences(userId, {
      color_theme: 'default',
      theme_mode: 'system',
      icon_pack: 'default',
      emoji_palette: 'apple',
    });
  }

  // ============================================================
  // Helper Methods
  // ============================================================

  /**
   * Get current color theme
   */
  static async getCurrentColorTheme(userId: string): Promise<string> {
    const result = await this.getUserPreferences(userId);
    return result.data?.color_theme || 'default';
  }

  /**
   * Get current theme mode
   */
  static async getCurrentThemeMode(userId: string): Promise<'light' | 'dark' | 'system'> {
    const result = await this.getUserPreferences(userId);
    return result.data?.theme_mode || 'system';
  }

  /**
   * Get current icon pack
   */
  static async getCurrentIconPack(userId: string): Promise<string> {
    const result = await this.getUserPreferences(userId);
    return result.data?.icon_pack || 'default';
  }

  /**
   * Get current emoji palette
   */
  static async getCurrentEmojiPalette(userId: string): Promise<string> {
    const result = await this.getUserPreferences(userId);
    return result.data?.emoji_palette || 'apple';
  }

  /**
   * Check if user has custom preferences
   */
  static async hasCustomPreferences(userId: string): Promise<boolean> {
    const result = await this.getUserPreferences(userId);
    if (!result.data) return false;
    
    return (
      result.data.color_theme !== 'default' ||
      result.data.theme_mode !== 'system' ||
      result.data.icon_pack !== 'default' ||
      result.data.emoji_palette !== 'apple'
    );
  }
}
