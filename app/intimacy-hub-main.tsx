import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, TrendingUp, BookOpen, TestTube, Award, Calendar, ChevronRight, X, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import IntimacyHubService, {
  UserMetrics,
  UserProgram,
  UserExperiment,
  UserAchievement
} from '@/services/intimacyHub.service';
import IntimacyInsightsCard from '@/components/intimacy/IntimacyInsightsCard';
import ProgramRecommendationsCard from '@/components/intimacy/ProgramRecommendationsCard';

const { width } = Dimensions.get('window');

export default function IntimacyHubScreen() {
  const { theme } = useTheme();
  const { user, isGuest } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [activePrograms, setActivePrograms] = useState<UserProgram[]>([]);
  const [activeExperiments, setActiveExperiments] = useState<UserExperiment[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<UserAchievement[]>([]);
  const [streak, setStreak] = useState(0);
  const [showCheckinModal, setShowCheckinModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load all dashboard data in parallel
      const [metricsData, programsData, experimentsData, achievementsData, checkinsData] = await Promise.all([
        IntimacyHubService.getUserMetrics(user.id),
        IntimacyHubService.getUserPrograms(user.id, 'active'),
        IntimacyHubService.getUserExperiments(user.id, 'active'),
        IntimacyHubService.getUserAchievements(user.id),
        IntimacyHubService.getCheckins(user.id, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date()),
      ]);

      setMetrics(metricsData);
      setActivePrograms(programsData);
      setActiveExperiments(experimentsData);
      
      // Get most recent 3 achievements
      const sortedAchievements = achievementsData
        .sort((a, b) => new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime())
        .slice(0, 3);
      setRecentAchievements(sortedAchievements);

      // Calculate current streak from check-ins
      const currentStreak = calculateStreak(checkinsData);
      setStreak(currentStreak);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const calculateStreak = (checkins: any[]): number => {
    if (checkins.length === 0) return 0;
    
    // Sort by date descending
    const sorted = checkins.sort((a, b) => 
      new Date(b.check_date).getTime() - new Date(a.check_date).getTime()
    );
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (const checkin of sorted) {
      const checkinDate = new Date(checkin.check_date);
      checkinDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getConnectionScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#8BC34A';
    if (score >= 40) return '#FFC107';
    return '#FF9800';
  };

  const getConnectionScoreLabel = (score: number) => {
    if (score >= 80) return 'Thriving';
    if (score >= 60) return 'Growing';
    if (score >= 40) return 'Building';
    return 'Starting';
  };

  if (isGuest) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.guestContainer}>
          <Heart size={64} color={theme.colors.primary} />
          <Text style={[styles.guestTitle, { color: theme.colors.textPrimary }]}>
            Welcome to Intimacy Growth Hub
          </Text>
          <Text style={[styles.guestText, { color: theme.colors.textSecondary }]}>
            Create an account to access coaching programs, track experiments, and improve your intimacy journey.
          </Text>
          <TouchableOpacity
            style={[styles.guestButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/(auth)/signin' as any)}
          >
            <Text style={[styles.guestButtonText, { color: theme.colors.textPrimary }]}>
              Sign In or Create Account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Loading your intimacy hub...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Intimacy Growth Hub
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Your journey to deeper connection
        </Text>
      </View>

      {/* Intimacy Insights Card */}
      <IntimacyInsightsCard />

      {/* Program Recommendations */}
      <ProgramRecommendationsCard />

      {/* Achievements Section */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface, padding: 16 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.textPrimary }}>
            Achievements
          </Text>
          <TouchableOpacity onPress={() => router.push('/intimacy-hub/achievements' as any)}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.primary }}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {recentAchievements.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {recentAchievements.slice(0, 4).map((achievement) => (
              <View
                key={achievement.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.colors.surfaceVariant,
                  borderRadius: 20,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 14 }}>{achievement.icon}</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: theme.colors.textPrimary }}>
                  {achievement.title}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 16 }}>
            <Award size={24} color={theme.colors.textSecondary} />
            <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
              Complete activities to earn achievements
            </Text>
          </View>
        )}
      </View>

      {/* Insights & Recommendations */}
      {metrics?.data_insights && Array.isArray(metrics.data_insights) && metrics.data_insights.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Insights for You
          </Text>
          {metrics.data_insights.slice(0, 3).map((insight: string, index: number) => (
            <View
              key={index}
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
            >
              <Text style={[styles.insightText, { color: theme.colors.textPrimary }]}>
                💡 {insight}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#E0E7FF',
    textAlign: 'center',
    lineHeight: 22,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    marginBottom: 20,
    padding: 20,
    borderRadius: 20,
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
  cardHeaderTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statSubtext: {
    fontSize: 11,
    color: '#E0E7FF',
    marginTop: 2,
  },
  insightsContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '600',
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
    lineHeight: 20,
  },
  unifiedCheckinButton: {
    padding: 16,
    borderRadius: 12,
  },
  unifiedCheckinContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unifiedCheckinEmoji: {
    fontSize: 36,
    marginRight: 16,
  },
  unifiedCheckinText: {
    flex: 1,
  },
  unifiedCheckinTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  unifiedCheckinSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  programItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  programContent: {
    flex: 1,
  },
  programTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  experimentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  experimentContent: {
    flex: 1,
  },
  experimentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  experimentDays: {
    fontSize: 13,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreCircle: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  scoreDetails: {
    flex: 1,
    marginLeft: 24,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreMetric: {
    fontSize: 14,
  },
  scoreMetricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 20,
    gap: 8,
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  checkinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkinEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  checkinContent: {
    flex: 1,
  },
  checkinTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  checkinDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 20,
    gap: 12,
  },
  achievementBadge: {
    width: (width - 64) / 3,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  guestText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  guestButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
  dailyCheckinCard: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  dailyCheckinContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dailyCheckinEmoji: {
    fontSize: 36,
    marginRight: 16,
  },
  dailyCheckinTextContent: {
    flex: 1,
  },
  dailyCheckinTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  dailyCheckinSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  modalDragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 2,
    marginBottom: 8,
  },
  modalInstruction: {
    fontSize: 12,
    marginBottom: 4,
  },
  modalCloseButton: {
    position: 'absolute',
    right: 20,
    top: 12,
    padding: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  checkinOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  checkinOptionEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  checkinOptionContent: {
    flex: 1,
  },
  checkinOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  checkinOptionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  emptyCardTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyCardText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  achievementsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    gap: 12,
  },
  achievementsBannerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
});
