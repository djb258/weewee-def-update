import { z } from 'zod';
import axios from 'axios';
import { FirebasePush } from './firebase_push';

// 🔒 MANDATORY: Barton Doctrine enforcement
import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';
import { BartonDoctrineMiddleware } from '../src/middleware/barton-doctrine-middleware';

// Render-for-DB Configuration Schema
export const RenderDBConfigSchema = z.object({
  render: z.object({
    apiKey: z.string().min(1),
    baseUrl: z.string().url().default('https://api.render.com'),
    serviceId: z.string().min(1),
  }),
  renderForDB: z.object({
    baseUrl: z.string().url().default('https://deerflow-fastapi.onrender.com'),
    apiKey: z.string().optional(),
  }),
  firebase: z.object({
    projectId: z.string().min(1),
    privateKey: z.string().min(1),
    clientEmail: z.string().email(),
  }),
  databases: z.object({
    postgres: z.object({
      host: z.string().min(1),
      port: z.number().default(5432),
      database: z.string().min(1),
      username: z.string().min(1),
      password: z.string().min(1),
    }).optional(),
    neon: z.object({
      connectionString: z.string().min(1),
    }).optional(),
    bigquery: z.object({
      projectId: z.string().min(1),
      keyFilename: z.string().optional(),
    }).optional(),
  }),
  llm: z.object({
    provider: z.enum(['openai', 'claude', 'gemini', 'perplexity', 'tavily']),
    apiKey: z.string().min(1),
    model: z.string().min(1),
  }),
  browserless: z.object({
    apiKey: z.string().min(1),
    baseUrl: z.string().url().default('https://chrome.browserless.io'),
  }),
  hcompany: z.object({
    apiKey: z.string().optional(),
  }).optional(),
  google: z.object({
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    redirectUri: z.string().url().optional(),
  }).optional(),
});

export type RenderDBConfig = z.infer<typeof RenderDBConfigSchema>;

// 🔒 MANDATORY: Initialize Barton Doctrine (CANNOT BE SKIPPED)
START_WITH_BARTON_DOCTRINE('render-db-orchestrator');

export class RenderDBOrchestrator {
  private config: RenderDBConfig;
  private firebase: FirebasePush;
  private bartonMiddleware: BartonDoctrineMiddleware;

  constructor(config: RenderDBConfig) {
    this.config = RenderDBConfigSchema.parse(config);
    
    // Initialize Barton Doctrine middleware
    this.bartonMiddleware = BartonDoctrineMiddleware.forTool('render-db-orchestrator');
    
    // Initialize Firebase
    this.firebase = new FirebasePush();
  }

  /**
   * Main orchestration method for database operations
   */
  async orchestrateDatabaseOperations(operationData: Record<string, unknown>): Promise<{
    success: boolean;
    orchestrationId: string;
    results: Record<string, unknown>;
    processingTime: number;
  }> {
    const startTime = Date.now();
    const orchestrationId = `db_orch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🚀 Starting Render-for-DB orchestration: ${orchestrationId}`);

