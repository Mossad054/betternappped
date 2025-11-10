import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, X } from 'lucide-react-native';
import { AnalyticsService } from '@/services/analytics.service';
import { useRealtimeMoods, useRealtimeActivities, useRealtimeSleep, useRealtimeHabits, useRealtimeExperiments } from '@/hooks/useRealtimeData';
import DayDetailModal from '@/components/DayDetailModal';
import type { DailyDetailData, MonthlySummary, WellBeingLegend, MonthOverview } from '@/services/analytics.service';

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [confirmLogModalVisible, setConfirmLogModalVisible] = useState<boolean>(false);
  const [calendarData, setCalendarData] = useState<any>({});
  const [selectedDayDetailData, setSelectedDayDetailData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [wellBeingLegend, setWellBeingLegend] = useState<WellBeingLegend | null>(null);
  const [legendLoading, setLegendLoading] = useState(false);
  const [monthOverview, setMonthOverview] = useState<MonthOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  const year = useMemo(() => currentDate.getFullYear(), [currentDate]);
  const month = useMemo(() => currentDate.getMonth() + 1, [currentDate]);

  // Enhanced helper function - compute overall well-being score
  const getWellBeingColor = (dayData: any) => {
    if (!dayData.mood && !dayData.sleep && !dayData.mentalClarity) {
      return theme.colors.surfaceVariant; // No data - neutral grey
    }

    let totalScore = 0;
    let dataPoints = 0;

    // Mood contribution (normalized to 0-1)
    if (dayData.mood?.score) {
      totalScore += dayData.mood.score / 5;
      dataPoints++;
    }

    // Sleep quality contribution (normalized to 0-1)
    if (dayData.sleep) {
      const sleepScore = (dayData.sleep.quality || 3) / 5;
      totalScore += sleepScore;
      dataPoints++;
    }

    // Mental clarity contribution (normalized to 0-1)
    if (dayData.mentalClarity?.score) {
      totalScore += dayData.mentalClarity.score / 10;
      dataPoints++;
    }

    if (dataPoints === 0) return theme.colors.surfaceVariant;

    const avgScore = totalScore / dataPoints;

    // Color mapping based on average well-being
    if (avgScore >= 0.7) return theme.colors.success; // Good day - Green
    if (avgScore >= 0.5) return theme.colors.primary; // Moderate day - Blue
    if (avgScore >= 0.3) return theme.colors.warning; // Below average - Yellow
    return theme.colors.error; // Poor day - Red
  };

  const getMoodColor = (score: number) => {
    if (score >= 4) return '#10B981'; // Green
    if (score >= 3) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const loadCalendarData = useCallback(async (forceRefresh: boolean = false) => {
    if (!user) {
      setLoading(false);
      setCalendarData({});
      return;
    }
    
    // Prevent excessive fetches (debounce to 2 seconds unless forced)
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime < 2000) {
      console.log('Skipping calendar fetch - too soon since last fetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      
      console.log(`Fetching calendar data from ${startDate} to ${endDate}`);
      const { data, error } = await AnalyticsService.getCalendarData(user.id, startDate, endDate);
      
      if (error) {
        // Only throw if it's a real error, not just empty data
        if (error !== 'No data found') {
          throw new Error(error);
        }
        setCalendarData({});
        setLastFetchTime(now);
        return;
      }
      
      // Transform data into calendar format with robust data existence check
      const transformedData: any = {};
      data?.forEach((day: any) => {
        // Determine if this day has any meaningful data
        const hasData = !!(
          day.mood || 
          day.sleep || 
          (day.activities && day.activities.length > 0) ||
          (day.habits && day.habits.completed > 0) ||
          day.mentalClarity ||
          day.productivity ||
          day.intimacy
        );
        
        // Only add to calendarData if there's actual data (not empty days)
        if (hasData) {
          transformedData[day.date] = {
            color: getWellBeingColor(day), // Use enhanced well-being score
            mood: day.mood,
            sleep: day.sleep,
            activities: day.activities,
            habits: day.habits,
            experiments: day.experiments,
            mentalClarity: day.mentalClarity,
            productivity: day.productivity,
            intimacy: day.intimacy,
            hasData: true, // Explicit flag for data existence
          };
        }
      });
      
      setCalendarData(transformedData);
      setLastFetchTime(now);
      console.log(`Calendar data loaded: ${Object.keys(transformedData).length} days with data`, Object.keys(transformedData));
    } catch (err) {
      console.error('Error loading calendar data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load calendar data');
      // Set empty data on error so UI can still render
      setCalendarData({});
    } finally {
      setLoading(false);
    }
  }, [user, year, month, lastFetchTime]);

  const loadMonthlySummary = useCallback(async () => {
    if (!user) {
      setMonthlySummary(null);
      return;
    }

    setSummaryLoading(true);
    try {
      console.log(`📊 Loading monthly summary for ${year}-${month}`);
      const { data, error } = await AnalyticsService.getMonthlySummary(user.id, year, month);
      
      if (error) {
        console.error('Error loading monthly summary:', error);
        setMonthlySummary(null);
      } else {
        setMonthlySummary(data);
        console.log('📊 Monthly summary loaded:', data);
      }
    } catch (err) {
      console.error('Error loading monthly summary:', err);
      setMonthlySummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, [user, year, month]);

  const loadWellBeingLegend = useCallback(async () => {
    if (!user) {
      setWellBeingLegend(null);
      return;
    }

    setLegendLoading(true);
    try {
      console.log(`📊 Loading well-being legend for ${year}-${month}`);
      const { data, error } = await AnalyticsService.getWellBeingLegend(user.id, year, month);
      
      if (error) {
        console.error('Error loading well-being legend:', error);
        setWellBeingLegend(null);
      } else {
        setWellBeingLegend(data);
        console.log('📊 Well-being legend loaded:', data);
      }
    } catch (err) {
      console.error('Error loading well-being legend:', err);
      setWellBeingLegend(null);
    } finally {
      setLegendLoading(false);
    }
  }, [user, year, month]);

  const loadMonthOverview = useCallback(async () => {
    if (!user) {
      setMonthOverview(null);
      return;
    }

    setOverviewLoading(true);
    try {
      console.log(`📊 Loading month overview for ${year}-${month}`);
      const { data, error } = await AnalyticsService.getMonthOverview(user.id, year, month);
      
      if (error) {
        console.error('Error loading month overview:', error);
        setMonthOverview(null);
      } else {
        setMonthOverview(data);
        console.log('📊 Month overview loaded:', data);
      }
    } catch (err) {
      console.error('Error loading month overview:', err);
      setMonthOverview(null);
    } finally {
      setOverviewLoading(false);
    }
  }, [user, year, month]);

  useEffect(() => {
    if (user) {
      loadCalendarData(false);
      loadMonthlySummary(); // Load monthly summary alongside calendar data
      loadWellBeingLegend(); // Load well-being legend alongside calendar data
      loadMonthOverview(); // Load month overview for "This Month Overview" card
    } else {
      // If no user, ensure loading is false
      setLoading(false);
      setCalendarData({});
      setMonthlySummary(null);
      setWellBeingLegend(null);
      setMonthOverview(null);
    }
  }, [user, year, month]); // Removed loadCalendarData from deps to prevent infinite loop

  // Refresh calendar when screen comes into focus (after logging data elsewhere)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        console.log('📅 Calendar screen FOCUSED - triggering refresh');
        console.log('Current year:', year, 'month:', month);
        loadCalendarData(true); // Force refresh on focus
      }
      return () => {
        console.log('📅 Calendar screen UNFOCUSED');
      };
    }, [user, year, month])
  );

  // Set up real-time subscriptions - these will trigger loadCalendarData on changes
  const handleRealtimeUpdate = useCallback(() => {
    console.log('Realtime update detected - refreshing calendar, summary, legend, and overview');
    loadCalendarData(true); // Force refresh on realtime updates
    loadMonthlySummary(); // Also refresh monthly summary
    loadWellBeingLegend(); // Also refresh well-being legend
    loadMonthOverview(); // Also refresh month overview
  }, [loadCalendarData, loadMonthlySummary, loadWellBeingLegend, loadMonthOverview]);

  useRealtimeMoods(user?.id || '', handleRealtimeUpdate);
  useRealtimeActivities(user?.id || '', handleRealtimeUpdate);
  useRealtimeSleep(user?.id || '', handleRealtimeUpdate);
  useRealtimeHabits(user?.id || '', handleRealtimeUpdate);
  useRealtimeExperiments(user?.id || '', handleRealtimeUpdate);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCalendarData(true); // Force refresh on manual pull-to-refresh
    await loadMonthlySummary(); // Also refresh monthly summary
    await loadWellBeingLegend(); // Also refresh well-being legend
    await loadMonthOverview(); // Also refresh month overview
    setRefreshing(false);
  }, [loadCalendarData, loadMonthlySummary, loadWellBeingLegend, loadMonthOverview]);

  const selectedDayData = useMemo(() => {
    return selectedDayDetailData;
  }, [selectedDayDetailData]);

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

  // Calculate the minimum allowed date (3 months back from today)
  const getMinAllowedDate = () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    return minDate;
  };

  // Check if we can navigate to previous month (not more than 3 months back)
  const canNavigateToPrevMonth = useMemo(() => {
    const minDate = getMinAllowedDate();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return currentMonthStart > minDate;
  }, [currentDate]);

  // Check if we can navigate to next month (not future months)
  const canNavigateToNextMonth = useMemo(() => {
    const today = new Date();
    const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const todayMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return currentMonthStart < todayMonthStart;
  }, [currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && !canNavigateToPrevMonth) {
      Alert.alert(
        '3-Month Limit',
        'You can only view and log data for the last 3 months.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (direction === 'next' && !canNavigateToNextMonth) {
      Alert.alert(
        'Current Month',
        'You cannot navigate to future months.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDatePress = async (date: string) => {
    const dayData = calendarData[date];
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`\n=== DATE PRESS: ${date} ===`);
    console.log('Today:', today);
    console.log('dayData exists:', !!dayData);
    console.log('dayData:', JSON.stringify(dayData, null, 2));
    
    // Prevent logging for future dates
    if (date > today) {
      Alert.alert(
        'Future Date',
        'You cannot log data for future dates. Please select today or a past date.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    // Check if date is within the allowed 3-month range
    const minDate = getMinAllowedDate();
    const selectedDateObj = new Date(date + 'T00:00:00');
    if (selectedDateObj < minDate) {
      Alert.alert(
        '3-Month Limit',
        'You can only view and log data for the last 3 months. This date is too far in the past.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    setSelectedDate(date);
    
    // Check if data exists - use presence in calendarData as primary indicator
    // since we now only add days that have actual data
    const hasData = !!dayData && dayData.hasData === true;
    
    console.log('hasData decision:', hasData);
    console.log('===================\n');
    
    if (hasData) {
      // Data exists - show summary modal
      console.log(`✓ Data exists for ${date} - showing summary modal`);
      setModalVisible(true);
      setLoadingDetail(true);
      
      // Fetch fresh detailed data for the selected date
      if (user) {
        try {
          const { data, error } = await AnalyticsService.getDailyDetailData(user.id, date);
          if (error) {
            console.error('Error loading day detail:', error);
            // Fallback to cached data from calendarData
            if (dayData) {
              setSelectedDayDetailData({
                date,
                mood: dayData.mood,
                activities: dayData.activities || [],
                sleep: dayData.sleep,
                habits: dayData.habits || [],
                experiments: dayData.experiments || [],
                mentalClarity: dayData.mentalClarity,
                productivity: dayData.productivity,
                intimacy: dayData.intimacy,
              });
            }
          } else if (data) {
            console.log('✓ Loaded detailed data for', date);
            setSelectedDayDetailData(data);
          }
        } catch (err) {
          console.error('Error fetching day detail:', err);
          // Fallback to cached data
          if (dayData) {
            setSelectedDayDetailData({
              date,
              mood: dayData.mood,
              activities: dayData.activities || [],
              sleep: dayData.sleep,
              habits: dayData.habits || [],
              experiments: dayData.experiments || [],
              mentalClarity: dayData.mentalClarity,
              productivity: dayData.productivity,
              intimacy: dayData.intimacy,
            });
          }
        } finally {
          setLoadingDetail(false);
        }
      }
    } else {
      // No data exists - show "Log Data" confirmation modal
      console.log(`✗ No data for ${date} - showing confirmation modal`);
      setConfirmLogModalVisible(true);
    }
  };

  const handleConfirmLogData = () => {
    if (selectedDate) {
      setConfirmLogModalVisible(false);
      console.log(`Navigating to journal for date: ${selectedDate}`);
      // Navigate to journal page with date parameter
      router.push(`/(tabs)/journal?date=${selectedDate}`);
    }
  };

  const handleCancelLogData = () => {
    setConfirmLogModalVisible(false);
    setSelectedDate(null);
  };

  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
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
      
      // Check if date is within the allowed 3-month range
      const minDate = getMinAllowedDate();
      const dateObj = new Date(date + 'T00:00:00');
      const isOutOfRange = dateObj < minDate;
      const isFutureDate = date > new Date().toISOString().split('T')[0];
      
      // Only disable dates that are truly out of range (beyond 3 months or future)
      const isDisabled = isOutOfRange || isFutureDate;

      // Check if this date has data - simplified since we only store days with data
      const hasData = !!dayData && dayData.hasData === true;
      
      // Get mood-based styling
      const getMoodStyle = () => {
        if (!hasData || !dayData.mood) return null;
        
        const score = dayData.mood.score;
        if (score >= 4.5) return { bg: '#A78BFA', emoji: '😊' }; // Purple - Very Happy
        if (score >= 4) return { bg: '#34D399', emoji: '😊' }; // Green - Happy
        if (score >= 3.5) return { bg: '#FBBF24', emoji: '😌' }; // Yellow - Content
        if (score >= 3) return { bg: '#60A5FA', emoji: '😐' }; // Blue - Neutral
        if (score >= 2.5) return { bg: '#93C5FD', emoji: '😕' }; // Light Blue - Slightly Down
        return { bg: '#FB923C', emoji: '😔' }; // Orange - Tough
      };
      
      const moodStyle = getMoodStyle();
      
      days.push(
        <TouchableOpacity
          key={date}
          style={[
            styles.dayCell,
            isDisabled && styles.dayCellDisabled
          ]}
          onPress={() => handleDatePress(date)}
          activeOpacity={0.7}
          disabled={isDisabled}
        >
          {hasData && moodStyle ? (
            // Day with mood data - date above colored circle
            <View style={styles.dayWithMoodContainer}>
              <Text style={[
                styles.dayNumberAbove, 
                { color: theme.colors.text },
                isToday && styles.todayNumberAbove,
                isDisabled && styles.disabledText
              ]}>
                {day}
              </Text>
              <View style={[
                styles.dayCircleWithMood,
                { 
                  backgroundColor: moodStyle.bg,
                  borderWidth: 2,
                  borderColor: '#1F2937',
                },
                isToday && styles.todayCircleWithMood,
              ]}>
                <Text style={styles.moodEmojiLarge}>
                  {moodStyle.emoji}
                </Text>
                {/* Micro-indicators for additional data types */}
                {(dayData.sleep || dayData.activities || dayData.habits) && (
                  <View style={styles.microIndicators}>
                    {dayData.sleep && (
                      <View style={[styles.microDot, { backgroundColor: '#1E40AF' }]} />
                    )}
                    {dayData.activities && dayData.activities.length > 0 && (
                      <View style={[styles.microDot, { backgroundColor: '#7C3AED' }]} />
                    )}
                    {dayData.habits && dayData.habits.completed > 0 && (
                      <View style={[styles.microDot, { backgroundColor: '#059669' }]} />
                    )}
                  </View>
                )}
              </View>
            </View>
          ) : (
            // Day without mood data - show simple circle with black border
            <View style={[
              styles.dayCircle,
              { borderColor: '#1F2937' }, // Black border for all circles
              isToday && [
                styles.todayCircle,
                { 
                  borderColor: theme.colors.primary,
                  backgroundColor: theme.colors.primary + '10',
                }
              ],
              isDisabled && styles.disabledCircle
            ]}>
              <Text style={[
                styles.dayText,
                { color: theme.colors.text },
                isToday && [styles.todayText, { color: theme.colors.primary }],
                isDisabled && styles.disabledText
              ]}>
                {day}
              </Text>
              {!isToday && !isDisabled && (
                <View style={styles.emptyIndicator}>
                  <Plus size={10} color={theme.colors.textSecondary} opacity={0.25} />
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return days;
  };

  const getSummaryStats = () => {
    const dates = Object.keys(calendarData);
    const sleepHours = dates.map(date => calendarData[date].sleep?.hours).filter((hours): hours is number => typeof hours === 'number');
    const mentalClarityScores = dates.map(date => calendarData[date].mentalClarity?.score).filter((score): score is number => typeof score === 'number');
    const habitCompletions = dates.map(date => {
      const habits = calendarData[date].habits;
      if (!habits || !habits.completed || !habits.total) return null;
      return Math.round((habits.completed / habits.total) * 100);
    }).filter((completion): completion is number => typeof completion === 'number');
    
    const avgSleep = sleepHours.length > 0 ? (sleepHours.reduce((sum, hours) => sum + hours, 0) / sleepHours.length).toFixed(1) : '0';
    const avgMentalClarity = mentalClarityScores.length > 0 ? (mentalClarityScores.reduce((sum, score) => sum + score, 0) / mentalClarityScores.length).toFixed(1) : '0';
    const avgHabitCompletion = habitCompletions.length > 0 ? Math.round(habitCompletions.reduce((sum, completion) => sum + completion, 0) / habitCompletions.length) : 0;
    
    return { avgSleep, avgMentalClarity, avgHabitCompletion };
  };

  const summaryStats = getSummaryStats();

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

  // Empty state: Show friendly message when no calendar data exists
  const hasAnyData = Object.keys(calendarData).length > 0;

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
            style={[
              styles.navButton,
              !canNavigateToPrevMonth && styles.navButtonDisabled
            ]}
            disabled={!canNavigateToPrevMonth}
          >
            <ChevronLeft 
              size={20} 
              color={canNavigateToPrevMonth ? theme.colors.textSecondary : theme.colors.surfaceVariant} 
            />
          </TouchableOpacity>
          
          <Text style={[styles.monthYear, { color: theme.colors.text }]}>
            {monthNames[month - 1]} {year}
          </Text>
          
          <TouchableOpacity 
            onPress={() => navigateMonth('next')}
            style={[
              styles.navButton,
              !canNavigateToNextMonth && styles.navButtonDisabled
            ]}
            disabled={!canNavigateToNextMonth}
          >
            <ChevronRight 
              size={20} 
              color={canNavigateToNextMonth ? theme.colors.textSecondary : theme.colors.surfaceVariant} 
            />
          </TouchableOpacity>
        </View>

        {/* 3-Month Limit Info Banner */}
        {!canNavigateToPrevMonth && (
          <View style={[styles.infoBanner, { backgroundColor: theme.colors.primary + '15', borderColor: theme.colors.primary + '30' }]}>
            <Text style={[styles.infoBannerText, { color: theme.colors.primary }]}>
              📅 You've reached the 3-month history limit
            </Text>
          </View>
        )}
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
          {overviewLoading ? (
            <View style={styles.overviewLoadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.overviewLoadingText, { color: theme.colors.textSecondary }]}>
                Analyzing your mood data...
              </Text>
            </View>
          ) : !monthOverview || monthOverview.totalDays === 0 ? (
            <View style={styles.overviewEmptyState}>
              <Text style={[styles.overviewEmptyText, { color: theme.colors.textSecondary }]}>
                No mood data available for this month.
              </Text>
            </View>
          ) : (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: theme.colors.success }]} />
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Good Days</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{monthOverview.goodDays}</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: theme.colors.warning }]} />
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Neutral Days</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{monthOverview.neutralDays}</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: theme.colors.error }]} />
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Tough Days</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{monthOverview.toughDays}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Avg Mood</Text>
                <Text style={[styles.statValue, { color: theme.colors.text }]}>{monthOverview.avgMood}/5</Text>
              </View>
            </View>
          )}
        </View>

        {/* Calendar */}
        <View style={[styles.calendarContainer, { backgroundColor: theme.colors.card }]}>
          {/* Day headers */}
          <View style={styles.dayHeaders}>
            {dayNames.map(day => (
              <Text key={day} style={[styles.dayHeader, { color: theme.colors.textSecondary }]}>{day}</Text>
            ))}
          </View>

          {/* Calendar grid or empty state */}
          {!hasAnyData ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateEmoji}>📅</Text>
              <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>No Data for This Month</Text>
              <Text style={[styles.emptyStateMessage, { color: theme.colors.textSecondary }]}>
                Start tracking to see your wellness patterns
              </Text>
              <TouchableOpacity
                style={[styles.emptyStateButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push('/(tabs)/journal')}
              >
                <Text style={[styles.emptyStateButtonText, { color: '#FFFFFF' }]}>Add Entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.calendarGrid}>
              {renderCalendarDays()}
            </View>
          )}

          {/* Compact Mood Color Guide - Inside Calendar Card */}
          <View style={styles.compactLegendContainer}>
            <View style={[styles.compactLegendDivider, { backgroundColor: theme.colors.border }]} />
            
            <Text style={[styles.compactLegendTitle, { color: theme.colors.textSecondary }]}>
              Mood Colors
            </Text>
            
            <View style={styles.compactLegendGrid}>
              {/* Row 1 */}
              <View style={styles.compactLegendItem}>
                <View style={[styles.compactColorCircle, { backgroundColor: '#A78BFA' }]}>
                  <Text style={styles.compactEmoji}>😊</Text>
                </View>
                <Text style={[styles.compactLegendText, { color: theme.colors.textSecondary }]}>
                  Excellent
                </Text>
              </View>
              
              <View style={styles.compactLegendItem}>
                <View style={[styles.compactColorCircle, { backgroundColor: '#34D399' }]}>
                  <Text style={styles.compactEmoji}>😊</Text>
                </View>
                <Text style={[styles.compactLegendText, { color: theme.colors.textSecondary }]}>
                  Happy
                </Text>
              </View>
              
              <View style={styles.compactLegendItem}>
                <View style={[styles.compactColorCircle, { backgroundColor: '#FBBF24' }]}>
                  <Text style={styles.compactEmoji}>😌</Text>
                </View>
                <Text style={[styles.compactLegendText, { color: theme.colors.textSecondary }]}>
                  Content
                </Text>
              </View>

              {/* Row 2 */}
              <View style={styles.compactLegendItem}>
                <View style={[styles.compactColorCircle, { backgroundColor: '#60A5FA' }]}>
                  <Text style={styles.compactEmoji}>😐</Text>
                </View>
                <Text style={[styles.compactLegendText, { color: theme.colors.textSecondary }]}>
                  Neutral
                </Text>
              </View>
              
              <View style={styles.compactLegendItem}>
                <View style={[styles.compactColorCircle, { backgroundColor: '#93C5FD' }]}>
                  <Text style={styles.compactEmoji}>😕</Text>
                </View>
                <Text style={[styles.compactLegendText, { color: theme.colors.textSecondary }]}>
                  Low
                </Text>
              </View>
              
              <View style={styles.compactLegendItem}>
                <View style={[styles.compactColorCircle, { backgroundColor: '#FB923C' }]}>
                  <Text style={styles.compactEmoji}>😔</Text>
                </View>
                <Text style={[styles.compactLegendText, { color: theme.colors.textSecondary }]}>
                  Tough
                </Text>
              </View>
            </View>

            {/* Dots Legend */}
            <View style={styles.compactDotsLegend}>
              <View style={styles.compactDotItem}>
                <View style={[styles.microDot, { backgroundColor: '#1E40AF' }]} />
                <Text style={[styles.compactDotText, { color: theme.colors.textSecondary }]}>Sleep</Text>
              </View>
              <View style={styles.compactDotItem}>
                <View style={[styles.microDot, { backgroundColor: '#7C3AED' }]} />
                <Text style={[styles.compactDotText, { color: theme.colors.textSecondary }]}>Activities</Text>
              </View>
              <View style={styles.compactDotItem}>
                <View style={[styles.microDot, { backgroundColor: '#059669' }]} />
                <Text style={[styles.compactDotText, { color: theme.colors.textSecondary }]}>Habits</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Monthly Summary</Text>
          
          {summaryLoading ? (
            <View style={styles.summaryLoadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.summaryLoadingText, { color: theme.colors.textSecondary }]}>
                Analyzing your wellness data...
              </Text>
            </View>
          ) : monthlySummary ? (
            <>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryEmoji}>😊</Text>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Avg Mood</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                    {monthlySummary.summary.avgMood > 0 ? `${monthlySummary.summary.avgMood}/5` : 'N/A'}
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryEmoji}>😴</Text>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Avg Sleep</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                    {monthlySummary.summary.avgSleep > 0 ? `${monthlySummary.summary.avgSleep}h` : 'N/A'}
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryEmoji}>🧠</Text>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>Avg Clarity</Text>
                  <Text style={[styles.summaryValue, { color: theme.colors.text }]}>
                    {monthlySummary.summary.avgClarity > 0 ? `${monthlySummary.summary.avgClarity}/10` : 'N/A'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.summaryInsights}>
                <Text style={[styles.insightsTitle, { color: theme.colors.text }]}>Key Insights</Text>
                {monthlySummary.insights.map((insight, index) => (
                  <View key={index} style={styles.insightItem}>
                    <Text style={styles.insightBullet}>•</Text>
                    <Text style={[styles.insightText, { color: theme.colors.textSecondary }]}>
                      {insight}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.summaryEmptyState}>
              <Text style={[styles.summaryEmptyText, { color: theme.colors.textSecondary }]}>
                Start logging data to see your personalized monthly summary and insights.
              </Text>
            </View>
          )}
        </View>

        {/* Enhanced Legend - Dynamic Well-Being Distribution */}
        <View style={[styles.legendContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.legendTitle, { color: theme.colors.text }]}>Daily Well-Being Legend</Text>
          
          {legendLoading ? (
            <View style={styles.legendLoadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={[styles.legendLoadingText, { color: theme.colors.textSecondary }]}>
                Analyzing your month's well-being...
              </Text>
            </View>
          ) : wellBeingLegend && wellBeingLegend.summary.totalDays > 0 ? (
            <>
              {/* Day Classification Grid with Counts and Percentages */}
              <View style={styles.legendGrid}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendRing, { borderColor: theme.colors.success }]} />
                  <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Great Day</Text>
                  <Text style={[styles.legendCount, { color: theme.colors.text }]}>
                    {wellBeingLegend.summary.greatDays}
                  </Text>
                  <Text style={[styles.legendPercentage, { color: theme.colors.success }]}>
                    {wellBeingLegend.percentages.greatDays}%
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendRing, { borderColor: theme.colors.primary }]} />
                  <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Good Day</Text>
                  <Text style={[styles.legendCount, { color: theme.colors.text }]}>
                    {wellBeingLegend.summary.goodDays}
                  </Text>
                  <Text style={[styles.legendPercentage, { color: theme.colors.primary }]}>
                    {wellBeingLegend.percentages.goodDays}%
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendRing, { borderColor: theme.colors.warning }]} />
                  <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Fair Day</Text>
                  <Text style={[styles.legendCount, { color: theme.colors.text }]}>
                    {wellBeingLegend.summary.fairDays}
                  </Text>
                  <Text style={[styles.legendPercentage, { color: theme.colors.warning }]}>
                    {wellBeingLegend.percentages.fairDays}%
                  </Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendRing, { borderColor: theme.colors.error }]} />
                  <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Tough Day</Text>
                  <Text style={[styles.legendCount, { color: theme.colors.text }]}>
                    {wellBeingLegend.summary.toughDays}
                  </Text>
                  <Text style={[styles.legendPercentage, { color: theme.colors.error }]}>
                    {wellBeingLegend.percentages.toughDays}%
                  </Text>
                </View>
              </View>
              
              <View style={[styles.legendDivider, { backgroundColor: theme.colors.border }]} />
              
              {/* Impact Insights */}
              <Text style={[styles.legendSubtitle, { color: theme.colors.text }]}>Impact Insights</Text>
              <View style={styles.impactInsightsContainer}>
                {wellBeingLegend.impactInsights.map((insight, index) => (
                  <View key={index} style={styles.impactInsightItem}>
                    <Text style={[styles.impactInsightBullet, { color: theme.colors.primary }]}>•</Text>
                    <Text style={[styles.impactInsightText, { color: theme.colors.textSecondary }]}>
                      {insight}
                    </Text>
                  </View>
                ))}
              </View>
              
              <View style={[styles.legendDivider, { backgroundColor: theme.colors.border }]} />
              
              {/* Data Indicators */}
              <Text style={[styles.legendSubtitle, { color: theme.colors.textSecondary }]}>Data Indicators</Text>
              <View style={styles.legendGrid}>
                <View style={styles.legendItem}>
                  <View style={[styles.microDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={[styles.legendTextSmall, { color: theme.colors.textSecondary }]}>Sleep</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.microDot, { backgroundColor: '#A855F7' }]} />
                  <Text style={[styles.legendTextSmall, { color: theme.colors.textSecondary }]}>Activities</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.microDot, { backgroundColor: '#10B981' }]} />
                  <Text style={[styles.legendTextSmall, { color: theme.colors.textSecondary }]}>Habits</Text>
                </View>
              </View>
              
              <Text style={[styles.legendSubtext, { color: theme.colors.textSecondary }]}>
                Tap any date to see detailed insights • Colors reflect combined mood, sleep & clarity scores
              </Text>
            </>
          ) : (
            <View style={styles.legendEmptyState}>
              <Text style={[styles.legendEmptyText, { color: theme.colors.textSecondary }]}>
                No mood data available for this month yet.
              </Text>
              <Text style={[styles.legendEmptySubtext, { color: theme.colors.textSecondary }]}>
                Start logging to see your well-being distribution and impact insights.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <DayDetailModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedDayDetailData(null);
        }}
        data={selectedDayData}
      />

      {/* Confirmation Modal for Logging Past Data */}
      <Modal
        visible={confirmLogModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelLogData}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmModal, { backgroundColor: theme.colors.card }]}>
            <View style={styles.confirmModalHeader}>
              <CalendarIcon size={32} color={theme.colors.primary} />
              <TouchableOpacity 
                onPress={handleCancelLogData}
                style={styles.closeModalButton}
              >
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.confirmModalTitle, { color: theme.colors.text }]}>
              Log Data for Past Date
            </Text>
            
            <Text style={[styles.confirmModalDate, { color: theme.colors.primary }]}>
              {selectedDate ? formatDateForDisplay(selectedDate) : ''}
            </Text>
            
            <Text style={[styles.confirmModalMessage, { color: theme.colors.textSecondary }]}>
              You're about to log wellness data for a past date. You can track your mood, activities, sleep, and more for this day.
            </Text>
            
            <View style={styles.confirmModalActions}>
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={handleCancelLogData}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmModalButton, styles.continueButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleConfirmLogData}
              >
                <Plus size={20} color="#FFFFFF" />
                <Text style={styles.continueButtonText}>Log Data</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  infoBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  infoBannerText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  monthYear: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.3,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  statsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    letterSpacing: 0.2,
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
    width: 14,
    height: 14,
    borderRadius: 7,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  overviewEmptyState: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  overviewEmptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  overviewLoadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  calendarContainer: {
    marginHorizontal: 20,
    marginBottom: 12, // Reduced to give more space for calendar
    borderRadius: 20,
    padding: 16, // Reduced padding to maximize calendar space
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 12, // Reduced margin
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12, // Slightly smaller
    fontWeight: '700',
    color: '#6B7280',
    paddingVertical: 4,
    letterSpacing: 0.5,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Add horizontal spacing between columns
    justifyContent: 'space-between',
    rowGap: 14, // Add vertical spacing between rows
  },
  emptyDay: {
    width: '12%', // Reduced from 14.28% to allow for gap spacing
    aspectRatio: 1,
  },
  dayCell: {
    width: '12%', // Reduced from 14.28% to allow for gap spacing (7 cells + gaps = 100%)
    aspectRatio: 1,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'flex-start', // Align to top for consistent layout
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayCircle: {
    width: '95%', // Increased from 90% to use more space
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2, // Increased from 1.5 to match mood circles
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dayWithMoodContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  dayNumberAbove: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
    textAlign: 'center',
  },
  todayNumberAbove: {
    fontSize: 12,
    fontWeight: '700',
  },
  dayCircleWithMood: {
    width: '90%', // Increased from 85% to use more space
    aspectRatio: 1,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircleWithMood: {
    borderWidth: 3,
    borderColor: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyCircle: {
    borderStyle: 'solid',
  },
  dataCircle: {
    borderWidth: 2,
  },
  todayCircle: {
    borderWidth: 2.5,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIndicator: {
    marginTop: 2, // Reduced margin
    opacity: 0.4,
  },
  dayText: {
    fontSize: 15, // Larger for better visibility
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  dayTextOnMood: {
    fontSize: 10, // Reduced from 11 for better fit
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.3,
    marginBottom: 1, // Reduced from 2
  },
  todayTextOnMood: {
    fontSize: 11, // Reduced from 12
    fontWeight: '800',
  },
  dataText: {
    fontWeight: '600',
  },
  todayText: {
    fontWeight: '700',
    fontSize: 15,
  },
  disabledText: {
    opacity: 0.3,
  },
  disabledCircle: {
    opacity: 0.3,
  },
  dataIndicators: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  moodEmoji: {
    fontSize: 14,
    marginTop: 1,
  },
  moodEmojiLarge: {
    fontSize: 22, // Increased to use available space
    lineHeight: 24,
  },
  microIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2, // Reduced margin
    gap: 2, // Reduced gap
  },
  microDot: {
    width: 5, // Slightly smaller
    height: 5,
    borderRadius: 2.5,
  },
  indicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  compactLegendContainer: {
    marginTop: 12, // Reduced from 20 to save space
    paddingTop: 12, // Reduced from 16
  },
  compactLegendDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 8, // Reduced from 12
  },
  compactLegendTitle: {
    fontSize: 11, // Reduced from 12
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8, // Reduced from 12
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  compactLegendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 6, // Reduced from 8
    marginBottom: 8, // Reduced from 12
  },
  compactLegendItem: {
    width: '31%',
    alignItems: 'center',
    gap: 3, // Reduced from 4
  },
  compactColorCircle: {
    width: 28, // Reduced from 32
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactEmoji: {
    fontSize: 14, // Reduced from 16
  },
  compactLegendText: {
    fontSize: 9, // Reduced from 10
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  compactDotsLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  compactDotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactDotText: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
  },
  legendContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  legendTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  legendSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    marginTop: 8,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
    gap: 8,
    minWidth: '45%',
  },
  legendCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 'auto',
  },
  legendPercentage: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  legendLoadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  legendEmptyState: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  legendEmptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  legendEmptySubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  impactInsightsContainer: {
    marginBottom: 12,
  },
  impactInsightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  impactInsightBullet: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
    marginTop: 1,
  },
  impactInsightText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  legendRing: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  legendTextSmall: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  legendDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  legendSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 12,
  },
  // Summary card styles
  summaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  summaryTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  summaryEmoji: {
    fontSize: 28,
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: '700',
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
    borderTopColor: '#F3F4F6',
    paddingTop: 20,
  },
  insightsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 14,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  insightBullet: {
    fontSize: 16,
    color: '#10B981',
    marginRight: 10,
    marginTop: 1,
    fontWeight: '600',
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
    fontWeight: '400',
  },
  summaryLoadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  summaryEmptyState: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  summaryEmptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
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
  emptyStateButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 16,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  // Confirmation Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  confirmModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeModalButton: {
    padding: 4,
  },
  confirmModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  confirmModalDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  confirmModalMessage: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 28,
  },
  confirmModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmModalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    borderWidth: 1.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});