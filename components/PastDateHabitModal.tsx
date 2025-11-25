import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { CheckCircle, Circle, Calendar, TrendingUp, Target } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { HabitsService } from '@/services/habits.service';
import UniversalModal from './UniversalModal';
import { Typography, FONT_SIZES, SPACING } from '@/constants/Typography';

interface Habit {
  habit_id: string;
  habit_name: string;
  habit_emoji: string;
  habit_description: string;
  habit_category: string;
  habit_streak: number;
  habit_total_days: number;
  completed: boolean;
  feedback: string | null;
  cycle_day: number;
}

interface PastDateHabitModalProps {
  visible: boolean;
  onClose: () => void;
  date: string;
  onSuccess?: () => void;
}

export default function PastDateHabitModal({
  visible,
  onClose,
  date,
  onSuccess
}: PastDateHabitModalProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const [habitFeedback, setHabitFeedback] = useState<Map<string, 'good' | 'neutral' | 'bad'>>(new Map());

  useEffect(() => {
    if (visible && user && date) {
      loadHabits();
    }
  }, [visible, user, date]);

  const loadHabits = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await HabitsService.getHabitsForDate(user.id, date);

      if (error) {
        console.error('Error loading habits for date:', error);
        Alert.alert('Error', 'Failed to load habits. Please try again.');
        return;
      }

      setHabits(data || []);

      // Pre-select already completed habits
      const completed = new Set<string>();
      const feedback = new Map<string, 'good' | 'neutral' | 'bad'>();

      data?.forEach((habit: Habit) => {
        if (habit.completed) {
          completed.add(habit.habit_id);
          if (habit.feedback) {
            feedback.set(habit.habit_id, habit.feedback as 'good' | 'neutral' | 'bad');
          }
        }
      });

      setSelectedHabits(completed);
      setHabitFeedback(feedback);
    } catch (error) {
      console.error('Error in loadHabits:', error);
      Alert.alert('Error', 'Failed to load habits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleHabit = (habitId: string) => {
    const newSelected = new Set(selectedHabits);
    if (newSelected.has(habitId)) {
      newSelected.delete(habitId);
      const newFeedback = new Map(habitFeedback);
      newFeedback.delete(habitId);
      setHabitFeedback(newFeedback);
    } else {
      newSelected.add(habitId);
    }
    setSelectedHabits(newSelected);
  };

  const setFeedback = (habitId: string, feedback: 'good' | 'neutral' | 'bad') => {
    const newFeedback = new Map(habitFeedback);
    if (habitFeedback.get(habitId) === feedback) {
      newFeedback.delete(habitId);
    } else {
      newFeedback.set(habitId, feedback);
    }
    setHabitFeedback(newFeedback);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const habitLogs = habits.map(habit => ({
        habit_id: habit.habit_id,
        completed: selectedHabits.has(habit.habit_id),
        feedback: habitFeedback.get(habit.habit_id) || null
      }));

      const { data, error } = await HabitsService.bulkLogHabitsForDate(
        user.id,
        date,
        habitLogs
      );

      if (error) {
        console.error('Error saving habit logs:', error);
        Alert.alert('Error', 'Failed to save habit completions. Please try again.');
        return;
      }

      const completedCount = selectedHabits.size;
      Alert.alert(
        'Success!',
        `${completedCount} habit${completedCount !== 1 ? 's' : ''} marked as complete for ${formatDate(date)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess?.();
              onClose();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in handleSave:', error);
      Alert.alert('Error', 'Failed to save habit completions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const footerButtons = !loading && habits.length > 0 ? [
    {
      label: 'Cancel',
      onPress: onClose,
      variant: 'secondary' as const,
      disabled: saving,
    },
    {
      label: 'Save',
      onPress: handleSave,
      variant: 'primary' as const,
      disabled: saving,
      loading: saving,
    },
  ] : undefined;

  return (
    <UniversalModal
      visible={visible}
      onClose={onClose}
      title="Mark Habits Complete"
      subtitle={formatDate(date)}
      footerButtons={footerButtons}
      scrollable={true}
      headerRight={
        <Calendar size={24} color={theme.colors.primary} style={{ marginRight: SPACING.md }} />
      }
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, Typography.body, { color: theme.colors.textSecondary }]}>
            Loading your habits...
          </Text>
        </View>
      ) : habits.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateEmoji}>🎯</Text>
          <Text style={[styles.emptyStateTitle, Typography.h4, { color: theme.colors.text }]}>
            No Active Habits
          </Text>
          <Text style={[styles.emptyStateMessage, Typography.body, { color: theme.colors.textSecondary }]}>
            Create some habits in the Habit Library to start tracking!
          </Text>
        </View>
      ) : (
        <>
          <Text style={[styles.instruction, Typography.bodySmall, { color: theme.colors.textSecondary }]}>
            Select the habits you completed on this day. Streaks will be automatically calculated.
          </Text>

          {!loading && habits.length > 0 && (
            <Text style={[styles.footerText, Typography.meta, { color: theme.colors.textSecondary }]}>
              {selectedHabits.size} of {habits.length} habits selected
            </Text>
          )}

          {habits.map((habit) => {
            const isSelected = selectedHabits.has(habit.habit_id);
            const currentFeedback = habitFeedback.get(habit.habit_id);

            return (
              <View
                key={habit.habit_id}
                style={[
                  styles.habitCard,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border
                  },
                  isSelected && { backgroundColor: theme.colors.primary + '10' }
                ]}
              >
                <TouchableOpacity
                  style={styles.habitRow}
                  onPress={() => toggleHabit(habit.habit_id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.habitLeft}>
                    {isSelected ? (
                      <CheckCircle size={24} color={theme.colors.primary} />
                    ) : (
                      <Circle size={24} color={theme.colors.border} />
                    )}
                    <Text style={styles.habitEmoji}>{habit.habit_emoji}</Text>
                    <View style={styles.habitInfo}>
                      <Text style={[styles.habitName, Typography.cardTitle, { color: theme.colors.text }]}>
                        {habit.habit_name}
                      </Text>
                      <Text style={[styles.habitCategory, Typography.meta, { color: theme.colors.textSecondary }]}>
                        {habit.habit_category}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={styles.habitStats}>
                  <View style={styles.statItem}>
                    <TrendingUp size={14} color={theme.colors.primary} />
                    <Text style={[styles.statText, Typography.meta, { color: theme.colors.textSecondary }]}>
                      {habit.habit_streak} day streak
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    <Target size={14} color={theme.colors.primary} />
                    <Text style={[styles.statText, Typography.meta, { color: theme.colors.textSecondary }]}>
                      Day {habit.cycle_day}/{habit.habit_total_days}
                    </Text>
                  </View>
                </View>

                {isSelected && (
                  <View style={[styles.feedbackContainer, { borderTopColor: theme.colors.border }]}>
                    <Text style={[styles.feedbackLabel, Typography.meta, { color: theme.colors.textSecondary }]}>
                      How did it feel?
                    </Text>
                    <View style={styles.feedbackButtons}>
                      <TouchableOpacity
                        style={[
                          styles.feedbackButton,
                          { borderColor: theme.colors.border },
                          currentFeedback === 'good' && {
                            backgroundColor: theme.colors.success + '20',
                            borderColor: theme.colors.success
                          }
                        ]}
                        onPress={() => setFeedback(habit.habit_id, 'good')}
                      >
                        <Text style={styles.feedbackEmoji}>😊</Text>
                        <Text style={[
                          styles.feedbackText,
                          Typography.caption,
                          { color: theme.colors.textSecondary },
                          currentFeedback === 'good' && { color: theme.colors.success }
                        ]}>
                          Good
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.feedbackButton,
                          { borderColor: theme.colors.border },
                          currentFeedback === 'neutral' && {
                            backgroundColor: theme.colors.warning + '20',
                            borderColor: theme.colors.warning
                          }
                        ]}
                        onPress={() => setFeedback(habit.habit_id, 'neutral')}
                      >
                        <Text style={styles.feedbackEmoji}>😐</Text>
                        <Text style={[
                          styles.feedbackText,
                          Typography.caption,
                          { color: theme.colors.textSecondary },
                          currentFeedback === 'neutral' && { color: theme.colors.warning }
                        ]}>
                          Neutral
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.feedbackButton,
                          { borderColor: theme.colors.border },
                          currentFeedback === 'bad' && {
                            backgroundColor: theme.colors.error + '20',
                            borderColor: theme.colors.error
                          }
                        ]}
                        onPress={() => setFeedback(habit.habit_id, 'bad')}
                      >
                        <Text style={styles.feedbackEmoji}>😔</Text>
                        <Text style={[
                          styles.feedbackText,
                          Typography.caption,
                          { color: theme.colors.textSecondary },
                          currentFeedback === 'bad' && { color: theme.colors.error }
                        ]}>
                          Hard
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </>
      )}
    </UniversalModal>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.lg,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    marginBottom: SPACING.sm,
  },
  emptyStateMessage: {
    textAlign: 'center',
  },
  instruction: {
    marginBottom: SPACING.xl,
    fontStyle: 'italic',
  },
  footerText: {
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  habitCard: {
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
  },
  habitRow: {
    marginBottom: SPACING.md,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitEmoji: {
    fontSize: 24,
    marginLeft: SPACING.md,
    marginRight: SPACING.md,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    marginBottom: 2,
  },
  habitCategory: {
    textTransform: 'capitalize',
  },
  habitStats: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    paddingLeft: 60,
    gap: SPACING.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {},
  feedbackContainer: {
    paddingLeft: 60,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
  },
  feedbackLabel: {
    fontWeight: '600',
    marginBottom: 10,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  feedbackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: 10,
    borderWidth: 1.5,
    gap: 6,
  },
  feedbackEmoji: {
    fontSize: FONT_SIZES.lg,
  },
  feedbackText: {
    fontWeight: '600',
  },
});
