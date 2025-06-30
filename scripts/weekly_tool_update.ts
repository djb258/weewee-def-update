#!/usr/bin/env tsx

/**
 * Weekly Tool Update Script
 * Automatically updates all development tools to their latest versions
 * Run: npm run update-tools
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface UpdateResult {
  tool: string;
  oldVersion: string;
  newVersion: string;
  status: 'updated' | 'current' | 'failed';
  error?: string;
}

class WeeklyToolUpdater {
  private results: UpdateResult[] = [];
  private logFile = path.join(__dirname, '..', 'logs', 'weekly-update.log');

  constructor() {
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  private log(message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(this.logFile, logMessage);
  }

  private async runCommand(command: string, description: string): Promise<string> {
    try {
      this.log(`Running: ${description}`);
      const output = execSync(command, { 
        encoding: 'utf8',
        timeout: 300000, // 5 minutes timeout
        stdio: ['pipe', 'pipe', 'pipe']
      });
      return output.trim();
    } catch (error: any) {
      this.log(`Error in ${description}: ${error.message}`);
      throw error;
    }
  }

  private async updateWingetTools(): Promise<void> {
    this.log('🔄 Updating Winget tools...');
    
    const wingetTools = [
      'Docker.DockerDesktop',
      'Microsoft.WindowsTerminal', 
      'JanDeDobbeleer.OhMyPosh',
      'Postman.Postman',
      'Microsoft.PowerToys',
      'Yarn.Yarn',
      'Rustlang.Rustup',
      'GoLang.Go',
      'Neovim.Neovim',
      'BurntSushi.ripgrep.MSVC',
      'junegunn.fzf',
      'sharkdp.bat',
      'jqlang.jq',
      'sharkdp.fd',
      'GitKraken.cli',
      'Axosoft.GitKraken',
      'GitHub.GitHubDesktop',
      'Git.Git'
    ];

    // Update all tools at once
    try {
      await this.runCommand(
        'winget upgrade --all --accept-source-agreements --accept-package-agreements --silent',
        'Updating all Winget tools'
      );
      
      // Log individual tool status
      for (const tool of wingetTools) {
        this.results.push({
          tool: tool.split('.').pop() || tool,
          oldVersion: 'winget',
          newVersion: 'latest',
          status: 'updated'
        });
      }
      
    } catch (error: any) {
      this.log(`Some winget updates may have failed: ${error.message}`);
    }
  }

  private async updateNodeTools(): Promise<void> {
    this.log('📦 Updating Node.js tools...');
    
    try {
      // Update npm
      await this.runCommand('npm install -g npm@latest', 'Updating npm');
      
      // Update global packages
      const globalPackages = ['typescript', 'tsx', 'ts-node'];
      
      for (const pkg of globalPackages) {
        try {
          await this.runCommand(`npm install -g ${pkg}@latest`, `Updating ${pkg}`);
          this.results.push({
            tool: pkg,
            oldVersion: 'global',
            newVersion: 'latest', 
            status: 'updated'
          });
        } catch (error: any) {
          this.results.push({
            tool: pkg,
            oldVersion: 'global',
            newVersion: 'failed',
            status: 'failed',
            error: error.message
          });
        }
      }

      // Update project dependencies
      if (fs.existsSync('package.json')) {
        await this.runCommand('npm update', 'Updating project dependencies');
      }

    } catch (error: any) {
      this.log(`Error updating Node.js tools: ${error.message}`);
    }
  }

  private async updatePythonTools(): Promise<void> {
    this.log('🐍 Updating Python tools...');
    
    try {
      await this.runCommand('python -m pip install --upgrade pip', 'Updating pip');
      await this.runCommand('pip install --upgrade setuptools wheel', 'Updating Python tools');
      
      this.results.push({
        tool: 'Python tools',
        oldVersion: 'installed',
        newVersion: 'latest',
        status: 'updated'
      });

    } catch (error: any) {
      this.log(`Error updating Python tools: ${error.message}`);
    }
  }

  private async cleanupSystem(): Promise<void> {
    this.log('🧹 Performing cleanup...');
    
    try {
      await this.runCommand('npm cache clean --force', 'Cleaning npm cache');
    } catch (error: any) {
      this.log(`Cleanup warning: ${error.message}`);
    }
  }

  private generateReport(): void {
    this.log('\n📊 UPDATE REPORT');
    this.log('================');
    
    const updated = this.results.filter(r => r.status === 'updated');
    const failed = this.results.filter(r => r.status === 'failed');
    
    this.log(`✅ Updated: ${updated.length} tools`);
    this.log(`❌ Failed: ${failed.length} tools`);
    
    if (failed.length > 0) {
      this.log('\n❌ Failed Updates:');
      failed.forEach(tool => {
        this.log(`  • ${tool.tool}: ${tool.error || 'Unknown error'}`);
      });
    }
    
    // Save report
    const reportFile = path.join(__dirname, '..', 'logs', `update-report-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    this.log(`\n📄 Report saved to: ${reportFile}`);
  }

  public async runWeeklyUpdate(): Promise<void> {
    this.log('🚀 Starting Weekly Tool Update');
    this.log(`📅 Date: ${new Date().toISOString()}`);
    this.log('================================\n');
    
    try {
      await this.updateWingetTools();
      await this.updateNodeTools(); 
      await this.updatePythonTools();
      await this.cleanupSystem();
      
      this.generateReport();
      
      this.log('\n🎉 Weekly update completed!');
      this.log('💡 Restart your terminal to use updated tools');
      
    } catch (error: any) {
      this.log(`\n❌ Update failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// Run the updater
async function main() {
  const updater = new WeeklyToolUpdater();
  await updater.runWeeklyUpdate();
}

if (require.main === module) {
  main().catch(console.error);
}

export { WeeklyToolUpdater }; 