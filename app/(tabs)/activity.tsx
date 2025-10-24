import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, Animated, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { TimeRange } from '@/constants/mockData';
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
import MoreInsights from '@/components/MoreInsights';
import FloatingAddButton from '@/components/FloatingAddButton';

export default function ActivityStatsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week');
  const [fadeAnim] = useState(new Animated.Value(1));
  const [moodData, setMoodData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [habitData, setHabitData] = useState<any[]>([]);
  const [experimentData, setExperimentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load data on component mount and when range changes
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedRange]);

  // Set up real-time subscriptions
  useRealtimeMoods(user?.id || '', () => {
    if (user) loadData();
  });
  
  useRealtimeActivities(user?.id || '', () => {
    if (user) loadData();
  });
  
  useRealtimeSleep(user?.id || '', () => {
    if (user) loadData();
  });
  
  useRealtimeHabits(user?.id || '', () => {
    if (user) loadData();
  });
  
  useRealtimeExperiments(user?.id || '', () => {
    if (user) loadData();
  });

  const loadData = async () => {
    if (!user) return;
    
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

      if (moodResult.error) throw new Error('Failed to load mood data');
      if (activityResult.error) throw new Error('Failed to load activity data');
      if (sleepResult.error) throw new Error('Failed to load sleep data');
      if (habitResult.error) throw new Error('Failed to load habit data');
      if (experimentResult.error) throw new Error('Failed to load experiment data');

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
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getDateRange = (range: TimeRange) => {
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

  const handleRangeChange = (range: TimeRange) => {
    if (!range || typeof range !== 'string' || range.length > 10) return;
    const validRanges: TimeRange[] = ['today', 'week', 'month', 'year'];
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
          <MoodTracking data={moodData} timeRange={selectedRange} />
          <ActivityTracking data={activityData} timeRange={selectedRange} />
          <SleepTracking data={sleepData} timeRange={selectedRange} />
          <HabitTracking data={habitData} timeRange={selectedRange} />
          <ExperimentResults data={experimentData} />
          <MoreInsights />
        </Animated.View>
      </ScrollView>
      
      <FloatingAddButton />
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
});