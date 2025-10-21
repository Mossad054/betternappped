import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';

import { Stack, router } from 'expo-router';
import {
  X,
  Calendar,
  Heart,
  Moon,
  Brain,
  Check,
  ChevronDown,
  ChevronUp,
  Smile,
  TrendingUp,
  Activity,
  Sparkles,
} from 'lucide-react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface MoodOption {
  id: number;
  label: string;
  emoji: string;
  selected: boolean;
}

interface EmotionTrigger {
  emotion: string;
  hasTrigger: 'yes' | 'no' | 'unsure' | null;
  triggerText: string;
}

interface ActivityCategory {
  id: string;
  name: string;
  emoji: string;
  items: ActivityItem[];
  expanded: boolean;
}

interface ActivityItem {
  id: string;
  name: string;
  selected: boolean;
  followUpQuestion?: string;
  followUpAnswer?: string;
}

interface IntimacyData {
  type: 'solo' | 'couple';
  orgasm: boolean;
  location: string;
  toyUsed: boolean;
  timeToSleep: number;
  moodBefore: number;
  moodAfter: number;
}

interface SleepData {
  bedtime: Date;
  wakeTime: Date;
  quality: number;
  wakingFeeling: string;
}

const moodOptions: MoodOption[] = [
  { id: 1, label: 'Happy', emoji: '😊', selected: false },
  { id: 2, label: 'Sad', emoji: '😔', selected: false },
  { id: 3, label: 'Angry', emoji: '😠', selected: false },
  { id: 4, label: 'Bored', emoji: '😐', selected: false },
  { id: 5, label: 'Tired', emoji: '😴', selected: false },
  { id: 6, label: 'Relaxed', emoji: '😌', selected: false },
  { id: 7, label: 'Excited', emoji: '🤩', selected: false },
  { id: 8, label: 'Desperate', emoji: '😩', selected: false },
  { id: 9, label: 'Stressed', emoji: '😫', selected: false },
  { id: 10, label: 'Anxious', emoji: '😰', selected: false },
  { id: 11, label: 'Unsure', emoji: '🤔', selected: false },
  { id: 12, label: 'Content', emoji: '🙂', selected: false },
  { id: 13, label: 'Grateful', emoji: '🙏', selected: false },
];

const defaultActivityCategories: ActivityCategory[] = [
  {
    id: 'beauty',
    name: 'Beauty',
    emoji: '💅',
    expanded: false,
    items: [
      { id: 'salon', name: 'Salon', selected: false, followUpQuestion: 'Where did you go?' },
      { id: 'haircut', name: 'Haircut', selected: false, followUpQuestion: 'Where did you get it?' },
      { id: 'skincare', name: 'Skincare', selected: false },
    ],
  },
  {
    id: 'betterme',
    name: 'BetterMe',
    emoji: '🌿',
    expanded: false,
    items: [
      { id: 'meditation', name: 'Meditation', selected: false, followUpQuestion: 'How long did you meditate?' },
      { id: 'journaling', name: 'Journaling', selected: false },
      { id: 'learning', name: 'Learning', selected: false, followUpQuestion: 'What did you learn?' },
      { id: 'yoga', name: 'Yoga', selected: false, followUpQuestion: 'How long was your session?' },
      { id: 'reflection', name: 'Reflection', selected: false },
    ],
  },
  {
    id: 'health',
    name: 'Health',
    emoji: '❤️',
    expanded: false,
    items: [
      { id: 'gym', name: 'Gym', selected: false, followUpQuestion: 'How long was your workout?' },
      { id: 'doctor', name: 'Doctor visit', selected: false },
      { id: 'medication', name: 'Medication', selected: false },
      { id: 'walk', name: 'Walk', selected: false, followUpQuestion: 'How long did you walk?' },
    ],
  },
  {
    id: 'places',
    name: 'Places',
    emoji: '📍',
    expanded: false,
    items: [
      { id: 'work', name: 'Work', selected: false, followUpQuestion: 'How was your experience at work today?' },
      { id: 'park', name: 'Park', selected: false },
      { id: 'home', name: 'Home', selected: false },
      { id: 'friends', name: "Friend's place", selected: false },
      { id: 'outdoors', name: 'Outdoors', selected: false },
    ],
  },
  {
    id: 'chores',
    name: 'Chores',
    emoji: '🧺',
    expanded: false,
    items: [
      { id: 'laundry', name: 'Laundry', selected: false },
      { id: 'cleaning', name: 'Cleaning', selected: false, followUpQuestion: 'Did you feel accomplished afterwards?' },
      { id: 'shopping', name: 'Shopping', selected: false },
      { id: 'repairs', name: 'Repairs', selected: false },
    ],
  },
  {
    id: 'intimacy',
    name: 'Intimacy',
    emoji: '💞',
    expanded: false,
    items: [
      { id: 'intimacy-activity', name: 'Intimacy Activity', selected: false },
    ],
  },
];

