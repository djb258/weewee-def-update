#!/usr/bin/env tsx

/**
 * Abacus.AI Integration Setup
 * 
 * Provides comprehensive Abacus.AI integration for ML models, deployments, and predictions
 * Follows STAMPED/SPVPET/STACKED doctrine compliance
 */

import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables
config();

// Abacus.AI Configuration Schema
const AbacusConfigSchema = z.object({
  apiKey: z.string().min(1, 'Abacus.AI API key is required'),
  projectId: z.string().optional(),
  baseUrl: z.string().default('https://api.abacus.ai'),
  timeout: z.number().default(30000),
  retries: z.number().default(3)
});

type AbacusConfig = z.infer<typeof AbacusConfigSchema>;

// Abacus.AI API Response Schemas
const AbacusModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string()
});

const AbacusDeploymentSchema = z.object({
  id: z.string(),
  model_id: z.string(),
  name: z.string(),
  status: z.string(),
  endpoint_url: z.string().optional(),
  created_at: z.string()
});

const AbacusPredictionSchema = z.object({
  id: z.string(),
  deployment_id: z.string(),
  input: z.record(z.unknown()),
  output: z.record(z.unknown()),
  status: z.string(),
  created_at: z.string()
});

interface AbacusAIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

class AbacusAIIntegration {
  private config: AbacusConfig;
  private client: any;

