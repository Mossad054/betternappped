import { SupabaseSafe } from '@/lib/supabaseSafe';

// Test user ID for all tests
export const TEST_USER_ID = 'test-user-12345';

// Test data factories
export const createTestMoodLog = (overrides: any = {}) => ({
  date: '2024-01-15',
  moods: ['happy', 'energetic'],
  triggers: { weather: 'sunny', activity: 'exercise' },
  score: 4,
  emoji: '😊',
  notes: 'Feeling great today!',
  ...overrides,
});

export const createTestActivity = (overrides: any = {}) => ({
  date: '2024-01-15',
  category: 'Exercise',
  name: 'Morning Run',
  duration: 30,
  emoji: '🏃‍♂️',
  follow_up_answer: 'Felt energized',
  ...overrides,
});

export const createTestSleepLog = (overrides: any = {}) => ({
  date: '2024-01-15',
  bedtime: '22:30:00',
  wake_time: '06:30:00',
  hours: 8.0,
  quality: 4,
  waking_feeling: 'refreshed',
  ...overrides,
});

export const createTestHabit = (overrides: any = {}) => ({
  name: 'Daily Meditation',
  description: '10 minutes of mindfulness',
  category: 'Wellness',
  total_days: 30,
  streak: 5,
  reminder_enabled: true,
  reminder_time: '08:00:00',
  quote: 'Mindfulness is the key to inner peace',
  ...overrides,
});

export const createTestExperiment = (overrides: any = {}) => ({
  activity_name: 'Cold Shower Challenge',
  activity_emoji: '🚿',
  outcomes: ['energy', 'mood', 'discipline'],
  start_date: '2024-01-01',
  end_date: '2024-01-30',
  duration: 30,
  status: 'active',
  current_day: 15,
  baseline_data: { energy: 3, mood: 3 },
  results_data: { energy: 4, mood: 4 },
  insights: 'Cold showers are working!',
  ...overrides,
});

export const createTestProductivityLog = (overrides: any = {}) => ({
  date: '2024-01-15',
  rating: 4,
  focused_hours: 6.5,
  factors: ['good_sleep', 'exercise', 'healthy_meals'],
  other_factor: 'Clear goals for the day',
  ...overrides,
});

export const createTestIntimacyLog = (overrides: any = {}) => ({
  date: '2024-01-15',
  type: 'solo',
  orgasm: true,
  location: 'bedroom',
  toy_used: false,
  time_to_sleep: 15,
  mood_before: 3,
  mood_after: 5,
  ...overrides,
});

export const createTestMentalClarityTest = (overrides: any = {}) => ({
  date: '2024-01-15',
  score: 4,
  factors: ['good_sleep', 'meditation', 'exercise'],
  ...overrides,
});

// Database cleanup helpers
export const cleanupTestData = async () => {
  const tables = [
    'mental_clarity_tests',
    'intimacy_logs', 
    'productivity_logs',
    'experiment_logs',
    'experiments',
    'habit_logs',
    'habits',
    'sleep_logs',
    'activities',
    'mood_logs',
    'users'
  ];

  for (const table of tables) {
    try {
      await SupabaseSafe.delete(table, TEST_USER_ID, TEST_USER_ID);
    } catch (error) {
      // Ignore errors during cleanup
      console.log(`Cleanup warning for ${table}:`, error);
    }
  }
};

// Authentication helpers
export const createTestUser = async () => {
  try {
    const result = await SupabaseSafe.insert('users', {
      id: TEST_USER_ID,
      email: 'test@example.com',
      metadata: { testUser: true }
    }, TEST_USER_ID);
    return result;
  } catch (error) {
    // User might already exist, which is fine
    return { success: true, data: null };
  }
};

// Test assertion helpers
export const expectSuccess = (result: any) => {
  expect(result.success).toBe(true);
  expect(result.error).toBeUndefined();
};

export const expectError = (result: any) => {
  expect(result.success).toBe(false);
  expect(result.error).toBeDefined();
};

// UUID generator for tests
export const generateTestId = () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Date helpers
export const getTestDate = (daysOffset: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

export const getTestDateRange = (startDaysOffset: number, endDaysOffset: number) => {
  return {
    startDate: getTestDate(startDaysOffset),
    endDate: getTestDate(endDaysOffset)
  };
};