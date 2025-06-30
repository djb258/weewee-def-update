#!/usr/bin/env ts-node

/**
 * Cursor Productivity Features Test Script
 * Tests BugBot, Background Agent, Memory Bank, and MCP integration
 */

import { promises as fs } from 'fs';
import { join } from 'path';

interface TestResult {
  feature: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
}

class CursorProductivityTester {
  private results: TestResult[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  async runAllTests(): Promise<void> {
    console.log('🧪 Testing Cursor Productivity Features...\n');

    await this.testConfigurationFiles();
    await this.testMemoryBankSetup();
    await this.testMCPIntegration();
    await this.testProjectStructure();
    
    this.displayResults();
  }

  private async testConfigurationFiles(): Promise<void> {
    console.log('📄 Testing Configuration Files...');

    try {
      // Test main cursor config
      const settingsPath = join(this.projectRoot, 'cursor-config', 'settings.json');
      const settingsContent = await fs.readFile(settingsPath, 'utf-8');
      const settings = JSON.parse(settingsContent);

      if (settings['cursor.bugBot.enabled'] === true) {
        this.addResult('BugBot Configuration', 'PASS', 'BugBot is enabled in settings');
      } else {
        this.addResult('BugBot Configuration', 'FAIL', 'BugBot not enabled');
      }

      if (settings['cursor.backgroundAgent.enabled'] === true) {
        this.addResult('Background Agent Configuration', 'PASS', 'Background Agent is enabled');
      } else {
        this.addResult('Background Agent Configuration', 'FAIL', 'Background Agent not enabled');
      }

      if (settings['cursor.memoryBank.enabled'] === true) {
        this.addResult('Memory Bank Configuration', 'PASS', 'Memory Bank is enabled');
      } else {
        this.addResult('Memory Bank Configuration', 'FAIL', 'Memory Bank not enabled');
      }

      if (settings['cursor.projectContext.enabled'] === true) {
        this.addResult('Project Context Configuration', 'PASS', 'Project Context Beta is enabled');
      } else {
        this.addResult('Project Context Configuration', 'FAIL', 'Project Context not enabled');
      }

    } catch (error) {
      this.addResult('Configuration Files', 'FAIL', `Error reading config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testMemoryBankSetup(): Promise<void> {
    console.log('🧠 Testing Memory Bank Setup...');

    try {
      const memoryBankPath = join(this.projectRoot, 'cursor-config', 'memory-bank-core-conventions.json');
      const memoryBankContent = await fs.readFile(memoryBankPath, 'utf-8');
      const memoryBank = JSON.parse(memoryBankContent);

      if (memoryBank.memoryBank.name === 'core_conventions') {
        this.addResult('Memory Bank Core Conventions', 'PASS', 'Core conventions bank is properly initialized');
      } else {
        this.addResult('Memory Bank Core Conventions', 'FAIL', 'Core conventions bank not found');
      }

      if (memoryBank.memoryBank.autoCapture === true) {
        this.addResult('Memory Bank Auto-Capture', 'PASS', 'Auto-capture is enabled');
      } else {
        this.addResult('Memory Bank Auto-Capture', 'FAIL', 'Auto-capture not enabled');
      }

    } catch (error) {
      this.addResult('Memory Bank Setup', 'FAIL', `Error reading memory bank config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testMCPIntegration(): Promise<void> {
    console.log('🔗 Testing MCP Integration...');

    try {
      const mcpPath = join(this.projectRoot, 'cursor-config', 'mcp-config.json');
      const mcpContent = await fs.readFile(mcpPath, 'utf-8');
      const mcp = JSON.parse(mcpContent);

      if (mcp.mcp.enabled === true) {
        this.addResult('MCP Configuration', 'PASS', 'MCP is enabled');
      } else {
        this.addResult('MCP Configuration', 'FAIL', 'MCP not enabled');
      }

      // Test weather API connection (if API key is available)
      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (apiKey) {
        this.addResult('MCP Weather API', 'PASS', 'Weather API configuration found (actual connection test requires manual verification)');
      } else {
        this.addResult('MCP Weather API', 'SKIP', 'OPENWEATHER_API_KEY not set');
      }

    } catch (error) {
      this.addResult('MCP Integration', 'FAIL', `Error reading MCP config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async testProjectStructure(): Promise<void> {
    console.log('📁 Testing Project Structure...');

    try {
      const cursorJsonPath = join(this.projectRoot, '.cursor.json');
      const cursorJsonContent = await fs.readFile(cursorJsonPath, 'utf-8');
      const cursorJson = JSON.parse(cursorJsonContent);

      if (cursorJson.name === 'cursor-blueprint-enforcer') {
        this.addResult('Workspace Configuration', 'PASS', 'Workspace is properly configured');
      } else {
        this.addResult('Workspace Configuration', 'FAIL', 'Workspace name mismatch');
      }

      if (cursorJson.model?.default === 'gemini-2.5-pro') {
        this.addResult('Default Model', 'PASS', 'Gemini 2.5 Pro is set as default');
      } else {
        this.addResult('Default Model', 'FAIL', 'Default model not set correctly');
      }

    } catch (error) {
      this.addResult('Project Structure', 'FAIL', `Error reading .cursor.json: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private addResult(feature: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string): void {
    this.results.push({ feature, status, message });
  }

  private displayResults(): void {
    console.log('\n📊 Test Results Summary:');
    console.log('========================\n');

    let passCount = 0;
    let failCount = 0;
    let skipCount = 0;

    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
      console.log(`${icon} ${result.feature}: ${result.message}`);
      
      if (result.status === 'PASS') passCount++;
      else if (result.status === 'FAIL') failCount++;
      else skipCount++;
    });

    console.log(`\n📈 Summary: ${passCount} passed, ${failCount} failed, ${skipCount} skipped`);
    
    if (failCount === 0) {
      console.log('🎉 All tests passed! Cursor productivity features are ready to use.');
    } else {
      console.log('⚠️  Some tests failed. Please check the configuration.');
    }
  }
}

// Run the tests
async function main() {
  const tester = new CursorProductivityTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { CursorProductivityTester }; 