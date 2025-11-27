import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { SleepWellnessService, SleepDurationTrend, ConsistencySummary, WeekdayWeekendComparison, OptimalBedtime, PatternsAnalysis, SleepRecommendation } from '@/services/sleepWellness.service';
import { ArrowLeft, TrendingUp, Moon, Calendar, Clock, Lightbulb, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react-native';

/**
 * SleepTrendsPage
 *
 * Complete analytics dashboard with 6 cards:
 * 1. Sleep Duration Trend (30-day bar chart)
 * 2. Consistency % (circular progress)
 * 3. Weekday vs Weekend (comparison)
 * 4. Optimal Bedtime (time window)
 * 5. Detected Patterns (positive & negative)
 * 6. Personalized Recommendations
 */
export default function SleepTrendsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();

  // State for all 6 analytics
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [durationTrend, setDurationTrend] = useState<SleepDurationTrend[]>([]);
  const [consistency, setConsistency] = useState<ConsistencySummary | null>(null);
  const [weekdayWeekend, setWeekdayWeekend] = useState<WeekdayWeekendComparison | null>(null);
  const [optimalBedtime, setOptimalBedtime] = useState<OptimalBedtime | null>(null);
  const [patterns, setPatterns] = useState<PatternsAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<SleepRecommendation[]>([]);

  // Pattern expansion state
  const [expandedPatterns, setExpandedPatterns] = useState<{ [key: string]: boolean }>({
    positive: false,
    negative: false
  });

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Load all 6 analytics in parallel
      const [durationRes, consistencyRes, weekdayWeekendRes, optimalBedtimeRes, patternsRes, recsRes] = await Promise.all([
        SleepWellnessService.getSleepDurationTrend(user.id, 30),
        SleepWellnessService.getSleepConsistency(user.id, 30),
        SleepWellnessService.getWeekdayWeekendComparison(user.id, 30),
        SleepWellnessService.getOptimalBedtime(user.id, 30),
        SleepWellnessService.getDetectedPatterns(user.id, 30),
        SleepWellnessService.getRecommendations(user.id, 'week', 3)
      ]);

      // Set data
      if (durationRes.data) setDurationTrend(durationRes.data);
      if (consistencyRes.data) setConsistency(consistencyRes.data);
      if (weekdayWeekendRes.data) setWeekdayWeekend(weekdayWeekendRes.data);
      if (optimalBedtimeRes.data) setOptimalBedtime(optimalBedtimeRes.data);
      if (patternsRes.data) setPatterns(patternsRes.data);
      if (recsRes.data) setRecommendations(recsRes.data);

      // Check for any errors
      const errors = [durationRes.error, consistencyRes.error, weekdayWeekendRes.error, optimalBedtimeRes.error, patternsRes.error, recsRes.error].filter(Boolean);
      if (errors.length > 0) {
        console.warn('Some analytics failed to load:', errors);
      }

    } catch (err) {
      console.error('Error loading sleep trends:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trends');
    } finally {
      setLoading(false);
    }
  };

  const togglePattern = (type: 'positive' | 'negative') => {
    setExpandedPatterns(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const getConsistencyColor = (percent: number): string => {
    if (percent >= 80) return '#10B981'; // Green - Excellent
    if (percent >= 60) return '#F59E0B'; // Amber - Good
    return '#EF4444'; // Red - Needs improvement
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Sleep Trends</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading analytics...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Sleep Trends</Text>
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.colors.primary }]} onPress={loadAllData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const hasAnyData = durationTrend.length > 0 || consistency || weekdayWeekend || optimalBedtime || patterns || recommendations.length > 0;

  // No data state
  if (!hasAnyData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Sleep Trends</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Moon size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No Data Yet</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Track your sleep for at least 7 days to see trends and insights.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Sleep Trends</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Card 1: Sleep Duration Trend */}
        {durationTrend.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <TrendingUp size={24} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Sleep Duration Trend</Text>
            </View>
            <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
              Last 30 days
            </Text>

            {/* Simple Bar Chart */}
            <View style={styles.chartContainer}>
              <View style={styles.chart}>
                {/* Y-axis labels */}
                <View style={styles.yAxis}>
                  {[10, 8, 6, 4, 2, 0].map(val => (
                    <Text key={val} style={[styles.yAxisLabel, { color: theme.colors.textSecondary }]}>
                      {val}h
                    </Text>
                  ))}
                </View>

                {/* Bars */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.barsContainer}>
                  <View style={styles.barsWrapper}>
                    {/* Horizontal grid lines */}
                    <View style={styles.gridLines}>
                      {[0, 1, 2, 3, 4, 5].map(i => (
                        <View key={i} style={[styles.gridLine, { borderColor: theme.colors.border }]} />
                      ))}
                    </View>

                    {/* Bars */}
                    <View style={styles.bars}>
                      {durationTrend.map((day, index) => {
                        const barHeight = (day.hours / 10) * 200; // Max 10 hours = 200px
                        return (
                          <View key={day.date} style={styles.barColumn}>
                            <View style={styles.barWrapper}>
                              <View
                                style={[
                                  styles.bar,
                                  {
                                    height: barHeight,
                                    backgroundColor: theme.colors.primary
                                  }
                                ]}
                              />
                            </View>
                            {index % 5 === 0 && (
                              <Text style={[styles.xAxisLabel, { color: theme.colors.textSecondary }]}>
                                {new Date(day.date).getDate()}
                              </Text>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>
        )}

        {/* Card 2: Consistency % */}
        {consistency && (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <Calendar size={24} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Sleep Consistency</Text>
            </View>
            <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
              How regular is your bedtime?
            </Text>

            <View style={styles.consistencyContainer}>
              {/* Circular Progress */}
              <View style={styles.circularProgress}>
                <View
                  style={[
                    styles.circularProgressInner,
                    { borderColor: theme.colors.border }
                  ]}
                >
                  <Text style={[styles.consistencyPercent, { color: getConsistencyColor(consistency.consistency_percent) }]}>
                    {consistency.consistency_percent.toFixed(0)}%
                  </Text>
                  <Text style={[styles.consistencyLabel, { color: theme.colors.textSecondary }]}>
                    Consistent
                  </Text>
                </View>
              </View>

              {/* Message */}
              <Text style={[styles.consistencyMessage, { color: theme.colors.text }]}>
                {consistency.consistency_percent >= 80
                  ? 'Excellent! Your sleep schedule is very consistent.'
                  : consistency.consistency_percent >= 60
                  ? 'Good consistency. Try to go to bed at similar times.'
                  : 'Your bedtime varies significantly. More consistency could improve sleep quality.'}
              </Text>

              {/* Stats */}
              <View style={styles.consistencyStats}>
                <View style={styles.consistencyStat}>
                  <Text style={[styles.consistencyStatLabel, { color: theme.colors.textSecondary }]}>
                    Variance
                  </Text>
                  <Text style={[styles.consistencyStatValue, { color: theme.colors.text }]}>
                    ±{(consistency.avg_bedtime_variance_minutes / 60).toFixed(1)}h
                  </Text>
                </View>
                <View style={styles.consistencyStat}>
                  <Text style={[styles.consistencyStatLabel, { color: theme.colors.textSecondary }]}>
                    Days Analyzed
                  </Text>
                  <Text style={[styles.consistencyStatValue, { color: theme.colors.text }]}>
                    {consistency.days_analyzed}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Card 3: Weekday vs Weekend */}
        {weekdayWeekend && (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <Calendar size={24} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Weekday vs Weekend</Text>
            </View>
            <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
              {Math.abs(weekdayWeekend.difference) < 0.5
                ? 'Your sleep is consistent throughout the week.'
                : weekdayWeekend.difference > 0
                ? 'You sleep more on weekends than weekdays.'
                : 'You sleep less on weekends than weekdays.'}
            </Text>

            <View style={styles.comparisonContainer}>
              {/* Weekday */}
              <View style={styles.comparisonItem}>
                <Text style={[styles.comparisonLabel, { color: theme.colors.textSecondary }]}>
                  Weekdays
                </Text>
                <Text style={[styles.comparisonValue, { color: theme.colors.primary }]}>
                  {weekdayWeekend.weekday_avg.toFixed(1)}h
                </Text>
                <Text style={[styles.comparisonNights, { color: theme.colors.textSecondary }]}>
                  {weekdayWeekend.weekday_count} nights
                </Text>
              </View>

              {/* VS */}
              <View style={styles.comparisonVs}>
                <Text style={[styles.comparisonVsText, { color: theme.colors.textSecondary }]}>vs</Text>
              </View>

              {/* Weekend */}
              <View style={styles.comparisonItem}>
                <Text style={[styles.comparisonLabel, { color: theme.colors.textSecondary }]}>
                  Weekends
                </Text>
                <Text style={[styles.comparisonValue, { color: '#8B5CF6' }]}>
                  {weekdayWeekend.weekend_avg.toFixed(1)}h
                </Text>
                <Text style={[styles.comparisonNights, { color: theme.colors.textSecondary }]}>
                  {weekdayWeekend.weekend_count} nights
                </Text>
              </View>
            </View>

            {/* Difference */}
            <View style={[styles.differenceBox, { backgroundColor: theme.colors.secondary }]}>
              <Text style={[styles.differenceText, { color: theme.colors.text }]}>
                Difference: {Math.abs(weekdayWeekend.difference).toFixed(1)} hours
              </Text>
            </View>
          </View>
        )}

        {/* Card 4: Optimal Bedtime */}
        {optimalBedtime && (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <Clock size={24} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Optimal Bedtime</Text>
            </View>
            <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
              {optimalBedtime.explanation}
            </Text>

            <View style={styles.optimalBedtimeContainer}>
              {/* Time Window */}
              <View style={styles.timeWindow}>
                <Text style={[styles.timeWindowLabel, { color: theme.colors.textSecondary }]}>
                  Best time to sleep
                </Text>
                <Text style={[styles.timeWindowValue, { color: theme.colors.primary }]}>
                  {formatTime(optimalBedtime.optimal_bedtime_start)} - {formatTime(optimalBedtime.optimal_bedtime_end)}
                </Text>
              </View>

              {/* Confidence */}
              <View style={styles.confidenceContainer}>
                <Text style={[styles.confidenceLabel, { color: theme.colors.textSecondary }]}>
                  Confidence
                </Text>
                <View style={[styles.confidenceBar, { backgroundColor: theme.colors.border }]}>
                  <View
                    style={[
                      styles.confidenceFill,
                      {
                        width: `${optimalBedtime.confidence * 100}%`,
                        backgroundColor: theme.colors.primary
                      }
                    ]}
                  />
                </View>
                <Text style={[styles.confidencePercent, { color: theme.colors.text }]}>
                  {(optimalBedtime.confidence * 100).toFixed(0)}%
                </Text>
              </View>

              {/* Based On */}
              <Text style={[styles.basedOnText, { color: theme.colors.textSecondary }]}>
                Based on {optimalBedtime.sample_size} nights of quality sleep
              </Text>
            </View>
          </View>
        )}

        {/* Card 5: Detected Patterns */}
        {patterns && (patterns.positive_patterns.length > 0 || patterns.negative_patterns.length > 0) && (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <Lightbulb size={24} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>What Affects Your Sleep</Text>
            </View>
            <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
              Patterns detected from your data
            </Text>

            {/* Positive Patterns */}
            {patterns.positive_patterns.length > 0 && (
              <View style={styles.patternSection}>
                <TouchableOpacity
                  style={styles.patternHeader}
                  onPress={() => togglePattern('positive')}
                >
                  <Text style={[styles.patternHeaderText, { color: '#10B981' }]}>
                    ✓ What Helps ({patterns.positive_patterns.length})
                  </Text>
                  {expandedPatterns.positive ? (
                    <ChevronUp size={20} color="#10B981" />
                  ) : (
                    <ChevronDown size={20} color="#10B981" />
                  )}
                </TouchableOpacity>

                {expandedPatterns.positive && (
                  <View style={styles.patternList}>
                    {patterns.positive_patterns.map((pattern, index) => (
                      <View key={index} style={[styles.patternItem, { borderLeftColor: '#10B981' }]}>
                        <Text style={[styles.patternText, { color: theme.colors.text }]}>
                          {pattern.pattern}
                        </Text>
                        <Text style={[styles.patternExplanation, { color: theme.colors.textSecondary }]}>
                          {pattern.explanation}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Negative Patterns */}
            {patterns.negative_patterns.length > 0 && (
              <View style={styles.patternSection}>
                <TouchableOpacity
                  style={styles.patternHeader}
                  onPress={() => togglePattern('negative')}
                >
                  <Text style={[styles.patternHeaderText, { color: '#EF4444' }]}>
                    ⚠ What Hinders ({patterns.negative_patterns.length})
                  </Text>
                  {expandedPatterns.negative ? (
                    <ChevronUp size={20} color="#EF4444" />
                  ) : (
                    <ChevronDown size={20} color="#EF4444" />
                  )}
                </TouchableOpacity>

                {expandedPatterns.negative && (
                  <View style={styles.patternList}>
                    {patterns.negative_patterns.map((pattern, index) => (
                      <View key={index} style={[styles.patternItem, { borderLeftColor: '#EF4444' }]}>
                        <Text style={[styles.patternText, { color: theme.colors.text }]}>
                          {pattern.pattern}
                        </Text>
                        <Text style={[styles.patternExplanation, { color: theme.colors.textSecondary }]}>
                          {pattern.explanation}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Card 6: Personalized Recommendations */}
        {recommendations.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
            <View style={styles.cardHeader}>
              <Lightbulb size={24} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Personalized Recommendations</Text>
            </View>
            <Text style={[styles.cardSubtitle, { color: theme.colors.textSecondary }]}>
              Based on your sleep patterns
            </Text>

            <View style={styles.recommendationsList}>
              {recommendations.map((rec, index) => (
                <View key={rec.id} style={[styles.recommendationItem, { backgroundColor: theme.colors.secondary }]}>
                  <View style={styles.recommendationHeader}>
                    <Text style={[styles.recommendationTitle, { color: theme.colors.text }]}>
                      {index + 1}. {rec.reason}
                    </Text>
                    <View style={[styles.confidenceBadge, { backgroundColor: theme.colors.primary + '20' }]}>
                      <Text style={[styles.confidenceBadgeText, { color: theme.colors.primary }]}>
                        {(rec.confidence_score * 100).toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.recommendationText, { color: theme.colors.text }]}>
                    {rec.recommendation_text}
                  </Text>
                  {rec.tags && rec.tags.length > 0 && (
                    <View style={styles.recommendationTags}>
                      {rec.tags.map(tag => (
                        <View key={tag} style={[styles.tag, { backgroundColor: theme.colors.border }]}>
                          <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>
                            {tag}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  chartContainer: {
    marginTop: 8,
  },
  chart: {
    flexDirection: 'row',
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    paddingRight: 8,
    height: 200,
  },
  yAxisLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  barsContainer: {
    flex: 1,
  },
  barsWrapper: {
    position: 'relative',
    height: 220,
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    borderTopWidth: 1,
    opacity: 0.2,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 220,
    paddingBottom: 20,
  },
  barColumn: {
    width: 24,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 2,
  },
  xAxisLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  consistencyContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  circularProgress: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  circularProgressInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  consistencyPercent: {
    fontSize: 36,
    fontWeight: '800',
  },
  consistencyLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  consistencyMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  consistencyStats: {
    flexDirection: 'row',
    gap: 32,
  },
  consistencyStat: {
    alignItems: 'center',
  },
  consistencyStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  consistencyStatValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  comparisonItem: {
    alignItems: 'center',
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  comparisonNights: {
    fontSize: 11,
    fontWeight: '500',
  },
  comparisonVs: {
    paddingHorizontal: 16,
  },
  comparisonVsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  differenceBox: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  differenceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  optimalBedtimeContainer: {
    paddingVertical: 8,
  },
  timeWindow: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  timeWindowLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  timeWindowValue: {
    fontSize: 28,
    fontWeight: '800',
  },
  confidenceContainer: {
    paddingVertical: 16,
  },
  confidenceLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidencePercent: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  basedOnText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  patternSection: {
    marginBottom: 16,
  },
  patternHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  patternHeaderText: {
    fontSize: 16,
    fontWeight: '700',
  },
  patternList: {
    gap: 12,
    marginTop: 8,
  },
  patternItem: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    paddingVertical: 8,
  },
  patternText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  patternExplanation: {
    fontSize: 13,
    lineHeight: 18,
  },
  recommendationsList: {
    gap: 16,
  },
  recommendationItem: {
    padding: 16,
    borderRadius: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    lineHeight: 20,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  recommendationTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
