import { z } from 'zod';
import { RenderIntegration } from './render_integration';
import { DeerFlowIntegration } from './deerflow_integration';
import { MindPalIntegration } from './mindpal_integration';

// 🔒 MANDATORY: Barton Doctrine enforcement
import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';

// Simple Configuration Schema
export const SimpleOrchestratorConfigSchema = z.object({
  render: z.object({
    apiKey: z.string().min(1),
    webhookUrl: z.string().url(),
    serviceId: z.string().min(1),
  }),
  deerflow: z.object({
    apiKey: z.string().min(1),
    baseUrl: z.string().url().default('https://deerflow-render-starter.onrender.com'),
    workflowId: z.string().min(1),
  }),
  mindpal: z.object({
    apiKey: z.string().min(1),
    agentId: z.string().min(1),
  }),
  llm: z.object({
    provider: z.enum(['openai', 'anthropic']),
    apiKey: z.string().min(1),
    model: z.string().min(1),
  }),
});

export type SimpleOrchestratorConfig = z.infer<typeof SimpleOrchestratorConfigSchema>;

// 🔒 MANDATORY: Initialize Barton Doctrine (CANNOT BE SKIPPED)
START_WITH_BARTON_DOCTRINE('simple-orchestrator');

export class SimpleRenderDeerFlowMindPalOrchestrator {
  private config: SimpleOrchestratorConfig;
  private renderIntegration: RenderIntegration;
  private deerflowIntegration: DeerFlowIntegration;
  private mindpalIntegration: MindPalIntegration;

  constructor(config: SimpleOrchestratorConfig) {
    this.config = SimpleOrchestratorConfigSchema.parse(config);
    
    // Initialize service integrations
    this.renderIntegration = new RenderIntegration({
      apiKey: this.config.render.apiKey,
      webhookUrl: this.config.render.webhookUrl,
      baseUrl: 'https://api.render.com',
      timeout: 60000,
      retryAttempts: 3,
    });

    this.deerflowIntegration = new DeerFlowIntegration({
      apiKey: this.config.deerflow.apiKey,
      baseUrl: this.config.deerflow.baseUrl,
      timeout: 60000,
      retryAttempts: 3,
    });

    this.mindpalIntegration = new MindPalIntegration({
      apiKey: this.config.mindpal.apiKey,
      baseUrl: 'https://api.mindpal.com',
      timeout: 60000,
      retryAttempts: 3,
    });
  }

