#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface DoctrineConfig {
  sourceDir?: string;
  targetDir: string;
  requiredFiles: string[];
  validationScripts: string[];
  diagnosticComponents: string[];
  orbtManuals: string[];
}

class UniversalDoctrineEnforcer {
  private config: DoctrineConfig;
  private errors: string[] = [];
  private warnings: string[] = [];
  private auditResults: Map<string, boolean> = new Map();

  constructor(sourceDir?: string) {
    this.config = {
      sourceDir: sourceDir || path.join(process.cwd(), 'doctrine'),
      targetDir: process.cwd(),
      requiredFiles: [
        'diagnostic_map.json',
        'udns_validator.ts',
        'troubleshooting_log.ts',
        'orbt-validate.js',
        'orbt-deployment-gate.js'
      ],
      validationScripts: [
        'orbt-validate.js',
        'udns-validate.js',
        'diagnostic_injector.ts',
        'build_integration.ts'
      ],
      diagnosticComponents: [
        'diagnostic_injector.ts',
        'build_integration.ts',
        'udns_validator.ts'
      ],
      orbtManuals: [
        'ORBT_SYSTEM.md',
        'ORBT_OPERATING_MANUAL.md',
        'ORBT_REPAIR_MANUAL.md',
        'ORBT_BUILD_MANUAL.md',
        'ORBT_TRAINING_MANUAL.md'
      ]
    };
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    }[level];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  private copyDoctrineFiles(): boolean {
    this.log('📋 Copying doctrine files from source...');
    
    if (!this.config.sourceDir || !fs.existsSync(this.config.sourceDir)) {
      this.log('Source doctrine directory not found, using local files', 'warn');
      return true;
    }

    let success = true;
    
    for (const file of this.config.requiredFiles) {
      const sourcePath = path.join(this.config.sourceDir, file);
      const targetPath = path.join(this.config.targetDir, file);
      
      if (fs.existsSync(sourcePath)) {
        try {
          fs.copyFileSync(sourcePath, targetPath);
          this.log(`✅ Copied: ${file}`);
        } catch (error) {
          this.errors.push(`Failed to copy ${file}: ${error}`);
          success = false;
        }
      } else {
        this.warnings.push(`Source file not found: ${file}`);
      }
    }

    return success;
  }

  private validateOrbtSystem(): boolean {
    this.log('🔍 Validating ORBT system compliance...');
    
    let allValid = true;
    
    // Check for ORBT directory structure
    const orbtDir = path.join(this.config.targetDir, 'orbt');
    if (!fs.existsSync(orbtDir)) {
      this.errors.push('Missing /orbt/ directory - ORBT doctrine violation');
      allValid = false;
    } else {
      this.log('✅ Found /orbt/ directory');
    }

    // Check for ORBT manuals
    for (const manual of this.config.orbtManuals) {
      const manualPath = path.join(this.config.targetDir, manual);
      if (!fs.existsSync(manualPath)) {
        this.errors.push(`Missing ORBT manual: ${manual}`);
        allValid = false;
      } else {
        this.log(`✅ Found ORBT manual: ${manual}`);
      }
    }

    // Run ORBT validation script if it exists
    const orbtValidatePath = path.join(this.config.targetDir, 'orbt-validate.js');
    if (fs.existsSync(orbtValidatePath)) {
      try {
        execSync(`node ${orbtValidatePath}`, { stdio: 'pipe' });
        this.log('✅ ORBT validation script passed');
      } catch (error) {
        this.errors.push(`ORBT validation failed: ${error}`);
        allValid = false;
      }
    } else {
      this.warnings.push('ORBT validation script not found');
    }

    return allValid;
  }

  private validateUdnSystem(): boolean {
    this.log('🔍 Validating UDNS system compliance...');
    
    let allValid = true;
    
    // Check diagnostic_map.json
    const diagnosticMapPath = path.join(this.config.targetDir, 'diagnostic_map.json');
    if (!fs.existsSync(diagnosticMapPath)) {
      this.errors.push('Missing diagnostic_map.json - UDNS doctrine violation');
      allValid = false;
    } else {
      try {
        const diagnosticMap = JSON.parse(fs.readFileSync(diagnosticMapPath, 'utf8'));
        if (!diagnosticMap.doctrine) {
          this.errors.push('diagnostic_map.json must have doctrine: true');
          allValid = false;
        } else {
          this.log('✅ diagnostic_map.json is valid');
        }
      } catch (error) {
        this.errors.push(`Invalid diagnostic_map.json: ${error}`);
        allValid = false;
      }
    }

    // Check udns_validator.ts
    const udnsValidatorPath = path.join(this.config.targetDir, 'udns_validator.ts');
    if (!fs.existsSync(udnsValidatorPath)) {
      this.errors.push('Missing udns_validator.ts - UDNS doctrine violation');
      allValid = false;
    } else {
      this.log('✅ Found udns_validator.ts');
    }

    // Run UDNS validation script if it exists
    const udnsValidatePath = path.join(this.config.targetDir, 'udns-validate.js');
    if (fs.existsSync(udnsValidatePath)) {
      try {
        execSync(`node ${udnsValidatePath}`, { stdio: 'pipe' });
        this.log('✅ UDNS validation script passed');
      } catch (error) {
        this.errors.push(`UDNS validation failed: ${error}`);
        allValid = false;
      }
    } else {
      this.warnings.push('UDNS validation script not found');
    }

    return allValid;
  }

