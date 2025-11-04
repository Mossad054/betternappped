import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, ScrollView } from 'react-native';
import { ChevronDown, ChevronUp, Brain, Target, BookOpen, TrendingUp, Zap, Heart, BarChart3 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { AnalyticsService } from '@/services/analytics.service';

interface InsightData {
  mentalClarity: {
    avgScore: number;
    trend: string;
    weeklyTests: number;
    change: number;
    topFactors: string[];
  };
  productivity: {
    avgRating: number;
    focusedHours: number;
    weeklyLogs: number;
    trend: string;
    change: number;
    topFactors: string[];
  };
  intimacy: {
    weeklyCount: number;
    avgMoodImprovement: number;
    soloVsCouple: { solo: number; couple: number };
    avgTimeToSleep: number;
    trend: string;
  };
  habits: {
    activeCount: number;
    avgCompletionRate: number;
    totalStreakDays: number;
    bestStreak: number;
    topCategory: string;
  };
  overall: {
    totalDataPoints: number;
    trackingConsistency: number;
    wellnessScore: number;
    topImprovement: string;
  };
}

export default function MoreInsights() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(false);
  const [insightsData, setInsightsData] = useState<InsightData | null>(null);

  useEffect(() => {
    if (user && isExpanded && !insightsData) {
      loadInsightsData();
    }
  }, [user, isExpanded]);

  const loadInsightsData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await AnalyticsService.getComprehensiveInsights(user.id);
      if (result.data) {
        setInsightsData(result.data);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    setIsExpanded(!isExpanded);
  };

  const maxHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1000],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const getTrendEmoji = (trend: string) => {
    if (trend === 'up') return '📈';
    if (trend === 'down') return '📉';
    return '➡️';
  };

  const getScoreColor = (score: number, max: number = 5) => {
    const percentage = (score / max) * 100;
    if (percentage >= 80) return '#10B981';
    if (percentage >= 60) return '#60A5FA';
    if (percentage >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <TouchableOpacity style={styles.header} onPress={toggleExpanded}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.colors.text }]}>More Insights</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Comprehensive wellness analytics
          </Text>
        </View>
        {isExpanded ? (
          <ChevronUp size={20} color={theme.colors.textSecondary} />
        ) : (
          <ChevronDown size={20} color={theme.colors.textSecondary} />
        )}
      </TouchableOpacity>

      <Animated.View style={[styles.content, { maxHeight, opacity }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#60A5FA" />
            <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
              Analyzing your data...
            </Text>
          </View>
        ) : insightsData ? (
          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {/* Mental Clarity Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Brain size={20} color="#A78BFA" />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Mental Clarity
                </Text>
              </View>
              <View style={[styles.sectionCard, { backgroundColor: theme.colors.background }]}>
                <View style={styles.metricRow}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: getScoreColor(insightsData.mentalClarity.avgScore) }]}>
                      {insightsData.mentalClarity.avgScore.toFixed(1)}
                    </Text>
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                      Avg Score
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                      {insightsData.mentalClarity.weeklyTests}
                    </Text>
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                      Tests
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                      {getTrendEmoji(insightsData.mentalClarity.trend)} {Math.abs(insightsData.mentalClarity.change).toFixed(0)}%
                    </Text>
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                      Change
                    </Text>
                  </View>
                </View>
                {insightsData.mentalClarity.topFactors.length > 0 && (
                  <View style={styles.factorsSection}>
                    <Text style={[styles.factorsLabel, { color: theme.colors.textSecondary }]}>
                      Top Factors:
                    </Text>
                    <View style={styles.factorsList}>
                      {insightsData.mentalClarity.topFactors.map((factor, i) => (
                        <View key={i} style={[styles.factorTag, { backgroundColor: theme.colors.card }]}>
                          <Text style={[styles.factorText, { color: theme.colors.text }]}>
                            {factor}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Productivity Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Zap size={20} color="#F59E0B" />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Productivity
                </Text>
              </View>
              <View style={[styles.sectionCard, { backgroundColor: theme.colors.background }]}>
                <View style={styles.metricRow}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: getScoreColor(insightsData.productivity.avgRating) }]}>
                      {insightsData.productivity.avgRating.toFixed(1)}
                    </Text>
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                      Avg Rating
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                      {insightsData.productivity.focusedHours.toFixed(1)}h
                    </Text>
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                      Focus Time
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                      {getTrendEmoji(insightsData.productivity.trend)} {Math.abs(insightsData.productivity.change).toFixed(0)}%
                    </Text>
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                      Change
                    </Text>
                  </View>
                </View>
                {insightsData.productivity.topFactors.length > 0 && (
                  <View style={styles.factorsSection}>
                    <Text style={[styles.factorsLabel, { color: theme.colors.textSecondary }]}>
                      Top Factors:
                    </Text>
                    <View style={styles.factorsList}>
                      {insightsData.productivity.topFactors.map((factor, i) => (
                        <View key={i} style={[styles.factorTag, { backgroundColor: theme.colors.card }]}>
                          <Text style={[styles.factorText, { color: theme.colors.text }]}>
                            {factor}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Intimacy Section */}
            {insightsData.intimacy.weeklyCount > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Heart size={20} color="#EF4444" />
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Intimacy & Wellness
                  </Text>
                </View>
                <View style={[styles.sectionCard, { backgroundColor: theme.colors.background }]}>
                  <View style={styles.metricRow}>
                    <View style={styles.metricItem}>
                      <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                        {insightsData.intimacy.weeklyCount}
                      </Text>
                      <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                        This Week
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={[styles.metricValue, { color: getScoreColor(insightsData.intimacy.avgMoodImprovement, 4) }]}>
                        +{insightsData.intimacy.avgMoodImprovement.toFixed(1)}
                      </Text>
                      <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                        Mood Boost
                      </Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                        {insightsData.intimacy.avgTimeToSleep}m
                      </Text>
                      <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                        Sleep Time
                      </Text>
                    </View>
                  </View>
                  <View style={styles.intimacyTypes}>
                    <View style={styles.intimacyBar}>
                      <View 
                        style={[
                          styles.intimacySegment,
                          { 
                            width: `${(insightsData.intimacy.soloVsCouple.solo / (insightsData.intimacy.soloVsCouple.solo + insightsData.intimacy.soloVsCouple.couple)) * 100}%`,
                            backgroundColor: '#A78BFA'
                          }
                        ]}
                      />
                      <View 
                        style={[
                          styles.intimacySegment,
                          { 
                            width: `${(insightsData.intimacy.soloVsCouple.couple / (insightsData.intimacy.soloVsCouple.solo + insightsData.intimacy.soloVsCouple.couple)) * 100}%`,
                            backgroundColor: '#EF4444'
                          }
                        ]}
                      />
                    </View>
                    <View style={styles.intimacyLegend}>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#A78BFA' }]} />
                        <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                          Solo ({insightsData.intimacy.soloVsCouple.solo})
                        </Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                        <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                          Couple ({insightsData.intimacy.soloVsCouple.couple})
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Habits Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Target size={20} color="#10B981" />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Habit Performance
                </Text>
              </View>
              <View style={[styles.sectionCard, { backgroundColor: theme.colors.background }]}>
                <View style={styles.metricRow}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                      {insightsData.habits.activeCount}
                    </Text>
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                      Active
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: getScoreColor(insightsData.habits.avgCompletionRate, 100) }]}>
                      {insightsData.habits.avgCompletionRate.toFixed(0)}%
                    </Text>
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                      Completion
                    </Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                      🔥 {insightsData.habits.bestStreak}
                    </Text>
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                      Best Streak
                    </Text>
                  </View>
                </View>
                {insightsData.habits.topCategory && (
                  <View style={styles.habitInsight}>
                    <Text style={[styles.habitInsightText, { color: theme.colors.textSecondary }]}>
                      🏆 Most consistent: {insightsData.habits.topCategory}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Overall Wellness Score */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <BarChart3 size={20} color="#60A5FA" />
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Overall Wellness
                </Text>
              </View>
              <View style={[styles.sectionCard, { backgroundColor: theme.colors.background }]}>
                <View style={styles.wellnessScoreContainer}>
                  <View style={styles.wellnessScoreCircle}>
                    <Text style={[styles.wellnessScoreValue, { color: getScoreColor(insightsData.overall.wellnessScore, 100) }]}>
                      {insightsData.overall.wellnessScore}
                    </Text>
                    <Text style={[styles.wellnessScoreLabel, { color: theme.colors.textSecondary }]}>
                      /100
                    </Text>
                  </View>
                </View>
                <View style={styles.overallMetrics}>
                  <View style={styles.overallMetricItem}>
                    <Text style={[styles.overallMetricLabel, { color: theme.colors.textSecondary }]}>
                      Data Points
                    </Text>
                    <Text style={[styles.overallMetricValue, { color: theme.colors.text }]}>
                      {insightsData.overall.totalDataPoints}
                    </Text>
                  </View>
                  <View style={styles.overallMetricItem}>
                    <Text style={[styles.overallMetricLabel, { color: theme.colors.textSecondary }]}>
                      Consistency
                    </Text>
                    <Text style={[styles.overallMetricValue, { color: theme.colors.text }]}>
                      {insightsData.overall.trackingConsistency}%
                    </Text>
                  </View>
                </View>
                {insightsData.overall.topImprovement && (
                  <View style={styles.improvementBadge}>
                    <Text style={[styles.improvementText, { color: theme.colors.text }]}>
                      🌟 Top Improvement: {insightsData.overall.topImprovement}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Weekly Highlights */}
            <View style={styles.highlightsSection}>
              <Text style={[styles.highlightsTitle, { color: theme.colors.text }]}>
                📊 Weekly Highlights
              </Text>
              <View style={styles.highlightsList}>
                {insightsData.mentalClarity.avgScore >= 4 && (
                  <View style={styles.highlightItem}>
                    <Text style={styles.highlightEmoji}>🧠</Text>
                    <Text style={[styles.highlightText, { color: theme.colors.textSecondary }]}>
                      Strong mental clarity this week (avg {insightsData.mentalClarity.avgScore.toFixed(1)}/5)
                    </Text>
                  </View>
                )}
                {insightsData.productivity.avgRating >= 4 && (
                  <View style={styles.highlightItem}>
                    <Text style={styles.highlightEmoji}>⚡</Text>
                    <Text style={[styles.highlightText, { color: theme.colors.textSecondary }]}>
                      Highly productive week with {insightsData.productivity.focusedHours.toFixed(1)}h focus time
                    </Text>
                  </View>
                )}
                {insightsData.habits.avgCompletionRate >= 80 && (
                  <View style={styles.highlightItem}>
                    <Text style={styles.highlightEmoji}>🎯</Text>
                    <Text style={[styles.highlightText, { color: theme.colors.textSecondary }]}>
                      Excellent habit consistency at {insightsData.habits.avgCompletionRate.toFixed(0)}%
                    </Text>
                  </View>
                )}
                {insightsData.overall.wellnessScore >= 80 && (
                  <View style={styles.highlightItem}>
                    <Text style={styles.highlightEmoji}>✨</Text>
                    <Text style={[styles.highlightText, { color: theme.colors.textSecondary }]}>
                      Outstanding overall wellness score of {insightsData.overall.wellnessScore}/100
                    </Text>
                  </View>
                )}
                {insightsData.overall.totalDataPoints < 10 && (
                  <View style={styles.highlightItem}>
                    <Text style={styles.highlightEmoji}>💡</Text>
                    <Text style={[styles.highlightText, { color: theme.colors.textSecondary }]}>
                      Track more metrics to unlock deeper insights
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Start tracking to see comprehensive insights
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
  },
  content: {
    overflow: 'hidden',
  },
  scrollContent: {
    maxHeight: 900,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  sectionCard: {
    borderRadius: 12,
    padding: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  factorsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  factorsLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  factorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  factorTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  factorText: {
    fontSize: 11,
    fontWeight: '500',
  },
  intimacyTypes: {
    marginTop: 12,
  },
  intimacyBar: {
    height: 8,
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 8,
  },
  intimacySegment: {
    height: '100%',
  },
  intimacyLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '500',
  },
  habitInsight: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  habitInsightText: {
    fontSize: 12,
    fontWeight: '500',
  },
  wellnessScoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  wellnessScoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wellnessScoreValue: {
    fontSize: 36,
    fontWeight: '700',
  },
  wellnessScoreLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  overallMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  overallMetricItem: {
    alignItems: 'center',
  },
  overallMetricLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  overallMetricValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  improvementBadge: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  improvementText: {
    fontSize: 12,
    fontWeight: '600',
  },
  highlightsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  highlightsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  highlightsList: {
    gap: 12,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightEmoji: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  highlightText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});