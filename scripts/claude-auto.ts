#!/usr/bin/env node

import { Anthropic } from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ClaudeConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

interface ProjectContext {
  schemas: any[];
  doctrine: any;
  modules: string[];
  config: any;
}

class ClaudeAuto {
  private anthropic: Anthropic;
  private config: ClaudeConfig;
  private projectContext: ProjectContext;

  constructor() {
    this.config = this.loadConfig();
    this.anthropic = new Anthropic({
      apiKey: this.config.apiKey || process.env.ANTHROPIC_API_KEY,
    });
    this.projectContext = this.loadProjectContext();
  }

  private loadConfig(): ClaudeConfig {
    const configPath = path.join(__dirname, '..', 'config', 'claude-config.json');
    try {
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (error) {
      console.warn('Could not load Claude config:', error);
    }

    return {
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 4096,
      temperature: 0.7,
      systemPrompt: this.getDefaultSystemPrompt(),
    };
  }

  private getDefaultSystemPrompt(): string {
    return `You are Claude Auto, an AI assistant integrated with the weewee-def-update system. 

This system manages:
- Data schemas and doctrine
- Module management and compliance
- Neon database synchronization
- STAMPED framework enforcement

You have access to:
- All schema definitions in schemas/
- Doctrine files in docs/doctrine/
- Configuration files in config/
- Module definitions in docs/modules/

When helping with this system:
1. Always reference the existing structure and patterns
2. Follow the STAMPED framework principles
3. Ensure compliance with NEON doctrine
4. Maintain consistency with existing naming conventions
5. Provide actionable code and configuration updates

Current project context:
- Repository: weewee-def-update
- Purpose: Parent/master foundation for all system doctrine and modules
- Framework: STAMPED (Structured, Traceable, Audit-ready, Mapped, Promotable, Enforced, Documented)
- Database: Neon with bootstrap table synchronization

Always provide specific, actionable guidance that maintains system integrity.`;
  }

  private loadProjectContext(): ProjectContext {
    const schemas: any[] = [];
    const modules: string[] = [];

    // Load schemas
    const schemasDir = path.join(__dirname, '..', 'schemas');
    if (fs.existsSync(schemasDir)) {
      this.loadSchemasRecursive(schemasDir, schemas);
    }

    // Load doctrine
    let doctrine = {};
    const doctrinePath = path.join(__dirname, '..', 'gbt_doctrine.json');
    if (fs.existsSync(doctrinePath)) {
      try {
        doctrine = JSON.parse(fs.readFileSync(doctrinePath, 'utf8'));
      } catch (error) {
        console.warn('Could not load doctrine:', error);
      }
    }

    // Load modules
    const modulesDir = path.join(__dirname, '..', 'docs', 'modules');
    if (fs.existsSync(modulesDir)) {
      const files = fs.readdirSync(modulesDir);
      modules.push(...files.filter(f => f.endsWith('.md')).map(f => f.replace('.md', '')));
    }

    // Load config
    let config = {};
    const configPath = path.join(__dirname, '..', 'config', 'clients.json');
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch (error) {
        console.warn('Could not load config:', error);
      }
    }

    return { schemas, doctrine, modules, config };
  }

