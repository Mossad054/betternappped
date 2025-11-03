import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  StyleSheet, 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity,
  Animated,
  Dimensions,
  PanResponder,
  Modal,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MiniCalendar from '@/components/MiniCalendar';
import { 
  TrendingUp, 
  Moon, 
  Brain, 
  Zap, 
  ChevronRight,
  Library,
  Plus,
  Sparkles,
  FlaskConical,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Target,
  Save,
  Trash2,
} from 'lucide-react-native';
import { HabitsService } from '@/services/habits.service';
import { MoodsService } from '@/services/moods.service';
import { SleepService } from '@/services/sleep.service';
import { AnalyticsService } from '@/services/analytics.service';
import { useRealtimeHabits, useRealtimeMoods, useRealtimeSleep } from '@/hooks/useRealtimeData';
import { useNotifications } from '@/hooks/useNotifications';
import { useOfflineStatus } from '@/hooks/useOfflineSync';
import HabitCard from '@/components/HabitCard';
import { Database } from '@/lib/supabase';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type HabitCategory = 'MentalClarity' | 'Health' | 'Sleep' | 'Mood' | 'Intimacy' | 'Anxiety';

interface PredefinedHabit {
  name: string;
  description: string;
  category: HabitCategory;
  emoji: string;
  totalDays: number;
}

const PREDEFINED_HABITS: PredefinedHabit[] = [
  // Mental Clarity
  { name: 'Morning Meditation', description: 'Start your day with 10 minutes of mindfulness', category: 'MentalClarity', emoji: '🧘', totalDays: 30 },
  { name: 'Journaling', description: 'Write down your thoughts and reflections', category: 'MentalClarity', emoji: '📝', totalDays: 30 },
  { name: 'Digital Detox Hour', description: 'One hour without screens', category: 'MentalClarity', emoji: '📵', totalDays: 21 },
  { name: 'Reading 30 Minutes', description: 'Read books to expand your mind', category: 'MentalClarity', emoji: '📚', totalDays: 30 },
  { name: 'Brain Training', description: 'Puzzles, games, or learning something new', category: 'MentalClarity', emoji: '🧩', totalDays: 30 },
  
  // Health
  { name: 'Morning Exercise', description: '30 minutes of physical activity', category: 'Health', emoji: '🏃', totalDays: 30 },
  { name: 'Drink 8 Glasses of Water', description: 'Stay hydrated throughout the day', category: 'Health', emoji: '💧', totalDays: 30 },
  { name: 'Healthy Breakfast', description: 'Start with a nutritious meal', category: 'Health', emoji: '🥗', totalDays: 30 },
  { name: 'Evening Walk', description: '20-minute walk after dinner', category: 'Health', emoji: '🚶', totalDays: 30 },
  { name: 'Stretching Routine', description: 'Daily flexibility exercises', category: 'Health', emoji: '🤸', totalDays: 21 },
  
  // Sleep
  { name: 'Consistent Bedtime', description: 'Go to bed at the same time daily', category: 'Sleep', emoji: '😴', totalDays: 30 },
  { name: 'No Screens 1 Hour Before Bed', description: 'Wind down without blue light', category: 'Sleep', emoji: '📱', totalDays: 21 },
  { name: 'Evening Tea Ritual', description: 'Calming herbal tea before sleep', category: 'Sleep', emoji: '🍵', totalDays: 30 },
  { name: 'Cool Bedroom', description: 'Maintain optimal sleep temperature', category: 'Sleep', emoji: '❄️', totalDays: 30 },
  { name: 'Bedtime Reading', description: 'Read a book to relax', category: 'Sleep', emoji: '📖', totalDays: 30 },
  
  // Mood
  { name: 'Gratitude Practice', description: 'List 3 things you\'re grateful for', category: 'Mood', emoji: '🙏', totalDays: 30 },
  { name: 'Morning Sunlight', description: '10 minutes of natural light exposure', category: 'Mood', emoji: '☀️', totalDays: 30 },
  { name: 'Connect with Loved Ones', description: 'Quality time with family/friends', category: 'Mood', emoji: '👥', totalDays: 21 },
  { name: 'Random Act of Kindness', description: 'Do something nice for someone', category: 'Mood', emoji: '💝', totalDays: 30 },
  { name: 'Listen to Uplifting Music', description: 'Boost your mood with music', category: 'Mood', emoji: '🎵', totalDays: 30 },
  
  // Intimacy
  { name: 'Quality Time Together', description: 'Dedicated time with partner', category: 'Intimacy', emoji: '❤️', totalDays: 30 },
  { name: 'Daily Check-in', description: 'Share feelings and experiences', category: 'Intimacy', emoji: '💬', totalDays: 30 },
  { name: 'Physical Affection', description: 'Hugs, kisses, or cuddles', category: 'Intimacy', emoji: '🤗', totalDays: 30 },
  { name: 'Date Night', description: 'Weekly special time together', category: 'Intimacy', emoji: '🌹', totalDays: 7 },
  { name: 'Express Appreciation', description: 'Tell partner what you love about them', category: 'Intimacy', emoji: '💕', totalDays: 30 },
  
  // Anxiety
  { name: 'Deep Breathing Exercises', description: '5 minutes of calm breathing', category: 'Anxiety', emoji: '🌬️', totalDays: 30 },
  { name: 'Progressive Muscle Relaxation', description: 'Release tension from your body', category: 'Anxiety', emoji: '💆', totalDays: 21 },
  { name: 'Worry Time', description: 'Set aside 15 minutes to address concerns', category: 'Anxiety', emoji: '⏰', totalDays: 30 },
  { name: 'Nature Therapy', description: 'Spend time outdoors', category: 'Anxiety', emoji: '🌳', totalDays: 30 },
  { name: 'Limit Caffeine', description: 'Reduce anxiety-inducing stimulants', category: 'Anxiety', emoji: '☕', totalDays: 21 },
];

