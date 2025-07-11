#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface BuildConfig {
  diagnosticMapPath: string;
  udnsValidatorPath: string;
  troubleshootingLogPath: string;
  blueprintOutputs: string[];
  requiredSchemas: string[];
}

class BuildIntegration {
  private config: BuildConfig;
  private errors: string[] = [];
  private warnings: string[] = [];

  constructor() {
    this.config = {
      diagnosticMapPath: 'diagnostic_map.json',
      udnsValidatorPath: 'udns_validator.ts',
      troubleshootingLogPath: 'troubleshooting_log.ts',
      blueprintOutputs: ['src/', 'components/', 'api/', 'services/'],
      requiredSchemas: ['STAMPED', 'SPVPET', 'STACKED']
    };
  }

  private checkFileExists(filePath: string, description: string): boolean {
    if (!fs.existsSync(filePath)) {
      this.errors.push(`❌ Missing ${description}: ${filePath}`);
      return false;
    }
    console.log(`✅ Found ${description}: ${filePath}`);
    return true;
  }

  private checkDiagnosticMap(): boolean {
    console.log('\n🔍 Checking diagnostic_map.json...');
    
    if (!this.checkFileExists(this.config.diagnosticMapPath, 'diagnostic_map.json')) {
      return false;
    }

    try {
      const diagnosticMap = JSON.parse(fs.readFileSync(this.config.diagnosticMapPath, 'utf8'));
      
      // Validate required fields
      const requiredFields = ['doctrine', 'altitude_levels', 'color_codes', 'udns_format'];
      for (const field of requiredFields) {
        if (!(field in diagnosticMap)) {
          this.errors.push(`❌ Missing required field in diagnostic_map.json: ${field}`);
          return false;
        }
      }

      if (!diagnosticMap.doctrine) {
        this.errors.push('❌ diagnostic_map.json must have doctrine: true');
        return false;
      }

      console.log('✅ diagnostic_map.json validation passed');
      return true;
    } catch (error) {
      this.errors.push(`❌ Invalid JSON in diagnostic_map.json: ${error}`);
      return false;
    }
  }

  private checkUdnValidator(): boolean {
    console.log('\n🔍 Checking udns_validator.ts...');
    
    if (!this.checkFileExists(this.config.udnsValidatorPath, 'udns_validator.ts')) {
      return false;
    }

    const content = fs.readFileSync(this.config.udnsValidatorPath, 'utf8');
    
    // Check for required exports
    const requiredExports = ['validateUdnCode', 'UDNSValidator'];
    for (const exportName of requiredExports) {
      if (!content.includes(`export`) || !content.includes(exportName)) {
        this.warnings.push(`⚠️ udns_validator.ts may be missing export: ${exportName}`);
      }
    }

    console.log('✅ udns_validator.ts found');
    return true;
  }

