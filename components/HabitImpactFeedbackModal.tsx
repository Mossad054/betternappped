import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { X, TrendingUp, Moon, Shield, Zap, Smile } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { HabitCorrelationService } from '@/services/habitCorrelation.service';
import { ACTIVITY_FEEDBACK_OPTIONS } from '@/constants/emojiScoreMapping';

export interface HabitImpactData {
  overallFeeling: 'good' | 'neutral' | 'bad';
  moodImpact?: number; // 1-5
  sleepImpact?: number; // 1-5
  anxietyImpact?: number; // 1-5
  productivityImpact?: number; // 1-5
  energyImpact?: number; // 1-5
  difficultyLevel?: number; // 1-5
  enjoymentLevel?: number; // 1-5
  timeTaken?: number; // minutes
  notes?: string;
}

type HabitCategory = 'MentalClarity' | 'Health' | 'Sleep' | 'Mood' | 'Intimacy' | 'Anxiety';

interface HabitImpactFeedbackModalProps {
  visible: boolean;
  habitName: string;
  habitId: string;
  category?: HabitCategory;
  date?: string;
  onClose: () => void;
  onSubmit: (data: HabitImpactData) => void;
  saveToCorrelationEngine?: boolean;
}

const ImpactRating = ({
  label,
  icon: Icon,
  value,
  onChange,
  color,
  description,
}: {
  label: string;
  icon: any;
  value: number;
  onChange: (value: number) => void;
  color: string;
  description: string;
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.ratingContainer, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.ratingHeader}>
        <View style={styles.ratingLabelContainer}>
          <Icon size={20} color={color} />
          <Text style={[styles.ratingLabel, { color: theme.colors.text }]}>{label}</Text>
        </View>
        <Text style={[styles.ratingDescription, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      </View>

      <View style={styles.ratingButtons}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.ratingButton,
              { backgroundColor: theme.colors.surfaceVariant },
              value === rating && { backgroundColor: color, borderColor: color },
            ]}
            onPress={() => onChange(rating)}
          >
            <Text
              style={[
                styles.ratingButtonText,
                { color: theme.colors.text },
                value === rating && { color: '#FFFFFF', fontWeight: 'bold' },
              ]}
            >
              {rating}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Label indicators */}
      <View style={styles.ratingLabels}>
        <Text style={[styles.ratingLabelText, { color: theme.colors.textTertiary }]}>
          Low
        </Text>
        <Text style={[styles.ratingLabelText, { color: theme.colors.textTertiary }]}>
          High
        </Text>
      </View>
    </View>
  );
};

