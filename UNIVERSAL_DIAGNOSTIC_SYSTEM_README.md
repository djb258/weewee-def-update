# Universal Diagnostic System (ORBT + UDNS)

## 🎯 Overview

The Universal Diagnostic System is a comprehensive doctrine enforcement framework that ensures all blueprint-generated builds include structured diagnostic capabilities with ORBT compliance. This system provides automatic injection, validation, and enforcement of diagnostic standards across all software builds.

## 🏗️ System Components

### Core Files

1. **`diagnostic_map.json`** - Universal reference file defining UDNS schema, color logic, and escalation rules
2. **`diagnostic_injector.ts`** - Automatically injects UDNS diagnostic comments into all blueprint-generated app modules
3. **`build_integration.ts`** - Ensures all blueprint outputs include required diagnostic components
4. **`universal_doctrine_enforcer.ts`** - Master enforcement script that orchestrates all validation and compliance checks

### Diagnostic Components

- **UDNS Validator** (`udns_validator.ts`) - Validates UDNS codes in diagnostics
- **Troubleshooting Log** (`troubleshooting_log.ts`) - Ready for activation on go-live
- **ORBT Manuals** - Operating, Repair, Build, and Training manuals
- **Deployment Gate** (`orbt-deployment-gate.js`) - CI/CD integration for doctrine compliance

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install typescript ts-node @types/node
```

### 2. Run Universal Enforcement

```bash
# Basic enforcement
npx ts-node universal_doctrine_enforcer.ts

# With source directory
npx ts-node universal_doctrine_enforcer.ts --source=/path/to/doctrine

# Setup package.json scripts
npx ts-node universal_doctrine_enforcer.ts --setup-scripts
```

### 3. Manual Component Usage

```bash
# Inject diagnostics into code files
npx ts-node diagnostic_injector.ts

# Validate diagnostic coverage
npx ts-node diagnostic_injector.ts --validate

# Run build integration
npx ts-node build_integration.ts
```

## 📋 Diagnostic Injection Examples

The system automatically injects diagnostic comments based on file type and location:

### UI Components
```typescript
// DIAGNOSTIC: 10.UI.login.render - UI (User Interface)
import React from 'react';

export const LoginForm = () => {
  // Component logic
};
```

### API Services
```typescript
// DIAGNOSTIC: 20.API.auth.execute - API / Service (Application Programming Interface)
import { logDiagnostic } from '../troubleshooting_log';

export const authService = {
  login: async (credentials) => {
    try {
      // Authentication logic
      logDiagnostic('20.API.auth.execute', 'GREEN', 'Login successful');
    } catch (error) {
      logDiagnostic('20.API.auth.execute', 'RED', 'Login failed', error);
    }
  }
};
```

### Database Operations
```typescript
// DIAGNOSTIC: 30.DB.firebase.persist - DB / Persistence (Database)
import { logDiagnostic } from '../troubleshooting_log';

export const saveUserData = async (userData) => {
  try {
    // Firestore write operation
    logDiagnostic('30.DB.firebase.persist', 'GREEN', 'User data saved');
  } catch (error) {
    logDiagnostic('30.DB.firebase.persist', 'RED', 'Database write failed', error);
  }
};
```

## 🎨 UDNS Color System

### Green (GREEN)
- **Status**: Fully compliant, no issues detected
- **Action**: Continue normal operation
- **Example**: `logDiagnostic('10.UI.form.submit', 'GREEN', 'Form submitted successfully');`

### Yellow (YELLOW)
- **Status**: Partial/structural issues, needs review
- **Action**: Monitor and investigate
- **Escalation**: After 3 consecutive occurrences, escalates to RED
- **Example**: `logDiagnostic('20.API.cache.miss', 'YELLOW', 'Cache miss detected');`

### Red (RED)
- **Status**: Critical issues, deployment blocked
- **Action**: Immediate escalation and intervention required
- **Example**: `logDiagnostic('30.DB.connection.fail', 'RED', 'Database connection failed', error);`

## 🔧 Integration with CI/CD

### Package.json Scripts

```json
{
  "scripts": {
    "doctrine:enforce": "npx ts-node universal_doctrine_enforcer.ts",
    "doctrine:validate": "npx ts-node universal_doctrine_enforcer.ts --validate",
    "prebuild": "npm run doctrine:enforce",
    "predeploy": "npm run doctrine:enforce"
  }
}
```

### GitHub Actions

```yaml
name: Doctrine Compliance Check
on: [push, pull_request]

