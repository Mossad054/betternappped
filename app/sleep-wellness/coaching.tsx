// Coaching Program Screen
import React, { useState, useEffect } from 'react';
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
import { Award, Check, Lock, X, ChevronRight, Calendar } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RewardsService, POINT_VALUES } from '@/services/rewards.service';

const COACHING_PROGRESS_KEY = 'sleep_coaching_progress';

interface WeekTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface ProgramWeek {
  week: number;
  title: string;
  description: string;
  tasks: WeekTask[];
  unlocked: boolean;
}

const PROGRAM_WEEKS: ProgramWeek[] = [
  {
    week: 1,
    title: 'Foundation: Consistent Schedule',
    description: 'Establish a regular sleep-wake routine',
    unlocked: true,
    tasks: [
      {
        id: '1-1',
        title: 'Set Your Bedtime',
        description: 'Choose a consistent bedtime within your target window',
        completed: false,
      },
      {
        id: '1-2',
        title: 'Set Your Wake Time',
        description: 'Wake up at the same time every day, including weekends',
        completed: false,
      },
      {
        id: '1-3',
        title: 'Wind-Down Routine',
        description: 'Use the wind-down feature 30 minutes before bedtime for 5 nights',
        completed: false,
      },
      {
        id: '1-4',
        title: 'Morning Check-Ins',
        description: 'Complete morning check-in for 5 days this week',
        completed: false,
      },
    ],
  },
  {
    week: 2,
    title: 'Environment: Optimize Your Space',
    description: 'Create the perfect sleep environment',
    unlocked: false,
    tasks: [
      {
        id: '2-1',
        title: 'Darkness Check',
        description: 'Ensure your bedroom is completely dark or use eye mask',
        completed: false,
      },
      {
        id: '2-2',
        title: 'Temperature Control',
        description: 'Set room temperature between 18-20°C (65-68°F)',
        completed: false,
      },
      {
        id: '2-3',
        title: 'Reduce Caffeine',
        description: 'No caffeine after 2 PM for entire week',
        completed: false,
      },
      {
        id: '2-4',
        title: 'White Noise/Earplugs',
        description: 'Use ambient sounds or earplugs to block noise',
        completed: false,
      },
    ],
  },
  {
    week: 3,
    title: 'Habits: Build Sleep Hygiene',
    description: 'Develop healthy evening behaviors',
    unlocked: false,
    tasks: [
      {
        id: '3-1',
        title: 'Screen Curfew',
        description: 'No screens 30 minutes before bedtime for 6 nights',
        completed: false,
      },
      {
        id: '3-2',
        title: 'Return to Sleep Strategy',
        description: 'If awake >15 min, get up and use breathing exercise',
        completed: false,
      },
      {
        id: '3-3',
        title: 'Nap Management',
        description: 'If napping, keep it under 20 min and before 3 PM',
        completed: false,
      },
      {
        id: '3-4',
        title: 'Alcohol Reduction',
        description: 'Avoid alcohol 3 hours before bedtime',
        completed: false,
      },
    ],
  },
  {
    week: 4,
    title: 'Maintenance: Sustain Success',
    description: 'Reflect, refine, and commit long-term',
    unlocked: false,
    tasks: [
      {
        id: '4-1',
        title: 'Review Progress',
        description: 'Compare week 1 vs week 4 sleep quality',
        completed: false,
      },
      {
        id: '4-2',
        title: 'Identify What Works',
        description: 'Write down your top 3 helpful habits',
        completed: false,
      },
      {
        id: '4-3',
        title: 'Plan for Setbacks',
        description: 'Create a strategy for when schedule gets disrupted',
        completed: false,
      },
      {
        id: '4-4',
        title: 'Commit to Consistency',
        description: 'Pledge to maintain routine for next 30 days',
        completed: false,
      },
    ],
  },
];

