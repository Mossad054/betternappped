import React, { useState } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { TimeRange } from '@/constants/mockData';
import { useTheme } from '@/contexts/ThemeContext';
import { CheckCircle, XCircle, X, TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react-native';

interface ActivityData {
  id: string;
  date: string;
  category: string;
  name: string;
  duration?: number;
  emoji?: string;
  follow_up_answer?: string;
  count?: number;
  impact?: number;
}

interface ActivityTrackingProps {
  data: ActivityData[];
  timeRange: TimeRange;
}

export default function ActivityTracking({ data, timeRange }: ActivityTrackingProps) {
  const { width } = useWindowDimensions();
  const { theme } = useTheme();
  const [selectedActivity, setSelectedActivity] = useState<ActivityData | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  
  const maxCount = Math.max(...data.map(item => item.count));
  const chartWidth = width - 140;
  
  const positiveActivities = data
    .filter(item => item.impact > 0)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3);
    
  const negativeActivities = data
    .filter(item => item.impact < 0)
    .sort((a, b) => a.impact - b.impact)
    .slice(0, 3);

  const getEngagementText = (count: number, category: string) => {
    if (timeRange === 'week') {
      return `Engaged ${count} times this week`;
    } else if (timeRange === 'month') {
      return `${count} activities this month`;
    } else if (timeRange === 'year') {
      return `${count} activities this year`;
    }
    return `${count} activities today`;
  };

  const handleActivityPress = (activity: ActivityData) => {
    setSelectedActivity(activity);
    setModalVisible(true);
  };

  const getDetailedInsight = (activity: ActivityData) => {
    const impactType = activity.impact > 0 ? 'positive' : 'negative';
    const impactMagnitude = Math.abs(activity.impact);
    
    if (impactType === 'positive') {
      return {
        title: `${activity.category} Boosts Your Mood`,
        description: `Your ${activity.category.toLowerCase()} activities have a strong positive correlation with your mood. Each session tends to improve your mood by ${impactMagnitude.toFixed(1)} points on average.`,
        recommendations: [
          `Try to maintain your current ${activity.category.toLowerCase()} routine`,
          `Consider increasing frequency during challenging periods`,
          `Track specific ${activity.category.toLowerCase()} activities that work best for you`
        ],
        trend: 'up' as const
      };
    } else {
      return {
        title: `${activity.category} May Need Attention`,
        description: `Your ${activity.category.toLowerCase()} activities show a negative correlation with your mood, potentially reducing it by ${impactMagnitude.toFixed(1)} points on average.`,
        recommendations: [
          `Consider reducing time spent on ${activity.category.toLowerCase()}`,
          `Try to identify specific triggers within this category`,
          `Replace with mood-boosting alternatives when possible`
        ],
        trend: 'down' as const
      };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Activity Tracking</Text>
      
      <View style={styles.chartContainer}>
        {data.map((item) => {
          const barWidth = (item.count / maxCount) * chartWidth;
          return (
            <View key={item.category} style={styles.barRow}>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryLabel, { color: theme.colors.text }]}>{item.category}</Text>
                {timeRange === 'week' && (
                  <Text style={[styles.engagementText, { color: theme.colors.textSecondary }]}>
                    {getEngagementText(item.count, item.category)}
                  </Text>
                )}
              </View>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      width: barWidth, 
                      backgroundColor: item.color 
                    }
                  ]} 
                />
                <Text style={[styles.countLabel, { color: theme.colors.text }]}>{item.count}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.impactSection}>
        <Text style={[styles.impactTitle, { color: theme.colors.text }]}>Activity Impact</Text>
        
        <View style={styles.impactLists}>
          <View style={styles.impactColumn}>
            <Text style={[styles.impactColumnTitle, { color: theme.colors.text }]}>Positive Impact</Text>
            {positiveActivities.map((activity) => (
              <TouchableOpacity 
                key={activity.category} 
                style={styles.impactItem}
                onPress={() => handleActivityPress(activity)}
                activeOpacity={0.7}
              >
                <CheckCircle size={16} color={theme.colors.primary} />
                <View style={styles.impactTextContainer}>
                  <Text style={[styles.impactActivity, { color: theme.colors.text }]}>{activity.category}</Text>
                  <Text style={[styles.impactValue, { color: theme.colors.primary }]}>Mood +{activity.impact.toFixed(1)}</Text>
                </View>
                <TrendingUp size={12} color={theme.colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.impactColumn}>
            <Text style={[styles.impactColumnTitle, { color: theme.colors.text }]}>Needs Attention</Text>
            {negativeActivities.map((activity) => (
              <TouchableOpacity 
                key={activity.category} 
                style={styles.impactItem}
                onPress={() => handleActivityPress(activity)}
                activeOpacity={0.7}
              >
                <XCircle size={16} color={theme.colors.error} />
                <View style={styles.impactTextContainer}>
                  <Text style={[styles.impactActivity, { color: theme.colors.text }]}>{activity.category}</Text>
                  <Text style={[styles.impactValue, styles.negativeImpact, { color: theme.colors.error }]}>
                    Mood {activity.impact.toFixed(1)}
                  </Text>
                </View>
                <TrendingDown size={12} color={theme.colors.error} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Activity Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={[styles.modalColorDot, { backgroundColor: selectedActivity?.color }]} />
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{selectedActivity?.category} Activity</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedActivity && (() => {
                const insight = getDetailedInsight(selectedActivity);
                return (
                  <>
                    <View style={styles.statsRow}>
                      <View style={styles.statItem}>
                        <BarChart3 size={20} color={selectedActivity.color} />
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Frequency</Text>
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>{selectedActivity.count}</Text>
                      </View>
                      <View style={styles.statItem}>
                        {insight.trend === 'up' ? (
                          <TrendingUp size={20} color={theme.colors.primary} />
                        ) : (
                          <TrendingDown size={20} color={theme.colors.error} />
                        )}
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Mood Impact</Text>
                        <Text style={[styles.statValue, { color: insight.trend === 'up' ? theme.colors.primary : theme.colors.error }]}>
                          {selectedActivity.impact > 0 ? '+' : ''}{selectedActivity.impact.toFixed(1)}
                        </Text>
                      </View>
                      <View style={styles.statItem}>
                        <Calendar size={20} color={theme.colors.textSecondary} />
                        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Period</Text>
                        <Text style={[styles.statValue, { color: theme.colors.text }]}>{timeRange}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.insightSection}>
                      <Text style={[styles.insightTitle, { color: theme.colors.text }]}>{insight.title}</Text>
                      <Text style={[styles.insightDescription, { color: theme.colors.textSecondary }]}>{insight.description}</Text>
                    </View>
                    
                    <View style={styles.recommendationsSection}>
                      <Text style={[styles.recommendationsTitle, { color: theme.colors.text }]}>Recommendations</Text>
                      {insight.recommendations.map((rec, index) => (
                        <View key={index} style={styles.recommendationItem}>
                          <View style={[styles.recommendationBullet, { backgroundColor: theme.colors.primary }]} />
                          <Text style={[styles.recommendationText, { color: theme.colors.textSecondary }]}>{rec}</Text>
                        </View>
                      ))}
                    </View>
                  </>
                );
              })()}
            </ScrollView>
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  chartContainer: {
    marginBottom: 24,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    width: 120,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  engagementText: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bar: {
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  countLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 30,
  },
  impactSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  impactLists: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  impactColumnTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  impactTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  impactActivity: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  impactValue: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  negativeImpact: {
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  insightSection: {
    marginBottom: 24,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  recommendationsSection: {
    marginBottom: 20,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B82F6',
    marginTop: 6,
    marginRight: 12,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
  },
});