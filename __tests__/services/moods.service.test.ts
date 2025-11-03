import { MoodsService } from '@/services/moods.service';
import { 
  TEST_USER_ID, 
  createTestMoodLog, 
  cleanupTestData, 
  createTestUser,
  expectSuccess,
  expectError,
  getTestDate
} from '../utils/testHelpers';

describe('MoodsService', () => {
  beforeAll(async () => {
    await cleanupTestData();
    await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Create Operations', () => {
    it('should create a new mood log', async () => {
      const moodData = createTestMoodLog();
      const result = await MoodsService.create(moodData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data).toBeDefined();
      expect(result.data?.score).toBe(moodData.score);
      expect(result.data?.emoji).toBe(moodData.emoji);
      expect(result.data?.user_id).toBe(TEST_USER_ID);
    });

    it('should handle validation errors for invalid score', async () => {
      const invalidData = createTestMoodLog({ score: 6 }); // Score should be 1-5
      const result = await MoodsService.create(invalidData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });

    it('should handle validation errors for missing required fields', async () => {
      const invalidData = createTestMoodLog({ score: undefined as any, emoji: '' });
      const result = await MoodsService.create(invalidData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });
  });

  describe('Read Operations', () => {
    let testMoodId: string;

    beforeAll(async () => {
      const moodData = createTestMoodLog({ 
        date: '2024-01-16',
        score: 5,
        emoji: '😄'
      });
      const result = await MoodsService.create(moodData, TEST_USER_ID);
      testMoodId = result.data?.id || '';
    });

    it('should get all mood logs', async () => {
      const result = await MoodsService.getAll(TEST_USER_ID);
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
    });

    it('should get mood log by ID', async () => {
      const result = await MoodsService.getById(testMoodId, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.id).toBe(testMoodId);
      expect(result.data?.score).toBe(5);
    });

    it('should get mood log by date', async () => {
      const testDate = '2024-01-16';
      const result = await MoodsService.getByDate(TEST_USER_ID, testDate);
      
      expectSuccess(result);
      expect(result.data?.date).toBe(testDate);
    });

    it('should get mood logs by date range', async () => {
      const result = await MoodsService.getByDateRange(TEST_USER_ID, '2024-01-01', '2024-01-31');
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return null for non-existent mood log', async () => {
      const fakeId = 'non-existent-id';
      const result = await MoodsService.getById(fakeId, TEST_USER_ID);
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('Update Operations', () => {
    let testMoodId: string;

    beforeAll(async () => {
      const moodData = createTestMoodLog({ 
        date: '2024-01-17',
        score: 3,
        emoji: '😐'
      });
      const result = await MoodsService.create(moodData, TEST_USER_ID);
      testMoodId = result.data?.id || '';
    });

    it('should update mood log', async () => {
      const updateData = { 
        score: 4,
        emoji: '😊',
        notes: 'Feeling better after coffee!'
      };
      
      const result = await MoodsService.update(testMoodId, updateData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.score).toBe(4);
      expect(result.data?.emoji).toBe('😊');
      expect(result.data?.notes).toBe('Feeling better after coffee!');
    });

    it('should handle update with non-existent ID', async () => {
      const fakeId = 'non-existent-id';
      const updateData = { score: 5 };
      
      const result = await MoodsService.update(fakeId, updateData, TEST_USER_ID);
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('Delete Operations', () => {
    let testMoodId: string;

    beforeAll(async () => {
      const moodData = createTestMoodLog({ 
        date: '2024-01-18',
        score: 2,
        emoji: '😔'
      });
      const result = await MoodsService.create(moodData, TEST_USER_ID);
      testMoodId = result.data?.id || '';
    });

    it('should delete mood log by ID', async () => {
      const result = await MoodsService.delete(testMoodId, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.error).toBeUndefined();
    });

    it('should handle delete with non-existent ID', async () => {
      const fakeId = 'non-existent-id';
      const result = await MoodsService.delete(fakeId, TEST_USER_ID);
      
      expect(result).toHaveProperty('error');
    });
  });

  describe('Upsert Operations', () => {
    it('should create new mood log when none exists for date', async () => {
      const testDate = '2024-01-19';
      const moodData = createTestMoodLog({ 
        date: testDate,
        score: 4,
        emoji: '😊'
      });
      
      const result = await MoodsService.upsert(moodData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.date).toBe(testDate);
      expect(result.data?.score).toBe(4);
    });

    it('should update existing mood log when one exists for date', async () => {
      const testDate = '2024-01-20';
      
      // Create initial mood log
      const initialData = createTestMoodLog({ 
        date: testDate,
        score: 2,
        emoji: '😔'
      });
      await MoodsService.create(initialData, TEST_USER_ID);
      
      // Upsert with updated data
      const updateData = createTestMoodLog({ 
        date: testDate,
        score: 5,
        emoji: '😄',
        notes: 'Much better now!'
      });
      
      const result = await MoodsService.upsert(updateData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.date).toBe(testDate);
      expect(result.data?.score).toBe(5);
      expect(result.data?.notes).toBe('Much better now!');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user ID', async () => {
      const moodData = createTestMoodLog();
      const result = await MoodsService.create(moodData, '');
      
      expect(result.error).toBeDefined();
    });

    it('should handle malformed JSONB data', async () => {
      const malformedData = createTestMoodLog({
        moods: 'invalid-json' as any,
        triggers: 'not-an-object' as any
      });
      
      const result = await MoodsService.create(malformedData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });

    it('should handle duplicate date constraint', async () => {
      const testDate = '2024-01-21';
      const moodData1 = createTestMoodLog({ date: testDate, score: 3 });
      const moodData2 = createTestMoodLog({ date: testDate, score: 4 });
      
      // First creation should succeed
      const result1 = await MoodsService.create(moodData1, TEST_USER_ID);
      expectSuccess(result1);
      
      // Second creation with same date should fail due to unique constraint
      const result2 = await MoodsService.create(moodData2, TEST_USER_ID);
      expect(result2.error).toBeDefined();
    });
  });
});



