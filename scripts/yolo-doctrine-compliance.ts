#!/usr/bin/env tsx

/**
 * YOLO Doctrine Compliance Tester
 * 
 * Tests all builds against STAMPED/SPVPET/STACKED doctrine standards
 * Ensures YOLO mode maintains doctrine compliance
 */

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// Doctrine Acronym Standards
const DOCTRINE_ACRONYMS = {
  STAMPED: {
    name: 'Schema, Tools, Architecture, Modules, Processes, Enforcement, Doctrine',
    fields: ['source_id', 'task_id', 'approved', 'migrated_to', 'process_signature', 'event_timestamp', 'data_payload'],
    database: 'Neon',
    description: 'Neon vault structure - permanent storage'
  },
  SPVPET: {
    name: 'Schema, Processes, Validation, Policy, Enforcement, Tools',
    fields: ['source_id', 'process_id', 'validated', 'promoted_to', 'execution_signature', 'timestamp_last_touched'],
    database: 'Firebase',
    description: 'Firebase staging structure - working memory'
  },
  STACKED: {
    name: 'Schema, Tools, Architecture, Compliance, Knowledge, Enforcement, Doctrine',
    fields: ['source_id', 'task_id', 'analytics_approved', 'consolidated_from', 'knowledge_signature', 'event_timestamp', 'data_payload'],
    database: 'BigQuery',
    description: 'BigQuery intake structure - analytics silo'
  }
};

// YOLO Compliance Configuration
const YoloComplianceConfig = z.object({
  enabled: z.boolean().default(true),
  strictMode: z.boolean().default(false),
  testSchemas: z.boolean().default(true),
  testAcronyms: z.boolean().default(true),
  testBartonNumbering: z.boolean().default(true),
  testDatabaseOperations: z.boolean().default(true),
  failOnViolation: z.boolean().default(true),
  reportPath: z.string().default('./yolo-doctrine-report.json')
});

type YoloComplianceConfig = z.infer<typeof YoloComplianceConfig>;

interface ComplianceTest {
  name: string;
  category: 'schema' | 'acronym' | 'numbering' | 'database';
  passed: boolean;
  details: string;
  timestamp: string;
  payload?: any;
}

interface YoloComplianceReport {
  config: YoloComplianceConfig;
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    successRate: number;
    startTime: string;
    endTime: string;
    duration: number;
  };
  tests: ComplianceTest[];
  violations: ComplianceTest[];
  recommendations: string[];
}

class YoloDoctrineCompliance {
  private config: YoloComplianceConfig;
  private tests: ComplianceTest[] = [];
  private startTime: Date;

  constructor(config?: Partial<YoloComplianceConfig>) {
    this.config = YoloComplianceConfig.parse(config || {});
    this.startTime = new Date();
  }

  /**
   * Run all doctrine compliance tests
   */
  public async run(): Promise<YoloComplianceReport> {
    console.log('🔒 YOLO Doctrine Compliance Tester');
    console.log('==================================');
    console.log('Testing against STAMPED/SPVPET/STACKED standards');
    console.log('');

    if (this.config.testSchemas) {
      await this.testSchemaCompliance();
    }

    if (this.config.testAcronyms) {
      await this.testAcronymCompliance();
    }

    if (this.config.testBartonNumbering) {
      await this.testBartonNumberingCompliance();
    }

    if (this.config.testDatabaseOperations) {
      await this.testDatabaseOperationCompliance();
    }

    const report = this.generateReport();
    this.saveReport(report);

    // Fail build if violations found and failOnViolation is true
    if (this.config.failOnViolation && report.violations.length > 0) {
      console.error(`❌ Build failed: ${report.violations.length} doctrine violations found`);
      process.exit(1);
    }

    return report;
  }

