import { z } from 'zod';
import { RenderIntegration } from './render_integration';
import { DeerFlowIntegration } from './deerflow_integration';
import { MindPalIntegration } from './mindpal_integration';

// 🔒 MANDATORY: Barton Doctrine enforcement
import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';
import { BartonDoctrineFormatter } from '../src/schemas/barton-doctrine-formatter';

// Orchestrator Configuration Schema
export const OrchestratorConfigSchema = z.object({
  render: z.object({
    apiKey: z.string().min(1, 'Render API key is required'),
    webhookUrl: z.string().url('Render webhook URL must be valid'),
    serviceId: z.string().min(1, 'Render service ID is required'),
    baseUrl: z.string().url().default('https://api.render.com'),
  }),
  deerflow: z.object({
    apiKey: z.string().min(1, 'DeerFlow API key is required'),
    baseUrl: z.string().url().default('https://deerflow-render-starter.onrender.com'),
    workflowId: z.string().min(1, 'DeerFlow workflow ID is required'),
  }),
  mindpal: z.object({
    apiKey: z.string().min(1, 'MindPal API key is required'),
    baseUrl: z.string().url().default('https://api.mindpal.com'),
    agentId: z.string().min(1, 'MindPal agent ID is required'),
  }),
  llm: z.object({
    provider: z.enum(['openai', 'anthropic', 'google', 'perplexity']),
    apiKey: z.string().min(1, 'LLM API key is required'),
    model: z.string().min(1, 'LLM model is required'),
    baseUrl: z.string().url().optional(),
  }),
  orchestration: z.object({
    timeout: z.number().positive().default(300000), // 5 minutes
    retryAttempts: z.number().int().min(0).max(5).default(3),
    enableParallelProcessing: z.boolean().default(true),
    enableFailover: z.boolean().default(true),
  }),
});

export type OrchestratorConfig = z.infer<typeof OrchestratorConfigSchema>;

// Orchestration Result Schema
export const OrchestrationResultSchema = z.object({
  success: z.boolean(),
  timestamp: z.date(),
  services: z.object({
    render: z.object({
      status: z.enum(['success', 'failed', 'skipped']),
      deploymentId: z.string().optional(),
      serviceUrl: z.string().optional(),
      error: z.string().optional(),
    }),
    deerflow: z.object({
      status: z.enum(['success', 'failed', 'skipped']),
      executionId: z.string().optional(),
      workflowOutput: z.record(z.unknown()).optional(),
      error: z.string().optional(),
    }),
    mindpal: z.object({
      status: z.enum(['success', 'failed', 'skipped']),
      taskId: z.string().optional(),
      validationResult: z.object({
        isValid: z.boolean(),
        errors: z.array(z.string()),
        suggestions: z.array(z.string()),
      }).optional(),
      error: z.string().optional(),
    }),
    llm: z.object({
      status: z.enum(['success', 'failed', 'skipped']),
      response: z.string().optional(),
      usage: z.object({
        promptTokens: z.number(),
        completionTokens: z.number(),
        totalTokens: z.number(),
      }).optional(),
      error: z.string().optional(),
    }),
  }),
  metadata: z.object({
    processingTime: z.number(),
    blueprintId: z.string(),
    totalSteps: z.number(),
    completedSteps: z.number(),
  }),
});

export type OrchestrationResult = z.infer<typeof OrchestrationResultSchema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const doctrine = START_WITH_BARTON_DOCTRINE('render-deerflow-mindpal-orchestrator');

export class RenderDeerFlowMindPalOrchestrator {
  private config: OrchestratorConfig;
  private renderIntegration: RenderIntegration;
  private deerflowIntegration: DeerFlowIntegration;
  private mindpalIntegration: MindPalIntegration;

  constructor(config: OrchestratorConfig) {
    this.config = OrchestratorConfigSchema.parse(config);
    
    // Initialize service integrations
    this.renderIntegration = new RenderIntegration({
      apiKey: this.config.render.apiKey,
      webhookUrl: this.config.render.webhookUrl,
      baseUrl: this.config.render.baseUrl,
      timeout: this.config.orchestration.timeout,
      retryAttempts: this.config.orchestration.retryAttempts,
    });

    this.deerflowIntegration = new DeerFlowIntegration({
      apiKey: this.config.deerflow.apiKey,
      baseUrl: this.config.deerflow.baseUrl,
      timeout: this.config.orchestration.timeout,
      retryAttempts: this.config.orchestration.retryAttempts,
    });

    this.mindpalIntegration = new MindPalIntegration({
      apiKey: this.config.mindpal.apiKey,
      baseUrl: this.config.mindpal.baseUrl,
      timeout: this.config.orchestration.timeout,
      retryAttempts: this.config.orchestration.retryAttempts,
    });
  }

