import { RenderIntegration } from '../../scripts/render_integration';
import { validateRenderConfig, validateRenderService, validateRenderDeployment } from '../schemas/blueprint-schemas';

// Mock axios to avoid actual HTTP requests
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
};

jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
}));

describe('Render Integration Tests', () => {
  const mockConfig = {
    apiKey: 'test-api-key',
    webhookUrl: 'https://api.render.com/webhook',
    baseUrl: 'https://api.render.com',
    timeout: 30000,
    retryAttempts: 3,
  };

  const mockService = {
    id: 'service-001',
    name: 'Test Service',
    type: 'web_service' as const,
    status: 'live' as const,
    service_details: {
      url: 'https://test-service.onrender.com',
      environment: 'production' as const,
      region: 'us-east-1',
      plan: 'starter',
    },
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockDeployment = {
    id: 'deployment-001',
    service_id: 'service-001',
    status: 'live' as const,
    commit: {
      id: 'abc123',
      message: 'Test deployment',
      author: 'Test User',
    },
    environment: 'production' as const,
    created_at: new Date(),
    updated_at: new Date(),
    finished_at: new Date(),
  };

  describe('Configuration Validation', () => {
    test('should validate correct Render config', () => {
      expect(() => validateRenderConfig(mockConfig)).not.toThrow();
    });

    test('should reject invalid API key', () => {
      const invalidConfig = { ...mockConfig, apiKey: '' };
      expect(() => validateRenderConfig(invalidConfig)).toThrow();
    });

    test('should reject invalid webhook URL', () => {
      const invalidConfig = { ...mockConfig, webhookUrl: 'invalid-url' };
      expect(() => validateRenderConfig(invalidConfig)).toThrow();
    });
  });

  describe('Service Validation', () => {
    test('should validate correct service data', () => {
      expect(() => validateRenderService(mockService)).not.toThrow();
    });

    test('should reject invalid service type', () => {
      const invalidService = { ...mockService, type: 'invalid' as never };
      expect(() => validateRenderService(invalidService)).toThrow();
    });

    test('should reject invalid service status', () => {
      const invalidService = { ...mockService, status: 'invalid' as never };
      expect(() => validateRenderService(invalidService)).toThrow();
    });
  });

  describe('Deployment Validation', () => {
    test('should validate correct deployment data', () => {
      expect(() => validateRenderDeployment(mockDeployment)).not.toThrow();
    });

    test('should reject invalid deployment status', () => {
      const invalidDeployment = { ...mockDeployment, status: 'invalid' as never };
      expect(() => validateRenderDeployment(invalidDeployment)).toThrow();
    });
  });

  describe('Render Integration Class', () => {
    let render: RenderIntegration;

    beforeEach(() => {
      render = new RenderIntegration(mockConfig);
      jest.clearAllMocks();
    });

    test('should create Render integration instance', () => {
      expect(render).toBeInstanceOf(RenderIntegration);
    });

    test('should perform health check', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: { status: 'healthy', version: '1.0.0' }
      });

      const healthResult = await render.healthCheck();
      expect(healthResult).toHaveProperty('status');
      expect(healthResult).toHaveProperty('timestamp');
      expect(healthResult.status).toBe('healthy');
    });

    test('should handle health check failure gracefully', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      const healthResult = await render.healthCheck();
      expect(healthResult).toHaveProperty('status');
      expect(healthResult).toHaveProperty('timestamp');
      expect(healthResult.status).toBe('unhealthy');
    });

    test('should trigger deployment successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        status: 200,
        data: { success: true, deployment_id: 'deployment-001' }
      });

      const result = await render.triggerDeployment({
        action: 'deploy',
        environment: 'production',
        service_id: 'service-001',
      });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('statusCode');
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
    });

    test('should handle deployment trigger failure', async () => {
      mockAxiosInstance.post.mockRejectedValue(new Error('Deployment failed'));

      const result = await render.triggerDeployment();
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('statusCode');
      expect(result.success).toBe(false);
    });

    test('should get services successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: [mockService]
      });

      const result = await render.getServices();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('type');
    });

    test('should get specific service', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockService
      });

      const result = await render.getService('service-001');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('type');
      expect(result.id).toBe('service-001');
    });

    test('should get service deployments', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: [mockDeployment]
      });

      const result = await render.getDeployments('service-001');
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('service_id');
      expect(result[0]).toHaveProperty('status');
    });

    test('should create deployment successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: mockDeployment
      });

      const result = await render.createDeployment('service-001', {
        environment: 'production',
        branch: 'main',
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('service_id');
      expect(result).toHaveProperty('status');
      expect(result.service_id).toBe('service-001');
    });

    test('should deploy blueprint successfully', async () => {
      const blueprintData = {
        id: 'bp-001',
        name: 'Test Blueprint',
        version: '1.0.0',
        status: 'active',
        author: 'Test User',
        timestamp: new Date().toISOString(),
      };

      // Mock deployment creation
      mockAxiosInstance.post.mockResolvedValue({
        data: { ...mockDeployment, id: 'deployment-002' }
      });

      // Mock deployment status checks
      mockAxiosInstance.get
        .mockResolvedValueOnce({ data: { ...mockDeployment, status: 'building' } })
        .mockResolvedValueOnce({ data: { ...mockDeployment, status: 'live' } });

      // Mock service details with proper data
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          id: 'service-001',
          name: 'Test Service',
          type: 'web_service',
          status: 'live',
          service_details: {
            url: 'https://test-service.onrender.com',
            environment: 'production',
            region: 'us-east-1',
            plan: 'starter',
          },
          created_at: new Date(),
          updated_at: new Date(),
        }
      });

      const result = await render.deployBlueprint(blueprintData, 'service-001');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('deploymentId');
      expect(result.success).toBe(true);
    });

    test('should set up blueprint deployment automation', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        status: 200,
        data: { success: true }
      });

      const result = await render.setupBlueprintDeployment('bp-001', 'service-001', {
        autoDeploy: true,
        environment: 'production',
        branch: 'main',
      });

      expect(result).toHaveProperty('success');
      expect(result.success).toBe(true);
    });

    test('should get deployment logs', async () => {
      const mockLogs = {
        logs: 'Build successful\nDeployment completed',
      };

      mockAxiosInstance.get.mockResolvedValue({
        data: mockLogs
      });

      const result = await render.getDeploymentLogs('service-001', 'deployment-001');
      expect(result).toHaveProperty('logs');
      expect(result).toHaveProperty('timestamp');
      expect(result.logs).toBe(mockLogs.logs);
    });

    test('should restart service successfully', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: { deployment_id: 'deployment-003' }
      });

      const result = await render.restartService('service-001');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('deploymentId');
      expect(result.success).toBe(true);
    });
  });
}); 