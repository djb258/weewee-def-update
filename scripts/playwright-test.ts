#!/usr/bin/env tsx

import { chromium, firefox, webkit } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function runPlaywrightTests() {
  console.log('🎭 Running Playwright tests...');
  
  const browsers = [
    { name: 'Chromium', browser: chromium },
    { name: 'Firefox', browser: firefox },
    { name: 'Webkit', browser: webkit }
  ];
  
  const results: Array<{
    browser: string;
    success: boolean;
    title?: string;
    contentLength?: number;
    screenshot?: string;
    error?: string;
  }> = [];
  
  for (const { name, browser } of browsers) {
    try {
      console.log(`🌐 Testing with ${name}...`);
      const browserInstance = await browser.launch();
      const page = await browserInstance.newPage();
      
      // Test your SOP application
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      // Take a screenshot
      const screenshotPath = `screenshot-${name.toLowerCase()}.png`;
      await page.screenshot({ path: screenshotPath });
      
      // Get page title
      const title = await page.title();
      
      // Check for common elements
      const hasContent = await page.locator('body').textContent();
      
      results.push({
        browser: name,
        success: true,
        title,
        contentLength: hasContent?.length || 0,
        screenshot: screenshotPath
      });
      
      console.log(`✅ ${name} test completed`);
      await browserInstance.close();
    } catch (error) {
      console.error(`❌ ${name} test failed:`, error);
      results.push({
        browser: name,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  // Save results
  const resultsPath = 'playwright-test-results.json';
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  
  console.log('\n📊 Test Results:');
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.browser}: ${result.title} (${result.contentLength} chars)`);
    } else {
      console.log(`❌ ${result.browser}: ${result.error}`);
    }
  });
  
  console.log(`\n📄 Results saved to: ${resultsPath}`);
}

runPlaywrightTests().catch(console.error);

