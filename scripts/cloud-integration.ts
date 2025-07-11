#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';
import * as admin from 'firebase-admin';
import { BigQuery } from '@google-cloud/bigquery';
import { BartonDoctrine } from '../src/schemas/barton-doctrine-enforcer';

interface DatabaseConfig {
  neon: {
    connectionString: string;
  };
  firebase: {
    projectId: string;
    privateKey: string;
    clientEmail: string;
  };
  bigquery: {
    projectId: string;
    keyFilename?: string;
  };
}

interface CloudService {
  name: 'deerflow' | 'mindpal' | 'neon' | 'firebase' | 'bigquery';
  type: 'ai-workflow' | 'database' | 'cloud-storage' | 'analytics';
  capabilities: string[];
}

interface DatabaseOperation {
  type: 'query' | 'insert' | 'update' | 'delete' | 'create-table' | 'drop-table';
  database: 'neon' | 'firebase' | 'bigquery';
  query?: string;
  data?: any;
  table?: string;
  collection?: string;
}

interface AIWorkflow {
  service: 'deerflow' | 'mindpal';
  type: 'automation' | 'integration' | 'workflow' | 'deployment';
  config: any;
}

class CloudIntegration {
  private config: DatabaseConfig;
  private neonClient: any;
  private firebaseApp: admin.app.App;
  private bigqueryClient: BigQuery;
  private services: CloudService[];

  constructor(config?: Partial<DatabaseConfig>) {
    this.config = {
      neon: {
        connectionString: process.env.NEON_DATABASE_URL || '',
      },
      firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
      },
      bigquery: {
        projectId: process.env.BIGQUERY_PROJECT_ID || '',
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      },
      ...config
    };

    this.services = [
      {
        name: 'deerflow',
        type: 'ai-workflow',
        capabilities: ['automation', 'integration', 'workflow', 'deployment']
      },
      {
        name: 'mindpal',
        type: 'ai-workflow',
        capabilities: ['automation', 'integration', 'workflow', 'deployment']
      },
      {
        name: 'neon',
        type: 'database',
        capabilities: ['postgresql', 'serverless', 'scaling', 'backups']
      },
      {
        name: 'firebase',
        type: 'cloud-storage',
        capabilities: ['realtime-database', 'firestore', 'authentication', 'hosting', 'functions']
      },
      {
        name: 'bigquery',
        type: 'analytics',
        capabilities: ['data-warehouse', 'sql', 'ml', 'streaming']
      }
    ];

