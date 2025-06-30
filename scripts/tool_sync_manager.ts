import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { z } from 'zod';

// Tool Sync Configuration Schema
export const ToolSyncConfigSchema = z.object({
  tools: z.array(z.object({
    name: z.enum(['mindpal', 'deerflow', 'render', 'make', 'firebase', 'bigquery', 'neon']),
    enabled: z.boolean().default(true),
    configFiles: z.array(z.string()),
    envVars: z.array(z.string()),
    dependencies: z.array(z.string()).default([]),
  })),
  syncOptions: z.object({
    backupBeforeSync: z.boolean().default(true),
    validateAfterSync: z.boolean().default(true),
    installDependencies: z.boolean().default(true),
    updateEnvFile: z.boolean().default(true),
  }),
  targetMachines: z.array(z.object({
    name: z.string(),
    type: z.enum(['local', 'remote']),
    host: z.string().optional(),
    user: z.string().optional(),
    projectPath: z.string(),
  })),
});

export type ToolSyncConfig = z.infer<typeof ToolSyncConfigSchema>;

export class ToolSyncManager {
  private config: ToolSyncConfig;
  private syncLog: string[] = [];

  constructor(config: ToolSyncConfig) {
    this.config = ToolSyncConfigSchema.parse(config);
  }

  /**
   * Sync all tools across all target machines
   */
  async syncAllTools(): Promise<{
    success: boolean;
    results: Record<string, Record<string, { success: boolean; errors: string[] }>>;
    summary: string;
  }> {
    const results: Record<string, Record<string, { success: boolean; errors: string[] }>> = {};
    
    this.log('Starting tool synchronization across all machines...');

    for (const machine of this.config.targetMachines) {
      results[machine.name] = {};
      this.log(`Syncing tools for machine: ${machine.name}`);

      for (const tool of this.config.tools) {
        if (!tool.enabled) {
          this.log(`Skipping disabled tool: ${tool.name}`);
          continue;
        }

        try {
          const result = await this.syncTool(machine, tool);
          results[machine.name][tool.name] = result;
          
          if (result.success) {
            this.log(`✅ Successfully synced ${tool.name} to ${machine.name}`);
          } else {
            this.log(`❌ Failed to sync ${tool.name} to ${machine.name}: ${result.errors.join(', ')}`);
          }
        } catch (error) {
          results[machine.name][tool.name] = {
            success: false,
            errors: [error instanceof Error ? error.message : 'Unknown error'],
          };
          this.log(`❌ Error syncing ${tool.name} to ${machine.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    const successCount = Object.values(results).reduce((machineResults, toolResults) => {
      return machineResults + Object.values(toolResults).filter(r => r.success).length;
    }, 0);
    
    const totalCount = this.config.targetMachines.length * this.config.tools.filter(t => t.enabled).length;

    const summary = `Tool sync completed: ${successCount}/${totalCount} tool-machine combinations successful`;

    return {
      success: successCount === totalCount,
      results,
      summary,
    };
  }

  /**
   * Sync a specific tool to a specific machine
   */
  private async syncTool(machine: ToolSyncConfig['targetMachines'][0], tool: ToolSyncConfig['tools'][0]): Promise<{
    success: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      // 1. Backup existing configuration if enabled
      if (this.config.syncOptions.backupBeforeSync) {
        await this.backupToolConfig(machine, tool);
      }

      // 2. Sync configuration files
      for (const configFile of tool.configFiles) {
        try {
          await this.syncConfigFile(machine, tool, configFile);
        } catch (error) {
          errors.push(`Config file sync failed for ${configFile}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // 3. Update environment variables if enabled
      if (this.config.syncOptions.updateEnvFile) {
        try {
          await this.updateEnvFile(machine, tool);
        } catch (error) {
          errors.push(`Environment file update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // 4. Install dependencies if enabled
      if (this.config.syncOptions.installDependencies && tool.dependencies.length > 0) {
        try {
          await this.installDependencies(machine, tool);
        } catch (error) {
          errors.push(`Dependency installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // 5. Validate sync if enabled
      if (this.config.syncOptions.validateAfterSync) {
        try {
          await this.validateToolSync(machine, tool);
        } catch (error) {
          errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: errors.length === 0,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Backup tool configuration
   */
  private async backupToolConfig(machine: ToolSyncConfig['targetMachines'][0], tool: ToolSyncConfig['tools'][0]): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups', machine.name, tool.name, timestamp);

    this.log(`Creating backup for ${tool.name} on ${machine.name}`);

    if (machine.type === 'local') {
      // Local backup
      for (const configFile of tool.configFiles) {
        const sourcePath = path.join(machine.projectPath, configFile);
        if (fs.existsSync(sourcePath)) {
          const backupPath = path.join(backupDir, configFile);
          fs.mkdirSync(path.dirname(backupPath), { recursive: true });
          fs.copyFileSync(sourcePath, backupPath);
        }
      }
    } else {
      // Remote backup using rsync
      const rsyncCmd = `rsync -avz --backup-dir="${backupDir}" ${machine.user}@${machine.host}:${machine.projectPath}/{${tool.configFiles.join(',')}} ./backups/${machine.name}/${tool.name}/`;
      execSync(rsyncCmd, { stdio: 'inherit' });
    }
  }

  /**
   * Sync configuration file
   */
  private async syncConfigFile(machine: ToolSyncConfig['targetMachines'][0], tool: ToolSyncConfig['tools'][0], configFile: string): Promise<void> {
    const sourcePath = path.join(process.cwd(), configFile);
    const targetPath = path.join(machine.projectPath, configFile);

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source config file not found: ${sourcePath}`);
    }

    if (machine.type === 'local') {
      // Local sync
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.copyFileSync(sourcePath, targetPath);
    } else {
      // Remote sync using rsync
      const rsyncCmd = `rsync -avz "${sourcePath}" ${machine.user}@${machine.host}:"${targetPath}"`;
      execSync(rsyncCmd, { stdio: 'inherit' });
    }
  }

  /**
   * Update environment file
   */
  private async updateEnvFile(machine: ToolSyncConfig['targetMachines'][0], tool: ToolSyncConfig['tools'][0]): Promise<void> {
    const envTemplatePath = path.join(process.cwd(), 'env.template');
    const targetEnvPath = path.join(machine.projectPath, '.env');

    if (!fs.existsSync(envTemplatePath)) {
      throw new Error('Environment template not found');
    }

    let envContent = fs.readFileSync(envTemplatePath, 'utf8');

    // Add tool-specific environment variables if not present
    for (const envVar of tool.envVars) {
      if (!envContent.includes(envVar)) {
        envContent += `\n# ${tool.name.toUpperCase()} Configuration\n${envVar}=\n`;
      }
    }

    if (machine.type === 'local') {
      // Local update
      fs.mkdirSync(path.dirname(targetEnvPath), { recursive: true });
      fs.writeFileSync(targetEnvPath, envContent);
    } else {
      // Remote update
      const tempEnvFile = path.join(process.cwd(), 'temp-env');
      fs.writeFileSync(tempEnvFile, envContent);
      
      const rsyncCmd = `rsync -avz "${tempEnvFile}" ${machine.user}@${machine.host}:"${targetEnvPath}"`;
      execSync(rsyncCmd, { stdio: 'inherit' });
      
      fs.unlinkSync(tempEnvFile);
    }
  }

  /**
   * Install dependencies
   */
  private async installDependencies(machine: ToolSyncConfig['targetMachines'][0], tool: ToolSyncConfig['tools'][0]): Promise<void> {
    if (tool.dependencies.length === 0) {
      return;
    }

    this.log(`Installing dependencies for ${tool.name} on ${machine.name}`);

    if (machine.type === 'local') {
      // Local installation
      for (const dep of tool.dependencies) {
        try {
          execSync(`npm install ${dep}`, { 
            cwd: machine.projectPath,
            stdio: 'inherit' 
          });
        } catch (error) {
          this.log(`Warning: Failed to install dependency ${dep}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } else {
      // Remote installation
      const installScript = tool.dependencies.map(dep => `npm install ${dep}`).join('\n');
      const scriptFile = path.join(process.cwd(), `install-${tool.name}-deps.sh`);
      fs.writeFileSync(scriptFile, `#!/bin/bash\ncd ${machine.projectPath}\n${installScript}`);
      
      execSync(`scp ${scriptFile} ${machine.user}@${machine.host}:/tmp/`);
      execSync(`ssh ${machine.user}@${machine.host} 'chmod +x /tmp/install-${tool.name}-deps.sh && /tmp/install-${tool.name}-deps.sh'`);
      
      fs.unlinkSync(scriptFile);
    }
  }

  /**
   * Validate tool sync
   */
  private async validateToolSync(machine: ToolSyncConfig['targetMachines'][0], tool: ToolSyncConfig['tools'][0]): Promise<void> {
    this.log(`Validating ${tool.name} sync on ${machine.name}`);

    // Check if configuration files exist
    for (const configFile of tool.configFiles) {
      const targetPath = path.join(machine.projectPath, configFile);
      
      if (machine.type === 'local') {
        if (!fs.existsSync(targetPath)) {
          throw new Error(`Configuration file missing: ${configFile}`);
        }
      } else {
        // Remote validation
        try {
          execSync(`ssh ${machine.user}@${machine.host} "test -f ${targetPath}"`, { stdio: 'pipe' });
        } catch (error) {
          throw new Error(`Configuration file missing on remote: ${configFile}`);
        }
      }
    }

    // Check if environment variables are present
    const envPath = path.join(machine.projectPath, '.env');
    
    if (machine.type === 'local') {
      if (!fs.existsSync(envPath)) {
        throw new Error('Environment file missing');
      }
      
      const envContent = fs.readFileSync(envPath, 'utf8');
      for (const envVar of tool.envVars) {
        if (!envContent.includes(envVar)) {
          throw new Error(`Environment variable missing: ${envVar}`);
        }
      }
    } else {
      // Remote validation
      for (const envVar of tool.envVars) {
        try {
          execSync(`ssh ${machine.user}@${machine.host} "grep -q '${envVar}' ${envPath}"`, { stdio: 'pipe' });
        } catch (error) {
          throw new Error(`Environment variable missing on remote: ${envVar}`);
        }
      }
    }

    // Tool-specific validation
    await this.validateToolSpecific(machine, tool);
  }

  /**
   * Tool-specific validation
   */
  private async validateToolSpecific(machine: ToolSyncConfig['targetMachines'][0], tool: ToolSyncConfig['tools'][0]): Promise<void> {
    switch (tool.name) {
      case 'mindpal':
        // Validate MindPal API configuration
        await this.validateMindPalConfig(machine);
        break;
      case 'deerflow':
        // Validate DeerFlow API configuration
        await this.validateDeerFlowConfig(machine);
        break;
      case 'render':
        // Validate Render deployment configuration
        await this.validateRenderConfig(machine);
        break;
      case 'make':
        // Validate Make.com API configuration
        await this.validateMakeConfig(machine);
        break;
      case 'firebase':
        // Validate Firebase configuration
        await this.validateFirebaseConfig(machine);
        break;
      case 'bigquery':
        // Validate BigQuery configuration
        await this.validateBigQueryConfig(machine);
        break;
      case 'neon':
        // Validate Neon database configuration
        await this.validateNeonConfig(machine);
        break;
    }
  }

  /**
   * Validate MindPal configuration
   */
  private async validateMindPalConfig(machine: ToolSyncConfig['targetMachines'][0]): Promise<void> {
    const mindpalScript = path.join(machine.projectPath, 'scripts/mindpal_integration.ts');
    
    if (machine.type === 'local') {
      if (!fs.existsSync(mindpalScript)) {
        throw new Error('MindPal integration script missing');
      }
    } else {
      try {
        execSync(`ssh ${machine.user}@${machine.host} "test -f ${mindpalScript}"`, { stdio: 'pipe' });
      } catch (error) {
        throw new Error('MindPal integration script missing on remote');
      }
    }
  }

  /**
   * Validate DeerFlow configuration
   */
  private async validateDeerFlowConfig(machine: ToolSyncConfig['targetMachines'][0]): Promise<void> {
    const deerflowScript = path.join(machine.projectPath, 'scripts/deerflow_integration.ts');
    
    if (machine.type === 'local') {
      if (!fs.existsSync(deerflowScript)) {
        throw new Error('DeerFlow integration script missing');
      }
    } else {
      try {
        execSync(`ssh ${machine.user}@${machine.host} "test -f ${deerflowScript}"`, { stdio: 'pipe' });
      } catch (error) {
        throw new Error('DeerFlow integration script missing on remote');
      }
    }
  }

  /**
   * Validate Render configuration
   */
  private async validateRenderConfig(machine: ToolSyncConfig['targetMachines'][0]): Promise<void> {
    const renderScript = path.join(machine.projectPath, 'scripts/render_integration.ts');
    const deployScript = path.join(machine.projectPath, 'scripts/deploy_render.sh');
    
    if (machine.type === 'local') {
      if (!fs.existsSync(renderScript)) {
        throw new Error('Render integration script missing');
      }
      if (!fs.existsSync(deployScript)) {
        throw new Error('Render deployment script missing');
      }
    } else {
      try {
        execSync(`ssh ${machine.user}@${machine.host} "test -f ${renderScript}"`, { stdio: 'pipe' });
        execSync(`ssh ${machine.user}@${machine.host} "test -f ${deployScript}"`, { stdio: 'pipe' });
      } catch (error) {
        throw new Error('Render scripts missing on remote');
      }
    }
  }

  /**
   * Validate Make.com configuration
   */
  private async validateMakeConfig(machine: ToolSyncConfig['targetMachines'][0]): Promise<void> {
    const makeScript = path.join(machine.projectPath, 'scripts/make_integration.ts');
    
    if (machine.type === 'local') {
      if (!fs.existsSync(makeScript)) {
        throw new Error('Make.com integration script missing');
      }
    } else {
      try {
        execSync(`ssh ${machine.user}@${machine.host} "test -f ${makeScript}"`, { stdio: 'pipe' });
      } catch (error) {
        throw new Error('Make.com integration script missing on remote');
      }
    }
  }

  /**
   * Validate Firebase configuration
   */
  private async validateFirebaseConfig(machine: ToolSyncConfig['targetMachines'][0]): Promise<void> {
    const firebaseScript = path.join(machine.projectPath, 'scripts/firebase_push.ts');
    const firebaseDir = path.join(machine.projectPath, 'firebase');
    
    if (machine.type === 'local') {
      if (!fs.existsSync(firebaseScript)) {
        throw new Error('Firebase integration script missing');
      }
      if (!fs.existsSync(firebaseDir)) {
        throw new Error('Firebase directory missing');
      }
    } else {
      try {
        execSync(`ssh ${machine.user}@${machine.host} "test -f ${firebaseScript}"`, { stdio: 'pipe' });
        execSync(`ssh ${machine.user}@${machine.host} "test -d ${firebaseDir}"`, { stdio: 'pipe' });
      } catch (error) {
        throw new Error('Firebase configuration missing on remote');
      }
    }
  }

  /**
   * Validate BigQuery configuration
   */
  private async validateBigQueryConfig(machine: ToolSyncConfig['targetMachines'][0]): Promise<void> {
    const bigqueryScript = path.join(machine.projectPath, 'scripts/bigquery_ingest.ts');
    
    if (machine.type === 'local') {
      if (!fs.existsSync(bigqueryScript)) {
        throw new Error('BigQuery integration script missing');
      }
    } else {
      try {
        execSync(`ssh ${machine.user}@${machine.host} "test -f ${bigqueryScript}"`, { stdio: 'pipe' });
      } catch (error) {
        throw new Error('BigQuery integration script missing on remote');
      }
    }
  }

  /**
   * Validate Neon configuration
   */
  private async validateNeonConfig(machine: ToolSyncConfig['targetMachines'][0]): Promise<void> {
    const neonScript = path.join(machine.projectPath, 'scripts/neon_sync.ts');
    
    if (machine.type === 'local') {
      if (!fs.existsSync(neonScript)) {
        throw new Error('Neon integration script missing');
      }
    } else {
      try {
        execSync(`ssh ${machine.user}@${machine.host} "test -f ${neonScript}"`, { stdio: 'pipe' });
      } catch (error) {
        throw new Error('Neon integration script missing on remote');
      }
    }
  }

  /**
   * Log message with timestamp
   */
  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    this.syncLog.push(logMessage);
    console.log(logMessage);
  }

  /**
   * Get sync log
   */
  getSyncLog(): string[] {
    return this.syncLog;
  }

  /**
   * Generate tool sync configuration template
   */
  static generateConfigTemplate(): ToolSyncConfig {
    return {
      tools: [
        {
          name: 'mindpal',
          enabled: true,
          configFiles: ['scripts/mindpal_integration.ts', 'src/schemas/blueprint-schemas.ts'],
          envVars: ['MINDPAL_API_KEY'],
          dependencies: ['axios'],
        },
        {
          name: 'deerflow',
          enabled: true,
          configFiles: ['scripts/deerflow_integration.ts', 'src/schemas/blueprint-schemas.ts'],
          envVars: ['DEERFLOW_API_KEY'],
          dependencies: ['axios'],
        },
        {
          name: 'render',
          enabled: true,
          configFiles: ['scripts/render_integration.ts', 'scripts/deploy_render.sh', 'src/schemas/blueprint-schemas.ts'],
          envVars: ['RENDER_API_KEY', 'RENDER_WEBHOOK_URL'],
          dependencies: ['axios'],
        },
        {
          name: 'make',
          enabled: true,
          configFiles: ['scripts/make_integration.ts', 'src/schemas/blueprint-schemas.ts'],
          envVars: ['MAKE_API_KEY'],
          dependencies: ['axios'],
        },
        {
          name: 'firebase',
          enabled: true,
          configFiles: ['scripts/firebase_push.ts', 'firebase/'],
          envVars: ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY'],
          dependencies: ['firebase-admin'],
        },
        {
          name: 'bigquery',
          enabled: true,
          configFiles: ['scripts/bigquery_ingest.ts'],
          envVars: ['GOOGLE_APPLICATION_CREDENTIALS', 'BIGQUERY_PROJECT_ID'],
          dependencies: ['@google-cloud/bigquery'],
        },
        {
          name: 'neon',
          enabled: true,
          configFiles: ['scripts/neon_sync.ts'],
          envVars: ['NEON_DATABASE_URL'],
          dependencies: ['pg'],
        },
      ],
      syncOptions: {
        backupBeforeSync: true,
        validateAfterSync: true,
        installDependencies: true,
        updateEnvFile: true,
      },
      targetMachines: [
        {
          name: 'local-machine',
          type: 'local',
          projectPath: process.cwd(),
        },
        {
          name: 'remote-server',
          type: 'remote',
          host: 'your-server.com',
          user: 'your-username',
          projectPath: '/home/your-username/projects/cursor-blueprint-enforcer',
        },
      ],
    };
  }
}

// CLI interface
if (require.main === module) {
  const configPath = process.argv[2] || 'tool-sync-config.json';
  
  if (!fs.existsSync(configPath)) {
    console.log('Creating tool sync configuration template...');
    const template = ToolSyncManager.generateConfigTemplate();
    fs.writeFileSync(configPath, JSON.stringify(template, null, 2));
    console.log(`Configuration template created at ${configPath}`);
    console.log('Please edit the configuration file and run the sync again.');
    process.exit(0);
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const syncManager = new ToolSyncManager(config);
    
    syncManager.syncAllTools()
      .then(result => {
        console.log('\nTool Sync Summary:', result.summary);
        process.exit(result.success ? 0 : 1);
      })
      .catch(error => {
        console.error('Tool sync failed:', error);
        process.exit(1);
      });
  } catch (error) {
    console.error('Failed to load configuration:', error);
    process.exit(1);
  }
} 