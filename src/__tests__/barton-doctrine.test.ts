import { BartonDoctrine, BartonDoctrineEnforcer, BartonDoctrineViolationError } from '../schemas/barton-doctrine-enforcer';
import { BartonDoctrineFormatter } from '../schemas/barton-doctrine-formatter';
import { withBartonDoctrine, DatabaseOperations } from '../middleware/barton-doctrine-middleware';

describe('Barton Doctrine Enforcement System', () => {
  beforeEach(() => {
    // Clear any previous violations for clean tests
    const enforcer = BartonDoctrineEnforcer.getInstance();
    enforcer.clearViolations();
  });

  describe('Schema Validation', () => {
    test('should validate compliant SPVPET payload', () => {
      const validPayload = BartonDoctrineFormatter.createBasePayload(
        'test_source',
        'test_process',
        { test: 'data' },
        { agent_id: 'test_agent', blueprint_id: 'test_blueprint', schema_version: '1.0.0' }
      );

      expect(() => {
        BartonDoctrine.validate(validPayload, 'test_tool');
      }).not.toThrow();
    });

    test('should reject invalid payload structure', () => {
      const invalidPayload = {
        invalid_field: 'test',
        missing_required_fields: true
      };

      expect(() => {
        BartonDoctrine.validate(invalidPayload, 'test_tool');
      }).toThrow(BartonDoctrineViolationError);
    });
  });

  describe('Database Format Conversion', () => {
    test('should format payload for Firebase (SPVPET)', () => {
      const basePayload = BartonDoctrineFormatter.createBasePayload(
        'firebase_test',
        'firebase_process',
        { firebase: 'data' },
        { agent_id: 'firebase_agent', blueprint_id: 'firebase_blueprint', schema_version: '1.0.0' }
      );

      const formatted = BartonDoctrine.formatFor(basePayload, 'firebase', 'test_tool');
      
      expect(formatted).toHaveProperty('source_id', 'firebase_test');
      expect(formatted).toHaveProperty('process_id', 'firebase_process');
      expect(formatted).toHaveProperty('validated');
      expect(formatted).toHaveProperty('execution_signature');
      expect(formatted).toHaveProperty('timestamp_last_touched');
    });

    test('should format payload for Neon (STAMPED)', () => {
      const basePayload = BartonDoctrineFormatter.createBasePayload(
        'neon_test',
        'neon_process',
        { neon: 'data' },
        { agent_id: 'neon_agent', blueprint_id: 'neon_blueprint', schema_version: '1.0.0' }
      );

      const formatted = BartonDoctrine.formatFor(basePayload, 'neon', 'test_tool');
      
      expect(formatted).toHaveProperty('source_id', 'neon_test');
      expect(formatted).toHaveProperty('task_id', 'neon_process');
      expect(formatted).toHaveProperty('approved');
      expect(formatted).toHaveProperty('process_signature');
      expect(formatted).toHaveProperty('event_timestamp');
    });

    test('should format payload for BigQuery (STACKED)', () => {
      const basePayload = BartonDoctrineFormatter.createBasePayload(
        'bigquery_test',
        'bigquery_process',
        { bigquery: 'data' },
        { agent_id: 'bigquery_agent', blueprint_id: 'bigquery_blueprint', schema_version: '1.0.0' }
      );

      const formatted = BartonDoctrine.formatFor(basePayload, 'bigquery', 'test_tool');
      
      expect(formatted).toHaveProperty('source_id', 'bigquery_test');
      expect(formatted).toHaveProperty('task_id', 'bigquery_process');
      expect(formatted).toHaveProperty('analytics_approved');
      expect(formatted).toHaveProperty('knowledge_signature');
      expect(formatted).toHaveProperty('event_timestamp');
    });
  });

  describe('Middleware Integration', () => {
    test('should create middleware for specific tool', () => {
      const middleware = withBartonDoctrine('test_tool');
      expect(middleware).toBeDefined();
    });

    test('should validate payload through middleware', () => {
      const middleware = withBartonDoctrine('middleware_test');
      
      const payload = BartonDoctrineFormatter.createBasePayload(
        'middleware_source',
        'middleware_process',
        { middleware: 'test' },
        { agent_id: 'middleware_agent', blueprint_id: 'middleware_blueprint', schema_version: '1.0.0' }
      );

      expect(() => {
        middleware.validate(payload, 'test_operation');
      }).not.toThrow();
    });
  });

  describe('Schema Consistency', () => {
    test('should maintain field mapping consistency across all formats', () => {
      const basePayload = BartonDoctrineFormatter.createBasePayload(
        'consistency_test',
        'consistency_process',
        { test: 'data' },
        { agent_id: 'consistency_agent', blueprint_id: 'consistency_blueprint', schema_version: '1.0.0' }
      );

      const firebaseFormat = BartonDoctrine.formatFor(basePayload, 'firebase', 'test');
      const neonFormat = BartonDoctrine.formatFor(basePayload, 'neon', 'test');
      const bigqueryFormat = BartonDoctrine.formatFor(basePayload, 'bigquery', 'test');

      // All should have the same source_id
      expect(firebaseFormat.source_id).toBe('consistency_test');
      expect(neonFormat.source_id).toBe('consistency_test');
      expect(bigqueryFormat.source_id).toBe('consistency_test');

      // Process ID should map correctly
      expect(firebaseFormat.process_id).toBe('consistency_process');
      expect(neonFormat.task_id).toBe('consistency_process'); // STAMPED uses task_id
      expect(bigqueryFormat.task_id).toBe('consistency_process'); // STACKED uses task_id
    });
  });
});
