/**
 * PIN Service
 * Date: 2025-11-05
 * Purpose: Service layer for PIN-based account lock feature
 */

import { SupabaseSafe } from '@/lib/supabaseSafe';
import { ProfileService } from './profile.service';
import { isGuestMode } from '@/lib/guestDataStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_STORAGE_KEY = '@pin_attempts';
const MAX_PIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Service class for PIN management
 */
export class PINService {
  // ============================================================
  // PIN Hashing
  // ============================================================

  /**
   * Simple hash function for PIN (SHA-256 equivalent using Web Crypto API)
   * Note: For production with native apps, consider using expo-crypto
   * Install with: npx expo install expo-crypto
   */
  private static async hashPIN(pin: string): Promise<string> {
    try {
      // Use Web Crypto API if available (works in React Native with polyfill)
      if (typeof crypto !== 'undefined' && crypto.subtle) {
        const encoder = new TextEncoder();
        const data = encoder.encode(pin + 'betternapped_salt'); // Add salt
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
      }
      
      // Fallback to simple hashing (less secure, but functional)
      // This is a simple implementation - replace with expo-crypto for production
      let hash = 0;
      const str = pin + 'betternapped_salt';
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    } catch (error) {
      console.error('Hash PIN error:', error);
      // Ultra-simple fallback
      return Buffer.from(pin + 'betternapped_salt').toString('base64');
    }
  }

  /**
   * Verify PIN against stored hash
   */
  private static async verifyPIN(
    pin: string,
    hash: string
  ): Promise<boolean> {
    const pinHash = await this.hashPIN(pin);
    return pinHash === hash;
  }

  // ============================================================
  // PIN Setup & Management
  // ============================================================

  /**
   * Validate PIN format (4-6 digits)
   */
  static validatePINFormat(pin: string): {
    valid: boolean;
    error?: string;
  } {
    if (!/^\d{4,6}$/.test(pin)) {
      return {
        valid: false,
        error: 'PIN must be 4-6 digits',
      };
    }

    return {
      valid: true,
    };
  }

