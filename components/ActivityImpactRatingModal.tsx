/**
 * Activity Impact Rating Modal
 *
 * Enhanced post-activity feedback modal that collects:
 * - Mood rating (1-5 scale with emojis)
 * - Sleep expectation (1-5 scale)
 * - Mental clarity (1-5 scale)
 * - Energy level (1-5 scale)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import UniversalModal from './UniversalModal';
import { Typography, FONT_SIZES, SPACING } from '@/constants/Typography';
import { ActivityFeedbackService } from '@/services/activityFeedback.service';
import {
  ACTIVITY_FEEDBACK_OPTIONS,
  SLEEP_FEEDBACK_OPTIONS,
  CLARITY_FEEDBACK_OPTIONS,
  ENERGY_FEEDBACK_OPTIONS,
} from '@/constants/emojiScoreMapping';

export interface ActivityImpactRatings {
  moodRating: number | null;
  sleepRating: number | null;
  clarityRating: number | null;
  energyRating: number | null;
}

interface ActivityImpactRatingModalProps {
  visible: boolean;
  activityName: string;
  activityCategory: string;
  activityId?: string;
  activityType?: string;
  date?: string;
  onClose: () => void;
  onSubmit: (ratings: ActivityImpactRatings) => void;
  saveToCorrelationEngine?: boolean;
}

export default function ActivityImpactRatingModal({
  visible,
  activityName,
  activityCategory,
  activityId,
  activityType,
  date,
  onClose,
  onSubmit,
  saveToCorrelationEngine = true,
}: ActivityImpactRatingModalProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const [moodRating, setMoodRating] = useState<number | null>(null);
  const [sleepRating, setSleepRating] = useState<number | null>(null);
  const [clarityRating, setClarityRating] = useState<number | null>(null);
  const [energyRating, setEnergyRating] = useState<number | null>(null);

  const handleSubmit = async () => {
    const ratings = {
      moodRating,
      sleepRating,
      clarityRating,
      energyRating,
    };

    // Save to correlation engine if enabled
    if (saveToCorrelationEngine && user) {
      setSaving(true);
      try {
        const { error } = await ActivityFeedbackService.submitFeedback(user.id, {
          activity_id: activityId,
          activity_type: activityType || activityCategory,
          activity_name: activityName,
          category: activityCategory,
          date: date || new Date().toISOString().split('T')[0],
          ratings,
        });

        if (error) {
          console.error('Error saving feedback:', error);
          Alert.alert('Error', 'Failed to save feedback. Please try again.');
          setSaving(false);
          return;
        }
      } catch (error) {
        console.error('Error in handleSubmit:', error);
      } finally {
        setSaving(false);
      }
    }

    onSubmit(ratings);

    // Reset ratings
    setMoodRating(null);
    setSleepRating(null);
    setClarityRating(null);
    setEnergyRating(null);
  };

  const handleSkip = () => {
    onSubmit({
      moodRating: null,
      sleepRating: null,
      clarityRating: null,
      energyRating: null,
    });

    setMoodRating(null);
    setSleepRating(null);
    setClarityRating(null);
    setEnergyRating(null);
  };

  const isValid = moodRating !== null || sleepRating !== null || clarityRating !== null || energyRating !== null;

  // Emoji mappings for each rating
  const moodEmojis = {
    1: { emoji: '😞', label: 'Terrible', color: '#EF4444' },
    2: { emoji: '😕', label: 'Bad', color: '#F59E0B' },
    3: { emoji: '😐', label: 'Okay', color: '#6B7280' },
    4: { emoji: '😊', label: 'Good', color: '#10B981' },
    5: { emoji: '😄', label: 'Excellent', color: '#8B5CF6' },
  };

  const sleepEmojis = {
    1: { emoji: '😰', label: 'Terrible', color: '#EF4444' },
    2: { emoji: '😓', label: 'Poor', color: '#F59E0B' },
    3: { emoji: '😴', label: 'Fair', color: '#6B7280' },
    4: { emoji: '😌', label: 'Good', color: '#10B981' },
    5: { emoji: '😇', label: 'Perfect', color: '#8B5CF6' },
  };

  const clarityEmojis = {
    1: { emoji: '😵', label: 'Foggy', color: '#EF4444' },
    2: { emoji: '😕', label: 'Unclear', color: '#F59E0B' },
    3: { emoji: '🙂', label: 'Moderate', color: '#6B7280' },
    4: { emoji: '😊', label: 'Clear', color: '#10B981' },
    5: { emoji: '🤩', label: 'Sharp', color: '#8B5CF6' },
  };

  const energyEmojis = {
    1: { emoji: '🪫', label: 'Drained', color: '#EF4444' },
    2: { emoji: '😮‍💨', label: 'Low', color: '#F59E0B' },
    3: { emoji: '😐', label: 'Moderate', color: '#6B7280' },
    4: { emoji: '⚡', label: 'Energized', color: '#10B981' },
    5: { emoji: '🔋', label: 'Full', color: '#8B5CF6' },
  };

  const RatingScale = ({
    title,
    description,
    value,
    onChange,
    emojis,
  }: {
    title: string;
    description: string;
    value: number | null;
    onChange: (val: number) => void;
    emojis: typeof moodEmojis;
  }) => (
    <View style={styles.ratingSection}>
      <Text style={[styles.ratingTitle, Typography.cardTitle, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[styles.ratingDescription, Typography.small, { color: theme.colors.textSecondary }]}>
        {description}
      </Text>

      <View style={styles.scaleContainer}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.scaleButton,
              {
                backgroundColor:
                  value === rating
                    ? emojis[rating as keyof typeof emojis].color + '20'
                    : theme.colors.surfaceVariant,
                borderColor:
                  value === rating
                    ? emojis[rating as keyof typeof emojis].color
                    : 'transparent',
                borderWidth: value === rating ? 2 : 1,
              },
            ]}
            onPress={() => onChange(rating)}
            activeOpacity={0.7}
          >
            <Text style={styles.scaleEmoji}>
              {emojis[rating as keyof typeof emojis].emoji}
            </Text>
            <Text
              style={[
                styles.scaleLabel,
                Typography.caption,
                {
                  color:
                    value === rating
                      ? emojis[rating as keyof typeof emojis].color
                      : theme.colors.textSecondary,
                  fontWeight: value === rating ? '600' : '400',
                },
              ]}
            >
              {emojis[rating as keyof typeof emojis].label}
            </Text>
            <View
              style={[
                styles.scaleNumber,
                {
                  backgroundColor:
                    value === rating
                      ? emojis[rating as keyof typeof emojis].color
                      : theme.colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.scaleNumberText,
                  Typography.meta,
                  { color: value === rating ? '#FFFFFF' : theme.colors.textSecondary },
                ]}
              >
                {rating}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const ratingsCompleted = [moodRating, sleepRating, clarityRating, energyRating].filter(
    (r) => r !== null
  ).length;

  const footerButtons = [
    {
      label: 'Skip',
      onPress: handleSkip,
      variant: 'secondary' as const,
      disabled: saving,
    },
    {
      label: isValid ? 'Submit Ratings' : 'Rate at least one',
      onPress: handleSubmit,
      variant: 'primary' as const,
      disabled: !isValid || saving,
      loading: saving,
    },
  ];

  return (
    <UniversalModal
      visible={visible}
      onClose={onClose}
      title="How did it go?"
      subtitle={`Rate your experience with ${activityName}`}
      footerButtons={footerButtons}
      scrollable={true}
    >
      {/* Progress Indicator */}
      <View style={styles.progressIndicator}>
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              {
                backgroundColor:
                  i <= ratingsCompleted
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
          />
        ))}
      </View>

      <View style={[styles.infoBox, { backgroundColor: theme.colors.primary + '10', borderLeftColor: theme.colors.primary }]}>
        <Text style={[styles.infoText, Typography.small, { color: theme.colors.text }]}>
          Your ratings help us understand which activities benefit you most. This
          creates personalized insights and recommendations.
        </Text>
      </View>

      <RatingScale
        title="How was your mood?"
        description="How did you feel during or right after this activity?"
        value={moodRating}
        onChange={setMoodRating}
        emojis={moodEmojis}
      />

      <RatingScale
        title="How will you sleep tonight?"
        description="Do you think this activity will help or hurt your sleep quality?"
        value={sleepRating}
        onChange={setSleepRating}
        emojis={sleepEmojis}
      />

      <RatingScale
        title="How's your mental clarity?"
        description="How clear and focused is your mind right now?"
        value={clarityRating}
        onChange={setClarityRating}
        emojis={clarityEmojis}
      />

      <RatingScale
        title="How's your energy level?"
        description="How energized do you feel after this activity?"
        value={energyRating}
        onChange={setEnergyRating}
        emojis={energyEmojis}
      />
    </UniversalModal>
  );
}

const styles = StyleSheet.create({
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: SPACING.xl,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  infoBox: {
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING['2xl'],
    borderLeftWidth: 4,
  },
  infoText: {
    lineHeight: 20,
  },
  ratingSection: {
    marginBottom: SPACING['2xl'],
  },
  ratingTitle: {
    marginBottom: 6,
  },
  ratingDescription: {
    marginBottom: SPACING.lg,
    lineHeight: 18,
  },
  scaleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  scaleButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: 6,
    borderRadius: 12,
    minHeight: 100,
    justifyContent: 'space-between',
  },
  scaleEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  scaleLabel: {
    textAlign: 'center',
    marginBottom: 6,
  },
  scaleNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleNumberText: {
    fontWeight: '600',
  },
});
