# ☁️ Cloud Integration

Complete integration with major cloud services: **Deerflow**, **Mindpal**, **Neon**, **Firebase**, and **BigQuery**. Unified database operations, AI workflows, and cloud analytics.

## 🚀 Quick Start

### 1. Get Your API Keys & Credentials

#### Neon Database
```bash
# Visit: https://console.neon.tech/
NEON_DATABASE_URL=postgresql://user:password@host/database
```

#### Firebase
```bash
# Visit: https://console.firebase.google.com/
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

#### BigQuery
```bash
# Visit: https://console.cloud.google.com/
BIGQUERY_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

#### Deerflow & Mindpal
```bash
# These will be configured through their respective platforms
# Deerflow: https://deerflow.com/
# Mindpal: https://mindpal.com/
```

### 2. Test the Integration
```bash
npm run cloud:health
```

## ☁️ Available Cloud Services

### 🦌 Deerflow
- **Type**: AI Workflow Automation
- **Capabilities**: Automation, Integration, Workflow, Deployment
- **Use Cases**: AI-powered workflows, automation pipelines

### 🧠 Mindpal
- **Type**: AI Workflow Platform
- **Capabilities**: Automation, Integration, Workflow, Deployment
- **Use Cases**: AI agent workflows, intelligent automation

### 🗄️ Neon Database
- **Type**: Serverless PostgreSQL
- **Capabilities**: PostgreSQL, Serverless, Scaling, Backups
- **Use Cases**: Primary database, real-time applications

### 🔥 Firebase
- **Type**: Cloud Storage & Services
- **Capabilities**: Realtime Database, Firestore, Authentication, Hosting, Functions
- **Use Cases**: User management, real-time data, mobile apps

### 📊 BigQuery
- **Type**: Data Warehouse & Analytics
- **Capabilities**: Data Warehouse, SQL, ML, Streaming
- **Use Cases**: Analytics, data processing, machine learning

## 📋 Available Commands

### 🏥 Health Check
```bash
# Check health of all cloud services
npm run cloud:health
```

### 🗄️ Neon Database Operations
```bash
# Execute SQL query
npm run cloud:neon query "SELECT * FROM users WHERE active = true"

# Insert data
npm run cloud:neon insert users '{"name": "John Doe", "email": "john@example.com"}'

# Update data
npm run cloud:neon update users '{"name": "Jane Doe"}' '{"id": 1}'

# Delete data
npm run cloud:neon delete users '{"id": 1}'

# Create table
npm run cloud:neon create-table users '{"id": "SERIAL PRIMARY KEY", "name": "VARCHAR(255)", "email": "VARCHAR(255)"}'
```

### 🔥 Firebase Operations
```bash
# Get all documents from collection
npm run cloud:firebase get users

# Get specific document
npm run cloud:firebase get users user123

# Set document (auto-generate ID)
npm run cloud:firebase set users '{"name": "John Doe", "email": "john@example.com"}'

# Set document with specific ID
npm run cloud:firebase set users '{"name": "John Doe", "email": "john@example.com"}' user123

# Update document
npm run cloud:firebase update users user123 '{"name": "Jane Doe"}'

# Delete document
npm run cloud:firebase delete users user123
```

### 📊 BigQuery Operations
```bash
# Execute SQL query
npm run cloud:bigquery query "SELECT * FROM dataset.table LIMIT 10"

# Create table
npm run cloud:bigquery create-table dataset table '{"id": "INTEGER", "name": "STRING", "timestamp": "TIMESTAMP"}'

# Insert data
npm run cloud:bigquery insert dataset table '[{"id": 1, "name": "John", "timestamp": "2024-01-01"}]'
```

### 🦌 Deerflow Workflows
```bash
# Create workflow
npm run cloud:deerflow '{"name": "data-processing", "steps": ["extract", "transform", "load"], "triggers": ["daily"]}'

# Execute workflow
npm run cloud:deerflow '{"name": "user-sync", "type": "automation", "config": {"source": "api", "target": "database"}}'
```

### 🧠 Mindpal Workflows
```bash
# Create AI workflow
npm run cloud:mindpal '{"name": "content-generation", "type": "automation", "config": {"model": "gpt-4", "prompt": "Generate blog post"}}'

# Execute workflow
npm run cloud:mindpal '{"name": "data-analysis", "type": "workflow", "config": {"input": "csv", "output": "insights"}}'
```

### 📋 List Services
```bash
# List all services
npm run cloud:services

# List database services only
npm run cloud:services database

# List AI workflow services only
npm run cloud:services ai-workflow
```

## 🎯 Use Cases & Examples

### Database Operations

#### Neon - User Management
```bash
# Create users table
npm run cloud:neon create-table users '{
  "id": "SERIAL PRIMARY KEY",
  "name": "VARCHAR(255) NOT NULL",
  "email": "VARCHAR(255) UNIQUE NOT NULL",
  "created_at": "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
}'

# Insert user
npm run cloud:neon insert users '{
  "name": "John Doe",
  "email": "john@example.com"
}'

# Query users
npm run cloud:neon query "SELECT * FROM users WHERE created_at > '2024-01-01'"
```

