import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { PatternsService, Pattern } from '@/services/analytics/patterns.service';
import { ActivityImpactService, EnhancedActivityImpact } from '@/services/analytics/activityImpact.service';
import { router } from 'expo-router';

interface ImpactAnalysisProps {
  userId: string;
  timeRange: 'today' | 'week' | 'month' | 'year';
}

export default function ImpactAnalysis({ userId, timeRange }: ImpactAnalysisProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [patterns, setPatterns] = useState<{
    routines: Pattern[];
    cyclical: Pattern[];
    warnings: Pattern[];
  } | null>(null);
  const [topActivities, setTopActivities] = useState<EnhancedActivityImpact[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<Pattern | null>(null);
  const [activeTab, setActiveTab] = useState<'patterns' | 'activities'>('activities'); // Default to activities tab

  useEffect(() => {
    loadImpactData();
  }, [userId, timeRange]);

  const loadImpactData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading patterns and activity impacts...');
      
      // Map timeRange to days for pattern detection
      const daysMap = { today: 7, week: 14, month: 30, year: 90 };
      const days = daysMap[timeRange];
      
      // Load patterns (flat array) and top activities in parallel
      const [patternsFlat, activitiesResult] = await Promise.all([
        PatternsService.detectPatterns(userId, days),
        ActivityImpactService.analyzeActivities(userId, timeRange === 'year' ? 'quarter' : timeRange === 'today' ? 'week' : timeRange as any)
      ]);

      // Categorize patterns returned as a flat list into routines/cyclical/warnings
      const categorized = {
        routines: [] as Pattern[],
        cyclical: [] as Pattern[],
        warnings: [] as Pattern[],
      };

      (patternsFlat || []).forEach(p => {
        if (p.type === 'routine') categorized.routines.push(p);
        else if (p.type === 'cyclical') categorized.cyclical.push(p);
        else if (p.type === 'warning') categorized.warnings.push(p);
        else {
          // Put other types into cyclical as a sensible default
          categorized.cyclical.push(p);
        }
      });

      setPatterns(categorized);
      setTopActivities(activitiesResult.activities.slice(0, 10)); // Top 10 activities (increased from 3)
      setInsights(activitiesResult.insights || []);

      console.log('✅ Loaded:', categorized.routines.length, 'routines,', 
                  categorized.warnings.length, 'warnings,', 
                  categorized.cyclical.length, 'cyclical patterns');
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

  if (!patterns || (patterns.routines.length === 0 && patterns.warnings.length === 0 && patterns.cyclical.length === 0 && topActivities.length === 0)) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Activity Impact Analysis</Text>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          {insights[0] || `No activities tracked for this ${timeRange}. Keep logging your activities, mood, and sleep to discover patterns!`}
        </Text>
      </View>
    );
  }

  const getPatternTypeIcon = (type: string) => {
    if (type === 'routine') return '✨';
    if (type === 'cyclical') return '📅';
    if (type === 'warning') return '⚠️';
    return '💡';
  };

  const getPatternTypeColor = (type: string) => {
    if (type === 'routine') return theme.colors.success;
    if (type === 'cyclical') return theme.colors.primary;
    if (type === 'warning') return theme.colors.error;
    return theme.colors.textSecondary;
  };

  const getSeverityColor = (severity?: string) => {
    if (severity === 'high') return theme.colors.error;
    if (severity === 'medium') return theme.colors.warning;
    return theme.colors.textSecondary;
  };

  const renderModal = () => {
    if (!selectedPattern) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
          <ScrollView style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {getPatternTypeIcon(selectedPattern.type)} {selectedPattern.name}
              </Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Text style={[styles.closeX, { color: theme.colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Type Badge */}
            <View style={[styles.typeBadge, { backgroundColor: getPatternTypeColor(selectedPattern.type) + '20' }]}>
              <Text style={[styles.typeBadgeText, { color: getPatternTypeColor(selectedPattern.type) }]}>
                {selectedPattern.type.toUpperCase()}
              </Text>
            </View>

            {/* Description */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                What We Found
              </Text>
              <Text style={[styles.descriptionText, { color: theme.colors.text }]}>
                {selectedPattern.description}
              </Text>
            </View>

            {/* Confidence & Occurrences */}
            <View style={styles.modalSection}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Confidence</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {typeof selectedPattern.confidence === 'number'
                      ? `${Math.round(selectedPattern.confidence * 100)}%`
                      : String(selectedPattern.confidence)}
                  </Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Occurrences</Text>
                  <Text style={[styles.infoValue, { color: theme.colors.text }]}>
                    {selectedPattern.frequency}x
                  </Text>
                </View>
                {selectedPattern.severity && (
                  <View style={styles.infoItem}>
                    <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>Severity</Text>
                    <Text style={[styles.infoValue, { color: getSeverityColor(selectedPattern.severity) }]}>
                      {selectedPattern.severity.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Evidence */}
            {selectedPattern.evidence && selectedPattern.evidence.length > 0 && (
              <View style={styles.modalSection}>
                <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                  Evidence
                </Text>
                {selectedPattern.evidence.map((item: any, idx: number) => (
                  <View key={idx} style={[styles.evidenceItem, { backgroundColor: theme.colors.border + '10', padding: 8, borderRadius: 8 }]}>
                    <Text style={[styles.evidenceText, { color: theme.colors.text }]}>
                      • {item.date || item.context || item.metric} — {item.metric}: {typeof item.value === 'number' ? item.value : String(item.value)}{item.context ? ` (${item.context})` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recommendation */}
            <View style={styles.modalSection}>
              <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                Recommendation
              </Text>
              <View style={[styles.recommendationBox, { 
                backgroundColor: getPatternTypeColor(selectedPattern.type) + '10',
                borderColor: getPatternTypeColor(selectedPattern.type) + '30'
              }]}>
                <Text style={[styles.recommendationText, { color: theme.colors.text }]}>
                  {selectedPattern.recommendation}
                </Text>
              </View>
            </View>

            {/* For routines, show the activities */}
            {selectedPattern.type === 'routine' && (selectedPattern as any).activities && (
              <View style={[styles.modalSection, { marginBottom: 20 }]}>
                <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                  Activities in This Routine
                </Text>
                <View style={styles.activityChain}>
                  {(selectedPattern as any).activities.map((activity: string, idx: number) => (
                    <React.Fragment key={idx}>
                      <View style={[styles.activityChainItem, { backgroundColor: theme.colors.primary + '20' }]}>
                        <Text style={[styles.activityChainText, { color: theme.colors.text }]}>
                          {activity}
                        </Text>
                      </View>
                      {idx < (selectedPattern as any).activities.length - 1 && (
                        <Text style={[styles.chainArrow, { color: theme.colors.textSecondary }]}>→</Text>
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </View>
            )}
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
          <Text style={[styles.title, { color: theme.colors.text }]}>Activity Impact Analysis</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'This Year'} • {topActivities.length} Activities Ranked
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'patterns' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('patterns')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'patterns' ? theme.colors.primary : theme.colors.textSecondary }]}>
            Patterns ({(patterns?.routines.length || 0) + (patterns?.cyclical.length || 0) + (patterns?.warnings.length || 0)})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activities' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('activities')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'activities' ? theme.colors.primary : theme.colors.textSecondary }]}>
            Top Activities ({topActivities.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Insights */}
      {insights.length > 0 && (
        <View style={[styles.insightsBox, { backgroundColor: theme.colors.primary + '10', borderColor: theme.colors.primary + '30' }]}>
          {insights.slice(0, 2).map((insight, idx) => (
            <Text key={idx} style={[styles.insightText, { color: theme.colors.text }]}>
              • {insight}
            </Text>
          ))}
        </View>
      )}

      {/* Content based on active tab */}
      {activeTab === 'patterns' && patterns && (
        <View style={styles.patternsContainer}>
          {/* Warnings (Priority) */}
          {patterns.warnings.length > 0 && (
            <View style={styles.patternSection}>
              <Text style={[styles.patternSectionTitle, { color: theme.colors.error }]}>
                ⚠️ Warnings
              </Text>
              {patterns.warnings.slice(0, 2).map((pattern, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.patternCard, { backgroundColor: theme.colors.error + '10', borderLeftColor: theme.colors.error }]}
                  onPress={() => {
                    setSelectedPattern(pattern);
                    setIsModalVisible(true);
                  }}
                >
                  <View style={styles.patternCardHeader}>
                    <Text style={[styles.patternTitle, { color: theme.colors.text }]}>
                      {getPatternTypeIcon(pattern.type)} {pattern.name}
                    </Text>
                    {pattern.severity && (
                      <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(pattern.severity) + '20' }]}>
                        <Text style={[styles.severityText, { color: getSeverityColor(pattern.severity) }]}>
                          {pattern.severity}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.patternDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {pattern.description}
                  </Text>
                  <Text style={[styles.patternRecommendation, { color: theme.colors.text }]}>
                    💡 {pattern.recommendation}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Routines */}
          {patterns.routines.length > 0 && (
            <View style={styles.patternSection}>
              <Text style={[styles.patternSectionTitle, { color: theme.colors.success }]}>
                ✨ Successful Routines
              </Text>
              {patterns.routines.slice(0, 3).map((pattern, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.patternCard, { backgroundColor: theme.colors.success + '10', borderLeftColor: theme.colors.success }]}
                  onPress={() => {
                    setSelectedPattern(pattern);
                    setIsModalVisible(true);
                  }}
                >
                  <View style={styles.patternCardHeader}>
                    <Text style={[styles.patternTitle, { color: theme.colors.text }]}>
                      {getPatternTypeIcon(pattern.type)} {pattern.name}
                    </Text>
                    <View style={[styles.confidenceBadge, { backgroundColor: theme.colors.success + '20' }]}>
                      <Text style={[styles.confidenceText, { color: theme.colors.success }]}>
                        {typeof pattern.confidence === 'number' ? `${Math.round(pattern.confidence * 100)}%` : String(pattern.confidence)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.patternDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {pattern.description}
                  </Text>
                  <Text style={[styles.patternMeta, { color: theme.colors.textSecondary }]}>
                    {pattern.frequency}x occurrences
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Cyclical Patterns */}
          {patterns.cyclical.length > 0 && (
            <View style={styles.patternSection}>
              <Text style={[styles.patternSectionTitle, { color: theme.colors.primary }]}>
                📅 Day-of-Week Patterns
              </Text>
              {patterns.cyclical.slice(0, 2).map((pattern, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.patternCard, { backgroundColor: theme.colors.primary + '10', borderLeftColor: theme.colors.primary }]}
                  onPress={() => {
                    setSelectedPattern(pattern);
                    setIsModalVisible(true);
                  }}
                >
                  <View style={styles.patternCardHeader}>
                    <Text style={[styles.patternTitle, { color: theme.colors.text }]}>
                      {getPatternTypeIcon(pattern.type)} {pattern.name}
                    </Text>
                  </View>
                  <Text style={[styles.patternDescription, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {pattern.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Top Activities Tab */}
      {activeTab === 'activities' && (
        <View style={styles.activityList}>
          {topActivities.length === 0 ? (
            <View style={[styles.activityCard, { backgroundColor: theme.colors.border + '10', padding: 20 }]}>
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
                No activities with enough data yet. Keep tracking!
              </Text>
            </View>
          ) : (
            topActivities.map((activity, index) => (
              <View
                key={index}
                style={[styles.activityCard, {
                  backgroundColor: theme.colors.border + '30',
                  borderLeftWidth: 4,
                  borderLeftColor: activity.overallBenefit >= 70
                    ? theme.colors.success
                    : activity.overallBenefit >= 50
                    ? theme.colors.warning
                    : theme.colors.error
                }]}
              >
                <View style={styles.activityHeader}>
                  <View style={styles.activityTitleRow}>
                    {/* Rank badge */}
                    <View style={[styles.rankBadge, {
                      backgroundColor: index < 3
                        ? theme.colors.primary + '20'
                        : theme.colors.border + '30'
                    }]}>
                      <Text style={[styles.rankText, {
                        color: index < 3 ? theme.colors.primary : theme.colors.textSecondary,
                        fontWeight: index < 3 ? '700' : '600'
                      }]}>
                        #{index + 1}
                      </Text>
                    </View>
                    <Text style={[styles.activityEmoji]}>{activity.emoji}</Text>
                    <View style={styles.activityInfo}>
                      <Text style={[styles.activityName, { color: theme.colors.text }]}>
                        {activity.activityName}
                      </Text>
                      <Text style={[styles.activityFrequency, { color: theme.colors.textSecondary }]}>
                        {activity.occurrences}x • {activity.frequencyPercent}% of activities
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.benefitBadge, {
                    backgroundColor: activity.overallBenefit >= 70
                      ? theme.colors.success + '20'
                      : activity.overallBenefit >= 50
                      ? theme.colors.warning + '20'
                      : theme.colors.error + '20'
                  }]}>
                    <Text style={[styles.benefitScore, {
                      color: activity.overallBenefit >= 70
                        ? theme.colors.success
                        : activity.overallBenefit >= 50
                        ? theme.colors.warning
                        : theme.colors.error
                    }]}>
                      {activity.overallBenefit}
                    </Text>
                  </View>
                </View>

                {/* Impact breakdown */}
                <View style={styles.impactBreakdown}>
                  <View style={styles.impactItem}>
                    <Text style={[styles.impactLabel, { color: theme.colors.textSecondary }]}>Mood</Text>
                    <Text style={[styles.impactValue, { color: theme.colors.text }]}>
                      {activity.impacts.mood.immediate >= 0 ? '+' : ''}{(activity.impacts.mood.immediate * 100).toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.impactItem}>
                    <Text style={[styles.impactLabel, { color: theme.colors.textSecondary }]}>Sleep</Text>
                    <Text style={[styles.impactValue, { color: theme.colors.text }]}>
                      {activity.impacts.sleep.nextDay >= 0 ? '+' : ''}{(activity.impacts.sleep.nextDay * 100).toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.impactItem}>
                    <Text style={[styles.impactLabel, { color: theme.colors.textSecondary }]}>Clarity</Text>
                    <Text style={[styles.impactValue, { color: theme.colors.text }]}>
                      {activity.impacts.clarity.immediate >= 0 ? '+' : ''}{(activity.impacts.clarity.immediate * 100).toFixed(0)}%
                    </Text>
                  </View>
                  <View style={styles.impactItem}>
                    <Text style={[styles.impactLabel, { color: theme.colors.textSecondary }]}>Trend</Text>
                    <Text style={[styles.impactValue, {
                      color: activity.trend === 'improving'
                        ? theme.colors.success
                        : activity.trend === 'declining'
                        ? theme.colors.error
                        : theme.colors.textSecondary
                    }]}>
                      {activity.trend === 'improving' ? '↗️' : activity.trend === 'declining' ? '↘️' : '→'}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.activityRecommendation, { color: theme.colors.textSecondary }]}>
                  {activity.recommendation}
                </Text>
              </View>
            ))
          )}
        </View>
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
  
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
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
  
  // Patterns
  patternsContainer: {
    gap: 16,
  },
  patternSection: {
    marginBottom: 16,
  },
  patternSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  patternCard: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  patternCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patternTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  patternDescription: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  patternRecommendation: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  patternMeta: {
    fontSize: 12,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Activities
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
  activityRecommendation: {
    fontSize: 13,
    lineHeight: 18,
  },
  benefitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 48,
    alignItems: 'center',
  },
  benefitScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: '600',
  },
  impactBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  impactItem: {
    flex: 1,
    alignItems: 'center',
  },
  impactLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  impactValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Modal
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
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalSectionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  evidenceList: {
    marginBottom: 16,
  },
  evidenceItem: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
  evidenceText: {
    fontSize: 13,
    lineHeight: 20,
  },
  recommendationBox: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  recommendationText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  activityChain: {
    marginBottom: 16,
  },
  activityChainItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  activityChainText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chainActivity: {
    fontSize: 20,
    marginHorizontal: 4,
  },
  chainArrow: {
    fontSize: 16,
    marginHorizontal: 4,
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
  statsText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
