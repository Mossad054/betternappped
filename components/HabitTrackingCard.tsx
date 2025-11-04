import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import { AnalyticsService } from '../services/analytics.service';

const { width } = Dimensions.get('window');

interface HabitTrackingCardProps {
  userId: string;
  period?: 'week' | 'month' | 'all';
}

const HabitTrackingCard: React.FC<HabitTrackingCardProps> = ({ 
  userId, 
  period = 'month' 
}) => {
  const { theme } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>(period);
  const [loading, setLoading] = useState(true);
  const [habitData, setHabitData] = useState<any>(null);
  const [selectedHabit, setSelectedHabit] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadHabitData();
  }, [userId, selectedPeriod]);

  const loadHabitData = async () => {
    setLoading(true);
    try {
      const result = await AnalyticsService.analyzeUserHabits(userId, selectedPeriod);
      if (result.data) {
        setHabitData(result.data);
      }
    } catch (error) {
      console.error('Error loading habit data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMiniDonutChart = () => {
    if (!habitData || habitData.habits.length === 0) return null;

    const size = 80;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = habitData.summary.avgProgress;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <View style={styles.donutContainer}>
        <Svg width={size} height={size}>
          <Defs>
            <SvgGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#60A5FA" />
              <Stop offset="100%" stopColor="#A78BFA" />
            </SvgGradient>
          </Defs>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.colors.border}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#donutGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.donutCenter}>
          <Text style={[styles.donutPercentage, { color: theme.colors.text }]}>
            {Math.round(progress)}%
          </Text>
        </View>
      </View>
    );
  };

  const renderProgressBar = (progress: number, impact: string) => {
    let gradientColors: [string, string] = ['#60A5FA', '#A78BFA']; // Default blue to purple
    
    if (impact === 'high') {
      gradientColors = ['#10B981', '#34D399']; // Green
    } else if (impact === 'medium') {
      gradientColors = ['#60A5FA', '#818CF8']; // Blue
    } else if (impact === 'low') {
      gradientColors = ['#F59E0B', '#FBBF24']; // Amber
    }

    return (
      <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.border }]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBarFill, { width: `${Math.min(progress, 100)}%` }]}
        />
      </View>
    );
  };

  const renderTrendIndicator = (trend: string, completionRate: number) => {
    if (trend === 'up' && completionRate > 70) {
      return <Text style={styles.trendEmoji}>🟩</Text>;
    } else if (trend === 'down' || completionRate < 40) {
      return <Text style={styles.trendEmoji}>🟥</Text>;
    }
    return <Text style={styles.trendEmoji}>🟨</Text>;
  };

  const renderHabitItem = (habit: any) => (
    <TouchableOpacity
      key={habit.id}
      style={[styles.habitItem, { backgroundColor: theme.colors.card }]}
      onPress={() => {
        setSelectedHabit(habit);
        setModalVisible(true);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.habitHeader}>
        <View style={styles.habitTitleRow}>
          <Text style={styles.habitEmoji}>{habit.emoji}</Text>
          <View style={styles.habitTitleContainer}>
            <Text style={[styles.habitName, { color: theme.colors.text }]} numberOfLines={1}>
              {habit.name}
            </Text>
            <Text style={[styles.habitCategory, { color: theme.colors.textSecondary }]}>
              {habit.category}
            </Text>
          </View>
          {renderTrendIndicator(habit.trend, habit.completionRate)}
        </View>
      </View>

      <View style={styles.habitStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {habit.completionRate}%
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Completion
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {habit.currentStreak}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Streak
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.text }]}>
            {habit.impact.toUpperCase()}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            Impact
          </Text>
        </View>
      </View>

      {renderProgressBar(habit.progress, habit.impact)}

      <Text style={[styles.recommendation, { color: theme.colors.textSecondary }]}>
        {habit.recommendation}
      </Text>
    </TouchableOpacity>
  );

  const renderPeriodTabs = () => (
    <View style={styles.periodTabs}>
      {(['week', 'month', 'all'] as const).map((p) => (
        <TouchableOpacity
          key={p}
          style={[
            styles.periodTab,
            selectedPeriod === p && styles.periodTabActive,
            { borderColor: theme.colors.border },
          ]}
          onPress={() => setSelectedPeriod(p)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.periodTabText,
              { color: selectedPeriod === p ? '#60A5FA' : theme.colors.textSecondary },
            ]}
          >
            {p === 'all' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDetailModal = () => {
    if (!selectedHabit) return null;

    return (
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Text style={styles.modalEmoji}>{selectedHabit.emoji}</Text>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  {selectedHabit.name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalClose, { color: theme.colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Progress Summary */}
              <View style={[styles.modalSection, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                  Progress Summary
                </Text>
                <View style={styles.modalStatsRow}>
                  <View style={styles.modalStatItem}>
                    <Text style={[styles.modalStatValue, { color: '#60A5FA' }]}>
                      {selectedHabit.completionRate}%
                    </Text>
                    <Text style={[styles.modalStatLabel, { color: theme.colors.textSecondary }]}>
                      Completion Rate
                    </Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={[styles.modalStatValue, { color: '#A78BFA' }]}>
                      {selectedHabit.currentStreak}
                    </Text>
                    <Text style={[styles.modalStatLabel, { color: theme.colors.textSecondary }]}>
                      Current Streak
                    </Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Text style={[styles.modalStatValue, { color: '#10B981' }]}>
                      {selectedHabit.bestStreak}
                    </Text>
                    <Text style={[styles.modalStatLabel, { color: theme.colors.textSecondary }]}>
                      Best Streak
                    </Text>
                  </View>
                </View>
              </View>

              {/* Wellness Correlations */}
              <View style={[styles.modalSection, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                  Wellness Impact
                </Text>
                <View style={styles.correlationItem}>
                  <Text style={[styles.correlationLabel, { color: theme.colors.text }]}>
                    😊 Mood
                  </Text>
                  <View style={styles.correlationBar}>
                    <View
                      style={[
                        styles.correlationFill,
                        {
                          width: `${Math.abs(selectedHabit.correlations.mood) * 100}%`,
                          backgroundColor:
                            selectedHabit.correlations.mood > 0 ? '#10B981' : '#EF4444',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.correlationValue, { color: theme.colors.textSecondary }]}>
                    {selectedHabit.correlations.mood > 0 ? '+' : ''}
                    {(selectedHabit.correlations.mood * 100).toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.correlationItem}>
                  <Text style={[styles.correlationLabel, { color: theme.colors.text }]}>
                    😴 Sleep
                  </Text>
                  <View style={styles.correlationBar}>
                    <View
                      style={[
                        styles.correlationFill,
                        {
                          width: `${Math.abs(selectedHabit.correlations.sleep) * 100}%`,
                          backgroundColor:
                            selectedHabit.correlations.sleep > 0 ? '#10B981' : '#EF4444',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.correlationValue, { color: theme.colors.textSecondary }]}>
                    {selectedHabit.correlations.sleep > 0 ? '+' : ''}
                    {(selectedHabit.correlations.sleep * 100).toFixed(0)}%
                  </Text>
                </View>
                <View style={styles.correlationItem}>
                  <Text style={[styles.correlationLabel, { color: theme.colors.text }]}>
                    🧠 Clarity
                  </Text>
                  <View style={styles.correlationBar}>
                    <View
                      style={[
                        styles.correlationFill,
                        {
                          width: `${Math.abs(selectedHabit.correlations.clarity) * 100}%`,
                          backgroundColor:
                            selectedHabit.correlations.clarity > 0 ? '#10B981' : '#EF4444',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.correlationValue, { color: theme.colors.textSecondary }]}>
                    {selectedHabit.correlations.clarity > 0 ? '+' : ''}
                    {(selectedHabit.correlations.clarity * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>

              {/* Recommendation */}
              <View style={[styles.modalSection, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                  Smart Recommendation
                </Text>
                <Text style={[styles.modalRecommendation, { color: theme.colors.text }]}>
                  {selectedHabit.recommendation}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
                    ⭐ Make Core Habit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
                    ✏️ Edit Habit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
                    ⏸️ Pause Habit
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <ActivityIndicator size="large" color="#60A5FA" />
      </View>
    );
  }

  if (!habitData || habitData.habits.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.header, { color: theme.colors.text }]}>Habit Tracking & Progress</Text>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Start tracking habits to see how they impact your wellness!
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: theme.colors.text }]}>Habit Tracking & Progress</Text>
        {renderMiniDonutChart()}
      </View>

      {/* Period Tabs */}
      {renderPeriodTabs()}

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.summaryValue, { color: '#60A5FA' }]}>
            {habitData.summary.totalActive}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Active Habits
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.summaryValue, { color: '#A78BFA' }]}>
            {habitData.summary.avgCompletionRate}%
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Avg Completion
          </Text>
        </View>
      </View>

      {/* Insights */}
      {habitData.insights && habitData.insights.length > 0 && (
        <View style={[styles.insightsSection, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.insightsTitle, { color: theme.colors.text }]}>
            💡 Key Insights
          </Text>
          {habitData.insights.map((insight: string, index: number) => (
            <Text
              key={index}
              style={[styles.insightText, { color: theme.colors.textSecondary }]}
            >
              {insight}
            </Text>
          ))}
        </View>
      )}

      {/* Habit List */}
      <ScrollView
        style={styles.habitList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {habitData.habits.map(renderHabitItem)}
      </ScrollView>

      {/* Detail Modal */}
      {renderDetailModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  donutContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  donutCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutPercentage: {
    fontSize: 18,
    fontWeight: '700',
  },
  periodTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodTabActive: {
    borderColor: '#60A5FA',
  },
  periodTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  insightsSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  habitList: {
    maxHeight: 600,
  },
  habitItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  habitHeader: {
    marginBottom: 12,
  },
  habitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  habitTitleContainer: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  habitCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  trendEmoji: {
    fontSize: 16,
    marginLeft: 8,
  },
  habitStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  recommendation: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  modalClose: {
    fontSize: 28,
    fontWeight: '300',
  },
  modalSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  correlationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  correlationLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 80,
  },
  correlationBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  correlationFill: {
    height: '100%',
    borderRadius: 4,
  },
  correlationValue: {
    fontSize: 12,
    fontWeight: '600',
    width: 50,
    textAlign: 'right',
  },
  modalRecommendation: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalActions: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default HabitTrackingCard;
