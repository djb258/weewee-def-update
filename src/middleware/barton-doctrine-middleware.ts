import { BartonDoctrine } from '../schemas/barton-doctrine-enforcer';
import { BartonDoctrineFormatter } from '../schemas/barton-doctrine-formatter';

/**
 * Barton Doctrine Middleware
 * 
 * Automatically enforces SPVPET/STAMPED/STACKED compliance
 * Intercepts all database operations to ensure schema compliance
 */

export class BartonDoctrineMiddleware {
  private static instance: BartonDoctrineMiddleware;
  private toolName: string;

  constructor(toolName: string) {
    this.toolName = toolName;
  }

  public static forTool(toolName: string): BartonDoctrineMiddleware {
    return new BartonDoctrineMiddleware(toolName);
  }

  /**
   * Validate and format payload for Firebase (SPVPET)
   */
  public validateForFirebase(payload: unknown): Record<string, unknown> {
    console.log(`🔒 [${this.toolName}] Enforcing SPVPET schema for Firebase...`);
    return BartonDoctrine.formatFor(payload, 'firebase', this.toolName);
  }

  /**
   * Validate and format payload for Neon (STAMPED)
   */
  public validateForNeon(payload: unknown): Record<string, unknown> {
    console.log(`🔒 [${this.toolName}] Enforcing STAMPED schema for Neon...`);
    return BartonDoctrine.formatFor(payload, 'neon', this.toolName);
  }

  /**
   * Validate and format payload for BigQuery (STACKED)
   */
  public validateForBigQuery(payload: unknown): Record<string, unknown> {
    console.log(`🔒 [${this.toolName}] Enforcing STACKED schema for BigQuery...`);
    return BartonDoctrine.formatFor(payload, 'bigquery', this.toolName);
  }

  /**
   * Create a properly formatted base payload
   */
  public createPayload(
    sourceId: string,
    processId: string,
    dataPayload: Record<string, unknown>,
    metadata?: {
      agent_id?: string;
      blueprint_id?: string;
      schema_version?: string;
    }
  ) {
    console.log(`🔧 [${this.toolName}] Creating Barton Doctrine compliant payload...`);
    
    return BartonDoctrineFormatter.createBasePayload(
      sourceId,
      processId,
      dataPayload,
      {
        agent_id: metadata?.agent_id || this.toolName,
        blueprint_id: metadata?.blueprint_id || 'default',
        schema_version: metadata?.schema_version || '1.0.0'
      }
    );
  }

  /**
   * Validate any payload structure
   */
  public validate(payload: unknown, operation?: string) {
    console.log(`✅ [${this.toolName}] Validating payload compliance...`);
    return BartonDoctrine.validate(payload, this.toolName, operation);
  }
}

/**
 * Convenience function for quick tool setup
 */
export function withBartonDoctrine(toolName: string) {
  return BartonDoctrineMiddleware.forTool(toolName);
}

/**
 * Database operation wrappers with automatic enforcement
 */
export const DatabaseOperations = {
  /**
   * Firebase operation with automatic SPVPET enforcement
   */
  firebase: (toolName: string) => ({
    save: (payload: unknown) => {
      const middleware = withBartonDoctrine(toolName);
      return middleware.validateForFirebase(payload);
    },
    
    saveToCollection: (collection: string, payload: unknown) => {
      const middleware = withBartonDoctrine(toolName);
      const validatedPayload = middleware.validateForFirebase(payload);
      
      console.log(`📤 [${toolName}] Saving to Firebase collection: ${collection}`);
      // Actual Firebase save would happen here
      return validatedPayload;
    }
  }),

  /**
   * Neon operation with automatic STAMPED enforcement
   */
  neon: (toolName: string) => ({
    insert: (table: string, payload: unknown) => {
      const middleware = withBartonDoctrine(toolName);
      const validatedPayload = middleware.validateForNeon(payload);
      
      console.log(`📤 [${toolName}] Inserting to Neon table: ${table}`);
      // Actual Neon insert would happen here
      return validatedPayload;
    },
    
    update: (table: string, payload: unknown, whereClause: string) => {
      const middleware = withBartonDoctrine(toolName);
      const validatedPayload = middleware.validateForNeon(payload);
      
      console.log(`📤 [${toolName}] Updating Neon table: ${table} WHERE ${whereClause}`);
      // Actual Neon update would happen here
      return validatedPayload;
    }
  }),

  /**
   * BigQuery operation with automatic STACKED enforcement
   */
  bigquery: (toolName: string) => ({
    insert: (dataset: string, table: string, payload: unknown) => {
      const middleware = withBartonDoctrine(toolName);
      const validatedPayload = middleware.validateForBigQuery(payload);
      
      console.log(`📤 [${toolName}] Inserting to BigQuery: ${dataset}.${table}`);
      // Actual BigQuery insert would happen here
      return validatedPayload;
    },
    
    stream: (dataset: string, table: string, payloads: unknown[]) => {
      const middleware = withBartonDoctrine(toolName);
      const validatedPayloads = payloads.map(payload => 
        middleware.validateForBigQuery(payload)
      );
      
      console.log(`📤 [${toolName}] Streaming ${payloads.length} records to BigQuery: ${dataset}.${table}`);
      // Actual BigQuery streaming would happen here
      return validatedPayloads;
    }
  })
}; 