#!/usr/bin/env node

import { ClaudeAuto } from './claude-auto.js';
import * as fs from 'fs';
import * as path from 'path';

async function testClaudeAuto() {
  console.log('🧪 Testing Claude Auto Integration...\n');

  try {
    // Test 1: Configuration Loading
    console.log('1. Testing configuration loading...');
    const claude = new ClaudeAuto();
    console.log('✅ Configuration loaded successfully\n');

    // Test 2: Project Context Loading
    console.log('2. Testing project context loading...');
    const context = claude['projectContext'];
    console.log(`   - Schemas loaded: ${context.schemas.length}`);
    console.log(`   - Modules found: ${context.modules.length}`);
    console.log(`   - Doctrine sections: ${Object.keys(context.doctrine).length}`);
    console.log('✅ Project context loaded successfully\n');

    // Test 3: Configuration File Check
    console.log('3. Testing configuration file...');
    const configPath = path.join(process.cwd(), 'config', 'claude-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log(`   - Model: ${config.model}`);
      console.log(`   - Max tokens: ${config.maxTokens}`);
      console.log(`   - Features enabled: ${Object.keys(config.features).length}`);
      console.log('✅ Configuration file exists and is valid\n');
    } else {
      console.log('⚠️  Configuration file not found\n');
    }

    // Test 4: GitHub Actions Check
    console.log('4. Testing GitHub Actions workflow...');
    const workflowPath = path.join(process.cwd(), '.github', 'workflows', 'claude-auto.yml');
    if (fs.existsSync(workflowPath)) {
      console.log('✅ GitHub Actions workflow exists\n');
    } else {
      console.log('⚠️  GitHub Actions workflow not found\n');
    }

    // Test 5: Package.json Scripts Check
    console.log('5. Testing package.json scripts...');
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const claudeScripts = Object.keys(packageJson.scripts).filter(key => key.startsWith('claude:'));
      console.log(`   - Claude scripts found: ${claudeScripts.length}`);
      claudeScripts.forEach(script => console.log(`     - ${script}`));
      console.log('✅ Package.json scripts configured\n');
    }

    // Test 6: Documentation Check
    console.log('6. Testing documentation...');
    const docsPath = path.join(process.cwd(), 'docs', 'CLAUDE_AUTO_INTEGRATION.md');
    if (fs.existsSync(docsPath)) {
      const stats = fs.statSync(docsPath);
      console.log(`   - Documentation file size: ${stats.size} bytes`);
      console.log('✅ Documentation exists\n');
    } else {
      console.log('⚠️  Documentation file not found\n');
    }

    console.log('🎉 Claude Auto Integration Test Complete!\n');
    console.log('Next Steps:');
    console.log('1. Set your ANTHROPIC_API_KEY environment variable');
    console.log('2. Test with: npm run claude:chat "Hello, Claude!"');
    console.log('3. Add ANTHROPIC_API_KEY to GitHub repository secrets for CI/CD');
    console.log('4. Review docs/CLAUDE_AUTO_INTEGRATION.md for full usage guide');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  testClaudeAuto();
} 