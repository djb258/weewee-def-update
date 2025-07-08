#!/usr/bin/env tsx

import { z } from 'zod';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Tool Installation Configuration
const ToolConfigSchema = z.object({
  installExa: z.boolean().default(true),
  installPlaywright: z.boolean().default(true),
  installFirecrawl: z.boolean().default(true),
  installBrowsers: z.boolean().default(true),
  platform: z.enum(['windows', 'linux', 'macos']).default('windows')
});

type ToolConfig = z.infer<typeof ToolConfigSchema>;

interface ToolInstallResult {
  name: string;
  success: boolean;
  error?: string;
  duration: number;
  notes?: string;
}

class ToolInstaller {
  private config: ToolConfig;
  private results: ToolInstallResult[] = [];
  private startTime: Date;

  constructor(config?: Partial<ToolConfig>) {
    this.config = ToolConfigSchema.parse(config || {});
    this.startTime = new Date();
  }

  private async installExa(): Promise<ToolInstallResult> {
    const startTime = Date.now();
    
    try {
      console.log('📦 Installing exa (modern ls replacement)...');
      
      if (this.config.platform === 'windows') {
        // Try multiple installation methods for Windows
        const methods = [
          () => execSync('winget install ogham.exa', { stdio: 'pipe' }),
          () => execSync('choco install exa', { stdio: 'pipe' }),
          () => {
            // Download and install manually
            console.log('📥 Downloading exa for Windows...');
            execSync('curl -L -o exa.zip https://github.com/ogham/exa/releases/latest/download/exa-windows-x86_64.zip', { stdio: 'inherit' });
            execSync('Expand-Archive -Path exa.zip -DestinationPath .', { stdio: 'inherit' });
            execSync('Move-Item exa.exe C:\\Windows\\System32\\', { stdio: 'inherit' });
          }
        ];
        
        let installed = false;
        for (const method of methods) {
          try {
            method();
            installed = true;
            break;
          } catch (error) {
            console.log(`⚠️  Method failed, trying next...`);
          }
        }
        
        if (!installed) {
          throw new Error('All installation methods failed');
        }
      } else {
        // Linux/macOS
        execSync('curl -L -o exa.zip https://github.com/ogham/exa/releases/latest/download/exa-linux-x86_64.zip', { stdio: 'inherit' });
        execSync('unzip exa.zip', { stdio: 'inherit' });
        execSync('sudo mv exa /usr/local/bin/', { stdio: 'inherit' });
      }
      
      return {
        name: 'exa',
        success: true,
        duration: Date.now() - startTime,
        notes: 'Modern ls replacement installed'
      };
    } catch (error) {
      return {
        name: 'exa',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        notes: 'Installation failed, but not critical'
      };
    }
  }

  private async installPlaywright(): Promise<ToolInstallResult> {
    const startTime = Date.now();
    
    try {
      console.log('🎭 Installing Playwright...');
      
      // Install Playwright package
      execSync('npm install playwright', { stdio: 'inherit' });
      
      // Install browsers if requested
      if (this.config.installBrowsers) {
        console.log('🌐 Installing Playwright browsers...');
        execSync('npx playwright install', { stdio: 'inherit' });
      }
      
      return {
        name: 'playwright',
        success: true,
        duration: Date.now() - startTime,
        notes: 'Browser automation framework installed'
      };
    } catch (error) {
      return {
        name: 'playwright',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      };
    }
  }

  private async installFirecrawl(): Promise<ToolInstallResult> {
    const startTime = Date.now();
    
    try {
      console.log('🕷️  Installing Firecrawl...');
      
      // Install Firecrawl package
      execSync('npm install firecrawl', { stdio: 'inherit' });
      
      return {
        name: 'firecrawl',
        success: true,
        duration: Date.now() - startTime,
        notes: 'Web scraping framework installed'
      };
    } catch (error) {
      return {
        name: 'firecrawl',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      };
    }
  }

