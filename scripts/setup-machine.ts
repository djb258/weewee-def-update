#!/usr/bin/env tsx

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Setup Configuration Schema
const SetupConfigSchema = z.object({
  projectName: z.string().default('sop-library'),
  nodeVersion: z.string().default('18.0.0'),
  enableYolo: z.boolean().default(true),
  installDependencies: z.boolean().default(true),
  setupGit: z.boolean().default(true),
  setupVSCode: z.boolean().default(true),
  setupDocker: z.boolean().default(false),
  runTests: z.boolean().default(true),
  autoCommit: z.boolean().default(false)
});

type SetupConfig = z.infer<typeof SetupConfigSchema>;

interface SetupStep {
  name: string;
  description: string;
  execute: () => Promise<boolean>;
  required: boolean;
}

interface SetupReport {
  config: SetupConfig;
  steps: Array<{
    name: string;
    success: boolean;
    error?: string;
    duration: number;
  }>;
  summary: {
    totalSteps: number;
    successfulSteps: number;
    failedSteps: number;
    totalDuration: number;
    startTime: string;
    endTime: string;
  };
  recommendations: string[];
}

class MachineSetup {
  private config: SetupConfig;
  private steps: SetupStep[] = [];
  private results: Array<{ name: string; success: boolean; error?: string; duration: number }> = [];
  private startTime: Date;

  constructor(config?: Partial<SetupConfig>) {
    this.config = SetupConfigSchema.parse(config || {});
    this.startTime = new Date();
    this.initializeSteps();
  }

  private initializeSteps(): void {
    this.steps = [
      {
        name: 'Check Prerequisites',
        description: 'Verify Node.js, npm, and git are installed',
        execute: () => this.checkPrerequisites(),
        required: true
      },
      {
        name: 'Install Dependencies',
        description: 'Install npm packages and development tools',
        execute: () => this.installDependencies(),
        required: true
      },
      {
        name: 'Setup Git Configuration',
        description: 'Configure git user and remote repository',
        execute: () => this.setupGit(),
        required: false
      },
      {
        name: 'Enable YOLO Mode',
        description: 'Enable YOLO mode for rapid development',
        execute: () => this.enableYoloMode(),
        required: false
      },
      {
        name: 'Setup VSCode Extensions',
        description: 'Install recommended VSCode extensions',
        execute: () => this.setupVSCode(),
        required: false
      },
      {
        name: 'Setup Docker (Optional)',
        description: 'Install and configure Docker if requested',
        execute: () => this.setupDocker(),
        required: false
      },
      {
        name: 'Run Initial Tests',
        description: 'Run Monte Carlo tests to verify setup',
        execute: () => this.runInitialTests(),
        required: false
      },
      {
        name: 'Create Setup Documentation',
        description: 'Generate machine-specific setup documentation',
        execute: () => this.createSetupDocs(),
        required: false
      },
      {
        name: 'Auto Commit Changes',
        description: 'Commit setup changes to git',
        execute: () => this.autoCommit(),
        required: false
      }
    ];
  }

