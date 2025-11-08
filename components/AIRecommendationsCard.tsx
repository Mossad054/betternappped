import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/contexts/ThemeContext';
import { AnalyticsService, AIRecommendation } from '@/services/analytics.service';
import { Sparkles, ChevronRight, Calendar, TrendingUp, Moon, Brain, Zap, Activity } from 'lucide-react-native';

interface AIRecommendationsCardProps {
  userId: string;
}

type TimePeriod = 'today' | 'week' | 'month';

export default function AIRecommendationsCard({ userId }: AIRecommendationsCardProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('today');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [userId, timePeriod]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      console.log(`🤖 Loading AI recommendations for period: ${timePeriod}`);
      const result = await AnalyticsService.generateAIRecommendations(userId, timePeriod);
      
      if (result.data) {
        setRecommendations(result.data);
        console.log(`✅ Loaded ${result.data.length} recommendations`);
      } else {
        console.error('❌ Failed to load recommendations:', result.error);
        setRecommendations([]);
      }
    } catch (error) {
      console.error('❌ Error loading recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'mood':
        return <TrendingUp size={16} color={theme.colors.success} />;
      case 'sleep':
        return <Moon size={16} color={theme.colors.info} />;
      case 'activity':
        return <Activity size={16} color={theme.colors.warning} />;
      case 'habit':
        return <Calendar size={16} color={theme.colors.primary} />;
      case 'clarity':
        return <Brain size={16} color={theme.colors.accent} />;
      case 'productivity':
        return <Zap size={16} color={theme.colors.warning} />;
      default:
        return <Sparkles size={16} color={theme.colors.primary} />;
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getPeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
    }
  };

  const displayedRecommendations = showAll ? recommendations : recommendations.slice(0, 3);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.accent }]}>
      {/* Header with Period Selector */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Sparkles size={18} color={theme.colors.warning} />
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>AI Recommendations</Text>
        </View>
        
        {/* Period Selector */}
        <View style={[styles.periodSelector, { borderColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[
              styles.periodButton,
              timePeriod === 'today' && { backgroundColor: theme.colors.primary + '20' }
            ]}
            onPress={() => setTimePeriod('today')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.periodButtonText,
              { color: timePeriod === 'today' ? theme.colors.primary : theme.colors.textSecondary }
            ]}>
              Today
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.periodButton,
              timePeriod === 'week' && { backgroundColor: theme.colors.primary + '20' }
            ]}
            onPress={() => setTimePeriod('week')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.periodButtonText,
              { color: timePeriod === 'week' ? theme.colors.primary : theme.colors.textSecondary }
            ]}>
              Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.periodButton,
              timePeriod === 'month' && { backgroundColor: theme.colors.primary + '20' }
            ]}
            onPress={() => setTimePeriod('month')}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.periodButtonText,
              { color: timePeriod === 'month' ? theme.colors.primary : theme.colors.textSecondary }
            ]}>
              Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.primary} size="small" />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Analyzing your data...
          </Text>
        </View>
      ) : recommendations.length === 0 ? (
        /* Empty State */
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
            Start Logging to Get Insights
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            Log your mood, sleep, activities, and habits to receive personalized AI-powered recommendations.
          </Text>
        </View>
      ) : (
        /* Recommendations List */
        <>
          <View style={styles.recommendationsList}>
            {displayedRecommendations.map((rec, index) => (
              <View 
                key={rec.id || index} 
                style={styles.recommendationItem}
              >
                <View style={styles.recommendationHeader}>
                  <View style={[
                    styles.iconContainer,
                    { 
                      backgroundColor: theme.colors.secondary + '80',
                      borderColor: theme.colors.border + '20',
                      borderWidth: 1,
                    }
                  ]}>
                    {getIcon(rec.type)}
                  </View>
                  <View style={styles.recommendationContent}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.recommendationTitle, { color: theme.colors.text }]}>
                        {rec.title}
                      </Text>
                      {rec.priority && (
                        <View style={[
                          styles.priorityBadge, 
                          { 
                            backgroundColor: getPriorityColor(rec.priority) + '15',
                            borderColor: getPriorityColor(rec.priority) + '30',
                            borderWidth: 1,
                          }
                        ]}>
                          <Text style={[styles.priorityText, { color: getPriorityColor(rec.priority) }]}>
                            {rec.priority}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.recommendationText, { color: theme.colors.textSecondary }]}>
                      {rec.description}
                    </Text>
                    {rec.action && (
                      <View style={[
                        styles.actionChip, 
                        { 
                          backgroundColor: theme.colors.primary + '10',
                          borderColor: theme.colors.primary + '25',
                          borderWidth: 1,
                        }
                      ]}>
                        <Text style={[styles.actionText, { color: theme.colors.primary }]}>
                          💡 {rec.action}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Show More/Less Button */}
          {recommendations.length > 3 && (
            <TouchableOpacity
              style={[styles.toggleButton, { borderColor: theme.colors.border }]}
              onPress={() => setShowAll(!showAll)}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleButtonText, { color: theme.colors.primary }]}>
                {showAll 
                  ? '▲ Show Less' 
                  : `▼ Show ${recommendations.length - 3} More Recommendations`}
              </Text>
              <ChevronRight size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  periodSelector: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
    gap: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 6,
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  recommendationHeader: {
    flexDirection: 'row',
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    flex: 1,
  },
  recommendationText: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  toggleButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  toggleButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
