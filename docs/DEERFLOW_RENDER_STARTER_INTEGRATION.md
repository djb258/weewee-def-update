# DeerFlow Render Starter Integration

## Overview

This integration connects your **DeerFlow Render Starter** FastAPI application with the **Firebase Whiteboard Orchestration System** to create a comprehensive blueprint processing pipeline. The system uses Firebase as a persistent whiteboard to track payloads through multiple processing steps.

## 🔒 Barton Doctrine Compliance

This integration is **MANDATORY BARTON DOCTRINE COMPLIANT** with:

- ✅ SPVPET schema enforcement for Firebase operations
- ✅ Nuclear doctrine validation and enforcement
- ✅ Automatic payload formatting and validation
- ✅ Zero-tolerance error handling with recovery mechanisms

## Architecture

### DeerFlow Render Starter Endpoints

Your DeerFlow Render Starter provides these key endpoints:

1. **`/fire`** - Multi-LLM processing with validation
2. **`/scrape`** - Web scraping via Browserless.io
3. **`/pingpong`** - MindPal agent integration
4. **`/extract_company`** - Company data extraction
5. **`/screenshot`** - Web page screenshots
6. **`/auth/initiate`** - Google OAuth initiation
7. **`/oauth2callback`** - Google OAuth callback

### Orchestration Flow

```mermaid
graph TD
    A[Blueprint Input] --> B[Firebase Whiteboard Entry]
    B --> C[MindPal Validation]
    C --> D[Firebase Entry Update]
    D --> E[DeerFlow Render Starter /fire]
    E --> F[Firebase Entry Update]
    F --> G[LLM Enhancement via /fire]
    G --> H[Firebase Entry Update]
    H --> I[Web Scraping via /scrape]
    I --> J[Firebase Entry Update]
    J --> K[Render Deployment]
    K --> L[Firebase Summary Creation]
    L --> M[Final Result]
```

## Setup Instructions

### 1. Deploy DeerFlow Render Starter

1. **Fork/Clone the Repository**

   ```bash
   git clone https://github.com/djb258/deerflow_render_starter.git
   cd deerflow_render_starter
   ```

2. **Deploy to Render.com**
   - Connect your GitHub repository to Render
   - Create a new Web Service
   - Set build command: `pip install -r requirements.txt`
   - Set start command: `uvicorn app:app --host 0.0.0.0 --port 10000`
   - Configure environment variables (see below)

3. **Configure Environment Variables in Render**
   ```bash
   OPENAI_API_KEY=your-openai-api-key
   CLAUDE_API_KEY=your-claude-api-key
   GEMINI_API_KEY=your-gemini-api-key
   PERPLEXITY_API_KEY=your-perplexity-api-key
   TAVILY_API_KEY=your-tavily-api-key
   BROWSERLESS_API_KEY=your-browserless-api-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_REDIRECT_URI=https://your-app.onrender.com/oauth2callback
   ```

### 2. Configure Firebase Whiteboard

1. **Set up Firebase Project**
   - Create a Firebase project
   - Enable Firestore Database
   - Create a service account with Firestore permissions
   - Download the service account key

2. **Configure Environment Variables**

   ```bash
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Key Here\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

   # Whiteboard Settings
   FIREBASE_WHITEBOARD_TTL=3600
   FIREBASE_WHITEBOARD_CLEANUP=true
   FIREBASE_WHITEBOARD_RETENTION_DAYS=7
   ```

### 3. Configure Orchestration System

Update your `.env` file with the complete configuration:

```bash
# =============================================================================
# DEERFLOW RENDER STARTER CONFIGURATION
# =============================================================================
DEERFLOW_BASE_URL=https://your-deerflow-render-starter.onrender.com
DEERFLOW_API_KEY=your-deerflow-api-key
DEERFLOW_WORKFLOW_ID=your-workflow-id

# =============================================================================
# MINDPAL CONFIGURATION
# =============================================================================
MINDPAL_API_KEY=your-mindpal-api-key
MINDPAL_AGENT_ID=your-agent-id

# =============================================================================
# RENDER CONFIGURATION
# =============================================================================
RENDER_API_KEY=your-render-api-key
RENDER_WEBHOOK_URL=https://your-render-webhook-url
RENDER_SERVICE_ID=your-render-service-id

# =============================================================================
# LLM CONFIGURATION
# =============================================================================
LLM_PROVIDER=openai
LLM_API_KEY=your-openai-api-key
LLM_MODEL=gpt-3.5-turbo

# =============================================================================
# FIREBASE WHITEBOARD CONFIGURATION
# =============================================================================
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_WHITEBOARD_TTL=3600
FIREBASE_WHITEBOARD_CLEANUP=true
FIREBASE_WHITEBOARD_RETENTION_DAYS=7
```