    try {
      const results: Record<string, unknown> = {};

      // Step 1: LLM Processing via Render-for-DB
      console.log('🧠 Step 1: LLM processing via Render-for-DB...');
      const llmResult = await this.callRenderForDBLLM(operationData);
      results.llm_processing = llmResult;

      // Step 2: Web Scraping via Browserless
      if (operationData.url) {
        console.log('🌐 Step 2: Web scraping via Browserless...');
        const scrapingResult = await this.callRenderForDBScraping(operationData.url as string);
        results.web_scraping = scrapingResult;
      }

      // Step 3: Database Operations
      console.log('🗄️ Step 3: Database operations...');
      const dbResult = await this.performDatabaseOperations(operationData);
      results.database_operations = dbResult;

      // Step 4: HCompany AI Integration (if available)
      if (this.config.hcompany?.apiKey) {
        console.log('🤖 Step 4: HCompany AI integration...');
        const hcompanyResult = await this.callHCompanyAI(operationData);
        results.hcompany_ai = hcompanyResult;
      }

      // Step 5: Google OAuth (if configured)
      if (this.config.google?.clientId) {
        console.log('🔐 Step 5: Google OAuth integration...');
        const oauthResult = await this.initiateGoogleOAuth();
        results.google_oauth = oauthResult;
      }

      // Step 6: Store results in Firebase
      console.log('🔥 Step 6: Storing results in Firebase...');
      const firebaseResult = await this.storeResultsInFirebase(orchestrationId, results);
      results.firebase_storage = firebaseResult;

      const processingTime = Date.now() - startTime;
      console.log(`🎯 Orchestration ${orchestrationId} completed`);
      console.log(`⏱️ Total processing time: ${processingTime}ms`);

      return {
        success: true,
        orchestrationId,
        results,
        processingTime,
      };

    } catch (error) {
      console.error(`❌ Orchestration ${orchestrationId} failed:`, error);
      return {
        success: false,
        orchestrationId,
        results: { error: error instanceof Error ? error.message : 'Unknown error' },
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Call Render-for-DB LLM endpoint
   */
  private async callRenderForDBLLM(_data: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const payload = {
        input_data: {
          llm: this.config.llm.provider,
          message: _data.message || "Process this data with LLM",
          validate: true,
        },
        persona: _data.persona || "default",
        zip_code: _data.zip_code,
        command_source: "render-db-orchestrator",
      };

      const response = await axios.post(
        `${this.config.renderForDB.baseUrl}/fire`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.renderForDB.apiKey && { 'Authorization': `Bearer ${this.config.renderForDB.apiKey}` }),
          },
          timeout: 60000,
        }
      );

