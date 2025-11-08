// Morning Check-In Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sun, Coffee, Brain, Heart, Smile, Meh, Frown, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SleepService } from '@/services/sleep.service';
import { RewardsService, POINT_VALUES } from '@/services/rewards.service';

const WIND_DOWN_SESSION_KEY = 'wind_down_session';

type Mood = 'great' | 'good' | 'okay' | 'tired' | 'groggy';

interface MoodOption {
  value: Mood;
  label: string;
  emoji: string;
  color: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { value: 'great', label: 'Energized', emoji: '😄', color: '#10B981' },
  { value: 'good', label: 'Refreshed', emoji: '😊', color: '#3B82F6' },
  { value: 'okay', label: 'Okay', emoji: '😐', color: '#F59E0B' },
  { value: 'tired', label: 'A bit tired', emoji: '😴', color: '#F97316' },
  { value: 'groggy', label: 'Groggy', emoji: '🥱', color: '#EF4444' },
];

export default function MorningCheckIn() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [wakeTime, setWakeTime] = useState('');
  const [notes, setNotes] = useState('');
  const [reflection, setReflection] = useState('');
  const [windDownSession, setWindDownSession] = useState<any>(null);
  const [sleepDuration, setSleepDuration] = useState<number | null>(null);

  useEffect(() => {
    loadWindDownSession();
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setWakeTime(currentTime);
  }, []);

  const loadWindDownSession = async () => {
    try {
      const userId = user?.id || 'guest_user';
      const key = `${WIND_DOWN_SESSION_KEY}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const session = JSON.parse(data);
        setWindDownSession(session);
        calculateSleepDuration(session.bedtime);
      }
    } catch (error) {
      console.error('Error loading wind-down session:', error);
    }
  };

  const calculateSleepDuration = (bedtime: string) => {
    try {
      const [bedHour, bedMin] = bedtime.split(':').map(Number);
      const now = new Date();
      const wakeHour = now.getHours();
      const wakeMin = now.getMinutes();

      let duration = (wakeHour * 60 + wakeMin) - (bedHour * 60 + bedMin);
      if (duration < 0) {
        duration += 24 * 60; // Add 24 hours if we crossed midnight
      }

      setSleepDuration(duration / 60);
    } catch (error) {
      console.error('Error calculating sleep duration:', error);
    }
  };

  const handleComplete = async () => {
    if (!selectedMood) {
      Alert.alert('How do you feel?', 'Please select how you feel this morning.');
      return;
    }

    try {
      const userId = user?.id || 'guest_user';
      const now = new Date();
      const date = now.toISOString().split('T')[0];

      // Map mood to quality score
      const qualityMap: { [key in Mood]: number } = {
        great: 5,
        good: 4,
        okay: 3,
        tired: 2,
        groggy: 1,
      };

      const sleepLog = {
        date,
        bedtime: windDownSession?.bedtime || '22:00',
        wake_time: wakeTime,
        hours: sleepDuration || 7,
        quality: qualityMap[selectedMood],
        waking_feeling: MOOD_OPTIONS.find(m => m.value === selectedMood)?.label || 'Okay',
      };

      await SleepService.create(sleepLog, userId);

      // Save reflection if provided
      if (reflection.trim()) {
        const reflectionKey = `sleep_reflection_${userId}_${date}`;
        await AsyncStorage.setItem(reflectionKey, reflection);
      }

      // Award points for completing morning check-in
      await RewardsService.awardPoints(
        userId,
        'sleep',
        'morning_checkin',
        POINT_VALUES.SLEEP_MORNING_CHECKIN,
        'Completed morning check-in'
      );

      // Note: Sleep streak will be automatically recalculated when dashboard loads

      // Get personalized suggestion based on mood
      const suggestion = getSuggestion(selectedMood, sleepDuration);

      Alert.alert(
        '✅ Check-In Complete',
        suggestion,
        [
          {
            text: 'View Dashboard',
            onPress: () => router.replace('/sleep-wellness' as any),
          },
        ]
      );
    } catch (error) {
      console.error('Error completing check-in:', error);
      Alert.alert('Error', 'Failed to save your check-in. Please try again.');
    }
  };

  const getSuggestion = (mood: Mood, duration: number | null): string => {
    if (mood === 'great' || mood === 'good') {
      return "Great! You're starting strong. Keep up your sleep routine tonight.";
    }

    if (!duration) {
      return "Try to stick to your sleep schedule for better rest.";
    }

    if (duration < 6) {
      return "You got less than 6 hours. Try going to bed earlier tonight.";
    }

    if (mood === 'groggy' && duration >= 7) {
      return "You slept enough but feel groggy. Consider checking your sleep environment or trying our wind-down routine.";
    }

    return "Let's work on improving your sleep quality. Check out our tips in the Content Library.";
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: theme.colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Good Morning!</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            How did you sleep?
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Sleep Summary */}
        {sleepDuration && (
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
            <Sun size={32} color={theme.colors.primary} />
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
              You slept {sleepDuration.toFixed(1)} hours
            </Text>
            {windDownSession && (
              <Text style={[styles.summaryMeta, { color: theme.colors.textSecondary }]}>
                Bedtime: {windDownSession.bedtime} • Wake: {wakeTime}
              </Text>
            )}
          </View>
        )}

        {/* Mood Selection */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            How do you feel?
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Rate your morning energy level
          </Text>

          <View style={styles.moodGrid}>
            {MOOD_OPTIONS.map(option => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.moodOption,
                  {
                    backgroundColor:
                      selectedMood === option.value
                        ? option.color + '20'
                        : theme.colors.background,
                    borderColor:
                      selectedMood === option.value ? option.color : theme.colors.border,
                  },
                ]}
                onPress={() => setSelectedMood(option.value)}
              >
                <Text style={styles.moodEmoji}>{option.emoji}</Text>
                <Text
                  style={[
                    styles.moodLabel,
                    { color: selectedMood === option.value ? option.color : theme.colors.text },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Notes (Optional)
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Anything that affected your sleep?
          </Text>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="e.g., Woke up twice, room was too warm..."
            placeholderTextColor={theme.colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Reflection Prompt */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            💭 Reflection
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            What one thing helped you sleep better last night?
          </Text>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
            placeholder="e.g., Turned off screens early, did breathing exercises..."
            placeholderTextColor={theme.colors.textSecondary}
            value={reflection}
            onChangeText={setReflection}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <Text style={[styles.reflectionHint, { color: theme.colors.textSecondary }]}>
            Your reflections help us provide better insights over time
          </Text>
        </View>

        {/* Complete Button */}
        <TouchableOpacity
          style={[
            styles.completeButton,
            {
              backgroundColor: selectedMood ? theme.colors.primary : theme.colors.border,
            },
          ]}
          onPress={handleComplete}
          disabled={!selectedMood}
        >
          <Text style={styles.completeButtonText}>Complete Check-In</Text>
        </TouchableOpacity>

        {/* Quick Tips */}
        {selectedMood && (selectedMood === 'tired' || selectedMood === 'groggy') && (
          <View style={[styles.tipCard, { backgroundColor: theme.colors.warning + '20' }]}>
            <Text style={[styles.tipTitle, { color: theme.colors.text }]}>💡 Quick Tip</Text>
            <Text style={[styles.tipText, { color: theme.colors.textSecondary }]}>
              Try our evening wind-down routine tonight for better sleep quality.
            </Text>
            <TouchableOpacity
              style={[styles.tipButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/sleep-wellness/wind-down' as any)}
            >
              <Text style={styles.tipButtonText}>Start Wind-Down</Text>
            </TouchableOpacity>
          </View>
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
  summaryCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
  },
  summaryMeta: {
    fontSize: 14,
    marginTop: 8,
  },
  section: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodOption: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
  },
  reflectionHint: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  completeButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tipCard: {
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  tipButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  tipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
