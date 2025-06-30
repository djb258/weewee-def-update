import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';

// 🔒 MANDATORY: Barton Doctrine enforcement
import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';


// DeerFlow Configuration Schema
export const DeerFlowConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  baseUrl: z.string().url('Base URL must be a valid URL').default('https://api.deerflow.com'),
  timeout: z.number().positive().default(30000),
  retryAttempts: z.number().int().min(0).max(5).default(3),
});

export type DeerFlowConfig = z.infer<typeof DeerFlowConfigSchema>;

// DeerFlow Workflow Schema
export const DeerFlowWorkflowSchema = z.object({
  id: z.string().min(1, 'Workflow ID is required'),
  name: z.string().min(1, 'Workflow name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft', 'archived']),
  type: z.enum(['data_pipeline', 'automation', 'integration', 'monitoring']),
  triggers: z.array(z.string()).optional(),
  steps: z.array(z.record(z.unknown())).optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type DeerFlowWorkflow = z.infer<typeof DeerFlowWorkflowSchema>;

// DeerFlow Execution Schema
export const DeerFlowExecutionSchema = z.object({
  id: z.string().min(1, 'Execution ID is required'),
  workflow_id: z.string().min(1, 'Workflow ID is required'),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  input_data: z.record(z.unknown()).optional(),
  output_data: z.record(z.unknown()).optional(),
  error_message: z.string().optional(),
  started_at: z.date().optional(),
  completed_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type DeerFlowExecution = z.infer<typeof DeerFlowExecutionSchema>;

// DeerFlow Blueprint Integration Schema
export const DeerFlowBlueprintIntegrationSchema = z.object({
  id: z.string().min(1, 'Integration ID is required'),
  blueprint_id: z.string().min(1, 'Blueprint ID is required'),
  workflow_id: z.string().min(1, 'Workflow ID is required'),
  integration_type: z.enum(['validation', 'processing', 'monitoring', 'automation']),
  config: z.record(z.unknown()),
  status: z.enum(['active', 'inactive', 'error']),
  last_execution: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type DeerFlowBlueprintIntegration = z.infer<typeof DeerFlowBlueprintIntegrationSchema>;


// 🔒 MANDATORY: Initialize Barton Doctrine (CANNOT BE SKIPPED)
const doctrine = START_WITH_BARTON_DOCTRINE('deerflow');

export class DeerFlowIntegration {
  private config: DeerFlowConfig;
  private client: AxiosInstance;

  constructor(config: DeerFlowConfig) {
    this.config = DeerFlowConfigSchema.parse(config);
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a new DeerFlow workflow
   */
  async createWorkflow(workflowData: Omit<DeerFlowWorkflow, 'id' | 'created_at' | 'updated_at'>): Promise<DeerFlowWorkflow> {
    try {
      const response = await this.client.post('/workflows', {
        ...workflowData,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return DeerFlowWorkflowSchema.parse(response.data);
    } catch (error) {
      console.error('Error creating DeerFlow workflow:', error);
      throw new Error(`Failed to create DeerFlow workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all DeerFlow workflows
   */
  async getWorkflows(): Promise<DeerFlowWorkflow[]> {
    try {
      const response = await this.client.get('/workflows');
      return z.array(DeerFlowWorkflowSchema).parse(response.data);
    } catch (error) {
      console.error('Error fetching DeerFlow workflows:', error);
      throw new Error(`Failed to fetch DeerFlow workflows: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific DeerFlow workflow
   */
  async getWorkflow(workflowId: string): Promise<DeerFlowWorkflow> {
    try {
      const response = await this.client.get(`/workflows/${workflowId}`);
      return DeerFlowWorkflowSchema.parse(response.data);
    } catch (error) {
      console.error('Error fetching DeerFlow workflow:', error);
      throw new Error(`Failed to fetch DeerFlow workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute a DeerFlow workflow
   */
  async executeWorkflow(workflowId: string, inputData?: Record<string, unknown>): Promise<DeerFlowExecution> {
    try {
      const response = await this.client.post(`/workflows/${workflowId}/execute`, {
        input_data: inputData || {},
        created_at: new Date(),
        updated_at: new Date(),
      });

      return DeerFlowExecutionSchema.parse(response.data);
    } catch (error) {
      console.error('Error executing DeerFlow workflow:', error);
      throw new Error(`Failed to execute DeerFlow workflow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(executionId: string): Promise<DeerFlowExecution> {
    try {
      const response = await this.client.get(`/executions/${executionId}`);
      return DeerFlowExecutionSchema.parse(response.data);
    } catch (error) {
      console.error('Error fetching execution status:', error);
      throw new Error(`Failed to fetch execution status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create blueprint integration
   */
  async createBlueprintIntegration(integrationData: Omit<DeerFlowBlueprintIntegration, 'id' | 'created_at' | 'updated_at'>): Promise<DeerFlowBlueprintIntegration> {
    try {
      const response = await this.client.post('/integrations', {
        ...integrationData,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return DeerFlowBlueprintIntegrationSchema.parse(response.data);
    } catch (error) {
      console.error('Error creating blueprint integration:', error);
      throw new Error(`Failed to create blueprint integration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process blueprint with DeerFlow workflow
   */
  async processBlueprintWithDeerFlow(blueprintData: unknown, workflowId: string): Promise<{
    success: boolean;
    executionId: string;
    output?: Record<string, unknown>;
    error?: string;
  }> {
    try {
      // Execute the workflow with blueprint data
      const execution = await this.executeWorkflow(workflowId, { blueprint: blueprintData });

      // Wait for completion (polling)
      let finalExecution = execution;
      const maxAttempts = 10;
      let attempts = 0;

      while (finalExecution.status === 'pending' || finalExecution.status === 'running') {
        if (attempts >= maxAttempts) {
          throw new Error('Workflow execution timeout');
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
      console.error('Error processing blueprint with DeerFlow:', error);
      throw new Error(`Failed to process blueprint with DeerFlow: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set up automated blueprint processing
   */
  async setupBlueprintAutomation(blueprintId: string, workflowId: string, config: Record<string, unknown>): Promise<DeerFlowBlueprintIntegration> {
    try {
      const integration = await this.createBlueprintIntegration({
        blueprint_id: blueprintId,
        workflow_id: workflowId,
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
   * Health check for DeerFlow service
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
      console.error('DeerFlow health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get workflow metrics
   */
  async getWorkflowMetrics(workflowId: string): Promise<{
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    average_duration: number;
    last_execution: Date | null;
  }> {
    try {
      const response = await this.client.get(`/workflows/${workflowId}/metrics`);
      return {
        total_executions: response.data.total_executions || 0,
        successful_executions: response.data.successful_executions || 0,
        failed_executions: response.data.failed_executions || 0,
        average_duration: response.data.average_duration || 0,
        last_execution: response.data.last_execution ? new Date(response.data.last_execution) : null,
      };
    } catch (error) {
      console.error('Error fetching workflow metrics:', error);
      throw new Error(`Failed to fetch workflow metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export validation functions
export const validateDeerFlowConfig = (data: unknown): DeerFlowConfig => {
  return DeerFlowConfigSchema.parse(data);
};

export const validateDeerFlowWorkflow = (data: unknown): DeerFlowWorkflow => {
  return DeerFlowWorkflowSchema.parse(data);
};

export const validateDeerFlowExecution = (data: unknown): DeerFlowExecution => {
  return DeerFlowExecutionSchema.parse(data);
};

export const validateDeerFlowBlueprintIntegration = (data: unknown): DeerFlowBlueprintIntegration => {
  return DeerFlowBlueprintIntegrationSchema.parse(data);
}; 