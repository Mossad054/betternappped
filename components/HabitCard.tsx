import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Modal, Alert } from 'react-native';
import { Brain, Heart, Moon, Smile, Users, Shield, Trash2, Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { ActiveHabit, HabitCategory } from '@/constants/mockData';
import { useTheme } from '@/contexts/ThemeContext';

interface HabitCardProps {
  habit: ActiveHabit;
  onToggleComplete?: (id: string) => void;
  onFeedback?: (id: string, feedback: 'good' | 'neutral' | 'bad') => void;
  onToggleReminder?: (id: string) => void;
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

export default function HabitCard({ habit, onToggleComplete, onFeedback, onToggleReminder, onDelete }: HabitCardProps) {
  const { theme } = useTheme();
  const categoryColor = getCategoryColor(habit.category, theme);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());

  const handleDelete = () => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDelete?.(habit.id) }
      ]
    );
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setReminderTime(selectedTime);
    }
  };
  
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      <View style={styles.cardHeader}>
        <View style={[styles.categoryTag, { backgroundColor: categoryColor }]}>
          {getCategoryIcon(habit.category, theme)}
          <Text style={styles.categoryText}>{habit.category}</Text>
        </View>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Trash2 size={16} color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      <Text style={[styles.habitName, { color: theme.colors.text }]}>{habit.name}</Text>
      <Text style={[styles.habitDescription, { color: theme.colors.textSecondary }]}>{habit.description}</Text>
      
      {/* Short instruction */}
      <Text style={[styles.instructionText, { color: theme.colors.textSecondary }]}>
        {habit.instruction || 'Complete this habit daily to build consistency.'}
      </Text>

      {habit.quote && (
        <View style={[styles.quoteContainer, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.quoteText, { color: theme.colors.text }]}>{habit.quote}</Text>
        </View>
      )}

      <View style={styles.progressSection}>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressText, { color: theme.colors.text }]}>
            Day {habit.currentDay}/{habit.totalDays}
          </Text>
          <Text style={[styles.streakText, { color: theme.colors.textSecondary }]}>🔥 {habit.streak} day streak</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${habit.progressPercentage}%`, backgroundColor: categoryColor }
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
          {habit.reminderEnabled && (
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
          value={habit.reminderEnabled}
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: 280,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButton: {
    padding: 4,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  habitName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic' as const,
    marginBottom: 12,
  },
  quoteContainer: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 13,
    color: '#065F46',
    fontStyle: 'italic' as const,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500' as const,
  },
  streakText: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '600' as const,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  completedText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '600' as const,
  },
  completeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  feedbackSection: {
    marginBottom: 12,
  },
  feedbackLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500' as const,
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  feedbackButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  feedbackButtonActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  feedbackEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  feedbackButtonText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500' as const,
  },
  reminderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500' as const,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  timeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500' as const,
  },
});
