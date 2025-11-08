// Sleep Streak Calendar Component - Shows last 7 days with habit icons
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Moon, Droplets, Book, Coffee, Zap, Music, Heart, X } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export type SleepHabitType = 'meditation' | 'bath' | 'reading' | 'no_caffeine' | 'exercise' | 'music' | 'breathing' | 'none';

export interface DayActivity {
  date: string;
  dayOfWeek: string; // Full day name like "Monday", "Tuesday"
  dayNumber: number; // Day of month
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
  const [selectedDay, setSelectedDay] = useState<DayActivity | null>(null);

  const getDayLabel = (dayOfWeek: string) => {
    return dayOfWeek.substring(0, 1).toUpperCase();
  };

  const renderHabitIcons = (habits: SleepHabitType[], isCompact: boolean = false) => {
    if (habits.length === 0) return null;

    if (isCompact && habits.length > 2) {
      // Show first 2 icons overlapping
      return (
        <View style={styles.iconsCluster}>
          {habits.slice(0, 2).map((habit, idx) => {
            const habitConfig = HABIT_ICONS[habit];
            const IconComponent = habitConfig.icon;
            return (
              <View
                key={idx}
                style={[
                  styles.clusterIcon,
                  {
                    backgroundColor: habitConfig.color,
                    zIndex: 10 - idx,
                    marginLeft: idx > 0 ? -8 : 0,
                  },
                ]}
              >
                <IconComponent size={14} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            );
          })}
          <View style={[styles.moreIconBadge, { backgroundColor: theme.colors.accent }]}>
            <Text style={[styles.moreIconText, { color: theme.colors.primary }]}>
              +{habits.length - 2}
            </Text>
          </View>
        </View>
      );
    }

    if (habits.length === 1) {
      const habitConfig = HABIT_ICONS[habits[0]];
      const IconComponent = habitConfig.icon;
      return <IconComponent size={20} color="#FFFFFF" strokeWidth={2.5} />;
    }

    // For 2 habits, show overlapping
    return (
      <View style={styles.iconsCluster}>
        {habits.slice(0, 2).map((habit, idx) => {
          const habitConfig = HABIT_ICONS[habit];
          const IconComponent = habitConfig.icon;
          return (
            <View
              key={idx}
              style={[
                styles.clusterIcon,
                {
                  backgroundColor: habitConfig.color,
                  zIndex: 10 - idx,
                  marginLeft: idx > 0 ? -8 : 0,
                },
              ]}
            >
              <IconComponent size={14} color="#FFFFFF" strokeWidth={2.5} />
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Calendar Grid */}
      <View style={styles.calendar}>
        {/* Day Labels */}
        <View style={styles.dayLabelsRow}>
          {last7Days.map((day, index) => (
            <View key={index} style={styles.dayLabel}>
              <Text style={[styles.dayLabelText, { color: theme.colors.textSecondary }]}>
                {getDayLabel(day.dayOfWeek)}
              </Text>
              <Text style={[styles.dayNumberText, { color: theme.colors.text }]}>
                {day.dayNumber}
              </Text>
            </View>
          ))}
        </View>

        {/* Day Circles */}
        <View style={styles.daysRow}>
          {last7Days.map((day, index) => {
            const isToday = new Date(day.date).toDateString() === new Date().toDateString();
            const primaryHabit = day.habits[0] || 'none';
            const habitConfig = HABIT_ICONS[primaryHabit];

            return (
              <TouchableOpacity
                key={index}
                style={styles.dayCircleContainer}
                onPress={() => day.habits.length > 0 && setSelectedDay(day)}
                activeOpacity={day.habits.length > 0 ? 0.7 : 1}
              >
                <View
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: day.onTarget && day.habits.length > 0
                        ? habitConfig.color
                        : theme.colors.border,
                      borderColor: isToday ? theme.colors.primary : 'transparent',
                    },
                  ]}
                >
                  {day.onTarget && day.habits.length > 0 ? (
                    renderHabitIcons(day.habits, true)
                  ) : (
                    <View style={styles.emptyCircle} />
                  )}
                </View>
              </TouchableOpacity>
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

      {/* Day Details Modal */}
      <Modal
        visible={selectedDay !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedDay(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedDay(null)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {selectedDay?.dayOfWeek}, {selectedDay && new Date(selectedDay.date).toLocaleDateString()}
              </Text>
              <TouchableOpacity onPress={() => setSelectedDay(null)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                Completed Sleep Habits
              </Text>
              {selectedDay?.habits.map((habit, idx) => {
                const config = HABIT_ICONS[habit];
                const IconComp = config.icon;
                return (
                  <View key={idx} style={styles.habitRow}>
                    <View style={[styles.habitIcon, { backgroundColor: config.color }]}>
                      <IconComp size={20} color="#FFFFFF" strokeWidth={2.5} />
                    </View>
                    <Text style={[styles.habitName, { color: theme.colors.text }]}>
                      {config.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    overflow: 'hidden',
  },
  calendar: {
    gap: 12,
    paddingHorizontal: 4,
    overflow: 'hidden',
  },
  dayLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 2,
    gap: 4,
  },
  dayLabel: {
    width: 40,
    alignItems: 'center',
    gap: 2,
  },
  dayLabelText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dayNumberText: {
    fontSize: 13,
    fontWeight: '700',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 2,
    gap: 4,
  },
  dayCircleContainer: {
    alignItems: 'center',
    position: 'relative',
    padding: 1,
  },
  dayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  iconsCluster: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clusterIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moreIconBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  moreIconText: {
    fontSize: 9,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    gap: 12,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  habitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
  },
});
