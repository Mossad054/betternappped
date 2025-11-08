// Maintenance Mode Screen - Post-Programme Reflection & Consistency Tracking
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
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  X as XIcon,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  BookOpen,
  Target,
  Award,
} from 'lucide-react-native';
import { Programme } from '@/services/SleepProgrammeService';

interface MaintenanceModeScreenProps {
  programme: Programme;
  onBack: () => void;
  onSelectNewProgramme: () => void;
}

type ImpactLevel = 'positive' | 'no_change' | 'negative' | null;
type ConsistencyLevel = 'excellent' | 'good' | 'struggling' | null;

export default function MaintenanceModeScreen({
  programme,
  onBack,
  onSelectNewProgramme,
}: MaintenanceModeScreenProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [impactLevel, setImpactLevel] = useState<ImpactLevel>(null);
  const [consistencyLevel, setConsistencyLevel] = useState<ConsistencyLevel>(null);
  const [showReflection, setShowReflection] = useState(true);
  const [reflectionComplete, setReflectionComplete] = useState(false);

  const handleSubmitReflection = () => {
    if (!impactLevel || !consistencyLevel) {
      Alert.alert('Complete Reflection', 'Please answer both questions to continue.');
      return;
    }

    setReflectionComplete(true);
    setShowReflection(false);
  };

  const getRecommendation = () => {
    if (impactLevel === 'negative' || impactLevel === 'no_change') {
      return {
        type: 'try_different',
        title: 'Let\'s Try Something Different',
        message: 'This programme might not be the right fit for you. Would you like to explore other sleep improvement programmes?',
        action: 'Browse Other Programmes',
        color: theme.colors.warning,
      };
    }

    if (consistencyLevel === 'struggling') {
      return {
        type: 'support',
        title: 'You\'re Doing Great! 💪',
        message: 'Consistency takes time. Keep going with these habits, and consider setting reminders to help you stay on track.',
        action: 'View My Habits',
        color: theme.colors.primary,
      };
    }

    return {
      type: 'maintain',
      title: 'Amazing Progress! 🎉',
      message: 'You\'re seeing positive results and maintaining consistency. Keep up these healthy habits to sustain your improvements.',
      action: 'Continue Maintaining',
      color: '#10B981',
    };
  };

  const recommendation = reflectionComplete ? getRecommendation() : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ChevronLeft size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Maintenance Mode
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {showReflection ? (
          <>
            {/* Intro Card */}
            <View style={[styles.introCard, { backgroundColor: theme.colors.card }]}>
              <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
                <Target size={32} color={theme.colors.primary} />
              </View>
              <Text style={[styles.introTitle, { color: theme.colors.text }]}>
                Time to Reflect
              </Text>
              <Text style={[styles.introDescription, { color: theme.colors.textSecondary }]}>
                Let's evaluate how the programme has impacted your sleep and whether you're maintaining the habits you learned.
              </Text>
            </View>

            {/* Question 1: Impact */}
            <View style={[styles.questionCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.questionTitle, { color: theme.colors.text }]}>
                How has this programme impacted your sleep?
              </Text>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: impactLevel === 'positive' ? '#10B981' + '20' : theme.colors.background,
                    borderColor: impactLevel === 'positive' ? '#10B981' : theme.colors.border,
                  },
                ]}
                onPress={() => setImpactLevel('positive')}
              >
                <View style={styles.optionLeft}>
                  <TrendingUp
                    size={24}
                    color={impactLevel === 'positive' ? '#10B981' : theme.colors.textSecondary}
                  />
                  <View>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: impactLevel === 'positive' ? '#10B981' : theme.colors.text,
                        },
                      ]}
                    >
                      Positive Impact
                    </Text>
                    <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                      I'm sleeping better and feeling more rested
                    </Text>
                  </View>
                </View>
                {impactLevel === 'positive' && (
                  <CheckCircle2 size={24} color="#10B981" fill="#10B981" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: impactLevel === 'no_change' ? theme.colors.warning + '20' : theme.colors.background,
                    borderColor: impactLevel === 'no_change' ? theme.colors.warning : theme.colors.border,
                  },
                ]}
                onPress={() => setImpactLevel('no_change')}
              >
                <View style={styles.optionLeft}>
                  <Minus
                    size={24}
                    color={impactLevel === 'no_change' ? theme.colors.warning : theme.colors.textSecondary}
                  />
                  <View>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: impactLevel === 'no_change' ? theme.colors.warning : theme.colors.text,
                        },
                      ]}
                    >
                      No Change
                    </Text>
                    <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                      I don't notice any significant difference
                    </Text>
                  </View>
                </View>
                {impactLevel === 'no_change' && (
                  <CheckCircle2 size={24} color={theme.colors.warning} fill={theme.colors.warning} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: impactLevel === 'negative' ? theme.colors.error + '20' : theme.colors.background,
                    borderColor: impactLevel === 'negative' ? theme.colors.error : theme.colors.border,
                  },
                ]}
                onPress={() => setImpactLevel('negative')}
              >
                <View style={styles.optionLeft}>
                  <TrendingDown
                    size={24}
                    color={impactLevel === 'negative' ? theme.colors.error : theme.colors.textSecondary}
                  />
                  <View>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: impactLevel === 'negative' ? theme.colors.error : theme.colors.text,
                        },
                      ]}
                    >
                      Negative Impact
                    </Text>
                    <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                      My sleep has gotten worse
                    </Text>
                  </View>
                </View>
                {impactLevel === 'negative' && (
                  <CheckCircle2 size={24} color={theme.colors.error} fill={theme.colors.error} />
                )}
              </TouchableOpacity>
            </View>

            {/* Question 2: Consistency */}
            <View style={[styles.questionCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.questionTitle, { color: theme.colors.text }]}>
                Are you maintaining consistency with the habits?
              </Text>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: consistencyLevel === 'excellent' ? '#10B981' + '20' : theme.colors.background,
                    borderColor: consistencyLevel === 'excellent' ? '#10B981' : theme.colors.border,
                  },
                ]}
                onPress={() => setConsistencyLevel('excellent')}
              >
                <View style={styles.optionLeft}>
                  <ThumbsUp
                    size={24}
                    color={consistencyLevel === 'excellent' ? '#10B981' : theme.colors.textSecondary}
                  />
                  <View>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: consistencyLevel === 'excellent' ? '#10B981' : theme.colors.text,
                        },
                      ]}
                    >
                      Excellent
                    </Text>
                    <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                      I'm following my habits consistently
                    </Text>
                  </View>
                </View>
                {consistencyLevel === 'excellent' && (
                  <CheckCircle2 size={24} color="#10B981" fill="#10B981" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: consistencyLevel === 'good' ? theme.colors.primary + '20' : theme.colors.background,
                    borderColor: consistencyLevel === 'good' ? theme.colors.primary : theme.colors.border,
                  },
                ]}
                onPress={() => setConsistencyLevel('good')}
              >
                <View style={styles.optionLeft}>
                  <RefreshCw
                    size={24}
                    color={consistencyLevel === 'good' ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <View>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: consistencyLevel === 'good' ? theme.colors.primary : theme.colors.text,
                        },
                      ]}
                    >
                      Good
                    </Text>
                    <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                      Most days I stick to my habits
                    </Text>
                  </View>
                </View>
                {consistencyLevel === 'good' && (
                  <CheckCircle2 size={24} color={theme.colors.primary} fill={theme.colors.primary} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  {
                    backgroundColor: consistencyLevel === 'struggling' ? theme.colors.warning + '20' : theme.colors.background,
                    borderColor: consistencyLevel === 'struggling' ? theme.colors.warning : theme.colors.border,
                  },
                ]}
                onPress={() => setConsistencyLevel('struggling')}
              >
                <View style={styles.optionLeft}>
                  <ThumbsDown
                    size={24}
                    color={consistencyLevel === 'struggling' ? theme.colors.warning : theme.colors.textSecondary}
                  />
                  <View>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: consistencyLevel === 'struggling' ? theme.colors.warning : theme.colors.text,
                        },
                      ]}
                    >
                      Struggling
                    </Text>
                    <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                      I find it hard to maintain consistency
                    </Text>
                  </View>
                </View>
                {consistencyLevel === 'struggling' && (
                  <CheckCircle2 size={24} color={theme.colors.warning} fill={theme.colors.warning} />
                )}
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor:
                    impactLevel && consistencyLevel ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={handleSubmitReflection}
              disabled={!impactLevel || !consistencyLevel}
            >
              <Text style={styles.submitButtonText}>Get My Recommendation</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Recommendation Card */}
            {recommendation && (
              <View style={[styles.recommendationCard, { backgroundColor: theme.colors.card }]}>
                <View
                  style={[
                    styles.recommendationIcon,
                    { backgroundColor: recommendation.color + '20' },
                  ]}
                >
                  {recommendation.type === 'try_different' ? (
                    <BookOpen size={40} color={recommendation.color} />
                  ) : recommendation.type === 'support' ? (
                    <Target size={40} color={recommendation.color} />
                  ) : (
                    <Award size={40} color={recommendation.color} />
                  )}
                </View>

                <Text style={[styles.recommendationTitle, { color: theme.colors.text }]}>
                  {recommendation.title}
                </Text>

                <Text style={[styles.recommendationMessage, { color: theme.colors.textSecondary }]}>
                  {recommendation.message}
                </Text>

                {/* Action Buttons */}
                {recommendation.type === 'try_different' ? (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: recommendation.color }]}
                      onPress={onSelectNewProgramme}
                    >
                      <Text style={styles.actionButtonText}>{recommendation.action}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.secondaryActionButton, { borderColor: theme.colors.border }]}
                      onPress={() => router.push('/habit-library?category=Sleep')}
                    >
                      <Text style={[styles.secondaryActionText, { color: theme.colors.text }]}>
                        Browse Sleep Habits Instead
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : recommendation.type === 'support' ? (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: recommendation.color }]}
                      onPress={() => router.push('/(tabs)/home')}
                    >
                      <Text style={styles.actionButtonText}>{recommendation.action}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.secondaryActionButton, { borderColor: theme.colors.border }]}
                      onPress={() => router.push('/habit-library?category=Sleep')}
                    >
                      <Text style={[styles.secondaryActionText, { color: theme.colors.text }]}>
                        Add More Sleep Habits
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: recommendation.color }]}
                      onPress={() => router.push('/(tabs)/home')}
                    >
                      <Text style={styles.actionButtonText}>View My Active Habits</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.secondaryActionButton, { borderColor: theme.colors.border }]}
                      onPress={() => setShowReflection(true)}
                    >
                      <Text style={[styles.secondaryActionText, { color: theme.colors.text }]}>
                        Retake Reflection
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}

            {/* Quick Stats */}
            <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
                Programme Summary
              </Text>

              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Total Weeks Completed
                </Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {programme.totalWeeks} weeks
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Lessons Learned
                </Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {programme.lessons.filter(l => l.completedAt).length} lessons
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                  Badges Earned
                </Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>
                  {programme.weeklyReviews.filter(r => r.badgeEarned).length} badges
                </Text>
              </View>
            </View>
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
  introCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  introDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  questionCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 13,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  recommendationCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  recommendationIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  recommendationTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  recommendationMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryActionButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '700',
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  statLabel: {
    fontSize: 15,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
