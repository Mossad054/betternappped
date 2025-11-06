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
    
    if (!hasAnyData) return theme.colors.border; // Gray if no data logged
    
    // If we have habit data, use habit completion for color
    if (day.totalHabits > 0 && day.completedHabits > 0) {
      const completionRate = day.completedHabits / day.totalHabits;
      const hasBadFeedback = day.feedback.bad > 0;
      
      if (hasBadFeedback) return theme.colors.error; // Red for bad feedback
      if (completionRate >= 0.7) return theme.colors.success; // Green for good completion
      if (completionRate > 0) return theme.colors.warning; // Yellow for partial completion
      return theme.colors.error; // Red for no completion
    }
    
    // If only mood/sleep data exists, show as partial (orange)
    if (day.hasMood || day.hasSleep) {
      return theme.colors.warning;
    }
    
    return theme.colors.border;
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
      {data.map((day, index) => {
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
                {day.completedHabits > 0 && day.totalHabits > 0 ? (
                  <Text style={styles.completionCount}>
                    {day.completedHabits}/{day.totalHabits}
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
    justifyContent: 'space-between',
    paddingVertical: 12,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginBottom: 6,
  },
  completionCount: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  noDataIndicator: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 0.5,
  },
  dataIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
    minHeight: 8,
  },
  dataTypeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});