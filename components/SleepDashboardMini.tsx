import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AnalyticsService } from '@/services/analytics.service';
import Svg, { Circle } from 'react-native-svg';
import { router } from 'expo-router';

interface SleepDashboardMiniProps {
  userId: string;
  sleepTarget?: number;
}

export default function SleepDashboardMini({
  userId,
  sleepTarget = 8.0,
}: SleepDashboardMiniProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadSleepData();
  }, [userId]);

  const loadSleepData = async () => {
    setLoading(true);
    try {
      const result = await AnalyticsService.getSleepTrackingAnalysis(userId, 'week', sleepTarget);

      if (result.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error('❌ Error loading mini sleep data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMiniDonut = () => {
    if (!data) return null;

    const size = 120;
    const radius = 45;
    const strokeWidth = 12;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    const successPercentage = (data.summary.daysMetTarget / data.summary.totalNights) * 100;
    const successProgress = (successPercentage / 100) * circumference;

    const failPercentage = 100 - successPercentage;

    return (
      <View style={styles.donutWrapper}>
        <View style={[styles.donutContainer, { width: size, height: size }]}>
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

          <View style={styles.donutCenter}>
            <Text style={[styles.successPercent, { color: '#60A5FA' }]}>
              {Math.round(successPercentage)}%
            </Text>
            <Text style={[styles.failPercent, { color: '#A78BFA' }]}>
              {Math.round(failPercentage)}%
            </Text>
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#60A5FA' }]} />
            <View>
              <Text style={[styles.legendValue, { color: theme.colors.text }]}>
                {Math.round(successPercentage)}% Success
              </Text>
              <Text style={[styles.legendLabel, { color: theme.colors.textSecondary }]}>
                {data.summary.avgSleep.toFixed(1)} Hours
              </Text>
            </View>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#A78BFA' }]} />
            <View>
              <Text style={[styles.legendValue, { color: theme.colors.text }]}>
                {Math.round(failPercentage)}%
              </Text>
              <Text style={[styles.legendLabel, { color: theme.colors.textSecondary }]}>
                {(sleepTarget - data.summary.avgSleep).toFixed(1)} Hours
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Sleep Dashboard</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: theme.colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  if (!data || data.summary.totalNights === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Sleep Dashboard</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: theme.colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>😴</Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No sleep data yet
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Sleep Dashboard</Text>
        <TouchableOpacity onPress={() => router.push('/sleep-wellness')}>
          <Text style={[styles.seeAll, { color: theme.colors.primary }]}>See all</Text>
        </TouchableOpacity>
      </View>

      {renderMiniDonut()}

      {/* Your goals section */}
      <View style={styles.goalsSection}>
        <Text style={[styles.goalsTitle, { color: theme.colors.text }]}>Your goals</Text>
        <View style={styles.goalsGrid}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => {
            const dayData = data.dailyData[index];
            const achieved = dayData?.metTarget || false;
            return (
              <View key={index} style={styles.goalDay}>
                <View
                  style={[
                    styles.goalCircle,
                    {
                      backgroundColor: achieved ? '#60A5FA' : theme.colors.border,
                      borderColor: achieved ? '#60A5FA' : theme.colors.border,
                    },
                  ]}
                >
                  {achieved && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={[styles.goalDayLabel, { color: theme.colors.textSecondary }]}>
                  {day}
                </Text>
              </View>
            );
          })}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
  },
  donutWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  donutContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successPercent: {
    fontSize: 24,
    fontWeight: '700',
  },
  failPercent: {
    fontSize: 24,
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    gap: 32,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  goalsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  goalsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  goalsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalDay: {
    alignItems: 'center',
  },
  goalCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  goalDayLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
