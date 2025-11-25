import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';

interface DayData {
  date: string;
  completedHabits: number;
  totalHabits: number;
  hasData?: boolean; // Indicates if any data is logged for this date
  hasMood?: boolean; // Has mood data
  hasSleep?: boolean; // Has sleep data
  habitCompletionRate?: number; // Completion rate (0-1)
  moodData?: any; // Mood entry for the day
  sleepData?: any; // Sleep entry for the day
  feedback: {
    good: number;
    neutral: number;
    bad: number;
  };
}

interface Props {
  data: DayData[];
  onDateSelect?: (date: string) => void; // Optional callback for date selection
}

export default function MiniCalendar({ data, onDateSelect }: Props) {
  const { theme } = useTheme();

  /**
   * Handle date selection
   * When a user taps a day, navigate to journal with the selected date
   */
  const handleDayPress = (dateString: string, hasData: boolean) => {
    // Parse date to ensure proper formatting
    const selectedDate = new Date(dateString);
    const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log('📅 Date selected from calendar:', formattedDate);
    console.log('📅 Has existing data:', hasData);
    
    // Call optional callback if provided
    if (onDateSelect) {
      onDateSelect(formattedDate);
    }
    
    // Navigate to journal with date parameter
    router.push(`/(tabs)/journal?date=${formattedDate}` as any);
  };

  const getDayColor = (day: DayData) => {
    // Check if there's any data logged for this day
    const hasAnyData = day.hasData || day.hasMood || day.hasSleep;

    if (!hasAnyData) return theme.colors.border + '40'; // Very light gray if no data

    // If we have habit data, use habit completion for color
    if (day.totalHabits > 0) {
      const completionRate = day.completedHabits / day.totalHabits;
      const hasBadFeedback = day.feedback.bad > 0;

      // Match the legend colors exactly: Completed (green), Partial (yellow), Missed (red)
      if (hasBadFeedback) return theme.colors.error; // Red for bad feedback (matches "Missed")
      if (completionRate >= 0.7) return theme.colors.success; // Green for good completion (matches "Completed")
      if (completionRate > 0) return theme.colors.warning; // Yellow for partial completion (matches "Partial")
      return theme.colors.error; // Red for no completion (matches "Missed")
    }

    // If only mood/sleep data exists, show as light background
    if (day.hasMood || day.hasSleep) {
      return theme.colors.primary + '40';
    }

    return theme.colors.border + '40';
  };

  const getMoodEmoji = (moodData: any) => {
    if (!moodData) return null;
    const score = moodData.score || moodData.mood_score;
    if (score >= 8) return '😊';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '😕';
    return '😞';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      day: date.getDate(),
    };
  };

  return (
    <View style={styles.container}>
      {data.map((day) => {
        const { weekday, day: dayNumber } = formatDate(day.date);
        const isToday = new Date(day.date).toDateString() === new Date().toDateString();
        const hasData = day.hasData || day.hasMood || day.hasSleep;
        
        return (
          <TouchableOpacity
            key={day.date}
            onPress={() => handleDayPress(day.date, hasData)}
            activeOpacity={0.7}
          >
            <View 
              style={[
                styles.dayColumn,
                isToday && styles.todayColumn
              ]}
            >
              <Text style={[
                styles.weekday,
                { color: theme.colors.textSecondary }
              ]}>
                {weekday}
              </Text>
              
              <Text style={[
                styles.dayNumber,
                { color: theme.colors.text },
                isToday && styles.todayNumber
              ]}>
                {dayNumber}
              </Text>
              
              <View style={[
                styles.activityIndicator,
                {
                  backgroundColor: getDayColor(day),
                  borderColor: isToday ? theme.colors.primary : 'transparent'
                }
              ]}>
                {/* Prioritize mood emoji display */}
                {day.moodData ? (
                  <Text style={styles.moodEmoji}>
                    {getMoodEmoji(day.moodData)}
                  </Text>
                ) : !hasData ? (
                  <Text style={styles.noDataIndicator}>•</Text>
                ) : null}
              </View>
              
              {/* Data type indicators */}
              <View style={styles.dataIndicators}>
                {day.hasMood && (
                  <View style={[styles.dataTypeDot, { backgroundColor: theme.colors.primary }]} />
                )}
                {day.hasSleep && (
                  <View style={[styles.dataTypeDot, { backgroundColor: theme.colors.info }]} />
                )}
                {day.completedHabits > 0 && (
                  <View style={[styles.dataTypeDot, { backgroundColor: theme.colors.success }]} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
  },
  todayColumn: {
    transform: [{ scale: 1.05 }],
  },
  weekday: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  todayNumber: {
    fontWeight: '700',
  },
  activityIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 6,
  },
  moodEmoji: {
    fontSize: 16,
    lineHeight: 18,
    textAlign: 'center',
  },
  completionCount: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  noDataIndicator: {
    fontSize: 18,
    color: '#999999',
    fontWeight: '400',
    opacity: 0.4,
  },
  dataIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    minHeight: 10,
  },
  dataTypeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});