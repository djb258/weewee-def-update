import { DeerFlowIntegration } from '../../scripts/deerflow_integration';
import { validateDeerFlowConfig, validateDeerFlowWorkflow, validateDeerFlowExecution } from '../schemas/blueprint-schemas';

// Mock axios to avoid actual HTTP requests
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
}));

describe('DeerFlow Integration Tests', () => {
  const mockConfig = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.deerflow.com',
    timeout: 30000,
    retryAttempts: 3,
  };

  const mockWorkflow = {
    id: 'workflow-001',
    name: 'Test Workflow',
    description: 'A test workflow',
    status: 'active' as const,
    type: 'data_pipeline' as const,
    triggers: ['blueprint_updated'],
    steps: [{ step: 'validate', config: {} }],
    metadata: { test: 'value' },
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockExecution = {
    id: 'execution-001',
    workflow_id: 'workflow-001',
    status: 'completed' as const,
    input_data: { test: 'input' },
    output_data: { test: 'output' },
    created_at: new Date(),
    updated_at: new Date(),
    completed_at: new Date(),
  };

  describe('Configuration Validation', () => {
    test('should validate correct DeerFlow config', () => {
      expect(() => validateDeerFlowConfig(mockConfig)).not.toThrow();
    });

    test('should reject invalid API key', () => {
      const invalidConfig = { ...mockConfig, apiKey: '' };
      expect(() => validateDeerFlowConfig(invalidConfig)).toThrow();
    });

    test('should reject invalid base URL', () => {
      const invalidConfig = { ...mockConfig, baseUrl: 'invalid-url' };
      expect(() => validateDeerFlowConfig(invalidConfig)).toThrow();
    });
  });

  describe('Workflow Validation', () => {
    test('should validate correct workflow data', () => {
      expect(() => validateDeerFlowWorkflow(mockWorkflow)).not.toThrow();
    });

    test('should reject invalid workflow type', () => {
      const invalidWorkflow = { ...mockWorkflow, type: 'invalid' as never };
      expect(() => validateDeerFlowWorkflow(invalidWorkflow)).toThrow();
    });

    test('should reject invalid status', () => {
      const invalidWorkflow = { ...mockWorkflow, status: 'invalid' as never };
      expect(() => validateDeerFlowWorkflow(invalidWorkflow)).toThrow();
    });
  });

  describe('Execution Validation', () => {
    test('should validate correct execution data', () => {
      expect(() => validateDeerFlowExecution(mockExecution)).not.toThrow();
    });

    test('should reject invalid execution status', () => {
      const invalidExecution = { ...mockExecution, status: 'invalid' as never };
      expect(() => validateDeerFlowExecution(invalidExecution)).toThrow();
    });
  });

  describe('DeerFlow Integration Class', () => {
    let deerFlow: DeerFlowIntegration;

    beforeEach(() => {
      deerFlow = new DeerFlowIntegration(mockConfig);
      jest.clearAllMocks();
    });

    test('should create DeerFlow integration instance', () => {
      expect(deerFlow).toBeInstanceOf(DeerFlowIntegration);
    });

    test('should perform health check', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { status: 'healthy', version: '1.0.0' }
      });

      const healthResult = await deerFlow.healthCheck();
      expect(healthResult).toHaveProperty('status');
      expect(healthResult).toHaveProperty('timestamp');
      expect(healthResult.status).toBe('healthy');
    });

    test('should handle health check failure gracefully', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      const healthResult = await deerFlow.healthCheck();
      expect(healthResult).toHaveProperty('status');
      expect(healthResult).toHaveProperty('timestamp');
      expect(healthResult.status).toBe('unhealthy');
    });

    test('should create workflow successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockWorkflow
      });

      const workflowData = {
        name: 'Test Workflow',
        description: 'A test workflow',
        type: 'data_pipeline' as const,
        status: 'active' as const,
        triggers: ['blueprint_updated'],
        steps: [{ step: 'validate', config: {} }],
        metadata: { test: 'value' },
      };

      const result = await deerFlow.createWorkflow(workflowData);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('status');
    });

    test('should process blueprint with DeerFlow', async () => {
      const blueprintData = {
        id: 'bp-001',
        name: 'Test Blueprint',
        version: '1.0.0',
        status: 'active',
        author: 'Test User',
        timestamp: new Date().toISOString(),
      };

      // Mock successful execution
      mockAxiosInstance.post.mockResolvedValue({
        data: { ...mockExecution, id: 'execution-002' }
      });

      mockAxiosInstance.get.mockResolvedValue({
        data: { ...mockExecution, status: 'completed' }
      });

      const result = await deerFlow.processBlueprintWithDeerFlow(blueprintData, 'workflow-001');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('executionId');
      expect(result.success).toBe(true);
    });

    test('should set up blueprint automation', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          id: 'integration-001',
          blueprint_id: 'bp-001',
          workflow_id: 'workflow-001',
          integration_type: 'automation',
          config: { auto_trigger: true },
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        }
      });

      const result = await deerFlow.setupBlueprintAutomation('bp-001', 'workflow-001', {
        auto_trigger: true,
        trigger_conditions: ['blueprint_updated'],
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('integration_type');
    });

    test('should get workflow metrics', async () => {
      const mockMetrics = {
        total_executions: 10,
        successful_executions: 8,
        failed_executions: 2,
        average_duration: 5000,
        last_execution: new Date().toISOString(),
      };

      mockAxiosInstance.get.mockResolvedValue({
        data: mockMetrics
      });

      const result = await deerFlow.getWorkflowMetrics('workflow-001');
      expect(result).toHaveProperty('total_executions');
      expect(result).toHaveProperty('successful_executions');
      expect(result).toHaveProperty('failed_executions');
      expect(result).toHaveProperty('average_duration');
      expect(result).toHaveProperty('last_execution');
    });
  });
}); 