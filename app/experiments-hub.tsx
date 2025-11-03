import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, FlaskConical, Plus, CheckCircle, Play, RotateCcw, X, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ExperimentsService } from '@/services/experiments.service';
import { type Experiment } from '@/constants/mockData';

export default function ExperimentsHub() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { user } = useAuth();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [outcomeScores, setOutcomeScores] = useState<{ [key: string]: number }>({});
  const [logNotes, setLogNotes] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [activityCompleted, setActivityCompleted] = useState<'yes' | 'no' | 'skipped' | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailExperiment, setSelectedDetailExperiment] = useState<Experiment | null>(null);

  // Load experiments on component mount
  useEffect(() => {
    if (user) {
      loadExperiments();
    }
  }, [user]);

  const loadExperiments = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await ExperimentsService.getAll(user.id);
      
      if (error) throw new Error('Failed to load experiments');
      
      // Transform database format to Experiment type
      const transformedData = (data || []).map(exp => ({
        id: exp.id,
        activityName: exp.activity_name,
        activityEmoji: exp.activity_emoji,
        outcomes: exp.outcomes,
        startDate: exp.start_date,
        endDate: exp.end_date,
        duration: exp.duration,
        loggingFrequency: 'Daily' as const,
        status: exp.status as 'active' | 'completed',
        currentDay: exp.current_day,
        totalDays: exp.duration,
        logs: [],
        baselineData: exp.baseline_data,
        resultsData: exp.results_data,
        insights: exp.insights,
      }));
      
      setExperiments(transformedData);
    } catch (err) {
      console.error('Error loading experiments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load experiments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExperiments();
    setRefreshing(false);
  };

  const openLogModal = (experiment: Experiment) => {
    setSelectedExperiment(experiment);
    // Initialize scores to 3 (middle of 1-5 scale) for all outcomes
    const initialScores: { [key: string]: number } = {};
    experiment.outcomes.forEach(outcome => {
      initialScores[outcome] = 3;
    });
    setOutcomeScores(initialScores);
    setLogNotes('');
    setActivityCompleted(null);
    setShowLogModal(true);
  };

  const closeLogModal = () => {
    setShowLogModal(false);
    setSelectedExperiment(null);
    setOutcomeScores({});
    setLogNotes('');
    setActivityCompleted(null);
  };

  const handleLogExperiment = async () => {
    if (!user || !selectedExperiment) return;

    setIsLogging(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Determine completion status
      const completed = activityCompleted === 'yes';
      const skipped = activityCompleted === 'skipped';
      
      // Log the experiment
      const { error } = await ExperimentsService.logExperiment(
        selectedExperiment.id,
        {
          date: today,
          outcome_scores: outcomeScores,
          notes: logNotes || null,
          completed,
          skipped,
        },
        user.id
      );

      if (error) throw new Error(error);

      // Update experiment progress
      await ExperimentsService.updateExperimentProgress(selectedExperiment.id, user.id);

      Alert.alert(
        'Log Saved! 📊',
        'Your experiment data has been recorded.',
        [
          { 
            text: 'Continue', 
            onPress: async () => {
              closeLogModal();
              await loadExperiments(); // Refresh the list
            }
          },
          { 
            text: 'Go Home',
            onPress: () => {
              closeLogModal();
              router.replace('/');  // Replace current route with home
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error logging experiment:', error);
      Alert.alert(
        'Log Failed',
        error instanceof Error ? error.message : 'Failed to save experiment log. Please try again.'
      );
    } finally {
      setIsLogging(false);
    }
  };

  const handleConvertToHabit = async (experiment: Experiment) => {
    if (!user) return;

    Alert.alert(
      'Convert to Habit?',
      `Turn "${experiment.activityName}" into a daily habit?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Convert',
          onPress: async () => {
            try {
              const { error } = await ExperimentsService.convertToHabit(experiment.id, user.id);
              if (error) throw new Error(error);

              Alert.alert('Success! ✅', 'Experiment converted to habit.');
              await loadExperiments();
            } catch (error) {
              console.error('Error converting to habit:', error);
              Alert.alert('Conversion Failed', 'Please try again.');
            }
          }
        }
      ]
    );
  };

  const activeExperiments = experiments.filter(exp => exp.status === 'active');
  const completedExperiments = experiments.filter(exp => exp.status === 'completed');

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading experiments...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>Error: {error}</Text>
        <Text style={[styles.retryText, { color: theme.colors.textSecondary }]}>Pull down to refresh</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.colors.card, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity 
          onPress={() => router.replace('/')} 
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
          <Text style={[styles.backButtonText, { color: theme.colors.text }]}>Home</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Experiments Hub</Text>
        <TouchableOpacity 
          style={styles.dismissButton}
          onPress={() => router.replace('/')}
        >
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={[styles.introCard, { backgroundColor: theme.colors.card }]}>
          <FlaskConical size={48} color={theme.colors.primary} />
          <Text style={[styles.introTitle, { color: theme.colors.text }]}>
            Run Personal Experiments
          </Text>
          <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
            Test how different habits and activities affect your mood, sleep, and mental clarity.
            Track results and convert successful experiments into lasting habits.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
          activeOpacity={0.8}
          onPress={() => router.push('/create-experiment')}
        >
          <Plus size={24} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Start New Experiment</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Active Experiments</Text>
        {activeExperiments.length > 0 ? (
          <View style={styles.experimentsList}>
            {activeExperiments.map((experiment) => (
              <View key={experiment.id} style={[styles.experimentCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.experimentHeader}>
                  <Text style={styles.experimentEmoji}>{experiment.activityEmoji}</Text>
                  <View style={styles.experimentInfo}>
                    <Text style={[styles.experimentTitle, { color: theme.colors.text }]}>{experiment.activityName}</Text>
                    <Text style={[styles.experimentProgress, { color: theme.colors.textSecondary }]}>
                      Day {experiment.currentDay} of {experiment.totalDays}
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${(experiment.currentDay / experiment.totalDays) * 100}%`, 
                          backgroundColor: theme.colors.primary 
                        }
                      ]} 
                    />
                  </View>
                </View>
                <View style={styles.experimentOutcomes}>
                  <Text style={[styles.outcomesLabel, { color: theme.colors.textSecondary }]}>Tracking:</Text>
                  <Text style={[styles.outcomesText, { color: theme.colors.text }]}>
                    {experiment.outcomes.join(', ')}
                  </Text>
                </View>
                
                <View style={styles.experimentActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.secondary, borderColor: theme.colors.border }]}
                    onPress={() => {
                      setSelectedDetailExperiment(experiment);
                      setShowDetailModal(true);
                    }}
                  >
                    <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>View Details</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => openLogModal(experiment)}
                  >
                    <TrendingUp size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Log Today</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
            <Text style={styles.emptyStateEmoji}>🧪</Text>
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
              No Experiments Running
            </Text>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              Test how habits affect your wellbeing
            </Text>
            <TouchableOpacity
              style={[styles.emptyStateButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/create-experiment')}
            >
              <Text style={styles.emptyStateButtonText}>Create Experiment</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Completed Experiments</Text>
        {completedExperiments.length > 0 ? (
          <View style={styles.experimentsList}>
            {completedExperiments.map((experiment) => (
              <View key={experiment.id} style={[styles.experimentCard, { backgroundColor: theme.colors.card }]}>
                <View style={styles.experimentHeader}>
                  <Text style={styles.experimentEmoji}>{experiment.activityEmoji}</Text>
                  <View style={styles.experimentInfo}>
                    <Text style={[styles.experimentTitle, { color: theme.colors.text }]}>{experiment.activityName}</Text>
                    <Text style={[styles.experimentDuration, { color: theme.colors.textSecondary }]}>
                      Completed {experiment.duration} days
                    </Text>
                  </View>
                  <CheckCircle size={24} color={theme.colors.primary} />
                </View>
                
                {experiment.insights && (
                  <View style={[styles.insightsSection, { backgroundColor: theme.colors.secondary }]}>
                    <Text style={[styles.insightsTitle, { color: theme.colors.text }]}>Key Insights</Text>
                    <Text style={[styles.insightsText, { color: theme.colors.textSecondary }]}>{experiment.insights}</Text>
                  </View>
                )}

                <View style={styles.experimentActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => handleConvertToHabit(experiment)}
                  >
                    <CheckCircle size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Convert to Habit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No completed experiments yet. Complete an experiment to see results!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Log Today Modal */}
      <Modal
        visible={showLogModal}
        transparent
        animationType="slide"
        onRequestClose={closeLogModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Log {selectedExperiment?.activityEmoji} {selectedExperiment?.activityName} - Day {selectedExperiment?.currentDay || 1}
              </Text>
              <TouchableOpacity onPress={closeLogModal} style={styles.closeButton}>
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Activity completion question */}
              <Text style={[styles.questionLabel, { color: theme.colors.text }]}>
                Did you complete the activity today?
              </Text>
              <View style={styles.completionButtons}>
                {(['yes', 'no', 'skipped'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.completionButton,
                      {
                        backgroundColor: activityCompleted === option 
                          ? theme.colors.primary 
                          : theme.colors.card,
                        borderColor: activityCompleted === option 
                          ? theme.colors.primary 
                          : theme.colors.border,
                      }
                    ]}
                    onPress={() => setActivityCompleted(option)}
                  >
                    <Text style={[
                      styles.completionButtonText,
                      { color: activityCompleted === option ? '#FFFFFF' : theme.colors.text }
                    ]}>
                      {option === 'yes' ? 'Yes' : option === 'no' ? 'No' : 'Skipped'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary, marginTop: 16 }]}>
                Rate your outcomes today (1-5):
              </Text>

              {selectedExperiment?.outcomes.map((outcome) => (
                <View key={outcome} style={styles.outcomeScoreSection}>
                  <Text style={[styles.outcomeName, { color: theme.colors.text }]}>{outcome}</Text>
                  <View style={styles.scoreButtons}>
                    {[1, 2, 3, 4, 5].map((score) => (
                      <TouchableOpacity
                        key={score}
                        style={[
                          styles.scoreButton,
                          { 
                            backgroundColor: outcomeScores[outcome] === score 
                              ? theme.colors.primary 
                              : theme.colors.card,
                            borderColor: outcomeScores[outcome] === score 
                              ? theme.colors.primary 
                              : theme.colors.border,
                          }
                        ]}
                        onPress={() => setOutcomeScores({ ...outcomeScores, [outcome]: score })}
                      >
                        <Text style={[
                          styles.scoreButtonText,
                          { color: outcomeScores[outcome] === score ? '#FFFFFF' : theme.colors.text }
                        ]}>
                          {score}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}

              <Text style={[styles.notesLabel, { color: theme.colors.text }]}>Notes (optional)</Text>
              <TextInput
                style={[styles.notesInput, { 
                  backgroundColor: theme.colors.card, 
                  color: theme.colors.text,
                  borderColor: theme.colors.border 
                }]}
                placeholder="Any observations or insights?"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                value={logNotes}
                onChangeText={setLogNotes}
              />
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: theme.colors.border }]}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: theme.colors.border }]}
                onPress={closeLogModal}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButtonPrimary, { backgroundColor: theme.colors.primary }]}
                onPress={handleLogExperiment}
                disabled={isLogging}
              >
                {isLogging ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>Save Log</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Experiment Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowDetailModal(false);
          setSelectedDetailExperiment(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {selectedDetailExperiment?.activityEmoji} {selectedDetailExperiment?.activityName}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setShowDetailModal(false);
                  setSelectedDetailExperiment(null);
                }} 
                style={styles.closeButton}
              >
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedDetailExperiment && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Description</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      Track how {selectedDetailExperiment.activityName.toLowerCase()} affects your {selectedDetailExperiment.outcomes.join(', ').toLowerCase()}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Progress</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      Day {selectedDetailExperiment.currentDay} of {selectedDetailExperiment.totalDays}
                    </Text>
                    <View style={[styles.progressBar, { backgroundColor: theme.colors.border, marginTop: 8 }]}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            width: `${(selectedDetailExperiment.currentDay / selectedDetailExperiment.totalDays) * 100}%`, 
                            backgroundColor: theme.colors.primary 
                          }
                        ]} 
                      />
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Outcomes Being Tracked</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      {selectedDetailExperiment.outcomes.join(', ')}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Duration</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      {selectedDetailExperiment.duration} days
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary, marginTop: 16 }]}
                    onPress={() => {
                      setShowDetailModal(false);
                      setSelectedDetailExperiment(null);
                      openLogModal(selectedDetailExperiment);
                    }}
                  >
                    <TrendingUp size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Log Today</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  backButtonText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.xs,
    fontWeight: '600' as const,
  },
  headerTitle: {
    ...theme.typography.h4,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.screenHorizontal,
  },
  introCard: {
    ...theme.components.card,
    alignItems: 'center',
    marginTop: theme.spacing.screenVertical,
    marginBottom: theme.spacing.sectionGap,
  },
  introTitle: {
    ...theme.typography.h3,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.elementGap,
    textAlign: 'center',
  },
  introText: {
    ...theme.typography.bodyLarge,
    textAlign: 'center',
  },
  createButton: {
    ...theme.components.buttonPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  createButtonText: {
    ...theme.typography.button,
    color: '#FFFFFF',
  },
  sectionTitle: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    ...theme.components.cardFlat,
    alignItems: 'center',
    marginBottom: theme.spacing.sectionGap,
    padding: theme.spacing.xl,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyStateTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyStateButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.md,
  },
  emptyStateButtonText: {
    ...theme.typography.button,
    color: '#FFFFFF',
  },
  experimentsList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sectionGap,
  },
  experimentCard: {
    ...theme.components.card,
  },
  experimentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.elementGap,
  },
  experimentEmoji: {
    fontSize: 32,
    marginRight: theme.spacing.elementGap,
  },
  experimentInfo: {
    flex: 1,
  },
  experimentTitle: {
    ...theme.typography.h5,
    marginBottom: theme.spacing.xs,
  },
  experimentProgress: {
    ...theme.typography.body,
  },
  experimentDuration: {
    ...theme.typography.body,
  },
  progressBar: {
    height: 4,
    borderRadius: theme.radii.xs,
    marginTop: theme.spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radii.xs,
  },
  experimentOutcomes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.elementGap,
  },
  outcomesLabel: {
    ...theme.typography.caption,
    marginRight: theme.spacing.sm,
  },
  outcomesText: {
    ...theme.typography.caption,
    flex: 1,
  },
  insightsSection: {
    padding: theme.spacing.elementGap,
    borderRadius: theme.radii.sm,
    marginBottom: theme.spacing.elementGap,
  },
  insightsTitle: {
    ...theme.typography.body,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.xs,
  },
  insightsText: {
    ...theme.typography.bodySmall,
  },
  experimentActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.sm,
    gap: theme.spacing.chipGap - 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionButtonText: {
    ...theme.typography.body,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  detailSection: {
    marginBottom: theme.spacing.md,
  },
  detailLabel: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.xs,
  },
  detailValue: {
    ...theme.typography.body,
  },
  loadingText: {
    ...theme.typography.bodyLarge,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  errorText: {
    ...theme.typography.bodyLarge,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  retryText: {
    ...theme.typography.body,
    textAlign: 'center',
  },
  logTodayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm + 2,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.sm,
    marginTop: theme.spacing.elementGap,
    gap: theme.spacing.chipGap,
  },
  logTodayText: {
    ...theme.typography.body,
    color: '#FFFFFF',
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: theme.radii.xl,
    borderTopRightRadius: theme.radii.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  modalTitle: {
    ...theme.typography.h5,
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  modalBody: {
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingVertical: theme.spacing.screenVertical,
  },
  modalSubtitle: {
    ...theme.typography.bodyLarge,
    marginBottom: theme.spacing.md,
  },
  questionLabel: {
    ...theme.typography.bodyLarge,
    marginBottom: theme.spacing.sm,
    fontWeight: '600' as const,
  },
  completionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  completionButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionButtonText: {
    ...theme.typography.body,
    fontWeight: '600' as const,
  },
  outcomeScoreSection: {
    marginBottom: theme.spacing.sectionGap,
  },
  scoreButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.chipGap,
    marginTop: theme.spacing.elementGap,
  },
  scoreButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scoreButtonText: {
    ...theme.typography.body,
    fontWeight: '600' as const,
  },
  notesLabel: {
    ...theme.typography.bodyLarge,
    marginBottom: theme.spacing.elementGap,
    fontWeight: '500' as const,
  },
  notesInput: {
    ...theme.typography.body,
    borderWidth: 1,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.md,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: theme.spacing.elementGap,
    paddingHorizontal: theme.spacing.screenHorizontal,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
  },
  modalButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalButtonText: {
    ...theme.typography.button,
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.md,
    alignItems: 'center',
  },
  modalButtonTextPrimary: {
    ...theme.typography.button,
    color: '#FFFFFF',
  },
});