#!/usr/bin/env node

/**
 * Automated Neon Sync Script
 * 
 * This script automatically reads the current repo's doctrine, schema, and config
 * and updates the shq_bootstrap_program table in Neon whenever changes are made.
 * 
 * Usage: node scripts/auto_neon_sync.js
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

class AutoNeonSync {
    constructor() {
        this.client = null;
        this.payload = {};
    }

    async initialize() {
        try {
            const connectionString = process.env.NEON_DATABASE_URL;
            if (!connectionString) {
                throw new Error('NEON_DATABASE_URL environment variable is required');
            }

            this.client = new Client({ connectionString });
            await this.client.connect();
            console.log('✅ Connected to Neon database');
        } catch (error) {
            console.error('❌ Failed to connect to Neon database:', error.message);
            throw error;
        }
    }

    async loadDoctrine() {
        const doctrineDir = path.join(__dirname, '../doctrine');
        this.payload.doctrine = {};

        if (fs.existsSync(doctrineDir)) {
            const doctrineTypes = fs.readdirSync(doctrineDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const type of doctrineTypes) {
                const typeDir = path.join(doctrineDir, type);
                this.payload.doctrine[type] = {};

                const files = fs.readdirSync(typeDir).filter(file => 
                    file.endsWith('.md') || file.endsWith('.json')
                );

                for (const file of files) {
                    const filePath = path.join(typeDir, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    this.payload.doctrine[type][file] = content;
                }
            }
        }

        console.log(`📚 Loaded ${Object.keys(this.payload.doctrine).length} doctrine types`);
    }

    async loadSchemas() {
        const schemasDir = path.join(__dirname, '../schemas');
        this.payload.schemas = {};

        if (fs.existsSync(schemasDir)) {
            const schemaModules = fs.readdirSync(schemasDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const module of schemaModules) {
                const moduleDir = path.join(schemasDir, module);
                this.payload.schemas[module] = {};

                const files = fs.readdirSync(moduleDir).filter(file => 
                    file.endsWith('.json') || file.endsWith('.sql')
                );

                for (const file of files) {
                    const filePath = path.join(moduleDir, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    this.payload.schemas[module][file] = content;
                }
            }
        }

        console.log(`📋 Loaded ${Object.keys(this.payload.schemas).length} schema modules`);
    }

    async loadConfig() {
        const configDir = path.join(__dirname, '../config');
        this.payload.config = {};

        if (fs.existsSync(configDir)) {
            const configTypes = fs.readdirSync(configDir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name);

            for (const type of configTypes) {
                const typeDir = path.join(configDir, type);
                this.payload.config[type] = {};

                const files = fs.readdirSync(typeDir).filter(file => 
                    file.endsWith('.json') || file.endsWith('.js')
                );

                for (const file of files) {
                    const filePath = path.join(typeDir, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    this.payload.config[type][file] = content;
                }
            }
        }

        console.log(`⚙️ Loaded ${Object.keys(this.payload.config).length} config types`);
    }

    async upsertToNeon() {
        const upsertSQL = `
            INSERT INTO shq_bootstrap_program (agent_name, process_id, payload, auto_trigger, last_updated)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (agent_name, process_id)
            DO UPDATE SET 
                payload = EXCLUDED.payload,
                last_updated = NOW(),
                auto_trigger = EXCLUDED.auto_trigger;
        `;

        const repoName = path.basename(path.resolve(__dirname, '..'));
        const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');

        await this.client.query(upsertSQL, [
            'repo_auto_sync',
            `${repoName}_${timestamp}`,
            this.payload,
            true
        ]);

        console.log(`✅ Repo data upserted to shq_bootstrap_program with process_id: ${repoName}_${timestamp}`);
    }

    async close() {
        if (this.client) {
            await this.client.end();
            console.log('🔌 Database connection closed');
        }
    }

    async runSync() {
        try {
            console.log('🚀 Starting automated Neon sync...');
            
            await this.initialize();
            await this.loadDoctrine();
            await this.loadSchemas();
            await this.loadConfig();
            await this.upsertToNeon();
            
            console.log('✅ Automated Neon sync completed successfully');
        } catch (error) {
            console.error('❌ Automated Neon sync failed:', error.message);
            throw error;
        } finally {
            await this.close();
        }
    }
}

// Run the sync if this script is executed directly
if (require.main === module) {
    const sync = new AutoNeonSync();
    sync.runSync().catch(e => {
        console.error('❌ Sync failed:', e);
        process.exit(1);
    });
}

module.exports = AutoNeonSync; 