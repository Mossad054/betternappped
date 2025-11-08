// Wind-Down Flow Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  Moon,
  Check,
  X,
  Heart,
  List,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SleepService } from '@/services/sleep.service';
import { RewardsService, POINT_VALUES } from '@/services/rewards.service';
import { HabitsService } from '@/services/habits.service';

const SLEEP_PROFILE_KEY = 'sleep_profile';
const WIND_DOWN_SESSION_KEY = 'wind_down_session';
const FAVORITE_TRACKS_KEY = 'favorite_sleep_tracks';

interface AudioTrack {
  id: string;
  title: string;
  category: string;
  duration: string;
  youtubeUrl: string;
  description: string;
  emoji: string;
  language: string;
  voiceType?: string;
  bestFor: string[];
}

const AUDIO_LIBRARY: AudioTrack[] = [
  {
    id: 'nature_rain',
    title: 'Gentle Rain Sounds',
    category: 'Nature Sounds',
    duration: '30min',
    youtubeUrl: 'https://youtube.com/watch?v=mPZkdNFkNps',
    description: 'Soothing rain sounds for deep relaxation',
    emoji: '🌧️',
    language: 'None',
    bestFor: ['fall-asleep', 'night-awakenings'],
  },
  {
    id: 'meditation_sleep',
    title: 'Sleep Meditation',
    category: 'Guided Meditation',
    duration: '20min',
    youtubeUrl: 'https://youtube.com/watch?v=aEqlQvczMJQ',
    description: 'Guided meditation to help you fall asleep',
    emoji: '🧘',
    language: 'English',
    voiceType: 'Female',
    bestFor: ['fall-asleep'],
  },
  {
    id: 'story_bedtime',
    title: 'Peaceful Bedtime Story',
    category: 'Bedtime Stories',
    duration: '25min',
    youtubeUrl: 'https://youtube.com/watch?v=bR2o_QE8ekeE',
    description: 'Calming narration to drift off to sleep',
    emoji: '📖',
    language: 'English',
    voiceType: 'Male',
    bestFor: ['fall-asleep'],
  },
  {
    id: 'ambient_ocean',
    title: 'Ocean Waves',
    category: 'Ambient',
    duration: 'Full Night',
    youtubeUrl: 'https://youtube.com/watch?v=V1bFr2SWP1I',
    description: 'Continuous ocean sounds',
    emoji: '🌊',
    language: 'None',
    bestFor: ['fall-asleep', 'night-awakenings', 'full-night'],
  },
  {
    id: 'breathing_exercise',
    title: '4-7-8 Breathing',
    category: 'Quick Tools',
    duration: '5min',
    youtubeUrl: 'https://youtube.com/watch?v=gz4G31LGyog',
    description: 'Quick breathing exercise for instant calm',
    emoji: '🌬️',
    language: 'English',
    voiceType: 'Neutral',
    bestFor: ['fall-asleep', 'night-awakenings'],
  },
  {
    id: 'kenyan_nature',
    title: 'Savanna Sounds',
    category: 'Nature Sounds',
    duration: '30min',
    youtubeUrl: 'https://youtube.com/watch?v=bT8OvJQVzr0',
    description: 'African savanna evening ambience',
    emoji: '🦁',
    language: 'None',
    bestFor: ['fall-asleep', 'full-night'],
  },
];

interface WindDownHabit {
  id: string;
  label: string;
  completed: boolean;
}

// Categories for audio library
const AUDIO_CATEGORIES = ['All', 'Guided Meditation', 'Bedtime Stories', 'Nature Sounds', 'Ambient', 'Quick Tools'];

