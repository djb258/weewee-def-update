#!/usr/bin/env tsx

/**
 * Environment Manager
 * Helps set up, validate, and manage .env files for development
 * Run: npm run env:setup
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface EnvVariable {
  key: string;
  description: string;
  required: boolean;
  category: string;
  example?: string;
  validation?: RegExp;
}

class EnvironmentManager {
  private projectRoot = path.dirname(__dirname);
  private envPath = path.join(this.projectRoot, '.env');
  private templatePath = path.join(this.projectRoot, 'env.comprehensive.template');
  
  private envVariables: EnvVariable[] = [
    // Firebase & Google Cloud
    { key: 'FIREBASE_PROJECT_ID', description: 'Firebase project identifier', required: true, category: 'Firebase' },
    { key: 'GOOGLE_APPLICATION_CREDENTIALS', description: 'Path to Google service account JSON', required: true, category: 'Google Cloud' },
    { key: 'BIGQUERY_PROJECT_ID', description: 'BigQuery project ID', required: false, category: 'Google Cloud' },
    
    // Databases
    { key: 'NEON_DATABASE_URL', description: 'Neon PostgreSQL connection string', required: true, category: 'Database', validation: /^postgresql:\/\// },
    { key: 'MONGODB_URI', description: 'MongoDB connection string', required: false, category: 'Database', validation: /^mongodb/ },
    { key: 'REDIS_URL', description: 'Redis connection string', required: false, category: 'Database', validation: /^redis:\/\// },
    
    // API Keys
    { key: 'OPENAI_API_KEY', description: 'OpenAI API key for AI features', required: false, category: 'AI APIs', validation: /^sk-/ },
    { key: 'ANTHROPIC_API_KEY', description: 'Anthropic Claude API key', required: false, category: 'AI APIs' },
    { key: 'ABACUS_AI_API_KEY', description: 'Abacus.AI API key for ML platform', required: false, category: 'AI APIs' },
    { key: 'APIFY_API_TOKEN', description: 'Apify web scraping platform API token', required: false, category: 'AI APIs' },
    { key: 'GENSPARK_API_KEY', description: 'Genspark AI search engine API key', required: false, category: 'AI APIs' },
    { key: 'RTRVR_API_KEY', description: 'RTRVR.AI retrieval and search API key', required: false, category: 'AI APIs' },
    { key: 'BROWSERLESS_API_KEY', description: 'Browserless.ai headless browser API key', required: false, category: 'AI APIs' },
    { key: 'GITHUB_TOKEN', description: 'GitHub personal access token', required: false, category: 'Git APIs', validation: /^gh[ps]_/ },
    
    // Development
    { key: 'NODE_ENV', description: 'Node.js environment', required: true, category: 'Development', example: 'development' },
    { key: 'PORT', description: 'Application port', required: false, category: 'Development', example: '3000' },
    { key: 'JWT_SECRET', description: 'JWT signing secret', required: true, category: 'Security' },
    
    // Machine Sync
    { key: 'SYNC_SSH_KEY_PATH', description: 'SSH key path for machine sync', required: false, category: 'Machine Sync', example: '~/.ssh/id_rsa' },
    { key: 'CURSOR_SETTINGS_PATH', description: 'Cursor settings file path', required: false, category: 'Machine Sync' }
  ];

  private log(message: string, color: 'green' | 'yellow' | 'red' | 'blue' = 'blue'): void {
    const colors = {
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
      blue: '\x1b[34m'
    };
    console.log(`${colors[color]}${message}\x1b[0m`);
  }

  public async setupEnvironment(): Promise<void> {
    this.log('🔧 Environment Setup Manager', 'blue');
    this.log('============================', 'blue');

    // Check if .env already exists
    if (fs.existsSync(this.envPath)) {
      this.log('⚠️ .env file already exists!', 'yellow');
      const backup = `${this.envPath}.backup.${Date.now()}`;
      fs.copyFileSync(this.envPath, backup);
      this.log(`📋 Backed up existing .env to: ${backup}`, 'green');
    }

    // Copy comprehensive template
    if (fs.existsSync(this.templatePath)) {
      fs.copyFileSync(this.templatePath, this.envPath);
      this.log('✅ Created .env file from comprehensive template', 'green');
    } else {
      this.createBasicEnvFile();
      this.log('✅ Created basic .env file', 'green');
    }

    // Ensure .env is in .gitignore
    this.ensureGitignore();

    this.log('\n📝 Next Steps:', 'blue');
    this.log('1. Edit .env file with your actual values', 'yellow');
    this.log('2. Run: npm run env:validate', 'yellow');
    this.log('3. Never commit .env to version control!', 'red');
  }

  public async validateEnvironment(): Promise<void> {
    this.log('🔍 Validating Environment Configuration', 'blue');
    this.log('=====================================', 'blue');

    if (!fs.existsSync(this.envPath)) {
      this.log('❌ .env file not found! Run: npm run env:setup', 'red');
      return;
    }

    const envContent = fs.readFileSync(this.envPath, 'utf8');
    const envVars = this.parseEnvFile(envContent);
    
    let issues = 0;
    let warnings = 0;

    // Check required variables
    for (const variable of this.envVariables) {
      const value = envVars[variable.key];
      
      if (variable.required && (!value || value.startsWith('your-'))) {
        this.log(`❌ Missing required: ${variable.key} - ${variable.description}`, 'red');
        issues++;
      } else if (value && variable.validation && !variable.validation.test(value)) {
        this.log(`⚠️ Invalid format: ${variable.key} - Expected format not matched`, 'yellow');
        warnings++;
      } else if (value && !value.startsWith('your-')) {
        this.log(`✅ ${variable.key} - Configured`, 'green');
      }
    }

    // Check for common issues
    this.checkCommonIssues(envVars);

    this.log(`\n📊 Validation Summary:`, 'blue');
    this.log(`✅ Configured variables: ${Object.keys(envVars).length}`, 'green');
    this.log(`❌ Issues: ${issues}`, issues > 0 ? 'red' : 'green');
    this.log(`⚠️ Warnings: ${warnings}`, warnings > 0 ? 'yellow' : 'green');

    if (issues === 0 && warnings === 0) {
      this.log('\n🎉 Environment configuration looks good!', 'green');
    }
  }

  public async listEnvironmentVariables(): Promise<void> {
    this.log('📋 Environment Variables Reference', 'blue');
    this.log('================================', 'blue');

    const categories = [...new Set(this.envVariables.map(v => v.category))];
    
    for (const category of categories) {
      this.log(`\n🔸 ${category}:`, 'yellow');
      const categoryVars = this.envVariables.filter(v => v.category === category);
      
      for (const variable of categoryVars) {
        const required = variable.required ? '(Required)' : '(Optional)';
        const example = variable.example ? ` - Example: ${variable.example}` : '';
        this.log(`  ${variable.key} ${required} - ${variable.description}${example}`);
      }
    }
  }

  public async generateSecrets(): Promise<void> {
    this.log('🔐 Generating Secure Secrets', 'blue');
    this.log('============================', 'blue');

    const secrets = {
      JWT_SECRET: this.generateRandomString(64),
      SESSION_SECRET: this.generateRandomString(32),
      ENCRYPTION_KEY: this.generateRandomString(32),
      BACKUP_ENCRYPTION_KEY: this.generateRandomString(32)
    };

    this.log('\n🔑 Generated Secrets (add these to your .env):');
    for (const [key, value] of Object.entries(secrets)) {
      this.log(`${key}=${value}`, 'green');
    }

    this.log('\n⚠️ Save these secrets securely - they cannot be recovered!', 'yellow');
  }

  private createBasicEnvFile(): void {
    const basicEnv = `# Basic Environment Configuration
# Generated by Environment Manager

# Development
NODE_ENV=development
PORT=3000
LOG_LEVEL=info

# Security (generate with: npm run env:generate-secrets)
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here

# Database
NEON_DATABASE_URL=postgresql://username:password@host:port/database

# Machine Sync
SYNC_BACKUP_ENABLED=true
SYNC_SSH_KEY_PATH=~/.ssh/id_rsa
CURSOR_SETTINGS_PATH=~/.cursor/settings.json

# Add more variables as needed
# Use env.comprehensive.template for complete reference
`;

    fs.writeFileSync(this.envPath, basicEnv);
  }

  private ensureGitignore(): void {
    const gitignorePath = path.join(this.projectRoot, '.gitignore');
    let gitignoreContent = '';
    
    if (fs.existsSync(gitignorePath)) {
      gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }

    const envEntries = ['.env', '.env.local', '.env.*.local'];
    let updated = false;

    for (const entry of envEntries) {
      if (!gitignoreContent.includes(entry)) {
        gitignoreContent += `\n${entry}`;
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(gitignorePath, gitignoreContent);
      this.log('✅ Updated .gitignore to exclude .env files', 'green');
    }
  }

  private parseEnvFile(content: string): Record<string, string> {
    const envVars: Record<string, string> = {};
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    }

    return envVars;
  }

  private checkCommonIssues(envVars: Record<string, string>): void {
    // Check for default/placeholder values
    const placeholders = ['your-', 'example-', 'replace-', 'change-'];
    let placeholderCount = 0;

    for (const [key, value] of Object.entries(envVars)) {
      if (placeholders.some(placeholder => value.toLowerCase().includes(placeholder))) {
        placeholderCount++;
      }
    }

    if (placeholderCount > 0) {
      this.log(`⚠️ Found ${placeholderCount} placeholder values that need to be replaced`, 'yellow');
    }

    // Check for weak secrets
    if (envVars.JWT_SECRET && envVars.JWT_SECRET.length < 32) {
      this.log('⚠️ JWT_SECRET should be at least 32 characters long', 'yellow');
    }

    // Check for development vs production settings
    if (envVars.NODE_ENV === 'production' && envVars.LOG_LEVEL === 'debug') {
      this.log('⚠️ Debug logging enabled in production environment', 'yellow');
    }
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const manager = new EnvironmentManager();

  switch (args[0]) {
    case 'setup':
      await manager.setupEnvironment();
      break;
    case 'validate':
      await manager.validateEnvironment();
      break;
    case 'list':
      await manager.listEnvironmentVariables();
      break;
    case 'generate-secrets':
      await manager.generateSecrets();
      break;
    default:
      console.log(`
Environment Manager

Usage:
  npm run env:setup           # Create .env file from template
  npm run env:validate        # Validate current .env configuration
  npm run env:list            # Show all environment variables
  npm run env:generate-secrets # Generate secure secrets

Examples:
  npm run env:setup           # First time setup
  npm run env:validate        # Check configuration
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { EnvironmentManager }; 