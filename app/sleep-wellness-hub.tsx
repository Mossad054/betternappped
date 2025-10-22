import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Moon,
  Music,
  FlaskConical,
  BookOpen,
  Trophy,
  Sparkles,
  ChevronRight,
  Play,
  Clock,
  TrendingUp,
  Award,
  X,
  CheckCircle,
  Star,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Playlist {
  id: string;
  title: string;
  duration: string;
  cover: string;
  recommended?: boolean;
}

interface Experiment {
  id: string;
  title: string;
  emoji: string;
  description: string;
  status: 'active' | 'completed' | 'suggested';
}

interface Tutorial {
  id: string;
  title: string;
  type: 'video' | 'article';
  duration: string;
  emoji: string;
}

interface Achievement {
  id: string;
  title: string;
  emoji: string;
  progress: number;
  total: number;
  unlocked: boolean;
}

interface Recommendation {
  id: string;
  text: string;
  confidence: string;
}

const mockPlaylists: Playlist[] = [
  { id: '1', title: 'Calming Music', duration: '45 min', cover: '🎵', recommended: true },
  { id: '2', title: 'White Noise', duration: '60 min', cover: '🌊' },
  { id: '3', title: 'Guided Meditation', duration: '20 min', cover: '🧘' },
  { id: '4', title: 'Bedtime Stories', duration: '30 min', cover: '📖' },
  { id: '5', title: 'Nature Sounds', duration: '50 min', cover: '🌲' },
];

const mockExperiments: Experiment[] = [
  {
    id: '1',
    title: 'No screen time 1 hour before bed',
    emoji: '📱',
    description: 'Test how reducing screen time affects sleep quality',
    status: 'active',
  },
  {
    id: '2',
    title: 'Warm shower before sleep',
    emoji: '🚿',
    description: 'See if a warm shower improves sleep onset',
    status: 'suggested',
  },
  {
    id: '3',
    title: '5-min journaling wind-down',
    emoji: '📝',
    description: 'Track how journaling affects mental clarity',
    status: 'suggested',
  },
];

const mockTutorials: Tutorial[] = [
  {
    id: '1',
    title: 'Understanding your circadian rhythm',
    type: 'video',
    duration: '8 min',
    emoji: '🌞',
  },
  {
    id: '2',
    title: 'Foods that improve sleep quality',
    type: 'article',
    duration: '5 min read',
    emoji: '🥗',
  },
  {
    id: '3',
    title: 'The science behind REM and deep sleep',
    type: 'video',
    duration: '12 min',
    emoji: '🧠',
  },
  {
    id: '4',
    title: 'Creating the perfect sleep environment',
    type: 'article',
    duration: '4 min read',
    emoji: '🛏️',
  },
];

const mockAchievements: Achievement[] = [
  { id: '1', title: '7-Day Sleep Streak', emoji: '🌙', progress: 7, total: 7, unlocked: true },
  { id: '2', title: 'Consistent Bedtime Hero', emoji: '🕙', progress: 5, total: 7, unlocked: false },
  { id: '3', title: 'Early Riser', emoji: '🌅', progress: 3, total: 7, unlocked: false },
  { id: '4', title: '30-Night Champion', emoji: '🏆', progress: 18, total: 30, unlocked: false },
];

const mockRecommendations: Recommendation[] = [
  {
    id: '1',
    text: 'Try dimming your lights 30 minutes earlier.',
    confidence: 'Based on last 2 weeks of data',
  },
  {
    id: '2',
    text: 'Avoid caffeine after 3PM for deeper sleep.',
    confidence: 'Based on activity patterns',
  },
  {
    id: '3',
    text: 'Meditation sessions improve your REM score by 10%.',
    confidence: 'Based on last month',
  },
];

