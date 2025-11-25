/**
 * Security Service
 * Date: 2025-11-23
 * Purpose: Manage PIN encryption, auto-lock, and app security features
 */

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { SupabaseSafe } from '@/lib/supabaseSafe';
import { isGuestMode } from '@/lib/guestDataStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants
const PIN_HASH_KEY = 'app_pin_hash';
const PIN_SALT_KEY = 'app_pin_salt';
const PIN_ENABLED_KEY = 'app_pin_enabled';
const AUTO_LOCK_ENABLED_KEY = 'app_auto_lock_enabled';
const AUTO_LOCK_TIME_KEY = 'app_auto_lock_time';
const BIOMETRIC_ENABLED_KEY = 'app_biometric_enabled';
const LAST_ACTIVE_KEY = 'app_last_active';

export type AutoLockTime = 'immediately' | '30_seconds' | '1_minute' | '5_minutes' | '15_minutes';

export interface SecuritySettings {
  pinEnabled: boolean;
  autoLockEnabled: boolean;
  autoLockTime: AutoLockTime;
  biometricEnabled: boolean;
}

export interface SecuritySettingsInput {
  pinEnabled?: boolean;
  autoLockEnabled?: boolean;
  autoLockTime?: AutoLockTime;
  biometricEnabled?: boolean;
}

/**
 * Service class for managing app security
 */
export class SecurityService {
  // ============================================================
  // PIN Management
  // ============================================================

  /**
   * Generate a random salt for PIN hashing
   */
  private static async generateSalt(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    return Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Hash PIN with salt using SHA-256
   */
  private static async hashPIN(pin: string, salt: string): Promise<string> {
    const saltedPin = salt + pin + salt;
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      saltedPin
    );
    return hash;
  }

  /**
   * Check if PIN is enabled
   */
  static async isPINEnabled(userId: string): Promise<boolean> {
    if (await isGuestMode()) {
      const value = await AsyncStorage.getItem(PIN_ENABLED_KEY);
      return value === 'true';
    }

    // Check SecureStore first (local device)
    const localEnabled = await SecureStore.getItemAsync(PIN_ENABLED_KEY);
    if (localEnabled === 'true') {
      return true;
    }

    // Also check backend for sync across devices
    const result = await SupabaseSafe.select(
      'user_security_settings',
      { id: userId }
    );

    if (result.success && result.data && result.data.length > 0) {
      return result.data[0].pin_enabled || false;
    }

    return false;
  }

