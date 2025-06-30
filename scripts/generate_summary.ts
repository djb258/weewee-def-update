import fs from 'fs';
import path from 'path';

interface SummaryData {
  timestamp: string;
  packageInfo: {
    name: string;
    version: string;
    scripts: Record<string, string>;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };
  doctrine: {
    lastModified: string;
    sections: string[];
  };
  scripts: {
    total: number;
    categories: Record<string, string[]>;
  };
  husky: {
    hooks: string[];
    lintStaged: Record<string, string[]>;
  };
  machineSync: {
    features: string[];
    scripts: string[];
    configFiles: string[];
  };
  tools: {
    integrated: string[];
    status: Record<string, 'active' | 'configured' | 'missing'>;
  };
  tests: {
    total: number;
    files: string[];
  };
  schemas: {
    total: number;
    files: string[];
  };
}

function generateSummary(): SummaryData {
  const timestamp = new Date().toISOString();
  
  // Read package.json
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Read DOCTRINE.md
  const doctrineContent = fs.readFileSync('DOCTRINE.md', 'utf8');
  const doctrineStats = fs.statSync('DOCTRINE.md');
  
  // Extract doctrine sections
  const doctrineSections = doctrineContent
    .split('\n')
    .filter(line => line.startsWith('## '))
    .map(line => line.replace('## ', '').trim());
  
  // Analyze scripts
  const scripts = packageJson.scripts || {};
  const scriptCategories = {
    'Core': ['dev', 'build', 'test', 'lint', 'format'],
    'Tool Integration': ['mindpal', 'deerflow', 'render', 'make', 'firebase', 'bigquery', 'neon'],
    'Synchronization': ['sync-machines', 'sync-cursor', 'sync-tools', 'backup-config', 'validate-sync'],
    'Utility': ['generate-summary', 'validate', 'prepare']
  };
  
  const categorizedScripts: Record<string, string[]> = {};
  for (const [category, scriptNames] of Object.entries(scriptCategories)) {
    categorizedScripts[category] = scriptNames.filter(name => scripts[name]);
  }
  
  // Analyze Husky configuration
  const huskyHooks: string[] = [];
  const lintStaged: Record<string, string[]> = {};
  
  if (fs.existsSync('.husky')) {
    const huskyFiles = fs.readdirSync('.husky');
    huskyHooks = huskyFiles.filter(file => file !== 'README.md');
  }
  
  if (packageJson['lint-staged']) {
    Object.assign(lintStaged, packageJson['lint-staged']);
  }
  
  // Analyze machine synchronization features
  const machineSyncFeatures = [
    'Cross-platform Cursor configuration sync',
    'Tool-specific configuration management',
    'Automatic backup and restore',
    'SSH-based remote synchronization',
    'Validation and error reporting',
    'Notification system integration'
  ];
  
  const machineSyncScripts = [
    'sync_all_machines.ts',
    'cursor_config_sync.ts', 
    'tool_sync_manager.ts'
  ];
  
  const machineSyncConfigFiles = [
    'machine-sync-config.json',
    'tool-sync-config.json',
    'cursor-config/'
  ];
  
  // Analyze integrated tools
  const integratedTools = ['mindpal', 'deerflow', 'render', 'make', 'firebase', 'bigquery', 'neon'];
  const toolStatus: Record<string, 'active' | 'configured' | 'missing'> = {};
  
  for (const tool of integratedTools) {
    const scriptPath = `scripts/${tool}_integration.ts`;
    const testPath = `src/__tests__/${tool}.test.ts`;
    
    if (fs.existsSync(scriptPath) && fs.existsSync(testPath)) {
      toolStatus[tool] = 'active';
    } else if (fs.existsSync(scriptPath)) {
      toolStatus[tool] = 'configured';
    } else {
      toolStatus[tool] = 'missing';
    }
  }
  
  // Analyze test files
  const testFiles: string[] = [];
  if (fs.existsSync('src/__tests__')) {
    testFiles.push(...fs.readdirSync('src/__tests__').filter(file => file.endsWith('.test.ts')));
  }
  
  // Analyze schema files
  const schemaFiles: string[] = [];
  if (fs.existsSync('src/schemas')) {
    schemaFiles.push(...fs.readdirSync('src/schemas').filter(file => file.endsWith('.ts')));
  }
  if (fs.existsSync('schemas')) {
    schemaFiles.push(...fs.readdirSync('schemas').filter(file => file.endsWith('.json')));
  }
  
  return {
    timestamp,
    packageInfo: {
      name: packageJson.name,
      version: packageJson.version,
      scripts,
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {},
    },
    doctrine: {
      lastModified: doctrineStats.mtime.toISOString(),
      sections: doctrineSections,
    },
    scripts: {
      total: Object.keys(scripts).length,
      categories: categorizedScripts,
    },
    husky: {
      hooks: huskyHooks,
      lintStaged,
    },
    machineSync: {
      features: machineSyncFeatures,
      scripts: machineSyncScripts,
      configFiles: machineSyncConfigFiles,
    },
    tools: {
      integrated: integratedTools,
      status: toolStatus,
    },
    tests: {
      total: testFiles.length,
      files: testFiles,
    },
    schemas: {
      total: schemaFiles.length,
      files: schemaFiles,
    },
  };
}

