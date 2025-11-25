import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Award } from 'lucide-react-native';
import IntimacyHubService, { Achievement, UserAchievement } from '@/services/intimacyHub.service';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

export default function AchievementsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);

  useEffect(() => {
    loadAchievements();
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [all, unlocked] = await Promise.all([
        IntimacyHubService.getAchievements(user.id),
        IntimacyHubService.getUserAchievements(user.id),
      ]);
      
      setAllAchievements(all);
      setUserAchievements(unlocked);

      // Check for new achievements
      await IntimacyHubService.checkAndUnlockAchievements(user.id);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAchievements();
    setRefreshing(false);
  };

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getUserAchievement = (achievementId: string) => {
    return userAchievements.find(ua => ua.achievement_id === achievementId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const unlockedCount = userAchievements.length;
  const totalCount = allAchievements.length;
  const progressPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Achievements
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Celebrate your milestones
        </Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Progress Overview */}
        <View style={[styles.overviewCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.overviewContent}>
            <Award size={48} color={theme.colors.primary} />
            <View style={styles.overviewText}>
              <Text style={[styles.overviewCount, { color: theme.colors.textPrimary }]}>
                {unlockedCount} / {totalCount}
              </Text>
              <Text style={[styles.overviewLabel, { color: theme.colors.textSecondary }]}>
                Achievements Unlocked
              </Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progressPercentage}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {progressPercentage}% Complete
          </Text>
        </View>

        {/* Achievements Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            All Achievements
          </Text>
          <View style={styles.grid}>
            {allAchievements.map(achievement => {
              const unlocked = isUnlocked(achievement.id);
              const userAch = getUserAchievement(achievement.id);

              return (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                    { backgroundColor: theme.colors.surface },
                    !unlocked && { opacity: 0.5 },
                  ]}
                >
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={[styles.achievementTitle, { color: theme.colors.textPrimary }]}>
                    {achievement.title}
                  </Text>
                  <Text
                    style={[styles.achievementDescription, { color: theme.colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {achievement.description}
                  </Text>
                  
                  {unlocked ? (
                    <>
                      <View style={[styles.unlockedBadge, { backgroundColor: '#E8F5E9' }]}>
                        <Text style={[styles.unlockedText, { color: theme.colors.success }]}>
                          ✓ Unlocked
                        </Text>
                      </View>
                      {userAch && (
                        <Text style={[styles.unlockedDate, { color: theme.colors.textSecondary }]}>
                          {formatDate(userAch.unlocked_at)}
                        </Text>
                      )}
                    </>
                  ) : (
                    <View style={[styles.lockedBadge, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <Text style={[styles.lockedText, { color: theme.colors.textSecondary }]}>
                        🔒 Locked
                      </Text>
                    </View>
                  )}

                  {achievement.reward_points && (
                    <Text style={[styles.points, { color: theme.colors.primary }]}>
                      {achievement.reward_points} pts
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
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
  overviewCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  overviewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  overviewText: {
    marginLeft: 16,
  },
  overviewCount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  overviewLabel: {
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 16,
  },
  achievementCard: {
    width: CARD_WIDTH,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  achievementDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  unlockedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 6,
  },
  unlockedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  unlockedDate: {
    fontSize: 10,
  },
  lockedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  lockedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  points: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  bottomSpacer: {
    height: 40,
  },
});
