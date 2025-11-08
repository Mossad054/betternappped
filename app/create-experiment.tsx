import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ExperimentsService } from '@/services/experiments.service';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Calendar,
  Bell,
  Target,
  Activity,
  Brain,
  Moon,
  Heart,
  Shield,
  Zap,
} from 'lucide-react-native';

interface ExperimentStep {
  id: number;
  title: string;
  description: string;
}

interface ActivityOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: string;
}

interface OutcomeOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

const experimentSteps: ExperimentStep[] = [
  {
    id: 1,
    title: 'Choose Activity',
    description: 'Select what you want to experiment with'
  },
  {
    id: 2,
    title: 'Expected Outcomes',
    description: 'What do you hope to improve?'
  },
  {
    id: 3,
    title: 'Duration',
    description: 'How long will you run this experiment?'
  },
  {
    id: 4,
    title: 'Logging Frequency',
    description: 'How often will you track progress?'
  },
  {
    id: 5,
    title: 'Reminders',
    description: 'Set up notifications to stay on track'
  },
  {
    id: 6,
    title: 'Review & Save',
    description: 'Confirm your experiment settings'
  }
];

const activityOptions: ActivityOption[] = [
  { id: 'meditation', name: 'Meditation', emoji: '🧘', description: 'Daily mindfulness practice', category: 'Mindfulness' },
  { id: 'exercise', name: 'Exercise', emoji: '🏃', description: 'Physical activity and movement', category: 'Health' },
  { id: 'journaling', name: 'Journaling', emoji: '📝', description: 'Writing thoughts and reflections', category: 'Mental Health' },
  { id: 'sleep-routine', name: 'Sleep Routine', emoji: '😴', description: 'Consistent bedtime habits', category: 'Sleep' },
  { id: 'gratitude', name: 'Gratitude Practice', emoji: '🙏', description: 'Daily appreciation exercises', category: 'Mindfulness' },
  { id: 'reading', name: 'Reading', emoji: '📚', description: 'Learning and knowledge building', category: 'Personal Growth' },
  { id: 'social-connection', name: 'Social Connection', emoji: '👥', description: 'Meaningful relationships', category: 'Social' },
  { id: 'nature-time', name: 'Nature Time', emoji: '🌿', description: 'Time spent outdoors', category: 'Wellness' },
  { id: 'custom', name: 'Custom Activity', emoji: '✨', description: 'Create your own experiment', category: 'Custom' }
];

const outcomeOptions: OutcomeOption[] = [
  { id: 'mood', name: 'Mood', emoji: '😊', description: 'Overall emotional wellbeing' },
  { id: 'sleep', name: 'Sleep Quality', emoji: '😴', description: 'Rest and recovery' },
  { id: 'anxiety', name: 'Anxiety Levels', emoji: '😌', description: 'Stress and worry reduction' },
  { id: 'clarity', name: 'Mental Clarity', emoji: '🧠', description: 'Focus and cognitive function' },
  { id: 'energy', name: 'Energy Levels', emoji: '⚡', description: 'Physical and mental vitality' },
  { id: 'productivity', name: 'Productivity', emoji: '📈', description: 'Getting things done' }
];

const durationOptions = [
  { id: '1-week', name: '1 Week', description: 'Quick test' },
  { id: '2-weeks', name: '2 Weeks', description: 'Short experiment' },
  { id: '1-month', name: '1 Month', description: 'Full month trial' }
];

const frequencyOptions = [
  { id: 'daily', name: 'Daily', description: 'Track every day' },
  { id: 'weekly', name: 'Weekly', description: 'Check in weekly' }
];

const reminderTypes = [
  { id: 'morning', name: 'Morning', description: 'Start your day right' },
  { id: 'evening', name: 'Evening', description: 'Reflect before bed' },
  { id: 'custom', name: 'Custom Time', description: 'Choose your own time' }
];

