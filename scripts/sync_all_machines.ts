import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { z } from 'zod';

// Machine Sync Configuration Schema
export const MachineSyncConfigSchema = z.object({
  machines: z.array(z.object({
    name: z.string(),
    type: z.enum(['local', 'remote', 'cloud']),
    host: z.string().optional(),
    user: z.string().optional(),
    sshKey: z.string().optional(),
    syncPaths: z.array(z.string()),
    tools: z.array(z.enum(['cursor', 'mindpal', 'deerflow', 'render', 'make', 'firebase', 'bigquery', 'neon'])),
  })),
  cursorConfig: z.object({
    settingsPath: z.string(),
    extensionsPath: z.string(),
    keybindingsPath: z.string(),
    snippetsPath: z.string(),
    workspacePath: z.string(),
  }),
  toolsConfig: z.object({
    envTemplatePath: z.string(),
    packageJsonPath: z.string(),
    doctrinePath: z.string(),
    schemasPath: z.string(),
  }),
  syncOptions: z.object({
    backupBeforeSync: z.boolean().default(true),
    validateAfterSync: z.boolean().default(true),
    notifyOnCompletion: z.boolean().default(true),
  }),
});

export type MachineSyncConfig = z.infer<typeof MachineSyncConfigSchema>;

export class MachineSynchronizer {
  private config: MachineSyncConfig;
  private syncLog: string[] = [];

  constructor(config: MachineSyncConfig) {
    this.config = MachineSyncConfigSchema.parse(config);
  }

