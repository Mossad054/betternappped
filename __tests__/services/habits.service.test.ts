import { HabitsService } from '@/services/habits.service';
import { 
  TEST_USER_ID, 
  createTestHabit, 
  cleanupTestData, 
  createTestUser,
  expectSuccess,
  expectError,
  getTestDate
} from '../utils/testHelpers';

describe('HabitsService', () => {
  beforeAll(async () => {
    await cleanupTestData();
    await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Habit CRUD Operations', () => {
    describe('Create Operations', () => {
      it('should create a new habit', async () => {
        const habitData = createTestHabit();
        const result = await HabitsService.create(habitData, TEST_USER_ID);
        
        expectSuccess(result);
        expect(result.data).toBeDefined();
        expect(result.data?.name).toBe(habitData.name);
        expect(result.data?.category).toBe(habitData.category);
        expect(result.data?.user_id).toBe(TEST_USER_ID);
      });

      it('should handle validation errors for missing required fields', async () => {
        const invalidData = createTestHabit({ name: '', description: '' });
        const result = await HabitsService.create(invalidData, TEST_USER_ID);
        
        expect(result.error).toBeDefined();
      });
    });

    describe('Read Operations', () => {
      let testHabitId: string;

      beforeAll(async () => {
        const habitData = createTestHabit({ 
          name: 'Test Habit for Reading',
          category: 'Health'
        });
        const result = await HabitsService.create(habitData, TEST_USER_ID);
        testHabitId = result.data?.id || '';
      });

      it('should get all habits', async () => {
        const result = await HabitsService.getAll(TEST_USER_ID);
        
        expectSuccess(result);
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data?.length).toBeGreaterThan(0);
      });

      it('should get habit by ID', async () => {
        const result = await HabitsService.getById(testHabitId, TEST_USER_ID);
        
        expectSuccess(result);
        expect(result.data?.id).toBe(testHabitId);
        expect(result.data?.name).toBe('Test Habit for Reading');
      });

      it('should return null for non-existent habit', async () => {
        const fakeId = 'non-existent-id';
        const result = await HabitsService.getById(fakeId, TEST_USER_ID);
        
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
      });
    });

    describe('Update Operations', () => {
      let testHabitId: string;

      beforeAll(async () => {
        const habitData = createTestHabit({ 
          name: 'Test Habit for Update',
          streak: 0
        });
        const result = await HabitsService.create(habitData, TEST_USER_ID);
        testHabitId = result.data?.id || '';
      });

      it('should update habit', async () => {
        const updateData = { 
          name: 'Updated Habit Name',
          streak: 5,
          reminder_enabled: true
        };
        
        const result = await HabitsService.update(testHabitId, updateData, TEST_USER_ID);
        
        expectSuccess(result);
        expect(result.data?.name).toBe('Updated Habit Name');
        expect(result.data?.streak).toBe(5);
        expect(result.data?.reminder_enabled).toBe(true);
      });

      it('should handle update with non-existent ID', async () => {
        const fakeId = 'non-existent-id';
        const updateData = { name: 'This should fail' };
        
        const result = await HabitsService.update(fakeId, updateData, TEST_USER_ID);
        
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
      });
    });

    describe('Delete Operations', () => {
      let testHabitId: string;

      beforeAll(async () => {
        const habitData = createTestHabit({ 
          name: 'Test Habit for Delete',
          category: 'Productivity'
        });
        const result = await HabitsService.create(habitData, TEST_USER_ID);
        testHabitId = result.data?.id || '';
      });

      it('should delete habit by ID', async () => {
        const result = await HabitsService.delete(testHabitId, TEST_USER_ID);
        
        expectSuccess(result);
        expect(result.error).toBeUndefined();
      });

      it('should handle delete with non-existent ID', async () => {
        const fakeId = 'non-existent-id';
        const result = await HabitsService.delete(fakeId, TEST_USER_ID);
        
        expect(result).toHaveProperty('error');
      });
    });
  });

  describe('Habit Log Operations', () => {
    let testHabitId: string;

    beforeAll(async () => {
      const habitData = createTestHabit({ 
        name: 'Test Habit for Logging',
        category: 'Wellness'
      });
      const result = await HabitsService.create(habitData, TEST_USER_ID);
      testHabitId = result.data?.id || '';
    });

    describe('Log Habit', () => {
      it('should log habit completion', async () => {
        const logData = {
          date: '2024-01-15',
          completed: true,
          feedback: 'good' as const
        };
        
        const result = await HabitsService.logHabit(testHabitId, logData, TEST_USER_ID);
        
        expectSuccess(result);
        expect(result.data?.completed).toBe(true);
        expect(result.data?.feedback).toBe('good');
        expect(result.data?.habit_id).toBe(testHabitId);
      });

      it('should log habit skip', async () => {
        const logData = {
          date: '2024-01-16',
          completed: false,
          feedback: 'bad' as const
        };
        
        const result = await HabitsService.logHabit(testHabitId, logData, TEST_USER_ID);
        
        expectSuccess(result);
        expect(result.data?.completed).toBe(false);
        expect(result.data?.feedback).toBe('bad');
      });

      it('should handle validation errors for invalid feedback', async () => {
        const invalidData = {
          date: '2024-01-17',
          completed: true,
          feedback: 'invalid' as any
        };
        
        const result = await HabitsService.logHabit(testHabitId, invalidData, TEST_USER_ID);
        
        expect(result.error).toBeDefined();
      });
    });

    describe('Get Habit Logs', () => {
      beforeAll(async () => {
        // Create some habit logs
        const logData1 = { date: '2024-01-18', completed: true, feedback: 'good' as const };
        const logData2 = { date: '2024-01-19', completed: false, feedback: 'neutral' as const };
        const logData3 = { date: '2024-01-20', completed: true, feedback: 'good' as const };
        
        await HabitsService.logHabit(testHabitId, logData1, TEST_USER_ID);
        await HabitsService.logHabit(testHabitId, logData2, TEST_USER_ID);
        await HabitsService.logHabit(testHabitId, logData3, TEST_USER_ID);
      });

      it('should get all habit logs for a habit', async () => {
        const result = await HabitsService.getHabitLogs(testHabitId, TEST_USER_ID);
        
        expectSuccess(result);
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data?.length).toBeGreaterThan(0);
      });

      it('should get habit log by date', async () => {
        const testDate = '2024-01-18';
        const result = await HabitsService.getHabitLogByDate(testHabitId, testDate, TEST_USER_ID);
        
        expectSuccess(result);
        expect(result.data?.date).toBe(testDate);
      });

      it('should return null for non-existent habit log', async () => {
        const fakeHabitId = 'non-existent-habit-id';
        const result = await HabitsService.getHabitLogs(fakeHabitId, TEST_USER_ID);
        
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data?.length).toBe(0);
      });
    });

    describe('Habits with Logs', () => {
      it('should get habits with their logs', async () => {
        const result = await HabitsService.getHabitsWithLogs(TEST_USER_ID);
        
        expectSuccess(result);
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data?.length).toBeGreaterThan(0);
        
        // Check that each habit has habit_logs property
        result.data?.forEach(habit => {
          expect(habit).toHaveProperty('habit_logs');
          expect(Array.isArray(habit.habit_logs)).toBe(true);
        });
      });

      it('should get habits with logs for specific date', async () => {
        const testDate = '2024-01-19';
        const result = await HabitsService.getHabitsWithLogs(TEST_USER_ID, testDate);
        
        expectSuccess(result);
        expect(Array.isArray(result.data)).toBe(true);
      });
    });
  });

  describe('Analytics Operations', () => {
    let testHabitId: string;

    beforeAll(async () => {
      const habitData = createTestHabit({ 
        name: 'Test Habit for Analytics',
        category: 'Health'
      });
      const result = await HabitsService.create(habitData, TEST_USER_ID);
      testHabitId = result.data?.id || '';

      // Create some habit logs for analytics
      const logData = [
        { date: '2024-01-21', completed: true, feedback: 'good' as const },
        { date: '2024-01-22', completed: true, feedback: 'good' as const },
        { date: '2024-01-23', completed: false, feedback: 'bad' as const },
        { date: '2024-01-24', completed: true, feedback: 'good' as const },
        { date: '2024-01-25', completed: true, feedback: 'good' as const }
      ];

      for (const log of logData) {
        await HabitsService.logHabit(testHabitId, log, TEST_USER_ID);
      }
    });

    it('should calculate habit completion rate', async () => {
      const result = await HabitsService.getHabitCompletionRate(testHabitId, TEST_USER_ID, 5);
      
      expectSuccess(result);
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('number');
      expect(result.data).toBeGreaterThanOrEqual(0);
      expect(result.data).toBeLessThanOrEqual(100);
    });

    it('should handle empty data for completion rate', async () => {
      const emptyHabitId = 'empty-habit-id';
      const result = await HabitsService.getHabitCompletionRate(emptyHabitId, TEST_USER_ID, 30);
      
      expectSuccess(result);
      expect(result.data).toBe(0);
    });
  });

  describe('Streak Management', () => {
    let testHabitId: string;

    beforeAll(async () => {
      const habitData = createTestHabit({ 
        name: 'Test Habit for Streak',
        category: 'Productivity',
        streak: 0
      });
      const result = await HabitsService.create(habitData, TEST_USER_ID);
      testHabitId = result.data?.id || '';
    });

    it('should update habit streak when logging completion', async () => {
      // Log a completed habit
      const logData = {
        date: '2024-01-26',
        completed: true,
        feedback: 'good' as const
      };
      
      const result = await HabitsService.logHabit(testHabitId, logData, TEST_USER_ID);
      
      expectSuccess(result);
      
      // Check that the habit streak was updated
      const habitResult = await HabitsService.getById(testHabitId, TEST_USER_ID);
      expectSuccess(habitResult);
      expect(habitResult.data?.streak).toBeGreaterThan(0);
    });

    it('should update habit streak manually', async () => {
      const result = await HabitsService.updateHabitStreak(testHabitId, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user ID', async () => {
      const habitData = createTestHabit();
      const result = await HabitsService.create(habitData, '');
      
      expect(result.error).toBeDefined();
    });

    it('should handle malformed data', async () => {
      const malformedData = {
        name: null as any,
        description: undefined as any,
        category: '',
        total_days: 'not-a-number' as any
      };
      
      const result = await HabitsService.create(malformedData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });

    it('should handle duplicate habit log for same date', async () => {
      const habitData = createTestHabit({ name: 'Duplicate Test Habit' });
      const habitResult = await HabitsService.create(habitData, TEST_USER_ID);
      const habitId = habitResult.data?.id || '';

      const testDate = '2024-01-27';
      const logData = { date: testDate, completed: true, feedback: 'good' as const };
      
      // First log should succeed
      const result1 = await HabitsService.logHabit(habitId, logData, TEST_USER_ID);
      expectSuccess(result1);
      
      // Second log with same date should fail due to unique constraint
      const result2 = await HabitsService.logHabit(habitId, logData, TEST_USER_ID);
      expect(result2.error).toBeDefined();
    });
  });
});