  private injectDiagnostics(): boolean {
    this.log('🔍 Injecting diagnostic comments into code files...');
    
    const diagnosticInjectorPath = path.join(this.config.targetDir, 'diagnostic_injector.ts');
    if (!fs.existsSync(diagnosticInjectorPath)) {
      this.warnings.push('diagnostic_injector.ts not found, skipping diagnostic injection');
      return true;
    }

    try {
      // Compile and run the TypeScript injector
      execSync(`npx ts-node ${diagnosticInjectorPath}`, { stdio: 'pipe' });
      this.log('✅ Diagnostic injection completed');
      return true;
    } catch (error) {
      this.errors.push(`Diagnostic injection failed: ${error}`);
      return false;
    }
  }

  private runBuildIntegration(): boolean {
    this.log('🔍 Running build integration checks...');
    
    const buildIntegrationPath = path.join(this.config.targetDir, 'build_integration.ts');
    if (!fs.existsSync(buildIntegrationPath)) {
      this.warnings.push('build_integration.ts not found, skipping build integration');
      return true;
    }

    try {
      execSync(`npx ts-node ${buildIntegrationPath}`, { stdio: 'pipe' });
      this.log('✅ Build integration completed');
      return true;
    } catch (error) {
      this.errors.push(`Build integration failed: ${error}`);
      return false;
    }
  }

  private auditProjectStructure(): boolean {
    this.log('🔍 Auditing project structure for doctrine compliance...');
    
    let allValid = true;
    
    // Check for required directories
    const requiredDirs = ['src', 'schemas', 'docs'];
    for (const dir of requiredDirs) {
      const dirPath = path.join(this.config.targetDir, dir);
      if (!fs.existsSync(dirPath)) {
        this.warnings.push(`Recommended directory not found: ${dir}`);
      } else {
        this.log(`✅ Found directory: ${dir}`);
      }
    }

    // Check for schema compliance
    const schemaDirs = ['schemas', 'src/schemas'];
    let hasSchemas = false;
    
    for (const schemaDir of schemaDirs) {
      const schemaPath = path.join(this.config.targetDir, schemaDir);
      if (fs.existsSync(schemaPath)) {
        const items = fs.readdirSync(schemaPath);
        const schemaFiles = items.filter(item => 
          item.endsWith('.json') || item.endsWith('.ts') || item.endsWith('.js')
        );
        
        if (schemaFiles.length > 0) {
          hasSchemas = true;
          this.log(`✅ Found ${schemaFiles.length} schema files in ${schemaDir}`);
          break;
        }
      }
    }

    if (!hasSchemas) {
      this.warnings.push('No schema files found - consider adding STAMPED/SPVPET/STACKED schemas');
    }

    // Check for documentation
    const docsPath = path.join(this.config.targetDir, 'docs');
    if (fs.existsSync(docsPath)) {
      const docItems = fs.readdirSync(docsPath);
      if (docItems.length > 0) {
        this.log(`✅ Found ${docItems.length} documentation files`);
      } else {
        this.warnings.push('Documentation directory is empty');
      }
    } else {
      this.warnings.push('Documentation directory not found');
    }

    return allValid;
  }

  private validateDeploymentGate(): boolean {
    this.log('🔍 Validating deployment gate configuration...');
    
    const deploymentGatePath = path.join(this.config.targetDir, 'orbt-deployment-gate.js');
    if (!fs.existsSync(deploymentGatePath)) {
      this.warnings.push('Deployment gate script not found');
      return true;
    }

    try {
      // Test the deployment gate
      execSync(`node ${deploymentGatePath} --test`, { stdio: 'pipe' });
      this.log('✅ Deployment gate validation passed');
      return true;
    } catch (error) {
      this.errors.push(`Deployment gate validation failed: ${error}`);
      return false;
    }
  }

