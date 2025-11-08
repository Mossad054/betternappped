import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AnalyticsService, ActivityImpactData, ActivityImpactResult } from '@/services/analytics.service';
import { X } from 'lucide-react-native';

interface ImpactAnalysisCardProps {
  userId: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function ImpactAnalysisCard({ userId, loading: externalLoading, error: externalError, onRetry }: ImpactAnalysisCardProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [impactResult, setImpactResult] = useState<ActivityImpactResult | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityImpactData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    loadImpactData();
  }, [userId]);

  const loadImpactData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading impact data for last 7 days');
      const result = await AnalyticsService.getActivityImpact(userId, 'week');
      
      if (result.data) {
        // Sort by impact score and take top activities
        const sortedActivities = [...result.data.activities].sort(
          (a, b) => b.impactScore - a.impactScore
        );
        setImpactResult({
          ...result.data,
          activities: sortedActivities,
        });
        console.log('✅ Impact data loaded:', sortedActivities.length, 'activities');
      } else {
        console.error('❌ Failed to load impact data:', result.error);
      }
    } catch (error) {
      console.error('❌ Error loading impact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (score: number) => {
    if (score >= 60) return theme.colors.success; // Positive impact
    if (score >= 45) return theme.colors.warning; // Neutral
    return theme.colors.error; // Negative impact
  };

  const getImpactLabel = (score: number) => {
    if (score >= 60) return 'Positive';
    if (score >= 45) return 'Neutral';
    return 'Negative';
  };

  const openActivityDetail = (activity: ActivityImpactData) => {
    setSelectedActivity(activity);
    setIsModalVisible(true);
  };

  const renderActivityModal = () => {
    if (!selectedActivity) return null;

    const impactColor = getImpactColor(selectedActivity.impactScore);
    const impactLabel = getImpactLabel(selectedActivity.impactScore);

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.colors.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <Text style={styles.activityEmoji}>{selectedActivity.emoji}</Text>
                  <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                    {selectedActivity.activityName}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
                  <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Category Badge */}
              <View style={[styles.categoryBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                <Text style={[styles.categoryText, { color: theme.colors.primary }]}>
                  {selectedActivity.category}
                </Text>
              </View>

              {/* Impact Score Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Overall Impact
                </Text>
                <View style={styles.impactScoreCard}>
                  <Text style={[styles.impactScoreValue, { color: impactColor }]}>
                    {selectedActivity.impactScore}
                  </Text>
                  <Text style={[styles.impactScoreLabel, { color: theme.colors.textSecondary }]}>
                    / 100
                  </Text>
                </View>
                <View style={[styles.impactBadge, { backgroundColor: impactColor + '20' }]}>
                  <Text style={[styles.impactBadgeText, { color: impactColor }]}>
                    {impactLabel} Impact
                  </Text>
                </View>
              </View>

              {/* Frequency Stats */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Activity Frequency
                </Text>
                <View style={styles.statsRow}>
                  <View style={[styles.statCard, { backgroundColor: theme.colors.border + '40' }]}>
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                      {selectedActivity.totalOccurrences}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                      Times logged
                    </Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: theme.colors.border + '40' }]}>
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                      {selectedActivity.frequencyPercent}%
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                      Of all activities
                    </Text>
                  </View>
                  <View style={[styles.statCard, { backgroundColor: theme.colors.border + '40' }]}>
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>
                      {selectedActivity.confidence.toUpperCase()}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                      Confidence
                    </Text>
                  </View>
                </View>
              </View>

              {/* Impact on Wellbeing Parameters */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Impact on Wellbeing Parameters
                </Text>
                <View style={styles.parametersList}>
                  {/* Mood Impact */}
                  <View style={styles.parameterRow}>
                    <View style={styles.parameterLeft}>
                      <Text style={styles.parameterEmoji}>😊</Text>
                      <Text style={[styles.parameterName, { color: theme.colors.text }]}>
                        Mood
                      </Text>
                    </View>
                    <Text style={[
                      styles.parameterValue,
                      { color: selectedActivity.avgMoodChange >= 0 ? theme.colors.success : theme.colors.error }
                    ]}>
                      {selectedActivity.avgMoodChange > 0 ? '+' : ''}
                      {selectedActivity.avgMoodChange.toFixed(2)}
                    </Text>
                  </View>

                  {/* Sleep Impact */}
                  <View style={styles.parameterRow}>
                    <View style={styles.parameterLeft}>
                      <Text style={styles.parameterEmoji}>😴</Text>
                      <Text style={[styles.parameterName, { color: theme.colors.text }]}>
                        Sleep Quality
                      </Text>
                    </View>
                    <Text style={[
                      styles.parameterValue,
                      { color: selectedActivity.avgSleepChange >= 0 ? theme.colors.success : theme.colors.error }
                    ]}>
                      {selectedActivity.avgSleepChange > 0 ? '+' : ''}
                      {selectedActivity.avgSleepChange.toFixed(2)}
                    </Text>
                  </View>

                  {/* Mental Clarity Impact */}
                  <View style={styles.parameterRow}>
                    <View style={styles.parameterLeft}>
                      <Text style={styles.parameterEmoji}>🧠</Text>
                      <Text style={[styles.parameterName, { color: theme.colors.text }]}>
                        Mental Clarity
                      </Text>
                    </View>
                    <Text style={[
                      styles.parameterValue,
                      { color: selectedActivity.avgClarityChange >= 0 ? theme.colors.success : theme.colors.error }
                    ]}>
                      {selectedActivity.avgClarityChange > 0 ? '+' : ''}
                      {selectedActivity.avgClarityChange.toFixed(2)}
                    </Text>
                  </View>

                  {/* Productivity Impact */}
                  <View style={styles.parameterRow}>
                    <View style={styles.parameterLeft}>
                      <Text style={styles.parameterEmoji}>⚡</Text>
                      <Text style={[styles.parameterName, { color: theme.colors.text }]}>
                        Productivity
                      </Text>
                    </View>
                    <Text style={[
                      styles.parameterValue,
                      { color: selectedActivity.avgProductivityChange >= 0 ? theme.colors.success : theme.colors.error }
                    ]}>
                      {selectedActivity.avgProductivityChange > 0 ? '+' : ''}
                      {selectedActivity.avgProductivityChange.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Correlation Strength */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Correlation Strength
                </Text>
                <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
                  How strongly this activity relates to each parameter
                </Text>
                <View style={styles.correlationList}>
                  {Object.entries(selectedActivity.correlations).map(([key, value]) => (
                    <View key={key} style={styles.correlationRow}>
                      <Text style={[styles.correlationLabel, { color: theme.colors.text }]}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Text>
                      <View style={styles.correlationBarContainer}>
                        <View 
                          style={[
                            styles.correlationBar,
                            { 
                              width: `${Math.abs(value as number) * 100}%`,
                              backgroundColor: (value as number) >= 0 ? theme.colors.success : theme.colors.error,
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.correlationValue, { color: theme.colors.textSecondary }]}>
                        {((value as number) * 100).toFixed(0)}%
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Confidence Note */}
              {selectedActivity.confidence === 'low' && (
                <View style={[styles.warningBox, { 
                  backgroundColor: theme.colors.warning + '20',
                  borderColor: theme.colors.warning 
                }]}>
                  <Text style={[styles.warningText, { color: theme.colors.warning }]}>
                    ⚠️ Low confidence: Keep logging this activity for more accurate insights
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Loading state
  if (loading || externalLoading) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.accent }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Impact Analysis</Text>
        <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
          How your activities affect your wellbeing
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Analyzing your data...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (externalError) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.accent }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Impact Analysis</Text>
        <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
          How your activities affect your wellbeing
        </Text>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            {externalError}
          </Text>
          {onRetry && (
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              onPress={onRetry}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // Empty state
  if (!impactResult || impactResult.activities.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.accent }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Impact Analysis</Text>
        <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
          How your activities affect your wellbeing
        </Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Log activities to see their impact on your wellbeing!
          </Text>
        </View>
      </View>
    );
  }

  // Render activities as pill buttons (3 per row)
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.accent }]}>
      <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Impact Analysis</Text>
      <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
        How your activities affect your wellbeing
      </Text>

      {/* Top activity insight */}
      {impactResult.activities.length > 0 && impactResult.activities[0].impactScore >= 60 && (
        <View style={[styles.insightBanner, { 
          backgroundColor: theme.colors.success + '20',
          borderColor: theme.colors.success 
        }]}>
          <Text style={[styles.insightText, { color: theme.colors.text }]}>
            🎉 {impactResult.activities[0].emoji} {impactResult.activities[0].activityName} has the highest positive impact!
          </Text>
        </View>
      )}

      {/* Activity Pills Grid */}
      <View style={styles.pillsContainer}>
        {(showAllActivities ? impactResult.activities : impactResult.activities.slice(0, 8)).map((activity, index) => {
          const impactColor = getImpactColor(activity.impactScore);
          
          return (
            <TouchableOpacity
              key={`${activity.activityName}-${index}`}
              style={[
                styles.activityPill,
                { 
                  backgroundColor: impactColor + '15',
                  borderColor: impactColor,
                }
              ]}
              onPress={() => openActivityDetail(activity)}
              activeOpacity={0.7}
            >
              <Text style={styles.pillEmoji}>{activity.emoji}</Text>
              <Text 
                style={[styles.pillText, { color: theme.colors.text }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {activity.activityName}
              </Text>
              <View style={[styles.impactDot, { backgroundColor: impactColor }]} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Show More / Show Less Button */}
      {impactResult.activities.length > 8 && (
        <TouchableOpacity 
          style={[styles.toggleButton, { borderColor: theme.colors.border }]}
          onPress={() => setShowAllActivities(!showAllActivities)}
          activeOpacity={0.7}
        >
          <Text style={[styles.toggleButtonText, { color: theme.colors.primary }]}>
            {showAllActivities 
              ? '▲ Show Less' 
              : `▼ Show ${impactResult.activities.length - 8} More Activities`}
          </Text>
        </TouchableOpacity>
      )}

      {renderActivityModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  insightBanner: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  insightText: {
    fontSize: 13,
    lineHeight: 18,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 8,
    // Calculate width to fit 2 per row with gaps
    width: '47%', // (100% - 1 gap) / 2
    minWidth: 140,
    minHeight: 56,
  },
  pillEmoji: {
    fontSize: 20,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  impactDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  toggleButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
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
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  activityEmoji: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 12,
    marginBottom: 12,
  },
  impactScoreCard: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 12,
  },
  impactScoreValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  impactScoreLabel: {
    fontSize: 20,
    marginLeft: 4,
  },
  impactBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'center',
  },
  impactBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  parametersList: {
    gap: 12,
  },
  parameterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  parameterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  parameterEmoji: {
    fontSize: 24,
  },
  parameterName: {
    fontSize: 15,
    fontWeight: '500',
  },
  parameterValue: {
    fontSize: 18,
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
    width: 90,
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
    width: 45,
    textAlign: 'right',
    fontSize: 12,
  },
  warningBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  warningText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
