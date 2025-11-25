import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Slider from '@react-native-community/slider';

interface MediaPlayerProps {
  // YouTube video URL or audio file URI
  source: string;
  type: 'youtube' | 'audio';
  title?: string;
  onPlaybackEnd?: () => void;
  autoPlay?: boolean;
  showVideo?: boolean; // For YouTube, whether to show video or just audio
}

export default function MediaPlayer({
  source,
  type,
  title,
  onPlaybackEnd,
  autoPlay = false,
  showVideo = true,
}: MediaPlayerProps) {
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For audio playback
  const sound = useRef<Audio.Sound | null>(null);
  const [audioLoaded, setAudioLoaded] = useState(false);

  // For YouTube playback
  const youtubePlayerRef = useRef<any>(null);
  const [youtubeReady, setYoutubeReady] = useState(false);

  // Extract YouTube video ID from URL
  const getYoutubeId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  // Setup audio
  useEffect(() => {
    if (type === 'audio') {
      loadAudio();
    }

    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, [source]);

  const loadAudio = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Set audio mode
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Load the sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: source },
        { shouldPlay: autoPlay, isLooping: false },
        onAudioPlaybackStatusUpdate
      );

      sound.current = newSound;
      setAudioLoaded(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading audio:', err);
      setError('Failed to load audio');
      setIsLoading(false);
    }
  };

  const onAudioPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish && onPlaybackEnd) {
        onPlaybackEnd();
      }
    }
  };

  // Audio controls
  const handlePlayPause = async () => {
    if (!sound.current) return;

    try {
      if (isPlaying) {
        await sound.current.pauseAsync();
      } else {
        await sound.current.playAsync();
      }
    } catch (err) {
      console.error('Error toggling playback:', err);
    }
  };

  const handleSeek = async (value: number) => {
    if (!sound.current) return;

    try {
      await sound.current.setPositionAsync(value);
    } catch (err) {
      console.error('Error seeking:', err);
    }
  };

  const handleSkipBackward = async () => {
    if (!sound.current) return;
    const newPosition = Math.max(0, position - 15000); // Skip back 15 seconds
    await handleSeek(newPosition);
  };

  const handleSkipForward = async () => {
    if (!sound.current) return;
    const newPosition = Math.min(duration, position + 15000); // Skip forward 15 seconds
    await handleSeek(newPosition);
  };

  const toggleMute = async () => {
    if (!sound.current) return;

    try {
      await sound.current.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    } catch (err) {
      console.error('Error toggling mute:', err);
    }
  };

  // YouTube controls
  const handleYoutubeStateChange = (state: string) => {
    if (state === 'ended' && onPlaybackEnd) {
      onPlaybackEnd();
    }
    setIsPlaying(state === 'playing');
  };

  const toggleYoutubePlayback = () => {
    if (youtubePlayerRef.current) {
      if (isPlaying) {
        youtubePlayerRef.current.pauseVideo();
      } else {
        youtubePlayerRef.current.playVideo();
      }
    }
  };

  // Format time for display
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      {title && (
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>
          {title}
        </Text>
      )}

      {/* YouTube Player */}
      {type === 'youtube' && (
        <View style={styles.youtubeContainer}>
          <YoutubePlayer
            ref={youtubePlayerRef}
            height={showVideo ? 200 : 0}
            play={autoPlay}
            videoId={getYoutubeId(source)}
            onChangeState={handleYoutubeStateChange}
            onReady={() => setYoutubeReady(true)}
            webViewProps={{
              scrollEnabled: false,
              injectedJavaScript: `
                var element = document.getElementsByClassName('container')[0];
                element.style.position = 'unset';
                element.style.pointerEvents = 'auto';
                true;
              `,
            }}
          />
          
          {/* YouTube Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: theme.colors.primary }]}
              onPress={toggleYoutubePlayback}
              disabled={!youtubeReady}
            >
              {isPlaying ? (
                <Pause size={24} color="#FFFFFF" />
              ) : (
                <Play size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Audio Player */}
      {type === 'audio' && (
        <View style={styles.audioContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                  {formatTime(position)}
                </Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={duration}
                  value={position}
                  onSlidingComplete={handleSeek}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.border}
                  thumbTintColor={theme.colors.primary}
                />
                <Text style={[styles.timeText, { color: theme.colors.textSecondary }]}>
                  {formatTime(duration)}
                </Text>
              </View>

              {/* Playback Controls */}
              <View style={styles.controls}>
                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={handleSkipBackward}
                  disabled={!audioLoaded}
                >
                  <SkipBack size={28} color={theme.colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.playButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={handlePlayPause}
                  disabled={!audioLoaded}
                >
                  {isPlaying ? (
                    <Pause size={32} color="#FFFFFF" />
                  ) : (
                    <Play size={32} color="#FFFFFF" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={handleSkipForward}
                  disabled={!audioLoaded}
                >
                  <SkipForward size={28} color={theme.colors.text} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.controlButton}
                  onPress={toggleMute}
                  disabled={!audioLoaded}
                >
                  {isMuted ? (
                    <VolumeX size={24} color={theme.colors.text} />
                  ) : (
                    <Volume2 size={24} color={theme.colors.text} />
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  youtubeContainer: {
    width: '100%',
  },
  audioContainer: {
    width: '100%',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeText: {
    fontSize: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  controlButton: {
    padding: 12,
    borderRadius: 8,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
  },
});
