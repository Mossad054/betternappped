import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import {
  TimeRange,
  getMoodData,
  getActivityData,
  getSleepData,
  getHabitData,
  getExperimentData,
} from '@/constants/mockData';
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
  const [selectedRange, setSelectedRange] = useState<TimeRange>('week');
  const [fadeAnim] = useState(new Animated.Value(1));

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

  const moodData = getMoodData(selectedRange);
  const activityData = getActivityData(selectedRange);
  const sleepData = getSleepData(selectedRange);
  const habitData = getHabitData(selectedRange);
  const experimentData = getExperimentData();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
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
});