export default function SleepWellnessHub() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [recommendationModalVisible, setRecommendationModalVisible] = useState(false);


  const getSleepData = () => {
    return {
      avgDuration7Days: 7.2,
      avgDuration30Days: 7.5,
      consistencyScore: 82,
      avgQuality: 'Good',
      wakeUpConsistency: 'High',
      insights: [
        'You sleep 1h less on workdays.',
        'Weekend recovery sleep improved your average score by 12%.',
      ],
    };
  };

  const sleepData = getSleepData();

  const handlePlayPlaylist = (playlistId: string) => {
    console.log('Playing playlist:', playlistId);
  };

  const handleStartExperiment = (experimentId: string) => {
    console.log('Starting experiment:', experimentId);
    router.push('/experiments-hub');
  };

  const handleOpenTutorial = (tutorialId: string) => {
    console.log('Opening tutorial:', tutorialId);
  };

  const handleTryRecommendation = (recommendationId: string) => {
    console.log('Trying recommendation:', recommendationId);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Sleep Wellness Hub',
          headerStyle: { backgroundColor: theme.colors.card },
          headerTitleStyle: { color: theme.colors.text, fontWeight: '600' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: 20, paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Moon size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Sleep Tracking & Insights</Text>
          </View>

          <View style={styles.sleepMetricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>7-Day Average</Text>
              <Text style={styles.metricValue}>{sleepData.avgDuration7Days}h</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>30-Day Average</Text>
              <Text style={styles.metricValue}>{sleepData.avgDuration30Days}h</Text>
            </View>
          </View>

          <View style={styles.sleepMetricsGrid}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Consistency Score</Text>
              <Text style={styles.metricValue}>{sleepData.consistencyScore}%</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Sleep Quality</Text>
              <Text style={styles.metricValue}>{sleepData.avgQuality}</Text>
            </View>
          </View>

          <View style={styles.insightsContainer}>
            <Text style={styles.insightsTitle}>AI Insights</Text>
            {sleepData.insights.map((insight, index) => (
              <View key={index} style={styles.insightRow}>
                <Sparkles size={16} color={'#34B27B'} />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.viewReportButton}>
            <Text style={styles.viewReportText}>View Full Sleep Report</Text>
            <ChevronRight size={18} color={'#34B27B'} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Music size={24} color={'#34B27B'} />
            <Text style={styles.cardTitle}>Guided Sleep Playlists</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.playlistScrollContent}
          >
            {mockPlaylists.map((playlist) => (
              <TouchableOpacity
                key={playlist.id}
                style={styles.playlistCard}
                onPress={() => handlePlayPlaylist(playlist.id)}
              >
                {playlist.recommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>Recommended 🌙</Text>
                  </View>
                )}
                <Text style={styles.playlistCover}>{playlist.cover}</Text>
                <Text style={styles.playlistTitle}>{playlist.title}</Text>
                <View style={styles.playlistFooter}>
                  <Clock size={14} color={'#6B7280'} />
                  <Text style={styles.playlistDuration}>{playlist.duration}</Text>
                  <View style={styles.playButton}>
                    <Play size={16} color={'#FFFFFF'} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FlaskConical size={24} color={'#34B27B'} />
            <Text style={styles.cardTitle}>Night Routines & Experiments</Text>
          </View>

          {mockExperiments.map((experiment) => (
            <View key={experiment.id} style={styles.experimentCard}>
              <View style={styles.experimentHeader}>
                <Text style={styles.experimentEmoji}>{experiment.emoji}</Text>
                <View style={styles.experimentInfo}>
                  <Text style={styles.experimentTitle}>{experiment.title}</Text>
                  <Text style={styles.experimentDescription}>{experiment.description}</Text>
                </View>
              </View>

              {experiment.status === 'active' && (
                <View style={styles.experimentProgress}>
                  <Text style={styles.experimentProgressText}>Day 4/7</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressBarFill, { width: '57%' }]} />
                  </View>
                  <View style={styles.feedbackButtons}>
                    <TouchableOpacity style={styles.feedbackButton}>
                      <Text style={styles.feedbackEmoji}>😊</Text>
                      <Text style={styles.feedbackLabel}>Good</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.feedbackButton}>
                      <Text style={styles.feedbackEmoji}>😐</Text>
                      <Text style={styles.feedbackLabel}>Neutral</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.feedbackButton}>
                      <Text style={styles.feedbackEmoji}>😞</Text>
                      <Text style={styles.feedbackLabel}>Bad</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {experiment.status === 'suggested' && (
                <TouchableOpacity
                  style={styles.startExperimentButton}
                  onPress={() => handleStartExperiment(experiment.id)}
                >
                  <Text style={styles.startExperimentText}>Start Experiment</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity
            style={styles.viewAllExperimentsButton}
            onPress={() => router.push('/experiments-hub')}
          >
            <FlaskConical size={20} color={'#34B27B'} />
            <Text style={styles.viewAllExperimentsText}>View All Experiments</Text>
            <ChevronRight size={20} color={'#34B27B'} />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <BookOpen size={24} color={'#34B27B'} />
            <Text style={styles.cardTitle}>Tutorials & Education</Text>
          </View>

          {mockTutorials.map((tutorial) => (
            <TouchableOpacity
              key={tutorial.id}
              style={styles.tutorialCard}
              onPress={() => handleOpenTutorial(tutorial.id)}
            >
              <Text style={styles.tutorialEmoji}>{tutorial.emoji}</Text>
              <View style={styles.tutorialInfo}>
                <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
                <View style={styles.tutorialMeta}>
                  <Text style={styles.tutorialType}>{tutorial.type}</Text>
                  <Text style={styles.tutorialDot}>•</Text>
                  <Text style={styles.tutorialDuration}>{tutorial.duration}</Text>
                </View>
              </View>
              <ChevronRight size={20} color={'#6B7280'} />
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.exploreLessonsButton}>
            <Text style={styles.exploreLessonsText}>Explore All Sleep Lessons</Text>
            <ChevronRight size={18} color={'#34B27B'} />
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Trophy size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Achievements</Text>
          </View>

          <View style={styles.achievementsVertical}>
            {mockAchievements.map((achievement) => (
              <TouchableOpacity
                key={achievement.id}
                style={[
                  styles.achievementCardVertical,
                  { backgroundColor: theme.colors.secondary },
                  !achievement.unlocked && styles.achievementCardLocked,
                ]}
                onPress={() => {
                  setSelectedAchievement(achievement);
                  setAchievementModalVisible(true);
                }}
              >
                <View style={styles.achievementContent}>
                  <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={[styles.achievementTitle, { color: theme.colors.text }]}>{achievement.title}</Text>
                    <View style={styles.achievementProgressBar}>
                      <View
                        style={[
                          styles.achievementProgressFill,
                          { width: `${(achievement.progress / achievement.total) * 100}%`, backgroundColor: theme.colors.primary },
                        ]}
                      />
                    </View>
                    <Text style={[styles.achievementProgressText, { color: theme.colors.textSecondary }]}>
                      {achievement.progress}/{achievement.total}
                    </Text>
                  </View>
                  {achievement.unlocked && (
                    <View style={[styles.unlockedBadge, { backgroundColor: theme.colors.primary }]}>
                      <Award size={14} color="#FFFFFF" />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.motivationQuote}>
            <Text style={[styles.motivationText, { color: theme.colors.textSecondary }]}>&ldquo;Consistency builds clarity.&rdquo;</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Sparkles size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Smart Recommendations</Text>
          </View>

          {mockRecommendations.map((rec) => (
            <TouchableOpacity
              key={rec.id}
              style={[styles.recommendationCard, { backgroundColor: theme.colors.secondary }]}
              onPress={() => {
                setSelectedRecommendation(rec);
                setRecommendationModalVisible(true);
              }}
            >
              <Text style={[styles.recommendationText, { color: theme.colors.text }]}>{rec.text}</Text>
              <Text style={[styles.recommendationConfidence, { color: theme.colors.textSecondary }]}>{rec.confidence}</Text>
              <TouchableOpacity
                style={[styles.tryButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleTryRecommendation(rec.id)}
              >
                <TrendingUp size={16} color="#FFFFFF" />
                <Text style={styles.tryButtonText}>Try This Tonight</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Achievement Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={achievementModalVisible}
        onRequestClose={() => setAchievementModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.achievementEmojiLarge}>{selectedAchievement?.emoji}</Text>
                <View>
                  <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                    {selectedAchievement?.title}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                    {selectedAchievement?.unlocked ? 'Achievement Unlocked!' : 'Keep Going!'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setAchievementModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.achievementDetails}>
                <Text style={[styles.achievementDescription, { color: theme.colors.text }]}>
                  {selectedAchievement?.unlocked 
                    ? 'Congratulations! You\'ve successfully completed this achievement by maintaining consistent sleep patterns.'
                    : 'Complete this achievement by maintaining your sleep routine for the remaining days.'
                  }
                </Text>

                <View style={styles.progressSection}>
                  <Text style={[styles.progressTitle, { color: theme.colors.text }]}>Progress</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { 
                          width: `${((selectedAchievement?.progress || 0) / (selectedAchievement?.total || 1)) * 100}%`,
                          backgroundColor: theme.colors.primary 
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                    {selectedAchievement?.progress}/{selectedAchievement?.total} days completed
                  </Text>
                </View>

                <View style={styles.outcomesSection}>
                  <Text style={[styles.outcomesTitle, { color: theme.colors.text }]}>Measured Outcomes</Text>
                  <View style={styles.outcomeItem}>
                    <CheckCircle size={16} color={theme.colors.primary} />
                    <Text style={[styles.outcomeText, { color: theme.colors.textSecondary }]}>
                      Improved sleep consistency by 25%
                    </Text>
                  </View>
                  <View style={styles.outcomeItem}>
                    <CheckCircle size={16} color={theme.colors.primary} />
                    <Text style={[styles.outcomeText, { color: theme.colors.textSecondary }]}>
                      Enhanced sleep quality scores
                    </Text>
                  </View>
                  <View style={styles.outcomeItem}>
                    <CheckCircle size={16} color={theme.colors.primary} />
                    <Text style={[styles.outcomeText, { color: theme.colors.textSecondary }]}>
                      Better morning energy levels
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Smart Recommendation Feedback Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={recommendationModalVisible}
        onRequestClose={() => setRecommendationModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Sparkles size={24} color={theme.colors.primary} />
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Try This Tonight
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setRecommendationModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.recommendationModalText, { color: theme.colors.text }]}>
                {selectedRecommendation?.text}
              </Text>
              <Text style={[styles.recommendationModalConfidence, { color: theme.colors.textSecondary }]}>
                {selectedRecommendation?.confidence}
              </Text>

              <View style={styles.feedbackSection}>
                <Text style={[styles.feedbackTitle, { color: theme.colors.text }]}>
                  Did you try this activity tonight?
                </Text>
                <View style={styles.feedbackButtons}>
                  <TouchableOpacity
                    style={[styles.feedbackButton, { backgroundColor: theme.colors.success }]}
                    onPress={() => {
                      // TODO: Save as logged activity
                      console.log('Activity logged: Yes');
                      setRecommendationModalVisible(false);
                    }}
                  >
                    <CheckCircle size={20} color="#FFFFFF" />
                    <Text style={styles.feedbackButtonText}>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.feedbackButton, { backgroundColor: theme.colors.error }]}
                    onPress={() => {
                      console.log('Activity logged: No');
                      setRecommendationModalVisible(false);
                    }}
                  >
                    <X size={20} color="#FFFFFF" />
                    <Text style={styles.feedbackButtonText}>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  sleepMetricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#34B27B',
  },
  insightsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 12,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  viewReportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 6,
  },
  viewReportText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#34B27B',
  },
  playlistScrollContent: {
    paddingRight: 20,
    gap: 16,
  },
  playlistCard: {
    width: 160,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#34B27B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 1,
  },
  recommendedText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  playlistCover: {
    fontSize: 48,
    textAlign: 'center',
    marginVertical: 16,
  },
  playlistTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  playlistFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playlistDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    flex: 1,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#34B27B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  experimentCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  experimentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  experimentEmoji: {
    fontSize: 32,
  },
  experimentInfo: {
    flex: 1,
  },
  experimentTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  experimentDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  experimentProgress: {
    marginTop: 8,
  },
  experimentProgressText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#34B27B',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34B27B',
    borderRadius: 4,
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  feedbackButton: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  feedbackEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  feedbackLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  startExperimentButton: {
    backgroundColor: '#34B27B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startExperimentText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  tutorialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  tutorialEmoji: {
    fontSize: 32,
  },
  tutorialInfo: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 6,
  },
  tutorialMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tutorialType: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize' as const,
  },
  tutorialDot: {
    fontSize: 12,
    color: '#6B7280',
  },
  tutorialDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  exploreLessonsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 6,
  },
  exploreLessonsText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#34B27B',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementsVertical: {
    gap: 12,
  },
  achievementCardVertical: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  achievementCard: {
    width: (SCREEN_WIDTH - 64) / 2,
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  achievementProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#34B27B',
    borderRadius: 3,
  },
  achievementProgressText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500' as const,
  },
  unlockedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#34B27B',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motivationQuote: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  motivationText: {
    fontSize: 14,
    fontStyle: 'italic' as const,
    color: '#6B7280',
    textAlign: 'center',
  },
  recommendationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#34B27B',
  },
  recommendationText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500' as const,
    marginBottom: 8,
    lineHeight: 22,
  },
  recommendationConfidence: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  tryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34B27B',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  tryButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  achievementEmojiLarge: {
    fontSize: 40,
    marginRight: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  achievementDetails: {
    gap: 20,
  },
  achievementDescription: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  progressSection: {
    gap: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34B27B',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  outcomesSection: {
    gap: 12,
  },
  outcomesTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  outcomeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  outcomeText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  recommendationModalText: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 8,
  },
  recommendationModalConfidence: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  feedbackSection: {
    gap: 16,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  viewAllExperimentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#34B27B',
    marginTop: 16,
    gap: 8,
  },
  viewAllExperimentsText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#34B27B',
  },
});

