/**
 * Profile Service
 * Date: 2025-11-05
 * Purpose: Service layer for user profile management including avatar uploads
 */

import { SupabaseSafe } from '@/lib/supabaseSafe';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';
import { isGuestMode, guestDataStore } from '@/lib/guestDataStore';
import * as ImagePicker from 'expo-image-picker';

// Database types
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  profile_picture: string | null;
  pin_code_hash: string | null;
  pin_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateInput {
  full_name?: string;
  email?: string;
  profile_picture?: string;
}

/**
 * Service class for managing user profiles
 */
export class ProfileService {
  // ============================================================
  // Profile CRUD Operations
  // ============================================================

  /**
   * Get user profile
   */
  static async getProfile(userId: string): Promise<{
    data: Profile | null;
    error: any;
  }> {
    if (await isGuestMode()) {
      return {
        data: this.getMockProfile(userId),
        error: null,
      };
    }

    const result = await SupabaseSafe.select(
      'profiles',
      { eq: { id: userId } },
      userId
    );

    if (result.success && result.data && result.data.length > 0) {
      return {
        data: result.data[0] as Profile,
        error: null,
      };
    }

    return {
      data: null,
      error: result.success ? null : result.error,
    };
  }

  /**
   * Create or update user profile
   */
  static async upsertProfile(
    userId: string,
    input: ProfileUpdateInput
  ): Promise<{
    data: Profile | null;
    error: any;
  }> {
    if (await isGuestMode()) {
      return {
        data: { ...this.getMockProfile(userId), ...input } as Profile,
        error: null,
      };
    }

    // Check if profile exists
    const existing = await this.getProfile(userId);

    if (existing.data) {
      // Update existing profile
      const result = await SupabaseSafe.update(
        'profiles',
        userId,
        input as ProfileUpdate,
        userId
      );

      return {
        data: result.success ? (result.data as Profile) : null,
        error: result.success ? null : result.error,
      };
    } else {
      // Create new profile
      const result = await SupabaseSafe.insert(
        'profiles',
        {
          id: userId,
          ...input,
        } as ProfileInsert,
        userId
      );

      return {
        data: result.success ? (result.data as Profile) : null,
        error: result.success ? null : result.error,
      };
    }
  }

  /**
   * Update profile name
   */
  static async updateName(
    userId: string,
    fullName: string
  ): Promise<{
    data: Profile | null;
    error: any;
  }> {
    return this.upsertProfile(userId, { full_name: fullName });
  }

  /**
   * Update profile email
   */
  static async updateEmail(
    userId: string,
    email: string
  ): Promise<{
    data: Profile | null;
    error: any;
  }> {
    // Update profile table
    const profileResult = await this.upsertProfile(userId, { email });

    // Also update auth email via Supabase Auth
    if (!await isGuestMode()) {
      try {
        const { error: authError } = await supabase.auth.updateUser({
          email: email,
        });

        if (authError) {
          return {
            data: null,
            error: authError,
          };
        }
      } catch (error) {
        return {
          data: null,
          error,
        };
      }
    }

    return profileResult;
  }

  // ============================================================
  // Profile Picture / Avatar Management
  // ============================================================

  /**
   * Upload profile picture to Supabase Storage
   * NOTE: This requires expo-file-system and base64-arraybuffer packages
   * Run: npx expo install expo-file-system && npm install base64-arraybuffer
   */
  static async uploadProfilePicture(
    userId: string,
    imageUri: string
  ): Promise<{
    data: { url: string } | null;
    error: any;
  }> {
    if (await isGuestMode()) {
      return {
        data: { url: imageUri },
        error: null,
      };
    }

    try {
      // Generate unique filename
      const fileExt = imageUri.split('.').pop() || 'jpg';
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Fetch the image as blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Convert blob to ArrayBuffer
      const arrayBuffer = await new Response(blob).arrayBuffer();

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return {
          data: null,
          error: uploadError,
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      if (!urlData || !urlData.publicUrl) {
        return {
          data: null,
          error: { message: 'Failed to get public URL' },
        };
      }

      // Update profile with new avatar URL
      await this.upsertProfile(userId, {
        profile_picture: urlData.publicUrl,
      });

      return {
        data: { url: urlData.publicUrl },
        error: null,
      };
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      return {
        data: null,
        error,
      };
    }
  }

  /**
   * Delete profile picture
   */
  static async deleteProfilePicture(userId: string): Promise<{
    error: any;
  }> {
    if (await isGuestMode()) {
      return { error: null };
    }

    try {
      // Get current profile to find avatar path
      const profile = await this.getProfile(userId);
      if (!profile.data?.profile_picture) {
        return { error: null };
      }

      // Extract filename from URL
      const url = profile.data.profile_picture;
      const pathMatch = url.match(/avatars\/(.+)$/);
      if (!pathMatch) {
        return { error: { message: 'Invalid avatar URL' } };
      }

      const filePath = pathMatch[1];

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (deleteError) {
        return { error: deleteError };
      }

      // Update profile to remove avatar URL
      await this.upsertProfile(userId, {
        profile_picture: null,
      });

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // ============================================================
  // Convenience Methods
  // ============================================================

  /**
   * Get user's preferred name (convenience method)
   */
  static async getPreferredName(userId: string): Promise<string> {
    const result = await this.getProfile(userId);
    if (result.data?.full_name) {
      return result.data.full_name;
    }
    return 'User';
  }

  /**
   * Update preferred name
   */
  static async updatePreferredName(
    userId: string,
    name: string
  ): Promise<{ success: boolean; error?: any }> {
    const result = await this.updateName(userId, name);
    return {
      success: !result.error,
      error: result.error,
    };
  }

  // ============================================================
  // Utility Functions
  // ============================================================

  /**
   * Generate mock profile for guest mode
   */
  private static getMockProfile(userId: string): Profile {
    return {
      id: userId,
      full_name: 'Guest User',
      email: 'guest@betternapped.local',
      profile_picture: null,
      pin_code_hash: null,
      pin_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}
