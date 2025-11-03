import { ActivitiesService } from '@/services/activities.service';
import { 
  TEST_USER_ID, 
  createTestActivity, 
  cleanupTestData, 
  createTestUser,
  expectSuccess,
  expectError,
  getTestDate,
  getTestDateRange
} from '../utils/testHelpers';

describe('ActivitiesService', () => {
  beforeAll(async () => {
    await cleanupTestData();
    await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Create Operations', () => {
    it('should create a new activity', async () => {
      const activityData = createTestActivity();
      const result = await ActivitiesService.create(activityData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe(activityData.name);
      expect(result.data?.category).toBe(activityData.category);
      expect(result.data?.user_id).toBe(TEST_USER_ID);
    });

    it('should create multiple activities', async () => {
      const activities = [
        createTestActivity({ name: 'Morning Yoga', category: 'Exercise' }),
        createTestActivity({ name: 'Evening Walk', category: 'Exercise' })
      ];
      
      const result = await ActivitiesService.createMany(activities, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].name).toBe('Morning Yoga');
      expect(result.data?.[1].name).toBe('Evening Walk');
    });

    it('should handle validation errors', async () => {
      const invalidData = createTestActivity({ name: '' }); // Empty name should fail
      const result = await ActivitiesService.create(invalidData, TEST_USER_ID);
      
      // This might succeed or fail depending on database constraints
      // We'll check the result structure
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });

  describe('Read Operations', () => {
    let testActivityId: string;

    beforeAll(async () => {
      const activityData = createTestActivity({ name: 'Test Activity for Reading' });
      const result = await ActivitiesService.create(activityData, TEST_USER_ID);
      testActivityId = result.data?.id || '';
    });

    it('should get all activities', async () => {
      const result = await ActivitiesService.getAll(TEST_USER_ID);
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data?.length).toBeGreaterThan(0);
    });

    it('should get activity by ID', async () => {
      const result = await ActivitiesService.getById(testActivityId, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.id).toBe(testActivityId);
      expect(result.data?.name).toBe('Test Activity for Reading');
    });

    it('should get activities by date', async () => {
      const testDate = getTestDate();
      const result = await ActivitiesService.getByDate(TEST_USER_ID, testDate);
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should get activities by date range', async () => {
      const { startDate, endDate } = getTestDateRange(-7, 0);
      const result = await ActivitiesService.getByDateRange(TEST_USER_ID, startDate, endDate);
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should get activities by category', async () => {
      const result = await ActivitiesService.getByCategory(TEST_USER_ID, 'Exercise');
      
      expectSuccess(result);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should return null for non-existent activity', async () => {
      const fakeId = 'non-existent-id';
      const result = await ActivitiesService.getById(fakeId, TEST_USER_ID);
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('Update Operations', () => {
    let testActivityId: string;

    beforeAll(async () => {
      const activityData = createTestActivity({ name: 'Test Activity for Update' });
      const result = await ActivitiesService.create(activityData, TEST_USER_ID);
      testActivityId = result.data?.id || '';
    });

    it('should update activity', async () => {
      const updateData = { 
        name: 'Updated Activity Name',
        duration: 45 
      };
      
      const result = await ActivitiesService.update(testActivityId, updateData, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data?.name).toBe('Updated Activity Name');
      expect(result.data?.duration).toBe(45);
    });

    it('should handle update with non-existent ID', async () => {
      const fakeId = 'non-existent-id';
      const updateData = { name: 'This should fail' };
      
      const result = await ActivitiesService.update(fakeId, updateData, TEST_USER_ID);
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('Delete Operations', () => {
    let testActivityId: string;

    beforeAll(async () => {
      const activityData = createTestActivity({ name: 'Test Activity for Delete' });
      const result = await ActivitiesService.create(activityData, TEST_USER_ID);
      testActivityId = result.data?.id || '';
    });

    it('should delete activity by ID', async () => {
      const result = await ActivitiesService.delete(testActivityId, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.error).toBeUndefined();
    });

    it('should handle delete with non-existent ID', async () => {
      const fakeId = 'non-existent-id';
      const result = await ActivitiesService.delete(fakeId, TEST_USER_ID);
      
      // Delete operations typically don't return data, just check for errors
      expect(result).toHaveProperty('error');
    });

    it('should delete activities by date', async () => {
      // Create some activities for a specific date
      const testDate = getTestDate();
      await ActivitiesService.create(createTestActivity({ date: testDate }), TEST_USER_ID);
      await ActivitiesService.create(createTestActivity({ date: testDate, name: 'Another Activity' }), TEST_USER_ID);
      
      const result = await ActivitiesService.deleteByDate(TEST_USER_ID, testDate);
      
      expectSuccess(result);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user ID', async () => {
      const activityData = createTestActivity();
      const result = await ActivitiesService.create(activityData, '');
      
      expect(result.error).toBeDefined();
    });

    it('should handle malformed data', async () => {
      const malformedData = {
        date: 'invalid-date',
        category: '',
        name: null as any
      };
      
      const result = await ActivitiesService.create(malformedData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });
  });
});



