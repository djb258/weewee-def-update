# Monte Carlo Testing System

## Overview

The Monte Carlo Testing System is a comprehensive stress testing framework designed to break your application through random, chaotic testing strategies. It simulates real-world failure scenarios and helps identify weaknesses in your application's resilience.

## 🎲 Monte Carlo Breaker

### Purpose
The Monte Carlo Breaker runs thousands of random tests using various strategies to find edge cases and potential failure points in your application logic.

### Strategies

#### 1. Random Input Testing
- Generates completely random data structures
- Tests with null, undefined, strings, numbers, arrays, objects
- Simulates unexpected data types

#### 2. Malformed Data Testing
- SQL injection attempts
- XSS payloads
- Unicode/emoji injection
- Circular references
- Huge arrays and objects
- Binary data

#### 3. Concurrent Requests Testing
- Simulates 10-60 concurrent API calls
- Tests race conditions
- Identifies threading issues

#### 4. Invalid Schema Testing
- Tests Zod schema validation
- Invalid email formats
- Out-of-range values
- Missing required fields
- Wrong data types

#### 5. Async Race Conditions
- Multiple async operations
- Random delays
- Promise race conditions

### Usage

```bash
# Quick test (100 iterations)
npm run montecarlo:quick

# Standard test (1000 iterations)
npm run montecarlo:run

# Stress test (5000 iterations)
npm run montecarlo:stress

# Custom iterations
tsx scripts/montecarlo-breaker.ts run 2000
```

### Configuration

The Monte Carlo Breaker can be configured via the `BreakerConfigSchema`:

```typescript
{
  enabled: boolean,
  iterations: number,           // Default: 1000
  concurrency: number,          // Default: 10
  timeoutMs: number,           // Default: 5000
  breakStrategies: string[],   // Which strategies to use
  successThreshold: number,    // Default: 0.95 (95%)
  reportPath: string          // Default: './montecarlo-report.json'
}
```

## 💥 App Stress Tester

### Purpose
The App Stress Tester targets actual application endpoints and attempts to break them through various attack vectors.

### Strategies

#### 1. Rapid Fire
- 50 rapid consecutive requests
- Tests rate limiting
- Identifies performance bottlenecks

#### 2. Large Payloads
- 1MB+ data payloads
- Deep nested objects (20+ levels)
- Massive arrays (100k+ items)
- Tests memory limits

#### 3. Malformed Requests
- SQL injection attempts
- XSS payloads
- Unicode/emoji injection
- Circular references
- Binary data

#### 4. Concurrent Users
- 20-120 simulated users
- Session management testing
- Database connection limits

### Usage

```bash
# Quick stress test (50 iterations)
npm run stress:quick

# Standard stress test (100 iterations)
npm run stress:run

# Break test (500 iterations)
npm run stress:break

# Custom configuration
tsx scripts/app-stress-tester.ts run 1000 http://localhost:3000
```

### Configuration

```typescript
{
  baseUrl: string,             // Default: 'http://localhost:3000'
  endpoints: string[],         // Target endpoints
  iterations: number,          // Default: 100
  concurrency: number,         // Default: 5
  timeoutMs: number,          // Default: 10000
  breakStrategies: string[],  // Which strategies to use
  reportPath: string         // Default: './stress-test-report.json'
}
```

## 📊 Reports

Both testers generate comprehensive JSON reports with:

### Summary Statistics
- Total tests run
- Success/failure counts
- Success rate percentage
- Average response times
- Total duration

### Detailed Analysis
- Failed test details
- Strategy-specific statistics
- Endpoint performance metrics
- Recommendations for improvement

### Example Report Structure

```json
{
  "config": { /* test configuration */ },
  "summary": {
    "totalTests": 1000,
    "successfulTests": 950,
    "failedTests": 50,
    "successRate": 0.95,
    "averageResponseTime": 245,
    "totalDuration": 125000
  },
  "failures": [ /* detailed failure logs */ ],
  "strategies": { /* per-strategy statistics */ },
  "recommendations": [ /* improvement suggestions */ ]
}
```

## 🎯 Success Thresholds

### Monte Carlo Breaker
- **Target**: 95% success rate
- **Warning**: Below 90%
- **Critical**: Below 80%

### App Stress Tester
- **Target**: 90% success rate
- **Warning**: Below 85%
- **Critical**: Below 75%

## 🔧 Recommendations

The system automatically generates recommendations based on:

1. **Low Success Rates**: Strategies with <80% success rate
2. **Performance Issues**: Endpoints with >1000ms average response time
3. **Security Vulnerabilities**: Successful injection attempts
4. **Resource Exhaustion**: Memory/timeout failures

## 🛡️ Safety Features

### Built-in Protections
- Timeout limits prevent infinite loops
- Memory usage monitoring
- Configurable iteration limits
- Graceful error handling

### YOLO Mode Integration
- Works with YOLO mode for rapid testing
- Bypasses safety checks when enabled
- Allows extreme testing scenarios

## 🚀 Integration with SOP Library

### For SOP Development
1. **Pre-deployment Testing**: Run before deploying new SOPs
2. **Validation Testing**: Test SOP schema validation
3. **Performance Testing**: Ensure SOPs handle load
4. **Security Testing**: Validate SOP security measures

### For SOP Maintenance
1. **Regression Testing**: Ensure changes don't break existing SOPs
2. **Load Testing**: Test SOP system under stress
3. **Edge Case Discovery**: Find unexpected failure modes

## 📈 Best Practices

### Running Tests
1. Start with quick tests (50-100 iterations)
2. Run during development, not production
3. Monitor system resources during testing
4. Review reports for actionable insights

### Interpreting Results
1. Focus on patterns, not individual failures
2. Prioritize security vulnerabilities
3. Address performance bottlenecks
4. Improve error handling for common failures

### Continuous Integration
1. Run quick tests on every commit
2. Run full tests before releases
3. Track success rates over time
4. Set up alerts for threshold violations

## 🔍 Troubleshooting

### Common Issues

#### High Failure Rates
- Check application logs for errors
- Verify endpoint availability
- Review timeout configurations
- Check system resources

#### Timeout Errors
- Increase `timeoutMs` in configuration
- Check network connectivity
- Verify endpoint responsiveness
- Monitor system performance

#### Memory Issues
- Reduce payload sizes
- Lower iteration counts
- Monitor memory usage
- Restart application if needed

### Debug Mode
Enable verbose logging by setting `YOLO_DEBUG_LEVEL=verbose` in your environment.

## 🎯 Advanced Usage

### Custom Strategies
You can extend the testing system by adding custom strategies:

```typescript
// Add to strategyMap in MonteCarloBreaker
'custom_strategy': () => this.executeCustomStrategy()

// Implement the strategy
private async executeCustomStrategy(): Promise<TestResult> {
  // Your custom testing logic
}
```

### Integration with CI/CD
```yaml
# Example GitHub Actions workflow
- name: Monte Carlo Testing
  run: |
    npm run montecarlo:quick
    npm run stress:quick
  continue-on-error: true
```

### Custom Reports
Extend the reporting system to integrate with your monitoring tools:

```typescript
// Custom report handler
private async sendToMonitoring(report: MonteCarloReport) {
  // Send to your monitoring system
}
```

## 📚 Related Documentation

- [YOLO Mode Configuration](./YOLO_MODE.md)
- [SOP Library Setup](./SOP_LIBRARY.md)
- [Zod Schema Validation](./ZOD_VALIDATION.md)
- [Mermaid Diagram Integration](./MERMAID_DIAGRAMS.md) 