#### Firebase - Real-time Data
```bash
# Store user data
npm run cloud:firebase set users '{
  "name": "John Doe",
  "email": "john@example.com",
  "lastSeen": "2024-01-01T12:00:00Z"
}' user123

# Get user data
npm run cloud:firebase get users user123

# Update user status
npm run cloud:firebase update users user123 '{
  "status": "online",
  "lastSeen": "2024-01-01T12:30:00Z"
}'
```

#### BigQuery - Analytics
```bash
# Create analytics table
npm run cloud:bigquery create-table analytics events '{
  "user_id": "STRING",
  "event_type": "STRING",
  "timestamp": "TIMESTAMP",
  "properties": "STRING"
}'

# Insert analytics data
npm run cloud:bigquery insert analytics events '[
  {
    "user_id": "user123",
    "event_type": "page_view",
    "timestamp": "2024-01-01T12:00:00Z",
    "properties": "{\"page\": \"/home\"}"
  }
]'

# Query analytics
npm run cloud:bigquery query "
  SELECT 
    user_id,
    COUNT(*) as event_count,
    DATE(timestamp) as date
  FROM analytics.events
  WHERE timestamp >= '2024-01-01'
  GROUP BY user_id, DATE(timestamp)
  ORDER BY event_count DESC
"
```

### AI Workflow Operations

#### Deerflow - Data Processing Pipeline
```bash
# Create ETL workflow
npm run cloud:deerflow '{
  "name": "daily-data-sync",
  "steps": [
    {
      "name": "extract",
      "type": "api_call",
      "config": {"url": "https://api.example.com/data"}
    },
    {
      "name": "transform",
      "type": "data_processing",
      "config": {"format": "json", "validation": true}
    },
    {
      "name": "load",
      "type": "database_insert",
      "config": {"table": "processed_data"}
    }
  ],
  "triggers": ["daily"],
  "status": "active"
}'
```

#### Mindpal - AI Content Generation
```bash
# Create content generation workflow
npm run cloud:mindpal '{
  "name": "blog-post-generator",
  "type": "automation",
  "config": {
    "model": "gpt-4",
    "prompt": "Generate a blog post about {topic}",
    "output_format": "markdown",
    "publishing": {
      "platform": "wordpress",
      "auto_publish": false
    }
  }
}'
```

## 🔧 Advanced Usage

### Direct Script Usage
```bash
# Health check
tsx scripts/cloud-integration.ts health

# Neon operations
tsx scripts/cloud-integration.ts neon query "SELECT COUNT(*) FROM users"

# Firebase operations
tsx scripts/cloud-integration.ts firebase get users

# BigQuery operations
tsx scripts/cloud-integration.ts bigquery query "SELECT * FROM dataset.table LIMIT 10"

# AI workflows
tsx scripts/cloud-integration.ts deerflow '{"name": "test-workflow"}'
tsx scripts/cloud-integration.ts mindpal '{"name": "test-workflow"}'
```

### Programmatic Usage
```typescript
import { CloudIntegration } from './scripts/cloud-integration';

const cloud = new CloudIntegration();

// Neon operations
const users = await cloud.neonQuery('SELECT * FROM users WHERE active = true');
const newUser = await cloud.neonInsert('users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Firebase operations
const userData = await cloud.firebaseGet('users', 'user123');
const updatedUser = await cloud.firebaseUpdate('users', 'user123', {
  status: 'online'
});

// BigQuery operations
const analytics = await cloud.bigqueryQuery(`
  SELECT user_id, COUNT(*) as events
  FROM analytics.events
  GROUP BY user_id
`);

// AI workflows
const deerflowWorkflow = await cloud.deerflowWorkflow({
  name: 'data-processing',
  steps: ['extract', 'transform', 'load']
});

const mindpalWorkflow = await cloud.mindpalWorkflow({
  name: 'content-generation',
  type: 'automation',
  config: { model: 'gpt-4' }
});
```

### Unified Operations
```typescript
// Execute any database operation
const result = await cloud.executeOperation({
  type: 'query',
  database: 'neon',
  query: 'SELECT * FROM users'
});

// Execute AI workflow
const workflow = await cloud.executeAIWorkflow({
  service: 'deerflow',
  type: 'automation',
  config: { name: 'test-workflow' }
});
```

## 🏗️ Architecture Patterns

### Multi-Database Strategy
```typescript
// Use Neon for primary data
const users = await cloud.neonQuery('SELECT * FROM users');

// Use Firebase for real-time features
await cloud.firebaseSet('user_sessions', {
  userId: user.id,
  status: 'online',
  lastSeen: new Date()
});

// Use BigQuery for analytics
await cloud.bigqueryInsert('analytics', 'user_events', [{
  user_id: user.id,
  event_type: 'login',
  timestamp: new Date()
}]);
```

