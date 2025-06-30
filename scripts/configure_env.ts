import * as fs from 'fs';
import * as path from 'path';

interface ConfigItem {
  key: string;
  description: string;
  required: boolean;
  url?: string;
  example?: string;
}

const configItems: ConfigItem[] = [
  {
    key: 'LLM_API_KEY',
    description: 'OpenAI API Key (for LLM processing)',
    required: true,
    url: 'https://platform.openai.com/api-keys',
    example: 'sk-...'
  },
  {
    key: 'FIREBASE_PROJECT_ID',
    description: 'Firebase Project ID',
    required: true,
    url: 'https://console.firebase.google.com',
    example: 'your-project-id'
  },
  {
    key: 'FIREBASE_CLIENT_EMAIL',
    description: 'Firebase Service Account Email',
    required: true,
    url: 'https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk',
    example: 'firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com'
  },
  {
    key: 'MINDPAL_API_KEY',
    description: 'MindPal API Key (for AI agent validation)',
    required: true,
    url: 'https://mindpal.com',
    example: 'mp_...'
  },
  {
    key: 'MINDPAL_AGENT_ID',
    description: 'MindPal Agent ID',
    required: true,
    url: 'https://mindpal.com',
    example: 'agent_...'
  },
  {
    key: 'RENDER_API_KEY',
    description: 'Render API Key (for deployment)',
    required: true,
    url: 'https://render.com/docs/api',
    example: 'rnd_...'
  },
  {
    key: 'DEERFLOW_API_KEY',
    description: 'DeerFlow API Key (optional)',
    required: false,
    url: 'https://deerflow.com',
    example: 'df_...'
  },
  {
    key: 'BROWSERLESS_API_KEY',
    description: 'Browserless API Key (for web scraping)',
    required: false,
    url: 'https://browserless.io',
    example: '...'
  }
];

function showConfigurationGuide(): void {
  console.log('🔧 DeerFlow Render Starter Environment Configuration Guide\n');
  console.log('Your DeerFlow Render Starter is LIVE at: https://deerflow-render-starter.onrender.com\n');
  
  console.log('📋 Required Configuration:\n');
  
  configItems.forEach((item, index) => {
    const status = item.required ? '🔴 REQUIRED' : '🟡 OPTIONAL';
    console.log(`${index + 1}. ${status} ${item.key}`);
    console.log(`   Description: ${item.description}`);
    if (item.url) {
      console.log(`   Get from: ${item.url}`);
    }
    if (item.example) {
      console.log(`   Example: ${item.example}`);
    }
    console.log('');
  });

  console.log('📝 Configuration Steps:');
  console.log('1. Edit your .env file');
  console.log('2. Replace "your-*-here" values with your actual API keys');
  console.log('3. Save the file');
  console.log('4. Run: npm run deerflow-orchestrate:quick');
  console.log('5. Run: npm run deerflow-orchestrate:test');
  
  console.log('\n🎯 Quick Start:');
  console.log('- Copy the example values above');
  console.log('- Paste them into your .env file');
  console.log('- Replace with your actual API keys');
  console.log('- Test with: npm run deerflow-live-test');
}

function checkCurrentConfig(): void {
  console.log('🔍 Checking Current Configuration...\n');
  
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ No .env file found!');
    console.log('Run: cp env.deerflow-render-starter-working.template .env');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  const envVars: Record<string, string> = {};

  envLines.forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });

  console.log('📊 Current Configuration Status:\n');

  configItems.forEach(item => {
    const value = envVars[item.key];
    const status = value && !value.includes('your-') && !value.includes('here') ? '✅' : '❌';
    const displayValue = value ? 
      (value.length > 20 ? `${value.substring(0, 20)}...` : value) : 
      'NOT SET';
    
    console.log(`${status} ${item.key}: ${displayValue}`);
  });

  const configuredCount = configItems.filter(item => {
    const value = envVars[item.key];
    return value && !value.includes('your-') && !value.includes('here');
  }).length;

  const requiredCount = configItems.filter(item => item.required).length;
  const configuredRequired = configItems.filter(item => {
    if (!item.required) return true;
    const value = envVars[item.key];
    return value && !value.includes('your-') && !value.includes('here');
  }).length;

  console.log(`\n📈 Configuration Progress: ${configuredCount}/${configItems.length} total, ${configuredRequired}/${requiredCount} required`);
  
  if (configuredRequired === requiredCount) {
    console.log('🎉 All required configuration is set!');
    console.log('✨ Ready to test: npm run deerflow-orchestrate:quick');
  } else {
    console.log('⚠️  Some required configuration is missing.');
    console.log('📝 Please update your .env file with the missing values.');
  }
}

// Main execution
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'check') {
    checkCurrentConfig();
  } else {
    showConfigurationGuide();
  }
}

export { showConfigurationGuide, checkCurrentConfig }; 