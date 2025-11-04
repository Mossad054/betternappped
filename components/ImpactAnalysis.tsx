import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AnalyticsService, ActivityImpactData, ActivityImpactResult } from '@/services/analytics.service';
import { router } from 'expo-router';

interface ImpactAnalysisProps {
  userId: string;
  timeRange: 'today' | 'week' | 'month' | 'year';
}

export default function ImpactAnalysis({ userId, timeRange }: ImpactAnalysisProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [impactResult, setImpactResult] = useState<ActivityImpactResult | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityImpactData | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<'impact' | 'frequency'>('impact');

  useEffect(() => {
    loadImpactData();
  }, [userId, timeRange]);

  const loadImpactData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading impact data for:', timeRange);
      const result = await AnalyticsService.getActivityImpact(userId, timeRange);
      
      if (result.data) {
        setImpactResult(result.data);
        console.log('✅ Impact data loaded:', result.data.activities.length, 'activities');
      } else {
        console.error('❌ Failed to load impact data:', result.error);
      }
    } catch (error) {
      console.error('❌ Error loading impact data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Analyzing your activities...
        </Text>
      </View>
    );
  }

  if (!impactResult || impactResult.activities.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Impact Analysis</Text>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          {impactResult?.insights[0] || 'Log activities to see their impact on your well-being.'}
        </Text>
      </View>
    );
  }

  const getImpactColor = (score: number) => {
    if (score >= 60) return theme.colors.success;
    if (score >= 45) return theme.colors.warning;
    return theme.colors.error;
  };

  const getImpactBadge = (score: number) => {
    if (score >= 60) return { text: 'Positive', emoji: '✨' };
    if (score >= 45) return { text: 'Neutral', emoji: '🔄' };
    return { text: 'Negative', emoji: '⚠️' };
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  const sortedActivities = [...impactResult.activities].sort((a, b) => {
    if (sortBy === 'impact') {
      return b.impactScore - a.impactScore;
    } else {
      return b.frequencyPercent - a.frequencyPercent;
    }
  });

  const displayedActivities = showAll ? sortedActivities : sortedActivities.slice(0, 5);

  const openActivityDetail = (activity: ActivityImpactData) => {
    setSelectedActivity(activity);
    setIsModalVisible(true);
  };

  const handleConvertToHabit = () => {
    if (!selectedActivity) return;
    setIsModalVisible(false);
    // Navigate to habit creation with pre-filled data
    router.push({
      pathname: '/habit-library',
      params: {
        prefill: 'true',
        name: selectedActivity.activityName,
        category: selectedActivity.category,
        emoji: selectedActivity.emoji,
      }
    });
  };

  const handleRunExperiment = () => {
    if (!selectedActivity) return;
    setIsModalVisible(false);
    // Navigate to experiment creation with pre-filled data
    router.push({
      pathname: '/create-experiment',
      params: {
        prefill: 'true',
        activity: selectedActivity.activityName,
        category: selectedActivity.category,
      }
    });
  };

  const renderModal = () => {
    if (!selectedActivity) return null;

    const badge = getImpactBadge(selectedActivity.impactScore);

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
          <ScrollView style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {selectedActivity.emoji} {selectedActivity.activityName}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={[styles.closeX, { color: theme.colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Category Badge */}
            <View style={[styles.categoryBadge, { backgroundColor: theme.colors.border }]}>
              <Text style={[styles.categoryBadgeText, { color: theme.colors.text }]}>
                {selectedActivity.category}
              </Text>
            </View>

            {/* Impact Score */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                Impact Score
              </Text>
              <View style={styles.scoreRow}>
                <Text style={[styles.scoreValue, { color: getImpactColor(selectedActivity.impactScore) }]}>
                  {selectedActivity.impactScore}/100
                </Text>
                <View style={[styles.badgePill, { backgroundColor: getImpactColor(selectedActivity.impactScore) + '20' }]}>
                  <Text style={[styles.badgeText, { color: getImpactColor(selectedActivity.impactScore) }]}>
                    {badge.emoji} {badge.text}
                  </Text>
                </View>
              </View>
            </View>

            {/* Confidence & Trend */}
            <View style={styles.modalSection}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Confidence</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {selectedActivity.confidence.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Trend</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {getTrendIcon(selectedActivity.trend)} {selectedActivity.trend.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Frequency</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {selectedActivity.frequencyPercent}%
                  </Text>
                </View>
              </View>
              {selectedActivity.confidence === 'low' && (
                <View style={[styles.warningBox, { backgroundColor: theme.colors.warning + '20', borderColor: theme.colors.warning }]}>
                  <Text style={[styles.warningText, { color: theme.colors.warning }]}>
                    ⚠️ Limited data - keep logging for more accurate insights
                  </Text>
                </View>
              )}
            </View>

            {/* Metric Changes */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                Average Changes
              </Text>
              <View style={styles.metricGrid}>
                <View style={styles.metricCard}>
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>😊 Mood</Text>
                  <Text style={[styles.metricValue, { color: selectedActivity.avgMoodChange > 0 ? theme.colors.success : theme.colors.error }]}>
                    {selectedActivity.avgMoodChange > 0 ? '+' : ''}{selectedActivity.avgMoodChange.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>😴 Sleep</Text>
                  <Text style={[styles.metricValue, { color: selectedActivity.avgSleepChange > 0 ? theme.colors.success : theme.colors.error }]}>
                    {selectedActivity.avgSleepChange > 0 ? '+' : ''}{selectedActivity.avgSleepChange.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>🧠 Clarity</Text>
                  <Text style={[styles.metricValue, { color: selectedActivity.avgClarityChange > 0 ? theme.colors.success : theme.colors.error }]}>
                    {selectedActivity.avgClarityChange > 0 ? '+' : ''}{selectedActivity.avgClarityChange.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>⚡ Productivity</Text>
                  <Text style={[styles.metricValue, { color: selectedActivity.avgProductivityChange > 0 ? theme.colors.success : theme.colors.error }]}>
                    {selectedActivity.avgProductivityChange > 0 ? '+' : ''}{selectedActivity.avgProductivityChange.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Correlations */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                Correlations
              </Text>
              <View style={styles.correlationList}>
                {['mood', 'sleep', 'clarity', 'productivity'].map((metric) => {
                  const value = selectedActivity.correlations[metric as keyof typeof selectedActivity.correlations];
                  return (
                    <View key={metric} style={styles.correlationRow}>
                      <Text style={[styles.correlationLabel, { color: theme.colors.text }]}>
                        {metric.charAt(0).toUpperCase() + metric.slice(1)}
                      </Text>
                      <View style={styles.correlationBarContainer}>
                        <View 
                          style={[
                            styles.correlationBar, 
                            { 
                              width: `${Math.abs(value) * 100}%`,
                              backgroundColor: value > 0 ? theme.colors.success : theme.colors.error 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.correlationValue, { color: theme.colors.textSecondary }]}>
                        {value.toFixed(2)}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleConvertToHabit}
              >
                <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>
                  🔄 Convert to Habit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.accent, borderWidth: 1, borderColor: theme.colors.primary }]}
                onPress={handleRunExperiment}
              >
                <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
                  🧪 Run Experiment
                </Text>
              </TouchableOpacity>
            </View>

            {/* Occurrences */}
            <View style={[styles.modalSection, { marginBottom: 20 }]}>
              <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                Activity Stats
              </Text>
              <Text style={[styles.statsText, { color: theme.colors.textSecondary }]}>
                Logged {selectedActivity.totalOccurrences} times ({selectedActivity.frequencyPercent}% of all activities)
              </Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Impact Analysis</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            How your activities affect your wellbeing
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.sortButton, { borderColor: theme.colors.border }]}
          onPress={() => setSortBy(sortBy === 'impact' ? 'frequency' : 'impact')}
        >
          <Text style={[styles.sortButtonText, { color: theme.colors.primary }]}>
            {sortBy === 'impact' ? '📊 Impact' : '📈 Frequency'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Insights */}
      {impactResult.insights.length > 0 && (
        <View style={[styles.insightsBox, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary + '30' }]}>
          {impactResult.insights.map((insight, idx) => (
            <Text key={idx} style={[styles.insightText, { color: theme.colors.text }]}>
              • {insight}
            </Text>
          ))}
        </View>
      )}

      {/* Activity List */}
      <View style={styles.activityList}>
        {displayedActivities.map((activity, index) => {
          const badge = getImpactBadge(activity.impactScore);
          return (
            <TouchableOpacity
              key={`${activity.activityName}-${index}`}
              style={[styles.activityCard, { backgroundColor: theme.colors.border + '30' }]}
              onPress={() => openActivityDetail(activity)}
            >
              <View style={styles.activityHeader}>
                <View style={styles.activityTitleRow}>
                  <Text style={[styles.activityEmoji]}>{activity.emoji}</Text>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityName, { color: theme.colors.text }]}>
                      {activity.activityName}
                    </Text>
                    <Text style={[styles.activityFrequency, { color: theme.colors.textSecondary }]}>
                      {activity.totalOccurrences}x • {activity.frequencyPercent}%
                    </Text>
                  </View>
                </View>
                <View style={[styles.impactBadge, { backgroundColor: getImpactColor(activity.impactScore) + '20' }]}>
                  <Text style={[styles.impactBadgeText, { color: getImpactColor(activity.impactScore) }]}>
                    {badge.emoji} {activity.impactScore}
                  </Text>
                </View>
              </View>
              
              {/* Mini metrics */}
              <View style={styles.miniMetrics}>
                {activity.avgMoodChange !== 0 && (
                  <Text style={[styles.miniMetric, { color: theme.colors.textSecondary }]}>
                    😊 {activity.avgMoodChange > 0 ? '+' : ''}{activity.avgMoodChange.toFixed(1)}
                  </Text>
                )}
                {activity.avgSleepChange !== 0 && (
                  <Text style={[styles.miniMetric, { color: theme.colors.textSecondary }]}>
                    😴 {activity.avgSleepChange > 0 ? '+' : ''}{activity.avgSleepChange.toFixed(1)}
                  </Text>
                )}
                {activity.avgClarityChange !== 0 && (
                  <Text style={[styles.miniMetric, { color: theme.colors.textSecondary }]}>
                    🧠 {activity.avgClarityChange > 0 ? '+' : ''}{activity.avgClarityChange.toFixed(1)}
                  </Text>
                )}
                {activity.confidence === 'low' && (
                  <Text style={[styles.miniMetric, { color: theme.colors.warning }]}>
                    ⚠️ Low confidence
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Show More/Less Button */}
      {sortedActivities.length > 5 && (
        <TouchableOpacity
          style={[styles.showMoreButton, { borderColor: theme.colors.border }]}
          onPress={() => setShowAll(!showAll)}
        >
          <Text style={[styles.showMoreText, { color: theme.colors.primary }]}>
            {showAll ? '↑ Show Less' : `↓ Show ${sortedActivities.length - 5} More`}
          </Text>
        </TouchableOpacity>
      )}

      {renderModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  insightsBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  insightText: {
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18,
  },
  activityList: {
    gap: 12,
  },
  activityCard: {
    padding: 14,
    borderRadius: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityFrequency: {
    fontSize: 12,
  },
  impactBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  impactBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  miniMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  miniMetric: {
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  showMoreButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  closeX: {
    fontSize: 24,
    fontWeight: '300',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  badgePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  warningBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  warningText: {
    fontSize: 12,
    textAlign: 'center',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  correlationList: {
    gap: 12,
  },
  correlationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  correlationLabel: {
    width: 80,
    fontSize: 13,
    fontWeight: '500',
  },
  correlationBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  correlationBar: {
    height: '100%',
    borderRadius: 4,
  },
  correlationValue: {
    width: 40,
    textAlign: 'right',
    fontSize: 12,
  },
  actionButtons: {
    gap: 10,
    marginBottom: 20,
  },
  actionButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  statsText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
