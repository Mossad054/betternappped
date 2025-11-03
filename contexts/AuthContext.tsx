import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsVerification?: boolean }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  refreshSession: () => Promise<void>;
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

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('❌ AuthContext: Sign up error:', error);
        return { success: false, error: error.message };
      }

      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setIsGuest(false);
        await AsyncStorage.removeItem('guest_mode');
        console.log('✅ AuthContext: Sign up successful with session');
        return { success: true };
      } else if (data.user) {
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