  private async createPlaywrightScripts(): Promise<ToolInstallResult> {
    const startTime = Date.now();
    
    try {
      console.log('📝 Creating Playwright scripts...');
      
      // Create Playwright test script
      const playwrightTestScript = `#!/usr/bin/env tsx

import { chromium, firefox, webkit } from 'playwright';

async function runPlaywrightTests() {
  console.log('🎭 Running Playwright tests...');
  
  const browsers = [
    { name: 'Chromium', browser: chromium },
    { name: 'Firefox', browser: firefox },
    { name: 'Webkit', browser: webkit }
  ];
  
  for (const { name, browser } of browsers) {
    try {
      console.log(\`🌐 Testing with \${name}...\`);
      const browserInstance = await browser.launch();
      const page = await browserInstance.newPage();
      
      // Test your SOP application
      await page.goto('http://localhost:3000');
      await page.waitForLoadState('networkidle');
      
      // Take a screenshot
      await page.screenshot({ path: \`screenshot-\${name.toLowerCase()}.png\` });
      
      console.log(\`✅ \${name} test completed\`);
      await browserInstance.close();
    } catch (error) {
      console.error(\`❌ \${name} test failed:\`, error);
    }
  }
}

runPlaywrightTests().catch(console.error);
`;
      
      fs.writeFileSync('scripts/playwright-test.ts', playwrightTestScript);
      
      // Create Firecrawl script
      const firecrawlScript = `#!/usr/bin/env tsx

import { Firecrawl } from 'firecrawl';

async function runFirecrawlTest() {
  console.log('🕷️  Running Firecrawl test...');
  
  try {
    const firecrawl = new Firecrawl({
      apiKey: process.env.FIRECRAWL_API_KEY || 'your-api-key-here'
    });
    
    // Test web scraping
    const result = await firecrawl.scrape({
      url: 'https://example.com',
      pageOptions: {
        onlyMainContent: true
      }
    });
    
    console.log('✅ Firecrawl test completed');
    console.log('📄 Scraped content length:', result.markdown?.length || 0);
    
    // Save result
    fs.writeFileSync('firecrawl-test-result.json', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Firecrawl test failed:', error);
  }
}

runFirecrawlTest().catch(console.error);
`;
      
      fs.writeFileSync('scripts/firecrawl-test.ts', firecrawlScript);
      
      return {
        name: 'playwright-scripts',
        success: true,
        duration: Date.now() - startTime,
        notes: 'Playwright and Firecrawl test scripts created'
      };
    } catch (error) {
      return {
        name: 'playwright-scripts',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      };
    }
  }

  private async updatePackageJson(): Promise<ToolInstallResult> {
    const startTime = Date.now();
    
    try {
      console.log('📦 Updating package.json scripts...');
      
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Add new scripts
      const newScripts = {
        'playwright:test': 'tsx scripts/playwright-test.ts',
        'playwright:install': 'npx playwright install',
        'firecrawl:test': 'tsx scripts/firecrawl-test.ts',
        'tools:install': 'tsx scripts/install-tools.ts',
        'exa:list': 'exa --long --header --git --icons',
        'exa:tree': 'exa --tree --level=2 --icons'
      };
      
      packageJson.scripts = { ...packageJson.scripts, ...newScripts };
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      
      return {
        name: 'package-json-update',
        success: true,
        duration: Date.now() - startTime,
        notes: 'Package.json updated with new tool scripts'
      };
    } catch (error) {
      return {
        name: 'package-json-update',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      };
    }
  }

  public async installAll(): Promise<void> {
    console.log('🛠️  Installing Development Tools...');
    console.log(`📋 Platform: ${this.config.platform}`);
    console.log('');

    const installTasks = [
      { name: 'Playwright', task: () => this.installPlaywright(), enabled: this.config.installPlaywright },
      { name: 'Firecrawl', task: () => this.installFirecrawl(), enabled: this.config.installFirecrawl },
      { name: 'exa', task: () => this.installExa(), enabled: this.config.installExa },
      { name: 'Scripts', task: () => this.createPlaywrightScripts(), enabled: true },
      { name: 'Package.json', task: () => this.updatePackageJson(), enabled: true }
    ];

    for (const { name, task, enabled } of installTasks) {
      if (!enabled) {
        console.log(`⏭️  Skipping ${name} installation`);
        continue;
      }
      
      console.log(`🔄 Installing ${name}...`);
      const result = await task();
      this.results.push(result);
      
      if (result.success) {
        console.log(`✅ ${name} installed successfully (${result.duration}ms)`);
        if (result.notes) console.log(`   📝 ${result.notes}`);
      } else {
        console.log(`❌ ${name} installation failed (${result.duration}ms): ${result.error}`);
      }
      console.log('');
    }

    this.generateReport();
  }

  private generateReport(): void {
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const totalDuration = Date.now() - this.startTime.getTime();

    console.log('📊 Installation Report:');
    console.log(`📋 Total Tools: ${this.results.length}`);
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Duration: ${(totalDuration / 1000).toFixed(1)}s`);
    console.log('');

    if (successful > 0) {
      console.log('🚀 Available Commands:');
      console.log('  npm run playwright:test    # Run Playwright tests');
      console.log('  npm run firecrawl:test     # Run Firecrawl test');
      console.log('  npm run exa:list           # List files with exa');
      console.log('  npm run exa:tree           # Show directory tree');
      console.log('  npm run tools:install      # Install additional tools');
      console.log('');
    }

    if (failed > 0) {
      console.log('🔧 Manual Installation Required:');
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`   - ${result.name}: ${result.error}`);
      });
      console.log('');
    }

    console.log('🎯 Ready to use Playwright and Firecrawl for SOP testing!');
  }
}

// CLI Interface
const command = process.argv[2];

if (command === 'install') {
  const installer = new ToolInstaller();
  installer.installAll();
} else {
  console.log('🛠️  Development Tools Installer');
  console.log('');
  console.log('Usage:');
  console.log('  tsx scripts/install-tools.ts install');
  console.log('');
  console.log('This will install:');
  console.log('  - Playwright (browser automation)');
  console.log('  - Firecrawl (web scraping)');
  console.log('  - exa (modern file listing)');
  console.log('  - Test scripts and npm commands');
}

export { ToolInstaller, ToolConfig }; 