import { BigQuery } from '@google-cloud/bigquery';
import * as dotenv from 'dotenv';
import { validateBlueprintForBigQuery, BigQueryBlueprint } from '../src/schemas/blueprint-schemas';
import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const doctrine = START_WITH_BARTON_DOCTRINE('bigquery_ingest'); // Barton Doctrine enforced (required for compliance)

interface BigQueryConfig {
  projectId: string;
  datasetId: string;
}

interface IngestOptions {
  tableId: string;
  data: BigQueryBlueprint[];
  schema?: object[];
  createDisposition?: string;
  writeDisposition?: string;
}

export class BigQueryIngest {
  private bigquery: BigQuery;
  private config: BigQueryConfig;

  constructor() {
    this.config = {
      projectId: process.env.BIGQUERY_PROJECT_ID || '',
      datasetId: process.env.BIGQUERY_DATASET_ID || '',
    };

    if (!this.config.projectId || !this.config.datasetId) {
      throw new Error('BIGQUERY_PROJECT_ID and BIGQUERY_DATASET_ID must be set in environment variables');
    }

    this.bigquery = new BigQuery({
      projectId: this.config.projectId,
    });
  }

  async ingestData(options: IngestOptions): Promise<void> {
    try {
      const dataset = this.bigquery.dataset(this.config.datasetId);
      const table = dataset.table(options.tableId);

      // Validate each record before ingestion
      const validatedData: BigQueryBlueprint[] = [];
      const validationErrors: string[] = [];

      for (let i = 0; i < options.data.length; i++) {
        try {
          const validatedRecord = validateBlueprintForBigQuery(options.data[i]);
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

      // Only ingest validated data
      if (validatedData.length > 0) {
        await table.insert(validatedData);
        console.log(`Data ingested successfully to ${this.config.projectId}.${this.config.datasetId}.${options.tableId}`);
        console.log(`Ingested ${validatedData.length} valid records, skipped ${validationErrors.length} invalid records`);
      } else {
        throw new Error('No valid data to ingest');
      }
    } catch (error) {
      console.error('Error ingesting data to BigQuery:', error);
      throw error;
    }
  }

  async createTable(tableId: string, schema: object[]): Promise<void> {
    try {
      const dataset = this.bigquery.dataset(this.config.datasetId);
      const table = dataset.table(tableId);

      await table.create({
        schema: schema,
      });

      console.log(`Table ${tableId} created successfully`);
    } catch (error) {
      console.error('Error creating table:', error);
      throw error;
    }
  }

  async queryData(query: string): Promise<BigQueryBlueprint[]> {
    try {
      const [rows] = await this.bigquery.query({ query });
      return rows as BigQueryBlueprint[];
    } catch (error) {
      console.error('Error querying BigQuery:', error);
      throw error;
    }
  }
}

// Example usage
if (require.main === module) {
  const ingest = new BigQueryIngest();
  
  // Example data ingestion
  const sampleData: BigQueryBlueprint[] = [
    { 
      id: 'bp-001',
      name: 'Test Blueprint 1',
      version: '1.0.0',
      status: 'active',
      author: 'Test User',
      timestamp: new Date().toISOString(),
      description: 'Test blueprint for validation'
    },
    { 
      id: 'bp-002',
      name: 'Test Blueprint 2',
      version: '2.0.0',
      status: 'inactive',
      author: 'Test User',
      timestamp: new Date().toISOString(),
      description: 'Another test blueprint'
    },
  ];

  ingest.ingestData({
    tableId: 'blueprints',
    data: sampleData,
  }).catch(console.error);
}