  /**
   * Setup a new PIN
   */
  static async setupPIN(
    userId: string,
    pin: string,
    confirmPin: string
  ): Promise<{ success: boolean; error?: string }> {
    // Validate PIN
    if (pin !== confirmPin) {
      return { success: false, error: 'PINs do not match' };
    }

    if (pin.length < 4 || pin.length > 6) {
      return { success: false, error: 'PIN must be 4-6 digits' };
    }

    if (!/^\d+$/.test(pin)) {
      return { success: false, error: 'PIN must contain only digits' };
    }

    try {
      // Generate salt and hash PIN
      const salt = await this.generateSalt();
      const hashedPin = await this.hashPIN(pin, salt);

      // Store securely on device
      await SecureStore.setItemAsync(PIN_SALT_KEY, salt);
      await SecureStore.setItemAsync(PIN_HASH_KEY, hashedPin);
      await SecureStore.setItemAsync(PIN_ENABLED_KEY, 'true');

      if (await isGuestMode()) {
        await AsyncStorage.setItem(PIN_ENABLED_KEY, 'true');
        return { success: true };
      }

      // Also save to backend for sync (hash only, not salt - for verification purposes)
      const result = await SupabaseSafe.upsert(
        'user_security_settings',
        {
          id: userId,
          pin_enabled: true,
          pin_hash: hashedPin,
          updated_at: new Date().toISOString(),
        },
        'id'
      );

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to save settings' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting up PIN:', error);
      return { success: false, error: 'Failed to setup PIN' };
    }
  }

  /**
   * Verify PIN
   */
  static async verifyPIN(pin: string): Promise<boolean> {
    try {
      const salt = await SecureStore.getItemAsync(PIN_SALT_KEY);
      const storedHash = await SecureStore.getItemAsync(PIN_HASH_KEY);

      if (!salt || !storedHash) {
        return false;
      }

      const inputHash = await this.hashPIN(pin, salt);
      return inputHash === storedHash;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  }

  /**
   * Change PIN
   */
  static async changePIN(
    userId: string,
    currentPin: string,
    newPin: string,
    confirmNewPin: string
  ): Promise<{ success: boolean; error?: string }> {
    // Verify current PIN
    const isValid = await this.verifyPIN(currentPin);
    if (!isValid) {
      return { success: false, error: 'Current PIN is incorrect' };
    }

    // Set up new PIN
    return this.setupPIN(userId, newPin, confirmNewPin);
  }

  /**
   * Disable PIN
   */
  static async disablePIN(
    userId: string,
    currentPin: string
  ): Promise<{ success: boolean; error?: string }> {
    // Verify current PIN
    const isValid = await this.verifyPIN(currentPin);
    if (!isValid) {
      return { success: false, error: 'PIN is incorrect' };
    }

    try {
      // Remove from SecureStore
      await SecureStore.deleteItemAsync(PIN_SALT_KEY);
      await SecureStore.deleteItemAsync(PIN_HASH_KEY);
      await SecureStore.setItemAsync(PIN_ENABLED_KEY, 'false');

      if (await isGuestMode()) {
        await AsyncStorage.setItem(PIN_ENABLED_KEY, 'false');
        return { success: true };
      }

      // Update backend
      const result = await SupabaseSafe.update(
        'user_security_settings',
        userId,
        {
          pin_enabled: false,
          pin_hash: null,
          updated_at: new Date().toISOString(),
        }
      );

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to update settings' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error disabling PIN:', error);
      return { success: false, error: 'Failed to disable PIN' };
    }
  }

  // ============================================================
  // Auto-Lock Management
  // ============================================================

  /**
   * Get auto-lock time in milliseconds
   */
  static getAutoLockMs(time: AutoLockTime): number {
    switch (time) {
      case 'immediately':
        return 0;
      case '30_seconds':
        return 30 * 1000;
      case '1_minute':
        return 60 * 1000;
      case '5_minutes':
        return 5 * 60 * 1000;
      case '15_minutes':
        return 15 * 60 * 1000;
      default:
        return 60 * 1000;
    }
  }

  /**
   * Get auto-lock time label
   */
  static getAutoLockLabel(time: AutoLockTime): string {
    switch (time) {
      case 'immediately':
        return 'Immediately';
      case '30_seconds':
        return '30 seconds';
      case '1_minute':
        return '1 minute';
      case '5_minutes':
        return '5 minutes';
      case '15_minutes':
        return '15 minutes';
      default:
        return '1 minute';
    }
  }

  /**
   * Get all auto-lock options
   */
  static getAutoLockOptions(): Array<{ value: AutoLockTime; label: string }> {
    return [
      { value: 'immediately', label: 'Immediately' },
      { value: '30_seconds', label: '30 seconds' },
      { value: '1_minute', label: '1 minute' },
      { value: '5_minutes', label: '5 minutes' },
      { value: '15_minutes', label: '15 minutes' },
    ];
  }

  /**
   * Set auto-lock time
   */
  static async setAutoLockTime(
    userId: string,
    time: AutoLockTime
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await SecureStore.setItemAsync(AUTO_LOCK_TIME_KEY, time);

      if (await isGuestMode()) {
        return { success: true };
      }

      const result = await SupabaseSafe.upsert(
        'user_security_settings',
        {
          id: userId,
          auto_lock_time: time,
          updated_at: new Date().toISOString(),
        },
        'id'
      );

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to save settings' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting auto-lock time:', error);
      return { success: false, error: 'Failed to save auto-lock time' };
    }
  }

  /**
   * Get auto-lock time
   */
  static async getAutoLockTime(): Promise<AutoLockTime> {
    try {
      const time = await SecureStore.getItemAsync(AUTO_LOCK_TIME_KEY);
      return (time as AutoLockTime) || '1_minute';
    } catch (error) {
      return '1_minute';
    }
  }

  /**
   * Toggle auto-lock
   */
  static async setAutoLockEnabled(
    userId: string,
    enabled: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await SecureStore.setItemAsync(AUTO_LOCK_ENABLED_KEY, enabled ? 'true' : 'false');

      if (await isGuestMode()) {
        return { success: true };
      }

      const result = await SupabaseSafe.upsert(
        'user_security_settings',
        {
          id: userId,
          auto_lock_enabled: enabled,
          updated_at: new Date().toISOString(),
        },
        'id'
      );

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to save settings' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting auto-lock:', error);
      return { success: false, error: 'Failed to save auto-lock setting' };
    }
  }

  /**
   * Check if auto-lock is enabled
   */
  static async isAutoLockEnabled(): Promise<boolean> {
    try {
      const value = await SecureStore.getItemAsync(AUTO_LOCK_ENABLED_KEY);
      return value === 'true';
    } catch (error) {
      return false;
    }
  }

  /**
   * Record last active time
   */
  static async recordLastActive(): Promise<void> {
    try {
      await SecureStore.setItemAsync(LAST_ACTIVE_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error recording last active:', error);
    }
  }

  /**
   * Check if app should be locked based on inactivity
   */
  static async shouldLock(): Promise<boolean> {
    const pinEnabled = await SecureStore.getItemAsync(PIN_ENABLED_KEY);
    if (pinEnabled !== 'true') {
      return false;
    }

    const autoLockEnabled = await this.isAutoLockEnabled();
    if (!autoLockEnabled) {
      return false;
    }

    const lastActiveStr = await SecureStore.getItemAsync(LAST_ACTIVE_KEY);
    if (!lastActiveStr) {
      return true;
    }

    const lastActive = parseInt(lastActiveStr, 10);
    const autoLockTime = await this.getAutoLockTime();
    const lockAfterMs = this.getAutoLockMs(autoLockTime);

    const elapsed = Date.now() - lastActive;
    return elapsed >= lockAfterMs;
  }

  // ============================================================
  // Biometric Authentication
  // ============================================================

  /**
   * Toggle biometric authentication
   */
  static async setBiometricEnabled(
    userId: string,
    enabled: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');

      if (await isGuestMode()) {
        return { success: true };
      }

      const result = await SupabaseSafe.upsert(
        'user_security_settings',
        {
          id: userId,
          biometric_enabled: enabled,
          updated_at: new Date().toISOString(),
        },
        'id'
      );

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to save settings' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error setting biometric:', error);
      return { success: false, error: 'Failed to save biometric setting' };
    }
  }

  /**
   * Check if biometric is enabled
   */
  static async isBiometricEnabled(): Promise<boolean> {
    try {
      const value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
      return value === 'true';
    } catch (error) {
      return false;
    }
  }

  // ============================================================
  // Full Settings Management
  // ============================================================

  /**
   * Get all security settings
   */
  static async getSecuritySettings(userId: string): Promise<SecuritySettings> {
    const [pinEnabled, autoLockEnabled, autoLockTime, biometricEnabled] = await Promise.all([
      this.isPINEnabled(userId),
      this.isAutoLockEnabled(),
      this.getAutoLockTime(),
      this.isBiometricEnabled(),
    ]);

    return {
      pinEnabled,
      autoLockEnabled,
      autoLockTime,
      biometricEnabled,
    };
  }

  /**
   * Update multiple security settings at once
   */
  static async updateSecuritySettings(
    userId: string,
    settings: SecuritySettingsInput
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updates: any = {
        id: userId,
        updated_at: new Date().toISOString(),
      };

      if (settings.autoLockEnabled !== undefined) {
        await SecureStore.setItemAsync(
          AUTO_LOCK_ENABLED_KEY,
          settings.autoLockEnabled ? 'true' : 'false'
        );
        updates.auto_lock_enabled = settings.autoLockEnabled;
      }

      if (settings.autoLockTime !== undefined) {
        await SecureStore.setItemAsync(AUTO_LOCK_TIME_KEY, settings.autoLockTime);
        updates.auto_lock_time = settings.autoLockTime;
      }

      if (settings.biometricEnabled !== undefined) {
        await SecureStore.setItemAsync(
          BIOMETRIC_ENABLED_KEY,
          settings.biometricEnabled ? 'true' : 'false'
        );
        updates.biometric_enabled = settings.biometricEnabled;
      }

      if (await isGuestMode()) {
        return { success: true };
      }

      const result = await SupabaseSafe.upsert('user_security_settings', updates, 'id');

      if (!result.success) {
        return { success: false, error: result.error || 'Failed to save settings' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating security settings:', error);
      return { success: false, error: 'Failed to update settings' };
    }
  }
}

// Export for convenience
export const PINService = {
  isPINEnabled: SecurityService.isPINEnabled,
  setupPIN: SecurityService.setupPIN,
  verifyPIN: SecurityService.verifyPIN,
  changePIN: SecurityService.changePIN,
  disablePIN: SecurityService.disablePIN,
};
