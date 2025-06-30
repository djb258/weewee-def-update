import { MindPalIntegration } from '../../scripts/mindpal_integration';
import { validateMindPalConfig, validateMindPalAgent, validateMindPalTask } from '../schemas/blueprint-schemas';

// Mock axios to avoid actual HTTP requests
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
}));

describe('MindPal Integration Tests', () => {
  const mockConfig = {
    apiKey: 'test-api-key',
    baseUrl: 'https://api.mindpal.com',
    timeout: 30000,
    retryAttempts: 3,
  };

  const mockAgent = {
    id: 'agent-001',
    name: 'Test Agent',
    type: 'blueprint_validator' as const,
    status: 'active' as const,
    capabilities: ['validation', 'analysis'],
    metadata: { test: 'value' },
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockTask = {
    id: 'task-001',
    agent_id: 'agent-001',
    blueprint_id: 'bp-001',
    task_type: 'validate' as const,
    payload: { test: 'data' },
    status: 'pending' as const,
    created_at: new Date(),
    updated_at: new Date(),
  };

  describe('Configuration Validation', () => {
    test('should validate correct MindPal config', () => {
      expect(() => validateMindPalConfig(mockConfig)).not.toThrow();
    });

    test('should reject invalid API key', () => {
      const invalidConfig = { ...mockConfig, apiKey: '' };
      expect(() => validateMindPalConfig(invalidConfig)).toThrow();
    });

    test('should reject invalid base URL', () => {
      const invalidConfig = { ...mockConfig, baseUrl: 'invalid-url' };
      expect(() => validateMindPalConfig(invalidConfig)).toThrow();
    });
  });

  describe('Agent Validation', () => {
    test('should validate correct agent data', () => {
      expect(() => validateMindPalAgent(mockAgent)).not.toThrow();
    });

    test('should reject invalid agent type', () => {
      const invalidAgent = { ...mockAgent, type: 'invalid' as never };
      expect(() => validateMindPalAgent(invalidAgent)).toThrow();
    });

    test('should reject invalid status', () => {
      const invalidAgent = { ...mockAgent, status: 'invalid' as never };
      expect(() => validateMindPalAgent(invalidAgent)).toThrow();
    });
  });

  describe('Task Validation', () => {
    test('should validate correct task data', () => {
      expect(() => validateMindPalTask(mockTask)).not.toThrow();
    });

    test('should reject invalid task type', () => {
      const invalidTask = { ...mockTask, task_type: 'invalid' as never };
      expect(() => validateMindPalTask(invalidTask)).toThrow();
    });

    test('should reject invalid status', () => {
      const invalidTask = { ...mockTask, status: 'invalid' as never };
      expect(() => validateMindPalTask(invalidTask)).toThrow();
    });
  });

  describe('MindPal Integration Class', () => {
    let mindPal: MindPalIntegration;

    beforeEach(() => {
      mindPal = new MindPalIntegration(mockConfig);
      // Reset all mocks before each test
      jest.clearAllMocks();
    });

    test('should create MindPal integration instance', () => {
      expect(mindPal).toBeInstanceOf(MindPalIntegration);
    });

    test('should perform health check', async () => {
      // Mock successful health check response
      mockAxiosInstance.get.mockResolvedValue({
        data: { status: 'healthy', version: '1.0.0' }
      });

      const healthResult = await mindPal.healthCheck();
      expect(healthResult).toHaveProperty('status');
      expect(healthResult).toHaveProperty('timestamp');
      expect(healthResult.status).toBe('healthy');
    });

    test('should handle health check failure gracefully', async () => {
      // Mock failed health check
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      const healthResult = await mindPal.healthCheck();
      expect(healthResult).toHaveProperty('status');
      expect(healthResult).toHaveProperty('timestamp');
      expect(healthResult.status).toBe('unhealthy');
    });

    test('should validate blueprint with MindPal', async () => {
      const blueprintData = {
        id: 'bp-001',
        name: 'Test Blueprint',
        version: '1.0.0',
        status: 'active',
        author: 'Test User',
        timestamp: new Date().toISOString(),
      };

      // Mock successful task creation and processing
      mockAxiosInstance.post.mockResolvedValue({
        data: { ...mockTask, id: 'task-002' }
      });

      mockAxiosInstance.patch.mockResolvedValue({
        data: { ...mockTask, status: 'completed' }
      });

      const result = await mindPal.validateBlueprintWithMindPal(blueprintData, 'agent-001');
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('suggestions');
      expect(result.isValid).toBe(true);
    });

    test('should create agent successfully', async () => {
      // Mock successful agent creation
      mockAxiosInstance.post.mockResolvedValue({
        data: mockAgent
      });

      const agentData = {
        name: 'Test Agent',
        type: 'blueprint_validator' as const,
        status: 'active' as const,
        capabilities: ['validation', 'analysis'],
        metadata: { test: 'value' },
      };

      const result = await mindPal.createAgent(agentData);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('capabilities');
    });
  });
}); 