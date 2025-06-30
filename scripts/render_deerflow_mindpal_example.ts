import { RenderIntegration } from './render_integration';
import { DeerFlowIntegration } from './deerflow_integration';
import { MindPalIntegration } from './mindpal_integration';

// 🔒 MANDATORY: Barton Doctrine enforcement
import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';

// 🔒 MANDATORY: Initialize Barton Doctrine (CANNOT BE SKIPPED)
START_WITH_BARTON_DOCTRINE('render-deerflow-mindpal-example');

// Configuration interface
interface ServiceConfig {
  render: {
    apiKey: string;
    webhookUrl: string;
    serviceId: string;
  };
  deerflow: {
    apiKey: string;
    baseUrl: string;
    workflowId: string;
  };
  mindpal: {
    apiKey: string;
    agentId: string;
  };
  llm: {
    provider: 'openai' | 'anthropic';
    apiKey: string;
    model: string;
  };
}

/**
 * Example function to orchestrate Render, DeerFlow, and MindPal services
 */
export async function orchestrateServices(config: ServiceConfig, blueprintData: Record<string, any>) {
  console.log('🚀 Starting service orchestration...');
  
  // Initialize services
  const renderService = new RenderIntegration({
    apiKey: config.render.apiKey,
    webhookUrl: config.render.webhookUrl,
    baseUrl: 'https://api.render.com',
    timeout: 60000,
    retryAttempts: 3,
  });

  const deerflowService = new DeerFlowIntegration({
    apiKey: config.deerflow.apiKey,
    baseUrl: config.deerflow.baseUrl,
    timeout: 60000,
    retryAttempts: 3,
  });

  const mindpalService = new MindPalIntegration({
    apiKey: config.mindpal.apiKey,
    baseUrl: 'https://api.mindpal.com',
    timeout: 60000,
    retryAttempts: 3,
  });

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
      const validation = await mindpalService.validateBlueprintWithMindPal(
        blueprintData,
        config.mindpal.agentId
      );
      
      if (validation.isValid) {
        results.mindpal = { success: true, message: 'Blueprint validated successfully' };
        console.log('✅ MindPal validation passed');
      } else {
        results.mindpal = { success: false, message: `Validation failed: ${validation.errors.join(', ')}` };
        console.log('❌ MindPal validation failed');
      }
    } catch (error) {
      results.mindpal = { success: false, message: `Error: ${error}` };
      console.log('❌ MindPal error:', error);
    }

    // Step 2: DeerFlow Processing
    console.log('🦌 Step 2: DeerFlow processing...');
    try {
      const processing = await deerflowService.processBlueprintWithDeerFlow(
        blueprintData,
        config.deerflow.workflowId
      );
      
      if (processing.success) {
        results.deerflow = { success: true, message: `Workflow executed: ${processing.executionId}` };
        console.log('✅ DeerFlow processing completed');
      } else {
        results.deerflow = { success: false, message: processing.error || 'Processing failed' };
        console.log('❌ DeerFlow processing failed');
      }
    } catch (error) {
      results.deerflow = { success: false, message: `Error: ${error}` };
      console.log('❌ DeerFlow error:', error);
    }

    // Step 3: LLM Enhancement
    console.log('🧠 Step 3: LLM enhancement...');
    try {
      const prompt = `Analyze and enhance this blueprint data: ${JSON.stringify(blueprintData, null, 2)}`;
      const llmResponse = await callLLM(prompt, config.llm);
      
      results.llm = { success: true, message: `Enhanced: ${llmResponse.substring(0, 100)}...` };
      console.log('✅ LLM enhancement completed');
    } catch (error) {
      results.llm = { success: false, message: `Error: ${error}` };
      console.log('❌ LLM error:', error);
    }

    // Step 4: Render Deployment
    console.log('🚀 Step 4: Render deployment...');
    try {
      const deployment = await renderService.deployBlueprint(
        blueprintData,
        config.render.serviceId
      );
      
      if (deployment.success) {
        results.render = { success: true, message: `Deployed: ${deployment.deploymentId}` };
        console.log('✅ Render deployment completed');
      } else {
        results.render = { success: false, message: deployment.error || 'Deployment failed' };
        console.log('❌ Render deployment failed');
      }
    } catch (error) {
      results.render = { success: false, message: `Error: ${error}` };
      console.log('❌ Render error:', error);
    }

    const successCount = Object.values(results).filter(r => r.success).length;
    const overallSuccess = successCount >= 2;

    console.log(`🎯 Orchestration completed: ${successCount}/4 services successful`);
    
    return {
      success: overallSuccess,
      results,
    };

  } catch (error) {
    console.error('❌ Orchestration failed:', error);
    return {
      success: false,
      results,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Call LLM service
 */
async function callLLM(prompt: string, llmConfig: ServiceConfig['llm']): Promise<string> {
  const { provider, apiKey, model } = llmConfig;

  if (provider === 'openai') {
    return callOpenAI(prompt, apiKey, model);
  } else if (provider === 'anthropic') {
    return callAnthropic(prompt, apiKey, model);
  } else {
    throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}

async function callOpenAI(prompt: string, apiKey: string, model: string): Promise<string> {
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

  const data: any = await response.json();
  return data.choices[0].message.content;
}

async function callAnthropic(prompt: string, apiKey: string, model: string): Promise<string> {
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

  const data: any = await response.json();
  return data.content[0].text;
}

/**
 * Health check all services
 */
export async function healthCheckServices(config: ServiceConfig) {
  console.log('🔍 Running health checks...');
  
  const renderService = new RenderIntegration({
    apiKey: config.render.apiKey,
    webhookUrl: config.render.webhookUrl,
    baseUrl: 'https://api.render.com',
    timeout: 30000,
    retryAttempts: 1,
  });

  const deerflowService = new DeerFlowIntegration({
    apiKey: config.deerflow.apiKey,
    baseUrl: config.deerflow.baseUrl,
    timeout: 30000,
    retryAttempts: 1,
  });

  const mindpalService = new MindPalIntegration({
    apiKey: config.mindpal.apiKey,
    baseUrl: 'https://api.mindpal.com',
    timeout: 30000,
    retryAttempts: 1,
  });

  const results = await Promise.allSettled([
    renderService.healthCheck(),
    deerflowService.healthCheck(),
    mindpalService.healthCheck(),
  ]);

  const status = {
    render: results[0].status === 'fulfilled' ? 'healthy' : 'unhealthy',
    deerflow: results[1].status === 'fulfilled' ? 'healthy' : 'unhealthy',
    mindpal: results[2].status === 'fulfilled' ? 'healthy' : 'unhealthy',
  };

  const healthyCount = Object.values(status).filter(s => s === 'healthy').length;
  const overall = healthyCount === 3 ? 'healthy' : healthyCount >= 2 ? 'degraded' : 'unhealthy';

  console.log(`Health status: ${overall}`);
  console.log('Service status:', status);

  return { overall, services: status };
}

/**
 * Example usage with environment variables
 */
export async function runExampleOrchestration() {
  // Example configuration - replace with your actual values
  const config: ServiceConfig = {
    render: {
      apiKey: process.env.RENDER_API_KEY || 'your-render-api-key',
      webhookUrl: process.env.RENDER_WEBHOOK_URL || 'https://your-webhook-url.com',
      serviceId: process.env.RENDER_SERVICE_ID || 'your-service-id',
    },
    deerflow: {
      apiKey: process.env.DEERFLOW_API_KEY || 'your-deerflow-api-key',
      baseUrl: process.env.DEERFLOW_BASE_URL || 'https://deerflow-render-starter.onrender.com',
      workflowId: process.env.DEERFLOW_WORKFLOW_ID || 'your-workflow-id',
    },
    mindpal: {
      apiKey: process.env.MINDPAL_API_KEY || 'your-mindpal-api-key',
      agentId: process.env.MINDPAL_AGENT_ID || 'your-agent-id',
    },
    llm: {
      provider: (process.env.LLM_PROVIDER as 'openai' | 'anthropic') || 'openai',
      apiKey: process.env.LLM_API_KEY || 'your-llm-api-key',
      model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
    },
  };

  // Example blueprint data
  const blueprintData = {
    id: 'example-blueprint',
    name: 'Example Blueprint',
    version: '1.0.0',
    description: 'An example blueprint for testing orchestration',
    components: [
      {
        type: 'web-service',
        name: 'api-server',
        config: {
          port: 3000,
          environment: 'production',
        },
      },
    ],
  };

  // Run health check first
  const health = await healthCheckServices(config);
  
  if (health.overall === 'unhealthy') {
    console.log('❌ Too many services are unhealthy. Aborting orchestration.');
    return { success: false, error: 'Services unhealthy' };
  }

  // Run orchestration
  const result = await orchestrateServices(config, blueprintData);
  
  console.log('📊 Final Results:');
  console.log(`Overall success: ${result.success}`);
  console.log('Service results:', result.results);

  return result;
}

// Export the main functions
export { ServiceConfig };

// If running directly
if (require.main === module) {
  runExampleOrchestration().catch(console.error);
} 