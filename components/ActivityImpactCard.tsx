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
import { ActivityImpactService, EnhancedActivityImpact } from '@/services/analytics/activityImpact.service';
import Svg, { Circle } from 'react-native-svg';

interface ActivityImpactCardProps {
  userId: string;
  period: 'today' | 'week' | 'month' | 'year';
}

export default function ActivityImpactCard({ userId, period }: ActivityImpactCardProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<EnhancedActivityImpact[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState<EnhancedActivityImpact | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    loadActivityImpact();
  }, [userId, period]);

  const loadActivityImpact = async () => {
    setLoading(true);
    try {
      console.log('🎯 Loading enhanced activity impact analysis...');
      
      // Map period to ActivityImpactService format
      const periodMap: Record<typeof period, 'week' | 'month' | 'quarter'> = {
        'today': 'week',
        'week': 'week',
        'month': 'month',
        'year': 'quarter'
      };
      
      const result = await ActivityImpactService.analyzeActivities(
        userId, 
        periodMap[period]
      );
      
      if (result) {
        setActivities(result.activities);
        setInsights(result.insights);
        setTotalActivities(result.totalActivities);
        
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.error('❌ Error loading activity impact:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImpactColor = (score: number) => {
    if (score >= 70) return theme.colors.success || '#10B981';
    if (score >= 50) return theme.colors.warning || '#F59E0B';
    return theme.colors.error || '#EF4444';
  };

  const getImpactLabel = (score: number) => {
    if (score >= 70) return 'Positive';
    if (score >= 50) return 'Neutral';
    return 'Negative';
  };

  const getConfidenceBadgeColor = (confidence: 'high' | 'medium' | 'low') => {
    if (confidence === 'high') return theme.colors.success || '#10B981';
    if (confidence === 'medium') return theme.colors.warning || '#F59E0B';
    return theme.colors.textSecondary || '#9CA3AF';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'flat') => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  // Tooltip explanations for each parameter
  const tooltipTexts: Record<string, string> = {
    'overall-benefit': 'A composite score (0-100) combining mood, sleep, clarity, and productivity impacts. Higher scores mean greater overall benefit to your wellbeing.',
    'frequency': 'How many times you\'ve logged this activity and what percentage it represents of all your activities.',
    'confidence': 'Based on data points: LOW (1-4 logs), MEDIUM (5-7), HIGH (8+). More data = more reliable insights.',
    'multi-dimensional': 'Shows how this activity affects different aspects of your wellbeing: immediate (same day), next day, and sustained (7-day average).',
    'immediate': 'The change in this metric on the same day you do the activity, measured in points.',
    'next-day': 'The change in this metric the day after doing the activity, measured in points.',
    'cumulative': 'The sustained average change over 7 days after doing the activity, measured in points.',
    'correlation': 'Statistical measure (r) of how consistently this activity relates to each metric. Range: -1 (strong negative) to +1 (strong positive). Values near 0 mean no consistent relationship.',
  };

  // Minimalist Help Icon with Tooltip
  const HelpIcon = ({ tooltipId }: { tooltipId: string }) => (
    <TouchableOpacity
      onPress={() => setActiveTooltip(activeTooltip === tooltipId ? null : tooltipId)}
      style={styles.helpIconButton}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={[styles.helpIconCircle, { borderColor: theme.colors.textSecondary }]}>
        <Text style={[styles.helpIconText, { color: theme.colors.textSecondary }]}>?</Text>
      </View>
    </TouchableOpacity>
  );

  // Tooltip Overlay Component
  const Tooltip = ({ tooltipId }: { tooltipId: string }) => {
    if (activeTooltip !== tooltipId) return null;

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setActiveTooltip(null)}
        style={styles.tooltipOverlay}
      >
        <View style={[styles.tooltipBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.tooltipText, { color: theme.colors.text }]}>
            {tooltipTexts[tooltipId]}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDonutChart = () => {
    if (activities.length === 0) return null;

    const radius = 70;
    const strokeWidth = 18;
    const center = 90;
    const circumference = 2 * Math.PI * radius;

    const topActivities = activities.slice(0, 5);
    const total = topActivities.reduce((sum, a) => sum + a.occurrences, 0);

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
            const percentage = activity.occurrences / total;
            const strokeDasharray = `${circumference * percentage} ${circumference}`;
            // Color-code based on impact score
            const color = getImpactColor(activity.overallBenefit);
            
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

  const handleActivityPress = (activity: EnhancedActivityImpact) => {
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
              {activities.filter(a => a.overallBenefit >= 70).length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.success }]}>
              Positive
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {activities.filter(a => a.overallBenefit >= 50 && a.overallBenefit < 70).length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.warning }]}>
              Neutral
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {activities.filter(a => a.overallBenefit < 50).length}
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
          const impactColor = getImpactColor(activity.overallBenefit);
          const impactLabel = getImpactLabel(activity.overallBenefit);
          const confidenceColor = getConfidenceBadgeColor(activity.confidence);
          
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
                  <View style={styles.activityHeader}>
                    <Text style={[styles.activityName, { color: theme.colors.text }]}>
                      {activity.activityName}
                    </Text>
                    <View style={[styles.confidenceBadge, { backgroundColor: confidenceColor + '20' }]}>
                      <Text style={[styles.confidenceText, { color: confidenceColor }]}>
                        {activity.confidence}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.activityMeta}>
                    <Text style={[styles.activityFrequency, { color: theme.colors.textSecondary }]}>
                      {activity.occurrences}x • {activity.frequencyPercent}%
                    </Text>
                    {activity.trend !== 'stable' && (
                      <View style={[styles.trendBadge, { 
                        backgroundColor: activity.trend === 'improving' 
                          ? theme.colors.success + '20' 
                          : theme.colors.error + '20'
                      }]}>
                        <Text style={[styles.trendText, { 
                          color: activity.trend === 'improving' 
                            ? theme.colors.success 
                            : theme.colors.error
                        }]}>
                          {activity.trend === 'improving' ? '↑' : '↓'} {activity.trend}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.activityImpact}>
                <View style={[styles.impactBadge, { backgroundColor: impactColor + '20' }]}>
                  <Text style={[styles.impactScore, { color: impactColor }]}>
                    {activity.overallBenefit}
                  </Text>
                </View>
                <Text style={[styles.impactLabel, { color: theme.colors.textSecondary }]}>
                  /100
                </Text>
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
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
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
                    <View style={styles.sectionHeaderWithHelp}>
                      <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>
                        Overall Benefit Score
                      </Text>
                      <HelpIcon tooltipId="overall-benefit" />
                    </View>
                    <Tooltip tooltipId="overall-benefit" />
                    <Text style={[styles.scoreValue, { color: getImpactColor(selectedActivity.overallBenefit) }]}>
                      {selectedActivity.overallBenefit}/100
                    </Text>
                    <Text style={[styles.scoreDescription, { color: theme.colors.textSecondary }]}>
                      {selectedActivity.recommendation}
                    </Text>
                  </View>

                  {/* Stats Grid */}
                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <View style={styles.statBoxHeader}>
                        <Text style={[styles.statBoxLabel, { color: theme.colors.textSecondary }]}>
                          Frequency
                        </Text>
                        <HelpIcon tooltipId="frequency" />
                      </View>
                      <Tooltip tooltipId="frequency" />
                      <Text style={[styles.statBoxValue, { color: theme.colors.text }]}>
                        {selectedActivity.occurrences}
                      </Text>
                      <Text style={[styles.statBoxSubtext, { color: theme.colors.textSecondary }]}>
                        {selectedActivity.frequencyPercent}% of total
                      </Text>
                    </View>
                    <View style={styles.statBox}>
                      <View style={styles.statBoxHeader}>
                        <Text style={[styles.statBoxLabel, { color: theme.colors.textSecondary }]}>
                          Confidence
                        </Text>
                        <HelpIcon tooltipId="confidence" />
                      </View>
                      <Tooltip tooltipId="confidence" />
                      <Text style={[styles.statBoxValue, { color: getConfidenceBadgeColor(selectedActivity.confidence) }]}>
                        {selectedActivity.confidence}
                      </Text>
                      <Text style={[styles.statBoxSubtext, { color: theme.colors.textSecondary }]}>
                        {selectedActivity.trend}
                      </Text>
                    </View>
                  </View>

                  {/* Multi-Dimensional Impact Breakdown */}
                  <View style={styles.impactBreakdown}>
                    <View style={styles.sectionHeaderWithHelp}>
                      <Text style={[styles.breakdownTitle, { color: theme.colors.text }]}>
                        Multi-Dimensional Impact
                      </Text>
                      <HelpIcon tooltipId="multi-dimensional" />
                    </View>
                    <Tooltip tooltipId="multi-dimensional" />
                    
                    {/* Mood Impact */}
                    <View style={styles.dimensionSection}>
                      <Text style={[styles.dimensionTitle, { color: theme.colors.text }]}>
                        😊 Mood Impact
                      </Text>
                      
                      <View style={styles.breakdownItem}>
                        <Text style={[styles.breakdownLabel, { color: theme.colors.textSecondary }]}>
                          Immediate
                        </Text>
                        <View style={styles.breakdownBar}>
                          <View 
                            style={[
                              styles.breakdownFill, 
                              { 
                                width: `${Math.abs(selectedActivity.impacts.mood.immediate) * 100}%`,
                                backgroundColor: selectedActivity.impacts.mood.immediate >= 0 
                                  ? theme.colors.success 
                                  : theme.colors.error
                              }
                            ]} 
                          />
                        </View>
                        <Text style={[
                          styles.breakdownValue,
                          { color: selectedActivity.impacts.mood.immediate >= 0 ? theme.colors.success : theme.colors.error }
                        ]}>
                          {selectedActivity.impacts.mood.immediate > 0 ? '+' : ''}{(selectedActivity.impacts.mood.immediate * 100).toFixed(0)}%
                        </Text>
                      </View>

                      <View style={styles.breakdownItem}>
                        <Text style={[styles.breakdownLabel, { color: theme.colors.textSecondary }]}>
                          Next Day
                        </Text>
                        <View style={styles.breakdownBar}>
                          <View 
                            style={[
                              styles.breakdownFill, 
                              { 
                                width: `${Math.abs(selectedActivity.impacts.mood.nextDay) * 100}%`,
                                backgroundColor: selectedActivity.impacts.mood.nextDay >= 0 
                                  ? theme.colors.success 
                                  : theme.colors.error
                              }
                            ]} 
                          />
                        </View>
                        <Text style={[
                          styles.breakdownValue,
                          { color: selectedActivity.impacts.mood.nextDay >= 0 ? theme.colors.success : theme.colors.error }
                        ]}>
                          {selectedActivity.impacts.mood.nextDay > 0 ? '+' : ''}{(selectedActivity.impacts.mood.nextDay * 100).toFixed(0)}%
                        </Text>
                      </View>

                      <View style={styles.breakdownItem}>
                        <Text style={[styles.breakdownLabel, { color: theme.colors.textSecondary }]}>
                          Cumulative
                        </Text>
                        <View style={styles.breakdownBar}>
                          <View 
                            style={[
                              styles.breakdownFill, 
                              { 
                                width: `${Math.abs(selectedActivity.impacts.mood.cumulative) * 100}%`,
                                backgroundColor: selectedActivity.impacts.mood.cumulative >= 0 
                                  ? theme.colors.success 
                                  : theme.colors.error
                              }
                            ]} 
                          />
                        </View>
                        <Text style={[
                          styles.breakdownValue,
                          { color: selectedActivity.impacts.mood.cumulative >= 0 ? theme.colors.success : theme.colors.error }
                        ]}>
                          {selectedActivity.impacts.mood.cumulative > 0 ? '+' : ''}{(selectedActivity.impacts.mood.cumulative * 100).toFixed(0)}%
                        </Text>
                      </View>
                    </View>

                    {/* Sleep Impact */}
                    <View style={styles.dimensionSection}>
                      <Text style={[styles.dimensionTitle, { color: theme.colors.text }]}>
                        😴 Sleep Impact
                      </Text>
                      
                      <View style={styles.breakdownItem}>
                        <Text style={[styles.breakdownLabel, { color: theme.colors.textSecondary }]}>
                          Immediate
                        </Text>
                        <View style={styles.breakdownBar}>
                          <View 
                            style={[
                              styles.breakdownFill, 
                              { 
                                width: `${Math.abs(selectedActivity.impacts.sleep.immediate) * 100}%`,
                                backgroundColor: selectedActivity.impacts.sleep.immediate >= 0 
                                  ? theme.colors.success 
                                  : theme.colors.error
                              }
                            ]} 
                          />
                        </View>
                        <Text style={[
                          styles.breakdownValue,
                          { color: selectedActivity.impacts.sleep.immediate >= 0 ? theme.colors.success : theme.colors.error }
                        ]}>
                          {selectedActivity.impacts.sleep.immediate > 0 ? '+' : ''}{(selectedActivity.impacts.sleep.immediate * 100).toFixed(0)}%
                        </Text>
                      </View>

                      <View style={styles.breakdownItem}>
                        <Text style={[styles.breakdownLabel, { color: theme.colors.textSecondary }]}>
                          Next Day
                        </Text>
                        <View style={styles.breakdownBar}>
                          <View 
                            style={[
                              styles.breakdownFill, 
                              { 
                                width: `${Math.abs(selectedActivity.impacts.sleep.nextDay) * 100}%`,
                                backgroundColor: selectedActivity.impacts.sleep.nextDay >= 0 
                                  ? theme.colors.success 
                                  : theme.colors.error
                              }
                            ]} 
                          />
                        </View>
                        <Text style={[
                          styles.breakdownValue,
                          { color: selectedActivity.impacts.sleep.nextDay >= 0 ? theme.colors.success : theme.colors.error }
                        ]}>
                          {selectedActivity.impacts.sleep.nextDay > 0 ? '+' : ''}{(selectedActivity.impacts.sleep.nextDay * 100).toFixed(0)}%
                        </Text>
                      </View>
                    </View>

                    {/* Clarity & Productivity Quick View */}
                    <View style={styles.quickMetricsRow}>
                      <View style={styles.quickMetric}>
                        <Text style={[styles.quickMetricLabel, { color: theme.colors.textSecondary }]}>
                          🧠 Clarity
                        </Text>
                        <Text style={[styles.quickMetricValue, { 
                          color: selectedActivity.impacts.clarity.immediate >= 0 
                            ? theme.colors.success 
                            : theme.colors.error 
                        }]}>
                          {selectedActivity.impacts.clarity.immediate > 0 ? '+' : ''}{(selectedActivity.impacts.clarity.immediate * 100).toFixed(0)}%
                        </Text>
                      </View>
                      <View style={styles.quickMetric}>
                        <Text style={[styles.quickMetricLabel, { color: theme.colors.textSecondary }]}>
                          ⚡ Productivity
                        </Text>
                        <Text style={[styles.quickMetricValue, { 
                          color: selectedActivity.impacts.productivity.immediate >= 0 
                            ? theme.colors.success 
                            : theme.colors.error 
                        }]}>
                          {selectedActivity.impacts.productivity.immediate > 0 ? '+' : ''}{(selectedActivity.impacts.productivity.immediate * 100).toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Correlation Data */}
                  <View style={styles.correlationSection}>
                    <View style={styles.sectionHeaderWithHelp}>
                      <Text style={[styles.breakdownTitle, { color: theme.colors.text }]}>
                        Statistical Correlations
                      </Text>
                      <HelpIcon tooltipId="correlation" />
                    </View>
                    <Tooltip tooltipId="correlation" />
                    <View style={styles.correlationGrid}>
                      <View style={styles.correlationItem}>
                        <Text style={[styles.correlationLabel, { color: theme.colors.textSecondary }]}>
                          Mood
                        </Text>
                        <Text style={[styles.correlationValue, { color: theme.colors.text }]}>
                          r = {selectedActivity.correlations.mood.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.correlationItem}>
                        <Text style={[styles.correlationLabel, { color: theme.colors.textSecondary }]}>
                          Sleep
                        </Text>
                        <Text style={[styles.correlationValue, { color: theme.colors.text }]}>
                          r = {selectedActivity.correlations.sleep.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.correlationItem}>
                        <Text style={[styles.correlationLabel, { color: theme.colors.textSecondary }]}>
                          Clarity
                        </Text>
                        <Text style={[styles.correlationValue, { color: theme.colors.text }]}>
                          r = {selectedActivity.correlations.clarity.toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.correlationItem}>
                        <Text style={[styles.correlationLabel, { color: theme.colors.textSecondary }]}>
                          Productivity
                        </Text>
                        <Text style={[styles.correlationValue, { color: theme.colors.text }]}>
                          r = {selectedActivity.correlations.productivity.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.correlationNote, { color: theme.colors.textSecondary }]}>
                      Correlation coefficient (r) ranges from -1 (negative) to +1 (positive)
                    </Text>
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
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  activityName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 8,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
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
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  trendText: {
    fontSize: 10,
    fontWeight: '600',
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
    alignItems: 'center',
    gap: 4,
  },
  impactBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  impactScore: {
    fontSize: 20,
    fontWeight: '700',
  },
  impactLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  trendIcon: {
    fontSize: 14,
    fontWeight: '700',
  },
  dimensionSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
  },
  dimensionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  quickMetricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  quickMetric: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
    alignItems: 'center',
  },
  quickMetricLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  quickMetricValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  correlationSection: {
    marginBottom: 20,
  },
  correlationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  correlationItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(128, 128, 128, 0.05)',
  },
  correlationLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  correlationValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  correlationNote: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 8,
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
    backgroundColor: 'transparent', // Will be set dynamically in render
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
  // Help Icon & Tooltip Styles
  sectionHeaderWithHelp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 4,
  },
  helpIconButton: {
    padding: 2,
  },
  helpIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpIconText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tooltipOverlay: {
    position: 'absolute',
    top: 25,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  tooltipBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  tooltipText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
