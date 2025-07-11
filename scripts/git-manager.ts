#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface GitStatus {
  success: boolean;
  message: string;
  details?: string;
  branch?: string;
  ahead?: number;
  behind?: number;
  staged?: number;
  modified?: number;
  untracked?: number;
}

class GitManager {
  private projectPath: string;

  constructor() {
    this.projectPath = process.cwd();
  }

  private executeCommand(command: string, args: string[] = []): GitStatus {
    try {
      const result = execSync(`${command} ${args.join(' ')}`, {
        cwd: this.projectPath,
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      return {
        success: true,
        message: `✅ ${command} completed successfully`,
        details: result.trim()
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ ${command} failed`,
        details: error.message
      };
    }
  }

  private getGitStatus(): GitStatus {
    try {
      // Get current branch
      const branch = execSync('git branch --show-current', {
        cwd: this.projectPath,
        encoding: 'utf8'
      }).trim();

      // Get status
      const status = execSync('git status --porcelain', {
        cwd: this.projectPath,
        encoding: 'utf8'
      });

      // Get ahead/behind info
      const aheadBehind = execSync('git status --porcelain --branch', {
        cwd: this.projectPath,
        encoding: 'utf8'
      });

      const lines = status.split('\n').filter(line => line.trim());
      const staged = lines.filter(line => line.startsWith('A ') || line.startsWith('M ')).length;
      const modified = lines.filter(line => line.startsWith(' M')).length;
      const untracked = lines.filter(line => line.startsWith('??')).length;

      // Parse ahead/behind
      const aheadMatch = aheadBehind.match(/ahead (\d+)/);
      const behindMatch = aheadBehind.match(/behind (\d+)/);
      const ahead = aheadMatch ? parseInt(aheadMatch[1]) : 0;
      const behind = behindMatch ? parseInt(behindMatch[1]) : 0;

      return {
        success: true,
        message: '✅ Git status retrieved',
        branch,
        ahead,
        behind,
        staged,
        modified,
        untracked
      };
    } catch (error: any) {
      return {
        success: false,
        message: '❌ Failed to get git status',
        details: error.message
      };
    }
  }

  async pull(): Promise<GitStatus> {
    console.log('🔄 Pulling latest changes from GitHub...\n');
    
    // First check if we have uncommitted changes
    const status = this.getGitStatus();
    if (!status.success) {
      return status;
    }

    if (status.modified && status.modified > 0) {
      console.log('⚠️  You have uncommitted changes. Consider committing or stashing them first.\n');
    }

    // Perform pull
    const pullResult = this.executeCommand('git', ['pull']);
    
    if (pullResult.success) {
      console.log('✅ Pull completed successfully!');
      
      // Get updated status
      const newStatus = this.getGitStatus();
      if (newStatus.success) {
        console.log(`📊 Current status:`);
        console.log(`   Branch: ${newStatus.branch}`);
        console.log(`   Ahead: ${newStatus.ahead}, Behind: ${newStatus.behind}`);
        console.log(`   Staged: ${newStatus.staged}, Modified: ${newStatus.modified}, Untracked: ${newStatus.untracked}`);
      }
    } else {
      console.log('❌ Pull failed!');
      console.log(`Error: ${pullResult.details}`);
    }

    return pullResult;
  }

  async push(): Promise<GitStatus> {
    console.log('🚀 Pushing changes to GitHub...\n');
    
    // Check current status
    const status = this.getGitStatus();
    if (!status.success) {
      return status;
    }

    if (status.ahead && status.ahead > 0) {
      console.log(`📤 Pushing ${status.ahead} commit(s) ahead...`);
    } else {
      console.log('📤 No commits to push (already up to date)');
      return {
        success: true,
        message: '✅ Already up to date with remote'
      };
    }

    // Perform push
    const pushResult = this.executeCommand('git', ['push']);
    
    if (pushResult.success) {
      console.log('✅ Push completed successfully!');
      
      // Get updated status
      const newStatus = this.getGitStatus();
      if (newStatus.success) {
        console.log(`📊 Current status:`);
        console.log(`   Branch: ${newStatus.branch}`);
        console.log(`   Ahead: ${newStatus.ahead}, Behind: ${newStatus.behind}`);
        console.log(`   Staged: ${newStatus.staged}, Modified: ${newStatus.modified}, Untracked: ${newStatus.untracked}`);
      }
    } else {
      console.log('❌ Push failed!');
      console.log(`Error: ${pushResult.details}`);
    }

    return pushResult;
  }

  async status(): Promise<GitStatus> {
    console.log('📊 Checking Git status...\n');
    
    const status = this.getGitStatus();
    
    if (status.success) {
      console.log(`📋 Git Status:`);
      console.log(`   Branch: ${status.branch}`);
      console.log(`   Ahead: ${status.ahead}, Behind: ${status.behind}`);
      console.log(`   Staged: ${status.staged}, Modified: ${status.modified}, Untracked: ${status.untracked}`);
      
      if (status.ahead && status.ahead > 0) {
        console.log(`\n💡 You have ${status.ahead} commit(s) ready to push`);
      }
      
      if (status.behind && status.behind > 0) {
        console.log(`\n💡 You have ${status.behind} commit(s) to pull`);
      }
      
      if (status.modified && status.modified > 0) {
        console.log(`\n💡 You have ${status.modified} modified file(s) to commit`);
      }
    } else {
      console.log('❌ Failed to get git status');
      console.log(`Error: ${status.details}`);
    }

    return status;
  }

  async commit(message: string): Promise<GitStatus> {
    console.log('💾 Committing changes...\n');
    
    // Check if there are changes to commit
    const status = this.getGitStatus();
    if (!status.success) {
      return status;
    }

    if (!status.staged && !status.modified && !status.untracked) {
      console.log('📝 No changes to commit');
      return {
        success: true,
        message: '✅ No changes to commit'
      };
    }

    // Stage all changes
    const addResult = this.executeCommand('git', ['add', '.']);
    if (!addResult.success) {
      return addResult;
    }

    // Commit
    const commitResult = this.executeCommand('git', ['commit', '-m', message]);
    
    if (commitResult.success) {
      console.log('✅ Commit completed successfully!');
      
      // Get updated status
      const newStatus = this.getGitStatus();
      if (newStatus.success) {
        console.log(`📊 Current status:`);
        console.log(`   Branch: ${newStatus.branch}`);
        console.log(`   Ahead: ${newStatus.ahead}, Behind: ${newStatus.behind}`);
        console.log(`   Staged: ${newStatus.staged}, Modified: ${newStatus.modified}, Untracked: ${newStatus.untracked}`);
      }
    } else {
      console.log('❌ Commit failed!');
      console.log(`Error: ${commitResult.details}`);
    }

    return commitResult;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const gitManager = new GitManager();

  if (args.length === 0) {
    console.log(`
Git Manager - Automated Git Operations with Verification

Usage:
  tsx scripts/git-manager.ts status                    - Check current git status
  tsx scripts/git-manager.ts pull                      - Pull latest changes
  tsx scripts/git-manager.ts push                      - Push changes to remote
  tsx scripts/git-manager.ts commit "message"          - Commit changes with message

Examples:
  tsx scripts/git-manager.ts status
  tsx scripts/git-manager.ts pull
  tsx scripts/git-manager.ts push
  tsx scripts/git-manager.ts commit "feat: add new feature"
`);
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case 'status':
        await gitManager.status();
        break;

      case 'pull':
        await gitManager.pull();
        break;

      case 'push':
        await gitManager.push();
        break;

      case 'commit':
        if (args.length < 2) {
          console.error('Please provide a commit message');
          return;
        }
        const message = args.slice(1).join(' ');
        await gitManager.commit(message);
        break;

      default:
        console.error(`Unknown command: ${command}`);
        console.log('Run without arguments to see usage information');
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { GitManager }; 