  /**
   * Main orchestration method - coordinates all services
   */
  async orchestrateServices(blueprintData: unknown): Promise<{
    success: boolean;
    services: {
      render: { status: string; deploymentId?: string; error?: string };
      deerflow: { status: string; executionId?: string; error?: string };
      mindpal: { status: string; taskId?: string; error?: string };
      llm: { status: string; response?: string; error?: string };
    };
    processingTime: number;
  }> {
    const startTime = Date.now();

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const validatedPayload = BartonDoctrineFormatter.createBasePayload(
        'orchestrator-main',
        'service-orchestration',
        blueprintData,
        {
          agent_id: 'render-deerflow-mindpal-orchestrator',
          blueprint_id: 'service-orchestration',
          schema_version: '1.0.0',
        }
      );

      console.log('🚀 Starting service orchestration...');

      // Step 1: MindPal Validation
      console.log('🤖 Starting MindPal validation...');
      const mindpalResult = await this.validateWithMindPal(blueprintData);

      // Step 2: DeerFlow Processing
      console.log('🦌 Starting DeerFlow workflow...');
      const deerflowResult = await this.processWithDeerFlow(blueprintData);

      // Step 3: LLM Enhancement
      console.log('🧠 Starting LLM enhancement...');
      const llmResult = await this.enhanceWithLLM(blueprintData);

      // Step 4: Render Deployment
      console.log('🚀 Starting Render deployment...');
      const renderResult = await this.deployWithRender(blueprintData);

      const processingTime = Date.now() - startTime;
      const success = mindpalResult.success && deerflowResult.success && renderResult.success;

      console.log(`✅ Orchestration completed in ${processingTime}ms`);

      return {
        success,
        services: {
          render: renderResult,
          deerflow: deerflowResult,
          mindpal: mindpalResult,
          llm: llmResult,
        },
        processingTime,
      };

    } catch (error) {
      console.error('❌ Orchestration failed:', error);
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        services: {
          render: { status: 'failed', error: 'Orchestration failed' },
          deerflow: { status: 'failed', error: 'Orchestration failed' },
          mindpal: { status: 'failed', error: 'Orchestration failed' },
          llm: { status: 'failed', error: 'Orchestration failed' },
        },
        processingTime,
      };
    }
  }

  private async validateWithMindPal(blueprintData: unknown) {
    try {
      const validation = await this.mindpalIntegration.validateBlueprintWithMindPal(
        blueprintData,
        this.config.mindpal.agentId
      );
      return {
        success: validation.isValid,
        status: validation.isValid ? 'success' : 'failed',
        taskId: `mindpal-${Date.now()}`,
        error: validation.errors.length > 0 ? validation.errors.join(', ') : undefined,
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async processWithDeerFlow(blueprintData: unknown) {
    try {
      const processing = await this.deerflowIntegration.processBlueprintWithDeerFlow(
        blueprintData,
        this.config.deerflow.workflowId
      );
      return {
        success: processing.success,
        status: processing.success ? 'success' : 'failed',
        executionId: processing.executionId,
        error: processing.error,
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async enhanceWithLLM(blueprintData: unknown) {
    try {
      const prompt = `Enhance this blueprint data: ${JSON.stringify(blueprintData, null, 2)}`;
      const response = await this.callLLM(prompt);
      return {
        success: true,
        status: 'success',
        response: response.content,
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async deployWithRender(blueprintData: unknown) {
    try {
      const deployment = await this.renderIntegration.deployBlueprint(
        blueprintData,
        this.config.render.serviceId
      );
      return {
        success: deployment.success,
        status: deployment.success ? 'success' : 'failed',
        deploymentId: deployment.deploymentId,
        error: deployment.error,
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async callLLM(prompt: string): Promise<{ content: string }> {
    const { provider, apiKey, model } = this.config.llm;

    switch (provider) {
      case 'openai':
        return this.callOpenAI(prompt, apiKey, model);
      case 'anthropic':
        return this.callAnthropic(prompt, apiKey, model);
      case 'google':
        return this.callGoogle(prompt, apiKey, model);
      case 'perplexity':
        return this.callPerplexity(prompt, apiKey, model);
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  private async callOpenAI(prompt: string, apiKey: string, model: string): Promise<{ content: string }> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { content: data.choices[0].message.content };
  }

  private async callAnthropic(prompt: string, apiKey: string, model: string): Promise<{ content: string }> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { content: data.content[0].text };
  }

  private async callGoogle(prompt: string, apiKey: string, model: string): Promise<{ content: string }> {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { content: data.candidates[0].content.parts[0].text };
  }

  private async callPerplexity(prompt: string, apiKey: string, model: string): Promise<{ content: string }> {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { content: data.choices[0].message.content };
  }

  async healthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: Record<string, 'healthy' | 'unhealthy'>;
  }> {
    const results = await Promise.allSettled([
      this.renderIntegration.healthCheck(),
      this.deerflowIntegration.healthCheck(),
      this.mindpalIntegration.healthCheck(),
    ]);

    const services = {
      render: results[0].status === 'fulfilled' ? 'healthy' : 'unhealthy' as const,
      deerflow: results[1].status === 'fulfilled' ? 'healthy' : 'unhealthy' as const,
      mindpal: results[2].status === 'fulfilled' ? 'healthy' : 'unhealthy' as const,
    };

    const healthyCount = Object.values(services).filter(status => status === 'healthy').length;
    const overall = healthyCount === 3 ? 'healthy' : healthyCount >= 2 ? 'degraded' : 'unhealthy';

    return { overall, services };
  }
}

export const validateOrchestratorConfig = (data: unknown): OrchestratorConfig => {
  return OrchestratorConfigSchema.parse(data);
};

export const validateOrchestrationResult = (data: unknown): OrchestrationResult => {
  return OrchestrationResultSchema.parse(data);
}; 