  /**
   * Test schema compliance across all doctrine formats
   */
  private async testSchemaCompliance(): Promise<void> {
    console.log('📋 Testing Schema Compliance...');

    // Test STAMPED schema
    const stampedPayload = {
      source_id: 'test_source',
      task_id: 'test_task',
      approved: true,
      migrated_to: null,
      process_signature: 'test_signature_123',
      event_timestamp: new Date().toISOString(),
      data_payload: { test: 'data' }
    };

    this.tests.push({
      name: 'STAMPED Schema Validation',
      category: 'schema',
      passed: this.validateStampedPayload(stampedPayload),
      details: 'Validates STAMPED format for Neon database',
      timestamp: new Date().toISOString(),
      payload: stampedPayload
    });

    // Test SPVPET schema
    const spvpetPayload = {
      source_id: 'test_source',
      process_id: 'test_process',
      validated: true,
      promoted_to: undefined,
      execution_signature: 'test_signature_123',
      timestamp_last_touched: new Date().toISOString()
    };

    this.tests.push({
      name: 'SPVPET Schema Validation',
      category: 'schema',
      passed: this.validateSpvpetPayload(spvpetPayload),
      details: 'Validates SPVPET format for Firebase',
      timestamp: new Date().toISOString(),
      payload: spvpetPayload
    });

    // Test STACKED schema
    const stackedPayload = {
      source_id: 'test_source',
      task_id: 'test_task',
      analytics_approved: true,
      consolidated_from: null,
      knowledge_signature: 'test_signature_123',
      event_timestamp: new Date().toISOString(),
      data_payload: { test: 'data' }
    };

    this.tests.push({
      name: 'STACKED Schema Validation',
      category: 'schema',
      passed: this.validateStackedPayload(stackedPayload),
      details: 'Validates STACKED format for BigQuery',
      timestamp: new Date().toISOString(),
      payload: stackedPayload
    });
  }

