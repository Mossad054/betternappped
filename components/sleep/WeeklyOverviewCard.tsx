import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { SleepWellnessService, WeeklyOverviewDay } from '@/services/sleepWellness.service';
import { Moon, Calendar, AlertCircle, RotateCcw } from 'lucide-react-native';

interface WeeklyOverviewCardProps {
  userId: string;
  startDate?: string; // YYYY-MM-DD (Monday), defaults to current week
  onDayPress?: (date: string) => void;
}

/**
 * WeeklyOverviewCard Component
 *
 * Displays 7-day mini calendar with sleep hours and habit completions.
 * Fully database-driven with color-coded quality indicators.
 */
export function WeeklyOverviewCard({
  userId,
  startDate,
  onDayPress
}: WeeklyOverviewCardProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekData, setWeekData] = useState<WeeklyOverviewDay[]>([]);
  const [currentStartDate, setCurrentStartDate] = useState<string>('');

  useEffect(() => {
    const calcStartDate = startDate || getCurrentWeekMonday();
    setCurrentStartDate(calcStartDate);
    loadWeek(calcStartDate);
  }, [userId, startDate]);

  const getCurrentWeekMonday = (): string => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysToMonday);
    return monday.toISOString().split('T')[0];
  };

  const loadWeek = async (start: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: serviceError } = await SleepWellnessService.getWeeklyOverview(
        userId,
        start
      );

      if (serviceError) {
        throw serviceError;
      }

      setWeekData(data || []);
    } catch (err) {
      console.error('Error loading weekly overview:', err);
      setError(err instanceof Error ? err.message : 'Failed to load weekly overview');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadWeek(currentStartDate);
  };

  const getQualityColor = (quality: number | null): string => {
    if (quality === null) return theme.colors.border;
    if (quality <= 2) return '#EF4444'; // Red - Poor
    if (quality === 3) return '#F59E0B'; // Amber - Fair
    return '#10B981'; // Green - Good/Excellent
  };

  const getHabitTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      'Wind Down': '#A78BFA',
      'Sleep Environment': '#60A5FA',
      'Bedtime Routine': '#F59E0B',
      'No Caffeine': '#EF4444',
      'Exercise': '#10B981',
      'Sleep': '#8B5CF6',
    };
    return colors[type] || theme.colors.primary;
  };

  const getDayName = (date: string): string => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayNumber = (date: string): number => {
    const d = new Date(date);
    return d.getDate();
  };

  // Get unique habit types from all days
  const getUniqueHabitTypes = (): string[] => {
    const types = new Set<string>();
    weekData.forEach(day => {
      day.habits_completed.forEach(habit => {
        types.add(habit.type);
      });
    });
    return Array.from(types);
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <Calendar size={24} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Weekly Overview</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading weekly data...
          </Text>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <Calendar size={24} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Weekly Overview</Text>
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle size={24} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <RotateCcw size={16} color={theme.colors.primary} />
            <Text style={[styles.retryText, { color: theme.colors.primary }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // No data state
  if (weekData.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
        <View style={styles.header}>
          <Calendar size={24} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Weekly Overview</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            No sleep data for this week. Start tracking to see your weekly overview!
          </Text>
        </View>
      </View>
    );
  }

  const habitTypes = getUniqueHabitTypes();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Calendar size={24} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Weekly Overview</Text>
        </View>
      </View>

      {/* Week Date Range */}
      <Text style={[styles.dateRange, { color: theme.colors.textSecondary }]}>
        {new Date(weekData[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        {' - '}
        {new Date(weekData[6].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </Text>

      {/* Mini Calendar Grid */}
      <View style={styles.calendarGrid}>
        {weekData.map((day, index) => {
          const qualityColor = getQualityColor(day.sleep_quality);
          const hasData = day.hours_slept !== null;

          return (
            <TouchableOpacity
              key={day.date}
              style={[
                styles.dayCell,
                { borderColor: qualityColor }
              ]}
              onPress={() => onDayPress?.(day.date)}
              disabled={!hasData}
            >
              {/* Day Name */}
              <Text style={[styles.dayName, { color: theme.colors.textSecondary }]}>
                {getDayName(day.date)}
              </Text>

              {/* Day Number */}
              <Text style={[styles.dayNumber, { color: theme.colors.text }]}>
                {getDayNumber(day.date)}
              </Text>

              {/* Hours Circle */}
              <View
                style={[
                  styles.hoursCircle,
                  {
                    backgroundColor: hasData ? qualityColor : theme.colors.border,
                    opacity: hasData ? 0.9 : 0.3
                  }
                ]}
              >
                <Text style={styles.hoursText}>
                  {hasData ? `${day.hours_slept!.toFixed(1)}h` : '—'}
                </Text>
              </View>

              {/* Habit Dots */}
              {hasData && day.habits_completed.length > 0 && (
                <View style={styles.habitDots}>
                  {day.habits_completed.map((habit, hIndex) => (
                    habit.completed && (
                      <View
                        key={`${day.date}-${hIndex}`}
                        style={[
                          styles.habitDot,
                          { backgroundColor: getHabitTypeColor(habit.type) }
                        ]}
                      />
                    )
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      {habitTypes.length > 0 && (
        <View style={styles.legend}>
          <Text style={[styles.legendTitle, { color: theme.colors.text }]}>Habit Types:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.legendItems}
          >
            {habitTypes.map(type => (
              <View key={type} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: getHabitTypeColor(type) }
                  ]}
                />
                <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
                  {type}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Quality Legend */}
      <View style={styles.qualityLegend}>
        <View style={styles.qualityLegendItem}>
          <View style={[styles.qualityDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.qualityLegendText, { color: theme.colors.textSecondary }]}>
            Poor (1-2)
          </Text>
        </View>
        <View style={styles.qualityLegendItem}>
          <View style={[styles.qualityDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={[styles.qualityLegendText, { color: theme.colors.textSecondary }]}>
            Fair (3)
          </Text>
        </View>
        <View style={styles.qualityLegendItem}>
          <View style={[styles.qualityDot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.qualityLegendText, { color: theme.colors.textSecondary }]}>
            Good (4-5)
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  dateRange: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
    marginLeft: 36, // Align with title (after icon)
  },
  calendarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
    marginHorizontal: 2,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  hoursCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  hoursText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  habitDots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 3,
    marginTop: 4,
  },
  habitDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legend: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    gap: 12,
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
    fontWeight: '500',
  },
  qualityLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  qualityLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qualityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  qualityLegendText: {
    fontSize: 11,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