function formatSummary(data: SummaryData): string {
  const lines: string[] = [];
  
  lines.push('# Cursor Blueprint Enforcer - Latest Summary');
  lines.push('');
  lines.push(`**Generated:** ${data.timestamp}`);
  lines.push('');
  
  // Package Information
  lines.push('## 📦 Package Information');
  lines.push('');
  lines.push(`- **Name:** ${data.packageInfo.name}`);
  lines.push(`- **Version:** ${data.packageInfo.version}`);
  lines.push(`- **Total Scripts:** ${data.scripts.total}`);
  lines.push(`- **Dependencies:** ${Object.keys(data.packageInfo.dependencies).length}`);
  lines.push(`- **Dev Dependencies:** ${Object.keys(data.packageInfo.devDependencies).length}`);
  lines.push('');
  
  // Script Categories
  lines.push('## 🚀 Available Scripts');
  lines.push('');
  for (const [category, scriptList] of Object.entries(data.scripts.categories)) {
    lines.push(`### ${category} (${scriptList.length})`);
    for (const script of scriptList) {
      lines.push(`- \`npm run ${script}\` - ${data.packageInfo.scripts[script] || 'No description'}`);
    }
    lines.push('');
  }
  
  // Machine Synchronization
  lines.push('## 🔄 Machine Synchronization');
  lines.push('');
  lines.push('### Features');
  for (const feature of data.machineSync.features) {
    lines.push(`- ✅ ${feature}`);
  }
  lines.push('');
  
  lines.push('### Scripts');
  for (const script of data.machineSync.scripts) {
    lines.push(`- \`scripts/${script}\` - Machine synchronization script`);
  }
  lines.push('');
  
  lines.push('### Configuration Files');
  for (const configFile of data.machineSync.configFiles) {
    lines.push(`- \`${configFile}\` - Configuration file`);
  }
  lines.push('');
  
  // Tool Integration Status
  lines.push('## 🛠️ Tool Integration Status');
  lines.push('');
  for (const tool of data.tools.integrated) {
    const status = data.tools.status[tool];
    const statusIcon = status === 'active' ? '✅' : status === 'configured' ? '⚠️' : '❌';
    lines.push(`- ${statusIcon} **${tool}** - ${status}`);
  }
  lines.push('');
  
  // Doctrine Information
  lines.push('## 📚 Doctrine & Documentation');
  lines.push('');
  lines.push(`- **Last Modified:** ${data.doctrine.lastModified}`);
  lines.push(`- **Sections:** ${data.doctrine.sections.length}`);
  lines.push('');
  lines.push('### Doctrine Sections');
  for (const section of data.doctrine.sections) {
    lines.push(`- ${section}`);
  }
  lines.push('');
  
  // Quality Assurance
  lines.push('## 🧪 Quality Assurance');
  lines.push('');
  lines.push(`- **Total Tests:** ${data.tests.total}`);
  lines.push(`- **Test Files:** ${data.tests.files.join(', ')}`);
  lines.push('');
  lines.push(`- **Total Schemas:** ${data.schemas.total}`);
  lines.push(`- **Schema Files:** ${data.schemas.files.join(', ')}`);
  lines.push('');
  
  // Husky Configuration
  lines.push('## 🔒 Git Hooks & Automation');
  lines.push('');
  lines.push(`- **Husky Hooks:** ${data.husky.hooks.length}`);
  for (const hook of data.husky.hooks) {
    lines.push(`  - \`${hook}\``);
  }
  lines.push('');
  
  if (Object.keys(data.husky.lintStaged).length > 0) {
    lines.push('### Lint-Staged Configuration');
    for (const [pattern, commands] of Object.entries(data.husky.lintStaged)) {
      lines.push(`- \`${pattern}\`: ${commands.join(', ')}`);
    }
    lines.push('');
  }
  
  // Quick Start Commands
  lines.push('## ⚡ Quick Start Commands');
  lines.push('');
  lines.push('```bash');
  lines.push('# Setup and installation');
  lines.push('./setup.sh');
  lines.push('');
  lines.push('# Sync all machines');
  lines.push('npm run sync-machines');
  lines.push('');
  lines.push('# Sync Cursor configuration');
  lines.push('npm run sync-cursor export');
  lines.push('npm run sync-cursor import');
  lines.push('');
  lines.push('# Sync tool configurations');
  lines.push('npm run sync-tools');
  lines.push('');
  lines.push('# Run all validations');
  lines.push('npm run validate');
  lines.push('');
  lines.push('# Generate updated summary');
  lines.push('npm run generate-summary');
  lines.push('```');
  lines.push('');
  
  // Environment Variables
  lines.push('## 🔐 Required Environment Variables');
  lines.push('');
  lines.push('### Machine Synchronization');
  lines.push('- `SYNC_BACKUP_ENABLED` - Enable automatic backups');
  lines.push('- `SYNC_VALIDATION_ENABLED` - Enable sync validation');
  lines.push('- `SYNC_NOTIFICATION_ENABLED` - Enable notifications');
  lines.push('- `SYNC_SSH_KEY_PATH` - SSH key path for remote sync');
  lines.push('');
  lines.push('### Cursor Configuration');
  lines.push('- `CURSOR_SETTINGS_PATH` - Cursor settings file path');
  lines.push('- `CURSOR_KEYBINDINGS_PATH` - Cursor keybindings file path');
  lines.push('- `CURSOR_EXTENSIONS_PATH` - Cursor extensions directory');
  lines.push('- `CURSOR_SNIPPETS_PATH` - Cursor snippets directory');
  lines.push('');
  lines.push('### Remote Machine Configuration');
  lines.push('- `REMOTE_HOST_1` - First remote server hostname');
  lines.push('- `REMOTE_USER_1` - First remote server username');
  lines.push('- `REMOTE_PROJECT_PATH_1` - First remote project path');
  lines.push('');
  lines.push('### Tool API Keys');
  lines.push('- `MINDPAL_API_KEY` - MindPal API key');
  lines.push('- `DEERFLOW_API_KEY` - DeerFlow API key');
  lines.push('- `RENDER_API_KEY` - Render API key');
  lines.push('- `MAKE_API_KEY` - Make.com API key');
  lines.push('');
  
  // Recent Changes
  lines.push('## 📝 Recent Changes');
  lines.push('');
  lines.push('- ✅ Added comprehensive machine synchronization system');
  lines.push('- ✅ Implemented Cursor configuration sync (settings, keybindings, extensions)');
  lines.push('- ✅ Created tool-specific sync management');
  lines.push('- ✅ Added backup and restore capabilities');
  lines.push('- ✅ Implemented cross-platform support (Windows, macOS, Linux)');
  lines.push('- ✅ Added SSH-based remote synchronization');
  lines.push('- ✅ Created validation and error reporting system');
  lines.push('- ✅ Integrated notification system (Slack, Discord, Email)');
  lines.push('- ✅ Added automated sync scheduling capabilities');
  lines.push('');
  
  return lines.join('\n');
}

// Main execution
if (require.main === module) {
  try {
    console.log('Generating project summary...');
    
    const summaryData = generateSummary();
    const formattedSummary = formatSummary(summaryData);
    
    // Write to LATEST_SUMMARY.md
    fs.writeFileSync('LATEST_SUMMARY.md', formattedSummary);
    
    console.log('✅ Summary generated successfully!');
    console.log('📄 Written to: LATEST_SUMMARY.md');
    console.log('');
    console.log('📊 Summary Statistics:');
    console.log(`   - Scripts: ${summaryData.scripts.total}`);
    console.log(`   - Tools: ${summaryData.tools.integrated.length} integrated`);
    console.log(`   - Tests: ${summaryData.tests.total} files`);
    console.log(`   - Schemas: ${summaryData.schemas.total} files`);
    console.log(`   - Machine Sync Features: ${summaryData.machineSync.features.length}`);
    
  } catch (error) {
    console.error('❌ Error generating summary:', error);
    process.exit(1);
  }
}

export { generateSummary, formatSummary }; 