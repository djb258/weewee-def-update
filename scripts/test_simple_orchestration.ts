#!/usr/bin/env tsx

/**
 * Simple Orchestration Test - Bypasses Firebase
 * Tests core orchestration logic with working DeerFlow endpoints
 */

import { MandatoryBartonDoctrine } from '../src/core/mandatory-barton-doctrine';

interface SimpleOrchestrationResult {
  success: boolean;
  step: string;
  data?: any;
  error?: string;
}

class SimpleOrchestrator {
  private deerflowBaseUrl: string;
  private llmApiKey: string;
  private llmProvider: string;

  constructor() {
    this.deerflowBaseUrl = process.env.DEERFLOW_BASE_URL || 'https://deerflow-render-starter.onrender.com';
    this.llmApiKey = process.env.LLM_API_KEY || 'your-llm-api-key-here';
    this.llmProvider = process.env.LLM_PROVIDER || 'openai';
  }

  async testDeerFlowEndpoint(endpoint: string, payload?: any, method: string = 'POST'): Promise<SimpleOrchestrationResult> {
    try {
      const url = `${this.deerflowBaseUrl}${endpoint}`;
      const requestOptions: any = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (payload && method === 'POST') {
        requestOptions.body = JSON.stringify(payload);
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        step: endpoint,
        data
      };
    } catch (error) {
      return {
        success: false,
        step: endpoint,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async runSimpleOrchestration(): Promise<void> {
    console.log('🧪 Simple Orchestration Test (Bypassing Firebase)');
    console.log('=' .repeat(60));
    
    // Initialize Barton Doctrine
    const bartonDoctrine = MandatoryBartonDoctrine.initializeTool('simple-orchestrator');
    
    const results: SimpleOrchestrationResult[] = [];

    // Test 1: Health Check (GET method)
    console.log('\n1️⃣ Testing DeerFlow health...');
    const healthResult = await this.testDeerFlowEndpoint('/', undefined, 'GET');
    results.push(healthResult);
    console.log(healthResult.success ? '✅ Health check passed' : `❌ Health check failed: ${healthResult.error}`);

    // Test 2: LLM Processing (OpenAI)
    console.log('\n2️⃣ Testing LLM processing (OpenAI)...');
    const openaiPayload = {
      input_data: {
        llm: 'openai',
        message: "Explain the Barton Doctrine in simple terms",
        validate: true
      },
      persona: 'blueprint_enforcer',
      command_source: 'firebase_orchestrator'
    };
    const openaiResult = await this.testDeerFlowEndpoint('/fire', openaiPayload);
    results.push(openaiResult);
    if (openaiResult.success) {
      console.log('✅ LLM processing (OpenAI) passed');
    } else {
      console.log(`❌ LLM processing (OpenAI) failed: ${openaiResult.error}`);
      if (openaiResult.data) {
        console.log('   Response:', JSON.stringify(openaiResult.data));
      }
    }

    // Test 3: LLM Processing (Claude)
    console.log('\n3️⃣ Testing LLM processing (Claude)...');
    const claudePayload = {
      input_data: {
        llm: 'claude',
        message: "Explain the Barton Doctrine in simple terms",
        validate: true
      },
      persona: 'blueprint_enforcer',
      command_source: 'firebase_orchestrator'
    };
    const claudeResult = await this.testDeerFlowEndpoint('/fire', claudePayload);
    results.push(claudeResult);
    if (claudeResult.success) {
      console.log('✅ LLM processing (Claude) passed');
    } else {
      console.log(`❌ LLM processing (Claude) failed: ${claudeResult.error}`);
      if (claudeResult.data) {
        console.log('   Response:', JSON.stringify(claudeResult.data));
      }
    }

    // Test 4: Web Scraping
    console.log('\n4️⃣ Testing web scraping...');
    const scrapePayload = {
      url: "https://example.com",
      api_key: this.llmApiKey
    };
    const scrapeResult = await this.testDeerFlowEndpoint('/scrape', scrapePayload);
    results.push(scrapeResult);
    console.log(scrapeResult.success ? '✅ Web scraping passed' : `❌ Web scraping failed: ${scrapeResult.error}`);

    // Test 5: MindPal Integration
    console.log('\n5️⃣ Testing MindPal integration...');
    const pingpongPayload = {
      message: "Test from simple orchestrator",
      timestamp: new Date().toISOString()
    };
    const pingpongResult = await this.testDeerFlowEndpoint('/pingpong', pingpongPayload);
    results.push(pingpongResult);
    console.log(pingpongResult.success ? '✅ MindPal integration passed' : `❌ MindPal integration failed: ${pingpongResult.error}`);

    // Validate results with Barton Doctrine using a compliant payload
    console.log('\n🔒 Validating results with Barton Doctrine...');
    const summaryPayload = bartonDoctrine.createPayload(
      'simple_orchestration_test',
      'deerflow_render_starter',
      { test_results: results },
      { blueprint_id: 'orchestration', schema_version: '1.0.0' }
    );
    try {
      bartonDoctrine.validate(summaryPayload, 'orchestration-test');
      console.log('✅ Barton Doctrine validation passed');
    } catch (error) {
      console.log('⚠️  Barton Doctrine validation warning:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 SIMPLE ORCHESTRATION TEST SUMMARY');
    console.log('=' .repeat(60));
    
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    results.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} Test ${index + 1}: ${result.step}`);
      if (!result.success) {
        console.log(`   Error: ${result.error}`);
        if (result.data) {
          console.log('   Response:', JSON.stringify(result.data));
        }
      }
    });

    console.log('\n' + '-'.repeat(60));
    console.log(`📈 Overall Result: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! Core orchestration is working.');
      console.log('✨ Ready for Firebase integration when configured.');
    } else {
      console.log('⚠️  Some tests failed. Check configuration and connectivity.');
    }

    console.log('\n🔗 Next Steps:');
    console.log('1. Configure Firebase credentials for full orchestration');
    console.log('2. Set up API keys in your .env file');
    console.log('3. Run: npm run deerflow-orchestrate:test');
  }
}

// Run the test
async function main() {
  const orchestrator = new SimpleOrchestrator();
  await orchestrator.runSimpleOrchestration();
}

if (require.main === module) {
  main().catch(console.error);
} 