// Sleep Hours Calendar - Shows last 7 days with hours slept vs target
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Moon } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface DaySleepData {
  date: string;
  dayOfWeek: string; // Full day name
  dayNumber: number;
  hoursSlept?: number;
  targetHours: number; // Daily sleep target
  hasData: boolean;
}

interface SleepTimesCalendarProps {
  last7Days: DaySleepData[];
  onDayPress?: (date: string) => void;
}

export default function SleepTimesCalendar({
  last7Days,
  onDayPress,
}: SleepTimesCalendarProps) {
  const { theme } = useTheme();

  const getDayColor = (day: DaySleepData) => {
    if (!day.hasData || day.hoursSlept === undefined) {
      return theme.colors.border; // No data - gray
    }

    const percentOfTarget = (day.hoursSlept / day.targetHours) * 100;

    if (percentOfTarget >= 90) {
      return theme.colors.success; // Met target (90%+) - green
    } else if (percentOfTarget >= 70) {
      return theme.colors.warning; // Close to target (70-89%) - orange
    } else {
      return theme.colors.error; // Below target (<70%) - red
    }
  };

  const getDayLabel = (dayOfWeek: string) => {
    return dayOfWeek.substring(0, 3).toUpperCase();
  };

  return (
    <View style={styles.container}>
      {/* Calendar Grid */}
      <View style={styles.calendar}>
        {last7Days.map((day, index) => {
          const isToday = new Date(day.date).toDateString() === new Date().toDateString();
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayColumn,
                isToday && { backgroundColor: theme.colors.primary + '10' },
              ]}
              onPress={() => onDayPress?.(day.date)}
              activeOpacity={0.7}
            >
              {/* Day Label */}
              <View style={styles.dayHeader}>
                <Text style={[styles.dayLabel, { color: theme.colors.textSecondary }]}>
                  {getDayLabel(day.dayOfWeek)}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    { color: theme.colors.text },
                    isToday && { color: theme.colors.primary, fontWeight: '700' },
                  ]}
                >
                  {day.dayNumber}
                </Text>
              </View>

              {/* Sleep Hours Circle */}
              <View
                style={[
                  styles.sleepCircle,
                  {
                    backgroundColor: getDayColor(day),
                    borderColor: isToday ? theme.colors.primary : 'transparent',
                  },
                ]}
              >
                {day.hasData && day.hoursSlept !== undefined ? (
                  <View style={styles.hoursContainer}>
                    <Text style={styles.hoursText}>
                      {day.hoursSlept.toFixed(1)}
                    </Text>
                    <Text style={styles.hoursLabel}>hrs</Text>
                  </View>
                ) : (
                  <View style={styles.noDataDot} />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            Met Target
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            Close
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
          <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
            Below
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    overflow: 'hidden',
  },
  calendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderRadius: 8,
  },
  dayHeader: {
    alignItems: 'center',
    gap: 2,
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '700',
  },
  sleepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  noDataDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  hoursContainer: {
    alignItems: 'center',
  },
  hoursText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hoursLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
