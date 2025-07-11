#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface PerplexityConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  maxTokens: number;
  temperature: number;
}

interface PerplexityRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

interface PerplexityResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class PerplexityLabsIntegration {
  private config: PerplexityConfig;
  private apiKey: string;

  constructor(config?: Partial<PerplexityConfig>) {
    this.config = {
      apiKey: process.env.PERPLEXITY_API_KEY || '',
      baseUrl: 'https://api.perplexity.ai',
      defaultModel: 'llama-3.1-8b-online',
      maxTokens: 4096,
      temperature: 0.7,
      ...config
    };
    
    this.apiKey = this.config.apiKey;
    
    if (!this.apiKey) {
      console.warn('⚠️  PERPLEXITY_API_KEY not found in environment variables');
    }
  }

  async chat(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>, options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
    stream?: boolean;
  }): Promise<PerplexityResponse> {
    if (!this.apiKey) {
      throw new Error('Perplexity API key is required');
    }

    const request: PerplexityRequest = {
      model: options?.model || this.config.defaultModel,
      messages,
      max_tokens: options?.maxTokens || this.config.maxTokens,
      temperature: options?.temperature || this.config.temperature,
      stream: options?.stream || false
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling Perplexity API:', error);
      throw error;
    }
  }

  async generateCode(prompt: string, language: string = 'typescript'): Promise<string> {
    const messages = [
      {
        role: 'system' as const,
        content: `You are an expert ${language} developer. Generate clean, well-documented, and production-ready code. Always include proper error handling and TypeScript types when applicable.`
      },
      {
        role: 'user' as const,
        content: prompt
      }
    ];

    const response = await this.chat(messages, {
      temperature: 0.3, // Lower temperature for more consistent code generation
      maxTokens: 2048
    });

    return response.choices[0]?.message?.content || '';
  }

  async analyzeCode(code: string, analysisType: 'security' | 'performance' | 'best-practices' | 'refactor'): Promise<string> {
    const analysisPrompts = {
      security: 'Analyze this code for security vulnerabilities and provide specific recommendations:',
      performance: 'Analyze this code for performance issues and provide optimization suggestions:',
      'best-practices': 'Review this code for best practices and suggest improvements:',
      refactor: 'Suggest refactoring opportunities for this code to improve maintainability:'
    };

    const messages = [
      {
        role: 'system' as const,
        content: 'You are an expert code reviewer with deep knowledge of software engineering best practices.'
      },
      {
        role: 'user' as const,
        content: `${analysisPrompts[analysisType]}\n\n\`\`\`typescript\n${code}\n\`\`\``
      }
    ];

    const response = await this.chat(messages, {
      temperature: 0.4,
      maxTokens: 2048
    });

    return response.choices[0]?.message?.content || '';
  }

  async generateTests(code: string, framework: 'jest' | 'vitest' | 'playwright' = 'jest'): Promise<string> {
    const messages = [
      {
        role: 'system' as const,
        content: `You are an expert in ${framework} testing. Generate comprehensive test cases that cover edge cases, error scenarios, and happy paths.`
      },
      {
        role: 'user' as const,
        content: `Generate ${framework} tests for this code:\n\n\`\`\`typescript\n${code}\n\`\`\``
      }
    ];

    const response = await this.chat(messages, {
      temperature: 0.3,
      maxTokens: 2048
    });

    return response.choices[0]?.message?.content || '';
  }

  async generateDocumentation(code: string, format: 'jsdoc' | 'markdown' | 'readme' = 'jsdoc'): Promise<string> {
    const formatPrompts = {
      jsdoc: 'Generate comprehensive JSDoc documentation for this code:',
      markdown: 'Generate markdown documentation explaining this code:',
      readme: 'Generate a README section explaining this code:'
    };

    const messages = [
      {
        role: 'system' as const,
        content: 'You are an expert technical writer. Generate clear, comprehensive documentation.'
      },
      {
        role: 'user' as const,
        content: `${formatPrompts[format]}\n\n\`\`\`typescript\n${code}\n\`\`\``
      }
    ];

    const response = await this.chat(messages, {
      temperature: 0.4,
      maxTokens: 2048
    });

    return response.choices[0]?.message?.content || '';
  }

  async debugCode(code: string, errorMessage?: string): Promise<string> {
    const messages = [
      {
        role: 'system' as const,
        content: 'You are an expert debugger. Analyze code and error messages to identify and fix issues.'
      },
      {
        role: 'user' as const,
        content: `Debug this code${errorMessage ? ` with error: ${errorMessage}` : ''}:\n\n\`\`\`typescript\n${code}\n\`\`\``
      }
    ];

    const response = await this.chat(messages, {
      temperature: 0.2,
      maxTokens: 2048
    });

    return response.choices[0]?.message?.content || '';
  }

  async optimizeCode(code: string, optimizationType: 'performance' | 'readability' | 'memory' = 'performance'): Promise<string> {
    const optimizationPrompts = {
      performance: 'Optimize this code for better performance:',
      readability: 'Refactor this code for better readability and maintainability:',
      memory: 'Optimize this code for better memory usage:'
    };

    const messages = [
      {
        role: 'system' as const,
        content: 'You are an expert code optimizer. Provide optimized versions with explanations.'
      },
      {
        role: 'user' as const,
        content: `${optimizationPrompts[optimizationType]}\n\n\`\`\`typescript\n${code}\n\`\`\``
      }
    ];

    const response = await this.chat(messages, {
      temperature: 0.3,
      maxTokens: 2048
    });

    return response.choices[0]?.message?.content || '';
  }

  async generateSchema(data: any, format: 'json' | 'typescript' | 'zod' = 'typescript'): Promise<string> {
    const messages = [
      {
        role: 'system' as const,
        content: `You are an expert in ${format} schema generation. Generate accurate schemas based on data structures.`
      },
      {
        role: 'user' as const,
        content: `Generate a ${format} schema for this data:\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``
      }
    ];

    const response = await this.chat(messages, {
      temperature: 0.2,
      maxTokens: 2048
    });

    return response.choices[0]?.message?.content || '';
  }

  async explainConcept(concept: string, level: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'): Promise<string> {
    const messages = [
      {
        role: 'system' as const,
        content: `You are an expert educator. Explain concepts at a ${level} level with practical examples.`
      },
      {
        role: 'user' as const,
        content: `Explain ${concept} at a ${level} level with code examples.`
      }
    ];

    const response = await this.chat(messages, {
      temperature: 0.5,
      maxTokens: 2048
    });

    return response.choices[0]?.message?.content || '';
  }

  async brainstormIdeas(topic: string, count: number = 5): Promise<string> {
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a creative problem solver. Generate innovative ideas and solutions.'
      },
      {
        role: 'user' as const,
        content: `Brainstorm ${count} innovative ideas for: ${topic}`
      }
    ];

    const response = await this.chat(messages, {
      temperature: 0.8,
      maxTokens: 2048
    });

    return response.choices[0]?.message?.content || '';
  }

  // Utility methods
  async saveResponse(response: string, filename: string): Promise<void> {
    const outputDir = 'perplexity-output';
    if (!existsSync(outputDir)) {
      execSync(`mkdir ${outputDir}`);
    }

    const filepath = join(outputDir, filename);
    writeFileSync(filepath, response);
    console.log(`✅ Response saved to: ${filepath}`);
  }

  async loadCodeFromFile(filepath: string): Promise<string> {
    if (!existsSync(filepath)) {
      throw new Error(`File not found: ${filepath}`);
    }
    return readFileSync(filepath, 'utf-8');
  }

  getAvailableModels(): string[] {
    return [
      'llama-3.1-8b-online',
      'llama-3.1-70b-online',
      'llama-3.1-8b-instruct',
      'llama-3.1-70b-instruct',
      'mixtral-8x7b-instruct',
      'codellama-70b-instruct',
      'mistral-7b-instruct'
    ];
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const perplexity = new PerplexityLabsIntegration();

  switch (command) {
    case 'chat':
      const message = args[1];
      if (!message) {
        console.error('❌ Please provide a message');
        process.exit(1);
      }
      
      try {
        const response = await perplexity.chat([
          { role: 'user', content: message }
        ]);
        console.log('🤖 Response:', response.choices[0]?.message?.content);
      } catch (error) {
        console.error('❌ Error:', error);
      }
      break;

    case 'generate-code':
      const prompt = args[1];
      const language = args[2] || 'typescript';
      
      if (!prompt) {
        console.error('❌ Please provide a code generation prompt');
        process.exit(1);
      }
      
      try {
        const code = await perplexity.generateCode(prompt, language);
        console.log('💻 Generated Code:');
        console.log(code);
        
        if (args[3] === '--save') {
          await perplexity.saveResponse(code, `generated-${Date.now()}.${language}`);
        }
      } catch (error) {
        console.error('❌ Error:', error);
      }
      break;

    case 'analyze':
      const filepath = args[1];
      const analysisType = args[2] as 'security' | 'performance' | 'best-practices' | 'refactor';
      
      if (!filepath || !analysisType) {
        console.error('❌ Please provide filepath and analysis type (security|performance|best-practices|refactor)');
        process.exit(1);
      }
      
      try {
        const code = await perplexity.loadCodeFromFile(filepath);
        const analysis = await perplexity.analyzeCode(code, analysisType);
        console.log(`🔍 ${analysisType} Analysis:`);
        console.log(analysis);
      } catch (error) {
        console.error('❌ Error:', error);
      }
      break;

    case 'generate-tests':
      const testFilepath = args[1];
      const framework = args[2] as 'jest' | 'vitest' | 'playwright' || 'jest';
      
      if (!testFilepath) {
        console.error('❌ Please provide filepath for test generation');
        process.exit(1);
      }
      
      try {
        const code = await perplexity.loadCodeFromFile(testFilepath);
        const tests = await perplexity.generateTests(code, framework);
        console.log(`🧪 Generated ${framework} Tests:`);
        console.log(tests);
      } catch (error) {
        console.error('❌ Error:', error);
      }
      break;

    case 'debug':
      const debugFilepath = args[1];
      const errorMessage = args[2];
      
      if (!debugFilepath) {
        console.error('❌ Please provide filepath for debugging');
        process.exit(1);
      }
      
      try {
        const code = await perplexity.loadCodeFromFile(debugFilepath);
        const debugResult = await perplexity.debugCode(code, errorMessage);
        console.log('🐛 Debug Analysis:');
        console.log(debugResult);
      } catch (error) {
        console.error('❌ Error:', error);
      }
      break;

    case 'models':
      console.log('📋 Available Models:');
      perplexity.getAvailableModels().forEach(model => console.log(`  - ${model}`));
      break;

    case 'explain':
      const concept = args[1];
      const level = args[2] as 'beginner' | 'intermediate' | 'advanced' || 'intermediate';
      
      if (!concept) {
        console.error('❌ Please provide a concept to explain');
        process.exit(1);
      }
      
      try {
        const explanation = await perplexity.explainConcept(concept, level);
        console.log(`📚 ${level} explanation of ${concept}:`);
        console.log(explanation);
      } catch (error) {
        console.error('❌ Error:', error);
      }
      break;

    case 'brainstorm':
      const topic = args[1];
      const count = parseInt(args[2]) || 5;
      
      if (!topic) {
        console.error('❌ Please provide a topic for brainstorming');
        process.exit(1);
      }
      
      try {
        const ideas = await perplexity.brainstormIdeas(topic, count);
        console.log(`💡 ${count} ideas for ${topic}:`);
        console.log(ideas);
      } catch (error) {
        console.error('❌ Error:', error);
      }
      break;

    default:
      console.log(`
🚀 Perplexity Labs Integration

Usage:
  tsx scripts/perplexity-integration.ts <command> [options]

Commands:
  chat <message>                    - Chat with Perplexity AI
  generate-code <prompt> [lang]     - Generate code in specified language
  analyze <file> <type>             - Analyze code (security|performance|best-practices|refactor)
  generate-tests <file> [framework] - Generate tests (jest|vitest|playwright)
  debug <file> [error]              - Debug code with optional error message
  models                            - List available models
  explain <concept> [level]         - Explain concept (beginner|intermediate|advanced)
  brainstorm <topic> [count]        - Brainstorm ideas

Examples:
  tsx scripts/perplexity-integration.ts chat "How do I implement authentication?"
  tsx scripts/perplexity-integration.ts generate-code "React component for user profile" typescript
  tsx scripts/perplexity-integration.ts analyze src/App.tsx security
  tsx scripts/perplexity-integration.ts generate-tests src/utils.ts jest
  tsx scripts/perplexity-integration.ts debug src/api.ts "TypeError: Cannot read property"
  tsx scripts/perplexity-integration.ts explain "React hooks" beginner
  tsx scripts/perplexity-integration.ts brainstorm "AI features" 10

Environment Variables:
  PERPLEXITY_API_KEY - Your Perplexity API key
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { PerplexityLabsIntegration, PerplexityConfig, PerplexityRequest, PerplexityResponse }; 