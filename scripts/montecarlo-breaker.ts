#!/usr/bin/env tsx

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// Doctrine Acronym Standards
const DOCTRINE_ACRONYMS = {
  STAMPED: {
    name: 'Schema, Tools, Architecture, Modules, Processes, Enforcement, Doctrine',
    fields: ['source_id', 'task_id', 'approved', 'migrated_to', 'process_signature', 'event_timestamp', 'data_payload'],
    database: 'Neon'
  },
  SPVPET: {
    name: 'Schema, Processes, Validation, Policy, Enforcement, Tools',
    fields: ['source_id', 'process_id', 'validated', 'promoted_to', 'execution_signature', 'timestamp_last_touched'],
    database: 'Firebase'
  },
  STACKED: {
    name: 'Schema, Tools, Architecture, Compliance, Knowledge, Enforcement, Doctrine',
    fields: ['source_id', 'task_id', 'analytics_approved', 'consolidated_from', 'knowledge_signature', 'event_timestamp', 'data_payload'],
    database: 'BigQuery'
  }
};

// Monte Carlo Breaker Configuration Schema
const BreakerConfigSchema = z.object({
  enabled: z.boolean().default(true),
  iterations: z.number().default(1000),
  concurrency: z.number().default(10),
  timeoutMs: z.number().default(5000),
  breakStrategies: z.array(z.enum([
    'random_input',
    'malformed_data',
    'concurrent_requests',
    'memory_pressure',
    'network_failure',
    'database_corruption',
    'file_system_errors',
    'api_rate_limiting',
    'invalid_schemas',
    'circular_references',
    'deep_nesting',
    'unicode_injection',
    'sql_injection',
    'xss_attempts',
    'buffer_overflow',
    'null_pointer',
    'undefined_access',
    'type_coercion',
    'async_race_conditions',
    'memory_leaks',
    'doctrine_stamped_compliance',
    'doctrine_spvpet_compliance',
    'doctrine_stacked_compliance',
    'doctrine_acronym_validation',
    'doctrine_barton_numbering'
  ])).default([
    'random_input',
    'malformed_data',
    'concurrent_requests',
    'invalid_schemas',
    'async_race_conditions',
    'doctrine_stamped_compliance',
    'doctrine_spvpet_compliance',
    'doctrine_stacked_compliance',
    'doctrine_acronym_validation'
  ]),
  targetEndpoints: z.array(z.string()).default(['/api/*']),
  successThreshold: z.number().default(0.95), // 95% success rate required
  reportPath: z.string().default('./montecarlo-report.json'),
  doctrineCompliance: z.boolean().default(true)
});

type BreakerConfig = z.infer<typeof BreakerConfigSchema>;

interface TestResult {
  iteration: number;
  strategy: string;
  success: boolean;
  error?: string;
  duration: number;
  timestamp: string;
  payload?: any;
  response?: any;
}

interface MonteCarloReport {
  config: BreakerConfig;
  summary: {
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    successRate: number;
    averageDuration: number;
    totalDuration: number;
    startTime: string;
    endTime: string;
  };
  failures: TestResult[];
  strategies: Record<string, { attempts: number; failures: number; successRate: number }>;
  recommendations: string[];
}

class MonteCarloBreaker {
  private config: BreakerConfig;
  private results: TestResult[] = [];
  private startTime: Date;

  constructor(config?: Partial<BreakerConfig>) {
    this.config = BreakerConfigSchema.parse(config || {});
    this.startTime = new Date();
  }

  // Random data generators
  private generateRandomString(length: number = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }

  private generateRandomNumber(min: number = -1000, max: number = 1000): number {
    return Math.random() * (max - min) + min;
  }

  private generateRandomBoolean(): boolean {
    return Math.random() > 0.5;
  }

  private generateRandomArray(length: number = 10): any[] {
    return Array.from({ length }, () => this.generateRandomValue());
  }

  private generateRandomObject(depth: number = 3): any {
    if (depth <= 0) return this.generateRandomValue();
    
    const obj: any = {};
    const keys = Math.floor(Math.random() * 10) + 1;
    
    for (let i = 0; i < keys; i++) {
      const key = this.generateRandomString(5);
      obj[key] = this.generateRandomValue(depth - 1);
    }
    
    return obj;
  }

