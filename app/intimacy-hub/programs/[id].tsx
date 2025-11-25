import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, BookOpen, Lock, CheckCircle, Clock, Plus, TestTube, Target, ChevronDown, ChevronUp } from 'lucide-react-native';
import IntimacyHubService, { Program, Lesson, UserLesson } from '@/services/intimacyHub.service';
import { HabitsService } from '@/services/habits.service';

// Suggested habits and experiments per lesson category
const LESSON_SUGGESTIONS: Record<string, { habits: string[]; experiments: string[] }> = {
  communication: {
    habits: ['Daily appreciation share', 'Active listening practice', 'Weekly check-in conversation'],
    experiments: ['No phones during dinner', '10-min daily debrief', 'Love language week'],
  },
  connection: {
    habits: ['Morning hug ritual', 'Bedtime gratitude', 'Weekly date night'],
    experiments: ['Eye contact exercise', 'Touch without agenda', '36 questions game'],
  },
  desire: {
    habits: ['Flirty text daily', 'Surprise gestures', 'Self-care routine'],
    experiments: ['Anticipation building', 'New initiation style', 'Sensate focus'],
  },
  default: {
    habits: ['Daily connection moment', 'Weekly intimacy reflection', 'Gratitude practice'],
    experiments: ['Communication style swap', 'Scheduled intimacy', 'Mindfulness together'],
  },
};