interface ActiveHabit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  quote?: string;
  emoji?: string;
  streak: number;
  streak_goal?: number;
  streakGoal?: number;
  completedToday: boolean;
  feedback?: string;
  currentDay?: number;
  totalDays?: number;
  total_days?: number;
  progressPercentage?: number;
  reminderEnabled?: boolean;
  reminder_enabled?: boolean;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const { user, isGuest } = useAuth();
  const notifications = useNotifications();
  const { isOnline, pendingWrites, showOfflineIndicator } = useOfflineStatus();
  const [activeHabits, setActiveHabits] = useState<any[]>([]);
  const [moodData, setMoodData] = useState<any[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [impactData, setImpactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moreHabitsModalVisible, setMoreHabitsModalVisible] = useState(false);
  const [habitLibraryModalVisible, setHabitLibraryModalVisible] = useState(false);
  const [createHabitModalVisible, setCreateHabitModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Debug logging
  console.log('Modal states:', { habitLibraryModalVisible, createHabitModalVisible });
  console.log('Active habits count:', activeHabits.length);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Intimacy', 'Health', 'Mood']));
  const [habitLibrarySearch, setHabitLibrarySearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<HabitCategory | 'All'>('All');
  const [customHabitForm, setCustomHabitForm] = useState({
    name: '',
    description: '',
    category: 'Health' as HabitCategory,
    frequency: 'Daily',
    reminderEnabled: false,
    reminderTime: '09:00',
    streakGoal: 30,
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Load data on component mount
  useEffect(() => {
    if (user || isGuest) {
      loadData();
    } else {
      // Initialize empty state for non-authenticated users
      setActiveHabits([]);
      setMoodData([]);
      setSleepData([]);
      setAiRecommendations([]);
      setLoading(false);
    }
  }, [user, isGuest]);

  // Set up real-time subscriptions only for authenticated users
  useRealtimeHabits(user?.id || '', () => {
    if (user || isGuest) loadData();
  });

  useRealtimeMoods(user?.id || '', () => {
    if (user || isGuest) loadData();
  });
  
  useRealtimeSleep(user?.id || '', () => {
    if (user || isGuest) loadData();
  });

  const loadData = async () => {
    // Early return if not authenticated and not in guest mode
    if (!user && !isGuest) {
      setActiveHabits([]);
      setMoodData([]);
      setSleepData([]);
      setAiRecommendations([]);
      setLoading(false);
      return;
    }
    
    const effectiveUserId = user?.id || 'guest_user';
    setLoading(true);
    setError(null);
    
    try {
      const [habitsResult, moodResult, sleepResult, recommendationsResult, impactResult] = await Promise.all([
        HabitsService.getAll(effectiveUserId),
        MoodsService.getByDateRange(
          effectiveUserId,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        ),
        SleepService.getByDateRange(
          effectiveUserId,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        ),
        AnalyticsService.generateAIRecommendations(effectiveUserId),
        AnalyticsService.calculateActivityImpact(effectiveUserId, 14) // Get 2 weeks of impact data
      ]);

      // Handle errors gracefully - don't throw if data is just empty
      if (habitsResult.error && habitsResult.error !== 'No data found') {
        console.warn('Failed to load habits:', habitsResult.error);
      }
      if (moodResult.error && moodResult.error !== 'No data found') {
        console.warn('Failed to load mood data:', moodResult.error);
      }
      if (sleepResult.error && sleepResult.error !== 'No data found') {
        console.warn('Failed to load sleep data:', sleepResult.error);
      }
      if (recommendationsResult.error && recommendationsResult.error !== 'No data found') {
        console.warn('Failed to load recommendations:', recommendationsResult.error);
      }
      if (impactResult.error && impactResult.error !== 'No data found') {
        console.warn('Failed to load impact data:', impactResult.error);
      }

      setActiveHabits(habitsResult.data || []);
      setMoodData(moodResult.data || []);
      setSleepData(sleepResult.data || []);
      setAiRecommendations(recommendationsResult.data || []);
      setImpactData(impactResult.data || null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const todayMood = moodData && moodData.length > 0 ? moodData[moodData.length - 1] : { score: 3, emoji: '😐' };
  const todaySleep = sleepData && sleepData.length > 0 ? sleepData[sleepData.length - 1] : { hours: 7, emoji: '😴' };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleToggleComplete = async (id: string) => {
    if (!user || !activeHabits) return;
    
    try {
      const habit = activeHabits.find(h => h?.id === id);
      if (!habit) return;

      const today = new Date().toISOString().split('T')[0];
      const { error } = await HabitsService.logHabit(
        id,
        {
          date: today,
          completed: !habit.completedToday,
          feedback: 'good'
        },
        user.id
      );

      if (error) {
        Alert.alert('Error', 'Failed to update habit');
        return;
      }

      // Update local state
      setActiveHabits(prev =>
        prev.map(h =>
          h.id === id ? { ...h, completedToday: !h.completedToday, streak: h.completedToday ? h.streak : h.streak + 1 } : h
        )
      );

      // Show celebration for completion
      if (!habit.completedToday) {
        const motivationalQuotes = [
          "Great job! Small steps lead to big changes! 🌟",
          "You're building a better you, one habit at a time! 💪",
          "Consistency is the key to success! 🔑",
          "Keep up the great work! You're doing amazing! ✨",
          "Another step toward your goals! 🎯"
        ];

        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        
        Alert.alert(
          "Habit Completed! 🎉",
          randomQuote,
          [{ text: "Thanks!", style: "default" }]
        );
      }
    } catch (err) {
      console.error('Error updating habit:', err);
      Alert.alert('Error', 'Failed to update habit');
    }
  };

  const handleFeedback = async (id: string, feedback: 'good' | 'neutral' | 'bad') => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await HabitsService.logHabit(
        id,
        {
          date: today,
          feedback,
          completed: true // If they're giving feedback, it must be completed
        },
        user.id
      );

      if (error) {
        Alert.alert('Error', 'Failed to save feedback');
        return;
      }

      // Update local state
      setActiveHabits(prev =>
        prev.map(h => (h.id === id ? { ...h, feedback } : h))
      );

      // Show feedback message
      if (feedback === 'good') {
        Alert.alert('Great job! 🎉', 'Keep up the good work!');
      }
    } catch (err) {
      console.error('Error saving feedback:', err);
      Alert.alert('Error', 'Failed to save feedback');
    }
  };

  const handleToggleReminder = async (id: string) => {
    if (!user) return;

    const habit = activeHabits.find(h => h.id === id);
    if (!habit) return;

    const newReminderState = !(habit.reminderEnabled || habit.reminder_enabled);

    try {
      if (newReminderState) {
        // Request permissions if not granted
        const hasPermission = await notifications.requestPermissions();
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Please enable notifications in your device settings to use habit reminders.'
          );
          return;
        }

        // Schedule notification (default time: 9 AM)
        const notificationId = await notifications.scheduleHabitReminder(
          habit.name,
          habit.id,
          9, // hour
          0  // minute
        );

        if (!notificationId) {
          Alert.alert('Error', 'Failed to schedule reminder');
          return;
        }

        // Update habit in database with reminder enabled
        const { error } = await HabitsService.update(
          id,
          { reminder_enabled: true, reminder_time: '09:00' },
          user.id
        );

        if (error) {
          // If database update fails, cancel the scheduled notification
          await notifications.cancelNotification(notificationId);
          Alert.alert('Error', 'Failed to enable reminder');
          return;
        }

        // Update local state
        setActiveHabits(prev =>
          prev.map(h => (h.id === id ? { ...h, reminder_enabled: true, reminderEnabled: true } : h))
        );
      } else {
        // Cancel notification
        await notifications.cancelHabitReminder(habit.id);

        // Update habit in database
        const { error } = await HabitsService.update(
          id,
          { reminder_enabled: false },
          user.id
        );

        if (error) {
          Alert.alert('Error', 'Failed to disable reminder');
          return;
        }

        // Update local state
        setActiveHabits(prev =>
          prev.map(h => (h.id === id ? { ...h, reminder_enabled: false, reminderEnabled: false } : h))
        );
      }
    } catch (error) {
      console.error('Error toggling reminder:', error);
      Alert.alert('Error', 'Failed to update reminder');
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (!user) return;
    
    try {
      // Cancel any scheduled notifications for this habit
      await notifications.cancelHabitReminder(id);

      const { error } = await HabitsService.delete(id, user.id);
      
      if (error) {
        Alert.alert('Error', 'Failed to delete habit');
        return;
      }

      setActiveHabits(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error('Error deleting habit:', err);
      Alert.alert('Error', 'Failed to delete habit');
    }
  };

  const handleAddHabitFromLibrary = async (habit: { name: string; description: string; category: string }) => {
    if (!user) return;
    
    try {
      // Check if habit already exists
      const existingHabit = activeHabits?.find(h => h?.name === habit.name);
      if (existingHabit) {
        Alert.alert('Already Added', `${habit.name} is already in your active habits!`);
        return;
      }

      const { data, error } = await HabitsService.create({
        name: habit.name,
        description: habit.description,
        category: habit.category,
        total_days: 30,
        streak: 0,
        reminder_enabled: false
      }, user.id);

      if (error) {
        Alert.alert('Error', 'Failed to add habit');
        return;
      }

      if (data) {
        setActiveHabits(prev => [...prev, data]);
        setHabitLibraryModalVisible(false);
        setSuccessMessage(`✅ ${habit.name} has been added to your active habits!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        Alert.alert('✅ Success', `${habit.name} has been added to your active habits!`, [
          { text: 'OK', style: 'default' }
        ]);
      }
    } catch (error) {
      console.error('Error adding habit:', error);
      Alert.alert('❌ Error', 'Failed to add habit. Please try again.');
    }
  };

  const handleAddPredefinedHabit = async (habit: PredefinedHabit) => {
    if (!user) return;

    try {
      // Check if habit already exists
      const existingHabit = activeHabits.find(h => h.name.toLowerCase() === habit.name.toLowerCase());
      if (existingHabit) {
        Alert.alert('Already Active', `${habit.name} is already in your active habits!`);
        return;
      }

      const { data, error } = await HabitsService.create({
        name: habit.name,
        description: habit.description,
        category: habit.category,
        total_days: habit.totalDays,
        streak: 0,
        reminder_enabled: false,
      }, user.id);

      if (error) {
        Alert.alert('Error', 'Failed to add habit');
        return;
      }

      if (data) {
        setActiveHabits(prev => [...prev, data]);
        setSuccessMessage(`✅ ${habit.name} added to your active habits!`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('Error adding habit:', error);
      Alert.alert('Error', 'Failed to add habit');
    }
  };

  const handleCreateCustomHabit = async () => {
    if (!user) return;
    
    try {
      // Validation
      if (!customHabitForm.name.trim()) {
        Alert.alert('❌ Validation Error', 'Please enter a habit name');
        return;
      }
      
      if (customHabitForm.name.trim().length < 3) {
        Alert.alert('❌ Validation Error', 'Habit name must be at least 3 characters long');
        return;
      }

      // Check if habit already exists
      if (activeHabits) {
        const existingHabit = activeHabits.find(h => h?.name?.toLowerCase() === customHabitForm.name.trim().toLowerCase());
        if (existingHabit) {
          Alert.alert('Already Exists', `${customHabitForm.name} is already in your active habits!`);
          return;
        }
      }
      
      const { data, error } = await HabitsService.create({
        name: customHabitForm.name.trim(),
        description: customHabitForm.description.trim() || 'Custom habit',
        category: customHabitForm.category,
        total_days: customHabitForm.streakGoal,
        streak: 0,
        reminder_enabled: customHabitForm.reminderEnabled,
        reminder_time: customHabitForm.reminderEnabled ? customHabitForm.reminderTime : undefined
      }, user.id);

      if (error) {
        Alert.alert('Error', 'Failed to create habit');
        return;
      }

      if (data) {
        setActiveHabits(prev => [...prev, data]);
        setCreateHabitModalVisible(false);
        setSuccessMessage(`✅ ${customHabitForm.name} has been created and added to your active habits!`);
        setTimeout(() => setSuccessMessage(null), 3000);
        setCustomHabitForm({
          name: '',
          description: '',
          category: 'Health',
          frequency: 'Daily',
          reminderEnabled: false,
          reminderTime: '09:00',
          streakGoal: 30,
        });
        
        Alert.alert('✅ Success', `${customHabitForm.name} has been created and added to your active habits!`, [
          { text: 'OK', style: 'default' }
        ]);
      }
    } catch (error) {
      console.error('Error creating custom habit:', error);
      Alert.alert('❌ Error', 'Failed to create habit. Please try again.');
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };
  const SkeletonCard = () => (
    <View style={[
      styles.card,
      {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.base,
        ...theme.shadows.small
      }
    ]}>
      <View style={[styles.skeletonLine, { backgroundColor: theme.colors.borderLight, width: '60%' }]} />
      <View style={[styles.skeletonLine, { backgroundColor: theme.colors.borderLight, width: '40%', marginTop: 8 }]} />
      <View style={[styles.skeletonLine, { backgroundColor: theme.colors.borderLight, width: '80%', marginTop: 8 }]} />
    </View>
  );

  // Empty state component
  const EmptyStateCard = ({ title, message, ctaText, onCtaPress, icon }: {
    title: string;
    message: string;
    ctaText: string;
    onCtaPress: () => void;
    icon: React.ReactNode;
  }) => (
    <View style={[
      styles.card,
      {
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.base,
        ...theme.shadows.small,
        alignItems: 'center',
        paddingVertical: theme.spacing.xl
      }
    ]}>
      {icon}
      <Text style={[
        styles.emptyStateTitle,
        {
          color: theme.colors.text,
          fontSize: theme.typography.fontSize.lg,
          fontWeight: theme.typography.fontWeight.semibold,
          marginTop: theme.spacing.base
        }
      ]}>{title}</Text>
      <Text style={[
        styles.emptyStateMessage,
        {
          color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.sm,
          textAlign: 'center',
          marginTop: theme.spacing.sm,
          marginBottom: theme.spacing.lg
        }
      ]}>{message}</Text>
      <TouchableOpacity
        style={[
          styles.emptyStateButton,
          {
            backgroundColor: theme.colors.accent,
            borderRadius: theme.borderRadius.full,
            paddingHorizontal: theme.spacing.lg,
            paddingVertical: theme.spacing.sm
          }
        ]}
        onPress={onCtaPress}
      >
        <Text style={[
          styles.emptyStateButtonText,
          {
            color: theme.colors.textInverted,
              fontSize: theme.typography.fontSize.sm,
            fontWeight: theme.typography.fontWeight.medium
          }
        ]}>{ctaText}</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingTop: insets.top + theme.spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome card skeleton */}
          <View style={[
            styles.welcomeCard,
            {
              backgroundColor: theme.colors.accent,
              borderRadius: theme.borderRadius.lg,
              ...theme.shadows.medium,
              height: 120
            }
          ]} />
          
          {/* Skeleton cards */}
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>Error: {error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={loadData}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadData}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={[
          styles.welcomeCard,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.base,
            ...theme.shadows.small
          }
        ]}>
          <Text style={[
            styles.greeting,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.xxl,
              fontWeight: theme.typography.fontWeight.bold
            }
          ]}>{getGreeting()} Emma 🌤️</Text>
          <Text style={[
            styles.quote,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.regular
            }
          ]}>
            Balance Your Mind and Life
          </Text>
        </View>

        {/* Network Status Banner */}
        {showOfflineIndicator && (
          <View style={[styles.networkBanner, { backgroundColor: !isOnline ? theme.colors.error : theme.colors.warning }]}>
            {!isOnline ? (
              <>
                <WifiOff size={18} color="#FFFFFF" />
                <Text style={[styles.networkBannerText, { color: '#FFFFFF' }]}>
                  No internet connection. Connect to refresh data.
                </Text>
              </>
            ) : (
              <>
                <RefreshCw size={18} color="#FFFFFF" />
                <Text style={[styles.networkBannerText, { color: '#FFFFFF' }]}>
                  {pendingWrites} {pendingWrites === 1 ? 'change' : 'changes'} saved locally, will sync when online
                </Text>
              </>
            )}
          </View>
        )}

        {/* Guest Mode Banner */}
        {isGuest && (
          <View style={[styles.guestBanner, { backgroundColor: theme.colors.warning }]}>
            <Text style={[styles.guestBannerText, { color: '#FFFFFF' }]}>
              👤 Guest Mode: Your data is stored locally and may be lost if app data is cleared. Sign up to save and sync across devices!
            </Text>
            <TouchableOpacity
              style={styles.guestSignUpButton}
              onPress={() => router.push('/auth/auth')}
            >
              <Text style={styles.guestSignUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderRadius: theme.borderRadius.base,
            ...theme.shadows.small
          }
        ]}>
          <Text style={[
            styles.cardTitle,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold
            }
          ]}>Today&apos;s Snapshot</Text>
          <View style={styles.snapshotGrid}>
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotEmoji}>{todayMood.emoji}</Text>
              <Text style={[styles.snapshotLabel, { color: theme.colors.textSecondary }]}>Mood</Text>
              <Text style={[styles.snapshotValue, { color: theme.colors.text }]}>{todayMood.score}/5</Text>
            </View>
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotEmoji}>{todaySleep.emoji}</Text>
              <Text style={[styles.snapshotLabel, { color: theme.colors.textSecondary }]}>Sleep</Text>
              <Text style={[styles.snapshotValue, { color: theme.colors.text }]}>{todaySleep.hours}h</Text>
            </View>
            <View style={styles.snapshotItem}>
              <Brain size={28} color={theme.colors.primary} />
              <Text style={[styles.snapshotLabel, { color: theme.colors.textSecondary }]}>Clarity</Text>
              <Text style={[styles.snapshotValue, { color: theme.colors.text }]}>High</Text>
            </View>
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotEmoji}>🔥</Text>
              <Text style={[styles.snapshotLabel, { color: theme.colors.textSecondary }]}>Streak</Text>
              <Text style={[styles.snapshotValue, { color: theme.colors.text }]}>30 days</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Weekly Overview</Text>
          <MiniCalendar
            data={activeHabits.map((_, index) => {
              const date = new Date();
              date.setDate(date.getDate() - (6 - index)); // Last 7 days
              const dateStr = date.toISOString().split('T')[0];
              
              const habitsForDay = activeHabits.map(habit => {
                const log = habit.logs?.find(l => l.date === dateStr);
                return {
                  completed: log?.completed || false,
                  feedback: log?.feedback || 'neutral'
                };
              });
              
              const completedCount = habitsForDay.filter(h => h.completed).length;
              const feedbackCounts = habitsForDay.reduce((acc, h) => {
                if (h.completed) {
                  acc[h.feedback] = (acc[h.feedback] || 0) + 1;
                }
                return acc;
              }, { good: 0, neutral: 0, bad: 0 });

              return {
                date: dateStr,
                completedHabits: completedCount,
                totalHabits: activeHabits.length,
                feedback: feedbackCounts
              };
            })}
          />
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Completed (70%+)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Partial</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Missed</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Build Simple Habits</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Small actions, big impact.</Text>
        </View>

        <View style={styles.subsectionHeader}>
          <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>My Active Habits</Text>
          <Text style={[styles.subsectionDescription, { color: theme.colors.textSecondary }]}>
            Track your daily habits and build consistency.
          </Text>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.habitsScrollContent}
          style={styles.habitsScroll}
        >
          {!activeHabits || activeHabits.length === 0 ? (
            <EmptyStateCard
              title="No Active Habits Yet"
              message="Start building healthy habits to improve your wellness journey. Add your first habit to get started!"
              ctaText="Add First Habit"
              onCtaPress={() => setHabitLibraryModalVisible(true)}
              icon={<Target size={48} color={theme.colors.accent} />}
            />
          ) : (
            <>
              {/* Display first three habits */}
              {activeHabits && activeHabits.slice(0, 3).map((habit) => (
                habit && (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onToggleComplete={handleToggleComplete}
                    onFeedback={handleFeedback}
                    onToggleReminder={handleToggleReminder}
                    onDelete={(id) => {
                      console.log('Delete requested for habit:', id);
                      handleDeleteHabit(id);
                    }}
                  />
                )
              ))}

              {/* Show More button if there are more than 3 habits */}
              {activeHabits && activeHabits.length > 3 && (
                <TouchableOpacity 
                  style={[styles.moreHabitsPill, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setMoreHabitsModalVisible(true)}
                >
                  <Text style={styles.moreHabitsPillText}>
                    +{activeHabits.length - 3} More
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>

        <View style={styles.habitActionCards}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
            onPress={() => {
              console.log('Opening habit library modal');
              setHabitLibraryModalVisible(true);
            }}
          >
            <Library size={24} color={theme.colors.primary} />
            <Text style={[styles.actionCardTitle, { color: theme.colors.text }]}>Browse Habit Library</Text>
            <Text style={[styles.actionCardSubtitle, { color: theme.colors.textSecondary }]}>
              Explore categorized habits
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
            onPress={() => {
              console.log('Opening create habit modal');
              setCreateHabitModalVisible(true);
            }}
          >
            <Plus size={24} color={theme.colors.primary} />
            <Text style={[styles.actionCardTitle, { color: theme.colors.text }]}>Create Custom Habit</Text>
            <Text style={[styles.actionCardSubtitle, { color: theme.colors.textSecondary }]}>
              Design your own habit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Success Message */}
        {successMessage && (
          <View style={[styles.card, { backgroundColor: '#10B981', marginBottom: 16 }]}>
            <Text style={[styles.cardTitle, { color: '#FFFFFF' }]}>{successMessage}</Text>
          </View>
        )}

        {/* Debug Info */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, marginBottom: 16 }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Debug Info</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Modal States: Library={habitLibraryModalVisible ? 'Open' : 'Closed'}, Create={createHabitModalVisible ? 'Open' : 'Closed'}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Active Habits: {activeHabits.length}
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.featureCard, { backgroundColor: theme.colors.card }]}
          onPress={() => router.push('/sleep-wellness-hub')}
        >
          <View style={styles.featureContent}>
            <Moon size={32} color={theme.colors.primary} />
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>Improve My Sleep</Text>
              <Text style={[styles.featureSubtitle, { color: theme.colors.textSecondary }]}>
                Explore tools & routines for better sleep
              </Text>
            </View>
          </View>
          <ChevronRight size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Impact Analysis</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary, marginBottom: 16 }]}>How your activities affect your wellbeing</Text>
          
          {/* Loading State */}
          {loading ? (
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
              <ActivityIndicator color={theme.colors.primary} />
              <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                Analyzing your data...
              </Text>
            </View>
          ) : error ? (
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
              <TouchableOpacity 
                style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                onPress={loadData}
              >
                <Text style={[styles.retryButtonText, { color: theme.colors.onPrimary }]}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Summary Card - Show top insight */}
              {impactData?.insights && impactData.insights.length > 0 && (
                <View style={[
                  styles.summaryCard, 
                  { backgroundColor: impactData.summary.positiveImpact > 0 ? theme.colors.success : theme.colors.warning }
                ]}>
                  <Text style={[styles.summaryText, { color: theme.colors.onPrimary }]}>
                    {impactData.insights[0]}
                  </Text>
                </View>
              )}

              <View style={styles.impactGrid}>
                {/* Mental Clarity Impact */}
                {impactData?.correlations?.map((correlation) => {
                  if (!correlation.metrics) return null;
                  
                  const getImpactColor = (score: number) => {
                    if (score >= 0.7) return theme.colors.success;
                    if (score >= 0.5) return theme.colors.primary;
                    if (score >= 0.3) return theme.colors.warning;
                    return theme.colors.error;
                  };

                  const formatPercentage = (score: number) => {
                    const percentage = (score * 100).toFixed(0);
                    return score >= 0.5 ? `+${percentage}%` : `${percentage}%`;
                  };

                  return (
                    <View key={correlation.category} style={styles.impactItem}>
                      {/* Icon based on category */}
                      {correlation.category === 'MentalClarity' ? (
                        <Brain size={24} color={theme.colors.primary} />
                      ) : correlation.category === 'Sleep' ? (
                        <Moon size={24} color={theme.colors.primary} />
                      ) : (
                        <Text style={[styles.snapshotEmoji, { fontSize: 24 }]}>
                          {correlation.category === 'Exercise' ? '🏋️' : 
                           correlation.category === 'Meditation' ? '🧘' : '�'}
                        </Text>
                      )}
                      
                      <View style={styles.impactInfo}>
                        <Text style={[styles.impactLabel, { color: theme.colors.text }]}>
                          {correlation.category}
                        </Text>
                        <View style={[styles.impactBar, { backgroundColor: theme.colors.border }]}>
                          <View style={[
                            styles.impactBarFill, 
                            { 
                              width: `${correlation.score * 100}%`,
                              backgroundColor: getImpactColor(correlation.score)
                            }
                          ]} />
                        </View>
                        <Text style={[
                          styles.impactValue, 
                          { color: getImpactColor(correlation.score) }
                        ]}>
                          {formatPercentage(correlation.score)} impact
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {(!impactData?.correlations || impactData.correlations.length === 0) && (
                  <View style={styles.noDataContainer}>
                    <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
                      Log more activities to see their impact on your wellbeing!
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Additional Insights */}
              {impactData?.insights && impactData.insights.length > 1 && (
                <View style={styles.insightsContainer}>
                  {impactData.insights.slice(1).map((insight, index) => (
                    <Text key={index} style={[styles.insightText, { color: theme.colors.textSecondary }]}>
                      • {insight}
                    </Text>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Sparkles size={20} color={theme.colors.warning} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>AI Recommendations</Text>
          </View>
          <View style={styles.recommendationsList}>
            {aiRecommendations.length > 0 ? (
              aiRecommendations.slice(0, 3).map((rec, index) => (
                <View key={rec.id || index} style={[styles.recommendationItem, { backgroundColor: theme.colors.secondary }]}>
                  <Text style={[styles.recommendationText, { color: theme.colors.text }]}>
                    {rec.description}
                  </Text>
                </View>
              ))
            ) : (
              <View style={[styles.recommendationItem, { backgroundColor: theme.colors.secondary }]}>
                <Text style={[styles.recommendationText, { color: theme.colors.text }]}>
                  💡 Start logging your daily activities to get personalized recommendations!
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.seeMoreButton}>
            <Text style={[styles.seeMoreText, { color: theme.colors.primary }]}>See More</Text>
            <ChevronRight size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.experimentsCard, { backgroundColor: theme.colors.card }]}
          onPress={() => router.push('/experiments-hub')}
        >
          <View style={styles.experimentsHeader}>
            <FlaskConical size={28} color={theme.colors.info} />
            <View style={styles.experimentsText}>
              <Text style={[styles.experimentsTitle, { color: theme.colors.text }]}>Run Experiments</Text>
              <Text style={[styles.experimentsSubtitle, { color: theme.colors.textSecondary }]}>
                Test how habits affect your mood, sleep, and clarity
              </Text>
            </View>
          </View>
          <View style={[styles.startButton, { backgroundColor: theme.colors.info }]}>
            <Text style={styles.startButtonText}>Start Experiment</Text>
            <ChevronRight size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* More Habits Modal */}
      <Modal
        visible={moreHabitsModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setMoreHabitsModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => setMoreHabitsModalVisible(false)}>
              <Text style={[styles.modalCloseText, { color: theme.colors.primary }]}>Done</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>More Habits</Text>
            <View style={styles.modalPlaceholder} />
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
              {activeHabits.length > 3 
                ? `${activeHabits.length - 3} More Active Habits`
                : 'Your Active Habits'}
            </Text>
            
            {/* Display remaining habits */}
            {activeHabits?.slice(3)?.map((habit) => {
              if (!habit) return null;
              
              return (
                <View key={habit.id} style={[styles.moreHabitItem, { 
                  backgroundColor: theme.colors.card,
                  borderBottomColor: theme.colors.border,
                }]}>
                  <View style={styles.moreHabitContent}>
                    <View>
                      <Text style={[styles.moreHabitName, { color: theme.colors.text }]}>{habit.name}</Text>
                      <Text style={[styles.moreHabitDescription, { color: theme.colors.textSecondary }]}>
                        {habit.description}
                      </Text>
                    </View>
                    <View style={styles.moreHabitActions}>
                      <TouchableOpacity
                        style={[styles.moreHabitAction, { backgroundColor: theme.colors.error + '20' }]}
                        onPress={() => {
                          setMoreHabitsModalVisible(false);
                          handleDeleteHabit(habit.id);
                        }}
                      >
                        <Trash2 size={20} color={theme.colors.error} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.moreHabitAction, { backgroundColor: theme.colors.primary + '20' }]}
                        onPress={() => {
                          if (!habit.completedToday) {
                            handleToggleComplete(habit.id);
                          }
                        }}
                      >
                        <Text style={[styles.moreHabitActionText, { color: theme.colors.primary }]}>
                          {habit.completedToday ? '✓ Done' : 'Complete'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.moreHabitStats}>
                    <Text style={[styles.moreHabitStreak, { color: theme.colors.warning }]}>
                      🔥 {habit.streak} day streak
                    </Text>
                    <Text style={[styles.moreHabitProgress, { color: theme.colors.textSecondary }]}>
                      Day {habit.currentDay || 1}/{habit.totalDays || habit.total_days || 30}
                    </Text>
                  </View>
                </View>
              );
            })}
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* Habit Library Modal */}
      <Modal
        visible={habitLibraryModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          console.log('Closing habit library modal');
          setHabitLibraryModalVisible(false);
        }}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => {
              console.log('Closing habit library modal from header');
              setHabitLibraryModalVisible(false);
            }}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Habit Library</Text>
            <View style={styles.modalPlaceholder} />
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Search Bar */}
            <View style={[styles.searchContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                placeholder="Search habits..."
                placeholderTextColor={theme.colors.textSecondary}
                value={habitLibrarySearch}
                onChangeText={setHabitLibrarySearch}
              />
            </View>

            {/* Category Tabs */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryTabsContainer}
              contentContainerStyle={styles.categoryTabsContent}
            >
              {(['All', 'MentalClarity', 'Health', 'Sleep', 'Mood', 'Intimacy', 'Anxiety'] as const).map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryTab,
                    {
                      backgroundColor: selectedCategoryFilter === category ? theme.colors.primary : theme.colors.card,
                      borderColor: theme.colors.border,
                    }
                  ]}
                  onPress={() => setSelectedCategoryFilter(category === 'All' ? 'All' : category)}
                >
                  <Text
                    style={[
                      styles.categoryTabText,
                      { color: selectedCategoryFilter === category ? '#FFFFFF' : theme.colors.text }
                    ]}
                  >
                    {category === 'All' ? 'All' : category.replace(/([A-Z])/g, ' $1').trim()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {(['MentalClarity', 'Health', 'Sleep', 'Mood', 'Intimacy', 'Anxiety'] as HabitCategory[]).map(category => {
              // Filter by selected category
              if (selectedCategoryFilter !== 'All' && selectedCategoryFilter !== category) {
                return null;
              }
              
              // Filter habits by search and category
              let habitsInCategory = PREDEFINED_HABITS.filter(h => {
                const matchesCategory = h.category === category;
                const matchesSearch = !habitLibrarySearch.trim() || 
                  h.name.toLowerCase().includes(habitLibrarySearch.toLowerCase()) ||
                  h.description.toLowerCase().includes(habitLibrarySearch.toLowerCase());
                return matchesCategory && matchesSearch;
              });

              // If no habits match, don't show category
              if (habitsInCategory.length === 0) {
                return null;
              }

              const isExpanded = expandedCategories.has(category);

              return (
                <View key={category} style={styles.categorySection}>
                  <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => {
                      setExpandedCategories(prev => {
                        const newSet = new Set(prev);
                        if (newSet.has(category)) {
                          newSet.delete(category);
                        } else {
                          newSet.add(category);
                        }
                        return newSet;
                      });
                    }}
                  >
                    <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
                      {category.replace(/([A-Z])/g, ' $1').trim()} ({habitsInCategory.length})
                    </Text>
                    {isExpanded ? (
                      <ChevronUp size={20} color={theme.colors.textSecondary} />
                    ) : (
                      <ChevronDown size={20} color={theme.colors.textSecondary} />
                    )}
                  </TouchableOpacity>

                  {isExpanded && habitsInCategory.map((habit, index) => {
                    const isAlreadyActive = activeHabits.some(h => h.name.toLowerCase() === habit.name.toLowerCase());

                    return (
                      <View key={index} style={[styles.habitLibraryItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                        <Text style={styles.habitLibraryEmoji}>{habit.emoji}</Text>
                        <View style={styles.habitLibraryInfo}>
                          <Text style={[styles.habitLibraryName, { color: theme.colors.text }]}>{habit.name}</Text>
                          <Text style={[styles.habitLibraryDescription, { color: theme.colors.textSecondary }]}>
                            {habit.description}
                          </Text>
                          <Text style={[styles.habitLibraryDuration, { color: theme.colors.textSecondary }]}>
                            {habit.totalDays} day challenge
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.addHabitButton,
                            { backgroundColor: isAlreadyActive ? theme.colors.surfaceVariant : theme.colors.primary }
                          ]}
                          onPress={() => handleAddPredefinedHabit(habit)}
                          disabled={isAlreadyActive}
                        >
                          <Plus size={18} color={isAlreadyActive ? theme.colors.textSecondary : '#FFFFFF'} />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              );
            })}

            <TouchableOpacity
              style={[styles.createCustomButton, { backgroundColor: theme.colors.secondary, borderColor: theme.colors.border }]}
              onPress={() => {
                setHabitLibraryModalVisible(false);
                setCreateHabitModalVisible(true);
              }}
            >
              <Sparkles size={20} color={theme.colors.primary} />
              <Text style={[styles.createCustomButtonText, { color: theme.colors.text }]}>
                Create Custom Habit
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Create Custom Habit Modal */}
      <Modal
        visible={createHabitModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          console.log('Closing create habit modal');
          setCreateHabitModalVisible(false);
        }}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={() => {
              console.log('Closing create habit modal from header');
              setCreateHabitModalVisible(false);
            }}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Create Custom Habit</Text>
            <View style={styles.modalPlaceholder} />
          </View>
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>Habit Name</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={customHabitForm.name}
                onChangeText={(text) => setCustomHabitForm(prev => ({ ...prev, name: text }))}
                placeholder="e.g., Read a book"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>Description</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={customHabitForm.description}
                onChangeText={(text) => setCustomHabitForm(prev => ({ ...prev, description: text }))}
                placeholder="Describe your habit..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>Category</Text>
              <View style={styles.categoryButtons}>
                {(['Health', 'MentalClarity', 'Sleep', 'Mood', 'Intimacy', 'Anxiety'] as HabitCategory[]).map(category => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      { backgroundColor: customHabitForm.category === category ? theme.colors.primary : theme.colors.card, borderColor: theme.colors.border },
                    ]}
                    onPress={() => setCustomHabitForm(prev => ({ ...prev, category }))}
                  >
                    <Text style={[
                      styles.categoryButtonText,
                      { color: customHabitForm.category === category ? '#FFFFFF' : theme.colors.text }
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>Streak Goal</Text>
              <View style={styles.streakOptions}>
                {[7, 14, 21, 30].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.streakOption,
                      { 
                        backgroundColor: customHabitForm.streakGoal === days ? theme.colors.primary : theme.colors.card,
                        borderColor: theme.colors.border
                      }
                    ]}
                    onPress={() => setCustomHabitForm(prev => ({ ...prev, streakGoal: days }))}
                  >
                    <Text style={[
                      styles.streakOptionText,
                      { color: customHabitForm.streakGoal === days ? '#FFFFFF' : theme.colors.text }
                    ]}>
                      {days} days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.streakDescription, { color: theme.colors.textSecondary }]}>
                {customHabitForm.streakGoal === 7 ? "Perfect for trying out a new habit" :
                 customHabitForm.streakGoal === 14 ? "Good for building momentum" :
                 customHabitForm.streakGoal === 21 ? "Recommended for habit formation" :
                 "Ideal for lasting change"}
              </Text>
            </View>

            <View style={styles.formSection}>
              <View style={styles.reminderRow}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>Daily Reminder</Text>
                <Switch
                  value={customHabitForm.reminderEnabled}
                  onValueChange={(value) => {
                    setCustomHabitForm(prev => ({ ...prev, reminderEnabled: value }));
                    if (value) {
                      setShowTimePicker(true);
                    }
                  }}
                  trackColor={{ false: theme.colors.textSecondary, true: theme.colors.primary }}
                  thumbColor={theme.colors.background}
                />
              </View>
              {customHabitForm.reminderEnabled && (
                <TouchableOpacity
                  style={[styles.timePickerButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Clock size={20} color={theme.colors.primary} />
                  <Text style={[styles.timePickerText, { color: theme.colors.text }]}>
                    Remind me at {customHabitForm.reminderTime}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            {showTimePicker && (
              <DateTimePicker
                value={(() => {
                  const [hours, minutes] = customHabitForm.reminderTime.split(':');
                  const date = new Date();
                  date.setHours(parseInt(hours, 10));
                  date.setMinutes(parseInt(minutes, 10));
                  return date;
                })()}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, selectedDate) => {
                  setShowTimePicker(false);
                  if (selectedDate) {
                    const hours = selectedDate.getHours().toString().padStart(2, '0');
                    const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
                    setCustomHabitForm(prev => ({
                      ...prev,
                      reminderTime: `${hours}:${minutes}`
                    }));
                  }
                }}
              />
            )}

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleCreateCustomHabit}
            >
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Create & Add to Active Habits</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  // Impact Analysis Card
  loadingContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  insightsContainer: {
    marginTop: 16,
    gap: 8,
  },
  insightText: {
    fontSize: 13,
    lineHeight: 18,
  },
  noDataContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 14,
    textAlign: 'center',
  },
  
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  welcomeCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  greeting: {
    marginBottom: 8,
  },
  quote: {
    fontStyle: 'italic' as const,
  },
  networkBanner: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  networkBannerText: {
    fontSize: 13,
    fontWeight: '500' as const,
    flex: 1,
  },
  guestBanner: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guestBannerText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  guestSignUpButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  guestSignUpText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    marginBottom: 16,
  },
  snapshotGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  snapshotItem: {
    alignItems: 'center',
    flex: 1,
  },
  snapshotEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  snapshotLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  snapshotValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  weeklyCalendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  dayName: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500' as const,
  },
  dayNumber: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  metricBar: {
    width: 32,
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    marginBottom: 4,
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 8,
  },
  moodDot: {
    marginTop: 4,
  },
  moodEmoji: {
    fontSize: 16,
  },
  moodEmojiSmall: {
    fontSize: 14,
    marginRight: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sectionHeader: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  subsectionHeader: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  subsectionDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  habitsScroll: {
    marginBottom: 20,
  },
  habitsScrollContent: {
    paddingLeft: 0,
    paddingRight: 20,
  },
  suggestedCardContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    width: 280,
  },
  suggestedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FEEB99',
  },
  suggestedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FEEB99',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  suggestedBadgeText: {
    color: '#1E1E1E',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  habitName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  quoteContainer: {
    backgroundColor: '#D9F7A3',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 14,
    color: '#1E1E1E',
    fontStyle: 'italic' as const,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500' as const,
  },
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  frequencyText: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '500' as const,
  },
  swipeInstructions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  swipeText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  swipeTextLarge: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  habitActionCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  actionCardSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureText: {
    marginLeft: 16,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  impactGrid: {
    gap: 16,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  impactInfo: {
    flex: 1,
  },
  impactLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#1F2937',
    marginBottom: 6,
  },
  impactBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  impactBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  impactValue: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500' as const,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  recommendationsList: {
    gap: 12,
    marginBottom: 16,
  },
  recommendationItem: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  recommendationText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  seeMoreText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600' as const,
  },
  experimentsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  experimentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  experimentsText: {
    flex: 1,
  },
  experimentsTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  experimentsSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  startButton: {
    backgroundColor: '#FEEB99',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1E1E1E',
  },
  moreHabitsPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    alignSelf: 'center',
  },
  moreHabitsPillText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  summaryCard: {
    backgroundColor: '#D9F7A3',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#A8E6CF',
  },
  summaryText: {
    fontSize: 15,
    color: '#1E1E1E',
    fontWeight: '500' as const,
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  modalPlaceholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: 20,
  },
  modalSection: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  moreHabitItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  moreHabitContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  moreHabitInfo: {
    flex: 1,
    marginRight: 12,
  },
  moreHabitName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  moreHabitDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  moreHabitActions: {
    flexDirection: 'row',
    gap: 8,
  },
  moreHabitIconButton: {
    padding: 8,
    borderRadius: 8,
  },
  moreHabitFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  moreHabitStats: {
    flex: 1,
  },
  moreHabitStreak: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  moreHabitProgress: {
    fontSize: 12,
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 8,
  },
  addHabitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  addHabitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  streakOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  streakOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: '45%',
  },
  streakOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  streakDescription: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic' as const,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  habitLibraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  habitLibraryEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  habitLibraryInfo: {
    flex: 1,
  },
  habitLibraryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  habitLibraryDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  habitLibraryDuration: {
    fontSize: 12,
  },
  addHabitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createCustomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginVertical: 20,
    borderWidth: 1,
    gap: 8,
  },
  createCustomButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
  moreHabitItem: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderBottomWidth: 1,
  },
  moreHabitContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  moreHabitName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  moreHabitDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  moreHabitActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moreHabitAction: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreHabitActionText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  moreHabitStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  moreHabitStreak: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  moreHabitProgress: {
    fontSize: 14,
  },
  habitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  habitGridCard: {
    width: '48%',
    padding: 18,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  habitGridEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  habitGridName: {
    fontSize: 14,
    fontWeight: '600' as const,
    textAlign: 'center',
    marginBottom: 4,
  },
  habitGridDescription: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  addHabitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  addHabitButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  // Search and Category Filter styles
  searchContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  searchInput: {
    fontSize: 16,
  },
  categoryTabsContainer: {
    marginBottom: 16,
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 2,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    gap: 8,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  timePickerText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
});
