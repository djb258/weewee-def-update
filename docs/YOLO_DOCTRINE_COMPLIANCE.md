# YOLO Doctrine Compliance System

## Overview

The YOLO Doctrine Compliance System ensures that all builds maintain compliance with the STAMPED/SPVPET/STACKED doctrine standards, even in YOLO mode. This system automatically tests every build against doctrine requirements and can fail builds that violate compliance standards.

## 🔒 Doctrine Standards

### STAMPED (Neon Database)
- **S**: Source ID - Identifies where the record came from
- **T**: Task/Process ID - Tied to the blueprint or workflow logic
- **A**: Approved/Validated - Track whether the data passed validation
- **M**: Migrated/Promoted To - Target storage reference
- **P**: Process Signature - Unique hash of agent, blueprint, and schema version
- **E**: Event Timestamp - Last update or mutation timestamp
- **D**: Data Payload - The actual record data

### SPVPET (Firebase)
- **S**: Schema - Database structure and validation
- **P**: Processes - Workflow and operational logic
- **V**: Validation - Data validation and compliance
- **P**: Policy - Business rules and enforcement
- **E**: Enforcement - Compliance and audit requirements
- **T**: Tools - Integration and automation tools

### STACKED (BigQuery)
- **S**: Schema - Database structure and validation
- **T**: Tools - Integration and automation tools
- **A**: Architecture - System design and patterns
- **C**: Compliance - Regulatory and audit requirements
- **K**: Knowledge - Data and information management
- **E**: Enforcement - Compliance and audit requirements
- **D**: Doctrine - Business rules and policies

## 🚀 Usage

### Basic Compliance Testing

```bash
# Run doctrine compliance tests
npm run yolo:compliance

# Run with strict mode (more thorough testing)
npm run yolo:compliance:strict

# Run without failing the build
npm run yolo:compliance:quick
```

### Integration with Builds

The compliance system is automatically integrated into the build process:

```bash
# Build with automatic compliance testing
npm run build
```

This will:
1. Build the application with Vite
2. Run doctrine compliance tests
3. Fail the build if violations are found (unless `--no-fail` is used)

### Manual Testing

```bash
# Test specific compliance areas
tsx scripts/yolo-doctrine-compliance.ts run --strict
tsx scripts/yolo-doctrine-compliance.ts run --no-fail
tsx scripts/yolo-doctrine-compliance.ts run --report ./custom-report.json
```

## 📋 Test Categories

### 1. Schema Compliance
Tests that all database payloads conform to the correct format:
- **STAMPED**: Validates Neon database payload structure
- **SPVPET**: Validates Firebase payload structure
- **STACKED**: Validates BigQuery payload structure

### 2. Acronym Compliance
Tests that all doctrine acronyms are properly defined:
- Validates acronym definitions exist
- Ensures required fields are specified
- Checks database associations

### 3. Barton Numbering Compliance
Tests Barton numbering system compliance:
- Validates correct format (DB.HQ.SUB.NESTED.INDEX)
- Tests database range validation (1-2)
- Tests sub-hive range validation
- Tests section range validation (0-49)

### 4. Database Operation Compliance
Tests database operation formatting:
- Firebase operations use SPVPET format
- Neon operations use STAMPED format
- BigQuery operations use STACKED format

## 📊 Reports

The system generates comprehensive JSON reports with:

### Summary Statistics
- Total tests run
- Passed/failed test counts
- Success rate percentage
- Test duration

### Detailed Results
- Individual test results
- Violation details
- Test payloads
- Timestamps

### Recommendations
- Specific fixes for violations
- Compliance improvement suggestions
- Documentation references

### Example Report Structure

```json
{
  "config": {
    "enabled": true,
    "strictMode": false,
    "failOnViolation": true
  },
  "summary": {
    "totalTests": 15,
    "passedTests": 14,
    "failedTests": 1,
    "successRate": 0.933,
    "duration": 1250
  },
  "tests": [
    {
      "name": "STAMPED Schema Validation",
      "category": "schema",
      "passed": true,
      "details": "Validates STAMPED format for Neon database"
    }
  ],
  "violations": [
    {
      "name": "Invalid Barton Number: 3.1.1.10.0",
      "category": "numbering",
      "passed": false,
      "details": "Invalid database number (must be 1 or 2)"
    }
  ],
  "recommendations": [
    "🔢 Fix 1 Barton numbering violations",
    "📚 Review doctrine documentation for compliance requirements"
  ]
}
```

## ⚙️ Configuration

### YoloComplianceConfig

```typescript
{
  enabled: boolean,              // Enable/disable compliance testing
  strictMode: boolean,           // Enable strict mode testing
  testSchemas: boolean,          // Test schema compliance
  testAcronyms: boolean,         // Test acronym compliance
  testBartonNumbering: boolean,  // Test Barton numbering
  testDatabaseOperations: boolean, // Test database operations
  failOnViolation: boolean,      // Fail build on violations
  reportPath: string            // Custom report path
}
```

### Command Line Options

- `--strict`: Enable strict mode testing
- `--no-fail`: Don't fail build on violations
- `--report <path>`: Specify custom report path

## 🔧 Integration with YOLO Mode

The doctrine compliance system works seamlessly with YOLO mode:

1. **YOLO Mode Enabled**: Compliance testing runs but may be more lenient
2. **YOLO Mode Disabled**: Strict compliance testing enforced
3. **Build Integration**: All builds automatically test compliance
4. **Failure Handling**: Builds can be configured to fail on violations

### YOLO Mode Commands

```bash
# Enable YOLO mode with compliance
npm run yolo:enable
npm run build  # Includes compliance testing

# Check YOLO status
npm run yolo:status

# Disable YOLO mode
npm run yolo:disable
```

## 🛡️ Safety Features

### Built-in Protections
- **Automatic Testing**: Every build includes compliance testing
- **Configurable Failure**: Can fail builds on violations
- **Detailed Reporting**: Comprehensive violation details
- **Recommendations**: Specific fix suggestions

### Compliance Enforcement
- **Schema Validation**: Ensures correct payload formats
- **Acronym Validation**: Verifies doctrine definitions
- **Numbering Validation**: Checks Barton numbering compliance
- **Database Validation**: Tests operation formatting

## 📚 Related Documentation

- [Monte Carlo Testing](./MONTE_CARLO_TESTING.md) - Stress testing system
- [Machine Setup](./MACHINE_SETUP.md) - Development environment setup
- [Barton Numbering Schema](./doctrine/barton-numbering-schema.md) - Numbering system details
- [STAMPED Framework](./doctrine/acronyms.md) - Acronym definitions

## 🎯 Success Criteria

### Target Metrics
- **Schema Compliance**: 100% success rate
- **Acronym Compliance**: 100% success rate
- **Barton Numbering**: 100% success rate
- **Database Operations**: 100% success rate

### Warning Thresholds
- **Warning**: Below 95% success rate
- **Critical**: Below 90% success rate
- **Build Failure**: Below 85% success rate (configurable)

---

**Built for YOLO mode safety and doctrine compliance.** 