  /**
   * Synchronize all machines with current configuration
   */
  async syncAllMachines(): Promise<{
    success: boolean;
    results: Record<string, { success: boolean; errors: string[] }>;
    summary: string;
  }> {
    const results: Record<string, { success: boolean; errors: string[] }> = {};
    
    this.log('Starting machine synchronization...');

    for (const machine of this.config.machines) {
      this.log(`Syncing machine: ${machine.name} (${machine.type})`);
      
      try {
        const result = await this.syncMachine(machine);
        results[machine.name] = result;
        
        if (result.success) {
          this.log(`✅ Successfully synced ${machine.name}`);
        } else {
          this.log(`❌ Failed to sync ${machine.name}: ${result.errors.join(', ')}`);
        }
      } catch (error) {
        results[machine.name] = {
          success: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        };
        this.log(`❌ Error syncing ${machine.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const successCount = Object.values(results).filter(r => r.success).length;
    const totalCount = this.config.machines.length;

    const summary = `Sync completed: ${successCount}/${totalCount} machines successful`;

    if (this.config.syncOptions.notifyOnCompletion) {
      await this.sendNotification(summary, results);
    }

    return {
      success: successCount === totalCount,
      results,
      summary,
    };
  }

  /**
   * Synchronize a single machine
   */
  private async syncMachine(machine: MachineSyncConfig['machines'][0]): Promise<{
    success: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];

    try {
      // 1. Backup current configuration if enabled
      if (this.config.syncOptions.backupBeforeSync) {
        await this.backupMachineConfig(machine);
      }

      // 2. Sync Cursor configuration
      if (machine.tools.includes('cursor')) {
        try {
          await this.syncCursorConfig(machine);
        } catch (error) {
          errors.push(`Cursor sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // 3. Sync tool configurations
      for (const tool of machine.tools) {
        if (tool !== 'cursor') {
          try {
            await this.syncToolConfig(machine, tool);
          } catch (error) {
            errors.push(`${tool} sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      // 4. Validate sync if enabled
      if (this.config.syncOptions.validateAfterSync) {
        try {
          await this.validateMachineSync(machine);
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
   * Backup machine configuration
   */
  private async backupMachineConfig(machine: MachineSyncConfig['machines'][0]): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups', machine.name, timestamp);

    this.log(`Creating backup for ${machine.name} in ${backupDir}`);

    if (machine.type === 'local') {
      // Local backup
      for (const syncPath of machine.syncPaths) {
        if (fs.existsSync(syncPath)) {
          const relativePath = path.relative(process.cwd(), syncPath);
          const backupPath = path.join(backupDir, relativePath);
          
          fs.mkdirSync(path.dirname(backupPath), { recursive: true });
          fs.copyFileSync(syncPath, backupPath);
        }
      }
    } else {
      // Remote backup using rsync
      const rsyncCmd = `rsync -avz --backup-dir="${backupDir}" ${machine.user}@${machine.host}:${machine.syncPaths.join(' ')} ./backups/${machine.name}/`;
      execSync(rsyncCmd, { stdio: 'inherit' });
    }
  }

  /**
   * Sync Cursor configuration
   */
  private async syncCursorConfig(machine: MachineSyncConfig['machines'][0]): Promise<void> {
    this.log(`Syncing Cursor config for ${machine.name}`);

    const cursorConfigs = [
      this.config.cursorConfig.settingsPath,
      this.config.cursorConfig.extensionsPath,
      this.config.cursorConfig.keybindingsPath,
      this.config.cursorConfig.snippetsPath,
      this.config.cursorConfig.workspacePath,
    ];

    for (const configPath of cursorConfigs) {
      if (fs.existsSync(configPath)) {
        await this.syncFile(machine, configPath, configPath);
      }
    }

    // Sync Cursor extensions list
    await this.syncCursorExtensions(machine);
  }

  /**
   * Sync Cursor extensions
   */
  private async syncCursorExtensions(machine: MachineSyncConfig['machines'][0]): Promise<void> {
    try {
      // Get current extensions
      const extensions = execSync('code --list-extensions', { encoding: 'utf8' })
        .split('\n')
        .filter(ext => ext.trim());

      const extensionsFile = path.join(process.cwd(), 'cursor-extensions.txt');
      fs.writeFileSync(extensionsFile, extensions.join('\n'));

      // Sync extensions file
      await this.syncFile(machine, extensionsFile, extensionsFile);

      // Install extensions on target machine
      if (machine.type === 'local') {
        for (const ext of extensions) {
          try {
            execSync(`code --install-extension ${ext}`, { stdio: 'inherit' });
          } catch (error) {
            this.log(`Warning: Failed to install extension ${ext}`);
          }
        }
      } else {
        // Remote extension installation
        const installScript = extensions.map(ext => `code --install-extension ${ext}`).join('\n');
        const scriptFile = path.join(process.cwd(), 'install-extensions.sh');
        fs.writeFileSync(scriptFile, `#!/bin/bash\n${installScript}`);
        
        execSync(`scp ${scriptFile} ${machine.user}@${machine.host}:/tmp/`);
        execSync(`ssh ${machine.user}@${machine.host} 'chmod +x /tmp/install-extensions.sh && /tmp/install-extensions.sh'`);
      }
    } catch (error) {
      this.log(`Warning: Failed to sync Cursor extensions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sync tool configuration
   */
  private async syncToolConfig(machine: MachineSyncConfig['machines'][0], tool: string): Promise<void> {
    this.log(`Syncing ${tool} config for ${machine.name}`);

    const toolConfigs = {
      mindpal: ['env.template', 'src/schemas/blueprint-schemas.ts'],
      deerflow: ['env.template', 'src/schemas/blueprint-schemas.ts'],
      render: ['env.template', 'src/schemas/blueprint-schemas.ts', 'scripts/deploy_render.sh'],
      make: ['env.template', 'src/schemas/blueprint-schemas.ts'],
      firebase: ['env.template', 'firebase/'],
      bigquery: ['env.template', 'scripts/bigquery_ingest.ts'],
      neon: ['env.template', 'scripts/neon_sync.ts'],
    };

    const configs = toolConfigs[tool as keyof typeof toolConfigs] || [];
    
    for (const config of configs) {
      if (fs.existsSync(config)) {
        await this.syncFile(machine, config, config);
      }
    }

    // Sync package.json for tool dependencies
    await this.syncFile(machine, 'package.json', 'package.json');
  }

  /**
   * Sync a single file or directory
   */
  private async syncFile(machine: MachineSyncConfig['machines'][0], source: string, target: string): Promise<void> {
    if (machine.type === 'local') {
      // Local sync
      if (fs.existsSync(source)) {
        const targetDir = path.dirname(target);
        fs.mkdirSync(targetDir, { recursive: true });
        
        if (fs.statSync(source).isDirectory()) {
          this.copyDirectory(source, target);
        } else {
          fs.copyFileSync(source, target);
        }
      }
    } else {
      // Remote sync using rsync
      const rsyncCmd = `rsync -avz "${source}" ${machine.user}@${machine.host}:"${target}"`;
      execSync(rsyncCmd, { stdio: 'inherit' });
    }
  }

  /**
   * Copy directory recursively
   */
  private copyDirectory(source: string, target: string): void {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);
    
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        this.copyDirectory(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }

  /**
   * Validate machine sync
   */
  private async validateMachineSync(machine: MachineSyncConfig['machines'][0]): Promise<void> {
    this.log(`Validating sync for ${machine.name}`);

    // Check if key files exist
    const keyFiles = [
      'package.json',
      'env.template',
      'src/schemas/blueprint-schemas.ts',
      'DOCTRINE.md',
    ];

    for (const file of keyFiles) {
      if (machine.type === 'local') {
        if (!fs.existsSync(file)) {
          throw new Error(`Key file missing: ${file}`);
        }
      } else {
        // Remote validation
        try {
          execSync(`ssh ${machine.user}@${machine.host} "test -f ${file}"`, { stdio: 'pipe' });
        } catch (error) {
          throw new Error(`Key file missing on remote: ${file}`);
        }
      }
    }

    // Validate environment configuration
    await this.validateEnvironmentConfig(machine);
  }

  /**
   * Validate environment configuration
   */
  private async validateEnvironmentConfig(machine: MachineSyncConfig['machines'][0]): Promise<void> {
    // Check if .env file exists and has required variables
    const envFile = machine.type === 'local' ? '.env' : '.env';
    
    if (machine.type === 'local') {
      if (!fs.existsSync(envFile)) {
        throw new Error('Environment file (.env) missing');
      }
      
      const envContent = fs.readFileSync(envFile, 'utf8');
      const requiredVars = this.getRequiredEnvVars(machine.tools);
      
      for (const requiredVar of requiredVars) {
        if (!envContent.includes(requiredVar)) {
          throw new Error(`Required environment variable missing: ${requiredVar}`);
        }
      }
    } else {
      // Remote validation
      const requiredVars = this.getRequiredEnvVars(machine.tools);
      
      for (const requiredVar of requiredVars) {
        try {
          execSync(`ssh ${machine.user}@${machine.host} "grep -q '${requiredVar}' ${envFile}"`, { stdio: 'pipe' });
        } catch (error) {
          throw new Error(`Required environment variable missing on remote: ${requiredVar}`);
        }
      }
    }
  }

  /**
   * Get required environment variables for tools
   */
  private getRequiredEnvVars(tools: string[]): string[] {
    const toolVars: Record<string, string[]> = {
      mindpal: ['MINDPAL_API_KEY'],
      deerflow: ['DEERFLOW_API_KEY'],
      render: ['RENDER_API_KEY', 'RENDER_WEBHOOK_URL'],
      make: ['MAKE_API_KEY'],
      firebase: ['FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY'],
      bigquery: ['GOOGLE_APPLICATION_CREDENTIALS', 'BIGQUERY_PROJECT_ID'],
      neon: ['NEON_DATABASE_URL'],
    };

    return tools.flatMap(tool => toolVars[tool] || []);
  }

  /**
   * Send notification about sync completion
   */
  private async sendNotification(summary: string, results: Record<string, { success: boolean; errors: string[] }>): Promise<void> {
    // You can implement various notification methods here
    // For now, we'll just log to console and potentially write to a file
    
    const notification = {
      timestamp: new Date().toISOString(),
      summary,
      results,
      log: this.syncLog,
    };

    // Write to notification file
    const notificationFile = path.join(process.cwd(), 'sync-notifications.json');
    const notifications = fs.existsSync(notificationFile) 
      ? JSON.parse(fs.readFileSync(notificationFile, 'utf8')) 
      : [];
    
    notifications.push(notification);
    fs.writeFileSync(notificationFile, JSON.stringify(notifications, null, 2));

    // Log to console
    console.log('\n' + '='.repeat(50));
    console.log('SYNC NOTIFICATION');
    console.log('='.repeat(50));
    console.log(summary);
    console.log('\nDetailed Results:');
    
    for (const [machine, result] of Object.entries(results)) {
      console.log(`\n${machine}: ${result.success ? '✅' : '❌'}`);
      if (result.errors.length > 0) {
        console.log('  Errors:');
        result.errors.forEach(error => console.log(`    - ${error}`));
      }
    }
    console.log('='.repeat(50));
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
   * Generate machine configuration template
   */
  static generateConfigTemplate(): MachineSyncConfig {
    return {
      machines: [
        {
          name: 'local-machine',
          type: 'local',
          syncPaths: [
            '~/.cursor/settings.json',
            '~/.cursor/keybindings.json',
            '~/.cursor/snippets/',
            '~/.cursor/workspaceStorage/',
            '~/projects/cursor-blueprint-enforcer/',
          ],
          tools: ['cursor', 'mindpal', 'deerflow', 'render', 'make', 'firebase', 'bigquery', 'neon'],
        },
        {
          name: 'remote-server',
          type: 'remote',
          host: 'your-server.com',
          user: 'your-username',
          sshKey: '~/.ssh/id_rsa',
          syncPaths: [
            '~/cursor-config/',
            '~/projects/cursor-blueprint-enforcer/',
          ],
          tools: ['cursor', 'mindpal', 'deerflow', 'render', 'make'],
        },
      ],
      cursorConfig: {
        settingsPath: '~/.cursor/settings.json',
        extensionsPath: '~/.cursor/extensions/',
        keybindingsPath: '~/.cursor/keybindings.json',
        snippetsPath: '~/.cursor/snippets/',
        workspacePath: '~/.cursor/workspaceStorage/',
      },
      toolsConfig: {
        envTemplatePath: 'env.template',
        packageJsonPath: 'package.json',
        doctrinePath: 'DOCTRINE.md',
        schemasPath: 'src/schemas/',
      },
      syncOptions: {
        backupBeforeSync: true,
        validateAfterSync: true,
        notifyOnCompletion: true,
      },
    };
  }
}

// CLI interface
if (require.main === module) {
  const configPath = process.argv[2] || 'machine-sync-config.json';
  
  if (!fs.existsSync(configPath)) {
    console.log('Creating machine sync configuration template...');
    const template = MachineSynchronizer.generateConfigTemplate();
    fs.writeFileSync(configPath, JSON.stringify(template, null, 2));
    console.log(`Configuration template created at ${configPath}`);
    console.log('Please edit the configuration file and run the sync again.');
    process.exit(0);
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const synchronizer = new MachineSynchronizer(config);
    
    synchronizer.syncAllMachines()
      .then(result => {
        console.log('\nSync Summary:', result.summary);
        process.exit(result.success ? 0 : 1);
      })
      .catch(error => {
        console.error('Sync failed:', error);
        process.exit(1);
      });
  } catch (error) {
    console.error('Failed to load configuration:', error);
    process.exit(1);
  }
} 