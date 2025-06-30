import * as dotenv from 'dotenv';
import axios from 'axios';
import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import * as path from 'path';

// Load environment variables from deerflow.env
dotenv.config({ path: './deerflow.env' });

// 🔒 MANDATORY: Barton Doctrine enforcement
import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';

// 🔒 MANDATORY: Initialize Barton Doctrine (CANNOT BE SKIPPED)
START_WITH_BARTON_DOCTRINE('render-for-db-deployer');

interface RenderDeploymentConfig {
  apiKey: string;
  serviceId: string;
  baseUrl: string;
}

interface DeploymentResult {
  success: boolean;
  deploymentId?: string;
  serviceUrl?: string;
  error?: string;
}

export class RenderForDBDeployer {
  private config: RenderDeploymentConfig;

  constructor(config: RenderDeploymentConfig) {
    this.config = config;
  }

  /**
   * Deploy the Render-for-DB project to Render.com
   */
  async deployToRender(): Promise<DeploymentResult> {
    try {
      console.log('🚀 Starting Render-for-DB deployment to Render.com...');

      // Step 1: Validate Render-for-DB project structure
      console.log('📋 Step 1: Validating project structure...');
      const projectValidation = this.validateProjectStructure();
      if (!projectValidation.valid) {
        return {
          success: false,
          error: `Project validation failed: ${projectValidation.error}`,
        };
      }

      // Step 2: Create deployment on Render
      console.log('🔄 Step 2: Creating deployment on Render...');
      const deploymentResult = await this.createRenderDeployment();
      if (!deploymentResult.success) {
        return deploymentResult;
      }

      // Step 3: Wait for deployment to complete
      console.log('⏳ Step 3: Waiting for deployment to complete...');
      const deploymentStatus = await this.waitForDeployment(deploymentResult.deploymentId!);
      if (!deploymentStatus.success) {
        return deploymentStatus;
      }

      console.log('✅ Render-for-DB deployment completed successfully!');
      return {
        success: true,
        deploymentId: deploymentResult.deploymentId,
        serviceUrl: deploymentStatus.serviceUrl,
      };

    } catch (error) {
      console.error('❌ Deployment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate the Render-for-DB project structure
   */
  private validateProjectStructure(): { valid: boolean; error?: string } {
    const requiredFiles = [
      'Render-for-DB/app.py',
      'Render-for-DB/requirements.txt',
      'Render-for-DB/render.yaml',
      'Render-for-DB/browserless.py',
      'Render-for-DB/hcompany.py',
      'Render-for-DB/puppeteer.py',
    ];

    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        return {
          valid: false,
          error: `Required file missing: ${file}`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Create a deployment on Render
   */
  private async createRenderDeployment(): Promise<DeploymentResult> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/v1/services/${this.config.serviceId}/deploys`,
        {
          environment: 'production',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        }
      );

      if (response.status === 201 || response.status === 200) {
        const deploymentId = response.data.id || response.data.deployment?.id;
        return {
          success: true,
          deploymentId,
        };
      } else {
        return {
          success: false,
          error: `Render API returned status ${response.status}`,
        };
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          error: `Render API error: ${error.response?.status} - ${error.response?.data?.message || error.message}`,
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Wait for deployment to complete
   */
  private async waitForDeployment(deploymentId: string): Promise<DeploymentResult> {
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(
          `${this.config.baseUrl}/v1/services/${this.config.serviceId}/deploys/${deploymentId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
            },
            timeout: 30000,
          }
        );

        const deployment = response.data;
        const status = deployment.status || deployment.deployment?.status;

        console.log(`📊 Deployment status: ${status} (attempt ${attempts + 1}/${maxAttempts})`);

        if (status === 'live') {
          const serviceUrl = deployment.service?.service_url || deployment.url;
          return {
            success: true,
            serviceUrl,
          };
        } else if (status === 'failed' || status === 'error') {
          return {
            success: false,
            error: `Deployment failed with status: ${status}`,
          };
        }

        // Wait 10 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 10000));
        attempts++;

      } catch (error) {
        console.log(`⚠️  Error checking deployment status: ${error instanceof Error ? error.message : 'Unknown error'}`);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    return {
      success: false,
      error: 'Deployment timeout - service may still be deploying',
    };
  }

  /**
   * Get service information
   */
  async getServiceInfo(): Promise<{ success: boolean; service?: any; error?: string }> {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/v1/services/${this.config.serviceId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          timeout: 30000,
        }
      );

      return {
        success: true,
        service: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Test the deployed service
   */
  async testDeployedService(serviceUrl: string): Promise<{ success: boolean; endpoints?: any; error?: string }> {
    try {
      const endpoints = {
        root: false,
        fire: false,
        scrape: false,
        pingpong: false,
      };

      // Test root endpoint
      try {
        const rootResponse = await axios.get(`${serviceUrl}/`, { timeout: 10000 });
        endpoints.root = rootResponse.status === 200;
      } catch (error) {
        console.log('❌ Root endpoint test failed');
      }

      // Test fire endpoint
      try {
        const fireResponse = await axios.get(`${serviceUrl}/fire`, { timeout: 10000 });
        endpoints.fire = fireResponse.status === 200;
      } catch (error) {
        console.log('❌ Fire endpoint test failed');
      }

      // Test scrape endpoint
      try {
        const scrapeResponse = await axios.post(
          `${serviceUrl}/scrape`,
          { url: 'https://example.com' },
          { timeout: 10000 }
        );
        endpoints.scrape = scrapeResponse.status === 200;
      } catch (error) {
        console.log('❌ Scrape endpoint test failed');
      }

      // Test pingpong endpoint
      try {
        const pingpongResponse = await axios.post(
          `${serviceUrl}/pingpong`,
          { prompt: 'test' },
          { timeout: 10000 }
        );
        endpoints.pingpong = pingpongResponse.status === 200;
      } catch (error) {
        console.log('❌ Pingpong endpoint test failed');
      }

      const allEndpointsWorking = Object.values(endpoints).every(endpoint => endpoint);

      return {
        success: allEndpointsWorking,
        endpoints,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Main execution
async function main() {
  const config: RenderDeploymentConfig = {
    apiKey: process.env.RENDER_API_KEY || '',
    serviceId: process.env.RENDER_SERVICE_ID || '',
    baseUrl: 'https://api.render.com',
  };

  if (!config.apiKey || !config.serviceId) {
    console.error('❌ Missing required environment variables: RENDER_API_KEY, RENDER_SERVICE_ID');
    process.exit(1);
  }

  const deployer = new RenderForDBDeployer(config);

  // Get service info first
  console.log('📋 Getting service information...');
  const serviceInfo = await deployer.getServiceInfo();
  if (serviceInfo.success) {
    console.log('✅ Service found:', serviceInfo.service?.name);
    console.log(`   Service URL: ${serviceInfo.service?.service_url}`);
    console.log(`   Status: ${serviceInfo.service?.status}`);
  } else {
    console.log('⚠️  Could not get service info:', serviceInfo.error);
  }

  // Deploy the service
  const deploymentResult = await deployer.deployToRender();

  if (deploymentResult.success) {
    console.log('🎉 Deployment successful!');
    console.log(`   Deployment ID: ${deploymentResult.deploymentId}`);
    console.log(`   Service URL: ${deploymentResult.serviceUrl}`);

    // Test the deployed service
    if (deploymentResult.serviceUrl) {
      console.log('🧪 Testing deployed service...');
      const testResult = await deployer.testDeployedService(deploymentResult.serviceUrl);
      
      if (testResult.success) {
        console.log('✅ All endpoints working!');
        console.log('   Endpoints tested:', testResult.endpoints);
      } else {
        console.log('⚠️  Some endpoints failed:', testResult.endpoints);
      }
    }
  } else {
    console.error('❌ Deployment failed:', deploymentResult.error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
} 