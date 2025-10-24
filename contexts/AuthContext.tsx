import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null; success?: boolean; needsVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; success?: boolean }>;
  signOut: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null; success?: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Store session in AsyncStorage for persistence
      if (session) {
        await AsyncStorage.setItem('supabase_session', JSON.stringify(session));
      } else {
        await AsyncStorage.removeItem('supabase_session');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    console.log('📝 AuthContext: signUp called with email:', email);
    try {
      setLoading(true);
      console.log('📝 AuthContext: Calling supabase.auth.signUp...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('📝 AuthContext: Supabase response - data:', data, 'error:', error);

      if (error) {
        console.log('❌ AuthContext: Sign up error:', error.message);
        // Handle specific error cases
        let errorMessage = 'An unexpected error occurred. Please try again.';
        
        if (error.message.includes('already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message.includes('password')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('email')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many attempts. Please wait a moment and try again.';
        } else {
          errorMessage = error.message;
        }

        return { error: errorMessage, success: false };
      }

      // Check if email confirmation is required
      const needsVerification = data.user && !data.session;
      console.log('✅ AuthContext: Sign up successful, needsVerification:', needsVerification);
      
      return { 
        error: null, 
        success: true, 
        needsVerification 
      };
    } catch (error) {
      console.log('💥 AuthContext: Sign up exception:', error);
      return { 
        error: 'Network error. Please check your connection and try again.', 
        success: false 
      };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 AuthContext: signIn called with email:', email);
    try {
      setLoading(true);
      console.log('🔐 AuthContext: Calling supabase.auth.signInWithPassword...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔐 AuthContext: Supabase response - data:', data, 'error:', error);

      if (error) {
        console.log('❌ AuthContext: Sign in error:', error.message);
        // Handle specific error cases
        let errorMessage = 'An unexpected error occurred. Please try again.';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Too many failed attempts. Please wait a moment and try again.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = error.message;
        }

        return { error: errorMessage, success: false };
      }

      console.log('✅ AuthContext: Sign in successful');
      return { error: null, success: true };
    } catch (error) {
      console.log('💥 AuthContext: Sign in exception:', error);
      return { 
        error: 'Network error. Please check your connection and try again.', 
        success: false 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      await AsyncStorage.removeItem('supabase_session');
      
      if (error) {
        return { error: 'Failed to sign out. Please try again.' };
      }
      
      return { error: null };
    } catch (error) {
      return { error: 'Network error. Please check your connection and try again.' };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'betternapped://reset-password', // Deep link for password reset
      });

      if (error) {
        let errorMessage = 'Failed to send reset email. Please try again.';
        
        if (error.message.includes('rate limit')) {
          errorMessage = 'Too many attempts. Please wait a moment and try again.';
        } else if (error.message.includes('email')) {
          errorMessage = 'Please enter a valid email address.';
        } else {
          errorMessage = error.message;
        }

        return { error: errorMessage, success: false };
      }

      return { error: null, success: true };
    } catch (error) {
      return { 
        error: 'Network error. Please check your connection and try again.', 
        success: false 
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
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