      return {
        success: true,
        engine: response.data.engine,
        output: response.data.output,
        status: response.data.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Call Render-for-DB scraping endpoint
   */
  private async callRenderForDBScraping(_url: string): Promise<Record<string, unknown>> {
    try {
      const response = await axios.post(
        `${this.config.renderForDB.baseUrl}/scrape`,
        { url: _url },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(this.config.renderForDB.apiKey && { 'Authorization': `Bearer ${this.config.renderForDB.apiKey}` }),
          },
          timeout: 60000,
        }
      );

      return {
        success: true,
        url: response.data.url,
        content_length: response.data.content_length,
        status: response.data.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Perform database operations
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  private async performDatabaseOperations(_data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};

    // PostgreSQL operations
    if (this.config.databases.postgres) {
      try {
        // Add PostgreSQL operations here
        results.postgres = { status: 'configured', operations: [] };
      } catch (error) {
        results.postgres = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    // Neon operations
    if (this.config.databases.neon) {
      try {
        // Add Neon operations here
        results.neon = { status: 'configured', operations: [] };
      } catch (error) {
        results.neon = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    // BigQuery operations
    if (this.config.databases.bigquery) {
      try {
        // Add BigQuery operations here
        results.bigquery = { status: 'configured', operations: [] };
      } catch (error) {
        results.bigquery = { error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    // eslint-disable-next-line no-unreachable
    return results;
  }

  /**
   * Call HCompany AI
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  private async callHCompanyAI(_data: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      // This would integrate with HCompany AI endpoints
      return {
        success: true,
        service: 'hcompany_ai',
        status: 'configured',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Initiate Google OAuth
   */
  private async initiateGoogleOAuth(): Promise<Record<string, unknown>> {
    try {
      const response = await axios.get(
        `${this.config.renderForDB.baseUrl}/auth/initiate`,
        {
          headers: {
            ...(this.config.renderForDB.apiKey && { 'Authorization': `Bearer ${this.config.renderForDB.apiKey}` }),
          },
          timeout: 30000,
        }
      );

      return {
        success: true,
        auth_url: response.data,
        status: 'initiated',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Store results in Firebase
   */
  private async storeResultsInFirebase(_orchestrationId: string, _results: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const documentId = await this.firebase.pushData({
        collection: 'orchestration_whiteboard',
        data: {
          orchestration_id: _orchestrationId,
          timestamp: new Date().toISOString(),
          results: _results,
          source: 'render-db-orchestrator',
        },
        documentId: `${_orchestrationId}_results`,
      });

      return {
        success: true,
        document_id: documentId,
        collection: 'orchestration_whiteboard',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Health check for all services
   */
  async healthCheck(): Promise<{
    overall: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      firebase: 'healthy' | 'unhealthy';
      render_for_db: 'healthy' | 'unhealthy';
      postgres: 'healthy' | 'unhealthy' | 'not_configured';
      neon: 'healthy' | 'unhealthy' | 'not_configured';
      bigquery: 'healthy' | 'unhealthy' | 'not_configured';
    };
  }> {
    const services = {
      firebase: 'unhealthy' as const,
      render_for_db: 'unhealthy' as const,
      postgres: 'not_configured' as const,
      neon: 'not_configured' as const,
      bigquery: 'not_configured' as const,
    };

    // Check Firebase
    try {
      await this.firebase.pushData({
        collection: 'orchestration_whiteboard',
        data: { health_check: true, timestamp: new Date().toISOString() },
        documentId: `health_check_${Date.now()}`,
      });
      services.firebase = 'healthy';
    } catch (error) {
      services.firebase = 'unhealthy';
    }

    // Check Render-for-DB
    try {
      const response = await axios.get(`${this.config.renderForDB.baseUrl}/`, { timeout: 10000 });
      if (response.status === 200) {
        services.render_for_db = 'healthy';
      }
    } catch (error) {
      services.render_for_db = 'unhealthy';
    }

    // Check databases
    if (this.config.databases.postgres) {
      services.postgres = 'not_configured';
    }
    if (this.config.databases.neon) {
      services.neon = 'not_configured';
    }
    if (this.config.databases.bigquery) {
      services.bigquery = 'not_configured';
    }

    const healthyCount = Object.values(services).filter(s => s === 'healthy').length;
    const totalServices = Object.keys(services).length;

    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'unhealthy';
    if (healthyCount === totalServices) {
      overall = 'healthy';
    } else if (healthyCount > 0) {
      overall = 'degraded';
    }

    return { overall, services };
  }

  /**
   * Test Render-for-DB endpoints
   */
  async testRenderForDBEndpoints(): Promise<{
    root: boolean;
    fire: boolean;
    scrape: boolean;
    pingpong: boolean;
  }> {
    const results = {
      root: false,
      fire: false,
      scrape: false,
      pingpong: false,
    };

    try {
      // Test root endpoint
      const rootResponse = await axios.get(`${this.config.renderForDB.baseUrl}/`, { timeout: 10000 });
      results.root = rootResponse.status === 200;
    } catch (error) {
      results.root = false;
    }

    try {
      // Test fire endpoint
      const fireResponse = await axios.get(`${this.config.renderForDB.baseUrl}/fire`, { timeout: 10000 });
      results.fire = fireResponse.status === 200;
    } catch (error) {
      results.fire = false;
    }

    try {
      // Test scrape endpoint
      const scrapeResponse = await axios.post(
        `${this.config.renderForDB.baseUrl}/scrape`,
        { url: 'https://example.com' },
        { timeout: 10000 }
      );
      results.scrape = scrapeResponse.status === 200;
    } catch (error) {
      results.scrape = false;
    }

    try {
      // Test pingpong endpoint
      const pingpongResponse = await axios.post(
        `${this.config.renderForDB.baseUrl}/pingpong`,
        { prompt: 'test' },
        { timeout: 10000 }
      );
      results.pingpong = pingpongResponse.status === 200;
    } catch (error) {
      results.pingpong = false;
    }

    return results;
  }
}

export const validateRenderDBConfig = (data: unknown): RenderDBConfig => {
  return RenderDBConfigSchema.parse(data);
}; 