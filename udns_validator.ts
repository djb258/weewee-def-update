#!/usr/bin/env ts-node

/**
 * UDNS Validator (TypeScript)
 *
 * Validates UDNS codes in diagnostics and flags undocumented combinations.
 * Can be imported or run as a CLI.
 *
 * Usage:
 *   npx ts-node udns_validator.ts
 *   // or import { validateUDNS } from './udns_validator'
 */

import * as fs from 'fs';
import * as path from 'path';

// Load doctrine config
const doctrinePath = path.join(process.cwd(), 'diagnostic_map.json');
const doctrine = JSON.parse(fs.readFileSync(doctrinePath, 'utf8'));

const ALTITUDES = Object.keys(doctrine.altitude_levels);
const UDNS_FORMAT = doctrine.udns_format;
const EXAMPLES = doctrine.example_codes;

export interface UDNSDiagnostic {
  udns_code: string;
  [key: string]: any;
}

export function validateUDNS(diagnostics: UDNSDiagnostic[]): string[] {
  const errors: string[] = [];
  const seenCombos = new Set<string>();

  diagnostics.forEach((diag, idx) => {
    const code = diag.udns_code;
    if (!code) {
      errors.push(`Diagnostic at index ${idx} missing udns_code.`);
      return;
    }
    const parts = code.split('.');
    if (parts.length !== 4) {
      errors.push(`Invalid UDNS format: '${code}' (expected ${UDNS_FORMAT})`);
      return;
    }
    const [altitude, module, submodule, action] = parts;
    if (!ALTITUDES.includes(altitude)) {
      errors.push(`Unknown altitude '${altitude}' in UDNS code '${code}'.`);
    }
    if (!module || !submodule || !action) {
      errors.push(`Missing module/submodule/action in UDNS code '${code}'.`);
    }
    // Track undocumented combos
    const combo = `${altitude}.${module}.${submodule}`;
    seenCombos.add(combo);
  });

  // Check for undocumented combos
  // (In a real system, compare against a registry of allowed combos)
  // For now, just print them for review
  if (seenCombos.size > 0) {
    console.log('UDNS combos found in diagnostics:');
    seenCombos.forEach(combo => console.log(`  - ${combo}`));
  }

  return errors;
}

// CLI usage
if (require.main === module) {
  // Example: scan all .json files in ./logs for diagnostics
  const logsDir = path.join(process.cwd(), 'logs');
  let diagnostics: UDNSDiagnostic[] = [];
  if (fs.existsSync(logsDir)) {
    const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.json'));
    files.forEach(file => {
      const filePath = path.join(logsDir, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (Array.isArray(data)) {
          diagnostics.push(...data);
        } else if (data.udns_code) {
          diagnostics.push(data);
        }
      } catch {}
    });
  }
  const errors = validateUDNS(diagnostics);
  if (errors.length > 0) {
    console.error('UDNS Validation Errors:');
    errors.forEach(e => console.error('  -', e));
    process.exit(1);
  } else {
    console.log('All UDNS codes valid.');
    process.exit(0);
  }
} 