  /**
   * Run the complete orchestration pipeline
   */
  async runOrchestration(blueprintData: Record<string, unknown>): Promise<{
    success: boolean;
    results: {
      mindpal: { success: boolean; message: string };
      deerflow: { success: boolean; message: string };
      llm: { success: boolean; message: string };
      render: { success: boolean; message: string };
    };
    processingTime: number;
  }> {
    const startTime = Date.now();
    console.log('🚀 Starting orchestration pipeline...');

    const results = {
      mindpal: { success: false, message: '' },
      deerflow: { success: false, message: '' },
      llm: { success: false, message: '' },
      render: { success: false, message: '' },
    };

    try {
      // Step 1: MindPal Validation
      console.log('🤖 Step 1: MindPal validation...');
      try {
        const validation = await this.mindpalIntegration.validateBlueprintWithMindPal(
          blueprintData,
          this.config.mindpal.agentId
        );
        
        if (validation.isValid) {
          results.mindpal = { success: true, message: 'Blueprint validated successfully' };
          console.log('✅ MindPal validation passed');
        } else {
          results.mindpal = { success: false, message: `Validation failed: ${validation.errors.join(', ')}` };
          console.log('❌ MindPal validation failed');
        }
      } catch (error) {
        results.mindpal = { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
        console.log('❌ MindPal error:', results.mindpal.message);
      }

      // Step 2: DeerFlow Processing
      console.log('🦌 Step 2: DeerFlow processing...');
      try {
        const processing = await this.deerflowIntegration.processBlueprintWithDeerFlow(
          blueprintData,
          this.config.deerflow.workflowId
        );
        
        if (processing.success) {
          results.deerflow = { success: true, message: `Workflow executed: ${processing.executionId}` };
          console.log('✅ DeerFlow processing completed');
        } else {
          results.deerflow = { success: false, message: processing.error || 'Processing failed' };
          console.log('❌ DeerFlow processing failed');
        }
      } catch (error) {
        results.deerflow = { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
        console.log('❌ DeerFlow error:', results.deerflow.message);
      }

      // Step 3: LLM Enhancement
      console.log('🧠 Step 3: LLM enhancement...');
      try {
        const prompt = `Analyze and enhance this blueprint data: ${JSON.stringify(blueprintData, null, 2)}`;
        const llmResponse = await this.callLLM(prompt);
        
        results.llm = { success: true, message: `Enhanced: ${llmResponse.substring(0, 100)}...` };
        console.log('✅ LLM enhancement completed');
      } catch (error) {
        results.llm = { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
        console.log('❌ LLM error:', results.llm.message);
      }

      // Step 4: Render Deployment
      console.log('🚀 Step 4: Render deployment...');
      try {
        const deployment = await this.renderIntegration.deployBlueprint(
          blueprintData,
          this.config.render.serviceId
        );
        
        if (deployment.success) {
          results.render = { success: true, message: `Deployed: ${deployment.deploymentId}` };
          console.log('✅ Render deployment completed');
        } else {
          results.render = { success: false, message: deployment.error || 'Deployment failed' };
          console.log('❌ Render deployment failed');
        }
      } catch (error) {
        results.render = { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` };
        console.log('❌ Render error:', results.render.message);
      }

      const processingTime = Date.now() - startTime;
      const successCount = Object.values(results).filter(r => r.success).length;
      const overallSuccess = successCount >= 2; // At least 2 services must succeed

      console.log(`🎯 Orchestration completed: ${successCount}/4 services successful`);
      console.log(`⏱️ Total time: ${processingTime}ms`);

      return {
        success: overallSuccess,
        results,
        processingTime,
      };

    } catch (error) {
      console.error('❌ Orchestration pipeline failed:', error);
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        results: {
          mindpal: { success: false, message: 'Pipeline failed' },
          deerflow: { success: false, message: 'Pipeline failed' },
          llm: { success: false, message: 'Pipeline failed' },
          render: { success: false, message: 'Pipeline failed' },
        },
        processingTime,
      };
    }
  }

  /**
   * Call LLM service
   */
  private async callLLM(prompt: string): Promise<string> {
    const { provider, apiKey, model } = this.config.llm;

    if (provider === 'openai') {
      return this.callOpenAI(prompt, apiKey, model);
    } else if (provider === 'anthropic') {
      return this.callAnthropic(prompt, apiKey, model);
    } else {
      throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  private async callOpenAI(prompt: string, apiKey: string, model: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    return data.choices[0].message.content;
  }

  private async callAnthropic(prompt: string, apiKey: string, model: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Health check all services
   */
  async healthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      render: 'healthy' | 'unhealthy';
      deerflow: 'healthy' | 'unhealthy';
      mindpal: 'healthy' | 'unhealthy';
    };
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

  /**
   * Test individual service
   */
  async testService(serviceName: 'render' | 'deerflow' | 'mindpal'): Promise<boolean> {
    try {
      switch (serviceName) {
        case 'render':
          await this.renderIntegration.healthCheck();
          return true;
        case 'deerflow':
          await this.deerflowIntegration.healthCheck();
          return true;
        case 'mindpal':
          await this.mindpalIntegration.healthCheck();
          return true;
        default:
          return false;
      }
    } catch {
      return false;
    }
  }
}

// Example usage function
export async function runSimpleOrchestration(config: SimpleOrchestratorConfig, blueprintData: Record<string, unknown>) {
  const orchestrator = new SimpleRenderDeerFlowMindPalOrchestrator(config);
  
  console.log('🔍 Running health check...');
  const health = await orchestrator.healthCheck();
  console.log(`Health status: ${health.overall}`);
  console.log('Service status:', health.services);

  if (health.overall === 'unhealthy') {
    console.log('❌ Too many services are unhealthy. Aborting orchestration.');
    return { success: false, error: 'Services unhealthy' };
  }

  console.log('🚀 Starting orchestration...');
  const result = await orchestrator.runOrchestration(blueprintData);
  
  console.log('📊 Final Results:');
  console.log(`Overall success: ${result.success}`);
  console.log(`Processing time: ${result.processingTime}ms`);
  console.log('Service results:', result.results);

  return result;
}

export const validateSimpleOrchestratorConfig = (data: unknown): SimpleOrchestratorConfig => {
  return SimpleOrchestratorConfigSchema.parse(data);
}; 