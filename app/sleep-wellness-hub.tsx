import React, { useState, useEffect } from 'react';
import { SleepService } from '@/services/sleep.service';
import { SleepWellnessService } from '@/services/sleepWellness.service';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import { LastNightCard } from '@/components/sleep/LastNightCard';
import { WeeklyOverviewCard } from '@/components/sleep/WeeklyOverviewCard';
import { ThisWeekSection } from '@/components/sleep/ThisWeekSection';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
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
  Calendar,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  RotateCcw,
  Library,
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

// Utility function for safe array operations
const safeArrayFilter = <T,>(array: T[] | null | undefined, predicate: (value: T) => boolean): T[] => {
  if (!array || !Array.isArray(array)) return [];
  return array.filter(predicate);
};

// Utility function for safe array access
const safeArrayGet = <T,>(array: T[] | null | undefined, index: number): T | undefined => {
  if (!array || !Array.isArray(array) || index < 0 || index >= array.length) return undefined;
  return array[index];
};

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

  // Get AI recommendations based on sleep data
  const getRecommendations = (
    stats: SleepStats | null,
    logs: any[] | null | undefined
  ): Recommendation[] => {
    if (!stats || !logs || !Array.isArray(logs) || logs.length === 0) {
      return [
        {
          id: '1',
          text: 'Start tracking your sleep to get personalized recommendations.',
          confidence: 'Get started with sleep tracking',
        },
      ];
    }  const recommendations: Recommendation[] = [];

  // Analyze sleep duration trends
  const recentAvg = stats.avgDuration7Days || 0;
  if (recentAvg < 7) {
    recommendations.push({
      id: 'duration',
      text: `Try getting to bed ${recentAvg < 6 ? '1-2 hours' : '30-60 minutes'} earlier to reach the recommended 7-9 hours.`,
      confidence: `Based on your average of ${recentAvg}h in the last week`,
    });
  }

  // Analyze consistency patterns
  if (stats.consistencyScore < 70) {
    recommendations.push({
      id: 'consistency',
      text: 'Set a consistent bedtime alarm to help regulate your sleep schedule.',
      confidence: `Based on your ${stats.consistencyScore}% consistency score`,
    });
  }

  // Analyze quality improvements
  if (stats.avgQuality === 'Poor' || stats.avgQuality === 'Fair') {
    recommendations.push({
      id: 'quality',
      text: 'Consider creating a relaxing bedtime routine with meditation or reading.',
      confidence: `Based on your ${stats.avgQuality.toLowerCase()} sleep quality rating`,
    });
  }

  // Analyze wake time consistency
  if (stats.wakeUpConsistency === 'Low') {
    recommendations.push({
      id: 'wake',
      text: 'Try setting your alarm for the same time every day, including weekends.',
      confidence: 'Based on irregular wake-up times',
    });
  }

  // Analyze weekend patterns
  const validLogs = logs ? logs.filter(log => log && log.date && log.hours) : [];
  const weekdayLogs = validLogs.filter(log => {
    if (!log || !log.date) return false;
    const date = new Date(log.date);
    return date.getDay() !== 0 && date.getDay() !== 6;
  });
  const weekendLogs = validLogs.filter(log => {
    if (!log || !log.date) return false;
    const date = new Date(log.date);
    return date.getDay() === 0 || date.getDay() === 6;
  });

  if (weekdayLogs.length > 0 && weekendLogs.length > 0) {
    const avgWeekday = weekdayLogs.reduce((sum, log) => sum + Number(log.hours), 0) / weekdayLogs.length;
    const avgWeekend = weekendLogs.reduce((sum, log) => sum + Number(log.hours), 0) / weekendLogs.length;

    if (Math.abs(avgWeekend - avgWeekday) > 2) {
      recommendations.push({
        id: 'weekend',
        text: 'Try to reduce the sleep difference between weekdays and weekends.',
        confidence: `Based on ${Math.abs(avgWeekend - avgWeekday).toFixed(1)}h weekend difference`,
      });
    }
  }

  // Add experimental recommendations if enough data
  if (validLogs.length > 14) {
    // Check for late night quality patterns
    const lateNightLogs = validLogs.filter(log => {
      if (!log.bedtime || !log.quality) return false;
      const bedtime = new Date(`2000-01-01T${log.bedtime}`);
      return bedtime.getHours() >= 23;
    });

    if (lateNightLogs.length > 0) {
      const avgLateQuality = lateNightLogs.reduce((sum, log) => sum + Number(log.quality), 0) / lateNightLogs.length;
      if (avgLateQuality < 3) {
        recommendations.push({
          id: 'late',
          text: 'Late nights seem to affect your sleep quality. Try shifting your schedule earlier.',
          confidence: 'Based on quality patterns with late bedtimes',
        });
      }
    }
  }

  // If we have no specific recommendations, provide a general one
  if (recommendations.length === 0) {
    recommendations.push({
      id: 'general',
      text: 'Focus on maintaining a consistent sleep schedule to improve your sleep quality.',
      confidence: 'General sleep hygiene recommendation',
    });
  }

  return recommendations.slice(0, 3); // Return top 3 recommendations
};

