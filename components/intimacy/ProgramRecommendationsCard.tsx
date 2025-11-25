import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Sparkles, ChevronRight, X, BookOpen } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { ProgramRecommendationService } from '@/services/programRecommendation.service';
import { router } from 'expo-router';

interface Recommendation {
  id: string;
  program_id: string;
  reason: string;
  pattern_detected: string;
  confidence_score: number;
  program?: {
    id: string;
    title: string;
    description: string;
    duration_days: number;
    difficulty: string;
    category: string;
    tags: string[];
  };
}

export default function ProgramRecommendationsCard() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    loadRecommendations();
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Analyze and generate recommendations
      await ProgramRecommendationService.analyzeAndRecommend(user.id);

      // Fetch recommendations
      const recs = await ProgramRecommendationService.getRecommendations(user.id);
      setRecommendations(recs.slice(0, 3)); // Show top 3
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (recommendationId: string) => {
    if (!user) return;

    const success = await ProgramRecommendationService.dismissRecommendation(
      user.id,
      recommendationId
    );

    if (success) {
      setRecommendations(prev => prev.filter(r => r.id !== recommendationId));
    }
  };

  const handleProgramPress = (programId: string) => {
    router.push(`/intimacy-hub/programs/${programId}` as any);
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'connection': return '#EC4899';
      case 'desire': return '#F59E0B';
      case 'communication': return '#3B82F6';
      case 'self-love': return '#10B981';
      case 'exploration': return '#8B5CF6';
      case 'conflict': return '#EF4444';
      default: return theme.colors.primary;
    }
  };

  const getDifficultyLabel = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return '🌱 Beginner';
      case 'intermediate': return '🌿 Intermediate';
      case 'advanced': return '🌳 Advanced';
      default: return difficulty;
    }
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      ...theme.shadows.medium,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 8,
    },
    headerIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.textPrimary,
      flex: 1,
    },
    subtitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 12,
    },
    recommendationItem: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
    },
    recommendationHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    programInfo: {
      flex: 1,
    },
    programTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 4,
    },
    programMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    categoryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    categoryText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFF',
      textTransform: 'capitalize',
    },
    difficultyText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    durationText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    reasonText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      marginTop: 6,
      fontStyle: 'italic',
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    startButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 4,
    },
    startButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#FFF',
    },
    dismissButton: {
      padding: 4,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    emptyIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.surfaceVariant,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    emptyText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    emptySubtext: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textTertiary,
      textAlign: 'center',
      marginTop: 4,
    },
    loadingContainer: {
      paddingVertical: 30,
      alignItems: 'center',
    },
    viewAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      marginTop: 6,
      gap: 4,
    },
    viewAllText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.primary,
    },
  });

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={{ marginTop: 8, fontSize: 12, color: theme.colors.textSecondary }}>
            Analyzing your patterns...
          </Text>
        </View>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Sparkles size={16} color={theme.colors.primary} />
          </View>
          <Text style={styles.title}>For You</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <BookOpen size={24} color={theme.colors.textSecondary} />
          </View>
          <Text style={styles.emptyText}>No recommendations yet</Text>
          <Text style={styles.emptySubtext}>
            Log more intimacy data and we'll suggest programs tailored to you
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Sparkles size={16} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Recommended For You</Text>
      </View>

      <Text style={styles.subtitle}>
        Based on your intimacy patterns, we think these might help
      </Text>

      {recommendations.map((rec) => (
        <View key={rec.id} style={styles.recommendationItem}>
          <View style={styles.recommendationHeader}>
            <View style={styles.programInfo}>
              <Text style={styles.programTitle}>
                {rec.program?.title || 'Program'}
              </Text>
              <View style={styles.programMeta}>
                <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(rec.program?.category) }]}>
                  <Text style={styles.categoryText}>
                    {rec.program?.category || 'Program'}
                  </Text>
                </View>
                <Text style={styles.difficultyText}>
                  {getDifficultyLabel(rec.program?.difficulty) || ''}
                </Text>
                <Text style={styles.durationText}>
                  {rec.program?.duration_days ? `${rec.program.duration_days} days` : ''}
                </Text>
              </View>
              <Text style={styles.reasonText} numberOfLines={2}>
                {rec.reason || ''}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => handleProgramPress(rec.program_id)}
            >
              <Text style={styles.startButtonText}>Start Program</Text>
              <ChevronRight size={14} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => handleDismiss(rec.id)}
            >
              <X size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.viewAllButton}
        onPress={() => router.push('/intimacy-hub/programs' as any)}
      >
        <Text style={styles.viewAllText}>View All Programs</Text>
        <ChevronRight size={16} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );
}
