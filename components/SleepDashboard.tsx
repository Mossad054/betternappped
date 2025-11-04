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
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SleepDashboardProps {
  userId: string;
  period: 'week' | 'month' | 'year';
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
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadSleepData();
  }, [userId, period]);

  const loadSleepData = async () => {
    setLoading(true);
    try {
      console.log('🛌 Loading sleep dashboard data...');
      const result = await AnalyticsService.getSleepTrackingAnalysis(userId, period, sleepTarget);

      if (result.data) {
        setData(result.data);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      } else {
        console.error('❌ Failed to load sleep data:', result.error);
      }
    } catch (error) {
      console.error('❌ Error loading sleep data:', error);
    } finally {
      setLoading(false);
    }
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

    const dailyData = data.dailyData.slice(-7); // Last 7 days
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
          {dailyData.map((day: any, index: number) => (
            <Text
              key={index}
              style={[
                styles.xAxisLabel,
                { color: theme.colors.textSecondary, left: padding.left + index * xStep - 10 },
              ]}
            >
              {index}
            </Text>
          ))}
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
            Your Insights
          </Text>
          <Text style={[styles.barChartSubtitle, { color: theme.colors.textSecondary }]}>
            Updated 1 week ago • {period === 'week' ? 'July 2025' : period === 'month' ? 'Last 30 days' : 'Last 12 months'}
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
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: theme.colors.primary }]}>See all</Text>
          </TouchableOpacity>
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
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: theme.colors.primary }]}>See all</Text>
            </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '500',
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
    fontSize: 16,
    fontWeight: '600',
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
});