jobs:
  doctrine-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run doctrine:enforce
```

### Deployment Gate

```bash
# Pre-deployment check
node orbt-deployment-gate.js

# Test mode
node orbt-deployment-gate.js --test
```

## 📊 Compliance Reporting

The system generates comprehensive compliance reports:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "project": "my-app",
  "doctrine_version": "ORBT + UDNS v1.0",
  "compliance_status": "COMPLIANT",
  "errors": [],
  "warnings": ["Documentation directory not found"],
  "recommendations": ["All critical requirements met - ready for deployment"]
}
```

## 🏛️ ORBT Doctrine Integration

### Required Structure

```
project/
├── orbt/
│   ├── ORBT_SYSTEM.md
│   ├── ORBT_OPERATING_MANUAL.md
│   ├── ORBT_REPAIR_MANUAL.md
│   ├── ORBT_BUILD_MANUAL.md
│   └── ORBT_TRAINING_MANUAL.md
├── diagnostic_map.json
├── udns_validator.ts
├── troubleshooting_log.ts
├── diagnostic_injector.ts
├── build_integration.ts
└── universal_doctrine_enforcer.ts
```

### Manual Validation

```bash
# Validate ORBT system
node orbt-validate.js

# Validate UDNS system
node udns-validate.js

# Run comprehensive audit
npx ts-node universal_doctrine_enforcer.ts
```

## 🔍 Troubleshooting

### Common Issues

1. **Missing diagnostic_map.json**
   ```bash
   # Create the file
   cp /path/to/source/diagnostic_map.json .
   ```

2. **TypeScript compilation errors**
   ```bash
   # Install dependencies
   npm install typescript ts-node @types/node
   ```

3. **Permission denied**
   ```bash
   # Make scripts executable
   chmod +x *.ts *.js
   ```

### Validation Commands

```bash
# Check diagnostic coverage
npx ts-node diagnostic_injector.ts --validate

# Check build integration
npx ts-node build_integration.ts

# Full doctrine audit
npx ts-node universal_doctrine_enforcer.ts
```

## 📚 Advanced Usage

### Custom Diagnostic Codes

You can define custom diagnostic codes in your code:

```typescript
// Custom diagnostic for specific business logic
logDiagnostic('40.AGENT.workflow.execute', 'GREEN', 'Workflow completed successfully');
logDiagnostic('50.EXTERNAL.webhook.receive', 'YELLOW', 'Webhook received with warnings');
```

### Integration with Existing Logging

```typescript
import { logDiagnostic } from './troubleshooting_log';

// Wrap existing error handling
try {
  // Your existing code
} catch (error) {
  // Existing error logging
  console.error('Error occurred:', error);
  
  // Add diagnostic logging
  logDiagnostic('20.API.service.execute', 'RED', 'Service execution failed', error);
}
```

### Custom Validation Rules

```typescript
// Extend UDNS validator for custom rules
import { UDNSValidator } from './udns_validator';

class CustomValidator extends UDNSValidator {
  validateCustomRule(udnsCode: string): boolean {
    // Add custom validation logic
    return this.validateUdnCode(udnsCode) && udnsCode.includes('CUSTOM');
  }
}
```

## 🚨 Doctrine Lock Enforcement

The ORBT system is **mandatory** and **non-negotiable**. All blueprints must generate structured outputs with:

- ✅ Diagnostic keys
- ✅ Altitude reference  
- ✅ Compliance with STAMPED/SPVPET/STACKED schema
- ✅ ORBT manual integration
- ✅ UDNS validation

**No exceptions or deviations are allowed.**

## 📞 Support

For issues or questions about the Universal Diagnostic System:

1. Check the compliance report: `doctrine_compliance_report.json`
2. Review the ORBT manuals in the `/orbt/` directory
3. Run validation scripts to identify specific issues
4. Ensure all required files are present and properly configured

---

**🔒 ORBT + UDNS Doctrine v1.0 - Universal Diagnostic System**
*Enforcing structured diagnostics across all software builds* 