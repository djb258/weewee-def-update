import * as dotenv from 'dotenv';
import { DeerFlowRenderStarterOrchestrator, validateDeerFlowRenderStarterConfig } from './render_deerflow_mindpal_firebase_orchestrator';

// 🔒 MANDATORY: Barton Doctrine enforcement
import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';

// Load environment variables from deerflow.env
dotenv.config({ path: './deerflow.env' });

// 🔒 MANDATORY: Initialize Barton Doctrine (CANNOT BE SKIPPED)
START_WITH_BARTON_DOCTRINE('deerflow-render-starter-test');

interface TestResults {
  configValidation: { passed: boolean; error?: string };
  firebaseConnection: { passed: boolean; error?: string };
  healthCheck: { passed: boolean; result?: any; error?: string };
  orchestrationTest: { passed: boolean; result?: any; error?: string };
  statusCheck: { passed: boolean; result?: any; error?: string };
  deerflowEndpoints: { passed: boolean; result?: any; error?: string };
}

async function runDeerFlowRenderStarterTests(): Promise<void> {
  console.log('🧪 Starting DeerFlow Render Starter Orchestrator Tests...\n');

  const results: TestResults = {
    configValidation: { passed: false },
    firebaseConnection: { passed: false },
    healthCheck: { passed: false },
    orchestrationTest: { passed: false },
    statusCheck: { passed: false },
    deerflowEndpoints: { passed: false },
  };

  // Test 1: Configuration Validation
  console.log('📋 Test 1: Configuration Validation');
  try {
    const config = {
      render: {
        apiKey: process.env.RENDER_API_KEY || 'test-render-key',
        webhookUrl: process.env.RENDER_WEBHOOK_URL || 'https://api.render.com/deploy/webhook',
        serviceId: process.env.RENDER_SERVICE_ID || 'test-service-id',
      },
      deerflow: {
        apiKey: process.env.DEERFLOW_API_KEY || 'test-deerflow-key',
        baseUrl: process.env.DEERFLOW_BASE_URL || 'https://deerflow-render-starter.onrender.com',
        workflowId: process.env.DEERFLOW_WORKFLOW_ID || 'test-workflow-id',
      },
      mindpal: {
        apiKey: process.env.MINDPAL_API_KEY || 'test-mindpal-key',
        agentId: process.env.MINDPAL_AGENT_ID || 'test-agent-id',
      },
      llm: {
        provider: (process.env.LLM_PROVIDER as 'openai' | 'claude' | 'gemini' | 'perplexity' | 'tavily') || 'openai',
        apiKey: process.env.LLM_API_KEY || 'test-llm-key',
        model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
      },
      firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID || 'test-project',
        privateKey: process.env.FIREBASE_PRIVATE_KEY || 'test-key',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'test@test.com',
      },
      whiteboard: {
        ttl: parseInt(process.env.FIREBASE_WHITEBOARD_TTL || '3600'),
        enableCleanup: process.env.FIREBASE_WHITEBOARD_CLEANUP === 'true',
        retentionDays: parseInt(process.env.FIREBASE_WHITEBOARD_RETENTION_DAYS || '7'),
      },
      browserless: {
        apiKey: process.env.BROWSERLESS_API_KEY || 'test-browserless-key',
      },
    };

    const validatedConfig = validateDeerFlowRenderStarterConfig(config);
    console.log('✅ Configuration validation passed');
    console.log(`   - Firebase Project: ${validatedConfig.firebase.projectId}`);
    console.log(`   - Render Service: ${validatedConfig.render.serviceId}`);
    console.log(`   - DeerFlow Base URL: ${validatedConfig.deerflow.baseUrl}`);
    console.log(`   - MindPal Agent: ${validatedConfig.mindpal.agentId}`);
    console.log(`   - LLM Provider: ${validatedConfig.llm.provider} (${validatedConfig.llm.model})`);
    console.log(`   - Whiteboard TTL: ${validatedConfig.whiteboard.ttl}s`);
    
    results.configValidation.passed = true;

    // Test 2: Firebase Connection Test
    console.log('\n🔥 Test 2: Firebase Connection');
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const orchestrator = new DeerFlowRenderStarterOrchestrator(validatedConfig);
      console.log('✅ DeerFlow Render Starter Orchestrator initialized successfully');
      results.firebaseConnection.passed = true;
    } catch (error) {
      console.log('❌ Firebase connection failed:', error);
      results.firebaseConnection.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test 3: Health Check
    console.log('\n🏥 Test 3: Health Check');
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const orchestrator = new DeerFlowRenderStarterOrchestrator(validatedConfig);
      const healthResult = await orchestrator.healthCheck();
      
      console.log(`✅ Health check completed: ${healthResult.overall}`);
      console.log('   Service Status:');
      console.log(`   - Firebase: ${healthResult.services.firebase}`);
      console.log(`   - Render: ${healthResult.services.render}`);
      console.log(`   - DeerFlow: ${healthResult.services.deerflow}`);
      console.log(`   - MindPal: ${healthResult.services.mindpal}`);
      console.log(`   - DeerFlow Render Starter: ${healthResult.services.deerflow_render_starter}`);
      
      results.healthCheck.passed = true;
      results.healthCheck.result = healthResult;
    } catch (error) {
      console.log('❌ Health check failed:', error);
      results.healthCheck.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test 4: DeerFlow Render Starter Endpoints Test
    console.log('\n🦌 Test 4: DeerFlow Render Starter Endpoints');
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const orchestrator = new DeerFlowRenderStarterOrchestrator(validatedConfig);
      const endpointsResult = await orchestrator.testDeerFlowRenderStarterEndpoints();
      
      console.log('✅ DeerFlow Render Starter endpoints test completed');
      console.log(`   - /fire endpoint: ${endpointsResult.fire ? '✅' : '❌'}`);
      console.log(`   - /scrape endpoint: ${endpointsResult.scrape ? '✅' : '❌'}`);
      console.log(`   - /pingpong endpoint: ${endpointsResult.pingpong ? '✅' : '❌'}`);
      
      results.deerflowEndpoints.passed = endpointsResult.fire && endpointsResult.scrape && endpointsResult.pingpong;
      results.deerflowEndpoints.result = endpointsResult;
    } catch (error) {
      console.log('❌ DeerFlow Render Starter endpoints test failed:', error);
      results.deerflowEndpoints.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test 5: Basic Orchestration Test (Mock Data)
    console.log('\n🚀 Test 5: Basic Orchestration Test');
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const orchestrator = new DeerFlowRenderStarterOrchestrator(validatedConfig);
      
      const mockBlueprint = {
        id: 'test-blueprint-001',
        name: 'DeerFlow Render Starter Test Blueprint',
        version: '1.0.0',
        description: 'Test blueprint for DeerFlow Render Starter orchestration',
        components: ['component1', 'component2'],
        url: 'https://example.com', // For web scraping test
        metadata: {
          author: 'deerflow-render-starter-test',
          created: new Date().toISOString(),
          type: 'test',
        },
      };

      console.log('📋 Starting orchestration with mock blueprint...');
      const orchestrationResult = await orchestrator.orchestrateWithFirebaseWhiteboard(mockBlueprint);
      
      console.log(`✅ Orchestration completed: ${orchestrationResult.success}`);
      console.log(`   - Orchestration ID: ${orchestrationResult.orchestrationId}`);
      console.log(`   - Whiteboard Entries: ${orchestrationResult.whiteboardEntries.length}`);
      console.log(`   - Processing Time: ${orchestrationResult.processingTime}ms`);
      console.log('   - Entry IDs:', orchestrationResult.whiteboardEntries);
      
      results.orchestrationTest.passed = orchestrationResult.success;
      results.orchestrationTest.result = orchestrationResult;

      // Test 6: Status Check
      console.log('\n📊 Test 6: Orchestration Status Check');
      try {
        const statusResult = await orchestrator.getOrchestrationStatus(orchestrationResult.orchestrationId);
        
        console.log('✅ Status check completed');
        console.log(`   - Summary exists: ${!!statusResult.summary}`);
        console.log(`   - Entries count: ${statusResult.entries.length}`);
        
        if (statusResult.summary) {
          console.log(`   - Entry count in summary: ${(statusResult.summary as any).entry_count}`);
          console.log(`   - Completed at: ${(statusResult.summary as any).completed_at}`);
        }
        
        results.statusCheck.passed = true;
        results.statusCheck.result = statusResult;
      } catch (error) {
        console.log('❌ Status check failed:', error);
        results.statusCheck.error = error instanceof Error ? error.message : 'Unknown error';
      }

    } catch (error) {
      console.log('❌ Orchestration test failed:', error);
      results.orchestrationTest.error = error instanceof Error ? error.message : 'Unknown error';
    }

  } catch (error) {
    console.log('❌ Configuration validation failed:', error);
    results.configValidation.error = error instanceof Error ? error.message : 'Unknown error';
  }

  // Print Test Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 DEERFLOW RENDER STARTER ORCHESTRATOR TEST SUMMARY');
  console.log('='.repeat(80));

  const testNames = [
    'Configuration Validation',
    'Firebase Connection',
    'Health Check',
    'DeerFlow Endpoints',
    'Orchestration Test',
    'Status Check'
  ];

  const testKeys: (keyof TestResults)[] = [
    'configValidation',
    'firebaseConnection', 
    'healthCheck',
    'deerflowEndpoints',
    'orchestrationTest',
    'statusCheck'
  ];

  let passedTests = 0;
  testNames.forEach((name, index) => {
    const result = results[testKeys[index]];
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${name}`);
    if (result.error) {
      console.log(`      Error: ${result.error}`);
    }
    if (result.passed) passedTests++;
  });

  console.log('\n' + '-'.repeat(80));
  console.log(`📈 Overall Result: ${passedTests}/${testNames.length} tests passed`);
  
  if (passedTests === testNames.length) {
    console.log('🎉 All tests passed! DeerFlow Render Starter Orchestrator is ready.');
  } else if (passedTests >= 4) {
    console.log('⚠️  Most tests passed. System is functional but may have issues.');
  } else {
    console.log('🚨 Multiple test failures. Please check configuration and connectivity.');
  }

  console.log('\n🔗 Next Steps:');
  console.log('1. Deploy your DeerFlow Render Starter to Render.com');
  console.log('2. Configure Firebase collections for whiteboard functionality');
  console.log('3. Set up proper API keys in your .env file');
  console.log('4. Test with real blueprint data');
  console.log('\n📋 Firebase Collections Created:');
  console.log('- orchestration_whiteboard (payload tracking)');
  console.log('- orchestration_summaries (execution summaries)');
  console.log('\n🦌 DeerFlow Render Starter Endpoints:');
  console.log('- /fire (LLM processing)');
  console.log('- /scrape (web scraping)');
  console.log('- /pingpong (MindPal integration)');
}

// Quick connectivity test function
async function quickConnectivityTest(): Promise<void> {
  console.log('🔍 Quick Connectivity Test for DeerFlow Render Starter Orchestrator\n');

  const requiredEnvVars = [
    'RENDER_API_KEY',
    'RENDER_WEBHOOK_URL', 
    'RENDER_SERVICE_ID',
    'DEERFLOW_API_KEY',
    'DEERFLOW_BASE_URL',
    'DEERFLOW_WORKFLOW_ID',
    'MINDPAL_API_KEY',
    'MINDPAL_AGENT_ID',
    'LLM_API_KEY',
    'LLM_PROVIDER',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];

  console.log('📋 Environment Variables Check:');
  let missingVars = 0;
  requiredEnvVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅' : '❌';
    const displayValue = value ? (value.length > 20 ? `${value.substring(0, 20)}...` : value) : 'NOT SET';
    console.log(`${status} ${varName}: ${displayValue}`);
    if (!value) missingVars++;
  });

  console.log(`\n📊 Environment Status: ${requiredEnvVars.length - missingVars}/${requiredEnvVars.length} variables set`);
  
  if (missingVars === 0) {
    console.log('🎉 All environment variables are configured!');
    console.log('✨ Run the full test with: npm run deerflow-orchestrate:test');
  } else {
    console.log(`⚠️  ${missingVars} environment variables need to be configured.`);
    console.log('📝 Please update your .env file with the missing values.');
  }

  console.log('\n🦌 DeerFlow Render Starter Setup:');
  console.log('1. Deploy your DeerFlow Render Starter to Render.com');
  console.log('2. Set DEERFLOW_BASE_URL to your deployed URL');
  console.log('3. Configure all API keys in your .env file');
  console.log('4. Test connectivity with: npm run deerflow-orchestrate:quick');
}

// Main execution
if (require.main === module) {
  const testType = process.argv[2];
  
  if (testType === 'quick') {
    quickConnectivityTest().catch(console.error);
  } else {
    runDeerFlowRenderStarterTests().catch(console.error);
  }
}

export { runDeerFlowRenderStarterTests, quickConnectivityTest }; 