import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, FlaskConical, Plus, CheckCircle, Play, RotateCcw } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ExperimentsService } from '@/services/experiments.service';
import { type Experiment } from '@/constants/mockData';

export default function ExperimentsHub() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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
      
      setExperiments(data || []);
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Experiments Hub</Text>
        <View style={styles.placeholder} />
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
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              No active experiments yet. Start one to begin tracking!
            </Text>
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
                    onPress={() => {
                      // Convert to habit logic
                      console.log('Convert to habit:', experiment.id);
                    }}
                  >
                    <CheckCircle size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Convert to Habit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: theme.colors.secondary, borderColor: theme.colors.border }]}
                    onPress={() => {
                      // Run again logic
                      console.log('Run again:', experiment.id);
                    }}
                  >
                    <RotateCcw size={16} color={theme.colors.text} />
                    <Text style={[styles.actionButtonText, { color: theme.colors.text }]}>Run Again</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  introCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  introText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  experimentsList: {
    gap: 16,
    marginBottom: 24,
  },
  experimentCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  experimentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  experimentEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  experimentInfo: {
    flex: 1,
  },
  experimentTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  experimentProgress: {
    fontSize: 14,
  },
  experimentDuration: {
    fontSize: 14,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  experimentOutcomes: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  outcomesLabel: {
    fontSize: 12,
    marginRight: 8,
  },
  outcomesText: {
    fontSize: 12,
    flex: 1,
  },
  insightsSection: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  insightsText: {
    fontSize: 13,
    lineHeight: 18,
  },
  experimentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
