import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Modal, Alert, Animated } from 'react-native';
import { Brain, Heart, Moon, Smile, Users, Shield, Trash2, Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/contexts/ThemeContext';

type HabitCategory = 'MentalClarity' | 'Health' | 'Sleep' | 'Mood' | 'Intimacy' | 'Anxiety';

interface ActiveHabit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  quote?: string;
  emoji?: string;
  streak: number;
  streak_goal?: number;
  streakGoal?: number;
  completedToday: boolean;
  feedback?: 'good' | 'neutral' | 'bad';
  currentDay?: number;
  totalDays?: number;
  total_days?: number;
  progressPercentage?: number;
  reminderEnabled?: boolean;
  reminder_enabled?: boolean;
  reminder_time?: string;
  instruction?: string;
}

interface HabitCardProps {
  habit: ActiveHabit;
  onToggleComplete?: (id: string) => void;
  onFeedback?: (id: string, feedback: 'good' | 'neutral' | 'bad') => void;
  onToggleReminder?: (id: string) => void;
  onReminderTimeChange?: (id: string, time: Date) => void;
  onDelete?: (id: string) => void;
}

const getCategoryIcon = (category: HabitCategory, theme: any) => {
  const iconProps = { size: 16, color: '#FFF' } as const;
  
  switch (category) {
    case 'MentalClarity':
      return <Brain {...iconProps} />;
    case 'Health':
      return <Heart {...iconProps} />;
    case 'Sleep':
      return <Moon {...iconProps} />;
    case 'Mood':
      return <Smile {...iconProps} />;
    case 'Intimacy':
      return <Users {...iconProps} />;
    case 'Anxiety':
      return <Shield {...iconProps} />;
    default:
      return <Brain {...iconProps} />;
  }
};

const getCategoryColor = (category: HabitCategory, theme: any): string => {
  switch (category) {
    case 'MentalClarity':
      return theme.colors.primary;
    case 'Health':
      return theme.colors.error;
    case 'Sleep':
      return theme.colors.primary;
    case 'Mood':
      return theme.colors.warning;
    case 'Intimacy':
      return theme.colors.primary;
    case 'Anxiety':
      return theme.colors.info;
    default:
      return theme.colors.primary;
  }
};