  /**
   * Set up new PIN for account lock
   */
  static async setupPIN(
    userId: string,
    pin: string,
    confirmPin: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (await isGuestMode()) {
      // Store PIN in AsyncStorage for guest mode
      const hash = await this.hashPIN(pin);
      await AsyncStorage.setItem(`@guest_pin_${userId}`, hash);
      await AsyncStorage.setItem(`@guest_pin_enabled_${userId}`, 'true');
      return { success: true };
    }

    // Validate PINs match
    if (pin !== confirmPin) {
      return {
        success: false,
        error: 'PINs do not match',
      };
    }

    // Validate PIN format
    const validation = this.validatePINFormat(pin);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    try {
      // Hash the PIN
      const hash = await this.hashPIN(pin);

      // Update profile with hashed PIN
      const result = await SupabaseSafe.update(
        'profiles',
        userId,
        {
          pin_code_hash: hash,
          pin_enabled: true,
        },
        userId
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error?.message || 'Failed to set up PIN',
        };
      }

      // Clear any failed attempts
      await this.clearPINAttempts();

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Setup PIN error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  /**
   * Disable PIN lock
   */
  static async disablePIN(
    userId: string,
    currentPIN: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (await isGuestMode()) {
      await AsyncStorage.removeItem(`@guest_pin_${userId}`);
      await AsyncStorage.removeItem(`@guest_pin_enabled_${userId}`);
      return { success: true };
    }

    // Verify current PIN before disabling
    const verification = await this.verifyUserPIN(userId, currentPIN);
    if (!verification.valid) {
      return {
        success: false,
        error: 'Invalid PIN',
      };
    }

    try {
      const result = await SupabaseSafe.update(
        'profiles',
        userId,
        {
          pin_code_hash: null,
          pin_enabled: false,
        },
        userId
      );

      if (!result.success) {
        return {
          success: false,
          error: result.error?.message || 'Failed to disable PIN',
        };
      }

      // Clear any failed attempts
      await this.clearPINAttempts();

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('Disable PIN error:', error);
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  /**
   * Change existing PIN
   */
  static async changePIN(
    userId: string,
    currentPIN: string,
    newPIN: string,
    confirmNewPIN: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    // Verify current PIN
    const verification = await this.verifyUserPIN(userId, currentPIN);
    if (!verification.valid) {
      return {
        success: false,
        error: 'Invalid current PIN',
      };
    }

    // Set up new PIN
    return this.setupPIN(userId, newPIN, confirmNewPIN);
  }

  // ============================================================
  // PIN Verification & Security
  // ============================================================

  /**
   * Check if user has PIN enabled
   */
  static async isPINEnabled(userId: string): Promise<boolean> {
    if (await isGuestMode()) {
      const enabled = await AsyncStorage.getItem(`@guest_pin_enabled_${userId}`);
      return enabled === 'true';
    }

    const profile = await ProfileService.getProfile(userId);
    return profile.data?.pin_enabled || false;
  }

  /**
   * Verify user's PIN
   */
  static async verifyUserPIN(
    userId: string,
    pin: string
  ): Promise<{
    valid: boolean;
    error?: string;
    locked?: boolean;
  }> {
    // Check if user is locked out
    const lockoutCheck = await this.checkLockout();
    if (lockoutCheck.locked) {
      return {
        valid: false,
        locked: true,
        error: lockoutCheck.message,
      };
    }

    if (await isGuestMode()) {
      const hash = await AsyncStorage.getItem(`@guest_pin_${userId}`);
      if (!hash) {
        return { valid: false, error: 'No PIN set up' };
      }
      const isValid = await this.verifyPIN(pin, hash);
      if (isValid) {
        await this.clearPINAttempts();
      } else {
        await this.recordFailedAttempt();
      }
      return { valid: isValid };
    }

    try {
      const profile = await ProfileService.getProfile(userId);
      
      if (!profile.data || !profile.data.pin_code_hash) {
        return {
          valid: false,
          error: 'No PIN set up',
        };
      }

      const isValid = await this.verifyPIN(pin, profile.data.pin_code_hash);

      if (isValid) {
        // Clear failed attempts on successful verification
        await this.clearPINAttempts();
        return {
          valid: true,
        };
      } else {
        // Record failed attempt
        await this.recordFailedAttempt();
        const attempts = await this.getFailedAttempts();
        const remaining = MAX_PIN_ATTEMPTS - attempts.count;

        return {
          valid: false,
          error: `Invalid PIN. ${remaining} attempts remaining.`,
        };
      }
    } catch (error: any) {
      console.error('Verify PIN error:', error);
      return {
        valid: false,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  // ============================================================
  // Failed Attempts & Lockout Management
  // ============================================================

  /**
   * Record a failed PIN attempt
   */
  private static async recordFailedAttempt(): Promise<void> {
    try {
      const attempts = await this.getFailedAttempts();
      const newCount = attempts.count + 1;

      if (newCount >= MAX_PIN_ATTEMPTS) {
        // Lock out the user
        await AsyncStorage.setItem(
          PIN_STORAGE_KEY,
          JSON.stringify({
            count: newCount,
            lockoutUntil: Date.now() + LOCKOUT_DURATION,
          })
        );
      } else {
        await AsyncStorage.setItem(
          PIN_STORAGE_KEY,
          JSON.stringify({
            count: newCount,
            lockoutUntil: null,
          })
        );
      }
    } catch (error) {
      console.error('Error recording failed attempt:', error);
    }
  }

  /**
   * Get failed attempts count
   */
  private static async getFailedAttempts(): Promise<{
    count: number;
    lockoutUntil: number | null;
  }> {
    try {
      const data = await AsyncStorage.getItem(PIN_STORAGE_KEY);
      if (!data) {
        return { count: 0, lockoutUntil: null };
      }
      return JSON.parse(data);
    } catch (error) {
      return { count: 0, lockoutUntil: null };
    }
  }

  /**
   * Clear failed attempts
   */
  private static async clearPINAttempts(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PIN_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing PIN attempts:', error);
    }
  }

  /**
   * Check if user is locked out
   */
  private static async checkLockout(): Promise<{
    locked: boolean;
    message?: string;
  }> {
    const attempts = await this.getFailedAttempts();

    if (attempts.lockoutUntil && attempts.lockoutUntil > Date.now()) {
      const remainingMs = attempts.lockoutUntil - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return {
        locked: true,
        message: `Too many failed attempts. Try again in ${remainingMin} minute${remainingMin > 1 ? 's' : ''}.`,
      };
    }

    // If lockout expired, clear it
    if (attempts.lockoutUntil && attempts.lockoutUntil <= Date.now()) {
      await this.clearPINAttempts();
    }

    return {
      locked: false,
    };
  }

  /**
   * Get remaining PIN attempts before lockout
   */
  static async getRemainingAttempts(): Promise<number> {
    const attempts = await this.getFailedAttempts();
    return Math.max(0, MAX_PIN_ATTEMPTS - attempts.count);
  }
}
