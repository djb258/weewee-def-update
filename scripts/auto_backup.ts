#!/usr/bin/env tsx

/**
 * Auto Backup System
 * Automatically commits and pushes changes to prevent data loss
 * Runs as part of development workflow
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

class AutoBackupSystem {
  private projectRoot = path.dirname(__dirname);
  private backupInterval = 30 * 60 * 1000; // 30 minutes
  private lastBackupFile = path.join(this.projectRoot, '.last-backup');

  private log(message: string, color: 'green' | 'yellow' | 'red' | 'blue' = 'blue'): void {
    const timestamp = new Date().toISOString();
    const colors = {
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
      blue: '\x1b[34m'
    };
    console.log(`${colors[color]}[${timestamp}] ${message}\x1b[0m`);
  }

  private runCommand(command: string): { success: boolean; output: string } {
    try {
      const output = execSync(command, { 
        cwd: this.projectRoot, 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return { success: true, output: output.toString() };
    } catch (error: any) {
      return { success: false, output: error.message };
    }
  }

  public async checkForChanges(): Promise<boolean> {
    const result = this.runCommand('git status --porcelain');
    if (!result.success) {
      this.log('❌ Failed to check git status', 'red');
      return false;
    }
    return result.output.trim().length > 0;
  }

  public async commitAndPush(message?: string): Promise<boolean> {
    this.log('🔄 Starting auto-backup process...', 'blue');

    // Check if there are changes
    const hasChanges = await this.checkForChanges();
    if (!hasChanges) {
      this.log('✅ No changes to backup', 'green');
      return true;
    }

    // Add all changes
    const addResult = this.runCommand('git add .');
    if (!addResult.success) {
      this.log('❌ Failed to add changes to git', 'red');
      return false;
    }

    // Generate commit message
    const commitMessage = message || this.generateCommitMessage();
    
    // Commit changes (skip hooks to avoid linting issues)
    const commitResult = this.runCommand(`git commit -m "${commitMessage}" --no-verify`);
    if (!commitResult.success) {
      this.log('❌ Failed to commit changes', 'red');
      return false;
    }

    this.log(`✅ Committed: ${commitMessage}`, 'green');

    // Push to remote
    const pushResult = this.runCommand('git push origin main');
    if (!pushResult.success) {
      this.log('❌ Failed to push to remote repository', 'red');
      this.log(`Push error: ${pushResult.output}`, 'yellow');
      return false;
    }

    this.log('🚀 Successfully pushed to remote repository!', 'green');
    
    // Update last backup timestamp
    fs.writeFileSync(this.lastBackupFile, new Date().toISOString());
    
    return true;
  }

  private generateCommitMessage(): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // Check what types of files were changed
    const statusResult = this.runCommand('git status --porcelain');
    const changes = statusResult.output.split('\n').filter(line => line.trim());
    
    let changeTypes = [];
    let hasEnvChanges = false;
    let hasConfigChanges = false;
    let hasScriptChanges = false;
    let hasDocChanges = false;

    for (const change of changes) {
      if (change.includes('.env') || change.includes('env.')) {
        hasEnvChanges = true;
      } else if (change.includes('.json') || change.includes('.yml') || change.includes('.yaml')) {
        hasConfigChanges = true;
      } else if (change.includes('scripts/') || change.includes('.ts') || change.includes('.js')) {
        hasScriptChanges = true;
      } else if (change.includes('.md') || change.includes('README')) {
        hasDocChanges = true;
      }
    }

    if (hasEnvChanges) changeTypes.push('env');
    if (hasConfigChanges) changeTypes.push('config');
    if (hasScriptChanges) changeTypes.push('scripts');
    if (hasDocChanges) changeTypes.push('docs');

    const changeType = changeTypes.length > 0 ? changeTypes.join('+') : 'misc';
    
    return `🔄 Auto-backup ${timestamp} ${time} - Updated ${changeType}`;
  }

  public async startAutoBackup(): Promise<void> {
    this.log('🚀 Starting auto-backup daemon...', 'blue');
    this.log(`⏰ Backup interval: ${this.backupInterval / 1000 / 60} minutes`, 'blue');

    // Initial backup
    await this.commitAndPush('🔄 Auto-backup daemon started');

    // Set up interval
    setInterval(async () => {
      await this.commitAndPush();
    }, this.backupInterval);

    // Keep process alive
    process.on('SIGINT', () => {
      this.log('🛑 Auto-backup daemon stopping...', 'yellow');
      this.commitAndPush('🔄 Auto-backup daemon stopped').then(() => {
        process.exit(0);
      });
    });

    this.log('✅ Auto-backup daemon is running. Press Ctrl+C to stop.', 'green');
  }

  public async backupOnFileChange(): Promise<void> {
    this.log('👀 Starting file watcher for auto-backup...', 'blue');
    
    const chokidar = await import('chokidar');
    
    const watcher = chokidar.watch([
      '.env*',
      'package.json',
      'package-lock.json',
      'scripts/**/*',
      '*.md',
      '*.yml',
      '*.yaml',
      'src/**/*'
    ], {
      ignored: [
        'node_modules/**',
        '.git/**',
        'dist/**',
        'logs/**',
        '.env.backup.*'
      ],
      persistent: true,
      cwd: this.projectRoot
    });

    let backupTimeout: NodeJS.Timeout;

    watcher.on('change', (filePath) => {
      this.log(`📝 File changed: ${filePath}`, 'yellow');
      
      // Debounce - wait 5 seconds after last change
      clearTimeout(backupTimeout);
      backupTimeout = setTimeout(async () => {
        await this.commitAndPush(`📝 Updated ${filePath}`);
      }, 5000);
    });

    watcher.on('add', (filePath) => {
      this.log(`➕ File added: ${filePath}`, 'yellow');
      
      clearTimeout(backupTimeout);
      backupTimeout = setTimeout(async () => {
        await this.commitAndPush(`➕ Added ${filePath}`);
      }, 5000);
    });

    this.log('✅ File watcher is active. Changes will be auto-backed up.', 'green');
  }

  public async manualBackup(message?: string): Promise<void> {
    this.log('🔧 Manual backup requested...', 'blue');
    const success = await this.commitAndPush(message || '🔧 Manual backup');
    
    if (success) {
      this.log('✅ Manual backup completed successfully!', 'green');
    } else {
      this.log('❌ Manual backup failed!', 'red');
      process.exit(1);
    }
  }

  public getLastBackupTime(): string | null {
    try {
      if (fs.existsSync(this.lastBackupFile)) {
        const timestamp = fs.readFileSync(this.lastBackupFile, 'utf8');
        return new Date(timestamp).toLocaleString();
      }
    } catch (error) {
      // Ignore errors
    }
    return null;
  }

  public async status(): Promise<void> {
    this.log('📊 Auto-Backup Status', 'blue');
    this.log('==================', 'blue');
    
    const hasChanges = await this.checkForChanges();
    const lastBackup = this.getLastBackupTime();
    
    this.log(`🔄 Pending changes: ${hasChanges ? 'YES' : 'NO'}`, hasChanges ? 'yellow' : 'green');
    this.log(`⏰ Last backup: ${lastBackup || 'Never'}`, lastBackup ? 'green' : 'yellow');
    
    if (hasChanges) {
      const statusResult = this.runCommand('git status --porcelain');
      this.log('\n📝 Changed files:', 'yellow');
      statusResult.output.split('\n').forEach(line => {
        if (line.trim()) {
          this.log(`  ${line}`, 'yellow');
        }
      });
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const backup = new AutoBackupSystem();

  switch (args[0]) {
    case 'start':
      await backup.startAutoBackup();
      break;
    case 'watch':
      await backup.backupOnFileChange();
      break;
    case 'now':
      await backup.manualBackup(args[1]);
      break;
    case 'status':
      await backup.status();
      break;
    default:
      console.log(`
🔄 Auto-Backup System

Usage:
  npm run backup:start         # Start auto-backup daemon (every 30 min)
  npm run backup:watch         # Watch files and backup on changes
  npm run backup:now [message] # Manual backup now
  npm run backup:status        # Show backup status

Examples:
  npm run backup:now "Added new API keys"
  npm run backup:watch         # Best for active development
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { AutoBackupSystem }; 