interface SleepStats {
  avgDuration7Days: number | null;
  avgDuration30Days: number | null;
  consistencyScore: number;
  avgQuality: string;
  wakeUpConsistency: string;
  insights: string[];
}

// Database-Driven Recommendations Component
function DBRecommendationsSection({ userId }: { userId: string }) {
  const { theme } = useTheme();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadRecommendations();
    }
  }, [userId]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const { data, error } = await SleepWellnessService.getRecommendations(userId, 'week', 3);
      if (data) {
        setRecommendations(data);
      }
    } catch (err) {
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  if (recommendations.length === 0) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
          Track your sleep for a few more days to get personalized recommendations.
        </Text>
      </View>
    );
  }

  return (
    <>
      {recommendations.map((rec, index) => (
        <View
          key={rec.id}
          style={{
            backgroundColor: theme.colors.secondary,
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: theme.colors.text, fontSize: 15, fontWeight: '700', flex: 1 }}>
              {index + 1}. {rec.reason}
            </Text>
            <View style={{ backgroundColor: theme.colors.primary + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
              <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: '700' }}>
                {(rec.confidence_score * 100).toFixed(0)}%
              </Text>
            </View>
          </View>
          <Text style={{ color: theme.colors.text, fontSize: 14, lineHeight: 20 }}>
            {rec.recommendation_text}
          </Text>
          {rec.tags && rec.tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {rec.tags.map((tag: string) => (
                <View key={tag} style={{ backgroundColor: theme.colors.border, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 11, fontWeight: '600' }}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </>
  );
}

export default function SleepWellnessHub() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const { user, isGuest } = useAuth();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [achievementModalVisible, setAchievementModalVisible] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [recommendationModalVisible, setRecommendationModalVisible] = useState(false);
  const [expandedTips, setExpandedTips] = useState<{ [key: string]: boolean }>({});
  
  // Add loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add sleep data states with proper initialization
  const [sleepStats, setSleepStats] = useState<SleepStats | null>(null);
  const [sleepLogs, setSleepLogs] = useState<any[] | null>(null);
  const [sleepTrends, setSleepTrends] = useState<any>(null);
  const [lastNightSleep, setLastNightSleep] = useState<any | null>(null);


  // Add data fetching
  const fetchSleepData = async () => {
    try {
      setIsLoading(true);
      setSleepLogs(null); // Reset to null while loading
      setSleepStats(null);
      setSleepTrends(null);
      
      // Get the effective user ID
      const effectiveUserId = user?.id || 'guest_user';
      
      // Get last 30 days of sleep logs
      const date = new Date();
      const endDate = date.toISOString().split('T')[0];
      date.setDate(date.getDate() - 30);
      const startDate = date.toISOString().split('T')[0];

      const [logsResult, avgHoursResult, qualityTrendResult] = await Promise.all([
        SleepService.getByDateRange(effectiveUserId, startDate, endDate),
        SleepService.getAverageHours(effectiveUserId, 30),
        SleepService.getQualityTrend(effectiveUserId, 30)
      ]);

      // Handle errors gracefully - "No data found" is not an error
      if (logsResult.error && logsResult.error !== 'No data found') {
        console.warn('Failed to fetch sleep logs:', logsResult.error);
      }
      if (avgHoursResult.error && avgHoursResult.error !== 'No data found') {
        console.warn('Failed to fetch average hours:', avgHoursResult.error);
      }
      if (qualityTrendResult.error && qualityTrendResult.error !== 'No data found') {
        console.warn('Failed to fetch quality trend:', qualityTrendResult.error);
      }

      const logs = Array.isArray(logsResult?.data) ? logsResult.data : [];
      setSleepLogs(logs);

      // Get last night's sleep (most recent entry) with calculated duration
      if (logs.length > 0) {
        const mostRecent = logs[0];
        // Calculate actual hours from bedtime/wake_time if available (handles midnight crossing)
        if (mostRecent.bedtime && mostRecent.wake_time) {
          mostRecent.calculatedHours = SleepService.calculateSleepDuration(mostRecent.bedtime, mostRecent.wake_time);
        }
        setLastNightSleep(mostRecent);
      } else {
        setLastNightSleep(null);
      }

      // Calculate sleep stats
      const validLogs = logs.filter(log => log && log.hours);
      const last7Days = validLogs.slice(0, 7);
      const avg7Days = last7Days.length > 0 
        ? last7Days.reduce((sum, log) => sum + Number(log?.hours || 0), 0) / last7Days.length
        : 0;
      const avg30Days = avgHoursResult?.data || 0;

      // Calculate consistency score based on bedtime variance
      const bedtimes = logs
        .filter(log => log && log.bedtime)
        .map(log => new Date(`2000-01-01T${log.bedtime}`).getTime());
      const avgBedtime = bedtimes.length ? bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length : 0;
      const variance = bedtimes.length ? bedtimes.reduce((sum, time) => sum + Math.pow(time - avgBedtime, 2), 0) / bedtimes.length : 0;
      const consistencyScore = Math.min(100, Math.max(0, 100 - Math.sqrt(variance) / (30 * 60 * 1000) * 100));

      // Calculate average quality
      const qualityScores = qualityTrendResult.data || [];
      const avgQualityScore = qualityScores.length > 0 
        ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length 
        : 3;
      const qualityMap = {
        1: 'Poor',
        2: 'Fair',
        3: 'Good',
        4: 'Very Good',
        5: 'Excellent'
      };
      const avgQuality = qualityMap[Math.round(avgQualityScore) as keyof typeof qualityMap] || 'Good';

      // Analyze wake time consistency
      const wakeTimes = logs
        .filter(log => log && log.wake_time)
        .map(log => new Date(`2000-01-01T${log.wake_time}`).getTime());
      const wakeVariance = wakeTimes.length ? wakeTimes.reduce((sum, time) => {
        const avgTime = wakeTimes.reduce((s, t) => s + t, 0) / wakeTimes.length;
        return sum + Math.pow(time - avgTime, 2);
      }, 0) / wakeTimes.length : 0;
      const wakeConsistency = wakeVariance < 30 * 60 * 1000 ? 'High' : 
                             wakeVariance < 60 * 60 * 1000 ? 'Medium' : 'Low';

      // Generate insights
      const insights = generateInsights(logs);

      setSleepStats({
        avgDuration7Days: Number(avg7Days.toFixed(1)),
        avgDuration30Days: Number(avg30Days.toFixed(1)),
        consistencyScore: Math.round(consistencyScore),
        avgQuality,
        wakeUpConsistency: wakeConsistency,
        insights
      });

      setSleepTrends({
        qualityTrend: qualityTrendResult.data,
        hoursTrend: logs.map(log => log.hours)
      });

      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sleep data');
      console.error('Error fetching sleep data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sleep tips database
  const sleepTipsDb = [
    {
      id: '1',
      tip: 'Maintain a consistent schedule',
      description: 'Go to bed and wake up at the same time every day, even on weekends.',
      tags: ['consistency', 'schedule'],
      conditions: (stats: SleepStats | null) => stats?.consistencyScore ? stats.consistencyScore < 70 : true
    },
    {
      id: '2',
      tip: 'Create a bedtime routine',
      description: 'Develop a relaxing pre-sleep routine to signal your body it\'s time to wind down.',
      tags: ['routine', 'relaxation'],
      conditions: () => true
    },
    {
      id: '3',
      tip: 'Optimize your sleep environment',
      description: 'Keep your bedroom cool, dark, and quiet. Use comfortable bedding.',
      tags: ['environment', 'comfort'],
      conditions: (stats: SleepStats | null) => stats?.avgQuality === 'Poor' || stats?.avgQuality === 'Fair'
    },
    {
      id: '4',
      tip: 'Limit screen time before bed',
      description: 'Avoid screens 1 hour before bedtime to improve sleep quality.',
      tags: ['electronics', 'evening'],
      conditions: (stats: SleepStats | null) => stats?.avgQuality === 'Poor' || stats?.avgQuality === 'Fair'
    },
    {
      id: '5',
      tip: 'Watch caffeine intake',
      description: 'Avoid caffeine in the afternoon and evening hours.',
      tags: ['diet', 'evening'],
      conditions: () => true
    },
    {
      id: '6',
      tip: 'Follow the 90-minute rule',
      description: 'Plan your bedtime in multiples of 90 minutes to align with your sleep cycles.',
      tags: ['timing', 'cycles'],
      conditions: (stats: SleepStats | null) => stats?.avgDuration7Days ? stats.avgDuration7Days < 7 : false
    },
    {
      id: '7',
      tip: 'Exercise regularly but not before bed',
      description: 'Regular exercise can improve sleep quality, but avoid vigorous exercise 2-3 hours before bedtime.',
      tags: ['exercise', 'timing'],
      conditions: (stats: SleepStats | null) => stats?.avgQuality === 'Poor' || stats?.avgQuality === 'Fair'
    },
    {
      id: '8',
      tip: 'Practice stress management',
      description: 'Try meditation, deep breathing, or journaling to reduce stress before bed.',
      tags: ['stress', 'relaxation'],
      conditions: (stats: SleepStats | null) => stats?.consistencyScore ? stats.consistencyScore < 60 : false
    },
    {
      id: '9',
      tip: 'Mind your weekend sleep',
      description: 'Try to keep weekend sleep times within 1 hour of weekday schedule.',
      tags: ['consistency', 'schedule'],
      conditions: (stats: SleepStats | null, logs: any[]) => {
        if (!logs.length) return false;
        if (!logs || !Array.isArray(logs) || logs.length === 0) {
        return false;
      }
      const weekdayLogs = logs.filter(log => {
        if (!log || !log.date) return false;
        const date = new Date(log.date);
        return date.getDay() !== 0 && date.getDay() !== 6;
      });
      const weekendLogs = logs.filter(log => {
        if (!log || !log.date) return false;
        const date = new Date(log.date);
        return date.getDay() === 0 || date.getDay() === 6;
      });
      const avgWeekday = weekdayLogs.length > 0 
        ? weekdayLogs.reduce((sum, log) => sum + Number(log.hours || 0), 0) / weekdayLogs.length 
        : 0;
      const avgWeekend = weekendLogs.length > 0 
        ? weekendLogs.reduce((sum, log) => sum + Number(log.hours || 0), 0) / weekendLogs.length 
        : 0;
        return Math.abs(avgWeekend - avgWeekday) > 1;
      }
    },
    {
      id: '10',
      tip: 'Create a sleep-friendly morning routine',
      description: 'Morning light exposure and regular breakfast time help regulate your circadian rhythm.',
      tags: ['routine', 'morning'],
      conditions: (stats: SleepStats | null) => stats?.wakeUpConsistency === 'Low'
    }
  ];

  // Get relevant sleep tips based on user's data
  const getRelevantSleepTips = () => {
    // Start with essential tips if no data
    if (!sleepStats || !sleepLogs) {
      return sleepTipsDb.filter(tip => tip.conditions(null, []));
    }

    // Filter tips based on user's sleep data
    const relevantTips = sleepTipsDb.filter(tip => tip.conditions(sleepStats, sleepLogs || []));

    // Always include at least 3 tips
    while (relevantTips.length < 3) {
      const randomTip = sleepTipsDb[Math.floor(Math.random() * sleepTipsDb.length)];
      if (!relevantTips.find(tip => tip.id === randomTip.id)) {
        relevantTips.push(randomTip);
      }
    }

    // Sort tips by relevance (specific conditions first)
    return relevantTips.sort((a, b) => {
      const aSpecific = a.conditions === (() => true);
      const bSpecific = b.conditions === (() => true);
      return aSpecific === bSpecific ? 0 : aSpecific ? 1 : -1;
    });
  };

  // Add insights generation
  const generateInsights = (logs: any[] | null): string[] => {
    const insights: string[] = [];
    
    if (!logs || !Array.isArray(logs) || logs.length === 0) {
      return ['Start tracking your sleep to get personalized insights!'];
    }

    // Analyze weekday vs weekend sleep
    const validLogs = logs.filter(log => log && log.date && log.hours);
    if (validLogs.length === 0) {
      return ['Start tracking your sleep to get personalized insights!'];
    }

    const weekdayLogs = validLogs.filter(log => {
      const date = new Date(log.date);
      return date.getDay() !== 0 && date.getDay() !== 6;
    });
    const weekendLogs = validLogs.filter(log => {
      const date = new Date(log.date);
      return date.getDay() === 0 || date.getDay() === 6;
    });

    if (weekdayLogs.length > 0 && weekendLogs.length > 0) {
      const avgWeekdayHours = weekdayLogs.reduce((sum, log) => sum + Number(log.hours), 0) / weekdayLogs.length;
      const avgWeekendHours = weekendLogs.reduce((sum, log) => sum + Number(log.hours), 0) / weekendLogs.length;

      if (Math.abs(avgWeekendHours - avgWeekdayHours) >= 1) {
        insights.push(`You sleep ${Math.abs(avgWeekendHours - avgWeekdayHours).toFixed(1)}h ${avgWeekendHours > avgWeekdayHours ? 'more' : 'less'} on weekends.`);
      }
    }

    // Analyze quality trends
    const validQualityLogs = validLogs.filter(log => log.quality !== undefined && log.quality !== null);
    if (validQualityLogs.length >= 14) {
      const recentQualities = validQualityLogs.slice(0, 7).map(log => Number(log.quality));
      const prevQualities = validQualityLogs.slice(7, 14).map(log => Number(log.quality));

      const avgRecentQuality = recentQualities.reduce((sum, q) => sum + q, 0) / recentQualities.length;
      const avgPrevQuality = prevQualities.reduce((sum, q) => sum + q, 0) / prevQualities.length;

      if (Math.abs(avgRecentQuality - avgPrevQuality) >= 0.5) {
        const improvement = ((avgRecentQuality - avgPrevQuality) / (avgPrevQuality || 1) * 100).toFixed(0);
        if (avgRecentQuality > avgPrevQuality) {
          insights.push(`Your sleep quality improved by ${improvement}% this week.`);
        } else {
          insights.push(`Your sleep quality decreased by ${Math.abs(Number(improvement))}% this week.`);
        }
      }
    }

    // Add consistency insight
    const validBedtimeLogs = validLogs.filter(log => log.bedtime);
    const consistentDays = validBedtimeLogs.filter((log, index) => {
      const prevLog = validBedtimeLogs[index - 1];
      if (!prevLog) return true;
      const bedtimeDiff = Math.abs(
        new Date(`2000-01-01T${log.bedtime}`).getTime() - 
        new Date(`2000-01-01T${prevLog.bedtime}`).getTime()
      );
      return bedtimeDiff <= 30 * 60 * 1000; // 30 minutes
    }).length;

    if (validBedtimeLogs.length > 0) {
      const consistencyPercentage = (consistentDays / validBedtimeLogs.length * 100).toFixed(0);
      insights.push(`You maintained a consistent bedtime ${consistencyPercentage}% of the time.`);
    }

    return insights;
  };

  // Use effect for data fetching
  useEffect(() => {
    if (user || isGuest) {
      fetchSleepData();
    }
  }, [user, isGuest]);

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
    <AuthGuard requireAuth={true}>
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
        {/* Hero Section */}
        <View style={[styles.heroCard, { backgroundColor: theme.colors.primary }]}>
          <Moon size={48} color="#FFFFFF" />
          <Text style={[styles.heroTitle, { color: '#FFFFFF' }]}>Sleep Wellness Hub</Text>
          <Text style={[styles.heroSubtitle, { color: '#E0E7FF' }]}>
            Quality sleep is the foundation of wellness. Track your patterns and discover what helps you rest better.
          </Text>
        </View>

        {/* Last Night Card - Dynamic DB-driven */}
        {user && <LastNightCard userId={user.id} targetHours={8} windowDays={7} onRefresh={fetchSleepData} />}

        {/* This Week Section - Dynamic DB-driven */}
        {user && <ThisWeekSection userId={user.id} onRefresh={fetchSleepData} />}

        {/* Weekly Overview Calendar - Dynamic DB-driven */}
        {user && (
          <WeeklyOverviewCard
            userId={user.id}
            startDate={(() => {
              const today = new Date();
              const dayOfWeek = today.getDay();
              const monday = new Date(today);
              monday.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
              return monday.toISOString().split('T')[0];
            })()}
            onDayPress={(date) => {
              console.log('Day pressed:', date);
              router.push('/(tabs)/calendar');
            }}
          />
        )}

        {/* Quick Actions - Moved up for better navigation */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Sparkles size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Quick Actions</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
            Start tracking, explore programs, or discover new sleep habits
          </Text>

          <View style={styles.quickActionsMainGrid}>
            <TouchableOpacity
              style={[styles.quickActionMainButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/(tabs)/add-entry' as any)}
            >
              <Plus size={24} color="#FFFFFF" />
              <Text style={styles.quickActionMainText}>Log Sleep</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionMainButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/(tabs)/calendar')}
            >
              <Calendar size={24} color="#FFFFFF" />
              <Text style={styles.quickActionMainText}>View History</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickActionsSecondaryGrid}>
            <TouchableOpacity
              style={[styles.quickActionSecondaryButton, { backgroundColor: theme.colors.secondary }]}
              onPress={() => router.push('/sleep-wellness/programme-hub')}
            >
              <BookOpen size={20} color={theme.colors.primary} />
              <Text style={[styles.quickActionSecondaryText, { color: theme.colors.text }]}>
                Sleep Programme
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionSecondaryButton, { backgroundColor: theme.colors.secondary }]}
              onPress={() => router.push('/experiments-hub')}
            >
              <FlaskConical size={20} color={theme.colors.primary} />
              <Text style={[styles.quickActionSecondaryText, { color: theme.colors.text }]}>
                Experiments
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionSecondaryButton, { backgroundColor: theme.colors.secondary }]}
              onPress={() => router.push('/habit-library?category=Sleep')}
            >
              <Library size={20} color={theme.colors.primary} />
              <Text style={[styles.quickActionSecondaryText, { color: theme.colors.text }]}>
                Sleep Habits
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sleep Tips Section */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <BookOpen size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Sleep Tips</Text>
          </View>
          {getRelevantSleepTips().map((tip) => (
            <TouchableOpacity
              key={tip.id}
              style={styles.tipItem}
              onPress={() => setExpandedTips({ ...expandedTips, [tip.id]: !expandedTips[tip.id] })}
            >
              <View style={styles.tipHeader}>
                <Text style={[styles.tipTitle, { color: theme.colors.text }]}>{tip.tip}</Text>
                {expandedTips[tip.id] ? (
                  <ChevronUp size={20} color={theme.colors.textSecondary} />
                ) : (
                  <ChevronDown size={20} color={theme.colors.textSecondary} />
                )}
              </View>
              {expandedTips[tip.id] && (
                <Text style={[styles.tipDescription, { color: theme.colors.textSecondary }]}>
                  {tip.description}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Sleep Tracking Tools */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Clock size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Sleep Tracking Tools</Text>
          </View>

          {/* Quick Log Section */}
          <View style={styles.quickLogSection}>
            <Text style={[styles.quickLogTitle, { color: theme.colors.text }]}>Quick Log</Text>
            <TouchableOpacity
              style={[styles.toolButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/(tabs)/add-entry' as any)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.toolButtonText}>Log Last Night's Sleep</Text>
            </TouchableOpacity>
          </View>

          {/* History & Analysis */}
          <View style={styles.trackingToolsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>History & Analysis</Text>
            <TouchableOpacity
              style={[styles.toolButton, { backgroundColor: theme.colors.secondary }]}
              onPress={() => router.push('/(tabs)/calendar')}
            >
              <Calendar size={20} color={theme.colors.text} />
              <Text style={[styles.toolButtonText, { color: theme.colors.text }]}>View Sleep Calendar</Text>
            </TouchableOpacity>

            {/* Sleep Stats Snapshot */}
            {!isLoading && !error && sleepStats && (
              <View style={styles.statsSnapshot}>
                <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                  <View style={styles.statHeader}>
                    <Moon size={16} color={theme.colors.primary} />
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                      Recent Average
                    </Text>
                  </View>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {sleepStats.avgDuration7Days}h
                  </Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: theme.colors.card }]}>
                  <View style={styles.statHeader}>
                    <TrendingUp size={16} color={theme.colors.primary} />
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                      Quality
                    </Text>
                  </View>
                  <Text style={[styles.statValue, { color: theme.colors.text }]}>
                    {sleepStats.avgQuality}
                  </Text>
                </View>
              </View>
            )}
          </View>
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

        {/* Database-Driven Smart Recommendations */}
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <View style={styles.cardHeader}>
            <Sparkles size={24} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Smart Recommendations</Text>
            <TouchableOpacity
              onPress={() => router.push('/sleep-wellness/trends' as any)}
              style={styles.viewAllButton}
            >
              <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
            Personalized insights based on your sleep patterns
          </Text>

          <DBRecommendationsSection userId={user?.id || ''} />
        </View>

        {/* View Trends Button */}
        <TouchableOpacity
          style={[styles.viewTrendsButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/sleep-wellness/trends' as any)}
        >
          <TrendingUp size={20} color="#FFFFFF" />
          <Text style={styles.viewTrendsButtonText}>View Complete Sleep Trends & Analytics</Text>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
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
                  <View style={styles.modalProgressBar}>
                    <View
                      style={[
                        styles.modalProgressFill,
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
                <Text style={[styles.modalFeedbackTitle, { color: theme.colors.text }]}>
                  Did you try this activity tonight?
                </Text>
                <View style={styles.modalFeedbackButtons}>
                  <TouchableOpacity
                    style={[styles.modalFeedbackButton, { backgroundColor: theme.colors.success }]}
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
                    style={[styles.modalFeedbackButton, { backgroundColor: theme.colors.error }]}
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
    </AuthGuard>
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
  // Hero section styles
  heroCard: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    textAlign: 'center',
    lineHeight: 24,
  },
  // Sleep Tips styles
  tipItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    flex: 1,
  },
  tipDescription: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  // Sleep Tracking Tools styles
  toolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  toolButtonText: {
    fontSize: 16,
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
  modalProgressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  modalProgressFill: {
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
  modalFeedbackTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  modalFeedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalFeedbackButton: {
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#10B981',
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
  quickLogSection: {
    marginBottom: 20,
  },
  quickLogTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  trackingToolsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  statsSnapshot: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  quickActionsSection: {
    marginTop: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  noSleepDataContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSleepDataText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // New Quick Actions Styles
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  quickActionsMainGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  quickActionMainButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionMainText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  quickActionsSecondaryGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionSecondaryButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
  },
  quickActionSecondaryText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  viewAllButton: {
    marginLeft: 'auto',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewTrendsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  viewTrendsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

