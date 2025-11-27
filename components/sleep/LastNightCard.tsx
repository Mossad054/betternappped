import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SleepWellnessService, LastNightSummary } from '@/services/sleepWellness.service';
import { Moon, CheckCircle, AlertCircle, RotateCcw } from 'lucide-react-native';

interface LastNightCardProps {
  userId: string;
  targetHours?: number;
  windowDays?: number;
  onRefresh?: () => void;
}

/**
 * LastNightCard Component
 *
 * Displays dynamic summary of last night's sleep and recent target achievement.
 * Fully database-driven with color-coded visual feedback.
 */
export function LastNightCard({
  userId,
  targetHours,
  windowDays = 7,
  onRefresh
}: LastNightCardProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<LastNightSummary | null>(null);

  useEffect(() => {
    loadSummary();
  }, [userId, windowDays, targetHours]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: serviceError } = await SleepWellnessService.getLastNightSummary(
        userId,
        windowDays,
        targetHours
      );

      if (serviceError) {
        throw serviceError;
      }

      setSummary(data);
    } catch (err) {
      console.error('Error loading last night summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sleep summary');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadSummary();
    onRefresh?.();
  };

  // Determine color based on last night's performance
  const getStatusColor = () => {
    if (!summary || summary.last_night_hours === null) {
      return theme.colors.textSecondary;
    }

    const hours = summary.last_night_hours;
    const target = summary.target_hours;

    if (hours >= target) {
      return '#10B981'; // Green - met target
    } else if (hours >= target - 0.5) {
      return '#F59E0B'; // Amber - close to target
    } else {
      return '#EF4444'; // Red - below target
    }
  };

  // Get icon based on status
  const getStatusIcon = () => {
    if (!summary || summary.last_night_hours === null) {
      return <Moon size={20} color={theme.colors.textSecondary} />;
    }

    const hours = summary.last_night_hours;
    const target = summary.target_hours;

    if (hours >= target) {
      return <CheckCircle size={20} color="#10B981" />;
    } else {
      return <AlertCircle size={20} color="#EF4444" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <Moon size={24} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Last Night</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading sleep summary...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <Moon size={24} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Last Night</Text>
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle size={24} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <RotateCcw size={16} color={theme.colors.primary} />
            <Text style={[styles.retryText, { color: theme.colors.primary }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // No data state
  if (!summary || summary.nights_total === 0) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <Moon size={24} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Last Night</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No sleep data available. Log your first night to see your summary here!
          </Text>
        </View>
      </View>
    );
  }

  // Success state - display summary
  const statusColor = getStatusColor();
  const achievementPercent = (summary.nights_meeting_target / summary.nights_total) * 100;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Moon size={24} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Last Night</Text>
        </View>
        <View style={styles.headerRight}>
          {getStatusIcon()}
        </View>
      </View>

      {/* Last Night Hours - Large Display */}
      {summary.last_night_hours !== null && (
        <View style={styles.mainMetric}>
          <Text style={[styles.hoursValue, { color: statusColor }]}>
            {summary.last_night_hours.toFixed(1)}h
          </Text>
          <Text style={[styles.hoursLabel, { color: theme.colors.textSecondary }]}>
            {summary.last_night_date
              ? new Date(summary.last_night_date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })
              : 'Last night'}
          </Text>
        </View>
      )}

      {/* Target vs Actual Bar */}
      <View style={styles.targetSection}>
        <View style={styles.targetRow}>
          <Text style={[styles.targetLabel, { color: theme.colors.textSecondary }]}>
            Target: {summary.target_hours}h
          </Text>
          <Text style={[styles.targetLabel, { color: theme.colors.textSecondary }]}>
            {summary.nights_meeting_target}/{summary.nights_total} nights
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${achievementPercent}%`,
                backgroundColor: achievementPercent >= 70 ? '#10B981' : achievementPercent >= 40 ? '#F59E0B' : '#EF4444'
              }
            ]}
          />
        </View>
        <Text style={[styles.achievementText, { color: theme.colors.textSecondary }]}>
          {achievementPercent.toFixed(0)}% achievement rate
        </Text>
      </View>

      {/* Message */}
      <View style={[styles.messageBox, { backgroundColor: theme.colors.secondary }]}>
        <Text style={[styles.messageText, { color: theme.colors.text }]}>
          {summary.message}
        </Text>
      </View>

      {/* Additional Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Window</Text>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {summary.window_days} nights
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Status</Text>
          <Text
            style={[
              styles.statValue,
              { color: summary.meets_all_nights ? '#10B981' : statusColor }
            ]}
          >
            {summary.meets_all_nights ? 'On Track' : 'In Progress'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  mainMetric: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  hoursValue: {
    fontSize: 56,
    fontWeight: '800',
    lineHeight: 64,
  },
  hoursLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  targetSection: {
    marginBottom: 16,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  targetLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  messageBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E7EB',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
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
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
