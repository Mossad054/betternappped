/**
 * Experiment Insights Component
 * 
 * Displays comprehensive analysis of how an experiment affects wellness metrics:
 * - 😊 Mood
 * - 😴 Sleep
 * - 🧠 Clarity
 * - ⚡ Productivity
 * 
 * Shows baseline vs current values, statistical significance, and recommendations
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import type { ExperimentInsights, WellnessImpact } from '@/hooks/useExperimentInsights';

interface ExperimentInsightsComponentProps {
  insights: ExperimentInsights;
}

export function ExperimentInsightsComponent({ insights }: ExperimentInsightsComponentProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // Helper to get impact color
  const getImpactColor = (direction: string, strength: string) => {
    if (direction === 'no-effect' || strength === 'none') return theme.colors.textSecondary;
    if (direction === 'improves') {
      if (strength === 'large') return '#10B981'; // Green
      if (strength === 'medium') return '#34D399';
      return '#6EE7B7';
    }
    // Worsens
    if (strength === 'large') return '#EF4444'; // Red
    if (strength === 'medium') return '#F87171';
    return '#FCA5A5';
  };

  // Helper to get trend icon
  const getTrendIcon = (direction: string, change: number) => {
    if (direction === 'no-effect' || Math.abs(change) < 0.1) {
      return <Minus size={16} color={theme.colors.textSecondary} />;
    }
    if (direction === 'improves') {
      return <TrendingUp size={16} color="#10B981" />;
    }
    return <TrendingDown size={16} color="#EF4444" />;
  };

  // Helper to get overall impact color
  const getOverallColor = (level: string) => {
    if (level === 'highly-positive') return '#10B981';
    if (level === 'positive') return '#34D399';
    if (level === 'neutral') return theme.colors.textSecondary;
    if (level === 'negative') return '#F87171';
    return '#EF4444'; // highly-negative
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Overall Impact Score */}
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Overall Wellness Impact</Text>
        
        <View style={styles.overallScoreContainer}>
          <Text style={[styles.overallScore, { color: getOverallColor(insights.overall.level) }]}>
            {insights.overall.score >= 0 ? '+' : ''}{insights.overall.score.toFixed(0)}
          </Text>
          <Text style={[styles.overallLabel, { color: theme.colors.textSecondary }]}>
            Impact Score
          </Text>
        </View>

        <View style={[styles.levelBadge, { 
          backgroundColor: getOverallColor(insights.overall.level) + '20',
          borderColor: getOverallColor(insights.overall.level) 
        }]}>
          <Text style={[styles.levelText, { color: getOverallColor(insights.overall.level) }]}>
            {insights.overall.level.split('-').join(' ').toUpperCase()}
          </Text>
        </View>

        <Text style={[styles.recommendation, { color: theme.colors.text }]}>
          {insights.overall.recommendation}
        </Text>

        {/* Confidence Level */}
        <View style={styles.confidenceRow}>
          <Text style={[styles.confidenceLabel, { color: theme.colors.textSecondary }]}>
            Analysis Confidence:
          </Text>
          <View style={[styles.confidenceBadge, { 
            backgroundColor: insights.progress.confidence === 'high' 
              ? '#10B98120' 
              : insights.progress.confidence === 'medium' 
              ? '#F59E0B20' 
              : '#EF444420',
            borderColor: insights.progress.confidence === 'high' 
              ? '#10B981' 
              : insights.progress.confidence === 'medium' 
              ? '#F59E0B' 
              : '#EF4444'
          }]}>
            <Text style={[styles.confidenceText, { 
              color: insights.progress.confidence === 'high' 
                ? '#10B981' 
                : insights.progress.confidence === 'medium' 
                ? '#F59E0B' 
                : '#EF4444'
            }]}>
              {insights.progress.confidence.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Wellness Impact Breakdown */}
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Wellness Impact</Text>
        <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
          How {insights.experimentName} affects your wellness metrics
        </Text>

        {insights.wellnessImpact.map((impact: WellnessImpact, index: number) => (
          <View key={impact.metric} style={[
            styles.impactRow,
            { borderTopWidth: index > 0 ? 1 : 0, borderTopColor: theme.colors.border }
          ]}>
            <View style={styles.impactHeader}>
              <Text style={styles.impactEmoji}>{impact.emoji}</Text>
              <View style={styles.impactInfo}>
                <Text style={[styles.impactMetric, { color: theme.colors.text }]}>
                  {impact.metric}
                </Text>
                {impact.isSignificant && (
                  <View style={[styles.significanceBadge, { backgroundColor: '#10B98120' }]}>
                    <Text style={[styles.significanceText, { color: '#10B981' }]}>
                      Significant
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.impactDetails}>
              {/* Baseline vs Current */}
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonItem}>
                  <Text style={[styles.comparisonLabel, { color: theme.colors.textSecondary }]}>
                    Baseline
                  </Text>
                  <Text style={[styles.comparisonValue, { color: theme.colors.text }]}>
                    {impact.baseline.toFixed(1)}
                  </Text>
                </View>
                
                <View style={styles.arrowContainer}>
                  {getTrendIcon(impact.direction, impact.change)}
                </View>

                <View style={styles.comparisonItem}>
                  <Text style={[styles.comparisonLabel, { color: theme.colors.textSecondary }]}>
                    Current
                  </Text>
                  <Text style={[styles.comparisonValue, { 
                    color: getImpactColor(impact.direction, impact.strength) 
                  }]}>
                    {impact.current.toFixed(1)}
                  </Text>
                </View>
              </View>

              {/* Change Amount */}
              {Math.abs(impact.change) > 0.1 && (
                <View style={[styles.changeBadge, { 
                  backgroundColor: getImpactColor(impact.direction, impact.strength) + '20',
                  borderColor: getImpactColor(impact.direction, impact.strength)
                }]}>
                  <Text style={[styles.changeText, { 
                    color: getImpactColor(impact.direction, impact.strength) 
                  }]}>
                    {impact.change >= 0 ? '+' : ''}{impact.change.toFixed(1)} points
                    {Math.abs(impact.percentageChange) >= 10 && 
                      ` (${impact.percentageChange.toFixed(0)}%)`
                    }
                  </Text>
                </View>
              )}

              {/* Interpretation */}
              <Text style={[styles.interpretation, { color: theme.colors.textSecondary }]}>
                {impact.interpretation}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Key Findings */}
      {insights.keyFindings && insights.keyFindings.length > 0 && (
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Key Findings</Text>
          
          {insights.keyFindings.map((finding: string, index: number) => (
            <View key={index} style={styles.findingRow}>
              <Text style={styles.findingBullet}>•</Text>
              <Text style={[styles.findingText, { color: theme.colors.text }]}>
                {finding}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Progress Summary */}
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Progress Summary</Text>
        
        <View style={styles.progressRow}>
          <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
            Days Completed
          </Text>
          <Text style={[styles.progressValue, { color: theme.colors.text }]}>
            {insights.progress.completedDays} / {insights.progress.totalDays}
          </Text>
        </View>

        <View style={styles.progressRow}>
          <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
            Completion Rate
          </Text>
          <Text style={[styles.progressValue, { color: theme.colors.text }]}>
            {insights.progress.completionRate.toFixed(0)}%
          </Text>
        </View>

        <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${insights.progress.completionRate}%`, 
                backgroundColor: theme.colors.primary 
              }
            ]} 
          />
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    ...theme.components.card,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    ...theme.typography.h5,
    marginBottom: theme.spacing.xs,
  },
  cardSubtitle: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.md,
  },
  overallScoreContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  overallScore: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  overallLabel: {
    ...theme.typography.caption,
  },
  levelBadge: {
    alignSelf: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
  },
  levelText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  recommendation: {
    ...theme.typography.body,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  confidenceLabel: {
    ...theme.typography.caption,
  },
  confidenceBadge: {
    paddingVertical: theme.spacing.xs - 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
  },
  confidenceText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  impactRow: {
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  impactEmoji: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  impactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  impactMetric: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
  },
  significanceBadge: {
    paddingVertical: 2,
    paddingHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.xs,
  },
  significanceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  impactDetails: {
    gap: theme.spacing.sm,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.sm,
  },
  comparisonItem: {
    alignItems: 'center',
  },
  comparisonLabel: {
    ...theme.typography.caption,
    fontSize: 11,
    marginBottom: 2,
  },
  comparisonValue: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
  },
  arrowContainer: {
    marginHorizontal: theme.spacing.sm,
  },
  changeBadge: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.xs - 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
  },
  changeText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  interpretation: {
    ...theme.typography.caption,
    fontSize: 11,
    lineHeight: 16,
  },
  findingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  findingBullet: {
    ...theme.typography.body,
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  findingText: {
    ...theme.typography.body,
    flex: 1,
    lineHeight: 22,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  progressLabel: {
    ...theme.typography.body,
  },
  progressValue: {
    ...theme.typography.bodyLarge,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: theme.borderRadius.xs,
    marginTop: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.xs,
  },
});
