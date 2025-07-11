# Abacus.AI Integration Guide

## Overview

This guide provides comprehensive integration with Abacus.AI for machine learning models, deployments, and predictions. The integration follows STAMPED/SPVPET/STACKED doctrine compliance and includes proper error handling and testing.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install required packages
npm install dotenv axios

# Verify installation
npm list axios dotenv
```

### 2. Environment Setup

Create or update your `.env` file:

```env
# Abacus.AI Configuration
ABACUS_AI_API_KEY=your_api_key_here
ABACUS_AI_PROJECT_ID=your_project_id_here  # Optional
```

### 3. Test Connection

```bash
# Test your Abacus.AI connection
npm run abacus:test
```

## 📋 Available Commands

### Basic Operations

```bash
# Test connection and API key
npm run abacus:test

# List all models
npm run abacus:models

# List all deployments
npm run abacus:deployments
```

### Model Management

```bash
# Create a new model
npm run abacus:create-model "My Model" "classification"

# Get model status
npm run abacus:status <model_id>
```

### Deployment Operations

```bash
# Deploy a model
npm run abacus:deploy <model_id> "Production Deployment"

# Make predictions
npm run abacus:predict <deployment_id> '{"input": "test data"}'
```

## 🔧 Advanced Usage

### Programmatic Integration

```typescript
import { AbacusAIIntegration } from './scripts/abacus-ai-setup';

// Initialize with custom config
const abacus = new AbacusAIIntegration({
  apiKey: 'your_api_key',
  projectId: 'your_project_id',
  timeout: 60000,
  retries: 5
});

// Test connection
const connection = await abacus.testConnection();
if (connection.success) {
  console.log('✅ Connected to Abacus.AI');
}

// Create a model
const model = await abacus.createModel({
  name: 'My ML Model',
  type: 'classification',
  config: {
    algorithm: 'random_forest',
    hyperparameters: {
      n_estimators: 100,
      max_depth: 10
    }
  }
});

// Deploy the model
const deployment = await abacus.deployModel(model.data.id, {
  name: 'Production Model',
  environment: 'production'
});

// Make predictions
const prediction = await abacus.makePrediction(deployment.data.id, {
  features: [1, 2, 3, 4, 5]
});
```

## 📊 API Reference

### AbacusAIIntegration Class

#### Constructor
```typescript
new AbacusAIIntegration(config?: Partial<AbacusConfig>)
```

#### Configuration Options
```typescript
interface AbacusConfig {
  apiKey: string;           // Required: Your Abacus.AI API key
  projectId?: string;       // Optional: Your project ID
  baseUrl?: string;         // Default: 'https://api.abacus.ai'
  timeout?: number;         // Default: 30000ms
  retries?: number;         // Default: 3
}
```

#### Methods

##### `testConnection()`
Tests the connection to Abacus.AI API.

```typescript
const result = await abacus.testConnection();
// Returns: { success: boolean, data?: boolean, error?: string }
```

##### `listModels()`
Retrieves all available models.

```typescript
const result = await abacus.listModels();
// Returns: { success: boolean, data?: Model[], error?: string }
```

##### `createModel(config)`
Creates a new ML model.

```typescript
const result = await abacus.createModel({
  name: 'Model Name',
  type: 'classification|regression|clustering',
  config: { /* model configuration */ }
});
```

##### `deployModel(modelId, config)`
Deploys a model for predictions.

```typescript
const result = await abacus.deployModel(modelId, {
  name: 'Deployment Name',
  environment: 'production|staging|development',
  config: { /* deployment configuration */ }
});
```

##### `makePrediction(deploymentId, input)`
Makes predictions using a deployed model.

```typescript
const result = await abacus.makePrediction(deploymentId, {
  feature1: value1,
  feature2: value2,
  // ... more features
});
```

##### `getDeploymentStatus(deploymentId)`
Gets the status of a deployment.

```typescript
const result = await abacus.getDeploymentStatus(deploymentId);
```

##### `listDeployments()`
Lists all deployments.

```typescript
const result = await abacus.listDeployments();
```

##### `deleteDeployment(deploymentId)`
Deletes a deployment.

```typescript
const result = await abacus.deleteDeployment(deploymentId);
```

##### `getModelStatus(modelId)`
Gets the training status of a model.

```typescript
const result = await abacus.getModelStatus(modelId);
```

##### `uploadTrainingData(modelId, data)`
Uploads training data to a model.

```typescript
const result = await abacus.uploadTrainingData(modelId, [
  { features: [...], target: value },
  // ... more training examples
]);
```

##### `startTraining(modelId, config)`
Starts training a model.

```typescript
const result = await abacus.startTraining(modelId, {
  epochs: 100,
  batch_size: 32,
  // ... other training parameters
});
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. API Key Issues
```bash
❌ ABACUS_AI_API_KEY environment variable is required
```

