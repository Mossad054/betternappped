// Content Library Screen with Categories
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
import { Search, Heart, X, Filter, Play, Pause, SkipBack, SkipForward } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITE_TRACKS_KEY = 'favorite_sleep_tracks';

interface AudioTrack {
  id: string;
  title: string;
  category: 'Guided Meditations' | 'Bedtime Stories' | 'Ambient/Nature Soundscapes' | 'Sleep Hypnosis' | 'Quick Tools';
  duration: string;
  youtubeUrl: string;
  description: string;
  emoji: string;
  language: string;
  voiceType?: string;
  bestFor: string[];
  tags: string[];
}

const AUDIO_LIBRARY: AudioTrack[] = [
  // Guided Meditations
  {
    id: 'meditation_sleep_1',
    title: 'Deep Sleep Meditation',
    category: 'Guided Meditations',
    duration: '20min',
    youtubeUrl: 'https://youtube.com/watch?v=aEqlQvczMJQ',
    description: 'Guided meditation to help you fall into deep, restful sleep',
    emoji: '🧘',
    language: 'English',
    voiceType: 'Female',
    bestFor: ['fall-asleep'],
    tags: ['meditation', 'guided', 'calming', 'body-scan'],
  },
  {
    id: 'meditation_body_scan',
    title: 'Body Scan Meditation',
    category: 'Guided Meditations',
    duration: '15min',
    youtubeUrl: 'https://youtube.com/watch?v=15q-N-_kkrU',
    description: 'Progressive relaxation through body awareness',
    emoji: '🧘‍♀️',
    language: 'English',
    voiceType: 'Male',
    bestFor: ['fall-asleep', 'night-awakenings'],
    tags: ['meditation', 'body-scan', 'relaxation'],
  },
  {
    id: 'meditation_return_sleep',
    title: 'Return to Sleep',
    category: 'Guided Meditations',
    duration: '10min',
    youtubeUrl: 'https://youtube.com/watch?v=MIr3RsUWrdo',
    description: 'Quick meditation for middle-of-night awakenings',
    emoji: '🌙',
    language: 'English',
    voiceType: 'Neutral',
    bestFor: ['night-awakenings'],
    tags: ['meditation', 'quick', 'awakenings'],
  },
  
  // Bedtime Stories
  {
    id: 'story_peaceful',
    title: 'Peaceful Garden Journey',
    category: 'Bedtime Stories',
    duration: '25min',
    youtubeUrl: 'https://youtube.com/watch?v=bR2o_QE8ekeE',
    description: 'Calming narrative through a serene garden',
    emoji: '📖',
    language: 'English',
    voiceType: 'Male',
    bestFor: ['fall-asleep'],
    tags: ['story', 'nature', 'peaceful', 'narrative'],
  },
  {
    id: 'story_forest',
    title: 'The Enchanted Forest',
    category: 'Bedtime Stories',
    duration: '30min',
    youtubeUrl: 'https://youtube.com/watch?v=JU9c2MpWPxQ',
    description: 'A gentle tale of magical woodland creatures',
    emoji: '🌲',
    language: 'English',
    voiceType: 'Female',
    bestFor: ['fall-asleep'],
    tags: ['story', 'fantasy', 'calming'],
  },
  {
    id: 'story_swahili',
    title: 'Hadithi ya Usiku (Night Story)',
    category: 'Bedtime Stories',
    duration: '20min',
    youtubeUrl: 'https://youtube.com/watch?v=example',
    description: 'Traditional Kenyan bedtime story in Swahili',
    emoji: '🌍',
    language: 'Swahili',
    voiceType: 'Male',
    bestFor: ['fall-asleep'],
    tags: ['story', 'swahili', 'culture', 'kenyan'],
  },
  
  // Ambient/Nature Soundscapes
  {
    id: 'nature_rain',
    title: 'Gentle Rain Sounds',
    category: 'Ambient/Nature Soundscapes',
    duration: 'Full Night',
    youtubeUrl: 'https://youtube.com/watch?v=mPZkdNFkNps',
    description: 'Soothing rain sounds for deep relaxation',
    emoji: '🌧️',
    language: 'None',
    bestFor: ['fall-asleep', 'night-awakenings', 'full-night'],
    tags: ['rain', 'nature', 'ambient', 'continuous'],
  },
  {
    id: 'nature_ocean',
    title: 'Ocean Waves',
    category: 'Ambient/Nature Soundscapes',
    duration: 'Full Night',
    youtubeUrl: 'https://youtube.com/watch?v=V1bFr2SWP1I',
    description: 'Continuous gentle ocean waves',
    emoji: '🌊',
    language: 'None',
    bestFor: ['fall-asleep', 'night-awakenings', 'full-night'],
    tags: ['ocean', 'waves', 'nature', 'continuous'],
  },
  {
    id: 'nature_savanna',
    title: 'African Savanna Evening',
    category: 'Ambient/Nature Soundscapes',
    duration: '30min',
    youtubeUrl: 'https://youtube.com/watch?v=bT8OvJQVzr0',
    description: 'Authentic savanna ambience with distant wildlife',
    emoji: '🦁',
    language: 'None',
    bestFor: ['fall-asleep', 'full-night'],
    tags: ['africa', 'savanna', 'wildlife', 'kenyan'],
  },
  {
    id: 'nature_forest',
    title: 'Forest Night Sounds',
    category: 'Ambient/Nature Soundscapes',
    duration: 'Full Night',
    youtubeUrl: 'https://youtube.com/watch?v=xNN7iTA57jM',
    description: 'Peaceful nighttime forest ambience',
    emoji: '🌲',
    language: 'None',
    bestFor: ['fall-asleep', 'full-night'],
    tags: ['forest', 'nature', 'peaceful', 'continuous'],
  },
  {
    id: 'nature_campfire',
    title: 'Crackling Campfire',
    category: 'Ambient/Nature Soundscapes',
    duration: 'Full Night',
    youtubeUrl: 'https://youtube.com/watch?v=UgHKb_7884o',
    description: 'Warm, cozy campfire sounds',
    emoji: '🔥',
    language: 'None',
    bestFor: ['fall-asleep', 'full-night'],
    tags: ['fire', 'cozy', 'warm', 'continuous'],
  },
  
  // Sleep Hypnosis
  {
    id: 'hypnosis_deep',
    title: 'Deep Sleep Hypnosis',
    category: 'Sleep Hypnosis',
    duration: '45min',
    youtubeUrl: 'https://youtube.com/watch?v=BnR9GykS6kE',
    description: 'Professional sleep hypnosis for deep relaxation',
    emoji: '💤',
    language: 'English',
    voiceType: 'Male',
    bestFor: ['fall-asleep'],
    tags: ['hypnosis', 'deep-sleep', 'professional'],
  },
  {
    id: 'hypnosis_anxiety',
    title: 'Anxiety Relief Hypnosis',
    category: 'Sleep Hypnosis',
    duration: '30min',
    youtubeUrl: 'https://youtube.com/watch?v=C4MvKzzUSbA',
    description: 'Hypnosis to calm anxious thoughts before sleep',
    emoji: '😌',
    language: 'English',
    voiceType: 'Female',
    bestFor: ['fall-asleep'],
    tags: ['hypnosis', 'anxiety', 'calm', 'mental-health'],
  },
  
  // Quick Tools
  {
    id: 'breathing_478',
    title: '4-7-8 Breathing Exercise',
    category: 'Quick Tools',
    duration: '5min',
    youtubeUrl: 'https://youtube.com/watch?v=gz4G31LGyog',
    description: 'Quick breathing technique for instant calm',
    emoji: '🌬️',
    language: 'English',
    voiceType: 'Neutral',
    bestFor: ['fall-asleep', 'night-awakenings'],
    tags: ['breathing', 'quick', 'technique'],
  },
  {
    id: 'relaxation_progressive',
    title: 'Progressive Muscle Relaxation',
    category: 'Quick Tools',
    duration: '7min',
    youtubeUrl: 'https://youtube.com/watch?v=1nZEdqcGVzo',
    description: 'Systematic muscle tension and release',
    emoji: '💪',
    language: 'English',
    voiceType: 'Female',
    bestFor: ['fall-asleep'],
    tags: ['relaxation', 'muscle', 'technique'],
  },
  {
    id: 'visualization_quick',
    title: 'Quick Sleep Visualization',
    category: 'Quick Tools',
    duration: '3min',
    youtubeUrl: 'https://youtube.com/watch?v=EiIyoXTzFLw',
    description: 'Brief guided imagery for rapid sleep',
    emoji: '✨',
    language: 'English',
    voiceType: 'Neutral',
    bestFor: ['fall-asleep', 'night-awakenings'],
    tags: ['visualization', 'quick', 'imagery'],
  },
];

