#!/usr/bin/env tsx

import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';

// YOLO Mode Configuration Schema
const YoloConfigSchema = z.object({
  enabled: z.boolean().default(false),
  skipValidation: z.boolean().default(false),
  autoApproveChanges: z.boolean().default(false),
  bypassSafetyChecks: z.boolean().default(false),
  fastDeployment: z.boolean().default(false),
  debugLevel: z.enum(['silent', 'info', 'verbose', 'debug']).default('info'),
  allowedOperations: z.array(z.string()).default([]),
  riskLevel: z.enum(['low', 'medium', 'high', 'extreme']).default('medium')
});

type YoloConfig = z.infer<typeof YoloConfigSchema>;

class YoloModeManager {
  private config: YoloConfig;
  private configPath: string;

  constructor() {
    this.configPath = path.join(process.cwd(), 'config', 'yolo-config.json');
    this.config = this.loadConfig();
  }

  private loadConfig(): YoloConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        return YoloConfigSchema.parse(configData);
      }
    } catch (error) {
      console.warn('⚠️  Invalid YOLO config, using defaults');
    }
    
    return YoloConfigSchema.parse({});
  }

  private saveConfig(): void {
    const configDir = path.dirname(this.configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
  }

  public enable(): void {
    this.config.enabled = true;
    this.saveConfig();
    console.log('🚀 YOLO MODE ENABLED!');
    console.log('   - Validation: SKIPPED');
    console.log('   - Safety Checks: BYPASSED');
    console.log('   - Auto-approval: ENABLED');
    console.log('   - Fast deployment: ENABLED');
    console.log('   - Risk level: HIGH');
    console.log('');
    console.log('⚠️  WARNING: You are now in YOLO mode. Use with caution!');
  }

  public disable(): void {
    this.config.enabled = false;
    this.saveConfig();
    console.log('🛡️  YOLO MODE DISABLED - Safety checks restored');
  }

  public status(): void {
    console.log('🎯 YOLO Mode Status:');
    console.log(`   Enabled: ${this.config.enabled ? '✅ YES' : '❌ NO'}`);
    console.log(`   Skip Validation: ${this.config.skipValidation ? '✅' : '❌'}`);
    console.log(`   Auto-approve Changes: ${this.config.autoApproveChanges ? '✅' : '❌'}`);
    console.log(`   Bypass Safety Checks: ${this.config.bypassSafetyChecks ? '✅' : '❌'}`);
    console.log(`   Fast Deployment: ${this.config.fastDeployment ? '✅' : '❌'}`);
    console.log(`   Debug Level: ${this.config.debugLevel}`);
    console.log(`   Risk Level: ${this.config.riskLevel.toUpperCase()}`);
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }

  public shouldSkipValidation(): boolean {
    return this.config.enabled && this.config.skipValidation;
  }

  public shouldAutoApprove(): boolean {
    return this.config.enabled && this.config.autoApproveChanges;
  }

  public shouldBypassSafety(): boolean {
    return this.config.enabled && this.config.bypassSafetyChecks;
  }

  public getDebugLevel(): string {
    return this.config.debugLevel;
  }

  public setRiskLevel(level: 'low' | 'medium' | 'high' | 'extreme'): void {
    this.config.riskLevel = level;
    this.saveConfig();
    console.log(`🎯 Risk level set to: ${level.toUpperCase()}`);
  }

  public addAllowedOperation(operation: string): void {
    if (!this.config.allowedOperations.includes(operation)) {
      this.config.allowedOperations.push(operation);
      this.saveConfig();
      console.log(`✅ Added operation: ${operation}`);
    }
  }
}

// CLI Interface
const yolo = new YoloModeManager();
const command = process.argv[2];

switch (command) {
  case 'enable':
    yolo.enable();
    break;
  case 'disable':
    yolo.disable();
    break;
  case 'status':
    yolo.status();
    break;
  case 'risk':
    const level = process.argv[3] as 'low' | 'medium' | 'high' | 'extreme';
    if (level && ['low', 'medium', 'high', 'extreme'].includes(level)) {
      yolo.setRiskLevel(level);
    } else {
      console.log('Usage: tsx scripts/yolo-mode.ts risk [low|medium|high|extreme]');
    }
    break;
  case 'allow':
    const operation = process.argv[3];
    if (operation) {
      yolo.addAllowedOperation(operation);
    } else {
      console.log('Usage: tsx scripts/yolo-mode.ts allow <operation>');
    }
    break;
  default:
    console.log('🎯 YOLO Mode Manager');
    console.log('');
    console.log('Commands:');
    console.log('  enable    - Enable YOLO mode');
    console.log('  disable   - Disable YOLO mode');
    console.log('  status    - Show current status');
    console.log('  risk      - Set risk level (low|medium|high|extreme)');
    console.log('  allow     - Add allowed operation');
    console.log('');
    console.log('Examples:');
    console.log('  tsx scripts/yolo-mode.ts enable');
    console.log('  tsx scripts/yolo-mode.ts risk high');
    console.log('  tsx scripts/yolo-mode.ts allow database-migration');
}

export { YoloModeManager, YoloConfig }; 