export default function CreateExperimentScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = createStyles(theme);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('');
  const [selectedReminderType, setSelectedReminderType] = useState<string>('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [customActivity, setCustomActivity] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create an experiment.');
      return;
    }

    setIsCreating(true);

    try {
      // Get activity details
      const activity = activityOptions.find(a => a.id === selectedActivity);
      if (!activity) {
        throw new Error('Please select an activity');
      }

      // Calculate duration in days
      const durationMap: { [key: string]: number } = {
        '1-week': 7,
        '2-weeks': 14,
        '1-month': 30,
      };
      const durationDays = durationMap[selectedDuration] || 30;

      // Calculate start and end dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + durationDays);

      // Format dates as YYYY-MM-DD
      const formatDate = (date: Date) => date.toISOString().split('T')[0];

      // Map outcome IDs to names
      const outcomeNames = selectedOutcomes.map(id => 
        outcomeOptions.find(o => o.id === id)?.name || id
      );

      // Create experiment
      const { data, error } = await ExperimentsService.create({
        activity_name: activity.name,
        activity_emoji: activity.emoji,
        outcomes: outcomeNames,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        duration: durationDays,
        status: 'active',
        current_day: 1,
        baseline_data: null,
        results_data: null,
        insights: null,
      }, user.id);

      if (error) {
        throw new Error(error);
      }

      Alert.alert(
        'Experiment Created! 🎉',
        `Your ${activity.name} experiment is now active. Track your progress daily to see results!`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating experiment:', error);
      Alert.alert(
        'Creation Failed',
        error instanceof Error ? error.message : 'Failed to create experiment. Please try again.'
      );
    } finally {
      setIsCreating(false);
    }
  };

  const toggleOutcome = (outcomeId: string) => {
    setSelectedOutcomes(prev => 
      prev.includes(outcomeId) 
        ? prev.filter(id => id !== outcomeId)
        : [...prev, outcomeId]
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>What activity would you like to experiment with?</Text>
            <View style={styles.activityPillsContainer}>
              {activityOptions.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.activityPill,
                    { 
                      backgroundColor: selectedActivity === activity.id ? theme.colors.primary : theme.colors.card,
                      borderColor: selectedActivity === activity.id ? theme.colors.primary : theme.colors.border,
                    }
                  ]}
                  onPress={() => setSelectedActivity(activity.id)}
                >
                  <Text style={styles.activityPillEmoji}>{activity.emoji}</Text>
                  <Text style={[
                    styles.activityPillText, 
                    { color: selectedActivity === activity.id ? '#FFFFFF' : theme.colors.text }
                  ]}>
                    {activity.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>What do you hope to improve?</Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>Select all that apply</Text>
            <View style={styles.outcomesList}>
              {outcomeOptions.map((outcome) => (
                <TouchableOpacity
                  key={outcome.id}
                  style={[
                    styles.outcomeCard,
                    { backgroundColor: theme.colors.card },
                    selectedOutcomes.includes(outcome.id) && { borderColor: theme.colors.primary, borderWidth: 2 }
                  ]}
                  onPress={() => toggleOutcome(outcome.id)}
                >
                  <Text style={styles.outcomeEmoji}>{outcome.emoji}</Text>
                  <View style={styles.outcomeInfo}>
                    <Text style={[styles.outcomeName, { color: theme.colors.text }]}>{outcome.name}</Text>
                    <Text style={[styles.outcomeDescription, { color: theme.colors.textSecondary }]}>{outcome.description}</Text>
                  </View>
                  {selectedOutcomes.includes(outcome.id) && (
                    <Check size={16} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>How long will you run this experiment?</Text>
            <View style={styles.durationList}>
              {durationOptions.map((duration) => (
                <TouchableOpacity
                  key={duration.id}
                  style={[
                    styles.durationCard,
                    { backgroundColor: theme.colors.card },
                    selectedDuration === duration.id && { borderColor: theme.colors.primary, borderWidth: 2 }
                  ]}
                  onPress={() => setSelectedDuration(duration.id)}
                >
                  <Calendar size={18} color={theme.colors.primary} />
                  <View style={styles.durationInfo}>
                    <Text style={[styles.durationName, { color: theme.colors.text }]}>{duration.name}</Text>
                    <Text style={[styles.durationDescription, { color: theme.colors.textSecondary }]}>{duration.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>How often will you track progress?</Text>
            <View style={styles.frequencyList}>
              {frequencyOptions.map((frequency) => (
                <TouchableOpacity
                  key={frequency.id}
                  style={[
                    styles.frequencyCard,
                    { backgroundColor: theme.colors.card },
                    selectedFrequency === frequency.id && { borderColor: theme.colors.primary, borderWidth: 2 }
                  ]}
                  onPress={() => setSelectedFrequency(frequency.id)}
                >
                  <Clock size={18} color={theme.colors.primary} />
                  <View style={styles.frequencyInfo}>
                    <Text style={[styles.frequencyName, { color: theme.colors.text }]}>{frequency.name}</Text>
                    <Text style={[styles.frequencyDescription, { color: theme.colors.textSecondary }]}>{frequency.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Set up reminders</Text>
            <View style={styles.reminderList}>
              {reminderTypes.map((reminder) => (
                <TouchableOpacity
                  key={reminder.id}
                  style={[
                    styles.reminderCard,
                    { backgroundColor: theme.colors.card },
                    selectedReminderType === reminder.id && { borderColor: theme.colors.primary, borderWidth: 2 }
                  ]}
                  onPress={() => setSelectedReminderType(reminder.id)}
                >
                  <Bell size={18} color={theme.colors.primary} />
                  <View style={styles.reminderInfo}>
                    <Text style={[styles.reminderName, { color: theme.colors.text }]}>{reminder.name}</Text>
                    <Text style={[styles.reminderDescription, { color: theme.colors.textSecondary }]}>{reminder.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            {selectedReminderType && (
              <View style={[styles.timePicker, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.timePickerLabel, { color: theme.colors.text }]}>Reminder Time</Text>
                <Text style={[styles.timePickerValue, { color: theme.colors.primary }]}>{reminderTime}</Text>
              </View>
            )}
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>Review your experiment</Text>
            
            <View style={styles.reviewSection}>
              <Text style={[styles.reviewLabel, { color: theme.colors.textSecondary }]}>Activity</Text>
              <Text style={[styles.reviewValue, { color: theme.colors.text }]}>
                {activityOptions.find(a => a.id === selectedActivity)?.name || 'Custom Activity'}
              </Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={[styles.reviewLabel, { color: theme.colors.textSecondary }]}>Expected Outcomes</Text>
              <Text style={[styles.reviewValue, { color: theme.colors.text }]}>
                {selectedOutcomes.map(id => outcomeOptions.find(o => o.id === id)?.name).join(', ')}
              </Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={[styles.reviewLabel, { color: theme.colors.textSecondary }]}>Duration</Text>
              <Text style={[styles.reviewValue, { color: theme.colors.text }]}>
                {durationOptions.find(d => d.id === selectedDuration)?.name}
              </Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={[styles.reviewLabel, { color: theme.colors.textSecondary }]}>Tracking Frequency</Text>
              <Text style={[styles.reviewValue, { color: theme.colors.text }]}>
                {frequencyOptions.find(f => f.id === selectedFrequency)?.name}
              </Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={[styles.reviewLabel, { color: theme.colors.textSecondary }]}>Reminders</Text>
              <Text style={[styles.reviewValue, { color: theme.colors.text }]}>
                {reminderTypes.find(r => r.id === selectedReminderType)?.name} at {reminderTime}
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedActivity !== '';
      case 2: return selectedOutcomes.length > 0;
      case 3: return selectedDuration !== '';
      case 4: return selectedFrequency !== '';
      case 5: return selectedReminderType !== '';
      case 6: return true;
      default: return false;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Create Experiment',
          headerStyle: { backgroundColor: theme.colors.card },
          headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <ArrowLeft size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ),
        }}
      />

      <View style={[styles.progressContainer, { backgroundColor: theme.colors.card }]}>
        <View style={styles.progressBar}>
          {experimentSteps.map((step) => (
            <View
              key={step.id}
              style={[
                styles.progressStep,
                currentStep >= step.id && { backgroundColor: theme.colors.primary }
              ]}
            />
          ))}
        </View>
        <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
          Step {currentStep} of {experimentSteps.length}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stepHeader}>
          <Text style={[styles.stepNumber, { color: theme.colors.primary }]}>
            {experimentSteps[currentStep - 1].id}
          </Text>
          <View style={styles.stepInfo}>
            <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
              {experimentSteps[currentStep - 1].title}
            </Text>
            <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
              {experimentSteps[currentStep - 1].description}
            </Text>
          </View>
        </View>

        {renderStepContent()}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.card, borderTopColor: theme.colors.border }]}>
        <View style={styles.footerButtons}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={[styles.backButton, { borderColor: theme.colors.border }]}
              onPress={handleBack}
            >
              <Text style={[styles.backButtonText, { color: theme.colors.text }]}>Back</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: canProceed() && !isCreating ? theme.colors.primary : theme.colors.textSecondary }
            ]}
            onPress={handleNext}
            disabled={!canProceed() || isCreating}
          >
            {isCreating && currentStep === 6 ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {currentStep === 6 ? 'Create Experiment' : 'Next'}
                </Text>
                <ChevronRight size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  progressContainer: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  progressBar: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.radii.xs,
  },
  progressText: {
    ...theme.typography.caption,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.screenHorizontal,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sectionGap,
    gap: theme.spacing.md,
  },
  stepNumber: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    width: 48,
    height: 48,
    borderRadius: theme.radii.circle,
    backgroundColor: theme.colors.surfaceVariant,
    textAlign: 'center',
    lineHeight: 48,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.xs,
  },
  stepDescription: {
    ...theme.typography.bodyLarge,
  },
  stepContent: {
    paddingBottom: 100,
  },
  // Activity Pills Styles
  activityPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.chipGap,
    marginTop: theme.spacing.md,
  },
  activityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    gap: theme.spacing.xs,
  },
  activityPillEmoji: {
    fontSize: 16,
  },
  activityPillText: {
    ...theme.typography.body,
    fontWeight: '600' as const,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.elementGap,
  },
  optionCard: {
    width: '48%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  optionName: {
    ...theme.typography.h5,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  optionDescription: {
    ...theme.typography.caption,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  optionCategory: {
    ...theme.typography.captionSmall,
    fontWeight: '500' as const,
  },
  outcomesList: {
    gap: theme.spacing.elementGap,
  },
  outcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  outcomeEmoji: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  outcomeInfo: {
    flex: 1,
  },
  outcomeName: {
    ...theme.typography.body,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  outcomeDescription: {
    ...theme.typography.caption,
  },
  durationList: {
    gap: theme.spacing.elementGap,
  },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  durationInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  durationName: {
    ...theme.typography.body,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  durationDescription: {
    ...theme.typography.caption,
  },
  frequencyList: {
    gap: theme.spacing.elementGap,
  },
  frequencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  frequencyInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  frequencyName: {
    ...theme.typography.body,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  frequencyDescription: {
    ...theme.typography.caption,
  },
  reminderList: {
    gap: theme.spacing.elementGap,
    marginBottom: theme.spacing.screenVertical,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  reminderInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  reminderName: {
    ...theme.typography.body,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  reminderDescription: {
    ...theme.typography.caption,
  },
  timePicker: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timePickerLabel: {
    ...theme.typography.body,
    fontWeight: '500' as const,
  },
  timePickerValue: {
    ...theme.typography.body,
    fontWeight: '600' as const,
  },
  reviewCard: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.md,
  },
  reviewTitle: {
    ...theme.typography.h5,
    marginBottom: theme.spacing.md,
  },
  reviewSection: {
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  reviewLabel: {
    ...theme.typography.caption,
    marginBottom: 2,
  },
  reviewValue: {
    ...theme.typography.body,
    fontWeight: '500' as const,
  },
  footer: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: theme.spacing.elementGap,
  },
  backButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
  },
  backButtonText: {
    ...theme.typography.button,
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sectionGap,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.sm,
  },
  nextButtonText: {
    ...theme.typography.button,
    color: '#FFFFFF',
  },
  stepSubtitle: {
    ...theme.typography.body,
    marginBottom: theme.spacing.md,
  },
});