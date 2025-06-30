#!/usr/bin/env tsx

/**
 * Firebase Configuration Update Script
 * This script helps you update your Firebase credentials in the .env file
 */

import * as fs from 'fs';
import * as path from 'path';

interface FirebaseConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

class FirebaseConfigUpdater {
  private envPath: string;

  constructor() {
    this.envPath = path.join(process.cwd(), 'deerflow.env');
  }

  /**
   * Check if .env file exists
   */
  private checkEnvFile(): boolean {
    if (!fs.existsSync(this.envPath)) {
      console.log('❌ .env file not found!');
      console.log('📝 Creating .env file from template...');
      
      const templatePath = path.join(process.cwd(), 'env.comprehensive.template');
      if (fs.existsSync(templatePath)) {
        fs.copyFileSync(templatePath, this.envPath);
        console.log('✅ Created .env file from template');
        return true;
      } else {
        console.log('❌ Template file not found!');
        return false;
      }
    }
    return true;
  }

  /**
   * Read current Firebase configuration
   */
  private readCurrentConfig(): { projectId: string; privateKey: string; clientEmail: string } {
    const envContent = fs.readFileSync(this.envPath, 'utf8');
    const lines = envContent.split('\n').filter(line => line !== undefined);
    
    let projectId = '';
    let privateKey = '';
    let clientEmail = '';

    for (const line of lines) {
      if (line.startsWith('FIREBASE_PROJECT_ID=')) {
        projectId = line.split('=')[1] || '';
      } else if (line.startsWith('FIREBASE_PRIVATE_KEY=')) {
        privateKey = line.split('=')[1] || '';
      } else if (line.startsWith('FIREBASE_CLIENT_EMAIL=')) {
        clientEmail = line.split('=')[1] || '';
      }
    }

    return { projectId, privateKey, clientEmail };
  }

  /**
   * Update Firebase configuration
   */
  private updateConfig(config: FirebaseConfig): void {
    const envContent = fs.readFileSync(this.envPath, 'utf8');
    let lines = envContent.split('\n');

    // Update each Firebase configuration line
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('FIREBASE_PROJECT_ID=')) {
        lines[i] = `FIREBASE_PROJECT_ID=${config.projectId}`;
      } else if (line.startsWith('FIREBASE_PRIVATE_KEY=')) {
        lines[i] = `FIREBASE_PRIVATE_KEY="${config.privateKey}"`;
      } else if (line.startsWith('FIREBASE_CLIENT_EMAIL=')) {
        lines[i] = `FIREBASE_CLIENT_EMAIL=${config.clientEmail}`;
      }
    }

    // Write back to .env file
    fs.writeFileSync(this.envPath, lines.join('\n'));
    console.log('✅ Updated Firebase configuration in .env file');
  }

  /**
   * Validate Firebase configuration
   */
  private validateConfig(config: FirebaseConfig): boolean {
    if (!config.projectId || config.projectId === 'your-firebase-project-id') {
      console.log('❌ Invalid Firebase Project ID');
      return false;
    }

    if (!config.privateKey || config.privateKey.includes('Your Firebase Private Key Here')) {
      console.log('❌ Invalid Firebase Private Key');
      return false;
    }

    if (!config.clientEmail || config.clientEmail === 'your-service-account@your-project.iam.gserviceaccount.com') {
      console.log('❌ Invalid Firebase Client Email');
      return false;
    }

    return true;
  }

  /**
   * Main update function
   */
  public updateFirebaseConfig(): void {
    console.log('🔧 Firebase Configuration Updater');
    console.log('=' .repeat(50));

    // Check if .env file exists
    if (!this.checkEnvFile()) {
      return;
    }

    // Read current configuration
    const currentConfig = this.readCurrentConfig();
    
    console.log('\n📋 Current Firebase Configuration:');
    console.log(`Project ID: ${currentConfig.projectId}`);
    console.log(`Private Key: ${currentConfig.privateKey.substring(0, 50)}...`);
    console.log(`Client Email: ${currentConfig.clientEmail}`);

    // Check if configuration needs updating
    if (this.validateConfig(currentConfig)) {
      console.log('\n✅ Firebase configuration looks valid!');
      console.log('🎯 You can now run: npm run deerflow-orchestrate:test');
      return;
    }

    console.log('\n🚨 Firebase configuration needs updating!');
    console.log('\n📝 Please follow these steps:');
    console.log('1. Go to https://console.firebase.google.com/');
    console.log('2. Select your project (or create one)');
    console.log('3. Go to Project Settings → Service Accounts');
    console.log('4. Click "Firebase Admin SDK" → "Generate new private key"');
    console.log('5. Download the JSON file');
    console.log('6. Open the JSON file and copy these values:');
    console.log('   - project_id → FIREBASE_PROJECT_ID');
    console.log('   - private_key → FIREBASE_PRIVATE_KEY');
    console.log('   - client_email → FIREBASE_CLIENT_EMAIL');
    console.log('\n7. Update your .env file with these values');
    console.log('\n8. Run this script again to validate');

    console.log('\n🔗 For detailed instructions, see: FIREBASE_SETUP_GUIDE.md');
  }

  /**
   * Interactive update mode
   */
  public interactiveUpdate(): void {
    console.log('🔧 Interactive Firebase Configuration Update');
    console.log('=' .repeat(50));

    if (!this.checkEnvFile()) {
      return;
    }

    console.log('\n📝 Please provide your Firebase configuration:');
    console.log('(Press Enter to skip if you want to update manually)');

    // This would normally use readline for interactive input
    // For now, we'll just show the instructions
    console.log('\n💡 To update manually:');
    console.log('1. Open your .env file');
    console.log('2. Find the Firebase section (lines ~20-30)');
    console.log('3. Replace the placeholder values with your real Firebase credentials');
    console.log('4. Save the file');
    console.log('5. Run: npm run deerflow-orchestrate:test');
  }
}

// Run the updater
async function main() {
  const updater = new FirebaseConfigUpdater();
  
  if (process.argv.includes('--interactive')) {
    updater.interactiveUpdate();
  } else {
    updater.updateFirebaseConfig();
  }
}

if (require.main === module) {
  main().catch(console.error);
} 