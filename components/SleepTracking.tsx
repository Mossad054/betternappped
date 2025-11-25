import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions, TouchableOpacity, Modal } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';

interface SleepData {
  id: string;
  date: string;
  bedtime: string;
  wake_time: string;
  hours: number;
  quality: number;
  waking_feeling?: string;
}

interface SleepTrackingProps {
  data: SleepData[];
  timeRange: 'week' | 'month';
}

export default function SleepTracking({ data, timeRange }: SleepTrackingProps) {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const [selectedDay, setSelectedDay] = useState<SleepData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return theme.colors.primary;
      case 'good': return theme.colors.primary;
      case 'fair': return theme.colors.warning;
      case 'poor': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const averageHours = data.length > 0 ? data.reduce((sum, item) => sum + item.hours, 0) / data.length : 0;
  const consistentNights = data.filter(item => item.hours >= 7 && item.hours <= 9).length;
  const consistencyPercentage = data.length > 0 ? Math.round((consistentNights / data.length) * 100) : 0;

  const getDayColor = (hours: number) => {
    if (hours >= 7 && hours <= 9) return theme.colors.primary; // Green - met target
    if (hours >= 6 && hours < 7 || hours > 9 && hours <= 10) return theme.colors.warning; // Yellow - close
    return theme.colors.error; // Red - below target
  };

  const getDayStatus = (hours: number) => {
    if (hours >= 7 && hours <= 9) return 'Met target';
    if (hours >= 6 && hours < 7 || hours > 9 && hours <= 10) return 'Close to target';
    return 'Below target';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const renderMiniCalendar = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    if (!data || data.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateEmoji}>😴</Text>
          <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
            No sleep data yet. Start tracking your sleep to see insights!
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.miniCalendar}>
        <Text style={[styles.calendarTitle, { color: theme.colors.text }]}>7-Day Sleep Overview</Text>
        <View style={styles.calendarGrid}>
          {data.slice(0, 7).map((item, index) => {
            const date = new Date(item.date);
            const dayName = days[date.getDay() === 0 ? 6 : date.getDay() - 1];
            const dayNumber = date.getDate();
            
            return (
              <TouchableOpacity
                key={`${item.date}-${index}`}
                style={[styles.calendarDay, { backgroundColor: getDayColor(item.hours) }]}
                onPress={() => {
                  setSelectedDay(item);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.dayName}>{dayName}</Text>
                <Text style={styles.dayNumber}>{dayNumber}</Text>
                <Text style={styles.dayHours}>{item.hours}h</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.calendarLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Met target (7-9h)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.warning }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Close (6-7h, 9-10h)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.colors.error }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>Below target</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderBarChart = () => {
    if (data.length <= 1) {
      const sleepData = data[0];
      return (
        <View style={styles.singleDayContainer}>
          <Text style={styles.singleDayEmoji}>{sleepData?.emoji || '😴'}</Text>
          <Text style={[styles.singleDayHours, { color: theme.colors.text }]}>{sleepData?.hours || 0}h</Text>
          <Text style={[styles.singleDayText, { color: theme.colors.textSecondary }]}>
            {sleepData?.quality || 'fair'} sleep quality
          </Text>
        </View>
      );
    }

    const chartWidth = width - 80;
    const chartHeight = 120;
    const barWidth = (chartWidth - 40) / data.length;
    const maxHours = 10;

    return (
      <Svg width={chartWidth} height={chartHeight}>
        {data.map((item, index) => {
          const barHeight = (item.hours / maxHours) * 80;
          const x = 20 + index * barWidth;
          const y = chartHeight - barHeight - 20;
          
          return (
            <Rect
              key={`${item.date}-${index}`}
              x={x}
              y={y}
              width={barWidth - 4}
              height={barHeight}
              fill={getQualityColor(item.quality)}
              rx={2}
            />
          );
        })}
      </Svg>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Sleep Tracking</Text>
        <View style={styles.averageContainer}>
          <Text style={[styles.averageHours, { color: theme.colors.text }]}>{averageHours.toFixed(1)}h</Text>
          <Text style={[styles.averageLabel, { color: theme.colors.textSecondary }]}>avg</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        {timeRange === 'week' ? renderMiniCalendar() : renderBarChart()}
      </View>

      <View style={styles.emojiTrend}>
        <Text style={[styles.emojiTrendTitle, { color: theme.colors.text }]}>Quality Trend</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.emojiScrollView}
        >
          {data.map((item, index) => (
            <View key={`${item.date}-emoji-${index}`} style={styles.emojiItem}>
              <Text style={styles.emojiIcon}>{item.emoji}</Text>
              <Text style={[styles.emojiHours, { color: theme.colors.text }]}>{item.hours}h</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.consistencySection}>
        <Text style={[styles.consistencyTitle, { color: theme.colors.text }]}>Sleep Consistency</Text>
        <View style={styles.consistencyBadge}>
          <View style={styles.progressRing}>
            <View style={[styles.progressFill, { width: `${consistencyPercentage}%`, backgroundColor: theme.colors.primary }]} />
          </View>
          <Text style={[styles.consistencyText, { color: theme.colors.textSecondary }]}>
            {consistentNights}/{data.length} nights optimal (7-9h)
          </Text>
        </View>
      </View>

      {/* Sleep Detail Modal */}
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
                Sleep Details
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
                <View style={styles.sleepDetailHeader}>
                  <Text style={styles.sleepEmoji}>{selectedDay.emoji}</Text>
                  <View style={styles.sleepInfo}>
                    <Text style={[styles.sleepDuration, { color: theme.colors.text }]}>
                      {selectedDay.hours}h {Math.round((selectedDay.hours % 1) * 60)}m
                    </Text>
                    <Text style={[styles.sleepQuality, { color: theme.colors.textSecondary }]}>
                      {selectedDay.quality} quality
                    </Text>
                    <Text style={[styles.sleepDate, { color: theme.colors.textSecondary }]}>
                      {formatDate(selectedDay.date)}
                    </Text>
                  </View>
                </View>

                <View style={styles.sleepDetails}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Sleep Time</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.textSecondary }]}>
                      {selectedDay.bedtime || '11:00 PM'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Wake Time</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.textSecondary }]}>
                      {selectedDay.wake_time || '6:00 AM'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Status</Text>
                    <Text style={[styles.detailValue, { color: getDayColor(selectedDay.hours) }]}>
                      {getDayStatus(selectedDay.hours)}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: theme.colors.text }]}>Target Difference</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.textSecondary }]}>
                      {selectedDay.hours >= 7 && selectedDay.hours <= 9 
                        ? 'Met target!' 
                        : selectedDay.hours < 7 
                          ? `${(7 - selectedDay.hours).toFixed(1)}h under target`
                          : `${(selectedDay.hours - 9).toFixed(1)}h over target`
                      }
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
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
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
  averageContainer: {
    alignItems: 'center',
  },
  averageHours: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  averageLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  singleDayContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  singleDayEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  singleDayHours: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  singleDayText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emojiTrend: {
    marginBottom: 20,
  },
  emojiTrendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emojiScrollView: {
    flexDirection: 'row',
  },
  emojiItem: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 40,
  },
  emojiIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  emojiHours: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  consistencySection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  consistencyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  consistencyBadge: {
    alignItems: 'center',
  },
  progressRing: {
    width: '100%',
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D9F7A3',
    borderRadius: 12,
  },
  consistencyText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
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
  dayHours: {
    fontSize: 9,
    fontWeight: '500',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '60%',
    paddingTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
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
  sleepDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sleepEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  sleepInfo: {
    flex: 1,
  },
  sleepDuration: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sleepQuality: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  sleepDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  sleepDetails: {
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
});