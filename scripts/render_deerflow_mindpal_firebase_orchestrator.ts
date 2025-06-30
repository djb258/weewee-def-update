import { z } from 'zod';
import { RenderIntegration } from './render_integration';
import { DeerFlowIntegration } from './deerflow_integration';
import { MindPalIntegration } from './mindpal_integration';
import { FirebasePush } from './firebase_push';

// 🔒 MANDATORY: Barton Doctrine enforcement
import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';
import { BartonDoctrineMiddleware } from '../src/middleware/barton-doctrine-middleware';

// DeerFlow Render Starter Configuration Schema
export const DeerFlowRenderStarterConfigSchema = z.object({
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
    provider: z.enum(['openai', 'claude', 'gemini', 'perplexity', 'tavily']),
    apiKey: z.string().min(1),
    model: z.string().min(1),
  }),
  firebase: z.object({
    projectId: z.string().min(1),
    privateKey: z.string().min(1),
    clientEmail: z.string().email(),
  }),
  whiteboard: z.object({
    ttl: z.number().positive().default(3600),
    enableCleanup: z.boolean().default(true),
    retentionDays: z.number().positive().default(7),
  }),
  browserless: z.object({
    apiKey: z.string().min(1),
  }).optional(),
});

export type DeerFlowRenderStarterConfig = z.infer<typeof DeerFlowRenderStarterConfigSchema>;

// 🔒 MANDATORY: Initialize Barton Doctrine (CANNOT BE SKIPPED)
START_WITH_BARTON_DOCTRINE('deerflow-render-starter-orchestrator');

export class DeerFlowRenderStarterOrchestrator {
  private config: DeerFlowRenderStarterConfig;
  private renderIntegration: RenderIntegration;
  private deerflowIntegration: DeerFlowIntegration;
  private mindpalIntegration: MindPalIntegration;
  private firebase: FirebasePush;
  private bartonMiddleware: BartonDoctrineMiddleware;

  constructor(config: DeerFlowRenderStarterConfig) {
    this.config = DeerFlowRenderStarterConfigSchema.parse(config);
    
    // Initialize Barton Doctrine middleware
    this.bartonMiddleware = BartonDoctrineMiddleware.forTool('deerflow-render-starter-orchestrator');
    
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

    // Initialize Firebase
    this.firebase = new FirebasePush();
  }

  /**
   * Main orchestration method using Firebase as whiteboard
   */
  async orchestrateWithFirebaseWhiteboard(blueprintData: Record<string, unknown>): Promise<{
    success: boolean;
    orchestrationId: string;
    whiteboardEntries: string[];
    finalResult: Record<string, unknown>;
    processingTime: number;
  }> {
    const startTime = Date.now();
    const orchestrationId = `orch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🚀 Starting DeerFlow Render Starter orchestration: ${orchestrationId}`);

