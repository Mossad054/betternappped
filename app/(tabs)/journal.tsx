import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';

import { Stack, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MoodsService } from '@/services/moods.service';
import { ActivitiesService } from '@/services/activities.service';
import { SleepService } from '@/services/sleep.service';
import { ProductivityService } from '@/services/productivity.service';
import { IntimacyService } from '@/services/intimacy.service';
import ActivityIconGrid from '@/components/ActivityIconGrid';
import ActivityDetailModal from '@/components/ActivityDetailModal';
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
  duration?: string;
}

interface IntimacyData {
  type: 'solo' | 'couple';
  timeOfDay: 'morning' | 'midday' | 'night' | null;
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
      { id: 'haircut', name: 'haircut', selected: false },
      { id: 'wellness', name: 'wellness', selected: false },
      { id: 'massage', name: 'massage', selected: false },
      { id: 'manicure', name: 'manicure', selected: false },
      { id: 'pedicure', name: 'pedicure', selected: false },
      { id: 'skincare', name: 'skin care', selected: false },
      { id: 'spa', name: 'spa', selected: false },
    ],
  },
  {
    id: 'weather',
    name: 'Weather',
    emoji: '�️',
    expanded: false,
    items: [
      { id: 'sunny', name: 'sunny', selected: false },
      { id: 'clouds', name: 'clouds', selected: false },
      { id: 'rain', name: 'rain', selected: false },
      { id: 'snow', name: 'snow', selected: false },
      { id: 'heat', name: 'heat', selected: false },
      { id: 'storm', name: 'storm', selected: false },
      { id: 'wind', name: 'wind', selected: false },
    ],
  },
  {
    id: 'chores',
    name: 'Chores',
    emoji: '🧺',
    expanded: false,
    items: [
      { id: 'shopping', name: 'shopping', selected: false },
      { id: 'cleaning', name: 'cleaning', selected: false },
      { id: 'cooking', name: 'cooking', selected: false },
      { id: 'laundry', name: 'laundry', selected: false },
    ],
  },
  {
    id: 'places',
    name: 'Places',
    emoji: '📍',
    expanded: false,
    items: [
      { id: 'home', name: 'home', selected: false },
      { id: 'work', name: 'work', selected: false },
      { id: 'school', name: 'school', selected: false },
      { id: 'visit', name: 'visit', selected: false },
      { id: 'travel', name: 'travel', selected: false },
      { id: 'gym', name: 'gym', selected: false },
      { id: 'cinema', name: 'cinema', selected: false },
      { id: 'nature', name: 'nature', selected: false },
      { id: 'vacation', name: 'vacation', selected: false },
    ],
  },
  {
    id: 'productivity',
    name: 'Productivity',
    emoji: '⚡',
    expanded: false,
    items: [
      { id: 'start-early', name: 'start early', selected: false },
      { id: 'make-list', name: 'make list', selected: false },
      { id: 'focus', name: 'focus', selected: false },
      { id: 'take-break', name: 'take a break', selected: false },
    ],
  },
  {
    id: 'betterme',
    name: 'Better Me',
    emoji: '🌿',
    expanded: false,
    items: [
      { id: 'meditation', name: 'meditation', selected: false },
      { id: 'kindness', name: 'kindness', selected: false },
      { id: 'listen', name: 'listen', selected: false },
      { id: 'donate', name: 'donate', selected: false },
    ],
  },
];

const productivityFactors = [
  { id: 'good-sleep', label: 'Good sleep', emoji: '😴' },
  { id: 'exercise', label: 'Exercise', emoji: '🏃' },
  { id: 'healthy-meals', label: 'Healthy meals', emoji: '🥗' },
  { id: 'minimal-distractions', label: 'Minimal distractions', emoji: '🔕' },
  { id: 'clear-goals', label: 'Clear goals', emoji: '🎯' },
  { id: 'motivation', label: 'Motivation', emoji: '💪' },
  { id: 'social-media', label: 'Social media', emoji: '📱' },
  { id: 'meetings', label: 'Meetings', emoji: '👥' },
  { id: 'coffee', label: 'Coffee', emoji: '☕' },
  { id: 'noise', label: 'Noise', emoji: '🔊' },
  { id: 'mental-clarity', label: 'Mental clarity', emoji: '🧠' },
];

const wakingFeelings = ['Refreshed', 'Energetic', 'Tired', 'Groggy', 'Rested'];