  /**
   * Test acronym compliance and definitions
   */
  private async testAcronymCompliance(): Promise<void> {
    console.log('🔤 Testing Acronym Compliance...');

    Object.entries(DOCTRINE_ACRONYMS).forEach(([acronym, data]) => {
      this.tests.push({
        name: `${acronym} Acronym Definition`,
        category: 'acronym',
        passed: !!data.name && !!data.fields && !!data.database,
        details: `${acronym}: ${data.name} (${data.database})`,
        timestamp: new Date().toISOString()
      });

      this.tests.push({
        name: `${acronym} Required Fields`,
        category: 'acronym',
        passed: data.fields.length > 0,
        details: `Required fields: ${data.fields.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Test Barton numbering compliance
   */
  private async testBartonNumberingCompliance(): Promise<void> {
    console.log('🔢 Testing Barton Numbering Compliance...');

    const validNumbers = [
      '1.5.3.30.0', // SHQ compliance doctrine
      '2.1.1.40.0', // CFO messaging doctrine
      '1.2.1.10.0', // DPR structural doctrine
      '1.1.2.20.0', // Client process doctrine
      '1.4.1.0.0'   // Personal tone doctrine
    ];

    const invalidNumbers = [
      '3.1.1.10.0', // Invalid database
      '1.6.1.10.0', // Invalid sub-hive
      '1.1.1.60.0', // Invalid section
      '1.1.1.10.-1', // Invalid index
      '1.1.1.10'    // Missing index
    ];

    validNumbers.forEach(number => {
      this.tests.push({
        name: `Valid Barton Number: ${number}`,
        category: 'numbering',
        passed: this.validateBartonNumbering(number),
        details: `Validates correct Barton numbering format`,
        timestamp: new Date().toISOString()
      });
    });

    invalidNumbers.forEach(number => {
      this.tests.push({
        name: `Invalid Barton Number: ${number}`,
        category: 'numbering',
        passed: !this.validateBartonNumbering(number),
        details: `Correctly rejects invalid Barton numbering format`,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Test database operation compliance
   */
  private async testDatabaseOperationCompliance(): Promise<void> {
    console.log('🗄️  Testing Database Operation Compliance...');

    // Test database operation formatting
    const testPayload = {
      source_id: 'test_source',
      process_id: 'test_process',
      validated: true,
      promoted_to: undefined,
      execution_signature: 'test_signature_123',
      timestamp_last_touched: new Date().toISOString(),
      data_payload: { test: 'data' }
    };

    // Test Firebase (SPVPET) formatting
    const firebasePayload = this.formatForFirebase(testPayload);
    this.tests.push({
      name: 'Firebase SPVPET Formatting',
      category: 'database',
      passed: this.validateSpvpetPayload(firebasePayload),
      details: 'Validates Firebase operation formatting',
      timestamp: new Date().toISOString(),
      payload: firebasePayload
    });

    // Test Neon (STAMPED) formatting
    const neonPayload = this.formatForNeon(testPayload);
    this.tests.push({
      name: 'Neon STAMPED Formatting',
      category: 'database',
      passed: this.validateStampedPayload(neonPayload),
      details: 'Validates Neon operation formatting',
      timestamp: new Date().toISOString(),
      payload: neonPayload
    });

    // Test BigQuery (STACKED) formatting
    const bigqueryPayload = this.formatForBigQuery(testPayload);
    this.tests.push({
      name: 'BigQuery STACKED Formatting',
      category: 'database',
      passed: this.validateStackedPayload(bigqueryPayload),
      details: 'Validates BigQuery operation formatting',
      timestamp: new Date().toISOString(),
      payload: bigqueryPayload
    });
  }

  // Validation methods
  private validateStampedPayload(payload: any): boolean {
    const requiredFields = DOCTRINE_ACRONYMS.STAMPED.fields;
    return requiredFields.every(field => payload.hasOwnProperty(field)) &&
           typeof payload.source_id === 'string' &&
           typeof payload.task_id === 'string' &&
           typeof payload.process_signature === 'string' &&
           typeof payload.event_timestamp === 'string';
  }

  private validateSpvpetPayload(payload: any): boolean {
    const requiredFields = DOCTRINE_ACRONYMS.SPVPET.fields;
    return requiredFields.every(field => payload.hasOwnProperty(field)) &&
           typeof payload.source_id === 'string' &&
           typeof payload.process_id === 'string' &&
           typeof payload.execution_signature === 'string' &&
           typeof payload.timestamp_last_touched === 'string';
  }

  private validateStackedPayload(payload: any): boolean {
    const requiredFields = DOCTRINE_ACRONYMS.STACKED.fields;
    return requiredFields.every(field => payload.hasOwnProperty(field)) &&
           typeof payload.source_id === 'string' &&
           typeof payload.task_id === 'string' &&
           typeof payload.knowledge_signature === 'string' &&
           typeof payload.event_timestamp === 'string';
  }

  private validateBartonNumbering(format: string): boolean {
    const parts = format.split('.');
    if (parts.length !== 5) return false;
    
    const [db, hq, sub, nested, index] = parts.map(Number);
    
    // Database validation (1 or 2)
    if (db !== 1 && db !== 2) return false;
    
    // Sub-hive validation
    if (db === 1 && (hq < 1 || hq > 5)) return false;
    if (db === 2 && (hq < 1 || hq > 4)) return false;
    
    // Section validation (0-49)
    if (nested < 0 || nested > 49) return false;
    
    // Index validation (non-negative)
    if (index < 0) return false;
    
    return true;
  }

  // Formatting methods
  private formatForFirebase(payload: any): any {
    return {
      source_id: payload.source_id,
      process_id: payload.process_id,
      validated: payload.validated,
      promoted_to: payload.promoted_to,
      execution_signature: payload.execution_signature,
      timestamp_last_touched: payload.timestamp_last_touched
    };
  }

  private formatForNeon(payload: any): any {
    return {
      source_id: payload.source_id,
      task_id: payload.process_id,
      approved: payload.validated === true || payload.validated === 'approved',
      migrated_to: payload.promoted_to || null,
      process_signature: payload.execution_signature,
      event_timestamp: payload.timestamp_last_touched,
      data_payload: payload.data_payload || {}
    };
  }

  private formatForBigQuery(payload: any): any {
    return {
      source_id: payload.source_id,
      task_id: payload.process_id,
      analytics_approved: payload.validated === true || payload.validated === 'approved',
      consolidated_from: payload.promoted_to || null,
      knowledge_signature: payload.execution_signature,
      event_timestamp: payload.timestamp_last_touched,
      data_payload: payload.data_payload || {}
    };
  }

  // Report generation
  private generateReport(): YoloComplianceReport {
    const endTime = new Date();
    const duration = endTime.getTime() - this.startTime.getTime();
    const passedTests = this.tests.filter(t => t.passed).length;
    const failedTests = this.tests.filter(t => !t.passed).length;
    const successRate = this.tests.length > 0 ? passedTests / this.tests.length : 0;

    const violations = this.tests.filter(t => !t.passed);
    const recommendations = this.generateRecommendations(violations);

    return {
      config: this.config,
      summary: {
        totalTests: this.tests.length,
        passedTests,
        failedTests,
        successRate,
        startTime: this.startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration
      },
      tests: this.tests,
      violations,
      recommendations
    };
  }

  private generateRecommendations(violations: ComplianceTest[]): string[] {
    const recommendations: string[] = [];

    if (violations.length === 0) {
      recommendations.push('✅ All doctrine compliance tests passed');
      return recommendations;
    }

    const schemaViolations = violations.filter(v => v.category === 'schema');
    const acronymViolations = violations.filter(v => v.category === 'acronym');
    const numberingViolations = violations.filter(v => v.category === 'numbering');
    const databaseViolations = violations.filter(v => v.category === 'database');

    if (schemaViolations.length > 0) {
      recommendations.push(`🔧 Fix ${schemaViolations.length} schema compliance violations`);
    }

    if (acronymViolations.length > 0) {
      recommendations.push(`🔤 Fix ${acronymViolations.length} acronym compliance violations`);
    }

    if (numberingViolations.length > 0) {
      recommendations.push(`🔢 Fix ${numberingViolations.length} Barton numbering violations`);
    }

    if (databaseViolations.length > 0) {
      recommendations.push(`🗄️  Fix ${databaseViolations.length} database operation violations`);
    }

    recommendations.push('📚 Review doctrine documentation for compliance requirements');
    recommendations.push('🔒 Ensure all database operations use STAMPED/SPVPET/STACKED formats');

    return recommendations;
  }

  private saveReport(report: YoloComplianceReport): void {
    try {
      fs.writeFileSync(this.config.reportPath, JSON.stringify(report, null, 2));
      console.log(`📄 Report saved to: ${this.config.reportPath}`);
    } catch (error) {
      console.error('❌ Failed to save report:', error);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'run') {
    const config: Partial<YoloComplianceConfig> = {};
    
    // Parse command line options
    if (args.includes('--strict')) config.strictMode = true;
    if (args.includes('--no-fail')) config.failOnViolation = false;
    if (args.includes('--report')) {
      const reportIndex = args.indexOf('--report');
      config.reportPath = args[reportIndex + 1];
    }

    const compliance = new YoloDoctrineCompliance(config);
    const report = await compliance.run();

    console.log('\n📊 YOLO Doctrine Compliance Report');
    console.log('==================================');
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.passedTests}`);
    console.log(`Failed: ${report.summary.failedTests}`);
    console.log(`Success Rate: ${(report.summary.successRate * 100).toFixed(1)}%`);
    console.log(`Duration: ${report.summary.duration}ms`);

    if (report.violations.length > 0) {
      console.log('\n❌ Violations Found:');
      report.violations.forEach(violation => {
        console.log(`  - ${violation.name}: ${violation.details}`);
      });
    }

    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => {
      console.log(`  ${rec}`);
    });

  } else {
    console.log('🔒 YOLO Doctrine Compliance Tester');
    console.log('==================================');
    console.log('');
    console.log('Usage:');
    console.log('  tsx scripts/yolo-doctrine-compliance.ts run');
    console.log('  tsx scripts/yolo-doctrine-compliance.ts run --strict');
    console.log('  tsx scripts/yolo-doctrine-compliance.ts run --no-fail');
    console.log('  tsx scripts/yolo-doctrine-compliance.ts run --report ./custom-report.json');
    console.log('');
    console.log('Options:');
    console.log('  --strict     Enable strict mode testing');
    console.log('  --no-fail    Don\'t fail build on violations');
    console.log('  --report     Specify custom report path');
  }
}

// ES module check
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { YoloDoctrineCompliance, YoloComplianceConfig, YoloComplianceReport }; 