import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SleepOnboarding from '@/components/sleep/SleepOnboarding';
import SleepDashboard from '@/components/sleep/SleepDashboard';

const SLEEP_ONBOARDING_KEY = 'sleep_hub_onboarding_completed';

export default function SleepWellnessHub() {
  const { theme } = useTheme();
  const { user, isGuest } = useAuth();
  const router = useRouter();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, [user, isGuest]);

  const checkOnboardingStatus = async () => {
    try {
      const userId = user?.id || 'guest_user';
      const key = `${SLEEP_ONBOARDING_KEY}_${userId}`;
      const value = await AsyncStorage.getItem(key);
      setHasCompletedOnboarding(value === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      const userId = user?.id || 'guest_user';
      const key = `${SLEEP_ONBOARDING_KEY}_${userId}`;
      await AsyncStorage.setItem(key, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const handleRecalibrate = async () => {
    try {
      const userId = user?.id || 'guest_user';
      const key = `${SLEEP_ONBOARDING_KEY}_${userId}`;
      await AsyncStorage.removeItem(key);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      {!hasCompletedOnboarding ? (
        <SleepOnboarding onComplete={handleOnboardingComplete} />
      ) : (
        <SleepDashboard onRecalibrate={handleRecalibrate} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