export default function AddEntryScreen() {
  const { user, isGuest } = useAuth();
  const { theme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const [moodCardExpanded, setMoodCardExpanded] = useState<boolean>(true);
  const [moods, setMoods] = useState<MoodOption[]>(moodOptions);

  const [emotionTriggers, setEmotionTriggers] = useState<EmotionTrigger[]>([]);
  const [triggerModalVisible, setTriggerModalVisible] = useState<boolean>(false);
  const [currentTriggerEmotion, setCurrentTriggerEmotion] = useState<string | null>(null);

  const [selectedMoodEmoji, setSelectedMoodEmoji] = useState<string>('😐');

  const [moodNotesCardExpanded, setMoodNotesCardExpanded] = useState<boolean>(false);
  const [moodNotes, setMoodNotes] = useState<string>('');

  const [activitiesCardExpanded, setActivitiesCardExpanded] = useState<boolean>(false);
  const [activityCategories, setActivityCategories] = useState<ActivityCategory[]>(defaultActivityCategories);
  const [selectedActivityForModal, setSelectedActivityForModal] = useState<{
    categoryId: string;
    activityId: string;
    activityName: string;
  } | null>(null);

  const [productivityCardExpanded, setProductivityCardExpanded] = useState<boolean>(false);
  const [productivityRating, setProductivityRating] = useState<number>(3);
  const [focusedHours, setFocusedHours] = useState<string>('');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [otherFactor, setOtherFactor] = useState<string>('');

  const [intimacyCardExpanded, setIntimacyCardExpanded] = useState<boolean>(false);
  const [intimacyData, setIntimacyData] = useState<IntimacyData>({
    type: 'solo',
    timeOfDay: null,
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
      // Open modal for this mood
      setCurrentTriggerEmotion(selectedMood.label);
      setTriggerModalVisible(true);
      
      // Add trigger if doesn't exist
      if (!emotionTriggers.some(et => et.emotion === selectedMood.label)) {
        setEmotionTriggers(prev => [
          ...prev,
          { emotion: selectedMood.label, hasTrigger: null, triggerText: '' },
        ]);
      }
    } else {
      // Remove trigger when mood is deselected
      setEmotionTriggers(prev => prev.filter(et => et.emotion !== selectedMood?.label));
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
    const category = activityCategories.find(cat => cat.id === categoryId);
    const activity = category?.items.find(item => item.id === itemId);
    
    if (!activity) return;

    // If activity is not selected, open modal for details
    if (!activity.selected) {
      setSelectedActivityForModal({
        categoryId,
        activityId: itemId,
        activityName: activity.name,
      });
    } else {
      // If already selected, deselect it
      setActivityCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? {
                ...cat,
                items: cat.items.map(item =>
                  item.id === itemId ? { ...item, selected: false, duration: undefined, followUpAnswer: undefined } : item
                ),
              }
            : cat
        )
      );
    }
  };

  const handleActivitySave = (details: any) => {
    if (!selectedActivityForModal) return;

    const { categoryId, activityId } = selectedActivityForModal;

    setActivityCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map(item =>
                item.id === activityId
                  ? {
                      ...item,
                      selected: true,
                      duration: details.duration,
                      followUpAnswer: JSON.stringify(details), // Store all details as JSON
                    }
                  : item
              ),
            }
          : cat
      )
    );

    setSelectedActivityForModal(null);
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

  const handleActivityDuration = (categoryId: string, itemId: string, duration: string) => {
    setActivityCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map(item =>
                item.id === itemId ? { ...item, duration } : item
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

  const handleSaveEntry = async () => {
    if (!user && !isGuest) {
      Alert.alert('Error', 'You must be logged in to save entries');
      return;
    }

    const selectedMoods = moods.filter(m => m.selected);
    if (selectedMoods.length === 0) {
      Alert.alert('Missing Information', 'Please select at least one mood.');
      return;
    }

    setSaving(true);
    const date = selectedDate.toISOString().split('T')[0];
    const userId = user?.id || 'guest_user';

    try {
      // Save mood data (use upsert to handle existing entries for the same date)
      // Use overall mood score from Step 3, or fallback to calculated score if not set
      const finalMoodScore = Math.round(selectedMoods.reduce((sum, mood) => sum + mood.id, 0) / selectedMoods.length);
      const finalMoodEmoji = selectedMoodEmoji !== '😐' ? selectedMoodEmoji : (selectedMoods[0]?.emoji || '😐');
      
      // Combine trigger notes with additional notes
      const triggerNotes = emotionTriggers.filter(t => t.hasTrigger === 'yes' && t.triggerText).map(t => `${t.emotion}: ${t.triggerText}`).join(', ');
      const finalNotes = moodNotes ? (triggerNotes ? `${triggerNotes}. ${moodNotes}` : moodNotes) : triggerNotes;
      
      const { error: moodError } = await MoodsService.upsert({
        date,
        moods: selectedMoods.map(m => ({ id: m.id, label: m.label, emoji: m.emoji })),
        triggers: emotionTriggers.reduce((acc, trigger) => {
          if (trigger.hasTrigger === 'yes' && trigger.triggerText) {
            acc[trigger.emotion] = trigger.triggerText;
          }
          return acc;
        }, {} as any),
        score: finalMoodScore,
        emoji: finalMoodEmoji,
        notes: finalNotes || null
      }, userId);

      if (moodError) throw new Error('Failed to save mood data');

      // Save activities (delete existing ones for this date first to avoid duplicates)
      const selectedActivities = activityCategories.flatMap(category => 
        category.items.filter(item => item.selected).map(item => {
          // Parse duration from stored details if it exists
          let parsedDetails: any = {};
          try {
            if (item.followUpAnswer) {
              parsedDetails = JSON.parse(item.followUpAnswer);
            }
          } catch (e) {
            // If not JSON, treat as plain text
            parsedDetails = { notes: item.followUpAnswer };
          }

          return {
            date,
            category: category.name,
            name: item.name,
            duration: parsedDetails.duration || undefined,
            emoji: category.emoji,
            follow_up_answer: item.followUpAnswer
          };
        })
      );

      if (selectedActivities.length > 0) {
        // Delete existing activities for this date first
        await ActivitiesService.deleteByDate(userId, date);
        // Then create new ones
        const { error: activitiesError } = await ActivitiesService.createMany(selectedActivities, userId);
        if (activitiesError) throw new Error('Failed to save activities');
      }

      // Save sleep data
      const sleepHours = (sleepData.wakeTime.getTime() - sleepData.bedtime.getTime()) / (1000 * 60 * 60);
      // Save sleep data (use upsert to handle existing entries for the same date)
      const { error: sleepError } = await SleepService.upsert({
        date,
        bedtime: sleepData.bedtime.toTimeString().split(' ')[0],
        wake_time: sleepData.wakeTime.toTimeString().split(' ')[0],
        hours: Math.max(0, sleepHours),
        quality: sleepData.quality,
        waking_feeling: sleepData.wakingFeeling
      }, userId);

      if (sleepError) throw new Error('Failed to save sleep data');

      // Save productivity data (use upsert to handle existing entries for the same date)
      const { error: productivityError } = await ProductivityService.upsert({
        date,
        rating: productivityRating,
        focused_hours: focusedHours ? parseFloat(focusedHours) : undefined,
        factors: selectedFactors,
        other_factor: otherFactor
      }, userId);

      if (productivityError) throw new Error('Failed to save productivity data');

      // Save intimacy data if provided (use upsert to handle existing entries for the same date)
      if (intimacyData.location || intimacyData.timeOfDay || intimacyData.moodBefore !== 3 || intimacyData.moodAfter !== 3) {
        const { error: intimacyError } = await IntimacyService.upsert({
          date,
          type: intimacyData.type,
          orgasm: intimacyData.orgasm,
          location: intimacyData.location || undefined,
          toy_used: intimacyData.toyUsed,
          time_to_sleep: intimacyData.timeOfDay === 'night' ? intimacyData.timeToSleep : 0,
          mood_before: intimacyData.moodBefore,
          mood_after: intimacyData.moodAfter
        }, userId);

        if (intimacyError) throw new Error('Failed to save intimacy data');
      }

      Alert.alert(
        'Entry Saved!',
        'Your daily entry has been saved successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to save entry. Please try again.'
      );
    } finally {
      setSaving(false);
    }
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

  // Create theme-aware styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerButton: {
      padding: 8,
    },
    content: {
      flex: 1,
    },
    section: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      marginVertical: 10,
      borderRadius: 16,
      padding: 20,
      ...theme.shadows.small,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    dateSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      padding: 16,
      borderRadius: 12,
      marginTop: 12,
    },
    dateText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginLeft: 12,
    },
    card: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 20,
      marginVertical: 10,
      borderRadius: 16,
      ...theme.shadows.small,
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.colors.surface,
    },
    cardTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
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
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 2,
      borderColor: 'transparent',
      width: '23%',
      position: 'relative',
    },
    selectedMoodOption: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
      borderColor: theme.colors.warning || '#F59E0B',
    },
    moodEmoji: {
      fontSize: 28,
      marginBottom: 4,
    },
    moodLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
      textAlign: 'center',
    },
    selectedMoodLabel: {
      color: theme.colors.textPrimary,
    },
    moodCheckIcon: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: theme.colors.warning || '#F59E0B',
      borderRadius: 10,
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    characterCount: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      textAlign: 'right',
      marginTop: 4,
    },
    moodNotesInput: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: 12,
      borderRadius: 8,
      fontSize: 14,
      color: theme.colors.textPrimary,
      textAlignVertical: 'top',
      minHeight: 100,
      marginBottom: 8,
    },
    activityCategory: {
      marginBottom: 16,
    },
    categoryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 12,
      backgroundColor: theme.colors.surfaceVariant,
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
      color: theme.colors.textPrimary,
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
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
    },
    selectedActivityItem: {
      backgroundColor: theme.colors.success || '#10B981',
    },
    activityItemText: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      fontWeight: '500',
    },
    selectedActivityItemText: {
      color: '#FFFFFF',
    },
    activityDetailsContainer: {
      marginTop: 8,
      marginLeft: 12,
    },
    durationContainer: {
      marginBottom: 12,
    },
    durationLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: 6,
      fontWeight: '500',
    },
    durationInput: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: 10,
      borderRadius: 6,
      fontSize: 14,
      color: theme.colors.textPrimary,
    },
    followUpContainer: {
      marginTop: 8,
      marginLeft: 12,
    },
    followUpQuestion: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: 6,
    },
    followUpInput: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: 10,
      borderRadius: 6,
      fontSize: 14,
      color: theme.colors.textPrimary,
    },
    productivityQuestion: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
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
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedRatingDot: {
      backgroundColor: theme.colors.primary || '#4DD4AC',
      borderColor: theme.colors.primary || '#4DD4AC',
      ...theme.shadows.small,
    },
    ratingText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    selectedRatingText: {
      color: '#FFFFFF',
    },
    ratingLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 0,
    },
    ratingLabel: {
      fontSize: 11,
      color: theme.colors.textTertiary,
      fontWeight: '500',
    },
    productivityDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 20,
    },
    // Compact Focused Hours Mini Card
    focusedHoursMiniCard: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    focusedHoursHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    focusedHoursLabel: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      flex: 1,
    },
    focusedHoursInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    hoursButtonCompact: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: theme.colors.primary || '#4DD4AC',
      alignItems: 'center',
      justifyContent: 'center',
    },
    hoursButtonText: {
      fontSize: 18,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    focusedHoursInputCompact: {
      width: 50,
      backgroundColor: theme.colors.surface,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      fontSize: 14,
      textAlign: 'center',
      fontWeight: '600',
      color: theme.colors.textPrimary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    hoursUnitText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    // Old styles for backward compatibility
    focusedHoursContainer: {
      marginBottom: 20,
    },
    hoursButton: {
      width: 44,
      height: 44,
      borderRadius: 8,
      backgroundColor: theme.colors.primary || '#4DD4AC',
      alignItems: 'center',
      justifyContent: 'center',
    },
    focusedHoursInput: {
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
      padding: 12,
      borderRadius: 8,
      fontSize: 14,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    // Factors Section
    factorsSection: {
      marginTop: 0,
    },
    factorsSectionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 16,
    },
    factorsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    factorChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      minWidth: 40,
      minHeight: 40,
      position: 'relative',
    },
    selectedFactorChipPositive: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5',
      borderColor: theme.colors.success || '#10B981',
    },
    selectedFactorChipNegative: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
      borderColor: theme.colors.error || '#EF4444',
    },
    selectedFactorChipNeutral: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : '#E0E7FF',
      borderColor: theme.colors.info || '#6366F1',
    },
    selectedFactorChip: {
      backgroundColor: theme.colors.primary || '#4DD4AC',
      borderColor: theme.colors.primary || '#4DD4AC',
    },
    factorEmoji: {
      fontSize: 15,
      marginRight: 6,
    },
    factorLabel: {
      fontSize: 13,
      color: theme.colors.textPrimary,
      fontWeight: '500',
    },
    selectedFactorLabel: {
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    factorCheckmark: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: theme.colors.success || '#10B981',
      borderRadius: 8,
      width: 16,
      height: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    factorsQuestion: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 12,
    },
    otherFactorInput: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: 12,
      borderRadius: 10,
      fontSize: 14,
      marginTop: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.textPrimary,
    },
    // Intimacy Card Styles
    intimacyInfoBox: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
      padding: 16,
      borderRadius: 12,
      marginBottom: 20,
    },
    intimacyInfoText: {
      fontSize: 14,
      color: theme.mode === 'dark' ? theme.colors.warning : '#92400E',
      textAlign: 'center',
      fontWeight: '500',
    },
    intimacySection: {
      marginBottom: 4,
    },
    intimacySectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 10,
    },
    intimacyDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: 14,
    },
    // Intimacy Type - Color Coded (Compact)
    intimacyTypeContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    intimacyTypeChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 2,
      gap: 6,
    },
    intimacyTypeSolo: {
      backgroundColor: theme.colors.surfaceVariant,
      borderColor: theme.colors.border,
    },
    intimacyTypeSoloActive: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : '#E0E7FF',
      borderColor: theme.colors.info || '#6366F1',
    },
    intimacyTypeCouple: {
      backgroundColor: theme.colors.surfaceVariant,
      borderColor: theme.colors.border,
    },
    intimacyTypeCoupleActive: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
      borderColor: theme.colors.error || '#EF4444',
    },
    intimacyTypeEmoji: {
      fontSize: 16,
    },
    intimacyTypeText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    intimacyTypeTextActive: {
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    // Time of Day Selector (Compact)
    timeOfDayContainer: {
      flexDirection: 'row',
      gap: 6,
    },
    timeOfDayChip: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 10,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    timeOfDayChipActive: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE',
      borderColor: '#3B82F6',
    },
    timeOfDayEmoji: {
      fontSize: 18,
      marginBottom: 4,
    },
    timeOfDayText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    timeOfDayTextActive: {
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    // Conditional Time to Sleep (Compact)
    timeToSleepContainer: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: 12,
      borderRadius: 10,
      marginTop: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    timeToSleepLabel: {
      fontSize: 12,
      color: theme.colors.textPrimary,
      fontWeight: '600',
      marginBottom: 8,
    },
    timeToSleepInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    timeToSleepButton: {
      width: 30,
      height: 30,
      borderRadius: 8,
      backgroundColor: '#3B82F6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    timeToSleepButtonText: {
      fontSize: 16,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    timeToSleepInput: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      fontSize: 13,
      textAlign: 'center',
      fontWeight: '600',
      color: theme.colors.textPrimary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    timeToSleepUnit: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    // Details Section (Compact)
    intimacyDetailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    intimacyDetailLabel: {
      fontSize: 13,
      color: theme.colors.textPrimary,
      fontWeight: '500',
    },
    intimacyToggle: {
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 8,
      minWidth: 55,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    intimacyToggleActive: {
      backgroundColor: '#EC4899',
      borderColor: '#EC4899',
    },
    intimacyToggleText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    intimacyToggleTextActive: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    intimacyLocationInput: {
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 8,
      fontSize: 13,
      minWidth: 120,
      textAlign: 'right',
      borderWidth: 1,
      borderColor: theme.colors.border,
      color: theme.colors.textPrimary,
    },
    // Mood Comparison - Side by Side Cards (Optimized Fit)
    moodComparisonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    moodCard: {
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    moodCardTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      marginBottom: 10,
      textAlign: 'center',
    },
    moodCardSlider: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      alignItems: 'center',
    },
    moodCardDot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    moodCardDotActive: {
      backgroundColor: '#EC4899',
      borderColor: '#EC4899',
    },
    moodCardDotText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: '600',
    },
    moodCardDotTextActive: {
      color: '#FFFFFF',
    },
    moodConnector: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    moodConnectorArrow: {
      fontSize: 16,
      color: theme.colors.textTertiary,
      fontWeight: '600',
    },
    intimacyHubButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.mode === 'dark' ? 'rgba(236, 72, 153, 0.2)' : '#FDF2F8',
      padding: 14,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#EC4899',
      marginTop: 4,
    },
    intimacyHubText: {
      fontSize: 15,
      color: '#EC4899',
      fontWeight: '600',
      marginLeft: 8,
    },
    // Old intimacy styles (backward compatibility)
    intimacyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    intimacyLabel: {
      fontSize: 14,
      color: theme.colors.textPrimary,
      fontWeight: '500',
      flex: 1,
    },
    toggleContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 8,
      padding: 2,
    },
    toggleOption: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 6,
    },
    selectedToggle: {
      backgroundColor: theme.colors.surface,
      ...theme.shadows.small,
    },
    toggleText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    selectedToggleText: {
      color: theme.colors.textPrimary,
      fontWeight: '500',
    },
    booleanToggle: {
      backgroundColor: theme.colors.surfaceVariant,
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
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    selectedBooleanToggleText: {
      color: '#FFFFFF',
    },
    intimacyInput: {
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      fontSize: 14,
      color: theme.colors.textPrimary,
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
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedMoodDot: {
      backgroundColor: '#EC4899',
    },
    moodDotText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
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
      color: theme.colors.textSecondary,
      marginBottom: 8,
      fontWeight: '500',
    },
    timeSelector: {
      backgroundColor: theme.colors.surfaceVariant,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    timeText: {
      fontSize: 16,
      color: theme.colors.textPrimary,
      fontWeight: '500',
    },
    qualityContainer: {
      marginTop: 20,
    },
    qualityLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
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
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedQualityDot: {
      backgroundColor: '#6366F1',
    },
    qualityDotText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    wakingContainer: {
      marginTop: 20,
    },
    wakingLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 12,
      fontWeight: '500',
    },
    wakingGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    wakingOption: {
      backgroundColor: theme.colors.surfaceVariant,
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
      color: theme.colors.textPrimary,
      fontWeight: '500',
    },
    selectedWakingText: {
      color: '#FFFFFF',
    },
    mentalClarityButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.info || '#6366F1',
      borderStyle: 'dashed',
    },
    mentalClarityText: {
      fontSize: 16,
      color: theme.colors.info || '#6366F1',
      fontWeight: '600',
      marginLeft: 12,
    },
    saveContainer: {
      padding: 20,
    },
    saveButton: {
      backgroundColor: theme.colors.primary || '#34B27B',
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    saveButtonText: {
      fontSize: 18,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    savingButton: {
      opacity: 0.7,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      width: '100%',
      maxWidth: 400,
      ...theme.shadows.large,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.textPrimary,
    },
    modalBody: {
      padding: 20,
    },
    triggerQuestionCompact: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 12,
      fontWeight: '500',
    },
    triggerChipGroup: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 0,
    },
    triggerChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: theme.colors.surfaceVariant,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      gap: 6,
    },
    selectedTriggerChip: {
      borderWidth: 2,
    },
    selectedTriggerChipYes: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5',
      borderColor: theme.colors.success || '#10B981',
    },
    selectedTriggerChipNo: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
      borderColor: theme.colors.error || '#EF4444',
    },
    selectedTriggerChipUnsure: {
      backgroundColor: theme.mode === 'dark' ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
      borderColor: theme.colors.warning || '#F59E0B',
    },
    triggerChipIcon: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textTertiary,
    },
    triggerChipText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    selectedTriggerChipText: {
      color: theme.colors.textPrimary,
      fontWeight: '600',
    },
    triggerInputCompact: {
      marginTop: 16,
      paddingTop: 0,
    },
    triggerInputField: {
      backgroundColor: theme.colors.surfaceVariant,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
      fontSize: 14,
      color: theme.colors.textPrimary,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    modalDoneButton: {
      backgroundColor: theme.colors.success || '#10B981',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 20,
    },
    modalDoneButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Add Entry',
          headerStyle: { backgroundColor: theme.colors.surface },
          headerTitleStyle: { color: theme.colors.textPrimary, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <X size={24} color={theme.colors.icon} />
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

        {/* Trigger Modal - Popup when mood is selected */}
        <Modal
          visible={triggerModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setTriggerModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setTriggerModalVisible(false)}
          >
            <TouchableOpacity 
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {currentTriggerEmotion && emotionTriggers.find(t => t.emotion === currentTriggerEmotion) && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {moods.find(m => m.label === currentTriggerEmotion)?.emoji} {currentTriggerEmotion}
                    </Text>
                    <TouchableOpacity onPress={() => setTriggerModalVisible(false)}>
                      <X size={20} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalBody}>
                    <Text style={styles.triggerQuestionCompact}>Any trigger?</Text>
                    
                    <View style={styles.triggerChipGroup}>
                      {(['yes', 'no', 'unsure'] as const).map(option => (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.triggerChip,
                            emotionTriggers.find(t => t.emotion === currentTriggerEmotion)?.hasTrigger === option && styles.selectedTriggerChip,
                            emotionTriggers.find(t => t.emotion === currentTriggerEmotion)?.hasTrigger === option && option === 'yes' && styles.selectedTriggerChipYes,
                            emotionTriggers.find(t => t.emotion === currentTriggerEmotion)?.hasTrigger === option && option === 'no' && styles.selectedTriggerChipNo,
                            emotionTriggers.find(t => t.emotion === currentTriggerEmotion)?.hasTrigger === option && option === 'unsure' && styles.selectedTriggerChipUnsure,
                          ]}
                          onPress={() => handleTriggerResponse(currentTriggerEmotion, option)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.triggerChipIcon}>
                            {option === 'yes' ? '✓' : option === 'no' ? '✕' : '?'}
                          </Text>
                          <Text
                            style={[
                              styles.triggerChipText,
                              emotionTriggers.find(t => t.emotion === currentTriggerEmotion)?.hasTrigger === option && styles.selectedTriggerChipText,
                            ]}
                          >
                            {option === 'yes' ? 'Yes' : option === 'no' ? 'No' : "Don't know"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {emotionTriggers.find(t => t.emotion === currentTriggerEmotion)?.hasTrigger === 'yes' && (
                      <View style={styles.triggerInputCompact}>
                        <TextInput
                          style={styles.triggerInputField}
                          placeholder="Type your trigger..."
                          placeholderTextColor="#9CA3AF"
                          value={emotionTriggers.find(t => t.emotion === currentTriggerEmotion)?.triggerText || ''}
                          onChangeText={text => handleTriggerTextChange(currentTriggerEmotion, text)}
                          maxLength={150}
                          multiline={false}
                          returnKeyType="done"
                        />
                      </View>
                    )}

                    <TouchableOpacity 
                      style={styles.modalDoneButton}
                      onPress={() => setTriggerModalVisible(false)}
                    >
                      <Text style={styles.modalDoneButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* CARD 3: Add Notes */}
        {emotionTriggers.length > 0 && (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.cardHeader}
              onPress={() => setMoodNotesCardExpanded(!moodNotesCardExpanded)}
            >
              <View style={styles.cardTitleContainer}>
                <Heart size={20} color="#EC4899" />
                <Text style={styles.cardTitle}>Any additional notes?</Text>
              </View>
              {moodNotesCardExpanded ? (
                <ChevronUp size={20} color="#6B7280" />
              ) : (
                <ChevronDown size={20} color="#6B7280" />
              )}
            </TouchableOpacity>

            {moodNotesCardExpanded && (
              <View style={styles.cardContent}>
                <TextInput
                  style={styles.moodNotesInput}
                  placeholder="Add any additional notes about your mood..."
                  value={moodNotes}
                  onChangeText={setMoodNotes}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  textAlignVertical="top"
                />
                <Text style={styles.characterCount}>
                  {moodNotes.length}/500
                </Text>
              </View>
            )}
          </View>
        )}

        {/* CARD 5: Activities & Tags */}
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
                    <ActivityIconGrid
                      items={category.items}
                      selectedIds={category.items.filter(item => item.selected).map(item => item.id)}
                      onActivitySelect={(activityId) => handleActivityItemToggle(category.id, activityId)}
                    />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* CARD 6: Productivity */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setProductivityCardExpanded(!productivityCardExpanded)}
          >
            <View style={styles.cardTitleContainer}>
              <TrendingUp size={20} color={theme.colors.primary || "#4DD4AC"} />
              <Text style={styles.cardTitle}>Productivity</Text>
            </View>
            {productivityCardExpanded ? (
              <ChevronUp size={20} color={theme.colors.icon} />
            ) : (
              <ChevronDown size={20} color={theme.colors.icon} />
            )}
          </TouchableOpacity>

          {productivityCardExpanded && (
            <View style={styles.cardContent}>
              {/* Productivity Rating */}
              <Text style={styles.productivityQuestion}>
                How productive were you today?
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
                    activeOpacity={0.7}
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

              {/* Divider */}
              <View style={styles.productivityDivider} />

              {/* Compact Focused Hours Mini Card */}
              <View style={styles.focusedHoursMiniCard}>
                <View style={styles.focusedHoursHeader}>
                  <Text style={styles.focusedHoursLabel}>⏱️ Focused Work</Text>
                  <View style={styles.focusedHoursInputContainer}>
                    <TouchableOpacity
                      style={styles.hoursButtonCompact}
                      onPress={() => {
                        const current = parseFloat(focusedHours) || 0;
                        setFocusedHours(Math.max(0, current - 0.5).toString());
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.hoursButtonText}>−</Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.focusedHoursInputCompact}
                      placeholder="0"
                      placeholderTextColor="#9CA3AF"
                      value={focusedHours}
                      onChangeText={setFocusedHours}
                      keyboardType="numeric"
                    />
                    <Text style={styles.hoursUnitText}>hrs</Text>
                    <TouchableOpacity
                      style={styles.hoursButtonCompact}
                      onPress={() => {
                        const current = parseFloat(focusedHours) || 0;
                        setFocusedHours((current + 0.5).toString());
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.hoursButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.productivityDivider} />

              {/* Factors Section with Better Organization */}
              <View style={styles.factorsSection}>
                <Text style={styles.factorsSectionTitle}>
                  What influenced your productivity?
                </Text>
                
                {/* All Factors - Organized but without category headers */}
                <View style={styles.factorsGrid}>
                  {/* Positive Factors */}
                  {productivityFactors
                    .filter(f => ['good-sleep', 'exercise', 'healthy-meals', 'minimal-distractions', 'clear-goals', 'motivation', 'mental-clarity'].includes(f.id))
                    .map(factor => (
                      <TouchableOpacity
                        key={factor.id}
                        style={[
                          styles.factorChip,
                          selectedFactors.includes(factor.id) && styles.selectedFactorChipPositive,
                        ]}
                        onPress={() => toggleProductivityFactor(factor.id)}
                        activeOpacity={0.7}
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
                        {selectedFactors.includes(factor.id) && (
                          <View style={styles.factorCheckmark}>
                            <Check size={10} color="#FFFFFF" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}

                  {/* Negative Factors */}
                  {productivityFactors
                    .filter(f => ['social-media', 'meetings', 'noise'].includes(f.id))
                    .map(factor => (
                      <TouchableOpacity
                        key={factor.id}
                        style={[
                          styles.factorChip,
                          selectedFactors.includes(factor.id) && styles.selectedFactorChipNegative,
                        ]}
                        onPress={() => toggleProductivityFactor(factor.id)}
                        activeOpacity={0.7}
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
                        {selectedFactors.includes(factor.id) && (
                          <View style={styles.factorCheckmark}>
                            <Check size={10} color="#FFFFFF" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  
                  {/* Coffee - Neutral */}
                  <TouchableOpacity
                    style={[
                      styles.factorChip,
                      selectedFactors.includes('coffee') && styles.selectedFactorChipNeutral,
                    ]}
                    onPress={() => toggleProductivityFactor('coffee')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.factorEmoji}>☕</Text>
                    <Text
                      style={[
                        styles.factorLabel,
                        selectedFactors.includes('coffee') && styles.selectedFactorLabel,
                      ]}
                    >
                      Coffee
                    </Text>
                    {selectedFactors.includes('coffee') && (
                      <View style={styles.factorCheckmark}>
                        <Check size={10} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Others */}
                  <TouchableOpacity
                    style={[
                      styles.factorChip,
                      selectedFactors.includes('others') && styles.selectedFactorChipNeutral,
                    ]}
                    onPress={() => toggleProductivityFactor('others')}
                    activeOpacity={0.7}
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
                    {selectedFactors.includes('others') && (
                      <View style={styles.factorCheckmark}>
                        <Check size={10} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {selectedFactors.includes('others') && (
                  <TextInput
                    style={styles.otherFactorInput}
                    placeholder="Specify other factors..."
                    placeholderTextColor="#9CA3AF"
                    value={otherFactor}
                    onChangeText={setOtherFactor}
                    returnKeyType="done"
                  />
                )}
              </View>
            </View>
          )}
        </View>

        {/* CARD 7: Intimacy */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setIntimacyCardExpanded(!intimacyCardExpanded)}
          >
            <View style={styles.cardTitleContainer}>
              <Sparkles size={20} color="#EC4899" />
              <Text style={styles.cardTitle}>Track your intimate wellness</Text>
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

              {/* Intimacy Type - Color Coded */}
              <View style={styles.intimacySection}>
                <Text style={styles.intimacySectionTitle}>Type of Intimacy</Text>
                <View style={styles.intimacyTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.intimacyTypeChip,
                      styles.intimacyTypeSolo,
                      intimacyData.type === 'solo' && styles.intimacyTypeSoloActive,
                    ]}
                    onPress={() => setIntimacyData(prev => ({ ...prev, type: 'solo' }))}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.intimacyTypeEmoji}>💆‍♀️</Text>
                    <Text
                      style={[
                        styles.intimacyTypeText,
                        intimacyData.type === 'solo' && styles.intimacyTypeTextActive,
                      ]}
                    >
                      Solo
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.intimacyTypeChip,
                      styles.intimacyTypeCouple,
                      intimacyData.type === 'couple' && styles.intimacyTypeCoupleActive,
                    ]}
                    onPress={() => setIntimacyData(prev => ({ ...prev, type: 'couple' }))}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.intimacyTypeEmoji}>❤️</Text>
                    <Text
                      style={[
                        styles.intimacyTypeText,
                        intimacyData.type === 'couple' && styles.intimacyTypeTextActive,
                      ]}
                    >
                      Couple
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.intimacyDivider} />

              {/* Time of Day Selector */}
              <View style={styles.intimacySection}>
                <Text style={styles.intimacySectionTitle}>Time of Day</Text>
                <View style={styles.timeOfDayContainer}>
                  <TouchableOpacity
                    style={[
                      styles.timeOfDayChip,
                      intimacyData.timeOfDay === 'morning' && styles.timeOfDayChipActive,
                    ]}
                    onPress={() => setIntimacyData(prev => ({ ...prev, timeOfDay: 'morning' }))}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.timeOfDayEmoji}>🌅</Text>
                    <Text
                      style={[
                        styles.timeOfDayText,
                        intimacyData.timeOfDay === 'morning' && styles.timeOfDayTextActive,
                      ]}
                    >
                      Morning
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.timeOfDayChip,
                      intimacyData.timeOfDay === 'midday' && styles.timeOfDayChipActive,
                    ]}
                    onPress={() => setIntimacyData(prev => ({ ...prev, timeOfDay: 'midday' }))}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.timeOfDayEmoji}>🌞</Text>
                    <Text
                      style={[
                        styles.timeOfDayText,
                        intimacyData.timeOfDay === 'midday' && styles.timeOfDayTextActive,
                      ]}
                    >
                      Midday
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.timeOfDayChip,
                      intimacyData.timeOfDay === 'night' && styles.timeOfDayChipActive,
                    ]}
                    onPress={() => setIntimacyData(prev => ({ ...prev, timeOfDay: 'night' }))}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.timeOfDayEmoji}>🌙</Text>
                    <Text
                      style={[
                        styles.timeOfDayText,
                        intimacyData.timeOfDay === 'night' && styles.timeOfDayTextActive,
                      ]}
                    >
                      Night
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Conditional: Time to Sleep (only if Night is selected) */}
                {intimacyData.timeOfDay === 'night' && (
                  <View style={styles.timeToSleepContainer}>
                    <Text style={styles.timeToSleepLabel}>⏱ Time to fall asleep (minutes)</Text>
                    <View style={styles.timeToSleepInputRow}>
                      <TouchableOpacity
                        style={styles.timeToSleepButton}
                        onPress={() => {
                          setIntimacyData(prev => ({
                            ...prev,
                            timeToSleep: Math.max(0, prev.timeToSleep - 5),
                          }));
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.timeToSleepButtonText}>−</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.timeToSleepInput}
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                        value={intimacyData.timeToSleep.toString()}
                        onChangeText={text =>
                          setIntimacyData(prev => ({
                            ...prev,
                            timeToSleep: parseInt(text) || 0,
                          }))
                        }
                        keyboardType="numeric"
                      />
                      <Text style={styles.timeToSleepUnit}>min</Text>
                      <TouchableOpacity
                        style={styles.timeToSleepButton}
                        onPress={() => {
                          setIntimacyData(prev => ({
                            ...prev,
                            timeToSleep: prev.timeToSleep + 5,
                          }));
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.timeToSleepButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* Divider */}
              <View style={styles.intimacyDivider} />

              {/* Additional Details */}
              <View style={styles.intimacySection}>
                <Text style={styles.intimacySectionTitle}>Details</Text>

                <View style={styles.intimacyDetailRow}>
                  <Text style={styles.intimacyDetailLabel}>Orgasm</Text>
                  <TouchableOpacity
                    style={[
                      styles.intimacyToggle,
                      intimacyData.orgasm && styles.intimacyToggleActive,
                    ]}
                    onPress={() => setIntimacyData(prev => ({ ...prev, orgasm: !prev.orgasm }))}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.intimacyToggleText,
                        intimacyData.orgasm && styles.intimacyToggleTextActive,
                      ]}
                    >
                      {intimacyData.orgasm ? 'Yes' : 'No'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.intimacyDetailRow}>
                  <Text style={styles.intimacyDetailLabel}>Toy Used</Text>
                  <TouchableOpacity
                    style={[
                      styles.intimacyToggle,
                      intimacyData.toyUsed && styles.intimacyToggleActive,
                    ]}
                    onPress={() => setIntimacyData(prev => ({ ...prev, toyUsed: !prev.toyUsed }))}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.intimacyToggleText,
                        intimacyData.toyUsed && styles.intimacyToggleTextActive,
                      ]}
                    >
                      {intimacyData.toyUsed ? 'Yes' : 'No'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.intimacyDetailRow}>
                  <Text style={styles.intimacyDetailLabel}>Location</Text>
                  <TextInput
                    style={styles.intimacyLocationInput}
                    placeholder="e.g., home, outdoors"
                    placeholderTextColor="#9CA3AF"
                    value={intimacyData.location}
                    onChangeText={text => setIntimacyData(prev => ({ ...prev, location: text }))}
                  />
                </View>
              </View>

              {/* Divider */}
              <View style={styles.intimacyDivider} />

              {/* Mood Before & After - Side by Side Cards */}
              <View style={styles.intimacySection}>
                <Text style={styles.intimacySectionTitle}>Mood Comparison</Text>
                <View style={styles.moodComparisonContainer}>
                  {/* Mood Before Card */}
                  <View style={styles.moodCard}>
                    <Text style={styles.moodCardTitle}>Before</Text>
                    <View style={styles.moodCardSlider}>
                      {[1, 2, 3, 4, 5].map(score => (
                        <TouchableOpacity
                          key={`before-${score}`}
                          style={[
                            styles.moodCardDot,
                            intimacyData.moodBefore === score && styles.moodCardDotActive,
                          ]}
                          onPress={() => setIntimacyData(prev => ({ ...prev, moodBefore: score }))}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.moodCardDotText,
                              intimacyData.moodBefore === score && styles.moodCardDotTextActive,
                            ]}
                          >
                            {score}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Mood After Card */}
                  <View style={styles.moodCard}>
                    <Text style={styles.moodCardTitle}>After</Text>
                    <View style={styles.moodCardSlider}>
                      {[1, 2, 3, 4, 5].map(score => (
                        <TouchableOpacity
                          key={`after-${score}`}
                          style={[
                            styles.moodCardDot,
                            intimacyData.moodAfter === score && styles.moodCardDotActive,
                          ]}
                          onPress={() => setIntimacyData(prev => ({ ...prev, moodAfter: score }))}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.moodCardDotText,
                              intimacyData.moodAfter === score && styles.moodCardDotTextActive,
                            ]}
                          >
                            {score}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              {/* CTA Button */}
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
            <Text style={styles.cardTitle}>When did you sleep?</Text>
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
              <Text style={styles.qualityLabel}>How was your sleep quality?</Text>
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
              <Text style={styles.wakingLabel}>How did you feel when waking up?</Text>
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
            <Brain size={20} color={theme.colors.info || "#6366F1"} />
            <Text style={styles.mentalClarityText}>🧠 Take Mental Clarity Test</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <View style={styles.saveContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.savingButton]} 
          onPress={handleSaveEntry}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Entry</Text>
          )}
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
          is24Hour={false}
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
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event: DateTimePickerEvent, time?: Date) => {
            setShowWakeTimePicker(false);
            if (time) setSleepData(prev => ({ ...prev, wakeTime: time }));
          }}
        />
      )}

      {/* Activity Detail Modal */}
      {selectedActivityForModal && (
        <ActivityDetailModal
          visible={!!selectedActivityForModal}
          activityName={selectedActivityForModal.activityName}
          activityId={selectedActivityForModal.activityId}
          categoryId={selectedActivityForModal.categoryId}
          onCancel={() => setSelectedActivityForModal(null)}
          onSave={handleActivitySave}
        />
      )}
    </View>
  );
}