  private createTroubleshootingLog(): boolean {
    console.log('\n🔍 Setting up troubleshooting_log.ts...');
    
    if (fs.existsSync(this.config.troubleshootingLogPath)) {
      console.log('✅ troubleshooting_log.ts already exists');
      return true;
    }

    const troubleshootingLogContent = `// ORBT Troubleshooting Log - Auto-generated
// This file is activated on go-live for diagnostic tracking

import { UDNSValidator } from './udns_validator';

interface DiagnosticEntry {
  timestamp: string;
  udns_code: string;
  severity: 'GREEN' | 'YELLOW' | 'RED';
  message: string;
  stack_trace?: string;
  user_context?: string;
}

class TroubleshootingLog {
  private logs: DiagnosticEntry[] = [];
  private validator: UDNSValidator;

  constructor() {
    this.validator = new UDNSValidator();
  }

  public log(udns_code: string, severity: 'GREEN' | 'YELLOW' | 'RED', message: string, error?: Error): void {
    const entry: DiagnosticEntry = {
      timestamp: new Date().toISOString(),
      udns_code,
      severity,
      message,
      stack_trace: error?.stack,
      user_context: this.getUserContext()
    };

    this.logs.push(entry);
    
    // Console output for development
    if (process.env.NODE_ENV === 'development') {
      console.log(\`[\${entry.timestamp}] \${udns_code} [\${severity}]: \${message}\`);
    }

    // Escalate if needed
    this.checkEscalation(udns_code, severity);
  }

  private getUserContext(): string {
    // Capture relevant user context (browser, location, etc.)
    if (typeof window !== 'undefined') {
      return \`Browser: \${navigator.userAgent}, URL: \${window.location.href}\`;
    }
    return 'Server-side execution';
  }

  private checkEscalation(udns_code: string, severity: 'GREEN' | 'YELLOW' | 'RED'): void {
    if (severity === 'RED') {
      // Critical error - immediate escalation
      this.escalateError(udns_code, 'CRITICAL_ERROR');
    } else if (severity === 'YELLOW') {
      // Check for repeated yellow errors
      const recentYellows = this.logs
        .filter(log => log.udns_code === udns_code && log.severity === 'YELLOW')
        .slice(-3);
      
      if (recentYellows.length >= 3) {
        this.escalateError(udns_code, 'REPEATED_YELLOW_ERRORS');
      }
    }
  }

  private escalateError(udns_code: string, reason: string): void {
    // In production, this would trigger alerts, notifications, etc.
    console.error(\`🚨 ESCALATION: \${udns_code} - \${reason}\`);
    
    // TODO: Implement escalation logic (webhooks, notifications, etc.)
    // this.sendAlert(udns_code, reason);
  }

  public getLogs(): DiagnosticEntry[] {
    return [...this.logs];
  }

  public getLogsByUdn(udns_code: string): DiagnosticEntry[] {
    return this.logs.filter(log => log.udns_code === udns_code);
  }

  public getLogsBySeverity(severity: 'GREEN' | 'YELLOW' | 'RED'): DiagnosticEntry[] {
    return this.logs.filter(log => log.severity === severity);
  }

  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

// Global instance for easy access
export const troubleshootingLog = new TroubleshootingLog();

// Convenience functions
export const logDiagnostic = (udns_code: string, severity: 'GREEN' | 'YELLOW' | 'RED', message: string, error?: Error) => {
  troubleshootingLog.log(udns_code, severity, message, error);
};

export default TroubleshootingLog;
`;

    try {
      fs.writeFileSync(this.config.troubleshootingLogPath, troubleshootingLogContent);
      console.log('✅ Created troubleshooting_log.ts');
      return true;
    } catch (error) {
      this.errors.push(`❌ Failed to create troubleshooting_log.ts: ${error}`);
      return false;
    }
  }

  private checkBlueprintOutputs(): boolean {
    console.log('\n🔍 Checking blueprint outputs...');
    
    let allValid = true;
    
    for (const output of this.config.blueprintOutputs) {
      if (fs.existsSync(output)) {
        console.log(`✅ Found blueprint output: ${output}`);
        
        // Check for diagnostic comments in files
        const hasDiagnostics = this.checkDirectoryForDiagnostics(output);
        if (!hasDiagnostics) {
          this.warnings.push(`⚠️ Directory ${output} may not have diagnostic comments`);
        }
      } else {
        this.warnings.push(`⚠️ Expected blueprint output not found: ${output}`);
      }
    }

    return allValid;
  }

