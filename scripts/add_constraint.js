#!/usr/bin/env node

const { Client } = require('pg');

const connectionString = process.env.NEON_DATABASE_URL;

async function addConstraint() {
    const client = new Client({ connectionString });
    
    try {
        await client.connect();
        console.log('✅ Connected to Neon database');

        const addConstraintSQL = `
            ALTER TABLE shq_bootstrap_program
            ADD CONSTRAINT uq_agent_process UNIQUE (agent_name, process_id);
        `;

        await client.query(addConstraintSQL);
        console.log('✅ Unique constraint added successfully');

    } catch (error) {
        if (error.code === '42710') {
            console.log('✅ Unique constraint already exists');
        } else {
            console.error('❌ Failed to add constraint:', error.message);
            throw error;
        }
    } finally {
        await client.end();
        console.log('🔌 Database connection closed');
    }
}

addConstraint().catch(e => {
    console.error('❌ Constraint addition failed:', e);
    process.exit(1);
}); 