## Usage Examples

### Basic Orchestration

```typescript
import { DeerFlowRenderStarterOrchestrator } from './scripts/render_deerflow_mindpal_firebase_orchestrator';

const config = {
  render: {
    apiKey: process.env.RENDER_API_KEY!,
    webhookUrl: process.env.RENDER_WEBHOOK_URL!,
    serviceId: process.env.RENDER_SERVICE_ID!,
  },
  deerflow: {
    apiKey: process.env.DEERFLOW_API_KEY!,
    baseUrl: process.env.DEERFLOW_BASE_URL!,
    workflowId: process.env.DEERFLOW_WORKFLOW_ID!,
  },
  mindpal: {
    apiKey: process.env.MINDPAL_API_KEY!,
    agentId: process.env.MINDPAL_AGENT_ID!,
  },
  llm: {
    provider: 'openai',
    apiKey: process.env.LLM_API_KEY!,
    model: 'gpt-3.5-turbo',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  },
  whiteboard: {
    ttl: 3600,
    enableCleanup: true,
    retentionDays: 7,
  },
};

const orchestrator = new DeerFlowRenderStarterOrchestrator(config);

// Run orchestration with web scraping
const result = await orchestrator.orchestrateWithFirebaseWhiteboard({
  id: 'my-blueprint-001',
  name: 'My Blueprint',
  version: '1.0.0',
  components: ['component1', 'component2'],
  url: 'https://example.com', // For web scraping
});

console.log('Orchestration Result:', result);
```

### Health Check

```typescript
const health = await orchestrator.healthCheck();
console.log('Overall Status:', health.overall);
console.log('Service Status:', health.services);
```

### Test DeerFlow Endpoints

```typescript
const endpoints = await orchestrator.testDeerFlowRenderStarterEndpoints();
console.log('Endpoint Status:', endpoints);
```

## NPM Scripts

The integration includes several NPM scripts for testing and execution:

```bash
# Quick environment check
npm run deerflow-orchestrate:quick

# Full test suite
npm run deerflow-orchestrate:test

# Run orchestration
npm run deerflow-orchestrate
```

## DeerFlow Render Starter Endpoints

### `/fire` - Multi-LLM Processing

**Purpose**: Process messages through multiple LLM providers with validation

**Request**:

```json
{
  "input_data": {
    "llm": "openai",
    "message": "Your message here",
    "validate": true
  },
  "persona": "blueprint_enforcer",
  "command_source": "firebase_orchestrator"
}
```

**Response**:

```json
{
  "status": "dispatched",
  "engine": "openai",
  "message": "Your message here",
  "output": "LLM response content"
}
```

### `/scrape` - Web Scraping

**Purpose**: Extract content from web pages using Browserless.io

**Request**:

```json
{
  "url": "https://example.com"
}
```

**Response**:

```json
{
  "status": "success",
  "url": "https://example.com",
  "content": "Extracted page content",
  "content_length": 1234
}
```

### `/pingpong` - MindPal Integration

**Purpose**: Echo endpoint for MindPal agent testing

**Request**:

```json
{
  "prompt": "test message"
}
```

**Response**:

```json
{
  "response": "Echo: test message"
}
```

## Firebase Data Structure

### Orchestration Whiteboard Entry

```json
{
  "source_id": "orch_1234567890_abc123_deerflow_render_starter_1640995200000",
  "process_id": "orchestration_deerflow_render_starter",
  "validated": true,
  "execution_signature": "deerflow-render-starter-orchestrator_orch_1234567890_abc123_1.0.0",
  "timestamp_last_touched": "2023-12-31T23:00:00.000Z",
  "data_payload": {
    "id": "orch_1234567890_abc123_deerflow_render_starter_1640995200000",
    "orchestration_id": "orch_1234567890_abc123",
    "step": "deerflow_render_starter",
    "data": {
      "input": { "blueprint": "data" },
      "output": {
        "success": true,
        "engine": "openai",
        "output": "LLM response",
        "status": "dispatched"
      },
      "status": "completed"
    },
    "timestamp": "2023-12-31T23:00:00.000Z",
    "ttl": 3600
  }
}
```

## Testing

### Quick Environment Check

```bash
npm run deerflow-orchestrate:quick
```

This checks:

- ✅ Environment variables configuration
- ✅ Required API keys presence
- ✅ Configuration validation

### Full Test Suite

