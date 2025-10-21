import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ExperimentData } from '@/constants/mockData';
import { RotateCcw, CheckCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ExperimentResultsProps {
  data: ExperimentData[];
}

export default function ExperimentResults({ data }: ExperimentResultsProps) {
  const { theme } = useTheme();
  const activeExperiments = data.filter(exp => exp.isActive);
  const completedExperiments = data.filter(exp => !exp.isActive);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mood': return theme.colors.primary;
      case 'sleep': return theme.colors.primary;
      case 'clarity': return theme.colors.primary;
      default: return theme.colors.textSecondary;
    }
  };

  const renderActiveExperiment = (experiment: ExperimentData) => {
    const progress = (experiment.currentDay / experiment.totalDays) * 100;
    
    return (
      <View key={experiment.id} style={styles.experimentCard}>
        <View style={styles.experimentHeader}>
          <View style={styles.experimentTitleRow}>
            <Text style={styles.experimentEmoji}>{experiment.emoji}</Text>
            <Text style={styles.experimentTitle}>{experiment.title}</Text>
          </View>
          <View style={styles.activeIndicator}>
            <Text style={styles.activeText}>Active</Text>
          </View>
        </View>
        
        <View style={styles.progressSection}>
          <Text style={styles.progressText}>
            Day {experiment.currentDay}/{experiment.totalDays} complete
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>
        
        <View style={styles.trendSection}>
          <Text style={styles.trendTitle}>Early Trends</Text>
          <View style={styles.trendIndicators}>
            <View style={styles.trendItem}>
              <Text style={styles.trendArrow}>↗️</Text>
              <Text style={styles.trendLabel}>Mood</Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={styles.trendArrow}>↗️</Text>
              <Text style={styles.trendLabel}>Energy</Text>
            </View>
            <View style={styles.trendItem}>
              <Text style={styles.trendArrow}>→</Text>
              <Text style={styles.trendLabel}>Sleep</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderCompletedExperiment = (experiment: ExperimentData) => {
    const improvement = experiment.afterScore && experiment.beforeScore 
      ? ((experiment.afterScore - experiment.beforeScore) / experiment.beforeScore * 100)
      : 0;

    return (
      <View key={experiment.id} style={styles.experimentCard}>
        <View style={styles.experimentHeader}>
          <View style={styles.experimentTitleRow}>
            <Text style={styles.experimentEmoji}>{experiment.emoji}</Text>
            <Text style={styles.experimentTitle}>{experiment.title}</Text>
          </View>
          <View style={styles.completedIndicator}>
            <CheckCircle size={16} color="#10B981" />
            <Text style={styles.completedText}>Complete</Text>
          </View>
        </View>

        <View style={styles.resultsSection}>
          <View style={styles.comparisonBars}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>Before</Text>
              <View style={styles.comparisonBarContainer}>
                <View 
                  style={[
                    styles.comparisonBar, 
                    { 
                      width: `${(experiment.beforeScore / 5) * 100}%`,
                      backgroundColor: '#E5E7EB'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.comparisonValue}>{experiment.beforeScore.toFixed(1)}</Text>
            </View>
            
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>After</Text>
              <View style={styles.comparisonBarContainer}>
                <View 
                  style={[
                    styles.comparisonBar, 
                    { 
                      width: `${((experiment.afterScore || 0) / 5) * 100}%`,
                      backgroundColor: getCategoryColor(experiment.category)
                    }
                  ]} 
                />
              </View>
              <Text style={styles.comparisonValue}>{experiment.afterScore?.toFixed(1)}</Text>
            </View>
          </View>

          <View style={styles.improvementBadge}>
            <Text style={styles.improvementText}>
              +{improvement.toFixed(0)}% improvement
            </Text>
          </View>
        </View>

        {experiment.insight && (
          <View style={styles.insightSection}>
            <Text style={styles.insightText}>{experiment.insight}</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <CheckCircle size={16} color="#10B981" />
            <Text style={styles.actionButtonText}>Convert to Habit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
            <RotateCcw size={16} color="#6B7280" />
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  experimentCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  experimentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  experimentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experimentEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  experimentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  activeIndicator: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  completedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  trendSection: {
    marginBottom: 8,
  },
  trendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  trendIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  trendItem: {
    alignItems: 'center',
  },
  trendArrow: {
    fontSize: 16,
    marginBottom: 4,
  },
  trendLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  resultsSection: {
    marginBottom: 16,
  },
  comparisonBars: {
    marginBottom: 12,
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  comparisonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    width: 50,
  },
  comparisonBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  comparisonBar: {
    height: '100%',
    borderRadius: 10,
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    width: 30,
    textAlign: 'right',
  },
  improvementBadge: {
    alignSelf: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  improvementText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  insightSection: {
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  insightText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 0.48,
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  secondaryButtonText: {
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});