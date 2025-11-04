/**
 * Auth Service
 * Date: 2025-11-05
 * Purpose: Service layer for authentication operations including password management and account deletion
 */

import { supabase } from '@/lib/supabase';
import { SupabaseSafe } from '@/lib/supabaseSafe';
import { isGuestMode } from '@/lib/guestDataStore';

/**
 * Password validation regex
 * - At least 8 characters
 * - At least one number
 * - At least one special character
 */
const PASSWORD_REGEX = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

/**
 * Service class for authentication operations
 */
export class AuthService {
  // ============================================================
  // Password Management
  // ============================================================

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Change user password (requires authentication)
   */
  static async changePassword(
    newPassword: string,
    confirmPassword: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (await isGuestMode()) {
      return {
        success: false,
        error: 'Cannot change password in guest mode',
      };
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      return {
        success: false,
        error: 'Passwords do not match',
      };
    }

    // Validate password strength
    const validation = this.validatePassword(newPassword);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join('. '),
      };
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('Change password error:', error);
        return {
          success: false,
          error: error.message || 'Failed to change password',
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Change password exception:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(email: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (await isGuestMode()) {
      return {
        success: false,
        error: 'Cannot reset password in guest mode',
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'betternapped://reset-password', // Deep link for mobile app
      });

      if (error) {
        console.error('Password reset error:', error);
        return {
          success: false,
          error: error.message || 'Failed to send reset email',
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Password reset exception:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  // ============================================================
  // Account Management
  // ============================================================

  /**
   * Sign out current user
   */
  static async signOut(): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        return {
          success: false,
          error: error.message || 'Failed to sign out',
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Sign out exception:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  /**
   * Delete user account permanently
   * WARNING: This operation cannot be undone
   */
  static async deleteAccount(
    userId: string,
    password?: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (await isGuestMode()) {
      return {
        success: false,
        error: 'Cannot delete account in guest mode',
      };
    }

    try {
      // Optional: Re-authenticate user with password for extra security
      if (password) {
        const { data: sessionData } = await supabase.auth.getSession();
        const email = sessionData.session?.user.email;

        if (email) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            return {
              success: false,
              error: 'Invalid password. Please try again.',
            };
          }
        }
      }

      // Delete user via Supabase Auth Admin API
      // Note: This requires proper RLS policies to cascade delete related data
      // The ON DELETE CASCADE in foreign keys will handle data cleanup
      
      // First, manually delete user data (if needed for audit logs)
      // This is optional - CASCADE will handle it automatically
      
      // Delete the auth user
      // Note: In production, this should be done via a secure server-side function
      // For now, we'll use the client SDK which requires proper permissions
      
      const { error } = await supabase.rpc('delete_user_account', {
        user_id: userId,
      });

      if (error) {
        // If RPC doesn't exist, try direct auth deletion
        // This will only work if the user has the right permissions
        console.error('Delete account error:', error);
        
        // Sign out first
        await supabase.auth.signOut();
        
        return {
          success: false,
          error: 'Failed to delete account. Please contact support.',
        };
      }

      // Sign out after deletion
      await supabase.auth.signOut();

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Delete account exception:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  /**
   * Verify current password
   * Useful before sensitive operations
   */
  static async verifyPassword(password: string): Promise<{
    valid: boolean;
    error?: string;
  }> {
    if (await isGuestMode()) {
      return {
        valid: false,
        error: 'Cannot verify password in guest mode',
      };
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData.session?.user.email;

      if (!email) {
        return {
          valid: false,
          error: 'No active session',
        };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return {
          valid: false,
          error: 'Invalid password',
        };
      }

      return {
        valid: true,
      };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }
}
