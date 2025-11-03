import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Polyline, Circle, Line, Path, G, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';

interface MoodData {
  id: string;
  date: string;
  score: number;
  emoji: string;
  notes?: string;
}

interface MoodTrackingProps {
  data: MoodData[];
  timeRange: 'week' | 'month' | 'year';
}

export default function MoodTracking({ data, timeRange }: MoodTrackingProps) {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  // Calculate streak from live data
  const getMoodStreak = (moodData: MoodData[]) => {
    if (!moodData || moodData.length === 0) return { type: 'neutral', days: 0 };
    
    const sortedData = moodData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    let currentType: 'good' | 'neutral' | 'bad' = 'neutral';
    
    for (const mood of sortedData) {
      const score = mood.score;
      let moodType: 'good' | 'neutral' | 'bad';
      
      if (score >= 4) moodType = 'good';
      else if (score === 3) moodType = 'neutral';
      else moodType = 'bad';
      
      if (streak === 0) {
        currentType = moodType;
        streak = 1;
      } else if (moodType === currentType) {
        streak++;
      } else {
        break;
      }
    }
    
    return { type: currentType, days: streak };
  };
  
  const streak = getMoodStreak(data);
  
  const getStreakColor = (type: 'good' | 'neutral' | 'bad') => {
    switch (type) {
      case 'good': return theme.colors.moodHappy;
      case 'neutral': return theme.colors.moodNeutral;
      case 'bad': return theme.colors.moodSad;
    }
  };

  const getStreakText = (type: 'good' | 'neutral' | 'bad') => {
    switch (type) {
      case 'good': return 'good mood';
      case 'neutral': return 'neutral mood';
      case 'bad': return 'challenging';
    }
  };

  const getMoodDistribution = () => {
    const goodCount = data.filter(d => d.score >= 4).length;
    const neutralCount = data.filter(d => d.score === 3).length;
    const badCount = data.filter(d => d.score <= 2).length;
    const total = data.length || 1;
    
    return {
      good: { count: goodCount, percentage: Math.round((goodCount / total) * 100) },
      neutral: { count: neutralCount, percentage: Math.round((neutralCount / total) * 100) },
      bad: { count: badCount, percentage: Math.round((badCount / total) * 100) }
    };
  };

  const renderPieChart = () => {
    const distribution = getMoodDistribution();
    const chartSize = 120;
    const radius = 50;
    const centerX = chartSize / 2;
    const centerY = chartSize / 2;
    
    let currentAngle = -90; // Start from top
    const segments = [
      { ...distribution.good, color: theme.colors.moodHappy, label: 'Good' },
      { ...distribution.neutral, color: theme.colors.moodNeutral, label: 'Neutral' },
      { ...distribution.bad, color: theme.colors.moodSad, label: 'Challenging' }
    ].filter(segment => segment.percentage > 0);
    
    return (
      <View style={styles.pieChartContainer}>
        <Svg width={chartSize} height={chartSize}>
          {segments.map((segment, index) => {
            const angle = (segment.percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            
            const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');
            
            currentAngle += angle;
            
            return (
              <Path
                key={`segment-${segment.label}-${index}`}
                d={pathData}
                fill={segment.color}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
            );
          })}
        </Svg>
        <View style={styles.pieChartLabels}>
          {segments.map((segment, index) => (
            <View key={`label-${segment.label}-${index}`} style={styles.pieChartLabel}>
              <View style={[styles.pieChartDot, { backgroundColor: segment.color }]} />
              <Text style={styles.pieChartLabelText}>
                {segment.label} ({segment.percentage}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderLineChart = () => {
    const chartWidth = width - 80;
    const chartHeight = 200;
    const padding = { left: 50, top: 20, right: 40, bottom: 50 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    const points = data.map((item, index) => {
      const x = padding.left + (index / (data.length - 1)) * plotWidth;
      const y = padding.top + ((5 - item.score) / 4) * plotHeight;
      return { x, y, score: item.score, emoji: item.emoji, date: item.date };
    });

    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    const formatXAxisLabel = (date: string, index: number) => {
      if (timeRange === 'month') {
        const d = new Date(date);
        return index % 5 === 0 ? `${d.getMonth() + 1}/${d.getDate()}` : '';
      } else if (timeRange === 'year') {
        const d = new Date(date);
        return index % 2 === 0 ? d.toLocaleDateString('en', { month: 'short' }) : '';
      }
      return '';
    };

    return (
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid lines */}
        {[1, 2, 3, 4, 5].map((score) => {
          const y = padding.top + ((5 - score) / 4) * plotHeight;
          return (
            <G key={score}>
              <Line
                x1={padding.left}
                y1={y}
                x2={chartWidth - padding.right}
                y2={y}
                stroke="#E5E7EB"
                strokeWidth={1}
              />
              <SvgText
                x={padding.left - 10}
                y={y + 4}
                fontSize={12}
                fill="#6B7280"
                textAnchor="end"
              >
                {score.toString()}
              </SvgText>
            </G>
          );
        })}
        
        {/* X-axis labels */}
        {points.map((point, index) => {
          const label = formatXAxisLabel(point.date, index);
          if (!label) return null;
          return (
            <SvgText
              key={`x-${index}`}
              x={point.x}
              y={chartHeight - padding.bottom + 20}
              fontSize={10}
              fill="#6B7280"
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
        
        {/* Y-axis label */}
        <SvgText
          x={15}
          y={chartHeight / 2}
          fontSize={12}
          fill="#6B7280"
          textAnchor="middle"
          transform={`rotate(-90, 15, ${chartHeight / 2})`}
        >
          {'Mood Score'}
        </SvgText>
        
        {/* X-axis label */}
        <SvgText
          x={chartWidth / 2}
          y={chartHeight - 10}
          fontSize={12}
          fill="#6B7280"
          textAnchor="middle"
        >
          {timeRange === 'month' ? 'Days' : timeRange === 'year' ? 'Months' : 'Time'}
        </SvgText>
        
        {/* Line chart */}
        <Polyline
          points={pathData.replace(/[ML]/g, '').trim()}
          fill="none"
          stroke={theme.colors.primary}
          strokeWidth={3}
        />
        
        {/* Data points */}
        {points.map((point, index) => (
          <Circle
            key={`${point.x}-${point.y}`}
            cx={point.x}
            cy={point.y}
            r={6}
            fill={theme.colors.primary}
          />
        ))}
      </Svg>
    );
  };

  const renderChart = () => {
    if (!data || data.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateEmoji}>📊</Text>
          <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
            No mood data yet. Start tracking your mood to see insights here!
          </Text>
        </View>
      );
    }

    if (data.length <= 1) {
      return (
        <View style={styles.singleDayContainer}>
          <Text style={styles.singleDayEmoji}>{data[0]?.emoji || '😐'}</Text>
          <Text style={[styles.singleDayText, { color: theme.colors.text }]}>
            You felt {data[0]?.emoji || '😐'} {getStreakText(streak.type)} today
          </Text>
        </View>
      );
    }

    if (timeRange === 'week') {
      return renderPieChart();
    } else if (timeRange === 'month' || timeRange === 'year') {
      return renderLineChart();
    }

    // Default line chart for other cases
    return renderLineChart();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Mood Tracking</Text>
        <View style={[styles.streakBadge, { backgroundColor: getStreakColor(streak.type) }]}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>
            {streak.days}-day {getStreakText(streak.type)} streak
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        {renderChart()}
      </View>

      {timeRange !== 'week' && (
        <View style={styles.moodDistribution}>
          <Text style={[styles.distributionTitle, { color: theme.colors.text }]}>Mood Distribution</Text>
          <View style={styles.distributionBar}>
            {(() => {
              const distribution = getMoodDistribution();
              return (
                <>
                  <View style={[styles.distributionSegment, { flex: distribution.good.percentage / 100, backgroundColor: theme.colors.primary }]} />
                  <View style={[styles.distributionSegment, { flex: distribution.neutral.percentage / 100, backgroundColor: theme.colors.warning }]} />
                  <View style={[styles.distributionSegment, { flex: distribution.bad.percentage / 100, backgroundColor: theme.colors.error }]} />
                </>
              );
            })()} 
          </View>
          <View style={styles.distributionLabels}>
            {(() => {
              const distribution = getMoodDistribution();
              return (
                <>
                  <View style={styles.distributionLabel}>
                    <View style={[styles.distributionDot, { backgroundColor: theme.colors.primary }]} />
                    <Text style={[styles.distributionLabelText, { color: theme.colors.textSecondary }]}>Good ({distribution.good.percentage}%)</Text>
                  </View>
                  <View style={styles.distributionLabel}>
                    <View style={[styles.distributionDot, { backgroundColor: theme.colors.warning }]} />
                    <Text style={[styles.distributionLabelText, { color: theme.colors.textSecondary }]}>Neutral ({distribution.neutral.percentage}%)</Text>
                  </View>
                  <View style={styles.distributionLabel}>
                    <View style={[styles.distributionDot, { backgroundColor: theme.colors.error }]} />
                    <Text style={[styles.distributionLabelText, { color: theme.colors.textSecondary }]}>Challenging ({distribution.bad.percentage}%)</Text>
                  </View>
                </>
              );
            })()}
          </View>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    ...theme.components.card,
    marginHorizontal: theme.spacing.screenHorizontal,
    marginBottom: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md - 2,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.xl,
    ...theme.elevation.small,
  },
  streakEmoji: {
    fontSize: 14,
    marginRight: theme.spacing.xs,
  },
  streakText: {
    ...theme.typography.captionSmall,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.screenVertical,
  },
  singleDayContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyStateContainer: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.elementGap,
  },
  emptyStateText: {
    ...theme.typography.body,
    textAlign: 'center',
  },
  singleDayEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.elementGap,
  },
  singleDayText: {
    ...theme.typography.bodyLarge,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  moodDistribution: {
    marginTop: theme.spacing.md,
  },
  distributionTitle: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  distributionBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: theme.radii.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.elementGap,
  },
  distributionSegment: {
    height: '100%',
  },
  distributionLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  distributionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distributionDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radii.xs,
    marginRight: theme.spacing.chipGap - 2,
  },
  distributionLabelText: {
    ...theme.typography.caption,
  },
  pieChartContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.screenVertical,
  },
  pieChartLabels: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  pieChartLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  pieChartDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radii.xs,
    marginRight: theme.spacing.sm,
  },
  pieChartLabelText: {
    ...theme.typography.body,
    fontWeight: '500',
  },
});
