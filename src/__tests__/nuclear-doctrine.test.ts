import { NUCLEAR_DOCTRINE, NuclearBartonDoctrine, NuclearBartonDoctrineViolationError } from '../core/nuclear-barton-doctrine';
import { BartonDoctrineFormatter } from '../schemas/barton-doctrine-formatter';

describe('Nuclear Barton Doctrine Enforcement', () => {
  beforeEach(() => {
    // Reset nuclear state before each test
    try {
      NUCLEAR_DOCTRINE.recovery('BARTON_DOCTRINE_EMERGENCY_OVERRIDE_2025');
    } catch {
      // Nuclear mode not active, that's fine
    }
  });

  describe('Nuclear Mode Activation', () => {
    test('should enable nuclear mode with zero tolerance', () => {
      expect(() => {
        NUCLEAR_DOCTRINE.enable();
      }).not.toThrow();

      const status = NUCLEAR_DOCTRINE.status();
      expect(status.nuclearMode).toBe(true);
      expect(status.maxViolations).toBe(1);
      expect(status.violationCount).toBe(0);
      expect(status.systemLocked).toBe(false);
    });

    test('should prevent double activation', () => {
      NUCLEAR_DOCTRINE.enable();
      
      expect(() => {
        NUCLEAR_DOCTRINE.enable();
      }).toThrow('NUCLEAR MODE ALREADY ACTIVE');
    });
  });

  describe('Nuclear Validation', () => {
    beforeEach(() => {
      NUCLEAR_DOCTRINE.enable();
    });

    test('should validate compliant payload in nuclear mode', () => {
      const validPayload = BartonDoctrineFormatter.createBasePayload(
        'nuclear_test',
        'nuclear_process',
        { test: 'data' },
        { agent_id: 'nuclear_agent', blueprint_id: 'nuclear_blueprint', schema_version: '1.0.0' }
      );

      expect(() => {
        NUCLEAR_DOCTRINE.validate(validPayload, 'nuclear_tool', 'test_operation');
      }).not.toThrow();
    });

    test('should trigger nuclear shutdown on first violation', () => {
      const invalidPayload = {
        invalid_field: 'test',
        missing_required_fields: true
      };

      // Mock process.exit to prevent actual shutdown
      const originalExit = process.exit;
      const mockExit = jest.fn();
      process.exit = mockExit;

      try {
        expect(() => {
          NUCLEAR_DOCTRINE.validate(invalidPayload, 'violating_tool', 'test_operation');
        }).toThrow(NuclearBartonDoctrineViolationError);

        // Check that system shutdown was triggered
        expect(mockExit).toHaveBeenCalledWith(255);
      } finally {
        process.exit = originalExit;
      }
    });

    test('should blacklist violating tools', () => {
      const invalidPayload = { invalid: 'data' };

      try {
        NUCLEAR_DOCTRINE.validate(invalidPayload, 'blacklisted_tool', 'test');
      } catch {
        // Expected to throw
      }

      const status = NUCLEAR_DOCTRINE.status();
      expect(status.blacklistedTools).toContain('blacklisted_tool');
    });
  });

  describe('Nuclear Database Operations', () => {
    beforeEach(() => {
      NUCLEAR_DOCTRINE.enable();
    });

    test('should perform nuclear Firebase operation', () => {
      const payload = BartonDoctrineFormatter.createBasePayload(
        'firebase_nuclear',
        'firebase_process',
        { firebase: 'nuclear_data' },
        { agent_id: 'firebase_nuclear_agent', blueprint_id: 'firebase_nuclear_blueprint', schema_version: '1.0.0' }
      );

      const result = NUCLEAR_DOCTRINE.database('firebase', payload, 'firebase_nuclear_tool');
      
      expect(result).toHaveProperty('source_id', 'firebase_nuclear');
      expect(result).toHaveProperty('process_id', 'firebase_process');
      expect(result).toHaveProperty('validated');
      expect(result).toHaveProperty('execution_signature');
    });

    test('should perform nuclear Neon operation', () => {
      const payload = BartonDoctrineFormatter.createBasePayload(
        'neon_nuclear',
        'neon_process',
        { neon: 'nuclear_data' },
        { agent_id: 'neon_nuclear_agent', blueprint_id: 'neon_nuclear_blueprint', schema_version: '1.0.0' }
      );

      const result = NUCLEAR_DOCTRINE.database('neon', payload, 'neon_nuclear_tool');
      
      expect(result).toHaveProperty('source_id', 'neon_nuclear');
      expect(result).toHaveProperty('task_id', 'neon_process');
      expect(result).toHaveProperty('approved');
      expect(result).toHaveProperty('process_signature');
    });

    test('should perform nuclear BigQuery operation', () => {
      const payload = BartonDoctrineFormatter.createBasePayload(
        'bigquery_nuclear',
        'bigquery_process',
        { bigquery: 'nuclear_data' },
        { agent_id: 'bigquery_nuclear_agent', blueprint_id: 'bigquery_nuclear_blueprint', schema_version: '1.0.0' }
      );

      const result = NUCLEAR_DOCTRINE.database('bigquery', payload, 'bigquery_nuclear_tool');
      
      expect(result).toHaveProperty('source_id', 'bigquery_nuclear');
      expect(result).toHaveProperty('task_id', 'bigquery_process');
      expect(result).toHaveProperty('analytics_approved');
      expect(result).toHaveProperty('knowledge_signature');
    });
  });

  describe('Nuclear Recovery', () => {
    test('should allow manual recovery with correct authorization', () => {
      NUCLEAR_DOCTRINE.enable();
      
      // Trigger a violation to lock the system
      try {
        NUCLEAR_DOCTRINE.validate({ invalid: 'data' }, 'recovery_test_tool', 'test');
      } catch {
        // Expected to throw
      }

      // Perform manual recovery
      expect(() => {
        NUCLEAR_DOCTRINE.recovery('BARTON_DOCTRINE_EMERGENCY_OVERRIDE_2025');
      }).not.toThrow();

      const status = NUCLEAR_DOCTRINE.status();
      expect(status.nuclearMode).toBe(false);
      expect(status.violationCount).toBe(0);
      expect(status.systemLocked).toBe(false);
      expect(status.blacklistedTools).toHaveLength(0);
    });

    test('should reject recovery with incorrect authorization', () => {
      NUCLEAR_DOCTRINE.enable();
      
      expect(() => {
        NUCLEAR_DOCTRINE.recovery('WRONG_CODE');
      }).toThrow('INVALID AUTHORIZATION CODE');
    });
  });

  describe('Nuclear Status Monitoring', () => {
    test('should provide comprehensive nuclear status', () => {
      NUCLEAR_DOCTRINE.enable();
      
      const status = NUCLEAR_DOCTRINE.status();
      
      expect(status).toHaveProperty('nuclearMode');
      expect(status).toHaveProperty('violationCount');
      expect(status).toHaveProperty('maxViolations');
      expect(status).toHaveProperty('systemLocked');
      expect(status).toHaveProperty('blacklistedTools');
      expect(status).toHaveProperty('nuclearLog');
      
      expect(status.nuclearMode).toBe(true);
      expect(status.maxViolations).toBe(1);
    });
  });
}); 