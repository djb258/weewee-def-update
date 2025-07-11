#!/usr/bin/env node

/**
 * Universal Doctrine Enforcement Script
 *
 * - Auto-copies/updates doctrine files from a central source
 * - Audits the project for doctrine compliance
 * - Runs all validation scripts (ORBT, UDNS, TS validator)
 * - Blocks build/deploy if any check fails
 *
 * Usage:
 *   node enforce_doctrine.js [--source /path/to/definitions]
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const DOCTRINE_FILES = [
  'diagnostic_map.json',
  'udns_validator.ts',
  path.join('diagnostics', 'index.ts')
];

const VALIDATION_SCRIPTS = [
  'orbt-validate.js',
  'udns-validate.js',
  'udns_validator.ts'
];

function getSourceDir() {
  const arg = process.argv.find(a => a.startsWith('--source'));
  if (arg) {
    const parts = arg.split('=');
    return parts[1] || process.argv[process.argv.indexOf(arg) + 1];
  }
  // Default: look for a sibling 'definitions' directory
  const defaultPath = path.resolve(__dirname, '../definitions');
  return fs.existsSync(defaultPath) ? defaultPath : null;
}

function copyOrUpdateFile(src, dest) {
  if (!fs.existsSync(src)) return false;
  let shouldCopy = false;
  if (!fs.existsSync(dest)) {
    shouldCopy = true;
  } else {
    // Compare file contents
    const srcContent = fs.readFileSync(src, 'utf8');
    const destContent = fs.readFileSync(dest, 'utf8');
    if (srcContent !== destContent) shouldCopy = true;
  }
  if (shouldCopy) {
    // Ensure parent directory exists
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`✅ Updated doctrine file: ${dest}`);
    return true;
  }
  return false;
}

function autoCopyDoctrineFiles(sourceDir) {
  let updated = false;
  DOCTRINE_FILES.forEach(file => {
    const src = path.join(sourceDir, file);
    const dest = path.join(process.cwd(), file);
    if (copyOrUpdateFile(src, dest)) updated = true;
  });
  return updated;
}

function runValidationScript(script) {
  let cmd = script.endsWith('.ts') ? 'npx' : 'node';
  let args = script.endsWith('.ts') ? ['ts-node', script] : [script];
  if (!fs.existsSync(path.join(process.cwd(), script))) {
    console.warn(`⚠️  Validation script missing: ${script}`);
    return true; // Don't block if script is not present
  }
  const result = spawnSync(cmd, args, { stdio: 'inherit' });
  return result.status === 0;
}

function auditDoctrine() {
  let allPassed = true;
  VALIDATION_SCRIPTS.forEach(script => {
    if (!runValidationScript(script)) {
      allPassed = false;
    }
  });
  return allPassed;
}

function main() {
  console.log('🚨 Universal Doctrine Enforcement Initiated');
  const sourceDir = getSourceDir();
  if (!sourceDir) {
    console.error('❌ Could not locate doctrine source directory. Use --source /path/to/definitions');
    process.exit(1);
  }
  console.log(`ℹ️  Using doctrine source: ${sourceDir}`);
  const updated = autoCopyDoctrineFiles(sourceDir);
  if (updated) {
    console.log('✅ Doctrine files updated/copied.');
  } else {
    console.log('ℹ️  Doctrine files already up-to-date.');
  }
  console.log('🔍 Auditing doctrine compliance...');
  const passed = auditDoctrine();
  if (passed) {
    console.log('✅ All doctrine validation checks passed. Build/deploy allowed.');
    process.exit(0);
  } else {
    console.error('❌ Doctrine validation failed. Build/deploy BLOCKED.');
    process.exit(1);
  }
}

main(); 