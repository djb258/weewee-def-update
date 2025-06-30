import { MakeIntegration } from '../../scripts/make_integration';
import { validateMakeConfig, validateMakeScenario, validateMakeExecution } from '../schemas/blueprint-schemas';

// Mock axios to avoid actual HTTP requests
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
}));

describe('Make.com Integration Tests', () => {
  const mockConfig = {
    apiKey: 'test-api-key',
    baseUrl: 'https://www.make.com/api/v2',
    timeout: 30000,
    retryAttempts: 3,
  };

  const mockScenario = {
    id: 123,
    name: 'Test Scenario',
    description: 'A test scenario',
    status: 'active' as const,
    flow: [{ step: 'webhook', config: {} }],
    connections: [{ id: 1, type: 'webhook' }],
    metadata: { test: 'value' },
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockExecution = {
    id: 456,
    scenario_id: 123,
    status: 'completed' as const,
    input_data: { test: 'input' },
    output_data: { test: 'output' },
    created_at: new Date(),
    updated_at: new Date(),
    completed_at: new Date(),
  };

  const mockConnection = {
    id: 789,
    name: 'Test Connection',
    type: 'webhook' as const,
    status: 'active' as const,
    config: { url: 'https://example.com/webhook' },
    metadata: { test: 'value' },
    created_at: new Date(),
    updated_at: new Date(),
  };

  describe('Configuration Validation', () => {
    test('should validate correct Make.com config', () => {
      expect(() => validateMakeConfig(mockConfig)).not.toThrow();
    });

    test('should reject invalid API key', () => {
      const invalidConfig = { ...mockConfig, apiKey: '' };
      expect(() => validateMakeConfig(invalidConfig)).toThrow();
    });

    test('should reject invalid base URL', () => {
      const invalidConfig = { ...mockConfig, baseUrl: 'invalid-url' };
      expect(() => validateMakeConfig(invalidConfig)).toThrow();
    });
  });

  describe('Scenario Validation', () => {
    test('should validate correct scenario data', () => {
      expect(() => validateMakeScenario(mockScenario)).not.toThrow();
    });

    test('should reject invalid scenario status', () => {
      const invalidScenario = { ...mockScenario, status: 'invalid' as never };
      expect(() => validateMakeScenario(invalidScenario)).toThrow();
    });

    test('should reject invalid scenario ID', () => {
      const invalidScenario = { ...mockScenario, id: -1 };
      expect(() => validateMakeScenario(invalidScenario)).toThrow();
    });
  });

  describe('Execution Validation', () => {
    test('should validate correct execution data', () => {
      expect(() => validateMakeExecution(mockExecution)).not.toThrow();
    });

    test('should reject invalid execution status', () => {
      const invalidExecution = { ...mockExecution, status: 'invalid' as never };
      expect(() => validateMakeExecution(invalidExecution)).toThrow();
    });
  });

  describe('Make.com Integration Class', () => {
    let make: MakeIntegration;

    beforeEach(() => {
      make = new MakeIntegration(mockConfig);
      jest.clearAllMocks();
    });

    test('should create Make.com integration instance', () => {
      expect(make).toBeInstanceOf(MakeIntegration);
    });

    test('should perform health check', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { status: 'healthy', version: '2.0.0' }
      });

      const healthResult = await make.healthCheck();
      expect(healthResult).toHaveProperty('status');
      expect(healthResult).toHaveProperty('timestamp');
      expect(healthResult.status).toBe('healthy');
    });

    test('should handle health check failure gracefully', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      const healthResult = await make.healthCheck();
      expect(healthResult).toHaveProperty('status');
      expect(healthResult).toHaveProperty('timestamp');
      expect(healthResult.status).toBe('unhealthy');
    });

    test('should create scenario successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockScenario
      });

      const scenarioData = {
        name: 'Test Scenario',
        description: 'A test scenario',
        status: 'active' as const,
        flow: [{ step: 'webhook', config: {} }],
        connections: [{ id: 1, type: 'webhook' }],
        metadata: { test: 'value' },
      };

      const result = await make.createScenario(scenarioData);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('status');
      expect(result.id).toBe(123);
    });

    test('should get scenarios successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: [mockScenario]
      });

      const result = await make.getScenarios();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('status');
    });

    test('should get specific scenario', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockScenario
      });

      const result = await make.getScenario(123);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('status');
      expect(result.id).toBe(123);
    });

    test('should execute scenario successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockExecution
      });

      const result = await make.executeScenario(123, { test: 'input' });
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('scenario_id');
      expect(result).toHaveProperty('status');
      expect(result.scenario_id).toBe(123);
    });

    test('should process blueprint with Make.com', async () => {
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
        data: { ...mockExecution, id: 789 }
      });

      mockAxiosInstance.get.mockResolvedValue({
        data: { ...mockExecution, status: 'completed' }
      });

      const result = await make.processBlueprintWithMake(blueprintData, 123);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('executionId');
      expect(result.success).toBe(true);
    });

    test('should set up blueprint automation', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          id: 'integration-001',
          blueprint_id: 'bp-001',
          scenario_id: 123,
          integration_type: 'automation',
          config: { auto_trigger: true },
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        }
      });

      const result = await make.setupBlueprintAutomation('bp-001', 123, {
        auto_trigger: true,
        trigger_conditions: ['blueprint_updated'],
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('integration_type');
    });

    test('should create connection successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockConnection
      });

      const connectionData = {
        name: 'Test Connection',
        type: 'webhook' as const,
        status: 'active' as const,
        config: { url: 'https://example.com/webhook' },
        metadata: { test: 'value' },
      };

      const result = await make.createConnection(connectionData);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('type');
      expect(result.id).toBe(789);
    });

    test('should get connections successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: [mockConnection]
      });

      const result = await make.getConnections();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('type');
    });

    test('should create webhook successfully', async () => {
      const mockWebhook = {
        id: 999,
        url: 'https://webhook.make.com/abc123',
        secret: 'webhook-secret-key',
      };

      mockAxiosInstance.post.mockResolvedValue({
        data: mockWebhook
      });

      const webhookData = {
        name: 'Blueprint Webhook',
        url: 'https://example.com/webhook',
        events: ['blueprint.created', 'blueprint.updated'],
        headers: { 'X-Custom-Header': 'value' },
      };

      const result = await make.createWebhook(webhookData);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('secret');
      expect(result.id).toBe(999);
    });

    test('should get scenario metrics', async () => {
      const mockMetrics = {
        total_executions: 50,
        successful_executions: 45,
        failed_executions: 5,
        average_duration: 3000,
        last_execution: new Date().toISOString(),
      };

      mockAxiosInstance.get.mockResolvedValue({
        data: mockMetrics
      });

      const result = await make.getScenarioMetrics(123);
      expect(result).toHaveProperty('total_executions');
      expect(result).toHaveProperty('successful_executions');
      expect(result).toHaveProperty('failed_executions');
      expect(result).toHaveProperty('average_duration');
      expect(result).toHaveProperty('last_execution');
    });

    test('should update scenario status', async () => {
      mockAxiosInstance.patch.mockResolvedValue({
        data: { ...mockScenario, status: 'inactive' }
      });

      const result = await make.updateScenarioStatus(123, 'inactive');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('status');
      expect(result.status).toBe('inactive');
    });

    test('should delete scenario successfully', async () => {
      mockAxiosInstance.delete.mockResolvedValue({
        status: 204
      });

      const result = await make.deleteScenario(123);
      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
    });
  });
}); 