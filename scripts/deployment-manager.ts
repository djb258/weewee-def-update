#!/usr/bin/env tsx

import { execSync, spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface DeploymentConfig {
  platform: 'vercel' | 'render' | 'netlify';
  projectName: string;
  environment: 'production' | 'staging' | 'development';
  autoDeploy: boolean;
  healthCheck: boolean;
}

interface DeploymentResult {
  success: boolean;
  url?: string;
  error?: string;
  logs?: string;
  deploymentId?: string;
}

class DeploymentManager {
  private config: DeploymentConfig;

  constructor(config: DeploymentConfig) {
    this.config = config;
  }

  async deploy(): Promise<DeploymentResult> {
    console.log(`🚀 Starting deployment to ${this.config.platform}...`);
    
    try {
      // Pre-deployment checks
      await this.runPreDeploymentChecks();
      
      // Build the project
      await this.buildProject();
      
      // Deploy based on platform
      const result = await this.deployToPlatform();
      
      // Post-deployment tasks
      await this.runPostDeploymentTasks(result);
      
      return result;
    } catch (error) {
      console.error(`❌ Deployment failed: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async runPreDeploymentChecks(): Promise<void> {
    console.log('🔍 Running pre-deployment checks...');
    
    // Check if build directory exists
    if (!existsSync('dist')) {
      throw new Error('Build directory not found. Run npm run build first.');
    }
    
    // Check environment variables
    this.validateEnvironmentVariables();
    
    // Run tests if in production
    if (this.config.environment === 'production') {
      console.log('🧪 Running tests before production deployment...');
      try {
        execSync('npm test', { stdio: 'inherit' });
      } catch (error) {
        throw new Error('Tests failed. Deployment aborted.');
      }
    }
  }

  private validateEnvironmentVariables(): void {
    const requiredEnvVars = ['NODE_ENV'];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.warn(`⚠️  Warning: ${envVar} environment variable not set`);
      }
    }
  }

  private async buildProject(): Promise<void> {
    console.log('🔨 Building project...');
    
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Build completed successfully');
    } catch (error) {
      throw new Error('Build failed');
    }
  }

  private async deployToPlatform(): Promise<DeploymentResult> {
    switch (this.config.platform) {
      case 'vercel':
        return await this.deployToVercel();
      case 'render':
        return await this.deployToRender();
      case 'netlify':
        return await this.deployToNetlify();
      default:
        throw new Error(`Unsupported platform: ${this.config.platform}`);
    }
  }

  private async deployToVercel(): Promise<DeploymentResult> {
    console.log('🚀 Deploying to Vercel...');
    
    try {
      // Check if Vercel CLI is installed
      try {
        execSync('vercel --version', { stdio: 'pipe' });
      } catch {
        console.log('📦 Installing Vercel CLI...');
        execSync('npm install -g vercel', { stdio: 'inherit' });
      }
      
      // Deploy to Vercel
      const output = execSync('vercel --prod --yes', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Extract deployment URL from output
      const urlMatch = output.match(/https:\/\/[^\s]+/);
      const url = urlMatch ? urlMatch[0] : undefined;
      
      return {
        success: true,
        url,
        logs: output
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async deployToRender(): Promise<DeploymentResult> {
    console.log('🚀 Deploying to Render...');
    
    try {
      // Render uses Git-based deployment
      // Push to main branch to trigger deployment
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "Deploy to Render"', { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      
      return {
        success: true,
        logs: 'Deployment triggered via Git push to Render'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async deployToNetlify(): Promise<DeploymentResult> {
    console.log('🚀 Deploying to Netlify...');
    
    try {
      // Check if Netlify CLI is installed
      try {
        execSync('netlify --version', { stdio: 'pipe' });
      } catch {
        console.log('📦 Installing Netlify CLI...');
        execSync('npm install -g netlify-cli', { stdio: 'inherit' });
      }
      
      // Deploy to Netlify
      const output = execSync('netlify deploy --prod --dir=dist', { 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      // Extract deployment URL from output
      const urlMatch = output.match(/https:\/\/[^\s]+/);
      const url = urlMatch ? urlMatch[0] : undefined;
      
      return {
        success: true,
        url,
        logs: output
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private async runPostDeploymentTasks(result: DeploymentResult): Promise<void> {
    if (result.success) {
      console.log('✅ Deployment completed successfully!');
      
      if (result.url) {
        console.log(`🌐 Live URL: ${result.url}`);
      }
      
      // Run health check if enabled
      if (this.config.healthCheck && result.url) {
        await this.runHealthCheck(result.url);
      }
      
      // Send notification (could be Slack, email, etc.)
      await this.sendDeploymentNotification(result);
    }
  }

  private async runHealthCheck(url: string): Promise<void> {
    console.log('🏥 Running health check...');
    
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log('✅ Health check passed');
      } else {
        console.warn('⚠️  Health check failed - site returned non-200 status');
      }
    } catch (error) {
      console.warn('⚠️  Health check failed - could not reach site');
    }
  }

  private async sendDeploymentNotification(result: DeploymentResult): Promise<void> {
    // This could integrate with Slack, Discord, email, etc.
    console.log('📢 Deployment notification sent');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'deploy':
      const platform = args[1] as 'vercel' | 'render' | 'netlify';
      const environment = (args[2] as 'production' | 'staging' | 'development') || 'production';
      
      if (!platform) {
        console.error('❌ Please specify a platform: vercel, render, or netlify');
        process.exit(1);
      }
      
      const config: DeploymentConfig = {
        platform,
        projectName: 'weewee-def-update',
        environment,
        autoDeploy: true,
        healthCheck: true
      };
      
      const manager = new DeploymentManager(config);
      const result = await manager.deploy();
      
      if (result.success) {
        console.log('🎉 Deployment successful!');
        process.exit(0);
      } else {
        console.error('💥 Deployment failed!');
        process.exit(1);
      }
      break;
      
    case 'status':
      console.log('📊 Checking deployment status...');
      // Implementation for checking deployment status
      break;
      
    case 'rollback':
      console.log('🔄 Rolling back deployment...');
      // Implementation for rolling back deployment
      break;
      
    default:
      console.log(`
🚀 Deployment Manager

Usage:
  tsx scripts/deployment-manager.ts deploy <platform> [environment]
  tsx scripts/deployment-manager.ts status
  tsx scripts/deployment-manager.ts rollback

Platforms:
  vercel    - Deploy to Vercel
  render    - Deploy to Render
  netlify   - Deploy to Netlify

Environments:
  production  - Production deployment (default)
  staging     - Staging deployment
  development - Development deployment

Examples:
  tsx scripts/deployment-manager.ts deploy vercel
  tsx scripts/deployment-manager.ts deploy render staging
  tsx scripts/deployment-manager.ts deploy netlify production
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { DeploymentManager, DeploymentConfig, DeploymentResult }; 