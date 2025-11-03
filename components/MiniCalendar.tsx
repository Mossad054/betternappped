import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface DayData {
  date: string;
  completedHabits: number;
  totalHabits: number;
  feedback: {
    good: number;
    neutral: number;
    bad: number;
  };
}

interface Props {
  data: DayData[];
}

export default function MiniCalendar({ data }: Props) {
  const { theme } = useTheme();

  const getDayColor = (day: DayData) => {
    if (!day.totalHabits) return theme.colors.border; // Gray if no habits
    
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
        
        return (
          <View 
            key={day.date} 
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
            </View>
          </View>
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
  }
});