  private loadSchemasRecursive(dir: string, schemas: any[]): void {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.loadSchemasRecursive(filePath, schemas);
      } else if (file.endsWith('.json')) {
        try {
          const schema = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          schemas.push({
            name: file.replace('.json', ''),
            path: path.relative(path.join(__dirname, '..'), filePath),
            content: schema
          });
        } catch (error) {
          console.warn(`Could not load schema ${filePath}:`, error);
        }
      }
    }
  }

  async chat(message: string): Promise<string> {
    try {
      const contextInfo = this.buildContextInfo();
      const fullPrompt = `${contextInfo}\n\nUser Query: ${message}`;

      const response = await this.anthropic.messages.create({
        model: this.config.model!,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        system: this.config.systemPrompt,
        messages: [
          {
            role: 'user',
            content: fullPrompt
          }
        ]
      });

      return response.content[0].type === 'text' ? response.content[0].text : 'No text response received';
    } catch (error) {
      console.error('Error communicating with Claude:', error);
      throw error;
    }
  }

  private buildContextInfo(): string {
    const context = this.projectContext;
    
    return `Project Context:
- Schemas: ${context.schemas.length} loaded
- Modules: ${context.modules.join(', ')}
- Doctrine: ${Object.keys(context.doctrine).length} sections
- Config: ${Object.keys(context.config).length} entries

Available schemas: ${context.schemas.map(s => s.name).join(', ')}
Available modules: ${context.modules.join(', ')}`;
  }

  async generateSchema(schemaName: string, description: string): Promise<string> {
    const prompt = `Generate a JSON schema for "${schemaName}" with the following description: "${description}"

Follow these requirements:
1. Use the existing schema patterns from the project
2. Follow STAMPED framework principles
3. Include proper validation rules
4. Use consistent naming conventions
5. Include metadata fields (created_at, updated_at, etc.)

Return only the JSON schema, no additional text.`;

    return await this.chat(prompt);
  }

  async validateSchema(schemaPath: string): Promise<string> {
    try {
      const fullPath = path.join(__dirname, '..', schemaPath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Schema file not found: ${schemaPath}`);
      }

      const schema = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      const prompt = `Validate this JSON schema against the project's doctrine and STAMPED framework:

${JSON.stringify(schema, null, 2)}

Check for:
1. STAMPED compliance
2. NEON doctrine adherence
3. Naming convention consistency
4. Required field completeness
5. Validation rule appropriateness

Provide specific feedback and suggestions for improvement.`;

      return await this.chat(prompt);
    } catch (error) {
      throw new Error(`Schema validation failed: ${error}`);
    }
  }

  async generateModule(moduleName: string, moduleType: string): Promise<string> {
    const prompt = `Generate a new module structure for "${moduleName}" of type "${moduleType}".

Follow the existing module patterns in the project and include:
1. Module documentation (docs/modules/${moduleName}.md)
2. Schema definitions (schemas/${moduleName}/)
3. Configuration templates
4. Integration guidelines
5. Compliance requirements

Use the STAMPED framework and ensure NEON doctrine compliance.`;

    return await this.chat(prompt);
  }

  async syncToNeon(): Promise<string> {
    const prompt = `Generate a script to sync all schemas and doctrine to the Neon database bootstrap table.

Include:
1. Schema validation before sync
2. Version control tracking
3. Backup procedures
4. Error handling
5. Compliance checking

Use the existing sync patterns in the project.`;

    return await this.chat(prompt);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const claude = new ClaudeAuto();

  if (args.length === 0) {
    console.log(`
Claude Auto - weewee-def-update Integration

Usage:
  node claude-auto.ts chat <message>           - Chat with Claude about the project
  node claude-auto.ts schema <name> <desc>     - Generate a new schema
  node claude-auto.ts validate <schema-path>   - Validate an existing schema
  node claude-auto.ts module <name> <type>     - Generate a new module
  node claude-auto.ts sync                     - Generate Neon sync script
  node claude-auto.ts config                   - Show current configuration

Examples:
  node claude-auto.ts chat "How do I add a new client schema?"
  node claude-auto.ts schema "user_profile" "User profile information"
  node claude-auto.ts validate "schemas/client/client_schema.json"
  node claude-auto.ts module "analytics" "dashboard"
  node claude-auto.ts sync
`);
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case 'chat':
        if (args.length < 2) {
          console.error('Please provide a message for chat');
          return;
        }
        const message = args.slice(1).join(' ');
        const response = await claude.chat(message);
        console.log('\nClaude Response:');
        console.log(response);
        break;

      case 'schema':
        if (args.length < 3) {
          console.error('Please provide schema name and description');
          return;
        }
        const schemaName = args[1];
        const description = args.slice(2).join(' ');
        const schemaResponse = await claude.generateSchema(schemaName, description);
        console.log('\nGenerated Schema:');
        console.log(schemaResponse);
        break;

      case 'validate':
        if (args.length < 2) {
          console.error('Please provide schema path');
          return;
        }
        const schemaPath = args[1];
        const validationResponse = await claude.validateSchema(schemaPath);
        console.log('\nValidation Results:');
        console.log(validationResponse);
        break;

      case 'module':
        if (args.length < 3) {
          console.error('Please provide module name and type');
          return;
        }
        const moduleName = args[1];
        const moduleType = args[2];
        const moduleResponse = await claude.generateModule(moduleName, moduleType);
        console.log('\nGenerated Module:');
        console.log(moduleResponse);
        break;

      case 'sync':
        const syncResponse = await claude.syncToNeon();
        console.log('\nNeon Sync Script:');
        console.log(syncResponse);
        break;

      case 'config':
        console.log('\nCurrent Configuration:');
        console.log(JSON.stringify(claude['config'], null, 2));
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

export { ClaudeAuto }; 