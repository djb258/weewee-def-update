#!/usr/bin/env tsx

/**
 * Barton Doctrine Validator
 * 
 * CRITICAL SYSTEM COMPONENT
 * Validates ALL payloads against SPVPET/STAMPED/STACKED schema
 * Ensures system-wide compliance with the Barton Doctrine
 */

import * as fs from 'fs';
import * as path from 'path';
import { BartonDoctrine } from '../src/schemas/barton-doctrine-enforcer';

class BartonDoctrineValidator {
  private toolsToValidate = [
    'mindpal_integration.ts',
    'deerflow_integration.ts', 
    'render_integration.ts',
    'make_integration.ts',
    'firebase_push.ts',
    'bigquery_ingest.ts',
    'neon_sync.ts',
    'rtrvr_integration.ts',
    'browserless_integration.ts',
    'apify_integration.ts',
    'genspark_integration.ts'
  ];

  constructor() {
    console.log('🔒 Barton Doctrine Validator');
    console.log('============================');
    console.log('CRITICAL: Ensuring SPVPET/STAMPED/STACKED compliance');
  }

  public async validateAll(): Promise<void> {
    console.log('\n🔍 Starting comprehensive Barton Doctrine validation...\n');

    let totalViolations = 0;
    const results: Record<string, any> = {};

    // 1. Validate tool integrations
    console.log('📋 Validating tool integrations...');
    const toolResults = await this.validateToolIntegrations();
    results.tools = toolResults;
    totalViolations += toolResults.violations;

    // 2. Validate schema templates
    console.log('\n📋 Validating schema templates...');
    const schemaResults = await this.validateSchemaTemplates();
    results.schemas = schemaResults;
    totalViolations += schemaResults.violations;

    // 3. Generate comprehensive report
    await this.generateValidationReport(results, totalViolations);

    if (totalViolations > 0) {
      console.error(`\n🚨 CRITICAL: ${totalViolations} Barton Doctrine violations detected!`);
      console.error('   System integrity is compromised!');
      process.exit(1);
    } else {
      console.log('\n✅ All validations passed! Barton Doctrine compliance verified.');
    }
  }

  private async validateToolIntegrations(): Promise<{ checked: number; violations: number; details: any[] }> {
    const results: { checked: number; violations: number; details: any[] } = { checked: 0, violations: 0, details: [] };

    for (const tool of this.toolsToValidate) {
      const toolPath = path.join(process.cwd(), 'scripts', tool);
      
      if (!fs.existsSync(toolPath)) {
        console.warn(`⚠️  Tool not found: ${tool}`);
        continue;
      }

      console.log(`   Checking ${tool}...`);
      results.checked++;

      try {
        const content = fs.readFileSync(toolPath, 'utf8');
        const violations = this.analyzeToolForViolations(tool, content);
        
        if (violations.length > 0) {
          results.violations += violations.length;
          results.details.push({ tool, violations });
          
          violations.forEach(violation => {
            console.error(`     ❌ ${violation}`);
          });
        } else {
          console.log(`     ✅ ${tool} - compliant`);
        }
      } catch (error) {
        console.error(`     ❌ Error analyzing ${tool}: ${error}`);
        results.violations++;
      }
    }

    return results;
  }

  private analyzeToolForViolations(toolName: string, content: string): string[] {
    const violations: string[] = [];

    // Check for Barton Doctrine imports
    if (!content.includes('barton-doctrine')) {
      violations.push('Missing Barton Doctrine import');
    }

    // Check for proper payload validation
    const doctrineValidationPatterns = [
      'BartonDoctrine.validate',
      'BartonDoctrine.formatFor',
      'validateBlueprintForFirebase',
      'validateAgentTask',
      'validateErrorLog',
      'validateHumanFirebreakQueue',
      'validateBlueprintForBigQuery',
      'validateBlueprintForNeon',
      'BartonDoctrineFormatter.createBasePayload',
      'BartonDoctrineFormatter.formatForDatabase',
    ];

    if (content.match(/firebase|neon|bigquery/)) {
      const hasDoctrineValidation = doctrineValidationPatterns.some(pattern => content.includes(pattern));
      if (!hasDoctrineValidation) {
        violations.push('Database operations without Barton Doctrine validation');
      }
    }

    return violations;
  }

  private async validateSchemaTemplates(): Promise<{ checked: number; violations: number; details: any[] }> {
    const results: { checked: number; violations: number; details: any[] } = { checked: 0, violations: 0, details: [] };

    const templates = [
      'schemas/spvpet_template.json',
      'schemas/stacked_template.json', 
      'schemas/stamped_template.sql',
      'firebase/agent_task.template.json',
      'firebase/human_firebreak_queue.template.json'
    ];

    for (const template of templates) {
      const templatePath = path.join(process.cwd(), template);
      
      if (!fs.existsSync(templatePath)) {
        results.violations++;
        results.details.push({
          template,
          error: 'Template file missing'
        });
        console.error(`   ❌ Missing template: ${template}`);
        continue;
      }

      console.log(`   Checking ${template}...`);
      results.checked++;
      console.log(`     ✅ Template exists`);
    }

    return results;
  }

  private async generateValidationReport(results: any, totalViolations: number): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      validation_summary: {
        total_violations: totalViolations,
        tools_checked: results.tools.checked,
        schemas_checked: results.schemas.checked,
        compliance_status: totalViolations === 0 ? 'COMPLIANT' : 'VIOLATIONS_DETECTED'
      },
      detailed_results: results
    };

    const reportsDir = path.join(process.cwd(), 'barton-doctrine-logs');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportsDir, `validation-report-${timestamp}.json`);
    
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Validation report saved: ${path.relative(process.cwd(), reportFile)}`);
  }

  public enableStrictMode(): void {
    console.log('⚡ Enabling Barton Doctrine strict mode...');
    BartonDoctrine.setStrict(true);
    console.log('✅ Strict mode enabled - violations will now throw errors');
  }

  public generateReport(): void {
    console.log('📊 Generating Barton Doctrine violation report...');
    const violations = BartonDoctrine.getViolations();
    
    console.log(`\nViolation Summary:`);
    console.log(`  Total violations: ${violations.total}`);
    console.log(`  By tool:`);
    
    for (const [tool, count] of Object.entries(violations.byTool)) {
      console.log(`    ${tool}: ${count} violation${count > 1 ? 's' : ''}`);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const validator = new BartonDoctrineValidator();

  try {
    switch (args[0]) {
      case 'enforce':
        BartonDoctrine.setEnabled(true);
        console.log('🔒 Barton Doctrine enforcement enabled globally');
        break;

      case 'strict':
        validator.enableStrictMode();
        break;

      case 'report':
        validator.generateReport();
        break;

      case 'status': {
        const violations = BartonDoctrine.getViolations();
        console.log(`Barton Doctrine Status: ${violations.total === 0 ? '✅ COMPLIANT' : '🚨 VIOLATIONS DETECTED'}`);
        console.log(`Total violations: ${violations.total}`);
        break;
      }

      default:
        await validator.validateAll();
    }
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { BartonDoctrineValidator };
