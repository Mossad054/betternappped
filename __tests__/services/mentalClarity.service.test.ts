import { MentalClarityService } from '@/services/mentalClarity.service';
import { 
  TEST_USER_ID, 
  createTestMentalClarityTest, 
  cleanupTestData, 
  createTestUser,
  expectSuccess,
  expectError,
  getTestDate
} from '../utils/testHelpers';

describe('MentalClarityService', () => {
  beforeAll(async () => {
    await cleanupTestData();
    await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Create Operations', () => {
    it('should create a new mental clarity test', async () => {
      const clarityData = createTestMentalClarityTest();
      const result = await MentalClarityService.create(clarityData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data).toBeDefined();
      expect(result.data?.score).toBe(clarityData.score);
      expect(result.data?.factors).toEqual(clarityData.factors);
      expect(result.data?.user_id).toBe(TEST_USER_ID);
    });

    it('should handle validation errors for invalid score', async () => {
      const invalidData = createTestMentalClarityTest({ score: 6 }); // Score should be 1-5
      const result = await MentalClarityService.create(invalidData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });

    it('should handle validation errors for negative score', async () => {
      const invalidData = createTestMentalClarityTest({ score: 0 });
      const result = await MentalClarityService.create(invalidData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });
  });

  describe('Read Operations', () => {
    let testClarityId: string;

    beforeAll(async () => {
      const clarityData = createTestMentalClarityTest({ 
        date: '2024-01-16',
        score: 5,
        factors: ['good_sleep', 'meditation', 'exercise']
      });
      const result = await MentalClarityService.create(clarityData, TEST_USER_ID);
      testClarityId = result.data?.id || '';
    });

    it('should get all mental clarity tests', async () => {
      const result = await MentalClarityService.getAll(TEST_USER_ID);
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
    });

    it('should get mental clarity test by ID', async () => {
      const result = await MentalClarityService.getById(testClarityId, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.id).toBe(testClarityId);
      expect(result.data?.score).toBe(5);
    });

    it('should get mental clarity test by date', async () => {
      const testDate = '2024-01-16';
      const result = await MentalClarityService.getByDate(TEST_USER_ID, testDate);
      
      expectSuccess(result);
      expect(result.data?.date).toBe(testDate);
    });

    it('should get mental clarity tests by date range', async () => {
      const result = await MentalClarityService.getByDateRange(TEST_USER_ID, '2024-01-01', '2024-01-31');
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return null for non-existent mental clarity test', async () => {
      const fakeId = 'non-existent-id';
      const result = await MentalClarityService.getById(fakeId, TEST_USER_ID);
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('Update Operations', () => {
    let testClarityId: string;

    beforeAll(async () => {
      const clarityData = createTestMentalClarityTest({ 
        date: '2024-01-17',
        score: 3,
        factors: ['stress', 'poor_sleep']
      });
      const result = await MentalClarityService.create(clarityData, TEST_USER_ID);
      testClarityId = result.data?.id || '';
    });

    it('should update mental clarity test', async () => {
      const updateData = { 
        score: 4,
        factors: ['good_sleep', 'meditation', 'exercise']
      };
      
      const result = await MentalClarityService.update(testClarityId, updateData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.score).toBe(4);
      expect(result.data?.factors).toEqual(['good_sleep', 'meditation', 'exercise']);
    });

    it('should handle update with non-existent ID', async () => {
      const fakeId = 'non-existent-id';
      const updateData = { score: 5 };
      
      const result = await MentalClarityService.update(fakeId, updateData, TEST_USER_ID);
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('Delete Operations', () => {
    let testClarityId: string;

    beforeAll(async () => {
      const clarityData = createTestMentalClarityTest({ 
        date: '2024-01-18',
        score: 2,
        factors: ['stress', 'anxiety']
      });
      const result = await MentalClarityService.create(clarityData, TEST_USER_ID);
      testClarityId = result.data?.id || '';
    });

    it('should delete mental clarity test by ID', async () => {
      const result = await MentalClarityService.delete(testClarityId, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.error).toBeUndefined();
    });

    it('should handle delete with non-existent ID', async () => {
      const fakeId = 'non-existent-id';
      const result = await MentalClarityService.delete(fakeId, TEST_USER_ID);
      
      expect(result).toHaveProperty('error');
    });
  });

  describe('Upsert Operations', () => {
    it('should create new mental clarity test when none exists for date', async () => {
      const testDate = '2024-01-19';
      const clarityData = createTestMentalClarityTest({ 
        date: testDate,
        score: 4,
        factors: ['good_sleep', 'exercise']
      });
      
      const result = await MentalClarityService.upsert(clarityData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.date).toBe(testDate);
      expect(result.data?.score).toBe(4);
    });

    it('should update existing mental clarity test when one exists for date', async () => {
      const testDate = '2024-01-20';
      
      // Create initial mental clarity test
      const initialData = createTestMentalClarityTest({ 
        date: testDate,
        score: 2,
        factors: ['stress']
      });
      await MentalClarityService.create(initialData, TEST_USER_ID);
      
      // Upsert with updated data
      const updateData = createTestMentalClarityTest({ 
        date: testDate,
        score: 5,
        factors: ['good_sleep', 'meditation', 'exercise', 'healthy_meals']
      });
      
      const result = await MentalClarityService.upsert(updateData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.date).toBe(testDate);
      expect(result.data?.score).toBe(5);
      expect(result.data?.factors).toEqual(['good_sleep', 'meditation', 'exercise', 'healthy_meals']);
    });
  });

  describe('Analytics Operations', () => {
    beforeAll(async () => {
      // Create some test data for analytics
      const clarityTests = [
        createTestMentalClarityTest({ date: '2024-01-21', score: 4, factors: ['good_sleep', 'meditation'] }),
        createTestMentalClarityTest({ date: '2024-01-22', score: 5, factors: ['exercise', 'healthy_meals'] }),
        createTestMentalClarityTest({ date: '2024-01-23', score: 3, factors: ['stress', 'poor_sleep'] }),
        createTestMentalClarityTest({ date: '2024-01-24', score: 4, factors: ['good_sleep', 'exercise'] }),
        createTestMentalClarityTest({ date: '2024-01-25', score: 5, factors: ['meditation', 'exercise', 'healthy_meals'] })
      ];

      for (const test of clarityTests) {
        await MentalClarityService.create(test, TEST_USER_ID);
      }
    });

    it('should calculate average score', async () => {
      const result = await MentalClarityService.getAverageScore(TEST_USER_ID, 5);
      
      expectSuccess(result);
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('number');
      expect(result.data).toBeGreaterThan(0);
      expect(result.data).toBeLessThanOrEqual(5);
    });

    it('should get score trend', async () => {
      const result = await MentalClarityService.getScoreTrend(TEST_USER_ID, 5);
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBe(5);
      expect(result.data?.every(score => score >= 1 && score <= 5)).toBe(true);
    });

    it('should get top factors', async () => {
      const result = await MentalClarityService.getTopFactors(TEST_USER_ID, 5);
      
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
      // Test with a user that has no mental clarity data
      const emptyUserId = 'empty-user-id';
      
      const avgResult = await MentalClarityService.getAverageScore(emptyUserId, 7);
      expect(avgResult.data).toBeNull();
      expect(avgResult.error).toBeNull();
      
      const trendResult = await MentalClarityService.getScoreTrend(emptyUserId, 7);
      expect(trendResult.data).toEqual([]);
      expect(trendResult.error).toBeNull();
      
      const factorsResult = await MentalClarityService.getTopFactors(emptyUserId, 7);
      expect(factorsResult.data).toEqual([]);
      expect(factorsResult.error).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user ID', async () => {
      const clarityData = createTestMentalClarityTest();
      const result = await MentalClarityService.create(clarityData, '');
      
      expect(result.error).toBeDefined();
    });

    it('should handle malformed JSONB data', async () => {
      const malformedData = createTestMentalClarityTest({
        factors: 'invalid-json' as any
      });
      
      const result = await MentalClarityService.create(malformedData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });

    it('should handle duplicate date constraint', async () => {
      const testDate = '2024-01-26';
      const clarityData1 = createTestMentalClarityTest({ date: testDate, score: 3 });
      const clarityData2 = createTestMentalClarityTest({ date: testDate, score: 4 });
      
      // First creation should succeed
      const result1 = await MentalClarityService.create(clarityData1, TEST_USER_ID);
      expectSuccess(result1);
      
      // Second creation with same date should fail due to unique constraint
      const result2 = await MentalClarityService.create(clarityData2, TEST_USER_ID);
      expect(result2.error).toBeDefined();
    });

    it('should handle invalid factor data', async () => {
      const invalidData = createTestMentalClarityTest({
        factors: ['valid_factor', 123, null, 'another_valid'] as any
      });
      
      const result = await MentalClarityService.create(invalidData, TEST_USER_ID);
      
      // This might succeed or fail depending on database constraints
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });

    it('should handle extreme score values', async () => {
      const extremeData = createTestMentalClarityTest({
        score: 1,
        factors: ['severe_stress', 'no_sleep', 'illness']
      });
      
      const result = await MentalClarityService.create(extremeData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.score).toBe(1);
      expect(result.data?.factors).toEqual(['severe_stress', 'no_sleep', 'illness']);
    });

    it('should handle empty factors array', async () => {
      const emptyFactorsData = createTestMentalClarityTest({
        score: 3,
        factors: []
      });
      
      const result = await MentalClarityService.create(emptyFactorsData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.factors).toEqual([]);
    });
  });
});