import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ConnectionScoreService, ScoreBreakdown } from '@/services/connectionScore.service';
import { useAuth } from '@/contexts/AuthContext';

interface ConnectionScoreCardProps {
  onPress?: () => void;
}

export default function ConnectionScoreCard({ onPress }: ConnectionScoreCardProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [score, setScore] = useState<number>(0);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [change, setChange] = useState<number>(0);
  const [breakdown, setBreakdown] = useState<ScoreBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  const progressAnim = new Animated.Value(0);

  useEffect(() => {
    loadScore();
  }, [user]);

  const loadScore = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Get latest score
      const { data: latestScore } = await ConnectionScoreService.getLatestScore(user.id);

      if (latestScore) {
        setScore(latestScore.total_score);

        // Get breakdown
        const { data: breakdownData } = await ConnectionScoreService.getScoreBreakdown(
          user.id,
          latestScore.date
        );

        setBreakdown(breakdownData);

        // Get previous week score for trend
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const { data: scoreHistory } = await ConnectionScoreService.getScoreHistory(
          user.id,
          weekAgo.toISOString().split('T')[0],
          latestScore.date
        );

        if (scoreHistory && scoreHistory.length > 1) {
          const previousScore = scoreHistory[scoreHistory.length - 1].total_score;
          const changeValue = latestScore.total_score - previousScore;
          setChange(Math.abs(changeValue));

          if (changeValue > 5) setTrend('up');
          else if (changeValue < -5) setTrend('down');
          else setTrend('stable');
        }

        // Animate progress
        Animated.timing(progressAnim, {
          toValue: latestScore.total_score,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      }
    } catch (error) {
      console.error('Error loading connection score:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = () => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Orange
    if (score >= 40) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  const getScoreLabel = () => {
    if (score >= 80) return 'Thriving';
    if (score >= 60) return 'Strong';
    if (score >= 40) return 'Growing';
    return 'Building';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp size={16} color="#10B981" />;
    if (trend === 'down') return <TrendingDown size={16} color="#EF4444" />;
    return <Minus size={16} color="#6B7280" />;
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 24,
      ...theme.shadows.medium,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    infoButton: {
      padding: 4,
    },
    scoreContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    scoreCircle: {
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      borderWidth: 8,
    },
    scoreText: {
      fontSize: 48,
      fontWeight: 'bold',
    },
    scoreLabel: {
      fontSize: 16,
      fontWeight: '600',
      marginTop: 4,
    },
    trendContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 8,
    },
    trendText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    componentsContainer: {
      gap: 12,
    },
    componentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    componentName: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      flex: 1,
    },
    componentBar: {
      flex: 2,
      height: 6,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 3,
      marginHorizontal: 12,
      overflow: 'hidden',
    },
    componentFill: {
      height: '100%',
      borderRadius: 3,
    },
    componentScore: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textPrimary,
      width: 30,
      textAlign: 'right',
    },
    viewDetailsButton: {
      marginTop: 16,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
    },
    viewDetailsText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    loadingContainer: {
      paddingVertical: 60,
      alignItems: 'center',
    },
  });

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.trendText, { marginTop: 12 }]}>
            Calculating connection score...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Connection Score</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Info size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: getScoreColor() }]}>
          <Text style={[styles.scoreText, { color: getScoreColor() }]}>
            {score}
          </Text>
        </View>
        <Text style={[styles.scoreLabel, { color: getScoreColor() }]}>
          {getScoreLabel()}
        </Text>

        {change > 0 && (
          <View style={styles.trendContainer}>
            {getTrendIcon()}
            <Text style={styles.trendText}>
              {trend === 'up' ? '+' : trend === 'down' ? '-' : ''}{change} from last week
            </Text>
          </View>
        )}
      </View>

      {/* Score Components */}
      {breakdown && (
        <View style={styles.componentsContainer}>
          <View style={styles.componentRow}>
            <Text style={styles.componentName}>Frequency</Text>
            <View style={styles.componentBar}>
              <View
                style={[
                  styles.componentFill,
                  {
                    width: `${breakdown.components.frequency.score}%`,
                    backgroundColor: getScoreColor(),
                  },
                ]}
              />
            </View>
            <Text style={styles.componentScore}>
              {breakdown.components.frequency.score}
            </Text>
          </View>

          <View style={styles.componentRow}>
            <Text style={styles.componentName}>Quality</Text>
            <View style={styles.componentBar}>
              <View
                style={[
                  styles.componentFill,
                  {
                    width: `${breakdown.components.quality.score}%`,
                    backgroundColor: getScoreColor(),
                  },
                ]}
              />
            </View>
            <Text style={styles.componentScore}>
              {breakdown.components.quality.score}
            </Text>
          </View>

          <View style={styles.componentRow}>
            <Text style={styles.componentName}>Emotional</Text>
            <View style={styles.componentBar}>
              <View
                style={[
                  styles.componentFill,
                  {
                    width: `${breakdown.components.emotional.score}%`,
                    backgroundColor: getScoreColor(),
                  },
                ]}
              />
            </View>
            <Text style={styles.componentScore}>
              {breakdown.components.emotional.score}
            </Text>
          </View>

          <View style={styles.componentRow}>
            <Text style={styles.componentName}>Consistency</Text>
            <View style={styles.componentBar}>
              <View
                style={[
                  styles.componentFill,
                  {
                    width: `${breakdown.components.consistency.score}%`,
                    backgroundColor: getScoreColor(),
                  },
                ]}
              />
            </View>
            <Text style={styles.componentScore}>
              {breakdown.components.consistency.score}
            </Text>
          </View>

          <View style={styles.componentRow}>
            <Text style={styles.componentName}>Variety</Text>
            <View style={styles.componentBar}>
              <View
                style={[
                  styles.componentFill,
                  {
                    width: `${breakdown.components.variety.score}%`,
                    backgroundColor: getScoreColor(),
                  },
                ]}
              />
            </View>
            <Text style={styles.componentScore}>
              {breakdown.components.variety.score}
            </Text>
          </View>
        </View>
      )}

      {onPress && (
        <TouchableOpacity style={styles.viewDetailsButton} onPress={onPress}>
          <Text style={styles.viewDetailsText}>View Detailed Analysis</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
