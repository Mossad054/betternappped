import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { X, Clock, Moon, Brain, CheckCircle, XCircle, TrendingUp, TrendingDown, FlaskConical, AlertCircle, Plus, Circle, Target } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import PastDateHabitModal from './PastDateHabitModal';
import { HabitsService } from '@/services/habits.service';
import { ExperimentsService } from '@/services/experiments.service';

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
    id?: string;
    habit_id?: string;
    name: string;
    habit_name?: string;
    emoji: string;
    habit_emoji?: string;
    completed: boolean;
    streak?: number;
    habit_streak?: number;
    total_days?: number;
    habit_total_days?: number;
    cycle_day?: number;
    category?: string;
    habit_category?: string;
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

interface ActiveHabit {
  habit_id: string;
  habit_name: string;
  habit_emoji: string;
  habit_description: string;
  habit_category: string;
  habit_streak: number;
  habit_total_days: number;
  completed: boolean;
  feedback: string | null;
  cycle_day: number;
}

interface ActiveExperiment {
  experiment_id: string;
  experiment_name: string;
  experiment_emoji: string;
  experiment_description: string;
  experiment_category: string;
  experiment_status: string;
  current_day: number;
  total_days: number;
  logged: boolean;
  log_data: any;
  created_at: string;
}

export default function DayDetailModal({ visible, onClose, data }: DayDetailModalProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [habitModalVisible, setHabitModalVisible] = useState(false);
  const [activeHabits, setActiveHabits] = useState<ActiveHabit[]>([]);
  const [habitsLoading, setHabitsLoading] = useState(false);
  const [savingHabitId, setSavingHabitId] = useState<string | null>(null);
  const [activeExperiments, setActiveExperiments] = useState<ActiveExperiment[]>([]);
  const [experimentsLoading, setExperimentsLoading] = useState(false);

  // Fetch active habits and experiments when modal opens
  useEffect(() => {
    if (visible && data?.date && user) {
      fetchActiveHabits();
      fetchActiveExperiments();
    }
  }, [visible, data?.date, user]);

  const fetchActiveHabits = async () => {
    if (!user || !data?.date) return;

    setHabitsLoading(true);
    try {
      const { data: habitsData, error } = await HabitsService.getHabitsForDate(user.id, data.date);

      if (error) {
        console.error('Error fetching habits for date:', error);
        setActiveHabits([]);
      } else {
        setActiveHabits(habitsData || []);
      }
    } catch (error) {
      console.error('Error in fetchActiveHabits:', error);
      setActiveHabits([]);
    } finally {
      setHabitsLoading(false);
    }
  };

  const fetchActiveExperiments = async () => {
    if (!user || !data?.date) return;

    setExperimentsLoading(true);
    try {
      const { data: experimentsData, error } = await ExperimentsService.getExperimentsForDate(user.id, data.date);

      if (error) {
        console.error('Error fetching experiments for date:', error);
        setActiveExperiments([]);
      } else {
        setActiveExperiments(experimentsData || []);
      }
    } catch (error) {
      console.error('Error in fetchActiveExperiments:', error);
      setActiveExperiments([]);
    } finally {
      setExperimentsLoading(false);
    }
  };

  const handleLogExperiment = (experimentId: string, experimentName: string) => {
    if (!data?.date) return;

    const today = new Date().toISOString().split('T')[0];

    // Prevent logging for future dates
    if (data.date > today) {
      Alert.alert(
        'Future Date',
        'You cannot log experiments for future dates.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Close this modal and navigate to experiments hub with experiment ID and date
    onClose();
    router.push(`/experiments-hub?experimentId=${experimentId}&logDate=${data.date}`);
  };

  const handleMarkComplete = async (habitId: string, currentCompleted: boolean) => {
    if (!user || !data?.date) return;

    const today = new Date().toISOString().split('T')[0];
    const isFutureDate = data.date > today;

    // Prevent completion for future dates
    if (isFutureDate) {
      Alert.alert(
        'Future Date',
        'You cannot mark habits complete for future dates.',
        [{ text: 'OK' }]
      );
      return;
    }

    const newCompletedState = !currentCompleted;

    // Optimistic update
    setActiveHabits(prev =>
      prev.map(habit =>
        habit.habit_id === habitId
          ? { ...habit, completed: newCompletedState }
          : habit
      )
    );

    setSavingHabitId(habitId);

    try {
      const { error } = await HabitsService.logHabitForDate(
        habitId,
        user.id,
        data.date,
        newCompletedState
      );

      if (error) {
        // Revert on error
        setActiveHabits(prev =>
          prev.map(habit =>
            habit.habit_id === habitId
              ? { ...habit, completed: currentCompleted }
              : habit
          )
        );
        Alert.alert('Error', 'Failed to update habit. Please try again.');
      } else {
        // Refresh to get updated streak/cycle data
        await fetchActiveHabits();
      }
    } catch (error) {
      // Revert on error
      setActiveHabits(prev =>
        prev.map(habit =>
          habit.habit_id === habitId
            ? { ...habit, completed: currentCompleted }
            : habit
        )
      );
      Alert.alert('Error', 'Failed to update habit. Please try again.');
    } finally {
      setSavingHabitId(null);
    }
  };

  const isFutureDate = data ? data.date > new Date().toISOString().split('T')[0] : false;
  const isToday = data ? data.date === new Date().toISOString().split('T')[0] : false;

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
    const hasHighClarity = mentalClarityScore >= 70; // Out of 100
    const hasLowClarity = mentalClarityScore > 0 && mentalClarityScore <= 40; // Out of 100
    
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
        analysis += `Your mental clarity was strong (${mentalClarityScore}/100), indicating high focus and productivity. `;
        if (data.mentalClarity?.factors && data.mentalClarity.factors.length > 0) {
          analysis += `Factors included: ${data.mentalClarity.factors.join(', ')}. `;
        }
      } else if (hasLowClarity) {
        analysis += `Mental clarity was lower (${mentalClarityScore}/100), which may have affected your productivity. `;
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
            {data.mentalClarity && data.mentalClarity.score > 0 && (
              <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Mental Clarity</Text>
              <View style={[styles.clarityCard, { backgroundColor: theme.colors.background }]}>
                <View style={styles.clarityHeader}>
                  <Brain size={20} color={theme.colors.primary} />
                  <Text style={[styles.clarityScore, { color: theme.colors.text }]}>{data.mentalClarity.score}/100</Text>
                </View>
                {data.mentalClarity.factors && data.mentalClarity.factors.length > 0 && (
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
                {!isFutureDate && (
                  <TouchableOpacity
                    style={[styles.addHabitButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => setHabitModalVisible(true)}
                  >
                    <Plus size={16} color="#FFFFFF" />
                    <Text style={styles.addHabitButtonText}>Bulk Edit</Text>
                  </TouchableOpacity>
                )}
              </View>

              {habitsLoading ? (
                <View style={styles.habitsLoadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={[styles.habitsLoadingText, { color: theme.colors.textSecondary }]}>
                    Loading habits...
                  </Text>
                </View>
              ) : activeHabits.length > 0 ? (
                <View style={styles.habitsListContainer}>
                  {activeHabits.map((habit) => {
                    const isSaving = savingHabitId === habit.habit_id;

                    return (
                      <View
                        key={habit.habit_id}
                        style={[
                          styles.habitCardInline,
                          {
                            backgroundColor: theme.colors.background,
                            borderColor: habit.completed ? theme.colors.primary : theme.colors.border
                          },
                          habit.completed && styles.habitCardCompleted
                        ]}
                      >
                        <View style={styles.habitCardTop}>
                          <View style={styles.habitCardLeft}>
                            <Text style={styles.habitEmojiLarge}>{habit.habit_emoji}</Text>
                            <View style={styles.habitCardInfo}>
                              <Text style={[styles.habitCardName, { color: theme.colors.text }]}>
                                {habit.habit_name}
                              </Text>
                              <Text style={[styles.habitCardCategory, { color: theme.colors.textSecondary }]}>
                                {habit.habit_category}
                              </Text>
                            </View>
                          </View>

                          {/* Mark Complete Button */}
                          <TouchableOpacity
                            style={[
                              styles.markCompleteButton,
                              {
                                backgroundColor: habit.completed
                                  ? theme.colors.primary
                                  : isFutureDate
                                    ? theme.colors.surfaceVariant
                                    : theme.colors.background,
                                borderColor: habit.completed
                                  ? theme.colors.primary
                                  : theme.colors.border
                              }
                            ]}
                            onPress={() => handleMarkComplete(habit.habit_id, habit.completed)}
                            disabled={isSaving || isFutureDate}
                          >
                            {isSaving ? (
                              <ActivityIndicator size="small" color={habit.completed ? '#FFFFFF' : theme.colors.primary} />
                            ) : habit.completed ? (
                              <>
                                <CheckCircle size={16} color="#FFFFFF" />
                                <Text style={styles.markCompleteTextDone}>Done</Text>
                              </>
                            ) : (
                              <>
                                <Circle size={16} color={isFutureDate ? theme.colors.textSecondary : theme.colors.primary} />
                                <Text style={[
                                  styles.markCompleteText,
                                  { color: isFutureDate ? theme.colors.textSecondary : theme.colors.primary }
                                ]}>
                                  {isFutureDate ? 'Future' : 'Mark'}
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>

                        {/* Habit Stats */}
                        <View style={styles.habitCardStats}>
                          <View style={styles.habitStatItem}>
                            <TrendingUp size={12} color={theme.colors.primary} />
                            <Text style={[styles.habitStatText, { color: theme.colors.textSecondary }]}>
                              {habit.habit_streak} day streak
                            </Text>
                          </View>
                          <View style={styles.habitStatItem}>
                            <Target size={12} color={theme.colors.primary} />
                            <Text style={[styles.habitStatText, { color: theme.colors.textSecondary }]}>
                              Day {habit.cycle_day}/{habit.habit_total_days}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={[styles.emptyHabitsState, { backgroundColor: theme.colors.background }]}>
                  <Text style={styles.emptyHabitsEmoji}>🎯</Text>
                  <Text style={[styles.emptyHabitsTitle, { color: theme.colors.text }]}>
                    No Active Habits
                  </Text>
                  <Text style={[styles.emptyHabitsText, { color: theme.colors.textSecondary }]}>
                    {isFutureDate
                      ? 'Habits cannot be tracked for future dates'
                      : 'Create habits in the Habit Library to start tracking!'}
                  </Text>
                </View>
              )}
            </View>

            {/* Experiments Logging */}
            <View style={styles.section}>
              <View style={styles.experimentsHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Experiments for This Day</Text>
                {!isFutureDate && activeExperiments.length > 0 && (
                  <TouchableOpacity
                    style={[styles.viewAllButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => {
                      onClose();
                      router.push('/experiments-hub');
                    }}
                  >
                    <FlaskConical size={14} color="#FFFFFF" />
                    <Text style={styles.viewAllButtonText}>View All</Text>
                  </TouchableOpacity>
                )}
              </View>

              {experimentsLoading ? (
                <View style={styles.habitsLoadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text style={[styles.habitsLoadingText, { color: theme.colors.textSecondary }]}>
                    Loading experiments...
                  </Text>
                </View>
              ) : activeExperiments.length > 0 ? (
                <View style={styles.habitsListContainer}>
                  {activeExperiments.map((experiment) => (
                    <View
                      key={experiment.experiment_id}
                      style={[
                        styles.experimentCardInline,
                        {
                          backgroundColor: theme.colors.background,
                          borderColor: experiment.logged ? theme.colors.success : theme.colors.border
                        },
                        experiment.logged && styles.experimentCardLogged
                      ]}
                    >
                      <View style={styles.experimentCardTop}>
                        <View style={styles.experimentCardLeft}>
                          <Text style={styles.experimentEmojiLarge}>{experiment.experiment_emoji}</Text>
                          <View style={styles.experimentCardInfo}>
                            <Text style={[styles.experimentCardName, { color: theme.colors.text }]}>
                              {experiment.experiment_name}
                            </Text>
                            <Text style={[styles.experimentCardCategory, { color: theme.colors.textSecondary }]}>
                              Day {experiment.current_day}/{experiment.total_days}
                            </Text>
                          </View>
                        </View>

                        {/* Log Experiment Button */}
                        <TouchableOpacity
                          style={[
                            styles.logExperimentBtn,
                            {
                              backgroundColor: experiment.logged
                                ? theme.colors.success
                                : isFutureDate
                                  ? theme.colors.surfaceVariant
                                  : theme.colors.primary,
                              borderColor: experiment.logged
                                ? theme.colors.success
                                : theme.colors.primary
                            }
                          ]}
                          onPress={() => handleLogExperiment(experiment.experiment_id, experiment.experiment_name)}
                          disabled={isFutureDate}
                        >
                          {experiment.logged ? (
                            <>
                              <CheckCircle size={16} color="#FFFFFF" />
                              <Text style={styles.logExperimentBtnTextDone}>Logged</Text>
                            </>
                          ) : (
                            <>
                              <FlaskConical size={16} color={isFutureDate ? theme.colors.textSecondary : '#FFFFFF'} />
                              <Text style={[
                                styles.logExperimentBtnText,
                                { color: isFutureDate ? theme.colors.textSecondary : '#FFFFFF' }
                              ]}>
                                {isFutureDate ? 'Future' : 'Log'}
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>

                      {/* Experiment Status */}
                      <View style={styles.experimentCardStats}>
                        <View style={styles.experimentStatItem}>
                          {experiment.experiment_status === 'active' ? (
                            <AlertCircle size={12} color={theme.colors.warning} />
                          ) : (
                            <CheckCircle size={12} color={theme.colors.success} />
                          )}
                          <Text style={[styles.experimentStatText, { color: theme.colors.textSecondary }]}>
                            {experiment.experiment_status === 'active' ? 'In Progress' : 'Completed'}
                          </Text>
                        </View>
                        {experiment.logged && experiment.log_data && (
                          <View style={styles.experimentStatItem}>
                            <CheckCircle size={12} color={theme.colors.success} />
                            <Text style={[styles.experimentStatText, { color: theme.colors.success }]}>
                              Logged for this day
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={[styles.emptyHabitsState, { backgroundColor: theme.colors.background }]}>
                  <Text style={styles.emptyHabitsEmoji}>🧪</Text>
                  <Text style={[styles.emptyHabitsTitle, { color: theme.colors.text }]}>
                    No Active Experiments
                  </Text>
                  <Text style={[styles.emptyHabitsText, { color: theme.colors.textSecondary }]}>
                    {isFutureDate
                      ? 'Experiments cannot be logged for future dates'
                      : 'Create experiments in the Experiments Hub to start tracking!'}
                  </Text>
                </View>
              )}
            </View>

            {/* Legacy Experiments Section - kept for backwards compatibility */}
            {data.experiments && data.experiments.length > 0 && activeExperiments.length === 0 && (
              <View style={styles.section}>
                <View style={styles.experimentsHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ongoing Experiments</Text>
                </View>

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
                        router.push(`/experiments-hub?experimentId=${experiment.id}&logDate=${data.date}`);
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
  habitsLoadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  habitsLoadingText: {
    marginTop: 8,
    fontSize: 13,
    color: '#6B7280',
  },
  habitsListContainer: {
    gap: 12,
  },
  habitCardInline: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  habitCardCompleted: {
    backgroundColor: '#EFF6FF',
  },
  habitCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  habitCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  habitEmojiLarge: {
    fontSize: 24,
    marginRight: 12,
  },
  habitCardInfo: {
    flex: 1,
  },
  habitCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  habitCardCategory: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  markCompleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
    minWidth: 70,
    justifyContent: 'center',
  },
  markCompleteText: {
    fontSize: 13,
    fontWeight: '600',
  },
  markCompleteTextDone: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  habitCardStats: {
    flexDirection: 'row',
    gap: 16,
    paddingLeft: 36,
  },
  habitStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  habitStatText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyHabitsState: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyHabitsEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyHabitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyHabitsText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
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
  // New experiment card styles
  experimentCardInline: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  experimentCardLogged: {
    backgroundColor: '#F0FDF4',
  },
  experimentCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  experimentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  experimentEmojiLarge: {
    fontSize: 24,
    marginRight: 12,
  },
  experimentCardInfo: {
    flex: 1,
  },
  experimentCardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  experimentCardCategory: {
    fontSize: 12,
    color: '#6B7280',
  },
  logExperimentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 6,
    minWidth: 70,
    justifyContent: 'center',
  },
  logExperimentBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  logExperimentBtnTextDone: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  experimentCardStats: {
    flexDirection: 'row',
    gap: 16,
    paddingLeft: 36,
  },
  experimentStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  experimentStatText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
});