export default function HabitCard({ habit, onToggleComplete, onFeedback, onToggleReminder, onReminderTimeChange, onDelete }: HabitCardProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const categoryColor = getCategoryColor(habit.category, theme);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Initialize reminder time from habit data or default to 9 AM
  const getInitialTime = () => {
    if (habit.reminder_time) {
      const [hours, minutes] = habit.reminder_time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
    const date = new Date();
    date.setHours(9, 0, 0, 0);
    return date;
  };

  const [reminderTime, setReminderTime] = useState(getInitialTime());
  
  // Animation value for border
  const borderAnimation = useRef(new Animated.Value(1)).current;
  
  // Setup the bouncing animation
  useEffect(() => {
    if (!habit.completedToday) {
      // Start gentle bouncing animation for incomplete habits
      Animated.loop(
        Animated.sequence([
          Animated.timing(borderAnimation, {
            toValue: 1.02,  // Reduced bounce height to prevent header overlap
            duration: 1500, // Slower animation
            useNativeDriver: true,
          }),
          Animated.timing(borderAnimation, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop animation and reset to normal size for completed habits
      Animated.timing(borderAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [habit.completedToday]);

  const handleDelete = () => {
    console.log('Delete button pressed for habit:', habit.id); // Debug log
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: () => {
            console.log('Delete confirmed for habit:', habit.id); // Debug log
            if (onDelete) {
              onDelete(habit.id);
            } else {
              console.log('onDelete prop is not defined'); // Debug log
            }
          } 
        }
      ]
    );
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setReminderTime(selectedTime);
      // Notify parent component about time change
      if (onReminderTimeChange) {
        onReminderTimeChange(habit.id, selectedTime);
      }
    }
  };
  
  return (
    <Animated.View style={[
      styles.card, 
      { 
        backgroundColor: theme.colors.card,
        borderColor: habit.completedToday ? theme.colors.success : theme.colors.border,
        transform: [{ scale: borderAnimation }]
      }
    ]}>
      <TouchableOpacity 
        onPress={() => {
          console.log('Delete button TouchableOpacity pressed'); // Debug log
          handleDelete();
        }} 
        style={[styles.deleteButton, { position: 'absolute', right: 8, top: 8 }]}
        activeOpacity={0.7}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      >
        <Trash2 size={20} color={theme.colors.error} />
      </TouchableOpacity>
      <View style={[styles.cardHeader, { paddingRight: 40 }]}>
        <View style={[styles.categoryTag, { backgroundColor: categoryColor }]}>
          {getCategoryIcon(habit.category, theme)}
          <Text style={styles.categoryText}>{habit.category}</Text>
        </View>
      </View>

      <Text style={[styles.habitName, { color: theme.colors.text }]}>{habit.name}</Text>
      
      {/* Instruction with expected outcome */}
      {habit.instruction && (
        <Text style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
          {habit.instruction}
        </Text>
      )}

      {habit.quote && (
        <View style={[styles.quoteContainer, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.quoteText, { color: theme.colors.text }]}>{habit.quote}</Text>
        </View>
      )}

      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressText, { color: theme.colors.text }]}>
            Day {(habit.currentDay || 1)}/{(habit.totalDays || habit.total_days || 30)}
          </Text>
          <Text style={[styles.streakText, { color: theme.colors.textSecondary }]}>🔥 {habit.streak} day streak</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${habit.progressPercentage || 0}%`, backgroundColor: categoryColor }
            ]} 
          />
        </View>
      </View>

      {habit.completedToday && (
        <View style={[styles.completedBadge, { backgroundColor: theme.colors.success }]}>
          <Text style={[styles.completedText, { color: theme.colors.text }]}>✅ Completed Today</Text>
        </View>
      )}

      {!habit.completedToday && (
        <TouchableOpacity 
          style={[styles.completeButton, { backgroundColor: categoryColor }]}
          onPress={() => onToggleComplete?.(habit.id)}
        >
          <Text style={styles.completeButtonText}>Mark as Complete</Text>
        </TouchableOpacity>
      )}

      <View style={styles.feedbackSection}>
        <Text style={[styles.feedbackLabel, { color: theme.colors.text }]}>How did it go?</Text>
        <View style={styles.feedbackButtons}>
          <TouchableOpacity
            style={[
              styles.feedbackButton,
              habit.feedback === 'good' && styles.feedbackButtonActive,
            ]}
            onPress={() => onFeedback?.(habit.id, 'good')}
          >
            <Text style={styles.feedbackEmoji}>😊</Text>
            <Text style={styles.feedbackButtonText}>Good</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.feedbackButton,
              habit.feedback === 'neutral' && styles.feedbackButtonActive,
            ]}
            onPress={() => onFeedback?.(habit.id, 'neutral')}
          >
            <Text style={styles.feedbackEmoji}>😐</Text>
            <Text style={styles.feedbackButtonText}>Neutral</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.feedbackButton,
              habit.feedback === 'bad' && styles.feedbackButtonActive,
            ]}
            onPress={() => onFeedback?.(habit.id, 'bad')}
          >
            <Text style={styles.feedbackEmoji}>😔</Text>
            <Text style={styles.feedbackButtonText}>Bad</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.reminderSection}>
        <View style={styles.reminderLeft}>
          <Text style={[styles.reminderText, { color: theme.colors.text }]}>Reminder</Text>
          {(habit.reminderEnabled || habit.reminder_enabled) && (
            <TouchableOpacity 
              style={[styles.timeButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock size={14} color="#FFFFFF" />
              <Text style={styles.timeButtonText}>
                {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Switch
          value={habit.reminderEnabled || habit.reminder_enabled || false}
          onValueChange={() => onToggleReminder?.(habit.id)}
          trackColor={{ false: theme.colors.textSecondary, true: theme.colors.primary }}
          thumbColor={theme.colors.background}
        />
      </View>

      {showTimePicker && (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </Animated.View>
  );
}

// Create theme-aware styles function
const createStyles = (theme: any) => StyleSheet.create({
  card: {
    ...theme.components.card,
    marginHorizontal: theme.spacing.screenHorizontal,
    marginBottom: theme.spacing.md,
    width: 280, // Increased from 240
    position: 'relative',
    overflow: 'visible',
    borderWidth: 1,
    borderStyle: 'solid',
    paddingVertical: theme.spacing.lg - 4, // Adjusted for new padding
    paddingHorizontal: theme.spacing.lg - 4, // Adjusted for new padding
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm - 2, // Reduced spacing
  },
  deleteButton: {
    padding: 8, // Reduced from 12
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderRadius: 20, // Reduced from 25
    width: 40, // Reduced from 50
    height: 40, // Reduced from 50
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm + 2, // Reduced
    paddingVertical: theme.spacing.xs + 2, // Reduced
    borderRadius: theme.radii.xl,
    marginBottom: theme.spacing.sm, // Reduced
    gap: theme.spacing.chipGap - 2,
  },
  categoryText: {
    ...theme.typography.captionSmall,
    color: '#FFFFFF',
    fontWeight: '700' as const,
    fontSize: 12,
  },
  habitName: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.xs - 2, // Reduced
    fontSize: 20,
    fontWeight: '700' as const,
  },
  habitDescription: {
    ...theme.typography.body,
    marginBottom: theme.spacing.sm,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  instructionText: {
    ...theme.typography.caption,
    fontStyle: 'italic' as const,
    marginBottom: theme.spacing.sm + 2, // Reduced
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700' as const,
  },
  quoteContainer: {
    backgroundColor: theme.colors.moodCalm,
    padding: theme.spacing.sm + 2, // Reduced
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.sm + 2, // Reduced
  },
  quoteText: {
    ...theme.typography.bodySmall,
    color: theme.colors.textPrimary,
    fontStyle: 'italic' as const,
    fontSize: 13,
    fontWeight: '700' as const,
  },
  progressSection: {
    marginBottom: theme.spacing.sm + 2, // Reduced
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs + 2, // Reduced
  },
  progressText: {
    ...theme.typography.bodySmall,
    fontWeight: '700' as const,
    fontSize: 13,
  },
  streakText: {
    ...theme.typography.bodySmall,
    color: theme.colors.warning,
    fontWeight: '700' as const,
    fontSize: 13,
  },
  progressBarContainer: {
    height: 6, // Reduced from 8
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: theme.radii.md,
  },
  completedBadge: {
    backgroundColor: theme.colors.success,
    paddingVertical: theme.spacing.sm, // Reduced
    paddingHorizontal: theme.spacing.md - 4, // Reduced
    borderRadius: theme.radii.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.sm + 2, // Reduced
  },
  completedText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    fontWeight: '700' as const,
    fontSize: 14,
  },
  completeButton: {
    ...theme.components.buttonPrimary,
    paddingVertical: theme.spacing.sm + 2, // Reduced
    borderRadius: theme.radii.xl,
    marginBottom: theme.spacing.sm + 2, // Reduced
  },
  completeButtonText: {
    ...theme.typography.button,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  feedbackSection: {
    marginBottom: theme.spacing.sm + 2, // Reduced
  },
  feedbackLabel: {
    ...theme.typography.label,
    marginBottom: theme.spacing.xs + 2, // Reduced
    fontSize: 14,
    fontWeight: '700' as const,
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.xs + 2, // Reduced
  },
  feedbackButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs + 4, // Reduced
    paddingHorizontal: theme.spacing.sm, // Reduced
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surfaceVariant,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  feedbackButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  feedbackEmoji: {
    fontSize: 16,
    marginBottom: theme.spacing.xs - 2, // Reduced
  },
  feedbackButtonText: {
    ...theme.typography.captionSmall,
    fontWeight: '700' as const,
    fontSize: 12,
  },
  reminderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm + 2, // Reduced
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs + 2, // Reduced
  },
  reminderText: {
    ...theme.typography.body,
    fontWeight: '700' as const,
    fontSize: 14,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs + 4, // Reduced
    paddingVertical: theme.spacing.xs, // Reduced
    borderRadius: theme.radii.md,
    gap: theme.spacing.xs - 2, // Reduced
  },
  timeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700' as const,
  },
});

