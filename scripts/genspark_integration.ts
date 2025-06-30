#!/usr/bin/env tsx

/**
 * Genspark Integration
 * AI-powered search engine for intelligent information discovery
 * Run: npm run genspark:setup
 */

import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";

// 🔒 MANDATORY: Barton Doctrine enforcement
import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';


// Load environment variables
config();


// 🔒 MANDATORY: Initialize Barton Doctrine (CANNOT BE SKIPPED)
const doctrine = START_WITH_BARTON_DOCTRINE('genspark');

class GensparkIntegration {
  private config: any;
  private client: any;

  constructor() {
    this.config = {
      apiKey: process.env.GENSPARK_API_KEY || "",
      baseUrl: process.env.GENSPARK_BASE_URL || "https://api.genspark.ai/v1",
      projectId: process.env.GENSPARK_PROJECT_ID
    };

    if (!this.config.apiKey) {
      throw new Error("GENSPARK_API_KEY is required. Please set it in your .env file.");
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
      cyan: "\x1b[36m"
    };
    console.log(`${colors[color]}${message}\x1b[0m`);
  }

  public async setup(): Promise<void> {
    this.log("🔍 Setting up Genspark AI Integration", "blue");
    this.log("====================================", "blue");

    try {
      await this.testConnection();
      
      this.log("✅ Genspark AI integration setup complete!", "green");
      this.log("🚀 Ready to perform AI-powered searches!", "cyan");
    } catch (error: any) {
      this.log("❌ Setup failed:", "red");
      this.log(error.message, "red");
      throw error;
    }
  }

  public async testConnection(): Promise<boolean> {
    try {
      this.log("🔍 Testing Genspark API connection...", "blue");
      
      // Simple health check
      const response = await this.client.get("/health");
      
      if (response.status === 200) {
        this.log("✅ API connection successful!", "green");
        return true;
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (error: any) {
      this.log("❌ API connection failed:", "red");
      if (error.response?.status === 401) {
        this.log("Invalid API key. Please check your GENSPARK_API_KEY", "red");
      } else {
        this.log(error.message, "red");
      }
      return false;
    }
  }

  public async validateConfiguration(): Promise<void> {
    this.log("🔍 Validating Genspark configuration...", "blue");
    
    const issues: string[] = [];
    
    if (!this.config.apiKey) {
      issues.push("GENSPARK_API_KEY is missing");
    }
    
    if (!this.config.baseUrl) {
      issues.push("GENSPARK_BASE_URL is missing");
    }
    
    if (issues.length > 0) {
      this.log("❌ Configuration issues found:", "red");
      issues.forEach(issue => this.log(`  - ${issue}`, "red"));
      
      this.log("\n📝 Required environment variables:", "yellow");
      this.log("GENSPARK_API_KEY=your-api-key", "yellow");
      this.log("GENSPARK_BASE_URL=https://api.genspark.ai/v1", "yellow");
      this.log("GENSPARK_PROJECT_ID=your-project-id (optional)", "yellow");
      
      throw new Error("Configuration validation failed");
    }
    
    this.log("✅ Configuration is valid!", "green");
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  try {
    const genspark = new GensparkIntegration();

    switch (args[0]) {
      case "setup":
        await genspark.setup();
        break;
      
      case "test":
        await genspark.testConnection();
        break;
      
      case "validate":
        await genspark.validateConfiguration();
        break;
      
      default:
        console.log(`
🔍 Genspark AI Integration

Usage:
  npm run genspark:setup     # Initial setup and connection test
  npm run genspark:test      # Test API connection
  npm run genspark:validate  # Validate configuration

Examples:
  npm run genspark:setup
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

export { GensparkIntegration }; 