export default function ProgramDetailScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { id } = useLocalSearchParams();
  const programId = Array.isArray(id) ? id[0] : id;

  const [loading, setLoading] = useState(true);
  const [program, setProgram] = useState<Program | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userLessons, setUserLessons] = useState<UserLesson[]>([]);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    loadProgramDetails();
  }, [programId]);

  const loadProgramDetails = async () => {
    if (!user || !programId) return;

    try {
      setLoading(true);
      const data = await IntimacyHubService.getProgramWithLessons(user.id, programId);

      if (data) {
        setProgram(data.program);
        setLessons(data.lessons);
        setProgressPercentage(data.userProgress?.progress_percentage || 0);
      }

      const userLessonsData = await IntimacyHubService.getUserLessons(user.id, programId);
      setUserLessons(userLessonsData);
    } catch (error) {
      console.error('Error loading program details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLessonStatus = (lessonId: string): string => {
    const userLesson = userLessons.find(ul => ul.lesson_id === lessonId);
    return userLesson?.status || 'locked';
  };

  const handleMarkComplete = async (lesson: Lesson) => {
    if (!user) return;

    setCompleting(lesson.id);
    try {
      await IntimacyHubService.completeLesson(user.id, lesson.id);

      // Reload to update progress
      await loadProgramDetails();

      Alert.alert(
        '🎉 Lesson Complete!',
        'Great progress! Check out the suggested habits and experiments below.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error completing lesson:', error);
      Alert.alert('Error', 'Failed to mark lesson as complete.');
    } finally {
      setCompleting(null);
    }
  };

  const handleAddHabit = async (habitName: string) => {
    if (!user) return;

    try {
      await HabitsService.create({
        name: habitName,
        description: `From ${program?.title || 'Intimacy Program'}`,
        frequency: 'daily',
        target_days: [0, 1, 2, 3, 4, 5, 6],
        reminder_time: '20:00',
        category: 'intimacy',
      }, user.id);

      Alert.alert('✓ Added!', `"${habitName}" has been added to your habits.`);
    } catch (error) {
      console.error('Error adding habit:', error);
      Alert.alert('Error', 'Failed to add habit.');
    }
  };

  const handleAddExperiment = async (experimentName: string) => {
    if (!user) return;

    try {
      await IntimacyHubService.createExperiment(user.id, {
        title: experimentName,
        description: `From ${program?.title || 'Intimacy Program'}`,
        duration_days: 7,
        hypothesis: 'This will improve our connection',
        metrics: ['satisfaction', 'connection'],
      });

      Alert.alert('✓ Added!', `"${experimentName}" has been added to your experiments.`);
    } catch (error) {
      console.error('Error adding experiment:', error);
      Alert.alert('Error', 'Failed to add experiment.');
    }
  };

  const getSuggestions = (lesson: Lesson) => {
    const category = program?.category || 'default';
    return LESSON_SUGGESTIONS[category] || LESSON_SUGGESTIONS.default;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} color="#4CAF50" />;
      case 'in_progress':
        return <Clock size={20} color="#FFC107" />;
      case 'available':
        return <BookOpen size={20} color={theme.colors.primary} />;
      default:
        return <Lock size={20} color={theme.colors.textSecondary} />;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!program) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
          Program not found
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.backButtonText, { color: '#fff' }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {program.title}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        {/* Program Overview */}
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {program.description}
          </Text>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: theme.colors.textPrimary }]}>
                Progress
              </Text>
              <Text style={[styles.progressText, { color: theme.colors.primary }]}>
                {progressPercentage}%
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                {program.duration_days}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Days</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                {program.total_lessons}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Lessons</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
                {userLessons.filter(ul => ul.status === 'completed').length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Done</Text>
            </View>
          </View>
        </View>

        {/* Lessons List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Lessons
          </Text>
          {lessons.map((lesson, index) => {
            const status = getLessonStatus(lesson.id);
            const isLocked = status === 'locked';
            const isExpanded = expandedLesson === lesson.id;
            const isCompleted = status === 'completed';
            const suggestions = getSuggestions(lesson);

            return (
              <View key={lesson.id} style={[styles.lessonContainer, isLocked && { opacity: 0.5 }]}>
                {/* Lesson Card */}
                <TouchableOpacity
                  style={[styles.lessonCard, { backgroundColor: theme.colors.surface }]}
                  onPress={() => !isLocked && setExpandedLesson(isExpanded ? null : lesson.id)}
                  disabled={isLocked}
                >
                  <View style={styles.lessonHeader}>
                    <View style={[styles.lessonNumber, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Text style={[styles.lessonNumberText, { color: theme.colors.primary }]}>
                        {index + 1}
                      </Text>
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={[styles.lessonTitle, { color: theme.colors.textPrimary }]}>
                        {lesson.title}
                      </Text>
                      <View style={styles.lessonMeta}>
                        <Clock size={12} color={theme.colors.textSecondary} />
                        <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                          {lesson.duration_minutes} min
                        </Text>
                      </View>
                    </View>
                    <View style={styles.lessonActions}>
                      {getStatusIcon(status)}
                      {!isLocked && (isExpanded ?
                        <ChevronUp size={16} color={theme.colors.textSecondary} /> :
                        <ChevronDown size={16} color={theme.colors.textSecondary} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Expanded Content */}
                {isExpanded && (
                  <View style={[styles.expandedContent, { backgroundColor: theme.colors.surfaceVariant }]}>
                    {/* Lesson Content Preview */}
                    {lesson.content && (
                      <Text style={[styles.lessonContent, { color: theme.colors.textSecondary }]}>
                        {lesson.content.substring(0, 200)}...
                      </Text>
                    )}

                    {/* Mark Complete Button */}
                    {!isCompleted && (
                      <TouchableOpacity
                        style={[styles.completeButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => handleMarkComplete(lesson)}
                        disabled={completing === lesson.id}
                      >
                        {completing === lesson.id ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <CheckCircle size={16} color="#fff" />
                            <Text style={styles.completeButtonText}>Mark as Complete</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}

                    {/* Suggested Habits */}
                    <View style={styles.suggestionsSection}>
                      <View style={styles.suggestionHeader}>
                        <Target size={14} color={theme.colors.primary} />
                        <Text style={[styles.suggestionTitle, { color: theme.colors.textPrimary }]}>
                          Suggested Habits
                        </Text>
                      </View>
                      {suggestions.habits.map((habit, i) => (
                        <View key={i} style={styles.suggestionItem}>
                          <Text style={[styles.suggestionText, { color: theme.colors.textSecondary }]}>
                            {habit}
                          </Text>
                          <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: theme.colors.primary + '20' }]}
                            onPress={() => handleAddHabit(habit)}
                          >
                            <Plus size={14} color={theme.colors.primary} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>

                    {/* Suggested Experiments */}
                    <View style={styles.suggestionsSection}>
                      <View style={styles.suggestionHeader}>
                        <TestTube size={14} color={theme.colors.primary} />
                        <Text style={[styles.suggestionTitle, { color: theme.colors.textPrimary }]}>
                          Try These Experiments
                        </Text>
                      </View>
                      {suggestions.experiments.map((experiment, i) => (
                        <View key={i} style={styles.suggestionItem}>
                          <Text style={[styles.suggestionText, { color: theme.colors.textSecondary }]}>
                            {experiment}
                          </Text>
                          <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: theme.colors.primary + '20' }]}
                            onPress={() => handleAddExperiment(experiment)}
                          >
                            <Plus size={14} color={theme.colors.primary} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  lessonContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  lessonCard: {
    padding: 12,
    borderRadius: 10,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  lessonNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  lessonActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandedContent: {
    padding: 12,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: -4,
  },
  lessonContent: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6,
    marginBottom: 12,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  suggestionsSection: {
    marginBottom: 12,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingLeft: 20,
  },
  suggestionText: {
    fontSize: 12,
    flex: 1,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
