#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupClaude() {
  console.log('🤖 Claude Auto Setup\n');

  // Check if .env file exists
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', 'config', 'env.example');

  if (!fs.existsSync(envPath)) {
    console.log('📝 Creating .env file from template...');
    try {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env file from template');
    } catch (error) {
      console.log('❌ Could not create .env file:', error);
      return;
    }
  }

  // Read current .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if ANTHROPIC_API_KEY is already set
  if (envContent.includes('ANTHROPIC_API_KEY=your-anthropic-api-key-here') || 
      envContent.includes('ANTHROPIC_API_KEY=') && !envContent.includes('ANTHROPIC_API_KEY=sk-ant-')) {
    
    console.log('🔑 Please set your Anthropic API key:');
    console.log('1. Go to https://console.anthropic.com/');
    console.log('2. Create or copy your API key (starts with sk-ant-)');
    console.log('3. Edit the .env file and replace "your-anthropic-api-key-here" with your actual key');
    console.log('\nOr set it as an environment variable:');
    console.log('$env:ANTHROPIC_API_KEY="sk-ant-your-key-here" (PowerShell)');
    console.log('export ANTHROPIC_API_KEY="sk-ant-your-key-here" (Bash)');
    
  } else {
    console.log('✅ ANTHROPIC_API_KEY appears to be configured');
  }

  // Check config file
  const configPath = path.join(__dirname, '..', 'config', 'claude-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (!config.apiKey || config.apiKey === '') {
      console.log('\n📋 You can also set the API key in config/claude-config.json');
    } else {
      console.log('✅ API key found in config file');
    }
  }

  console.log('\n🧪 To test the setup, run:');
  console.log('npm run claude:test');
  console.log('\n💬 To chat with Claude, run:');
  console.log('npm run claude:chat "Hello, Claude!"');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  setupClaude();
} 