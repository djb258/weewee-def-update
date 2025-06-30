#!/usr/bin/env tsx

/**
 * Priority Reminders System
 * Reminds to backup new API keys and tools to the repo
 * Integrates with environment management
 */

import * as fs from 'fs';
import * as path from 'path';
import { AutoBackupSystem } from './auto_backup';

interface Reminder {
  id: string;
  type: 'api_key' | 'tool' | 'config' | 'env_var';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  created: Date;
  completed: boolean;
  autoBackup: boolean;
}

class PriorityReminders {
  private remindersFile = path.join(path.dirname(__dirname), '.priority-reminders.json');
  private backup = new AutoBackupSystem();

  private log(message: string, color: 'green' | 'yellow' | 'red' | 'blue' = 'blue'): void {
    const colors = {
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
      blue: '\x1b[34m'
    };
    console.log(`${colors[color]}${message}\x1b[0m`);
  }

  private loadReminders(): Reminder[] {
    try {
      if (fs.existsSync(this.remindersFile)) {
        const data = fs.readFileSync(this.remindersFile, 'utf8');
        return JSON.parse(data).map((r: any) => ({
          ...r,
          created: new Date(r.created)
        }));
      }
    } catch (error) {
      this.log('⚠️ Error loading reminders, starting fresh', 'yellow');
    }
    return [];
  }

  private saveReminders(reminders: Reminder[]): void {
    try {
      fs.writeFileSync(this.remindersFile, JSON.stringify(reminders, null, 2));
    } catch (error) {
      this.log('❌ Failed to save reminders', 'red');
    }
  }

  public async addReminder(
    type: Reminder['type'],
    title: string,
    description: string,
    priority: Reminder['priority'] = 'medium',
    autoBackup: boolean = true
  ): Promise<void> {
    const reminders = this.loadReminders();
    
    const reminder: Reminder = {
      id: Date.now().toString(),
      type,
      title,
      description,
      priority,
      created: new Date(),
      completed: false,
      autoBackup
    };

    reminders.push(reminder);
    this.saveReminders(reminders);

    const priorityColor = priority === 'high' ? 'red' : priority === 'medium' ? 'yellow' : 'blue';
    this.log(`➕ Added ${priority} priority reminder: ${title}`, priorityColor as any);

    if (autoBackup) {
      this.log('🔄 Auto-backing up reminder...', 'blue');
      await this.backup.manualBackup(`➕ Added priority reminder: ${title}`);
    }
  }

  public async completeReminder(id: string): Promise<void> {
    const reminders = this.loadReminders();
    const reminder = reminders.find(r => r.id === id);
    
    if (!reminder) {
      this.log('❌ Reminder not found', 'red');
      return;
    }

    reminder.completed = true;
    this.saveReminders(reminders);

    this.log(`✅ Completed reminder: ${reminder.title}`, 'green');

    if (reminder.autoBackup) {
      await this.backup.manualBackup(`✅ Completed reminder: ${reminder.title}`);
    }
  }

