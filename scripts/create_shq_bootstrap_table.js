#!/usr/bin/env node

/**
 * Create shq_bootstrap_program table with proper constraints
 */

const { Client } = require('pg');

const connectionString = process.env.NEON_DATABASE_URL;

async function createTable() {
    const client = new Client({ connectionString });
    
    try {
        await client.connect();
        console.log('✅ Connected to Neon database');

        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS shq_bootstrap_program (
                id SERIAL PRIMARY KEY,
                agent_name VARCHAR(100) NOT NULL,
                process_id VARCHAR(100) NOT NULL,
                payload JSONB NOT NULL,
                auto_trigger BOOLEAN DEFAULT true,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(agent_name, process_id)
            );
        `;

        await client.query(createTableSQL);
        console.log('✅ shq_bootstrap_program table created/verified with proper constraints');

        // Check if the unique constraint exists
        const checkConstraintSQL = `
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'shq_bootstrap_program' 
            AND constraint_type = 'UNIQUE' 
            AND constraint_name LIKE '%agent_name%';
        `;

        const result = await client.query(checkConstraintSQL);
        
        if (result.rows.length > 0) {
            console.log('✅ Unique constraint on (agent_name, process_id) is properly set');
        } else {
            console.log('⚠️  Adding unique constraint...');
            const addConstraintSQL = `
                ALTER TABLE shq_bootstrap_program
                ADD CONSTRAINT uq_agent_process UNIQUE (agent_name, process_id);
            `;
            await client.query(addConstraintSQL);
            console.log('✅ Unique constraint added successfully');
        }

    } catch (error) {
        console.error('❌ Failed to create table:', error.message);
        throw error;
    } finally {
        await client.end();
        console.log('🔌 Database connection closed');
    }
}

createTable().catch(e => {
    console.error('❌ Table creation failed:', e);
    process.exit(1);
}); 