import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Pressable,
  Platform,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Moon,
  TrendingUp,
  Play,
  Plus,
  Settings,
  Sparkles,
  Target,
  Clock,
  Award,
  X,
  ChevronRight,
  Flame,
  Trophy,
  FlaskConical,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SleepService } from '@/services/sleep.service';
import { HabitsService } from '@/services/habits.service';
import {
  calculateSleepStreak,
  getEarnedBadges,
  getSleepPoints,
  SleepStreak,
  BadgeDefinition,
} from '@/lib/sleepStreakUtils';
import SleepStreakCalendar, { DayActivity, SleepHabitType } from '@/components/sleep/SleepStreakCalendar';
import SleepTimesCalendar, { DaySleepData } from '@/components/sleep/SleepTimesCalendar';

interface SleepDashboardProps {
  onRecalibrate: () => void;
}

interface SleepProfile {
  targetSleepHours: number;
  weekdayBedtime: string;
  weekdayWakeTime: string;
  consistencyTarget: number;
  audioStyle: string[];
}

interface SleepStats {
  lastNight: {
    duration: number;
    bedtime: string;
    wakeTime: string;
    quality: number;
  } | null;
  weeklyConsistency: number;
  averageDuration: number;
  streak: number;
}

const SLEEP_PROFILE_KEY = 'sleep_profile';

