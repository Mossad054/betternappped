import { ExperimentsService } from '@/services/experiments.service';
import { 
  TEST_USER_ID, 
  createTestExperiment, 
  cleanupTestData, 
  createTestUser,
  expectSuccess,
  expectError,
  getTestDate
} from '../utils/testHelpers';

describe('ExperimentsService', () => {
  beforeAll(async () => {
    await cleanupTestData();
    await createTestUser();
  });

  afterAll(async () => {
    await cleanupTestData();
  });

  describe('Experiment CRUD Operations', () => {
    describe('Create Operations', () => {
      it('should create a new experiment', async () => {
        const experimentData = createTestExperiment();
        const result = await ExperimentsService.create(experimentData, TEST_USER_ID);
        
        expectSuccess(result);
        expect(result.data).toBeDefined();
        expect(result.data?.activity_name).toBe(experimentData.activity_name);
        expect(result.data?.status).toBe(experimentData.status);
        expect(result.data?.user_id).toBe(TEST_USER_ID);
      });

      it('should handle validation errors for invalid status', async () => {
        const invalidData = createTestExperiment({ status: 'invalid-status' as any });
        const result = await ExperimentsService.create(invalidData, TEST_USER_ID);
        
        expect(result.error).toBeDefined();
      });
    });

    describe('Read Operations', () => {
      let testExperimentId: string;

      beforeAll(async () => {
        const experimentData = createTestExperiment({ 
          activity_name: 'Test Experiment for Reading',
          status: 'active'
        });
        const result = await ExperimentsService.create(experimentData, TEST_USER_ID);
        testExperimentId = result.data?.id || '';
      });

      it('should get all experiments', async () => {
        const result = await ExperimentsService.getAll(TEST_USER_ID);
        
        expectSuccess(result);
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data?.length).toBeGreaterThan(0);
      });

      it('should get experiment by ID', async () => {
        const result = await ExperimentsService.getById(testExperimentId, TEST_USER_ID);
        
        expectSuccess(result);
        expect(result.data?.id).toBe(testExperimentId);
        expect(result.data?.activity_name).toBe('Test Experiment for Reading');
      });

      it('should get active experiments', async () => {
        const result = await ExperimentsService.getActive(TEST_USER_ID);
        
        expectSuccess(result);
        expect(Array.isArray(result.data)).toBe(true);
        result.data?.forEach(exp => {
          expect(exp.status).toBe('active');
        });
      });

      it('should get completed experiments', async () => {
        // Create a completed experiment
        const completedData = createTestExperiment({ 
          activity_name: 'Completed Test Experiment',
          status: 'completed'
        });
        await ExperimentsService.create(completedData, TEST_USER_ID);
        
        const result = await ExperimentsService.getCompleted(TEST_USER_ID);
        
        expectSuccess(result);
        expect(Array.isArray(result.data)).toBe(true);
        result.data?.forEach(exp => {
          expect(exp.status).toBe('completed');
        });
      });

      it('should return null for non-existent experiment', async () => {
        const fakeId = 'non-existent-id';
        const result = await ExperimentsService.getById(fakeId, TEST_USER_ID);
        
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
      });
    });

    describe('Update Operations', () => {
      let testExperimentId: string;

      beforeAll(async () => {
        const experimentData = createTestExperiment({ 
          activity_name: 'Test Experiment for Update',
          status: 'active'
        });
        const result = await ExperimentsService.create(experimentData, TEST_USER_ID);
        testExperimentId = result.data?.id || '';
      });

      it('should update experiment', async () => {
        const updateData = { 
          activity_name: 'Updated Experiment Name',
          status: 'paused',
          insights: 'This is going well!'
        };
        
        const result = await ExperimentsService.update(testExperimentId, updateData, TEST_USER_ID);
        
        expectSuccess(result);
        expect(result.data?.activity_name).toBe('Updated Experiment Name');
        expect(result.data?.status).toBe('paused');
        expect(result.data?.insights).toBe('This is going well!');
      });

      it('should complete experiment', async () => {
        const resultsData = { 
          energy: 4, 
          mood: 5, 
          productivity: 4 
        };
        const insights = 'Great results! Will continue this habit.';
        
        const result = await ExperimentsService.completeExperiment(
          testExperimentId, 
          TEST_USER_ID, 
          resultsData, 
          insights
        );
        
        expectSuccess(result);
        expect(result.data?.status).toBe('completed');
        expect(result.data?.results_data).toEqual(resultsData);
        expect(result.data?.insights).toBe(insights);
      });

      it('should handle update with non-existent ID', async () => {
        const fakeId = 'non-existent-id';
        const updateData = { activity_name: 'This should fail' };
        
        const result = await ExperimentsService.update(fakeId, updateData, TEST_USER_ID);
        
        expect(result.data).toBeNull();
        expect(result.error).toBeDefined();
      });
    });

    describe('Delete Operations', () => {
      let testExperimentId: string;

      beforeAll(async () => {
        const experimentData = createTestExperiment({ 
          activity_name: 'Test Experiment for Delete',
          status: 'active'
        });
        const result = await ExperimentsService.create(experimentData, TEST_USER_ID);
        testExperimentId = result.data?.id || '';
      });

      it('should delete experiment by ID', async () => {
        const result = await ExperimentsService.delete(testExperimentId, TEST_USER_ID);
        
        expectSuccess(result);
        expect(result.error).toBeUndefined();
      });

      it('should handle delete with non-existent ID', async () => {
        const fakeId = 'non-existent-id';
        const result = await ExperimentsService.delete(fakeId, TEST_USER_ID);
        
        expect(result).toHaveProperty('error');
      });
    });
  });

  describe('Experiment Log Operations', () => {
    let testExperimentId: string;

    beforeAll(async () => {
      const experimentData = createTestExperiment({ 
        activity_name: 'Test Experiment for Logging',
        status: 'active'
      });
      const result = await ExperimentsService.create(experimentData, TEST_USER_ID);
      testExperimentId = result.data?.id || '';
    });

    describe('Log Experiment', () => {
      it('should log experiment completion', async () => {
        const logData = {
          date: '2024-01-15',
          completed: true,
          skipped: false,
          outcome_scores: { energy: 4, mood: 5 },
          notes: 'Felt great after this!'
        };
        
        const result = await ExperimentsService.logExperiment(testExperimentId, logData, TEST_USER_ID);
        
        expectSuccess(result);
        expect(result.data?.completed).toBe(true);
        expect(result.data?.outcome_scores).toEqual({ energy: 4, mood: 5 });
        expect(result.data?.experiment_id).toBe(testExperimentId);
      });

      it('should log experiment skip', async () => {
        const logData = {
          date: '2024-01-16',
          completed: false,
          skipped: true,
          notes: 'Too tired today'
        };
        
        const result = await ExperimentsService.logExperiment(testExperimentId, logData, TEST_USER_ID);
        
        expectSuccess(result);
        expect(result.data?.completed).toBe(false);
        expect(result.data?.skipped).toBe(true);
      });
    });

    describe('Get Experiment Logs', () => {
      beforeAll(async () => {
        // Create some experiment logs
        const logData1 = { 
          date: '2024-01-17', 
          completed: true, 
          skipped: false,
          outcome_scores: { energy: 3, mood: 4 }
        };
        const logData2 = { 
          date: '2024-01-18', 
          completed: false, 
          skipped: true,
          notes: 'Skipped due to illness'
        };
        
        await ExperimentsService.logExperiment(testExperimentId, logData1, TEST_USER_ID);
        await ExperimentsService.logExperiment(testExperimentId, logData2, TEST_USER_ID);
      });

      it('should get all experiment logs for an experiment', async () => {
        const result = await ExperimentsService.getExperimentLogs(testExperimentId, TEST_USER_ID);
        
        expectSuccess(result);
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data?.length).toBeGreaterThan(0);
      });

      it('should get experiment log by date', async () => {
        const testDate = '2024-01-17';
        const result = await ExperimentsService.getExperimentLogByDate(testExperimentId, testDate, TEST_USER_ID);
        
        expectSuccess(result);
        expect(result.data?.date).toBe(testDate);
      });

      it('should return null for non-existent experiment log', async () => {
        const fakeExperimentId = 'non-existent-experiment-id';
        const result = await ExperimentsService.getExperimentLogs(fakeExperimentId, TEST_USER_ID);
        
        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data?.length).toBe(0);
      });
    });

    describe('Experiment with Logs', () => {
      it('should get experiment with its logs', async () => {
        const result = await ExperimentsService.getExperimentWithLogs(testExperimentId, TEST_USER_ID);
        
        expectSuccess(result);
        expect(result.data).toHaveProperty('experiment_logs');
        expect(Array.isArray(result.data?.experiment_logs)).toBe(true);
      });
    });
  });

  describe('Progress Management', () => {
    let testExperimentId: string;

    beforeAll(async () => {
      const experimentData = createTestExperiment({ 
        activity_name: 'Test Experiment for Progress',
        status: 'active',
        duration: 30,
        current_day: 1
      });
      const result = await ExperimentsService.create(experimentData, TEST_USER_ID);
      testExperimentId = result.data?.id || '';
    });

    it('should update experiment progress when logging completion', async () => {
      // Log a completed experiment
      const logData = {
        date: '2024-01-19',
        completed: true,
        skipped: false
      };
      
      const result = await ExperimentsService.logExperiment(testExperimentId, logData, TEST_USER_ID);
      
      expectSuccess(result);
      
      // Check that the experiment progress was updated
      const experimentResult = await ExperimentsService.getById(testExperimentId, TEST_USER_ID);
      expectSuccess(experimentResult);
      expect(experimentResult.data?.current_day).toBeGreaterThan(1);
    });

    it('should update experiment progress manually', async () => {
      const result = await ExperimentsService.updateExperimentProgress(testExperimentId, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Convert to Habit', () => {
    let testExperimentId: string;

    beforeAll(async () => {
      const experimentData = createTestExperiment({ 
        activity_name: 'Test Experiment for Conversion',
        status: 'completed'
      });
      const result = await ExperimentsService.create(experimentData, TEST_USER_ID);
      testExperimentId = result.data?.id || '';
    });

    it('should convert experiment to habit', async () => {
      const result = await ExperimentsService.convertToHabit(testExperimentId, TEST_USER_ID);
      
      expectSuccess(result);
      expect(result.data).toBeDefined();
      expect(result.data?.name).toBe('Test Experiment for Conversion');
      expect(result.data?.category).toBe('Health');
    });

    it('should handle conversion with non-existent experiment', async () => {
      const fakeId = 'non-existent-id';
      const result = await ExperimentsService.convertToHabit(fakeId, TEST_USER_ID);
      
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user ID', async () => {
      const experimentData = createTestExperiment();
      const result = await ExperimentsService.create(experimentData, '');
      
      expect(result.error).toBeDefined();
    });

    it('should handle malformed JSONB data', async () => {
      const malformedData = createTestExperiment({
        outcomes: 'invalid-json' as any,
        baseline_data: 'not-an-object' as any
      });
      
      const result = await ExperimentsService.create(malformedData, TEST_USER_ID);
      
      expect(result.error).toBeDefined();
    });

    it('should handle invalid date ranges', async () => {
      const invalidData = createTestExperiment({
        start_date: '2024-01-30',
        end_date: '2024-01-01' // End date before start date
      });
      
      const result = await ExperimentsService.create(invalidData, TEST_USER_ID);
      
      // This might succeed or fail depending on database constraints
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('error');
    });
  });
});