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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../contexts/ThemeContext';
import { AnalyticsService } from '../services/analytics.service';
import { ExperimentsService } from '../services/experiments.service';
import { HabitsService } from '../services/habits.service';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface ExperimentResultsCardProps {
  userId: string;
  filter?: 'all' | 'active' | 'completed';
}

const ExperimentResultsCard: React.FC<ExperimentResultsCardProps> = ({ 
  userId, 
  filter = 'all' 
}) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'completed'>(filter);
  const [loading, setLoading] = useState(true);
  const [experimentData, setExperimentData] = useState<any>(null);
  const [selectedExperiment, setSelectedExperiment] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [convertingToHabit, setConvertingToHabit] = useState(false);

  useEffect(() => {
    loadExperimentData();
  }, [userId, selectedFilter]);

  const loadExperimentData = async () => {
    setLoading(true);
    try {
      const result = await AnalyticsService.analyzeUserExperiments(userId, selectedFilter);
      if (result.data) {
        setExperimentData(result.data);
      }
    } catch (error) {
      console.error('Error loading experiment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToHabit = async () => {
    if (!selectedExperiment || !user) return;

    Alert.alert(
      'Convert to Habit',
      `Convert "${selectedExperiment.name}" into a habit? This will add it to your habit library so you can track it daily.`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Convert',
          onPress: async () => {
            setConvertingToHabit(true);
            try {
              // Use the ExperimentsService convertToHabit method
              const result = await ExperimentsService.convertToHabit(selectedExperiment.id, user.id);
              
              if (result.error) {
                throw new Error(result.error);
              }

              Alert.alert(
                'Success! 🎉',
                `"${selectedExperiment.name}" has been added to your habit library!`,
                [
                  {
                    text: 'View Habits',
                    onPress: () => {
                      setModalVisible(false);
                      router.push('/habit-library');
                    }
                  },
                  {
                    text: 'OK',
                    onPress: () => setModalVisible(false)
                  }
                ]
              );
            } catch (error) {
              console.error('Error converting to habit:', error);
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to convert experiment to habit. Please try again.'
              );
            } finally {
              setConvertingToHabit(false);
            }
          }
        }
      ]
    );
  };

  const getImpactBadge = (impactLevel: string) => {
    const badges = {
      positive: { emoji: '🟩', color: '#10B981', label: 'Positive' },
      neutral: { emoji: '🟧', color: '#F59E0B', label: 'Neutral' },
      negative: { emoji: '🟥', color: '#EF4444', label: 'Negative' },
    };
    return badges[impactLevel as keyof typeof badges] || badges.neutral;
  };

  const getTrendIndicator = (change: number) => {
    if (change >= 0.15) return '↑↑'; // Strong increase
    if (change >= 0.05) return '↑'; // Increase
    if (change <= -0.15) return '↓↓'; // Strong decrease
    if (change <= -0.05) return '↓'; // Decrease
    return '→'; // Stable
  };

  const renderDonutChart = () => {
    if (!experimentData || experimentData.summary.totalExperiments === 0) return null;

    const size = 100;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const { positiveExperiments, neutralExperiments, negativeExperiments, totalExperiments } = experimentData.summary;
    
    const positivePercent = (positiveExperiments / totalExperiments) * 100;
    const neutralPercent = (neutralExperiments / totalExperiments) * 100;
    const negativePercent = (negativeExperiments / totalExperiments) * 100;

    // Calculate stroke dash offsets
    const positiveLength = (positivePercent / 100) * circumference;
    const neutralLength = (neutralPercent / 100) * circumference;
    const negativeLength = (negativePercent / 100) * circumference;

    return (
      <View style={styles.donutContainer}>
        <Svg width={size} height={size}>
          {/* Positive segment */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#10B981"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${positiveLength} ${circumference - positiveLength}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          {/* Neutral segment */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F59E0B"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${neutralLength} ${circumference - neutralLength}`}
            strokeDashoffset={-positiveLength}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          {/* Negative segment */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EF4444"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${negativeLength} ${circumference - negativeLength}`}
            strokeDashoffset={-(positiveLength + neutralLength)}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.donutCenter}>
          <Text style={[styles.donutValue, { color: theme.colors.text }]}>
            {totalExperiments}
          </Text>
          <Text style={[styles.donutLabel, { color: theme.colors.textSecondary }]}>
            Total
          </Text>
        </View>
      </View>
    );
  };

  const renderProgressBar = (progress: number, impactLevel: string) => {
    const badge = getImpactBadge(impactLevel);
    
    return (
      <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.border }]}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${Math.min(progress, 100)}%`, backgroundColor: badge.color }
          ]}
        />
      </View>
    );
  };

  const renderExperimentItem = (experiment: any) => {
    const badge = getImpactBadge(experiment.impactLevel);
    
    return (
      <TouchableOpacity
        key={experiment.id}
        style={[styles.experimentItem, { backgroundColor: theme.colors.card }]}
        onPress={() => {
          setSelectedExperiment(experiment);
          setModalVisible(true);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.experimentHeader}>
          <View style={styles.experimentTitleRow}>
            <Text style={styles.experimentEmoji}>{experiment.emoji}</Text>
            <View style={styles.experimentTitleContainer}>
              <Text style={[styles.experimentName, { color: theme.colors.text }]} numberOfLines={1}>
                {experiment.name}
              </Text>
              <View style={styles.experimentMeta}>
                <Text style={[styles.experimentStatus, { color: theme.colors.textSecondary }]}>
                  {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)} • Day {Math.max(experiment.currentDay, 1)}/{experiment.duration}
                </Text>
              </View>
            </View>
            <View style={[styles.impactBadge, { backgroundColor: badge.color + '20' }]}>
              <Text style={styles.impactEmoji}>{badge.emoji}</Text>
            </View>
          </View>
        </View>

        {renderProgressBar(experiment.progress, experiment.impactLevel)}

        {/* Trend Indicators */}
        <View style={styles.trendRow}>
          <View style={styles.trendItem}>
            <Text style={[styles.trendLabel, { color: theme.colors.textSecondary }]}>😊</Text>
            <Text style={[styles.trendValue, { color: theme.colors.text }]}>
              {getTrendIndicator(experiment.impact.mood)}
            </Text>
          </View>
          <View style={styles.trendItem}>
            <Text style={[styles.trendLabel, { color: theme.colors.textSecondary }]}>😴</Text>
            <Text style={[styles.trendValue, { color: theme.colors.text }]}>
              {getTrendIndicator(experiment.impact.sleep)}
            </Text>
          </View>
          <View style={styles.trendItem}>
            <Text style={[styles.trendLabel, { color: theme.colors.textSecondary }]}>🧠</Text>
            <Text style={[styles.trendValue, { color: theme.colors.text }]}>
              {getTrendIndicator(experiment.impact.clarity)}
            </Text>
          </View>
          <View style={styles.trendItem}>
            <Text style={[styles.trendLabel, { color: theme.colors.textSecondary }]}>⚡</Text>
            <Text style={[styles.trendValue, { color: theme.colors.text }]}>
              {getTrendIndicator(experiment.impact.productivity)}
            </Text>
          </View>
        </View>

        <Text style={[styles.experimentSummary, { color: theme.colors.textSecondary }]}>
          {experiment.summary}
        </Text>

        <Text style={[styles.experimentRecommendation, { color: theme.colors.text }]}>
          {experiment.recommendation}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFilterTabs = () => (
    <View style={styles.filterTabs}>
      {(['all', 'active', 'completed'] as const).map((f) => (
        <TouchableOpacity
          key={f}
          style={[
            styles.filterTab,
            selectedFilter === f && styles.filterTabActive,
            { borderColor: theme.colors.border },
          ]}
          onPress={() => setSelectedFilter(f)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: selectedFilter === f ? '#60A5FA' : theme.colors.textSecondary },
            ]}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDetailModal = () => {
    if (!selectedExperiment) return null;

    const badge = getImpactBadge(selectedExperiment.impactLevel);

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
                <Text style={styles.modalEmoji}>{selectedExperiment.emoji}</Text>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  {selectedExperiment.name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalClose, { color: theme.colors.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Impact Badge */}
              <View style={[styles.modalBadge, { backgroundColor: badge.color + '20' }]}>
                <Text style={[styles.modalBadgeText, { color: badge.color }]}>
                  {badge.emoji} {badge.label} Impact
                </Text>
              </View>

              {/* Timeline */}
              <View style={[styles.modalSection, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                  Timeline
                </Text>
                <Text style={[styles.modalSectionText, { color: theme.colors.textSecondary }]}>
                  Started: {new Date(selectedExperiment.startDate).toLocaleDateString()}
                </Text>
                <Text style={[styles.modalSectionText, { color: theme.colors.textSecondary }]}>
                  Ends: {new Date(selectedExperiment.endDate).toLocaleDateString()}
                </Text>
                <Text style={[styles.modalSectionText, { color: theme.colors.textSecondary }]}>
                  Progress: Day {Math.max(selectedExperiment.currentDay, 1)} of {selectedExperiment.duration} ({selectedExperiment.progress}%)
                </Text>
              </View>

              {/* Wellness Changes */}
              <View style={[styles.modalSection, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                  Wellness Impact
                </Text>
                
                {['mood', 'sleep', 'clarity', 'productivity'].map((metric) => {
                  const details = selectedExperiment.changeDetails[metric];
                  const change = details.change * 100;
                  const emoji = { mood: '😊', sleep: '😴', clarity: '🧠', productivity: '⚡' }[metric];
                  
                  return (
                    <View key={metric} style={styles.changeItem}>
                      <Text style={[styles.changeLabel, { color: theme.colors.text }]}>
                        {emoji} {metric.charAt(0).toUpperCase() + metric.slice(1)}
                      </Text>
                      <View style={styles.changeValues}>
                        <Text style={[styles.changeValue, { color: theme.colors.textSecondary }]}>
                          {details.before.toFixed(1)} → {details.after.toFixed(1)}
                        </Text>
                        <Text style={[
                          styles.changePercent,
                          { color: change >= 0 ? '#10B981' : '#EF4444' }
                        ]}>
                          {change >= 0 ? '+' : ''}{change.toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Summary */}
              <View style={[styles.modalSection, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                  Summary
                </Text>
                <Text style={[styles.modalSectionText, { color: theme.colors.text }]}>
                  {selectedExperiment.summary}
                </Text>
              </View>

              {/* Recommendation */}
              <View style={[styles.modalSection, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                  Recommendation
                </Text>
                <Text style={[styles.modalSectionText, { color: theme.colors.text }]}>
                  {selectedExperiment.recommendation}
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                {selectedExperiment.impactLevel === 'positive' && (
                  <TouchableOpacity
                    style={[
                      styles.actionButton, 
                      { backgroundColor: '#10B981' },
                      convertingToHabit && styles.actionButtonDisabled
                    ]}
                    onPress={handleConvertToHabit}
                    activeOpacity={0.7}
                    disabled={convertingToHabit}
                  >
                    {convertingToHabit ? (
                      <View style={styles.buttonLoadingContainer}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.actionButtonText}>Converting...</Text>
                      </View>
                    ) : (
                      <Text style={styles.actionButtonText}>⭐ Convert to Habit</Text>
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.card }]}
                  onPress={() => {
                    setModalVisible(false);
                    router.push('/experiments-hub');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>
                    ✏️ Modify Experiment
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

  if (!experimentData || experimentData.experiments.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
        <Text style={[styles.header, { color: theme.colors.text }]}>Experiment Results</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Discover how your experiments affect your wellness
        </Text>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Start an experiment to see how activities impact your wellness metrics!
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.header, { color: theme.colors.text }]}>Experiment Results</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Discover how your experiments affect your wellness
          </Text>
        </View>
        {renderDonutChart()}
      </View>

      {/* Filter Tabs */}
      {renderFilterTabs()}

      {/* Summary Stats */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.summaryValue, { color: '#60A5FA' }]}>
            {experimentData.summary.active}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Active
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.summaryValue, { color: '#A78BFA' }]}>
            {experimentData.summary.completed}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Completed
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.summaryValue, { color: '#10B981' }]}>
            {experimentData.summary.positiveExperiments}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Positive
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.summaryValue, { color: '#EF4444' }]}>
            {experimentData.summary.negativeExperiments}
          </Text>
          <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
            Negative
          </Text>
        </View>
      </View>

      {/* Insights */}
      {experimentData.insights && experimentData.insights.length > 0 && (
        <View style={[styles.insightsSection, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.insightsTitle, { color: theme.colors.text }]}>
            💡 Key Insights
          </Text>
          {experimentData.insights.map((insight: string, index: number) => (
            <Text
              key={index}
              style={[styles.insightText, { color: theme.colors.textSecondary }]}
            >
              {insight}
            </Text>
          ))}
        </View>
      )}

      {/* Experiment List */}
      <ScrollView
        style={styles.experimentList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {experimentData.experiments.map(renderExperimentItem)}
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  donutContainer: {
    position: 'relative',
    width: 100,
    height: 100,
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
  donutValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  donutLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterTabActive: {
    borderColor: '#60A5FA',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 10,
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
  experimentList: {
    maxHeight: 600,
  },
  experimentItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  experimentHeader: {
    marginBottom: 12,
  },
  experimentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experimentEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  experimentTitleContainer: {
    flex: 1,
  },
  experimentName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  experimentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experimentStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  impactBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  impactEmoji: {
    fontSize: 18,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
  },
  trendItem: {
    alignItems: 'center',
  },
  trendLabel: {
    fontSize: 16,
    marginBottom: 2,
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  experimentSummary: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  experimentRecommendation: {
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
  modalBadge: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  modalBadgeText: {
    fontSize: 16,
    fontWeight: '700',
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
  modalSectionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  changeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  changeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  changeValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  changeValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  changePercent: {
    fontSize: 14,
    fontWeight: '700',
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
  actionButtonDisabled: {
    opacity: 0.6,
  },
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ExperimentResultsCard;