export default function SleepDashboard({ onRecalibrate }: SleepDashboardProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [profile, setProfile] = useState<SleepProfile | null>(null);
  const [stats, setStats] = useState<SleepStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState<string>('');
  const [streak, setStreak] = useState<SleepStreak | null>(null);
  const [showBadges, setShowBadges] = useState(false);
  const [last7DaysData, setLast7DaysData] = useState<DayActivity[]>([]);
  const [last7DaysSleepData, setLast7DaysSleepData] = useState<DaySleepData[]>([]);

  useEffect(() => {
    loadProfile();
    loadStats();
    loadStreak();
    load7DaysData();
    load7DaysSleepTimes();
  }, []);

  const loadStreak = async () => {
    try {
      const userId = user?.id || 'guest_user';
      if (profile) {
        const streakData = await calculateSleepStreak(
          userId,
          profile.weekdayBedtime,
          profile.consistencyTarget
        );
        setStreak(streakData);
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const load7DaysData = async () => {
    try {
      const userId = user?.id || 'guest_user';
      const today = new Date();
      const days: DayActivity[] = [];
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      // Get last 7 days of sleep data
      const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
      const { data: sleepLogs } = await SleepService.getByDateRange(
        userId,
        sevenDaysAgo.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );

      // Get sleep habits for this user
      const { data: allHabits } = await HabitsService.getAll(userId);
      const sleepHabits = allHabits?.filter((h: any) => h.category === 'Sleep') || [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = dayNames[date.getDay()];
        const dayNumber = date.getDate();
        
        const sleepLog = sleepLogs?.find((log: any) => log.date === dateStr);
        
        // Get actual habits completed from habit_logs table
        const habits: SleepHabitType[] = [];
        for (const habit of sleepHabits) {
          const logResult = await HabitsService.getHabitLogByDate(habit.id, dateStr, userId);
          if (logResult.data && logResult.data.completed) {
            // Map habit names to calendar habit types
            const habitName = habit.name.toLowerCase();
            if (habitName.includes('meditat')) habits.push('meditation');
            else if (habitName.includes('bath') || habitName.includes('shower')) habits.push('bath');
            else if (habitName.includes('read')) habits.push('reading');
            else if (habitName.includes('caffeine') || habitName.includes('coffee')) habits.push('no_caffeine');
            else if (habitName.includes('stretch') || habitName.includes('yoga') || habitName.includes('exercise')) habits.push('exercise');
            else if (habitName.includes('music')) habits.push('music');
            else if (habitName.includes('breath')) habits.push('breathing');
            // Add to 'meditation' if we can't categorize (generic habit completed)
            else habits.push('meditation');
          }
        }
        
        // Check if bedtime was on target
        const profileData = await AsyncStorage.getItem(`${SLEEP_PROFILE_KEY}_${userId}`);
        const targetBedtime = profileData ? JSON.parse(profileData).weekdayBedtime : '23:00';
        const consistencyTarget = profileData ? JSON.parse(profileData).consistencyTarget : 30;
        
        let onTarget = false;
        if (sleepLog?.bedtime) {
          const [targetHour, targetMin] = targetBedtime.split(':').map(Number);
          const [actualHour, actualMin] = sleepLog.bedtime.split(':').map(Number);
          const diffMinutes = Math.abs((actualHour * 60 + actualMin) - (targetHour * 60 + targetMin));
          onTarget = diffMinutes <= consistencyTarget;
        }
        
        days.push({
          date: dateStr,
          dayOfWeek,
          dayNumber,
          habits: habits.length > 0 ? habits : ['none'],
          onTarget,
        });
      }
      
      setLast7DaysData(days);
    } catch (error) {
      console.error('Error loading 7 days data:', error);
    }
  };

  const load7DaysSleepTimes = async () => {
    try {
      const userId = user?.id || 'guest_user';
      const today = new Date();
      const days: DaySleepData[] = [];
      
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      
      // Get last 7 days of sleep data
      const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
      const { data: sleepLogs } = await SleepService.getByDateRange(
        userId,
        sevenDaysAgo.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );

      // Get profile for target hours
      const profileData = await AsyncStorage.getItem(`${SLEEP_PROFILE_KEY}_${userId}`);
      const targetHours = profileData ? JSON.parse(profileData).targetSleepHours : 8;
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = dayNames[date.getDay()];
        const dayNumber = date.getDate();
        
        const sleepLog = sleepLogs?.find((log: any) => log.date === dateStr);
        
        days.push({
          date: dateStr,
          dayOfWeek,
          dayNumber,
          hoursSlept: sleepLog?.hours,
          targetHours,
          hasData: !!sleepLog,
        });
      }
      
      setLast7DaysSleepData(days);
    } catch (error) {
      console.error('Error loading 7 days sleep times:', error);
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
        // Load streak after profile is loaded
        const streakData = await calculateSleepStreak(
          userId,
          profileData.weekdayBedtime,
          profileData.consistencyTarget
        );
        setStreak(streakData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadStats = async () => {
    try {
      setLoading(true);
      const userId = user?.id || 'guest_user';
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Get last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const [lastNightResult, weeklyResult] = await Promise.all([
        SleepService.getByDateRange(userId, yesterday, today),
        SleepService.getByDateRange(userId, sevenDaysAgo, today),
      ]);

      const lastNightData = lastNightResult.data?.[0];
      const weeklyData = weeklyResult.data || [];

      // Calculate stats
      const lastNight = lastNightData ? {
        duration: lastNightData.hours || 0,
        bedtime: (lastNightData.bedtime || '00:00').substring(0, 5),
        wakeTime: (lastNightData.wake_time || '00:00').substring(0, 5),
        quality: lastNightData.quality || 0,
      } : null;

      // Calculate weekly consistency
      let consistencyCount = 0;
      const profileData = await AsyncStorage.getItem(`${SLEEP_PROFILE_KEY}_${userId}`);
      const targetBedtime = profileData ? JSON.parse(profileData).weekdayBedtime : '23:00';
      
      weeklyData.forEach((entry: any) => {
        if (entry.bedtime) {
          const [targetHour, targetMin] = targetBedtime.split(':').map(Number);
          const [actualHour, actualMin] = entry.bedtime.split(':').map(Number);
          const diffMinutes = Math.abs((actualHour * 60 + actualMin) - (targetHour * 60 + targetMin));
          if (diffMinutes <= 30) consistencyCount++;
        }
      });

      const avgDuration = weeklyData.length > 0
        ? weeklyData.reduce((sum: number, entry: any) => sum + (entry.hours || 0), 0) / weeklyData.length
        : 0;

      setStats({
        lastNight,
        weeklyConsistency: Math.round((consistencyCount / 7) * 100),
        averageDuration: Number(avgDuration.toFixed(1)),
        streak: consistencyCount,
      });

      // Generate insight
      generateInsight(lastNight, weeklyData, profileData ? JSON.parse(profileData) : null);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsight = (lastNight: any, weeklyData: any[], profile: any) => {
    if (!lastNight || !profile) {
      setInsight('Start logging your sleep to get personalized insights!');
      return;
    }

    const targetHours = profile.targetSleepHours || 8;
    const diff = lastNight.duration - targetHours;

    if (Math.abs(diff) < 0.5) {
      setInsight('🎯 Perfect! You hit your sleep target last night!');
    } else if (diff < 0) {
      setInsight(`💤 You got ${Math.abs(diff).toFixed(1)}h less sleep than your target. Try going to bed 30 minutes earlier tonight.`);
    } else {
      setInsight(`😴 You got ${diff.toFixed(1)}h more sleep than your target! Great job prioritizing rest.`);
    }
  };

  const handleWindDown = () => {
    // Navigate to wind-down flow
    router.push('/sleep-wellness/wind-down' as any);
  };

  const handleLogSleep = () => {
    // Navigate to sleep log entry
    router.push('/(tabs)/add-entry' as any);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading your sleep data...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: theme.colors.card }]}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Sleep Hub</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Your sleep wellness journey
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => {
              Alert.alert(
                'Sleep Hub Settings',
                'What would you like to do?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Recalibrate Profile', onPress: onRecalibrate },
                  { text: 'View Trends', onPress: () => router.push('/(tabs)/calendar' as any) },
                ]
              );
            }}
          >
            <Settings size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={[styles.summaryCard, { 
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }]}>
          <View style={styles.summaryHeader}>
            <Moon size={24} color={theme.colors.primary} />
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Last Night</Text>
          </View>

          {stats?.lastNight ? (
            <>
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {stats.lastNight.duration}h
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Sleep</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {stats.lastNight.bedtime}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Bedtime</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {stats.lastNight.wakeTime}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Wake</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {stats.lastNight.quality}/5
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Quality</Text>
                </View>
              </View>

              <View style={styles.consistencyRow}>
                <Clock size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.consistencyText, { color: theme.colors.textSecondary }]}>
                  Bedtime within target {Math.round((stats.weeklyConsistency / 100) * 7)} out of 7 nights
                </Text>
              </View>
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
                No sleep data for last night
              </Text>
              <TouchableOpacity
                style={[styles.logButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleLogSleep}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.logButtonText}>Log Last Night's Sleep</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Sleep Streak Card with Calendar */}
        {streak && last7DaysData.length > 0 && last7DaysSleepData.length > 0 ? (
          <View style={[styles.streakCard, { 
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }]}>
            <View style={styles.streakHeader}>
              <View style={styles.streakHeaderText}>
                <Text style={[styles.streakTitle, { color: theme.colors.text }]}>
                  Weekly Overview
                </Text>
                <Text style={[styles.streakSubtitle, { color: theme.colors.textSecondary }]}>
                  Last 7 days tracking
                </Text>
              </View>
              {streak.badgesEarned.length > 0 && (
                <TouchableOpacity
                  style={[styles.badgesButton, { backgroundColor: theme.colors.accent }]}
                  onPress={() => setShowBadges(true)}
                >
                  <Trophy size={18} color={theme.colors.primary} />
                  <Text style={[styles.badgesCount, { color: theme.colors.primary }]}>
                    {streak.badgesEarned.length}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Sleep Times Calendar */}
            <View style={styles.calendarSection}>
              <View style={styles.calendarHeader}>
                <Moon size={16} color={theme.colors.primary} />
                <Text style={[styles.calendarHeaderTitle, { color: theme.colors.text }]}>
                  Sleep Hours vs Target
                </Text>
              </View>
              <SleepTimesCalendar
                last7Days={last7DaysSleepData}
                onDayPress={(date) => router.push(`/sleep-wellness?date=${date}` as any)}
              />
            </View>

            {/* Divider */}
            <View style={[styles.calendarDivider, { backgroundColor: theme.colors.border }]} />

            {/* Sleep Habits Calendar */}
            <View style={styles.calendarSection}>
              <View style={styles.calendarHeader}>
                <Sparkles size={16} color={theme.colors.primary} />
                <Text style={[styles.calendarHeaderTitle, { color: theme.colors.text }]}>
                  Sleep Habits Completed
                </Text>
              </View>
              <SleepStreakCalendar
                last7Days={last7DaysData}
                currentStreak={streak.currentStreak}
              />
            </View>

            {streak.currentStreak === 0 && streak.totalNightsOnTarget === 0 ? (
              <View style={styles.streakMotivation}>
                <Text style={[styles.motivationText, { color: theme.colors.textSecondary }]}>
                  🎯 Start your streak tonight by meeting your bedtime target!
                </Text>
              </View>
            ) : streak.currentStreak === 0 ? (
              <View style={styles.streakMotivation}>
                <Text style={[styles.motivationText, { color: theme.colors.textSecondary }]}>
                  💪 Don't break the chain! Get back on track tonight.
                </Text>
              </View>
            ) : streak.currentStreak >= 7 ? (
              <View style={styles.streakMotivation}>
                <Text style={[styles.motivationText, { color: theme.colors.primary }]}>
                  🌟 Amazing! You're building a strong sleep routine!
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          /* Empty State - No Sleep Data */
          <View style={[styles.emptyStateCard, { 
            backgroundColor: theme.colors.card,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }]}>
            <View style={styles.emptyStateContent}>
              <Moon size={48} color={theme.colors.textSecondary} opacity={0.5} />
              <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                Start Tracking Your Sleep
              </Text>
              <Text style={[styles.emptyStateDescription, { color: theme.colors.textSecondary }]}>
                Log your sleep for 3+ nights to see patterns, earn badges, and get personalized insights
              </Text>
              <TouchableOpacity
                style={[styles.emptyStateButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/sleep-wellness/morning-check-in' as any)}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.emptyStateButtonText}>Log Your First Night</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Badges Modal */}
        {showBadges && streak && (
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
            <View style={[styles.badgesModal, { 
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }]}>
              <View style={styles.badgesModalHeader}>
                <Text style={[styles.badgesModalTitle, { color: theme.colors.text }]}>
                  Sleep Badges
                </Text>
                <TouchableOpacity onPress={() => setShowBadges(false)}>
                  <X size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.badgesScroll}>
                {getEarnedBadges(streak.badgesEarned).map((badge, index) => (
                  <View
                    key={badge.id}
                    style={[
                      styles.badgeItem,
                      { borderBottomColor: theme.colors.border },
                      index === getEarnedBadges(streak.badgesEarned).length - 1 && { borderBottomWidth: 0 }
                    ]}
                  >
                    <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                    <View style={styles.badgeInfo}>
                      <Text style={[styles.badgeName, { color: theme.colors.text }]}>
                        {badge.name}
                      </Text>
                      <Text style={[styles.badgeDescription, { color: theme.colors.textSecondary }]}>
                        {badge.description}
                      </Text>
                    </View>
                  </View>
                ))}

                {streak.badgesEarned.length === 0 && (
                  <View style={styles.noBadgesContainer}>
                    <Text style={[styles.noBadgesText, { color: theme.colors.textSecondary }]}>
                      Keep building your sleep streak to earn badges!
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Insight Card or Empty State */}
        {insight ? (
          <View style={[styles.insightCard, { 
            backgroundColor: theme.colors.accent,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }]}>
            <Sparkles size={20} color={theme.colors.primary} />
            <Text style={[styles.insightText, { color: theme.colors.text }]}>{insight}</Text>
          </View>
        ) : stats?.lastNight === null && (
          <View style={[styles.emptyInsightCard, { 
            backgroundColor: theme.colors.accent,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }]}>
            <Sparkles size={20} color={theme.colors.textSecondary} opacity={0.5} />
            <Text style={[styles.emptyInsightText, { color: theme.colors.textSecondary }]}>
              💡 Log tonight's sleep to get personalized insights and recommendations
            </Text>
          </View>
        )}

        {/* Action Cards */}
        <View style={styles.actionsGrid}>
          <Pressable
            onPress={() => router.push('/sleep-wellness/wind-down' as any)}
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              pressed && styles.chipPressed,
            ]}
            android_ripple={{ color: 'rgba(0,0,0,0.06)', radius: 40 }}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
              <Play size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Wind-Down</Text>
              <Text style={[styles.actionDescription, { color: theme.colors.textSecondary }]}>
                Start your evening routine
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push('/sleep-wellness/morning-check-in' as any)}
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              pressed && styles.chipPressed,
            ]}
            android_ripple={{ color: 'rgba(0,0,0,0.06)', radius: 40 }}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.success + '20' }]}>
              <Plus size={18} color={theme.colors.success} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Check-In</Text>
              <Text style={[styles.actionDescription, { color: theme.colors.textSecondary }]}>
                Log how you slept last night
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push('/create-experiment?category=Sleep' as any)}
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              pressed && styles.chipPressed,
            ]}
            android_ripple={{ color: 'rgba(0,0,0,0.06)', radius: 40 }}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#8B5CF6' + '20' }]}>
              <FlaskConical size={18} color="#8B5CF6" />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Experiments</Text>
              <Text style={[styles.actionDescription, { color: theme.colors.textSecondary }]}>
                Try 7-day sleep experiments
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push('/sleep-wellness/content-library' as any)}
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              pressed && styles.chipPressed,
            ]}
            android_ripple={{ color: 'rgba(0,0,0,0.06)', radius: 40 }}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.warning + '20' }]}>
              <Moon size={18} color={theme.colors.warning} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={[styles.actionTitle, { color: theme.colors.text }]}>Library</Text>
              <Text style={[styles.actionDescription, { color: theme.colors.textSecondary }]}>
                Browse tons of audios for bedtime
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Coaching Program Card */}
        <TouchableOpacity
          style={[styles.coachingCard, { 
            backgroundColor: theme.colors.primary,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }]}
          onPress={() => router.push('/sleep-wellness/programme-hub' as any)}
        >
          <View style={styles.coachingLeft}>
            <Award size={32} color="#FFFFFF" />
            <View style={styles.coachingText}>
              <Text style={styles.coachingTitle}>Sleep Programme</Text>
              <Text style={styles.coachingDescription}>
                Customizable guided programmes to improve your sleep
              </Text>
            </View>
          </View>
          <ChevronRight size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Habit Suggestion - Smart recommendation based on sleep data */}
        {stats && profile && (() => {
          // Generate smart suggestion based on sleep patterns
          let suggestion = '';
          let emoji = '🎯';
          
          if (stats.weeklyConsistency < 50) {
            // Poor consistency - suggest bedtime routine
            const targetBedtime = profile.weekdayBedtime || '22:00';
            const [hour, min] = targetBedtime.split(':');
            const hourNum = parseInt(hour);
            const displayHour = hourNum > 12 ? hourNum - 12 : hourNum;
            const ampm = hourNum >= 12 ? 'pm' : 'am';
            suggestion = `Start wind-down routine by ${displayHour}:${min}${ampm}`;
            emoji = '🌙';
          } else if (stats.averageDuration < (profile.targetSleepHours - 0.5)) {
            // Not getting enough sleep - suggest earlier bedtime
            suggestion = 'Try going to bed 30 minutes earlier';
            emoji = '💤';
          } else if (stats.lastNight && stats.lastNight.quality < 3) {
            // Poor quality - suggest habits
            suggestion = 'Avoid screens 30 minutes before bed';
            emoji = '📱';
          } else {
            // Good sleep - suggest maintenance
            suggestion = 'Keep up your consistent sleep schedule!';
            emoji = '✨';
          }
          
          return (
            <TouchableOpacity
              style={[styles.habitSuggestion, { 
                backgroundColor: theme.colors.card,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }]}
              onPress={() => router.push('/habit-library?category=sleep' as any)}
            >
              <View style={styles.habitLeft}>
                <Target size={24} color={theme.colors.primary} />
                <View style={styles.habitText}>
                  <Text style={[styles.habitTitle, { color: theme.colors.text }]}>
                    {emoji} Suggested Habit
                  </Text>
                  <Text style={[styles.habitDescription, { color: theme.colors.textSecondary }]}>
                    {suggestion}
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          );
        })()}

        {/* Quick Stats */}
        <View style={styles.quickStatsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>This Week</Text>
          <View style={styles.quickStatsGrid}>
            <View style={[styles.quickStatCard, { 
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }]}>
              <Text style={[styles.quickStatValue, { color: theme.colors.text }]}>
                {stats?.averageDuration || 0}h
              </Text>
              <Text style={[styles.quickStatLabel, { color: theme.colors.textSecondary }]}>
                Avg Sleep
              </Text>
            </View>
            <View style={[styles.quickStatCard, { 
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }]}>
              <Text style={[styles.quickStatValue, { color: theme.colors.text }]}>
                {stats?.streak || 0}/7
              </Text>
              <Text style={[styles.quickStatLabel, { color: theme.colors.textSecondary }]}>
                On Target
              </Text>
            </View>
            <View style={[styles.quickStatCard, { 
              backgroundColor: theme.colors.card,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }]}>
              <Text style={[styles.quickStatValue, { color: theme.colors.text }]}>
                {profile?.targetSleepHours || 8}h
              </Text>
              <Text style={[styles.quickStatLabel, { color: theme.colors.textSecondary }]}>
                Goal
              </Text>
            </View>
          </View>
          
          {/* Empty State Overlay for Quick Stats */}
          {stats && stats.averageDuration === 0 && stats.streak === 0 && (
            <View style={[styles.quickStatsEmptyOverlay, { backgroundColor: theme.colors.background + 'E6' }]}>
              <Text style={[styles.quickStatsEmptyText, { color: theme.colors.textSecondary }]}>
                📊 Track sleep for a week to see your stats
              </Text>
            </View>
          )}
        </View>

        {/* View Full Report */}
        <TouchableOpacity
          style={[styles.reportButton, { 
            backgroundColor: theme.colors.secondary,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }]}
          onPress={() => router.push('/sleep-wellness/trends' as any)}
        >
          <TrendingUp size={20} color={theme.colors.primary} />
          <Text style={[styles.reportButtonText, { color: theme.colors.text }]}>
            View Trends & Insights
          </Text>
          <ChevronRight size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  consistencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  consistencyText: {
    fontSize: 14,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 16,
  },
  noDataText: {
    fontSize: 16,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  logButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 16,
    padding: 16,
  },
  insightText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 8,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    // subtle shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
  },
  chipPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.8,
  },
  coachingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  coachingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  coachingText: {
    flex: 1,
  },
  coachingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  coachingDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  habitSuggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  habitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  habitText: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  habitDescription: {
    fontSize: 15,
    fontWeight: '500',
  },
  quickStatsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 16,
  },
  reportButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  streakCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  streakSubtitle: {
    fontSize: 13,
  },
  badgesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgesCount: {
    fontSize: 14,
    fontWeight: '700',
  },
  streakContent: {
    gap: 16,
  },
  streakMain: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  streakNumber: {
    fontSize: 64,
    fontWeight: '900',
    lineHeight: 70,
  },
  streakLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  streakStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  streakStatItem: {
    alignItems: 'center',
  },
  streakStatValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  streakStatLabel: {
    fontSize: 12,
  },
  streakDivider: {
    width: 1,
    height: 40,
  },
  streakMotivation: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  motivationText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  calendarSection: {
    gap: 12,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  calendarHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  calendarDivider: {
    height: 1,
    marginVertical: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  badgesModal: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  badgesModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  badgesModalTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  badgesScroll: {
    maxHeight: 400,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  badgeEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  noBadgesContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noBadgesText: {
    fontSize: 16,
    textAlign: 'center',
  },
  // Empty State Styles
  emptyStateCard: {
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyStateContent: {
    alignItems: 'center',
    gap: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyStateDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyInsightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyInsightText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
    opacity: 0.7,
  },
  quickStatsEmptyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  quickStatsEmptyText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
