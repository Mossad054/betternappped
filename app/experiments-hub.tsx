import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, FlaskConical, Plus, CheckCircle, Play, RotateCcw, X, TrendingUp, Moon, Brain, Zap, Heart, Shield } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ExperimentsService } from '@/services/experiments.service';
import { type Experiment } from '@/constants/mockData';

// Predefined experiment templates
const EXPERIMENT_LIBRARY = {
  popular: [
    {
      id: 'no-screen-bed',
      title: 'No Screen Before Bed',
      emoji: '📵',
      duration: 7,
      goal: 'Better Sleep Quality',
      description: 'This 7-day test explores whether avoiding screens before bed improves your sleep quality and reduces anxiety.',
      outcomes: ['Sleep Quality', 'Anxiety'],
      category: 'Sleep'
    },
    {
      id: 'morning-meditation',
      title: 'Morning Meditation',
      emoji: '🧘',
      duration: 14,
      goal: 'Improved Focus',
      description: 'Test if 10 minutes of morning meditation improves your mental clarity and productivity throughout the day.',
      outcomes: ['Focus', 'Mental Clarity'],
      category: 'Focus'
    },
    {
      id: 'exercise-routine',
      title: 'Daily Exercise',
      emoji: '🏃',
      duration: 21,
      goal: 'Better Mood & Energy',
      description: 'Discover how 30 minutes of daily exercise affects your mood, energy levels, and sleep quality.',
      outcomes: ['Mood', 'Energy', 'Sleep Quality'],
      category: 'Energy'
    },
  ],
  sleep: [
    {
      id: 'no-screen-bed',
      title: 'No Screen Before Bed',
      emoji: '📵',
      duration: 7,
      goal: 'Better Sleep Quality',
      description: 'This 7-day test explores whether avoiding screens before bed improves your sleep quality and reduces anxiety.',
      outcomes: ['Sleep Quality', 'Anxiety'],
      category: 'Sleep'
    },
    {
      id: 'consistent-bedtime',
      title: 'Consistent Bedtime',
      emoji: '😴',
      duration: 14,
      goal: 'Regular Sleep Pattern',
      description: 'Go to bed at the same time every night to see if it improves sleep quality and daytime energy.',
      outcomes: ['Sleep Quality', 'Energy'],
      category: 'Sleep'
    },
    {
      id: 'bedroom-temperature',
      title: 'Cool Bedroom',
      emoji: '❄️',
      duration: 7,
      goal: 'Deeper Sleep',
      description: 'Keep your bedroom between 60-67°F to test if temperature affects your sleep depth.',
      outcomes: ['Sleep Quality'],
      category: 'Sleep'
    },
  ],
  mood: [
    {
      id: 'gratitude-journal',
      title: 'Daily Gratitude',
      emoji: '🙏',
      duration: 21,
      goal: 'Positive Mindset',
      description: 'Write 3 things you\'re grateful for each day and track how it affects your mood.',
      outcomes: ['Mood', 'Anxiety'],
      category: 'Mood'
    },
    {
      id: 'morning-sunlight',
      title: 'Morning Sunlight',
      emoji: '☀️',
      duration: 14,
      goal: 'Better Mood',
      description: 'Get 10 minutes of natural light within an hour of waking to boost your mood.',
      outcomes: ['Mood', 'Energy'],
      category: 'Mood'
    },
  ],
  focus: [
    {
      id: 'morning-meditation',
      title: 'Morning Meditation',
      emoji: '🧘',
      duration: 14,
      goal: 'Improved Focus',
      description: 'Test if 10 minutes of morning meditation improves your mental clarity and productivity.',
      outcomes: ['Focus', 'Mental Clarity'],
      category: 'Focus'
    },
    {
      id: 'digital-detox-hour',
      title: 'Digital Detox Hour',
      emoji: '📵',
      duration: 7,
      goal: 'Enhanced Clarity',
      description: 'One hour without screens each day to test if it improves focus and mental clarity.',
      outcomes: ['Focus', 'Mental Clarity'],
      category: 'Focus'
    },
  ],
  energy: [
    {
      id: 'exercise-routine',
      title: 'Daily Exercise',
      emoji: '🏃',
      duration: 21,
      goal: 'Better Mood & Energy',
      description: 'Discover how 30 minutes of daily exercise affects your mood, energy levels, and sleep quality.',
      outcomes: ['Mood', 'Energy', 'Sleep Quality'],
      category: 'Energy'
    },
    {
      id: 'hydration-tracking',
      title: '8 Glasses of Water',
      emoji: '💧',
      duration: 14,
      goal: 'More Energy',
      description: 'Stay hydrated and see if it boosts your energy and mental clarity.',
      outcomes: ['Energy', 'Focus'],
      category: 'Energy'
    },
  ],
};

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
  
  // New states for library
  const [selectedCategory, setSelectedCategory] = useState<'popular' | 'sleep' | 'mood' | 'focus' | 'energy'>('popular');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'ongoing' | 'completed'>('library');

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
              const { error} = await ExperimentsService.convertToHabit(experiment.id, user.id);
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

  const openTemplateModal = (template: any) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
  };

  const closeTemplateModal = () => {
    setShowTemplateModal(false);
    setSelectedTemplate(null);
  };

  const handleStartExperiment = async () => {
    // Will implement creating experiment from template
    closeTemplateModal();
    router.push({
      pathname: '/create-experiment',
      params: {
        template: JSON.stringify(selectedTemplate)
      }
    });
  };

  const activeExperiments = experiments.filter(exp => exp.status === 'active');
  const completedExperiments = experiments.filter(exp => exp.status === 'completed');
  const currentLibrary = EXPERIMENT_LIBRARY[selectedCategory];

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
        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'library' && styles.tabActive]}
            onPress={() => setActiveTab('library')}
          >
            <Text style={[styles.tabText, activeTab === 'library' && { color: theme.colors.primary }]}>Library</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ongoing' && styles.tabActive]}
            onPress={() => setActiveTab('ongoing')}
          >
            <Text style={[styles.tabText, activeTab === 'ongoing' && { color: theme.colors.primary }]}>Ongoing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
            onPress={() => setActiveTab('completed')}
          >
            <Text style={[styles.tabText, activeTab === 'completed' && { color: theme.colors.primary }]}>Completed</Text>
          </TouchableOpacity>
        </View>

        {/* LIBRARY TAB */}
        {activeTab === 'library' && (
          <>
            <View style={[styles.introCard, { backgroundColor: theme.colors.card }]}>
              <FlaskConical size={24} color={theme.colors.primary} />
              <Text style={[styles.introTitle, { color: theme.colors.text }]}>
                Experiment Library
              </Text>
              <Text style={[styles.introText, { color: theme.colors.textSecondary }]}>
                Choose from popular experiment templates or create your own
              </Text>
            </View>

            {/* Category Pills - 3 per row */}
            <View style={styles.categoryPillsContainer}>
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: selectedCategory === 'popular' ? theme.colors.primary : 'transparent',
                    borderColor: selectedCategory === 'popular' ? theme.colors.primary : theme.colors.border,
                  }
                ]}
                onPress={() => setSelectedCategory('popular')}
              >
                <Text style={[styles.categoryPillText, { color: selectedCategory === 'popular' ? '#FFFFFF' : theme.colors.text }]}>
                  Popular
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: selectedCategory === 'sleep' ? theme.colors.primary : 'transparent',
                    borderColor: selectedCategory === 'sleep' ? theme.colors.primary : theme.colors.border,
                  }
                ]}
                onPress={() => setSelectedCategory('sleep')}
              >
                <Text style={[styles.categoryPillText, { color: selectedCategory === 'sleep' ? '#FFFFFF' : theme.colors.text }]}>
                  Sleep
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: selectedCategory === 'mood' ? theme.colors.primary : 'transparent',
                    borderColor: selectedCategory === 'mood' ? theme.colors.primary : theme.colors.border,
                  }
                ]}
                onPress={() => setSelectedCategory('mood')}
              >
                <Text style={[styles.categoryPillText, { color: selectedCategory === 'mood' ? '#FFFFFF' : theme.colors.text }]}>
                  Mood
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: selectedCategory === 'focus' ? theme.colors.primary : 'transparent',
                    borderColor: selectedCategory === 'focus' ? theme.colors.primary : theme.colors.border,
                  }
                ]}
                onPress={() => setSelectedCategory('focus')}
              >
                <Text style={[styles.categoryPillText, { color: selectedCategory === 'focus' ? '#FFFFFF' : theme.colors.text }]}>
                  Focus
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: selectedCategory === 'energy' ? theme.colors.primary : 'transparent',
                    borderColor: selectedCategory === 'energy' ? theme.colors.primary : theme.colors.border,
                  }
                ]}
                onPress={() => setSelectedCategory('energy')}
              >
                <Text style={[styles.categoryPillText, { color: selectedCategory === 'energy' ? '#FFFFFF' : theme.colors.text }]}>
                  Energy
                </Text>
              </TouchableOpacity>
            </View>

            {/* Experiment Template Cards */}
            <View style={styles.templatesGrid}>
              {currentLibrary.map((template) => (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateCard,
                    { 
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    }
                  ]}
                  onPress={() => openTemplateModal(template)}
                >
                  <Text style={styles.templateEmoji}>{template.emoji}</Text>
                  <Text style={[styles.templateTitle, { color: theme.colors.text }]}>{template.title}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: theme.colors.accent, marginTop: 16 }]}
              activeOpacity={0.8}
              onPress={() => router.push('/create-experiment')}
            >
              <Plus size={24} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create My Own Experiment</Text>
            </TouchableOpacity>
          </>
        )}

        {/* ONGOING TAB */}
        {activeTab === 'ongoing' && (
          <>
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

          </>
        )}

        {/* COMPLETED TAB */}
        {activeTab === 'completed' && (
          <>
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
      </>)}
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

      {/* Template Detail Modal */}
      <Modal
        visible={showTemplateModal}
        transparent
        animationType="slide"
        onRequestClose={closeTemplateModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.divider }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>About this Experiment</Text>
              <TouchableOpacity onPress={closeTemplateModal} style={styles.closeButton}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedTemplate && (
                <>
                  <View style={{ alignItems: 'center', marginBottom: theme.spacing.sectionGap }}>
                    <Text style={{ fontSize: 64, marginBottom: theme.spacing.sm }}>{selectedTemplate.emoji}</Text>
                    <Text style={[styles.modalTitle, { color: theme.colors.text, textAlign: 'center' }]}>
                      {selectedTemplate.title}
                    </Text>
                    <View style={[styles.durationBadge, { backgroundColor: theme.colors.secondary, marginTop: theme.spacing.sm }]}>
                      <Text style={[styles.durationText, { color: theme.colors.text }]}>
                        {selectedTemplate.duration} days
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Goal</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      {selectedTemplate.goal}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>What to Track</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      {selectedTemplate.outcomes.join(', ')}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>Description</Text>
                    <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                      {selectedTemplate.description}
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={[styles.modalFooter, { borderTopColor: theme.colors.divider }]}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: theme.colors.border }]}
                onPress={closeTemplateModal}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButtonPrimary, { backgroundColor: theme.colors.primary }]}
                onPress={handleStartExperiment}
              >
                <Text style={styles.modalButtonTextPrimary}>Start Experiment</Text>
              </TouchableOpacity>
            </View>
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
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  introTitle: {
    ...theme.typography.h5,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs - 2,
    textAlign: 'center',
  },
  introText: {
    ...theme.typography.caption,
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
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  experimentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  experimentEmoji: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  experimentInfo: {
    flex: 1,
  },
  experimentTitle: {
    ...theme.typography.body,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  experimentProgress: {
    ...theme.typography.caption,
  },
  experimentDuration: {
    ...theme.typography.caption,
  },
  progressBar: {
    height: 3,
    borderRadius: theme.radii.xs,
    marginTop: theme.spacing.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radii.xs,
  },
  experimentOutcomes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  outcomesLabel: {
    ...theme.typography.caption,
    fontSize: 11,
    marginRight: theme.spacing.xs,
  },
  outcomesText: {
    ...theme.typography.caption,
    fontSize: 11,
    flex: 1,
  },
  insightsSection: {
    padding: theme.spacing.sm,
    borderRadius: theme.radii.sm,
    marginBottom: theme.spacing.sm,
  },
  insightsTitle: {
    ...theme.typography.caption,
    fontWeight: '600' as const,
    marginBottom: theme.spacing.xs - 2,
  },
  insightsText: {
    ...theme.typography.caption,
    fontSize: 11,
  },
  experimentActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs - 2,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionButtonText: {
    ...theme.typography.caption,
    fontSize: 12,
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
  dismissButton: {
    padding: theme.spacing.xs,
  },
  outcomeName: {
    ...theme.typography.body,
    fontWeight: '500' as const,
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
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
  },
  modalButtonText: {
    ...theme.typography.button,
  },
  modalButtonPrimary: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  modalButtonTextPrimary: {
    ...theme.typography.button,
    color: '#FFFFFF',
  },
  // New Tab Navigation Styles
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: theme.spacing.screenHorizontal,
    marginBottom: theme.spacing.sectionGap,
  },
  tab: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    ...theme.typography.body,
    fontWeight: '600' as const,
  },
  // Category Pills Styles
  categoryPillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.chipGap,
    marginBottom: theme.spacing.sectionGap,
  },
  categoryPill: {
    flexBasis: '30%',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryPillText: {
    ...theme.typography.body,
    fontWeight: '600' as const,
    textTransform: 'capitalize' as const,
  },
  // Template Cards Styles
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.chipGap,
    marginBottom: theme.spacing.sectionGap,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs + 2,
    paddingHorizontal: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    gap: theme.spacing.xs - 2,
    flexBasis: '48%',
    flexGrow: 0,
    flexShrink: 1,
  },
  templateEmoji: {
    fontSize: 14,
  },
  templateTitle: {
    ...theme.typography.caption,
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
  },
  durationBadge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  durationText: {
    ...theme.typography.body,
    fontWeight: '600' as const,
  },
});