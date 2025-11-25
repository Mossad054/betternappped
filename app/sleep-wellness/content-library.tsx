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
import { Search, Heart, X } from 'lucide-react-native';
import MediaPlayer from '@/components/MediaPlayer';
import { SleepContentService, SleepContent } from '@/services/sleepContent.service';

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
  tags: string[];
}

// Helper to convert SleepContent to AudioTrack
const contentToTrack = (content: SleepContent): AudioTrack => ({
  id: content.id,
  title: content.title,
  category: SleepContentService.dbValueToCategory(content.category),
  duration: content.duration,
  youtubeUrl: `https://youtube.com/watch?v=${content.youtube_id}`,
  description: content.description || '',
  emoji: content.emoji || '🎵',
  language: content.language || 'English',
  voiceType: content.voice_type,
  bestFor: content.best_for || [],
  tags: content.tags || [],
});

const CATEGORIES = [
  'All',
  'Guided Meditations',
  'Bedtime Stories',
  'Nature Sounds',
  'Ambient',
  'Sleep Hypnosis',
  'Quick Tools',
];

export default function ContentLibrary() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [audioLibrary, setAudioLibrary] = useState<AudioTrack[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<AudioTrack[]>([]);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
    loadFavorites();
  }, []);

  useEffect(() => {
    filterTracks();
  }, [selectedCategory, searchQuery, audioLibrary]);

  const loadContent = async () => {
    setLoading(true);
    console.log('=== ContentLibrary: Starting loadContent ===');
    try {
      const { data, error } = await SleepContentService.getAll();
      console.log('ContentLibrary: Service returned', {
        dataLength: data?.length || 0,
        hasError: !!error,
        error: error
      });

      if (error) {
        console.error('ContentLibrary: Error from service:', error);
      }

      if (data && !error) {
        console.log('ContentLibrary: Converting', data.length, 'items to tracks');
        const tracks = data.map(contentToTrack);
        console.log('ContentLibrary: Setting audioLibrary with', tracks.length, 'tracks');
        setAudioLibrary(tracks);
        setFilteredTracks(tracks);
      } else {
        console.log('ContentLibrary: No data or error occurred');
      }
    } catch (error) {
      console.error('ContentLibrary: Exception in loadContent:', error);
    }
    setLoading(false);
    console.log('=== ContentLibrary: loadContent complete ===');
  };

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const { data, error } = await SleepContentService.getFavoriteIds(user.id);
      if (data && !error) {
        setFavorites(data);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (trackId: string) => {
    if (!user) return;

    // Optimistic update
    const newFavorites = favorites.includes(trackId)
      ? favorites.filter(id => id !== trackId)
      : [...favorites, trackId];
    setFavorites(newFavorites);

    try {
      const { error } = await SleepContentService.toggleFavorite(user.id, trackId);
      if (error) {
        setFavorites(favorites);
        console.error('Error toggling favorite:', error);
      }
    } catch (error) {
      setFavorites(favorites);
      console.error('Error saving favorites:', error);
    }
  };

  const filterTracks = () => {
    let filtered = audioLibrary;

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
  };

  const closePlayer = () => {
    setCurrentTrack(null);
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
        <TouchableOpacity onPress={() => router.replace('/sleep-wellness')} style={styles.backButton}>
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
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

          {/* Integrated Media Player */}
          <MediaPlayer
            source={currentTrack.youtubeUrl}
            type="youtube"
            showVideo={true}
            autoPlay={true}
            onPlaybackEnd={() => {
              // Optionally auto-play next track or close player
              closePlayer();
            }}
          />
        </View>
      )}

      {/* Content List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        scrollEnabled={true}
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
    zIndex: 0,
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
    zIndex: 1,
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
