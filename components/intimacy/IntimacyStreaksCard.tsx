import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Flame, Plus, X, Target, TrendingUp, Calendar, Award } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { IntimacyStreaksService, StreakGoal, StreakProgress } from '@/services/intimacyStreaks.service';

export default function IntimacyStreaksCard() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeStreaks, setActiveStreaks] = useState<StreakGoal[]>([]);
  const [selectedStreak, setSelectedStreak] = useState<StreakProgress | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // New streak form state
  const [goalName, setGoalName] = useState('');
  const [goalType, setGoalType] = useState<'frequency' | 'consistency' | 'orgasm' | 'custom'>('frequency');
  const [targetFrequency, setTargetFrequency] = useState('3');
  const [targetPeriod, setTargetPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [targetDuration, setTargetDuration] = useState('30');

  useEffect(() => {
    loadStreaks();
  }, [user]);

  const loadStreaks = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const streaks = await IntimacyStreaksService.getStreakGoals(user.id, 'active');
      setActiveStreaks(streaks);
    } catch (error) {
      console.error('Error loading streaks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStreak = async () => {
    if (!user || !goalName.trim()) {
      Alert.alert('Error', 'Please enter a goal name');
      return;
    }

    const freq = parseInt(targetFrequency);
    const duration = parseInt(targetDuration);

    if (isNaN(freq) || freq <= 0) {
      Alert.alert('Error', 'Please enter a valid frequency');
      return;
    }

    if (isNaN(duration) || duration <= 0) {
      Alert.alert('Error', 'Please enter a valid duration');
      return;
    }

    const result = await IntimacyStreaksService.createStreakGoal(user.id, {
      goalName,
      goalType,
      targetFrequency: freq,
      targetPeriod,
      targetDurationDays: duration,
    });

    if (result) {
      setShowCreateModal(false);
      resetForm();
      loadStreaks();
      Alert.alert('Success', 'Streak goal created!');
    } else {
      Alert.alert('Error', 'Failed to create streak goal');
    }
  };

  const resetForm = () => {
    setGoalName('');
    setGoalType('frequency');
    setTargetFrequency('3');
    setTargetPeriod('weekly');
    setTargetDuration('30');
  };

  const handleStreakPress = async (streak: StreakGoal) => {
    if (!user) return;

    const progress = await IntimacyStreaksService.getStreakProgress(user.id, streak.id);
    if (progress) {
      setSelectedStreak(progress);
      setShowDetailModal(true);
    }
  };

  const getStreakColor = (streak: StreakGoal) => {
    if (streak.current_streak >= 7) return '#10B981'; // Green
    if (streak.current_streak >= 3) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
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
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#EF4444' + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    addButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    streakItem: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
    },
    streakHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    streakName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      flex: 1,
    },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    streakBadgeText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFF',
    },
    streakDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    streakStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    streakStatText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 30,
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
      marginBottom: 16,
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 24,
      gap: 6,
    },
    createButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFF',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 24,
      width: '100%',
      maxWidth: 400,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    closeButton: {
      padding: 4,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 8,
      marginTop: 12,
    },
    input: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 12,
      fontSize: 15,
      color: theme.colors.textPrimary,
    },
    typeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    typeButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: theme.colors.borderLight,
    },
    typeButtonActive: {
      backgroundColor: theme.colors.primary + '20',
      borderColor: theme.colors.primary,
    },
    typeButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    typeButtonTextActive: {
      color: theme.colors.primary,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    rowItem: {
      flex: 1,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 20,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFF',
    },
    detailSection: {
      marginBottom: 16,
    },
    detailTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.textPrimary,
      marginBottom: 12,
    },
    progressBar: {
      height: 8,
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    statBox: {
      width: '47%',
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
  });

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Flame size={16} color="#EF4444" />
            </View>
            <Text style={styles.title}>Intimacy Streaks</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowCreateModal(true)}>
            <Plus size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {activeStreaks.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Target size={24} color={theme.colors.textSecondary} />
            </View>
            <Text style={styles.emptyText}>
              Create your first intimacy streak goal and stay motivated!
            </Text>
            <TouchableOpacity style={styles.createButton} onPress={() => setShowCreateModal(true)}>
              <Plus size={16} color="#FFF" />
              <Text style={styles.createButtonText}>Create Streak Goal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {activeStreaks.map((streak) => (
              <TouchableOpacity
                key={streak.id}
                style={styles.streakItem}
                onPress={() => handleStreakPress(streak)}
              >
                <View style={styles.streakHeader}>
                  <Text style={styles.streakName} numberOfLines={1}>
                    {streak.goal_name}
                  </Text>
                  <View style={[styles.streakBadge, { backgroundColor: getStreakColor(streak) }]}>
                    <Flame size={14} color="#FFF" />
                    <Text style={styles.streakBadgeText}>{streak.current_streak}</Text>
                  </View>
                </View>
                <View style={styles.streakDetails}>
                  <View style={styles.streakStat}>
                    <Target size={12} color={theme.colors.textSecondary} />
                    <Text style={styles.streakStatText}>
                      {streak.target_frequency}x {streak.target_period}
                    </Text>
                  </View>
                  <View style={styles.streakStat}>
                    <TrendingUp size={12} color={theme.colors.textSecondary} />
                    <Text style={styles.streakStatText}>Longest: {streak.longest_streak}</Text>
                  </View>
                  <View style={styles.streakStat}>
                    <Award size={12} color={theme.colors.textSecondary} />
                    <Text style={styles.streakStatText}>{streak.success_count} wins</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>

      {/* Create Streak Modal */}
      <Modal visible={showCreateModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Streak Goal</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowCreateModal(false)}>
                <X size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Goal Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Intimacy 3x per week"
                placeholderTextColor={theme.colors.textTertiary}
                value={goalName}
                onChangeText={setGoalName}
              />

              <Text style={styles.inputLabel}>Goal Type</Text>
              <View style={styles.typeRow}>
                {(['frequency', 'consistency', 'orgasm', 'custom'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeButton, goalType === type && styles.typeButtonActive]}
                    onPress={() => setGoalType(type)}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        goalType === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={styles.rowItem}>
                  <Text style={styles.inputLabel}>Frequency</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="3"
                    placeholderTextColor={theme.colors.textTertiary}
                    value={targetFrequency}
                    onChangeText={setTargetFrequency}
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.rowItem}>
                  <Text style={styles.inputLabel}>Period</Text>
                  <View style={styles.input}>
                    <View style={styles.typeRow}>
                      {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                        <TouchableOpacity
                          key={period}
                          style={[
                            styles.typeButton,
                            { padding: 4, paddingHorizontal: 8 },
                            targetPeriod === period && styles.typeButtonActive,
                          ]}
                          onPress={() => setTargetPeriod(period)}
                        >
                          <Text
                            style={[
                              styles.typeButtonText,
                              { fontSize: 11 },
                              targetPeriod === period && styles.typeButtonTextActive,
                            ]}
                          >
                            {period}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>

              <Text style={styles.inputLabel}>Duration (days)</Text>
              <TextInput
                style={styles.input}
                placeholder="30"
                placeholderTextColor={theme.colors.textTertiary}
                value={targetDuration}
                onChangeText={setTargetDuration}
                keyboardType="number-pad"
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleCreateStreak}>
                <Text style={styles.saveButtonText}>Create Streak</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      {selectedStreak && (
        <Modal visible={showDetailModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedStreak.goal.goal_name}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetailModal(false)}>
                  <X size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>Progress</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${selectedStreak.progressPercentage}%`,
                          backgroundColor: theme.colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.statLabel}>
                    {selectedStreak.daysElapsed} of {selectedStreak.totalDays} days " {selectedStreak.progressPercentage}% complete
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>Statistics</Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{selectedStreak.goal.current_streak}</Text>
                      <Text style={styles.statLabel}>Current Streak</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{selectedStreak.goal.longest_streak}</Text>
                      <Text style={styles.statLabel}>Best Streak</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{selectedStreak.goal.success_count}</Text>
                      <Text style={styles.statLabel}>Days Met</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{selectedStreak.successRate}%</Text>
                      <Text style={styles.statLabel}>Success Rate</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}
