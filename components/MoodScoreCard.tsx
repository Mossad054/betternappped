import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AnalyticsService, MoodScoreAnalysis } from '@/services/analytics.service';
import Svg, { Circle, G, Text as SvgText, Path } from 'react-native-svg';
import { Typography } from '@/constants/Typography';

interface MoodScoreCardProps {
  userId: string;
  period: 'today' | 'week' | 'month' | 'year';
}

export default function MoodScoreCard({ userId, period }: MoodScoreCardProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<MoodScoreAnalysis | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadMoodAnalysis();
  }, [userId, period]);

  const loadMoodAnalysis = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading mood analysis...');
      const result = await AnalyticsService.getMoodScoreAnalysis(userId, period);

      if (result.data) {
        setAnalysis(result.data);

        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      } else {
        console.error('❌ Failed to load mood analysis:', result.error);
      }
    } catch (error) {
      console.error('❌ Error loading mood analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return theme.colors.success;
    if (trend === 'down') return theme.colors.error;
    return theme.colors.warning;
  };

  const getTrendText = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'Improving';
    if (trend === 'down') return 'Declining';
    return 'Stable';
  };

  const getMoodColor = (score: number) => {
    if (score >= 4.5) return theme.colors.moodHappy;
    if (score >= 3.5) return theme.colors.moodGood;
    if (score >= 2.5) return theme.colors.moodNeutral;
    if (score >= 1.5) return theme.colors.moodBad;
    return theme.colors.moodSad;
  };

  const renderGaugeChart = () => {
    if (!analysis) return null;

    const width = 320;
    const height = 220;
    const centerX = width / 2;
    const centerY = height - 60; // Position center near bottom
    const radius = 120;
    const strokeWidth = 32;

    // Calculate angle for the needle (180-360 degrees for bottom semicircle)
    // Score 1 = 180° (left), Score 5 = 360°/0° (right)
    const needleAngle = 180 + ((analysis.averageMood - 1) / 4) * 180;

    // Define color segments for the gauge (vertical speedometer style)
    // Goes from left (bad) to right (good) - bottom semicircle
    const segments = [
      { startAngle: 180, endAngle: 215, color: '#FF4444', label: 'Awful', emoji: '😢' },
      { startAngle: 216, endAngle: 251, color: '#FF8C42', label: 'Bad', emoji: '😕' },
      { startAngle: 252, endAngle: 287, color: '#FFD93D', label: 'Okay', emoji: '😐' },
      { startAngle: 288, endAngle: 323, color: '#95E1D3', label: 'Good', emoji: '🙂' },
      { startAngle: 324, endAngle: 360, color: '#38E54D', label: 'Great', emoji: '😊' },
    ];

    const polarToCartesian = (angle: number, r: number) => {
      const angleInRadians = (angle * Math.PI) / 180;
      return {
        x: centerX + r * Math.cos(angleInRadians),
        y: centerY + r * Math.sin(angleInRadians),
      };
    };

    const createArc = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
      const start = polarToCartesian(startAngle, outerRadius);
      const end = polarToCartesian(endAngle, outerRadius);
      const startInner = polarToCartesian(startAngle, innerRadius);
      const endInner = polarToCartesian(endAngle, innerRadius);
      
      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

      return `
        M ${start.x} ${start.y}
        A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}
        L ${endInner.x} ${endInner.y}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}
        Z
      `;
    };

    const needleEnd = polarToCartesian(needleAngle, radius - strokeWidth / 2);

    // Calculate emoji positions (outside the gauge, like speedometer)
    const emojiRadius = radius + 20;
    const emojiPositions = segments.map(segment => {
      const midAngle = (segment.startAngle + segment.endAngle) / 2;
      return {
        ...polarToCartesian(midAngle, emojiRadius),
        ...segment,
      };
    });

    return (
      <View style={styles.chartContainer}>
        <Svg width={width} height={height}>
          {/* Complete semicircular gauge - all color segments always visible */}
          {segments.map((segment, index) => (
            <Path
              key={`segment-${index}`}
              d={createArc(segment.startAngle, segment.endAngle, radius - strokeWidth, radius)}
              fill={segment.color}
              opacity={1}
            />
          ))}

          {/* Emoji indicators outside the gauge */}
          {emojiPositions.map((pos, index) => (
            <SvgText 
              key={`emoji-${index}`}
              x={pos.x} 
              y={pos.y + 8} 
              fontSize="24" 
              textAnchor="middle"
            >
              {pos.emoji}
            </SvgText>
          ))}

          {/* Needle base circle (larger for visibility) */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={12}
            fill={theme.colors.text}
          />

          {/* Needle (car speedometer style) */}
          <Path
            d={`M ${centerX} ${centerY} L ${needleEnd.x} ${needleEnd.y}`}
            stroke={theme.colors.text}
            strokeWidth={6}
            strokeLinecap="round"
          />
          
          {/* Needle tip */}
          <Circle
            cx={needleEnd.x}
            cy={needleEnd.y}
            r={7}
            fill={theme.colors.text}
          />
        </Svg>
        
        {/* Mood labels below gauge */}
        <View style={styles.moodLabelsContainer}>
          {segments.map((segment, index) => (
            <View key={index} style={styles.moodLabelItem}>
              <View style={[styles.moodColorDot, { backgroundColor: segment.color }]} />
              <Text style={[styles.moodLabelText, { color: theme.colors.textSecondary }]}>
                {segment.label}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Score display */}
        <View style={styles.scoreDisplay}>
          <Text style={[styles.scoreValue, { color: theme.colors.text }]}>
            {analysis.averageMood.toFixed(1)}
          </Text>
          <Text style={[styles.scoreLabel, { color: theme.colors.textSecondary }]}>
            / 5.0
          </Text>
        </View>
      </View>
    );
  };

  const renderMoodDistribution = () => {
    if (!analysis) return null;

    const { moodDistribution, totalEntries } = analysis;
    
    // Match speedometer colors with descriptive labels and relevant emojis
    const bars = [
      { label: 'Great Days', description: 'Feeling fantastic', count: moodDistribution.great, color: '#38E54D', emoji: '😊' },
      { label: 'Good Days', description: 'Feeling positive', count: moodDistribution.good, color: '#95E1D3', emoji: '🙂' },
      { label: 'Okay Days', description: 'Feeling neutral', count: moodDistribution.fair, color: '#FFD93D', emoji: '😐' },
      { label: 'Tough Days', description: 'Feeling down', count: moodDistribution.tough, color: '#FF8C42', emoji: '😔' },
    ];

    return (
      <View style={styles.distributionContainer}>
        <Text style={[styles.distributionTitle, { color: theme.colors.textSecondary }]}>
          Mood Distribution
        </Text>
        <View style={styles.barsContainer}>
          {bars.map((bar, index) => {
            const percentage = totalEntries > 0 ? (bar.count / totalEntries) * 100 : 0;
            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barLabelContainer}>
                  <Text style={[styles.barEmoji]}>{bar.emoji}</Text>
                  <View style={styles.barLabelTextContainer}>
                    <Text style={[styles.barLabel, { color: theme.colors.text }]}>
                      {bar.label}
                    </Text>
                    <Text style={[styles.barDescription, { color: theme.colors.textSecondary }]}>
                      {bar.description}
                    </Text>
                  </View>
                </View>
                <View style={styles.barChartContainer}>
                  <View style={styles.barBackground}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${percentage}%`,
                          backgroundColor: bar.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barCount, { color: theme.colors.textSecondary }]}>
                    {bar.count}
                  </Text>
                </View>
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
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Mood Score</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Analyzing your mood...
          </Text>
        </View>
      </View>
    );
  }

  if (!analysis || analysis.totalEntries === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Mood Score</Text>
          <Text style={[styles.period, { color: theme.colors.textSecondary }]}>
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            No mood data yet
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {analysis.insights[0]}
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
          <Text style={[styles.title, { color: theme.colors.text }]}>Mood Score</Text>
          <Text style={[styles.period, { color: theme.colors.textSecondary }]}>
            {analysis.period}
          </Text>
        </View>
        <View style={[styles.trendBadge, { backgroundColor: getTrendColor(analysis.trend) + '20' }]}>
          <Text style={[styles.trendIcon, { color: getTrendColor(analysis.trend) }]}>
            {getTrendIcon(analysis.trend)}
          </Text>
          <Text style={[styles.trendText, { color: getTrendColor(analysis.trend) }]}>
            {getTrendText(analysis.trend)}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Gauge Chart */}
        {renderGaugeChart()}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {analysis.totalEntries}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Entries
            </Text>
          </View>
          {analysis.weekComparison && (
            <View style={styles.statItem}>
              <Text style={[
                styles.statValue,
                { color: analysis.weekComparison.change >= 0 ? theme.colors.success : theme.colors.error }
              ]}>
                {analysis.weekComparison.change > 0 ? '+' : ''}{analysis.weekComparison.change.toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                vs Last Week
              </Text>
            </View>
          )}
          {analysis.bestMoodDay && period !== 'today' && (
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {analysis.bestMoodDay.score.toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Best Day{'\n'}
                {new Date(analysis.bestMoodDay.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          )}
        </View>

        {/* Insights */}
        <View style={styles.insightsContainer}>
          {analysis.insights.map((insight, index) => (
            <View key={index} style={[styles.insightItem, { backgroundColor: theme.colors.primary + '10' }]}>
              <Text style={[styles.insightText, { color: theme.colors.text }]}>
                • {insight}
              </Text>
            </View>
          ))}
        </View>

        {/* Mood Distribution */}
        {renderMoodDistribution()}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
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
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    ...Typography.analytics.cardTitle,
    marginBottom: 4,
  },
  period: {
    ...Typography.analytics.caption,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  trendIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  trendText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    gap: 20,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 5,
    paddingBottom: 10,
  },
  moodLabelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 10,
  },
  moodLabelItem: {
    alignItems: 'center',
    gap: 6,
  },
  moodColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  moodLabelText: {
    fontSize: 11,
    fontWeight: '600',
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginTop: 12,
    gap: 4,
  },
  scoreValue: {
    ...Typography.analytics.kpiValue,
  },
  scoreLabel: {
    ...Typography.analytics.kpiLabel,
  },
  personalContextContainer: {
    gap: 12,
    marginTop: 8,
  },
  normalizedScoreBar: {
    gap: 8,
  },
  normalizedScoreTrack: {
    height: 40,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 20,
    position: 'relative',
    overflow: 'visible',
  },
  normalizedScoreFill: {
    height: '100%',
    borderRadius: 20,
    transition: 'width 0.3s ease',
  },
  normalizedScoreMarker: {
    position: 'absolute',
    top: -8,
    width: 56,
    height: 56,
    borderRadius: 28,
    marginLeft: -28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  normalizedScoreValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  normalizedScoreLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  normalizedScoreLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  contextBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
  },
  contextIcon: {
    fontSize: 20,
  },
  contextText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    ...Typography.analytics.statValue,
  },
  statLabel: {
    ...Typography.analytics.statLabel,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  insightsContainer: {
    gap: 8,
  },
  insightItem: {
    padding: 12,
    borderRadius: 12,
  },
  insightText: {
    ...Typography.analytics.bodyText,
  },
  distributionContainer: {
    gap: 12,
  },
  distributionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  barsContainer: {
    gap: 12,
  },
  barWrapper: {
    gap: 8,
  },
  barLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  barLabelTextContainer: {
    flex: 1,
  },
  barEmoji: {
    fontSize: 20,
    width: 28,
  },
  barLabel: {
    ...Typography.analytics.subsectionTitle,
    marginBottom: 2,
  },
  barDescription: {
    ...Typography.analytics.caption,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 38,
  },
  barBackground: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  barCount: {
    fontSize: 13,
    fontWeight: '600',
    width: 28,
    textAlign: 'right',
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
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 250,
  },
});