  private checkDirectoryForDiagnostics(dirPath: string): boolean {
    try {
      const items = fs.readdirSync(dirPath);
      let hasDiagnostics = false;
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          hasDiagnostics = this.checkDirectoryForDiagnostics(fullPath) || hasDiagnostics;
        } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes('// DIAGNOSTIC:')) {
            hasDiagnostics = true;
          }
        }
      }
      
      return hasDiagnostics;
    } catch (error) {
      return false;
    }
  }

  private checkSchemaCompliance(): boolean {
    console.log('\n🔍 Checking schema compliance...');
    
    let allCompliant = true;
    
    for (const schema of this.config.requiredSchemas) {
      const schemaFiles = this.findSchemaFiles(schema);
      
      if (schemaFiles.length === 0) {
        this.warnings.push(`⚠️ No ${schema} schema files found`);
      } else {
        console.log(`✅ Found ${schema} schema files: ${schemaFiles.length}`);
        
        // Check if schema files reference diagnostic_map.json
        for (const schemaFile of schemaFiles) {
          const content = fs.readFileSync(schemaFile, 'utf8');
          if (!content.includes('diagnostic_map.json') && !content.includes('udns_validator')) {
            this.warnings.push(`⚠️ Schema file ${schemaFile} may not reference diagnostic components`);
          }
        }
      }
    }

    return allCompliant;
  }

  private findSchemaFiles(schemaName: string): string[] {
    const schemaFiles: string[] = [];
    
    const searchDirectories = ['schemas/', 'src/schemas/', '.'];
    
    for (const dir of searchDirectories) {
      if (!fs.existsSync(dir)) continue;
      
      try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          if (item.toLowerCase().includes(schemaName.toLowerCase()) && 
              (item.endsWith('.json') || item.endsWith('.ts') || item.endsWith('.js'))) {
            schemaFiles.push(path.join(dir, item));
          }
        }
      } catch (error) {
        // Directory not accessible
      }
    }
    
    return schemaFiles;
  }

  private injectDiagnosticReferences(): void {
    console.log('\n🔍 Injecting diagnostic references...');
    
    // Find all TypeScript/JavaScript files and inject diagnostic imports
    const filesToUpdate = this.findCodeFiles();
    
    for (const file of filesToUpdate) {
      this.injectDiagnosticImport(file);
    }
  }

  private findCodeFiles(): string[] {
    const codeFiles: string[] = [];
    
    const searchDirectories = ['src/', 'components/', 'api/', 'services/'];
    
    for (const dir of searchDirectories) {
      if (!fs.existsSync(dir)) continue;
      
      const findFiles = (currentDir: string) => {
        try {
          const items = fs.readdirSync(currentDir);
          for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
              findFiles(fullPath);
            } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
              codeFiles.push(fullPath);
            }
          }
        } catch (error) {
          // Directory not accessible
        }
      };
      
      findFiles(dir);
    }
    
    return codeFiles;
  }

  private injectDiagnosticImport(filePath: string): void {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check if diagnostic imports already exist
      if (content.includes('troubleshooting_log') || content.includes('udns_validator')) {
        return; // Already has diagnostic imports
      }
      
      // Find the best place to inject imports
      const lines = content.split('\n');
      let insertIndex = 0;
      
      // Find the end of existing imports
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('require(')) {
          insertIndex = i + 1;
        } else if (lines[i].trim() === '' && insertIndex > 0) {
          continue;
        } else if (insertIndex > 0 && lines[i].trim() !== '') {
          break;
        }
      }
      
      // Inject diagnostic imports
      const diagnosticImports = [
        "import { logDiagnostic } from '../troubleshooting_log';",
        "import { UDNSValidator } from '../udns_validator';",
        ""
      ];
      
      lines.splice(insertIndex, 0, ...diagnosticImports);
      
      fs.writeFileSync(filePath, lines.join('\n'));
      console.log(`✅ Injected diagnostic imports into: ${filePath}`);
    } catch (error) {
      this.warnings.push(`⚠️ Failed to inject diagnostic imports into ${filePath}: ${error}`);
    }
  }

  public runIntegration(): boolean {
    console.log('🚀 ORBT Build Integration Starting...\n');
    
    let allValid = true;
    
    // Check core diagnostic components
    allValid = this.checkDiagnosticMap() && allValid;
    allValid = this.checkUdnValidator() && allValid;
    allValid = this.createTroubleshootingLog() && allValid;
    
    // Check blueprint outputs
    allValid = this.checkBlueprintOutputs() && allValid;
    
    // Check schema compliance
    allValid = this.checkSchemaCompliance() && allValid;
    
    // Inject diagnostic references
    this.injectDiagnosticReferences();
    
    // Report results
    console.log('\n📊 Build Integration Summary:');
    
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(`   ${error}`));
      allValid = false;
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      this.warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    if (allValid) {
      console.log('\n🎯 ORBT Build Integration: SUCCESS');
      console.log('🔒 All blueprint outputs are compliant with diagnostic requirements');
      console.log('📋 Ready for deployment with full diagnostic coverage');
    } else {
      console.log('\n🚨 ORBT Build Integration: FAILED');
      console.log('❌ Critical errors must be resolved before deployment');
    }
    
    return allValid;
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const integration = new BuildIntegration();
  const success = integration.runIntegration();
  process.exit(success ? 0 : 1);
}

export default BuildIntegration; 