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
import { MentalClarityService } from '@/services/mentalClarity.service';
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
  instruction: string;
}

const PREDEFINED_HABITS: PredefinedHabit[] = [
  // Mental Clarity
  { name: 'Morning Meditation', description: 'Start your day with 10 minutes of mindfulness', category: 'MentalClarity', emoji: '🧘', totalDays: 30, instruction: 'Find a quiet space, sit comfortably, close your eyes, and focus on your breath for 10 minutes.' },
  { name: 'Journaling', description: 'Write down your thoughts and reflections', category: 'MentalClarity', emoji: '📝', totalDays: 30, instruction: 'Take 10-15 minutes to write freely about your day, feelings, or goals.' },
  { name: 'Digital Detox Hour', description: 'One hour without screens', category: 'MentalClarity', emoji: '📵', totalDays: 21, instruction: 'Put away all devices for one hour. Try reading, walking, or spending time with loved ones.' },
  { name: 'Reading 30 Minutes', description: 'Read books to expand your mind', category: 'MentalClarity', emoji: '📚', totalDays: 30, instruction: 'Choose a book you enjoy and read for at least 30 minutes without distractions.' },
  { name: 'Brain Training', description: 'Puzzles, games, or learning something new', category: 'MentalClarity', emoji: '🧩', totalDays: 30, instruction: 'Spend 15-20 minutes on puzzles, brain games, or learning a new skill.' },
  
  // Health
  { name: 'Morning Exercise', description: '30 minutes of physical activity', category: 'Health', emoji: '🏃', totalDays: 30, instruction: 'Do 30 minutes of cardio, strength training, or your preferred workout. Start with a warm-up!' },
  { name: 'Drink 8 Glasses of Water', description: 'Stay hydrated throughout the day', category: 'Health', emoji: '💧', totalDays: 30, instruction: 'Aim for 8 glasses (64 oz) of water. Keep a water bottle with you throughout the day.' },
  { name: 'Healthy Breakfast', description: 'Start with a nutritious meal', category: 'Health', emoji: '🥗', totalDays: 30, instruction: 'Include protein, whole grains, and fruits/vegetables in your breakfast.' },
  { name: 'Evening Walk', description: '20-minute walk after dinner', category: 'Health', emoji: '🚶', totalDays: 30, instruction: 'Take a 20-minute walk after dinner to aid digestion and clear your mind.' },
  { name: 'Stretching Routine', description: 'Daily flexibility exercises', category: 'Health', emoji: '🤸', totalDays: 21, instruction: 'Spend 10-15 minutes stretching major muscle groups. Hold each stretch for 20-30 seconds.' },
  
  // Sleep
  { name: 'Consistent Bedtime', description: 'Go to bed at the same time daily', category: 'Sleep', emoji: '😴', totalDays: 30, instruction: 'Choose a bedtime and stick to it every night, even on weekends. Your body loves routine!' },
  { name: 'No Screens 1 Hour Before Bed', description: 'Wind down without blue light', category: 'Sleep', emoji: '📱', totalDays: 21, instruction: 'Turn off all screens 1 hour before bed. Blue light disrupts your natural sleep cycle.' },
  { name: 'Evening Tea Ritual', description: 'Calming herbal tea before sleep', category: 'Sleep', emoji: '🍵', totalDays: 30, instruction: 'Prepare a cup of chamomile, lavender, or other calming herbal tea 1 hour before bed.' },
  { name: 'Cool Bedroom', description: 'Maintain optimal sleep temperature', category: 'Sleep', emoji: '❄️', totalDays: 30, instruction: 'Keep your bedroom between 60-67°F (15-19°C) for optimal sleep quality.' },
  { name: 'Bedtime Reading', description: 'Read a book to relax', category: 'Sleep', emoji: '📖', totalDays: 30, instruction: 'Read a physical book (not on a screen) for 15-30 minutes before sleep.' },
  
  // Mood
  { name: 'Gratitude Practice', description: 'List 3 things you\'re grateful for', category: 'Mood', emoji: '🙏', totalDays: 30, instruction: 'Write down 3 specific things you\'re grateful for today. Focus on why they matter to you.' },
  { name: 'Morning Sunlight', description: '10 minutes of natural light exposure', category: 'Mood', emoji: '☀️', totalDays: 30, instruction: 'Get outside or sit by a window for 10 minutes within an hour of waking up.' },
  { name: 'Connect with Loved Ones', description: 'Quality time with family/friends', category: 'Mood', emoji: '👥', totalDays: 21, instruction: 'Spend quality time with someone you care about. Have a meaningful conversation or activity together.' },
  { name: 'Random Act of Kindness', description: 'Do something nice for someone', category: 'Mood', emoji: '💝', totalDays: 30, instruction: 'Perform one kind act today - it could be a compliment, helping someone, or a small gift.' },
  { name: 'Listen to Uplifting Music', description: 'Boost your mood with music', category: 'Mood', emoji: '🎵', totalDays: 30, instruction: 'Play your favorite uplifting songs for at least 15 minutes. Sing or dance along!' },
  
  // Intimacy
  { name: 'Quality Time Together', description: 'Dedicated time with partner', category: 'Intimacy', emoji: '❤️', totalDays: 30, instruction: 'Spend at least 30 minutes of uninterrupted quality time with your partner.' },
  { name: 'Daily Check-in', description: 'Share feelings and experiences', category: 'Intimacy', emoji: '💬', totalDays: 30, instruction: 'Have a 10-minute conversation about your day, feelings, and experiences with your partner.' },
  { name: 'Physical Affection', description: 'Hugs, kisses, or cuddles', category: 'Intimacy', emoji: '🤗', totalDays: 30, instruction: 'Show physical affection through hugs, kisses, or cuddling. Physical touch strengthens bonds.' },
  { name: 'Date Night', description: 'Weekly special time together', category: 'Intimacy', emoji: '🌹', totalDays: 7, instruction: 'Plan and enjoy a special date - it can be at home or out. Focus on connecting!' },
  { name: 'Express Appreciation', description: 'Tell partner what you love about them', category: 'Intimacy', emoji: '💕', totalDays: 30, instruction: 'Tell your partner one specific thing you appreciate or love about them today.' },
  
  // Anxiety
  { name: 'Deep Breathing Exercises', description: '5 minutes of calm breathing', category: 'Anxiety', emoji: '🌬️', totalDays: 30, instruction: 'Practice 4-7-8 breathing: Inhale for 4, hold for 7, exhale for 8. Repeat for 5 minutes.' },
  { name: 'Progressive Muscle Relaxation', description: 'Release tension from your body', category: 'Anxiety', emoji: '💆', totalDays: 21, instruction: 'Tense and relax each muscle group from toes to head, holding for 5 seconds each.' },
  { name: 'Worry Time', description: 'Set aside 15 minutes to address concerns', category: 'Anxiety', emoji: '⏰', totalDays: 30, instruction: 'Schedule 15 minutes to write down worries. Then set them aside and focus on what you can control.' },
  { name: 'Nature Therapy', description: 'Spend time outdoors', category: 'Anxiety', emoji: '🌳', totalDays: 30, instruction: 'Spend at least 20 minutes in nature. Notice the sights, sounds, and smells around you.' },
  { name: 'Limit Caffeine', description: 'Reduce anxiety-inducing stimulants', category: 'Anxiety', emoji: '☕', totalDays: 21, instruction: 'Limit caffeine to morning hours only. Try herbal tea or water instead.' },
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
  const [mentalClarityData, setMentalClarityData] = useState<any[]>([]);
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
  const [selectedHabitDetail, setSelectedHabitDetail] = useState<typeof PREDEFINED_HABITS[0] | null>(null);
  const [habitDetailModalVisible, setHabitDetailModalVisible] = useState(false);
  const [customStreakGoal, setCustomStreakGoal] = useState(30);
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
      setMentalClarityData([]);
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
      setMentalClarityData([]);
      setAiRecommendations([]);
      setLoading(false);
      return;
    }
    
    const effectiveUserId = user?.id || 'guest_user';
    setLoading(true);
    setError(null);
    
    try {
      const [habitsResult, moodResult, sleepResult, clarityResult, recommendationsResult, impactResult] = await Promise.all([
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
        MentalClarityService.getByDateRange(
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
      if (clarityResult.error && clarityResult.error !== 'No data found') {
        console.warn('Failed to load mental clarity data:', clarityResult.error);
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
      setMentalClarityData(clarityResult.data || []);
      setAiRecommendations(recommendationsResult.data || []);
      setImpactData(impactResult.data || null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Get today's data with proper fallbacks
  const today = new Date().toISOString().split('T')[0];
  
  const getTodayMood = () => {
    const todayEntry = moodData.find((m: any) => m.date === today);
    if (todayEntry) {
      return {
        score: todayEntry.score || 0,
        emoji: todayEntry.emoji || '😐'
      };
    }
    return { score: 0, emoji: '😐' };
  };

  const getTodaySleep = () => {
    const todayEntry = sleepData.find((s: any) => s.date === today);
    if (todayEntry) {
      return {
        hours: todayEntry.hours || 0,
        quality: todayEntry.quality || 'fair',
        emoji: todayEntry.emoji || '😴'
      };
    }
    return { hours: 0, quality: 'none', emoji: '😴' };
  };

  const getTodayClarity = () => {
    const todayEntry = mentalClarityData.find((c: any) => c.date === today);
    if (todayEntry) {
      const score = todayEntry.score || todayEntry.clarity_score || 0;
      let level = 'None';
      if (score >= 80) level = 'High';
      else if (score >= 60) level = 'Good';
      else if (score >= 40) level = 'Fair';
      else if (score > 0) level = 'Low';
      
      return { score, level };
    }
    return { score: 0, level: 'None' };
  };

  const getCurrentStreak = () => {
    if (!activeHabits || activeHabits.length === 0) return 0;
    
    // Calculate the longest current streak across all habits
    const streaks = activeHabits.map((habit: any) => habit.current_streak || habit.streak || 0);
    return Math.max(...streaks, 0);
  };

  const todayMood = getTodayMood();
  const todaySleep = getTodaySleep();
  const todayClarity = getTodayClarity();
  const currentStreak = getCurrentStreak();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserDisplayName = () => {
    if (isGuest) return 'Guest';
    
    if (user) {
      // Check if user has user_metadata with a name
      if (user.user_metadata?.name || user.user_metadata?.full_name) {
        return user.user_metadata.name || user.user_metadata.full_name;
      }
      
      // Extract name from email (part before @)
      if (user.email) {
        const emailUsername = user.email.split('@')[0];
        // Capitalize first letter and clean up any dots/underscores
        const cleanName = emailUsername
          .replace(/[._-]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        return cleanName;
      }
    }
    
    return 'there';
  };

  // Get habit-specific motivational quotes
  const getHabitMotivationalQuote = (habitName: string, category: HabitCategory): string => {
    const quotes: { [key: string]: string[] } = {
      'Morning Meditation': [
        "🧘 Mindfulness unlocked! Your calm mind is your superpower! ✨",
        "🧘 Another day of inner peace! You're mastering your mental clarity! 🌟",
        "🧘 Meditation complete! Your focused mind will carry you through the day! 💫"
      ],
      'Journaling': [
        "📝 Great reflection! Writing clarifies thoughts and strengthens your self-awareness! ✨",
        "📝 Your thoughts matter! Journaling is building your emotional intelligence! 🌟",
        "📝 Words on paper, clarity in mind! Keep documenting your journey! 💫"
      ],
      'Digital Detox Hour': [
        "📵 Screen-free success! You're reclaiming your attention and presence! 🌟",
        "📵 Disconnected to reconnect! Your mind thanks you for the break! ✨",
        "📵 Digital wellness achieved! Real life is where the magic happens! 💫"
      ],
      'Reading 30 Minutes': [
        "📚 Knowledge gained! Every page read expands your world! 🌟",
        "📚 Another chapter of growth! Reading rewires your brain for success! ✨",
        "📚 Book time complete! You're investing in your mental library! 💫"
      ],
      'Brain Training': [
        "🧩 Mental workout done! Your brain is getting sharper every day! 🌟",
        "🧩 Neurons firing! You're building cognitive resilience! ✨",
        "🧩 Brain gains achieved! Keep challenging your beautiful mind! 💫"
      ],
      'Morning Exercise': [
        "🏃 Workout crushed! Your body is thanking you right now! 💪",
        "🏃 Energy boosted! Exercise is your daily dose of strength! 🌟",
        "🏃 Movement complete! You're building a healthier, stronger you! ✨"
      ],
      'Drink 8 Glasses of Water': [
        "💧 Hydration hero! Your body is running at peak performance! 🌟",
        "💧 Water goal met! Every cell in your body is celebrating! ✨",
        "💧 Liquid gold consumed! Hydration is the foundation of health! 💫"
      ],
      'Healthy Breakfast': [
        "🥗 Nutrition win! You're fueling your body for success! 🌟",
        "🥗 Breakfast champion! Great food, great mood, great day! ✨",
        "🥗 Healthy start achieved! Your body is your temple! 💫"
      ],
      'Evening Walk': [
        "🚶 Steps taken, stress released! Walking is meditation in motion! 🌟",
        "🚶 Movement milestone! Your heart and mind are thanking you! ✨",
        "🚶 Walk completed! Simple habits create extraordinary results! 💫"
      ],
      'Stretching Routine': [
        "🤸 Flexibility gained! Your body moves better when you treat it well! 🌟",
        "🤸 Stretch complete! You're preventing pain and building mobility! ✨",
        "🤸 Limber and lovely! Flexibility is youth preserved! 💫"
      ],
      'Consistent Bedtime': [
        "😴 Sleep routine locked in! Consistency is the key to great rest! 🌟",
        "😴 Bedtime achieved! Your circadian rhythm is loving this! ✨",
        "😴 Rest ritual complete! Quality sleep = quality life! 💫"
      ],
      'No Screens 1 Hour Before Bed': [
        "📱 Blue light blocked! Your melatonin production is thanking you! 🌟",
        "📱 Screen-free success! Better sleep starts with this choice! ✨",
        "📱 Digital sunset achieved! Your brain can now prepare for rest! 💫"
      ],
      'Evening Tea Ritual': [
        "🍵 Tea time tranquility! You're creating peaceful evenings! 🌟",
        "🍵 Ritual complete! Calm sips lead to calm sleep! ✨",
        "🍵 Herbal harmony! Your body is entering relaxation mode! 💫"
      ],
      'Cool Bedroom': [
        "❄️ Temperature optimized! Your sleep quality just leveled up! 🌟",
        "❄️ Cool comfort achieved! Science backs your sleep setup! ✨",
        "❄️ Chill zone activated! Perfect temp for perfect rest! 💫"
      ],
      'Bedtime Reading': [
        "📖 Page turner! Reading before bed is the ultimate wind-down! 🌟",
        "📖 Book and bed combo! You're training your brain to relax! ✨",
        "📖 Literary lullaby! Stories are the gateway to great sleep! 💫"
      ],
      'Gratitude Practice': [
        "🙏 Gratitude expressed! Thankfulness rewires your brain for happiness! 🌟",
        "🙏 Appreciation logged! You're cultivating lasting joy! ✨",
        "🙏 Grateful heart! Counting blessings multiplies them! 💫"
      ],
      'Morning Sunlight': [
        "☀️ Sunshine absorbed! Natural light is nature's antidepressant! 🌟",
        "☀️ Vitamin D achieved! Your mood and energy are soaring! ✨",
        "☀️ Light therapy complete! Sunlight is free medicine! 💫"
      ],
      'Connect with Loved Ones': [
        "👥 Connection made! Relationships are the heart of happiness! 🌟",
        "👥 Quality time logged! Love and laughter are the best medicine! ✨",
        "👥 Bond strengthened! Together is better! 💫"
      ],
      'Random Act of Kindness': [
        "💝 Kindness shared! You're making the world brighter! 🌟",
        "💝 Goodness multiplied! Your generosity ripples outward! ✨",
        "💝 Heart full! Kindness always comes back to you! 💫"
      ],
      'Listen to Uplifting Music': [
        "🎵 Vibes elevated! Music is therapy for the soul! 🌟",
        "🎵 Melody magic! Your mood just got a natural boost! ✨",
        "🎵 Rhythm therapy complete! Let the good times flow! 💫"
      ],
      'Quality Time Together': [
        "❤️ Love time logged! Together moments create lasting memories! 🌟",
        "❤️ Connection deepened! Quality time is the language of love! ✨",
        "❤️ Partnership strengthened! You're investing in what matters! 💫"
      ],
      'Daily Check-in': [
        "💬 Communication win! Sharing builds intimacy and trust! 🌟",
        "💬 Hearts connected! Talking brings you closer together! ✨",
        "💬 Understanding deepened! Your relationship is thriving! 💫"
      ],
      'Physical Affection': [
        "🤗 Touch shared! Physical connection releases bonding hormones! 🌟",
        "🤗 Warmth exchanged! Affection is the glue of relationships! ✨",
        "🤗 Love expressed! Touch speaks louder than words! 💫"
      ],
      'Date Night': [
        "🌹 Romance revived! Special moments keep love alive! 🌟",
        "🌹 Date night success! You're prioritizing your connection! ✨",
        "🌹 Love celebrated! Keep choosing each other! 💫"
      ],
      'Express Appreciation': [
        "💕 Gratitude shared! Appreciation strengthens every bond! 🌟",
        "💕 Love expressed! Your words matter more than you know! ✨",
        "💕 Recognition given! You're building a culture of appreciation! 💫"
      ],
      'Deep Breathing Exercises': [
        "🌬️ Breath mastered! You're controlling stress at its source! 🌟",
        "🌬️ Calm activated! Your nervous system is in your hands! ✨",
        "🌬️ Anxiety tamed! Breath is your portable peace tool! 💫"
      ],
      'Progressive Muscle Relaxation': [
        "💆 Tension released! Your body is unwinding beautifully! 🌟",
        "💆 Relaxation achieved! You're training your body to let go! ✨",
        "💆 Stress melted! PMR is your secret weapon against anxiety! 💫"
      ],
      'Worry Time': [
        "⏰ Worries contained! You're taking control of anxious thoughts! 🌟",
        "⏰ Mental clarity gained! Scheduled worry time works wonders! ✨",
        "⏰ Peace restored! You've given anxiety its time, now move forward! 💫"
      ],
      'Nature Therapy': [
        "🌳 Nature embraced! The outdoors is healing your mind and body! 🌟",
        "🌳 Green therapy complete! Nature reduces stress instantly! ✨",
        "🌳 Earth connection made! You're grounded and centered! 💫"
      ],
      'Limit Caffeine': [
        "☕ Caffeine controlled! Your anxiety levels are stabilizing! 🌟",
        "☕ Balance achieved! Less caffeine = more calm! ✨",
        "☕ Smart choice! Your nervous system is thanking you! 💫"
      ]
    };

    // Get quotes for the specific habit, or use category-based fallback
    const habitQuotes = quotes[habitName];
    
    if (habitQuotes && habitQuotes.length > 0) {
      return habitQuotes[Math.floor(Math.random() * habitQuotes.length)];
    }

    // Category-based fallback quotes
    const categoryQuotes: { [key in HabitCategory]: string[] } = {
      'MentalClarity': [
        "🧠 Mental clarity achieved! Your focused mind is unstoppable! 🌟",
        "🧠 Brain power activated! Keep training your magnificent mind! ✨",
        "🧠 Clarity unlocked! You're building mental excellence! 💫"
      ],
      'Health': [
        "💪 Health habit crushed! Your body is your greatest asset! 🌟",
        "💪 Wellness win! You're investing in a healthier you! ✨",
        "💪 Vitality boosted! Keep prioritizing your health! 💫"
      ],
      'Sleep': [
        "😴 Sleep habit complete! Quality rest = quality life! 🌟",
        "😴 Rest ritual achieved! You're optimizing your recovery! ✨",
        "😴 Sleep success! Your body repairs while you dream! 💫"
      ],
      'Mood': [
        "😊 Mood booster activated! You're cultivating joy daily! 🌟",
        "😊 Happiness habit! You're training your brain for positivity! ✨",
        "😊 Joy created! Your mood is in your hands! 💫"
      ],
      'Intimacy': [
        "❤️ Connection deepened! Love grows with attention! 🌟",
        "❤️ Intimacy strengthened! You're nurturing your bond! ✨",
        "❤️ Relationship flourishing! Keep investing in love! 💫"
      ],
      'Anxiety': [
        "🛡️ Anxiety managed! You're building emotional resilience! 🌟",
        "🛡️ Calm cultivated! You're taking control of your peace! ✨",
        "🛡️ Stress reduced! Your tools are working! 💫"
      ]
    };

    const fallbackQuotes = categoryQuotes[category];
    return fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
  };

  const handleToggleComplete = async (id: string) => {
    if (!user && !isGuest) return;
    
    try {
      const habit = activeHabits.find(h => h?.id === id);
      if (!habit) return;

      const today = new Date().toISOString().split('T')[0];
      const isCurrentlyCompleted = habit.completedToday;
      const newCompletedState = !isCurrentlyCompleted;
      
      // Log the habit completion
      const { error } = await HabitsService.logHabit(
        id,
        {
          date: today,
          completed: newCompletedState,
          feedback: 'good'
        },
        user?.id || 'guest_user'
      );

      if (error) {
        Alert.alert('Error', 'Failed to update habit');
        return;
      }

      // Fetch updated habit with recalculated streak
      const { data: updatedHabit, error: fetchError } = await HabitsService.getById(id, user?.id || 'guest_user');
      
      if (fetchError || !updatedHabit) {
        console.error('Error fetching updated habit:', fetchError);
        // Fallback: update local state with basic calculation
        setActiveHabits(prev =>
          prev.map(h =>
            h.id === id ? { 
              ...h, 
              completedToday: newCompletedState,
              streak: newCompletedState ? (h.streak || 0) + 1 : h.streak,
              current_streak: newCompletedState ? (h.current_streak || h.streak || 0) + 1 : (h.current_streak || h.streak)
            } : h
          )
        );
      } else {
        // Update local state with accurate data from database
        setActiveHabits(prev =>
          prev.map(h =>
            h.id === id ? { 
              ...h, 
              completedToday: newCompletedState,
              streak: updatedHabit.streak || 0,
              current_streak: updatedHabit.streak || updatedHabit.current_streak || 0
            } : h
          )
        );
      }

      // Show celebration for completion
      if (newCompletedState) {
        const motivationalQuote = getHabitMotivationalQuote(habit.name, habit.category);
        
        Alert.alert(
          "Habit Completed! 🎉",
          motivationalQuote,
          [{ text: "Thanks!", style: "default" }]
        );
      }
    } catch (err) {
      console.error('Error updating habit:', err);
      Alert.alert('Error', 'Failed to update habit');
    }
  };

  const handleFeedback = async (id: string, feedback: 'good' | 'neutral' | 'bad') => {
    if (!user && !isGuest) return;

    try {
      const habit = activeHabits.find(h => h.id === id);
      
      // If feedback is bad, ask user if they want to adjust the habit
      if (feedback === 'bad') {
        Alert.alert(
          'Habit Not Working?',
          'This habit seems challenging. Would you like to explore other habits that might work better for you?',
          [
            {
              text: 'No, Keep It',
              style: 'cancel',
              onPress: async () => {
                // Still save the bad feedback
                await saveFeedback(id, feedback);
              }
            },
            {
              text: 'Yes, Adjust',
              style: 'default',
              onPress: () => {
                // Redirect to habit library
                setHabitLibraryModalVisible(true);
              }
            }
          ]
        );
        return;
      }

      // For good or neutral feedback, save directly
      await saveFeedback(id, feedback);

      // Show feedback message for good feedback
      if (feedback === 'good') {
        Alert.alert('Great job! 🎉', 'Keep up the good work!');
      }
    } catch (err) {
      console.error('Error saving feedback:', err);
      Alert.alert('Error', 'Failed to save feedback');
    }
  };

  const saveFeedback = async (id: string, feedback: 'good' | 'neutral' | 'bad') => {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await HabitsService.logHabit(
      id,
      {
        date: today,
        feedback,
        completed: true // If they're giving feedback, it must be completed
      },
      user?.id || 'guest_user'
    );

    if (error) {
      Alert.alert('Error', 'Failed to save feedback');
      return;
    }

    // Update local state
    setActiveHabits(prev =>
      prev.map(h => (h.id === id ? { ...h, feedback } : h))
    );
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

  const handleAddPredefinedHabit = async (habit: PredefinedHabit, streakGoal?: number) => {
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
        total_days: streakGoal || habit.totalDays,
        streak: 0,
        reminder_enabled: false,
        instruction: habit.instruction,
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
        borderColor: theme.colors.accent,
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
        borderColor: theme.colors.accent,
        borderRadius: theme.borderRadius.base,
        ...theme.shadows.small,
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
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
          ]}>{getGreeting()}, {getUserDisplayName()} 🌤️</Text>
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
            borderColor: theme.colors.accent,
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
              <Text style={[styles.snapshotValue, { color: theme.colors.text }]}>
                {todayMood.score > 0 ? `${todayMood.score}/5` : '0'}
              </Text>
            </View>
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotEmoji}>{todaySleep.emoji}</Text>
              <Text style={[styles.snapshotLabel, { color: theme.colors.textSecondary }]}>Sleep</Text>
              <Text style={[styles.snapshotValue, { color: theme.colors.text }]}>
                {todaySleep.hours > 0 ? `${todaySleep.hours}h` : '0h'}
              </Text>
            </View>
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotEmoji}>🧠</Text>
              <Text style={[styles.snapshotLabel, { color: theme.colors.textSecondary }]}>Clarity</Text>
              <Text style={[styles.snapshotValue, { color: theme.colors.text }]}>
                {todayClarity.level}
              </Text>
            </View>
            <View style={styles.snapshotItem}>
              <Text style={styles.snapshotEmoji}>🔥</Text>
              <Text style={[styles.snapshotLabel, { color: theme.colors.textSecondary }]}>Streak</Text>
              <Text style={[styles.snapshotValue, { color: theme.colors.text }]}>
                {currentStreak > 0 ? `${currentStreak} day${currentStreak !== 1 ? 's' : ''}` : '0'}
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Overview - moved up from below */}
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.accent }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Weekly Overview</Text>
          <MiniCalendar
            data={(() => {
              // Generate last 7 days
              const days = [];
              for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                
                // Get habits data for this day
                const habitsForDay = activeHabits.map(habit => {
                  const log = habit.logs?.find((l: any) => l.date === dateStr);
                  return {
                    completed: log?.completed || false,
                    feedback: log?.feedback || 'neutral'
                  };
                });
                
                const completedHabits = habitsForDay.filter(h => h.completed).length;
                const totalHabits = activeHabits.length;
                
                // Get mood data for this day
                const moodForDay = moodData.find((m: any) => m.date === dateStr);
                const hasMood = !!moodForDay;
                
                // Get sleep data for this day
                const sleepForDay = sleepData.find((s: any) => s.date === dateStr);
                const hasSleep = !!sleepForDay;
                
                // Calculate overall completion rate
                const habitCompletionRate = totalHabits > 0 ? completedHabits / totalHabits : 0;
                
                // Determine if this day has any data
                const hasData = completedHabits > 0 || hasMood || hasSleep;
                
                // Calculate feedback counts
                const feedbackCounts = habitsForDay.reduce((acc, h) => {
                  if (h.completed) {
                    acc[h.feedback] = (acc[h.feedback] || 0) + 1;
                  }
                  return acc;
                }, { good: 0, neutral: 0, bad: 0 });
                
                days.push({
                  date: dateStr,
                  completedHabits,
                  totalHabits,
                  hasData,
                  hasMood,
                  hasSleep,
                  habitCompletionRate,
                  moodData: moodForDay,
                  sleepData: sleepForDay,
                  feedback: feedbackCounts
                });
              }
              return days;
            })()}
          />
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Completed</Text>
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

        {/* Main Habits Header */}
        <View style={styles.mainHabitsHeader}>
          <Text style={[styles.mainHabitsTitle, { color: theme.colors.text }]}>
            Build Simple Habits, Big Results
          </Text>
          <Text style={[styles.mainHabitsDescription, { color: theme.colors.textSecondary }]}>
            Small daily actions create lasting change
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Active Habits</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>Track your daily progress</Text>
        </View>

        {!activeHabits || activeHabits.length === 0 ? (
          <EmptyStateCard
            title="No Active Habits Yet"
            message="Start building healthy habits to improve your wellness journey. Add your first habit to get started!"
            ctaText="Add First Habit"
            onCtaPress={() => setHabitLibraryModalVisible(true)}
            icon={<Target size={48} color={theme.colors.accent} />}
          />
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.habitsScrollContent}
            style={styles.habitsScroll}
          >
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
            </ScrollView>
          )}

        {/* Browse Habit Library & Create Custom Habit Cards */}
        <View style={styles.habitActionCards}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.accent }]}
            onPress={() => {
              console.log('Opening habit library modal');
              setHabitLibraryModalVisible(true);
            }}
          >
            <Library size={28} color={theme.colors.primary} />
            <Text style={[styles.actionCardTitle, { color: theme.colors.text }]}>Browse Habit Library</Text>
            <Text style={[styles.actionCardSubtitle, { color: theme.colors.textSecondary }]}>
              Explore categorized habits
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.accent }]}
            onPress={() => {
              console.log('Opening create habit modal');
              setCreateHabitModalVisible(true);
            }}
          >
            <Plus size={28} color={theme.colors.primary} />
            <Text style={[styles.actionCardTitle, { color: theme.colors.text }]}>Create Custom Habit</Text>
            <Text style={[styles.actionCardSubtitle, { color: theme.colors.textSecondary }]}>
              Design your own habit
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.featureCard, { backgroundColor: theme.colors.card }]}
          onPress={() => router.push('/sleep-wellness' as any)}
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

        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.accent }]}>
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
            <View style={[styles.errorContainer, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
              <TouchableOpacity 
                style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
                onPress={loadData}
              >
                <Text style={[styles.retryButtonText, { color: '#FFFFFF' }]}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Dynamic Top Impact Activity Card */}
              {impactData?.topActivity && (
                <View style={[
                  styles.summaryCard, 
                  { 
                    backgroundColor: theme.colors.accent,
                    borderLeftColor: theme.colors.primary
                  }
                ]}>
                  <Text style={[styles.summaryText, { color: theme.colors.text }]}>
                    {impactData.topActivity.emoji} {impactData.topActivity.name} has the highest positive impact on your wellbeing! Keep it up! 🎉
                  </Text>
                </View>
              )}

              <View styles={styles.impactGrid}>
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
                          {correlation.name || correlation.category}
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
              {impactData?.insights && impactData.insights.length > 0 && (
                <View style={styles.insightsContainer}>
                  {impactData.insights.map((insight, index) => (
                    <Text key={index} style={[styles.insightText, { color: theme.colors.textSecondary }]}>
                      • {insight}
                    </Text>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.accent }]}>
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

            {/* Habits Grid - Compact Card Layout */}
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

              return (
                <View key={category} style={styles.categorySection}>
                  <Text style={[styles.categorySectionTitle, { color: theme.colors.text }]}>
                    {category.replace(/([A-Z])/g, ' $1').trim()} ({habitsInCategory.length})
                  </Text>

                  <View style={styles.habitsGrid}>
                    {habitsInCategory.map((habit, index) => {
                      const isAlreadyActive = activeHabits.some(h => h.name.toLowerCase() === habit.name.toLowerCase());

                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.habitCompactCard,
                            { 
                              backgroundColor: theme.colors.card,
                              borderColor: theme.colors.accent,
                            }
                          ]}
                          onPress={() => {
                            setSelectedHabitDetail(habit);
                            setCustomStreakGoal(habit.totalDays); // Initialize with default
                            setHabitDetailModalVisible(true);
                          }}
                        >
                          <View style={styles.habitCompactCardContent}>
                            <Text style={styles.habitCompactEmoji}>{habit.emoji}</Text>
                            <Text 
                              style={[styles.habitCompactName, { color: theme.colors.text }]}
                              numberOfLines={2}
                            >
                              {habit.name}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={[
                              styles.habitCompactAddButton,
                              { backgroundColor: isAlreadyActive ? theme.colors.surfaceVariant : theme.colors.primary }
                            ]}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleAddPredefinedHabit(habit);
                            }}
                            disabled={isAlreadyActive}
                          >
                            <Plus size={14} color={isAlreadyActive ? theme.colors.textSecondary : '#FFFFFF'} />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
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

      {/* Habit Detail Modal */}
      <Modal
        visible={habitDetailModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          setHabitDetailModalVisible(false);
          setCustomStreakGoal(30); // Reset to default
        }}
      >
        <View style={styles.habitDetailOverlay}>
          <View style={[styles.habitDetailModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.habitDetailHeader}>
              <Text style={styles.habitDetailEmoji}>{selectedHabitDetail?.emoji}</Text>
              <TouchableOpacity
                style={styles.habitDetailCloseButton}
                onPress={() => {
                  setHabitDetailModalVisible(false);
                  setCustomStreakGoal(30);
                }}
              >
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.habitDetailName, { color: theme.colors.text }]}>
                {selectedHabitDetail?.name}
              </Text>
              
              <View style={[styles.habitDetailBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.habitDetailBadgeText}>
                  {selectedHabitDetail?.category.replace(/([A-Z])/g, ' $1').trim()}
                </Text>
              </View>

              <Text style={[styles.habitDetailLabel, { color: theme.colors.textSecondary }]}>
                Description
              </Text>
              <Text style={[styles.habitDetailDescription, { color: theme.colors.text }]}>
                {selectedHabitDetail?.description}
              </Text>

              <Text style={[styles.habitDetailLabel, { color: theme.colors.textSecondary }]}>
                Instructions
              </Text>
              <Text style={[styles.habitDetailDescription, { color: theme.colors.text }]}>
                {selectedHabitDetail?.instruction || 'Practice this habit daily at a consistent time. Start small and gradually build consistency. Track your progress and celebrate small wins along the way.'}
              </Text>

              <Text style={[styles.habitDetailLabel, { color: theme.colors.textSecondary }]}>
                Expected Outcome
              </Text>
              <Text style={[styles.habitDetailDescription, { color: theme.colors.text }]}>
                By completing this {selectedHabitDetail?.totalDays}-day challenge, you'll develop a lasting habit that improves your {selectedHabitDetail?.category.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}. Expect to see positive changes in your overall wellness, increased self-discipline, and a sense of accomplishment.
              </Text>

              <Text style={[styles.habitDetailLabel, { color: theme.colors.textSecondary }]}>
                Customize Your Challenge
              </Text>
              <View style={styles.streakOptionsContainer}>
                {[7, 14, 21, 30, 60, 90].map((days) => (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.streakOptionButton,
                      {
                        backgroundColor: customStreakGoal === days ? theme.colors.primary : theme.colors.card,
                        borderColor: customStreakGoal === days ? theme.colors.primary : theme.colors.border,
                      }
                    ]}
                    onPress={() => setCustomStreakGoal(days)}
                  >
                    <Text
                      style={[
                        styles.streakOptionText,
                        { color: customStreakGoal === days ? '#FFFFFF' : theme.colors.text }
                      ]}
                    >
                      {days} days
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.habitDetailAddButton,
                  { 
                    backgroundColor: activeHabits.some(h => h.name.toLowerCase() === selectedHabitDetail?.name.toLowerCase()) 
                      ? theme.colors.surfaceVariant 
                      : theme.colors.primary 
                  }
                ]}
                onPress={() => {
                  if (selectedHabitDetail) {
                    handleAddPredefinedHabit(selectedHabitDetail, customStreakGoal);
                    setHabitDetailModalVisible(false);
                    setCustomStreakGoal(30);
                  }
                }}
                disabled={activeHabits.some(h => h.name.toLowerCase() === selectedHabitDetail?.name.toLowerCase())}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.habitDetailAddButtonText}>
                  {activeHabits.some(h => h.name.toLowerCase() === selectedHabitDetail?.name.toLowerCase())
                    ? 'Already Added'
                    : `Start ${customStreakGoal}-Day Challenge`}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
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
                {customHabitForm.streakGoal === 7 ? "" :
                 customHabitForm.streakGoal === 14 ? "Good for building momentum" :
                 customHabitForm.streakGoal === 21 ? "Recommended for habit formation" :
                 "Great for long-term commitment"}
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
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    // borderColor is added inline using theme.colors.accent
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
  mainHabitsHeader: {
    marginHorizontal: 20,
    marginBottom: 8,
    marginTop: 24,
  },
  mainHabitsTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  mainHabitsDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  sectionHeader: {
    marginHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
    lineHeight: 22,
  },
  subsectionHeader: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  subsectionDescription: {
    fontSize: 16,
    fontWeight: '600' as const,
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
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    // borderColor is added inline using theme.colors.accent
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  actionCardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginTop: 10,
    textAlign: 'center',
  },
  actionCardSubtitle: {
    fontSize: 15,
    fontWeight: '700' as const,
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
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
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
    fontSize: 18,
    fontWeight: '700' as const,
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
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
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
    fontSize: 22,
    fontWeight: '700' as const,
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
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  moreHabitDescription: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
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
    justifyContent: 'center',
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
    fontSize: 16,
    fontWeight: '700' as const,
  },
  streakDescription: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginTop: 16,
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
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  moreHabitDescription: {
    fontSize: 16,
    fontWeight: '600' as const,
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
  // Search and Category Filter styles
  searchContainer: {
    marginHorizontal: 20,
    marginTop: 24,
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
    paddingHorizontal: 20,
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
    fontSize: 16,
    fontWeight: '700' as const,
  },
  categorySection: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  categorySectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  habitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  habitCompactCard: {
    width: '31%',
    borderRadius: 10,
    borderWidth: 1,
    padding: 8,
    minHeight: 75,
    justifyContent: 'space-between',
  },
  habitCompactCardContent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  habitCompactEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  habitCompactName: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
  habitCompactAddButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  // Habit Detail Modal Styles
  habitDetailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  habitDetailModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  habitDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  habitDetailEmoji: {
    fontSize: 48,
    textAlign: 'center',
  },
  habitDetailCloseButton: {
    padding: 4,
    position: 'absolute',
    right: 0,
  },
  habitDetailName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  habitDetailBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  habitDetailBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  habitDetailLabel: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'center',
  },
  habitDetailDescription: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 26,
    textAlign: 'center',
  },
  habitDetailCategory: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  streakOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
    justifyContent: 'center',
  },
  streakOptionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  habitDetailAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  habitDetailAddButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  formSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  formLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 8,
    textAlign: 'center',
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 17,
    fontWeight: '600' as const,
    backgroundColor: '#FFFFFF',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
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
    marginHorizontal: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700' as const,
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