    try {
      const whiteboardEntries: string[] = [];

      // Step 1: Initialize whiteboard with blueprint data
      const initialEntryId = await this.createWhiteboardEntry(
        orchestrationId,
        'initial_blueprint',
        blueprintData
      );
      whiteboardEntries.push(initialEntryId);
      console.log(`📋 Created initial whiteboard entry: ${initialEntryId}`);

      let currentPayload = blueprintData;

      // Step 2: MindPal Validation
      console.log('🤖 Step 1: MindPal validation...');
      const mindpalEntryId = await this.processStepWithWhiteboard(
        orchestrationId,
        'mindpal_validation',
        currentPayload,
        async (payload) => {
          const validation = await this.mindpalIntegration.validateBlueprintWithMindPal(
            payload,
            this.config.mindpal.agentId
          );
          return {
            isValid: validation.isValid,
            errors: validation.errors,
            suggestions: validation.suggestions,
          };
        }
      );
      whiteboardEntries.push(mindpalEntryId);

      // Step 3: DeerFlow Render Starter Processing
      console.log('🦌 Step 2: DeerFlow Render Starter processing...');
      const deerflowEntryId = await this.processStepWithWhiteboard(
        orchestrationId,
        'deerflow_render_starter',
        currentPayload,
        async (payload) => {
          // Use the DeerFlow Render Starter /fire endpoint
          const processing = await this.callDeerFlowRenderStarter(payload);
          return {
            success: processing.success,
            engine: processing.engine,
            output: processing.output,
            status: processing.status,
          };
        }
      );
      whiteboardEntries.push(deerflowEntryId);

      // Step 4: LLM Enhancement via DeerFlow Render Starter
      console.log('🧠 Step 3: LLM enhancement via DeerFlow Render Starter...');
      const llmEntryId = await this.processStepWithWhiteboard(
        orchestrationId,
        'llm_enhancement',
        currentPayload,
        async (payload) => {
          const prompt = `Analyze and enhance this blueprint: ${JSON.stringify(payload, null, 2)}`;
          const response = await this.callDeerFlowRenderStarterLLM(prompt);
          return { enhancement: response };
        }
      );
      whiteboardEntries.push(llmEntryId);

      // Step 5: Web Scraping (if URL provided)
      if (blueprintData.url) {
        console.log('🌐 Step 4: Web scraping via Browserless...');
        const scrapingEntryId = await this.processStepWithWhiteboard(
          orchestrationId,
          'web_scraping',
          currentPayload,
          async (payload) => {
            const scraping = await this.callDeerFlowRenderStarterScraping(payload.url as string);
            return {
              success: scraping.success,
              content_length: scraping.content_length,
              url: payload.url,
            };
          }
        );
        whiteboardEntries.push(scrapingEntryId);
      }

      // Step 6: Render Deployment
      console.log('🚀 Step 5: Render deployment...');
      const renderEntryId = await this.processStepWithWhiteboard(
        orchestrationId,
        'render_deployment',
        currentPayload,
        async (payload) => {
          const deployment = await this.renderIntegration.deployBlueprint(
            payload,
            this.config.render.serviceId
          );
          return {
            success: deployment.success,
            deploymentId: deployment.deploymentId,
          };
        }
      );
      whiteboardEntries.push(renderEntryId);

      // Create final summary
      const processingTime = Date.now() - startTime;
      const finalResult = await this.createOrchestrationSummary(
        orchestrationId,
        whiteboardEntries,
        processingTime
      );

      console.log(`🎯 Orchestration ${orchestrationId} completed`);
      console.log(`⏱️ Total processing time: ${processingTime}ms`);

      return {
        success: true,
        orchestrationId,
        whiteboardEntries,
        finalResult,
        processingTime,
      };

    } catch (error) {
      console.error(`❌ Orchestration ${orchestrationId} failed:`, error);
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        orchestrationId,
        whiteboardEntries: [],
        finalResult: { error: error instanceof Error ? error.message : 'Unknown error' },
        processingTime,
      };
    }
  }

  /**
   * Call DeerFlow Render Starter /fire endpoint
   */
  private async callDeerFlowRenderStarter(payload: Record<string, unknown>): Promise<{
    success: boolean;
    engine: string;
    output: string;
    status: string;
  }> {
    try {
      const response = await fetch(`${this.config.deerflow.baseUrl}/fire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_data: {
            llm: this.config.llm.provider,
            message: JSON.stringify(payload),
            validate: true,
          },
          persona: 'blueprint_enforcer',
          command_source: 'firebase_orchestrator',
        }),
      });

      if (!response.ok) {
        throw new Error(`DeerFlow Render Starter error: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: result.status === 'dispatched',
        engine: result.engine,
        output: result.output,
        status: result.status,
      };
    } catch (error) {
      console.error('DeerFlow Render Starter call failed:', error);
      return {
        success: false,
        engine: this.config.llm.provider,
        output: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
      };
    }
  }

  /**
   * Call DeerFlow Render Starter LLM endpoint
   */
  private async callDeerFlowRenderStarterLLM(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.config.deerflow.baseUrl}/fire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input_data: {
            llm: this.config.llm.provider,
            message: prompt,
            validate: true,
          },
          persona: 'blueprint_enhancer',
          command_source: 'firebase_orchestrator',
        }),
      });

      if (!response.ok) {
        throw new Error(`DeerFlow Render Starter LLM error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.output || 'No output received';
    } catch (error) {
      console.error('DeerFlow Render Starter LLM call failed:', error);
      return error instanceof Error ? error.message : 'Unknown error';
    }
  }

  /**
   * Call DeerFlow Render Starter scraping endpoint
   */
  private async callDeerFlowRenderStarterScraping(url: string): Promise<{
    success: boolean;
    content_length: number;
    url: string;
  }> {
    try {
      const response = await fetch(`${this.config.deerflow.baseUrl}/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`DeerFlow Render Starter scraping error: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: result.status === 'success',
        content_length: result.content_length || 0,
        url,
      };
    } catch (error) {
      console.error('DeerFlow Render Starter scraping call failed:', error);
      return {
        success: false,
        content_length: 0,
        url,
      };
    }
  }

  /**
   * Process a single step with Firebase whiteboard tracking
   */
  private async processStepWithWhiteboard(
    orchestrationId: string,
    step: string,
    payload: Record<string, unknown>,
    processor: (payload: Record<string, unknown>) => Promise<Record<string, unknown>>
  ): Promise<string> {
    try {
      const result = await processor(payload);
      
      const entryId = await this.createWhiteboardEntry(
        orchestrationId,
        step,
        { input: payload, output: result, status: 'completed' }
      );

      console.log(`✅ ${step} completed successfully`);
      return entryId;

    } catch (error) {
      const entryId = await this.createWhiteboardEntry(
        orchestrationId,
        step,
        { input: payload, error: error instanceof Error ? error.message : 'Unknown error', status: 'failed' }
      );

      console.log(`❌ ${step} failed:`, error);
      return entryId;
    }
  }

  /**
   * Create a new whiteboard entry in Firebase
   */
  private async createWhiteboardEntry(
    orchestrationId: string,
    step: string,
    data: Record<string, unknown>
  ): Promise<string> {
    const entryId = `${orchestrationId}_${step}_${Date.now()}`;
    
    const entry = {
      id: entryId,
      orchestration_id: orchestrationId,
      step,
      data,
      timestamp: new Date().toISOString(),
      ttl: this.config.whiteboard.ttl,
    };

    // Validate with Barton Doctrine
    const validatedPayload = this.bartonMiddleware.createPayload(
      entryId,
      `orchestration_${step}`,
      entry,
      {
        agent_id: 'deerflow-render-starter-orchestrator',
        blueprint_id: orchestrationId,
        schema_version: '1.0.0',
      }
    );

    // Save to Firebase
    await this.firebase.pushData({
      collection: 'orchestration_whiteboard',
      data: validatedPayload as any,
      documentId: entryId,
    });

    console.log(`📝 Created whiteboard entry: ${entryId}`);
    return entryId;
  }

  /**
   * Create orchestration summary
   */
  private async createOrchestrationSummary(
    orchestrationId: string,
    entryIds: string[],
    processingTime: number
  ): Promise<Record<string, unknown>> {
    const summary = {
      orchestration_id: orchestrationId,
      entry_count: entryIds.length,
      processing_time_ms: processingTime,
      entry_ids: entryIds,
      completed_at: new Date().toISOString(),
      deerflow_render_starter_version: '1.0.0',
    };

    const summaryId = `${orchestrationId}_summary`;
    const validatedSummary = this.bartonMiddleware.createPayload(
      summaryId,
      'orchestration_summary',
      summary,
      {
        agent_id: 'deerflow-render-starter-orchestrator',
        blueprint_id: orchestrationId,
        schema_version: '1.0.0',
      }
    );

    await this.firebase.pushData({
      collection: 'orchestration_summaries',
      data: validatedSummary as any,
      documentId: summaryId,
    });

    return summary;
  }

  /**
   * Get orchestration status from Firebase
   */
  async getOrchestrationStatus(orchestrationId: string): Promise<{
    summary: any;
    entries: any[];
  }> {
    try {
      // Get summary
      const summary = await this.firebase.getDocument('orchestration_summaries', `${orchestrationId}_summary`);
      
      // Get all entries
      const entries = await this.firebase.queryCollection('orchestration_whiteboard', {
        orchestration_id: orchestrationId,
      } as any);

      return { summary, entries };
    } catch (error) {
      console.error('Error getting orchestration status:', error);
      throw error;
    }
  }

  /**
   * Health check for all services including DeerFlow Render Starter
   */
  async healthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      firebase: 'healthy' | 'unhealthy';
      render: 'healthy' | 'unhealthy';
      deerflow: 'healthy' | 'unhealthy';
      mindpal: 'healthy' | 'unhealthy';
      deerflow_render_starter: 'healthy' | 'unhealthy';
    };
  }> {
    const results = await Promise.allSettled([
      this.testFirebaseConnection(),
      this.renderIntegration.healthCheck(),
      this.deerflowIntegration.healthCheck(),
      this.mindpalIntegration.healthCheck(),
      this.testDeerFlowRenderStarterConnection(),
    ]);

    const services = {
      firebase: results[0].status === 'fulfilled' ? 'healthy' : 'unhealthy' as const,
      render: results[1].status === 'fulfilled' ? 'healthy' : 'unhealthy' as const,
      deerflow: results[2].status === 'fulfilled' ? 'healthy' : 'unhealthy' as const,
      mindpal: results[3].status === 'fulfilled' ? 'healthy' : 'unhealthy' as const,
      deerflow_render_starter: results[4].status === 'fulfilled' ? 'healthy' : 'unhealthy' as const,
    };

    const healthyCount = Object.values(services).filter(status => status === 'healthy').length;
    const overall = healthyCount === 5 ? 'healthy' : healthyCount >= 3 ? 'degraded' : 'unhealthy';

    return { overall, services };
  }

  private async testFirebaseConnection(): Promise<boolean> {
    try {
      await this.firebase.queryCollection('orchestration_whiteboard', {});
      return true;
    } catch {
      return false;
    }
  }

  private async testDeerFlowRenderStarterConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.deerflow.baseUrl}/fire`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Test DeerFlow Render Starter endpoints
   */
  async testDeerFlowRenderStarterEndpoints(): Promise<{
    fire: boolean;
    scrape: boolean;
    pingpong: boolean;
  }> {
    const results = await Promise.allSettled([
      this.testFireEndpoint(),
      this.testScrapeEndpoint(),
      this.testPingPongEndpoint(),
    ]);

    return {
      fire: results[0].status === 'fulfilled',
      scrape: results[1].status === 'fulfilled',
      pingpong: results[2].status === 'fulfilled',
    };
  }

  private async testFireEndpoint(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.deerflow.baseUrl}/fire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_data: {
            llm: 'openai',
            message: 'Test message',
            validate: false,
          },
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async testScrapeEndpoint(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.deerflow.baseUrl}/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com' }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async testPingPongEndpoint(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.deerflow.baseUrl}/pingpong`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'test' }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const validateDeerFlowRenderStarterConfig = (data: unknown): DeerFlowRenderStarterConfig => {
  return DeerFlowRenderStarterConfigSchema.parse(data);
}; 