  private async checkPrerequisites(): Promise<boolean> {
    try {
      console.log('🔍 Checking prerequisites...');
      
      // Check Node.js
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
      console.log(`✅ Node.js: ${nodeVersion}`);
      
      // Check npm
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      console.log(`✅ npm: ${npmVersion}`);
      
      // Check git
      const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim();
      console.log(`✅ Git: ${gitVersion}`);
      
      // Check TypeScript
      try {
        const tsVersion = execSync('tsx --version', { encoding: 'utf8' }).trim();
        console.log(`✅ tsx: ${tsVersion}`);
      } catch {
        console.log('⚠️  tsx not found, will install during dependency setup');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Prerequisites check failed:', error);
      return false;
    }
  }

  private async installDependencies(): Promise<boolean> {
    try {
      console.log('📦 Installing dependencies...');
      
      // Install npm packages
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ npm packages installed');
      
      // Install global tools if needed
      try {
        execSync('npm install -g tsx', { stdio: 'inherit' });
        console.log('✅ tsx installed globally');
      } catch {
        console.log('⚠️  tsx installation failed, using local version');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Dependency installation failed:', error);
      return false;
    }
  }

  private async setupGit(): Promise<boolean> {
    if (!this.config.setupGit) {
      console.log('⏭️  Skipping git setup');
      return true;
    }
    
    try {
      console.log('🔧 Setting up git configuration...');
      
      // Check if git is initialized
      try {
        execSync('git status', { stdio: 'ignore' });
        console.log('✅ Git repository already initialized');
      } catch {
        execSync('git init', { stdio: 'inherit' });
        console.log('✅ Git repository initialized');
      }
      
      // Set up git user if not configured
      try {
        execSync('git config user.name', { stdio: 'ignore' });
        console.log('✅ Git user name already configured');
      } catch {
        console.log('⚠️  Please configure git user: git config --global user.name "Your Name"');
      }
      
      try {
        execSync('git config user.email', { stdio: 'ignore' });
        console.log('✅ Git user email already configured');
      } catch {
        console.log('⚠️  Please configure git email: git config --global user.email "your.email@example.com"');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Git setup failed:', error);
      return false;
    }
  }

  private async enableYoloMode(): Promise<boolean> {
    if (!this.config.enableYolo) {
      console.log('⏭️  Skipping YOLO mode setup');
      return true;
    }
    
    try {
      console.log('🚀 Enabling YOLO mode...');
      execSync('npm run yolo:enable', { stdio: 'inherit' });
      console.log('✅ YOLO mode enabled');
      return true;
    } catch (error) {
      console.error('❌ YOLO mode setup failed:', error);
      return false;
    }
  }

  private async setupVSCode(): Promise<boolean> {
    if (!this.config.setupVSCode) {
      console.log('⏭️  Skipping VSCode setup');
      return true;
    }
    
    try {
      console.log('🔧 Setting up VSCode extensions...');
      
      // Create .vscode directory
      const vscodeDir = path.join(process.cwd(), '.vscode');
      if (!fs.existsSync(vscodeDir)) {
        fs.mkdirSync(vscodeDir, { recursive: true });
      }
      
      // Create extensions.json
      const extensionsJson = {
        recommendations: [
          'ms-vscode.vscode-typescript-next',
          'bradlc.vscode-tailwindcss',
          'esbenp.prettier-vscode',
          'ms-vscode.vscode-eslint',
          'ms-vscode.vscode-json',
          'ms-vscode.vscode-yaml',
          'ms-vscode.vscode-markdown',
          'ms-vscode.vscode-git',
          'ms-vscode.vscode-git-graph',
          'ms-vscode.vscode-github',
          'ms-vscode.vscode-docker',
          'ms-vscode.vscode-node-debug2',
          'ms-vscode.vscode-jest',
          'ms-vscode.vscode-test-explorer',
          'ms-vscode.vscode-test-adapter-converter'
        ]
      };
      
      fs.writeFileSync(
        path.join(vscodeDir, 'extensions.json'),
        JSON.stringify(extensionsJson, null, 2)
      );
      
      // Create settings.json
      const settingsJson = {
        'typescript.preferences.includePackageJsonAutoImports': 'on',
        'typescript.suggest.autoImports': true,
        'editor.formatOnSave': true,
        'editor.defaultFormatter': 'esbenp.prettier-vscode',
        'editor.codeActionsOnSave': {
          'source.fixAll.eslint': true
        },
        'files.autoSave': 'onFocusChange',
        'git.autofetch': true,
        'git.confirmSync': false,
        'terminal.integrated.defaultProfile.windows': 'PowerShell',
        'terminal.integrated.defaultProfile.linux': 'bash',
        'terminal.integrated.defaultProfile.osx': 'bash'
      };
      
      fs.writeFileSync(
        path.join(vscodeDir, 'settings.json'),
        JSON.stringify(settingsJson, null, 2)
      );
      
      console.log('✅ VSCode configuration created');
      console.log('📝 Please install recommended extensions manually');
      
      return true;
    } catch (error) {
      console.error('❌ VSCode setup failed:', error);
      return false;
    }
  }

  private async setupDocker(): Promise<boolean> {
    if (!this.config.setupDocker) {
      console.log('⏭️  Skipping Docker setup');
      return true;
    }
    
    try {
      console.log('🐳 Setting up Docker...');
      
      // Check if Docker is installed
      try {
        execSync('docker --version', { stdio: 'ignore' });
        console.log('✅ Docker already installed');
      } catch {
        console.log('⚠️  Docker not found. Please install Docker manually:');
        console.log('   https://docs.docker.com/get-docker/');
        return false;
      }
      
      // Create docker-compose.yml if it doesn't exist
      const dockerComposePath = path.join(process.cwd(), 'docker-compose.yml');
      if (!fs.existsSync(dockerComposePath)) {
        const dockerCompose = `version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev
`;
        fs.writeFileSync(dockerComposePath, dockerCompose);
        console.log('✅ docker-compose.yml created');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Docker setup failed:', error);
      return false;
    }
  }

  private async runInitialTests(): Promise<boolean> {
    if (!this.config.runTests) {
      console.log('⏭️  Skipping initial tests');
      return true;
    }
    
    try {
      console.log('🧪 Running initial tests...');
      
      // Run a quick Monte Carlo test
      execSync('npm run montecarlo:quick', { stdio: 'inherit' });
      console.log('✅ Initial tests completed');
      
      return true;
    } catch (error) {
      console.error('❌ Initial tests failed:', error);
      return false;
    }
  }

  private async createSetupDocs(): Promise<boolean> {
    try {
      console.log('📝 Creating setup documentation...');
      
      const os = await import('os');
      const machineInfo = {
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: execSync('node --version', { encoding: 'utf8' }).trim(),
        npmVersion: execSync('npm --version', { encoding: 'utf8' }).trim(),
        setupTime: new Date().toISOString(),
        config: this.config
      };
      
      const setupLogPath = path.join(process.cwd(), 'setup-log.json');
      fs.writeFileSync(setupLogPath, JSON.stringify(machineInfo, null, 2));
      
      // Create README for this machine
      const readmeContent = `# Machine Setup - ${machineInfo.hostname}

## Setup Information
- **Machine**: ${machineInfo.hostname}
- **Platform**: ${machineInfo.platform} (${machineInfo.arch})
- **Node.js**: ${machineInfo.nodeVersion}
- **npm**: ${machineInfo.npmVersion}
- **Setup Date**: ${machineInfo.setupTime}

## Available Commands

### Development
\`\`\`bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
\`\`\`

### Testing
\`\`\`bash
npm run montecarlo:quick    # Quick Monte Carlo test
npm run montecarlo:run      # Full Monte Carlo test
npm run stress:quick        # Quick stress test
npm run stress:run          # Full stress test
\`\`\`

### YOLO Mode
\`\`\`bash
npm run yolo:enable         # Enable YOLO mode
npm run yolo:status         # Check YOLO status
npm run yolo:disable        # Disable YOLO mode
\`\`\`

### Git Management
\`\`\`bash
npm run git:status          # Check git status
npm run git:pull            # Pull latest changes
npm run git:push            # Push changes
npm run git:commit          # Commit changes
\`\`\`

## Quick Start
1. Enable YOLO mode: \`npm run yolo:enable\`
2. Start development: \`npm run dev\`
3. Run tests: \`npm run montecarlo:quick\`

## Notes
- YOLO mode is enabled for rapid development
- Monte Carlo testing is configured for stress testing
- All dependencies are installed and ready
`;

      fs.writeFileSync(path.join(process.cwd(), 'MACHINE-README.md'), readmeContent);
      
      console.log('✅ Setup documentation created');
      return true;
    } catch (error) {
      console.error('❌ Documentation creation failed:', error);
      return false;
    }
  }

  private async autoCommit(): Promise<boolean> {
    if (!this.config.autoCommit) {
      console.log('⏭️  Skipping auto commit');
      return true;
    }
    
    try {
      console.log('💾 Auto-committing setup changes...');
      
      execSync('git add .', { stdio: 'inherit' });
      execSync('git commit -m "🤖 Auto-setup: Machine configuration and dependencies"', { stdio: 'inherit' });
      
      console.log('✅ Changes committed');
      return true;
    } catch (error) {
      console.error('❌ Auto commit failed:', error);
      return false;
    }
  }

  public async run(): Promise<SetupReport> {
    console.log('🚀 Starting Machine Setup...');
    console.log(`📋 Configuration:`, this.config);
    console.log('');

    for (const step of this.steps) {
      const stepStartTime = Date.now();
      console.log(`🔄 ${step.name}...`);
      
      try {
        const success = await step.execute();
        const duration = Date.now() - stepStartTime;
        
        this.results.push({
          name: step.name,
          success,
          duration
        });
        
        if (success) {
          console.log(`✅ ${step.name} completed (${duration}ms)`);
        } else {
          console.log(`❌ ${step.name} failed (${duration}ms)`);
          if (step.required) {
            console.log('💥 Required step failed, stopping setup');
            break;
          }
        }
      } catch (error) {
        const duration = Date.now() - stepStartTime;
        this.results.push({
          name: step.name,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          duration
        });
        
        console.log(`❌ ${step.name} failed with error (${duration}ms):`, error);
        if (step.required) {
          console.log('💥 Required step failed, stopping setup');
          break;
        }
      }
      
      console.log('');
    }

    return this.generateReport();
  }

  private generateReport(): SetupReport {
    const endTime = new Date();
    const totalDuration = endTime.getTime() - this.startTime.getTime();
    const successfulSteps = this.results.filter(r => r.success).length;
    const failedSteps = this.results.filter(r => !r.success).length;

    const recommendations: string[] = [];
    
    if (failedSteps > 0) {
      recommendations.push(`🔧 ${failedSteps} steps failed - review and fix manually`);
    }
    
    if (successfulSteps === this.results.length) {
      recommendations.push('🎉 Setup completed successfully!');
      recommendations.push('🚀 Ready to start development with YOLO mode');
    }

    const report: SetupReport = {
      config: this.config,
      steps: this.results,
      summary: {
        totalSteps: this.results.length,
        successfulSteps,
        failedSteps,
        totalDuration,
        startTime: this.startTime.toISOString(),
        endTime: endTime.toISOString()
      },
      recommendations
    };

    // Save report
    const reportPath = path.join(process.cwd(), 'setup-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    return report;
  }
}

// CLI Interface
const command = process.argv[2];

if (command === 'run') {
  const config: Partial<SetupConfig> = {};
  
  // Parse command line arguments
  if (process.argv.includes('--no-yolo')) config.enableYolo = false;
  if (process.argv.includes('--no-deps')) config.installDependencies = false;
  if (process.argv.includes('--no-git')) config.setupGit = false;
  if (process.argv.includes('--no-vscode')) config.setupVSCode = false;
  if (process.argv.includes('--docker')) config.setupDocker = true;
  if (process.argv.includes('--no-tests')) config.runTests = false;
  if (process.argv.includes('--auto-commit')) config.autoCommit = true;
  
  const setup = new MachineSetup(config);
  setup.run().then(report => {
    console.log('\n📊 Setup Report:');
    console.log(`📋 Total Steps: ${report.summary.totalSteps}`);
    console.log(`✅ Successful: ${report.summary.successfulSteps}`);
    console.log(`❌ Failed: ${report.summary.failedSteps}`);
    console.log(`⏱️  Duration: ${(report.summary.totalDuration / 1000).toFixed(1)}s`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`   ${rec}`));
    }
    
    console.log(`\n📄 Report saved to: setup-report.json`);
  });
} else {
  console.log('🚀 Machine Setup Tool');
  console.log('');
  console.log('Usage:');
  console.log('  tsx scripts/setup-machine.ts run [options]');
  console.log('');
  console.log('Options:');
  console.log('  --no-yolo       Skip YOLO mode setup');
  console.log('  --no-deps       Skip dependency installation');
  console.log('  --no-git        Skip git configuration');
  console.log('  --no-vscode     Skip VSCode setup');
  console.log('  --docker        Include Docker setup');
  console.log('  --no-tests      Skip initial tests');
  console.log('  --auto-commit   Auto-commit setup changes');
  console.log('');
  console.log('Examples:');
  console.log('  tsx scripts/setup-machine.ts run');
  console.log('  tsx scripts/setup-machine.ts run --docker --auto-commit');
  console.log('  tsx scripts/setup-machine.ts run --no-tests --no-vscode');
}

export { MachineSetup, SetupConfig, SetupReport }; 