### AI Workflow Integration
```typescript
// Deerflow for data processing
const dataPipeline = await cloud.deerflowWorkflow({
  name: 'user-data-sync',
  steps: [
    { name: 'extract', type: 'api_call' },
    { name: 'transform', type: 'data_processing' },
    { name: 'load', type: 'database_insert' }
  ]
});

// Mindpal for AI tasks
const aiTask = await cloud.mindpalWorkflow({
  name: 'user-recommendations',
  type: 'automation',
  config: {
    model: 'gpt-4',
    task: 'generate_recommendations',
    input: userData
  }
});
```

## 🔄 Integration with Existing Tools

### YOLO Mode Integration
```bash
# Use cloud services in YOLO mode
npm run yolo:enable
npm run cloud:neon insert users '{"name": "Test User", "email": "test@example.com"}'
npm run yolo:compliance
```

### AI Integration
```bash
# Generate database queries with AI
npm run ai:code "Create a Neon query to get active users" sql gpt-4o
npm run cloud:neon query "SELECT * FROM users WHERE active = true"

# Generate Firebase operations with AI
npm run ai:code "Create Firebase user document" javascript gpt-4o
npm run cloud:firebase set users '{"name": "AI Generated User"}'
```

### Testing Integration
```bash
# Test database operations
npm run cloud:neon query "SELECT 1 as test"
npm test

# Test AI workflows
npm run cloud:deerflow '{"name": "test-workflow", "steps": ["test"]}'
npm run cloud:mindpal '{"name": "test-workflow", "type": "test"}'
```

## 📊 Performance & Scaling

### Neon Database
- **Serverless**: Auto-scaling based on demand
- **Connection Pooling**: Efficient connection management
- **Read Replicas**: High availability and performance
- **Backups**: Automatic daily backups

### Firebase
- **Real-time**: Instant data synchronization
- **Offline Support**: Works without internet
- **Auto-scaling**: Handles millions of users
- **Security**: Built-in authentication and rules

### BigQuery
- **Petabyte Scale**: Handle massive datasets
- **Fast Queries**: Columnar storage and optimization
- **ML Integration**: Built-in machine learning
- **Streaming**: Real-time data ingestion

## 🔒 Security Best Practices

### Database Security
```typescript
// Use parameterized queries (Neon)
await cloud.neonQuery(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
);

// Use Firebase security rules
// Set up proper authentication and authorization
await cloud.firebaseSet('users', userData, userId);
```

### API Key Management
```bash
# Use environment variables
export NEON_DATABASE_URL="postgresql://..."
export FIREBASE_PROJECT_ID="your-project"
export BIGQUERY_PROJECT_ID="your-project"

# Never commit credentials to version control
echo "*.key" >> .gitignore
echo "service-account.json" >> .gitignore
```

### Access Control
```typescript
// Implement proper access control
const user = await cloud.neonQuery(
  'SELECT * FROM users WHERE id = $1 AND organization_id = $2',
  [userId, organizationId]
);
```

## 🆘 Troubleshooting

### Common Issues

1. **Connection Failed**
   ```
   Error: Neon database not connected
   ```
   **Solution**: Check `NEON_DATABASE_URL` environment variable

2. **Authentication Failed**
   ```
   Error: Firebase not connected
   ```
   **Solution**: Verify Firebase credentials and project ID

3. **Permission Denied**
   ```
   Error: BigQuery not connected
   ```
   **Solution**: Check Google service account permissions

4. **Workflow Failed**
   ```
   Error: Deerflow/Mindpal operation failed
   ```
   **Solution**: Verify workflow configuration and API access

### Getting Help

1. Check service-specific documentation
2. Verify API keys and credentials
3. Test with simple operations first
4. Check network connectivity
5. Review error logs for details

## 🎯 Next Steps

1. **Set up credentials** for all services
2. **Test connections** with health check
3. **Create sample data** and workflows
4. **Integrate with your application**
5. **Monitor performance** and costs

## 📈 Advanced Features

### Health Monitoring
```typescript
const status = await cloud.healthCheck();
console.log('Service Status:', status);
// Output: { neon: true, firebase: true, bigquery: true, timestamp: ... }
```

### Configuration Management
```typescript
// Save configuration
await cloud.saveConfig({
  neon: { connectionString: '...' },
  firebase: { projectId: '...' }
}, 'production.json');

// Load configuration
const config = await cloud.loadConfig('production.json');
```

### Service Discovery
```typescript
// Get all services
const services = cloud.getAvailableServices();

// Get services by type
const databases = cloud.getServicesByType('database');
const aiWorkflows = cloud.getServicesByType('ai-workflow');
```

---

**🎉 You now have complete cloud integration with Deerflow, Mindpal, Neon, Firebase, and BigQuery!** 