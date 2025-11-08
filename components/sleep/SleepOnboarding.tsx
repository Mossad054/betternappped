import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Moon,
  ChevronRight,
  ChevronLeft,
  Check,
  Clock,
  Sparkles,
  Volume2,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SleepOnboardingProps {
  onComplete: () => void;
}

interface SleepProfile {
  primaryChallenge: string;
  weekdayBedtime: string;
  weekdayWakeTime: string;
  weekendBedtime: string;
  weekendWakeTime: string;
  targetSleepHours: number;
  consistencyTarget: number;
  noiseLevel: string;
  lightLevel: string;
  temperature: string;
  bedSharing: string;
  caffeineTime: string;
  alcoholTime: string;
  screenTime: string;
  napFrequency: string;
  napTime: string;
  audioStyle: string[];
  voicePreference: string;
  language: string;
  trackLength: string;
  dataConsent: boolean;
}

const SLEEP_PROFILE_KEY = 'sleep_profile';

export default function SleepOnboarding({ onComplete }: SleepOnboardingProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<SleepProfile>({
    primaryChallenge: '',
    weekdayBedtime: '23:00',
    weekdayWakeTime: '07:00',
    weekendBedtime: '00:00',
    weekendWakeTime: '08:00',
    targetSleepHours: 8,
    consistencyTarget: 30,
    noiseLevel: 'quiet',
    lightLevel: 'dark',
    temperature: 'comfortable',
    bedSharing: 'alone',
    caffeineTime: '16:00',
    alcoholTime: 'none',
    screenTime: '1hour',
    napFrequency: 'never',
    napTime: 'none',
    audioStyle: [],
    voicePreference: 'female',
    language: 'English',
    trackLength: '20min',
    dataConsent: false,
  });

  const challenges = [
    { id: 'fall-asleep', label: 'I take too long to fall asleep', icon: '😴' },
    { id: 'wake-night', label: 'I wake up in the night', icon: '🌙' },
    { id: 'sleep-late', label: 'I sleep late and wake late', icon: '🦉' },
    { id: 'tired', label: 'I wake up feeling tired', icon: '😫' },
  ];

  const audioStyles = [
    { id: 'nature', label: 'Nature Sounds', icon: '🌲' },
    { id: 'meditation', label: 'Guided Meditation', icon: '🧘' },
    { id: 'story', label: 'Bedtime Stories', icon: '📖' },
    { id: 'ambient', label: 'Ambient Noise', icon: '🎵' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const userId = user?.id || 'guest_user';
      const key = `${SLEEP_PROFILE_KEY}_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(profile));
      onComplete();
    } catch (error) {
      console.error('Error saving sleep profile:', error);
    }
  };

  const toggleAudioStyle = (styleId: string) => {
    const newStyles = profile.audioStyle.includes(styleId)
      ? profile.audioStyle.filter(s => s !== styleId)
      : [...profile.audioStyle, styleId];
    setProfile({ ...profile, audioStyle: newStyles });
  };

  const steps = [
    // Step 0: Welcome
    <View key="welcome" style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Moon size={64} color={theme.colors.primary} />
      </View>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Welcome to Sleep Wellness Hub
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        Let's personalize your sleep journey. This will take about 3 minutes.
      </Text>
      <View style={styles.benefitsList}>
        <View style={styles.benefitItem}>
          <Check size={20} color={theme.colors.primary} />
          <Text style={[styles.benefitText, { color: theme.colors.text }]}>
            Track your sleep patterns
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Check size={20} color={theme.colors.primary} />
          <Text style={[styles.benefitText, { color: theme.colors.text }]}>
            Get personalized insights
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Check size={20} color={theme.colors.primary} />
          <Text style={[styles.benefitText, { color: theme.colors.text }]}>
            Build better sleep habits
          </Text>
        </View>
      </View>
    </View>,

    // Step 1: Primary Challenge
    <View key="challenge" style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        What's your primary sleep challenge?
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        Choose the one that best describes your situation
      </Text>
      <View style={styles.optionsGrid}>
        {challenges.map((challenge) => (
          <TouchableOpacity
            key={challenge.id}
            style={[
              styles.optionCard,
              {
                backgroundColor: profile.primaryChallenge === challenge.id
                  ? theme.colors.primary
                  : theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setProfile({ ...profile, primaryChallenge: challenge.id })}
          >
            <Text style={styles.optionEmoji}>{challenge.icon}</Text>
            <Text
              style={[
                styles.optionLabel,
                {
                  color: profile.primaryChallenge === challenge.id
                    ? '#FFFFFF'
                    : theme.colors.text,
                },
              ]}
            >
              {challenge.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>,

    // Step 2: Sleep Schedule
    <View key="schedule" style={styles.stepContainer}>
      <Clock size={32} color={theme.colors.primary} />
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Your Typical Sleep Schedule
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        When do you usually go to bed and wake up?
      </Text>
      
      <View style={styles.scheduleSection}>
        <Text style={[styles.scheduleLabel, { color: theme.colors.text }]}>Weekdays</Text>
        <View style={styles.timeRow}>
          <View style={styles.timeInput}>
            <Text style={[styles.timeLabel, { color: theme.colors.textSecondary }]}>Bedtime</Text>
            <TextInput
              style={[styles.timeField, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
              value={profile.weekdayBedtime}
              onChangeText={(text) => setProfile({ ...profile, weekdayBedtime: text })}
              placeholder="23:00"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
          <View style={styles.timeInput}>
            <Text style={[styles.timeLabel, { color: theme.colors.textSecondary }]}>Wake time</Text>
            <TextInput
              style={[styles.timeField, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
              value={profile.weekdayWakeTime}
              onChangeText={(text) => setProfile({ ...profile, weekdayWakeTime: text })}
              placeholder="07:00"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>
      </View>

      <View style={styles.scheduleSection}>
        <Text style={[styles.scheduleLabel, { color: theme.colors.text }]}>Weekends</Text>
        <View style={styles.timeRow}>
          <View style={styles.timeInput}>
            <Text style={[styles.timeLabel, { color: theme.colors.textSecondary }]}>Bedtime</Text>
            <TextInput
              style={[styles.timeField, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
              value={profile.weekendBedtime}
              onChangeText={(text) => setProfile({ ...profile, weekendBedtime: text })}
              placeholder="00:00"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
          <View style={styles.timeInput}>
            <Text style={[styles.timeLabel, { color: theme.colors.textSecondary }]}>Wake time</Text>
            <TextInput
              style={[styles.timeField, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
              value={profile.weekendWakeTime}
              onChangeText={(text) => setProfile({ ...profile, weekendWakeTime: text })}
              placeholder="08:00"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>
      </View>
    </View>,

    // Step 3: Sleep Environment
    <View key="environment" style={styles.stepContainer}>
      <Text style={styles.stepEmoji}>🏠</Text>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Your Sleep Environment
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        Tell us about your bedroom conditions
      </Text>

      <View style={styles.questionSection}>
        <Text style={[styles.questionLabel, { color: theme.colors.text }]}>Noise Level</Text>
        <View style={styles.optionsRow}>
          {[
            { id: 'silent', label: 'Silent', icon: '🤫' },
            { id: 'quiet', label: 'Quiet', icon: '😌' },
            { id: 'moderate', label: 'Moderate', icon: '🎵' },
            { id: 'noisy', label: 'Noisy', icon: '📢' },
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.smallOption,
                {
                  backgroundColor: profile.noiseLevel === option.id
                    ? theme.colors.primary
                    : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setProfile({ ...profile, noiseLevel: option.id })}
            >
              <Text style={styles.smallOptionEmoji}>{option.icon}</Text>
              <Text
                style={[
                  styles.smallOptionText,
                  {
                    color: profile.noiseLevel === option.id
                      ? '#FFFFFF'
                      : theme.colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionSection}>
        <Text style={[styles.questionLabel, { color: theme.colors.text }]}>Light Exposure</Text>
        <View style={styles.optionsRow}>
          {[
            { id: 'dark', label: 'Very Dark', icon: '🌑' },
            { id: 'dim', label: 'Dim', icon: '🌘' },
            { id: 'moderate', label: 'Some Light', icon: '🌗' },
            { id: 'bright', label: 'Bright', icon: '💡' },
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.smallOption,
                {
                  backgroundColor: profile.lightLevel === option.id
                    ? theme.colors.primary
                    : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setProfile({ ...profile, lightLevel: option.id })}
            >
              <Text style={styles.smallOptionEmoji}>{option.icon}</Text>
              <Text
                style={[
                  styles.smallOptionText,
                  {
                    color: profile.lightLevel === option.id
                      ? '#FFFFFF'
                      : theme.colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionSection}>
        <Text style={[styles.questionLabel, { color: theme.colors.text }]}>Temperature</Text>
        <View style={styles.optionsRow}>
          {[
            { id: 'cold', label: 'Too Cold', icon: '🥶' },
            { id: 'comfortable', label: 'Comfortable', icon: '😊' },
            { id: 'warm', label: 'Too Warm', icon: '🥵' },
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.smallOption,
                {
                  backgroundColor: profile.temperature === option.id
                    ? theme.colors.primary
                    : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setProfile({ ...profile, temperature: option.id })}
            >
              <Text style={styles.smallOptionEmoji}>{option.icon}</Text>
              <Text
                style={[
                  styles.smallOptionText,
                  {
                    color: profile.temperature === option.id
                      ? '#FFFFFF'
                      : theme.colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionSection}>
        <Text style={[styles.questionLabel, { color: theme.colors.text }]}>Bed Sharing</Text>
        <View style={styles.optionsRow}>
          {[
            { id: 'alone', label: 'Sleep Alone', icon: '🛏️' },
            { id: 'partner', label: 'With Partner', icon: '💑' },
            { id: 'children', label: 'With Children', icon: '👨‍👩‍👧' },
            { id: 'pets', label: 'With Pets', icon: '🐕' },
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.smallOption,
                {
                  backgroundColor: profile.bedSharing === option.id
                    ? theme.colors.primary
                    : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setProfile({ ...profile, bedSharing: option.id })}
            >
              <Text style={styles.smallOptionEmoji}>{option.icon}</Text>
              <Text
                style={[
                  styles.smallOptionText,
                  {
                    color: profile.bedSharing === option.id
                      ? '#FFFFFF'
                      : theme.colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>,

    // Step 4: Evening Behavior
    <View key="behavior" style={styles.stepContainer}>
      <Text style={styles.stepEmoji}>☕</Text>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Evening Habits
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        These can affect your sleep quality
      </Text>

      <View style={styles.questionSection}>
        <Text style={[styles.questionLabel, { color: theme.colors.text }]}>
          Last Caffeine Intake (usually)
        </Text>
        <View style={styles.optionsRow}>
          {[
            { id: 'none', label: 'No Caffeine', icon: '🚫' },
            { id: '12:00', label: 'Noon', icon: '☕' },
            { id: '16:00', label: '4 PM', icon: '☕' },
            { id: '20:00', label: '8 PM', icon: '☕' },
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.smallOption,
                {
                  backgroundColor: profile.caffeineTime === option.id
                    ? theme.colors.primary
                    : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setProfile({ ...profile, caffeineTime: option.id })}
            >
              <Text style={styles.smallOptionEmoji}>{option.icon}</Text>
              <Text
                style={[
                  styles.smallOptionText,
                  {
                    color: profile.caffeineTime === option.id
                      ? '#FFFFFF'
                      : theme.colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionSection}>
        <Text style={[styles.questionLabel, { color: theme.colors.text }]}>
          Alcohol Consumption
        </Text>
        <View style={styles.optionsRow}>
          {[
            { id: 'none', label: 'None', icon: '🚫' },
            { id: 'occasional', label: 'Occasional', icon: '🍷' },
            { id: 'evening', label: 'Most Evenings', icon: '🍻' },
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.smallOption,
                {
                  backgroundColor: profile.alcoholTime === option.id
                    ? theme.colors.primary
                    : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setProfile({ ...profile, alcoholTime: option.id })}
            >
              <Text style={styles.smallOptionEmoji}>{option.icon}</Text>
              <Text
                style={[
                  styles.smallOptionText,
                  {
                    color: profile.alcoholTime === option.id
                      ? '#FFFFFF'
                      : theme.colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionSection}>
        <Text style={[styles.questionLabel, { color: theme.colors.text }]}>
          Screen Time Before Bed
        </Text>
        <View style={styles.optionsRow}>
          {[
            { id: 'none', label: 'None', icon: '📵' },
            { id: '30min', label: '< 30 min', icon: '📱' },
            { id: '1hour', label: '1 hour', icon: '📱' },
            { id: '2hours', label: '2+ hours', icon: '📱' },
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.smallOption,
                {
                  backgroundColor: profile.screenTime === option.id
                    ? theme.colors.primary
                    : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setProfile({ ...profile, screenTime: option.id })}
            >
              <Text style={styles.smallOptionEmoji}>{option.icon}</Text>
              <Text
                style={[
                  styles.smallOptionText,
                  {
                    color: profile.screenTime === option.id
                      ? '#FFFFFF'
                      : theme.colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.questionSection}>
        <Text style={[styles.questionLabel, { color: theme.colors.text }]}>
          Daytime Naps
        </Text>
        <View style={styles.optionsRow}>
          {[
            { id: 'never', label: 'Never', icon: '🚫' },
            { id: 'occasional', label: 'Occasional', icon: '😴' },
            { id: 'daily', label: 'Daily', icon: '😴' },
          ].map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.smallOption,
                {
                  backgroundColor: profile.napFrequency === option.id
                    ? theme.colors.primary
                    : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setProfile({ ...profile, napFrequency: option.id })}
            >
              <Text style={styles.smallOptionEmoji}>{option.icon}</Text>
              <Text
                style={[
                  styles.smallOptionText,
                  {
                    color: profile.napFrequency === option.id
                      ? '#FFFFFF'
                      : theme.colors.text,
                  },
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {profile.napFrequency !== 'never' && (
        <View style={styles.questionSection}>
          <Text style={[styles.questionLabel, { color: theme.colors.text }]}>
            Usual Nap Time
          </Text>
          <View style={styles.optionsRow}>
            {[
              { id: 'morning', label: 'Morning', icon: '🌅' },
              { id: 'afternoon', label: 'Afternoon', icon: '☀️' },
              { id: 'evening', label: 'Evening', icon: '🌆' },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.smallOption,
                  {
                    backgroundColor: profile.napTime === option.id
                      ? theme.colors.primary
                      : theme.colors.card,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={() => setProfile({ ...profile, napTime: option.id })}
              >
                <Text style={styles.smallOptionEmoji}>{option.icon}</Text>
                <Text
                  style={[
                    styles.smallOptionText,
                    {
                      color: profile.napTime === option.id
                        ? '#FFFFFF'
                        : theme.colors.text,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>,

    // Step 5: Sleep Goals
    <View key="goals" style={styles.stepContainer}>
      <Sparkles size={32} color={theme.colors.primary} />
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Your Sleep Goals
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        How much sleep are you aiming for?
      </Text>

      <View style={styles.sliderSection}>
        <Text style={[styles.sliderLabel, { color: theme.colors.text }]}>
          Target Sleep Hours: {profile.targetSleepHours}h
        </Text>
        <View style={styles.hoursButtons}>
          {[6, 7, 8, 9].map((hours) => (
            <TouchableOpacity
              key={hours}
              style={[
                styles.hourButton,
                {
                  backgroundColor: profile.targetSleepHours === hours
                    ? theme.colors.primary
                    : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setProfile({ ...profile, targetSleepHours: hours })}
            >
              <Text
                style={[
                  styles.hourButtonText,
                  {
                    color: profile.targetSleepHours === hours
                      ? '#FFFFFF'
                      : theme.colors.text,
                  },
                ]}
              >
                {hours}h
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.sliderSection}>
        <Text style={[styles.sliderLabel, { color: theme.colors.text }]}>
          Bedtime Consistency Target: ±{profile.consistencyTarget} minutes
        </Text>
        <View style={styles.hoursButtons}>
          {[15, 30, 45, 60].map((mins) => (
            <TouchableOpacity
              key={mins}
              style={[
                styles.hourButton,
                {
                  backgroundColor: profile.consistencyTarget === mins
                    ? theme.colors.primary
                    : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setProfile({ ...profile, consistencyTarget: mins })}
            >
              <Text
                style={[
                  styles.hourButtonText,
                  {
                    color: profile.consistencyTarget === mins
                      ? '#FFFFFF'
                      : theme.colors.text,
                  },
                ]}
              >
                ±{mins}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>,

    // Step 6: Audio Preferences
    <View key="audio" style={styles.stepContainer}>
      <Volume2 size={32} color={theme.colors.primary} />
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Wind-Down Audio Preferences
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        Select all that interest you
      </Text>
      <View style={styles.optionsGrid}>
        {audioStyles.map((style) => (
          <TouchableOpacity
            key={style.id}
            style={[
              styles.optionCard,
              {
                backgroundColor: profile.audioStyle.includes(style.id)
                  ? theme.colors.primary
                  : theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => toggleAudioStyle(style.id)}
          >
            <Text style={styles.optionEmoji}>{style.icon}</Text>
            <Text
              style={[
                styles.optionLabel,
                {
                  color: profile.audioStyle.includes(style.id)
                    ? '#FFFFFF'
                    : theme.colors.text,
                },
              ]}
            >
              {style.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.languageSection}>
        <Text style={[styles.sliderLabel, { color: theme.colors.text }]}>
          Voice Preference (for guided content)
        </Text>
        <View style={styles.hoursButtons}>
          {['Female', 'Male', 'Neutral'].map((voice) => (
            <TouchableOpacity
              key={voice}
              style={[
                styles.hourButton,
                {
                  backgroundColor: profile.voicePreference === voice.toLowerCase()
                    ? theme.colors.primary
                    : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setProfile({ ...profile, voicePreference: voice.toLowerCase() })}
            >
              <Text
                style={[
                  styles.hourButtonText,
                  {
                    color: profile.voicePreference === voice.toLowerCase()
                      ? '#FFFFFF'
                      : theme.colors.text,
                  },
                ]}
              >
                {voice}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.languageSection}>
        <Text style={[styles.sliderLabel, { color: theme.colors.text }]}>
          Language Preference
        </Text>
        <View style={styles.hoursButtons}>
          {['English', 'Swahili'].map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.hourButton,
                {
                  backgroundColor: profile.language === lang
                    ? theme.colors.primary
                    : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setProfile({ ...profile, language: lang })}
            >
              <Text
                style={[
                  styles.hourButtonText,
                  {
                    color: profile.language === lang
                      ? '#FFFFFF'
                      : theme.colors.text,
                  },
                ]}
              >
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.languageSection}>
        <Text style={[styles.sliderLabel, { color: theme.colors.text }]}>
          Preferred Track Length
        </Text>
        <View style={styles.hoursButtons}>
          {['10min', '20min', '30min', 'full'].map((length) => (
            <TouchableOpacity
              key={length}
              style={[
                styles.hourButton,
                {
                  backgroundColor: profile.trackLength === length
                    ? theme.colors.primary
                    : theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => setProfile({ ...profile, trackLength: length })}
            >
              <Text
                style={[
                  styles.hourButtonText,
                  {
                    color: profile.trackLength === length
                      ? '#FFFFFF'
                      : theme.colors.text,
                  },
                ]}
              >
                {length === 'full' ? 'Full Night' : length}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>,

    // Step 7: Data Consent
    <View key="consent" style={styles.stepContainer}>
      <Text style={styles.stepEmoji}>🔒</Text>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Privacy & Data Usage
      </Text>
      <View style={[styles.consentCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.consentText, { color: theme.colors.text }]}>
          <Text style={{ fontWeight: '700' }}>Important:</Text> This app provides general sleep education and tracking. It is not a substitute for professional medical advice.
        </Text>
        <Text style={[styles.consentText, { color: theme.colors.text, marginTop: 12 }]}>
          If you have chronic sleep issues or sleep disorders, please consult a healthcare provider.
        </Text>
        <Text style={[styles.consentText, { color: theme.colors.text, marginTop: 12 }]}>
          We'll use your data to:
        </Text>
        <Text style={[styles.consentText, { color: theme.colors.text }]}>
          • Track your sleep patterns{'\n'}
          • Generate personalized insights{'\n'}
          • Suggest helpful habits{'\n'}
          • Improve your overall wellness
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.consentCheckbox,
          { backgroundColor: profile.dataConsent ? theme.colors.success + '20' : theme.colors.card },
        ]}
        onPress={() => setProfile({ ...profile, dataConsent: !profile.dataConsent })}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: profile.dataConsent ? theme.colors.success : 'transparent',
              borderColor: profile.dataConsent ? theme.colors.success : theme.colors.border,
            },
          ]}
        >
          {profile.dataConsent && <Check size={16} color="#FFFFFF" />}
        </View>
        <Text style={[styles.consentCheckboxText, { color: theme.colors.text }]}>
          I understand and consent to data usage for wellness tracking
        </Text>
      </TouchableOpacity>
    </View>,

    // Step 8: Summary with Baseline Profile
    <View key="summary" style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Check size={64} color={theme.colors.success} />
      </View>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
        Your Sleep Baseline Profile
      </Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        Based on your responses, here's your personalized plan:
      </Text>
      <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.summaryHeader, { color: theme.colors.primary }]}>Sleep Goals</Text>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          🎯 Target: {profile.targetSleepHours}h per night
        </Text>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          🛏️ Weekday Bed: {profile.weekdayBedtime} → Wake: {profile.weekdayWakeTime}
        </Text>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          📊 Consistency: ±{profile.consistencyTarget} minutes from target
        </Text>
        
        <Text style={[styles.summaryHeader, { color: theme.colors.primary, marginTop: 16 }]}>
          Environment
        </Text>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          🏠 {profile.noiseLevel} noise, {profile.lightLevel} light, {profile.temperature} temperature
        </Text>
        {profile.bedSharing !== 'alone' && (
          <Text style={[styles.summaryText, { color: theme.colors.text }]}>
            👥 Sharing bed: {profile.bedSharing}
          </Text>
        )}
        
        <Text style={[styles.summaryHeader, { color: theme.colors.primary, marginTop: 16 }]}>
          Evening Habits
        </Text>
        {profile.caffeineTime !== 'none' && (
          <Text style={[styles.summaryText, { color: theme.colors.text }]}>
            ☕ Caffeine until: {profile.caffeineTime}
          </Text>
        )}
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          📱 Screen time: {profile.screenTime} before bed
        </Text>
        {profile.napFrequency !== 'never' && (
          <Text style={[styles.summaryText, { color: theme.colors.text }]}>
            😴 Naps: {profile.napFrequency} ({profile.napTime})
          </Text>
        )}
        
        <Text style={[styles.summaryHeader, { color: theme.colors.primary, marginTop: 16 }]}>
          Content Preferences
        </Text>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          🎵 Styles: {profile.audioStyle.join(', ') || 'Not selected'}
        </Text>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          🗣️ Voice: {profile.voicePreference} | Language: {profile.language}
        </Text>
        <Text style={[styles.summaryText, { color: theme.colors.text }]}>
          ⏱️ Track length: {profile.trackLength === 'full' ? 'Full night' : profile.trackLength}
        </Text>
      </View>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary, marginTop: 16 }]}>
        💡 You can recalibrate these settings anytime from Settings
      </Text>
    </View>,
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressDots}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor:
                      index === currentStep
                        ? theme.colors.primary
                        : index < currentStep
                        ? theme.colors.success
                        : theme.colors.border,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>

        {/* Current Step */}
        {steps[currentStep]}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={[styles.navContainer, { paddingBottom: insets.bottom + 20, backgroundColor: theme.colors.background }]}>
        {currentStep > 0 && (
          <TouchableOpacity
            style={[styles.backButton, { borderColor: theme.colors.border }]}
            onPress={handleBack}
          >
            <ChevronLeft size={20} color={theme.colors.text} />
            <Text style={[styles.backButtonText, { color: theme.colors.text }]}>Back</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.nextButton,
            {
              backgroundColor:
                (currentStep === 1 && !profile.primaryChallenge) ||
                (currentStep === 7 && !profile.dataConsent)
                  ? theme.colors.border
                  : theme.colors.primary,
            },
          ]}
          onPress={handleNext}
          disabled={
            (currentStep === 1 && !profile.primaryChallenge) ||
            (currentStep === 7 && !profile.dataConsent)
          }
        >
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
  },
  progressContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  stepContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  benefitsList: {
    gap: 16,
    width: '100%',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitText: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  optionCard: {
    width: '47%',
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  optionEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  scheduleSection: {
    width: '100%',
    marginBottom: 24,
  },
  scheduleLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  timeField: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sliderSection: {
    width: '100%',
    marginBottom: 24,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  hoursButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  hourButton: {
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  hourButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  languageSection: {
    width: '100%',
    marginTop: 24,
  },
  summaryCard: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    gap: 12,
  },
  summaryHeader: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  stepEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  questionSection: {
    width: '100%',
    marginBottom: 24,
  },
  questionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  smallOption: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    alignItems: 'center',
    minWidth: '22%',
    flexGrow: 1,
  },
  smallOptionEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  smallOptionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  consentCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: '100%',
  },
  consentText: {
    fontSize: 14,
    lineHeight: 22,
  },
  consentCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    width: '100%',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentCheckboxText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    lineHeight: 22,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
