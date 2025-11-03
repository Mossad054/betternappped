import { SleepService } from '@/services/sleep.service';
import { 
  TEST_USER_ID, 
  createTestSleepLog, 
  cleanupTestData, 
  createTestUser,
  expectSuccess,
  expectError,
  getTestDate
} from '../utils/testHelpers';

describe('SleepService', () => {
  beforeAll(async () => {
    await cleanupTestData();
    await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Create Operations', () => {
    it('should create a new sleep log', async () => {
      const sleepData = createTestSleepLog();
      const result = await SleepService.create(sleepData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data).toBeDefined();
      expect(result.data?.hours).toBe(sleepData.hours);
      expect(result.data?.quality).toBe(sleepData.quality);
      expect(result.data?.user_id).toBe(TEST_USER_ID);
    });

    it('should handle validation errors for invalid quality', async () => {
      const invalidData = createTestSleepLog({ quality: 6 }); // Quality should be 1-5
      const result = await SleepService.create(invalidData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });

    it('should handle validation errors for invalid hours', async () => {
      const invalidData = createTestSleepLog({ hours: -1 }); // Hours should be positive
      const result = await SleepService.create(invalidData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });
  });

  describe('Read Operations', () => {
    let testSleepId: string;

    beforeAll(async () => {
      const sleepData = createTestSleepLog({ 
        date: '2024-01-16',
        hours: 7.5,
        quality: 4
      });
      const result = await SleepService.create(sleepData, TEST_USER_ID);
      testSleepId = result.data?.id || '';
    });

    it('should get all sleep logs', async () => {
      const result = await SleepService.getAll(TEST_USER_ID);
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
    });

    it('should get sleep log by ID', async () => {
      const result = await SleepService.getById(testSleepId, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.id).toBe(testSleepId);
      expect(result.data?.hours).toBe(7.5);
    });

    it('should get sleep log by date', async () => {
      const testDate = '2024-01-16';
      const result = await SleepService.getByDate(TEST_USER_ID, testDate);
      
      expectSuccess(result);
      expect(result.data?.date).toBe(testDate);
    });

    it('should get sleep logs by date range', async () => {
      const result = await SleepService.getByDateRange(TEST_USER_ID, '2024-01-01', '2024-01-31');
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return null for non-existent sleep log', async () => {
      const fakeId = 'non-existent-id';
      const result = await SleepService.getById(fakeId, TEST_USER_ID);
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('Update Operations', () => {
    let testSleepId: string;

    beforeAll(async () => {
      const sleepData = createTestSleepLog({ 
        date: '2024-01-17',
        hours: 6.0,
        quality: 3
      });
      const result = await SleepService.create(sleepData, TEST_USER_ID);
      testSleepId = result.data?.id || '';
    });

    it('should update sleep log', async () => {
      const updateData = { 
        hours: 8.0,
        quality: 5,
        waking_feeling: 'refreshed and energized'
      };
      
      const result = await SleepService.update(testSleepId, updateData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.hours).toBe(8.0);
      expect(result.data?.quality).toBe(5);
      expect(result.data?.waking_feeling).toBe('refreshed and energized');
    });

    it('should handle update with non-existent ID', async () => {
      const fakeId = 'non-existent-id';
      const updateData = { quality: 4 };
      
      const result = await SleepService.update(fakeId, updateData, TEST_USER_ID);
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('Delete Operations', () => {
    let testSleepId: string;

    beforeAll(async () => {
      const sleepData = createTestSleepLog({ 
        date: '2024-01-18',
        hours: 5.5,
        quality: 2
      });
      const result = await SleepService.create(sleepData, TEST_USER_ID);
      testSleepId = result.data?.id || '';
    });

    it('should delete sleep log by ID', async () => {
      const result = await SleepService.delete(testSleepId, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.error).toBeUndefined();
    });

    it('should handle delete with non-existent ID', async () => {
      const fakeId = 'non-existent-id';
      const result = await SleepService.delete(fakeId, TEST_USER_ID);
      
      expect(result).toHaveProperty('error');
    });
  });

  describe('Upsert Operations', () => {
    it('should create new sleep log when none exists for date', async () => {
      const testDate = '2024-01-19';
      const sleepData = createTestSleepLog({ 
        date: testDate,
        hours: 7.0,
        quality: 4
      });
      
      const result = await SleepService.upsert(sleepData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.date).toBe(testDate);
      expect(result.data?.hours).toBe(7.0);
    });

    it('should update existing sleep log when one exists for date', async () => {
      const testDate = '2024-01-20';
      
      // Create initial sleep log
      const initialData = createTestSleepLog({ 
        date: testDate,
        hours: 6.0,
        quality: 3
      });
      await SleepService.create(initialData, TEST_USER_ID);
      
      // Upsert with updated data
      const updateData = createTestSleepLog({ 
        date: testDate,
        hours: 8.0,
        quality: 5,
        waking_feeling: 'amazing!'
      });
      
      const result = await SleepService.upsert(updateData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.date).toBe(testDate);
      expect(result.data?.hours).toBe(8.0);
      expect(result.data?.quality).toBe(5);
    });
  });

  describe('Analytics Operations', () => {
    beforeAll(async () => {
      // Create some test data for analytics
      const sleepLogs = [
        createTestSleepLog({ date: '2024-01-21', hours: 7.5, quality: 4 }),
        createTestSleepLog({ date: '2024-01-22', hours: 8.0, quality: 5 }),
        createTestSleepLog({ date: '2024-01-23', hours: 6.5, quality: 3 }),
        createTestSleepLog({ date: '2024-01-24', hours: 7.0, quality: 4 }),
        createTestSleepLog({ date: '2024-01-25', hours: 8.5, quality: 5 })
      ];

      for (const sleepLog of sleepLogs) {
        await SleepService.create(sleepLog, TEST_USER_ID);
      }
    });

    it('should calculate average hours', async () => {
      const result = await SleepService.getAverageHours(TEST_USER_ID, 5);
      
      expectSuccess(result);
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('number');
      expect(result.data).toBeGreaterThan(0);
    });

    it('should get quality trend', async () => {
      const result = await SleepService.getQualityTrend(TEST_USER_ID, 5);
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBe(5);
      expect(result.data?.every(quality => quality >= 1 && quality <= 5)).toBe(true);
    });

    it('should handle empty data for analytics', async () => {
      // Test with a user that has no sleep data
      const emptyUserId = 'empty-user-id';
      
      const avgResult = await SleepService.getAverageHours(emptyUserId, 7);
      expect(avgResult.data).toBeNull();
      expect(avgResult.error).toBeNull();
      
      const trendResult = await SleepService.getQualityTrend(emptyUserId, 7);
      expect(trendResult.data).toEqual([]);
      expect(trendResult.error).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user ID', async () => {
      const sleepData = createTestSleepLog();
      const result = await SleepService.create(sleepData, '');
      
      expect(result.error).toBeDefined();
    });

    it('should handle malformed time data', async () => {
      const malformedData = createTestSleepLog({
        bedtime: 'invalid-time',
        wake_time: 'also-invalid'
      });
      
      const result = await SleepService.create(malformedData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });

    it('should handle duplicate date constraint', async () => {
      const testDate = '2024-01-26';
      const sleepData1 = createTestSleepLog({ date: testDate, hours: 7.0 });
      const sleepData2 = createTestSleepLog({ date: testDate, hours: 8.0 });
      
      // First creation should succeed
      const result1 = await SleepService.create(sleepData1, TEST_USER_ID);
      expectSuccess(result1);
      
      // Second creation with same date should fail due to unique constraint
      const result2 = await SleepService.create(sleepData2, TEST_USER_ID);
      expect(result2.error).toBeDefined();
    });
  });
});