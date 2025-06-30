#!/usr/bin/env tsx

/**
 * RTRVR.AI Integration
 * AI-powered retrieval and search platform for intelligent data discovery
 * Run: npm run rtrvr:setup
 */

import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import { BartonDoctrineFormatter, BartonDoctrinePayload } from '../src/schemas/barton-doctrine-formatter';

// 🔒 MANDATORY: Barton Doctrine enforcement
import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';


// Load environment variables
config();


// 🔒 MANDATORY: Initialize Barton Doctrine (CANNOT BE SKIPPED)
const doctrine = START_WITH_BARTON_DOCTRINE('rtrvr');

class RTRVRIntegration {
  private config: any;
  private client: any;

  constructor() {
    this.config = {
      apiKey: process.env.RTRVR_API_KEY || "",
      baseUrl: process.env.RTRVR_BASE_URL || "https://api.rtrvr.ai/v1",
      projectId: process.env.RTRVR_PROJECT_ID,
      indexId: process.env.RTRVR_INDEX_ID
    };

    if (!this.config.apiKey) {
      throw new Error("RTRVR_API_KEY is required. Please set it in your .env file.");
    }

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      headers: {
        "Authorization": `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json"
      }
    });
  }

  private log(message: string, color: string = "blue"): void {
    const colors: any = {
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      red: "\x1b[31m",
      blue: "\x1b[34m",
      cyan: "\x1b[36m",
      magenta: "\x1b[35m"
    };
    console.log(`${colors[color]}${message}\x1b[0m`);
  }

  public async setup(): Promise<void> {
    this.log("🔍 Setting up RTRVR.AI Integration", "blue");
    this.log("==================================", "blue");

    try {
      await this.testConnection();
      
      const account = await this.getAccountInfo();
      if (account) {
        this.log(`✅ Connected as: ${account.email || account.name}`, "green");
        this.log(`💰 Credits: ${account.credits || 0}`, "blue");
      }

      const indexes = await this.listIndexes();
      this.log(`📚 Found ${indexes.length} index(es) in your account`, "green");

      this.log("✅ RTRVR.AI integration setup complete!", "green");
      this.log("🚀 Ready for AI-powered retrieval and search!", "cyan");
    } catch (error: any) {
      this.log("❌ Setup failed:", "red");
      this.log(error.message, "red");
      throw error;
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      this.log("🔍 Testing RTRVR.AI API connection...", "blue");
      
      // Test with account info or health check
      const response = await this.client.get("/account");
      
      if (response.status === 200) {
        this.log("✅ API connection successful!", "green");
        return true;
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error: any) {
      this.log("❌ API connection failed:", "red");
      if (error.response?.status === 401) {
        this.log("Invalid API key. Please check your RTRVR_API_KEY", "red");
      } else if (error.response?.status === 403) {
        this.log("Access forbidden. Please check your API key permissions", "red");
      } else {
        this.log(error.message, "red");
      }
      return false;
    }
  }

  public async getAccountInfo(): Promise<any> {
    try {
      const response = await this.client.get("/account");
      return response.data;
    } catch (error: any) {
      this.log("❌ Failed to get account info:", "red");
      this.log(error.message, "red");
      return null;
    }
  }

  public async listIndexes(): Promise<any[]> {
    try {
      this.log("📚 Fetching indexes...", "blue");
      
      const response = await this.client.get("/indexes");
      return response.data.indexes || [];
    } catch (error: any) {
      this.log("❌ Failed to fetch indexes:", "red");
      this.log(error.message, "red");
      return [];
    }
  }

  public async createIndex(name: string, description?: string): Promise<any> {
    try {
      this.log(`📚 Creating index: ${name}`, "blue");
      
      const response = await this.client.post("/indexes", {
        name: name,
        description: description || `Index created for ${name}`
      });

      const index = response.data;
      this.log(`✅ Index created: ${index.id}`, "green");
      
      return index;
    } catch (error: any) {
      this.log("❌ Failed to create index:", "red");
      this.log(error.message, "red");
      throw error;
    }
  }

  public async addDocument(indexId: string, document: any): Promise<any> {
    try {
      this.log(`📄 Adding document to index ${indexId}...`, "blue");
      
      const response = await this.client.post(`/indexes/${indexId}/documents`, document);
      const result = response.data;

      this.log(`✅ Document added: ${result.id}`, "green");
      
      return result;
    } catch (error: any) {
      this.log("❌ Failed to add document:", "red");
      this.log(error.message, "red");
      throw error;
    }
  }

  public async search(query: string, indexId?: string, options: any = {}): Promise<any> {
    try {
      this.log(`🔍 Searching: "${query}"`, "blue");
      
      const searchParams = {
        query: query,
        index_id: indexId || this.config.indexId,
        limit: options.limit || 10,
        threshold: options.threshold || 0.7,
        include_metadata: options.includeMetadata !== false,
        ...options
      };

      const response = await this.client.post("/search", searchParams);
      const results = response.data;

      if (results.results && results.results.length > 0) {
        this.log(`✅ Found ${results.results.length} result(s)`, "green");
        
        results.results.forEach((result: any, index: number) => {
          this.log(`\n${index + 1}. Score: ${result.score?.toFixed(3)}`, "cyan");
          this.log(`   Content: ${result.content?.substring(0, 100)}...`, "blue");
          if (result.metadata) {
            this.log(`   Metadata: ${JSON.stringify(result.metadata)}`, "magenta");
          }
        });
      } else {
        this.log("❌ No results found", "yellow");
      }

      return results;
    } catch (error: any) {
      this.log("❌ Search failed:", "red");
      this.log(error.message, "red");
      throw error;
    }
  }

  public async askQuestion(question: string, indexId?: string, context?: string): Promise<any> {
    try {
      this.log(`❓ Asking: "${question}"`, "blue");
      
      const params = {
        question: question,
        index_id: indexId || this.config.indexId,
        context: context,
        include_sources: true
      };

      const response = await this.client.post("/ask", params);
      const result = response.data;

      if (result.answer) {
        this.log("💡 Answer:", "cyan");
        this.log(result.answer, "green");
        
        if (result.sources && result.sources.length > 0) {
          this.log("\n📚 Sources:", "cyan");
          result.sources.forEach((source: any, index: number) => {
            this.log(`${index + 1}. ${source.content?.substring(0, 80)}...`, "blue");
          });
        }
      } else {
        this.log("❌ No answer found", "yellow");
      }

      return result;
    } catch (error: any) {
      this.log("❌ Question failed:", "red");
      this.log(error.message, "red");
      throw error;
    }
  }

  public async validateConfiguration(): Promise<void> {
    this.log("🔍 Validating RTRVR.AI configuration...", "blue");
    
    const issues: string[] = [];
    
    if (!this.config.apiKey) {
      issues.push("RTRVR_API_KEY is missing");
    }
    
    if (!this.config.baseUrl) {
      issues.push("RTRVR_BASE_URL is missing");
    }
    
    if (issues.length > 0) {
      this.log("❌ Configuration issues found:", "red");
      issues.forEach(issue => this.log(`  - ${issue}`, "red"));
      
      this.log("\n📝 Required environment variables:", "yellow");
      this.log("RTRVR_API_KEY=your-api-key", "yellow");
      this.log("RTRVR_BASE_URL=https://api.rtrvr.ai/v1", "yellow");
      this.log("RTRVR_PROJECT_ID=your-project-id (optional)", "yellow");
      this.log("RTRVR_INDEX_ID=your-index-id (optional)", "yellow");
      
      throw new Error("Configuration validation failed");
    }
    
    this.log("✅ Configuration is valid!", "green");
  }

  public async saveSearchHistory(query: string, results: any): Promise<void> {
    try {
      const historyDir = path.join(__dirname, "../logs");
      if (!fs.existsSync(historyDir)) {
        fs.mkdirSync(historyDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `rtrvr-search-${timestamp}.json`;
      const filepath = path.join(historyDir, filename);

      const searchRecord = {
        timestamp: new Date().toISOString(),
        query: query,
        results: results,
        resultCount: results.results?.length || 0
      };

      fs.writeFileSync(filepath, JSON.stringify(searchRecord, null, 2));
      this.log(`💾 Search history saved: ${filename}`, "green");
    } catch (error: any) {
      this.log("❌ Failed to save search history:", "yellow");
      this.log(error.message, "yellow");
    }
  }

  /**
   * Save search results using Barton Doctrine formatting
   * Demonstrates database-agnostic payload creation
   */
  public async saveSearchWithBartonDoctrine(
    query: string, 
    results: any, 
    targetDatabase: 'firebase' | 'neon' | 'bigquery' = 'firebase'
  ): Promise<void> {
    try {
      this.log(`💾 Saving search with Barton Doctrine format for ${targetDatabase}`, "blue");

      // Create base payload following Barton Doctrine
      const basePayload = BartonDoctrineFormatter.createBasePayload(
        'rtrvr_search',
        `search_${Date.now()}`,
        {
          query,
          results_count: results.results?.length || 0,
          top_results: results.results?.slice(0, 3),
          search_metadata: {
            timestamp: new Date().toISOString(),
            api_version: 'v1',
            total_score: results.results?.reduce((sum: number, r: any) => sum + (r.score || 0), 0)
          }
        },
        {
          agent_id: 'rtrvr_agent',
          blueprint_id: 'search_workflow',
          schema_version: '1.0.0'
        }
      );

      // Format for target database
      const formattedPayload = BartonDoctrineFormatter.formatForDatabase(basePayload, targetDatabase);

      // Save formatted payload
      const saveDir = path.join(__dirname, '../barton-doctrine-payloads');
      if (!fs.existsSync(saveDir)) {
        fs.mkdirSync(saveDir, { recursive: true });
      }

      const filename = `${targetDatabase}-search-${Date.now()}.json`;
      const filepath = path.join(saveDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(formattedPayload, null, 2));

      // Also demonstrate creating database-specific objects
      if (targetDatabase === 'firebase') {
        const firebaseDoc = BartonDoctrineFormatter.createFirebaseDocument(
          'rtrvr_searches', 
          basePayload, 
          3600 // 1 hour TTL
        );
        const firebaseFile = path.join(saveDir, `firebase-doc-${Date.now()}.json`);
        fs.writeFileSync(firebaseFile, JSON.stringify(firebaseDoc, null, 2));
        this.log(`🔥 Firebase document format saved: ${path.basename(firebaseFile)}`, "green");
      }

      if (targetDatabase === 'neon') {
        const neonInsert = BartonDoctrineFormatter.createNeonInsert('rtrvr_searches', basePayload);
        const neonFile = path.join(saveDir, `neon-sql-${Date.now()}.sql`);
        fs.writeFileSync(neonFile, `-- RTRVR Search Insert (STAMPED format)\n${neonInsert.sql};\n\n-- Values: ${JSON.stringify(neonInsert.values, null, 2)}`);
        this.log(`🐘 Neon SQL format saved: ${path.basename(neonFile)}`, "green");
      }

      if (targetDatabase === 'bigquery') {
        const bigqueryInsert = BartonDoctrineFormatter.createBigQueryInsert('rtrvr_dataset', 'searches', basePayload);
        const bigqueryFile = path.join(saveDir, `bigquery-${Date.now()}.json`);
        fs.writeFileSync(bigqueryFile, JSON.stringify(bigqueryInsert, null, 2));
        this.log(`📊 BigQuery format saved: ${path.basename(bigqueryFile)}`, "green");
      }

      this.log(`✅ Search saved with Barton Doctrine compliance: ${filename}`, "green");
      this.log(`🔤 Format: ${targetDatabase.toUpperCase()} (${targetDatabase === 'firebase' ? 'SPVPET' : targetDatabase === 'neon' ? 'STAMPED' : 'STACKED'})`, "cyan");
      
    } catch (error: any) {
      this.log("❌ Failed to save search with Barton Doctrine:", "red");
      this.log(error.message, "red");
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  try {
    const rtrvr = new RTRVRIntegration();

    switch (args[0]) {
      case "setup":
        await rtrvr.setup();
        break;
      
      case "test":
        await rtrvr.testConnection();
        break;
      
      case "account":
        const account = await rtrvr.getAccountInfo();
        console.log("Account Info:", account);
        break;
      
      case "indexes":
        const indexes = await rtrvr.listIndexes();
        console.log("Indexes:", indexes);
        break;
      
      case "create-index":
        if (!args[1]) {
          console.log("Usage: npm run rtrvr:create-index <name> [description]");
          return;
        }
        const index = await rtrvr.createIndex(args[1], args[2]);
        console.log("Created Index:", index);
        break;
      
      case "search":
        if (!args[1]) {
          console.log("Usage: npm run rtrvr:search <query> [index-id] [limit]");
          return;
        }
        const limit = args[3] ? parseInt(args[3]) : 10;
        const searchResults = await rtrvr.search(args[1], args[2], { limit });
        await rtrvr.saveSearchHistory(args[1], searchResults);
        break;
      
      case "ask":
        if (!args[1]) {
          console.log("Usage: npm run rtrvr:ask <question> [index-id] [context]");
          return;
        }
        await rtrvr.askQuestion(args[1], args[2], args[3]);
        break;
      
      case "validate":
        await rtrvr.validateConfiguration();
        break;
      
      default:
        console.log(`
🔍 RTRVR.AI Integration

Usage:
  npm run rtrvr:setup                       # Initial setup and connection test
  npm run rtrvr:test                        # Test API connection
  npm run rtrvr:account                     # Get account information
  npm run rtrvr:indexes                     # List available indexes
  npm run rtrvr:create-index <name> [desc]  # Create new index
  npm run rtrvr:search <query> [index] [limit] # Search in index
  npm run rtrvr:ask <question> [index] [context] # Ask a question
  npm run rtrvr:validate                    # Validate configuration

Examples:
  npm run rtrvr:setup
  npm run rtrvr:search "machine learning" index123 5
  npm run rtrvr:ask "What is AI?" index123
        `);
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { RTRVRIntegration }; 