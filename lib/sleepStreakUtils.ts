// Sleep Streak Calculation Utility
import { SleepService } from '@/services/sleep.service';
import { RewardsService, POINT_VALUES } from '@/services/rewards.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SLEEP_STREAK_KEY = 'sleep_streak_data';

export interface SleepStreak {
  currentStreak: number;
  longestStreak: number;
  lastCheckDate: string;
  totalNightsOnTarget: number;
  badgesEarned: string[];
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  emoji: string;
  requirement: number;
  type: 'streak' | 'total';
}

export const SLEEP_BADGES: BadgeDefinition[] = [
  {
    id: 'first_night',
    name: 'First Night',
    description: 'Met your bedtime target for the first time',
    emoji: '🌟',
    requirement: 1,
    type: 'total',
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: '3-night streak on target',
    emoji: '🐦',
    requirement: 3,
    type: 'streak',
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: '7-night streak on target',
    emoji: '🔥',
    requirement: 7,
    type: 'streak',
  },
  {
    id: 'fortnight_champion',
    name: 'Fortnight Champion',
    description: '14-night streak on target',
    emoji: '⭐',
    requirement: 14,
    type: 'streak',
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: '30-night streak on target',
    emoji: '👑',
    requirement: 30,
    type: 'streak',
  },
  {
    id: 'consistent_sleeper',
    name: 'Consistent Sleeper',
    description: '50 total nights on target',
    emoji: '💤',
    requirement: 50,
    type: 'total',
  },
];

/**
 * Check if a bedtime is within the target window
 */
export function isBedtimeOnTarget(
  actualBedtime: string,
  targetBedtime: string,
  consistencyMinutes: number
): boolean {
  try {
    const [targetHour, targetMin] = targetBedtime.split(':').map(Number);
    const [actualHour, actualMin] = actualBedtime.split(':').map(Number);

    const targetTotalMin = targetHour * 60 + targetMin;
    let actualTotalMin = actualHour * 60 + actualMin;

    // Handle crossing midnight (e.g., target 23:00, actual 00:30)
    if (actualTotalMin < 12 * 60 && targetTotalMin > 18 * 60) {
      actualTotalMin += 24 * 60;
    }

    const diff = Math.abs(actualTotalMin - targetTotalMin);
    return diff <= consistencyMinutes;
  } catch (error) {
    console.error('Error calculating bedtime difference:', error);
    return false;
  }
}

/**
 * Calculate sleep streak based on recent sleep logs
 */
export async function calculateSleepStreak(
  userId: string,
  targetBedtime: string,
  consistencyMinutes: number = 30
): Promise<SleepStreak> {
  try {
    // Get sleep streak data from storage
    const streakKey = `${SLEEP_STREAK_KEY}_${userId}`;
    const storedData = await AsyncStorage.getItem(streakKey);
    let streakData: SleepStreak = storedData
      ? JSON.parse(storedData)
      : {
          currentStreak: 0,
          longestStreak: 0,
          lastCheckDate: '',
          totalNightsOnTarget: 0,
          badgesEarned: [],
        };

    // Get last 30 days of sleep data
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data: sleepLogs } = await SleepService.getByDateRange(userId, startDate, endDate);

    if (!sleepLogs || sleepLogs.length === 0) {
      return streakData;
    }

    // Sort by date ascending
    const sortedLogs = sleepLogs.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate streak
    let currentStreak = 0;
    let tempStreak = 0;
    let maxStreak = streakData.longestStreak;
    let totalOnTarget = 0;

    for (let i = sortedLogs.length - 1; i >= 0; i--) {
      const log = sortedLogs[i];
      const onTarget = isBedtimeOnTarget(log.bedtime, targetBedtime, consistencyMinutes);

      if (onTarget) {
        totalOnTarget++;
        tempStreak++;
        if (tempStreak > maxStreak) {
          maxStreak = tempStreak;
        }
      } else {
        // Streak broken
        if (tempStreak > 0 && currentStreak === 0) {
          currentStreak = tempStreak;
        }
        tempStreak = 0;
      }
    }

    // If still have an active streak
    if (tempStreak > 0) {
      currentStreak = tempStreak;
    }

    // Check for new badges
    const newBadges: string[] = [];
    const previousStreak = streakData.currentStreak;
    
    SLEEP_BADGES.forEach(badge => {
      if (!streakData.badgesEarned.includes(badge.id)) {
        if (badge.type === 'streak' && currentStreak >= badge.requirement) {
          newBadges.push(badge.id);
        } else if (badge.type === 'total' && totalOnTarget >= badge.requirement) {
          newBadges.push(badge.id);
        }
      }
    });

    // Award points for streak milestones (3, 7, 14, 30 days)
    const milestones = [3, 7, 14, 30];
    for (const milestone of milestones) {
      if (currentStreak >= milestone && previousStreak < milestone) {
        await RewardsService.awardPoints(
          userId,
          'sleep',
          `streak_${milestone}`,
          POINT_VALUES.SLEEP_STREAK_MILESTONE,
          `Reached ${milestone}-day sleep streak!`
        );
      }
    }

    // Award points for new badges
    for (const badgeId of newBadges) {
      const badge = SLEEP_BADGES.find(b => b.id === badgeId);
      if (badge) {
        await RewardsService.awardPoints(
          userId,
          'sleep',
          `badge_${badgeId}`,
          50,
          `Earned badge: ${badge.name}`
        );
      }
    }

    // Update streak data
    const updatedStreak: SleepStreak = {
      currentStreak,
      longestStreak: maxStreak,
      lastCheckDate: endDate,
      totalNightsOnTarget: Math.max(totalOnTarget, streakData.totalNightsOnTarget),
      badgesEarned: [...streakData.badgesEarned, ...newBadges],
    };

    // Save updated streak data
    await AsyncStorage.setItem(streakKey, JSON.stringify(updatedStreak));

    return updatedStreak;
  } catch (error) {
    console.error('Error calculating sleep streak:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastCheckDate: '',
      totalNightsOnTarget: 0,
      badgesEarned: [],
    };
  }
}

/**
 * Get points for sleep achievements (for cross-module reward system)
 */
export function getSleepPoints(streak: SleepStreak): number {
  let points = 0;

  // Points for current streak
  points += streak.currentStreak * 10;

  // Bonus points for badges
  points += streak.badgesEarned.length * 50;

  // Points for total nights on target
  points += streak.totalNightsOnTarget * 5;

  return points;
}

/**
 * Get earned badges
 */
export function getEarnedBadges(badgeIds: string[]): BadgeDefinition[] {
  return SLEEP_BADGES.filter(badge => badgeIds.includes(badge.id));
}
