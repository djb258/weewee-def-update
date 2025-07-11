#!/usr/bin/env tsx

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AIModel {
  name: string;
  provider: 'openai' | 'google' | 'anthropic' | 'perplexity' | 'abacus';
  capabilities: string[];
  maxTokens: number;
  costPer1kTokens?: number;
  speed?: 'fast' | 'medium' | 'slow';
  quality?: 'high' | 'medium' | 'low';
  availability?: boolean;
}

interface AIRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  task?: 'code-generation' | 'code-review' | 'debugging' | 'documentation' | 'testing' | 'optimization' | 'explanation' | 'brainstorming';
  language?: string;
  context?: string;
}

interface AIResponse {
  provider: string;
  model: string;
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost?: number;
  timestamp: Date;
}

class AIMasterIntegration {
  private openai: OpenAI;
  private gemini: GoogleGenerativeAI;
  private models: AIModel[];

  constructor() {
    // Initialize OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize Gemini
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

    // Define available models
    this.models = [
      // OpenAI Models
      {
        name: 'gpt-4o',
        provider: 'openai',
        capabilities: ['code-generation', 'code-review', 'debugging', 'documentation', 'testing', 'optimization', 'explanation', 'brainstorming'],
        maxTokens: 128000,
        costPer1kTokens: 0.005,
        speed: 'medium',
        quality: 'high',
        availability: !!process.env.OPENAI_API_KEY
      },
      {
        name: 'gpt-4o-mini',
        provider: 'openai',
        capabilities: ['code-generation', 'code-review', 'debugging', 'documentation', 'testing', 'optimization', 'explanation', 'brainstorming'],
        maxTokens: 128000,
        costPer1kTokens: 0.00015,
        speed: 'fast',
        quality: 'medium',
        availability: !!process.env.OPENAI_API_KEY
      },
      {
        name: 'gpt-3.5-turbo',
        provider: 'openai',
        capabilities: ['code-generation', 'code-review', 'debugging', 'documentation', 'testing', 'optimization', 'explanation', 'brainstorming'],
        maxTokens: 16385,
        costPer1kTokens: 0.0005,
        speed: 'fast',
        quality: 'medium',
        availability: !!process.env.OPENAI_API_KEY
      },

      // Google Gemini Models
      {
        name: 'gemini-1.5-pro',
        provider: 'google',
        capabilities: ['code-generation', 'code-review', 'debugging', 'documentation', 'testing', 'optimization', 'explanation', 'brainstorming'],
        maxTokens: 1000000,
        costPer1kTokens: 0.00375,
        speed: 'medium',
        quality: 'high',
        availability: !!process.env.GEMINI_API_KEY
      },
      {
        name: 'gemini-1.5-flash',
        provider: 'google',
        capabilities: ['code-generation', 'code-review', 'debugging', 'documentation', 'testing', 'optimization', 'explanation', 'brainstorming'],
        maxTokens: 1000000,
        costPer1kTokens: 0.000075,
        speed: 'fast',
        quality: 'medium',
        availability: !!process.env.GEMINI_API_KEY
      },
      {
        name: 'gemini-1.0-pro',
        provider: 'google',
        capabilities: ['code-generation', 'code-review', 'debugging', 'documentation', 'testing', 'optimization', 'explanation', 'brainstorming'],
        maxTokens: 30000,
        costPer1kTokens: 0.0005,
        speed: 'medium',
        quality: 'medium',
        availability: !!process.env.GEMINI_API_KEY
      },

      // Claude Models (via existing integration)
      {
        name: 'claude-3-5-sonnet',
        provider: 'anthropic',
        capabilities: ['code-generation', 'code-review', 'debugging', 'documentation', 'testing', 'optimization', 'explanation', 'brainstorming'],
        maxTokens: 200000,
        costPer1kTokens: 0.003,
        speed: 'slow',
        quality: 'high',
        availability: !!process.env.ANTHROPIC_API_KEY
      },
      {
        name: 'claude-3-5-haiku',
        provider: 'anthropic',
        capabilities: ['code-generation', 'code-review', 'debugging', 'documentation', 'testing', 'optimization', 'explanation', 'brainstorming'],
        maxTokens: 200000,
        costPer1kTokens: 0.00025,
        speed: 'fast',
        quality: 'medium',
        availability: !!process.env.ANTHROPIC_API_KEY
      },

      // Perplexity Models (via existing integration)
      {
        name: 'llama-3.1-70b-instruct',
        provider: 'perplexity',
        capabilities: ['code-generation', 'code-review', 'debugging', 'documentation', 'testing', 'optimization', 'explanation', 'brainstorming'],
        maxTokens: 4096,
        costPer1kTokens: 0.0002,
        speed: 'medium',
        quality: 'medium',
        availability: !!process.env.PERPLEXITY_API_KEY
      },
      {
        name: 'codellama-70b-instruct',
        provider: 'perplexity',
        capabilities: ['code-generation', 'code-review', 'debugging', 'documentation', 'testing', 'optimization'],
        maxTokens: 4096,
        costPer1kTokens: 0.0002,
        speed: 'medium',
        quality: 'medium',
        availability: !!process.env.PERPLEXITY_API_KEY
      }
    ];
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    const model = this.getModel(request.model || 'gpt-4o');
    
    switch (model.provider) {
      case 'openai':
        return await this.generateOpenAIResponse(request, model);
      case 'google':
        return await this.generateGeminiResponse(request, model);
      case 'anthropic':
        return await this.generateClaudeResponse(request, model);
      case 'perplexity':
        return await this.generatePerplexityResponse(request, model);
      default:
        throw new Error(`Unsupported provider: ${model.provider}`);
    }
  }

