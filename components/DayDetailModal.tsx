import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { X, Clock, Moon, Brain, CheckCircle, XCircle, TrendingUp, TrendingDown, FlaskConical, AlertCircle, Plus } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import PastDateHabitModal from './PastDateHabitModal';

export interface DailyDetailData {
  date: string;
  mood?: {
    score: number;
    emoji?: string;
    note?: string;
  };
  activities?: Array<{
    name: string;
    emoji: string;
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
    emoji: string;
    completed: boolean;
  }>;
  experiments?: Array<{
    id: string;
    name: string;
    emoji: string;
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
  const router = useRouter();
  const [habitModalVisible, setHabitModalVisible] = useState(false);
  
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
    // Gather all data points
    const moodScore = data.mood?.score || 0;
    const moodNote = data.mood?.note || '';
    const sleepHours = data.sleep?.hours || 0;
    const sleepQuality = data.sleep?.quality || '';
    const mentalClarityScore = data.mentalClarity?.score || 0;
    const positiveActivities = data.activities?.filter(a => a.impact > 0) || [];
    const negativeActivities = data.activities?.filter(a => a.impact < 0) || [];
    const completedHabits = data.habits?.filter(h => h.completed) || [];
    const missedHabits = data.habits?.filter(h => !h.completed) || [];
    const ongoingExperiments = data.experiments?.filter(e => e.status === 'pending') || [];
    const completedExperiments = data.experiments?.filter(e => e.status === 'completed') || [];
    
    // Build comprehensive analysis
    let analysis = '';
    
    // Determine overall day quality
    const hasGoodMood = moodScore >= 4;
    const hasDecentMood = moodScore === 3;
    const hasPoorMood = moodScore <= 2;
    const hasGoodSleep = sleepHours >= 7 && (sleepQuality === 'good' || sleepQuality === 'very good' || sleepQuality === 'excellent');
    const hasPoorSleep = sleepHours > 0 && sleepHours < 6;
    const hasHighClarity = mentalClarityScore >= 7;
    const hasLowClarity = mentalClarityScore > 0 && mentalClarityScore <= 4;
    
    // OPENING STATEMENT - Set the tone based on overall wellbeing
    if (hasGoodMood && hasGoodSleep) {
      analysis = 'This was an excellent day for your wellbeing. ';
    } else if (hasGoodMood || (hasDecentMood && completedHabits.length > 0)) {
      analysis = 'You had a productive and balanced day. ';
    } else if (hasPoorMood || hasPoorSleep) {
      analysis = 'This was a challenging day. ';
    } else if (!moodScore && !sleepHours && positiveActivities.length === 0) {
      analysis = 'Limited data was logged for this day. ';
    } else {
      analysis = 'You had a moderate day with mixed experiences. ';
    }
    
    // MOOD ANALYSIS - Include morning vs evening if notes suggest timing
    if (moodScore > 0) {
      if (moodScore >= 4) {
        analysis += `Your mood was high (${moodScore}/5)${moodNote ? ` - you felt ${moodNote.toLowerCase()}` : ''}. `;
      } else if (moodScore === 3) {
        analysis += `Your mood was stable at ${moodScore}/5${moodNote ? `, noting ${moodNote.toLowerCase()}` : ''}. `;
      } else {
        analysis += `Your mood was lower than usual (${moodScore}/5)${moodNote ? ` - you experienced ${moodNote.toLowerCase()}` : ''}. `;
      }
    }
    
    // ACTIVITIES IMPACT - Correlate with mood
    if (positiveActivities.length > 0) {
      const topActivity = positiveActivities[0];
      if (positiveActivities.length === 1) {
        analysis += `${topActivity.name} had a positive impact (+${topActivity.impact.toFixed(1)}). `;
      } else {
        const activityList = positiveActivities.slice(0, 2).map(a => a.name).join(' and ');
        analysis += `Activities like ${activityList} boosted your wellbeing. `;
      }
    }
    
    if (negativeActivities.length > 0) {
      const stressors = negativeActivities.map(a => a.name).slice(0, 2);
      if (stressors.length === 1) {
        analysis += `${stressors[0]} may have contributed to stress (${negativeActivities[0].impact.toFixed(1)} impact). `;
      } else {
        analysis += `${stressors.join(' and ')} appeared to have negative effects on your day. `;
      }
    }
    
    // SLEEP ANALYSIS - Detailed correlation
    if (sleepHours > 0) {
      if (hasGoodSleep) {
        analysis += `Getting ${sleepHours} hours of ${sleepQuality} sleep likely supported your energy and focus. `;
      } else if (hasPoorSleep) {
        analysis += `Limited sleep (${sleepHours} hours) may have impacted your energy and mood negatively. `;
      } else {
        analysis += `You got ${sleepHours} hours of sleep (${sleepQuality} quality). `;
      }
    }
    
    // MENTAL CLARITY - Connect to productivity
    if (mentalClarityScore > 0) {
      if (hasHighClarity) {
        analysis += `Your mental clarity was strong (${mentalClarityScore}/10), indicating high focus and productivity. `;
        if (data.mentalClarity?.factors && data.mentalClarity.factors.length > 0) {
          analysis += `Factors included: ${data.mentalClarity.factors.join(', ')}. `;
        }
      } else if (hasLowClarity) {
        analysis += `Mental clarity was lower (${mentalClarityScore}/10), which may have affected your productivity. `;
      }
    }
    
    // HABITS TRACKING
    if (completedHabits.length > 0) {
      if (completedHabits.length === 1) {
        analysis += `You completed your ${completedHabits[0].name} habit. `;
      } else {
        analysis += `You stayed consistent with ${completedHabits.length} habits including ${completedHabits[0].name}. `;
      }
    }
    
    if (missedHabits.length > 0 && completedHabits.length === 0) {
      analysis += `Some habits were missed, which could be addressed tomorrow. `;
    }
    
    // EXPERIMENTS PROGRESS
    if (completedExperiments.length > 0) {
      const expNames = completedExperiments.map(e => e.name).join(' and ');
      analysis += `You logged ${expNames} experiment${completedExperiments.length > 1 ? 's' : ''}. `;
    }
    
    if (ongoingExperiments.length > 0) {
      analysis += `Don't forget to log your ongoing ${ongoingExperiments[0].name} experiment. `;
    }
    
    // RECOMMENDATIONS - Forward-looking based on data
    if (hasPoorMood && positiveActivities.length === 0) {
      analysis += 'Consider scheduling mood-boosting activities tomorrow. ';
    } else if (hasPoorSleep && hasLowClarity) {
      analysis += 'Prioritize better sleep tonight to improve tomorrow\'s mental clarity. ';
    } else if (hasGoodMood && hasGoodSleep && positiveActivities.length > 0) {
      analysis += 'Keep up these positive patterns! ';
    }
    
    // Handle no data scenario
    if (!moodScore && !sleepHours && positiveActivities.length === 0 && completedHabits.length === 0) {
      analysis = 'No wellbeing data was logged for this day. Start tracking your mood, activities, and sleep to see personalized insights here.';
    }
    
    return analysis.trim();
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
                {data.mood?.emoji && <Text style={styles.moodEmoji}>{data.mood.emoji}</Text>}
                <Text style={[styles.moodText, { color: theme.colors.textSecondary }]}>
                  Mood: {data.mood?.score || 'N/A'}/5
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
                      <Text style={styles.activityEmoji}>{activity.emoji}</Text>
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
                  {data.sleep.emoji && <Text style={styles.sleepEmoji}>{data.sleep.emoji}</Text>}
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
            <View style={styles.section}>
              <View style={styles.habitsHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Habits Tracking</Text>
                <TouchableOpacity
                  style={[styles.addHabitButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setHabitModalVisible(true)}
                >
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.addHabitButtonText}>Mark Complete</Text>
                </TouchableOpacity>
              </View>
              
              {data.habits && data.habits.length > 0 ? (
                <View style={styles.habitsGrid}>
                  {data.habits.map((habit, index) => (
                    <View key={index} style={styles.habitItem}>
                      {habit.completed ? (
                        <CheckCircle size={16} color={theme.colors.primary} />
                      ) : (
                        <XCircle size={16} color={theme.colors.error} />
                      )}
                      <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                      <Text style={[
                        styles.habitName,
                        { color: habit.completed ? theme.colors.primary : theme.colors.textSecondary }
                      ]}>
                        {habit.name}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={[styles.emptyHabitsState, { backgroundColor: theme.colors.background }]}>
                  <Text style={[styles.emptyHabitsText, { color: theme.colors.textSecondary }]}>
                    No habits tracked for this day yet
                  </Text>
                </View>
              )}
            </View>

            {/* Experiments */}
            {data.experiments && data.experiments.length > 0 && (
              <View style={styles.section}>
                <View style={styles.experimentsHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ongoing Experiments</Text>
                  {data.experiments.filter(exp => exp.status === 'pending').length > 0 && (
                    <TouchableOpacity 
                      style={[styles.viewAllButton, { backgroundColor: theme.colors.primary }]}
                      onPress={() => {
                        onClose();
                        router.push('/experiments-hub');
                      }}
                    >
                      <FlaskConical size={14} color="#FFFFFF" />
                      <Text style={styles.viewAllButtonText}>Log Experiments</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {/* Only show pending (ongoing) experiments */}
                {data.experiments.filter(exp => exp.status === 'pending').map((experiment, index) => (
                  <View
                    key={experiment.id || index}
                    style={[
                      styles.experimentItem,
                      { backgroundColor: theme.colors.background },
                      styles.experimentPending,
                    ]}
                  >
                    <View style={styles.experimentHeader}>
                      <View style={styles.experimentInfo}>
                        <Text style={styles.experimentEmoji}>{experiment.emoji}</Text>
                        <Text style={[styles.experimentName, { color: theme.colors.text }]}>{experiment.name}</Text>
                      </View>
                      <View style={styles.experimentStatus}>
                        <AlertCircle size={18} color={theme.colors.warning} />
                        <Text style={[styles.statusText, { color: theme.colors.warning }]}>Pending</Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity 
                      style={[styles.logExperimentButton, { 
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary 
                      }]}
                      onPress={() => {
                        onClose();
                        // Navigate to experiments-hub with specific experiment id
                        router.push(`/experiments-hub?experimentId=${experiment.id}`);
                      }}
                    >
                      <FlaskConical size={16} color="#FFFFFF" />
                      <Text style={styles.logExperimentButtonText}>Log This Experiment</Text>
                    </TouchableOpacity>
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

      {/* Past Date Habit Modal */}
      <PastDateHabitModal
        visible={habitModalVisible}
        onClose={() => setHabitModalVisible(false)}
        date={data.date}
        onSuccess={() => {
          // Refresh the day detail modal data
          // The parent component should handle this via onClose callback
          onClose();
        }}
      />
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
  experimentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  viewAllButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
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
  habitsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addHabitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  addHabitButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyHabitsState: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  emptyHabitsText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
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
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  experimentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  experimentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
  logExperimentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
    marginTop: 8,
    borderWidth: 1,
  },
  logExperimentButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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