    this.initializeConnections();
  }

  private initializeConnections(): void {
    // Initialize Neon
    if (this.config.neon.connectionString) {
      try {
        this.neonClient = neon(this.config.neon.connectionString);
        console.log('✅ Neon database connected');
      } catch (error) {
        console.warn('⚠️  Neon connection failed:', error);
      }
    }

    // Initialize Firebase
    if (this.config.firebase.projectId && this.config.firebase.privateKey) {
      try {
        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: this.config.firebase.projectId,
            privateKey: this.config.firebase.privateKey.replace(/\\n/g, '\n'),
            clientEmail: this.config.firebase.clientEmail,
          }),
        });
        console.log('✅ Firebase connected');
      } catch (error) {
        console.warn('⚠️  Firebase connection failed:', error);
      }
    }

    // Initialize BigQuery
    if (this.config.bigquery.projectId) {
      try {
        this.bigqueryClient = new BigQuery({
          projectId: this.config.bigquery.projectId,
          keyFilename: this.config.bigquery.keyFilename,
        });
        console.log('✅ BigQuery connected');
      } catch (error) {
        console.warn('⚠️  BigQuery connection failed:', error);
      }
    }
  }

  // Neon Database Operations
  async neonQuery(query: string, params?: any[], toolName = 'cloud-integration'): Promise<any> {
    if (!this.neonClient) {
      throw new Error('Neon database not connected');
    }
    // Doctrine enforcement for query params if present
    if (params && params.length && typeof params[0] === 'object') {
      params = [BartonDoctrine.formatFor(params[0], 'neon', toolName)];
    }
    try {
      const result = await this.neonClient(query, params);
      return result;
    } catch (error) {
      console.error('Neon query error:', error);
      throw error;
    }
  }

  async neonInsert(table: string, data: any, toolName = 'cloud-integration'): Promise<any> {
    // Enforce doctrine and format for Neon (STAMPED)
    const formatted = BartonDoctrine.formatFor(data, 'neon', toolName);
    const columns = Object.keys(formatted);
    const values = Object.values(formatted);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    return await this.neonQuery(query, values, toolName);
  }

  async neonUpdate(table: string, data: any, where: any, toolName = 'cloud-integration'): Promise<any> {
    // Enforce doctrine and format for Neon (STAMPED)
    const formatted = BartonDoctrine.formatFor(data, 'neon', toolName);
    const setClause = Object.keys(formatted).map((key, i) => `${key} = $${i + 1}`).join(', ');
    const whereClause = Object.keys(where).map((key, i) => `${key} = $${Object.keys(formatted).length + i + 1}`).join(' AND ');
    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE ${whereClause}
      RETURNING *
    `;
    const values = [...Object.values(formatted), ...Object.values(where)];
    return await this.neonQuery(query, values, toolName);
  }

  async neonDelete(table: string, where: any, toolName = 'cloud-integration'): Promise<any> {
    // No doctrine enforcement needed for delete, but could log
    const whereClause = Object.keys(where).map((key, i) => `${key} = $${i + 1}`).join(' AND ');
    const query = `
      DELETE FROM ${table}
      WHERE ${whereClause}
      RETURNING *
    `;
    return await this.neonQuery(query, Object.values(where), toolName);
  }

  async neonCreateTable(table: string, schema: any, toolName = 'cloud-integration'): Promise<any> {
    // No doctrine enforcement needed for DDL
    const columns = Object.entries(schema).map(([name, type]) => `${name} ${type}`).join(', ');
    const query = `
      CREATE TABLE IF NOT EXISTS ${table} (
        ${columns}
      )
    `;
    return await this.neonQuery(query, undefined, toolName);
  }

  // Firebase Operations
  async firebaseGet(collection: string, docId?: string, toolName = 'cloud-integration'): Promise<any> {
    if (!this.firebaseApp) {
      throw new Error('Firebase not connected');
    }
    const db = this.firebaseApp.firestore();
    if (docId) {
      const doc = await db.collection(collection).doc(docId).get();
      return doc.exists ? doc.data() : null;
    } else {
      const snapshot = await db.collection(collection).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  }

  async firebaseSet(collection: string, data: any, docId?: string, toolName = 'cloud-integration'): Promise<any> {
    if (!this.firebaseApp) {
      throw new Error('Firebase not connected');
    }
    // Enforce doctrine and format for Firebase (SPVPET)
    const formatted = BartonDoctrine.formatFor(data, 'firebase', toolName);
    const db = this.firebaseApp.firestore();
    if (docId) {
      await db.collection(collection).doc(docId).set(formatted);
      return { id: docId, ...formatted };
    } else {
      const docRef = await db.collection(collection).add(formatted);
      return { id: docRef.id, ...formatted };
    }
  }

  async firebaseUpdate(collection: string, docId: string, data: any, toolName = 'cloud-integration'): Promise<any> {
    if (!this.firebaseApp) {
      throw new Error('Firebase not connected');
    }
    // Enforce doctrine and format for Firebase (SPVPET)
    const formatted = BartonDoctrine.formatFor(data, 'firebase', toolName);
    const db = this.firebaseApp.firestore();
    await db.collection(collection).doc(docId).update(formatted);
    return { id: docId, ...formatted };
  }

  async firebaseDelete(collection: string, docId: string, toolName = 'cloud-integration'): Promise<void> {
    if (!this.firebaseApp) {
      throw new Error('Firebase not connected');
    }
    const db = this.firebaseApp.firestore();
    await db.collection(collection).doc(docId).delete();
  }

  // BigQuery Operations
  async bigqueryQuery(query: string, toolName = 'cloud-integration'): Promise<any> {
    if (!this.bigqueryClient) {
      throw new Error('BigQuery not connected');
    }
    try {
      const [rows] = await this.bigqueryClient.query(query);
      return rows;
    } catch (error) {
      console.error('BigQuery query error:', error);
      throw error;
    }
  }

  async bigqueryCreateTable(dataset: string, tableName: string, schema: any, toolName = 'cloud-integration'): Promise<any> {
    if (!this.bigqueryClient) {
      throw new Error('BigQuery not connected');
    }
    const datasetRef = this.bigqueryClient.dataset(dataset);
    const tableRef = datasetRef.table(tableName);
    const tableSchema = Object.entries(schema).map(([name, type]) => ({
      name,
      type: type as string,
    }));
    const [createdTable] = await tableRef.create({
      schema: tableSchema,
    });
    return createdTable;
  }

  async bigqueryInsert(dataset: string, tableName: string, data: any[], toolName = 'cloud-integration'): Promise<any> {
    if (!this.bigqueryClient) {
      throw new Error('BigQuery not connected');
    }
    // Enforce doctrine and format for BigQuery (STACKED)
    const formatted = data.map(d => BartonDoctrine.formatFor(d, 'bigquery', toolName));
    const datasetRef = this.bigqueryClient.dataset(dataset);
    const tableRef = datasetRef.table(tableName);
    const [job] = await tableRef.insert(formatted);
    return job;
  }

  // AI Workflow Operations (Deerflow & Mindpal)
  async deerflowWorkflow(config: any): Promise<any> {
    // Deerflow integration would go here
    // This is a placeholder for the actual Deerflow API integration
    console.log('🦌 Deerflow workflow:', config);
    
    // Example workflow configuration
    const workflow = {
      name: config.name || 'default-workflow',
      steps: config.steps || [],
      triggers: config.triggers || [],
      status: 'created'
    };

    // Save workflow to database
    await this.firebaseSet('deerflow-workflows', workflow);
    
    return workflow;
  }

  async mindpalWorkflow(config: any): Promise<any> {
    // Mindpal integration would go here
    // This is a placeholder for the actual Mindpal API integration
    console.log('🧠 Mindpal workflow:', config);
    
    // Example workflow configuration
    const workflow = {
      name: config.name || 'default-workflow',
      type: config.type || 'automation',
      config: config.config || {},
      status: 'created'
    };

    // Save workflow to database
    await this.firebaseSet('mindpal-workflows', workflow);
    
    return workflow;
  }

  // Unified Database Operations
  async executeOperation(operation: DatabaseOperation): Promise<any> {
    switch (operation.database) {
      case 'neon':
        switch (operation.type) {
          case 'query':
            return await this.neonQuery(operation.query!, operation.data);
          case 'insert':
            return await this.neonInsert(operation.table!, operation.data);
          case 'update':
            return await this.neonUpdate(operation.table!, operation.data, operation.data);
          case 'delete':
            return await this.neonDelete(operation.table!, operation.data);
          case 'create-table':
            return await this.neonCreateTable(operation.table!, operation.data);
          default:
            throw new Error(`Unsupported Neon operation: ${operation.type}`);
        }
      
      case 'firebase':
        switch (operation.type) {
          case 'query':
            return await this.firebaseGet(operation.collection!);
          case 'insert':
            return await this.firebaseSet(operation.collection!, operation.data);
          case 'update':
            return await this.firebaseUpdate(operation.collection!, operation.data.id, operation.data);
          case 'delete':
            return await this.firebaseDelete(operation.collection!, operation.data.id);
          default:
            throw new Error(`Unsupported Firebase operation: ${operation.type}`);
        }
      
      case 'bigquery':
        switch (operation.type) {
          case 'query':
            return await this.bigqueryQuery(operation.query!);
          case 'insert':
            return await this.bigqueryInsert(operation.data.dataset, operation.data.table, operation.data.rows);
          case 'create-table':
            return await this.bigqueryCreateTable(operation.data.dataset, operation.data.table, operation.data.schema);
          default:
            throw new Error(`Unsupported BigQuery operation: ${operation.type}`);
        }
      
      default:
        throw new Error(`Unsupported database: ${operation.database}`);
    }
  }

  // AI Workflow Operations
  async executeAIWorkflow(workflow: AIWorkflow): Promise<any> {
    switch (workflow.service) {
      case 'deerflow':
        return await this.deerflowWorkflow(workflow.config);
      case 'mindpal':
        return await this.mindpalWorkflow(workflow.config);
      default:
        throw new Error(`Unsupported AI workflow service: ${workflow.service}`);
    }
  }

  // Utility Methods
  getAvailableServices(): CloudService[] {
    return this.services;
  }

  getServicesByType(type: string): CloudService[] {
    return this.services.filter(service => service.type === type);
  }

  async saveConfig(config: any, filename: string): Promise<void> {
    const outputDir = 'cloud-configs';
    if (!existsSync(outputDir)) {
      execSync(`mkdir ${outputDir}`);
    }

    const filepath = join(outputDir, filename);
    writeFileSync(filepath, JSON.stringify(config, null, 2));
    console.log(`✅ Config saved to: ${filepath}`);
  }

  async loadConfig(filename: string): Promise<any> {
    const filepath = join('cloud-configs', filename);
    if (!existsSync(filepath)) {
      throw new Error(`Config file not found: ${filepath}`);
    }
    return JSON.parse(readFileSync(filepath, 'utf-8'));
  }

  // Health Check
  async healthCheck(): Promise<any> {
    const status = {
      neon: false,
      firebase: false,
      bigquery: false,
      timestamp: new Date()
    };

    try {
      if (this.neonClient) {
        await this.neonQuery('SELECT 1');
        status.neon = true;
      }
    } catch (error) {
      console.warn('Neon health check failed:', error);
    }

    try {
      if (this.firebaseApp) {
        await this.firebaseGet('health-check');
        status.firebase = true;
      }
    } catch (error) {
      console.warn('Firebase health check failed:', error);
    }

    try {
      if (this.bigqueryClient) {
        await this.bigqueryQuery('SELECT 1');
        status.bigquery = true;
      }
    } catch (error) {
      console.warn('BigQuery health check failed:', error);
    }

    return status;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const cloud = new CloudIntegration();

  switch (command) {
    case 'health':
      try {
        const status = await cloud.healthCheck();
        console.log('🏥 Health Check Results:');
        console.log(JSON.stringify(status, null, 2));
      } catch (error) {
        console.error('❌ Health check failed:', error);
      }
      break;

    case 'neon':
      const neonCommand = args[1];
      const neonQuery = args[2];
      
      if (!neonCommand || !neonQuery) {
        console.error('❌ Please provide neon command and query');
        process.exit(1);
      }
      
      try {
        switch (neonCommand) {
          case 'query':
            const result = await cloud.neonQuery(neonQuery);
            console.log('📊 Query Result:', result);
            break;
          case 'insert':
            const table = args[3];
            const data = JSON.parse(args[4] || '{}');
            const insertResult = await cloud.neonInsert(table, data);
            console.log('✅ Insert Result:', insertResult);
            break;
          default:
            console.error('❌ Unsupported neon command:', neonCommand);
        }
      } catch (error) {
        console.error('❌ Neon operation failed:', error);
      }
      break;

    case 'firebase':
      const firebaseCommand = args[1];
      const collection = args[2];
      
      if (!firebaseCommand || !collection) {
        console.error('❌ Please provide firebase command and collection');
        process.exit(1);
      }
      
      try {
        switch (firebaseCommand) {
          case 'get':
            const docId = args[3];
            const getResult = await cloud.firebaseGet(collection, docId);
            console.log('📊 Get Result:', getResult);
            break;
          case 'set':
            const data = JSON.parse(args[3] || '{}');
            const docId2 = args[4];
            const setResult = await cloud.firebaseSet(collection, data, docId2);
            console.log('✅ Set Result:', setResult);
            break;
          default:
            console.error('❌ Unsupported firebase command:', firebaseCommand);
        }
      } catch (error) {
        console.error('❌ Firebase operation failed:', error);
      }
      break;

    case 'bigquery':
      const bigqueryCommand = args[1];
      const query = args[2];
      
      if (!bigqueryCommand || !query) {
        console.error('❌ Please provide bigquery command and query');
        process.exit(1);
      }
      
      try {
        switch (bigqueryCommand) {
          case 'query':
            const result = await cloud.bigqueryQuery(query);
            console.log('📊 Query Result:', result);
            break;
          default:
            console.error('❌ Unsupported bigquery command:', bigqueryCommand);
        }
      } catch (error) {
        console.error('❌ BigQuery operation failed:', error);
      }
      break;

    case 'deerflow':
      const deerflowConfig = args[1];
      
      if (!deerflowConfig) {
        console.error('❌ Please provide deerflow config');
        process.exit(1);
      }
      
      try {
        const config = JSON.parse(deerflowConfig);
        const result = await cloud.deerflowWorkflow(config);
        console.log('🦌 Deerflow Workflow Result:', result);
      } catch (error) {
        console.error('❌ Deerflow operation failed:', error);
      }
      break;

    case 'mindpal':
      const mindpalConfig = args[1];
      
      if (!mindpalConfig) {
        console.error('❌ Please provide mindpal config');
        process.exit(1);
      }
      
      try {
        const config = JSON.parse(mindpalConfig);
        const result = await cloud.mindpalWorkflow(config);
        console.log('🧠 Mindpal Workflow Result:', result);
      } catch (error) {
        console.error('❌ Mindpal operation failed:', error);
      }
      break;

    case 'services':
      const serviceType = args[1];
      
      if (serviceType) {
        const services = cloud.getServicesByType(serviceType);
        console.log(`📋 ${serviceType} Services:`);
        services.forEach(service => {
          console.log(`  - ${service.name} (${service.capabilities.join(', ')})`);
        });
      } else {
        console.log('📋 All Available Services:');
        cloud.getAvailableServices().forEach(service => {
          console.log(`  - ${service.name} (${service.type}) - ${service.capabilities.join(', ')}`);
        });
      }
      break;

    default:
      console.log(`
☁️ Cloud Integration

Usage:
  tsx scripts/cloud-integration.ts <command> [options]

Commands:
  health                                    - Check health of all services
  neon <command> <query> [table] [data]     - Neon database operations
  firebase <command> <collection> [data]    - Firebase operations
  bigquery <command> <query>                - BigQuery operations
  deerflow <config>                         - Deerflow workflow operations
  mindpal <config>                          - Mindpal workflow operations
  services [type]                           - List available services

Neon Commands:
  query <sql>                               - Execute SQL query
  insert <table> <json_data>                - Insert data

Firebase Commands:
  get <collection> [doc_id]                 - Get documents
  set <collection> <json_data> [doc_id]     - Set document

BigQuery Commands:
  query <sql>                               - Execute SQL query

Examples:
  tsx scripts/cloud-integration.ts health
  tsx scripts/cloud-integration.ts neon query "SELECT * FROM users"
  tsx scripts/cloud-integration.ts firebase get users
  tsx scripts/cloud-integration.ts bigquery query "SELECT * FROM dataset.table"
  tsx scripts/cloud-integration.ts deerflow '{"name": "test-workflow"}'
  tsx scripts/cloud-integration.ts mindpal '{"name": "test-workflow"}'
  tsx scripts/cloud-integration.ts services database

Environment Variables:
  NEON_DATABASE_URL - Neon database connection string
  FIREBASE_PROJECT_ID - Firebase project ID
  FIREBASE_PRIVATE_KEY - Firebase private key
  FIREBASE_CLIENT_EMAIL - Firebase client email
  BIGQUERY_PROJECT_ID - BigQuery project ID
  GOOGLE_APPLICATION_CREDENTIALS - Google service account key file
      `);
  }
}

// Replace CommonJS main check with ESM-compatible check
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url === process.argv[1]) {
  main().catch(console.error);
}

export { CloudIntegration, DatabaseConfig, CloudService, DatabaseOperation, AIWorkflow }; 