export default function HabitImpactFeedbackModal({
  visible,
  habitName,
  habitId,
  category,
  date,
  onClose,
  onSubmit,
  saveToCorrelationEngine = true,
}: HabitImpactFeedbackModalProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  // Determine which impact questions to show based on category
  const getRelevantImpacts = () => {
    switch (category) {
      case 'Sleep':
        return ['sleep', 'mood', 'energy'];
      case 'Mood':
        return ['mood', 'anxiety', 'energy'];
      case 'Anxiety':
        return ['anxiety', 'mood', 'sleep'];
      case 'Health':
        return ['energy', 'mood', 'sleep'];
      case 'MentalClarity':
        return ['productivity', 'mood', 'anxiety'];
      case 'Intimacy':
        return ['mood', 'anxiety', 'energy'];
      default:
        return ['mood', 'sleep', 'anxiety', 'productivity', 'energy'];
    }
  };

  const relevantImpacts = getRelevantImpacts();

  // Overall feeling (required)
  const [overallFeeling, setOverallFeeling] = useState<'good' | 'neutral' | 'bad' | null>(null);

  // Impact ratings (optional but encouraged)
  const [moodImpact, setMoodImpact] = useState<number>(3);
  const [sleepImpact, setSleepImpact] = useState<number>(3);
  const [anxietyImpact, setAnxietyImpact] = useState<number>(3);
  const [productivityImpact, setProductivityImpact] = useState<number>(3);
  const [energyImpact, setEnergyImpact] = useState<number>(3);

  // Additional context
  const [difficultyLevel, setDifficultyLevel] = useState<number>(3);
  const [enjoymentLevel, setEnjoymentLevel] = useState<number>(3);
  const [timeTaken, setTimeTaken] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = async () => {
    if (!overallFeeling) {
      Alert.alert('Required', 'Please select how you felt overall');
      return;
    }

    const data: HabitImpactData = {
      overallFeeling,
      moodImpact,
      sleepImpact,
      anxietyImpact,
      productivityImpact,
      energyImpact,
      difficultyLevel,
      enjoymentLevel,
      timeTaken: timeTaken ? parseInt(timeTaken) : undefined,
      notes: notes.trim() || undefined,
    };

    // Save to correlation engine if enabled
    if (saveToCorrelationEngine && user) {
      setSaving(true);
      try {
        // Convert overallFeeling to emoji_id and score
        const feelingToEmoji: Record<string, { emoji: string; score: number }> = {
          good: { emoji: '😊', score: 4 },
          neutral: { emoji: '😐', score: 3 },
          bad: { emoji: '😔', score: 2 },
        };

        const { emoji, score } = feelingToEmoji[overallFeeling];

        const { error } = await HabitCorrelationService.logHabitFeedback(user.id, {
          habit_id: habitId,
          habit_name: habitName,
          date: date || new Date().toISOString().split('T')[0],
          emoji_id: emoji,
          score,
          notes: notes.trim() || undefined,
        });

        if (error) {
          console.error('Error saving habit feedback:', error);
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

    onSubmit(data);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setOverallFeeling(null);
    setMoodImpact(3);
    setSleepImpact(3);
    setAnxietyImpact(3);
    setProductivityImpact(3);
    setEnergyImpact(3);
    setDifficultyLevel(3);
    setEnjoymentLevel(3);
    setTimeTaken('');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.modalHeaderContent}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                How did it go?
              </Text>
              <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                {habitName}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Overall Feeling (Required) */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Overall Feeling *
              </Text>
              <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
                How do you feel after completing this habit?
              </Text>

              <View style={styles.overallFeelingButtons}>
                <TouchableOpacity
                  style={[
                    styles.feelingButton,
                    { backgroundColor: theme.colors.surfaceVariant },
                    overallFeeling === 'good' && {
                      backgroundColor: theme.colors.success,
                      borderWidth: 2,
                      borderColor: theme.colors.success,
                    },
                  ]}
                  onPress={() => setOverallFeeling('good')}
                >
                  <Text style={styles.feelingEmoji}>😊</Text>
                  <Text
                    style={[
                      styles.feelingText,
                      { color: theme.colors.text },
                      overallFeeling === 'good' && { color: '#FFFFFF', fontWeight: 'bold' },
                    ]}
                  >
                    Good
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.feelingButton,
                    { backgroundColor: theme.colors.surfaceVariant },
                    overallFeeling === 'neutral' && {
                      backgroundColor: theme.colors.warning,
                      borderWidth: 2,
                      borderColor: theme.colors.warning,
                    },
                  ]}
                  onPress={() => setOverallFeeling('neutral')}
                >
                  <Text style={styles.feelingEmoji}>😐</Text>
                  <Text
                    style={[
                      styles.feelingText,
                      { color: theme.colors.text },
                      overallFeeling === 'neutral' && { color: '#FFFFFF', fontWeight: 'bold' },
                    ]}
                  >
                    Neutral
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.feelingButton,
                    { backgroundColor: theme.colors.surfaceVariant },
                    overallFeeling === 'bad' && {
                      backgroundColor: theme.colors.error,
                      borderWidth: 2,
                      borderColor: theme.colors.error,
                    },
                  ]}
                  onPress={() => setOverallFeeling('bad')}
                >
                  <Text style={styles.feelingEmoji}>😔</Text>
                  <Text
                    style={[
                      styles.feelingText,
                      { color: theme.colors.text },
                      overallFeeling === 'bad' && { color: '#FFFFFF', fontWeight: 'bold' },
                    ]}
                  >
                    Bad
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Detailed Impact Ratings - Category Specific */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Impact on Your Wellness
              </Text>
              <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
                Rate how much this habit affected each area (1 = Low, 5 = High)
              </Text>

              {relevantImpacts.includes('mood') && (
                <ImpactRating
                  label="Mood Impact"
                  icon={Smile}
                  value={moodImpact}
                  onChange={setMoodImpact}
                  color={theme.colors.primary}
                  description="How much did this improve your mood?"
                />
              )}

              {relevantImpacts.includes('sleep') && (
                <ImpactRating
                  label="Sleep Quality"
                  icon={Moon}
                  value={sleepImpact}
                  onChange={setSleepImpact}
                  color={theme.colors.info}
                  description="How much will this help your sleep tonight?"
                />
              )}

              {relevantImpacts.includes('anxiety') && (
                <ImpactRating
                  label="Anxiety Reduction"
                  icon={Shield}
                  value={anxietyImpact}
                  onChange={setAnxietyImpact}
                  color={theme.colors.success}
                  description="How much did this reduce your anxiety?"
                />
              )}

              {relevantImpacts.includes('productivity') && (
                <ImpactRating
                  label="Productivity Boost"
                  icon={TrendingUp}
                  value={productivityImpact}
                  onChange={setProductivityImpact}
                  color={theme.colors.warning}
                  description="How much did this boost your focus/productivity?"
                />
              )}

              {relevantImpacts.includes('energy') && (
                <ImpactRating
                  label="Energy Level"
                  icon={Zap}
                  value={energyImpact}
                  onChange={setEnergyImpact}
                  color={theme.colors.error}
                  description="How much did this increase your energy?"
                />
              )}
            </View>

            {/* Additional Context */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Additional Feedback
              </Text>

              <View style={styles.additionalRow}>
                <View style={styles.additionalItem}>
                  <Text style={[styles.additionalLabel, { color: theme.colors.textSecondary }]}>
                    Difficulty
                  </Text>
                  <View style={styles.miniRating}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <TouchableOpacity
                        key={rating}
                        style={[
                          styles.miniRatingButton,
                          { backgroundColor: theme.colors.surfaceVariant },
                          difficultyLevel === rating && {
                            backgroundColor: theme.colors.primary,
                          },
                        ]}
                        onPress={() => setDifficultyLevel(rating)}
                      >
                        <Text
                          style={[
                            styles.miniRatingText,
                            { color: theme.colors.text },
                            difficultyLevel === rating && { color: '#FFFFFF' },
                          ]}
                        >
                          {rating}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.additionalItem}>
                  <Text style={[styles.additionalLabel, { color: theme.colors.textSecondary }]}>
                    Enjoyment
                  </Text>
                  <View style={styles.miniRating}>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <TouchableOpacity
                        key={rating}
                        style={[
                          styles.miniRatingButton,
                          { backgroundColor: theme.colors.surfaceVariant },
                          enjoymentLevel === rating && {
                            backgroundColor: theme.colors.primary,
                          },
                        ]}
                        onPress={() => setEnjoymentLevel(rating)}
                      >
                        <Text
                          style={[
                            styles.miniRatingText,
                            { color: theme.colors.text },
                            enjoymentLevel === rating && { color: '#FFFFFF' },
                          ]}
                        >
                          {rating}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Time Taken (minutes)
                </Text>
                <TextInput
                  style={[
                    styles.timeInput,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  placeholder="e.g., 30"
                  placeholderTextColor={theme.colors.textTertiary}
                  keyboardType="number-pad"
                  value={timeTaken}
                  onChangeText={setTimeTaken}
                  maxLength={4}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Notes (Optional)
                </Text>
                <TextInput
                  style={[
                    styles.notesInput,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      color: theme.colors.text,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  placeholder="Any thoughts or observations?"
                  placeholderTextColor={theme.colors.textTertiary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={notes}
                  onChangeText={setNotes}
                  maxLength={500}
                />
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.modalFooter, { borderTopColor: theme.colors.border }]}>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.colors.surfaceVariant }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: theme.colors.primary },
                saving && { opacity: 0.7 },
              ]}
              onPress={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalHeaderContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  overallFeelingButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feelingButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  feelingEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  feelingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingContainer: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  ratingHeader: {
    marginBottom: 12,
  },
  ratingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingDescription: {
    fontSize: 13,
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  ratingButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingLabelText: {
    fontSize: 12,
  },
  additionalRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  additionalItem: {
    flex: 1,
  },
  additionalLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  miniRating: {
    flexDirection: 'row',
    gap: 4,
  },
  miniRatingButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 6,
  },
  miniRatingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  timeInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
  },
  notesInput: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 100,
    borderWidth: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
