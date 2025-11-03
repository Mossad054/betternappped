import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { testSupabaseConnection } from '@/lib/supabase-debug';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeGuestData } from '@/lib/guestDataStore';

export default function Index() {
  const { user, loading, isGuest } = useAuth();
  const { theme } = useTheme();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    // Check onboarding status and initialize guest data
    const checkOnboardingStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem('onboarding_completed');
        console.log('📋 Onboarding status from storage:', completed);
        setOnboardingCompleted(completed === 'true');
        
        // Initialize guest data if in guest mode
        if (isGuest) {
          await initializeGuestData();
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setOnboardingCompleted(false);
      }
    };

    checkOnboardingStatus();

    // Test Supabase connection on app startup
    const testConnection = async () => {
      console.log('🚀 App starting - testing Supabase connection...');
      const result = await testSupabaseConnection();
      
      if (!result.success) {
        console.warn('⚠️ Supabase connection test failed:', result.error);
      } else {
        console.log('✅ Supabase connection verified successfully');
      }
    };

    testConnection();
  }, []);

  // Debug logging
  console.log('🔍 Index Debug:', {
    loading,
    onboardingCompleted,
    user: user?.email || 'null',
    isGuest,
  });

  // Show loading while checking onboarding status or auth loading
  if (loading || onboardingCompleted === null) {
    console.log('⏳ Showing loading screen');
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading...
        </Text>
      </View>
    );
  }

  // If onboarding not completed, show onboarding
  if (!onboardingCompleted) {
    console.log('📚 Redirecting to onboarding');
    return <Redirect href="/onboarding/welcome" />;
  }

  // If user is authenticated or guest, go to home tab
  if (user || isGuest) {
    console.log('🏠 Redirecting to home tab (authenticated/guest)');
    return <Redirect href="/(tabs)/home" />;
  }

  // Otherwise, show auth screens (user completed onboarding but not authenticated)
  console.log('🔐 Redirecting to auth (not authenticated)');
  return <Redirect href="/auth/auth" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
});