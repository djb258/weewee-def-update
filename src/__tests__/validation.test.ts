import { 
  validateBlueprintForNeon, 
  validateBlueprintForFirebase, 
  validateBlueprintForBigQuery,
  validateAgentTask,
  validateErrorLog,
  validateHumanFirebreakQueue
} from '../schemas/blueprint-schemas';

describe('Blueprint Validation Tests', () => {
  const validBlueprint = {
    id: 'bp-001',
    name: 'Test Blueprint',
    version: '1.0.0',
    status: 'active' as const,
    author: 'Test User',
    timestamp: new Date().toISOString(),
    description: 'A test blueprint',
    category: 'test',
    priority: 'medium' as const,
    tags: ['test', 'sample'],
    metadata: {
      testField: 'testValue'
    }
  };

  describe('Neon Validation', () => {
    test('should validate correct blueprint data', () => {
      expect(() => validateBlueprintForNeon(validBlueprint)).not.toThrow();
    });

    test('should reject invalid version format', () => {
      const invalidBlueprint = { ...validBlueprint, version: 'invalid' };
      expect(() => validateBlueprintForNeon(invalidBlueprint)).toThrow();
    });

    test('should reject invalid status', () => {
      const invalidBlueprint = { ...validBlueprint, status: 'invalid' as never };
      expect(() => validateBlueprintForNeon(invalidBlueprint)).toThrow();
    });

    test('should reject missing required fields', () => {
      const invalidBlueprint = { ...validBlueprint };
      delete (invalidBlueprint as Record<string, unknown>).id;
      expect(() => validateBlueprintForNeon(invalidBlueprint)).toThrow();
    });
  });

  describe('Firebase Validation', () => {
    test('should validate correct blueprint data', () => {
      expect(() => validateBlueprintForFirebase(validBlueprint)).not.toThrow();
    });

    test('should accept blueprint with firebase_id', () => {
      const firebaseBlueprint = { ...validBlueprint, firebase_id: 'firebase-123' };
      expect(() => validateBlueprintForFirebase(firebaseBlueprint)).not.toThrow();
    });

    test('should reject invalid timestamp format', () => {
      const invalidBlueprint = { ...validBlueprint, timestamp: 'invalid-date' };
      expect(() => validateBlueprintForFirebase(invalidBlueprint)).toThrow();
    });
  });

  describe('BigQuery Validation', () => {
    test('should validate correct blueprint data', () => {
      expect(() => validateBlueprintForBigQuery(validBlueprint)).not.toThrow();
    });

    test('should accept blueprint with BigQuery specific fields', () => {
      const bigqueryBlueprint = { 
        ...validBlueprint, 
        dataset_id: 'my_dataset',
        table_id: 'my_table',
        partition_date: '2024-01-01'
      };
      expect(() => validateBlueprintForBigQuery(bigqueryBlueprint)).not.toThrow();
    });
  });

  describe('Agent Task Validation', () => {
    const validAgentTask = {
      id: 'task-001',
      blueprint_id: 'bp-001',
      agent_id: 'agent-001',
      status: 'pending' as const,
      task_type: 'validation',
      created_at: new Date(),
      updated_at: new Date()
    };

    test('should validate correct agent task data', () => {
      expect(() => validateAgentTask(validAgentTask)).not.toThrow();
    });

    test('should reject invalid status', () => {
      const invalidTask = { ...validAgentTask, status: 'invalid' as never };
      expect(() => validateAgentTask(invalidTask)).toThrow();
    });
  });

  describe('Error Log Validation', () => {
    const validErrorLog = {
      id: 'error-001',
      timestamp: new Date(),
      level: 'error' as const,
      message: 'Test error message'
    };

    test('should validate correct error log data', () => {
      expect(() => validateErrorLog(validErrorLog)).not.toThrow();
    });

    test('should reject invalid log level', () => {
      const invalidLog = { ...validErrorLog, level: 'invalid' as never };
      expect(() => validateErrorLog(invalidLog)).toThrow();
    });
  });

  describe('Human Firebreak Queue Validation', () => {
    const validQueueItem = {
      id: 'queue-001',
      blueprint_id: 'bp-001',
      priority: 'high' as const,
      status: 'queued' as const,
      description: 'Test queue item',
      created_at: new Date(),
      updated_at: new Date()
    };

    test('should validate correct queue item data', () => {
      expect(() => validateHumanFirebreakQueue(validQueueItem)).not.toThrow();
    });

    test('should reject invalid priority', () => {
      const invalidItem = { ...validQueueItem, priority: 'invalid' as never };
      expect(() => validateHumanFirebreakQueue(invalidItem)).toThrow();
    });
  });
}); 