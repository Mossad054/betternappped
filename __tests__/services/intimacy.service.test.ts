import { IntimacyService } from '@/services/intimacy.service';
import { 
  TEST_USER_ID, 
  createTestIntimacyLog, 
  cleanupTestData, 
  createTestUser,
  expectSuccess,
  expectError,
  getTestDate
} from '../utils/testHelpers';

describe('IntimacyService', () => {
  beforeAll(async () => {
    await cleanupTestData();
    await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Create Operations', () => {
    it('should create a new intimacy log', async () => {
      const intimacyData = createTestIntimacyLog();
      const result = await IntimacyService.create(intimacyData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data).toBeDefined();
      expect(result.data?.type).toBe(intimacyData.type);
      expect(result.data?.orgasm).toBe(intimacyData.orgasm);
      expect(result.data?.user_id).toBe(TEST_USER_ID);
    });

    it('should handle validation errors for invalid type', async () => {
      const invalidData = createTestIntimacyLog({ type: 'invalid-type' as any });
      const result = await IntimacyService.create(invalidData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });

    it('should handle validation errors for invalid mood scores', async () => {
      const invalidData = createTestIntimacyLog({ 
        mood_before: 6, // Should be 1-5
        mood_after: 0   // Should be 1-5
      });
      const result = await IntimacyService.create(invalidData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });
  });

  describe('Read Operations', () => {
    let testIntimacyId: string;

    beforeAll(async () => {
      const intimacyData = createTestIntimacyLog({ 
        date: '2024-01-16',
        type: 'couple',
        orgasm: true
      });
      const result = await IntimacyService.create(intimacyData, TEST_USER_ID);
      testIntimacyId = result.data?.id || '';
    });

    it('should get all intimacy logs', async () => {
      const result = await IntimacyService.getAll(TEST_USER_ID);
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
    });

    it('should get intimacy log by ID', async () => {
      const result = await IntimacyService.getById(testIntimacyId, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.id).toBe(testIntimacyId);
      expect(result.data?.type).toBe('couple');
    });

    it('should get intimacy log by date', async () => {
      const testDate = '2024-01-16';
      const result = await IntimacyService.getByDate(TEST_USER_ID, testDate);
      
      expectSuccess(result);
      expect(result.data?.date).toBe(testDate);
    });

    it('should get intimacy logs by date range', async () => {
      const result = await IntimacyService.getByDateRange(TEST_USER_ID, '2024-01-01', '2024-01-31');
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return null for non-existent intimacy log', async () => {
      const fakeId = 'non-existent-id';
      const result = await IntimacyService.getById(fakeId, TEST_USER_ID);
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('Update Operations', () => {
    let testIntimacyId: string;

    beforeAll(async () => {
      const intimacyData = createTestIntimacyLog({ 
        date: '2024-01-17',
        type: 'solo',
        orgasm: false
      });
      const result = await IntimacyService.create(intimacyData, TEST_USER_ID);
      testIntimacyId = result.data?.id || '';
    });

    it('should update intimacy log', async () => {
      const updateData = { 
        type: 'couple',
        orgasm: true,
        location: 'bedroom',
        toy_used: true,
        time_to_sleep: 30
      };
      
      const result = await IntimacyService.update(testIntimacyId, updateData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.type).toBe('couple');
      expect(result.data?.orgasm).toBe(true);
      expect(result.data?.location).toBe('bedroom');
      expect(result.data?.toy_used).toBe(true);
      expect(result.data?.time_to_sleep).toBe(30);
    });

    it('should handle update with non-existent ID', async () => {
      const fakeId = 'non-existent-id';
      const updateData = { orgasm: true };
      
      const result = await IntimacyService.update(fakeId, updateData, TEST_USER_ID);
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('Delete Operations', () => {
    let testIntimacyId: string;

    beforeAll(async () => {
      const intimacyData = createTestIntimacyLog({ 
        date: '2024-01-18',
        type: 'solo',
        orgasm: true
      });
      const result = await IntimacyService.create(intimacyData, TEST_USER_ID);
      testIntimacyId = result.data?.id || '';
    });

    it('should delete intimacy log by ID', async () => {
      const result = await IntimacyService.delete(testIntimacyId, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.error).toBeUndefined();
    });

    it('should handle delete with non-existent ID', async () => {
      const fakeId = 'non-existent-id';
      const result = await IntimacyService.delete(fakeId, TEST_USER_ID);
      
      expect(result).toHaveProperty('error');
    });
  });

  describe('Upsert Operations', () => {
    it('should create new intimacy log when none exists for date', async () => {
      const testDate = '2024-01-19';
      const intimacyData = createTestIntimacyLog({ 
        date: testDate,
        type: 'couple',
        orgasm: true
      });
      
      const result = await IntimacyService.upsert(intimacyData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.date).toBe(testDate);
      expect(result.data?.type).toBe('couple');
    });

    it('should update existing intimacy log when one exists for date', async () => {
      const testDate = '2024-01-20';
      
      // Create initial intimacy log
      const initialData = createTestIntimacyLog({ 
        date: testDate,
        type: 'solo',
        orgasm: false
      });
      await IntimacyService.create(initialData, TEST_USER_ID);
      
      // Upsert with updated data
      const updateData = createTestIntimacyLog({ 
        date: testDate,
        type: 'couple',
        orgasm: true,
        location: 'hotel'
      });
      
      const result = await IntimacyService.upsert(updateData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.date).toBe(testDate);
      expect(result.data?.type).toBe('couple');
      expect(result.data?.orgasm).toBe(true);
    });
  });

  describe('Analytics Operations', () => {
    beforeAll(async () => {
      // Create some test data for analytics
      const intimacyLogs = [
        createTestIntimacyLog({ date: '2024-01-21', type: 'solo', mood_before: 3, mood_after: 5 }),
        createTestIntimacyLog({ date: '2024-01-22', type: 'couple', mood_before: 4, mood_after: 5 }),
        createTestIntimacyLog({ date: '2024-01-23', type: 'solo', mood_before: 2, mood_after: 4 }),
        createTestIntimacyLog({ date: '2024-01-24', type: 'couple', mood_before: 3, mood_after: 5 }),
        createTestIntimacyLog({ date: '2024-01-25', type: 'solo', mood_before: 4, mood_after: 5 })
      ];

      for (const log of intimacyLogs) {
        await IntimacyService.create(log, TEST_USER_ID);
      }
    });

    it('should calculate mood impact', async () => {
      const result = await IntimacyService.getMoodImpact(TEST_USER_ID, 5);
      
      expectSuccess(result);
      expect(result.data).toBeDefined();
      expect(result.data).toHaveProperty('before');
      expect(result.data).toHaveProperty('after');
      expect(result.data).toHaveProperty('difference');
      expect(typeof result.data?.before).toBe('number');
      expect(typeof result.data?.after).toBe('number');
      expect(typeof result.data?.difference).toBe('number');
    });

    it('should calculate frequency', async () => {
      const result = await IntimacyService.getFrequency(TEST_USER_ID, 5);
      
      expectSuccess(result);
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('number');
      expect(result.data).toBeGreaterThanOrEqual(0);
    });

    it('should get type distribution', async () => {
      const result = await IntimacyService.getTypeDistribution(TEST_USER_ID, 5);
      
      expectSuccess(result);
      expect(result.data).toBeDefined();
      expect(result.data).toHaveProperty('solo');
      expect(result.data).toHaveProperty('couple');
      expect(typeof result.data?.solo).toBe('number');
      expect(typeof result.data?.couple).toBe('number');
      expect(result.data?.solo + result.data?.couple).toBeGreaterThan(0);
    });

    it('should handle empty data for analytics', async () => {
      // Test with a user that has no intimacy data
      const emptyUserId = 'empty-user-id';
      
      const moodResult = await IntimacyService.getMoodImpact(emptyUserId, 7);
      expect(moodResult.data).toBeNull();
      expect(moodResult.error).toBeNull();
      
      const freqResult = await IntimacyService.getFrequency(emptyUserId, 7);
      expect(freqResult.data).toBe(0);
      expect(freqResult.error).toBeNull();
      
      const typeResult = await IntimacyService.getTypeDistribution(emptyUserId, 7);
      expect(typeResult.data).toEqual({ solo: 0, couple: 0 });
      expect(typeResult.error).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user ID', async () => {
      const intimacyData = createTestIntimacyLog();
      const result = await IntimacyService.create(intimacyData, '');
      
      expect(result.error).toBeDefined();
    });

    it('should handle malformed data', async () => {
      const malformedData = createTestIntimacyLog({
        type: null as any,
        orgasm: 'yes' as any,
        time_to_sleep: 'invalid' as any
      });
      
      const result = await IntimacyService.create(malformedData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });

    it('should handle duplicate date constraint', async () => {
      const testDate = '2024-01-26';
      const intimacyData1 = createTestIntimacyLog({ date: testDate, type: 'solo' });
      const intimacyData2 = createTestIntimacyLog({ date: testDate, type: 'couple' });
      
      // First creation should succeed
      const result1 = await IntimacyService.create(intimacyData1, TEST_USER_ID);
      expectSuccess(result1);
      
      // Second creation with same date should fail due to unique constraint
      const result2 = await IntimacyService.create(intimacyData2, TEST_USER_ID);
      expect(result2.error).toBeDefined();
    });

    it('should handle extreme mood values', async () => {
      const extremeData = createTestIntimacyLog({
        mood_before: 1,
        mood_after: 5,
        time_to_sleep: 0
      });
      
      const result = await IntimacyService.create(extremeData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.mood_before).toBe(1);
      expect(result.data?.mood_after).toBe(5);
      expect(result.data?.time_to_sleep).toBe(0);
    });
  });
});