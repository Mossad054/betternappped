// Lesson Delivery Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle2, Circle, Play, Volume2, BookOpen } from 'lucide-react-native';
import SleepProgrammeService, { Lesson, PracticeDuration } from '@/services/SleepProgrammeService';
import { HabitsService } from '@/services/habits.service';

interface LessonScreenProps {
  lesson: Lesson;
  onComplete: (duration: PracticeDuration) => void;
  onBack: () => void;
}

export default function LessonScreen({ lesson, onComplete, onBack }: LessonScreenProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [understood, setUnderstood] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<PracticeDuration | null>(null);
  const [isAddingHabit, setIsAddingHabit] = useState(false);

  const durationOptions: { value: PracticeDuration; label: string; description: string }[] = [
    { value: 'tonight', label: 'Tonight Only', description: 'Try it just for tonight' },
    { value: '3_days', label: '3 Days', description: 'Short-term commitment' },
    { value: '7_days', label: '7 Days', description: 'Build a solid habit' },
    { value: '14_days', label: '14 Days', description: 'Reinforce the routine' },
    { value: '21_days', label: '21 Days', description: 'Master the habit' },
  ];

  const handleStartPractice = () => {
    if (!understood) {
      Alert.alert('Please Confirm', 'Please tick "I understand" to show you\'ve read the lesson.');
      return;
    }

    if (!selectedDuration) {
      Alert.alert('Choose Duration', 'Please select how long you\'d like to practice this habit.');
      return;
    }

    onComplete(selectedDuration);
  };

  const handleAddHabitToActive = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add habits.');
      return;
    }

    setIsAddingHabit(true);

    try {
      // Check if habit already exists
      const existingHabits = await HabitsService.getAll(user.id);
      
      if (existingHabits.data) {
        const habitExists = existingHabits.data.some(
          habit => habit.name.toLowerCase() === lesson.habitTask.name.toLowerCase()
        );

        if (habitExists) {
          Alert.alert(
            'Habit Already Added',
            `"${lesson.habitTask.name}" is already in your active habits!`,
            [
              {
                text: 'View My Habits',
                onPress: () => router.push('/(tabs)/home' as any),
              },
              { text: 'OK', style: 'default' },
            ]
          );
          setIsAddingHabit(false);
          return;
        }
      }

      // Create the habit based on the lesson's habit task
      const habitData = {
        name: lesson.habitTask.name,
        description: lesson.habitTask.description,
        category: 'Sleep',
        emoji: lesson.habitTask.icon || '💤',
        instruction: lesson.habitTask.description,
        total_days: 0,
        streak: 0,
        streak_goal: 7, // Default 7-day streak goal
        reminder_enabled: true,
        reminder_time: '21:00', // Default evening reminder for sleep habits
      };

      const result = await HabitsService.create(habitData, user.id);

      if (result.error) {
        throw result.error;
      }

      Alert.alert(
        '✅ Habit Added!',
        `"${lesson.habitTask.name}" has been added to your active habits. You can now track it daily!`,
        [
          {
            text: 'View My Habits',
            onPress: () => router.push('/(tabs)/home' as any),
          },
          { text: 'OK', style: 'default' },
        ]
      );
    } catch (error) {
      console.error('Error adding habit:', error);
      Alert.alert('Error', 'Failed to add habit. Please try again.');
    } finally {
      setIsAddingHabit(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ChevronLeft size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={[styles.weekLabel, { color: theme.colors.textSecondary }]}>
            Week {lesson.weekNumber}
          </Text>
          <Text style={[styles.lessonNumber, { color: theme.colors.primary }]}>
            Lesson {lesson.weekNumber}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Lesson Icon */}
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
          <Text style={styles.lessonIcon}>{lesson.habitTask.icon}</Text>
        </View>

        {/* Lesson Title */}
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {lesson.title}
        </Text>

        {/* Lesson Description */}
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {lesson.description}
        </Text>

        {/* Content Section */}
        <View style={[styles.contentCard, { backgroundColor: theme.colors.card }]}>
          {lesson.content.type === 'audio' && (
            <TouchableOpacity style={styles.audioButton}>
              <Volume2 size={24} color={theme.colors.primary} />
              <Text style={[styles.audioText, { color: theme.colors.text }]}>
                Play Audio Lesson
              </Text>
            </TouchableOpacity>
          )}

          {lesson.content.type === 'video' && (
            <TouchableOpacity style={styles.videoButton}>
              <Play size={24} color={theme.colors.primary} />
              <Text style={[styles.videoText, { color: theme.colors.text }]}>
                Watch Video Lesson
              </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.contentText, { color: theme.colors.text }]}>
            {lesson.content.text}
          </Text>
        </View>

        {/* Habit Task */}
        <View style={[styles.taskCard, { backgroundColor: theme.colors.primary + '15' }]}>
          <Text style={[styles.taskLabel, { color: theme.colors.primary }]}>
            Your Habit Task
          </Text>
          <Text style={[styles.taskTitle, { color: theme.colors.text }]}>
            {lesson.habitTask.name}
          </Text>
          <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]}>
            {lesson.habitTask.description}
          </Text>
          
          {/* Add to Active Habits Button */}
          <TouchableOpacity
            style={[
              styles.addHabitButton, 
              { 
                backgroundColor: theme.colors.primary,
                opacity: isAddingHabit ? 0.6 : 1,
              }
            ]}
            onPress={handleAddHabitToActive}
            disabled={isAddingHabit}
          >
            <Text style={styles.addHabitButtonText}>
              {isAddingHabit ? '⏳ Adding...' : '➕ Add This Habit to My Active Habits'}
            </Text>
          </TouchableOpacity>
          
          {/* Browse Related Habits Button */}
          <TouchableOpacity
            style={[styles.browseHabitsLink, { borderColor: theme.colors.primary }]}
            onPress={() => router.push('/habit-library?category=Sleep')}
          >
            <BookOpen size={16} color={theme.colors.primary} />
            <Text style={[styles.browseHabitsLinkText, { color: theme.colors.primary }]}>
              Browse Related Sleep Habits
            </Text>
          </TouchableOpacity>
        </View>

        {/* Understanding Checkbox */}
        <TouchableOpacity
          style={[styles.checkboxContainer, { borderColor: theme.colors.border }]}
          onPress={() => setUnderstood(!understood)}
        >
          {understood ? (
            <CheckCircle2 size={24} color={theme.colors.primary} fill={theme.colors.primary} />
          ) : (
            <Circle size={24} color={theme.colors.textSecondary} />
          )}
          <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>
            I understand this lesson
          </Text>
        </TouchableOpacity>

        {/* Duration Selection */}
        {understood && (
          <>
            <Text style={[styles.questionLabel, { color: theme.colors.text }]}>
              How long will you practice this habit?
            </Text>

            <View style={styles.durationOptions}>
              {durationOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.durationOption,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor:
                        selectedDuration === option.value
                          ? theme.colors.primary
                          : theme.colors.border,
                      borderWidth: selectedDuration === option.value ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedDuration(option.value)}
                >
                  <View style={styles.durationHeader}>
                    <Text
                      style={[
                        styles.durationLabel,
                        {
                          color:
                            selectedDuration === option.value
                              ? theme.colors.primary
                              : theme.colors.text,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {selectedDuration === option.value && (
                      <CheckCircle2 size={20} color={theme.colors.primary} fill={theme.colors.primary} />
                    )}
                  </View>
                  <Text style={[styles.durationDescription, { color: theme.colors.textSecondary }]}>
                    {option.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Action Button */}
      {understood && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: theme.colors.card,
              paddingBottom: insets.bottom + 16,
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.startButton,
              {
                backgroundColor: selectedDuration ? theme.colors.primary : theme.colors.border,
              },
            ]}
            onPress={handleStartPractice}
            disabled={!selectedDuration}
          >
            <Text style={styles.startButtonText}>Start Practice</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    alignItems: 'center',
  },
  weekLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  lessonNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  lessonIcon: {
    fontSize: 56,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  contentCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(100, 100, 255, 0.1)',
  },
  audioText: {
    fontSize: 16,
    fontWeight: '700',
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(100, 100, 255, 0.1)',
  },
  videoText: {
    fontSize: 16,
    fontWeight: '700',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
  },
  taskCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  taskLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  taskDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  addHabitButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  addHabitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  questionLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  durationOptions: {
    gap: 12,
  },
  durationOption: {
    padding: 16,
    borderRadius: 12,
  },
  durationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  durationDescription: {
    fontSize: 14,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  startButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  browseHabitsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  browseHabitsLinkText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
