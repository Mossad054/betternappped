import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { TestTube, Clock, TrendingUp } from 'lucide-react-native';
import IntimacyHubService, { Experiment, UserExperiment } from '@/services/intimacyHub.service';

export default function ExperimentsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [templates, setTemplates] = useState<Experiment[]>([]);
  const [activeExperiments, setActiveExperiments] = useState<UserExperiment[]>([]);
  const [completedExperiments, setCompletedExperiments] = useState<UserExperiment[]>([]);

  useEffect(() => {
    loadExperiments();
  }, [user]);

  const loadExperiments = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [templatesData, activeData, completedData] = await Promise.all([
        IntimacyHubService.getExperimentTemplates(user.id),
        IntimacyHubService.getUserExperiments(user.id, 'active'),
        IntimacyHubService.getUserExperiments(user.id, 'completed'),
      ]);
      
      setTemplates(templatesData);
      setActiveExperiments(activeData);
      setCompletedExperiments(completedData);
    } catch (error) {
      console.error('Error loading experiments:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExperiments();
    setRefreshing(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '#4CAF50';
      case 'moderate':
        return '#FFC107';
      case 'challenging':
        return '#FF5722';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      habit: '🔄',
      behavioral: '🧠',
      communication: '💬',
      physical: '💪',
      emotional: '❤️',
      environmental: '🏡',
    };
    return icons[type] || '🔬';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Experiments Hub
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Test habits and track their impact
        </Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Active Experiments */}
        {activeExperiments.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Active Experiments
            </Text>
            {activeExperiments.map(experiment => {
              const daysPassed = Math.floor(
                (Date.now() - new Date(experiment.start_date).getTime()) / (1000 * 60 * 60 * 24)
              );
              const daysRemaining = experiment.duration_days - daysPassed;

              return (
                <TouchableOpacity
                  key={experiment.id}
                  style={[styles.experimentCard, { backgroundColor: theme.colors.surface }]}
                  onPress={() => router.push(`/intimacy-hub/experiments/${experiment.id}` as any)}
                >
                  <View style={styles.experimentHeader}>
                    <Text style={styles.experimentIcon}>🔬</Text>
                    <View style={styles.experimentInfo}>
                      <Text style={[styles.experimentTitle, { color: theme.colors.textPrimary }]}>
                        {experiment.custom_title || `Experiment #${experiment.id.slice(0, 8)}`}
                      </Text>
                      <Text style={[styles.experimentDuration, { color: theme.colors.textSecondary }]}>
                        Day {daysPassed + 1} of {experiment.duration_days}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${experiment.completion_percentage}%`,
                          backgroundColor: theme.colors.primary,
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.experimentMeta}>
                    <View style={styles.metaItem}>
                      <Clock size={14} color={theme.colors.textSecondary} />
                      <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                        {daysRemaining} days left
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <TrendingUp size={14} color={theme.colors.success} />
                      <Text style={[styles.metaText, { color: theme.colors.success }]}>
                        {experiment.completion_percentage}% complete
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.logButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => router.push(`/intimacy-hub/experiments/${experiment.id}/log` as any)}
                  >
                    <Text style={[styles.logButtonText, { color: theme.colors.textPrimary }]}>
                      Log Today
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Completed Experiments */}
        {completedExperiments.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Completed Experiments
            </Text>
            {completedExperiments.slice(0, 3).map(experiment => (
              <TouchableOpacity
                key={experiment.id}
                style={[styles.experimentCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => router.push(`/intimacy-hub/experiments/${experiment.id}` as any)}
              >
                <View style={styles.experimentHeader}>
                  <Text style={styles.experimentIcon}>✅</Text>
                  <View style={styles.experimentInfo}>
                    <Text style={[styles.experimentTitle, { color: theme.colors.textPrimary }]}>
                      {experiment.custom_title || `Experiment #${experiment.id.slice(0, 8)}`}
                    </Text>
                    {experiment.success_rating && (
                      <Text style={[styles.successRating, { color: theme.colors.success }]}>
                        ⭐ {experiment.success_rating}/10 success
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Experiment Templates */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Experiment Templates
          </Text>
          {templates.map(template => (
            <TouchableOpacity
              key={template.id}
              style={[styles.templateCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => router.push(`/intimacy-hub/experiments/create?templateId=${template.id}` as any)}
            >
              <View style={styles.templateHeader}>
                <Text style={styles.templateIcon}>{getTypeIcon(template.type)}</Text>
                <View style={styles.templateInfo}>
                  <Text style={[styles.templateTitle, { color: theme.colors.textPrimary }]}>
                    {template.title}
                  </Text>
                  <Text style={[styles.templateDescription, { color: theme.colors.textSecondary }]}>
                    {template.description}
                  </Text>
                </View>
              </View>

              <View style={styles.templateMeta}>
                <View style={styles.metaItem}>
                  <Clock size={14} color={theme.colors.textSecondary} />
                  <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                    {template.recommended_duration} days
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <TrendingUp size={14} color={getDifficultyColor(template.difficulty)} />
                  <Text style={[styles.metaText, { color: getDifficultyColor(template.difficulty) }]}>
                    {template.difficulty}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <TestTube size={14} color={theme.colors.textSecondary} />
                  <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                    {template.usage_count} uses
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.startButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => router.push(`/intimacy-hub/experiments/create?templateId=${template.id}` as any)}
              >
                <Text style={[styles.startButtonText, { color: theme.colors.textPrimary }]}>
                  Start Experiment
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 12,
  },
  experimentCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  experimentHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  experimentIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  experimentInfo: {
    flex: 1,
  },
  experimentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  experimentDuration: {
    fontSize: 14,
  },
  successRating: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  experimentMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  logButton: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  logButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  templateCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  templateHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  templateIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  templateMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  startButton: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
