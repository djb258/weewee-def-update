import { z } from 'zod';

// Base Blueprint Schema (common across all databases)
export const BaseBlueprintSchema = z.object({
  id: z.string().min(1, 'ID is required'),
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in semver format (e.g., 1.0.0)'),
  status: z.enum(['active', 'inactive', 'draft', 'archived'], {
    errorMap: () => ({ message: 'Status must be active, inactive, draft, or archived' })
  }),
  description: z.string().optional(),
  author: z.string().min(1, 'Author is required'),
  timestamp: z.string().datetime('Invalid timestamp format'),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type BaseBlueprint = z.infer<typeof BaseBlueprintSchema>;

// Neon Database Schema (PostgreSQL)
export const NeonBlueprintSchema = BaseBlueprintSchema.extend({
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  id: z.string().min(1).max(50),
});

export type NeonBlueprint = z.infer<typeof NeonBlueprintSchema>;

// Firebase Schema (Firestore)
export const FirebaseBlueprintSchema = BaseBlueprintSchema.extend({
  firebase_id: z.string().optional(),
  collection: z.string().default('blueprints'),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

export type FirebaseBlueprint = z.infer<typeof FirebaseBlueprintSchema>;

// BigQuery Schema
export const BigQueryBlueprintSchema = BaseBlueprintSchema.extend({
  dataset_id: z.string().optional(),
  table_id: z.string().optional(),
  partition_date: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

export type BigQueryBlueprint = z.infer<typeof BigQueryBlueprintSchema>;

// Agent Task Schema (for Firebase)
export const AgentTaskSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
  blueprint_id: z.string().min(1, 'Blueprint ID is required'),
  agent_id: z.string().min(1, 'Agent ID is required'),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  task_type: z.string().min(1, 'Task type is required'),
  payload: z.record(z.unknown()).optional(),
  result: z.record(z.unknown()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
  started_at: z.date().optional(),
  completed_at: z.date().optional(),
  error_message: z.string().optional(),
});

export type AgentTask = z.infer<typeof AgentTaskSchema>;

// Error Log Schema (for Firebase)
export const ErrorLogSchema = z.object({
  id: z.string().min(1, 'Error ID is required'),
  timestamp: z.date(),
  level: z.enum(['debug', 'info', 'warning', 'error', 'critical']),
  message: z.string().min(1, 'Error message is required'),
  stack_trace: z.string().optional(),
  context: z.record(z.unknown()).optional(),
  blueprint_id: z.string().optional(),
  agent_id: z.string().optional(),
  user_id: z.string().optional(),
});

export type ErrorLog = z.infer<typeof ErrorLogSchema>;

// Human Firebreak Queue Schema (for Firebase)
export const HumanFirebreakQueueSchema = z.object({
  id: z.string().min(1, 'Queue ID is required'),
  blueprint_id: z.string().min(1, 'Blueprint ID is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  status: z.enum(['queued', 'in_progress', 'resolved', 'escalated']),
  assigned_to: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  created_at: z.date(),
  updated_at: z.date(),
  resolved_at: z.date().optional(),
  resolution_notes: z.string().optional(),
});

export type HumanFirebreakQueue = z.infer<typeof HumanFirebreakQueueSchema>;

// Validation Functions
export const validateBlueprintForNeon = (data: unknown): NeonBlueprint => {
  return NeonBlueprintSchema.parse(data);
};

export const validateBlueprintForFirebase = (data: unknown): FirebaseBlueprint => {
  return FirebaseBlueprintSchema.parse(data);
};

export const validateBlueprintForBigQuery = (data: unknown): BigQueryBlueprint => {
  return BigQueryBlueprintSchema.parse(data);
};

export const validateAgentTask = (data: unknown): AgentTask => {
  return AgentTaskSchema.parse(data);
};

export const validateErrorLog = (data: unknown): ErrorLog => {
  return ErrorLogSchema.parse(data);
};

export const validateHumanFirebreakQueue = (data: unknown): HumanFirebreakQueue => {
  return HumanFirebreakQueueSchema.parse(data);
};

// MindPal Schemas
export const MindPalConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  baseUrl: z.string().url('Base URL must be a valid URL').default('https://api.mindpal.com'),
  timeout: z.number().positive().default(30000),
  retryAttempts: z.number().int().min(0).max(5).default(3),
});

export type MindPalConfig = z.infer<typeof MindPalConfigSchema>;

export const MindPalAgentSchema = z.object({
  id: z.string().min(1, 'Agent ID is required'),
  name: z.string().min(1, 'Agent name is required'),
  type: z.enum(['blueprint_validator', 'data_processor', 'automation_agent']),
  status: z.enum(['active', 'inactive', 'training', 'error']),
  capabilities: z.array(z.string()),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type MindPalAgent = z.infer<typeof MindPalAgentSchema>;

export const MindPalTaskSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
  agent_id: z.string().min(1, 'Agent ID is required'),
  blueprint_id: z.string().min(1, 'Blueprint ID is required'),
  task_type: z.enum(['validate', 'process', 'automate', 'analyze']),
  payload: z.record(z.unknown()),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  result: z.record(z.unknown()).optional(),
  error_message: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  completed_at: z.date().optional(),
});

export type MindPalTask = z.infer<typeof MindPalTaskSchema>;

// MindPal Validation Functions
export const validateMindPalConfig = (data: unknown): MindPalConfig => {
  return MindPalConfigSchema.parse(data);
};

export const validateMindPalAgent = (data: unknown): MindPalAgent => {
  return MindPalAgentSchema.parse(data);
};

export const validateMindPalTask = (data: unknown): MindPalTask => {
  return MindPalTaskSchema.parse(data);
};

// DeerFlow Schemas
export const DeerFlowConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  baseUrl: z.string().url('Base URL must be a valid URL').default('https://api.deerflow.com'),
  timeout: z.number().positive().default(30000),
  retryAttempts: z.number().int().min(0).max(5).default(3),
});

export type DeerFlowConfig = z.infer<typeof DeerFlowConfigSchema>;

export const DeerFlowWorkflowSchema = z.object({
  id: z.string().min(1, 'Workflow ID is required'),
  name: z.string().min(1, 'Workflow name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft', 'archived']),
  type: z.enum(['data_pipeline', 'automation', 'integration', 'monitoring']),
  triggers: z.array(z.string()).optional(),
  steps: z.array(z.record(z.unknown())).optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type DeerFlowWorkflow = z.infer<typeof DeerFlowWorkflowSchema>;

export const DeerFlowExecutionSchema = z.object({
  id: z.string().min(1, 'Execution ID is required'),
  workflow_id: z.string().min(1, 'Workflow ID is required'),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  input_data: z.record(z.unknown()).optional(),
  output_data: z.record(z.unknown()).optional(),
  error_message: z.string().optional(),
  started_at: z.date().optional(),
  completed_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type DeerFlowExecution = z.infer<typeof DeerFlowExecutionSchema>;

export const DeerFlowBlueprintIntegrationSchema = z.object({
  id: z.string().min(1, 'Integration ID is required'),
  blueprint_id: z.string().min(1, 'Blueprint ID is required'),
  workflow_id: z.string().min(1, 'Workflow ID is required'),
  integration_type: z.enum(['validation', 'processing', 'monitoring', 'automation']),
  config: z.record(z.unknown()),
  status: z.enum(['active', 'inactive', 'error']),
  last_execution: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type DeerFlowBlueprintIntegration = z.infer<typeof DeerFlowBlueprintIntegrationSchema>;

// Render Schemas
export const RenderConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  webhookUrl: z.string().url('Webhook URL must be a valid URL'),
  baseUrl: z.string().url('Base URL must be a valid URL').default('https://api.render.com'),
  timeout: z.number().positive().default(30000),
  retryAttempts: z.number().int().min(0).max(5).default(3),
});

export type RenderConfig = z.infer<typeof RenderConfigSchema>;

export const RenderServiceSchema = z.object({
  id: z.string().min(1, 'Service ID is required'),
  name: z.string().min(1, 'Service name is required'),
  type: z.enum(['web_service', 'static_site', 'background_worker', 'cron_job']),
  status: z.enum(['live', 'suspended', 'deleted', 'build_failed', 'deploy_failed']),
  service_details: z.object({
    url: z.string().url().optional(),
    environment: z.enum(['production', 'preview']).optional(),
    region: z.string().optional(),
    plan: z.string().optional(),
  }).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type RenderService = z.infer<typeof RenderServiceSchema>;

export const RenderDeploymentSchema = z.object({
  id: z.string().min(1, 'Deployment ID is required'),
  service_id: z.string().min(1, 'Service ID is required'),
  status: z.enum(['pending', 'building', 'live', 'failed', 'cancelled']),
  commit: z.object({
    id: z.string().optional(),
    message: z.string().optional(),
    author: z.string().optional(),
  }).optional(),
  environment: z.enum(['production', 'preview']).optional(),
  created_at: z.date(),
  updated_at: z.date(),
  finished_at: z.date().optional(),
});

export type RenderDeployment = z.infer<typeof RenderDeploymentSchema>;

export const RenderWebhookPayloadSchema = z.object({
  action: z.enum(['deploy', 'build', 'restart', 'suspend']),
  timestamp: z.string().datetime(),
  environment: z.enum(['production', 'preview', 'development']).optional(),
  service_id: z.string().optional(),
  deployment_id: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type RenderWebhookPayload = z.infer<typeof RenderWebhookPayloadSchema>;

// DeerFlow Validation Functions
export const validateDeerFlowConfig = (data: unknown): DeerFlowConfig => {
  return DeerFlowConfigSchema.parse(data);
};

export const validateDeerFlowWorkflow = (data: unknown): DeerFlowWorkflow => {
  return DeerFlowWorkflowSchema.parse(data);
};

export const validateDeerFlowExecution = (data: unknown): DeerFlowExecution => {
  return DeerFlowExecutionSchema.parse(data);
};

export const validateDeerFlowBlueprintIntegration = (data: unknown): DeerFlowBlueprintIntegration => {
  return DeerFlowBlueprintIntegrationSchema.parse(data);
};

// Render Validation Functions
export const validateRenderConfig = (data: unknown): RenderConfig => {
  return RenderConfigSchema.parse(data);
};

export const validateRenderService = (data: unknown): RenderService => {
  return RenderServiceSchema.parse(data);
};

export const validateRenderDeployment = (data: unknown): RenderDeployment => {
  return RenderDeploymentSchema.parse(data);
};

export const validateRenderWebhookPayload = (data: unknown): RenderWebhookPayload => {
  return RenderWebhookPayloadSchema.parse(data);
};

// Make.com Schemas
export const MakeConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  baseUrl: z.string().url('Base URL must be a valid URL').default('https://www.make.com/api/v2'),
  timeout: z.number().positive().default(30000),
  retryAttempts: z.number().int().min(0).max(5).default(3),
});

export type MakeConfig = z.infer<typeof MakeConfigSchema>;

export const MakeScenarioSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1, 'Scenario name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'draft', 'error']),
  flow: z.array(z.record(z.unknown())).optional(),
  connections: z.array(z.record(z.unknown())).optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type MakeScenario = z.infer<typeof MakeScenarioSchema>;

export const MakeExecutionSchema = z.object({
  id: z.number().positive(),
  scenario_id: z.number().positive(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  input_data: z.record(z.unknown()).optional(),
  output_data: z.record(z.unknown()).optional(),
  error_message: z.string().optional(),
  started_at: z.date().optional(),
  completed_at: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type MakeExecution = z.infer<typeof MakeExecutionSchema>;

export const MakeConnectionSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1, 'Connection name is required'),
  type: z.enum(['webhook', 'api', 'database', 'file', 'email', 'custom']),
  status: z.enum(['active', 'inactive', 'error']),
  config: z.record(z.unknown()),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type MakeConnection = z.infer<typeof MakeConnectionSchema>;

export const MakeBlueprintIntegrationSchema = z.object({
  id: z.string().min(1, 'Integration ID is required'),
  blueprint_id: z.string().min(1, 'Blueprint ID is required'),
  scenario_id: z.number().positive(),
  integration_type: z.enum(['validation', 'processing', 'monitoring', 'automation']),
  config: z.record(z.unknown()),
  status: z.enum(['active', 'inactive', 'error']),
  last_execution: z.date().optional(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type MakeBlueprintIntegration = z.infer<typeof MakeBlueprintIntegrationSchema>;

// Make.com Validation Functions
export const validateMakeConfig = (data: unknown): MakeConfig => {
  return MakeConfigSchema.parse(data);
};

export const validateMakeScenario = (data: unknown): MakeScenario => {
  return MakeScenarioSchema.parse(data);
};

export const validateMakeExecution = (data: unknown): MakeExecution => {
  return MakeExecutionSchema.parse(data);
};

export const validateMakeConnection = (data: unknown): MakeConnection => {
  return MakeConnectionSchema.parse(data);
};

export const validateMakeBlueprintIntegration = (data: unknown): MakeBlueprintIntegration => {
  return MakeBlueprintIntegrationSchema.parse(data);
};

// Google Workspace Schemas
export const GoogleWorkspaceConfigSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string().url(),
  refreshToken: z.string().optional(),
  scopes: z.array(z.string()).default([
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/gmail.readonly',
  ]),
});

export const GoogleDriveFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.string(),
  size: z.string().optional(),
  createdTime: z.string(),
  modifiedTime: z.string(),
  parents: z.array(z.string()).optional(),
  webViewLink: z.string().optional(),
  webContentLink: z.string().optional(),
});

export const GoogleDocsDocumentSchema = z.object({
  documentId: z.string(),
  title: z.string(),
  body: z.object({
    content: z.array(z.any()),
  }),
  revisionId: z.string(),
  suggestionsViewMode: z.string().optional(),
});

export const GoogleSheetsSpreadsheetSchema = z.object({
  spreadsheetId: z.string(),
  properties: z.object({
    title: z.string(),
    locale: z.string().optional(),
    timeZone: z.string().optional(),
  }),
  sheets: z.array(z.object({
    properties: z.object({
      sheetId: z.number(),
      title: z.string(),
      index: z.number(),
    }),
  })),
});

export const GoogleCalendarEventSchema = z.object({
  id: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  start: z.object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
    timeZone: z.string().optional(),
  }),
  end: z.object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
    timeZone: z.string().optional(),
  }),
  attendees: z.array(z.object({
    email: z.string(),
    displayName: z.string().optional(),
    responseStatus: z.string().optional(),
  })).optional(),
  location: z.string().optional(),
  status: z.string().optional(),
}); 