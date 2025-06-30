import { z } from 'zod';
import { BartonDoctrineFormatter, BartonDoctrinePayload, BartonDoctrineBaseSchema } from './barton-doctrine-formatter';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Barton Doctrine Enforcer
 * 
 * CRITICAL SYSTEM COMPONENT
 * Ensures ALL payloads across ALL tools comply with SPVPET/STAMPED/STACKED schema
 * This is the backbone of the entire system - NO EXCEPTIONS
 */

export class BartonDoctrineEnforcer {
  private static instance: BartonDoctrineEnforcer;
  private violations: Array<{ timestamp: string; tool: string; error: string; payload?: unknown }> = [];
  private enforcementEnabled = true;
  private strictMode = true; // Throw errors on violations vs just log
  
  private constructor() {
    this.setupGlobalEnforcement();
  }

  public static getInstance(): BartonDoctrineEnforcer {
    if (!BartonDoctrineEnforcer.instance) {
      BartonDoctrineEnforcer.instance = new BartonDoctrineEnforcer();
    }
    return BartonDoctrineEnforcer.instance;
  }

  /**
   * CRITICAL: Validate any payload before it touches the database
   */
  public validatePayload(
    payload: unknown, 
    toolName: string, 
    operation: string = 'unknown'
  ): BartonDoctrinePayload {
    if (!this.enforcementEnabled) {
      console.warn('⚠️  Barton Doctrine enforcement is DISABLED - this is dangerous!');
      return payload as BartonDoctrinePayload;
    }

    try {
      // Attempt to validate against base schema
      const validatedPayload = BartonDoctrineBaseSchema.parse(payload);
      
      // Log successful validation
      this.logValidation(toolName, operation, 'SUCCESS', validatedPayload);
      
      return validatedPayload;
    } catch (error) {
      const violation = {
        timestamp: new Date().toISOString(),
        tool: toolName,
        operation,
        error: error instanceof Error ? error.message : 'Unknown validation error',
        payload: this.sanitizePayload(payload)
      };

      this.violations.push(violation);
      this.logViolation(violation);
      
      if (this.strictMode) {
        throw new BartonDoctrineViolationError(
          `BARTON DOCTRINE VIOLATION in ${toolName}.${operation}: ${violation.error}`,
          violation
        );
      }

      // In non-strict mode, attempt to fix the payload
      return this.attemptPayloadRepair(payload, toolName);
    }
  }

  /**
   * Intercept and validate all database operations
   */
  public interceptDatabaseOperation(
    operation: 'firebase' | 'neon' | 'bigquery',
    payload: unknown,
    toolName: string
  ): Record<string, unknown> {
    const validatedPayload = this.validatePayload(payload, toolName, `${operation}_operation`);
    
    // Format for the specific database
    const formattedPayload = BartonDoctrineFormatter.formatForDatabase(validatedPayload, operation);
    
    // Log the successful formatting
    console.log(`✅ ${toolName} payload formatted for ${operation.toUpperCase()} (${operation === 'firebase' ? 'SPVPET' : operation === 'neon' ? 'STAMPED' : 'STACKED'})`);
    
    return formattedPayload;
  }

  private setupGlobalEnforcement(): void {
    // Setup process exit handler to save violations
    process.on('exit', () => {
      this.saveViolationReport();
    });

    process.on('SIGINT', () => {
      this.saveViolationReport();
      process.exit(0);
    });
  }

