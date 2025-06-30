import { Pool, PoolClient } from 'pg';
import * as dotenv from 'dotenv';
import { validateBlueprintForNeon, NeonBlueprint } from '../src/schemas/blueprint-schemas';
import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';

dotenv.config();

interface NeonConfig {
  connectionString: string;
  host: string;
  database: string;
  username: string;
  password: string;
}

interface SyncOptions {
  table: string;
  data: NeonBlueprint[];
  upsert?: boolean;
  conflictColumns?: string[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const doctrine = START_WITH_BARTON_DOCTRINE('neon_sync');

export class NeonSync {
  private pool: Pool;
  private config: NeonConfig;

  constructor() {
    this.config = {
      connectionString: process.env.NEON_DATABASE_URL || '',
      host: process.env.NEON_HOST || '',
      database: process.env.NEON_DATABASE || '',
      username: process.env.NEON_USERNAME || '',
      password: process.env.NEON_PASSWORD || '',
    };

    if (!this.config.connectionString && (!this.config.host || !this.config.database || !this.config.username || !this.config.password)) {
      throw new Error('Neon database configuration missing. Please check environment variables.');
    }

    this.pool = new Pool({
      connectionString: this.config.connectionString || undefined,
      host: this.config.host || undefined,
      database: this.config.database || undefined,
      user: this.config.username || undefined,
      password: this.config.password || undefined,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async syncData(options: SyncOptions): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Validate data before syncing
      const validatedData: NeonBlueprint[] = [];
      const validationErrors: string[] = [];

      for (let i = 0; i < options.data.length; i++) {
        try {
          const validatedRecord = validateBlueprintForNeon(options.data[i]);
          validatedData.push(validatedRecord);
        } catch (error) {
          validationErrors.push(`Record ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Log validation errors if any
      if (validationErrors.length > 0) {
        console.warn('Validation errors found:');
        validationErrors.forEach(error => console.warn(`  - ${error}`));
      }

      // Only sync validated data
      if (validatedData.length === 0) {
        throw new Error('No valid data to sync');
      }

      for (const record of validatedData) {
        if (options.upsert && options.conflictColumns) {
          await this.upsertRecord(client, options.table, record, options.conflictColumns);
        } else {
          await this.insertRecord(client, options.table, record);
        }
      }

      await client.query('COMMIT');
      console.log(`Data synced successfully to ${options.table}`);
      console.log(`Synced ${validatedData.length} valid records, skipped ${validationErrors.length} invalid records`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error syncing data to Neon:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  private async insertRecord(client: PoolClient, table: string, record: NeonBlueprint): Promise<void> {
    const columns = Object.keys(record);
    const values = Object.values(record);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    await client.query(query, values);
  }

  private async upsertRecord(client: PoolClient, table: string, record: NeonBlueprint, conflictColumns: string[]): Promise<void> {
    const columns = Object.keys(record);
    const values = Object.values(record);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    
    const updateColumns = columns.filter(col => !conflictColumns.includes(col));
    const updateSet = updateColumns.map((col, index) => `${col} = $${values.length + index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${table} (${columns.join(', ')}) 
      VALUES (${placeholders})
      ON CONFLICT (${conflictColumns.join(', ')}) 
      DO UPDATE SET ${updateSet}
    `;
    
    const updateValues = updateColumns.map(col => (record as Record<string, unknown>)[col]);
    await client.query(query, [...values, ...updateValues]);
  }

  async queryData(query: string, params?: unknown[]): Promise<NeonBlueprint[]> {
    const client = await this.pool.connect();
    
    try {
      const result = await client.query(query, params);
      return result.rows as NeonBlueprint[];
    } catch (error) {
      console.error('Error querying Neon database:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async createTable(tableName: string, schema: string): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query(schema);
      console.log(`Table ${tableName} created successfully`);
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Example usage
if (require.main === module) {
  const neon = new NeonSync();
  
  // Example data sync
  const sampleData: NeonBlueprint[] = [
    { 
      id: 'bp-001',
      name: 'Test Blueprint 1', 
      status: 'active', 
      version: '1.0.0',
      author: 'Test User',
      timestamp: new Date().toISOString(),
      created_at: new Date(),
      description: 'Test blueprint for Neon validation'
    },
    { 
      id: 'bp-002',
      name: 'Test Blueprint 2', 
      status: 'inactive', 
      version: '2.0.0',
      author: 'Test User',
      timestamp: new Date().toISOString(),
      created_at: new Date(),
      description: 'Another test blueprint'
    },
  ];

  neon.syncData({
    table: 'blueprints',
    data: sampleData,
    upsert: true,
    conflictColumns: ['id'],
  }).catch(console.error);
}