  constructor(config: Partial<AbacusConfig> = {}) {
    this.config = AbacusConfigSchema.parse({
      apiKey: process.env.ABACUS_AI_API_KEY || '',
      projectId: process.env.ABACUS_AI_PROJECT_ID,
      ...config
    });

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Test Abacus.AI connection and API key
   */
  async testConnection(): Promise<AbacusAIResponse<boolean>> {
    try {
      const response = await this.client.get('/v1/models');
      return {
        success: true,
        data: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * List all available models
   */
  async listModels(): Promise<AbacusAIResponse<any[]>> {
    try {
      const response = await this.client.get('/v1/models');
      const models = response.data.data || [];
      
      return {
        success: true,
        data: models,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Create a new model
   */
  async createModel(modelConfig: {
    name: string;
    type: string;
    config: Record<string, unknown>;
  }): Promise<AbacusAIResponse<any>> {
    try {
      const response = await this.client.post('/v1/models', {
        name: modelConfig.name,
        type: modelConfig.type,
        config: modelConfig.config,
        project_id: this.config.projectId
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Deploy a model
   */
  async deployModel(modelId: string, deploymentConfig: {
    name: string;
    environment: string;
    config?: Record<string, unknown>;
  }): Promise<AbacusAIResponse<any>> {
    try {
      const response = await this.client.post('/v1/deployments', {
        model_id: modelId,
        name: deploymentConfig.name,
        environment: deploymentConfig.environment,
        config: deploymentConfig.config || {},
        project_id: this.config.projectId
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Make a prediction using a deployed model
   */
  async makePrediction(deploymentId: string, input: Record<string, unknown>): Promise<AbacusAIResponse<any>> {
    try {
      const response = await this.client.post(`/v1/deployments/${deploymentId}/predict`, {
        input,
        project_id: this.config.projectId
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get deployment status
   */
  async getDeploymentStatus(deploymentId: string): Promise<AbacusAIResponse<any>> {
    try {
      const response = await this.client.get(`/v1/deployments/${deploymentId}`);
      
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * List all deployments
   */
  async listDeployments(): Promise<AbacusAIResponse<any[]>> {
    try {
      const response = await this.client.get('/v1/deployments');
      const deployments = response.data.data || [];
      
      return {
        success: true,
        data: deployments,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Delete a deployment
   */
  async deleteDeployment(deploymentId: string): Promise<AbacusAIResponse<boolean>> {
    try {
      await this.client.delete(`/v1/deployments/${deploymentId}`);
      
      return {
        success: true,
        data: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get model training status
   */
  async getModelStatus(modelId: string): Promise<AbacusAIResponse<any>> {
    try {
      const response = await this.client.get(`/v1/models/${modelId}`);
      
      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Upload training data
   */
  async uploadTrainingData(modelId: string, data: Record<string, unknown>[]): Promise<AbacusAIResponse<any>> {
    try {
      const response = await this.client.post(`/v1/models/${modelId}/data`, {
        data,
        project_id: this.config.projectId
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Start model training
   */
  async startTraining(modelId: string, trainingConfig?: Record<string, unknown>): Promise<AbacusAIResponse<any>> {
    try {
      const response = await this.client.post(`/v1/models/${modelId}/train`, {
        config: trainingConfig || {},
        project_id: this.config.projectId
      });

      return {
        success: true,
        data: response.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!process.env.ABACUS_AI_API_KEY) {
    console.error('❌ ABACUS_AI_API_KEY environment variable is required');
    console.log('💡 Add it to your .env file: ABACUS_AI_API_KEY=your_api_key_here');
    process.exit(1);
  }

  const abacus = new AbacusAIIntegration();

  switch (command) {
    case 'test':
      console.log('🔗 Testing Abacus.AI connection...');
      const connectionTest = await abacus.testConnection();
      if (connectionTest.success) {
        console.log('✅ Connection successful!');
      } else {
        console.error('❌ Connection failed:', connectionTest.error);
      }
      break;

    case 'models':
      console.log('📋 Listing models...');
      const models = await abacus.listModels();
      if (models.success && models.data) {
        console.log(`Found ${models.data.length} models:`);
        models.data.forEach((model: any) => {
          console.log(`  - ${model.name} (${model.type}) - ${model.status}`);
        });
      } else {
        console.error('❌ Failed to list models:', models.error);
      }
      break;

    case 'deployments':
      console.log('🚀 Listing deployments...');
      const deployments = await abacus.listDeployments();
      if (deployments.success && deployments.data) {
        console.log(`Found ${deployments.data.length} deployments:`);
        deployments.data.forEach((deployment: any) => {
          console.log(`  - ${deployment.name} (${deployment.status})`);
        });
      } else {
        console.error('❌ Failed to list deployments:', deployments.error);
      }
      break;

    case 'create-model':
      if (args.length < 3) {
        console.error('❌ Usage: npm run abacus:create-model <name> <type>');
        break;
      }
      console.log('🤖 Creating model...');
      const modelResult = await abacus.createModel({
        name: args[1],
        type: args[2],
        config: {}
      });
      if (modelResult.success) {
        console.log('✅ Model created successfully!');
        console.log('Model ID:', modelResult.data?.id);
      } else {
        console.error('❌ Failed to create model:', modelResult.error);
      }
      break;

    case 'deploy':
      if (args.length < 3) {
        console.error('❌ Usage: npm run abacus:deploy <model_id> <deployment_name>');
        break;
      }
      console.log('🚀 Deploying model...');
      const deployResult = await abacus.deployModel(args[1], {
        name: args[2],
        environment: 'production'
      });
      if (deployResult.success) {
        console.log('✅ Model deployed successfully!');
        console.log('Deployment ID:', deployResult.data?.id);
      } else {
        console.error('❌ Failed to deploy model:', deployResult.error);
      }
      break;

    case 'predict':
      if (args.length < 3) {
        console.error('❌ Usage: npm run abacus:predict <deployment_id> <input_json>');
        break;
      }
      console.log('🔮 Making prediction...');
      let input;
      try {
        input = JSON.parse(args[2]);
      } catch (error) {
        console.error('❌ Invalid JSON input');
        break;
      }
      const predictResult = await abacus.makePrediction(args[1], input);
      if (predictResult.success) {
        console.log('✅ Prediction successful!');
        console.log('Output:', JSON.stringify(predictResult.data, null, 2));
      } else {
        console.error('❌ Prediction failed:', predictResult.error);
      }
      break;

    default:
      console.log('🤖 Abacus.AI Integration');
      console.log('=======================');
      console.log('');
      console.log('Usage:');
      console.log('  npm run abacus:test                    # Test connection');
      console.log('  npm run abacus:models                  # List models');
      console.log('  npm run abacus:deployments             # List deployments');
      console.log('  npm run abacus:create-model <name> <type>  # Create model');
      console.log('  npm run abacus:deploy <model_id> <name>    # Deploy model');
      console.log('  npm run abacus:predict <deployment_id> <input>  # Make prediction');
      console.log('');
      console.log('Environment Variables:');
      console.log('  ABACUS_AI_API_KEY     - Your Abacus.AI API key');
      console.log('  ABACUS_AI_PROJECT_ID  - Your project ID (optional)');
  }
}

// ES module check
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { AbacusAIIntegration, AbacusConfig }; 