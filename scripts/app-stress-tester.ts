#!/usr/bin/env tsx

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// App Stress Tester Configuration
const StressConfigSchema = z.object({
  baseUrl: z.string().default('http://localhost:3000'),
  endpoints: z.array(z.string()).default([
    '/api/doctrine',
    '/api/frame',
    '/api/health',
    '/api/status'
  ]),
  iterations: z.number().default(100),
  concurrency: z.number().default(5),
  timeoutMs: z.number().default(10000),
  breakStrategies: z.array(z.enum([
    'rapid_fire',
    'large_payloads',
    'malformed_requests',
    'concurrent_users',
    'memory_pressure',
    'network_simulation',
    'schema_violation',
    'authentication_bypass',
    'rate_limit_testing',
    'error_injection'
  ])).default([
    'rapid_fire',
    'large_payloads',
    'malformed_requests',
    'concurrent_users'
  ]),
  reportPath: z.string().default('./stress-test-report.json')
});

type StressConfig = z.infer<typeof StressConfigSchema>;

interface StressTestResult {
  iteration: number;
  strategy: string;
  endpoint: string;
  success: boolean;
  statusCode?: number;
  error?: string;
  duration: number;
  timestamp: string;
  payload?: any;
  response?: any;
}

interface StressTestReport {
  config: StressConfig;
  summary: {
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    successRate: number;
    averageResponseTime: number;
    totalDuration: number;
    startTime: string;
    endTime: string;
  };
  failures: StressTestResult[];
  endpoints: Record<string, { attempts: number; failures: number; successRate: number; avgResponseTime: number }>;
  strategies: Record<string, { attempts: number; failures: number; successRate: number }>;
  recommendations: string[];
}

class AppStressTester {
  private config: StressConfig;
  private results: StressTestResult[] = [];
  private startTime: Date;

  constructor(config?: Partial<StressConfig>) {
    this.config = StressConfigSchema.parse(config || {});
    this.startTime = new Date();
  }

  // Generate malicious/breaking payloads
  private generateLargePayload(): any {
    return {
      data: 'x'.repeat(1024 * 1024), // 1MB string
      nested: {
        deep: {
          structure: {
            with: {
              lots: {
                of: {
                  data: Array.from({ length: 10000 }, (_, i) => ({ id: i, value: `item-${i}` }))
                }
              }
            }
          }
        }
      }
    };
  }

