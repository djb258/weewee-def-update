// Simple test script for live DeerFlow Render Starter
// This tests the endpoints without requiring full environment setup

const DEERFLOW_BASE_URL = 'https://deerflow-render-starter.onrender.com';

interface TestResult {
  endpoint: string;
  status: 'success' | 'error';
  response?: any;
  error?: string;
}

async function testDeerFlowRenderStarterLive(): Promise<void> {
  console.log('🧪 Testing Live DeerFlow Render Starter Integration\n');
  console.log(`📍 Base URL: ${DEERFLOW_BASE_URL}\n`);

  const tests: TestResult[] = [];

  // Test 1: Root endpoint
  console.log('1️⃣ Testing root endpoint (/)...');
  try {
    const response = await fetch(`${DEERFLOW_BASE_URL}/`);
    const data = await response.json();
    tests.push({
      endpoint: '/',
      status: 'success',
      response: data
    });
    console.log(`   ✅ Success: ${JSON.stringify(data)}`);
  } catch (error) {
    tests.push({
      endpoint: '/',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`   ❌ Error: ${error}`);
  }

  // Test 2: Fire endpoint
  console.log('\n2️⃣ Testing fire endpoint (/fire)...');
  try {
    const response = await fetch(`${DEERFLOW_BASE_URL}/fire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input_data: {
          llm: 'openai',
          message: 'Test message from Firebase orchestrator integration',
          validate: false,
        },
        persona: 'blueprint_enforcer',
        command_source: 'firebase_orchestrator',
      }),
    });
    const data = await response.json();
    tests.push({
      endpoint: '/fire',
      status: 'success',
      response: data
    });
    console.log(`   ✅ Success: ${data.status} - ${data.engine}`);
    console.log(`   📝 Output: ${data.output?.substring(0, 100)}...`);
  } catch (error) {
    tests.push({
      endpoint: '/fire',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`   ❌ Error: ${error}`);
  }

  // Test 3: PingPong endpoint
  console.log('\n3️⃣ Testing pingpong endpoint (/pingpong)...');
  try {
    const response = await fetch(`${DEERFLOW_BASE_URL}/pingpong`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: 'Test pingpong from Firebase orchestrator integration'
      }),
    });
    const data = await response.json();
    tests.push({
      endpoint: '/pingpong',
      status: 'success',
      response: data
    });
    console.log(`   ✅ Success: ${data.response}`);
  } catch (error) {
    tests.push({
      endpoint: '/pingpong',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`   ❌ Error: ${error}`);
  }

  // Test 4: Scrape endpoint (basic test)
  console.log('\n4️⃣ Testing scrape endpoint (/scrape)...');
  try {
    const response = await fetch(`${DEERFLOW_BASE_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: 'https://example.com'
      }),
    });
    const data = await response.json();
    tests.push({
      endpoint: '/scrape',
      status: 'success',
      response: data
    });
    console.log(`   ✅ Success: ${data.status} - Content length: ${data.content_length}`);
  } catch (error) {
    tests.push({
      endpoint: '/scrape',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`   ❌ Error: ${error}`);
  }

  // Test 5: Fire endpoint with different LLM
  console.log('\n5️⃣ Testing fire endpoint with Claude (/fire)...');
  try {
    const response = await fetch(`${DEERFLOW_BASE_URL}/fire`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input_data: {
          llm: 'claude',
          message: 'Test Claude integration from Firebase orchestrator',
          validate: false,
        },
        persona: 'blueprint_enforcer',
        command_source: 'firebase_orchestrator',
      }),
    });
    const data = await response.json();
    tests.push({
      endpoint: '/fire (claude)',
      status: 'success',
      response: data
    });
    console.log(`   ✅ Success: ${data.status} - ${data.engine}`);
    console.log(`   📝 Output: ${data.output?.substring(0, 100)}...`);
  } catch (error) {
    tests.push({
      endpoint: '/fire (claude)',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`   ❌ Error: ${error}`);
  }

  // Print Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 DEERFLOW RENDER STARTER LIVE TEST SUMMARY');
  console.log('='.repeat(80));

  const successfulTests = tests.filter(test => test.status === 'success').length;
  const totalTests = tests.length;

  tests.forEach((test, index) => {
    const status = test.status === 'success' ? '✅' : '❌';
    console.log(`${status} Test ${index + 1}: ${test.endpoint}`);
    if (test.error) {
      console.log(`      Error: ${test.error}`);
    }
  });

  console.log('\n' + '-'.repeat(80));
  console.log(`📈 Overall Result: ${successfulTests}/${totalTests} tests passed`);
  
  if (successfulTests === totalTests) {
    console.log('🎉 All tests passed! DeerFlow Render Starter is fully operational.');
    console.log('✨ Ready for Firebase whiteboard orchestration integration!');
  } else if (successfulTests >= 3) {
    console.log('⚠️  Most tests passed. DeerFlow Render Starter is mostly operational.');
    console.log('🔧 Some endpoints may need configuration.');
  } else {
    console.log('🚨 Multiple test failures. Please check DeerFlow Render Starter deployment.');
  }

  console.log('\n🔗 Next Steps:');
  console.log('1. Configure your .env file with API keys');
  console.log('2. Run: npm run deerflow-orchestrate:quick');
  console.log('3. Run: npm run deerflow-orchestrate:test');
  console.log('4. Start orchestrating with Firebase whiteboard!');

  console.log('\n🦌 Available Endpoints:');
  console.log('- / (health check)');
  console.log('- /fire (multi-LLM processing)');
  console.log('- /pingpong (MindPal integration)');
  console.log('- /scrape (web scraping)');
  console.log('- /extract_company (company data)');
  console.log('- /screenshot (page screenshots)');
  console.log('- /auth/initiate (Google OAuth)');
}

// Run the test
if (require.main === module) {
  testDeerFlowRenderStarterLive().catch(console.error);
}

export { testDeerFlowRenderStarterLive }; 