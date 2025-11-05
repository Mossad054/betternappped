import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { router } from 'expo-router';

interface DayData {
  date: string;
  completedHabits: number;
  totalHabits: number;
  hasData?: boolean; // Indicates if any data is logged for this date
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
   * When a user taps a day, navigate to add-entry with the selected date
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
    
    // Navigate to add-entry with date parameter
    router.push(`/add-entry?date=${formattedDate}`);
  };

  const getDayColor = (day: DayData) => {
    // Check if there's any data logged for this day
    const hasAnyData = day.hasData || day.totalHabits > 0;
    
    if (!hasAnyData) return theme.colors.border; // Gray if no data logged
    
    const completionRate = day.completedHabits / day.totalHabits;
    const hasBadFeedback = day.feedback.bad > 0;
    
    if (hasBadFeedback) return theme.colors.error; // Red for bad feedback
    if (completionRate >= 0.7) return theme.colors.success; // Green for good completion
    if (completionRate > 0) return theme.colors.warning; // Yellow for partial completion
    return theme.colors.error; // Red for no completion
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
        const isToday = index === data.length - 1;
        const hasData = day.hasData || day.totalHabits > 0;
        
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
                { color: theme.colors.text }
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
                {day.completedHabits > 0 && (
                  <Text style={styles.completionCount}>
                    {day.completedHabits}/{day.totalHabits}
                  </Text>
                )}
                {!hasData && (
                  <Text style={styles.noDataIndicator}>+</Text>
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
  activityIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  completionCount: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noDataIndicator: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 0.6,
  },
});