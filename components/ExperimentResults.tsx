import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { RotateCcw, CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { type Experiment } from '@/constants/mockData';

interface ExperimentResultsProps {
  data: Experiment[];
  onConvertToHabit?: (experiment: Experiment) => void;
  onRunAgain?: (experiment: Experiment) => void;
}

export default function ExperimentResults({ data, onConvertToHabit, onRunAgain }: ExperimentResultsProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const activeExperiments = data.filter(exp => exp.status === 'active');
  const completedExperiments = data.filter(exp => exp.status === 'completed');

  const getCategoryColor = (outcome: string) => {
    switch (outcome.toLowerCase()) {
      case 'mood': return theme.colors.moodHappy;
      case 'sleep quality': return theme.colors.moodCalm;
      case 'mental clarity': return theme.colors.primary;
      case 'anxiety / calmness': return theme.colors.moodNeutral;
      default: return theme.colors.textSecondary;
    }
  };

  const renderActiveExperiment = (experiment: Experiment) => {
    const progress = ((experiment.currentDay || 0) / (experiment.totalDays || 30)) * 100;
    
    return (
      <View key={experiment.id} style={styles.experimentCard}>
        <View style={styles.experimentHeader}>
          <View style={styles.experimentTitleRow}>
            <Text style={styles.experimentEmoji}>{experiment.activityEmoji}</Text>
            <Text style={styles.experimentTitle}>{experiment.activityName}</Text>
          </View>
          <View style={styles.activeIndicator}>
            <Text style={styles.activeText}>Active</Text>
          </View>
        </View>
        
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>
            Day {experiment.currentDay}/{experiment.totalDays} complete
          </Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: theme.colors.primary }]} />
          </View>
        </View>
        
        <View style={styles.trendSection}>
          <Text style={styles.trendTitle}>Tracking Outcomes</Text>
          <View style={styles.trendIndicators}>
            {experiment.outcomes.slice(0, 3).map((outcome, index) => (
              <View key={index} style={styles.trendItem}>
                <Text style={styles.trendLabel}>{outcome}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderCompletedExperiment = (experiment: Experiment) => {
    // Calculate improvement from baseline to results data
    const getAverageScore = (data?: any) => {
      if (!data) return 0;
      const scores = Object.values(data).filter(v => typeof v === 'number') as number[];
      return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    };

    const beforeScore = getAverageScore(experiment.baselineData);
    const afterScore = getAverageScore(experiment.resultsData);
    const improvement = beforeScore > 0 ? ((afterScore - beforeScore) / beforeScore * 100) : 0;

    return (
      <View key={experiment.id} style={styles.experimentCard}>
        <View style={styles.experimentHeader}>
          <View style={styles.experimentTitleRow}>
            <Text style={styles.experimentEmoji}>{experiment.activityEmoji}</Text>
            <Text style={styles.experimentTitle}>{experiment.activityName}</Text>
          </View>
          <View style={styles.completedIndicator}>
            <CheckCircle size={16} color={theme.colors.success} />
            <Text style={styles.completedText}>Complete</Text>
          </View>
        </View>

        {(experiment.baselineData || experiment.resultsData) && (
          <View style={styles.resultsSection}>
            <View style={styles.comparisonBars}>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Before</Text>
                <View style={styles.comparisonBarContainer}>
                  <View 
                    style={[
                      styles.comparisonBar, 
                      { 
                        width: `${(beforeScore / 5) * 100}%`,
                        backgroundColor: theme.colors.surfaceVariant
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.comparisonValue}>{beforeScore.toFixed(1)}</Text>
              </View>
              
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>After</Text>
                <View style={styles.comparisonBarContainer}>
                  <View 
                    style={[
                      styles.comparisonBar, 
                      { 
                        width: `${(afterScore / 5) * 100}%`,
                        backgroundColor: theme.colors.primary
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.comparisonValue}>{afterScore.toFixed(1)}</Text>
              </View>
            </View>

            {improvement > 0 && (
              <View style={styles.improvementBadge}>
                <Text style={styles.improvementText}>
                  +{improvement.toFixed(0)}% improvement
                </Text>
              </View>
            )}
          </View>
        )}

        {experiment.insights && (
          <View style={styles.insightSection}>
            <Text style={styles.insightText}>{experiment.insights}</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => onConvertToHabit?.(experiment)}
          >
            <CheckCircle size={16} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Convert to Habit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => onRunAgain?.(experiment)}
          >
            <RotateCcw size={16} color={theme.colors.textPrimary} />
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Run Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Experiment Results</Text>
      
      {activeExperiments.map(renderActiveExperiment)}
      {completedExperiments.map(renderCompletedExperiment)}
      
      {data.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🧪</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Active Experiments</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Start tracking experiments to see insights about what improves your wellbeing
          </Text>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    ...theme.components.card,
    marginHorizontal: theme.spacing.screenHorizontal,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.md,
  },
  experimentCard: {
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.elementGap,
  },
  experimentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.elementGap,
  },
  experimentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experimentEmoji: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  experimentTitle: {
    ...theme.typography.h5,
  },
  activeIndicator: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.md,
  },
  activeText: {
    ...theme.typography.captionSmall,
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.md,
  },
  completedText: {
    ...theme.typography.captionSmall,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  progressSection: {
    marginBottom: theme.spacing.md,
  },
  progressText: {
    ...theme.typography.body,
    marginBottom: theme.spacing.sm,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.radii.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radii.xs,
  },
  trendSection: {
    marginBottom: theme.spacing.sm,
  },
  trendTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  trendIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  trendItem: {
    alignItems: 'center',
  },
  trendLabel: {
    ...theme.typography.caption,
  },
  resultsSection: {
    marginBottom: theme.spacing.md,
  },
  comparisonBars: {
    marginBottom: theme.spacing.elementGap,
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  comparisonLabel: {
    ...theme.typography.body,
    fontWeight: '500',
    width: 50,
  },
  comparisonBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: theme.radii.sm + 2,
    marginHorizontal: theme.spacing.elementGap,
    overflow: 'hidden',
  },
  comparisonBar: {
    height: '100%',
    borderRadius: theme.radii.sm + 2,
  },
  comparisonValue: {
    ...theme.typography.body,
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
  improvementBadge: {
    alignSelf: 'center',
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.elementGap,
    paddingVertical: theme.spacing.chipGap - 2,
    borderRadius: theme.radii.lg,
  },
  improvementText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  insightSection: {
    backgroundColor: theme.colors.moodCalm,
    padding: theme.spacing.elementGap,
    borderRadius: theme.radii.sm,
    marginBottom: theme.spacing.md,
  },
  insightText: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.sm,
    flex: 0.48,
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  actionButtonText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: theme.spacing.chipGap - 2,
  },
  secondaryButtonText: {
    color: theme.colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    ...theme.typography.body,
    textAlign: 'center',
  },
});