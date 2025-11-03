import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, View, Text, Animated, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { MoodsService } from '@/services/moods.service';
import { ActivitiesService } from '@/services/activities.service';
import { SleepService } from '@/services/sleep.service';
import { HabitsService } from '@/services/habits.service';
import { ExperimentsService } from '@/services/experiments.service';
import { AnalyticsService } from '@/services/analytics.service';
import { useRealtimeMoods, useRealtimeActivities, useRealtimeSleep, useRealtimeHabits, useRealtimeExperiments } from '@/hooks/useRealtimeData';
import TimeFilter from '@/components/TimeFilter';
import MoodTracking from '@/components/MoodTracking';
import ActivityTracking from '@/components/ActivityTracking';
import SleepTracking from '@/components/SleepTracking';
import HabitTracking from '@/components/HabitTracking';
import ExperimentResults from '@/components/ExperimentResults';
import ImpactAnalysis from '@/components/ImpactAnalysis';
import MoreInsights from '@/components/MoreInsights';
export default function ActivityStatsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [selectedRange, setSelectedRange] = useState<string>('week'); // Changed to string to match new_code
  const [fadeAnim] = useState(new Animated.Value(1));
  const [moodData, setMoodData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [habitData, setHabitData] = useState<any[]>([]);
  const [experimentData, setExperimentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to calculate date range - defined before useCallback
  const getDateRange = (range: string) => {
    const now = new Date();
    const startDate = new Date();
    
    switch (range) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'year':
        startDate.setDate(now.getDate() - 365);
        break;
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    };
  };

  // Load data on component mount and when range changes
  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getDateRange(selectedRange);
      const [moodResult, activityResult, sleepResult, habitResult, experimentResult] = await Promise.all([
        MoodsService.getByDateRange(user.id, startDate, endDate),
        ActivitiesService.getByDateRange(user.id, startDate, endDate),
        SleepService.getByDateRange(user.id, startDate, endDate),
        HabitsService.getAll(user.id),
        ExperimentsService.getAll(user.id)
      ]);
      
      // Handle errors gracefully - don't throw if data is just empty
      if (moodResult.error && moodResult.error !== 'No data found') {
        console.warn('Failed to load mood data:', moodResult.error);
      }
      if (activityResult.error && activityResult.error !== 'No data found') {
        console.warn('Failed to load activity data:', activityResult.error);
      }
      if (sleepResult.error && sleepResult.error !== 'No data found') {
        console.warn('Failed to load sleep data:', sleepResult.error);
      }
      if (habitResult.error && habitResult.error !== 'No data found') {
        console.warn('Failed to load habit data:', habitResult.error);
      }
      if (experimentResult.error && experimentResult.error !== 'No data found') {
        console.warn('Failed to load experiment data:', experimentResult.error);
      }
      
      setMoodData(moodResult.data || []);
      setActivityData(activityResult.data || []);
      setSleepData(sleepResult.data || []);
      setHabitData(habitResult.data || []);
      setExperimentData(experimentResult.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [user, selectedRange]);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      // If no user, ensure loading is false
      setLoading(false);
    }
  }, [user, selectedRange]); // Removed loadData from deps to prevent infinite loop

  // Set up real-time subscriptions - these will trigger loadData on changes
  useRealtimeMoods(user?.id || '', loadData);
  useRealtimeActivities(user?.id || '', loadData);
  useRealtimeSleep(user?.id || '', loadData);
  useRealtimeHabits(user?.id || '', loadData);
  useRealtimeExperiments(user?.id || '', loadData);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRangeChange = (range: string) => {
    if (!range || typeof range !== 'string' || range.length > 10) return;
    const validRanges: string[] = ['today', 'week', 'month', 'year']; // Changed to string[] to match new_code
    if (!validRanges.includes(range)) return;
    
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    setSelectedRange(range);
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading your data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>Error: {error}</Text>
        <Text style={[styles.retryText, { color: theme.colors.textSecondary }]}>Pull down to refresh</Text>
      </View>
    );
  }

  // Empty state: Show friendly message when no data exists
  const hasAnyData = moodData.length > 0 || activityData.length > 0 || sleepData.length > 0 || habitData.length > 0 || experimentData.length > 0;
  
  if (!loading && !refreshing && !hasAnyData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={[styles.content, styles.emptyStateContent, { paddingTop: insets.top + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateEmoji}>📊</Text>
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>No Activity Data Yet</Text>
            <Text style={[styles.emptyStateMessage, { color: theme.colors.textSecondary }]}>
              Start tracking your wellness journey by adding your first entry!
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
              Tap the + button below to add mood, sleep, activities, or habits.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Activity & Statistics</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Track your wellness journey</Text>
        </View>

        <TimeFilter 
          selectedRange={selectedRange} 
          onRangeChange={handleRangeChange} 
        />

        <Animated.View style={[styles.sectionsContainer, { opacity: fadeAnim }]}>
          <ImpactAnalysis userId={user?.id || ''} timeRange={selectedRange} />
          <MoodTracking data={moodData} timeRange={selectedRange} />
          <ActivityTracking data={activityData} timeRange={selectedRange} />
          <SleepTracking data={sleepData} timeRange={selectedRange} />
          <HabitTracking data={habitData} timeRange={selectedRange} />
          <ExperimentResults data={experimentData} />
          <MoreInsights />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  sectionsContainer: {
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyStateContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});