  private async generateOpenAIResponse(request: AIRequest, model: AIModel): Promise<AIResponse> {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not found');
    }

    const systemPrompt = this.getSystemPrompt(request.task, request.language);
    const userPrompt = this.formatPrompt(request);

    const completion = await this.openai.chat.completions.create({
      model: model.name,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: request.maxTokens || model.maxTokens,
      temperature: request.temperature || 0.7
    });

    return {
      provider: 'openai',
      model: model.name,
      content: completion.choices[0]?.message?.content || '',
      usage: completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens
      } : undefined,
      cost: this.calculateCost(completion.usage?.total_tokens || 0, model.costPer1kTokens),
      timestamp: new Date()
    };
  }

  private async generateGeminiResponse(request: AIRequest, model: AIModel): Promise<AIResponse> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key not found');
    }

    const geminiModel = this.gemini.getGenerativeModel({ model: model.name });
    const systemPrompt = this.getSystemPrompt(request.task, request.language);
    const userPrompt = this.formatPrompt(request);
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const result = await geminiModel.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      provider: 'google',
      model: model.name,
      content: text,
      timestamp: new Date()
    };
  }

  private async generateClaudeResponse(request: AIRequest, model: AIModel): Promise<AIResponse> {
    // Use existing Claude integration
    const { execSync } = require('child_process');
    
    try {
      const systemPrompt = this.getSystemPrompt(request.task, request.language);
      const userPrompt = this.formatPrompt(request);
      
      const result = execSync(`tsx scripts/claude-auto.ts chat "${userPrompt}"`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });

      return {
        provider: 'anthropic',
        model: model.name,
        content: result.trim(),
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Claude integration error: ${error}`);
    }
  }

  private async generatePerplexityResponse(request: AIRequest, model: AIModel): Promise<AIResponse> {
    // Use existing Perplexity integration
    const { execSync } = require('child_process');
    
    try {
      const userPrompt = this.formatPrompt(request);
      
      const result = execSync(`tsx scripts/perplexity-integration.ts chat "${userPrompt}"`, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });

      return {
        provider: 'perplexity',
        model: model.name,
        content: result.trim(),
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Perplexity integration error: ${error}`);
    }
  }

  private getSystemPrompt(task?: string, language?: string): string {
    const basePrompt = 'You are an expert software developer and AI assistant.';
    
    switch (task) {
      case 'code-generation':
        return `${basePrompt} Generate clean, well-documented, and production-ready ${language || 'TypeScript'} code. Always include proper error handling and TypeScript types when applicable.`;
      case 'code-review':
        return `${basePrompt} Review code for best practices, security issues, performance problems, and maintainability. Provide specific, actionable recommendations.`;
      case 'debugging':
        return `${basePrompt} Analyze code and error messages to identify and fix issues. Provide clear explanations and multiple solutions when possible.`;
      case 'documentation':
        return `${basePrompt} Generate clear, comprehensive documentation. Use appropriate formatting and include examples.`;
      case 'testing':
        return `${basePrompt} Generate comprehensive test cases that cover edge cases, error scenarios, and happy paths.`;
      case 'optimization':
        return `${basePrompt} Analyze code for optimization opportunities. Focus on performance, readability, and maintainability.`;
      case 'explanation':
        return `${basePrompt} Explain concepts clearly with practical examples and code snippets.`;
      case 'brainstorming':
        return `${basePrompt} Generate creative and innovative ideas. Think outside the box and provide detailed explanations.`;
      default:
        return basePrompt;
    }
  }

  private formatPrompt(request: AIRequest): string {
    let prompt = request.prompt;
    
    if (request.context) {
      prompt = `Context: ${request.context}\n\nTask: ${prompt}`;
    }
    
    if (request.language && request.task === 'code-generation') {
      prompt = `Generate ${request.language} code for: ${prompt}`;
    }
    
    return prompt;
  }

  private getModel(modelName: string): AIModel {
    const model = this.models.find(m => m.name === modelName);
    if (!model) {
      throw new Error(`Model not found: ${modelName}`);
    }
    return model;
  }

  private calculateCost(tokens: number, costPer1kTokens?: number): number | undefined {
    if (!costPer1kTokens) return undefined;
    return (tokens / 1000) * costPer1kTokens;
  }

  // Specialized methods for common tasks
  async generateCode(prompt: string, language: string = 'typescript', model?: string): Promise<AIResponse> {
    return await this.generateResponse({
      prompt,
      task: 'code-generation',
      language,
      model,
      temperature: 0.3
    });
  }

  async reviewCode(code: string, model?: string): Promise<AIResponse> {
    return await this.generateResponse({
      prompt: `Review this code:\n\n\`\`\`typescript\n${code}\n\`\`\``,
      task: 'code-review',
      model,
      temperature: 0.4
    });
  }

  async debugCode(code: string, errorMessage?: string, model?: string): Promise<AIResponse> {
    const prompt = errorMessage 
      ? `Debug this code with error: ${errorMessage}\n\n\`\`\`typescript\n${code}\n\`\`\``
      : `Debug this code:\n\n\`\`\`typescript\n${code}\n\`\`\``;
    
    return await this.generateResponse({
      prompt,
      task: 'debugging',
      model,
      temperature: 0.2
    });
  }

  async generateTests(code: string, framework: string = 'jest', model?: string): Promise<AIResponse> {
    return await this.generateResponse({
      prompt: `Generate ${framework} tests for this code:\n\n\`\`\`typescript\n${code}\n\`\`\``,
      task: 'testing',
      model,
      temperature: 0.3
    });
  }

  async explainConcept(concept: string, level: string = 'intermediate', model?: string): Promise<AIResponse> {
    return await this.generateResponse({
      prompt: `Explain ${concept} at a ${level} level with code examples.`,
      task: 'explanation',
      model,
      temperature: 0.5
    });
  }

  async brainstormIdeas(topic: string, count: number = 5, model?: string): Promise<AIResponse> {
    return await this.generateResponse({
      prompt: `Brainstorm ${count} innovative ideas for: ${topic}`,
      task: 'brainstorming',
      model,
      temperature: 0.8
    });
  }

  // Utility methods
  getAvailableModels(): AIModel[] {
    return this.models;
  }

  getModelsByProvider(provider: string): AIModel[] {
    return this.models.filter(m => m.provider === provider);
  }

  getModelsByCapability(capability: string): AIModel[] {
    return this.models.filter(m => m.capabilities.includes(capability));
  }

  async saveResponse(response: AIResponse, filename: string): Promise<void> {
    const outputDir = 'ai-output';
    if (!existsSync(outputDir)) {
      execSync(`mkdir ${outputDir}`);
    }

    const filepath = join(outputDir, filename);
    const content = JSON.stringify(response, null, 2);
    writeFileSync(filepath, content);
    console.log(`✅ Response saved to: ${filepath}`);
  }

  async compareModels(prompt: string, models: string[]): Promise<AIResponse[]> {
    const responses: AIResponse[] = [];
    
    for (const modelName of models) {
      try {
        const response = await this.generateResponse({
          prompt,
          model: modelName,
          temperature: 0.7
        });
        responses.push(response);
        console.log(`✅ ${modelName}: ${response.content.substring(0, 100)}...`);
      } catch (error) {
        console.error(`❌ ${modelName}: ${error}`);
      }
    }
    
    return responses;
  }

  /**
   * Auto-select the best model based on task and preferences
   */
  autoSelectModel(
    task?: string,
    preferences: {
      priority?: 'quality' | 'speed' | 'cost' | 'balanced';
      maxCost?: number;
      minQuality?: 'high' | 'medium' | 'low';
      maxTokens?: number;
    } = {}
  ): AIModel {
    const { priority = 'balanced', maxCost, minQuality, maxTokens } = preferences;
    
    // Filter available models
    let availableModels = this.models.filter(model => model.availability);
    
    // Filter by max tokens if specified
    if (maxTokens) {
      availableModels = availableModels.filter(model => model.maxTokens >= maxTokens);
    }
    
    // Filter by minimum quality if specified
    if (minQuality) {
      const qualityRank = { low: 1, medium: 2, high: 3 };
      const minQualityRank = qualityRank[minQuality];
      availableModels = availableModels.filter(model => 
        qualityRank[model.quality || 'medium'] >= minQualityRank
      );
    }
    
    // Filter by max cost if specified
    if (maxCost && maxCost > 0) {
      availableModels = availableModels.filter(model => 
        (model.costPer1kTokens || 0) <= maxCost
      );
    }
    
    if (availableModels.length === 0) {
      throw new Error('No suitable models available with current preferences');
    }
    
    // Score models based on priority
    const scoredModels = availableModels.map(model => {
      let score = 0;
      
      switch (priority) {
        case 'quality':
          score += (model.quality === 'high' ? 3 : model.quality === 'medium' ? 2 : 1) * 10;
          score += (model.costPer1kTokens || 0) * -1000; // Lower cost is better
          score += (model.speed === 'fast' ? 3 : model.speed === 'medium' ? 2 : 1);
          break;
          
        case 'speed':
          score += (model.speed === 'fast' ? 3 : model.speed === 'medium' ? 2 : 1) * 10;
          score += (model.quality === 'high' ? 3 : model.quality === 'medium' ? 2 : 1) * 5;
          score += (model.costPer1kTokens || 0) * -1000;
          break;
          
        case 'cost':
          score += (model.costPer1kTokens || 0) * -10000; // Lower cost is much better
          score += (model.quality === 'high' ? 3 : model.quality === 'medium' ? 2 : 1) * 3;
          score += (model.speed === 'fast' ? 3 : model.speed === 'medium' ? 2 : 1) * 2;
          break;
          
        case 'balanced':
        default:
          score += (model.quality === 'high' ? 3 : model.quality === 'medium' ? 2 : 1) * 5;
          score += (model.speed === 'fast' ? 3 : model.speed === 'medium' ? 2 : 1) * 3;
          score += (model.costPer1kTokens || 0) * -5000;
          break;
      }
      
      // Task-specific bonuses
      if (task) {
        switch (task) {
          case 'code-generation':
            if (model.name.includes('code') || model.name.includes('codellama')) {
              score += 5;
            }
            break;
          case 'code-review':
            if (model.quality === 'high') {
              score += 3;
            }
            break;
          case 'debugging':
            if (model.quality === 'high') {
              score += 3;
            }
            break;
          case 'documentation':
            if (model.quality === 'high') {
              score += 2;
            }
            break;
        }
      }
      
      return { model, score };
    });
    
    // Sort by score and return the best model
    scoredModels.sort((a, b) => b.score - a.score);
    
    console.log(`🤖 Auto-selected: ${scoredModels[0].model.name} (${scoredModels[0].model.provider})`);
    console.log(`   Quality: ${scoredModels[0].model.quality}, Speed: ${scoredModels[0].model.speed}, Cost: $${scoredModels[0].model.costPer1kTokens}/1K tokens`);
    
    return scoredModels[0].model;
  }

  /**
   * Generate response with auto-selected model
   */
  async generateResponseAuto(
    request: Omit<AIRequest, 'model'>,
    preferences?: {
      priority?: 'quality' | 'speed' | 'cost' | 'balanced';
      maxCost?: number;
      minQuality?: 'high' | 'medium' | 'low';
      maxTokens?: number;
    }
  ): Promise<AIResponse> {
    const selectedModel = this.autoSelectModel(request.task, preferences);
    return await this.generateResponse({ ...request, model: selectedModel.name });
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const aiMaster = new AIMasterIntegration();

  switch (command) {
    case 'chat':
      const message = args[1];
      const model = args[2] || 'gpt-4o';
      
      if (!message) {
        console.error('❌ Please provide a message');
        process.exit(1);
      }
      
      try {
        const response = await aiMaster.generateResponse({
          prompt: message,
          model
        });
        console.log(`🤖 ${response.provider}/${response.model}:`);
        console.log(response.content);
      } catch (error) {
        console.error('❌ Error:', error);
      }
      break;

    case 'auto':
      const autoMessage = args[1];
      const priority = args[2] as 'quality' | 'speed' | 'cost' | 'balanced' || 'balanced';
      const maxCost = args[3] ? parseFloat(args[3]) : undefined;
      
      if (!autoMessage) {
        console.error('❌ Please provide a message for auto-selection');
        process.exit(1);
      }
      
      try {
        const response = await aiMaster.generateResponseAuto({
          prompt: autoMessage,
          task: 'explanation'
        }, {
          priority,
          maxCost,
          minQuality: 'medium'
        });
        
        console.log(`🤖 Auto-selected ${response.provider}/${response.model}:`);
        console.log(response.content);
        
        if (response.cost) {
          console.log(`💰 Estimated cost: $${response.cost.toFixed(6)}`);
        }
      } catch (error) {
        console.error('❌ Error:', error);
      }
      break;

    case 'generate-code':
      const codePrompt = args[1];
      const language = args[2] || 'typescript';
      const codeModel = args[3] || 'gpt-4o';
      
      if (!codePrompt) {
        console.error('❌ Please provide a code generation prompt');
        process.exit(1);
      }
      
      try {
        const response = await aiMaster.generateCode(codePrompt, language, codeModel);
        console.log(`💻 Generated ${language} code:`);
        console.log(response.content);
      } catch (error) {
        console.error('❌ Error:', error);
      }
      break;

    case 'review-code':
      const filepath = args[1];
      const reviewModel = args[2] || 'gpt-4o';
      
      if (!filepath) {
        console.error('❌ Please provide a filepath for code review');
        process.exit(1);
      }
      
      try {
        const code = readFileSync(filepath, 'utf-8');
        const response = await aiMaster.reviewCode(code, reviewModel);
        console.log(`🔍 Code Review:`);
        console.log(response.content);
      } catch (error) {
        console.error('❌ Error:', error);
      }
      break;

    case 'debug':
      const debugFilepath = args[1];
      const errorMessage = args[2];
      const debugModel = args[3] || 'gpt-4o';
      
      if (!debugFilepath) {
        console.error('❌ Please provide a filepath for debugging');
        process.exit(1);
      }
      
      try {
        const code = readFileSync(debugFilepath, 'utf-8');
        const response = await aiMaster.debugCode(code, errorMessage, debugModel);
        console.log(`🐛 Debug Analysis:`);
        console.log(response.content);
      } catch (error) {
        console.error('❌ Error:', error);
      }
      break;

    case 'generate-tests':
      const testFilepath = args[1];
      const framework = args[2] || 'jest';
      const testModel = args[3] || 'gpt-4o';
      
      if (!testFilepath) {
        console.error('❌ Please provide a filepath for test generation');
        process.exit(1);
      }
      
      try {
        const code = readFileSync(testFilepath, 'utf-8');
        const response = await aiMaster.generateTests(code, framework, testModel);
        console.log(`🧪 Generated ${framework} Tests:`);
        console.log(response.content);
      } catch (error) {
        console.error('❌ Error:', error);
      }
      break;

    case 'explain':
      const concept = args[1];
      const level = args[2] || 'intermediate';
      const explainModel = args[3] || 'gpt-4o';
      
      if (!concept) {
        console.error('❌ Please provide a concept to explain');
        process.exit(1);
      }
      
      try {
        const response = await aiMaster.explainConcept(concept, level, explainModel);
        console.log(`📚 ${level} explanation of ${concept}:`);
        console.log(response.content);
      } catch (error) {
        console.error('❌ Error:', error);
      }
      break;

    case 'brainstorm':
      const topic = args[1];
      const count = parseInt(args[2]) || 5;
      const brainstormModel = args[3] || 'gpt-4o';
      
      if (!topic) {
        console.error('❌ Please provide a topic for brainstorming');
        process.exit(1);
      }
      
      try {
        const response = await aiMaster.brainstormIdeas(topic, count, brainstormModel);
        console.log(`💡 ${count} ideas for ${topic}:`);
        console.log(response.content);
      } catch (error) {
        console.error('❌ Error:', error);
      }
      break;

    case 'compare':
      const comparePrompt = args[1];
      const modelsToCompare = args.slice(2);
      
      if (!comparePrompt || modelsToCompare.length === 0) {
        console.error('❌ Please provide a prompt and models to compare');
        process.exit(1);
      }
      
      try {
        const responses = await aiMaster.compareModels(comparePrompt, modelsToCompare);
        console.log(`\n📊 Comparison Results:`);
        responses.forEach((response, index) => {
          console.log(`\n${index + 1}. ${response.provider}/${response.model}:`);
          console.log(response.content);
        });
      } catch (error) {
        console.error('❌ Error:', error);
      }
      break;

    case 'models':
      const provider = args[1];
      
      if (provider) {
        const models = aiMaster.getModelsByProvider(provider);
        console.log(`📋 ${provider} Models:`);
        models.forEach(model => {
          console.log(`  - ${model.name} (${model.capabilities.join(', ')})`);
        });
      } else {
        console.log('📋 All Available Models:');
        aiMaster.getAvailableModels().forEach(model => {
          console.log(`  - ${model.name} (${model.provider}) - ${model.capabilities.join(', ')}`);
        });
      }
      break;

    default:
      console.log(`
🚀 AI Master Integration

Usage:
  tsx scripts/ai-master-integration.ts <command> [options]

Commands:
  chat <message> [model]                    - Chat with any AI model
  auto <message> [priority] [maxCost]       - Auto-select best model for the task
  generate-code <prompt> [lang] [model]     - Generate code in specified language
  review-code <file> [model]                - Review code for issues and improvements
  debug <file> [error] [model]              - Debug code with optional error message
  generate-tests <file> [framework] [model] - Generate tests for code
  explain <concept> [level] [model]         - Explain concept at specified level
  brainstorm <topic> [count] [model]        - Brainstorm ideas
  compare <prompt> <model1> <model2> ...    - Compare responses from multiple models
  models [provider]                         - List available models

Auto-selection Priorities:
  quality  - Best quality output (slower, more expensive)
  speed    - Fastest response (may sacrifice quality)
  cost     - Most cost-effective (may sacrifice quality/speed)
  balanced - Balanced approach (default)

Examples:
  tsx scripts/ai-master-integration.ts auto "Explain React hooks" quality
  tsx scripts/ai-master-integration.ts auto "Generate a simple function" speed 0.001
  tsx scripts/ai-master-integration.ts auto "Debug this code" cost
  tsx scripts/ai-master-integration.ts chat "How do I implement authentication?" gpt-4o
  tsx scripts/ai-master-integration.ts generate-code "React component for user profile" typescript gemini-1.5-pro
  tsx scripts/ai-master-integration.ts review-code src/App.tsx gpt-4o
  tsx scripts/ai-master-integration.ts compare "Explain React hooks" gpt-4o gemini-1.5-pro claude-3-5-sonnet
  tsx scripts/ai-master-integration.ts models openai

Environment Variables:
  OPENAI_API_KEY - Your OpenAI API key
  GEMINI_API_KEY - Your Google Gemini API key
  ANTHROPIC_API_KEY - Your Anthropic API key
  PERPLEXITY_API_KEY - Your Perplexity API key
      `);
  }
}

// Replace CommonJS main check with ESM-compatible check
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url === process.argv[1]) {
  main().catch(console.error);
}

export { AIMasterIntegration, AIModel, AIRequest, AIResponse }; 