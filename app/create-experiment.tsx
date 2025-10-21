import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
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
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [selectedFrequency, setSelectedFrequency] = useState<string>('');
  const [selectedReminderType, setSelectedReminderType] = useState<string>('');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [customActivity, setCustomActivity] = useState('');

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

  const handleSave = () => {
    Alert.alert(
      'Experiment Created!',
      'Your experiment has been saved and is now active. You\'ll receive reminders to track your progress.',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
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
            <View style={styles.optionsGrid}>
              {activityOptions.map((activity) => (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.optionCard,
                    { backgroundColor: theme.colors.card },
                    selectedActivity === activity.id && { borderColor: theme.colors.primary, borderWidth: 2 }
                  ]}
                  onPress={() => setSelectedActivity(activity.id)}
                >
                  <Text style={styles.optionEmoji}>{activity.emoji}</Text>
                  <Text style={[styles.optionName, { color: theme.colors.text }]}>{activity.name}</Text>
                  <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>{activity.description}</Text>
                  <Text style={[styles.optionCategory, { color: theme.colors.primary }]}>{activity.category}</Text>
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
                    <Check size={20} color={theme.colors.primary} />
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
                  <Calendar size={24} color={theme.colors.primary} />
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
                  <Clock size={24} color={theme.colors.primary} />
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
                  <Bell size={24} color={theme.colors.primary} />
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
            <View style={[styles.reviewCard, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.reviewTitle, { color: theme.colors.text }]}>Experiment Summary</Text>
              
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
              { backgroundColor: canProceed() ? theme.colors.primary : theme.colors.textSecondary }
            ]}
            onPress={handleNext}
            disabled={!canProceed()}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === 6 ? 'Create Experiment' : 'Next'}
            </Text>
            <ChevronRight size={20} color="#FFFFFF" />
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
  headerButton: {
    padding: 8,
    marginLeft: -8,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 16,
  },
  stepNumber: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    textAlign: 'center',
    lineHeight: 48,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 16,
  },
  stepContent: {
    paddingBottom: 100,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  optionName: {
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  optionCategory: {
    fontSize: 10,
    fontWeight: '500' as const,
  },
  outcomesList: {
    gap: 12,
  },
  outcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  outcomeEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  outcomeInfo: {
    flex: 1,
  },
  outcomeName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  outcomeDescription: {
    fontSize: 14,
  },
  durationList: {
    gap: 12,
  },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  durationInfo: {
    flex: 1,
    marginLeft: 16,
  },
  durationName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  durationDescription: {
    fontSize: 14,
  },
  frequencyList: {
    gap: 12,
  },
  frequencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  frequencyInfo: {
    flex: 1,
    marginLeft: 16,
  },
  frequencyName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  frequencyDescription: {
    fontSize: 14,
  },
  reminderList: {
    gap: 12,
    marginBottom: 20,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  reminderInfo: {
    flex: 1,
    marginLeft: 16,
  },
  reminderName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 14,
  },
  timePicker: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timePickerLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  timePickerValue: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  reviewCard: {
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
  },
  reviewTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginBottom: 20,
  },
  reviewSection: {
    marginBottom: 16,
  },
  reviewLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  nextButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});
