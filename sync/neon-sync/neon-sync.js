#!/usr/bin/env node

/**
 * Neon Database Sync Tool
 * 
 * This tool synchronizes all schemas, doctrine, and configuration from the
 * foundational home system to the Neon database bootstrap table.
 * 
 * Purpose: Prevent knowledge loss by maintaining a complete backup of all
 * system knowledge in the Neon database.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

class NeonSync {
    constructor() {
        this.client = null;
        this.schemas = {};
        this.doctrine = {};
        this.config = {};
        this.syncLog = [];
    }

    /**
     * Initialize database connection
     */
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

    /**
     * Load all schemas from the schemas directory
     */
    async loadSchemas() {
        const schemasDir = path.join(__dirname, '../../schemas');
        const modules = ['client', 'command', 'doctrine', 'marketing', 'personal', 'shq'];

        for (const module of modules) {
            const moduleDir = path.join(schemasDir, module);
            if (fs.existsSync(moduleDir)) {
                this.schemas[module] = {};
                const files = fs.readdirSync(moduleDir).filter(file => file.endsWith('.json'));
                
                for (const file of files) {
                    const schemaPath = path.join(moduleDir, file);
                    const schemaData = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
                    const schemaName = file.replace('_schema.json', '');
                    this.schemas[module][schemaName] = schemaData;
                }
            }
        }

        console.log(`📋 Loaded ${Object.keys(this.schemas).length} schema modules`);
        this.logSync('schemas_loaded', { count: Object.keys(this.schemas).length });
    }

    /**
     * Load all doctrine from the doctrine directory
     */
    async loadDoctrine() {
        const doctrineDir = path.join(__dirname, '../../doctrine');
        const doctrineTypes = ['barton-nuclear', 'stamped', 'neon', 'compliance'];

        for (const type of doctrineTypes) {
            const typeDir = path.join(doctrineDir, type);
            if (fs.existsSync(typeDir)) {
                this.doctrine[type] = {};
                const files = fs.readdirSync(typeDir).filter(file => file.endsWith('.md') || file.endsWith('.json'));
                
                for (const file of files) {
                    const filePath = path.join(typeDir, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    this.doctrine[type][file] = content;
                }
            }
        }

        console.log(`📚 Loaded ${Object.keys(this.doctrine).length} doctrine types`);
        this.logSync('doctrine_loaded', { count: Object.keys(this.doctrine).length });
    }

    /**
     * Load configuration files
     */
    async loadConfig() {
        const configDir = path.join(__dirname, '../../config');
        const configTypes = ['neon', 'cursor', 'bootstrap'];

        for (const type of configTypes) {
            const typeDir = path.join(configDir, type);
            if (fs.existsSync(typeDir)) {
                this.config[type] = {};
                const files = fs.readdirSync(typeDir).filter(file => file.endsWith('.json') || file.endsWith('.js'));
                
                for (const file of files) {
                    const filePath = path.join(typeDir, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    this.config[type][file] = content;
                }
            }
        }

        console.log(`⚙️ Loaded ${Object.keys(this.config).length} config types`);
        this.logSync('config_loaded', { count: Object.keys(this.config).length });
    }

    /**
     * Create or update bootstrap table
     */
    async createBootstrapTable() {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS weewee_bootstrap_registry (
                id SERIAL PRIMARY KEY,
                module_type VARCHAR(50) NOT NULL,
                module_name VARCHAR(100) NOT NULL,
                schema_name VARCHAR(100),
                content_type VARCHAR(50) NOT NULL,
                content JSONB NOT NULL,
                version VARCHAR(20) DEFAULT '1.0.0',
                last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(module_type, module_name, schema_name, content_type)
            );
        `;

        try {
            await this.client.query(createTableSQL);
            console.log('✅ Bootstrap table created/verified');
        } catch (error) {
            console.error('❌ Failed to create bootstrap table:', error.message);
            throw error;
        }
    }

    /**
     * Sync schemas to bootstrap table
     */
    async syncSchemas() {
        const insertSQL = `
            INSERT INTO weewee_bootstrap_registry 
            (module_type, module_name, schema_name, content_type, content, version)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (module_type, module_name, schema_name, content_type)
            DO UPDATE SET 
                content = EXCLUDED.content,
                version = EXCLUDED.version,
                updated_at = CURRENT_TIMESTAMP
        `;

        let syncCount = 0;
        for (const [moduleType, schemas] of Object.entries(this.schemas)) {
            for (const [schemaName, schemaData] of Object.entries(schemas)) {
                try {
                    await this.client.query(insertSQL, [
                        'schema',
                        moduleType,
                        schemaName,
                        'json_schema',
                        JSON.stringify(schemaData),
                        '1.0.0'
                    ]);
                    syncCount++;
                } catch (error) {
                    console.error(`❌ Failed to sync schema ${moduleType}.${schemaName}:`, error.message);
                }
            }
        }

        console.log(`✅ Synced ${syncCount} schemas to bootstrap table`);
        this.logSync('schemas_synced', { count: syncCount });
    }

    /**
     * Sync doctrine to bootstrap table
     */
    async syncDoctrine() {
        const insertSQL = `
            INSERT INTO weewee_bootstrap_registry 
            (module_type, module_name, schema_name, content_type, content, version)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (module_type, module_name, schema_name, content_type)
            DO UPDATE SET 
                content = EXCLUDED.content,
                version = EXCLUDED.version,
                updated_at = CURRENT_TIMESTAMP
        `;

        let syncCount = 0;
        for (const [doctrineType, files] of Object.entries(this.doctrine)) {
            for (const [fileName, content] of Object.entries(files)) {
                try {
                    await this.client.query(insertSQL, [
                        'doctrine',
                        doctrineType,
                        fileName,
                        'markdown',
                        content,
                        '1.0.0'
                    ]);
                    syncCount++;
                } catch (error) {
                    console.error(`❌ Failed to sync doctrine ${doctrineType}.${fileName}:`, error.message);
                }
            }
        }

        console.log(`✅ Synced ${syncCount} doctrine files to bootstrap table`);
        this.logSync('doctrine_synced', { count: syncCount });
    }

    /**
     * Sync configuration to bootstrap table
     */
    async syncConfig() {
        const insertSQL = `
            INSERT INTO weewee_bootstrap_registry 
            (module_type, module_name, schema_name, content_type, content, version)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (module_type, module_name, schema_name, content_type)
            DO UPDATE SET 
                content = EXCLUDED.content,
                version = EXCLUDED.version,
                updated_at = CURRENT_TIMESTAMP
        `;

        let syncCount = 0;
        for (const [configType, files] of Object.entries(this.config)) {
            for (const [fileName, content] of Object.entries(files)) {
                try {
                    await this.client.query(insertSQL, [
                        'config',
                        configType,
                        fileName,
                        'configuration',
                        content,
                        '1.0.0'
                    ]);
                    syncCount++;
                } catch (error) {
                    console.error(`❌ Failed to sync config ${configType}.${fileName}:`, error.message);
                }
            }
        }

        console.log(`✅ Synced ${syncCount} config files to bootstrap table`);
        this.logSync('config_synced', { count: syncCount });
    }

    /**
     * Log sync activity
     */
    logSync(action, data) {
        this.syncLog.push({
            timestamp: new Date().toISOString(),
            action,
            data
        });
    }

    /**
     * Generate sync report
     */
    generateSyncReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                schemas_loaded: Object.keys(this.schemas).length,
                doctrine_loaded: Object.keys(this.doctrine).length,
                config_loaded: Object.keys(this.config).length,
                total_sync_operations: this.syncLog.length
            },
            sync_log: this.syncLog
        };

        const reportPath = path.join(__dirname, '../backup/sync-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📊 Sync report saved to ${reportPath}`);
    }

    /**
     * Close database connection
     */
    async close() {
        if (this.client) {
            await this.client.end();
            console.log('🔌 Database connection closed');
        }
    }

    /**
     * Run complete sync process
     */
    async runSync() {
        try {
            console.log('🚀 Starting Neon sync process...');
            
            await this.initialize();
            await this.createBootstrapTable();
            
            await this.loadSchemas();
            await this.loadDoctrine();
            await this.loadConfig();
            
            await this.syncSchemas();
            await this.syncDoctrine();
            await this.syncConfig();
            
            this.generateSyncReport();
            
            console.log('✅ Neon sync process completed successfully');
        } catch (error) {
            console.error('❌ Neon sync process failed:', error.message);
            throw error;
        } finally {
            await this.close();
        }
    }
}

// CLI interface
if (require.main === module) {
    const sync = new NeonSync();
    sync.runSync()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Sync failed:', error);
            process.exit(1);
        });
}

module.exports = NeonSync; 