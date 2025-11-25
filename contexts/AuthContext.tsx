import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { OnboardingService } from '@/services/onboarding.service';
import { ProfileService } from '@/services/profile.service';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, preferredName?: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  refreshSession: () => Promise<void>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithApple: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const router = useRouter();

  // Check if user is authenticated or in guest mode
  const checkAuthState = useCallback(async () => {
    try {
      console.log('🔍 AuthContext: Checking auth state...');
      
      // Check for guest mode first
      const guestMode = await AsyncStorage.getItem('guest_mode');
      if (guestMode === 'true') {
        console.log('👤 AuthContext: Guest mode detected');
        setIsGuest(true);
        setUser(null);
        setSession(null);
        setLoading(false);
        return;
      }

      // Check for existing session
      const { data: { session: storedSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ AuthContext: Error getting session:', error);
        setLoading(false);
        return;
      }

      console.log('✅ AuthContext: Session retrieved:', storedSession ? 'Valid' : 'None');
      
      setSession(storedSession);
      setUser(storedSession?.user ?? null);
      setIsGuest(false);
    } catch (error) {
      console.error('❌ AuthContext: Exception checking auth state:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth state on app start
  useEffect(() => {
    checkAuthState();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 AuthContext: Auth state change:', event, session ? 'Valid session' : 'No session');
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle sign out
      if (event === 'SIGNED_OUT') {
        setIsGuest(false);
        await AsyncStorage.removeItem('guest_mode');
        console.log('👋 AuthContext: User signed out');
      }
      
      // Handle sign in
      if (event === 'SIGNED_IN' && session) {
        setIsGuest(false);
        await AsyncStorage.removeItem('guest_mode');
        console.log('✅ AuthContext: User signed in');

        // Check for pending preferred name (from email verification flow)
        try {
          const pendingName = await AsyncStorage.getItem(`pending_name_${session.user.id}`);
          if (pendingName) {
            await ProfileService.updateName(session.user.id, pendingName);
            await AsyncStorage.removeItem(`pending_name_${session.user.id}`);
            console.log('✅ AuthContext: Pending preferred name saved');
          }
        } catch (error) {
          console.error('⚠️ AuthContext: Error handling pending name:', error);
        }

        // Complete onboarding and save goals/programs
        try {
          await OnboardingService.completeOnboarding(session.user.id);
        } catch (error) {
          console.error('Error completing onboarding:', error);
        }
      }

      // Handle token refresh
      if (event === 'TOKEN_REFRESHED' && session) {
        setSession(session);
        setUser(session.user);
        console.log('🔄 AuthContext: Token refreshed');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuthState]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ AuthContext: Sign in error:', error);
        return { success: false, error: error.message };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setIsGuest(false);
        await AsyncStorage.removeItem('guest_mode');
        console.log('✅ AuthContext: Sign in successful');
        return { success: true };
      }

      return { success: false, error: 'No session returned' };
    } catch (error: any) {
      console.error('❌ AuthContext: Sign in exception:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, preferredName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('❌ AuthContext: Sign up error:', error);
        return { success: false, error: error.message };
      }

      if (data.session && data.user) {
        // Save preferred name to profile
        if (preferredName && preferredName.trim()) {
          try {
            await ProfileService.updateName(data.user.id, preferredName.trim());
            console.log('✅ AuthContext: Preferred name saved');
          } catch (nameError) {
            console.error('⚠️ AuthContext: Failed to save preferred name:', nameError);
            // Don't fail signup if name save fails
          }
        }

        setSession(data.session);
        setUser(data.session.user);
        setIsGuest(false);
        await AsyncStorage.removeItem('guest_mode');
        console.log('✅ AuthContext: Sign up successful with session');
        return { success: true };
      } else if (data.user) {
        // Email verification required - store preferred name temporarily
        if (preferredName && preferredName.trim()) {
          try {
            await AsyncStorage.setItem(`pending_name_${data.user.id}`, preferredName.trim());
            console.log('✅ AuthContext: Preferred name stored temporarily');
          } catch (storageError) {
            console.error('⚠️ AuthContext: Failed to store pending name:', storageError);
          }
        }
        console.log('✅ AuthContext: Sign up successful, email verification required');
        return { success: true, needsVerification: true };
      }

      return { success: false, error: 'No session or user returned' };
    } catch (error: any) {
      console.error('❌ AuthContext: Sign up exception:', error);
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ AuthContext: Sign out error:', error);
        throw error;
      }

      setSession(null);
      setUser(null);
      setIsGuest(false);
      await AsyncStorage.removeItem('guest_mode');
      console.log('✅ AuthContext: Sign out successful');
    } catch (error) {
      console.error('❌ AuthContext: Sign out exception:', error);
      throw error;
    }
  };

  const continueAsGuest = async () => {
    try {
      console.log('👤 AuthContext: Setting guest mode...');
      await AsyncStorage.setItem('guest_mode', 'true');
      setIsGuest(true);
      setUser(null);
      setSession(null);
      console.log('✅ AuthContext: Guest mode enabled');
    } catch (error) {
      console.error('❌ AuthContext: Error setting guest mode:', error);
      throw error;
    }
  };

  const refreshSession = async () => {
    try {
      console.log('🔄 AuthContext: Refreshing session...');
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('❌ AuthContext: Session refresh error:', error);
        return;
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        console.log('✅ AuthContext: Session refreshed');
      }
    } catch (error) {
      console.error('❌ AuthContext: Session refresh exception:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('🔐 AuthContext: Starting Google sign-in...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'betternapped://auth/callback',
        },
      });

      if (error) {
        console.error('❌ AuthContext: Google sign-in error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ AuthContext: Google sign-in initiated');
      return { success: true };
    } catch (error: any) {
      console.error('❌ AuthContext: Google sign-in exception:', error);
      return { success: false, error: error.message || 'Failed to sign in with Google' };
    }
  };

  const signInWithApple = async () => {
    try {
      console.log('🔐 AuthContext: Starting Apple sign-in...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: 'betternapped://auth/callback',
        },
      });

      if (error) {
        console.error('❌ AuthContext: Apple sign-in error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ AuthContext: Apple sign-in initiated');
      return { success: true };
    } catch (error: any) {
      console.error('❌ AuthContext: Apple sign-in exception:', error);
      return { success: false, error: error.message || 'Failed to sign in with Apple' };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('🔐 AuthContext: Sending password reset email...');
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'betternapped://auth/reset-password',
      });

      if (error) {
        console.error('❌ AuthContext: Password reset error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ AuthContext: Password reset email sent');
      return { success: true };
    } catch (error: any) {
      console.error('❌ AuthContext: Password reset exception:', error);
      return { success: false, error: error.message || 'Failed to send password reset email' };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      console.log('🔐 AuthContext: Updating password...');
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error('❌ AuthContext: Password update error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ AuthContext: Password updated successfully');
      return { success: true };
    } catch (error: any) {
      console.error('❌ AuthContext: Password update exception:', error);
      return { success: false, error: error.message || 'Failed to update password' };
    }
  };

  const value = {
    user,
    session,
    loading,
    isGuest,
    signIn,
    signUp,
    signOut,
    continueAsGuest,
    refreshSession,
    signInWithGoogle,
    signInWithApple,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}