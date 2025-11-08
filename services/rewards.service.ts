// Rewards Service - Cross-Module Points System
import AsyncStorage from '@react-native-async-storage/async-storage';

const REWARDS_KEY = 'user_rewards';
const REWARDS_HISTORY_KEY = 'rewards_history';

export interface RewardEvent {
  id: string;
  module: 'sleep' | 'habit' | 'activity' | 'experiment' | 'intimacy' | 'mental_clarity';
  action: string;
  points: number;
  timestamp: string;
  description: string;
}

export interface UserRewards {
  totalPoints: number;
  level: number;
  currentLevelPoints: number;
  pointsToNextLevel: number;
  badges: string[];
  modules: {
    sleep: number;
    habit: number;
    activity: number;
    experiment: number;
    intimacy: number;
    mental_clarity: number;
  };
}

// Points needed for each level (exponential growth)
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  1750,   // Level 6
  2750,   // Level 7
  4000,   // Level 8
  5500,   // Level 9
  7500,   // Level 10
  10000,  // Level 11
  13000,  // Level 12
  16500,  // Level 13
  20500,  // Level 14
  25000,  // Level 15+
];

export class RewardsService {
  /**
   * Get user's current rewards data
   */
  static async getUserRewards(userId: string): Promise<UserRewards> {
    try {
      const key = `${REWARDS_KEY}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      
      if (data) {
        return JSON.parse(data);
      }

      // Initialize new user rewards
      const initialRewards: UserRewards = {
        totalPoints: 0,
        level: 1,
        currentLevelPoints: 0,
        pointsToNextLevel: LEVEL_THRESHOLDS[1],
        badges: [],
        modules: {
          sleep: 0,
          habit: 0,
          activity: 0,
          experiment: 0,
          intimacy: 0,
          mental_clarity: 0,
        },
      };

      await AsyncStorage.setItem(key, JSON.stringify(initialRewards));
      return initialRewards;
    } catch (error) {
      console.error('Error getting user rewards:', error);
      throw error;
    }
  }

  /**
   * Award points for an action
   */
  static async awardPoints(
    userId: string,
    module: RewardEvent['module'],
    action: string,
    points: number,
    description: string
  ): Promise<UserRewards> {
    try {
      const rewards = await this.getUserRewards(userId);

      // Update points
      rewards.totalPoints += points;
      rewards.modules[module] += points;

      // Calculate level
      const newLevel = this.calculateLevel(rewards.totalPoints);
      const leveledUp = newLevel > rewards.level;
      rewards.level = newLevel;

      // Calculate progress to next level
      const currentLevelThreshold = LEVEL_THRESHOLDS[newLevel - 1] || 0;
      const nextLevelThreshold = LEVEL_THRESHOLDS[newLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 5000;
      
      rewards.currentLevelPoints = rewards.totalPoints - currentLevelThreshold;
      rewards.pointsToNextLevel = nextLevelThreshold - rewards.totalPoints;

      // Save rewards
      const key = `${REWARDS_KEY}_${userId}`;
      await AsyncStorage.setItem(key, JSON.stringify(rewards));

      // Log event to history
      const event: RewardEvent = {
        id: Date.now().toString(),
        module,
        action,
        points,
        timestamp: new Date().toISOString(),
        description,
      };
      await this.addToHistory(userId, event);

      // If leveled up, could trigger a celebration here
      if (leveledUp) {
        console.log(`🎉 User leveled up to level ${newLevel}!`);
      }

      return rewards;
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  /**
   * Calculate level based on total points
   */
  static calculateLevel(totalPoints: number): number {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalPoints >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * Add event to history
   */
  static async addToHistory(userId: string, event: RewardEvent): Promise<void> {
    try {
      const key = `${REWARDS_HISTORY_KEY}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      const history: RewardEvent[] = data ? JSON.parse(data) : [];
      
      history.unshift(event); // Add to beginning
      
      // Keep only last 100 events
      if (history.length > 100) {
        history.splice(100);
      }
      
      await AsyncStorage.setItem(key, JSON.stringify(history));
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  }

  /**
   * Get recent reward events
   */
  static async getHistory(userId: string, limit: number = 20): Promise<RewardEvent[]> {
    try {
      const key = `${REWARDS_HISTORY_KEY}_${userId}`;
      const data = await AsyncStorage.getItem(key);
      const history: RewardEvent[] = data ? JSON.parse(data) : [];
      
      return history.slice(0, limit);
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  }

  /**
   * Award badge
   */
  static async awardBadge(userId: string, badgeId: string): Promise<void> {
    try {
      const rewards = await this.getUserRewards(userId);
      
      if (!rewards.badges.includes(badgeId)) {
        rewards.badges.push(badgeId);
        
        const key = `${REWARDS_KEY}_${userId}`;
        await AsyncStorage.setItem(key, JSON.stringify(rewards));
      }
    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  }

  /**
   * Get points breakdown by module
   */
  static async getModuleBreakdown(userId: string): Promise<{ module: string; points: number; percentage: number }[]> {
    try {
      const rewards = await this.getUserRewards(userId);
      const total = rewards.totalPoints;
      
      if (total === 0) {
        return [];
      }

      return Object.entries(rewards.modules)
        .map(([module, points]) => ({
          module: module.charAt(0).toUpperCase() + module.slice(1).replace('_', ' '),
          points,
          percentage: Math.round((points / total) * 100),
        }))
        .filter(item => item.points > 0)
        .sort((a, b) => b.points - a.points);
    } catch (error) {
      console.error('Error getting module breakdown:', error);
      return [];
    }
  }
}

// Predefined point values for common actions
export const POINT_VALUES = {
  // Sleep module
  SLEEP_WIND_DOWN_COMPLETE: 10,
  SLEEP_MORNING_CHECKIN: 15,
  SLEEP_ON_TARGET_BEDTIME: 20,
  SLEEP_STREAK_MILESTONE: 50, // 3, 7, 14, 30 days
  SLEEP_COACHING_TASK: 25,
  SLEEP_WEEK_COMPLETE: 100,
  
  // Habit module
  HABIT_LOGGED: 5,
  HABIT_STREAK_DAY: 10,
  HABIT_WEEK_COMPLETE: 50,
  HABIT_MONTH_COMPLETE: 200,
  
  // Activity module
  ACTIVITY_LOGGED: 10,
  ACTIVITY_IMPACT_RECORDED: 15,
  ACTIVITY_STREAK: 25,
  
  // Experiment module
  EXPERIMENT_STARTED: 30,
  EXPERIMENT_DAILY_LOG: 10,
  EXPERIMENT_COMPLETED: 100,
  EXPERIMENT_SHARED: 25,
  
  // Intimacy module
  INTIMACY_CHECK_IN: 15,
  INTIMACY_ACTIVITY_COMPLETED: 20,
  INTIMACY_MILESTONE: 50,
  
  // Mental Clarity module
  MENTAL_CLARITY_TEST: 20,
  MENTAL_CLARITY_EXERCISE: 15,
  MENTAL_CLARITY_STREAK: 30,
};
