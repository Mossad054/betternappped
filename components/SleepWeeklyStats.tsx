import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AnalyticsService } from '@/services/analytics.service';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SleepWeeklyStatsProps {
  userId: string;
  sleepTarget?: number;
}

export default function SleepWeeklyStats({
  userId,
  sleepTarget = 8.0,
}: SleepWeeklyStatsProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadSleepData();
  }, [userId]);

  const loadSleepData = async () => {
    setLoading(true);
    try {
      const result = await AnalyticsService.getSleepTrackingAnalysis(userId, 'month', sleepTarget);

      if (result.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error('❌ Error loading weekly stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderBarChart = () => {
    if (!data || !data.dailyData || data.dailyData.length === 0) return null;

    const dailyData = data.dailyData.slice(-7); // Last 7 days
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const maxHeight = 140;
    const barWidth = 40;

    return (
      <View style={styles.barChartContainer}>
        {dailyData.map((day: any, index: number) => {
          const height = (day.duration / 10) * maxHeight;
          const color = day.metTarget ? '#60A5FA' : '#A78BFA';
          const date = new Date(day.date);

          return (
            <View key={index} style={styles.barWrapper}>
              <Text style={[styles.barValue, { color: theme.colors.text }]}>
                {day.duration.toFixed(1)}
              </Text>
              <View style={styles.barColumn}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: Math.max(height, 20),
                      backgroundColor: color,
                      width: barWidth,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.barLabel, { color: theme.colors.textSecondary }]}>
                {days[date.getDay() === 0 ? 6 : date.getDay() - 1]}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Your Insights</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (!data || data.summary.totalNights === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Your Insights</Text>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No sleep data available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Your Insights</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Updated 1 week ago
      </Text>

      <View style={styles.chartSection}>
        {renderBarChart()}
      </View>

      {/* Weekly Objectives */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Weekly Objectives
        </Text>
        <View style={styles.objectiveCard}>
          <Text style={[styles.objectiveValue, { color: theme.colors.primary }]}>
            {data.summary.daysMetTarget} of {data.summary.totalNights >= 7 ? 7 : data.summary.totalNights}
          </Text>
          <Text style={[styles.objectiveLabel, { color: theme.colors.textSecondary }]}>
            07 February to 13 March
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(data.summary.daysMetTarget / 7) * 100}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            Sleep tracker daily at least completion of 8h
          </Text>
        </View>
      </View>

      {/* Daily Objectives */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Daily Objectives
        </Text>
        <View style={styles.objectiveCard}>
          <Text style={[styles.objectiveValue, { color: theme.colors.primary }]}>
            {data.summary.daysMetTarget} of 300
          </Text>
          <Text style={[styles.objectiveLabel, { color: theme.colors.textSecondary }]}>
            07 February to 13 March
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(data.summary.daysMetTarget / 300) * 100}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            Sleep tracker daily at least completion of 8h
          </Text>
        </View>
      </View>
    </View>
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
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
  chartSection: {
    marginBottom: 24,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    paddingHorizontal: 10,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  barColumn: {
    height: 140,
    justifyContent: 'flex-end',
    alignItems: 'center',
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  objectiveCard: {
    backgroundColor: 'transparent',
  },
  objectiveValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  objectiveLabel: {
    fontSize: 12,
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 11,
    lineHeight: 16,
  },
});
