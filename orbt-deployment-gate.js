#!/usr/bin/env node

/**
 * ORBT DEPLOYMENT GATE - SUPREME ENFORCEMENT
 * 
 * This script acts as a deployment gate in CI/CD pipelines.
 * It enforces ORBT Doctrine as SUPREME LAW before any deployment.
 * 
 * Usage in CI/CD:
 * - node orbt-deployment-gate.js
 * - If exit code != 0, deployment is BLOCKED
 * 
 * Exit codes:
 * - 0: ORBT compliant (deployment allowed)
 * - 1: ORBT non-compliant (deployment BLOCKED)
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ORBT_DIR = path.join(process.cwd(), 'orbt');

class ORBTDeploymentGate {
  constructor() {
    this.deploymentBlocked = false;
    this.reason = '';
  }

  /**
   * CRITICAL: Check if ORBT bootstrap has been run
   */
  checkOrbtBootstrap() {
    if (!fs.existsSync(ORBT_DIR)) {
      this.deploymentBlocked = true;
      this.reason = 'ORBT bootstrap not run - /orbt/ directory missing';
      return false;
    }
    return true;
  }

  /**
   * CRITICAL: Run ORBT validation
   */
  async runOrbtValidation() {
    return new Promise((resolve, reject) => {
      const validator = spawn('node', ['orbt-validate.js'], {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      let output = '';
      let errorOutput = '';

      validator.stdout.on('data', (data) => {
        output += data.toString();
      });

      validator.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      validator.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          this.deploymentBlocked = true;
          this.reason = `ORBT validation failed (exit code: ${code})`;
          resolve(false);
        }
      });

      validator.on('error', (error) => {
        this.deploymentBlocked = true;
        this.reason = `ORBT validation error: ${error.message}`;
        reject(error);
      });
    });
  }

  /**
   * CRITICAL: Run UDNS validation
   */
  async runUDNSValidation() {
    return new Promise((resolve, reject) => {
      const validator = spawn('node', ['udns-validate.js'], {
        stdio: 'pipe',
        cwd: process.cwd()
      });

      let output = '';
      let errorOutput = '';

      validator.stdout.on('data', (data) => {
        output += data.toString();
      });

      validator.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      validator.on('close', (code) => {
        if (code === 0) {
          resolve(true);
        } else {
          this.deploymentBlocked = true;
          this.reason = `UDNS validation failed (exit code: ${code})`;
          resolve(false);
        }
      });

      validator.on('error', (error) => {
        this.deploymentBlocked = true;
        this.reason = `UDNS validation error: ${error.message}`;
        reject(error);
      });
    });
  }

  /**
   * CRITICAL: Check ORBT status file
   */
  checkOrbtStatus() {
    const statusPath = path.join(ORBT_DIR, 'ORBT_STATUS.json');
    
    if (!fs.existsSync(statusPath)) {
      this.deploymentBlocked = true;
      this.reason = 'ORBT status file missing - validation not completed';
      return false;
    }

    try {
      const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
      
      if (status.status_flag !== 'green' || !status.orbt_compliance) {
        this.deploymentBlocked = true;
        this.reason = `ORBT status: ${status.status_flag} - compliance: ${status.orbt_compliance}`;
        return false;
      }

      return true;
    } catch (error) {
      this.deploymentBlocked = true;
      this.reason = `ORBT status file corrupted: ${error.message}`;
      return false;
    }
  }

  /**
   * CRITICAL: Generate deployment gate report
   */
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('🚨 ORBT DEPLOYMENT GATE - SUPREME ENFORCEMENT');
    console.log('='.repeat(80));
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Repository: ${process.env.GITHUB_REPOSITORY || 'unknown'}`);
    console.log('='.repeat(80));

    if (this.deploymentBlocked) {
      console.log('\n🔴 DEPLOYMENT BLOCKED');
      console.log('-'.repeat(60));
      console.log(`Reason: ${this.reason}`);
      console.log('\n🚨 ORBT DOCTRINE VIOLATION DETECTED');
      console.log('-'.repeat(60));
      console.log('❌ Deployment is BLOCKED due to ORBT non-compliance');
      console.log('❌ ORBT Doctrine is SUPREME LAW - no exceptions');
      console.log('❌ Fix all ORBT violations before deployment');
      
      console.log('\n💡 REQUIRED ACTIONS:');
      console.log('-'.repeat(60));
      console.log('1. Run: node orbt-bootstrap.js (if not done)');
      console.log('2. Complete all ORBT manuals and sections');
      console.log('3. Fill all checklists and customize notes');
      console.log('4. Run: node orbt-validate.js');
      console.log('5. Ensure status = green before deployment');
      console.log('6. Re-run this deployment gate');
      
      console.log('\n📋 ORBT REQUIREMENTS:');
      console.log('-'.repeat(60));
      console.log('✅ /orbt/ directory exists');
      console.log('✅ All 4 manuals present (Operating, Repair, Build, Training)');
      console.log('✅ All required sections complete');
      console.log('✅ All checklists filled (no empty checkboxes)');
      console.log('✅ All notes customized (no placeholder text)');
      console.log('✅ ORBT_STATUS.json shows green compliance');
    } else {
      console.log('\n✅ DEPLOYMENT ALLOWED');
      console.log('-'.repeat(60));
      console.log('✅ ORBT Doctrine compliance verified');
      console.log('✅ All requirements met');
      console.log('✅ Deployment gate passed');
      console.log('✅ Proceeding with deployment');
    }

    console.log('\n' + '='.repeat(80));
  }

  /**
   * CRITICAL: Run deployment gate
   */
  async run() {
    console.log('🚨 ORBT + UDNS DEPLOYMENT GATE INITIATED');
    console.log('Enforcing ORBT + UDNS Doctrine as SUPREME LAW...\n');
    
    // Check bootstrap
    if (!this.checkOrbtBootstrap()) {
      this.generateReport();
      process.exit(1);
    }

    // Run ORBT validation
    const orbtValidationPassed = await this.runOrbtValidation();
    if (!orbtValidationPassed) {
      this.generateReport();
      process.exit(1);
    }

    // Run UDNS validation
    const udnsValidationPassed = await this.runUDNSValidation();
    if (!udnsValidationPassed) {
      this.generateReport();
      process.exit(1);
    }

    // Check status
    if (!this.checkOrbtStatus()) {
      this.generateReport();
      process.exit(1);
    }

    // All checks passed
    this.generateReport();
    console.log('\n✅ ORBT + UDNS DEPLOYMENT GATE PASSED - DEPLOYMENT ALLOWED');
    process.exit(0);
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const gate = new ORBTDeploymentGate();
  gate.run().catch(error => {
    console.error('❌ ORBT Deployment Gate Failed:', error.message);
    process.exit(1);
  });
}

export default ORBTDeploymentGate; 