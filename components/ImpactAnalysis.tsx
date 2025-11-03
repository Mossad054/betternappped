import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { AnalyticsService } from '@/services/analytics.service';

interface ImpactAnalysisProps {
  userId: string;
  timeRange: string;
}

export default function ImpactAnalysis({ userId, timeRange }: ImpactAnalysisProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [impactData, setImpactData] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    loadImpactData();
  }, [userId, timeRange]);

  const loadImpactData = async () => {
    setLoading(true);
    try {
      // Get data from analytics service
      const daysToAnalyze = {
        'today': 1,
        'week': 7,
        'month': 30,
        'year': 365
      }[timeRange] || 7;

      const [activityImpact, moodTrends, sleepPatterns] = await Promise.all([
        AnalyticsService.calculateActivityImpact(userId, daysToAnalyze),
        AnalyticsService.calculateMoodTrends(userId, daysToAnalyze),
        AnalyticsService.calculateSleepPatterns(userId, daysToAnalyze)
      ]);

      setImpactData({
        activities: activityImpact.data,
        mood: moodTrends.data,
        sleep: sleepPatterns.data
      });
    } catch (error) {
      console.error('Error loading impact data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
          Analyzing your data...
        </Text>
      </View>
    );
  }

  if (!impactData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Unable to analyze impact
        </Text>
      </View>
    );
  }

  const renderActivitySummary = () => {
    const { correlations = [], summary = {} } = impactData.activities || {};
    return (
      <View style={styles.summarySection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Activity Impact
        </Text>
        {correlations.map((item: any, index: number) => {
          const getImpactColor = (impact: string) => {
            switch (impact) {
              case 'very-positive': return theme.colors.success;
              case 'positive': return theme.colors.primary;
              case 'negative': return theme.colors.error;
              default: return theme.colors.warning;
            }
          };

          const getImpactEmoji = (impact: string) => {
            switch (impact) {
              case 'very-positive': return '⭐';
              case 'positive': return '✨';
              case 'negative': return '⚠️';
              default: return '🔄';
            }
          };

          const getImpactText = (impact: string) => {
            switch (impact) {
              case 'very-positive': return 'Strong positive';
              case 'positive': return 'Positive';
              case 'negative': return 'Needs attention';
              default: return 'Neutral';
            }
          };

          return (
            <View key={index} style={styles.impactRow}>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryText, { color: theme.colors.text }]}>
                  {item.category}
                </Text>
                <Text style={[styles.categorySubtext, { color: theme.colors.textSecondary }]}>
                  {item.count} activities
                </Text>
              </View>
              <View style={styles.impactInfo}>
                <Text style={[styles.impactText, { color: getImpactColor(item.impact) }]}>
                  {getImpactEmoji(item.impact)} {getImpactText(item.impact)}
                </Text>
                <View style={styles.impactMetrics}>
                  {item.metrics && (
                    <>
                      <Text style={[styles.metricText, { color: theme.colors.textSecondary }]}>
                        M:{Math.round(item.metrics.mood * 100)}%
                      </Text>
                      <Text style={[styles.metricText, { color: theme.colors.textSecondary }]}>
                        S:{Math.round(item.metrics.sleep * 100)}%
                      </Text>
                      <Text style={[styles.metricText, { color: theme.colors.textSecondary }]}>
                        C:{Math.round(item.metrics.clarity * 100)}%
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          );
        })}
        {summary.totalActivities > 0 && (
          <View style={styles.summaryStats}>
            <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
              Based on {summary.totalActivities} activities
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBackground }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            Detailed Impact Analysis
          </Text>
          
          {/* Mood Section */}
          <View style={styles.modalSection}>
            <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
              Mood Impact
            </Text>
            <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>
              Average: {impactData.mood.average} / 5
            </Text>
            <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>
              Trend: {impactData.mood.trend.charAt(0).toUpperCase() + impactData.mood.trend.slice(1)}
            </Text>
          </View>

          {/* Sleep Section */}
          <View style={styles.modalSection}>
            <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
              Sleep Quality
            </Text>
            <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>
              Average Hours: {impactData.sleep.averageHours}
            </Text>
            <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>
              Quality: {impactData.sleep.quality} / 5
            </Text>
          </View>

          {/* Activities Section */}
          <View style={styles.modalSection}>
            <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
              Activity Categories
            </Text>
            {impactData.activities.correlations.map((item: any, index: number) => (
              <View key={index} style={styles.modalImpactRow}>
                <Text style={[styles.modalCategoryText, { color: theme.colors.text }]}>
                  {item.category}
                </Text>
                <View>
                  <Text style={[styles.modalImpactText, { color: theme.colors.textSecondary }]}>
                    {item.count} activities
                  </Text>
                  <Text style={[styles.modalImpactStatus, { 
                    color: item.impact === 'positive' ? theme.colors.success : theme.colors.warning 
                  }]}>
                    {item.impact === 'positive' ? '✨ Positive impact' : '⚠️ Mixed results'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Insights */}
          <View style={styles.modalSection}>
            <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
              Key Insights
            </Text>
            {[...impactData.activities.insights, ...impactData.mood.insights].map((insight: string, index: number) => (
              <Text key={index} style={[styles.modalInsight, { color: theme.colors.textSecondary }]}>
                • {insight}
              </Text>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setIsModalVisible(false)}
          >
            <Text style={[styles.closeButtonText, { color: theme.colors.cardBackground }]}>
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.cardBackground }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Impact Analysis
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            How your activities affect your wellbeing
          </Text>
        </View>
        <TouchableOpacity onPress={() => setIsModalVisible(true)}>
          <Text style={[styles.detailsButton, { color: theme.colors.primary }]}>
            See Details →
          </Text>
        </TouchableOpacity>
      </View>

      {renderActivitySummary()}
      
      <View style={styles.summarySection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Overall Impact
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {impactData.mood.average}/5
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Mood Score
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {impactData.sleep.quality}/5
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              Sleep Quality
            </Text>
          </View>
        </View>
      </View>

      {renderModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  detailsButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
    padding: 20,
  },
  summarySection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  categorySubtext: {
    fontSize: 12,
  },
  impactInfo: {
    alignItems: 'flex-end',
  },
  impactText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  impactMetrics: {
    flexDirection: 'row',
    gap: 8,
  },
  metricText: {
    fontSize: 12,
  },
  summaryStats: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  summaryText: {
    fontSize: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
  modalImpactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalCategoryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalImpactText: {
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 2,
  },
  modalImpactStatus: {
    fontSize: 12,
    textAlign: 'right',
  },
  modalInsight: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});