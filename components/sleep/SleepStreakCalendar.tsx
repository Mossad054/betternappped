// Sleep Streak Calendar Component - Shows last 7 days with habit icons
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Moon, Droplets, Book, Coffee, Zap, Music, Heart } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type SleepHabitType = 'meditation' | 'bath' | 'reading' | 'no_caffeine' | 'exercise' | 'music' | 'breathing' | 'none';

export interface DayActivity {
  date: string;
  dayOfWeek: 'S' | 'M' | 'T' | 'W' | 'F';
  habits: SleepHabitType[];
  onTarget: boolean;
}

interface SleepStreakCalendarProps {
  last7Days: DayActivity[];
  currentStreak: number;
}

const HABIT_ICONS: Record<SleepHabitType, { icon: any; color: string; label: string }> = {
  meditation: { icon: Heart, color: '#8B5CF6', label: 'Meditation' },
  bath: { icon: Droplets, color: '#06B6D4', label: 'Bath/Shower' },
  reading: { icon: Book, color: '#F59E0B', label: 'Reading' },
  no_caffeine: { icon: Coffee, color: '#EF4444', label: 'No Caffeine' },
  exercise: { icon: Zap, color: '#10B981', label: 'Exercise' },
  music: { icon: Music, color: '#EC4899', label: 'Music/Audio' },
  breathing: { icon: Moon, color: '#6366F1', label: 'Breathing' },
  none: { icon: Moon, color: '#9CA3AF', label: 'Sleep' },
};

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function SleepStreakCalendar({ last7Days, currentStreak }: SleepStreakCalendarProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* Streak Header */}
      <View style={styles.streakHeader}>
        <Text style={[styles.streakNumber, { color: theme.colors.primary }]}>
          {currentStreak}
        </Text>
        <Text style={[styles.streakLabel, { color: theme.colors.textSecondary }]}>
          day {currentStreak === 1 ? 'streak' : 'streak'} 🔥
        </Text>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendar}>
        {/* Day Labels */}
        <View style={styles.dayLabelsRow}>
          {DAYS.map((day, index) => (
            <View key={index} style={styles.dayLabel}>
              <Text style={[styles.dayLabelText, { color: theme.colors.textSecondary }]}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Day Circles */}
        <View style={styles.daysRow}>
          {last7Days.map((day, index) => {
            const primaryHabit = day.habits[0] || 'none';
            const habitConfig = HABIT_ICONS[primaryHabit];
            const IconComponent = habitConfig.icon;

            return (
              <View key={index} style={styles.dayCircleContainer}>
                <View
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: day.onTarget
                        ? habitConfig.color
                        : theme.colors.border,
                      borderColor: day.onTarget ? habitConfig.color : theme.colors.border,
                    },
                  ]}
                >
                  {day.onTarget ? (
                    <IconComponent
                      size={20}
                      color="#FFFFFF"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <View style={styles.emptyCircle} />
                  )}
                </View>
                {/* Multiple habits indicator */}
                {day.habits.length > 1 && (
                  <View style={[styles.multiIndicator, { backgroundColor: theme.colors.accent }]}>
                    <Text style={[styles.multiIndicatorText, { color: theme.colors.primary }]}>
                      +{day.habits.length - 1}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {Object.entries(HABIT_ICONS)
          .filter(([key]) => last7Days.some(d => d.habits.includes(key as SleepHabitType)))
          .slice(0, 4)
          .map(([key, config]) => {
            const IconComp = config.icon;
            return (
              <View key={key} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendIcon,
                    { backgroundColor: config.color },
                  ]}
                >
                  <IconComp size={12} color="#FFFFFF" strokeWidth={2.5} />
                </View>
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                  {config.label}
                </Text>
              </View>
            );
          })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  streakHeader: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 52,
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  calendar: {
    gap: 12,
  },
  dayLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  dayLabel: {
    width: 40,
    alignItems: 'center',
  },
  dayLabelText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  dayCircleContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  emptyCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  multiIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  multiIndicatorText: {
    fontSize: 10,
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
