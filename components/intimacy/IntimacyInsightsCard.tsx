import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {
  TrendingUp,
  BookOpen,
  FlaskConical,
  Info,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import IntimacyHubService from '@/services/intimacyHub.service';
import { IntimacyService } from '@/services/intimacy.service';
import { router } from 'expo-router';
import { SupabaseSafe } from '@/lib/supabaseSafe';

interface IntimacyLogData {
  date: string;
  orgasm: boolean;
  initiated: boolean | null;
  toy_used: boolean;
  type: string;
  time_of_day?: string;
  mood_before: number;
  mood_after: number;
}

interface DayData {
  date: number;
  dateStr: string;
  isToday: boolean;
  hasIntimacy: boolean;
  orgasmed: boolean;
  initiated: boolean;
  toyUsed: boolean;
  timeOfDay?: string;
}

interface InsightsData {
  // Calendar data
  dayDataMap: Map<string, IntimacyLogData>;

  // Monthly summary
  totalSessions: number;
  orgasmCount: number;
  orgasmGoal: number;
  initiatedCount: number;
  toyUsedCount: number;

  // Mood data
  avgMoodBefore: number;
  avgMoodAfter: number;
  moodChangeAvg: number;

  // Check-in data
  preCheckinAvg: number;
  postCheckinAvg: number;

  // Programs
  programsActive: number;
  currentStreak: number;
}

export default function IntimacyInsightsCard() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<InsightsData>({
    dayDataMap: new Map(),
    totalSessions: 0,
    orgasmCount: 0,
    orgasmGoal: 30,
    initiatedCount: 0,
    toyUsedCount: 0,
    avgMoodBefore: 0,
    avgMoodAfter: 0,
    moodChangeAvg: 0,
    preCheckinAvg: 0,
    postCheckinAvg: 0,
    programsActive: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    loadInsights();
  }, [user]);

  const loadInsights = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Fetch all data in parallel
      const [logsResult, checkins, activePrograms, goalsResult] = await Promise.all([
        IntimacyService.getByDateRange(
          user.id,
          startOfMonth.toISOString().split('T')[0],
          endOfMonth.toISOString().split('T')[0]
        ),
        IntimacyHubService.getCheckins(user.id, startOfMonth, endOfMonth),
        IntimacyHubService.getUserPrograms(user.id, 'active'),
        SupabaseSafe.select('user_intimacy_goals', {
          eq: { user_id: user.id, goal_type: 'orgasm', status: 'active' }
        }, user.id),
      ]);

      const intimacyLogs = logsResult.data || [];

      // Build day data map for calendar
      const dayDataMap = new Map<string, IntimacyLogData>();
      intimacyLogs.forEach(log => {
        dayDataMap.set(log.date, {
          date: log.date,
          orgasm: log.orgasm || false,
          initiated: log.initiated,
          toy_used: log.toy_used || false,
          type: log.type || 'solo',
          time_of_day: log.time_of_day,
          mood_before: log.mood_before || 0,
          mood_after: log.mood_after || 0,
        });
      });

      // Calculate monthly stats
      const totalSessions = intimacyLogs.length;
      const orgasmCount = intimacyLogs.filter(log => log.orgasm).length;
      const initiatedCount = intimacyLogs.filter(log => log.initiated === true).length;
      const toyUsedCount = intimacyLogs.filter(log => log.toy_used).length;
      const orgasmGoal = goalsResult.data?.[0]?.target_value || 30;

      // Calculate mood averages from intimacy_logs
      const logsWithMood = intimacyLogs.filter(log => log.mood_before && log.mood_after);
      const avgMoodBefore = logsWithMood.length > 0
        ? logsWithMood.reduce((sum, log) => sum + (log.mood_before || 0), 0) / logsWithMood.length
        : 0;
      const avgMoodAfter = logsWithMood.length > 0
        ? logsWithMood.reduce((sum, log) => sum + (log.mood_after || 0), 0) / logsWithMood.length
        : 0;

      // Calculate check-in averages
      const preCheckins = checkins.filter(c => c.checkin_type === 'pre_intimacy');
      const postCheckins = checkins.filter(c => c.checkin_type === 'post_intimacy');

      const preCheckinAvg = preCheckins.length > 0
        ? preCheckins.reduce((sum, c) => sum + (c.mood || 5), 0) / preCheckins.length
        : 0;
      const postCheckinAvg = postCheckins.length > 0
        ? postCheckins.reduce((sum, c) => sum + (c.mood || 5), 0) / postCheckins.length
        : 0;

      // Calculate streak
      const dates = intimacyLogs.map(log => log.date);
      const currentStreak = calculateStreak(dates);

      setInsights({
        dayDataMap,
        totalSessions,
        orgasmCount,
        orgasmGoal,
        initiatedCount,
        toyUsedCount,
        avgMoodBefore: Math.round(avgMoodBefore * 10) / 10,
        avgMoodAfter: Math.round(avgMoodAfter * 10) / 10,
        moodChangeAvg: Math.round((avgMoodAfter - avgMoodBefore) * 10) / 10,
        preCheckinAvg: Math.round(preCheckinAvg * 10) / 10,
        postCheckinAvg: Math.round(postCheckinAvg * 10) / 10,
        programsActive: activePrograms.length,
        currentStreak,
      });
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (dates: string[]) => {
    if (dates.length === 0) return 0;
    const sortedDates = [...new Set(dates)].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (sortedDates[0] === today || sortedDates[0] === yesterday) {
      streak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        if (Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000) === 1) {
          streak++;
        } else break;
      }
    }
    return streak;
  };

  // Get current week days with detailed data
  const getWeekDays = (): DayData[] => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);

    const days: DayData[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const logData = insights.dayDataMap.get(dateStr);

      days.push({
        date: date.getDate(),
        dateStr,
        isToday: dateStr === today.toISOString().split('T')[0],
        hasIntimacy: !!logData,
        orgasmed: logData?.orgasm || false,
        initiated: logData?.initiated === true,
        toyUsed: logData?.toy_used || false,
        timeOfDay: logData?.time_of_day,
      });
    }
    return days;
  };

  const weekDays = getWeekDays();
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      ...theme.shadows.small,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    subtitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    // Weekly calendar
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    dayColumn: {
      alignItems: 'center',
      flex: 1,
    },
    dayName: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    dayCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    dayNumber: {
      fontSize: 14,
      fontWeight: '700',
    },
    todayBorder: {
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    intimacyBg: {
      backgroundColor: '#3B82F6', // Blue for intimacy
    },
    // Indicator dots
    dotsContainer: {
      flexDirection: 'row',
      gap: 2,
      marginTop: 3,
      height: 6,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
    },
    orgasmDot: {
      backgroundColor: '#10B981', // Green
    },
    initiatedDot: {
      backgroundColor: '#F59E0B', // Yellow
    },
    toyDot: {
      backgroundColor: '#8B5CF6', // Purple
    },
    // Legend
    legendContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 16,
      paddingTop: 8,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    // Check-in buttons
    checkinRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
    },
    checkinCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary + '15',
      borderRadius: 24,
      paddingVertical: 10,
      paddingHorizontal: 12,
      gap: 6,
    },
    checkinEmoji: {
      fontSize: 18,
    },
    checkinLabel: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    // Monthly summary
    summarySection: {
      marginBottom: 16,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      marginBottom: 12,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    statItem: {
      width: '48%',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 10,
      padding: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statContent: {
      flex: 1,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    statLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    // Mood section
    moodSection: {
      marginBottom: 16,
    },
    moodRow: {
      flexDirection: 'row',
      gap: 8,
    },
    moodCard: {
      flex: 1,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 10,
      padding: 10,
      alignItems: 'center',
    },
    moodValue: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    moodLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    moodChange: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 10,
      padding: 10,
      marginTop: 8,
      gap: 8,
    },
    moodChangeValue: {
      fontSize: 20,
      fontWeight: '800',
    },
    moodChangeLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    // Action buttons
    actionRow: {
      flexDirection: 'row',
      gap: 10,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 24,
      backgroundColor: theme.colors.primary + '15',
      gap: 6,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.colors.primary,
    },
    loadingContainer: {
      paddingVertical: 40,
      alignItems: 'center',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    emptyText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={{ marginTop: 8, fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary }}>
            Loading insights...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Intimacy Insights</Text>
          <Text style={styles.subtitle}>This Month</Text>
        </View>
        <TouchableOpacity>
          <Info size={18} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Weekly Calendar with Color-coded Dots */}
      <View style={styles.weekRow}>
        {weekDays.map((day, i) => (
          <View key={i} style={styles.dayColumn}>
            <Text style={styles.dayName}>{dayNames[i]}</Text>
            <View
              style={[
                styles.dayCircle,
                day.isToday && styles.todayBorder,
                day.hasIntimacy && styles.intimacyBg,
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  {
                    color: day.hasIntimacy
                      ? '#FFFFFF'
                      : day.isToday
                      ? theme.colors.primary
                      : theme.colors.textSecondary,
                  },
                ]}
              >
                {day.date}
              </Text>
            </View>
            {/* Indicator dots */}
            <View style={styles.dotsContainer}>
              {day.orgasmed && <View style={[styles.dot, styles.orgasmDot]} />}
              {day.initiated && <View style={[styles.dot, styles.initiatedDot]} />}
              {day.toyUsed && <View style={[styles.dot, styles.toyDot]} />}
            </View>
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Intimacy</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.orgasmDot]} />
          <Text style={styles.legendText}>Orgasm</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.initiatedDot]} />
          <Text style={styles.legendText}>Initiated</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.toyDot]} />
          <Text style={styles.legendText}>Toy Used</Text>
        </View>
      </View>

      {/* Pre/Post Check-in Buttons */}
      <View style={styles.checkinRow}>
        <TouchableOpacity
          style={styles.checkinCard}
          onPress={() => router.push('/intimacy-hub/check-in?type=pre' as any)}
        >
          <Text style={styles.checkinEmoji}>💭</Text>
          <Text style={styles.checkinLabel}>Pre Check-in</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.checkinCard}
          onPress={() => router.push('/intimacy-hub/check-in?type=post' as any)}
        >
          <Text style={styles.checkinEmoji}>💕</Text>
          <Text style={styles.checkinLabel}>Post Check-in</Text>
        </TouchableOpacity>
      </View>

      {/* Monthly Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Monthly Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#3B82F620' }]}>
              <Text style={{ fontSize: 16 }}>📅</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{insights.totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#10B98120' }]}>
              <Text style={{ fontSize: 16 }}>✨</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{insights.orgasmCount}/{insights.orgasmGoal}</Text>
              <Text style={styles.statLabel}>Orgasms</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#F59E0B20' }]}>
              <Text style={{ fontSize: 16 }}>🔥</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{insights.initiatedCount}</Text>
              <Text style={styles.statLabel}>Initiated</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#8B5CF620' }]}>
              <Text style={{ fontSize: 16 }}>🎮</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{insights.toyUsedCount}</Text>
              <Text style={styles.statLabel}>Toys Used</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: '#EC489920' }]}>
              <Text style={{ fontSize: 16 }}>🔥</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{insights.currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={{ fontSize: 16 }}>📚</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValue}>{insights.programsActive}</Text>
              <Text style={styles.statLabel}>Programs</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Mood Analytics */}
      <View style={styles.moodSection}>
        <Text style={styles.summaryTitle}>Mood Analytics</Text>
        <View style={styles.moodRow}>
          <View style={styles.moodCard}>
            <Text style={styles.moodValue}>
              {insights.avgMoodBefore > 0 ? insights.avgMoodBefore : '-'}
            </Text>
            <Text style={styles.moodLabel}>Avg Before</Text>
          </View>
          <View style={styles.moodCard}>
            <Text style={styles.moodValue}>
              {insights.avgMoodAfter > 0 ? insights.avgMoodAfter : '-'}
            </Text>
            <Text style={styles.moodLabel}>Avg After</Text>
          </View>
          <View style={styles.moodCard}>
            <Text style={styles.moodValue}>
              {insights.preCheckinAvg > 0 ? insights.preCheckinAvg : '-'}
            </Text>
            <Text style={styles.moodLabel}>Pre Check-in</Text>
          </View>
          <View style={styles.moodCard}>
            <Text style={styles.moodValue}>
              {insights.postCheckinAvg > 0 ? insights.postCheckinAvg : '-'}
            </Text>
            <Text style={styles.moodLabel}>Post Check-in</Text>
          </View>
        </View>

        {/* Mood Change */}
        <View style={styles.moodChange}>
          <TrendingUp
            size={16}
            color={insights.moodChangeAvg >= 0 ? '#10B981' : '#EF4444'}
          />
          <Text style={[
            styles.moodChangeValue,
            { color: insights.moodChangeAvg >= 0 ? '#10B981' : '#EF4444' }
          ]}>
            {insights.avgMoodBefore === 0 && insights.avgMoodAfter === 0
              ? '-'
              : (insights.moodChangeAvg >= 0 ? '+' : '') + insights.moodChangeAvg}
          </Text>
          <Text style={styles.moodChangeLabel}>
            {insights.avgMoodBefore === 0 && insights.avgMoodAfter === 0
              ? 'Log intimacy to see mood change'
              : 'Mood change after intimacy'}
          </Text>
        </View>
      </View>

      {/* Programs & Experiments Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/intimacy-hub/programs' as any)}
        >
          <BookOpen size={14} color={theme.colors.primary} />
          <Text style={styles.actionText}>Programs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/experiments-hub' as any)}
        >
          <FlaskConical size={14} color={theme.colors.primary} />
          <Text style={styles.actionText}>Experiments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
