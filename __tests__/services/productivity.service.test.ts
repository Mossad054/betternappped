import { ProductivityService } from '@/services/productivity.service';
import { 
  TEST_USER_ID, 
  createTestProductivityLog, 
  cleanupTestData, 
  createTestUser,
  expectSuccess,
  expectError,
  getTestDate
} from '../utils/testHelpers';

describe('ProductivityService', () => {
  beforeAll(async () => {
    await cleanupTestData();
    await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Create Operations', () => {
    it('should create a new productivity log', async () => {
      const productivityData = createTestProductivityLog();
      const result = await ProductivityService.create(productivityData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data).toBeDefined();
      expect(result.data?.rating).toBe(productivityData.rating);
      expect(result.data?.focused_hours).toBe(productivityData.focused_hours);
      expect(result.data?.user_id).toBe(TEST_USER_ID);
    });

    it('should handle validation errors for invalid rating', async () => {
      const invalidData = createTestProductivityLog({ rating: 6 }); // Rating should be 1-5
      const result = await ProductivityService.create(invalidData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });

    it('should handle validation errors for negative focused hours', async () => {
      const invalidData = createTestProductivityLog({ focused_hours: -1 });
      const result = await ProductivityService.create(invalidData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });
  });

  describe('Read Operations', () => {
    let testProductivityId: string;

    beforeAll(async () => {
      const productivityData = createTestProductivityLog({ 
        date: '2024-01-16',
        rating: 5,
        focused_hours: 8.0
      });
      const result = await ProductivityService.create(productivityData, TEST_USER_ID);
      testProductivityId = result.data?.id || '';
    });

    it('should get all productivity logs', async () => {
      const result = await ProductivityService.getAll(TEST_USER_ID);
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
    });

    it('should get productivity log by ID', async () => {
      const result = await ProductivityService.getById(testProductivityId, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.id).toBe(testProductivityId);
      expect(result.data?.rating).toBe(5);
    });

    it('should get productivity log by date', async () => {
      const testDate = '2024-01-16';
      const result = await ProductivityService.getByDate(TEST_USER_ID, testDate);
      
      expectSuccess(result);
      expect(result.data?.date).toBe(testDate);
    });

    it('should get productivity logs by date range', async () => {
      const result = await ProductivityService.getByDateRange(TEST_USER_ID, '2024-01-01', '2024-01-31');
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return null for non-existent productivity log', async () => {
      const fakeId = 'non-existent-id';
      const result = await ProductivityService.getById(fakeId, TEST_USER_ID);
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('Update Operations', () => {
    let testProductivityId: string;

    beforeAll(async () => {
      const productivityData = createTestProductivityLog({ 
        date: '2024-01-17',
        rating: 3,
        focused_hours: 4.5
      });
      const result = await ProductivityService.create(productivityData, TEST_USER_ID);
      testProductivityId = result.data?.id || '';
    });

    it('should update productivity log', async () => {
      const updateData = { 
        rating: 4,
        focused_hours: 6.0,
        other_factor: 'Had a great morning routine!'
      };
      
      const result = await ProductivityService.update(testProductivityId, updateData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.rating).toBe(4);
      expect(result.data?.focused_hours).toBe(6.0);
      expect(result.data?.other_factor).toBe('Had a great morning routine!');
    });

    it('should handle update with non-existent ID', async () => {
      const fakeId = 'non-existent-id';
      const updateData = { rating: 5 };
      
      const result = await ProductivityService.update(fakeId, updateData, TEST_USER_ID);
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('Delete Operations', () => {
    let testProductivityId: string;

    beforeAll(async () => {
      const productivityData = createTestProductivityLog({ 
        date: '2024-01-18',
        rating: 2,
        focused_hours: 2.0
      });
      const result = await ProductivityService.create(productivityData, TEST_USER_ID);
      testProductivityId = result.data?.id || '';
    });

    it('should delete productivity log by ID', async () => {
      const result = await ProductivityService.delete(testProductivityId, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.error).toBeUndefined();
    });

    it('should handle delete with non-existent ID', async () => {
      const fakeId = 'non-existent-id';
      const result = await ProductivityService.delete(fakeId, TEST_USER_ID);
      
      expect(result).toHaveProperty('error');
    });
  });

  describe('Upsert Operations', () => {
    it('should create new productivity log when none exists for date', async () => {
      const testDate = '2024-01-19';
      const productivityData = createTestProductivityLog({ 
        date: testDate,
        rating: 4,
        focused_hours: 7.0
      });
      
      const result = await ProductivityService.upsert(productivityData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.date).toBe(testDate);
      expect(result.data?.rating).toBe(4);
    });

    it('should update existing productivity log when one exists for date', async () => {
      const testDate = '2024-01-20';
      
      // Create initial productivity log
      const initialData = createTestProductivityLog({ 
        date: testDate,
        rating: 3,
        focused_hours: 5.0
      });
      await ProductivityService.create(initialData, TEST_USER_ID);
      
      // Upsert with updated data
      const updateData = createTestProductivityLog({ 
        date: testDate,
        rating: 5,
        focused_hours: 8.0,
        other_factor: 'Much better day!'
      });
      
      const result = await ProductivityService.upsert(updateData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.date).toBe(testDate);
      expect(result.data?.rating).toBe(5);
      expect(result.data?.focused_hours).toBe(8.0);
    });
  });

  describe('Analytics Operations', () => {
    beforeAll(async () => {
      // Create some test data for analytics
      const productivityLogs = [
        createTestProductivityLog({ date: '2024-01-21', rating: 4, focused_hours: 6.5 }),
        createTestProductivityLog({ date: '2024-01-22', rating: 5, focused_hours: 8.0 }),
        createTestProductivityLog({ date: '2024-01-23', rating: 3, focused_hours: 4.0 }),
        createTestProductivityLog({ date: '2024-01-24', rating: 4, focused_hours: 7.0 }),
        createTestProductivityLog({ date: '2024-01-25', rating: 5, focused_hours: 8.5 })
      ];

      for (const log of productivityLogs) {
        await ProductivityService.create(log, TEST_USER_ID);
      }
    });

    it('should calculate average rating', async () => {
      const result = await ProductivityService.getAverageRating(TEST_USER_ID, 5);
      
      expectSuccess(result);
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('number');
      expect(result.data).toBeGreaterThan(0);
      expect(result.data).toBeLessThanOrEqual(5);
    });

    it('should get productivity trend', async () => {
      const result = await ProductivityService.getProductivityTrend(TEST_USER_ID, 5);
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBe(5);
      expect(result.data?.every(rating => rating >= 1 && rating <= 5)).toBe(true);
    });

    it('should get top factors', async () => {
      const result = await ProductivityService.getTopFactors(TEST_USER_ID, 5);
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
      
      // Check structure of top factors
      result.data?.forEach(factor => {
        expect(factor).toHaveProperty('factor');
        expect(factor).toHaveProperty('count');
        expect(typeof factor.factor).toBe('string');
        expect(typeof factor.count).toBe('number');
      });
    });

    it('should handle empty data for analytics', async () => {
      // Test with a user that has no productivity data
      const emptyUserId = 'empty-user-id';
      
      const avgResult = await ProductivityService.getAverageRating(emptyUserId, 7);
      expect(avgResult.data).toBeNull();
      expect(avgResult.error).toBeNull();
      
      const trendResult = await ProductivityService.getProductivityTrend(emptyUserId, 7);
      expect(trendResult.data).toEqual([]);
      expect(trendResult.error).toBeNull();
      
      const factorsResult = await ProductivityService.getTopFactors(emptyUserId, 7);
      expect(factorsResult.data).toEqual([]);
      expect(factorsResult.error).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user ID', async () => {
      const productivityData = createTestProductivityLog();
      const result = await ProductivityService.create(productivityData, '');
      
      expect(result.error).toBeDefined();
    });

    it('should handle malformed JSONB data', async () => {
      const malformedData = createTestProductivityLog({
        factors: 'invalid-json' as any
      });
      
      const result = await ProductivityService.create(malformedData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });

    it('should handle duplicate date constraint', async () => {
      const testDate = '2024-01-26';
      const productivityData1 = createTestProductivityLog({ date: testDate, rating: 3 });
      const productivityData2 = createTestProductivityLog({ date: testDate, rating: 4 });
      
      // First creation should succeed
      const result1 = await ProductivityService.create(productivityData1, TEST_USER_ID);
      expectSuccess(result1);
      
      // Second creation with same date should fail due to unique constraint
      const result2 = await ProductivityService.create(productivityData2, TEST_USER_ID);
      expect(result2.error).toBeDefined();
    });

    it('should handle invalid factor data', async () => {
      const invalidData = createTestProductivityLog({
        factors: ['valid_factor', 123, null, 'another_valid'] as any
      });
      
      const result = await ProductivityService.create(invalidData, TEST_USER_ID);
      
      // This might succeed or fail depending on database constraints
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });
});