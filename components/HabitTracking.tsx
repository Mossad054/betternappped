import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';

interface HabitData {
  id: string;
  date: string;
  completed: boolean;
  feedback?: string;
  name?: string;
  category?: string;
  streak?: number;
}

interface HabitTrackingProps {
  data: HabitData[];
  timeRange: 'today' | 'week' | 'month';
}

export default function HabitTracking({ data, timeRange }: HabitTrackingProps) {
  const { theme } = useTheme();
  const [selectedDay, setSelectedDay] = useState<HabitData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Calculate completion rate from live data
  const getHabitCompletionRate = (habitData: HabitData[]) => {
    if (!habitData || habitData.length === 0) return 0;
    const completed = habitData.filter(item => item.completed).length;
    return Math.round((completed / habitData.length) * 100);
  };
  
  const completionRate = getHabitCompletionRate(data);
  
  const getCurrentStreak = () => {
    let streak = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].completed) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const renderMiniCalendar = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return (
      <View style={styles.miniCalendar}>
        <Text style={[styles.calendarTitle, { color: theme.colors.text }]}>7-Day Habit Overview</Text>
        <View style={styles.calendarGrid}>
          {data.slice(0, 7).map((item, index) => {
            const date = new Date(item.date);
            const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
            const dayNumber = date.getDate();
            
            return (
              <TouchableOpacity
                key={`${item.date}-${index}`}
                style={[
                  styles.calendarDay,
                  { backgroundColor: item.completed ? theme.colors.primary : theme.colors.error }
                ]}
                onPress={() => {
                  setSelectedDay(item);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.dayName}>{dayName}</Text>
                <Text style={styles.dayNumber}>{dayNumber}</Text>
                <Text style={styles.dayStatus}>
                  {item.completed ? '✅' : '❌'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.calendarLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Completed</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Missed</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStreakCalendar = () => {
    if (timeRange === 'today') {
      const todayData = data[0];
      return (
        <View style={styles.singleDayContainer}>
          <Text style={styles.singleDayEmoji}>
            {todayData?.completed ? '🔥' : '⭕'}
          </Text>
          <Text style={styles.singleDayText}>
            {todayData?.completed ? 'Habit completed today!' : 'Complete your habit today'}
          </Text>
        </View>
      );
    }

    if (timeRange === 'week') {
      return renderMiniCalendar();
    }

    const daysPerRow = 7;
    const rows = Math.ceil(data.length / daysPerRow);
    
    return (
      <View style={styles.calendarContainer}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.calendarRow}>
            {Array.from({ length: daysPerRow }).map((_, colIndex) => {
              const dayIndex = rowIndex * daysPerRow + colIndex;
              const dayData = data[dayIndex];
              
              if (!dayData) return <View key={`empty-${rowIndex}-${colIndex}`} style={styles.emptyDay} />;
              
              return (
                <TouchableOpacity
                  key={`${dayData.date}-${dayIndex}`}
                  style={[
                    styles.calendarDay,
                    dayData.completed ? styles.completedDay : styles.skippedDay,
                  ]}
                  onPress={() => {
                    setSelectedDay(dayData);
                    setModalVisible(true);
                  }}
                >
                  <Text style={styles.calendarDayText}>
                    {dayData.completed ? '🔥' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const renderCompletionRing = () => {
    const radius = 40;
    const strokeWidth = 8;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (completionRate / 100) * circumference;

    return (
      <View style={styles.ringContainer}>
        <Svg width={radius * 2} height={radius * 2}>
          <Circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <Circle
            stroke={theme.colors.primary}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={[styles.ringPercentage, { color: theme.colors.text }]}>{completionRate}%</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Habit Tracking</Text>
        {renderCompletionRing()}
      </View>

      <View style={styles.streakSection}>
        <Text style={[styles.streakTitle, { color: theme.colors.text }]}>
          {timeRange === 'today' ? 'Today\'s Progress' : 'Habit Streak Calendar'}
        </Text>
        {renderStreakCalendar()}
      </View>

      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{data.filter(d => d.completed).length}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>{data.length - data.filter(d => d.completed).length}</Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Missed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {Math.max(...data.map((_, index) => {
              let streak = 0;
              for (let i = index; i < data.length && data[i].completed; i++) {
                streak++;
              }
              return streak;
            }))}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Best Streak</Text>
        </View>
      </View>

      {/* Habit Detail Modal */}
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
                Habit Details
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={[styles.closeButtonText, { color: theme.colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedDay && (
              <View style={styles.modalBody}>
                <View style={styles.habitDetailHeader}>
                  <Text style={styles.habitEmoji}>
                    {selectedDay.completed ? '🔥' : '⭕'}
                  </Text>
                  <View style={styles.habitInfo}>
                    <Text style={[styles.habitStatus, { color: selectedDay.completed ? theme.colors.primary : theme.colors.error }]}>
                      {selectedDay.completed ? 'Completed' : 'Missed'}
                    </Text>
                    <Text style={[styles.habitDate, { color: theme.colors.textSecondary }]}>
                      {formatDate(selectedDay.date)}
                    </Text>
                  </View>
                </View>

                <View style={styles.streakInfo}>
                  <Text style={[styles.streakTitle, { color: theme.colors.text }]}>Current Streak</Text>
                  <Text style={[styles.streakValue, { color: theme.colors.primary }]}>
                    {getCurrentStreak()} days in a row!
                  </Text>
                  <Text style={[styles.streakDescription, { color: theme.colors.textSecondary }]}>
                    {getCurrentStreak() > 0 
                      ? `You've completed this habit ${getCurrentStreak()} days in a row!`
                      : 'Start your streak by completing this habit today.'
                    }
                  </Text>
                </View>

                <View style={styles.habitDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Completion Rate</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.textSecondary }]}>
                      {completionRate}%
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Total Days</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.textSecondary }]}>
                      {data.length} days
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Completed</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.primary }]}>
                      {data.filter(d => d.completed).length} days
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F97316',
  },
  streakSection: {
    marginBottom: 20,
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  singleDayContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  singleDayEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  singleDayText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  calendarContainer: {
    alignItems: 'center',
  },
  calendarRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  calendarDay: {
    width: 32,
    height: 32,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedDay: {
    backgroundColor: '#FED7AA',
  },
  skippedDay: {
    backgroundColor: '#F3F4F6',
  },
  emptyDay: {
    width: 32,
    height: 32,
    marginHorizontal: 2,
  },
  calendarDayText: {
    fontSize: 12,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F97316',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Mini Calendar styles
  miniCalendar: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  calendarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  calendarDay: {
    width: 40,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dayName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  dayStatus: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 10,
    color: '#6B7280',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6B7280',
  },
  modalBody: {
    padding: 20,
  },
  habitDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  habitEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  habitInfo: {
    flex: 1,
  },
  habitStatus: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  habitDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  streakInfo: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  streakValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  streakDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  habitDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  detailValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    lineHeight: 20,
  },
});