export default function WindDownFlow() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [selectedTrack, setSelectedTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [windDownHabits, setWindDownHabits] = useState<WindDownHabit[]>([]);
  const [activeHabitsFromDB, setActiveHabitsFromDB] = useState<WindDownHabit[]>([]);

  useEffect(() => {
    loadProfile();
    loadFavorites();
    loadActiveHabits();
  }, []);

  const loadActiveHabits = async () => {
    if (!user) return;
    
    try {
      // Fetch real habits from database filtered by Sleep category
      const result = await HabitsService.getAll(user.id);
      
      if (result.error) {
        console.error('Error loading habits:', result.error);
        return;
      }

      // Filter for sleep category habits and map to WindDownHabit format
      const sleepHabits = (result.data || [])
        .filter(habit => habit.category === 'Sleep')
        .map(habit => ({
          id: habit.id,
          label: habit.name,
          completed: false, // Will be checked against today's logs
        }));

      // Check today's completion status
      const today = new Date().toISOString().split('T')[0];
      const habitsWithStatus = await Promise.all(
        sleepHabits.map(async (habit) => {
          const logResult = await HabitsService.getHabitLogByDate(habit.id, today, user.id);
          return {
            ...habit,
            completed: logResult.data?.completed || false,
          };
        })
      );

      setActiveHabitsFromDB(habitsWithStatus);
      setWindDownHabits(habitsWithStatus);
    } catch (error) {
      console.error('Error loading active habits:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const userId = user?.id || 'guest_user';
      const key = `${SLEEP_PROFILE_KEY}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        const profileData = JSON.parse(data);
        setProfile(profileData);
        // Select default track based on profile
        selectDefaultTrack(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const selectDefaultTrack = (profileData: any) => {
    const preferredStyles = profileData.audioStyle || [];
    if (preferredStyles.length > 0) {
      const matching = AUDIO_LIBRARY.find(track => 
        preferredStyles.some((style: string) => 
          track.category.toLowerCase().includes(style.toLowerCase())
        )
      );
      setSelectedTrack(matching || AUDIO_LIBRARY[0]);
    } else {
      setSelectedTrack(AUDIO_LIBRARY[0]);
    }
  };

  const loadFavorites = async () => {
    try {
      const userId = user?.id || 'guest_user';
      const key = `${FAVORITE_TRACKS_KEY}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      if (data) {
        setFavorites(JSON.parse(data));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (trackId: string) => {
    const newFavorites = favorites.includes(trackId)
      ? favorites.filter(id => id !== trackId)
      : [...favorites, trackId];
    
    setFavorites(newFavorites);
    
    try {
      const userId = user?.id || 'guest_user';
      const key = `${FAVORITE_TRACKS_KEY}_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const toggleHabit = async (habitId: string) => {
    if (!user) return;

    // Optimistically update UI
    setWindDownHabits(prev =>
      prev.map(h => (h.id === habitId ? { ...h, completed: !h.completed } : h))
    );
    
    try {
      // Get current completion status
      const habit = windDownHabits.find(h => h.id === habitId);
      if (!habit) return;

      const today = new Date().toISOString().split('T')[0];
      const newCompletionStatus = !habit.completed;

      // Log habit completion to database
      await HabitsService.logHabit(
        habitId,
        {
          completed: newCompletionStatus,
          date: today,
        },
        user.id
      );

      console.log(`Habit ${habitId} marked as ${newCompletionStatus ? 'completed' : 'incomplete'}`);
    } catch (error) {
      console.error('Error saving habit completion:', error);
      // Revert UI on error
      setWindDownHabits(prev =>
        prev.map(h => (h.id === habitId ? { ...h, completed: !h.completed } : h))
      );
    }
  };

  const getFilteredTracks = () => {
    if (selectedCategory === 'All') {
      return AUDIO_LIBRARY;
    }
    return AUDIO_LIBRARY.filter(track => track.category === selectedCategory);
  };

  const handleReadyForBed = async () => {
    const allHabitsComplete = windDownHabits.every(h => h.completed);
    
    if (!allHabitsComplete) {
      Alert.alert(
        'Wind-Down Checklist',
        'Complete all habits for the best sleep. Continue anyway?',
        [
          { text: 'Keep Going', style: 'cancel' },
          { text: 'Ready for Bed', onPress: () => completeWindDown() },
        ]
      );
    } else {
      completeWindDown();
    }
  };

  const completeWindDown = async () => {
    try {
      const userId = user?.id || 'guest_user';
      const now = new Date();
      const bedtime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      // Save wind-down session
      const session = {
        date: now.toISOString().split('T')[0],
        bedtime,
        trackPlayed: selectedTrack?.id,
        habitsCompleted: windDownHabits.filter(h => h.completed).map(h => h.id),
        timestamp: now.toISOString(),
      };
      
      const key = `${WIND_DOWN_SESSION_KEY}_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(session));

      // Award points for completing wind-down
      await RewardsService.awardPoints(
        userId,
        'sleep',
        'wind_down_complete',
        POINT_VALUES.SLEEP_WIND_DOWN_COMPLETE,
        'Completed evening wind-down routine'
      );
      
      Alert.alert(
        '🌙 Goodnight!',
        `Wind-down complete. Bedtime logged at ${bedtime}. Sleep well!`,
        [
          {
            text: 'Goodnight',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error completing wind-down:', error);
    }
  };

  const openTrack = (track: AudioTrack) => {
    // Open YouTube link
    Alert.alert(
      'Play Audio',
      `Open ${track.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Play',
          onPress: () => {
            // In production, use Linking.openURL(track.youtubeUrl)
            setSelectedTrack(track);
            setShowLibrary(false);
            setIsPlaying(true);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: theme.colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Wind-Down</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Prepare for restful sleep
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.replace('/sleep-wellness')} style={styles.backButton}>
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Track */}
        {selectedTrack && (
          <View style={[styles.trackCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.trackHeader}>
              <Text style={styles.trackEmoji}>{selectedTrack.emoji}</Text>
              <View style={styles.trackInfo}>
                <Text style={[styles.trackTitle, { color: theme.colors.text }]}>
                  {selectedTrack.title}
                </Text>
                <Text style={[styles.trackMeta, { color: theme.colors.textSecondary }]}>
                  {selectedTrack.category} • {selectedTrack.duration}
                </Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite(selectedTrack.id)}>
                <Heart
                  size={24}
                  color={favorites.includes(selectedTrack.id) ? theme.colors.error : theme.colors.textSecondary}
                  fill={favorites.includes(selectedTrack.id) ? theme.colors.error : 'none'}
                />
              </TouchableOpacity>
            </View>

            <Text style={[styles.trackDescription, { color: theme.colors.textSecondary }]}>
              {selectedTrack.description}
            </Text>

            <View style={styles.playerControls}>
              <TouchableOpacity
                style={[styles.playButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause size={32} color="#FFFFFF" />
                ) : (
                  <Play size={32} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Browse Library */}
        <TouchableOpacity
          style={[styles.browseButton, { backgroundColor: theme.colors.secondary }]}
          onPress={() => setShowLibrary(true)}
        >
          <List size={20} color={theme.colors.text} />
          <Text style={[styles.browseText, { color: theme.colors.text }]}>
            Browse Audio Library
          </Text>
        </TouchableOpacity>

        {/* Wind-Down Checklist - Active Habits from Database */}
        <View style={[styles.checklistCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.checklistHeader}>
            <View>
              <Text style={[styles.checklistTitle, { color: theme.colors.text }]}>
                Your Sleep Habits
              </Text>
              <Text style={[styles.checklistDescription, { color: theme.colors.textSecondary }]}>
                {activeHabitsFromDB.length} active habits from your tracker
              </Text>
            </View>
            <View style={[styles.habitBadge, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.habitBadgeText, { color: theme.colors.primary }]}>
                {windDownHabits.filter(h => h.completed).length}/{windDownHabits.length}
              </Text>
            </View>
          </View>

          {windDownHabits.map(habit => (
            <TouchableOpacity
              key={habit.id}
              style={[
                styles.habitItem,
                { backgroundColor: habit.completed ? theme.colors.success + '20' : theme.colors.background },
              ]}
              onPress={() => toggleHabit(habit.id)}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: habit.completed ? theme.colors.success : 'transparent',
                    borderColor: habit.completed ? theme.colors.success : theme.colors.border,
                  },
                ]}
              >
                {habit.completed && <Check size={16} color="#FFFFFF" />}
              </View>
              <Text
                style={[
                  styles.habitLabel,
                  { color: habit.completed ? theme.colors.text : theme.colors.textSecondary },
                ]}
              >
                {habit.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ready for Bed Button */}
        <TouchableOpacity
          style={[styles.readyButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleReadyForBed}
        >
          <Moon size={24} color="#FFFFFF" />
          <Text style={styles.readyButtonText}>I'm Ready for Bed</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Audio Library Modal */}
      <Modal
        visible={showLibrary}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLibrary(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Audio Library</Text>
            <TouchableOpacity onPress={() => setShowLibrary(false)}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesContainer}
          >
            {AUDIO_CATEGORIES.map(category => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryTab,
                  {
                    backgroundColor: selectedCategory === category
                      ? theme.colors.primary
                      : theme.colors.card,
                  },
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: selectedCategory === category
                        ? '#FFFFFF'
                        : theme.colors.text,
                      fontWeight: selectedCategory === category ? '700' : '500',
                    },
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={styles.modalContent}>
            {getFilteredTracks().map(track => (
              <TouchableOpacity
                key={track.id}
                style={[styles.libraryItem, { backgroundColor: theme.colors.card }]}
                onPress={() => openTrack(track)}
              >
                <Text style={styles.libraryEmoji}>{track.emoji}</Text>
                <View style={styles.libraryInfo}>
                  <Text style={[styles.libraryTitle, { color: theme.colors.text }]}>
                    {track.title}
                  </Text>
                  <Text style={[styles.libraryMeta, { color: theme.colors.textSecondary }]}>
                    {track.category} • {track.duration}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(track.id)}>
                  <Heart
                    size={20}
                    color={favorites.includes(track.id) ? theme.colors.error : theme.colors.textSecondary}
                    fill={favorites.includes(track.id) ? theme.colors.error : 'none'}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
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
  trackCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  trackMeta: {
    fontSize: 14,
  },
  trackDescription: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  playerControls: {
    alignItems: 'center',
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  browseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  checklistCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  habitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  habitBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  checklistTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  checklistDescription: {
    fontSize: 14,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  readyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  readyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  modalContent: {
    padding: 20,
  },
  categoriesScroll: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
  },
  libraryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  libraryEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  libraryInfo: {
    flex: 1,
  },
  libraryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  libraryMeta: {
    fontSize: 13,
  },
});
