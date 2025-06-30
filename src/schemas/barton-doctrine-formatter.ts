import { z } from 'zod';
import { createHash } from 'crypto';

/**
 * Barton Doctrine Payload Formatter
 * 
 * Ensures structural consistency across:
 * - SPVPET (Firebase working memory)
 * - STAMPED (Neon permanent vault) 
 * - STACKED (BigQuery analytics silo)
 * 
 * All three are structural aliases and must be enforced identically.
 */

// Base schema that all formats must conform to
export const BartonDoctrineBaseSchema = z.object({
  source_id: z.string().min(1, 'Source ID is required'),
  process_id: z.string().min(1, 'Process ID is required'),
  validated: z.boolean().or(z.enum(['pending', 'approved', 'rejected'])),
  promoted_to: z.string().optional(),
  execution_signature: z.string().min(1, 'Execution signature is required'),
  timestamp_last_touched: z.date().or(z.string().datetime()),
  data_payload: z.record(z.unknown()).optional()
});

export type BartonDoctrinePayload = z.infer<typeof BartonDoctrineBaseSchema>;

export interface PayloadFormatOptions {
  agent_id?: string;
  blueprint_id?: string;
  schema_version?: string;
  source_system?: string;
  target_database?: 'firebase' | 'neon' | 'bigquery';
}

export class BartonDoctrineFormatter {
  
  /**
   * Generate execution signature hash
   */
  static generateExecutionSignature(
    agent_id: string,
    blueprint_id: string,
    schema_version: string = '1.0.0'
  ): string {
    const payload = `${agent_id}:${blueprint_id}:${schema_version}:${Date.now()}`;
    return createHash('sha256').update(payload).digest('hex').substring(0, 32);
  }

  /**
   * Create base payload structure
   */
  static createBasePayload(
    source_id: string,
    process_id: string,
    data: Record<string, unknown>,
    options: PayloadFormatOptions = {}
  ): BartonDoctrinePayload {
    const execution_signature = this.generateExecutionSignature(
      options.agent_id || 'system',
      options.blueprint_id || process_id,
      options.schema_version || '1.0.0'
    );

    return {
      source_id,
      process_id,
      validated: false,
      promoted_to: undefined,
      execution_signature,
      timestamp_last_touched: new Date(),
      data_payload: data
    };
  }

  /**
   * Format for SPVPET (Firebase working memory)
   */
  static toSPVPET(payload: BartonDoctrinePayload): Record<string, unknown> {
    const validated = BartonDoctrineBaseSchema.parse(payload);
    
    return {
      source_id: validated.source_id,
      process_id: validated.process_id,
      validated: validated.validated,
      promoted_to: validated.promoted_to || null,
      execution_signature: validated.execution_signature,
      timestamp_last_touched: validated.timestamp_last_touched instanceof Date 
        ? validated.timestamp_last_touched.toISOString()
        : validated.timestamp_last_touched,
      ...validated.data_payload
    };
  }

  /**
   * Format for STAMPED (Neon permanent vault)
   */
  static toSTAMPED(payload: BartonDoctrinePayload): Record<string, unknown> {
    const validated = BartonDoctrineBaseSchema.parse(payload);
    
    return {
      source_id: validated.source_id,
      task_id: validated.process_id, // T: Task/Process ID
      approved: validated.validated === true || validated.validated === 'approved', // A: Approved/Validated
      migrated_to: validated.promoted_to || null, // M: Migrated/Promoted To
      process_signature: validated.execution_signature, // P: Process Signature
      event_timestamp: validated.timestamp_last_touched instanceof Date 
        ? validated.timestamp_last_touched.toISOString()
        : validated.timestamp_last_touched, // E: Event Timestamp
      data_payload: validated.data_payload || {} // D: Data Payload
    };
  }

  /**
   * Format for STACKED (BigQuery analytics silo)
   */
  static toSTACKED(payload: BartonDoctrinePayload): Record<string, unknown> {
    const validated = BartonDoctrineBaseSchema.parse(payload);
    
    return {
      source_id: validated.source_id, // S: Source ID
      task_id: validated.process_id, // T: Task ID
      analytics_approved: validated.validated === true || validated.validated === 'approved', // A: Analytics Approved
      consolidated_from: validated.promoted_to || null, // C: Consolidated From
      knowledge_signature: validated.execution_signature, // K: Knowledge Signature
      event_timestamp: validated.timestamp_last_touched instanceof Date 
        ? validated.timestamp_last_touched.toISOString()
        : validated.timestamp_last_touched, // E: Event Timestamp
      data_payload: validated.data_payload || {} // D: Data Payload
    };
  }

  /**
   * Auto-format based on target database
   */
  static formatForDatabase(
    payload: BartonDoctrinePayload,
    target: 'firebase' | 'neon' | 'bigquery'
  ): Record<string, unknown> {
    switch (target) {
      case 'firebase':
        return this.toSPVPET(payload);
      case 'neon':
        return this.toSTAMPED(payload);
      case 'bigquery':
        return this.toSTACKED(payload);
      default:
        throw new Error(`Unsupported target database: ${target}`);
    }
  }

