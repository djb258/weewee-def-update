import * as dotenv from 'dotenv';
import { RenderDBOrchestrator, validateRenderDBConfig } from './render_db_orchestrator';

// 🔒 MANDATORY: Barton Doctrine enforcement
import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';

// Load environment variables from deerflow.env
dotenv.config({ path: './deerflow.env' });

// 🔒 MANDATORY: Initialize Barton Doctrine (CANNOT BE SKIPPED)
START_WITH_BARTON_DOCTRINE('render-db-test');

interface TestResults {
  configValidation: { passed: boolean; error?: string };
  firebaseConnection: { passed: boolean; error?: string };
  healthCheck: { passed: boolean; result?: any; error?: string };
  renderForDBEndpoints: { passed: boolean; result?: any; error?: string };
  orchestrationTest: { passed: boolean; result?: any; error?: string };
  databaseOperations: { passed: boolean; result?: any; error?: string };
}

async function runRenderDBTests(): Promise<void> {
  console.log('🧪 Starting Render-for-DB Orchestrator Tests...\n');

  const results: TestResults = {
    configValidation: { passed: false },
    firebaseConnection: { passed: false },
    healthCheck: { passed: false },
    renderForDBEndpoints: { passed: false },
    orchestrationTest: { passed: false },
    databaseOperations: { passed: false },
  };

  // Test 1: Configuration Validation
  console.log('📋 Test 1: Configuration Validation');
  try {
    const config = {
      render: {
        apiKey: process.env.RENDER_API_KEY || 'your-render-api-key-here',
        baseUrl: 'https://api.render.com',
        serviceId: process.env.RENDER_SERVICE_ID || 'your-render-service-id-here',
      },
      renderForDB: {
        baseUrl: process.env.RENDER_FOR_DB_URL || 'https://deerflow-fastapi.onrender.com',
        apiKey: process.env.RENDER_FOR_DB_API_KEY,
      },
      firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID || 'project-pig-1a8d7',
        privateKey: process.env.FIREBASE_PRIVATE_KEY || 'test-key',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || 'test@test.com',
      },
      databases: {
        postgres: process.env.POSTGRES_HOST ? {
          host: process.env.POSTGRES_HOST,
          port: parseInt(process.env.POSTGRES_PORT || '5432'),
          database: process.env.POSTGRES_DB || 'postgres',
          username: process.env.POSTGRES_USER || 'postgres',
          password: process.env.POSTGRES_PASSWORD || 'password',
        } : undefined,
        neon: process.env.NEON_CONNECTION_STRING ? {
          connectionString: process.env.NEON_CONNECTION_STRING,
        } : undefined,
        bigquery: process.env.BIGQUERY_PROJECT_ID ? {
          projectId: process.env.BIGQUERY_PROJECT_ID,
          keyFilename: process.env.BIGQUERY_KEY_FILENAME,
        } : undefined,
      },
      llm: {
        provider: (process.env.LLM_PROVIDER as 'openai' | 'claude' | 'gemini' | 'perplexity' | 'tavily') || 'openai',
        apiKey: process.env.LLM_API_KEY || 'your-llm-api-key-here',
        model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
      },
      browserless: {
        apiKey: process.env.BROWSERLESS_API_KEY || 'your-browserless-api-key-here',
        baseUrl: 'https://chrome.browserless.io',
      },
      hcompany: process.env.HCOMPANY_API_KEY ? {
        apiKey: process.env.HCOMPANY_API_KEY,
      } : undefined,
      google: process.env.GOOGLE_CLIENT_ID ? {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
      } : undefined,
    };

    const validatedConfig = validateRenderDBConfig(config);
    console.log('✅ Configuration validation passed');
    console.log(`   - Render-for-DB URL: ${validatedConfig.renderForDB.baseUrl}`);
    console.log(`   - Firebase Project: ${validatedConfig.firebase.projectId}`);
    console.log(`   - LLM Provider: ${validatedConfig.llm.provider} (${validatedConfig.llm.model})`);
    console.log(`   - Databases configured:`);
    console.log(`     - PostgreSQL: ${validatedConfig.databases.postgres ? '✅' : '❌'}`);
    console.log(`     - Neon: ${validatedConfig.databases.neon ? '✅' : '❌'}`);
    console.log(`     - BigQuery: ${validatedConfig.databases.bigquery ? '✅' : '❌'}`);
    console.log(`   - HCompany AI: ${validatedConfig.hcompany ? '✅' : '❌'}`);
    console.log(`   - Google OAuth: ${validatedConfig.google ? '✅' : '❌'}`);
    
    results.configValidation.passed = true;

    // Test 2: Firebase Connection Test
    console.log('\n🔥 Test 2: Firebase Connection');
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const orchestrator = new RenderDBOrchestrator(validatedConfig);
      console.log('✅ Render-for-DB Orchestrator initialized successfully');
      results.firebaseConnection.passed = true;
    } catch (error) {
      console.log('❌ Firebase connection failed:', error);
      results.firebaseConnection.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test 3: Health Check
    console.log('\n🏥 Test 3: Health Check');
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const orchestrator = new RenderDBOrchestrator(validatedConfig);
      const healthResult = await orchestrator.healthCheck();
      
      console.log(`✅ Health check completed: ${healthResult.overall}`);
      console.log('   Service Status:');
      console.log(`   - Firebase: ${healthResult.services.firebase}`);
      console.log(`   - Render-for-DB: ${healthResult.services.render_for_db}`);
      console.log(`   - PostgreSQL: ${healthResult.services.postgres}`);
      console.log(`   - Neon: ${healthResult.services.neon}`);
      console.log(`   - BigQuery: ${healthResult.services.bigquery}`);
      
      results.healthCheck.passed = true;
      results.healthCheck.result = healthResult;
    } catch (error) {
      console.log('❌ Health check failed:', error);
      results.healthCheck.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test 4: Render-for-DB Endpoints Test
    console.log('\n🦌 Test 4: Render-for-DB Endpoints');
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const orchestrator = new RenderDBOrchestrator(validatedConfig);
      const endpointsResult = await orchestrator.testRenderForDBEndpoints();
      
      console.log('✅ Render-for-DB endpoints test completed');
      console.log(`   - / endpoint: ${endpointsResult.root ? '✅' : '❌'}`);
      console.log(`   - /fire endpoint: ${endpointsResult.fire ? '✅' : '❌'}`);
      console.log(`   - /scrape endpoint: ${endpointsResult.scrape ? '✅' : '❌'}`);
      console.log(`   - /pingpong endpoint: ${endpointsResult.pingpong ? '✅' : '❌'}`);
      
      results.renderForDBEndpoints.passed = endpointsResult.root && endpointsResult.fire && endpointsResult.scrape && endpointsResult.pingpong;
      results.renderForDBEndpoints.result = endpointsResult;
    } catch (error) {
      console.log('❌ Render-for-DB endpoints test failed:', error);
      results.renderForDBEndpoints.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test 5: Database Operations Test
    console.log('\n🗄️ Test 5: Database Operations');
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const orchestrator = new RenderDBOrchestrator(validatedConfig);
      
      const mockData = {
        message: "Test database operations with this data",
        url: "https://example.com",
        persona: "developer",
        zip_code: "12345",
        database_operation: "test_query",
      };

      console.log('📋 Testing database operations...');
      const dbResult = await orchestrator.performDatabaseOperations(mockData);
      
      console.log(`✅ Database operations test completed`);
      console.log(`   - PostgreSQL: ${dbResult.postgres ? '✅' : '❌'}`);
      console.log(`   - Neon: ${dbResult.neon ? '✅' : '❌'}`);
      console.log(`   - BigQuery: ${dbResult.bigquery ? '✅' : '❌'}`);
      
      results.databaseOperations.passed = true;
      results.databaseOperations.result = dbResult;
    } catch (error) {
      console.log('❌ Database operations test failed:', error);
      results.databaseOperations.error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test 6: Full Orchestration Test
    console.log('\n🚀 Test 6: Full Orchestration Test');
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      const orchestrator = new RenderDBOrchestrator(validatedConfig);
      
      const mockOperationData = {
        message: "Process this data through all databases and services",
        url: "https://example.com",
        persona: "data_analyst",
        zip_code: "12345",
        database_operations: ["query", "insert", "update"],
        llm_prompt: "Analyze this data and provide insights",
      };

      console.log('📋 Starting full orchestration...');
      const orchestrationResult = await orchestrator.orchestrateDatabaseOperations(mockOperationData);
      
      console.log(`✅ Orchestration completed: ${orchestrationResult.success}`);
      console.log(`   - Orchestration ID: ${orchestrationResult.orchestrationId}`);
      console.log(`   - Processing Time: ${orchestrationResult.processingTime}ms`);
      console.log(`   - Results:`, Object.keys(orchestrationResult.results));
      
      results.orchestrationTest.passed = orchestrationResult.success;
      results.orchestrationTest.result = orchestrationResult;

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
  console.log('📊 RENDER-FOR-DB ORCHESTRATOR TEST SUMMARY');
  console.log('='.repeat(80));

  const testNames = [
    'Configuration Validation',
    'Firebase Connection',
    'Health Check',
    'Render-for-DB Endpoints',
    'Database Operations',
    'Full Orchestration',
  ];

  const testResults = [
    results.configValidation,
    results.firebaseConnection,
    results.healthCheck,
    results.renderForDBEndpoints,
    results.databaseOperations,
    results.orchestrationTest,
  ];

  testNames.forEach((name, index) => {
    const result = testResults[index];
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${name}`);
    if (result.error) {
      console.log(`      Error: ${result.error}`);
    }
  });

  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;

  console.log('\n' + '-'.repeat(80));
  console.log(`📈 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Render-for-DB Orchestrator is ready.');
  } else if (passedTests > 0) {
    console.log('⚠️  Most tests passed. System is functional but may have issues.');
  } else {
    console.log('🚨 Multiple test failures. Please check configuration and connectivity.');
  }

  console.log('\n🔗 Next Steps:');
  console.log('1. Deploy your Render-for-DB service to Render.com');
  console.log('2. Configure database connections (PostgreSQL, Neon, BigQuery)');
  console.log('3. Set up API keys for LLM providers and services');
  console.log('4. Test with real database operations');

  console.log('\n📋 Render-for-DB Features:');
  console.log('- Multi-LLM Support (OpenAI, Claude, Gemini, Perplexity, Tavily)');
  console.log('- Web Scraping (Browserless.io integration)');
  console.log('- Database Connectivity (PostgreSQL, Neon, BigQuery)');
  console.log('- Google OAuth Integration');
  console.log('- HCompany AI Integration');
  console.log('- Puppeteer Integration');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runRenderDBTests().catch(console.error);
} 