#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

interface DiagnosticMap {
  doctrine: boolean;
  altitude_levels: Record<string, string>;
  color_codes: Record<string, string>;
  error_promotion_logic: Record<string, string>;
  example_codes: string[];
  udns_format: string;
  doctrine_note: string;
}

interface FileDiagnostic {
  altitude: string;
  module: string;
  submodule: string;
  action: string;
  udns_code: string;
}

class DiagnosticInjector {
  private diagnosticMap: DiagnosticMap;
  private injectedFiles: Set<string> = new Set();

  constructor() {
    this.diagnosticMap = this.loadDiagnosticMap();
  }

  private loadDiagnosticMap(): DiagnosticMap {
    const mapPath = path.join(process.cwd(), 'diagnostic_map.json');
    if (!fs.existsSync(mapPath)) {
      throw new Error('diagnostic_map.json not found. ORBT doctrine violation.');
    }
    return JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  }

  private getFileDiagnostic(filePath: string): FileDiagnostic {
    const ext = path.extname(filePath);
    const dir = path.dirname(filePath);
    const fileName = path.basename(filePath, ext);
    
    // Determine altitude based on directory structure
    let altitude = '20'; // Default to API level
    let module = 'UNKNOWN';
    let submodule = 'UNKNOWN';
    let action = 'UNKNOWN';

    // UI Components
    if (dir.includes('components') || dir.includes('ui') || dir.includes('pages')) {
      altitude = '10';
      module = 'UI';
      submodule = fileName;
      action = ext === '.tsx' ? 'render' : 'logic';
    }
    // API/Service files
    else if (dir.includes('api') || dir.includes('services') || dir.includes('controllers')) {
      altitude = '20';
      module = 'API';
      submodule = fileName;
      action = 'execute';
    }
    // Database/Persistence files
    else if (dir.includes('db') || dir.includes('database') || dir.includes('models') || 
             dir.includes('firebase') || dir.includes('firestore')) {
      altitude = '30';
      module = 'DB';
      submodule = fileName;
      action = 'persist';
    }
    // Agent/Orchestration files
    else if (dir.includes('agents') || dir.includes('workflows') || dir.includes('orchestration')) {
      altitude = '40';
      module = 'AGENT';
      submodule = fileName;
      action = 'orchestrate';
    }
    // External integration files
    else if (dir.includes('external') || dir.includes('webhooks') || dir.includes('integrations')) {
      altitude = '50';
      module = 'EXTERNAL';
      submodule = fileName;
      action = 'integrate';
    }
    // Configuration files
    else if (fileName.includes('config') || fileName.includes('setup')) {
      altitude = '20';
      module = 'CONFIG';
      submodule = fileName;
      action = 'configure';
    }
    // Test files
    else if (fileName.includes('test') || fileName.includes('spec')) {
      altitude = '20';
      module = 'TEST';
      submodule = fileName;
      action = 'validate';
    }

    const udns_code = `${altitude}.${module}.${submodule}.${action}`;

    return {
      altitude,
      module,
      submodule,
      action,
      udns_code
    };
  }

  private injectDiagnosticComment(filePath: string, diagnostic: FileDiagnostic): boolean {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if diagnostic comment already exists
    if (content.includes('// DIAGNOSTIC:')) {
      return false; // Already injected
    }

    const diagnosticComment = `// DIAGNOSTIC: ${diagnostic.udns_code} - ${this.diagnosticMap.altitude_levels[diagnostic.altitude]}`;
    
    // Inject at the top of the file after imports
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Find the end of imports
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('require(')) {
        insertIndex = i + 1;
      } else if (lines[i].trim() === '' && insertIndex > 0) {
        // Continue past empty lines after imports
        continue;
      } else if (insertIndex > 0 && lines[i].trim() !== '') {
        break;
      }
    }

    // Insert diagnostic comment
    lines.splice(insertIndex, 0, diagnosticComment, '');
    
    fs.writeFileSync(filePath, lines.join('\n'));
    return true;
  }

  private shouldProcessFile(filePath: string): boolean {
    const ext = path.extname(filePath);
    const validExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    
    // Skip node_modules, build directories, and already processed files
    if (filePath.includes('node_modules') || 
        filePath.includes('dist') || 
        filePath.includes('build') ||
        filePath.includes('.git') ||
        this.injectedFiles.has(filePath)) {
      return false;
    }

    return validExtensions.includes(ext);
  }

  public injectDiagnostics(directory: string = process.cwd()): void {
    console.log('🔍 ORBT Diagnostic Injector Starting...');
    console.log(`📁 Scanning directory: ${directory}`);
    
    let injectedCount = 0;
    let skippedCount = 0;

    const processDirectory = (dir: string) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          processDirectory(fullPath);
        } else if (stat.isFile() && this.shouldProcessFile(fullPath)) {
          try {
            const diagnostic = this.getFileDiagnostic(fullPath);
            const wasInjected = this.injectDiagnosticComment(fullPath, diagnostic);
            
            if (wasInjected) {
              console.log(`✅ Injected: ${diagnostic.udns_code} -> ${fullPath}`);
              injectedCount++;
              this.injectedFiles.add(fullPath);
            } else {
              skippedCount++;
            }
          } catch (error) {
            console.error(`❌ Error processing ${fullPath}:`, error);
          }
        }
      }
    };

    processDirectory(directory);
    
    console.log('\n📊 Diagnostic Injection Summary:');
    console.log(`✅ Files injected: ${injectedCount}`);
    console.log(`⏭️ Files skipped: ${skippedCount}`);
    console.log(`📋 Total processed: ${injectedCount + skippedCount}`);
    
    if (injectedCount > 0) {
      console.log('\n🎯 ORBT Doctrine Compliance: ENFORCED');
      console.log('🔒 All blueprint-generated modules now contain UDNS diagnostic codes');
    }
  }

  public validateDiagnostics(directory: string = process.cwd()): boolean {
    console.log('🔍 Validating diagnostic coverage...');
    
    let totalFiles = 0;
    let compliantFiles = 0;
    let nonCompliantFiles: string[] = [];

    const validateDirectory = (dir: string) => {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          validateDirectory(fullPath);
        } else if (stat.isFile() && this.shouldProcessFile(fullPath)) {
          totalFiles++;
          const content = fs.readFileSync(fullPath, 'utf8');
          
          if (content.includes('// DIAGNOSTIC:')) {
            compliantFiles++;
          } else {
            nonCompliantFiles.push(fullPath);
          }
        }
      }
    };

    validateDirectory(directory);
    
    console.log(`📊 Validation Results:`);
    console.log(`✅ Compliant files: ${compliantFiles}/${totalFiles}`);
    console.log(`❌ Non-compliant files: ${nonCompliantFiles.length}`);
    
    if (nonCompliantFiles.length > 0) {
      console.log('\n🚨 Non-compliant files (missing diagnostics):');
      nonCompliantFiles.forEach(file => console.log(`   - ${file}`));
      return false;
    }
    
    console.log('\n🎯 ORBT Doctrine Validation: PASSED');
    return true;
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const injector = new DiagnosticInjector();
  const args = process.argv.slice(2);
  
  if (args.includes('--validate')) {
    const isValid = injector.validateDiagnostics();
    process.exit(isValid ? 0 : 1);
  } else {
    injector.injectDiagnostics();
  }
}

export default DiagnosticInjector; 