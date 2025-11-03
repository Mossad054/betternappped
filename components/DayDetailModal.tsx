import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { X, Clock, Moon, Brain, CheckCircle, XCircle, TrendingUp, TrendingDown, FlaskConical, AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface DailyDetailData {
  date: string;
  mood?: {
    score: number;
    emoji: string;
    note?: string;
  };
  activities?: Array<{
    name: string;
    emoji?: string;
    category: string;
    duration: number;
    impact: number;
  }>;
  sleep?: {
    hours: number;
    emoji?: string;
    quality: string;
    bedtime: string;
    wakeTime: string;
  };
  mentalClarity?: {
    score: number;
    factors: string[];
  };
  habits?: Array<{
    name: string;
    emoji?: string;
    completed: boolean;
  }>;
  experiments?: Array<{
    name: string;
    emoji?: string;
    status: 'completed' | 'skipped' | 'pending';
    outcomes?: Array<{
      type: string;
      value: number;
    }>;
  }>;
  notes?: string;
}

interface DayDetailModalProps {
  visible: boolean;
  onClose: () => void;
  data: DailyDetailData | null;
}

export default function DayDetailModal({ visible, onClose, data }: DayDetailModalProps) {
  const { theme } = useTheme();
  if (!data) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getImpactAnalysis = () => {
    const positiveActivities = data.activities?.filter(a => a.impact > 0) || [];
    const negativeActivities = data.activities?.filter(a => a.impact < 0) || [];
    
    let analysis = '';
    
    if (data.mood?.score >= 4) {
      analysis = `You had a great day! Your mood was boosted by `;
      if (positiveActivities.length > 0) {
        analysis += positiveActivities.map(a => a.name.toLowerCase()).join(', ');
      }
      if (data.sleep?.hours >= 7) {
        analysis += ` and getting ${data.sleep.hours} hours of quality sleep`;
      }
      analysis += '.';
    } else if (data.mood?.score <= 2) {
      analysis = `This was a challenging day. `;
      if (negativeActivities.length > 0) {
        analysis += `Activities like ${negativeActivities.map(a => a.name.toLowerCase()).join(', ')} may have contributed to lower mood. `;
      }
      if (data.sleep?.hours < 6) {
        analysis += `Limited sleep (${data.sleep.hours} hours) likely affected your energy levels. `;
      }
      analysis += 'Consider focusing on mood-boosting activities tomorrow.';
    } else {
      analysis = `You had a balanced day with a mix of activities. `;
      if (positiveActivities.length > 0) {
        analysis += `${positiveActivities[0].name} helped maintain your mood, `;
      }
      analysis += `and ${data.sleep?.hours || 0} hours of sleep provided decent rest.`;
    }
    
    return analysis;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{formatDate(data.date)}</Text>
              <View style={styles.moodContainer}>
                <Text style={styles.moodEmoji}>{data.mood?.emoji || '😐'}</Text>
                <Text style={[styles.moodText, { color: theme.colors.textSecondary }]}>
                  Mood: {data.mood?.score || 0}/5
                  {data.mood?.note && ` • ${data.mood.note}`}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Impact Analysis */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Daily Impact Analysis</Text>
              <View style={[styles.analysisCard, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.analysisText, { color: theme.colors.textSecondary }]}>{getImpactAnalysis()}</Text>
              </View>
            </View>

            {/* Activities */}
            {data.activities && data.activities.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Activities & Impact</Text>
                {data.activities.map((activity, index) => (
                <View key={index} style={styles.activityItem}>
                  <View style={styles.activityHeader}>
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityEmoji}>{activity.emoji || '📍'}</Text>
                      <View>
                        <Text style={[styles.activityName, { color: theme.colors.text }]}>{activity.name}</Text>
                        <Text style={[styles.activityCategory, { color: theme.colors.textSecondary }]}>{activity.category}</Text>
                      </View>
                    </View>
                    <View style={styles.activityStats}>
                      <View style={styles.statItem}>
                        <Clock size={14} color={theme.colors.textSecondary} />
                        <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>{activity.duration}m</Text>
                      </View>
                      <View style={[styles.statItem, { marginLeft: 8 }]}>
                        {activity.impact > 0 ? (
                          <TrendingUp size={14} color={theme.colors.primary} />
                        ) : (
                          <TrendingDown size={14} color={theme.colors.error} />
                        )}
                        <Text style={[
                          styles.statText,
                          { color: activity.impact > 0 ? theme.colors.primary : theme.colors.error }
                        ]}>
                          {activity.impact > 0 ? '+' : ''}{activity.impact.toFixed(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.impactBar}>
                    <View 
                      style={[
                        styles.impactFill,
                        {
                          width: `${Math.min(100, Math.abs(activity.impact) * 30)}%`,
                          backgroundColor: activity.impact > 0 ? '#10B981' : '#EF4444',
                        }
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
            )}

            {/* Sleep */}
            {data.sleep && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sleep Analysis</Text>
              <View style={[styles.sleepCard, { backgroundColor: theme.colors.background }]}>
                <View style={styles.sleepHeader}>
                  <Text style={styles.sleepEmoji}>{data.sleep.emoji || '😴'}</Text>
                  <View>
                    <Text style={[styles.sleepHours, { color: theme.colors.text }]}>{data.sleep.hours} hours</Text>
                    <Text style={[styles.sleepQuality, { color: theme.colors.textSecondary }]}>{data.sleep.quality} quality</Text>
                  </View>
                </View>
                <View style={styles.sleepTimes}>
                  <View style={styles.sleepTime}>
                    <Moon size={16} color={theme.colors.textSecondary} />
                    <Text style={[styles.sleepTimeText, { color: theme.colors.textSecondary }]}>Bedtime: {data.sleep.bedtime}</Text>
                  </View>
                  <View style={styles.sleepTime}>
                    <Text style={[styles.sleepTimeText, { color: theme.colors.textSecondary }]}>Wake: {data.sleep.wakeTime}</Text>
                  </View>
                </View>
                <Text style={[styles.sleepImpact, { color: theme.colors.textSecondary }]}>
                  Sleep contributed {data.sleep.hours >= 7 ? 'positively' : 'negatively'} to your mood and mental clarity.
                </Text>
              </View>
            </View>
            )}

            {/* Mental Clarity */}
            {data.mentalClarity && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Mental Clarity</Text>
              <View style={[styles.clarityCard, { backgroundColor: theme.colors.background }]}>
                <View style={styles.clarityHeader}>
                  <Brain size={20} color={theme.colors.primary} />
                  <Text style={[styles.clarityScore, { color: theme.colors.text }]}>{data.mentalClarity.score}/5</Text>
                </View>
                {data.mentalClarity.factors.length > 0 && (
                  <View style={styles.clarityFactors}>
                    <Text style={[styles.clarityFactorsTitle, { color: theme.colors.textSecondary }]}>Contributing factors:</Text>
                    {data.mentalClarity.factors.map((factor, index) => (
                      <Text key={index} style={[styles.clarityFactor, { color: theme.colors.textSecondary }]}>• {factor}</Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
            )}

            {/* Habits */}
            {data.habits && data.habits.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Habits Tracking</Text>
              <View style={styles.habitsGrid}>
                {data.habits.map((habit, index) => (
                  <View key={index} style={styles.habitItem}>
                    {habit.completed ? (
                      <CheckCircle size={16} color={theme.colors.primary} />
                    ) : (
                      <XCircle size={16} color={theme.colors.error} />
                    )}
                    <Text style={styles.habitEmoji}>{habit.emoji || '📌'}</Text>
                    <Text style={[
                      styles.habitName,
                      { color: habit.completed ? theme.colors.primary : theme.colors.textSecondary }
                    ]}>
                      {habit.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            )}

            {/* Experiments */}
            {data.experiments && data.experiments.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Experiments on this Day</Text>
                {data.experiments.map((experiment, index) => (
                  <View
                    key={index}
                    style={[
                      styles.experimentItem,
                      experiment.status === 'completed' ? styles.experimentCompleted : 
                      experiment.status === 'skipped' ? styles.experimentSkipped : 
                      styles.experimentPending
                    ]}
                  >
                    <View style={styles.experimentHeader}>
                      <FlaskConical size={20} color={theme.colors.info} />
                      <View style={styles.experimentInfo}>
                        <Text style={styles.experimentEmoji}>{experiment.emoji || '🧪'}</Text>
                        <Text style={[styles.experimentName, { color: theme.colors.text }]}>{experiment.name}</Text>
                      </View>
                      {experiment.status === 'completed' && (
                        <CheckCircle size={16} color={theme.colors.primary} />
                      )}
                      {experiment.status === 'skipped' && (
                        <XCircle size={16} color={theme.colors.error} />
                      )}
                      {experiment.status === 'pending' && (
                        <AlertCircle size={16} color={theme.colors.warning} />
                      )}
                    </View>
                    {experiment.outcomes && experiment.outcomes.length > 0 && (
                      <View style={styles.experimentOutcomes}>
                        <Text style={[styles.outcomesTitle, { color: theme.colors.textSecondary }]}>Tracked Outcomes:</Text>
                        {experiment.outcomes.map((outcome, idx) => (
                          <View key={idx} style={styles.outcomeRow}>
                            <Text style={[styles.outcomeType, { color: theme.colors.textSecondary }]}>{outcome.type}:</Text>
                            <View style={styles.outcomeValue}>
                              {[1, 2, 3, 4, 5].map(level => (
                                <View
                                  key={level}
                                  style={[
                                    styles.outcomeDot,
                                    level <= outcome.value && styles.outcomeDotFilled
                                  ]}
                                />
                              ))}
                              <Text style={[styles.outcomeText, { color: theme.colors.text }]}>{outcome.value}/5</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                    {experiment.status === 'pending' && (
                      <TouchableOpacity style={[styles.logButton, { backgroundColor: theme.colors.primary }]}>
                        <Text style={[styles.logButtonText, { color: theme.colors.text }]}>✔️ Log Now</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Notes */}
            {data.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <View style={styles.notesCard}>
                  <Text style={styles.notesText}>{data.notes}</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  moodText: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  analysisCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  analysisText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  activityItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activityEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  activityCategory: {
    fontSize: 12,
    color: '#6B7280',
  },
  activityStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  impactBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  impactFill: {
    height: '100%',
    borderRadius: 2,
  },
  sleepCard: {
    backgroundColor: '#F0F4FF',
    borderRadius: 12,
    padding: 16,
  },
  sleepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sleepEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  sleepHours: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sleepQuality: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  sleepTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sleepTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sleepTimeText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  sleepImpact: {
    fontSize: 12,
    color: '#374151',
    fontStyle: 'italic',
  },
  clarityCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
  },
  clarityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  clarityScore: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 8,
  },
  clarityFactors: {
    marginTop: 8,
  },
  clarityFactorsTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  clarityFactor: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  habitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
    minWidth: '45%',
  },
  habitEmoji: {
    fontSize: 16,
    marginLeft: 8,
    marginRight: 6,
  },
  habitName: {
    fontSize: 12,
    fontWeight: '500',
  },
  notesCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  notesText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  experimentItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  experimentCompleted: {
    borderLeftColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  experimentSkipped: {
    borderLeftColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  experimentPending: {
    borderLeftColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  experimentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  experimentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  experimentEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  experimentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  experimentOutcomes: {
    marginBottom: 12,
  },
  outcomesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  outcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  outcomeType: {
    fontSize: 12,
    color: '#4B5563',
    flex: 1,
  },
  outcomeValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  outcomeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  outcomeDotFilled: {
    backgroundColor: '#06B6D4',
  },
  outcomeText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
  },
  logButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  logButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
});