```bash
npm run deerflow-orchestrate:test
```

This runs:

- ✅ Configuration validation
- ✅ Firebase connection test
- ✅ Service health checks
- ✅ DeerFlow Render Starter endpoints test
- ✅ Mock orchestration test
- ✅ Status retrieval test

## Monitoring and Debugging

### DeerFlow Render Starter Logs

Monitor your DeerFlow Render Starter deployment in Render.com:

1. Go to your Render dashboard
2. Select your DeerFlow Render Starter service
3. View logs and metrics

### Firebase Console

Monitor orchestration data in Firebase:

1. Go to your Firebase project console
2. Navigate to Firestore Database
3. View collections:
   - `orchestration_whiteboard` - Individual step tracking
   - `orchestration_summaries` - Execution summaries

### System Logs

The orchestration system provides comprehensive logging:

```bash
🚀 Starting DeerFlow Render Starter orchestration: orch_1234567890_abc123
📋 Created initial whiteboard entry: orch_1234567890_abc123_initial_blueprint_1640995200000
🤖 Step 1: MindPal validation...
📝 Created whiteboard entry: orch_1234567890_abc123_mindpal_validation_1640995205000
✅ mindpal_validation completed successfully
🦌 Step 2: DeerFlow Render Starter processing...
📝 Created whiteboard entry: orch_1234567890_abc123_deerflow_render_starter_1640995210000
✅ deerflow_render_starter completed successfully
🧠 Step 3: LLM enhancement via DeerFlow Render Starter...
📝 Created whiteboard entry: orch_1234567890_abc123_llm_enhancement_1640995215000
✅ llm_enhancement completed successfully
🌐 Step 4: Web scraping via Browserless...
📝 Created whiteboard entry: orch_1234567890_abc123_web_scraping_1640995220000
✅ web_scraping completed successfully
🚀 Step 5: Render deployment...
📝 Created whiteboard entry: orch_1234567890_abc123_render_deployment_1640995225000
✅ render_deployment completed successfully
🎯 Orchestration orch_1234567890_abc123 completed
⏱️ Total processing time: 15000ms
```

## Error Handling

The system includes comprehensive error handling:

1. **Service Failures**: Individual services can fail without stopping the entire orchestration
2. **Firebase Failures**: Barton Doctrine ensures data integrity
3. **Validation Errors**: Nuclear doctrine enforcement prevents invalid data
4. **Recovery**: Manual recovery mechanisms available

## Security Features

### Barton Doctrine Integration

- **SPVPET Schema**: All Firebase operations use SPVPET formatting
- **Nuclear Enforcement**: Zero-tolerance validation with automatic shutdown
- **Execution Signatures**: Cryptographic signatures for all operations
- **Audit Trail**: Complete audit trail in Firebase

### Data Protection

- **TTL Management**: Automatic cleanup of old entries
- **Access Control**: Firebase security rules (configure separately)
- **Encryption**: Firebase handles encryption at rest and in transit

## Troubleshooting

### Common Issues

1. **DeerFlow Render Starter Connection Errors**
   - Check your deployed URL is correct
   - Verify the service is running on Render
   - Check environment variables in Render dashboard

2. **API Key Issues**
   - Verify all API keys are set in Render environment
   - Check API key permissions
   - Test individual service connections

3. **Firebase Connection Errors**
   - Check service account key format
   - Verify Firestore is enabled
   - Check network connectivity

### Support Commands

```bash
# Check environment
npm run deerflow-orchestrate:quick

# Test connections
npm run deerflow-orchestrate:test

# Validate Barton Doctrine
npm run barton:status
```

## Next Steps

1. **Deploy your DeerFlow Render Starter** to Render.com
2. **Configure Firebase security rules** for production
3. **Set up monitoring and alerting** for orchestration failures
4. **Implement custom recovery procedures** for specific failure scenarios
5. **Scale Firebase** for production workloads

## Integration Benefits

This integration provides:

- ✅ **Multi-LLM Support**: OpenAI, Claude, Gemini, Perplexity, Tavily
- ✅ **Web Scraping**: Browserless.io integration for content extraction
- ✅ **MindPal Integration**: AI agent validation and processing
- ✅ **Firebase Whiteboard**: Persistent payload tracking and recovery
- ✅ **Barton Doctrine Compliance**: Mandatory security and validation
- ✅ **Comprehensive Testing**: Full test suite with health checks
- ✅ **Production Ready**: Error handling, monitoring, and scaling

The system extends your DeerFlow Render Starter with enterprise-grade orchestration capabilities while maintaining full Barton Doctrine compliance.
