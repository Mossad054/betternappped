import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AnalyticsService } from '@/services/analytics.service';
import Svg, { Rect, Circle, Line, Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SleepTrackingEnhancedProps {
  userId: string;
  period: 'week' | 'month' | 'year';
  sleepTarget?: number;
}

type SleepStatus = 'excellent' | 'good' | 'fair' | 'poor';

interface DailyData {
  date: string;
  duration: number;
  quality: number;
  metTarget: boolean;
  status: SleepStatus;
  bedtime: string;
  wakeTime: string;
}

export default function SleepTrackingEnhanced({
  userId,
  period,
  sleepTarget = 8.0,
}: SleepTrackingEnhancedProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<DailyData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadSleepData();
  }, [userId, period]);

  const loadSleepData = async () => {
    setLoading(true);
    try {
      console.log('🛌 Loading sleep tracking data...');
      const result = await AnalyticsService.getSleepTrackingAnalysis(userId, period, sleepTarget);

      if (result.data) {
        setData(result.data);

        // Fade in animation
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

  const getStatusColor = (status: SleepStatus) => {
    switch (status) {
      case 'excellent':
        return '#10B981'; // Green
      case 'good':
        return '#22C55E'; // Light green
      case 'fair':
        return '#F59E0B'; // Amber
      case 'poor':
        return '#EF4444'; // Red
      default:
        return theme.colors.textSecondary;
    }
  };

  const getHoursColor = (hours: number, target: number) => {
    if (hours >= target && hours <= target + 2) return '#10B981'; // Met target
    if (hours >= target - 1 && hours < target) return '#22C55E'; // Close
    if (hours >= target - 2 && hours < target - 1) return '#F59E0B'; // Below
    return '#EF4444'; // Far below
  };

  const renderWeeklyView = () => {
    if (!data || !data.dailyData) return null;

    const dailyData = data.dailyData.slice(-7); // Last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const maxHours = 12;
    const barHeight = 100;

    return (
      <View style={styles.weeklyView}>
        <Text style={[styles.viewTitle, { color: theme.colors.text }]}>
          7-Day Sleep Pattern
        </Text>

        <View style={styles.barsContainer}>
          {dailyData.map((day: DailyData, index: number) => {
            const date = new Date(day.date);
            const dayName = days[date.getDay()];
            const dayNum = date.getDate();
            const height = (day.duration / maxHours) * barHeight;
            const color = getStatusColor(day.status);

            return (
              <TouchableOpacity
                key={day.date}
                style={styles.barWrapper}
                onPress={() => {
                  setSelectedDay(day);
                  setModalVisible(true);
                }}
              >
                <View style={styles.barColumn}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height,
                          backgroundColor: color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barHours, { color: theme.colors.text }]}>
                    {day.duration.toFixed(1)}h
                  </Text>
                </View>
                <Text style={[styles.barLabel, { color: theme.colors.textSecondary }]}>
                  {dayName}
                </Text>
                <Text style={[styles.barDate, { color: theme.colors.textSecondary }]}>
                  {dayNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.targetLine}>
          <View style={[styles.targetDash, { backgroundColor: theme.colors.primary }]} />
          <Text style={[styles.targetLabel, { color: theme.colors.primary }]}>
            Target: {sleepTarget}h
          </Text>
        </View>
      </View>
    );
  };

  const renderMonthlyView = () => {
    if (!data || !data.dailyData) return null;

    const dailyData = data.dailyData;
    const startDate = new Date(dailyData[0]?.date || new Date());
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    
    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create calendar grid
    const weeks: (DailyData | null)[][] = [];
    let week: (DailyData | null)[] = new Array(firstDay).fill(null);
    
    // Create date lookup map
    const dateMap = new Map<string, DailyData>(dailyData.map((d: DailyData) => [d.date, d]));
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = dateMap.get(dateStr);
      
      week.push(dayData || null);
      
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    return (
      <View style={styles.monthlyView}>
        <Text style={[styles.viewTitle, { color: theme.colors.text }]}>
          Monthly Sleep Calendar
        </Text>

        <View style={styles.calendarHeader}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <Text key={i} style={[styles.calendarHeaderDay, { color: theme.colors.textSecondary }]}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.calendarWeek}>
              {week.map((day, dayIndex) => {
                if (!day) {
                  return <View key={`empty-${weekIndex}-${dayIndex}`} style={styles.calendarDay} />;
                }

                const date = new Date(day.date);
                const dayNum = date.getDate();
                const color = getStatusColor(day.status);

                return (
                  <TouchableOpacity
                    key={day.date}
                    style={[styles.calendarDay, { backgroundColor: color + '20', borderColor: color }]}
                    onPress={() => {
                      setSelectedDay(day);
                      setModalVisible(true);
                    }}
                  >
                    <Text style={[styles.calendarDayNumber, { color: theme.colors.text }]}>
                      {dayNum}
                    </Text>
                    <Text style={[styles.calendarDayHours, { color }]}>
                      {day.duration.toFixed(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
              Excellent
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
              Good
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
              Fair
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
              Poor
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderYearlyView = () => {
    if (!data || !data.monthlyData) return null;

    const monthlyData = data.monthlyData;
    const chartWidth = SCREEN_WIDTH - 80;
    const chartHeight = 160;
    const padding = { top: 20, right: 10, bottom: 30, left: 40 };
    const maxHours = 10;

    // Calculate points for line chart
    const xStep = (chartWidth - padding.left - padding.right) / (monthlyData.length - 1 || 1);
    const points = monthlyData.map((month: any, index: number) => ({
      x: padding.left + index * xStep,
      y: padding.top + (chartHeight - padding.top - padding.bottom) * (1 - month.avgDuration / maxHours),
      duration: month.avgDuration,
      month: month.month.substring(0, 3),
    }));

    // Create path for line chart
    const linePath = points
      .map((point, index) => (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
      .join(' ');

    // Create path for area under line
    const areaPath =
      linePath +
      ` L ${points[points.length - 1].x} ${chartHeight - padding.bottom}` +
      ` L ${padding.left} ${chartHeight - padding.bottom} Z`;

    return (
      <View style={styles.yearlyView}>
        <Text style={[styles.viewTitle, { color: theme.colors.text }]}>
          Yearly Sleep Trend
        </Text>

        <View style={styles.chartContainer}>
          <Svg width={chartWidth} height={chartHeight}>
            {/* Grid lines */}
            {[0, 2, 4, 6, 8, 10].map((hour) => {
              const y = padding.top + (chartHeight - padding.top - padding.bottom) * (1 - hour / maxHours);
              return (
                <Line
                  key={hour}
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke={theme.colors.border || '#E5E7EB'}
                  strokeWidth={1}
                  strokeDasharray="4,4"
                />
              );
            })}

            {/* Target line */}
            <Line
              x1={padding.left}
              y1={padding.top + (chartHeight - padding.top - padding.bottom) * (1 - sleepTarget / maxHours)}
              x2={chartWidth - padding.right}
              y2={padding.top + (chartHeight - padding.top - padding.bottom) * (1 - sleepTarget / maxHours)}
              stroke={theme.colors.primary || '#3B82F6'}
              strokeWidth={2}
              strokeDasharray="6,3"
            />

            {/* Area under line */}
            <Path d={areaPath} fill={theme.colors.primary + '20' || '#3B82F620'} />

            {/* Line */}
            <Path d={linePath} stroke={theme.colors.primary || '#3B82F6'} strokeWidth={3} fill="none" />

            {/* Data points */}
            {points.map((point, index) => (
              <Circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={4}
                fill={point.duration >= sleepTarget ? '#10B981' : '#F59E0B'}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            ))}

            {/* Y-axis labels */}
            {[0, 2, 4, 6, 8, 10].map((hour) => {
              const y = padding.top + (chartHeight - padding.top - padding.bottom) * (1 - hour / maxHours);
              return (
                <text
                  key={`label-${hour}`}
                  x={padding.left - 10}
                  y={y + 4}
                  fontSize="10"
                  fill={theme.colors.textSecondary}
                  textAnchor="end"
                >
                  {hour}h
                </text>
              );
            })}
          </Svg>

          {/* X-axis labels */}
          <View style={styles.xAxisLabels}>
            {points.map((point, index) => (
              <Text
                key={index}
                style={[
                  styles.xAxisLabel,
                  { color: theme.colors.textSecondary, left: point.x - 15 },
                ]}
              >
                {point.month}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.yearlyStats}>
          {data.monthlyData.map((month: any, index: number) => (
            <View key={index} style={styles.monthStat}>
              <Text style={[styles.monthName, { color: theme.colors.text }]}>
                {month.month.substring(0, 3)}
              </Text>
              <Text style={[styles.monthHours, { color: getHoursColor(month.avgDuration, sleepTarget) }]}>
                {month.avgDuration.toFixed(1)}h
              </Text>
              <Text style={[styles.monthDays, { color: theme.colors.textSecondary }]}>
                {month.daysLogged} days
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Sleep Tracking</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Analyzing sleep patterns...
          </Text>
        </View>
      </View>
    );
  }

  if (!data || data.summary.totalNights === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Sleep Tracking</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>😴</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No sleep data yet</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Start logging your sleep to see beautiful insights and patterns!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.colors.card, opacity: fadeAnim }]}>
      {/* Header with Summary */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Sleep Tracking</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {data.period}
          </Text>
        </View>
        <View style={styles.summaryBadge}>
          <Text style={[styles.avgHours, { color: theme.colors.primary }]}>
            {data.summary.avgSleep}h
          </Text>
          <Text style={[styles.avgLabel, { color: theme.colors.textSecondary }]}>avg</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {data.summary.daysMetTarget}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Met Target
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {data.summary.consistency}%
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Consistency
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>
            {data.summary.qualityAvg.toFixed(1)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Quality
          </Text>
        </View>
      </View>

      {/* Visualization based on period */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {period === 'week' && renderWeeklyView()}
        {period === 'month' && renderMonthlyView()}
        {period === 'year' && renderYearlyView()}

        {/* Insights */}
        {data.insights && data.insights.length > 0 && (
          <View style={styles.insightsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              💡 Insights
            </Text>
            {data.insights.map((insight: string, index: number) => (
              <View
                key={index}
                style={[styles.insightCard, { backgroundColor: theme.colors.primary + '10' }]}
              >
                <Text style={[styles.insightText, { color: theme.colors.text }]}>
                  {insight}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Sleep Details
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: theme.colors.textSecondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {selectedDay && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.modalDetailHeader}>
                  <View
                    style={[
                      styles.modalStatusBadge,
                      { backgroundColor: getStatusColor(selectedDay.status) },
                    ]}
                  >
                    <Text style={styles.modalStatusText}>
                      {selectedDay.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.modalDate, { color: theme.colors.textSecondary }]}>
                    {new Date(selectedDay.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>

                <View style={styles.modalMainStat}>
                  <Text style={[styles.modalHours, { color: theme.colors.text }]}>
                    {selectedDay.duration.toFixed(1)}h
                  </Text>
                  <Text style={[styles.modalHoursLabel, { color: theme.colors.textSecondary }]}>
                    Total Sleep
                  </Text>
                </View>

                <View style={styles.modalDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                      Bedtime
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.textSecondary }]}>
                      {selectedDay.bedtime}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text }]}>
                      Wake Time
                    </Text>
                    <Text style={[styles.detailValue, { color: theme.colors.textSecondary }]}>
                      {selectedDay.wakeTime}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Quality</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.textSecondary }]}>
                      {selectedDay.quality}/5 {'⭐'.repeat(selectedDay.quality)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target</Text>
                    <Text style={[styles.detailValue, { color: getStatusColor(selectedDay.status) }]}>
                      {selectedDay.metTarget ? '✓ Met target' : `${(sleepTarget - selectedDay.duration).toFixed(1)}h short`}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
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
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  summaryBadge: {
    alignItems: 'center',
  },
  avgHours: {
    fontSize: 28,
    fontWeight: '700',
  },
  avgLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  content: {
    maxHeight: 500,
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
  // Weekly View
  weeklyView: {
    marginBottom: 20,
  },
  viewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    marginBottom: 12,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barColumn: {
    alignItems: 'center',
    marginBottom: 8,
  },
  barContainer: {
    height: 100,
    justifyContent: 'flex-end',
    width: 30,
  },
  bar: {
    width: 30,
    borderRadius: 6,
  },
  barHours: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  barDate: {
    fontSize: 9,
    marginTop: 2,
  },
  targetLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  targetDash: {
    width: 20,
    height: 2,
    marginRight: 6,
  },
  targetLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  // Monthly View
  monthlyView: {
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  calendarHeaderDay: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    gap: 4,
  },
  calendarWeek: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 4,
  },
  calendarDay: {
    width: 36,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  calendarDayNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  calendarDayHours: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '500',
  },
  // Yearly View
  yearlyView: {
    marginBottom: 20,
  },
  chartContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  xAxisLabels: {
    position: 'relative',
    height: 20,
    marginTop: 4,
  },
  xAxisLabel: {
    position: 'absolute',
    fontSize: 9,
    fontWeight: '500',
    width: 30,
    textAlign: 'center',
  },
  yearlyStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  monthStat: {
    alignItems: 'center',
    minWidth: 60,
  },
  monthName: {
    fontSize: 11,
    fontWeight: '600',
  },
  monthHours: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  monthDays: {
    fontSize: 9,
    marginTop: 2,
  },
  // Insights
  insightsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  insightCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 13,
    lineHeight: 18,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
  },
  modalBody: {
    padding: 20,
  },
  modalDetailHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  modalStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalDate: {
    fontSize: 14,
  },
  modalMainStat: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalHours: {
    fontSize: 36,
    fontWeight: '700',
  },
  modalHoursLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  modalDetails: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
  },
});
