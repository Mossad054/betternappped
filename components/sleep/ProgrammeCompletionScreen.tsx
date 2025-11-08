// Programme Completion Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Award,
  TrendingUp,
  Star,
  Share2,
  ArrowRight,
} from 'lucide-react-native';
import { Programme } from '@/services/SleepProgrammeService';

interface ProgrammeCompletionScreenProps {
  programme: Programme;
  onEnterMaintenance: () => void;
  onJoinAdvanced: () => void;
  onSubmitFeedback: (rating: number, text: string) => void;
}

export default function ProgrammeCompletionScreen({
  programme,
  onEnterMaintenance,
  onJoinAdvanced,
  onSubmitFeedback,
}: ProgrammeCompletionScreenProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [rating, setRating] = useState<number>(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSubmitFeedback = () => {
    if (rating > 0) {
      onSubmitFeedback(rating, feedbackText);
      setShowFeedback(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const improvementMinutes =
    (programme.currentMetrics?.averageSleepDuration || 0) -
    programme.baselineMetrics.averageSleepDuration;

  const consistencyImprovement =
    programme.baselineMetrics.bedtimeConsistency -
    (programme.currentMetrics?.bedtimeConsistency || 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Celebration Header */}
        <View style={styles.celebrationHeader}>
          <View style={[styles.trophyContainer, { backgroundColor: theme.colors.primary }]}>
            <Award size={64} color="#FFFFFF" />
          </View>
          <Text style={[styles.congratsText, { color: theme.colors.text }]}>
            🎉 Congratulations! 🎉
          </Text>
          <Text style={[styles.completionTitle, { color: theme.colors.text }]}>
            You've Completed the 4-Week Sleep Improvement Programme
          </Text>
        </View>

        {/* Progress Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
            Your Progress Summary
          </Text>

          {/* Sleep Duration */}
          <View style={styles.metricRow}>
            <View style={styles.metricContent}>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                Sleep Duration
              </Text>
              <View style={styles.comparisonRow}>
                <Text style={[styles.baselineValue, { color: theme.colors.textSecondary }]}>
                  {formatDuration(programme.baselineMetrics.averageSleepDuration)}
                </Text>
                <ArrowRight size={20} color={theme.colors.primary} />
                <Text style={[styles.currentValue, { color: theme.colors.primary }]}>
                  {formatDuration(programme.currentMetrics?.averageSleepDuration || 0)}
                </Text>
              </View>
              {improvementMinutes > 0 && (
                <View style={[styles.improvementBadge, { backgroundColor: '#10B981' + '15' }]}>
                  <TrendingUp size={16} color="#10B981" />
                  <Text style={[styles.improvementText, { color: '#10B981' }]}>
                    +{improvementMinutes} minutes per night
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Bedtime Consistency */}
          <View style={styles.metricRow}>
            <View style={styles.metricContent}>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                Bedtime Consistency
              </Text>
              <View style={styles.comparisonRow}>
                <Text style={[styles.baselineValue, { color: theme.colors.textSecondary }]}>
                  ±{programme.baselineMetrics.bedtimeConsistency} min
                </Text>
                <ArrowRight size={20} color={theme.colors.primary} />
                <Text style={[styles.currentValue, { color: theme.colors.primary }]}>
                  ±{programme.currentMetrics?.bedtimeConsistency || 0} min
                </Text>
              </View>
              {consistencyImprovement > 0 && (
                <View style={[styles.improvementBadge, { backgroundColor: '#10B981' + '15' }]}>
                  <TrendingUp size={16} color="#10B981" />
                  <Text style={[styles.improvementText, { color: '#10B981' }]}>
                    {consistencyImprovement} min more consistent
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Overall Improvement */}
          <View style={[styles.overallCard, { backgroundColor: theme.colors.primary + '15' }]}>
            <Text style={[styles.overallLabel, { color: theme.colors.primary }]}>
              Overall Improvement
            </Text>
            <Text style={[styles.overallPercentage, { color: theme.colors.primary }]}>
              +{programme.currentMetrics?.improvementPercentage || 0}%
            </Text>
          </View>
        </View>

        {/* Badges Earned */}
        {programme.weeklyReviews.some(r => r.badgeEarned) && (
          <View style={[styles.badgesCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.badgesTitle, { color: theme.colors.text }]}>
              Badges Earned 🏆
            </Text>
            <View style={styles.badgesList}>
              {programme.weeklyReviews
                .filter(r => r.badgeEarned)
                .map((review, index) => (
                  <View
                    key={index}
                    style={[styles.badgeItem, { backgroundColor: theme.colors.primary + '10' }]}
                  >
                    <Award size={20} color={theme.colors.primary} />
                    <Text style={[styles.badgeText, { color: theme.colors.text }]}>
                      {review.badgeEarned}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Feedback Section */}
        {!showFeedback ? (
          <TouchableOpacity
            style={[styles.feedbackPrompt, { backgroundColor: theme.colors.card }]}
            onPress={() => setShowFeedback(true)}
          >
            <Text style={[styles.feedbackPromptText, { color: theme.colors.text }]}>
              How helpful was this programme?
            </Text>
            <Text style={[styles.feedbackPromptSubtext, { color: theme.colors.textSecondary }]}>
              Tap to rate and share feedback
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.feedbackCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.feedbackTitle, { color: theme.colors.text }]}>
              Rate Your Experience
            </Text>

            {/* Star Rating */}
            <View style={styles.starRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Star
                    size={36}
                    color={star <= rating ? '#F59E0B' : theme.colors.border}
                    fill={star <= rating ? '#F59E0B' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Feedback Text */}
            <Text style={[styles.feedbackLabel, { color: theme.colors.textSecondary }]}>
              What would make it even better?
            </Text>
            <TextInput
              style={[
                styles.feedbackInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder="Share your thoughts..."
              placeholderTextColor={theme.colors.textSecondary}
              value={feedbackText}
              onChangeText={setFeedbackText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.submitFeedbackButton,
                {
                  backgroundColor: rating > 0 ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={handleSubmitFeedback}
              disabled={rating === 0}
            >
              <Text style={styles.submitFeedbackText}>Submit Feedback</Text>
            </TouchableOpacity>
          </View>
        )}
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
          onPress={onEnterMaintenance}
        >
          <Text style={styles.primaryButtonText}>Enter Maintenance Mode</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
          onPress={onJoinAdvanced}
        >
          <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>
            Join Advanced Programme
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={18} color={theme.colors.textSecondary} />
          <Text style={[styles.shareButtonText, { color: theme.colors.textSecondary }]}>
            Share Your Achievement
          </Text>
        </TouchableOpacity>
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
  celebrationHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  trophyContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
  },
  metricRow: {
    marginBottom: 20,
  },
  metricContent: {
    gap: 8,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  baselineValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  currentValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  improvementText: {
    fontSize: 13,
    fontWeight: '700',
  },
  overallCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  overallLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  overallPercentage: {
    fontSize: 36,
    fontWeight: '800',
  },
  badgesCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  badgesTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  badgesList: {
    gap: 12,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 15,
    fontWeight: '700',
  },
  feedbackPrompt: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  feedbackPromptText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  feedbackPromptSubtext: {
    fontSize: 14,
  },
  feedbackCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  starRating: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  starButton: {
    padding: 4,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  feedbackInput: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 100,
    marginBottom: 16,
  },
  submitFeedbackButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitFeedbackText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  actionsBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
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
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  shareButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