const productivityFactors = [
  { id: 'social-media', label: 'Social media', emoji: '📱' },
  { id: 'meetings', label: 'Meetings', emoji: '👥' },
  { id: 'good-sleep', label: 'Good sleep', emoji: '😴' },
  { id: 'distractions', label: 'Distractions', emoji: '🔕' },
  { id: 'motivation', label: 'Motivation', emoji: '💪' },
  { id: 'coffee', label: 'Coffee', emoji: '☕' },
  { id: 'noise', label: 'Noise', emoji: '🔊' },
  { id: 'exercise', label: 'Exercise', emoji: '🏃' },
  { id: 'mental-clarity', label: 'Mental clarity', emoji: '🧠' },
];

const wakingFeelings = ['Refreshed', 'Tired', 'Foggy', 'Energized', 'Groggy', 'Alert'];

export default function AddEntryScreen() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const [moodCardExpanded, setMoodCardExpanded] = useState<boolean>(true);
  const [moods, setMoods] = useState<MoodOption[]>(moodOptions);

  const [emotionsCardExpanded, setEmotionsCardExpanded] = useState<boolean>(false);
  const [emotionTriggers, setEmotionTriggers] = useState<EmotionTrigger[]>([]);

  const [activitiesCardExpanded, setActivitiesCardExpanded] = useState<boolean>(false);
  const [activityCategories, setActivityCategories] = useState<ActivityCategory[]>(defaultActivityCategories);

  const [productivityCardExpanded, setProductivityCardExpanded] = useState<boolean>(false);
  const [productivityRating, setProductivityRating] = useState<number>(3);
  const [focusedHours, setFocusedHours] = useState<string>('');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [otherFactor, setOtherFactor] = useState<string>('');

  const [intimacyCardExpanded, setIntimacyCardExpanded] = useState<boolean>(false);
  const [intimacyData, setIntimacyData] = useState<IntimacyData>({
    type: 'solo',
    orgasm: false,
    location: '',
    toyUsed: false,
    timeToSleep: 0,
    moodBefore: 3,
    moodAfter: 3,
  });

  const [sleepData, setSleepData] = useState<SleepData>({
    bedtime: new Date(),
    wakeTime: new Date(),
    quality: 3,
    wakingFeeling: 'Refreshed',
  });
  const [showBedtimePicker, setShowBedtimePicker] = useState<boolean>(false);
  const [showWakeTimePicker, setShowWakeTimePicker] = useState<boolean>(false);

  const handleMoodSelect = (moodId: number) => {
    const updatedMoods = moods.map(mood => ({
      ...mood,
      selected: mood.id === moodId ? !mood.selected : mood.selected,
    }));
    setMoods(updatedMoods);

    const selectedMood = updatedMoods.find(m => m.id === moodId);
    if (selectedMood?.selected) {
      if (!emotionTriggers.some(et => et.emotion === selectedMood.label)) {
        setEmotionTriggers(prev => [
          ...prev,
          { emotion: selectedMood.label, hasTrigger: null, triggerText: '' },
        ]);
      }
      setEmotionsCardExpanded(true);
    }
  };

  const handleTriggerResponse = (emotion: string, response: 'yes' | 'no' | 'unsure') => {
    setEmotionTriggers(prev =>
      prev.map(et => (et.emotion === emotion ? { ...et, hasTrigger: response } : et))
    );
  };

  const handleTriggerTextChange = (emotion: string, text: string) => {
    setEmotionTriggers(prev =>
      prev.map(et => (et.emotion === emotion ? { ...et, triggerText: text } : et))
    );
  };

  const toggleActivityCategory = (categoryId: string) => {
    setActivityCategories(prev =>
      prev.map(cat => ({
        ...cat,
        expanded: cat.id === categoryId ? !cat.expanded : cat.expanded,
      }))
    );
  };

  const handleActivityItemToggle = (categoryId: string, itemId: string) => {
    setActivityCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map(item =>
                item.id === itemId ? { ...item, selected: !item.selected } : item
              ),
            }
          : cat
      )
    );
  };

  const handleActivityFollowUp = (categoryId: string, itemId: string, answer: string) => {
    setActivityCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map(item =>
                item.id === itemId ? { ...item, followUpAnswer: answer } : item
              ),
            }
          : cat
      )
    );
  };

  const toggleProductivityFactor = (factorId: string) => {
    setSelectedFactors(prev =>
      prev.includes(factorId) ? prev.filter(f => f !== factorId) : [...prev, factorId]
    );
  };

  const handleSaveEntry = () => {
    const selectedMoods = moods.filter(m => m.selected);
    if (selectedMoods.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one mood.');
      return;
    }

    console.log('Saving entry:', {
      date: selectedDate.toISOString().split('T')[0],
      moods: selectedMoods,
      emotionTriggers,
      activities: activityCategories,
      productivity: {
        rating: productivityRating,
        focusedHours,
        factors: selectedFactors,
        otherFactor,
      },
      intimacy: intimacyData,
      sleep: sleepData,
    });

    Alert.alert(
      'Entry Saved!',
      'Your daily entry has been saved successfully.',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Add Entry',
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleStyle: { color: '#1F2937', fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color="#34B27B" />
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>
        </View>

        {/* CARD 1: Mood Selection */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setMoodCardExpanded(!moodCardExpanded)}
          >
            <View style={styles.cardTitleContainer}>
              <Smile size={20} color="#F59E0B" />
              <Text style={styles.cardTitle}>How are you feeling now?</Text>
            </View>
            {moodCardExpanded ? (
              <ChevronUp size={20} color="#6B7280" />
            ) : (
              <ChevronDown size={20} color="#6B7280" />
            )}
          </TouchableOpacity>

          {moodCardExpanded && (
            <View style={styles.cardContent}>
              <View style={styles.moodGrid}>
                {moods.map(mood => (
                  <TouchableOpacity
                    key={mood.id}
                    style={[styles.moodOption, mood.selected && styles.selectedMoodOption]}
                    onPress={() => handleMoodSelect(mood.id)}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={[styles.moodLabel, mood.selected && styles.selectedMoodLabel]}>
                      {mood.label}
                    </Text>
                    {mood.selected && (
                      <View style={styles.moodCheckIcon}>
                        <Check size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* CARD 2: Emotional Triggers */}
        {emotionsCardExpanded && emotionTriggers.length > 0 && (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setEmotionsCardExpanded(!emotionsCardExpanded)}
            >
              <View style={styles.cardTitleContainer}>
                <Heart size={20} color="#EC4899" />
                <Text style={styles.cardTitle}>Your emotions today</Text>
              </View>
              {emotionsCardExpanded ? (
                <ChevronUp size={20} color="#6B7280" />
              ) : (
                <ChevronDown size={20} color="#6B7280" />
              )}
            </TouchableOpacity>

            {emotionsCardExpanded && (
              <View style={styles.cardContent}>
                {emotionTriggers.map((trigger, index) => (
                  <View key={index} style={styles.emotionBlock}>
                    <Text style={styles.emotionLabel}>
                      {moods.find(m => m.label === trigger.emotion)?.emoji} {trigger.emotion}
                    </Text>
                    <Text style={styles.triggerQuestion}>
                      Do you think there is a trigger to this emotion?
                    </Text>
                    <View style={styles.triggerOptions}>
                      {(['yes', 'no', 'unsure'] as const).map(option => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.triggerOption,
                            trigger.hasTrigger === option && styles.selectedTriggerOption,
                          ]}
                          onPress={() => handleTriggerResponse(trigger.emotion, option)}
                        >
                          <Text
                            style={[
                              styles.triggerOptionText,
                              trigger.hasTrigger === option && styles.selectedTriggerOptionText,
                            ]}
                          >
                            {option === 'yes' ? '✅ Yes' : option === 'no' ? '❌ No' : "🤷 I don't know"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {trigger.hasTrigger === 'yes' && (
                      <View style={styles.triggerInputContainer}>
                        <Text style={styles.triggerInputLabel}>What triggered this feeling?</Text>
                        <TextInput
                          style={styles.triggerInput}
                          placeholder="Describe the trigger..."
                          value={trigger.triggerText}
                          onChangeText={text => handleTriggerTextChange(trigger.emotion, text)}
                          maxLength={250}
                          multiline
                          numberOfLines={3}
                        />
                        <Text style={styles.characterCount}>
                          {trigger.triggerText.length}/250
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* CARD 3: Activities & Tags */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setActivitiesCardExpanded(!activitiesCardExpanded)}
          >
            <View style={styles.cardTitleContainer}>
              <Activity size={20} color="#10B981" />
              <Text style={styles.cardTitle}>What did you do today?</Text>
            </View>
            {activitiesCardExpanded ? (
              <ChevronUp size={20} color="#6B7280" />
            ) : (
              <ChevronDown size={20} color="#6B7280" />
            )}
          </TouchableOpacity>

          {activitiesCardExpanded && (
            <View style={styles.cardContent}>
              {activityCategories.map(category => (
                <View key={category.id} style={styles.activityCategory}>
                  <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleActivityCategory(category.id)}
                  >
                    <View style={styles.categoryTitleContainer}>
                      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </View>
                    {category.expanded ? (
                      <ChevronUp size={16} color="#9CA3AF" />
                    ) : (
                      <ChevronDown size={16} color="#9CA3AF" />
                    )}
                  </TouchableOpacity>

                  {category.expanded && (
                    <View style={styles.categoryItems}>
                      {category.items.map(item => (
                        <View key={item.id} style={styles.activityItemContainer}>
                          <TouchableOpacity
                            style={[
                              styles.activityItem,
                              item.selected && styles.selectedActivityItem,
                            ]}
                            onPress={() => handleActivityItemToggle(category.id, item.id)}
                          >
                            <Text
                              style={[
                                styles.activityItemText,
                                item.selected && styles.selectedActivityItemText,
                              ]}
                            >
                              {item.name}
                            </Text>
                            {item.selected && <Check size={16} color="#FFFFFF" />}
                          </TouchableOpacity>
                          {item.selected && item.followUpQuestion && (
                            <View style={styles.followUpContainer}>
                              <Text style={styles.followUpQuestion}>{item.followUpQuestion}</Text>
                              <TextInput
                                style={styles.followUpInput}
                                placeholder="Your answer..."
                                value={item.followUpAnswer || ''}
                                onChangeText={text =>
                                  handleActivityFollowUp(category.id, item.id, text)
                                }
                              />
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* CARD 4: Productivity */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setProductivityCardExpanded(!productivityCardExpanded)}
          >
            <View style={styles.cardTitleContainer}>
              <TrendingUp size={20} color="#8B5CF6" />
              <Text style={styles.cardTitle}>Productivity</Text>
            </View>
            {productivityCardExpanded ? (
              <ChevronUp size={20} color="#6B7280" />
            ) : (
              <ChevronDown size={20} color="#6B7280" />
            )}
          </TouchableOpacity>

          {productivityCardExpanded && (
            <View style={styles.cardContent}>
              <Text style={styles.productivityQuestion}>
                How productive did you feel today?
              </Text>
              <View style={styles.ratingSlider}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingDot,
                      productivityRating === rating && styles.selectedRatingDot,
                    ]}
                    onPress={() => setProductivityRating(rating)}
                  >
                    <Text
                      style={[
                        styles.ratingText,
                        productivityRating === rating && styles.selectedRatingText,
                      ]}
                    >
                      {rating}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.ratingLabels}>
                <Text style={styles.ratingLabel}>Not productive</Text>
                <Text style={styles.ratingLabel}>Highly productive</Text>
              </View>

              <View style={styles.focusedHoursContainer}>
                <Text style={styles.focusedHoursLabel}>Focused work hours (optional)</Text>
                <TextInput
                  style={styles.focusedHoursInput}
                  placeholder="e.g., 4"
                  value={focusedHours}
                  onChangeText={setFocusedHours}
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.factorsQuestion}>
                What do you think affected your productivity?
              </Text>
              <View style={styles.factorsGrid}>
                {productivityFactors.map(factor => (
                  <TouchableOpacity
                    key={factor.id}
                    style={[
                      styles.factorChip,
                      selectedFactors.includes(factor.id) && styles.selectedFactorChip,
                    ]}
                    onPress={() => toggleProductivityFactor(factor.id)}
                  >
                    <Text style={styles.factorEmoji}>{factor.emoji}</Text>
                    <Text
                      style={[
                        styles.factorLabel,
                        selectedFactors.includes(factor.id) && styles.selectedFactorLabel,
                      ]}
                    >
                      {factor.label}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[
                    styles.factorChip,
                    selectedFactors.includes('others') && styles.selectedFactorChip,
                  ]}
                  onPress={() => toggleProductivityFactor('others')}
                >
                  <Text style={styles.factorEmoji}>➕</Text>
                  <Text
                    style={[
                      styles.factorLabel,
                      selectedFactors.includes('others') && styles.selectedFactorLabel,
                    ]}
                  >
                    Others
                  </Text>
                </TouchableOpacity>
              </View>
              {selectedFactors.includes('others') && (
                <TextInput
                  style={styles.otherFactorInput}
                  placeholder="Specify other factors..."
                  value={otherFactor}
                  onChangeText={setOtherFactor}
                />
              )}
            </View>
          )}
        </View>

        {/* CARD 5: Intimacy */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setIntimacyCardExpanded(!intimacyCardExpanded)}
          >
            <View style={styles.cardTitleContainer}>
              <Sparkles size={20} color="#EC4899" />
              <Text style={styles.cardTitle}>Intimacy</Text>
            </View>
            {intimacyCardExpanded ? (
              <ChevronUp size={20} color="#6B7280" />
            ) : (
              <ChevronDown size={20} color="#6B7280" />
            )}
          </TouchableOpacity>

          {intimacyCardExpanded && (
            <View style={styles.cardContent}>
              <View style={styles.intimacyInfoBox}>
                <Text style={styles.intimacyInfoText}>
                  💞 Intimacy improves your mood, sleep, and mental clarity.
                </Text>
              </View>

              <View style={styles.intimacyRow}>
                <Text style={styles.intimacyLabel}>Type:</Text>
                <View style={styles.toggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.toggleOption,
                      intimacyData.type === 'solo' && styles.selectedToggle,
                    ]}
                    onPress={() => setIntimacyData(prev => ({ ...prev, type: 'solo' }))}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        intimacyData.type === 'solo' && styles.selectedToggleText,
                      ]}
                    >
                      Solo
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.toggleOption,
                      intimacyData.type === 'couple' && styles.selectedToggle,
                    ]}
                    onPress={() => setIntimacyData(prev => ({ ...prev, type: 'couple' }))}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        intimacyData.type === 'couple' && styles.selectedToggleText,
                      ]}
                    >
                      Couple
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.intimacyRow}>
                <Text style={styles.intimacyLabel}>Orgasm:</Text>
                <TouchableOpacity
                  style={[
                    styles.booleanToggle,
                    intimacyData.orgasm && styles.selectedBooleanToggle,
                  ]}
                  onPress={() => setIntimacyData(prev => ({ ...prev, orgasm: !prev.orgasm }))}
                >
                  <Text
                    style={[
                      styles.booleanToggleText,
                      intimacyData.orgasm && styles.selectedBooleanToggleText,
                    ]}
                  >
                    {intimacyData.orgasm ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.intimacyRow}>
                <Text style={styles.intimacyLabel}>Location:</Text>
                <TextInput
                  style={styles.intimacyInput}
                  placeholder="e.g., home, outdoors"
                  value={intimacyData.location}
                  onChangeText={text => setIntimacyData(prev => ({ ...prev, location: text }))}
                />
              </View>

              <View style={styles.intimacyRow}>
                <Text style={styles.intimacyLabel}>Toy Used:</Text>
                <TouchableOpacity
                  style={[
                    styles.booleanToggle,
                    intimacyData.toyUsed && styles.selectedBooleanToggle,
                  ]}
                  onPress={() => setIntimacyData(prev => ({ ...prev, toyUsed: !prev.toyUsed }))}
                >
                  <Text
                    style={[
                      styles.booleanToggleText,
                      intimacyData.toyUsed && styles.selectedBooleanToggleText,
                    ]}
                  >
                    {intimacyData.toyUsed ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.intimacyRow}>
                <Text style={styles.intimacyLabel}>Time to Sleep (min):</Text>
                <TextInput
                  style={styles.intimacyInput}
                  placeholder="0"
                  value={intimacyData.timeToSleep.toString()}
                  onChangeText={text =>
                    setIntimacyData(prev => ({
                      ...prev,
                      timeToSleep: parseInt(text) || 0,
                    }))
                  }
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.moodBeforeAfter}>
                <View style={styles.moodColumn}>
                  <Text style={styles.intimacyLabel}>Mood Before:</Text>
                  <View style={styles.moodSlider}>
                    {[1, 2, 3, 4, 5].map(score => (
                      <TouchableOpacity
                        key={`before-${score}`}
                        style={[
                          styles.moodDot,
                          intimacyData.moodBefore === score && styles.selectedMoodDot,
                        ]}
                        onPress={() => setIntimacyData(prev => ({ ...prev, moodBefore: score }))}
                      >
                        <Text style={styles.moodDotText}>{score}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={styles.moodColumn}>
                  <Text style={styles.intimacyLabel}>Mood After:</Text>
                  <View style={styles.moodSlider}>
                    {[1, 2, 3, 4, 5].map(score => (
                      <TouchableOpacity
                        key={`after-${score}`}
                        style={[
                          styles.moodDot,
                          intimacyData.moodAfter === score && styles.selectedMoodDot,
                        ]}
                        onPress={() => setIntimacyData(prev => ({ ...prev, moodAfter: score }))}
                      >
                        <Text style={styles.moodDotText}>{score}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.intimacyHubButton}
                onPress={() => router.push('/intimacy-hub')}
              >
                <Heart size={18} color="#EC4899" />
                <Text style={styles.intimacyHubText}>Improve My Intimacy →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Sleep Section */}
        <View style={styles.card}>
          <View style={styles.cardTitleContainer}>
            <Moon size={20} color="#6366F1" />
            <Text style={styles.cardTitle}>Sleep</Text>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.sleepTimesContainer}>
              <View style={styles.timeContainer}>
                <Text style={styles.timeLabel}>Bedtime</Text>
                <TouchableOpacity
                  style={styles.timeSelector}
                  onPress={() => setShowBedtimePicker(true)}
                >
                  <Text style={styles.timeText}>{formatTime(sleepData.bedtime)}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.timeContainer}>
                <Text style={styles.timeLabel}>Wake Time</Text>
                <TouchableOpacity
                  style={styles.timeSelector}
                  onPress={() => setShowWakeTimePicker(true)}
                >
                  <Text style={styles.timeText}>{formatTime(sleepData.wakeTime)}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.qualityContainer}>
              <Text style={styles.qualityLabel}>Sleep Quality</Text>
              <View style={styles.qualitySlider}>
                {[1, 2, 3, 4, 5].map(quality => (
                  <TouchableOpacity
                    key={quality}
                    style={[
                      styles.qualityDot,
                      sleepData.quality === quality && styles.selectedQualityDot,
                    ]}
                    onPress={() => setSleepData(prev => ({ ...prev, quality }))}
                  >
                    <Text style={styles.qualityDotText}>{quality}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.wakingContainer}>
              <Text style={styles.wakingLabel}>How did you feel upon waking?</Text>
              <View style={styles.wakingGrid}>
                {wakingFeelings.map(feeling => (
                  <TouchableOpacity
                    key={feeling}
                    style={[
                      styles.wakingOption,
                      sleepData.wakingFeeling === feeling && styles.selectedWakingOption,
                    ]}
                    onPress={() => setSleepData(prev => ({ ...prev, wakingFeeling: feeling }))}
                  >
                    <Text
                      style={[
                        styles.wakingText,
                        sleepData.wakingFeeling === feeling && styles.selectedWakingText,
                      ]}
                    >
                      {feeling}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Mental Clarity Test */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.mentalClarityButton}
            onPress={() => router.push('/mental-clarity-test')}
          >
            <Brain size={20} color="#8B5CF6" />
            <Text style={styles.mentalClarityText}>🧠 Take Mental Clarity Test</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <View style={styles.saveContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveEntry}>
            <Text style={styles.saveButtonText}>Save Entry</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event: DateTimePickerEvent, date?: Date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {/* Bedtime Picker */}
      {showBedtimePicker && (
        <DateTimePicker
          value={sleepData.bedtime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event: DateTimePickerEvent, time?: Date) => {
            setShowBedtimePicker(false);
            if (time) setSleepData(prev => ({ ...prev, bedtime: time }));
          }}
        />
      )}

      {/* Wake Time Picker */}
      {showWakeTimePicker && (
        <DateTimePicker
          value={sleepData.wakeTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event: DateTimePickerEvent, time?: Date) => {
            setShowWakeTimePicker(false);
            if (time) setSleepData(prev => ({ ...prev, wakeTime: time }));
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  cardContent: {
    padding: 20,
    paddingTop: 0,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: 'transparent',
    width: '23%',
    position: 'relative',
  },
  selectedMoodOption: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  moodEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedMoodLabel: {
    color: '#92400E',
  },
  moodCheckIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emotionBlock: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  emotionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  triggerQuestion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  triggerOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  triggerOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  selectedTriggerOption: {
    backgroundColor: '#DBEAFE',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  triggerOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedTriggerOptionText: {
    color: '#1E40AF',
  },
  triggerInputContainer: {
    marginTop: 12,
  },
  triggerInputLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  triggerInput: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  activityCategory: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  categoryItems: {
    paddingLeft: 12,
    paddingTop: 8,
  },
  activityItemContainer: {
    marginBottom: 8,
  },
  activityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  selectedActivityItem: {
    backgroundColor: '#10B981',
  },
  activityItemText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedActivityItemText: {
    color: '#FFFFFF',
  },
  followUpContainer: {
    marginTop: 8,
    marginLeft: 12,
  },
  followUpQuestion: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  followUpInput: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 6,
    fontSize: 14,
  },
  productivityQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  ratingSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRatingDot: {
    backgroundColor: '#8B5CF6',
  },
  ratingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  selectedRatingText: {
    color: '#FFFFFF',
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  focusedHoursContainer: {
    marginBottom: 20,
  },
  focusedHoursLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  focusedHoursInput: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  factorsQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  factorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  factorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedFactorChip: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  factorEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  factorLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  selectedFactorLabel: {
    color: '#FFFFFF',
  },
  otherFactorInput: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    marginTop: 12,
  },
  intimacyInfoBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  intimacyInfoText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    fontWeight: '500',
  },
  intimacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  intimacyLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  toggleOption: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  selectedToggle: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedToggleText: {
    color: '#374151',
    fontWeight: '500',
  },
  booleanToggle: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedBooleanToggle: {
    backgroundColor: '#EC4899',
  },
  booleanToggleText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedBooleanToggleText: {
    color: '#FFFFFF',
  },
  intimacyInput: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
    minWidth: 120,
    textAlign: 'right',
  },
  moodBeforeAfter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 20,
  },
  moodColumn: {
    flex: 1,
    marginHorizontal: 8,
  },
  moodSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  moodDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMoodDot: {
    backgroundColor: '#EC4899',
  },
  moodDotText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  intimacyHubButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF2F8',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EC4899',
  },
  intimacyHubText: {
    fontSize: 15,
    color: '#EC4899',
    fontWeight: '600',
    marginLeft: 8,
  },
  sleepTimesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  timeContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  timeSelector: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  qualityContainer: {
    marginTop: 20,
  },
  qualityLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '500',
  },
  qualitySlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qualityDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedQualityDot: {
    backgroundColor: '#6366F1',
  },
  qualityDotText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  wakingContainer: {
    marginTop: 20,
  },
  wakingLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '500',
  },
  wakingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wakingOption: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedWakingOption: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  wakingText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedWakingText: {
    color: '#FFFFFF',
  },
  mentalClarityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderStyle: 'dashed',
  },
  mentalClarityText: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
    marginLeft: 12,
  },
  saveContainer: {
    padding: 20,
  },
  saveButton: {
    backgroundColor: '#34B27B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#34B27B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
