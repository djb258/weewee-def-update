#!/usr/bin/env node

/**
 * ORBT DOCTRINE VALIDATION - SUPREME ENFORCEMENT
 * 
 * This script enforces ORBT Doctrine as SUPREME LAW.
 * NO DEPLOYMENT ALLOWED unless all requirements pass.
 * 
 * Usage: node orbt-validate.js
 * 
 * Exit codes:
 * - 0: ORBT compliant (deployment allowed)
 * - 1: ORBT non-compliant (deployment BLOCKED)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORBT_DIR = path.join(process.cwd(), 'orbt');
const REQUIRED_MANUALS = [
  'OPERATING_MANUAL.md',
  'REPAIR_MANUAL.md', 
  'BUILD_MANUAL.md',
  'TRAINING_MANUAL.md'
];

const REQUIRED_SECTIONS = {
  'OPERATING_MANUAL.md': ['Modules:', 'Notes:'],
  'REPAIR_MANUAL.md': ['Error Types:', 'Troubleshooting Log:'],
  'BUILD_MANUAL.md': ['Build Steps:', 'Tools & Agents:', 'Notes:'],
  'TRAINING_MANUAL.md': ['Guides:', 'Notes:']
};

class ORBTValidator {
  constructor() {
    this.violations = [];
    this.status = 'red';
    this.compliance = false;
  }

  /**
   * CRITICAL: Check if /orbt/ directory exists
   */
  checkOrbtDirectory() {
    if (!fs.existsSync(ORBT_DIR)) {
      this.violations.push('CRITICAL: /orbt/ directory missing - ORBT bootstrap not run');
      return false;
    }
    return true;
  }

  /**
   * CRITICAL: Check if all required manuals exist
   */
  checkRequiredManuals() {
    REQUIRED_MANUALS.forEach(manual => {
      const manualPath = path.join(ORBT_DIR, manual);
      if (!fs.existsSync(manualPath)) {
        this.violations.push(`CRITICAL: Required manual missing - ${manual}`);
      }
    });
    return this.violations.length === 0;
  }

  /**
   * CRITICAL: Check if manuals have required sections
   */
  checkRequiredSections() {
    REQUIRED_MANUALS.forEach(manual => {
      const manualPath = path.join(ORBT_DIR, manual);
      if (fs.existsSync(manualPath)) {
        const content = fs.readFileSync(manualPath, 'utf8');
        const requiredSections = REQUIRED_SECTIONS[manual];
        
        requiredSections.forEach(section => {
          if (!content.includes(section)) {
            this.violations.push(`CRITICAL: Required section missing in ${manual} - ${section}`);
          }
        });
      }
    });
  }

  /**
   * CRITICAL: Check if checklists are filled out
   */
  checkChecklistCompletion() {
    REQUIRED_MANUALS.forEach(manual => {
      const manualPath = path.join(ORBT_DIR, manual);
      if (fs.existsSync(manualPath)) {
        const content = fs.readFileSync(manualPath, 'utf8');
        
        // Check for empty checkboxes
        const emptyCheckboxes = content.match(/- \[ \]/g);
        if (emptyCheckboxes && emptyCheckboxes.length > 0) {
          this.violations.push(`CRITICAL: Incomplete checklists in ${manual} - ${emptyCheckboxes.length} unchecked items`);
        }
      }
    });
  }

  /**
   * CRITICAL: Check if notes sections have content
   */
  checkNotesContent() {
    REQUIRED_MANUALS.forEach(manual => {
      const manualPath = path.join(ORBT_DIR, manual);
      if (fs.existsSync(manualPath)) {
        const content = fs.readFileSync(manualPath, 'utf8');
        
        // Check if notes section has placeholder text
        if (content.includes('(Explain how') || content.includes('(Describe how') || content.includes('(Explain in layman')) {
          this.violations.push(`CRITICAL: Notes section in ${manual} contains placeholder text - must be customized`);
        }
      }
    });
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
      status_flag: this.status,
      error_log_link: "/logs/error_log.json",
      last_validated: new Date().toISOString(),
      orbt_compliance: this.compliance,
      violations: this.violations
    };

    fs.writeFileSync(
      path.join(ORBT_DIR, 'ORBT_STATUS.json'),
      JSON.stringify(status, null, 2),
      'utf8'
    );
  }

  /**
   * CRITICAL: Generate enforcement report
   */
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🚨 ORBT DOCTRINE SUPREME ENFORCEMENT VALIDATION');
    console.log('='.repeat(80));
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Status: ${this.status.toUpperCase()}`);
    console.log(`Compliance: ${this.compliance ? '✅ PASSED' : '❌ FAILED'}`);
    console.log('='.repeat(80));

    if (this.violations.length > 0) {
      console.log('\n🔴 CRITICAL VIOLATIONS (DEPLOYMENT BLOCKED):');
      console.log('-'.repeat(60));
      this.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation}`);
      });
      
      console.log('\n🚨 ENFORCEMENT ACTION REQUIRED:');
      console.log('-'.repeat(60));
      console.log('❌ DEPLOYMENT IS BLOCKED');
      console.log('❌ ORBT compliance must be achieved before deployment');
      console.log('❌ Fix all violations above and re-run validation');
      
      console.log('\n💡 REQUIRED ACTIONS:');
      console.log('-'.repeat(60));
      console.log('1. Complete all missing manuals and sections');
      console.log('2. Fill out all checklists (no empty checkboxes)');
      console.log('3. Customize all notes sections (no placeholder text)');
      console.log('4. Re-run: node orbt-validate.js');
      console.log('5. Only deploy when status = green');
    } else {
      console.log('\n✅ ORBT COMPLIANCE ACHIEVED');
      console.log('-'.repeat(60));
      console.log('✅ All required manuals present');
      console.log('✅ All required sections complete');
      console.log('✅ All checklists filled');
      console.log('✅ All notes customized');
      console.log('✅ DEPLOYMENT ALLOWED');
    }

    console.log('\n' + '='.repeat(80));
  }

  /**
   * CRITICAL: Run complete validation
   */
  async run() {
    console.log('🚨 ORBT SUPREME ENFORCEMENT VALIDATION INITIATED');
    console.log('Checking compliance with ORBT Doctrine (SUPREME LAW)...\n');
    
    this.checkOrbtDirectory();
    this.checkRequiredManuals();
    this.checkRequiredSections();
    this.checkChecklistCompletion();
    this.checkNotesContent();
    this.determineCompliance();
    this.writeComplianceStatus();
    this.generateReport();
    
    // CRITICAL: Exit with error code if non-compliant
    if (!this.compliance) {
      console.log('\n🚨 ORBT VIOLATIONS DETECTED - DEPLOYMENT BLOCKED');
      process.exit(1);
    } else {
      console.log('\n✅ ORBT COMPLIANCE VERIFIED - DEPLOYMENT ALLOWED');
      process.exit(0);
    }
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new ORBTValidator();
  validator.run().catch(error => {
    console.error('❌ ORBT Validation Failed:', error.message);
    process.exit(1);
  });
}

export default ORBTValidator; 