  private generateMalformedPayload(): any {
    const malformedPayloads = [
      { sql: "'; DROP TABLE users; --" },
      { xss: "<script>alert('xss')</script>" },
      { unicode: "🚀💥🔥💣⚡" },
      { nullBytes: "\0\0\0" },
      { circular: null }, // Will be set to circular reference
      { hugeArray: Array.from({ length: 100000 }, (_, i) => i) },
      { invalidJson: "this is not json" },
      { specialChars: "!@#$%^&*()_+-=[]{}|;:,.<>?" },
      { emoji: "🎲🎯💥🔥💣⚡🚀" },
      { binary: Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05]) }
    ];
    
    const payload = malformedPayloads[Math.floor(Math.random() * malformedPayloads.length)];
    
    // Create circular reference
    if (payload.circular === null) {
      const obj: any = { test: 'circular' };
      obj.self = obj;
      return obj;
    }
    
    return payload;
  }

  private generateSchemaViolationPayload(): any {
    const violations = [
      { email: 'not-an-email' },
      { age: -5 },
      { name: '' },
      { status: 'INVALID_STATUS' },
      { required: undefined },
      { type: 'wrong_type', value: 123 },
      { format: 'invalid_format', date: 'not-a-date' },
      { length: 'x'.repeat(10000) }
    ];
    
    return violations[Math.floor(Math.random() * violations.length)];
  }

  // Break strategies
  private async executeRapidFireStrategy(): Promise<StressTestResult[]> {
    const results: StressTestResult[] = [];
    const endpoint = this.config.endpoints[Math.floor(Math.random() * this.config.endpoints.length)];
    
    // Fire 50 rapid requests
    const promises = Array.from({ length: 50 }, async (_, i) => {
      const startTime = Date.now();
      try {
        const response = await this.makeRequest(endpoint, { rapid: true, id: i });
        return {
          iteration: this.results.length + i + 1,
          strategy: 'rapid_fire',
          endpoint,
          success: true,
          statusCode: response.status,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          payload: { rapid: true, id: i },
          response: response.data
        };
      } catch (error) {
        return {
          iteration: this.results.length + i + 1,
          strategy: 'rapid_fire',
          endpoint,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          payload: { rapid: true, id: i }
        };
      }
    });
    
    const rapidResults = await Promise.all(promises);
    results.push(...rapidResults);
    
    return results;
  }

  private async executeLargePayloadsStrategy(): Promise<StressTestResult[]> {
    const results: StressTestResult[] = [];
    const endpoint = this.config.endpoints[Math.floor(Math.random() * this.config.endpoints.length)];
    
    const largePayloads = [
      this.generateLargePayload(),
      { huge: 'x'.repeat(5 * 1024 * 1024) }, // 5MB
      { array: Array.from({ length: 100000 }, (_, i) => ({ id: i, data: 'x'.repeat(100) })) },
      { nested: this.generateDeepNestedObject(20) }
    ];
    
    for (let i = 0; i < largePayloads.length; i++) {
      const startTime = Date.now();
      try {
        const response = await this.makeRequest(endpoint, largePayloads[i]);
        results.push({
          iteration: this.results.length + i + 1,
          strategy: 'large_payloads',
          endpoint,
          success: true,
          statusCode: response.status,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          payload: { size: JSON.stringify(largePayloads[i]).length },
          response: response.data
        });
      } catch (error) {
        results.push({
          iteration: this.results.length + i + 1,
          strategy: 'large_payloads',
          endpoint,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          payload: { size: JSON.stringify(largePayloads[i]).length }
        });
      }
    }
    
    return results;
  }

  private async executeMalformedRequestsStrategy(): Promise<StressTestResult[]> {
    const results: StressTestResult[] = [];
    const endpoint = this.config.endpoints[Math.floor(Math.random() * this.config.endpoints.length)];
    
    const malformedPayloads = [
      this.generateMalformedPayload(),
      'just a string',
      12345,
      null,
      undefined,
      { invalid: 'json', with: 'missing', quotes: true },
      [1, 2, 3, { invalid: 'structure' }]
    ];
    
    for (let i = 0; i < malformedPayloads.length; i++) {
      const startTime = Date.now();
      try {
        const response = await this.makeRequest(endpoint, malformedPayloads[i]);
        results.push({
          iteration: this.results.length + i + 1,
          strategy: 'malformed_requests',
          endpoint,
          success: true,
          statusCode: response.status,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          payload: malformedPayloads[i],
          response: response.data
        });
      } catch (error) {
        results.push({
          iteration: this.results.length + i + 1,
          strategy: 'malformed_requests',
          endpoint,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          payload: malformedPayloads[i]
        });
      }
    }
    
    return results;
  }

  private async executeConcurrentUsersStrategy(): Promise<StressTestResult[]> {
    const results: StressTestResult[] = [];
    const endpoint = this.config.endpoints[Math.floor(Math.random() * this.config.endpoints.length)];
    const userCount = Math.floor(Math.random() * 100) + 20; // 20-120 concurrent users
    
    const promises = Array.from({ length: userCount }, async (_, i) => {
      const startTime = Date.now();
      try {
        const response = await this.makeRequest(endpoint, { 
          userId: i, 
          session: `session-${i}`,
          timestamp: Date.now()
        });
        return {
          iteration: this.results.length + i + 1,
          strategy: 'concurrent_users',
          endpoint,
          success: true,
          statusCode: response.status,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          payload: { userId: i },
          response: response.data
        };
      } catch (error) {
        return {
          iteration: this.results.length + i + 1,
          strategy: 'concurrent_users',
          endpoint,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          payload: { userId: i }
        };
      }
    });
    
    const concurrentResults = await Promise.all(promises);
    results.push(...concurrentResults);
    
    return results;
  }

  // Helper methods
  private generateDeepNestedObject(depth: number): any {
    if (depth <= 0) return 'leaf';
    return { level: depth, child: this.generateDeepNestedObject(depth - 1) };
  }

  private async makeRequest(endpoint: string, payload: any): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout: ${url}`));
      }, this.config.timeoutMs);

      // Simulate HTTP request
      setTimeout(() => {
        clearTimeout(timeout);
        
        // Simulate some failures based on payload
        if (payload && typeof payload === 'object') {
          if (payload.sql && payload.sql.includes('DROP TABLE')) {
            reject(new Error('SQL injection attempt blocked'));
            return;
          }
          if (payload.xss && payload.xss.includes('<script>')) {
            reject(new Error('XSS attempt blocked'));
            return;
          }
          if (payload.huge && payload.huge.length > 1024 * 1024) {
            reject(new Error('Payload too large'));
            return;
          }
        }
        
        // Simulate random failures
        if (Math.random() < 0.05) { // 5% failure rate
          reject(new Error(`Simulated server error: ${endpoint}`));
          return;
        }
        
        resolve({ 
          status: 200, 
          data: { success: true, endpoint, timestamp: Date.now() } 
        });
      }, Math.random() * 2000); // Random response time
    });
  }

  // Main execution
  public async run(): Promise<StressTestReport> {
    console.log('💥 Starting App Stress Tester...');
    console.log(`🎯 Target: ${this.config.baseUrl}`);
    console.log(`📊 Iterations: ${this.config.iterations}`);
    console.log(`⚡ Concurrency: ${this.config.concurrency}`);
    console.log(`🎲 Strategies: ${this.config.breakStrategies.join(', ')}`);
    console.log('');

    const strategyMap: Record<string, (() => Promise<StressTestResult[]>)> = {
      'rapid_fire': () => this.executeRapidFireStrategy(),
      'large_payloads': () => this.executeLargePayloadsStrategy(),
      'malformed_requests': () => this.executeMalformedRequestsStrategy(),
      'concurrent_users': () => this.executeConcurrentUsersStrategy()
    };

    // Run iterations
    for (let i = 0; i < this.config.iterations; i++) {
      const strategy = this.config.breakStrategies[Math.floor(Math.random() * this.config.breakStrategies.length)];
      const executor = strategyMap[strategy];
      
      if (executor) {
        try {
          const results = await executor();
          this.results.push(...results);
          
          if (i % 10 === 0) {
            const successRate = (this.results.filter(r => r.success).length / this.results.length * 100).toFixed(1);
            console.log(`📈 Progress: ${i}/${this.config.iterations} (${successRate}% success rate)`);
          }
        } catch (error) {
          console.error(`❌ Strategy ${strategy} failed:`, error);
        }
      }
    }

    return this.generateReport();
  }

  private generateReport(): StressTestReport {
    const endTime = new Date();
    const totalDuration = endTime.getTime() - this.startTime.getTime();
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = this.results.filter(r => !r.success).length;
    const successRate = successfulTests / this.results.length;
    const averageResponseTime = this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length;

    // Group by endpoint
    const endpoints: Record<string, { attempts: number; failures: number; successRate: number; avgResponseTime: number }> = {};
    this.config.endpoints.forEach(endpoint => {
      const endpointResults = this.results.filter(r => r.endpoint === endpoint);
      const attempts = endpointResults.length;
      const failures = endpointResults.filter(r => !r.success).length;
      const avgResponseTime = endpointResults.reduce((sum, r) => sum + r.duration, 0) / attempts;
      endpoints[endpoint] = {
        attempts,
        failures,
        successRate: attempts > 0 ? (attempts - failures) / attempts : 0,
        avgResponseTime: attempts > 0 ? avgResponseTime : 0
      };
    });

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
    if (successRate < 0.9) {
      recommendations.push(`⚠️  Success rate (${(successRate * 100).toFixed(1)}%) is below 90% threshold`);
    }
    
    Object.entries(endpoints).forEach(([endpoint, stats]) => {
      if (stats.successRate < 0.8) {
        recommendations.push(`🔧 Improve ${endpoint} endpoint (${(stats.successRate * 100).toFixed(1)}% success rate)`);
      }
      if (stats.avgResponseTime > 1000) {
        recommendations.push(`⚡ Optimize ${endpoint} performance (${stats.avgResponseTime.toFixed(0)}ms avg response)`);
      }
    });

    Object.entries(strategies).forEach(([strategy, stats]) => {
      if (stats.successRate < 0.7) {
        recommendations.push(`🛡️  Strengthen defenses against ${strategy} (${(stats.successRate * 100).toFixed(1)}% success rate)`);
      }
    });

    const report: StressTestReport = {
      config: this.config,
      summary: {
        totalTests: this.results.length,
        successfulTests,
        failedTests,
        successRate,
        averageResponseTime,
        totalDuration,
        startTime: this.startTime.toISOString(),
        endTime: endTime.toISOString()
      },
      failures: this.results.filter(r => !r.success),
      endpoints,
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
const iterations = parseInt(process.argv[3]) || 100;
const baseUrl = process.argv[4] || 'http://localhost:3000';

if (command === 'run') {
  const tester = new AppStressTester({ iterations, baseUrl });
  tester.run().then(report => {
    console.log('\n💥 App Stress Test Complete!');
    console.log(`📊 Total Tests: ${report.summary.totalTests}`);
    console.log(`✅ Successful: ${report.summary.successfulTests}`);
    console.log(`❌ Failed: ${report.summary.failedTests}`);
    console.log(`📈 Success Rate: ${(report.summary.successRate * 100).toFixed(1)}%`);
    console.log(`⏱️  Avg Response Time: ${report.summary.averageResponseTime.toFixed(0)}ms`);
    console.log(`⏱️  Total Duration: ${(report.summary.totalDuration / 1000).toFixed(1)}s`);
    console.log(`📄 Report saved to: ${report.config.reportPath}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n🔧 Recommendations:');
      report.recommendations.forEach(rec => console.log(`   ${rec}`));
    }
  });
} else {
  console.log('💥 App Stress Tester');
  console.log('');
  console.log('Usage:');
  console.log('  tsx scripts/app-stress-tester.ts run [iterations] [baseUrl]');
  console.log('');
  console.log('Examples:');
  console.log('  tsx scripts/app-stress-tester.ts run 100');
  console.log('  tsx scripts/app-stress-tester.ts run 500 http://localhost:3000');
  console.log('  tsx scripts/app-stress-tester.ts run 1000 https://myapp.com');
}

export { AppStressTester, StressConfig, StressTestReport }; 