  public showReminders(): void {
    const reminders = this.loadReminders();
    const activeReminders = reminders.filter(r => !r.completed);

    if (activeReminders.length === 0) {
      this.log('✅ No active reminders!', 'green');
      return;
    }

    this.log('🔔 Priority Reminders', 'blue');
    this.log('==================', 'blue');

    // Sort by priority and date
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    activeReminders.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.created.getTime() - a.created.getTime();
    });

    activeReminders.forEach((reminder, index) => {
      const priorityEmoji = reminder.priority === 'high' ? '🔴' : 
                           reminder.priority === 'medium' ? '🟡' : '🔵';
      const typeEmoji = reminder.type === 'api_key' ? '🔑' :
                       reminder.type === 'tool' ? '🔧' :
                       reminder.type === 'config' ? '⚙️' : '📝';
      
      const age = Math.floor((Date.now() - reminder.created.getTime()) / (1000 * 60 * 60 * 24));
      const ageText = age === 0 ? 'Today' : `${age} day${age > 1 ? 's' : ''} ago`;

      this.log(`\n${index + 1}. ${priorityEmoji} ${typeEmoji} ${reminder.title}`, 'blue');
      this.log(`   ${reminder.description}`, 'blue');
      this.log(`   ID: ${reminder.id} | Created: ${ageText}`, 'blue');
    });

    this.log(`\n💡 Complete with: npm run remind:done <ID>`, 'yellow');
  }

  public async checkEnvironmentChanges(): Promise<void> {
    this.log('🔍 Checking for new environment variables...', 'blue');

    const envFile = path.join(path.dirname(__dirname), '.env');
    if (!fs.existsSync(envFile)) {
      return;
    }

    const envContent = fs.readFileSync(envFile, 'utf8');
    const envVars = envContent.split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .map(line => line.split('=')[0]);

    // Check for API key patterns
    const apiKeyPatterns = [
      /API_KEY/i,
      /TOKEN/i,
      /SECRET/i,
      /PASSWORD/i,
      /CLIENT_ID/i,
      /CLIENT_SECRET/i
    ];

    const newApiKeys = envVars.filter(varName => 
      apiKeyPatterns.some(pattern => pattern.test(varName))
    );

    if (newApiKeys.length > 0) {
      this.log(`🔑 Found ${newApiKeys.length} potential API keys/secrets`, 'yellow');
      
      for (const keyName of newApiKeys) {
        await this.addReminder(
          'api_key',
          `Backup API key: ${keyName}`,
          `Ensure ${keyName} is properly configured and backed up to the repository`,
          'high',
          false // Don't auto-backup the reminder for security
        );
      }
    }
  }

  public async suggestNewToolReminders(): Promise<void> {
    const commonTools = [
      { name: 'Stripe API', env: 'STRIPE_', description: 'Payment processing API keys' },
      { name: 'Twilio API', env: 'TWILIO_', description: 'SMS/Communication service keys' },
      { name: 'SendGrid API', env: 'SENDGRID_', description: 'Email service API key' },
      { name: 'Auth0', env: 'AUTH0_', description: 'Authentication service configuration' },
      { name: 'AWS Services', env: 'AWS_', description: 'Amazon Web Services credentials' },
      { name: 'Azure Services', env: 'AZURE_', description: 'Microsoft Azure credentials' },
      { name: 'Supabase', env: 'SUPABASE_', description: 'Supabase database and auth' },
      { name: 'Clerk', env: 'CLERK_', description: 'Clerk authentication service' },
      { name: 'Prisma', env: 'PRISMA_', description: 'Prisma database configuration' },
      { name: 'Planetscale', env: 'PLANETSCALE_', description: 'Planetscale database' }
    ];

    this.log('💡 Common tools you might want to add:', 'blue');
    commonTools.forEach((tool, index) => {
      this.log(`${index + 1}. ${tool.name} - ${tool.description}`, 'blue');
    });

    this.log('\n🔧 Add tool reminder with: npm run remind:tool "<tool-name>" "<description>"', 'yellow');
  }

  public async cleanupCompleted(): Promise<void> {
    const reminders = this.loadReminders();
    const activeCount = reminders.filter(r => !r.completed).length;
    const completedCount = reminders.filter(r => r.completed).length;

    if (completedCount === 0) {
      this.log('✅ No completed reminders to clean up', 'green');
      return;
    }

    // Keep only active reminders
    const activeReminders = reminders.filter(r => !r.completed);
    this.saveReminders(activeReminders);

    this.log(`🧹 Cleaned up ${completedCount} completed reminders`, 'green');
    this.log(`📋 ${activeCount} active reminders remaining`, 'blue');

    await this.backup.manualBackup(`🧹 Cleaned up completed reminders`);
  }

  public async urgentCheck(): Promise<void> {
    const reminders = this.loadReminders();
    const highPriorityReminders = reminders.filter(r => !r.completed && r.priority === 'high');
    const oldReminders = reminders.filter(r => {
      const daysSinceCreated = (Date.now() - r.created.getTime()) / (1000 * 60 * 60 * 24);
      return !r.completed && daysSinceCreated > 7; // Older than 7 days
    });

    if (highPriorityReminders.length > 0) {
      this.log('🚨 HIGH PRIORITY REMINDERS:', 'red');
      highPriorityReminders.forEach(r => {
        this.log(`   🔴 ${r.title}`, 'red');
      });
    }

    if (oldReminders.length > 0) {
      this.log('⏰ OLD REMINDERS (7+ days):', 'yellow');
      oldReminders.forEach(r => {
        const days = Math.floor((Date.now() - r.created.getTime()) / (1000 * 60 * 60 * 24));
        this.log(`   ⏰ ${r.title} (${days} days old)`, 'yellow');
      });
    }

    if (highPriorityReminders.length === 0 && oldReminders.length === 0) {
      this.log('✅ No urgent reminders!', 'green');
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const reminders = new PriorityReminders();

  switch (args[0]) {
    case 'add':
      if (args.length < 3) {
        console.log('Usage: npm run remind:add <type> <title> <description> [priority]');
        return;
      }
             await reminders.addReminder(
         (args[1] as any) || 'config',
         args[2] || 'Untitled',
         args[3] || '',
         (args[4] as any) || 'medium'
       );
      break;
    
    case 'api':
      await reminders.addReminder(
        'api_key',
        args[1] || 'New API Key',
        args[2] || 'Add and backup new API key to repository',
        'high'
      );
      break;
    
    case 'tool':
      await reminders.addReminder(
        'tool',
        args[1] || 'New Tool',
        args[2] || 'Configure and backup new development tool',
        'medium'
      );
      break;
    
    case 'done':
      if (!args[1]) {
        console.log('Usage: npm run remind:done <ID>');
        return;
      }
      await reminders.completeReminder(args[1]);
      break;
    
    case 'list':
    case 'show':
      reminders.showReminders();
      break;
    
    case 'check':
      await reminders.checkEnvironmentChanges();
      break;
    
    case 'suggest':
      await reminders.suggestNewToolReminders();
      break;
    
    case 'cleanup':
      await reminders.cleanupCompleted();
      break;
    
    case 'urgent':
      await reminders.urgentCheck();
      break;
    
    default:
      console.log(`
🔔 Priority Reminders System

Usage:
  npm run remind:add <type> <title> <description> [priority]
  npm run remind:api "<api-name>" "<description>"
  npm run remind:tool "<tool-name>" "<description>"
  npm run remind:done <ID>
  npm run remind:list
  npm run remind:check
  npm run remind:suggest
  npm run remind:urgent
  npm run remind:cleanup

Examples:
  npm run remind:api "OpenAI API" "Add OpenAI API key to environment"
  npm run remind:tool "Docker" "Configure Docker for development"
  npm run remind:done 1234567890
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { PriorityReminders }; 