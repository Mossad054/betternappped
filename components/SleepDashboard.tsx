import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AnalyticsService } from '@/services/analytics.service';
import { CorrelationService, CorrelationResult } from '@/services/analytics/correlation.service';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SleepDashboardProps {
  userId: string;
  period: 'today' | 'week' | 'month' | 'year';
  sleepTarget?: number;
}

export default function SleepDashboard({
  userId,
  period,
  sleepTarget = 8.0,
}: SleepDashboardProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [correlations, setCorrelations] = useState<{
    sleepMood: CorrelationResult | null;
    sleepClarity: CorrelationResult | null;
    sleepProductivity: CorrelationResult | null;
  }>({ sleepMood: null, sleepClarity: null, sleepProductivity: null });
  const [comparison, setComparison] = useState<{
    mood: { goodSleep: number; poorSleep: number; difference: number; percentChange: number };
    clarity: { goodSleep: number; poorSleep: number; difference: number; percentChange: number };
    productivity: { goodSleep: number; poorSleep: number; difference: number; percentChange: number };
    sampleSize: { goodSleep: number; poorSleep: number };
  } | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    loadSleepData();
  }, [userId, period]);

  const loadSleepData = async () => {
    setLoading(true);
    try {
      console.log(`🛌 Loading sleep dashboard data for period: ${period}...`);
      
      // Calculate date range based on the main period filter
      const getDateRangeForPeriod = (selectedPeriod: 'today' | 'week' | 'month' | 'year') => {
        const now = new Date();
        const endDate = now.toISOString().split('T')[0];
        let startDate: string;
        
        if (selectedPeriod === 'today') {
          startDate = endDate;
        } else if (selectedPeriod === 'week') {
          const start = new Date(now);
          start.setDate(now.getDate() - 7);
          startDate = start.toISOString().split('T')[0];
        } else if (selectedPeriod === 'month') {
          const start = new Date(now);
          start.setDate(now.getDate() - 30);
          startDate = start.toISOString().split('T')[0];
        } else { // year
          const start = new Date(now);
          start.setDate(now.getDate() - 365);
          startDate = start.toISOString().split('T')[0];
        }
        
        return { start: startDate, end: endDate };
      };
      
      const dateRange = getDateRangeForPeriod(period);
      
      // Convert period for analytics service (it doesn't support 'today')
      const analyticsPeriod = period === 'today' ? 'week' : period;
      
      // Load sleep analytics, correlations, and comparison data in parallel
      const [sleepResult, sleepMoodCorr, sleepClarityCorr, sleepProductivityCorr, comparisonResult] = await Promise.all([
        AnalyticsService.getSleepTrackingAnalysis(userId, analyticsPeriod, sleepTarget),
        CorrelationService.calculateCorrelation({
          userId,
          factorType: 'sleep',
          outcomeType: 'mood',
          lagDays: 0, // Same day correlation
          dateRange,
        }),
        CorrelationService.calculateCorrelation({
          userId,
          factorType: 'sleep',
          outcomeType: 'clarity',
          lagDays: 0, // Same day correlation
          dateRange,
        }),
        CorrelationService.calculateCorrelation({
          userId,
          factorType: 'sleep',
          outcomeType: 'productivity',
          lagDays: 0, // Same day correlation
          dateRange,
        }),
        AnalyticsService.getSleepCorrelationComparison(userId, dateRange, sleepTarget),
      ]);

      if (sleepResult.data) {
        setData(sleepResult.data);
        setCorrelations({
          sleepMood: sleepMoodCorr,
          sleepClarity: sleepClarityCorr,
          sleepProductivity: sleepProductivityCorr,
        });

        // Set comparison data
        if (comparisonResult.data) {
          setComparison(comparisonResult.data);
        }

        // Generate recommendations based on correlations
        generateRecommendations(sleepMoodCorr, sleepClarityCorr, sleepProductivityCorr, sleepResult.data);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
        
        console.log('✅ Sleep correlations loaded:', {
          sleepMood: sleepMoodCorr?.coefficient || 'none',
          sleepClarity: sleepClarityCorr?.coefficient || 'none',
          sleepProductivity: sleepProductivityCorr?.coefficient || 'none',
        });
      } else {
        console.error('❌ Failed to load sleep data:', sleepResult.error);
      }
    } catch (error) {
      console.error('❌ Error loading sleep data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = (
    moodCorr: CorrelationResult | null,
    clarityCorr: CorrelationResult | null,
    productivityCorr: CorrelationResult | null,
    sleepData: any
  ) => {
    const recs: string[] = [];

    // Analyze sleep duration
    if (sleepData.summary?.avgSleep) {
      const avgSleep = sleepData.summary.avgSleep;
      if (avgSleep < 6) {
        recs.push('⚠️ You\'re averaging less than 6 hours of sleep. Aim for 7-9 hours to improve overall well-being.');
      } else if (avgSleep < 7) {
        recs.push('💤 Try adding 30-60 minutes to your sleep duration to reach the recommended 7-9 hours.');
      } else if (avgSleep >= 8 && avgSleep <= 9) {
        recs.push('✨ Great! You\'re hitting the optimal sleep duration of 7-9 hours.');
      }
    }

    // Mood correlation recommendations
    if (moodCorr && moodCorr.pValue < 0.05) {
      if (moodCorr.coefficient > 0.3) {
        recs.push('😊 Better sleep significantly improves your mood. Prioritize consistent sleep schedules.');
      } else if (moodCorr.coefficient < -0.3) {
        recs.push('🔍 Longer sleep correlates with lower mood. Consider sleep quality over quantity.');
      }
    }

    // Mental clarity correlation recommendations
    if (clarityCorr && clarityCorr.pValue < 0.05) {
      if (clarityCorr.coefficient > 0.3) {
        recs.push('🧠 Quality sleep enhances your mental clarity. Maintain your sleep routine for peak performance.');
      } else if (clarityCorr.coefficient < -0.3) {
        recs.push('💡 Review your sleep environment - quality matters more than duration for mental clarity.');
      }
    }

    // Productivity correlation recommendations
    if (productivityCorr && productivityCorr.pValue < 0.05) {
      if (productivityCorr.coefficient > 0.3) {
        recs.push('📈 Your productivity thrives on good sleep. Keep maintaining consistent sleep habits.');
      }
    }

    // Sleep quality recommendations
    if (sleepData.summary?.qualityAvg) {
      const qualityAvg = sleepData.summary.qualityAvg;
      if (qualityAvg < 3) {
        recs.push('🌙 Low sleep quality detected. Try improving your sleep environment: dark room, cool temperature, comfortable bedding.');
      } else if (qualityAvg >= 4) {
        recs.push('⭐ Excellent sleep quality! Your sleep hygiene practices are working well.');
      }
    }

    // Consistency recommendations
    if (sleepData.summary?.consistency) {
      if (sleepData.summary.consistency < 0.7) {
        recs.push('⏰ Inconsistent sleep schedule detected. Try going to bed and waking up at similar times daily.');
      }
    }

    // Default recommendation if no specific patterns found
    if (recs.length === 0) {
      recs.push('📊 Keep tracking your sleep to discover personalized insights and recommendations.');
    }

    setRecommendations(recs.slice(0, 3)); // Limit to top 3 recommendations
  };

  const renderDonutChart = (percentage: number, label: string, size: number = 160) => {
    const radius = (size - 40) / 2;
    const strokeWidth = 20;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (percentage / 100) * circumference;

    return (
      <View style={[styles.donutContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#60A5FA" />
              <Stop offset="100%" stopColor="#3B82F6" />
            </LinearGradient>
            <LinearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#A78BFA" />
              <Stop offset="100%" stopColor="#8B5CF6" />
            </LinearGradient>
          </Defs>

          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={theme.colors.border || '#E5E7EB'}
            strokeWidth={strokeWidth}
          />

          {/* Progress circle (blue) */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#blueGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${progress} ${circumference}`}
            strokeDashoffset={circumference / 4}
            strokeLinecap="round"
            rotation="-90"
            origin={`${center}, ${center}`}
          />

          {/* Remaining circle (purple) */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="url(#purpleGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference - progress} ${circumference}`}
            strokeDashoffset={-progress + circumference / 4}
            strokeLinecap="round"
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        </Svg>

        <View style={styles.donutCenter}>
          <Text style={[styles.donutPercentage, { color: theme.colors.text }]}>
            {Math.round(percentage)}%
          </Text>
          <Text style={[styles.donutLabel, { color: theme.colors.textSecondary }]}>
            {label}
          </Text>
        </View>
      </View>
    );
  };

  const renderMiniDonutChart = (successPercent: number, failPercent: number, hours: number) => {
    const size = 120;
    const radius = 45;
    const strokeWidth = 12;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;
    const successProgress = (successPercent / 100) * circumference;

    return (
      <View style={[styles.miniDonutContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          {/* Background circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={theme.colors.border || '#E5E7EB'}
            strokeWidth={strokeWidth}
          />

          {/* Success circle (blue) */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#60A5FA"
            strokeWidth={strokeWidth}
            strokeDasharray={`${successProgress} ${circumference}`}
            strokeDashoffset={circumference / 4}
            strokeLinecap="round"
            rotation="-90"
            origin={`${center}, ${center}`}
          />

          {/* Fail circle (purple) */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#A78BFA"
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference - successProgress} ${circumference}`}
            strokeDashoffset={-successProgress + circumference / 4}
            strokeLinecap="round"
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        </Svg>

        <View style={styles.miniDonutCenter}>
          <Text style={[styles.miniDonutHours, { color: theme.colors.text }]}>
            {hours.toFixed(1)}h
          </Text>
        </View>
      </View>
    );
  };

  const renderAreaChart = () => {
    if (!data || !data.dailyData || data.dailyData.length === 0) return null;

    // Filter data based on main period prop
    let daysToShow = 7;
    if (period === 'today') daysToShow = 1;
    else if (period === 'week') daysToShow = 7;
    else if (period === 'month') daysToShow = 30;
    else if (period === 'year') daysToShow = 365;

    const dailyData = data.dailyData.slice(-daysToShow);
    
    if (dailyData.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
            No sleep data available for this period
          </Text>
        </View>
      );
    }

    const chartWidth = SCREEN_WIDTH - 80;
    const chartHeight = 120;
    const padding = { top: 10, right: 10, bottom: 20, left: 30 };

    const maxHours = 10;
    const xStep = (chartWidth - padding.left - padding.right) / (dailyData.length - 1 || 1);

    // Calculate points
    const points = dailyData.map((day: any, index: number) => ({
      x: padding.left + index * xStep,
      y: padding.top + (chartHeight - padding.top - padding.bottom) * (1 - day.duration / maxHours),
      duration: day.duration,
    }));

    // Create smooth path using quadratic curves
    let pathData = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i];
      const next = points[i + 1];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      pathData += ` Q ${current.x} ${current.y}, ${midX} ${midY}`;
    }
    pathData += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;

    // Create area path
    const areaPath =
      pathData +
      ` L ${points[points.length - 1].x} ${chartHeight - padding.bottom}` +
      ` L ${padding.left} ${chartHeight - padding.bottom} Z`;

    return (
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight}>
          <Defs>
            <LinearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#60A5FA" stopOpacity="0.5" />
              <Stop offset="100%" stopColor="#60A5FA" stopOpacity="0.05" />
            </LinearGradient>
          </Defs>

          {/* Area fill */}
          <Path d={areaPath} fill="url(#areaGradient)" />

          {/* Line */}
          <Path d={pathData} stroke="#3B82F6" strokeWidth={3} fill="none" />
        </Svg>

        {/* X-axis labels */}
        <View style={styles.xAxisLabels}>
          {dailyData.map((day: any, index: number) => {
            // Show labels based on period
            let label = '';
            if (period === 'today') {
              label = 'Today';
            } else if (period === 'year') {
              // Show month abbreviations for year view
              const date = new Date(day.date);
              label = date.toLocaleString('default', { month: 'short' });
            } else {
              // Show day number for week/month view
              label = String(index + 1);
            }
            
            // Only show some labels to avoid crowding
            const shouldShow = period === 'year' 
              ? index % Math.ceil(dailyData.length / 6) === 0
              : period === 'month'
              ? index % 5 === 0
              : true;
            
            return shouldShow ? (
              <Text
                key={index}
                style={[
                  styles.xAxisLabel,
                  { color: theme.colors.textSecondary, left: padding.left + index * xStep - 10 },
                ]}
              >
                {label}
              </Text>
            ) : null;
          })}
        </View>
      </View>
    );
  };

  const renderBarChart = () => {
    if (!data || !data.dailyData || data.dailyData.length === 0) return null;

    // Get the appropriate number of days based on period
    let daysToShow = 7;
    if (period === 'month') daysToShow = 30;
    else if (period === 'year') daysToShow = 12; // Show monthly averages for year
    
    const dailyData = data.dailyData.slice(-daysToShow);
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const maxHeight = 120;
    const barWidth = period === 'week' ? 35 : 25;

    return (
      <View style={styles.barChartSection}>
        <View style={styles.barChartHeader}>
          <Text style={[styles.barChartTitle, { color: theme.colors.text }]}>
            Sleep Duration Trend
          </Text>
          <Text style={[styles.barChartSubtitle, { color: theme.colors.textSecondary }]}>
            {period === 'week' ? 'Last 7 days' : period === 'month' ? 'Last 30 days' : period === 'year' ? 'Last 12 months' : 'Today'}
          </Text>
        </View>

        <View style={styles.barChartContainer}>
          {dailyData.slice(0, 7).map((day: any, index: number) => {
            const height = Math.max((day.duration / 10) * maxHeight, 20);
            // Alternate between blue and purple
            const color = index % 2 === 0 ? '#60A5FA' : '#A78BFA';
            
            const date = new Date(day.date);
            const dayLabel = days[date.getDay()];

            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barColumn}>
                  <View style={[styles.bar, { height, backgroundColor: color, width: barWidth }]} />
                </View>
                <Text style={[styles.barLabel, { color: theme.colors.textSecondary }]}>
                  {dayLabel}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const getSignificanceBadge = (pValue: number) => {
    if (pValue < 0.001) return { label: 'Highly Significant', color: '#10B981' };
    if (pValue < 0.01) return { label: 'Very Significant', color: '#3B82F6' };
    if (pValue < 0.05) return { label: 'Significant', color: '#6366F1' };
    return { label: 'Not Significant', color: '#9CA3AF' };
  };

  const getStrengthLabel = (coefficient: number) => {
    const abs = Math.abs(coefficient);
    if (abs >= 0.7) return 'Strong';
    if (abs >= 0.4) return 'Moderate';
    if (abs >= 0.2) return 'Weak';
    return 'Very Weak';
  };

  const renderSimplifiedCorrelationCard = (
    title: string,
    icon: string,
    correlation: CorrelationResult | null,
    impactDescription: string,
    comparisonData?: { goodSleep: number; poorSleep: number; difference: number; percentChange: number }
  ) => {
    if (!correlation) {
      return (
        <View style={[styles.simplifiedCorrelationCard, { backgroundColor: theme.colors.border + '20' }]}>
          <View style={styles.correlationHeader}>
            <Text style={styles.correlationIcon}>{icon}</Text>
            <Text style={[styles.correlationTitle, { color: theme.colors.text }]}>{title}</Text>
          </View>
          <Text style={[styles.correlationNoData, { color: theme.colors.textSecondary }]}>
            Not enough data yet
          </Text>
        </View>
      );
    }

    const isSignificant = correlation.pValue < 0.05;
    const impactLevel = Math.abs(correlation.coefficient);
    const isPositive = correlation.coefficient > 0;

    // Determine colors based on correlation direction
    const barColor = isPositive ? '#10B981' : '#EF4444';
    const changeColor = comparisonData && comparisonData.percentChange > 0 ? '#10B981' :
                        comparisonData && comparisonData.percentChange < 0 ? '#EF4444' : theme.colors.textSecondary;

    return (
      <View
        style={[
          styles.simplifiedCorrelationCard,
          {
            backgroundColor: isSignificant
              ? theme.colors.primary + '10'
              : theme.colors.border + '20',
          },
        ]}
      >
        <View style={styles.correlationHeader}>
          <Text style={styles.correlationIcon}>{icon}</Text>
          <Text style={[styles.correlationTitle, { color: theme.colors.text }]}>{title}</Text>
        </View>

        {/* Correlation Bar */}
        <View style={styles.correlationBarContainer}>
          <View style={[styles.correlationBarBackground, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.correlationBarFill,
                {
                  width: `${Math.min(impactLevel * 100, 100)}%`,
                  backgroundColor: barColor,
                }
              ]}
            />
          </View>
          <Text style={[styles.correlationBarLabel, { color: theme.colors.textSecondary }]}>
            {correlation.strength === 'none' ? 'No correlation' :
             correlation.strength === 'weak' ? 'Weak' :
             correlation.strength === 'moderate' ? 'Moderate' :
             correlation.strength === 'strong' ? 'Strong' : 'Very Strong'}
            {isSignificant ? '' : ' (not significant)'}
          </Text>
        </View>

        {/* Comparison Metrics */}
        {comparisonData && (comparisonData.goodSleep > 0 || comparisonData.poorSleep > 0) && (
          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonItem}>
                <View style={[styles.comparisonDot, { backgroundColor: '#10B981' }]} />
                <Text style={[styles.comparisonLabel, { color: theme.colors.textSecondary }]}>
                  Good sleep ({sleepTarget}h+)
                </Text>
                <Text style={[styles.comparisonValue, { color: theme.colors.text }]}>
                  {comparisonData.goodSleep.toFixed(1)}
                </Text>
              </View>
              <View style={styles.comparisonItem}>
                <View style={[styles.comparisonDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={[styles.comparisonLabel, { color: theme.colors.textSecondary }]}>
                  Poor sleep ({'<'}{sleepTarget}h)
                </Text>
                <Text style={[styles.comparisonValue, { color: theme.colors.text }]}>
                  {comparisonData.poorSleep.toFixed(1)}
                </Text>
              </View>
            </View>

            {comparisonData.percentChange !== 0 && (
              <View style={[styles.changeIndicator, { backgroundColor: changeColor + '15' }]}>
                <Text style={[styles.changeText, { color: changeColor }]}>
                  {comparisonData.percentChange > 0 ? '↑' : '↓'} {Math.abs(comparisonData.percentChange)}%
                  {comparisonData.percentChange > 0 ? ' better' : ' lower'} with good sleep
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Sample size */}
        {correlation.sampleSize && (
          <Text style={[styles.sampleText, { color: theme.colors.textSecondary }]}>
            Based on {correlation.sampleSize} days of data
          </Text>
        )}
      </View>
    );
  };

  const renderCorrelationCard = (
    title: string,
    icon: string,
    correlation: CorrelationResult | null
  ) => {
    if (!correlation) {
      return (
        <View style={[styles.correlationCard, { backgroundColor: theme.colors.border + '20' }]}>
          <View style={styles.correlationHeader}>
            <Text style={styles.correlationIcon}>{icon}</Text>
            <Text style={[styles.correlationTitle, { color: theme.colors.text }]}>{title}</Text>
          </View>
          <Text style={[styles.correlationNoData, { color: theme.colors.textSecondary }]}>
            Not enough data yet
          </Text>
        </View>
      );
    }

    const significance = getSignificanceBadge(correlation.pValue);
    const strength = getStrengthLabel(correlation.coefficient);
    const direction = correlation.coefficient > 0 ? 'positive' : 'negative';
    const isSignificant = correlation.pValue < 0.05;

    return (
      <View
        style={[
          styles.correlationCard,
          {
            backgroundColor: isSignificant
              ? theme.colors.primary + '10'
              : theme.colors.border + '20',
          },
        ]}
      >
        <View style={styles.correlationHeader}>
          <Text style={styles.correlationIcon}>{icon}</Text>
          <Text style={[styles.correlationTitle, { color: theme.colors.text }]}>{title}</Text>
        </View>

        {/* Coefficient */}
        <View style={styles.correlationMetrics}>
          <View style={styles.correlationMainStat}>
            <Text
              style={[
                styles.correlationCoefficient,
                {
                  color:
                    correlation.coefficient > 0
                      ? theme.colors.success
                      : theme.colors.error,
                },
              ]}
            >
              {correlation.coefficient > 0 ? '+' : ''}
              {correlation.coefficient.toFixed(3)}
            </Text>
            <Text style={[styles.correlationStrength, { color: theme.colors.textSecondary }]}>
              {strength} {direction}
            </Text>
          </View>

          {/* Significance Badge */}
          <View
            style={[
              styles.significanceBadge,
              { backgroundColor: significance.color + '20' },
            ]}
          >
            <Text style={[styles.significanceText, { color: significance.color }]}>
              {significance.label}
            </Text>
          </View>
        </View>

        {/* Statistical Details */}
        <View style={styles.correlationStats}>
          <View style={styles.correlationStat}>
            <Text style={[styles.correlationStatLabel, { color: theme.colors.textSecondary }]}>
              p-value
            </Text>
            <Text style={[styles.correlationStatValue, { color: theme.colors.text }]}>
              {correlation.pValue < 0.001 ? '<0.001' : correlation.pValue.toFixed(4)}
            </Text>
          </View>

          <View style={styles.correlationStat}>
            <Text style={[styles.correlationStatLabel, { color: theme.colors.textSecondary }]}>
              95% CI
            </Text>
            <Text style={[styles.correlationStatValue, { color: theme.colors.text }]}>
              [{correlation.confidenceInterval[0].toFixed(2)}, {correlation.confidenceInterval[1].toFixed(2)}]
            </Text>
          </View>

          <View style={styles.correlationStat}>
            <Text style={[styles.correlationStatLabel, { color: theme.colors.textSecondary }]}>
              Sample
            </Text>
            <Text style={[styles.correlationStatValue, { color: theme.colors.text }]}>
              {correlation.sampleSize} days
            </Text>
          </View>
        </View>

        {/* Interpretation */}
        {isSignificant && (
          <View style={[styles.correlationInterpretation, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.interpretationText, { color: theme.colors.text }]}>
              💡{' '}
              {correlation.coefficient > 0
                ? `Better sleep correlates with higher ${title.toLowerCase()}`
                : `Better sleep correlates with lower ${title.toLowerCase()}`}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading sleep data...
          </Text>
        </View>
      </View>
    );
  }

  if (!data || data.summary.totalNights === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>😴</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No sleep data yet</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Start tracking your sleep to see insights!
          </Text>
        </View>
      </View>
    );
  }

  const qualityPercentage = (data.summary.qualityAvg / 5) * 100;
  const successPercentage = (data.summary.daysMetTarget / data.summary.totalNights) * 100;
  const failPercentage = 100 - successPercentage;

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.colors.card, opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Sleep Tracker</Text>
        </View>

        {/* Main Donut Chart */}
        <View style={styles.mainChartSection}>
          {renderDonutChart(qualityPercentage, 'Sleep Quality', 200)}
        </View>

        {/* Stats Cards */}
        <View style={styles.statsCards}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.primary + '15' }]}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>
              {data.summary.avgSleep.toFixed(1)} Hours
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Total Time
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#10B981' + '15' }]}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>
              {(data.summary.avgSleep * 0.85).toFixed(1)} Hours
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Deep Sleep
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: '#F59E0B' + '15' }]}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>
              {(data.summary.avgSleep * 0.15).toFixed(1)} Hours
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Light Sleep
            </Text>
          </View>
        </View>

        {/* Weekly Bar Chart */}
        {renderBarChart()}

        {/* Sleep Quality Statistics */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Sleep Quality Statistics
            </Text>
          </View>

          {renderAreaChart()}

          <View style={styles.chartLabels}>
            <Text style={[styles.chartLabel, { color: theme.colors.textSecondary }]}>Awake</Text>
            <Text style={[styles.chartLabel, { color: theme.colors.textSecondary }]}>Light</Text>
            <Text style={[styles.chartLabel, { color: theme.colors.textSecondary }]}>REM</Text>
            <Text style={[styles.chartLabel, { color: theme.colors.textSecondary }]}>Deep</Text>
            <Text style={[styles.chartLabel, { color: theme.colors.textSecondary }]}>Time</Text>
          </View>
        </View>

        {/* Insights */}
        {data.insights && data.insights.length > 0 && (
          <View style={styles.insightsSection}>
            {data.insights.slice(0, 2).map((insight: string, index: number) => (
              <View key={index} style={[styles.insightCard, { backgroundColor: theme.colors.primary + '10' }]}>
                <Text style={[styles.insightText, { color: theme.colors.text }]}>
                  💡 {insight}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Correlations Section */}
        <View style={styles.correlationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Sleep Correlations
            </Text>
          </View>
          <Text style={[styles.correlationsSubtitle, { color: theme.colors.textSecondary }]}>
            How your sleep affects your daily wellness
          </Text>

          <View style={styles.correlationsGrid}>
            {renderSimplifiedCorrelationCard(
              'Mood Score',
              '😊',
              correlations.sleepMood,
              'mood and emotional well-being',
              comparison?.mood
            )}
            {renderSimplifiedCorrelationCard(
              'Mental Clarity',
              '🧠',
              correlations.sleepClarity,
              'focus and mental sharpness',
              comparison?.clarity
            )}
            {renderSimplifiedCorrelationCard(
              'Productivity',
              '📈',
              correlations.sleepProductivity,
              'productivity and task completion',
              comparison?.productivity
            )}
          </View>

          {/* Recommendations based on data */}
          {recommendations.length > 0 && (
            <View style={[styles.recommendationsBox, { backgroundColor: theme.colors.primary + '10' }]}>
              <Text style={[styles.recommendationsTitle, { color: theme.colors.text }]}>
                💡 Personalized Recommendations
              </Text>
              {recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={[styles.recommendationText, { color: theme.colors.text }]}>
                    {rec}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  mainChartSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  donutContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutPercentage: {
    fontSize: 36,
    fontWeight: '700',
  },
  donutLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  miniDonutContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDonutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDonutHours: {
    fontSize: 20,
    fontWeight: '700',
  },
  statsCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  chartContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  xAxisLabels: {
    position: 'relative',
    height: 20,
    marginTop: 4,
  },
  xAxisLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '500',
    width: 20,
    textAlign: 'center',
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  barChartSection: {
    marginBottom: 24,
  },
  barChartHeader: {
    marginBottom: 16,
  },
  barChartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  barChartSubtitle: {
    fontSize: 11,
    fontWeight: '400',
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    marginTop: 16,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barColumn: {
    height: 120,
    justifyContent: 'flex-end',
  },
  bar: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 8,
  },
  insightsSection: {
    gap: 12,
  },
  insightCard: {
    padding: 14,
    borderRadius: 12,
  },
  insightText: {
    fontSize: 13,
    lineHeight: 18,
  },
  correlationsSection: {
    marginTop: 24,
  },
  correlationsSubtitle: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  correlationsGrid: {
    gap: 16,
  },
  correlationCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  correlationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  correlationIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  correlationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  correlationNoData: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  correlationMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  correlationMainStat: {
    flex: 1,
  },
  correlationCoefficient: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  correlationStrength: {
    fontSize: 13,
    fontWeight: '500',
  },
  significanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  significanceText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  correlationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  correlationStat: {
    flex: 1,
    alignItems: 'center',
  },
  correlationStatLabel: {
    fontSize: 11,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  correlationStatValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  correlationInterpretation: {
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
  },
  interpretationText: {
    fontSize: 12,
    lineHeight: 18,
  },
  correlationLegend: {
    marginTop: 16,
    padding: 14,
    borderRadius: 12,
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  legendText: {
    fontSize: 11,
    lineHeight: 18,
  },
  simplifiedCorrelationCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  correlationBarContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  correlationBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  correlationBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  correlationBarLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  comparisonContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  comparisonItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  comparisonDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  comparisonLabel: {
    fontSize: 10,
    marginRight: 4,
  },
  comparisonValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  changeIndicator: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sampleText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 8,
  },
  impactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  impactScoreContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  impactScore: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  impactLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  impactDescription: {
    flex: 1,
  },
  impactText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  noImpactText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  recommendationsBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  recommendationsTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  recommendationItem: {
    marginBottom: 8,
    paddingLeft: 4,
  },
  recommendationText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
