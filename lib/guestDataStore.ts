import AsyncStorage from '@react-native-async-storage/async-storage';

// Guest data storage keys
const GUEST_DATA_KEYS = {
  habits: '@guest_habits',
  moods: '@guest_moods',
  sleep: '@guest_sleep',
  activities: '@guest_activities',
  experiments: '@guest_experiments',
  productivity: '@guest_productivity',
  intimacy: '@guest_intimacy',
  mentalClarity: '@guest_mental_clarity',
} as const;

// Generate a consistent guest user ID
const GUEST_USER_ID = 'guest_user';

// Check if we're in guest mode
export const isGuestMode = async (): Promise<boolean> => {
  try {
    const guestMode = await AsyncStorage.getItem('guest_mode');
    return guestMode === 'true';
  } catch (error) {
    console.error('Error checking guest mode:', error);
    return false;
  }
};

// Generic CRUD operations for guest data
class GuestDataStore {
  private async getData<T>(key: string): Promise<T[]> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error getting guest data for ${key}:`, error);
      return [];
    }
  }

  private async setData<T>(key: string, data: T[]): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error setting guest data for ${key}:`, error);
    }
  }

  // Generic getAll method
  async getAll<T>(tableName: keyof typeof GUEST_DATA_KEYS): Promise<{ data: T[] | null; error: any }> {
    try {
      const data = await this.getData<T>(GUEST_DATA_KEYS[tableName]);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Generic create method
  async create<T extends { id?: string }>(tableName: keyof typeof GUEST_DATA_KEYS, item: T): Promise<{ data: T | null; error: any }> {
    try {
      const data = await this.getData<T>(GUEST_DATA_KEYS[tableName]);
      const newItem = {
        ...item,
        id: item.id || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: GUEST_USER_ID,
        created_at: new Date().toISOString(),
      };
      
      data.push(newItem);
      await this.setData(GUEST_DATA_KEYS[tableName], data);
      
      return { data: newItem, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Generic getById method
  async getById<T>(tableName: keyof typeof GUEST_DATA_KEYS, id: string): Promise<{ data: T | null; error: any }> {
    try {
      const data = await this.getData<T>(GUEST_DATA_KEYS[tableName]);
      const item = data.find((item: any) => item.id === id);
      return { data: item || null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Generic update method
  async update<T extends { id: string }>(tableName: keyof typeof GUEST_DATA_KEYS, id: string, updates: Partial<T>): Promise<{ data: T | null; error: any }> {
    try {
      const data = await this.getData<T>(GUEST_DATA_KEYS[tableName]);
      const index = data.findIndex((item: any) => item.id === id);
      
      if (index === -1) {
        return { data: null, error: 'Item not found' };
      }
      
      data[index] = { ...data[index], ...updates };
      await this.setData(GUEST_DATA_KEYS[tableName], data);
      
      return { data: data[index], error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Generic delete method
  async delete(tableName: keyof typeof GUEST_DATA_KEYS, id: string): Promise<{ error: any }> {
    try {
      const data = await this.getData(GUEST_DATA_KEYS[tableName]);
      const filteredData = data.filter((item: any) => item.id !== id);
      await this.setData(GUEST_DATA_KEYS[tableName], filteredData);
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Date range queries
  async getByDateRange<T>(tableName: keyof typeof GUEST_DATA_KEYS, startDate: string, endDate: string): Promise<{ data: T[] | null; error: any }> {
    try {
      const data = await this.getData<T>(GUEST_DATA_KEYS[tableName]);
      const filteredData = data.filter((item: any) => {
        const itemDate = item.date;
        return itemDate >= startDate && itemDate <= endDate;
      });
      
      return { data: filteredData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Get by specific date
  async getByDate<T>(tableName: keyof typeof GUEST_DATA_KEYS, date: string): Promise<{ data: T | null; error: any }> {
    try {
      const data = await this.getData<T>(GUEST_DATA_KEYS[tableName]);
      const item = data.find((item: any) => item.date === date);
      return { data: item || null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Initialize with sample data for demo purposes
  async initializeSampleData(): Promise<void> {
    try {
      // Check if data already exists
      const existingHabits = await this.getData(GUEST_DATA_KEYS.habits);
      if (existingHabits.length > 0) {
        return; // Data already initialized
      }

      // Sample habits
      const sampleHabits = [
        {
          id: 'guest_habit_1',
          user_id: GUEST_USER_ID,
          name: 'Morning Meditation',
          description: 'Start your day with 10 minutes of mindfulness',
          category: 'MentalClarity',
          instruction: 'Find a quiet space and focus on your breathing',
          emoji: '🧘‍♀️',
          total_days: 30,
          streak: 7,
          streak_goal: 30,
          reminder_enabled: true,
          reminder_time: '07:00',
          quote: 'Peace comes from within. Do not seek it without.',
          created_at: new Date().toISOString(),
        },
        {
          id: 'guest_habit_2',
          user_id: GUEST_USER_ID,
          name: 'Evening Walk',
          description: 'Take a 20-minute walk to unwind',
          category: 'Health',
          instruction: 'Walk at a comfortable pace, enjoy the surroundings',
          emoji: '🚶‍♂️',
          total_days: 30,
          streak: 5,
          streak_goal: 30,
          reminder_enabled: true,
          reminder_time: '18:00',
          quote: 'Walking is the best possible exercise.',
          created_at: new Date().toISOString(),
        },
      ];

      // Sample mood logs (last 7 days)
      const sampleMoods = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        sampleMoods.push({
          id: `guest_mood_${i}`,
          user_id: GUEST_USER_ID,
          date: dateStr,
          moods: ['Happy', 'Energetic'],
          triggers: {},
          score: Math.floor(Math.random() * 2) + 4, // 4-5 range
          emoji: ['😊', '😄', '🤗'][Math.floor(Math.random() * 3)],
          notes: i === 0 ? 'Feeling great today!' : null,
          created_at: new Date().toISOString(),
        });
      }

      // Sample sleep logs (last 7 days)
      const sampleSleep = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        sampleSleep.push({
          id: `guest_sleep_${i}`,
          user_id: GUEST_USER_ID,
          date: dateStr,
          bedtime: '22:30',
          wake_time: '07:00',
          hours: 7.5 + (Math.random() * 1.5), // 7.5-9 hours
          quality: Math.floor(Math.random() * 2) + 4, // 4-5 range
          waking_feeling: ['refreshed', 'energetic', 'rested'][Math.floor(Math.random() * 3)],
          created_at: new Date().toISOString(),
        });
      }

      // Sample activities (last 7 days)
      const sampleActivities = [];
      const activityCategories = ['exercise', 'social', 'work', 'hobbies', 'relaxation', 'outdoor'];
      const activityNames = {
        exercise: ['Morning Run', 'Gym Workout', 'Yoga Session'],
        social: ['Coffee with Friends', 'Dinner Party', 'Phone Call'],
        work: ['Team Meeting', 'Project Work', 'Email Review'],
        hobbies: ['Reading', 'Painting', 'Cooking'],
        relaxation: ['Meditation', 'Bath Time', 'Nature Walk'],
        outdoor: ['Beach Walk', 'Park Visit', 'Picnic'],
      };

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const category = activityCategories[Math.floor(Math.random() * activityCategories.length)];
        const names = activityNames[category as keyof typeof activityNames];
        const name = names[Math.floor(Math.random() * names.length)];
        
        sampleActivities.push({
          id: `guest_activity_${i}`,
          user_id: GUEST_USER_ID,
          date: dateStr,
          category,
          name,
          duration: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
          emoji: ['🏃‍♂️', '☕', '💼', '📚', '🧘‍♂️', '🌳'][Math.floor(Math.random() * 6)],
          follow_up_answer: Math.random() > 0.7 ? 'Great activity!' : null,
          created_at: new Date().toISOString(),
        });
      }

      // Store all sample data
      await this.setData(GUEST_DATA_KEYS.habits, sampleHabits);
      await this.setData(GUEST_DATA_KEYS.moods, sampleMoods);
      await this.setData(GUEST_DATA_KEYS.sleep, sampleSleep);
      await this.setData(GUEST_DATA_KEYS.activities, sampleActivities);
      await this.setData(GUEST_DATA_KEYS.experiments, []);
      await this.setData(GUEST_DATA_KEYS.productivity, []);
      await this.setData(GUEST_DATA_KEYS.intimacy, []);
      await this.setData(GUEST_DATA_KEYS.mentalClarity, []);

      console.log('✅ Guest sample data initialized');
    } catch (error) {
      console.error('Error initializing guest sample data:', error);
    }
  }

  // Clear all guest data
  async clearAllData(): Promise<void> {
    try {
      for (const key of Object.values(GUEST_DATA_KEYS)) {
        await AsyncStorage.removeItem(key);
      }
      console.log('✅ All guest data cleared');
    } catch (error) {
      console.error('Error clearing guest data:', error);
    }
  }
}

// Export singleton instance
export const guestDataStore = new GuestDataStore();

// Initialize sample data when in guest mode
export const initializeGuestData = async (): Promise<void> => {
  if (await isGuestMode()) {
    await guestDataStore.initializeSampleData();
  }
};