  private logValidation(toolName: string, operation: string, status: string, payload: BartonDoctrinePayload): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      tool: toolName,
      operation,
      status,
      schema_compliance: 'BARTON_DOCTRINE',
      execution_signature: payload.execution_signature
    };

    this.saveValidationLog(logEntry);
  }

  private logViolation(violation: any): void {
    console.error(`🚨 BARTON DOCTRINE VIOLATION DETECTED:`);
    console.error(`   Tool: ${violation.tool}`);
    console.error(`   Time: ${violation.timestamp}`);
    console.error(`   Error: ${violation.error}`);
    console.error(`   This is a CRITICAL system violation!`);
  }

  private saveValidationLog(entry: any): void {
    try {
      const logDir = path.join(process.cwd(), 'barton-doctrine-logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const logFile = path.join(logDir, 'validation-success.log');
      const logLine = JSON.stringify(entry) + '\n';
      
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('Failed to save validation log:', error);
    }
  }

  private saveViolationReport(): void {
    if (this.violations.length === 0) return;

    try {
      const logDir = path.join(process.cwd(), 'barton-doctrine-logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFile = path.join(logDir, `violations-${timestamp}.json`);
      
      const report = {
        timestamp: new Date().toISOString(),
        total_violations: this.violations.length,
        enforcement_enabled: this.enforcementEnabled,
        strict_mode: this.strictMode,
        violations: this.violations
      };

      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      console.error(`🚨 Violation report saved: ${reportFile}`);
    } catch (error) {
      console.error('CRITICAL: Failed to save violation report:', error);
    }
  }

  private attemptPayloadRepair(payload: unknown, toolName: string): BartonDoctrinePayload {
    console.warn(`🔧 Attempting to repair malformed payload from ${toolName}`);
    
    try {
      const data = payload as Record<string, unknown>;
      
      const repairedPayload = BartonDoctrineFormatter.createBasePayload(
        data.source_id as string || toolName,
        data.process_id as string || `repair_${Date.now()}`,
        data.data_payload as Record<string, unknown> || data,
        {
          agent_id: toolName,
          blueprint_id: 'emergency_repair',
          schema_version: '1.0.0'
        }
      );

      console.warn(`✅ Payload repaired for ${toolName} - but this should be fixed at source!`);
      return repairedPayload;
    } catch (repairError) {
      throw new BartonDoctrineViolationError(
        `CRITICAL: Cannot repair payload from ${toolName}. Manual intervention required.`,
        { payload, repairError }
      );
    }
  }

  private sanitizePayload(payload: unknown): unknown {
    if (typeof payload !== 'object' || payload === null) {
      return payload;
    }

    const sanitized = { ...payload as Record<string, unknown> };
    
    const sensitiveFields = ['api_key', 'password', 'token', 'secret', 'auth'];
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  public setEnforcementEnabled(enabled: boolean): void {
    this.enforcementEnabled = enabled;
    console.log(`🔒 Barton Doctrine enforcement ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  public setStrictMode(strict: boolean): void {
    this.strictMode = strict;
    console.log(`⚡ Barton Doctrine strict mode ${strict ? 'ENABLED' : 'DISABLED'}`);
  }

  public getViolationSummary(): { total: number; byTool: Record<string, number>; recent: any[] } {
    const byTool: Record<string, number> = {};
    this.violations.forEach(v => {
      byTool[v.tool] = (byTool[v.tool] || 0) + 1;
    });

    return {
      total: this.violations.length,
      byTool,
      recent: this.violations.slice(-10)
    };
  }

  /**
   * Clear all violations (for testing purposes)
   */
  public clearViolations(): void {
    this.violations = [];
  }
}

export class BartonDoctrineViolationError extends Error {
  public readonly violation: any;

  constructor(message: string, violation: any) {
    super(message);
    this.name = 'BartonDoctrineViolationError';
    this.violation = violation;
  }
}

// Global enforcement instance
export const GlobalBartonDoctrineEnforcer = BartonDoctrineEnforcer.getInstance();

// Convenience functions
export const BartonDoctrine = {
  validate: (payload: unknown, toolName: string, operation?: string): BartonDoctrinePayload => {
    return GlobalBartonDoctrineEnforcer.validatePayload(payload, toolName, operation);
  },

  formatFor: (payload: unknown, database: 'firebase' | 'neon' | 'bigquery', toolName: string): Record<string, unknown> => {
    return GlobalBartonDoctrineEnforcer.interceptDatabaseOperation(database, payload, toolName);
  },

  setEnabled: (enabled: boolean): void => {
    GlobalBartonDoctrineEnforcer.setEnforcementEnabled(enabled);
  },

  setStrict: (strict: boolean): void => {
    GlobalBartonDoctrineEnforcer.setStrictMode(strict);
  },

  getViolations: () => {
    return GlobalBartonDoctrineEnforcer.getViolationSummary();
  }
};