export default function CoachingProgram() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [enrolled, setEnrolled] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [programData, setProgramData] = useState<ProgramWeek[]>(PROGRAM_WEEKS);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const userId = user?.id || 'guest_user';
      const key = `${COACHING_PROGRESS_KEY}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      
      if (data) {
        const progress = JSON.parse(data);
        setEnrolled(progress.enrolled);
        setCurrentWeek(progress.currentWeek);
        setProgramData(progress.weeks);
      }
    } catch (error) {
      console.error('Error loading coaching progress:', error);
    }
  };

  const saveProgress = async (updatedData: any) => {
    try {
      const userId = user?.id || 'guest_user';
      const key = `${COACHING_PROGRESS_KEY}_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error saving coaching progress:', error);
    }
  };

  const handleEnroll = () => {
    Alert.alert(
      'Start 4-Week Program?',
      'You\'ll receive weekly tasks and guidance to improve your sleep. Ready to commit?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Let\'s Go!',
          onPress: () => {
            setEnrolled(true);
            const progress = {
              enrolled: true,
              currentWeek: 1,
              startDate: new Date().toISOString(),
              weeks: PROGRAM_WEEKS,
            };
            saveProgress(progress);
          },
        },
      ]
    );
  };

  const toggleTask = async (weekIndex: number, taskId: string) => {
    const userId = user?.id || 'guest_user';
    const updated = [...programData];
    const task = updated[weekIndex].tasks.find(t => t.id === taskId);
    if (task) {
      const wasCompleted = task.completed;
      task.completed = !task.completed;
      setProgramData(updated);

      // Award points if task is being completed (not uncompleted)
      if (!wasCompleted) {
        await RewardsService.awardPoints(
          userId,
          'sleep',
          'coaching_task',
          POINT_VALUES.SLEEP_COACHING_TASK,
          `Completed: ${task.title}`
        );
      }
      
      // Check if all tasks in week are complete
      const allComplete = updated[weekIndex].tasks.every(t => t.completed);
      if (allComplete && weekIndex < updated.length - 1) {
        // Award bonus points for completing week
        await RewardsService.awardPoints(
          userId,
          'sleep',
          'coaching_week',
          POINT_VALUES.SLEEP_WEEK_COMPLETE,
          `Completed Week ${weekIndex + 1} of Sleep Program`
        );

        // Unlock next week
        updated[weekIndex + 1].unlocked = true;
        Alert.alert(
          '🎉 Week Complete!',
          `Great job! Week ${weekIndex + 2} is now unlocked. +${POINT_VALUES.SLEEP_WEEK_COMPLETE} points!`,
          [
            {
              text: 'Continue',
              onPress: () => {
                setCurrentWeek(weekIndex + 2);
                saveProgress({
                  enrolled: true,
                  currentWeek: weekIndex + 2,
                  weeks: updated,
                });
              },
            },
          ]
        );
      } else {
        saveProgress({
          enrolled: true,
          currentWeek,
          weeks: updated,
        });
      }
    }
  };

  if (!enrolled) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: theme.colors.card }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Sleep Coaching</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
              4-week program
            </Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={[styles.heroCard, { backgroundColor: theme.colors.primary }]}>
            <Award size={64} color="#FFFFFF" />
            <Text style={styles.heroTitle}>Transform Your Sleep in 4 Weeks</Text>
            <Text style={styles.heroDescription}>
              Personalized coaching, weekly tasks, and proven strategies to help you sleep better.
            </Text>
          </View>

          {/* Program Overview */}
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>What You'll Learn</Text>
          
          {PROGRAM_WEEKS.map((week, index) => (
            <View key={week.week} style={[styles.weekOverview, { backgroundColor: theme.colors.card }]}>
              <View style={styles.weekHeader}>
                <View style={[styles.weekBadge, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.weekBadgeText}>Week {week.week}</Text>
                </View>
                <Text style={[styles.weekTitle, { color: theme.colors.text }]}>{week.title}</Text>
              </View>
              <Text style={[styles.weekDescription, { color: theme.colors.textSecondary }]}>
                {week.description}
              </Text>
              <Text style={[styles.taskCount, { color: theme.colors.textSecondary }]}>
                {week.tasks.length} tasks
              </Text>
            </View>
          ))}

          {/* Enroll Button */}
          <TouchableOpacity
            style={[styles.enrollButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleEnroll}
          >
            <Text style={styles.enrollButtonText}>Start Program Now</Text>
            <ChevronRight size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.disclaimer}>
            <Text style={[styles.disclaimerText, { color: theme.colors.textSecondary }]}>
              💡 This program provides educational guidance. For chronic sleep issues, consult a healthcare provider.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: theme.colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Week {currentWeek}</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Sleep Coaching Program
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Overview */}
        <View style={[styles.progressCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.progressTitle, { color: theme.colors.text }]}>Your Progress</Text>
          <View style={styles.weekProgress}>
            {programData.map((week, index) => (
              <View key={week.week} style={styles.weekDot}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: week.unlocked
                        ? currentWeek === week.week
                          ? theme.colors.primary
                          : theme.colors.success
                        : theme.colors.border,
                    },
                  ]}
                >
                  {week.tasks.every(t => t.completed) && <Check size={12} color="#FFFFFF" />}
                  {!week.unlocked && <Lock size={12} color={theme.colors.textSecondary} />}
                </View>
                <Text style={[styles.dotLabel, { color: theme.colors.textSecondary }]}>
                  W{week.week}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Week Tasks */}
        {programData.map((week, weekIndex) => (
          <View key={week.week}>
            <View style={styles.weekHeaderBar}>
              <Text style={[styles.weekTitleLarge, { color: theme.colors.text }]}>
                Week {week.week}: {week.title}
              </Text>
              {!week.unlocked && (
                <View style={[styles.lockedBadge, { backgroundColor: theme.colors.warning }]}>
                  <Lock size={14} color="#FFFFFF" />
                  <Text style={styles.lockedText}>Locked</Text>
                </View>
              )}
            </View>
            
            <Text style={[styles.weekDescLarge, { color: theme.colors.textSecondary }]}>
              {week.description}
            </Text>

            {week.tasks.map(task => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskCard,
                  {
                    backgroundColor: task.completed
                      ? theme.colors.success + '20'
                      : theme.colors.card,
                    opacity: week.unlocked ? 1 : 0.5,
                  },
                ]}
                onPress={() => week.unlocked && toggleTask(weekIndex, task.id)}
                disabled={!week.unlocked}
              >
                <View style={styles.taskLeft}>
                  <View
                    style={[
                      styles.taskCheckbox,
                      {
                        backgroundColor: task.completed ? theme.colors.success : 'transparent',
                        borderColor: task.completed ? theme.colors.success : theme.colors.border,
                      },
                    ]}
                  >
                    {task.completed && <Check size={16} color="#FFFFFF" />}
                  </View>
                  <View style={styles.taskText}>
                    <Text style={[styles.taskTitle, { color: theme.colors.text }]}>
                      {task.title}
                    </Text>
                    <Text style={[styles.taskDescription, { color: theme.colors.textSecondary }]}>
                      {task.description}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
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
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  heroCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
  },
  weekOverview: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  weekBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  weekBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  weekDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  taskCount: {
    fontSize: 13,
  },
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  enrollButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  disclaimer: {
    padding: 16,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  progressCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  weekProgress: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weekDot: {
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  weekHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 8,
  },
  weekTitleLarge: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  lockedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  weekDescLarge: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  taskCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  taskCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskText: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});
