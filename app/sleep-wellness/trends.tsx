// Trends & Insights Screen - Advanced Analytics
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Calendar,
  Moon,
  Sun,
  X,
  Clock,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronRight,
  BarChart3,
  Activity,
  Lightbulb,
} from 'lucide-react-native';
import { SleepService } from '@/services/sleep.service';
import { SleepAnalyticsService, DetailedInsights } from '@/services/sleep-analytics.service';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 80;

export default function TrendsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<DetailedInsights | null>(null);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<30 | 90>(30);
  const [expandedPattern, setExpandedPattern] = useState<string | null>(null);
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const userId = user?.id || 'guest_user';

      // Get raw sleep data for charts
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - selectedPeriod * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      const { data } = await SleepService.getByDateRange(userId, startDate, endDate);
      setSleepData(data || []);

      // Get comprehensive insights
      const detailedInsights = await SleepAnalyticsService.generateDetailedInsights(
        userId,
        selectedPeriod
      );
      setInsights(detailedInsights);
    } catch (error) {
      console.error('Error loading analytics:', error);
      Alert.alert('Error', 'Failed to load sleep analytics');
    } finally {
      setLoading(false);
    }
  };

  const renderDurationChart = () => {
    if (sleepData.length === 0) return null;

    const displayData = sleepData.slice(-14);
    const maxHours = Math.max(...displayData.map(d => Number(d.hours)), 8);
    const barWidth = (CHART_WIDTH / displayData.length) - 6;

    return (
      <View style={styles.chart}>
        <View style={styles.chartBars}>
          {displayData.map((log, index) => {
            const heightPercent = (Number(log.hours) / maxHours) * 100;
            const date = new Date(log.date);
            const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' })[0];

            const getBarColor = () => {
              if (log.quality >= 4) return theme.colors.success;
              if (log.quality >= 3) return theme.colors.warning;
              return theme.colors.error;
            };

            return (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${heightPercent}%`,
                      width: barWidth,
                      backgroundColor: getBarColor(),
                    },
                  ]}
                />
                <Text style={[styles.barLabel, { color: theme.colors.textSecondary }]}>
                  {dayLabel}
                </Text>
                <Text style={[styles.barValue, { color: theme.colors.textSecondary }]}>
                  {log.hours.toFixed(1)}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.success }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>High Quality</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Low</Text>
          </View>
        </View>
      </View>
    );
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return <AlertCircle size={20} color={theme.colors.error} />;
    if (priority === 'medium') return <Info size={20} color={theme.colors.warning} />;
    return <Lightbulb size={20} color={theme.colors.primary} />;
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return theme.colors.error;
    if (priority === 'medium') return theme.colors.warning;
    return theme.colors.primary;
  };

  const getPatternIcon = (type: string) => {
    if (type === 'weekday_vs_weekend') return <Calendar size={20} color={theme.colors.primary} />;
    if (type === 'quality_trend') return <TrendingDown size={20} color={theme.colors.warning} />;
    if (type === 'optimal_window') return <Target size={20} color={theme.colors.success} />;
    return <Activity size={20} color={theme.colors.primary} />;
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp size={18} color={theme.colors.success} />;
    if (trend === 'declining') return <TrendingDown size={18} color={theme.colors.error} />;
    return <Activity size={18} color={theme.colors.textSecondary} />;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Analyzing your sleep patterns...
          </Text>
        </View>
      </View>
    );
  }

  if (!insights || sleepData.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: theme.colors.card }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Trends & Insights</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.emptyContainer}>
          <Moon size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No Data Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
            Track your sleep for at least 7 days to get personalized insights and recommendations
          </Text>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.startButtonText}>Start Tracking</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: theme.colors.card }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Sleep Analytics</Text>
          <Text style={[styles.headerSubtitle, { color: theme.colors.textSecondary }]}>
            Data-driven insights
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 30 && styles.periodButtonActive,
              { backgroundColor: selectedPeriod === 30 ? theme.colors.primary : theme.colors.card },
            ]}
            onPress={() => setSelectedPeriod(30)}
          >
            <Text
              style={[
                styles.periodButtonText,
                { color: selectedPeriod === 30 ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              30 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.periodButton,
              selectedPeriod === 90 && styles.periodButtonActive,
              { backgroundColor: selectedPeriod === 90 ? theme.colors.primary : theme.colors.card },
            ]}
            onPress={() => setSelectedPeriod(90)}
          >
            <Text
              style={[
                styles.periodButtonText,
                { color: selectedPeriod === 90 ? '#FFFFFF' : theme.colors.text },
              ]}
            >
              90 Days
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sleep Efficiency Score - Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.heroContent}>
            <View style={styles.heroIconContainer}>
              <Award size={32} color="#FFFFFF" />
            </View>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroLabel}>Sleep Efficiency</Text>
              <Text style={styles.heroValue}>{insights.sleepEfficiencyScore}%</Text>
              <Text style={styles.heroSubtext}>
                {insights.sleepEfficiencyScore >= 80
                  ? 'Excellent!'
                  : insights.sleepEfficiencyScore >= 60
                  ? 'Good progress'
                  : 'Room for improvement'}
              </Text>
            </View>
          </View>
        </View>

        {/* Key Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.metricHeader}>
              <Moon size={20} color={theme.colors.primary} />
              {getTrendIcon(insights.metrics.durationTrend)}
            </View>
            <Text style={[styles.metricValue, { color: theme.colors.text }]}>
              {insights.metrics.averageDuration.toFixed(1)}h
            </Text>
            <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
              Avg Duration
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.metricHeader}>
              <Zap size={20} color={theme.colors.warning} />
              {getTrendIcon(insights.metrics.qualityTrend)}
            </View>
            <Text style={[styles.metricValue, { color: theme.colors.text }]}>
              {insights.metrics.averageQuality.toFixed(1)}/5
            </Text>
            <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
              Avg Quality
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.metricHeader}>
              <Clock size={20} color={theme.colors.success} />
              <CheckCircle size={18} color={theme.colors.success} />
            </View>
            <Text style={[styles.metricValue, { color: theme.colors.text }]}>
              {insights.metrics.consistencyScore.toFixed(0)}%
            </Text>
            <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
              Consistency
            </Text>
          </View>
        </View>

        {/* Sleep Debt Alert */}
        {insights.metrics.sleepDebt > 5 && (
          <View style={[styles.alertCard, { backgroundColor: theme.colors.error + '20' }]}>
            <AlertCircle size={24} color={theme.colors.error} />
            <View style={styles.alertContent}>
              <Text style={[styles.alertTitle, { color: theme.colors.error }]}>
                Sleep Debt Alert
              </Text>
              <Text style={[styles.alertText, { color: theme.colors.text }]}>
                You have accumulated {insights.metrics.sleepDebt.toFixed(1)} hours of sleep debt. 
                This can impact health, mood, and cognitive performance.
              </Text>
            </View>
          </View>
        )}

        {/* Duration Chart */}
        <View style={[styles.chartCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <BarChart3 size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Sleep Duration Trend
            </Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Last 14 nights • Color indicates quality
          </Text>
          {renderDurationChart()}
        </View>

        {/* Weekday vs Weekend Comparison */}
        {insights.weekdayComparison && (
          <View style={[styles.comparisonCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <Calendar size={24} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Weekday vs Weekend
              </Text>
            </View>

            <View style={styles.comparisonRow}>
              <View style={styles.comparisonColumn}>
                <Text style={[styles.comparisonLabel, { color: theme.colors.textSecondary }]}>
                  Weekdays
                </Text>
                <Text style={[styles.comparisonValue, { color: theme.colors.text }]}>
                  {insights.weekdayComparison.weekday.avgHours.toFixed(1)}h
                </Text>
                <Text style={[styles.comparisonSub, { color: theme.colors.textSecondary }]}>
                  Quality: {insights.weekdayComparison.weekday.avgQuality.toFixed(1)}/5
                </Text>
              </View>

              <View style={styles.comparisonDivider} />

              <View style={styles.comparisonColumn}>
                <Text style={[styles.comparisonLabel, { color: theme.colors.textSecondary }]}>
                  Weekends
                </Text>
                <Text style={[styles.comparisonValue, { color: theme.colors.text }]}>
                  {insights.weekdayComparison.weekend.avgHours.toFixed(1)}h
                </Text>
                <Text style={[styles.comparisonSub, { color: theme.colors.textSecondary }]}>
                  Quality: {insights.weekdayComparison.weekend.avgQuality.toFixed(1)}/5
                </Text>
              </View>
            </View>

            <View style={[styles.analysisBox, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.analysisText, { color: theme.colors.text }]}>
                {insights.weekdayComparison.analysis}
              </Text>
            </View>
          </View>
        )}

        {/* Optimal Bedtime */}
        <View style={[styles.optimalCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.optimalContent}>
            <Target size={28} color={theme.colors.success} />
            <View style={styles.optimalTextContainer}>
              <Text style={[styles.optimalLabel, { color: theme.colors.textSecondary }]}>
                Your Optimal Bedtime
              </Text>
              <Text style={[styles.optimalTime, { color: theme.colors.text }]}>
                {insights.predictedOptimalBedtime} - {insights.metrics.optimalBedtimeWindow.end}
              </Text>
              <Text style={[styles.optimalSubtext, { color: theme.colors.textSecondary }]}>
                Based on your highest quality sleep nights
              </Text>
            </View>
          </View>
        </View>

        {/* Detected Patterns */}
        {insights.patterns.length > 0 && (
          <View style={[styles.patternsCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <Activity size={24} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Detected Patterns
              </Text>
            </View>

            {insights.patterns.map((pattern, index) => {
              const isExpanded = expandedPattern === pattern.type;
              const getSeverityColor = () => {
                if (pattern.severity === 'positive') return theme.colors.success;
                if (pattern.severity === 'warning') return theme.colors.warning;
                if (pattern.severity === 'critical') return theme.colors.error;
                return theme.colors.primary;
              };

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.patternItem,
                    { backgroundColor: getSeverityColor() + '15', borderLeftColor: getSeverityColor() },
                  ]}
                  onPress={() => setExpandedPattern(isExpanded ? null : pattern.type)}
                >
                  <View style={styles.patternHeader}>
                    {getPatternIcon(pattern.type)}
                    <Text style={[styles.patternTitle, { color: theme.colors.text }]}>
                      {pattern.title}
                    </Text>
                    <Text style={[styles.patternConfidence, { color: theme.colors.textSecondary }]}>
                      {pattern.confidence}%
                    </Text>
                  </View>
                  <Text style={[styles.patternDescription, { color: theme.colors.textSecondary }]}>
                    {pattern.description}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Correlations */}
        {insights.correlations.length > 0 && (
          <View style={[styles.correlationsCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={24} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                What Affects Your Sleep
              </Text>
            </View>

            {insights.correlations.map((correlation, index) => (
              <View
                key={index}
                style={[
                  styles.correlationItem,
                  {
                    backgroundColor:
                      correlation.impact === 'positive'
                        ? theme.colors.success + '15'
                        : theme.colors.warning + '15',
                  },
                ]}
              >
                <View style={styles.correlationHeader}>
                  <Text style={[styles.correlationFactor, { color: theme.colors.text }]}>
                    {correlation.factor}
                  </Text>
                  <View
                    style={[
                      styles.correlationBadge,
                      {
                        backgroundColor:
                          correlation.impact === 'positive' ? theme.colors.success : theme.colors.warning,
                      },
                    ]}
                  >
                    <Text style={styles.correlationBadgeText}>
                      {correlation.impact === 'positive' ? '↑' : '↓'} {(correlation.strength * 100).toFixed(0)}%
                    </Text>
                  </View>
                </View>
                <Text style={[styles.correlationDescription, { color: theme.colors.textSecondary }]}>
                  {correlation.description}
                </Text>
                <Text style={[styles.correlationRecommendation, { color: theme.colors.text }]}>
                  💡 {correlation.recommendation}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Personalized Recommendations */}
        <View style={[styles.recommendationsCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.sectionHeader}>
            <Lightbulb size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Personalized Recommendations
            </Text>
          </View>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Evidence-based actions tailored to your data
          </Text>

          {insights.recommendations.map((rec, index) => {
            const isExpanded = expandedRecommendation === rec.id;

            return (
              <TouchableOpacity
                key={rec.id}
                style={[
                  styles.recommendationItem,
                  { borderLeftColor: getPriorityColor(rec.priority) },
                ]}
                onPress={() => setExpandedRecommendation(isExpanded ? null : rec.id)}
              >
                <View style={styles.recommendationHeader}>
                  {getPriorityIcon(rec.priority)}
                  <View style={styles.recommendationTitleContainer}>
                    <Text style={[styles.recommendationTitle, { color: theme.colors.text }]}>
                      {rec.title}
                    </Text>
                    <Text style={[styles.recommendationCategory, { color: theme.colors.textSecondary }]}>
                      {rec.category.toUpperCase()}
                    </Text>
                  </View>
                  <ChevronRight
                    size={20}
                    color={theme.colors.textSecondary}
                    style={{
                      transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
                    }}
                  />
                </View>

                <Text style={[styles.recommendationDescription, { color: theme.colors.textSecondary }]}>
                  {rec.description}
                </Text>

                {isExpanded && (
                  <View style={styles.recommendationDetails}>
                    <View style={[styles.rationaleBox, { backgroundColor: theme.colors.background }]}>
                      <Text style={[styles.rationaleLabel, { color: theme.colors.textSecondary }]}>
                        Why this matters:
                      </Text>
                      <Text style={[styles.rationaleText, { color: theme.colors.text }]}>
                        {rec.rationale}
                      </Text>
                    </View>

                    <Text style={[styles.actionStepsLabel, { color: theme.colors.text }]}>
                      Action Steps:
                    </Text>
                    {rec.actionSteps.map((step, stepIndex) => (
                      <View key={stepIndex} style={styles.actionStep}>
                        <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                          <Text style={styles.stepNumberText}>{stepIndex + 1}</Text>
                        </View>
                        <Text style={[styles.actionStepText, { color: theme.colors.text }]}>
                          {step}
                        </Text>
                      </View>
                    ))}

                    <View style={[styles.impactBox, { backgroundColor: theme.colors.success + '20' }]}>
                      <Zap size={16} color={theme.colors.success} />
                      <Text style={[styles.impactText, { color: theme.colors.text }]}>
                        {rec.estimatedImpact}
                      </Text>
                    </View>

                    {rec.relatedHabits && rec.relatedHabits.length > 0 && (
                      <TouchableOpacity
                        style={[styles.habitButton, { backgroundColor: theme.colors.primary }]}
                        onPress={() => router.push('/habit-library?category=Sleep' as any)}
                      >
                        <Text style={styles.habitButtonText}>Browse Related Habits</Text>
                        <ChevronRight size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  startButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 16,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },

  // Period Selector
  periodSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  periodButtonActive: {},
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Hero Card
  heroCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  heroIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 16,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 4,
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 52,
  },
  heroSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Alert Card
  alertCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    alignItems: 'flex-start',
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Chart Card
  chartCard: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  chart: {
    height: 220,
    marginTop: 8,
  },
  chartBars: {
    flexDirection: 'row',
    height: 160,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  bar: {
    borderRadius: 6,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  barValue: {
    fontSize: 9,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
  },

  // Comparison Card
  comparisonCard: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  comparisonRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 16,
  },
  comparisonColumn: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  comparisonValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  comparisonSub: {
    fontSize: 13,
  },
  comparisonDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 20,
  },
  analysisBox: {
    padding: 16,
    borderRadius: 12,
    marginTop: 4,
  },
  analysisText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Optimal Card
  optimalCard: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  optimalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optimalTextContainer: {
    flex: 1,
  },
  optimalLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  optimalTime: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  optimalSubtext: {
    fontSize: 13,
  },

  // Patterns Card
  patternsCard: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  patternItem: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    borderLeftWidth: 4,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  patternTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  patternConfidence: {
    fontSize: 12,
    fontWeight: '600',
  },
  patternDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 30,
  },

  // Correlations Card
  correlationsCard: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  correlationItem: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  correlationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  correlationFactor: {
    fontSize: 16,
    fontWeight: '700',
  },
  correlationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  correlationBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  correlationDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  correlationRecommendation: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  // Recommendations Card
  recommendationsCard: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 8,
  },
  recommendationItem: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderLeftWidth: 4,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  recommendationTitleContainer: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  recommendationCategory: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  recommendationDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 32,
  },
  recommendationDetails: {
    marginTop: 16,
    marginLeft: 32,
    gap: 12,
  },
  rationaleBox: {
    padding: 12,
    borderRadius: 8,
  },
  rationaleLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  rationaleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  actionStepsLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  actionStep: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  actionStepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  impactBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  impactText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  habitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 8,
  },
  habitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
