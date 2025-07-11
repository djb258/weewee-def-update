#!/usr/bin/env node

/**
 * UDNS Validation Script
 * 
 * Validates Universal Diagnostic Numbering Schema compliance
 * Part of ORBT + UDNS Supreme Doctrine enforcement
 * 
 * Usage: node udns-validate.js
 * 
 * Exit codes:
 * - 0: UDNS compliant
 * - 1: UDNS non-compliant (deployment BLOCKED)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLUEPRINT_ID_FILE = path.join(process.cwd(), '.blueprint-id');
const DIAGNOSTIC_MAP_FILE = path.join(process.cwd(), 'diagnostic_map.json');
const UDNS_LOGGER_FILE = path.join(process.cwd(), 'udns-logger.js');

// Valid UDNS altitude values
const VALID_ALTITUDES = ['10', '20', '30', '40', '50'];

class UDNSValidator {
  constructor() {
    this.violations = [];
    this.status = 'red';
    this.compliance = false;
    this.blueprintId = null;
    this.diagnosticMap = null;
  }

  /**
   * CRITICAL: Check if blueprint ID exists
   */
  checkBlueprintId() {
    if (!fs.existsSync(BLUEPRINT_ID_FILE)) {
      this.violations.push('CRITICAL: Blueprint ID file missing (.blueprint-id)');
      return false;
    }

    try {
      this.blueprintId = fs.readFileSync(BLUEPRINT_ID_FILE, 'utf8').trim();
      if (!this.blueprintId.match(/^BP-\d{3}$/)) {
        this.violations.push(`CRITICAL: Invalid blueprint ID format: ${this.blueprintId} (expected BP-XXX)`);
        return false;
      }
      return true;
    } catch (error) {
      this.violations.push(`CRITICAL: Failed to read blueprint ID: ${error.message}`);
      return false;
    }
  }

  /**
   * CRITICAL: Check if diagnostic map exists
   */
  checkDiagnosticMap() {
    if (!fs.existsSync(DIAGNOSTIC_MAP_FILE)) {
      this.violations.push('CRITICAL: Diagnostic map file missing (diagnostic_map.json)');
      return false;
    }

    try {
      this.diagnosticMap = JSON.parse(fs.readFileSync(DIAGNOSTIC_MAP_FILE, 'utf8'));
      
      // Validate required fields
      if (!this.diagnosticMap.blueprint_id) {
        this.violations.push('CRITICAL: Diagnostic map missing blueprint_id field');
        return false;
      }
      
      if (!this.diagnosticMap.diagnostic_map || !this.diagnosticMap.diagnostic_map.modules) {
        this.violations.push('CRITICAL: Diagnostic map missing modules structure');
        return false;
      }

      // Check if blueprint ID matches
      if (this.diagnosticMap.blueprint_id !== this.blueprintId) {
        this.violations.push(`CRITICAL: Blueprint ID mismatch: ${this.diagnosticMap.blueprint_id} vs ${this.blueprintId}`);
        return false;
      }

      return true;
    } catch (error) {
      this.violations.push(`CRITICAL: Failed to parse diagnostic map: ${error.message}`);
      return false;
    }
  }

  /**
   * CRITICAL: Validate UDNS codes in diagnostic map
   */
  validateUDNSCodes() {
    if (!this.diagnosticMap) return false;

    const modules = this.diagnosticMap.diagnostic_map.modules;
    let hasValidCodes = false;

    Object.entries(modules).forEach(([moduleName, moduleData]) => {
      if (!moduleData.udns_codes || !Array.isArray(moduleData.udns_codes)) {
        this.violations.push(`CRITICAL: Module ${moduleName} missing udns_codes array`);
        return;
      }

      if (moduleData.udns_codes.length === 0) {
        this.violations.push(`CRITICAL: Module ${moduleName} has empty udns_codes array`);
        return;
      }

      moduleData.udns_codes.forEach((udnsCode, index) => {
        if (!this.isValidUDNSCode(udnsCode)) {
          this.violations.push(`CRITICAL: Invalid UDNS code in ${moduleName}[${index}]: ${udnsCode}`);
        } else {
          hasValidCodes = true;
        }
      });

      // Check for required module documentation
      if (!moduleData.visual_docs) {
        this.violations.push(`CRITICAL: Module ${moduleName} missing visual_docs field`);
      }

      if (!moduleData.human_readable) {
        this.violations.push(`CRITICAL: Module ${moduleName} missing human_readable field`);
      }
    });

    return hasValidCodes;
  }

  /**
   * Validate UDNS code format
   */
  isValidUDNSCode(udnsCode) {
    if (typeof udnsCode !== 'string') return false;
    
    const parts = udnsCode.split('.');
    if (parts.length !== 4) return false;
    
    const [altitude, module, submodule, action] = parts;
    
    // Check altitude
    if (!VALID_ALTITUDES.includes(altitude)) return false;
    
    // Check other parts are not empty
    if (!module || !submodule || !action) return false;
    
    // Check for valid characters (alphanumeric, dots, hyphens, underscores)
    const validPattern = /^[a-zA-Z0-9._-]+$/;
    if (!validPattern.test(module) || !validPattern.test(submodule) || !validPattern.test(action)) {
      return false;
    }
    
    return true;
  }

  /**
   * CRITICAL: Check if UDNS logger exists
   */
  checkUDNSLogger() {
    if (!fs.existsSync(UDNS_LOGGER_FILE)) {
      this.violations.push('CRITICAL: UDNS logger file missing (udns-logger.js)');
      return false;
    }
    return true;
  }

  /**
   * CRITICAL: Check for UDNS usage in code
   */
  checkUDNSUsage() {
    const srcDir = path.join(process.cwd(), 'src');
    const apiDir = path.join(process.cwd(), 'api');
    
    let foundUDNSUsage = false;
    
    // Check common directories for UDNS usage
    const directories = [srcDir, apiDir].filter(dir => fs.existsSync(dir));
    
    directories.forEach(dir => {
      const files = this.findFiles(dir, ['.js', '.ts', '.jsx', '.tsx']);
      files.forEach(file => {
        try {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('udns-logger') || content.includes('UDNSLogger')) {
            foundUDNSUsage = true;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      });
    });

    if (!foundUDNSUsage) {
      this.violations.push('WARNING: No UDNS logger usage found in source code');
    }

    return foundUDNSUsage;
  }

  /**
   * Find files recursively
   */
  findFiles(dir, extensions) {
    const files = [];
    
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.findFiles(fullPath, extensions));
        } else if (stat.isFile()) {
          const ext = path.extname(item);
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      });
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return files;
  }

  /**
   * CRITICAL: Determine overall compliance
   */
  determineCompliance() {
    if (this.violations.length === 0) {
      this.status = 'green';
      this.compliance = true;
    } else {
      this.status = 'red';
      this.compliance = false;
    }
  }

  /**
   * CRITICAL: Write compliance status
   */
  writeComplianceStatus() {
    const status = {
      udns_status: this.status,
      blueprint_id: this.blueprintId,
      udns_compliance: this.compliance,
      last_validated: new Date().toISOString(),
      violations: this.violations
    };

    // Update ORBT status if it exists
    const orbtStatusPath = path.join(process.cwd(), 'orbt', 'ORBT_STATUS.json');
    if (fs.existsSync(orbtStatusPath)) {
      try {
        const orbtStatus = JSON.parse(fs.readFileSync(orbtStatusPath, 'utf8'));
        orbtStatus.udns_compliance = this.compliance;
        orbtStatus.udns_violations = this.violations;
        fs.writeFileSync(orbtStatusPath, JSON.stringify(orbtStatus, null, 2), 'utf8');
      } catch (error) {
        console.log(`⚠️  Could not update ORBT status: ${error.message}`);
      }
    }

    // Write UDNS-specific status
    fs.writeFileSync(
      path.join(process.cwd(), 'udns_status.json'),
      JSON.stringify(status, null, 2),
      'utf8'
    );
  }

  /**
   * CRITICAL: Generate validation report
   */
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🔢 UDNS SUPREME ENFORCEMENT VALIDATION');
    console.log('='.repeat(80));
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Blueprint ID: ${this.blueprintId || 'NOT ASSIGNED'}`);
    console.log(`Status: ${this.status.toUpperCase()}`);
    console.log(`Compliance: ${this.compliance ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('='.repeat(80));

    if (this.violations.length > 0) {
      console.log('\n🔴 CRITICAL VIOLATIONS (DEPLOYMENT BLOCKED):');
      console.log('-'.repeat(60));
      this.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation}`);
      });
      
      console.log('\n🚨 UDNS ENFORCEMENT ACTION REQUIRED:');
      console.log('-'.repeat(60));
      console.log('❌ DEPLOYMENT IS BLOCKED');
      console.log('❌ UDNS compliance must be achieved before deployment');
      console.log('❌ Fix all violations above and re-run validation');
      
      console.log('\n💡 REQUIRED ACTIONS:');
      console.log('-'.repeat(60));
      console.log('1. Run: node udns-setup.js (if not done)');
      console.log('2. Ensure blueprint ID is assigned (BP-XXX format)');
      console.log('3. Create/update diagnostic_map.json with valid UDNS codes');
      console.log('4. Implement UDNS logger in your code');
      console.log('5. Re-run: node udns-validate.js');
      console.log('6. Only deploy when status = green');
    } else {
      console.log('\n✅ UDNS COMPLIANCE ACHIEVED');
      console.log('-'.repeat(60));
      console.log('✅ Blueprint ID assigned and valid');
      console.log('✅ Diagnostic map complete');
      console.log('✅ UDNS codes validated');
      console.log('✅ UDNS logger implemented');
      console.log('✅ DEPLOYMENT ALLOWED');
    }

    console.log('\n📋 UDNS REQUIREMENTS:');
    console.log('-'.repeat(60));
    console.log('✅ Blueprint ID file (.blueprint-id)');
    console.log('✅ Diagnostic map (diagnostic_map.json)');
    console.log('✅ UDNS logger (udns-logger.js)');
    console.log('✅ Valid UDNS codes (ALTITUDE.MODULE.SUBMODULE.ACTION)');
    console.log('✅ Module documentation (visual_docs, human_readable)');

    console.log('\n' + '='.repeat(80));
  }

  /**
   * CRITICAL: Run complete validation
   */
  async run() {
    console.log('🔢 UDNS SUPREME ENFORCEMENT VALIDATION INITIATED');
    console.log('Validating Universal Diagnostic Numbering Schema compliance...\n');
    
    this.checkBlueprintId();
    this.checkDiagnosticMap();
    this.validateUDNSCodes();
    this.checkUDNSLogger();
    this.checkUDNSUsage();
    this.determineCompliance();
    this.writeComplianceStatus();
    this.generateReport();
    
    // CRITICAL: Exit with error code if non-compliant
    if (!this.compliance) {
      console.log('\n🚨 UDNS VIOLATIONS DETECTED - DEPLOYMENT BLOCKED');
      process.exit(1);
    } else {
      console.log('\n✅ UDNS COMPLIANCE VERIFIED - DEPLOYMENT ALLOWED');
      process.exit(0);
    }
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new UDNSValidator();
  validator.run().catch(error => {
    console.error('❌ UDNS Validation Failed:', error.message);
    process.exit(1);
  });
}

export default UDNSValidator; 