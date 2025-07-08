#!/usr/bin/env tsx

import Firecrawl from 'firecrawl';
import * as fs from 'fs';

async function runFirecrawlTest() {
  console.log('🕷️  Running Firecrawl test...');
  
  try {
    const firecrawl = new Firecrawl({
      apiKey: process.env.FIRECRAWL_API_KEY || 'your-api-key-here'
    });
    
    // Test web scraping
    const result = await firecrawl.scrapeUrl('https://example.com', {
      onlyMainContent: true
    });
    
    console.log('✅ Firecrawl test completed');
    
    // Save result
    const resultPath = 'firecrawl-test-result.json';
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    
    console.log(`\n📄 Results saved to: ${resultPath}`);
    console.log('📊 Raw result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Firecrawl test failed:', error);
    
    // Save error details
    const errorPath = 'firecrawl-test-error.json';
    fs.writeFileSync(errorPath, JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, null, 2));
    
    console.log(`\n📄 Error details saved to: ${errorPath}`);
  }
}

runFirecrawlTest().catch(console.error);