  private generateRandomValue(depth: number = 3): any {
    const types = ['string', 'number', 'boolean', 'array', 'object', 'null', 'undefined'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    switch (type) {
      case 'string':
        return this.generateRandomString();
      case 'number':
        return this.generateRandomNumber();
      case 'boolean':
        return this.generateRandomBoolean();
      case 'array':
        return this.generateRandomArray();
      case 'object':
        return this.generateRandomObject(depth);
      case 'null':
        return null;
      case 'undefined':
        return undefined;
      default:
        return this.generateRandomString();
    }
  }

  // Break strategies
  private async executeRandomInputStrategy(): Promise<TestResult> {
    const startTime = Date.now();
    const payload = this.generateRandomValue();
    
    try {
      // Simulate API call with random data
      const response = await this.simulateApiCall('/api/test', payload);
      return {
        iteration: this.results.length + 1,
        strategy: 'random_input',
        success: true,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        payload,
        response
      };
    } catch (error) {
      return {
        iteration: this.results.length + 1,
        strategy: 'random_input',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        payload
      };
    }
  }

  private async executeMalformedDataStrategy(): Promise<TestResult> {
    const startTime = Date.now();
    const malformedPayloads = [
      { invalid: 'json', with: 'missing', quotes: true },
      { deeply: { nested: { circular: null } } },
      [1, 2, 3, { invalid: 'structure' }],
      'just a string instead of object',
      12345,
      null,
      undefined,
      { empty: {} },
      { huge: 'x'.repeat(1000000) }, // 1MB string
      { unicode: '🚀💥🔥💣⚡' },
      { sql: "'; DROP TABLE users; --" },
      { xss: "<script>alert('xss')</script>" }
    ];
    
    const payload = malformedPayloads[Math.floor(Math.random() * malformedPayloads.length)];
    
    try {
      const response = await this.simulateApiCall('/api/validate', payload);
      return {
        iteration: this.results.length + 1,
        strategy: 'malformed_data',
        success: true,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        payload,
        response
      };
    } catch (error) {
      return {
        iteration: this.results.length + 1,
        strategy: 'malformed_data',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        payload
      };
    }
  }

  private async executeConcurrentRequestsStrategy(): Promise<TestResult> {
    const startTime = Date.now();
    const concurrentCount = Math.floor(Math.random() * 50) + 10; // 10-60 concurrent requests
    
    try {
      const promises = Array.from({ length: concurrentCount }, (_, i) => 
        this.simulateApiCall(`/api/concurrent/${i}`, { requestId: i })
      );
      
      const responses = await Promise.all(promises);
      return {
        iteration: this.results.length + 1,
        strategy: 'concurrent_requests',
        success: true,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        payload: { concurrentCount },
        response: { successCount: responses.length }
      };
    } catch (error) {
      return {
        iteration: this.results.length + 1,
        strategy: 'concurrent_requests',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        payload: { concurrentCount }
      };
    }
  }

  private async executeInvalidSchemasStrategy(): Promise<TestResult> {
    const startTime = Date.now();
    
    // Generate invalid Zod schemas
    const invalidSchemas = [
      { type: 'invalid_type', schema: { invalid: 'schema' } },
      { type: 'missing_required', schema: { optional: 'field' } },
      { type: 'wrong_format', schema: { email: 'not-an-email' } },
      { type: 'out_of_range', schema: { age: -5 } },
      { type: 'too_long', schema: { name: 'x'.repeat(1000) } },
      { type: 'too_short', schema: { name: '' } },
      { type: 'invalid_enum', schema: { status: 'INVALID_STATUS' } }
    ];
    
    const payload = invalidSchemas[Math.floor(Math.random() * invalidSchemas.length)];
    
    try {
      const response = await this.simulateSchemaValidation(payload.schema);
      return {
        iteration: this.results.length + 1,
        strategy: 'invalid_schemas',
        success: true,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        payload,
        response
      };
    } catch (error) {
      return {
        iteration: this.results.length + 1,
        strategy: 'invalid_schemas',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        payload
      };
    }
  }

  private async executeAsyncRaceConditionsStrategy(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Simulate race conditions with async operations
      const promises: Promise<any>[] = [];
      for (let i = 0; i < 10; i++) {
        promises.push(this.simulateAsyncOperation(i));
      }
      
      // Add some delays to create race conditions
      promises.push(new Promise<any>(resolve => setTimeout(() => resolve('delayed'), Math.random() * 100)));
      
      const results = await Promise.all(promises);
      return {
        iteration: this.results.length + 1,
        strategy: 'async_race_conditions',
        success: true,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        payload: { operationCount: promises.length },
        response: { results }
      };
    } catch (error) {
      return {
        iteration: this.results.length + 1,
        strategy: 'async_race_conditions',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Doctrine Acronym Testing Strategies
  private async executeDoctrineStampedComplianceStrategy(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Test STAMPED format compliance
      const stampedPayload = {
        source_id: this.generateRandomString(10),
        task_id: this.generateRandomString(8),
        approved: this.generateRandomBoolean(),
        migrated_to: Math.random() > 0.5 ? this.generateRandomString(10) : null,
        process_signature: this.generateRandomString(32),
        event_timestamp: new Date().toISOString(),
        data_payload: this.generateRandomObject(2)
      };

      const isValid = this.validateStampedPayload(stampedPayload);
      const response = await this.simulateApiCall('/api/stamped', stampedPayload);
      
      return {
        iteration: this.results.length + 1,
        strategy: 'doctrine_stamped_compliance',
        success: isValid && response.success,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        payload: stampedPayload,
        response
      };
    } catch (error) {
      return {
        iteration: this.results.length + 1,
        strategy: 'doctrine_stamped_compliance',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async executeDoctrineSpvpetComplianceStrategy(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Test SPVPET format compliance
      const spvpetPayload = {
        source_id: this.generateRandomString(10),
        process_id: this.generateRandomString(8),
        validated: Math.random() > 0.5 ? true : 'pending',
        promoted_to: Math.random() > 0.5 ? this.generateRandomString(10) : undefined,
        execution_signature: this.generateRandomString(32),
        timestamp_last_touched: new Date().toISOString()
      };

      const isValid = this.validateSpvpetPayload(spvpetPayload);
      const response = await this.simulateApiCall('/api/spvpet', spvpetPayload);
      
      return {
        iteration: this.results.length + 1,
        strategy: 'doctrine_spvpet_compliance',
        success: isValid && response.success,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        payload: spvpetPayload,
        response
      };
    } catch (error) {
      return {
        iteration: this.results.length + 1,
        strategy: 'doctrine_spvpet_compliance',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async executeDoctrineStackedComplianceStrategy(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Test STACKED format compliance
      const stackedPayload = {
        source_id: this.generateRandomString(10),
        task_id: this.generateRandomString(8),
        analytics_approved: this.generateRandomBoolean(),
        consolidated_from: Math.random() > 0.5 ? this.generateRandomString(10) : null,
        knowledge_signature: this.generateRandomString(32),
        event_timestamp: new Date().toISOString(),
        data_payload: this.generateRandomObject(2)
      };

      const isValid = this.validateStackedPayload(stackedPayload);
      const response = await this.simulateApiCall('/api/stacked', stackedPayload);
      
      return {
        iteration: this.results.length + 1,
        strategy: 'doctrine_stacked_compliance',
        success: isValid && response.success,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        payload: stackedPayload,
        response
      };
    } catch (error) {
      return {
        iteration: this.results.length + 1,
        strategy: 'doctrine_stacked_compliance',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async executeDoctrineAcronymValidationStrategy(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Test acronym validation and consistency
      const acronymTests = [
        { acronym: 'STAMPED', fields: DOCTRINE_ACRONYMS.STAMPED.fields },
        { acronym: 'SPVPET', fields: DOCTRINE_ACRONYMS.SPVPET.fields },
        { acronym: 'STACKED', fields: DOCTRINE_ACRONYMS.STACKED.fields }
      ];

      const testResults = acronymTests.map(test => ({
        acronym: test.acronym,
        hasRequiredFields: this.validateAcronymFields(test.acronym, test.fields),
        definition: DOCTRINE_ACRONYMS[test.acronym as keyof typeof DOCTRINE_ACRONYMS]?.name
      }));

      const allValid = testResults.every(result => result.hasRequiredFields);
      const response = await this.simulateApiCall('/api/doctrine/acronyms', testResults);
      
      return {
        iteration: this.results.length + 1,
        strategy: 'doctrine_acronym_validation',
        success: allValid && response.success,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        payload: testResults,
        response
      };
    } catch (error) {
      return {
        iteration: this.results.length + 1,
        strategy: 'doctrine_acronym_validation',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  private async executeDoctrineBartonNumberingStrategy(): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // Test Barton numbering compliance
      const bartonTests = [
        { format: '1.5.3.30.0', valid: true, description: 'SHQ compliance doctrine' },
        { format: '2.1.1.40.0', valid: true, description: 'CFO messaging doctrine' },
        { format: '1.2.1.10.0', valid: true, description: 'DPR structural doctrine' },
        { format: '3.1.1.10.0', valid: false, description: 'Invalid database' },
        { format: '1.6.1.10.0', valid: false, description: 'Invalid sub-hive' },
        { format: '1.1.1.60.0', valid: false, description: 'Invalid section' }
      ];

      const testResults = bartonTests.map(test => ({
        format: test.format,
        isValid: this.validateBartonNumbering(test.format),
        expected: test.valid,
        description: test.description
      }));

      const allValid = testResults.every(result => result.isValid === result.expected);
      const response = await this.simulateApiCall('/api/doctrine/barton', testResults);
      
      return {
        iteration: this.results.length + 1,
        strategy: 'doctrine_barton_numbering',
        success: allValid && response.success,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        payload: testResults,
        response
      };
    } catch (error) {
      return {
        iteration: this.results.length + 1,
        strategy: 'doctrine_barton_numbering',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Simulation methods
  private async simulateApiCall(endpoint: string, payload: any): Promise<any> {
    // Simulate API call with timeout
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`API call timeout: ${endpoint}`));
      }, this.config.timeoutMs);

      // Simulate processing time
      setTimeout(() => {
        clearTimeout(timeout);
        
        // Simulate some failures
        if (Math.random() < 0.1) { // 10% failure rate
          reject(new Error(`Simulated API failure: ${endpoint}`));
          return;
        }
        
        resolve({ success: true, endpoint, data: payload });
      }, Math.random() * 1000); // Random processing time
    });
  }

  private async simulateSchemaValidation(data: any): Promise<any> {
    // Simulate Zod schema validation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate validation errors
        if (data && typeof data === 'object' && data.invalid) {
          reject(new Error('Schema validation failed'));
          return;
        }
        
        resolve({ valid: true, data });
      }, Math.random() * 500);
    });
  }

  private async simulateAsyncOperation(id: number): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ operationId: id, completed: true });
      }, Math.random() * 200);
    });
  }

  // Doctrine Validation Methods
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

  private validateAcronymFields(acronym: string, expectedFields: string[]): boolean {
    const acronymData = DOCTRINE_ACRONYMS[acronym as keyof typeof DOCTRINE_ACRONYMS];
    if (!acronymData) return false;
    
    return expectedFields.every(field => acronymData.fields.includes(field)) &&
           acronymData.fields.every(field => expectedFields.includes(field));
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

  // Main execution
  public async run(): Promise<MonteCarloReport> {
    console.log('🎲 Starting Monte Carlo Breaker...');
    console.log(`📊 Target: ${this.config.iterations} iterations`);
    console.log(`⚡ Concurrency: ${this.config.concurrency}`);
    console.log(`🎯 Strategies: ${this.config.breakStrategies.join(', ')}`);
    console.log('');

    const strategyMap: Record<string, (() => Promise<TestResult>)> = {
      'random_input': () => this.executeRandomInputStrategy(),
      'malformed_data': () => this.executeMalformedDataStrategy(),
      'concurrent_requests': () => this.executeConcurrentRequestsStrategy(),
      'invalid_schemas': () => this.executeInvalidSchemasStrategy(),
      'async_race_conditions': () => this.executeAsyncRaceConditionsStrategy(),
      'doctrine_stamped_compliance': () => this.executeDoctrineStampedComplianceStrategy(),
      'doctrine_spvpet_compliance': () => this.executeDoctrineSpvpetComplianceStrategy(),
      'doctrine_stacked_compliance': () => this.executeDoctrineStackedComplianceStrategy(),
      'doctrine_acronym_validation': () => this.executeDoctrineAcronymValidationStrategy(),
      'doctrine_barton_numbering': () => this.executeDoctrineBartonNumberingStrategy()
    };

    // Run iterations
    for (let i = 0; i < this.config.iterations; i++) {
      const strategy = this.config.breakStrategies[Math.floor(Math.random() * this.config.breakStrategies.length)];
      const executor = strategyMap[strategy];
      
      if (executor) {
        try {
          const result = await executor();
          this.results.push(result);
          
          if (i % 100 === 0) {
            const successRate = (this.results.filter(r => r.success).length / this.results.length * 100).toFixed(1);
            console.log(`📈 Progress: ${i}/${this.config.iterations} (${successRate}% success rate)`);
          }
        } catch (error) {
          this.results.push({
            iteration: i + 1,
            strategy,
            success: false,
            error: error instanceof Error ? error.message : String(error),
            duration: 0,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    return this.generateReport();
  }

  private generateReport(): MonteCarloReport {
    const endTime = new Date();
    const totalDuration = endTime.getTime() - this.startTime.getTime();
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = this.results.filter(r => !r.success).length;
    const successRate = successfulTests / this.results.length;
    const averageDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length;

    // Group by strategy
    const strategies: Record<string, { attempts: number; failures: number; successRate: number }> = {};
    this.config.breakStrategies.forEach(strategy => {
      const strategyResults = this.results.filter(r => r.strategy === strategy);
      const attempts = strategyResults.length;
      const failures = strategyResults.filter(r => !r.success).length;
      strategies[strategy] = {
        attempts,
        failures,
        successRate: attempts > 0 ? (attempts - failures) / attempts : 0
      };
    });

    // Generate recommendations
    const recommendations: string[] = [];
    if (successRate < this.config.successThreshold) {
      recommendations.push(`⚠️  Success rate (${(successRate * 100).toFixed(1)}%) is below threshold (${(this.config.successThreshold * 100).toFixed(1)}%)`);
    }
    
    Object.entries(strategies).forEach(([strategy, stats]) => {
      if (stats.successRate < 0.8) {
        recommendations.push(`🔧 Improve handling of ${strategy} strategy (${(stats.successRate * 100).toFixed(1)}% success rate)`);
      }
    });

    const report: MonteCarloReport = {
      config: this.config,
      summary: {
        totalTests: this.results.length,
        successfulTests,
        failedTests,
        successRate,
        averageDuration,
        totalDuration,
        startTime: this.startTime.toISOString(),
        endTime: endTime.toISOString()
      },
      failures: this.results.filter(r => !r.success),
      strategies,
      recommendations
    };

    // Save report
    fs.writeFileSync(this.config.reportPath, JSON.stringify(report, null, 2));
    
    return report;
  }
}

// CLI Interface
const command = process.argv[2];
const iterations = parseInt(process.argv[3]) || 1000;

if (command === 'run') {
  const breaker = new MonteCarloBreaker({ iterations });
  breaker.run().then(report => {
    console.log('\n🎲 Monte Carlo Breaker Complete!');
    console.log(`📊 Total Tests: ${report.summary.totalTests}`);
    console.log(`✅ Successful: ${report.summary.successfulTests}`);
    console.log(`❌ Failed: ${report.summary.failedTests}`);
    console.log(`📈 Success Rate: ${(report.summary.successRate * 100).toFixed(1)}%`);
    console.log(`⏱️  Total Duration: ${(report.summary.totalDuration / 1000).toFixed(1)}s`);
    console.log(`📄 Report saved to: ${report.config.reportPath}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n🔧 Recommendations:');
      report.recommendations.forEach(rec => console.log(`   ${rec}`));
    }
  });
} else {
  console.log('🎲 Monte Carlo Breaker');
  console.log('');
  console.log('Usage:');
  console.log('  tsx scripts/montecarlo-breaker.ts run [iterations]');
  console.log('');
  console.log('Examples:');
  console.log('  tsx scripts/montecarlo-breaker.ts run 1000');
  console.log('  tsx scripts/montecarlo-breaker.ts run 500');
}

export { MonteCarloBreaker, BreakerConfig, MonteCarloReport }; 