const CATEGORIES = [
  'All',
  'Guided Meditations',
  'Bedtime Stories',
  'Ambient/Nature Soundscapes',
  'Sleep Hypnosis',
  'Quick Tools',
];

export default function ContentLibrary() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<AudioTrack[]>(AUDIO_LIBRARY);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    filterTracks();
  }, [selectedCategory, searchQuery]);

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

  const filterTracks = () => {
    let filtered = AUDIO_LIBRARY;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(track => track.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(track =>
        track.title.toLowerCase().includes(query) ||
        track.description.toLowerCase().includes(query) ||
        track.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredTracks(filtered);
  };

  const playTrack = (track: AudioTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    // Simulate duration (convert duration string to seconds)
    const durationMatch = track.duration.match(/(\d+)min/);
    if (durationMatch) {
      setDuration(parseInt(durationMatch[1]) * 60);
    }
    setCurrentTime(0);
    
    // TODO: In production, integrate with YouTube player or expo-av
    // Linking.openURL(track.youtubeUrl) or use WebView with YouTube player
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    // TODO: Actual play/pause implementation
  };

  const closePlayer = () => {
    setCurrentTrack(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const skipForward = () => {
    setCurrentTime(prev => Math.min(prev + 15, duration));
    // TODO: Actual skip implementation
  };

  const skipBackward = () => {
    setCurrentTime(prev => Math.max(prev - 15, 0));
    // TODO: Actual skip implementation
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: theme.colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Content Library</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            {filteredTracks.length} tracks available
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.colors.card }]}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Search tracks, tags..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContainer}
      >
        {CATEGORIES.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              {
                backgroundColor: selectedCategory === category
                  ? theme.colors.primary
                  : theme.colors.card,
                borderColor: theme.colors.border,
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
                },
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Media Player Card - Appears at top when track is playing */}
      {currentTrack && (
        <View style={[styles.playerCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.playerHeader}>
            <View style={styles.playerTrackInfo}>
              <Text style={styles.playerEmoji}>{currentTrack.emoji}</Text>
              <View style={styles.playerTextInfo}>
                <Text style={[styles.playerTitle, { color: theme.colors.text }]} numberOfLines={1}>
                  {currentTrack.title}
                </Text>
                <Text style={[styles.playerSubtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {currentTrack.category}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={closePlayer} style={styles.playerClose}>
              <X size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.colors.primary,
                    width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                  },
                ]}
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                {formatTime(currentTime)}
              </Text>
              <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                {formatTime(duration)}
              </Text>
            </View>
          </View>

          {/* Player Controls */}
          <View style={styles.playerControls}>
            <TouchableOpacity onPress={skipBackward} style={styles.controlButton}>
              <SkipBack size={24} color={theme.colors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={togglePlayPause}
              style={[styles.playPauseButton, { backgroundColor: theme.colors.primary }]}
            >
              {isPlaying ? (
                <Pause size={28} color="#FFFFFF" fill="#FFFFFF" />
              ) : (
                <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={skipForward} style={styles.controlButton}>
              <SkipForward size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredTracks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No tracks found. Try a different search or category.
            </Text>
          </View>
        ) : (
          filteredTracks.map(track => (
            <TouchableOpacity
              key={track.id}
              style={[styles.trackCard, { backgroundColor: theme.colors.card }]}
              onPress={() => playTrack(track)}
            >
              <View style={styles.trackLeft}>
                <Text style={styles.trackEmoji}>{track.emoji}</Text>
                <View style={styles.trackInfo}>
                  <Text style={[styles.trackTitle, { color: theme.colors.text }]}>
                    {track.title}
                  </Text>
                  <Text style={[styles.trackMeta, { color: theme.colors.textSecondary }]}>
                    {track.category} • {track.duration}
                    {track.language !== 'None' && ` • ${track.language}`}
                    {track.voiceType && ` • ${track.voiceType}`}
                  </Text>
                  <Text style={[styles.trackDescription, { color: theme.colors.textSecondary }]}>
                    {track.description}
                  </Text>
                  {/* Tags */}
                  <View style={styles.tagsContainer}>
                    {track.tags.slice(0, 3).map(tag => (
                      <View key={tag} style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Text style={[styles.tagText, { color: theme.colors.primary }]}>
                          {tag}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  toggleFavorite(track.id);
                }}
                style={styles.favoriteButton}
              >
                <Heart
                  size={24}
                  color={favorites.includes(track.id) ? theme.colors.error : theme.colors.textSecondary}
                  fill={favorites.includes(track.id) ? theme.colors.error : 'none'}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesScroll: {
    maxHeight: 60,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 12,
  },
  trackCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  trackLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  trackEmoji: {
    fontSize: 40,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  trackMeta: {
    fontSize: 12,
    marginBottom: 6,
  },
  trackDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  favoriteButton: {
    padding: 8,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  // Media Player Card Styles
  playerCard: {
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  playerTrackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  playerEmoji: {
    fontSize: 48,
    marginRight: 12,
  },
  playerTextInfo: {
    flex: 1,
  },
  playerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  playerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  playerClose: {
    padding: 4,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  playerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  controlButton: {
    padding: 12,
  },
  playPauseButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
