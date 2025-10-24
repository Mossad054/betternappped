import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react-native';
import { AnalyticsService } from '@/services/analytics.service';
import DayDetailModal from '@/components/DayDetailModal';
import FloatingAddButton from '@/components/FloatingAddButton';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [calendarData, setCalendarData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  // Load calendar data when component mounts or month changes
  useEffect(() => {
    if (user) {
      loadCalendarData();
    }
  }, [user, year, month]);

  const loadCalendarData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      const { data, error } = await AnalyticsService.getCalendarData(user.id, startDate, endDate);
      
      if (error) throw new Error('Failed to load calendar data');
      
      // Transform data into calendar format
      const transformedData: any = {};
      data?.forEach((day: any) => {
        transformedData[day.date] = {
          color: day.mood ? getMoodColor(day.mood.score) : '#E5E7EB',
          mood: day.mood,
          sleep: day.sleep,
          activities: day.activities,
          habits: day.habits,
          experiments: day.experiments
        };
      });
      
      setCalendarData(transformedData);
    } catch (err) {
      console.error('Error loading calendar data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCalendarData();
    setRefreshing(false);
  };

  const getMoodColor = (score: number) => {
    if (score >= 4) return '#10B981'; // Green
    if (score >= 3) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const selectedDayData = useMemo(() => {
    return selectedDate ? calendarData[selectedDate] : null;
  }, [selectedDate, calendarData]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDatePress = (date: string) => {
    setSelectedDate(date);
    setModalVisible(true);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.emptyDay} />
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayData = calendarData[date];
      const isToday = date === new Date().toISOString().split('T')[0];

      days.push(
        <TouchableOpacity
          key={date}
          style={[
            styles.dayCell,
            isToday && styles.todayCell,
          ]}
          onPress={() => handleDatePress(date)}
          activeOpacity={0.7}
        >
          <View style={styles.dayContent}>
            <Text style={[
              styles.dayText,
              isToday && styles.todayText,
            ]}>
              {day}
            </Text>
            {dayData && (
              <View style={styles.moodIndicators}>
                <View 
                  style={[
                    styles.moodDot,
                    { backgroundColor: dayData.color }
                  ]} 
                />
                <Text style={styles.moodEmoji}>
                  {dayData.mood >= 4 ? '😊' : dayData.mood >= 3 ? '😐' : '😕'}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const getMoodStats = () => {
    const dates = Object.keys(calendarData);
    const moodScores = dates.map(date => calendarData[date].mood);
    
    const goodDays = moodScores.filter(score => score >= 4).length;
    const neutralDays = moodScores.filter(score => score === 3).length;
    const badDays = moodScores.filter(score => score <= 2).length;
    const avgMood = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;

    return { goodDays, neutralDays, badDays, avgMood: avgMood.toFixed(1) };
  };

  const moodStats = getMoodStats();

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading calendar...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>Error: {error}</Text>
        <Text style={[styles.retryText, { color: theme.colors.textSecondary }]}>Pull down to refresh</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.colors.card }]}>
        <View style={styles.titleContainer}>
          <CalendarIcon size={24} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Wellness Calendar</Text>
        </View>
        
        <View style={styles.monthNavigation}>
          <TouchableOpacity 
            onPress={() => navigateMonth('prev')}
            style={styles.navButton}
          >
            <ChevronLeft size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          
          <Text style={[styles.monthYear, { color: theme.colors.text }]}>
            {monthNames[month - 1]} {year}
          </Text>
          
          <TouchableOpacity 
            onPress={() => navigateMonth('next')}
            style={styles.navButton}
          >
            <ChevronRight size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Month Stats */}
        <View style={[styles.statsContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statsTitle, { color: theme.colors.text }]}>This Month Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Good Days</Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{moodStats.goodDays}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: theme.colors.warning }]} />
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Neutral Days</Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{moodStats.neutralDays}</Text>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statDot, { backgroundColor: theme.colors.error }]} />
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Tough Days</Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{moodStats.badDays}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Avg Mood</Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{moodStats.avgMood}/5</Text>
            </View>
          </View>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {/* Day headers */}
          <View style={styles.dayHeaders}>
            {dayNames.map(day => (
              <Text key={day} style={[styles.dayHeader, { color: theme.colors.textSecondary }]}>{day}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {renderCalendarDays()}
          </View>
        </View>

        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Monthly Summary</Text>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryEmoji}>🧠</Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Mental Clarity</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>8.2/10</Text>
              <Text style={[styles.summaryTrend, { color: theme.colors.primary }]}>↗ +12%</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryEmoji}>😴</Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Sleep Quality</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>7.5h avg</Text>
              <Text style={[styles.summaryTrend, { color: theme.colors.primary }]}>↗ +8%</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryEmoji}>🔥</Text>
              <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Habit Streak</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.text }]}>12 days</Text>
              <Text style={[styles.summaryTrend, { color: theme.colors.primary }]}>↗ +3</Text>
            </View>
          </View>
          
          <View style={styles.summaryInsights}>
            <Text style={[styles.insightsTitle, { color: theme.colors.text }]}>Key Insights</Text>
            <View style={styles.insightItem}>
              <Text style={styles.insightBullet}>•</Text>
              <Text style={[styles.insightText, { color: theme.colors.textSecondary }]}>
                Your best mood days correlate with 8+ hours of sleep
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightBullet}>•</Text>
              <Text style={[styles.insightText, { color: theme.colors.textSecondary }]}>
                Exercise days show 25% higher mental clarity scores
              </Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightBullet}>•</Text>
              <Text style={[styles.insightText, { color: theme.colors.textSecondary }]}>
                Consistent meditation practice improves sleep quality
              </Text>
            </View>
          </View>
        </View>

        {/* Legend */}
        <View style={[styles.legendContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.legendTitle, { color: theme.colors.text }]}>Mood Legend</Text>
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Good Mood (4-5)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Neutral (3)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
              <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Low Mood (1-2)</Text>
            </View>
          </View>
          <Text style={[styles.legendSubtext, { color: theme.colors.textSecondary }]}>
            Tap any date to see detailed insights about your activities, sleep, and mood.
          </Text>
        </View>
      </ScrollView>

      <DayDetailModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={selectedDayData}
      />
      
      <FloatingAddButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 4,
  },
  todayCell: {
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
  },
  dayContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  todayText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  moodIndicators: {
    alignItems: 'center',
  },
  moodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  moodEmoji: {
    fontSize: 10,
  },
  legendContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  legendSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Summary card styles
  summaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  summaryEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  summaryTrend: {
    fontSize: 11,
    fontWeight: '500',
    color: '#10B981',
  },
  summaryInsights: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  insightBullet: {
    fontSize: 14,
    color: '#10B981',
    marginRight: 8,
    marginTop: 2,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    textAlign: 'center',
  },
});