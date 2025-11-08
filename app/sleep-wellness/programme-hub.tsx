// Sleep Programme Hub - Main Programme Management Screen
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
import {
  ChevronLeft,
  BookOpen,
  CheckCircle2,
  Lock,
  Play,
  Award,
  TrendingUp,
} from 'lucide-react-native';
import SleepProgrammeService, {
  Programme,
  Lesson,
  WeeklyReview,
  PracticeDuration,
} from '@/services/SleepProgrammeService';
import ProgrammeEnrollmentModal from '@/components/sleep/ProgrammeEnrollmentModal';
import LessonScreen from '@/components/sleep/LessonScreen';
import WeeklyReviewScreen from '@/components/sleep/WeeklyReviewScreen';
import ProgrammeCompletionScreen from '@/components/sleep/ProgrammeCompletionScreen';
import DailyCheckInModal from '@/components/sleep/DailyCheckInModal';

type ScreenView = 'hub' | 'lesson' | 'weeklyReview' | 'completion';

export default function ProgrammeHubScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [programme, setProgramme] = useState<Programme | null>(null);
  const [showEnrollment, setShowEnrollment] = useState(false);
  const [currentView, setCurrentView] = useState<ScreenView>('hub');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedReview, setSelectedReview] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgramme();
  }, []);

  const loadProgramme = async () => {
    if (!user) return;

    try {
      const prog = await SleepProgrammeService.getProgramme(user.id);
      setProgramme(prog);

      // Check if user should be invited to enroll
      if (!prog) {
        const criteria = await SleepProgrammeService.checkEnrollmentCriteria(user.id);
        if (criteria) {
          setTimeout(() => setShowEnrollment(true), 1000);
        }
      }
    } catch (error) {
      console.error('Error loading programme:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) return;

    try {
      // Mock baseline metrics - in real app, fetch from SleepService
      const baselineMetrics = {
        averageSleepDuration: 390, // 6.5 hours
        bedtimeConsistency: 65, // ±65 minutes
        qualityScore: 2.8,
        recordedAt: new Date().toISOString(),
      };

      const enrolled = await SleepProgrammeService.enrollUser(user.id, baselineMetrics);
      setProgramme(enrolled);
      setShowEnrollment(false);

      Alert.alert(
        'Welcome!',
        'Great! We\'ll guide you with one lesson each week + daily habit tasks + check-ins. Ready for Lesson 1 now?',
        [
          { text: 'Start Now', onPress: () => handleStartLesson(enrolled.lessons[0]) },
          { text: 'Later', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Error enrolling:', error);
      Alert.alert('Error', 'Failed to enroll in programme. Please try again.');
    }
  };

  const handleStartLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setCurrentView('lesson');
  };

  const handleLessonComplete = async (duration: PracticeDuration) => {
    if (!user || !selectedLesson) return;

    try {
      await SleepProgrammeService.startLessonPractice(user.id, selectedLesson.id, duration);
      
      Alert.alert(
        'Practice Started!',
        `Great — we'll remind you each night during your chosen period to complete the habit.`,
        [{ text: 'Got It', onPress: () => setCurrentView('hub') }]
      );

      // Reload programme
      await loadProgramme();
    } catch (error) {
      console.error('Error starting practice:', error);
      Alert.alert('Error', 'Failed to start practice. Please try again.');
    }
  };

  const handleViewWeeklyReview = async (weekNumber: number) => {
    if (!user) return;

    try {
      const review = await SleepProgrammeService.generateWeeklyReview(user.id, weekNumber);
      setSelectedReview(review);
      setCurrentView('weeklyReview');
      await loadProgramme();
    } catch (error) {
      console.error('Error loading review:', error);
      Alert.alert('Error', 'Failed to load weekly review.');
    }
  };

  const handleContinueToNextWeek = () => {
    setCurrentView('hub');
    setSelectedReview(null);
  };

  const handleRepeatWeek = async () => {
    Alert.alert(
      'Repeat Week',
      'You\'ll practice the same lesson for another week. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => setCurrentView('hub') },
      ]
    );
  };

  const handlePauseProgramme = async () => {
    if (!user) return;

    Alert.alert(
      'Pause Programme',
      'You can resume anytime from where you left off.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pause',
          onPress: async () => {
            await SleepProgrammeService.pauseProgramme(user.id);
            await loadProgramme();
            router.back();
          },
        },
      ]
    );
  };

  const handleCompleteProgramme = async () => {
    if (!user) return;

    try {
      const completed = await SleepProgrammeService.completeProgramme(user.id);
      setProgramme(completed);
      setCurrentView('completion');
    } catch (error) {
      console.error('Error completing programme:', error);
    }
  };

  const handleSubmitFeedback = async (rating: number, text: string) => {
    if (!user) return;

    try {
      await SleepProgrammeService.completeProgramme(user.id, rating, text);
      await loadProgramme();
      Alert.alert('Thank You!', 'Your feedback helps us improve the programme.');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  // Render different views based on state
  if (currentView === 'lesson' && selectedLesson) {
    return (
      <LessonScreen
        lesson={selectedLesson}
        onComplete={handleLessonComplete}
        onBack={() => setCurrentView('hub')}
      />
    );
  }

  if (currentView === 'weeklyReview' && selectedReview) {
    return (
      <WeeklyReviewScreen
        review={selectedReview}
        onContinue={handleContinueToNextWeek}
        onRepeat={handleRepeatWeek}
        onPause={handlePauseProgramme}
      />
    );
  }

  if (currentView === 'completion' && programme?.status === 'completed') {
    return (
      <ProgrammeCompletionScreen
        programme={programme}
        onEnterMaintenance={() => router.back()}
        onJoinAdvanced={() => Alert.alert('Coming Soon', 'Advanced programmes will be available soon!')}
        onSubmitFeedback={handleSubmitFeedback}
      />
    );
  }

  // Main Hub View
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Enrollment Modal */}
      <ProgrammeEnrollmentModal
        visible={showEnrollment}
        onAccept={handleEnroll}
        onDecline={() => setShowEnrollment(false)}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Sleep Programme
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {!programme ? (
          // Not Enrolled State
          <View style={styles.notEnrolledState}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <BookOpen size={64} color={theme.colors.primary} />
            </View>
            <Text style={[styles.notEnrolledTitle, { color: theme.colors.text }]}>
              Ready to Improve Your Sleep?
            </Text>
            <Text style={[styles.notEnrolledDescription, { color: theme.colors.textSecondary }]}>
              Join our 4-week Sleep Improvement Programme with guided lessons, daily habits, and
              personalized support.
            </Text>
            <TouchableOpacity
              style={[styles.enrollButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowEnrollment(true)}
            >
              <Text style={styles.enrollButtonText}>Get Started</Text>
            </TouchableOpacity>
            
            {/* Browse Sleep Habits Button */}
            <TouchableOpacity
              style={[styles.browseHabitsButton, { borderColor: theme.colors.border }]}
              onPress={() => router.push('/habit-library?category=Sleep')}
            >
              <Text style={[styles.browseHabitsText, { color: theme.colors.text }]}>
                Browse Sleep Habits
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Enrolled State
          <>
            {/* Progress Header */}
            <View style={[styles.progressCard, { backgroundColor: theme.colors.card }]}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressTitle, { color: theme.colors.text }]}>
                  Your Progress
                </Text>
                <Text style={[styles.progressWeek, { color: theme.colors.primary }]}>
                  Week {programme.currentWeek} of {programme.totalWeeks}
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: theme.colors.primary,
                      width: `${(programme.currentWeek / programme.totalWeeks) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressSubtext, { color: theme.colors.textSecondary }]}>
                {programme.weeklyReviews.length} weeks completed
              </Text>
            </View>

            {/* Lessons List */}
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Programme Lessons
            </Text>
            <View style={styles.lessonsList}>
              {programme.lessons.map((lesson, index) => {
                const isLocked = index > programme.currentWeek;
                const isCompleted = lesson.completedAt;
                const isCurrent = index === programme.currentWeek;

                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[
                      styles.lessonCard,
                      {
                        backgroundColor: theme.colors.card,
                        opacity: isLocked ? 0.6 : 1,
                      },
                    ]}
                    onPress={() => !isLocked && handleStartLesson(lesson)}
                    disabled={isLocked}
                  >
                    <View style={styles.lessonIcon}>
                      <Text style={styles.lessonEmoji}>{lesson.habitTask.icon}</Text>
                    </View>
                    <View style={styles.lessonContent}>
                      <View style={styles.lessonHeader}>
                        <Text style={[styles.lessonWeek, { color: theme.colors.textSecondary }]}>
                          Week {lesson.weekNumber}
                        </Text>
                        {isCurrent && (
                          <View style={[styles.currentBadge, { backgroundColor: theme.colors.primary }]}>
                            <Text style={styles.currentBadgeText}>Current</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.lessonTitle, { color: theme.colors.text }]}>
                        {lesson.title}
                      </Text>
                      <Text
                        style={[styles.lessonDescription, { color: theme.colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {lesson.description}
                      </Text>
                    </View>
                    <View style={styles.lessonStatus}>
                      {isLocked ? (
                        <Lock size={24} color={theme.colors.textSecondary} />
                      ) : isCompleted ? (
                        <CheckCircle2 size={24} color="#10B981" fill="#10B981" />
                      ) : (
                        <Play size={24} color={theme.colors.primary} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Weekly Reviews */}
            {programme.weeklyReviews.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Weekly Reviews
                </Text>
                <View style={styles.reviewsList}>
                  {programme.weeklyReviews.map((review) => (
                    <TouchableOpacity
                      key={review.id}
                      style={[styles.reviewCard, { backgroundColor: theme.colors.card }]}
                      onPress={() => {
                        setSelectedReview(review);
                        setCurrentView('weeklyReview');
                      }}
                    >
                      <Award size={24} color={theme.colors.primary} />
                      <View style={styles.reviewContent}>
                        <Text style={[styles.reviewTitle, { color: theme.colors.text }]}>
                          Week {review.weekNumber} Review
                        </Text>
                        <Text style={[styles.reviewSubtext, { color: theme.colors.textSecondary }]}>
                          {review.habitCompletionRate}/7 days • {review.badgeEarned || 'View details'}
                        </Text>
                      </View>
                      <TrendingUp size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Complete Programme Button */}
            {programme.currentWeek >= programme.totalWeeks &&
              programme.lessons.every(l => l.completedAt) && (
                <TouchableOpacity
                  style={[styles.completeButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleCompleteProgramme}
                >
                  <Award size={20} color="#FFFFFF" />
                  <Text style={styles.completeButtonText}>Complete Programme</Text>
                </TouchableOpacity>
              )}
          </>
        )}
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
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  notEnrolledState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  notEnrolledTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  notEnrolledDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  enrollButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  enrollButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  progressCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  progressWeek: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  lessonsList: {
    gap: 12,
    marginBottom: 32,
  },
  lessonCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lessonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(100, 100, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonEmoji: {
    fontSize: 32,
  },
  lessonContent: {
    flex: 1,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  lessonWeek: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  currentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  lessonStatus: {
    padding: 8,
  },
  reviewsList: {
    gap: 12,
    marginBottom: 24,
  },
  reviewCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewContent: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  reviewSubtext: {
    fontSize: 13,
  },
  completeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  browseHabitsButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 2,
    marginTop: 12,
    alignItems: 'center',
  },
  browseHabitsText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
