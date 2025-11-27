import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SleepWellnessService, ThisWeekSummary } from '@/services/sleepWellness.service';
import { TrendingUp, Moon, Target, AlertCircle, RotateCcw } from 'lucide-react-native';

interface ThisWeekSectionProps {
  userId: string;
  onRefresh?: () => void;
}

/**
 * ThisWeekSection Component
 *
 * Displays key metrics for the current week:
 * - Average sleep hours
 * - Target achievement percentage
 * - Nights meeting target
 * All data dynamically loaded from database.
 */
export function ThisWeekSection({ userId, onRefresh }: ThisWeekSectionProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ThisWeekSummary | null>(null);

  useEffect(() => {
    loadSummary();
  }, [userId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: serviceError } = await SleepWellnessService.getThisWeekSummary(userId);

      if (serviceError) {
        throw serviceError;
      }

      setSummary(data);
    } catch (err) {
      console.error('Error loading this week summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to load week summary');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadSummary();
    onRefresh?.();
  };

  const getAchievementColor = (percent: number): string => {
    if (percent >= 80) return '#10B981'; // Green - Excellent
    if (percent >= 60) return '#F59E0B'; // Amber - Good
    return '#EF4444'; // Red - Needs improvement
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading week summary...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <View style={styles.errorContainer}>
          <AlertCircle size={20} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <RotateCcw size={14} color={theme.colors.primary} />
            <Text style={[styles.retryText, { color: theme.colors.primary }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // No data state
  if (!summary || summary.nights_total === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>This Week</Text>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No sleep data for this week yet. Start tracking!
          </Text>
        </View>
      </View>
    );
  }

  const achievementPercent = summary.percent_target_achievement;
  const achievementColor = getAchievementColor(achievementPercent);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      {/* Section Title */}
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>This Week</Text>

      {/* Week Date Range */}
      <Text style={[styles.dateRange, { color: theme.colors.textSecondary }]}>
        {new Date(summary.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        {' - '}
        {new Date(summary.week_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </Text>

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        {/* Metric 1: Average Sleep */}
        <View style={[styles.metricCard, { backgroundColor: theme.colors.primary + '15' }]}>
          <View style={styles.metricIconContainer}>
            <Moon size={20} color={theme.colors.primary} />
          </View>
          <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
            {summary.average_sleep_hours.toFixed(1)}h
          </Text>
          <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
            Avg Sleep
          </Text>
        </View>

        {/* Metric 2: Target Achievement Count */}
        <View style={[styles.metricCard, { backgroundColor: achievementColor + '15' }]}>
          <View style={styles.metricIconContainer}>
            <Target size={20} color={achievementColor} />
          </View>
          <Text style={[styles.metricValue, { color: achievementColor }]}>
            {summary.nights_target_met}/{summary.nights_total}
          </Text>
          <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
            Nights Met
          </Text>
        </View>

        {/* Metric 3: Achievement Percentage */}
        <View style={[styles.metricCard, { backgroundColor: achievementColor + '15' }]}>
          <View style={styles.metricIconContainer}>
            <TrendingUp size={20} color={achievementColor} />
          </View>
          <Text style={[styles.metricValue, { color: achievementColor }]}>
            {achievementPercent.toFixed(0)}%
          </Text>
          <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
            Achievement
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
            Target Progress
          </Text>
          <Text style={[styles.progressTarget, { color: theme.colors.textSecondary }]}>
            Goal: {summary.target_hours}h/night
          </Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(achievementPercent, 100)}%`,
                backgroundColor: achievementColor
              }
            ]}
          />
        </View>
        <View style={styles.progressFooter}>
          <Text style={[styles.progressText, { color: achievementColor }]}>
            {achievementPercent >= 80 ? '🎉 Excellent!' :
             achievementPercent >= 60 ? '👍 Good progress' :
             '💪 Keep going!'}
          </Text>
        </View>
      </View>

      {/* Weekly Total (Bonus Metric) */}
      <View style={[styles.totalCard, { backgroundColor: theme.colors.secondary }]}>
        <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
          Total Sleep This Week
        </Text>
        <Text style={[styles.totalValue, { color: theme.colors.text }]}>
          {(summary.average_sleep_hours * summary.nights_total).toFixed(1)} hours
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  dateRange: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricIconContainer: {
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressTarget: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressFooter: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalCard: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    gap: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
