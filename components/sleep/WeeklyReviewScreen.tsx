// Weekly Review Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  ChevronRight,
  RotateCcw,
  Pause,
} from 'lucide-react-native';
import { WeeklyReview } from '@/services/SleepProgrammeService';

interface WeeklyReviewScreenProps {
  review: WeeklyReview;
  onContinue: () => void;
  onRepeat: () => void;
  onPause: () => void;
}

export default function WeeklyReviewScreen({
  review,
  onContinue,
  onRepeat,
  onPause,
}: WeeklyReviewScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const sleepDiff = review.averageSleepDuration - review.targetSleepDuration;
  const qualityImprovement = review.qualityWithHabit - review.qualityWithoutHabit;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={[styles.weekLabel, { color: theme.colors.textSecondary }]}>
            WEEK {review.weekNumber} COMPLETE
          </Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Weekly Review
          </Text>
        </View>

        {/* Badge Card */}
        {review.badgeEarned && (
          <View style={[styles.badgeCard, { backgroundColor: theme.colors.primary + '15' }]}>
            <View style={[styles.badgeIconContainer, { backgroundColor: theme.colors.primary }]}>
              <Award size={32} color="#FFFFFF" />
            </View>
            <Text style={[styles.badgeTitle, { color: theme.colors.text }]}>
              You earned:
            </Text>
            <Text style={[styles.badgeName, { color: theme.colors.primary }]}>
              {review.badgeEarned}
            </Text>
          </View>
        )}

        {/* Habit Completion */}
        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.statHeader}>
            <Target size={24} color={theme.colors.primary} />
            <Text style={[styles.statTitle, { color: theme.colors.text }]}>
              Habit Completion
            </Text>
          </View>
          <View style={styles.progressContainer}>
            <Text style={[styles.bigNumber, { color: theme.colors.primary }]}>
              {review.habitCompletionRate}/7
            </Text>
            <Text style={[styles.statSubtext, { color: theme.colors.textSecondary }]}>
              days completed
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.primary,
                  width: `${(review.habitCompletionRate / 7) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Sleep Duration */}
        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.statHeader}>
            <Clock size={24} color={theme.colors.primary} />
            <Text style={[styles.statTitle, { color: theme.colors.text }]}>
              Average Sleep Duration
            </Text>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statColumn}>
              <Text style={[styles.bigNumber, { color: theme.colors.text }]}>
                {formatDuration(review.averageSleepDuration)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                This week
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statColumn}>
              <Text style={[styles.bigNumber, { color: theme.colors.textSecondary }]}>
                {formatDuration(review.targetSleepDuration)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Your goal
              </Text>
            </View>
          </View>
          {sleepDiff !== 0 && (
            <View
              style={[
                styles.diffBadge,
                {
                  backgroundColor:
                    sleepDiff >= 0 ? '#10B981' + '15' : '#EF4444' + '15',
                },
              ]}
            >
              {sleepDiff >= 0 ? (
                <TrendingUp size={16} color="#10B981" />
              ) : (
                <TrendingDown size={16} color="#EF4444" />
              )}
              <Text
                style={[
                  styles.diffText,
                  { color: sleepDiff >= 0 ? '#10B981' : '#EF4444' },
                ]}
              >
                {Math.abs(sleepDiff)} min {sleepDiff >= 0 ? 'above' : 'below'} target
              </Text>
            </View>
          )}
        </View>

        {/* Bedtime Consistency */}
        <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.statHeader}>
            <Target size={24} color={theme.colors.primary} />
            <Text style={[styles.statTitle, { color: theme.colors.text }]}>
              Bedtime Consistency
            </Text>
          </View>
          <Text style={[styles.bigNumber, { color: theme.colors.text }]}>
            ±{review.bedtimeVariability} min
          </Text>
          <Text style={[styles.statSubtext, { color: theme.colors.textSecondary }]}>
            {review.bedtimeVariability <= 30
              ? 'Excellent consistency! 🎉'
              : review.bedtimeVariability <= 60
              ? 'Good progress — keep it up!'
              : 'Room for improvement'}
          </Text>
        </View>

        {/* Insight Card */}
        {qualityImprovement > 0 && (
          <View style={[styles.insightCard, { backgroundColor: theme.colors.primary + '10' }]}>
            <Text style={[styles.insightLabel, { color: theme.colors.primary }]}>
              💡 Key Insight
            </Text>
            <Text style={[styles.insightText, { color: theme.colors.text }]}>
              On nights when you completed the habit, your sleep quality averaged{' '}
              <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>
                {review.qualityWithHabit}%
              </Text>{' '}
              vs{' '}
              <Text style={{ fontWeight: '700' }}>
                {review.qualityWithoutHabit}%
              </Text>{' '}
              when skipped.
            </Text>
            <Text style={[styles.insightHighlight, { color: theme.colors.primary }]}>
              That's a +{qualityImprovement}% improvement!
            </Text>
          </View>
        )}

        {/* Next Steps */}
        <View style={styles.nextSteps}>
          <Text style={[styles.nextStepsTitle, { color: theme.colors.text }]}>
            What's Next?
          </Text>
          <Text style={[styles.nextStepsSubtitle, { color: theme.colors.textSecondary }]}>
            Ready for Week {review.weekNumber + 1}, or need more time?
          </Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={[
          styles.actionsBar,
          {
            backgroundColor: theme.colors.card,
            paddingBottom: insets.bottom + 16,
            borderTopColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
          onPress={onContinue}
        >
          <Text style={styles.primaryButtonText}>
            Continue to Lesson {review.weekNumber + 1}
          </Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.secondaryActions}>
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
            onPress={onRepeat}
          >
            <RotateCcw size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.secondaryButtonText, { color: theme.colors.textSecondary }]}>
              Repeat Week {review.weekNumber}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
            onPress={onPause}
          >
            <Pause size={18} color={theme.colors.textSecondary} />
            <Text style={[styles.secondaryButtonText, { color: theme.colors.textSecondary }]}>
              Pause
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  weekLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  badgeCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  statCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  bigNumber: {
    fontSize: 48,
    fontWeight: '800',
  },
  statSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statColumn: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#E5E7EB',
  },
  statLabel: {
    fontSize: 13,
    marginTop: 4,
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    marginTop: 12,
    justifyContent: 'center',
  },
  diffText: {
    fontSize: 13,
    fontWeight: '700',
  },
  insightCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  insightLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  insightText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  insightHighlight: {
    fontSize: 18,
    fontWeight: '800',
  },
  nextSteps: {
    alignItems: 'center',
    marginTop: 8,
  },
  nextStepsTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  nextStepsSubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  actionsBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
