import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import {
  Heart,
  Target,
  BookOpen,
  TrendingUp,
  Sparkles,
  Calendar,
  Award,
  Lock,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Typography } from '@/constants/Typography';
import { IntimacyService, ConnectionScore as IConnectionScore } from '@/services/intimacy.service';

export default function IntimacyHub() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [connectionScore, setConnectionScore] = useState<IConnectionScore | null>(null);
  const [activeProgram, setActiveProgram] = useState<any>(null);
  const [activeExperiment, setActiveExperiment] = useState<any>(null);
  const [checkInCompleted, setCheckInCompleted] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Load connection score
      const { data: scoreData } = await IntimacyService.getLatestConnectionScore(user.id);
      if (scoreData) {
        setConnectionScore(scoreData);
      }

      // Load active program
      const { data: programData } = await IntimacyService.getActiveProgram(user.id);
      if (programData) {
        setActiveProgram(programData);
      }

      // Load active experiment
      const { data: experimentData } = await IntimacyService.getActiveExperiment(user.id);
      if (experimentData) {
        setActiveExperiment(experimentData);
      }

      // Check if today's check-in is completed
      const today = new Date().toISOString().split('T')[0];
      const { data: checkInData } = await IntimacyService.getCheckInByDate(user.id, today);
      setCheckInCompleted(!!checkInData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = () => {
    if (!connectionScore?.trend) return null;
    if (connectionScore.trend === 'up') return '📈';
    if (connectionScore.trend === 'down') return '📉';
    return '➡️';
  };

  const features = [
    {
      id: 'programs',
      title: 'Coaching Programs',
      description: 'Structured learning paths',
      icon: BookOpen,
      route: '/intimacy-hub', // TODO: Create /intimacy/programs
      color: '#8B5CF6',
    },
    {
      id: 'experiments',
      title: 'Experiments Lab',
      description: 'Test behavioral changes',
      icon: Target,
      route: '/experiments-hub',
      color: '#EC4899',
    },
    {
      id: 'check-in',
      title: 'Daily Check-In',
      description: 'Track emotional wellness',
      icon: Calendar,
      route: '/intimacy-hub', // TODO: Create /intimacy/daily-check-in
      color: '#10B981',
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Insights & analytics',
      icon: TrendingUp,
      route: '/impact-analysis',
      color: '#3B82F6',
    },
    {
      id: 'assessments',
      title: 'Assessments',
      description: 'Mental clarity tests',
      icon: Sparkles,
      route: '/mental-clarity-test',
      color: '#F59E0B',
    },
    {
      id: 'activities',
      title: 'Activities Library',
      description: 'Guided exercises',
      icon: Heart,
      route: '/activities-hub',
      color: '#EF4444',
    },
    {
      id: 'gamification',
      title: 'Achievements',
      description: 'Streaks & rewards',
      icon: Award,
      route: '/intimacy-hub', // TODO: Create /intimacy/achievements
      color: '#F97316',
    },
    {
      id: 'privacy',
      title: 'Privacy Settings',
      description: 'Data & security',
      icon: Lock,
      route: '/intimacy-hub', // TODO: Create /intimacy/privacy
      color: '#6366F1',
    },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 100 }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Intimacy Growth Hub</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Privacy Notice */}
        <View style={[styles.privacyNotice, { backgroundColor: theme.colors.secondary }]}>
          <Lock size={16} color={theme.colors.text} />
          <Text style={[styles.privacyText, { color: theme.colors.text }]}>
            Your data is private and encrypted
          </Text>
        </View>

        {/* Connection Score Card */}
        {connectionScore && (
          <View style={[styles.scoreCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>Connection Score</Text>
            <View style={styles.scoreRow}>
              <Text style={[styles.scoreValue, { color: theme.colors.primary }]}>{connectionScore.score}</Text>
              <Text style={styles.scoreTrend}>{getTrendIcon()}</Text>
            </View>
            <Text style={[styles.scoreSubtext, { color: theme.colors.textSecondary }]}>
              Based on mood, intimacy & communication
            </Text>
          </View>
        )}

        {/* Daily Check-In Quick Action */}
        {!checkInCompleted && (
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              // TODO: Create /intimacy/daily-check-in page
              console.log('Daily check-in - Coming soon!');
            }}
          >
            <Calendar size={20} color="#FFFFFF" />
            <Text style={styles.quickActionText}>Complete Today's Check-In</Text>
            <ChevronRight size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Active Program Card */}
        {activeProgram && (
          <TouchableOpacity
            style={[styles.activeCard, { backgroundColor: theme.colors.card }]}
            onPress={() => {
              // TODO: Create /intimacy/coach-program page
              console.log('View active program - Coming soon!');
            }}
          >
            <View style={styles.activeCardHeader}>
              <BookOpen size={20} color="#8B5CF6" />
              <Text style={[styles.activeCardTitle, { color: theme.colors.text }]}>Active Program</Text>
            </View>
            <Text style={[styles.activeCardName, { color: theme.colors.text }]}>{activeProgram.title}</Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(activeProgram.current_lesson / activeProgram.total_lessons) * 100}%`,
                    backgroundColor: '#8B5CF6',
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
              Lesson {activeProgram.current_lesson} of {activeProgram.total_lessons}
            </Text>
          </TouchableOpacity>
        )}

        {/* Active Experiment Card */}
        {activeExperiment && (
          <TouchableOpacity
            style={[styles.activeCard, { backgroundColor: theme.colors.card }]}
            onPress={() => {
              // TODO: Create /intimacy/experiment page
              console.log('View active experiment - Coming soon!');
            }}
          >
            <View style={styles.activeCardHeader}>
              <Target size={20} color="#EC4899" />
              <Text style={[styles.activeCardTitle, { color: theme.colors.text }]}>Active Experiment</Text>
            </View>
            <Text style={[styles.activeCardName, { color: theme.colors.text }]}>{activeExperiment.title}</Text>
            <Text style={[styles.experimentDays, { color: theme.colors.textSecondary }]}>
              {activeExperiment.duration_days} days • {activeExperiment.parameters_tracked.join(', ')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Features Grid */}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Features</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <TouchableOpacity
                key={feature.id}
                style={[styles.featureCard, { backgroundColor: theme.colors.card }]}
                onPress={() => router.push(feature.route as any)}
              >
                <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                  <Icon size={24} color={feature.color} />
                </View>
                <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{feature.title}</Text>
                <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                  {feature.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}>
          <Heart size={20} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            This hub integrates emotional tracking, evidence-based coaching, and behavioral experiments to strengthen your intimate wellness.
          </Text>
        </View>
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: Typography.fontSize.large,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 16,
    gap: 8,
  },
  privacyText: {
    fontSize: Typography.fontSize.small,
  },
  scoreCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  scoreLabel: {
    fontSize: Typography.fontSize.medium,
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreValue: {
    fontSize: 56,
    fontWeight: Typography.fontWeight.bold,
  },
  scoreTrend: {
    fontSize: 32,
  },
  scoreSubtext: {
    fontSize: Typography.fontSize.small,
    marginTop: 4,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionText: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    color: '#FFFFFF',
    flex: 1,
  },
  activeCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  activeCardTitle: {
    fontSize: Typography.fontSize.medium,
    fontWeight: Typography.fontWeight.medium,
  },
  activeCardName: {
    fontSize: Typography.fontSize.large,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: Typography.fontSize.small,
  },
  experimentDays: {
    fontSize: Typography.fontSize.small,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.heading,
    fontWeight: Typography.fontWeight.bold,
    marginTop: 8,
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  featureCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: Typography.fontSize.body,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: Typography.fontSize.small,
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: Typography.fontSize.small,
    lineHeight: 20,
  },
});
