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
import { BookOpen, Clock, TrendingUp, Award } from 'lucide-react-native';
import IntimacyHubService, { Program, UserProgram } from '@/services/intimacyHub.service';

export default function ProgramsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [userPrograms, setUserPrograms] = useState<UserProgram[]>([]);

  useEffect(() => {
    loadPrograms();
  }, [user]);

  const loadPrograms = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [allPrograms, enrolledPrograms] = await Promise.all([
        IntimacyHubService.getPrograms(user.id),
        IntimacyHubService.getUserPrograms(user.id),
      ]);

      // Sort programs - they come from database, ensure consistent ordering
      const sortedPrograms = (allPrograms || []).sort((a, b) => {
        // Sort by ID to maintain consistent order (IDs contain program number)
        return a.id.localeCompare(b.id);
      });

      setPrograms(sortedPrograms);
      setUserPrograms(enrolledPrograms || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPrograms();
    setRefreshing(false);
  };

  const isEnrolled = (programId: string) => {
    return userPrograms.some(up => up.program_id === programId);
  };

  const getUserProgramProgress = (programId: string) => {
    return userPrograms.find(up => up.program_id === programId);
  };

  const handleEnroll = async (programId: string) => {
    if (!user) return;

    try {
      const success = await IntimacyHubService.enrollInProgram(user.id, programId);
      if (success) {
        await loadPrograms();
        router.push(`/intimacy-hub/programs/${programId}` as any);
      }
    } catch (error) {
      console.error('Error enrolling in program:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FFC107';
      case 'advanced':
        return '#FF5722';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      communication: '💬',
      connection: '🤝',
      desire: '🔥',
      conflict: '⚖️',
      'self-love': '💖',
      exploration: '🧭',
    };
    return icons[category] || '📚';
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
          Coaching Programs
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Structured journeys for deeper intimacy
        </Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Active Programs */}
        {userPrograms.filter(up => up.status === 'active' || up.status === 'enrolled').length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Your Active Programs
            </Text>
            {userPrograms
              .filter(up => up.status === 'active' || up.status === 'enrolled')
              .map(userProgram => {
                const program = programs.find(p => p.id === userProgram.program_id);
                if (!program) return null;

                return (
                  <TouchableOpacity
                    key={userProgram.id}
                    style={[styles.programCard, { backgroundColor: theme.colors.surface }]}
                    onPress={() => router.push(`/intimacy-hub/programs/${program.id}` as any)}
                  >
                    <View style={styles.programHeader}>
                      <Text style={styles.programIcon}>{getCategoryIcon(program.category)}</Text>
                      <View style={styles.programInfo}>
                        <Text style={[styles.programTitle, { color: theme.colors.textPrimary }]}>
                          {program.title}
                        </Text>
                        <Text style={[styles.programDescription, { color: theme.colors.textSecondary }]}>
                          {program.description}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.progressSection}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${userProgram.progress_percentage}%`,
                              backgroundColor: theme.colors.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                        {userProgram.progress_percentage}% complete
                      </Text>
                    </View>

                    <View style={styles.programMeta}>
                      <View style={styles.metaItem}>
                        <Clock size={14} color={theme.colors.textSecondary} />
                        <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                          {program.duration_days} days
                        </Text>
                      </View>
                      <View style={styles.metaItem}>
                        <BookOpen size={14} color={theme.colors.textSecondary} />
                        <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                          {program.total_lessons} lessons
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
          </View>
        )}

        {/* Available Programs */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Available Programs ({programs.length})
          </Text>
          {programs.map((program, index) => {
            const userProgram = getUserProgramProgress(program.id);
            const enrolled = isEnrolled(program.id);
            const programNumber = index + 1;

            return (
              <TouchableOpacity
                key={program.id}
                style={[styles.programCard, { backgroundColor: theme.colors.surface }]}
                onPress={() => {
                  router.push(`/intimacy-hub/programs/${program.id}` as any);
                }}
              >
                <View style={styles.programHeader}>
                  <View style={[styles.programNumber, { backgroundColor: theme.colors.primary + '20' }]}>
                    <Text style={[styles.programNumberText, { color: theme.colors.primary }]}>
                      {programNumber}
                    </Text>
                  </View>
                  <View style={styles.programInfo}>
                    <Text style={[styles.programTitle, { color: theme.colors.textPrimary }]}>
                      {program.title}
                    </Text>
                    <Text style={[styles.programDescription, { color: theme.colors.textSecondary }]}>
                      {program.description}
                    </Text>
                  </View>
                </View>

                <View style={styles.tagsContainer}>
                  {(program.tags || []).slice(0, 3).map((tag, index) => (
                    <View
                      key={index}
                      style={[styles.tag, { backgroundColor: theme.colors.surfaceVariant }]}
                    >
                      <Text style={[styles.tagText, { color: theme.colors.textSecondary }]}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.programMeta}>
                  <View style={styles.metaItem}>
                    <Clock size={14} color={theme.colors.textSecondary} />
                    <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                      {program.duration_days} days
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <BookOpen size={14} color={theme.colors.textSecondary} />
                    <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                      {program.total_lessons} lessons
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <TrendingUp size={14} color={getDifficultyColor(program.difficulty)} />
                    <Text style={[styles.metaText, { color: getDifficultyColor(program.difficulty) }]}>
                      {program.difficulty}
                    </Text>
                  </View>
                </View>

                {enrolled && userProgram ? (
                  <View style={styles.enrolledBadge}>
                    <Award size={16} color={theme.colors.success} />
                    <Text style={[styles.enrolledText, { color: theme.colors.success }]}>
                      Enrolled - {userProgram.progress_percentage}% complete
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.enrollButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => handleEnroll(program.id)}
                  >
                    <Text style={[styles.enrollButtonText, { color: theme.colors.textPrimary }]}>
                      Start Program
                    </Text>
                  </TouchableOpacity>
                )}

                {program.is_premium && (
                  <View style={[styles.premiumBadge, { backgroundColor: theme.colors.warning }]}>
                    <Text style={[styles.premiumText, { color: theme.colors.textPrimary }]}>
                      ⭐ Premium
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
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
  programCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  programHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  programIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  programNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  programNumberText: {
    fontSize: 16,
    fontWeight: '700',
  },
  programInfo: {
    flex: 1,
  },
  programTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  programDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  programMeta: {
    flexDirection: 'row',
    alignItems: 'center',
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
    textTransform: 'capitalize',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
  },
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  enrolledText: {
    fontSize: 14,
    fontWeight: '600',
  },
  enrollButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  enrollButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  premiumBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
