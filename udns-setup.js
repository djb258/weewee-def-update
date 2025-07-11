#!/usr/bin/env node

/**
 * UDNS Setup Script
 * 
 * Sets up Universal Diagnostic Numbering Schema for ORBT + UDNS doctrine
 * 
 * Usage: node udns-setup.js
 * 
 * - Assigns unique blueprint ID
 * - Creates diagnostic_map.json
 * - Sets up UDNS logging structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORBT_DIR = path.join(process.cwd(), 'orbt');
const BLUEPRINT_ID_FILE = path.join(process.cwd(), '.blueprint-id');
const DIAGNOSTIC_MAP_FILE = path.join(process.cwd(), 'diagnostic_map.json');

// UDNS Altitude Definitions
const UDNS_ALTITUDES = {
  '10': 'UI (User Interface)',
  '20': 'API / Service (Application Programming Interface)',
  '30': 'DB / Persistence (Database)',
  '40': 'Agents / Orchestration (AI Agents, Workflows)',
  '50': 'External (Webhooks, Third-Party Integrations)',
  '60+': 'Reserved (Future Use)'
};

class UDNSSetup {
  constructor() {
    this.blueprintId = null;
    this.diagnosticMap = {
      blueprint_id: null,
      name: '',
      version: '1.0.0',
      udns_schema: 'ALTITUDE.MODULE.SUBMODULE.ACTION',
      altitudes: UDNS_ALTITUDES,
      diagnostic_map: {
        modules: {}
      }
    };
  }

  /**
   * Generate unique blueprint ID
   */
  generateBlueprintId() {
    // For now, use timestamp-based ID
    // In production, this should query a central registry
    const timestamp = Date.now();
    const id = Math.floor(timestamp / 1000) % 1000;
    this.blueprintId = `BP-${id.toString().padStart(3, '0')}`;
    
    // Check if ID already exists
    if (fs.existsSync(BLUEPRINT_ID_FILE)) {
      const existingId = fs.readFileSync(BLUEPRINT_ID_FILE, 'utf8').trim();
      console.log(`ℹ️  Blueprint ID already assigned: ${existingId}`);
      this.blueprintId = existingId;
    } else {
      fs.writeFileSync(BLUEPRINT_ID_FILE, this.blueprintId, 'utf8');
      console.log(`✅ Assigned Blueprint ID: ${this.blueprintId}`);
    }
  }

  /**
   * Create diagnostic map structure
   */
  createDiagnosticMap() {
    this.diagnosticMap.blueprint_id = this.blueprintId;
    this.diagnosticMap.name = this.getProjectName();
    
    // Add common module templates
    this.diagnosticMap.diagnostic_map.modules = {
      'user-authentication': {
        udns_codes: [
          '10.UI.auth.login',
          '10.UI.auth.register',
          '20.API.auth.login',
          '20.API.auth.register',
          '30.DB.user.store',
          '30.DB.user.verify'
        ],
        visual_docs: 'docs/modules/user-auth.md',
        human_readable: 'User authentication system for login and registration'
      },
      'data-management': {
        udns_codes: [
          '10.UI.data.display',
          '10.UI.data.edit',
          '20.API.data.create',
          '20.API.data.read',
          '20.API.data.update',
          '20.API.data.delete',
          '30.DB.data.store',
          '30.DB.data.query'
        ],
        visual_docs: 'docs/modules/data-management.md',
        human_readable: 'Data management and CRUD operations'
      },
      'system-monitoring': {
        udns_codes: [
          '40.AGENT.monitor.health',
          '40.AGENT.monitor.performance',
          '50.EXTERNAL.webhook.alert',
          '30.DB.audit.log'
        ],
        visual_docs: 'docs/modules/system-monitoring.md',
        human_readable: 'System health monitoring and alerting'
      }
    };
  }

  /**
   * Get project name from package.json or directory
   */
  getProjectName() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return packageJson.name || path.basename(process.cwd());
    } catch (error) {
      return path.basename(process.cwd());
    }
  }

  /**
   * Write diagnostic map to file
   */
  writeDiagnosticMap() {
    fs.writeFileSync(
      DIAGNOSTIC_MAP_FILE,
      JSON.stringify(this.diagnosticMap, null, 2),
      'utf8'
    );
    console.log(`✅ Created diagnostic_map.json`);
  }

  /**
   * Create UDNS logging utility
   */
  createUDNSLogger() {
    const loggerContent = `#!/usr/bin/env node

/**
 * UDNS Logger Utility
 * 
 * Provides structured logging with UDNS codes and blueprint ID
 */

import fs from 'fs';
import path from 'path';

class UDNSLogger {
  constructor() {
    this.blueprintId = this.getBlueprintId();
    this.logFile = path.join(process.cwd(), 'logs', 'udns.log');
    this.ensureLogDirectory();
  }

  getBlueprintId() {
    try {
      return fs.readFileSync('.blueprint-id', 'utf8').trim();
    } catch (error) {
      return 'BP-UNKNOWN';
    }
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(udnsCode, message, level = 'info', additionalData = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      blueprint_id: this.blueprintId,
      udns_code: udnsCode,
      level: level,
      message: message,
      ...additionalData
    };

    const logLine = \`[\${this.blueprintId}][\${udnsCode}] \${message}\`;
    
    // Console output
    console.log(logLine);
    
    // File output
    fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\\n');
    
    return logEntry;
  }

  info(udnsCode, message, data = {}) {
    return this.log(udnsCode, message, 'info', data);
  }

  error(udnsCode, message, data = {}) {
    return this.log(udnsCode, message, 'error', data);
  }

  warn(udnsCode, message, data = {}) {
    return this.log(udnsCode, message, 'warn', data);
  }

  debug(udnsCode, message, data = {}) {
    return this.log(udnsCode, message, 'debug', data);
  }
}

export default UDNSLogger;
`;

    fs.writeFileSync('udns-logger.js', loggerContent, 'utf8');
    console.log(`✅ Created UDNS logger utility`);
  }

  /**
   * Update ORBT status with UDNS info
   */
  updateORBTStatus() {
    const statusPath = path.join(ORBT_DIR, 'ORBT_STATUS.json');
    
    if (fs.existsSync(statusPath)) {
      try {
        const status = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
        status.blueprint_id = this.blueprintId;
        status.udns_implemented = true;
        status.diagnostic_map_generated = true;
        
        fs.writeFileSync(statusPath, JSON.stringify(status, null, 2), 'utf8');
        console.log(`✅ Updated ORBT status with UDNS information`);
      } catch (error) {
        console.log(`⚠️  Could not update ORBT status: ${error.message}`);
      }
    }
  }

  /**
   * Generate setup report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🔢 UDNS SETUP COMPLETE');
    console.log('='.repeat(60));
    console.log(`Blueprint ID: ${this.blueprintId}`);
    console.log(`Project Name: ${this.diagnosticMap.name}`);
    console.log(`Diagnostic Map: diagnostic_map.json`);
    console.log(`UDNS Logger: udns-logger.js`);
    console.log('='.repeat(60));

    console.log('\n📋 UDNS ALTITUDES:');
    console.log('-'.repeat(40));
    Object.entries(UDNS_ALTITUDES).forEach(([altitude, description]) => {
      console.log(`${altitude}: ${description}`);
    });

    console.log('\n💡 NEXT STEPS:');
    console.log('-'.repeat(40));
    console.log('1. Customize diagnostic_map.json for your modules');
    console.log('2. Import UDNS logger in your code');
    console.log('3. Add UDNS codes to all logging statements');
    console.log('4. Run: node udns-validate.js to verify setup');
    console.log('5. Update ORBT manuals with UDNS information');

    console.log('\n📝 USAGE EXAMPLE:');
    console.log('-'.repeat(40));
    console.log('import UDNSLogger from \'./udns-logger.js\';');
    console.log('const logger = new UDNSLogger();');
    console.log('logger.info(\'10.UI.form.submit\', \'User submitted form\');');
    console.log('logger.error(\'20.API.auth.login\', \'Login failed\', { userId: 123 });');

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Run complete UDNS setup
   */
  async run() {
    console.log('🔢 UDNS Setup Initiated');
    console.log('Setting up Universal Diagnostic Numbering Schema...\n');
    
    this.generateBlueprintId();
    this.createDiagnosticMap();
    this.writeDiagnosticMap();
    this.createUDNSLogger();
    this.updateORBTStatus();
    this.generateReport();
  }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new UDNSSetup();
  setup.run().catch(error => {
    console.error('❌ UDNS Setup Failed:', error.message);
    process.exit(1);
  });
}

export default UDNSSetup; 