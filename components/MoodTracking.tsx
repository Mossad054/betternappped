import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Polyline, Circle, Line, Path, G, Text as SvgText } from 'react-native-svg';
import { MoodData, getMoodStreak, TimeRange } from '@/constants/mockData';
import { useTheme } from '@/contexts/ThemeContext';

interface MoodTrackingProps {
  data: MoodData[];
  timeRange: TimeRange;
}

export default function MoodTracking({ data, timeRange }: MoodTrackingProps) {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const streak = getMoodStreak(data);
  
  const getStreakColor = (type: 'good' | 'neutral' | 'bad') => {
    switch (type) {
      case 'good': return theme.colors.primary;
      case 'neutral': return theme.colors.warning;
      case 'bad': return theme.colors.error;
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
      { ...distribution.good, color: theme.colors.primary, label: 'Good' },
      { ...distribution.neutral, color: theme.colors.warning, label: 'Neutral' },
      { ...distribution.bad, color: theme.colors.error, label: 'Challenging' }
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
            {streak.count}-day {getStreakText(streak.type)} streak
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  singleDayContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  singleDayEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  singleDayText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  moodDistribution: {
    marginTop: 16,
  },
  distributionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  distributionBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
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
    borderRadius: 4,
    marginRight: 6,
  },
  distributionLabelText: {
    fontSize: 12,
    color: '#6B7280',
  },
  pieChartContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  pieChartLabels: {
    marginTop: 16,
    alignItems: 'center',
  },
  pieChartLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pieChartDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  pieChartLabelText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});