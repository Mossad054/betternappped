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
import { X, HelpCircle } from 'lucide-react-native';

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
  const [showHelpOverlay, setShowHelpOverlay] = useState(false);

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
                <View style={styles.sectionTitleRow}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Correlation Strength
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowHelpOverlay(true)}
                    style={styles.helpButton}
                    activeOpacity={0.7}
                  >
                    <HelpCircle size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
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

      {/* Help Overlay Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showHelpOverlay}
        onRequestClose={() => setShowHelpOverlay(false)}
      >
        <View style={styles.helpOverlay}>
          <View style={[styles.helpContainer, { backgroundColor: theme.colors.card }]}>
            <View style={styles.helpHeader}>
              <Text style={[styles.helpTitle, { color: theme.colors.text }]}>
                Understanding Your Scores
              </Text>
              <TouchableOpacity onPress={() => setShowHelpOverlay(false)}>
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.helpContent}>
              {/* Impact Score Explanation */}
              <View style={styles.helpSection}>
                <Text style={[styles.helpSectionTitle, { color: theme.colors.text }]}>
                  📊 Impact Score (0-100)
                </Text>
                <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
                  A combined measure of how this activity affects your overall wellbeing. Higher scores mean more positive impact.
                </Text>
                <View style={styles.helpExample}>
                  <Text style={[styles.helpExampleText, { color: theme.colors.success }]}>
                    • 60-100: Positive Impact
                  </Text>
                  <Text style={[styles.helpExampleText, { color: theme.colors.warning }]}>
                    • 45-59: Neutral Impact
                  </Text>
                  <Text style={[styles.helpExampleText, { color: theme.colors.error }]}>
                    • 0-44: Negative Impact
                  </Text>
                </View>
              </View>

              {/* Average Change Explanation */}
              <View style={styles.helpSection}>
                <Text style={[styles.helpSectionTitle, { color: theme.colors.text }]}>
                  📈 Average Change (Impact on Parameters)
                </Text>
                <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
                  Shows the <Text style={styles.boldText}>average increase or decrease</Text> in each wellbeing parameter after doing this activity.
                </Text>
                <View style={styles.helpExample}>
                  <Text style={[styles.helpExampleText, { color: theme.colors.text }]}>
                    <Text style={[styles.boldText, { color: theme.colors.success }]}>+1.5</Text> = Your mood increased by 1.5 points on average
                  </Text>
                  <Text style={[styles.helpExampleText, { color: theme.colors.text }]}>
                    <Text style={[styles.boldText, { color: theme.colors.error }]}>-0.8</Text> = Your mood decreased by 0.8 points on average
                  </Text>
                  <Text style={[styles.helpExampleText, { color: theme.colors.text }]}>
                    <Text style={[styles.boldText, { color: theme.colors.textSecondary }]}>0.0</Text> = No average change detected
                  </Text>
                </View>
              </View>

              {/* Correlation Explanation */}
              <View style={styles.helpSection}>
                <Text style={[styles.helpSectionTitle, { color: theme.colors.text }]}>
                  🔗 Correlation Strength (-100% to +100%)
                </Text>
                <Text style={[styles.helpText, { color: theme.colors.textSecondary }]}>
                  Measures <Text style={styles.boldText}>how consistently</Text> this activity relates to each parameter. This is different from average change!
                </Text>
                <View style={styles.helpExample}>
                  <Text style={[styles.helpExampleText, { color: theme.colors.success }]}>
                    <Text style={styles.boldText}>+70%</Text> = Strong positive pattern (doing this activity consistently associates with higher scores)
                  </Text>
                  <Text style={[styles.helpExampleText, { color: theme.colors.error }]}>
                    <Text style={styles.boldText}>-67%</Text> = Strong negative pattern (doing this activity consistently associates with lower scores)
                  </Text>
                  <Text style={[styles.helpExampleText, { color: theme.colors.textSecondary }]}>
                    <Text style={styles.boldText}>0%</Text> = No consistent pattern detected
                  </Text>
                </View>
              </View>

              {/* Example Scenario */}
              <View style={[styles.exampleBox, {
                backgroundColor: theme.colors.primary + '15',
                borderColor: theme.colors.primary
              }]}>
                <Text style={[styles.exampleTitle, { color: theme.colors.primary }]}>
                  💡 Example: Why is Mood Change 0.0 but Correlation -67%?
                </Text>
                <Text style={[styles.helpText, { color: theme.colors.text }]}>
                  Let's say you exercise 10 times:
                </Text>
                <Text style={[styles.helpText, { color: theme.colors.text }]}>
                  • 5 times: mood went from 6→6 (no change)
                  {'\n'}• 5 times: mood went from 5→5 (no change)
                  {'\n'}
                  {'\n'}<Text style={styles.boldText}>Average Change = 0.0</Text> (mood didn't increase/decrease)
                  {'\n'}
                  {'\n'}However, you notice: On days you DON'T exercise, your mood is usually 7-8. On days you DO exercise, it's 5-6.
                  {'\n'}
                  {'\n'}<Text style={styles.boldText}>Correlation = -67%</Text> (strong pattern: exercise days = lower mood)
                  {'\n'}
                  {'\n'}This suggests exercise might be draining you, even though it's not making your mood worse during the activity itself.
                </Text>
              </View>

              {/* Bottom Note */}
              <View style={[styles.helpNote, { backgroundColor: theme.colors.warning + '20' }]}>
                <Text style={[styles.helpNoteText, { color: theme.colors.warning }]}>
                  💭 Keep in mind: You need at least 5-10 instances of an activity for reliable correlation scores. More data = more accurate insights!
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  // Help Overlay Styles
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  helpButton: {
    padding: 4,
    marginLeft: 8,
  },
  helpOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  helpContainer: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 20,
    padding: 20,
  },
  helpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  helpContent: {
    maxHeight: '100%',
  },
  helpSection: {
    marginBottom: 24,
  },
  helpSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  boldText: {
    fontWeight: '700',
  },
  helpExample: {
    marginTop: 8,
    gap: 6,
  },
  helpExampleText: {
    fontSize: 13,
    lineHeight: 20,
    paddingLeft: 8,
  },
  exampleBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  exampleTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  helpNote: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  helpNoteText: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
