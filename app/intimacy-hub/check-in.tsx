import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import { X, CheckCircle } from 'lucide-react-native';
import IntimacyHubService from '@/services/intimacyHub.service';
import Slider from '@react-native-community/slider';

type CheckinType = 'morning' | 'evening' | 'general' | 'pre_intimacy' | 'post_intimacy';

const EMOJI_SCALE = ['😫', '😟', '😐', '🙂', '😊', '😄', '🤩', '😍', '🥰', '💖'];

export default function CheckInScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const typeParam = params.type as string | undefined;
  
  // Map route param to checkin type
  const getCheckinType = (): CheckinType => {
    if (typeParam === 'pre') return 'pre_intimacy';
    if (typeParam === 'post') return 'post_intimacy';
    if (typeParam === 'evening') return 'evening';
    return 'general';
  };
  
  const [checkinType] = useState<CheckinType>(getCheckinType());
  const [mood, setMood] = useState(5);
  const [stress, setStress] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [intimacyLevel, setIntimacyLevel] = useState(5);
  const [desireLevel, setDesireLevel] = useState(5);
  const [comfortLevel, setComfortLevel] = useState(5);
  const [communicationQuality, setCommunicationQuality] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [physicalWellbeing, setPhysicalWellbeing] = useState(5);
  const [gratitudeNote, setGratitudeNote] = useState('');
  const [challengeNote, setChallengeNote] = useState('');
  const [winNote, setWinNote] = useState('');
  const [hadIntimacy, setHadIntimacy] = useState(false);
  const [intimacyType, setIntimacyType] = useState<string[]>([]);
  const [intimacySatisfaction, setIntimacySatisfaction] = useState(5);
  const [hadOrgasm, setHadOrgasm] = useState(false);
  const [initiated, setInitiated] = useState(false);
  const [duration, setDuration] = useState(15); // minutes
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      const success = await IntimacyHubService.createDailyCheckin(user.id, {
        checkin_type: checkinType,
        mood,
        stress,
        energy,
        intimacy_level: intimacyLevel,
        desire_level: desireLevel,
        comfort_level: comfortLevel,
        communication_quality: communicationQuality,
        sleep_quality: sleepQuality,
        physical_wellbeing: physicalWellbeing,
        gratitude_note: gratitudeNote || undefined,
        challenge_note: challengeNote || undefined,
        win_note: winNote || undefined,
        had_intimacy: hadIntimacy || checkinType === 'post_intimacy',
        intimacy_type: intimacyType.length > 0 ? intimacyType.join(',') : undefined,
        intimacy_satisfaction: (hadIntimacy || checkinType === 'post_intimacy') ? intimacySatisfaction : undefined,
        had_orgasm: checkinType === 'post_intimacy' ? hadOrgasm : undefined,
        initiated: checkinType === 'post_intimacy' ? initiated : undefined,
        duration: checkinType === 'post_intimacy' ? duration : undefined,
      });

      if (success) {
        Alert.alert(
          '🔥 Check-In Complete!',
          'Your daily check-in has been logged. Keep up the streak!',
          [{ text: 'Done', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', 'Failed to save check-in. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting check-in:', error);
      Alert.alert('Error', 'An error occurred while saving your check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  const SliderWithEmoji = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
  }) => (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={[styles.sliderLabel, { color: theme.colors.textPrimary }]}>{label}</Text>
        <View style={styles.sliderValue}>
          <Text style={styles.sliderEmoji}>{EMOJI_SCALE[Math.floor(value) - 1]}</Text>
          <Text style={[styles.sliderNumber, { color: theme.colors.textPrimary }]}>
            {value}/10
          </Text>
        </View>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.borderLight}
        thumbTintColor={theme.colors.primary}
      />
    </View>
  );

  const intimacyTypes = ['physical', 'emotional', 'verbal', 'quality_time'];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <X size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
            Daily Check-In
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{ opacity: submitting ? 0.5 : 1 }}
          >
            <CheckCircle size={24} color={theme.colors.success} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Check-in Type Display */}
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
              {checkinType === 'pre_intimacy' && '💭 Pre-Intimacy Check-In'}
              {checkinType === 'post_intimacy' && '💕 Post-Intimacy Check-In'}
              {checkinType === 'evening' && '🌙 Evening Wind-Down'}
              {checkinType === 'general' && '✨ General Check-In'}
            </Text>
            <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
              {checkinType === 'pre_intimacy' && 'Track your feelings and anticipation before intimacy'}
              {checkinType === 'post_intimacy' && 'Reflect on your experience and connection'}
              {checkinType === 'evening' && 'Review your day and prepare for restful sleep'}
              {checkinType === 'general' && 'Log your daily mood and well-being'}
            </Text>
          </View>

          {/* Dynamic Content Based on Check-in Type */}
          {checkinType === 'pre_intimacy' && (
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                Before Intimacy
              </Text>
              <SliderWithEmoji label="Desire Level" value={desireLevel} onChange={setDesireLevel} />
              <SliderWithEmoji label="Anticipation" value={mood} onChange={setMood} />
              <SliderWithEmoji label="Connection Feeling" value={intimacyLevel} onChange={setIntimacyLevel} />
              <SliderWithEmoji label="Comfort Level" value={comfortLevel} onChange={setComfortLevel} />
              <SliderWithEmoji label="Energy" value={energy} onChange={setEnergy} />
            </View>
          )}

          {checkinType === 'post_intimacy' && (
            <>
              <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                  After Intimacy
                </Text>
                <SliderWithEmoji label="Satisfaction" value={intimacySatisfaction} onChange={setIntimacySatisfaction} />
                <SliderWithEmoji label="Closeness Felt" value={intimacyLevel} onChange={setIntimacyLevel} />
                <SliderWithEmoji label="Emotional Connection" value={mood} onChange={setMood} />
                <SliderWithEmoji label="Physical Comfort" value={physicalWellbeing} onChange={setPhysicalWellbeing} />
                <SliderWithEmoji label="Communication Quality" value={communicationQuality} onChange={setCommunicationQuality} />
              </View>

              <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                  Session Details
                </Text>

                {/* Orgasm Toggle */}
                <TouchableOpacity
                  style={[
                    styles.intimacyToggle,
                    {
                      backgroundColor: hadOrgasm
                        ? theme.colors.primaryLight
                        : theme.colors.surfaceVariant,
                      ...theme.shadows?.small,
                    },
                  ]}
                  onPress={() => setHadOrgasm(!hadOrgasm)}
                >
                  <Text
                    style={[
                      styles.intimacyToggleText,
                      { color: hadOrgasm ? theme.colors.primary : theme.colors.textSecondary },
                    ]}
                  >
                    {hadOrgasm ? '✓ Yes, had orgasm' : 'Did you orgasm?'}
                  </Text>
                </TouchableOpacity>

                {/* Initiated Toggle */}
                <TouchableOpacity
                  style={[
                    styles.intimacyToggle,
                    {
                      backgroundColor: initiated
                        ? theme.colors.primaryLight
                        : theme.colors.surfaceVariant,
                      marginTop: 12,
                      ...theme.shadows?.small,
                    },
                  ]}
                  onPress={() => setInitiated(!initiated)}
                >
                  <Text
                    style={[
                      styles.intimacyToggleText,
                      { color: initiated ? theme.colors.primary : theme.colors.textSecondary },
                    ]}
                  >
                    {initiated ? '✓ You initiated' : 'Did you initiate?'}
                  </Text>
                </TouchableOpacity>

                {/* Duration Slider */}
                <View style={[styles.sliderContainer, { marginTop: 16 }]}>
                  <View style={styles.sliderHeader}>
                    <Text style={[styles.sliderLabel, { color: theme.colors.textPrimary }]}>
                      Duration
                    </Text>
                    <Text style={[styles.sliderNumber, { color: theme.colors.textPrimary }]}>
                      {duration} min
                    </Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={5}
                    maximumValue={120}
                    step={5}
                    value={duration}
                    onValueChange={setDuration}
                    minimumTrackTintColor={theme.colors.primary}
                    maximumTrackTintColor={theme.colors.borderLight}
                    thumbTintColor={theme.colors.primary}
                  />
                </View>
              </View>
            </>
          )}

          {checkinType === 'evening' && (
            <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                Evening Reflection
              </Text>
              <SliderWithEmoji label="Overall Mood Today" value={mood} onChange={setMood} />
              <SliderWithEmoji label="Stress Level" value={stress} onChange={setStress} />
              <SliderWithEmoji label="Connection with Partner" value={intimacyLevel} onChange={setIntimacyLevel} />
              <SliderWithEmoji label="Sleep Quality Expectation" value={sleepQuality} onChange={setSleepQuality} />
              <SliderWithEmoji label="Physical Relaxation" value={physicalWellbeing} onChange={setPhysicalWellbeing} />
            </View>
          )}

          {checkinType === 'general' && (
            <>
              {/* Mood & Well-being */}
              <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                  Mood & Well-being
                </Text>
                <SliderWithEmoji label="Mood" value={mood} onChange={setMood} />
                <SliderWithEmoji label="Stress Level" value={stress} onChange={setStress} />
                <SliderWithEmoji label="Energy" value={energy} onChange={setEnergy} />
                <SliderWithEmoji
                  label="Sleep Quality"
                  value={sleepQuality}
                  onChange={setSleepQuality}
                />
                <SliderWithEmoji
                  label="Physical Well-being"
                  value={physicalWellbeing}
                  onChange={setPhysicalWellbeing}
                />
              </View>

              {/* Intimacy Metrics */}
              <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
                  Intimacy & Connection
                </Text>
                <SliderWithEmoji
                  label="Intimacy Level"
                  value={intimacyLevel}
                  onChange={setIntimacyLevel}
                />
                <SliderWithEmoji
                  label="Desire Level"
                  value={desireLevel}
                  onChange={setDesireLevel}
                />
                <SliderWithEmoji
                  label="Comfort Level"
                  value={comfortLevel}
                  onChange={setComfortLevel}
                />
                <SliderWithEmoji
                  label="Communication Quality"
                  value={communicationQuality}
                  onChange={setCommunicationQuality}
                />
              </View>
            </>
          )}

          {/* Intimacy Event (only for general check-in) */}
          {checkinType === 'general' && (
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.textPrimary }]}>
              Intimacy Event (Optional)
            </Text>
            <TouchableOpacity
              style={[
                styles.intimacyToggle,
                {
                  backgroundColor: hadIntimacy
                    ? theme.colors.primaryLight
                    : theme.colors.surfaceVariant,
                  ...theme.shadows?.small,
                },
              ]}
              onPress={() => setHadIntimacy(!hadIntimacy)}
            >
              <Text
                style={[
                  styles.intimacyToggleText,
                  { color: hadIntimacy ? theme.colors.primary : theme.colors.textSecondary },
                ]}
              >
                {hadIntimacy ? '✓ Had intimacy today' : 'Did you have intimacy today?'}
              </Text>
            </TouchableOpacity>

            {hadIntimacy && (
              <>
                <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>
                  Type of intimacy:
                </Text>
                <View style={styles.typeButtons}>
                  {intimacyTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.intimacyTypeButton,
                        {
                          backgroundColor: intimacyType.includes(type)
                            ? theme.colors.primary
                            : theme.colors.surfaceVariant,
                        },
                      ]}
                      onPress={() => {
                        if (intimacyType.includes(type)) {
                          setIntimacyType(intimacyType.filter((t) => t !== type));
                        } else {
                          setIntimacyType([...intimacyType, type]);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.intimacyTypeText,
                          {
                            color: intimacyType.includes(type)
                              ? theme.colors.textPrimary
                              : theme.colors.textSecondary,
                          },
                        ]}
                      >
                        {type.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <SliderWithEmoji
                  label="Satisfaction"
                  value={intimacySatisfaction}
                  onChange={setIntimacySatisfaction}
                />
              </>
            )}
          </View>
          )}


          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.colors.primary, opacity: submitting ? 0.5 : 1 },
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            <Text style={[styles.submitButtonText, { color: theme.colors.textPrimary }]}>
              {submitting ? 'Saving...' : '🔥 Complete Check-In'}
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  sliderValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sliderEmoji: {
    fontSize: 24,
  },
  sliderNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  intimacyToggle: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  intimacyToggleText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  intimacyTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  intimacyTypeText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 8,
  },
  textInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