**Solution:**
- Add your API key to `.env` file
- Ensure the key is valid and has proper permissions
- Check for typos in the environment variable name

#### 2. Connection Timeout
```bash
❌ Connection failed: timeout
```

**Solution:**
- Increase timeout in configuration
- Check network connectivity
- Verify API endpoint is accessible

#### 3. Authentication Errors
```bash
❌ Connection failed: 401 Unauthorized
```

**Solution:**
- Verify API key is correct
- Check if API key has expired
- Ensure proper permissions for the operation

#### 4. Model Creation Failures
```bash
❌ Failed to create model: Invalid model type
```

**Solution:**
- Check supported model types
- Verify model configuration format
- Ensure all required fields are provided

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=abacus:* npm run abacus:test
```

### Error Handling

All methods return a consistent response format:

```typescript
interface AbacusAIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
```

Always check the `success` field before using the `data`:

```typescript
const result = await abacus.makePrediction(deploymentId, input);
if (result.success && result.data) {
  console.log('Prediction:', result.data);
} else {
  console.error('Error:', result.error);
}
```

## 🔒 Security Best Practices

### API Key Management
- Store API keys in environment variables, never in code
- Use different keys for development and production
- Rotate keys regularly
- Use least privilege principle

### Data Security
- Validate all input data before sending to API
- Sanitize sensitive information
- Use HTTPS for all API communications
- Implement proper error handling

### Rate Limiting
- Implement exponential backoff for retries
- Monitor API usage and limits
- Cache responses when appropriate

## 📈 Performance Optimization

### Connection Pooling
```typescript
// Reuse the same instance for multiple operations
const abacus = new AbacusAIIntegration();
// Use this instance for all operations
```

### Batch Operations
```typescript
// Make multiple predictions in parallel
const predictions = await Promise.all(
  inputs.map(input => abacus.makePrediction(deploymentId, input))
);
```

### Caching
```typescript
// Cache model and deployment lists
let cachedModels = null;
let lastFetch = 0;

async function getModels() {
  const now = Date.now();
  if (!cachedModels || now - lastFetch > 300000) { // 5 minutes
    const result = await abacus.listModels();
    if (result.success) {
      cachedModels = result.data;
      lastFetch = now;
    }
  }
  return cachedModels;
}
```

## 🔄 Integration with YOLO Mode

The Abacus.AI integration works seamlessly with YOLO mode:

```bash
# Enable YOLO mode
npm run yolo:enable

# Test Abacus.AI with YOLO mode
npm run abacus:test

# Create models with YOLO mode
npm run abacus:create-model "YOLO Model" "classification"
```

## 📚 Related Documentation

- [YOLO Mode](./YOLO_MODE.md) - Rapid development mode
- [Monte Carlo Testing](./MONTE_CARLO_TESTING.md) - Stress testing
- [STAMPED Framework](./doctrine/acronyms.md) - Doctrine compliance
- [Machine Setup](./MACHINE_SETUP.md) - Development environment

## 🎯 Success Metrics

### Performance Targets
- **Connection Time**: < 2 seconds
- **Model Creation**: < 30 seconds
- **Deployment Time**: < 60 seconds
- **Prediction Latency**: < 1 second

### Reliability Targets
- **API Success Rate**: > 99%
- **Error Recovery**: < 5 seconds
- **Data Consistency**: 100%

---

**Built for reliable ML operations with Abacus.AI.** 