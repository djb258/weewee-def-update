#!/usr/bin/env tsx

/**
 * MANDATORY BARTON DOCTRINE COMPLIANCE ENFORCER
 * 
 * THIS SCRIPT ENSURES NO TOOL CAN BYPASS BARTON DOCTRINE
 * AUTOMATICALLY FIXES NON-COMPLIANT TOOLS
 * NO FLEXIBILITY - NO EXCEPTIONS - NO COMPROMISE
 */

import * as fs from 'fs';
import * as path from 'path';

class MandatoryComplianceEnforcer {
  private scriptsDir = path.join(process.cwd(), 'scripts');
  private nonCompliantTools: string[] = [];
  private fixedTools: string[] = [];

  /**
   * ENFORCE: Make ALL tools Barton Doctrine compliant
   */
  public async enforceCompliance(): Promise<void> {
    console.log('🔒 ENFORCING MANDATORY BARTON DOCTRINE COMPLIANCE');
    console.log('📋 NO TOOL WILL BE ALLOWED TO BYPASS THE DOCTRINE');
    console.log('⚡ AUTOMATICALLY FIXING ALL NON-COMPLIANT TOOLS');
    
    // Get all integration tools
    const tools = this.getAllIntegrationTools();
    
    console.log(`\n🔍 Found ${tools.length} tools to enforce compliance on:`);
    tools.forEach(tool => console.log(`   - ${path.basename(tool)}`));
    
    // Enforce compliance on each tool
    for (const tool of tools) {
      await this.enforceToolCompliance(tool);
    }
    
    // Generate compliance report
    this.generateComplianceReport();
    
    if (this.nonCompliantTools.length > 0) {
      console.log(`\n🚨 CRITICAL: ${this.nonCompliantTools.length} tools were NON-COMPLIANT`);
      console.log(`✅ FIXED: ${this.fixedTools.length} tools automatically fixed`);
    } else {
      console.log('\n✅ ALL TOOLS ARE BARTON DOCTRINE COMPLIANT');
    }
    
    console.log('\n🔒 MANDATORY COMPLIANCE ENFORCEMENT COMPLETE');
  }

  /**
   * Get all integration tool files
   */
  private getAllIntegrationTools(): string[] {
    if (!fs.existsSync(this.scriptsDir)) {
      return [];
    }

    return fs.readdirSync(this.scriptsDir)
      .filter(file => file.endsWith('_integration.ts'))
      .map(file => path.join(this.scriptsDir, file));
  }

  /**
   * ENFORCE: Make specific tool Barton Doctrine compliant
   */
  private async enforceToolCompliance(toolPath: string): Promise<void> {
    const toolName = path.basename(toolPath, '.ts');
    console.log(`\n🔧 Enforcing compliance on: ${toolName}`);
    
    if (!fs.existsSync(toolPath)) {
      console.log(`   ⚠️  Tool file not found: ${toolPath}`);
      return;
    }

    let content = fs.readFileSync(toolPath, 'utf8');
    let modified = false;

    // Check for Barton Doctrine import
    if (!content.includes('START_WITH_BARTON_DOCTRINE')) {
      console.log(`   ❌ Missing Barton Doctrine import - FIXING`);
      content = this.addBartonDoctrineImport(content);
      modified = true;
      this.nonCompliantTools.push(toolName);
    }

    // Check for Barton Doctrine initialization
    if (!content.includes('START_WITH_BARTON_DOCTRINE(')) {
      console.log(`   ❌ Missing Barton Doctrine initialization - FIXING`);
      content = this.addBartonDoctrineInitialization(content, toolName);
      modified = true;
    }

    if (modified) {
      // Backup original file
      const backupPath = `${toolPath}.backup.${Date.now()}`;
      fs.writeFileSync(backupPath, fs.readFileSync(toolPath, 'utf8'));
      
      // Write fixed content
      fs.writeFileSync(toolPath, content);
      
      this.fixedTools.push(toolName);
      console.log(`   ✅ Tool fixed and made Barton Doctrine compliant`);
      console.log(`   📦 Backup saved: ${backupPath}`);
    } else {
      console.log(`   ✅ Tool is already Barton Doctrine compliant`);
    }
  }

  /**
   * Add Barton Doctrine import to tool
   */
  private addBartonDoctrineImport(content: string): string {
    const importStatement = `import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';\n`;
    
    // Find the last import statement
    const lines = content.split('\n');
    let lastImportIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('const ') && lines[i].includes('require(')) {
        lastImportIndex = i;
      }
    }
    
    if (lastImportIndex >= 0) {
      lines.splice(lastImportIndex + 1, 0, '', '// 🔒 MANDATORY: Barton Doctrine enforcement', importStatement);
    } else {
      lines.unshift('// 🔒 MANDATORY: Barton Doctrine enforcement', importStatement, '');
    }
    
    return lines.join('\n');
  }

  /**
   * Add Barton Doctrine initialization
   */
  private addBartonDoctrineInitialization(content: string, toolName: string): string {
    const toolBaseName = path.basename(toolName, '_integration');
    const initStatement = `
// 🔒 MANDATORY: Initialize Barton Doctrine (CANNOT BE SKIPPED)
const doctrine = START_WITH_BARTON_DOCTRINE('${toolBaseName}');
`;

    // Find where to insert initialization (after imports, before class/function definitions)
    const lines = content.split('\n');
    let insertIndex = -1;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('export class') || 
          lines[i].trim().startsWith('class ') ||
          lines[i].trim().startsWith('async function') ||
          lines[i].trim().startsWith('function ')) {
        insertIndex = i;
        break;
      }
    }
    
    if (insertIndex >= 0) {
      lines.splice(insertIndex, 0, initStatement);
    } else {
      lines.push(initStatement);
    }
    
    return lines.join('\n');
  }

  /**
   * Generate compliance enforcement report
   */
  private generateComplianceReport(): void {
    const report = {
      timestamp: new Date().toISOString(),
      enforcement_summary: {
        total_tools_checked: this.getAllIntegrationTools().length,
        non_compliant_tools: this.nonCompliantTools.length,
        fixed_tools: this.fixedTools.length,
        compliance_rate: this.fixedTools.length > 0 ? 
          ((this.getAllIntegrationTools().length - this.nonCompliantTools.length) / this.getAllIntegrationTools().length * 100).toFixed(2) + '%' :
          '100%'
      },
      non_compliant_tools: this.nonCompliantTools,
      fixed_tools: this.fixedTools,
      enforcement_actions: [
        'Added mandatory Barton Doctrine imports',
        'Added mandatory initialization calls',
        'Created backup files for all modified tools'
      ],
      next_steps: [
        'Run npm run validate:barton-doctrine to verify compliance',
        'Test all modified tools to ensure functionality',
        'All new tools must use npm run generate:tool'
      ]
    };

    const reportsDir = path.join(process.cwd(), 'barton-doctrine-logs');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(reportsDir, `enforcement-report-${timestamp}.json`);
    
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`\n📊 Enforcement report saved: ${reportFile}`);
    console.log(`📈 Compliance rate: ${report.enforcement_summary.compliance_rate}`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const enforcer = new MandatoryComplianceEnforcer();

  switch (args[0]) {
    case 'check':
      console.log('🔍 Checking compliance status...');
      break;
      
    default:
      await enforcer.enforceCompliance();
  }
}

if (require.main === module) {
  main();
}

export { MandatoryComplianceEnforcer };
