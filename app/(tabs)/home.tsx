import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
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
} from 'lucide-react-native';
import { 
  getSuggestedHabits,
  getHabitLibraryData,
  type HabitLibraryItem,
  type HabitCategory,
} from '@/constants/mockData';
import HabitCard from '@/components/HabitCard';
import { HabitsService } from '@/services/habits.service';
import { MoodsService } from '@/services/moods.service';
import { SleepService } from '@/services/sleep.service';
import { AnalyticsService } from '@/services/analytics.service';
import { useRealtimeHabits, useRealtimeMoods, useRealtimeSleep } from '@/hooks/useRealtimeData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ActiveHabit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  quote: string;
  emoji: string;
  streak: number;
  streakGoal: number;
  completedToday: boolean;
  feedback?: string;
  currentDay?: number;
  totalDays?: number;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeHabits, setActiveHabits] = useState<any[]>([]);
  const [moodData, setMoodData] = useState<any[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const suggestedHabits = getSuggestedHabits();
  const [currentSuggestedIndex, setCurrentSuggestedIndex] = useState<number>(0);
  const [moreHabitsModalVisible, setMoreHabitsModalVisible] = useState(false);
  const [habitLibraryModalVisible, setHabitLibraryModalVisible] = useState(false);
  const [createHabitModalVisible, setCreateHabitModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Debug logging
  console.log('Modal states:', { habitLibraryModalVisible, createHabitModalVisible });
  console.log('Active habits count:', activeHabits.length);
  const [expandedCategories, setExpandedCategories] = useState<Set<HabitCategory>>(new Set(['Intimacy', 'Health', 'Mood']));
  const [customHabitForm, setCustomHabitForm] = useState({
    name: '',
    description: '',
    category: 'Health' as HabitCategory,
    frequency: 'Daily',
    reminderEnabled: false,
    reminderTime: '09:00',
    streakGoal: 30,
  });
  
  const habitLibrary = getHabitLibraryData();
  
  // Load data on component mount
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Set up real-time subscriptions
  useRealtimeHabits(user?.id || '', () => {
    if (user) loadData();
  });
  
  useRealtimeMoods(user?.id || '', () => {
    if (user) loadData();
  });
  
  useRealtimeSleep(user?.id || '', () => {
    if (user) loadData();
  });

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [habitsResult, moodResult, sleepResult, recommendationsResult] = await Promise.all([
        HabitsService.getAll(user.id),
        MoodsService.getByDateRange(
          user.id,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        ),
        SleepService.getByDateRange(
          user.id,
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        ),
        AnalyticsService.generateAIRecommendations(user.id)
      ]);

      if (habitsResult.error) throw new Error('Failed to load habits');
      if (moodResult.error) throw new Error('Failed to load mood data');
      if (sleepResult.error) throw new Error('Failed to load sleep data');
      if (recommendationsResult.error) throw new Error('Failed to load recommendations');

      setActiveHabits(habitsResult.data || []);
      setMoodData(moodResult.data || []);
      setSleepData(sleepResult.data || []);
      setAiRecommendations(recommendationsResult.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const todayMood = moodData[moodData.length - 1] || { score: 3, emoji: '😐' };
  const todaySleep = sleepData[sleepData.length - 1] || { hours: 7, emoji: '😴' };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleToggleComplete = async (id: string) => {
    if (!user) return;
    
    try {
      const habit = activeHabits.find(h => h.id === id);
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
    } catch (err) {
      console.error('Error updating habit:', err);
      Alert.alert('Error', 'Failed to update habit');
    }
  };

  const handleFeedback = (id: string, feedback: 'good' | 'neutral' | 'bad') => {
    setActiveHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, feedback } : h))
    );
  };

  const handleToggleReminder = (id: string) => {
    setActiveHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, reminderEnabled: !h.reminderEnabled } : h))
    );
  };

  const handleDeleteHabit = async (id: string) => {
    if (!user) return;
    
    try {
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

  const handleAddHabitFromLibrary = async (habit: HabitLibraryItem) => {
    if (!user) return;
    
    try {
      // Check if habit already exists
      const existingHabit = activeHabits.find(h => h.name === habit.name);
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
      const existingHabit = activeHabits.find(h => h.name.toLowerCase() === customHabitForm.name.trim().toLowerCase());
      if (existingHabit) {
        Alert.alert('Already Exists', `${customHabitForm.name} is already in your active habits!`);
        return;
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

  const toggleCategory = (category: HabitCategory) => {
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

  const pan = useRef(new Animated.ValueXY()).current;
  
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
      useNativeDriver: false,
    }),
    onPanResponderRelease: (_, gesture) => {
      if (Math.abs(gesture.dx) > 120) {
        const direction = gesture.dx > 0 ? 'right' : 'left';
        
        Animated.timing(pan, {
          toValue: { x: direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH, y: 0 },
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          if (direction === 'right') {
            const habit = suggestedHabits[currentSuggestedIndex];
            const newHabit: ActiveHabit = {
              id: `active-${Date.now()}`,
              name: habit.name,
              description: habit.description,
              category: habit.category,
              quote: habit.quote,
              currentDay: 1,
              totalDays: 7,
              completedToday: false,
              reminderEnabled: true,
              streak: 0,
              progressPercentage: 14,
              feedback: undefined,
            };
            setActiveHabits(prev => [...prev, newHabit]);
          }
          
          setCurrentSuggestedIndex((prev) => (prev + 1) % suggestedHabits.length);
          pan.setValue({ x: 0, y: 0 });
        });
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  const currentSuggested = suggestedHabits[currentSuggestedIndex];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading your data...</Text>
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
        <View style={[styles.welcomeCard, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.greeting}>{getGreeting()}, Michael 🌤️</Text>
          <Text style={styles.quote}>
            &ldquo;Small steps every day lead to big changes over time.&rdquo;
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Today&apos;s Snapshot</Text>
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
          <View style={styles.weeklyCalendar}>
            {sleepData.map((day, index) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = date.getDate();
              const mood = moodData[index];
              
              return (
                <View key={day.date} style={styles.dayColumn}>
                  <Text style={[styles.dayName, { color: theme.colors.textSecondary }]}>{dayName}</Text>
                  <Text style={[styles.dayNumber, { color: theme.colors.text }]}>{dayNum}</Text>
                  
                  <View style={styles.metricBar}>
                    <View 
                      style={[
                        styles.barFill, 
                        { 
                          height: `${(day.hours / 10) * 100}%`,
                          backgroundColor: theme.colors.primary,
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>{day.hours}h</Text>
                  
                  <View style={styles.moodDot}>
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  </View>
                </View>
              );
            })}
          </View>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Sleep</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.moodEmojiSmall}>😊</Text>
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Mood</Text>
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
          {currentSuggested && (
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.suggestedCardContainer,
                {
                  transform: [
                    { translateX: pan.x },
                    { 
                      rotate: pan.x.interpolate({
                        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
                        outputRange: ['-10deg', '0deg', '10deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View style={[styles.suggestedCard, { backgroundColor: theme.colors.card }]}>
                <View style={[styles.suggestedBadge, { backgroundColor: theme.colors.primary }]}>
                  <Sparkles size={14} color="#FFFFFF" />
                  <Text style={styles.suggestedBadgeText}>Suggested</Text>
                </View>
                
                <Text style={[styles.habitName, { color: theme.colors.text }]}>{currentSuggested.name}</Text>
                <Text style={[styles.habitDescription, { color: theme.colors.textSecondary }]}>{currentSuggested.description}</Text>

                <View style={[styles.quoteContainer, { backgroundColor: theme.colors.success }]}>
                  <Text style={[styles.quoteText, { color: theme.colors.text }]}>{currentSuggested.quote}</Text>
                </View>

                <View style={styles.benefitRow}>
                  <TrendingUp size={16} color={theme.colors.primary} />
                  <Text style={[styles.benefitText, { color: theme.colors.primary }]}>{currentSuggested.benefit}</Text>
                </View>

                <View style={styles.frequencyRow}>
                  <Zap size={16} color={theme.colors.warning} />
                  <Text style={[styles.frequencyText, { color: theme.colors.warning }]}>{currentSuggested.frequency}</Text>
                </View>

                <View style={styles.swipeInstructions}>
                  <Text style={[styles.swipeText, { color: theme.colors.textSecondary }]}>← Swipe left to dismiss</Text>
                  <Text style={[styles.swipeTextLarge, { color: theme.colors.primary }]}>👉 Swipe right to add this habit</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {activeHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleComplete={handleToggleComplete}
              onFeedback={handleFeedback}
              onToggleReminder={handleToggleReminder}
              onDelete={handleDeleteHabit}
            />
          ))}

          {activeHabits.length >= 3 && (
            <TouchableOpacity 
              style={[styles.moreHabitsPill, { backgroundColor: theme.colors.primary }]}
              onPress={() => setMoreHabitsModalVisible(true)}
            >
              <Text style={styles.moreHabitsPillText}>+ More</Text>
            </TouchableOpacity>
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
          
          {/* Summary Card */}
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.success }]}>
            <Text style={[styles.summaryText, { color: theme.colors.text }]}>
              Your biggest mood booster is 🏋️ Exercise, which improved your mood by 150% this week! Try doing this more often.
            </Text>
          </View>

          <View style={styles.impactGrid}>
            <View style={styles.impactItem}>
              <Brain size={24} color={theme.colors.primary} />
              <View style={styles.impactInfo}>
                <Text style={[styles.impactLabel, { color: theme.colors.text }]}>Mental Clarity</Text>
                <View style={[styles.impactBar, { backgroundColor: theme.colors.border }]}>
                  <View style={[styles.impactBarFill, { width: '85%', backgroundColor: theme.colors.primary }]} />
                </View>
                <Text style={[styles.impactValue, { color: theme.colors.primary }]}>+15% this week</Text>
              </View>
            </View>

            <View style={styles.impactItem}>
              <Text style={[styles.snapshotEmoji, { fontSize: 24 }]}>😊</Text>
              <View style={styles.impactInfo}>
                <Text style={[styles.impactLabel, { color: theme.colors.text }]}>Mood</Text>
                <View style={[styles.impactBar, { backgroundColor: theme.colors.border }]}>
                  <View style={[styles.impactBarFill, { width: '72%', backgroundColor: theme.colors.warning }]} />
                </View>
                <Text style={[styles.impactValue, { color: theme.colors.warning }]}>+8% this week</Text>
              </View>
            </View>

            <View style={styles.impactItem}>
              <Moon size={24} color={theme.colors.primary} />
              <View style={styles.impactInfo}>
                <Text style={[styles.impactLabel, { color: theme.colors.text }]}>Sleep Quality</Text>
                <View style={[styles.impactBar, { backgroundColor: theme.colors.border }]}>
                  <View style={[styles.impactBarFill, { width: '78%', backgroundColor: theme.colors.primary }]} />
                </View>
                <Text style={[styles.impactValue, { color: theme.colors.primary }]}>+12% this week</Text>
              </View>
            </View>
          </View>
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
              Discover more habits to improve your wellbeing
            </Text>
            
            <View style={styles.habitsGrid}>
              {suggestedHabits.slice(1).map((habit, index) => (
                <TouchableOpacity
                  key={`suggested-${index}`}
                  style={[styles.habitGridCard, { backgroundColor: theme.colors.card }]}
                  onPress={() => {
                    // Add habit to active habits
                    const newHabit: ActiveHabit = {
                      id: `active-${Date.now()}-${index}`,
                      name: habit.name,
                      description: habit.description,
                      category: habit.category,
                      currentDay: 1,
                      totalDays: 30,
                      streak: 0,
                      progressPercentage: 0,
                      completedToday: false,
                      feedback: 'neutral',
                      reminderEnabled: false,
                      quote: habit.quote,
                    };
                    setActiveHabits(prev => [...prev, newHabit]);
                    setMoreHabitsModalVisible(false);
                  }}
                >
                  <Text style={styles.habitGridEmoji}>📚</Text>
                  <Text style={[styles.habitGridName, { color: theme.colors.text }]}>{habit.name}</Text>
                  <Text style={[styles.habitGridDescription, { color: theme.colors.textSecondary }]}>
                    {habit.description}
                  </Text>
                  <View style={[styles.addHabitButton, { backgroundColor: theme.colors.primary }]}>
                    <Plus size={16} color="#FFFFFF" />
                    <Text style={styles.addHabitButtonText}>Add</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
            {Object.entries(habitLibrary).map(([category, habits]) => (
              <View key={category} style={styles.categorySection}>
                <TouchableOpacity 
                  onPress={() => toggleCategory(category as HabitCategory)} 
                  style={[styles.categoryHeader, { backgroundColor: theme.colors.card }]}
                >
                  <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>{category}</Text>
                  {expandedCategories.has(category as HabitCategory) ? (
                    <ChevronUp size={20} color={theme.colors.textSecondary} />
                  ) : (
                    <ChevronDown size={20} color={theme.colors.textSecondary} />
                  )}
                </TouchableOpacity>

                {expandedCategories.has(category as HabitCategory) && (
                  <View style={styles.habitsGrid}>
                    {habits.map(habit => (
                      <TouchableOpacity
                        key={habit.id}
                        style={[styles.habitGridCard, { backgroundColor: theme.colors.card }]}
                        onPress={() => handleAddHabitFromLibrary(habit)}
                      >
                        <Text style={styles.habitGridEmoji}>{habit.emoji}</Text>
                        <Text style={[styles.habitGridName, { color: theme.colors.text }]}>{habit.name}</Text>
                        <Text style={[styles.habitGridDescription, { color: theme.colors.textSecondary }]}>
                          {habit.description}
                        </Text>
                        <View style={[styles.addHabitButton, { backgroundColor: theme.colors.primary }]}>
                          <Plus size={16} color="#FFFFFF" />
                          <Text style={styles.addHabitButtonText}>Add to Active</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
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
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>Streak Goal (Days)</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
                value={customHabitForm.streakGoal.toString()}
                onChangeText={(text) => setCustomHabitForm(prev => ({ ...prev, streakGoal: parseInt(text) || 30 }))}
                placeholder="30"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formSection}>
              <View style={styles.reminderRow}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>Enable Reminder</Text>
                <Switch
                  value={customHabitForm.reminderEnabled}
                  onValueChange={(value) => setCustomHabitForm(prev => ({ ...prev, reminderEnabled: value }))}
                  trackColor={{ false: theme.colors.textSecondary, true: theme.colors.primary }}
                  thumbColor={theme.colors.background}
                />
              </View>
            </View>

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
    borderRadius: 20,
    backgroundColor: '#667eea',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  quote: {
    fontSize: 15,
    color: '#E0E7FF',
    fontStyle: 'italic' as const,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#1F2937',
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
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  suggestedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
    gap: 6,
  },
  suggestedBadgeText: {
    color: '#FFFFFF',
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
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 13,
    color: '#065F46',
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
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    backgroundColor: '#06B6D4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
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
  summaryCard: {
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  summaryText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '500' as const,
    lineHeight: 20,
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  habitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  habitGridCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 4,
  },
  addHabitButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
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
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
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
});
