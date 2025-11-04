import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  ActivityIndicator,
  Animated 
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AnalyticsService, ActivityImpactData } from '@/services/analytics.service';
import Svg, { Circle } from 'react-native-svg';

interface ActivityImpactCardProps {
  userId: string;
  period: 'today' | 'week' | 'month' | 'year';
}

export default function ActivityImpactCard({ userId, period }: ActivityImpactCardProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityImpactData[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<ActivityImpactData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadActivityImpact();
  }, [userId, period]);

  const loadActivityImpact = async () => {
    setLoading(true);
    try {
      console.log('🎯 Loading activity impact analysis...');
      const result = await AnalyticsService.getActivityImpact(userId, period);
      
      if (result.data) {
        setActivities(result.data.activities);
        setInsights(result.data.insights);
        setTotalActivities(result.data.totalActivities);
        
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      } else {
        console.error('❌ Failed to load activity impact:', result.error);
      }
    } catch (error) {
      console.error('❌ Error loading activity impact:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (score: number) => {
    if (score >= 60) return theme.colors.success || '#10B981';
    if (score >= 45) return theme.colors.warning || '#F59E0B';
    return theme.colors.error || '#EF4444';
  };

  const getImpactLabel = (score: number) => {
    if (score >= 60) return 'Positive';
    if (score >= 45) return 'Neutral';
    return 'Negative';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'flat') => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const renderDonutChart = () => {
    if (activities.length === 0) return null;

    const radius = 70;
    const strokeWidth = 18;
    const center = 90;
    const circumference = 2 * Math.PI * radius;

    const topActivities = activities.slice(0, 5);
    const total = topActivities.reduce((sum, a) => sum + a.totalOccurrences, 0);

    let currentAngle = -90;

    return (
      <View style={styles.donutChartContainer}>
        <Svg width={center * 2} height={center * 2}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={theme.colors.border || '#E5E7EB'}
            strokeWidth={strokeWidth}
          />
          {topActivities.map((activity, index) => {
            const percentage = activity.totalOccurrences / total;
            const strokeDasharray = `${circumference * percentage} ${circumference}`;
            // Color-code based on impact score
            const color = getImpactColor(activity.impactScore);
            
            const rotation = currentAngle;
            currentAngle += percentage * 360;

            return (
              <Circle
                key={activity.activityName}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={circumference / 4}
                rotation={rotation}
                origin={`${center}, ${center}`}
              />
            );
          })}
        </Svg>
        <View style={styles.donutCenter}>
          <Text style={[styles.donutCenterNumber, { color: theme.colors.text }]}>
            {totalActivities}
          </Text>
          <Text style={[styles.donutCenterLabel, { color: theme.colors.textSecondary }]}>
            Activities
          </Text>
        </View>
      </View>
    );
  };

  const handleActivityPress = (activity: ActivityImpactData) => {
    setSelectedActivity(activity);
    setModalVisible(true);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Activity Impact Analysis
          </Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Analyzing activity patterns...
          </Text>
        </View>
      </View>
    );
  }

  if (activities.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Activity Impact Analysis
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            See how your activities affect well-being
          </Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No activities tracked yet
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {insights[0] || 'Start logging activities to see their impact on your mood, sleep, and clarity.'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.colors.card, opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Activity Impact Analysis
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            See how your activities affect well-being
          </Text>
        </View>
      </View>

      {/* Chart and Summary */}
      <View style={styles.chartSection}>
        {renderDonutChart()}
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {activities.filter(a => a.impactScore >= 60).length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.success }]}>
              Positive
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {activities.filter(a => a.impactScore >= 45 && a.impactScore < 60).length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.warning }]}>
              Neutral
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {activities.filter(a => a.impactScore < 45).length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.error }]}>
              Negative
            </Text>
          </View>
        </View>
      </View>

      {/* Insights */}
      {insights.length > 0 && (
        <View style={styles.insightsContainer}>
          {insights.slice(0, 2).map((insight, index) => (
            <View 
              key={index} 
              style={[styles.insightItem, { backgroundColor: theme.colors.primary + '10' }]}
            >
              <Text style={[styles.insightText, { color: theme.colors.text }]}>
                • {insight}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Activity List */}
      <View style={styles.activitiesContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Your Activities
        </Text>
        {activities.slice(0, 6).map((activity, index) => {
          const impactColor = getImpactColor(activity.impactScore);
          const impactLabel = getImpactLabel(activity.impactScore);
          
          return (
            <TouchableOpacity
              key={index}
              style={styles.activityRow}
              onPress={() => handleActivityPress(activity)}
              activeOpacity={0.7}
            >
              <View style={styles.activityInfo}>
                <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                <View style={styles.activityDetails}>
                  <Text style={[styles.activityName, { color: theme.colors.text }]}>
                    {activity.activityName}
                  </Text>
                  <View style={styles.activityMeta}>
                    <Text style={[styles.activityFrequency, { color: theme.colors.textSecondary }]}>
                      {activity.totalOccurrences}x • {activity.frequencyPercent}%
                    </Text>
                    <View style={styles.impactIndicators}>
                      {activity.avgMoodChange !== 0 && (
                        <View style={[styles.impactDot, { 
                          backgroundColor: activity.avgMoodChange > 0 ? theme.colors.success : theme.colors.error 
                        }]} />
                      )}
                      {activity.avgSleepChange !== 0 && (
                        <View style={[styles.impactDot, { 
                          backgroundColor: activity.avgSleepChange > 0 ? theme.colors.success : theme.colors.error 
                        }]} />
                      )}
                      {activity.avgClarityChange !== 0 && (
                        <View style={[styles.impactDot, { 
                          backgroundColor: activity.avgClarityChange > 0 ? theme.colors.success : theme.colors.error 
                        }]} />
                      )}
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.activityImpact}>
                <View style={[styles.impactBadge, { backgroundColor: impactColor + '20' }]}>
                  <Text style={[styles.trendIcon, { color: impactColor }]}>
                    {getTrendIcon(activity.trend)}
                  </Text>
                  <Text style={[styles.impactLabel, { color: impactColor }]}>
                    {impactLabel}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Activity Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalEmoji}>{selectedActivity?.emoji}</Text>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  {selectedActivity?.activityName}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={[styles.closeButtonText, { color: theme.colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedActivity && (
                <>
                  {/* Impact Score */}
                  <View style={styles.scoreSection}>
                    <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>
                      Overall Impact Score
                    </Text>
                    <Text style={[styles.scoreValue, { color: getImpactColor(selectedActivity.impactScore) }]}>
                      {selectedActivity.impactScore}/100
                    </Text>
                    <Text style={[styles.scoreDescription, { color: theme.colors.textSecondary }]}>
                      {getImpactLabel(selectedActivity.impactScore)} effect on your well-being
                    </Text>
                  </View>

                  {/* Stats Grid */}
                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <Text style={[styles.statBoxLabel, { color: theme.colors.textSecondary }]}>
                        Frequency
                      </Text>
                      <Text style={[styles.statBoxValue, { color: theme.colors.text }]}>
                        {selectedActivity.totalOccurrences}
                      </Text>
                      <Text style={[styles.statBoxSubtext, { color: theme.colors.textSecondary }]}>
                        {selectedActivity.frequencyPercent}% of total
                      </Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={[styles.statBoxLabel, { color: theme.colors.textSecondary }]}>
                        Confidence
                      </Text>
                      <Text style={[styles.statBoxValue, { color: theme.colors.text }]}>
                        {selectedActivity.confidence}
                      </Text>
                      <Text style={[styles.statBoxSubtext, { color: theme.colors.textSecondary }]}>
                        Data reliability
                      </Text>
                    </View>
                  </View>

                  {/* Impact Breakdown */}
                  <View style={styles.impactBreakdown}>
                    <Text style={[styles.breakdownTitle, { color: theme.colors.text }]}>
                      Impact Breakdown
                    </Text>
                    
                    <View style={styles.breakdownItem}>
                      <Text style={[styles.breakdownLabel, { color: theme.colors.textSecondary }]}>
                        😊 Mood
                      </Text>
                      <View style={styles.breakdownBar}>
                        <View 
                          style={[
                            styles.breakdownFill, 
                            { 
                              width: `${Math.abs(selectedActivity.avgMoodChange) * 20}%`,
                              backgroundColor: selectedActivity.avgMoodChange >= 0 
                                ? theme.colors.success 
                                : theme.colors.error
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[
                        styles.breakdownValue,
                        { color: selectedActivity.avgMoodChange >= 0 ? theme.colors.success : theme.colors.error }
                      ]}>
                        {selectedActivity.avgMoodChange > 0 ? '+' : ''}{selectedActivity.avgMoodChange.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.breakdownItem}>
                      <Text style={[styles.breakdownLabel, { color: theme.colors.textSecondary }]}>
                        😴 Sleep
                      </Text>
                      <View style={styles.breakdownBar}>
                        <View 
                          style={[
                            styles.breakdownFill, 
                            { 
                              width: `${Math.abs(selectedActivity.avgSleepChange) * 20}%`,
                              backgroundColor: selectedActivity.avgSleepChange >= 0 
                                ? theme.colors.success 
                                : theme.colors.error
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[
                        styles.breakdownValue,
                        { color: selectedActivity.avgSleepChange >= 0 ? theme.colors.success : theme.colors.error }
                      ]}>
                        {selectedActivity.avgSleepChange > 0 ? '+' : ''}{selectedActivity.avgSleepChange.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.breakdownItem}>
                      <Text style={[styles.breakdownLabel, { color: theme.colors.textSecondary }]}>
                        🧠 Clarity
                      </Text>
                      <View style={styles.breakdownBar}>
                        <View 
                          style={[
                            styles.breakdownFill, 
                            { 
                              width: `${Math.abs(selectedActivity.avgClarityChange) * 20}%`,
                              backgroundColor: selectedActivity.avgClarityChange >= 0 
                                ? theme.colors.success 
                                : theme.colors.error
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[
                        styles.breakdownValue,
                        { color: selectedActivity.avgClarityChange >= 0 ? theme.colors.success : theme.colors.error }
                      ]}>
                        {selectedActivity.avgClarityChange > 0 ? '+' : ''}{selectedActivity.avgClarityChange.toFixed(2)}
                      </Text>
                    </View>

                    <View style={styles.breakdownItem}>
                      <Text style={[styles.breakdownLabel, { color: theme.colors.textSecondary }]}>
                        ⚡ Productivity
                      </Text>
                      <View style={styles.breakdownBar}>
                        <View 
                          style={[
                            styles.breakdownFill, 
                            { 
                              width: `${Math.abs(selectedActivity.avgProductivityChange) * 20}%`,
                              backgroundColor: selectedActivity.avgProductivityChange >= 0 
                                ? theme.colors.success 
                                : theme.colors.error
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[
                        styles.breakdownValue,
                        { color: selectedActivity.avgProductivityChange >= 0 ? theme.colors.success : theme.colors.error }
                      ]}>
                        {selectedActivity.avgProductivityChange > 0 ? '+' : ''}{selectedActivity.avgProductivityChange.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* Recommendations */}
                  <View style={styles.recommendationsSection}>
                    <Text style={[styles.recommendationsTitle, { color: theme.colors.text }]}>
                      Recommendations
                    </Text>
                    {selectedActivity.impactScore >= 60 ? (
                      <>
                        <View style={styles.recommendationItem}>
                          <View style={[styles.recommendationBullet, { backgroundColor: theme.colors.success }]} />
                          <Text style={[styles.recommendationText, { color: theme.colors.textSecondary }]}>
                            This activity shows positive impact - consider maintaining or increasing frequency
                          </Text>
                        </View>
                        <View style={styles.recommendationItem}>
                          <View style={[styles.recommendationBullet, { backgroundColor: theme.colors.success }]} />
                          <Text style={[styles.recommendationText, { color: theme.colors.textSecondary }]}>
                            Convert this to a daily habit for consistent well-being benefits
                          </Text>
                        </View>
                      </>
                    ) : selectedActivity.impactScore < 45 ? (
                      <>
                        <View style={styles.recommendationItem}>
                          <View style={[styles.recommendationBullet, { backgroundColor: theme.colors.error }]} />
                          <Text style={[styles.recommendationText, { color: theme.colors.textSecondary }]}>
                            This activity shows negative correlation - consider reducing frequency
                          </Text>
                        </View>
                        <View style={styles.recommendationItem}>
                          <View style={[styles.recommendationBullet, { backgroundColor: theme.colors.error }]} />
                          <Text style={[styles.recommendationText, { color: theme.colors.textSecondary }]}>
                            Try identifying specific triggers or timing that make this activity less beneficial
                          </Text>
                        </View>
                        <View style={styles.recommendationItem}>
                          <View style={[styles.recommendationBullet, { backgroundColor: theme.colors.error }]} />
                          <Text style={[styles.recommendationText, { color: theme.colors.textSecondary }]}>
                            Replace with mood-boosting alternatives when possible
                          </Text>
                        </View>
                      </>
                    ) : (
                      <View style={styles.recommendationItem}>
                        <View style={[styles.recommendationBullet, { backgroundColor: theme.colors.warning }]} />
                        <Text style={[styles.recommendationText, { color: theme.colors.textSecondary }]}>
                          This activity has neutral impact - continue monitoring patterns
                        </Text>
                      </View>
                    )}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  chartSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  donutChartContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  donutCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterNumber: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  donutCenterLabel: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
    marginTop: 2,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    gap: 16,
  },
  statItem: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  insightsContainer: {
    gap: 8,
    marginBottom: 20,
  },
  insightItem: {
    padding: 12,
    borderRadius: 12,
  },
  insightText: {
    fontSize: 13,
    lineHeight: 18,
  },
  activitiesContainer: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activityFrequency: {
    fontSize: 12,
    fontWeight: '500',
  },
  impactIndicators: {
    flexDirection: 'row',
    gap: 4,
  },
  impactDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activityImpact: {
    marginLeft: 12,
  },
  impactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  trendIcon: {
    fontSize: 14,
    fontWeight: '700',
  },
  impactLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalEmoji: {
    fontSize: 28,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
  },
  modalBody: {
    padding: 20,
  },
  scoreSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 4,
  },
  scoreDescription: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    alignItems: 'center',
  },
  statBoxLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  statBoxValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  statBoxSubtext: {
    fontSize: 11,
  },
  impactBreakdown: {
    marginBottom: 24,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  breakdownLabel: {
    fontSize: 13,
    width: 80,
  },
  breakdownBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '600',
    width: 50,
    textAlign: 'right',
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
