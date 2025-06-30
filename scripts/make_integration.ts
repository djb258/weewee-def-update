import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';

// 🔒 MANDATORY: Barton Doctrine enforcement
import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';


// Make.com Configuration Schema
export const MakeConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  baseUrl: z.string().url('Base URL must be a valid URL').default('https://www.make.com/api/v2'),
  timeout: z.number().positive().default(30000),
  retryAttempts: z.number().int().min(0).max(5).default(3),
});

export type MakeConfig = z.infer<typeof MakeConfigSchema>;

// Make.com Scenario Schema
export const MakeScenarioSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1, 'Scenario name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft', 'error']),
  flow: z.array(z.record(z.unknown())).optional(),
  connections: z.array(z.record(z.unknown())).optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type MakeScenario = z.infer<typeof MakeScenarioSchema>;

// Make.com Execution Schema
export const MakeExecutionSchema = z.object({
  id: z.number().positive(),
  scenario_id: z.number().positive(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  input_data: z.record(z.unknown()).optional(),
  output_data: z.record(z.unknown()).optional(),
  error_message: z.string().optional(),
  started_at: z.date().optional(),
  completed_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type MakeExecution = z.infer<typeof MakeExecutionSchema>;

// Make.com Connection Schema
export const MakeConnectionSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1, 'Connection name is required'),
  type: z.enum(['webhook', 'api', 'database', 'file', 'email', 'custom']),
  status: z.enum(['active', 'inactive', 'error']),
  config: z.record(z.unknown()),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type MakeConnection = z.infer<typeof MakeConnectionSchema>;

// Make.com Blueprint Integration Schema
export const MakeBlueprintIntegrationSchema = z.object({
  id: z.string().min(1, 'Integration ID is required'),
  blueprint_id: z.string().min(1, 'Blueprint ID is required'),
  scenario_id: z.number().positive(),
  integration_type: z.enum(['validation', 'processing', 'monitoring', 'automation']),
  config: z.record(z.unknown()),
  status: z.enum(['active', 'inactive', 'error']),
  last_execution: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type MakeBlueprintIntegration = z.infer<typeof MakeBlueprintIntegrationSchema>;


// 🔒 MANDATORY: Initialize Barton Doctrine (CANNOT BE SKIPPED)
const doctrine = START_WITH_BARTON_DOCTRINE('make');

export class MakeIntegration {
  private config: MakeConfig;
  private client: AxiosInstance;

  constructor(config: MakeConfig) {
    this.config = MakeConfigSchema.parse(config);
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Token ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a new Make.com scenario
   */
  async createScenario(scenarioData: Omit<MakeScenario, 'id' | 'created_at' | 'updated_at'>): Promise<MakeScenario> {
    try {
      const response = await this.client.post('/scenarios', {
        ...scenarioData,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return MakeScenarioSchema.parse(response.data);
    } catch (error) {
      console.error('Error creating Make.com scenario:', error);
      throw new Error(`Failed to create Make.com scenario: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all Make.com scenarios
   */
  async getScenarios(): Promise<MakeScenario[]> {
    try {
      const response = await this.client.get('/scenarios');
      return z.array(MakeScenarioSchema).parse(response.data);
    } catch (error) {
      console.error('Error fetching Make.com scenarios:', error);
      throw new Error(`Failed to fetch Make.com scenarios: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific Make.com scenario
   */
  async getScenario(scenarioId: number): Promise<MakeScenario> {
    try {
      const response = await this.client.get(`/scenarios/${scenarioId}`);
      return MakeScenarioSchema.parse(response.data);
    } catch (error) {
      console.error('Error fetching Make.com scenario:', error);
      throw new Error(`Failed to fetch Make.com scenario: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute a Make.com scenario
   */
  async executeScenario(scenarioId: number, inputData?: Record<string, unknown>): Promise<MakeExecution> {
    try {
      const response = await this.client.post(`/scenarios/${scenarioId}/executions`, {
        input_data: inputData || {},
        created_at: new Date(),
        updated_at: new Date(),
      });

      return MakeExecutionSchema.parse(response.data);
    } catch (error) {
      console.error('Error executing Make.com scenario:', error);
      throw new Error(`Failed to execute Make.com scenario: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get scenario execution status
   */
  async getExecutionStatus(executionId: number): Promise<MakeExecution> {
    try {
      const response = await this.client.get(`/executions/${executionId}`);
      return MakeExecutionSchema.parse(response.data);
    } catch (error) {
      console.error('Error fetching execution status:', error);
      throw new Error(`Failed to fetch execution status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get scenario executions
   */
  async getScenarioExecutions(scenarioId: number): Promise<MakeExecution[]> {
    try {
      const response = await this.client.get(`/scenarios/${scenarioId}/executions`);
      return z.array(MakeExecutionSchema).parse(response.data);
    } catch (error) {
      console.error('Error fetching scenario executions:', error);
      throw new Error(`Failed to fetch scenario executions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a connection
   */
  async createConnection(connectionData: Omit<MakeConnection, 'id' | 'created_at' | 'updated_at'>): Promise<MakeConnection> {
    try {
      const response = await this.client.post('/connections', {
        ...connectionData,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return MakeConnectionSchema.parse(response.data);
    } catch (error) {
      console.error('Error creating Make.com connection:', error);
      throw new Error(`Failed to create Make.com connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all connections
   */
  async getConnections(): Promise<MakeConnection[]> {
    try {
      const response = await this.client.get('/connections');
      return z.array(MakeConnectionSchema).parse(response.data);
    } catch (error) {
      console.error('Error fetching Make.com connections:', error);
      throw new Error(`Failed to fetch Make.com connections: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process blueprint with Make.com scenario
   */
  async processBlueprintWithMake(blueprintData: unknown, scenarioId: number): Promise<{
    success: boolean;
    executionId: number;
    output?: Record<string, unknown>;
    error?: string;
  }> {
    try {
      // Execute the scenario with blueprint data
      const execution = await this.executeScenario(scenarioId, { blueprint: blueprintData });

      // Wait for completion (polling)
      let finalExecution = execution;
      const maxAttempts = 15;
      let attempts = 0;

      while (finalExecution.status === 'pending' || finalExecution.status === 'running') {
        if (attempts >= maxAttempts) {
          throw new Error('Scenario execution timeout');
        }

        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        finalExecution = await this.getExecutionStatus(execution.id);
        attempts++;
      }

      return {
        success: finalExecution.status === 'completed',
        executionId: execution.id,
        ...(finalExecution.output_data && { output: finalExecution.output_data }),
        ...(finalExecution.error_message && { error: finalExecution.error_message }),
      };
    } catch (error) {
      console.error('Error processing blueprint with Make.com:', error);
      throw new Error(`Failed to process blueprint with Make.com: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set up automated blueprint processing
   */
  async setupBlueprintAutomation(blueprintId: string, scenarioId: number, config: Record<string, unknown>): Promise<MakeBlueprintIntegration> {
    try {
      const integration = await this.createBlueprintIntegration({
        blueprint_id: blueprintId,
        scenario_id: scenarioId,
        integration_type: 'automation',
        config: {
          ...config,
          auto_trigger: true,
          trigger_conditions: ['blueprint_updated', 'blueprint_created'],
        },
        status: 'active',
      });

      console.log(`Blueprint automation set up successfully: ${integration.id}`);
      return integration;
    } catch (error) {
      console.error('Error setting up blueprint automation:', error);
      throw error;
    }
  }

  /**
   * Create blueprint integration
   */
  async createBlueprintIntegration(integrationData: Omit<MakeBlueprintIntegration, 'id' | 'created_at' | 'updated_at'>): Promise<MakeBlueprintIntegration> {
    try {
      const response = await this.client.post('/integrations', {
        ...integrationData,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return MakeBlueprintIntegrationSchema.parse(response.data);
    } catch (error) {
      console.error('Error creating blueprint integration:', error);
      throw new Error(`Failed to create blueprint integration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create webhook for blueprint triggers
   */
  async createWebhook(webhookData: {
    name: string;
    url: string;
    events: string[];
    headers?: Record<string, string>;
  }): Promise<{
    id: number;
    url: string;
    secret: string;
  }> {
    try {
      const response = await this.client.post('/webhooks', {
        ...webhookData,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return {
        id: response.data.id,
        url: response.data.url,
        secret: response.data.secret,
      };
    } catch (error) {
      console.error('Error creating webhook:', error);
      throw new Error(`Failed to create webhook: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Health check for Make.com service
   */
  async healthCheck(): Promise<{ status: string; timestamp: string; version?: string }> {
    try {
      const response = await this.client.get('/health');
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: response.data.version,
      };
    } catch (error) {
      console.error('Make.com health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get scenario metrics
   */
  async getScenarioMetrics(scenarioId: number): Promise<{
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    average_duration: number;
    last_execution: Date | null;
  }> {
    try {
      const response = await this.client.get(`/scenarios/${scenarioId}/metrics`);
      return {
        total_executions: response.data.total_executions || 0,
        successful_executions: response.data.successful_executions || 0,
        failed_executions: response.data.failed_executions || 0,
        average_duration: response.data.average_duration || 0,
        last_execution: response.data.last_execution ? new Date(response.data.last_execution) : null,
      };
    } catch (error) {
      console.error('Error fetching scenario metrics:', error);
      throw new Error(`Failed to fetch scenario metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update scenario status
   */
  async updateScenarioStatus(scenarioId: number, status: 'active' | 'inactive' | 'draft'): Promise<MakeScenario> {
    try {
      const response = await this.client.patch(`/scenarios/${scenarioId}`, {
        status,
        updated_at: new Date(),
      });

      return MakeScenarioSchema.parse(response.data);
    } catch (error) {
      console.error('Error updating scenario status:', error);
      throw new Error(`Failed to update scenario status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete scenario
   */
  async deleteScenario(scenarioId: number): Promise<{ success: boolean }> {
    try {
      await this.client.delete(`/scenarios/${scenarioId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting scenario:', error);
      throw new Error(`Failed to delete scenario: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export validation functions
export const validateMakeConfig = (data: unknown): MakeConfig => {
  return MakeConfigSchema.parse(data);
};

export const validateMakeScenario = (data: unknown): MakeScenario => {
  return MakeScenarioSchema.parse(data);
};

export const validateMakeExecution = (data: unknown): MakeExecution => {
  return MakeExecutionSchema.parse(data);
};

export const validateMakeConnection = (data: unknown): MakeConnection => {
  return MakeConnectionSchema.parse(data);
};

export const validateMakeBlueprintIntegration = (data: unknown): MakeBlueprintIntegration => {
  return MakeBlueprintIntegrationSchema.parse(data);
}; 