  private generateComplianceReport(): void {
    this.log('📊 Generating compliance report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      project: path.basename(this.config.targetDir),
      doctrine_version: 'ORBT + UDNS v1.0',
      compliance_status: this.errors.length === 0 ? 'COMPLIANT' : 'NON_COMPLIANT',
      errors: this.errors,
      warnings: this.warnings,
      audit_results: Object.fromEntries(this.auditResults),
      recommendations: this.generateRecommendations()
    };

    const reportPath = path.join(this.config.targetDir, 'doctrine_compliance_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    this.log(`✅ Compliance report saved to: ${reportPath}`);
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (this.warnings.length > 0) {
      recommendations.push('Address warnings to improve doctrine compliance');
    }
    
    if (!fs.existsSync(path.join(this.config.targetDir, 'orbt'))) {
      recommendations.push('Create /orbt/ directory with required manuals');
    }
    
    if (!fs.existsSync(path.join(this.config.targetDir, 'diagnostic_map.json'))) {
      recommendations.push('Add diagnostic_map.json for UDNS compliance');
    }
    
    if (this.errors.length === 0) {
      recommendations.push('All critical requirements met - ready for deployment');
    }
    
    return recommendations;
  }

  public enforceDoctrine(): boolean {
    this.log('🚀 Universal Doctrine Enforcement Starting...');
    this.log(`📁 Target directory: ${this.config.targetDir}`);
    if (this.config.sourceDir) {
      this.log(`📁 Source directory: ${this.config.sourceDir}`);
    }
    
    let allValid = true;
    
    // Step 1: Copy doctrine files
    allValid = this.copyDoctrineFiles() && allValid;
    
    // Step 2: Validate ORBT system
    allValid = this.validateOrbtSystem() && allValid;
    
    // Step 3: Validate UDNS system
    allValid = this.validateUdnSystem() && allValid;
    
    // Step 4: Inject diagnostics
    allValid = this.injectDiagnostics() && allValid;
    
    // Step 5: Run build integration
    allValid = this.runBuildIntegration() && allValid;
    
    // Step 6: Audit project structure
    allValid = this.auditProjectStructure() && allValid;
    
    // Step 7: Validate deployment gate
    allValid = this.validateDeploymentGate() && allValid;
    
    // Step 8: Generate compliance report
    this.generateComplianceReport();
    
    // Final summary
    this.log('\n📊 Doctrine Enforcement Summary:');
    this.log(`✅ Errors: ${this.errors.length}`);
    this.log(`⚠️ Warnings: ${this.warnings.length}`);
    
    if (this.errors.length > 0) {
      this.log('\n❌ CRITICAL ERRORS:');
      this.errors.forEach(error => this.log(`   ${error}`, 'error'));
      this.log('\n🚨 DEPLOYMENT BLOCKED - Critical doctrine violations must be resolved');
    }
    
    if (this.warnings.length > 0) {
      this.log('\n⚠️ WARNINGS:');
      this.warnings.forEach(warning => this.log(`   ${warning}`, 'warn'));
    }
    
    if (allValid) {
      this.log('\n🎯 Universal Doctrine Enforcement: SUCCESS');
      this.log('🔒 Project is compliant with ORBT + UDNS doctrine');
      this.log('📋 Ready for deployment with full diagnostic coverage');
    } else {
      this.log('\n🚨 Universal Doctrine Enforcement: FAILED');
      this.log('❌ Critical violations must be resolved before deployment');
    }
    
    return allValid;
  }

  public static createPackageScripts(): void {
    const packagePath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      console.log('package.json not found, skipping script creation');
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      // Add doctrine enforcement scripts
      packageJson.scripts['doctrine:enforce'] = 'npx ts-node universal_doctrine_enforcer.ts';
      packageJson.scripts['doctrine:validate'] = 'npx ts-node universal_doctrine_enforcer.ts --validate';
      packageJson.scripts['prebuild'] = 'npm run doctrine:enforce';
      packageJson.scripts['predeploy'] = 'npm run doctrine:enforce';
      
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Added doctrine enforcement scripts to package.json');
    } catch (error) {
      console.error('Failed to update package.json:', error);
    }
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const sourceDir = args.find(arg => arg.startsWith('--source='))?.split('=')[1];
  
  const enforcer = new UniversalDoctrineEnforcer(sourceDir);
  const success = enforcer.enforceDoctrine();
  
  if (args.includes('--setup-scripts')) {
    UniversalDoctrineEnforcer.createPackageScripts();
  }
  
  process.exit(success ? 0 : 1);
}

export default UniversalDoctrineEnforcer; 