  /**
   * Validate payload against Barton Doctrine
   */
  static validate(payload: unknown): BartonDoctrinePayload {
    return BartonDoctrineBaseSchema.parse(payload);
  }

  /**
   * Convert from any format back to base payload
   */
  static fromAnyFormat(data: Record<string, unknown>): BartonDoctrinePayload {
    // Detect format and normalize
    let normalized: BartonDoctrinePayload;

    if ('task_id' in data && 'approved' in data) {
      // STAMPED format
      normalized = {
        source_id: data.source_id as string,
        process_id: data.task_id as string,
        validated: data.approved as boolean,
        promoted_to: data.migrated_to as string | undefined,
        execution_signature: data.process_signature as string,
        timestamp_last_touched: new Date(data.event_timestamp as string),
        data_payload: data.data_payload as Record<string, unknown>
      };
    } else if ('analytics_approved' in data && 'knowledge_signature' in data) {
      // STACKED format
      normalized = {
        source_id: data.source_id as string,
        process_id: data.task_id as string,
        validated: data.analytics_approved as boolean,
        promoted_to: data.consolidated_from as string | undefined,
        execution_signature: data.knowledge_signature as string,
        timestamp_last_touched: new Date(data.event_timestamp as string),
        data_payload: data.data_payload as Record<string, unknown>
      };
    } else {
      // Assume SPVPET format
      const { source_id, process_id, validated, promoted_to, execution_signature, timestamp_last_touched, ...data_payload } = data;
      normalized = {
        source_id: source_id as string,
        process_id: process_id as string,
        validated: validated as boolean,
        promoted_to: promoted_to as string | undefined,
        execution_signature: execution_signature as string,
        timestamp_last_touched: new Date(timestamp_last_touched as string),
        data_payload
      };
    }

    return this.validate(normalized);
  }

  /**
   * Create Firebase collection document
   */
  static createFirebaseDocument(
    collection: string,
    payload: BartonDoctrinePayload,
    ttl_seconds: number = 3600
  ): { collection: string; document: Record<string, unknown> } {
    const spvpet = this.toSPVPET(payload);
    
    return {
      collection,
      document: {
        ...spvpet,
        ttl: ttl_seconds,
        created_at: new Date().toISOString(),
        collection_type: 'working_memory'
      }
    };
  }

  /**
   * Create Neon SQL insert statement
   */
  static createNeonInsert(
    table: string,
    payload: BartonDoctrinePayload
  ): { sql: string; values: unknown[] } {
    const stamped = this.toSTAMPED(payload);
    
    const sql = `
      INSERT INTO ${table} (
        source_id, task_id, approved, migrated_to, 
        process_signature, event_timestamp, data_payload
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (source_id, task_id, process_signature) 
      DO UPDATE SET
        approved = EXCLUDED.approved,
        migrated_to = EXCLUDED.migrated_to,
        event_timestamp = EXCLUDED.event_timestamp,
        data_payload = EXCLUDED.data_payload,
        updated_at = NOW()
    `;
    
    const values = [
      stamped.source_id,
      stamped.task_id,
      stamped.approved,
      stamped.migrated_to,
      stamped.process_signature,
      stamped.event_timestamp,
      JSON.stringify(stamped.data_payload)
    ];
    
    return { sql, values };
  }

  /**
   * Create BigQuery insert object
   */
  static createBigQueryInsert(
    dataset: string,
    table: string,
    payload: BartonDoctrinePayload
  ): { dataset: string; table: string; rows: Record<string, unknown>[] } {
    const stacked = this.toSTACKED(payload);
    
    return {
      dataset,
      table,
      rows: [{
        insertId: `${stacked.source_id}-${stacked.task_id}-${Date.now()}`,
        json: stacked
      }]
    };
  }
}

// Export validation schemas for each format
export const SPVPETSchema = z.object({
  source_id: z.string(),
  process_id: z.string(),
  validated: z.boolean().or(z.enum(['pending', 'approved', 'rejected'])),
  promoted_to: z.string().nullable(),
  execution_signature: z.string(),
  timestamp_last_touched: z.string().datetime()
}).passthrough();

export const STAMPEDSchema = z.object({
  source_id: z.string(),
  task_id: z.string(),
  approved: z.boolean(),
  migrated_to: z.string().nullable(),
  process_signature: z.string(),
  event_timestamp: z.string().datetime(),
  data_payload: z.record(z.unknown())
});

export const STACKEDSchema = z.object({
  source_id: z.string(),
  task_id: z.string(),
  analytics_approved: z.boolean(),
  consolidated_from: z.string().nullable(),
  knowledge_signature: z.string(),
  event_timestamp: z.string().datetime(),
  data_payload: z.record(z.unknown())
}); 