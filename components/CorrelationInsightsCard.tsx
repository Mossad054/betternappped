/**
 * Correlation Insights Card
 * Displays activity correlations with wellness metrics
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { TrendingUp, TrendingDown, Minus, Brain, Moon, Zap, Heart } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Typography, SPACING, FONT_SIZES } from '@/constants/Typography';
import { CorrelationEngineService, CorrelationResult } from '@/services/correlationEngine.service';
import { getCorrelationLabel, getCorrelationColor } from '@/constants/emojiScoreMapping';

interface CorrelationInsightsCardProps {
  onViewDetails?: () => void;
}

export default function CorrelationInsightsCard({ onViewDetails }: CorrelationInsightsCardProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [correlations, setCorrelations] = useState<CorrelationResult[]>([]);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadCorrelations();
    }
  }, [user]);

  const loadCorrelations = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await CorrelationEngineService.getAllCorrelations(user.id);

      if (!error && data) {
        setCorrelations(data.activities || []);
        setInsights(data.insights || []);
      }
    } catch (error) {
      console.error('Error loading correlations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (correlation: number) => {
    if (correlation > 0.1) {
      return <TrendingUp size={16} color="#10B981" />;
    } else if (correlation < -0.1) {
      return <TrendingDown size={16} color="#EF4444" />;
    }
    return <Minus size={16} color={theme.colors.textSecondary} />;
  };

  const formatActivityName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  }

  if (correlations.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.emptyTitle, Typography.h4, { color: theme.colors.text }]}>
          Activity Insights
        </Text>
        <Text style={[styles.emptyText, Typography.body, { color: theme.colors.textSecondary }]}>
          Log more activities with feedback to see how they impact your mood, sleep, and mental clarity.
        </Text>
      </View>
    );
  }

  // Get top 3 beneficial activities
  const topActivities = correlations
    .filter(c => c.is_beneficial && c.sample_size >= 3)
    .slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, Typography.h4, { color: theme.colors.text }]}>
          Your Activity Insights
        </Text>
        {onViewDetails && (
          <TouchableOpacity onPress={onViewDetails}>
            <Text style={[styles.viewAll, Typography.buttonSmall, { color: theme.colors.primary }]}>
              View All
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Top Insights */}
      {insights.length > 0 && (
        <View style={[styles.insightBox, { backgroundColor: theme.colors.primary + '10' }]}>
          <Text style={[styles.insightText, Typography.bodySmall, { color: theme.colors.text }]}>
            💡 {insights[0]}
          </Text>
        </View>
      )}

      {/* Activity Correlations */}
      <View style={styles.activitiesContainer}>
        {topActivities.map((activity) => (
          <View key={activity.activity_type} style={styles.activityRow}>
            <Text style={[styles.activityName, Typography.cardTitle, { color: theme.colors.text }]}>
              {formatActivityName(activity.activity_type)}
            </Text>

            <View style={styles.correlationsRow}>
              {/* Mood */}
              <View style={styles.correlationItem}>
                <Heart size={14} color={getCorrelationColor(activity.correlation_with_mood)} />
                <Text style={[
                  styles.correlationValue,
                  Typography.meta,
                  { color: getCorrelationColor(activity.correlation_with_mood) }
                ]}>
                  {activity.correlation_with_mood > 0 ? '+' : ''}
                  {(activity.correlation_with_mood * 100).toFixed(0)}%
                </Text>
              </View>

              {/* Clarity */}
              <View style={styles.correlationItem}>
                <Brain size={14} color={getCorrelationColor(activity.correlation_with_clarity)} />
                <Text style={[
                  styles.correlationValue,
                  Typography.meta,
                  { color: getCorrelationColor(activity.correlation_with_clarity) }
                ]}>
                  {activity.correlation_with_clarity > 0 ? '+' : ''}
                  {(activity.correlation_with_clarity * 100).toFixed(0)}%
                </Text>
              </View>

              {/* Sleep */}
              <View style={styles.correlationItem}>
                <Moon size={14} color={getCorrelationColor(activity.correlation_with_sleep_quality)} />
                <Text style={[
                  styles.correlationValue,
                  Typography.meta,
                  { color: getCorrelationColor(activity.correlation_with_sleep_quality) }
                ]}>
                  {activity.correlation_with_sleep_quality > 0 ? '+' : ''}
                  {(activity.correlation_with_sleep_quality * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <Heart size={12} color={theme.colors.textSecondary} />
          <Text style={[styles.legendText, Typography.caption, { color: theme.colors.textSecondary }]}>
            Mood
          </Text>
        </View>
        <View style={styles.legendItem}>
          <Brain size={12} color={theme.colors.textSecondary} />
          <Text style={[styles.legendText, Typography.caption, { color: theme.colors.textSecondary }]}>
            Clarity
          </Text>
        </View>
        <View style={styles.legendItem}>
          <Moon size={12} color={theme.colors.textSecondary} />
          <Text style={[styles.legendText, Typography.caption, { color: theme.colors.textSecondary }]}>
            Sleep
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {},
  viewAll: {},
  emptyTitle: {
    marginBottom: SPACING.sm,
  },
  emptyText: {
    textAlign: 'center',
  },
  insightBox: {
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.lg,
  },
  insightText: {
    lineHeight: 20,
  },
  activitiesContainer: {
    gap: SPACING.md,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  activityName: {},
  correlationsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  correlationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  correlationValue: {
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendText: {},
});
