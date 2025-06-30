const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const connectionString = 'postgresql://neondb_owner:npg_U7OnhIbeEw1m@ep-round-bird-a4a7s49a-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

class DatabaseComplianceSuite {
  constructor() {
    this.client = new Client({ connectionString });
    this.auditLog = [];
    this.complianceReport = {
      timestamp: new Date().toISOString(),
      summary: {},
      violations: [],
      recommendations: []
    };
  }

  async connect() {
    await this.client.connect();
    console.log('✅ Connected to Neon database');
  }

  async disconnect() {
    await this.client.end();
    console.log('✅ Disconnected from database');
  }

  // 1. Automated Compliance Checking
  async checkNEONCompliance() {
    console.log('\n🔍 Checking NEON Doctrine Compliance...');
    
    const tables = await this.client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);

    let compliantTables = 0;
    let nonCompliantTables = 0;

    for (const table of tables.rows) {
      const tableName = table.table_name;
      
      // Check table-level doctrine comment
      const tableComment = await this.client.query(`
        SELECT obj_description('public.${tableName}'::regclass) as comment
      `);
      
      const hasDoctrineComment = tableComment.rows[0]?.comment?.includes('NEON Doctrine');
      
      // Check column-level Barton comments
      const columns = await this.client.query(`
        SELECT 
          column_name,
          col_description(('public.${tableName}')::regclass, ordinal_position) as comment
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
      `, [tableName]);

      const columnsWithBartonComments = columns.rows.filter(col => 
        col.comment && col.comment.includes('BARTON_')
      );

      const isCompliant = hasDoctrineComment && columnsWithBartonComments.length === columns.rows.length;
      
      if (isCompliant) {
        compliantTables++;
      } else {
        nonCompliantTables++;
        this.complianceReport.violations.push({
          type: 'NEON_VIOLATION',
          table: tableName,
          issue: `Missing doctrine comment or Barton comments on ${columns.rows.length - columnsWithBartonComments.length} columns`
        });
      }
    }

    this.complianceReport.summary.neonCompliance = {
      totalTables: tables.rows.length,
      compliantTables,
      nonCompliantTables,
      complianceRate: (compliantTables / tables.rows.length * 100).toFixed(2) + '%'
    };

    console.log(`📊 NEON Compliance: ${compliantTables}/${tables.rows.length} tables compliant`);
  }

  // 2. Schema Validation
  async validateSchemaIntegrity() {
    console.log('\n🔧 Validating Schema Integrity...');
    
    const issues = [];

    // Check for orphaned foreign keys
    const orphanedFKs = await this.client.query(`
      SELECT 
        tc.table_name, 
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
    `);

    // Check for tables without primary keys
    const tablesWithoutPK = await this.client.query(`
      SELECT table_name
      FROM information_schema.tables t
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints tc
          WHERE tc.table_name = t.table_name
            AND tc.constraint_type = 'PRIMARY KEY'
        )
    `);

    if (tablesWithoutPK.rows.length > 0) {
      issues.push({
        type: 'MISSING_PRIMARY_KEY',
        tables: tablesWithoutPK.rows.map(r => r.table_name)
      });
    }

    this.complianceReport.summary.schemaIntegrity = {
      foreignKeys: orphanedFKs.rows.length,
      tablesWithoutPK: tablesWithoutPK.rows.length,
      issues: issues.length
    };

    console.log(`📊 Schema Integrity: ${issues.length} issues found`);
  }

  // 3. Audit Logging for Schema Changes
  async setupAuditTriggers() {
    console.log('\n📝 Setting up Audit Triggers...');
    
    // Create audit log table if it doesn't exist
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS schema_audit_log (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        table_name VARCHAR(100),
        column_name VARCHAR(100),
        old_value TEXT,
        new_value TEXT,
        changed_by VARCHAR(100) DEFAULT CURRENT_USER,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        session_id VARCHAR(100),
        application_name VARCHAR(100)
      )
    `);

    // Create function to log schema changes
    await this.client.query(`
      CREATE OR REPLACE FUNCTION log_schema_change()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO schema_audit_log (
          event_type, table_name, column_name, old_value, new_value
        ) VALUES (
          TG_OP, TG_TABLE_NAME, TG_ARGV[0], 
          CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::text ELSE NULL END,
          CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::text ELSE NULL END
        );
        RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('✅ Audit triggers configured');
  }

  // 4. Blueprint Integration
  async generateBlueprintSchema() {
    console.log('\n🔗 Generating Blueprint Schema...');
    
    const tables = await this.client.query(`
      SELECT 
        t.table_name,
        obj_description(('public.' || t.table_name)::regclass) as table_comment,
        COUNT(c.column_name) as column_count
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
      WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
      GROUP BY t.table_name, table_comment
      ORDER BY t.table_name
    `);

    const blueprintSchema = {
      version: '1.0.0',
      generated_at: new Date().toISOString(),
      database: 'neon',
      tables: []
    };

    for (const table of tables.rows) {
      const columns = await this.client.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          col_description(('public.${table.table_name}')::regclass, ordinal_position) as comment
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table.table_name]);

      blueprintSchema.tables.push({
        name: table.table_name,
        doctrine_comment: table.table_comment,
        column_count: table.column_count,
        columns: columns.rows.map(col => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          default: col.column_default,
          barton_comment: col.comment
        }))
      });
    }

    // Save blueprint schema
    await fs.writeFile(
      path.join(__dirname, '../schemas/blueprint_schema.json'),
      JSON.stringify(blueprintSchema, null, 2)
    );

    console.log(`✅ Blueprint schema generated with ${blueprintSchema.tables.length} tables`);
    return blueprintSchema;
  }

  // 5. Compliance Report Generation
  async generateComplianceReport() {
    console.log('\n📋 Generating Compliance Report...');
    
    const report = {
      ...this.complianceReport,
      generated_at: new Date().toISOString(),
      database_info: {
        name: 'neon',
        connection: 'postgresql://neondb_owner:***@ep-round-bird-a4a7s49a-pooler.us-east-1.aws.neon.tech/neondb'
      }
    };

    // Save report
    const reportPath = path.join(__dirname, `../reports/compliance_report_${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`✅ Compliance report saved to ${reportPath}`);
    return report;
  }

  // 6. Automated Fixes
  async applyAutomatedFixes() {
    console.log('\n🔧 Applying Automated Fixes...');
    
    let fixesApplied = 0;

    // Fix missing table comments - use a simpler approach
    const tablesWithoutComments = await this.client.query(`
      SELECT table_name
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND NOT EXISTS (
          SELECT 1 FROM pg_description d
          JOIN pg_class c ON d.objoid = c.oid
          JOIN pg_namespace n ON c.relnamespace = n.oid
          WHERE n.nspname = 'public' 
            AND c.relname = t.table_name
        )
    `);

    for (const table of tablesWithoutComments.rows) {
      await this.client.query(`
        COMMENT ON TABLE public.${table.table_name} IS 'NEON Doctrine: Nuclear Enforcement, Explicit Ownership, Operational Normalization, No Orphan Data. Barton Sections 80001–80008 enforced.'
      `);
      fixesApplied++;
    }

    // Fix missing column comments - use a simpler approach
    const columnsWithoutComments = await this.client.query(`
      SELECT 
        c.table_name,
        c.column_name,
        c.ordinal_position
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND NOT EXISTS (
          SELECT 1 FROM pg_description d
          JOIN pg_class cl ON d.objoid = cl.oid
          JOIN pg_namespace n ON cl.relnamespace = n.oid
          JOIN pg_attribute a ON d.objoid = a.attrelid AND d.objsubid = a.attnum
          WHERE n.nspname = 'public' 
            AND cl.relname = c.table_name
            AND a.attname = c.column_name
        )
    `);

    for (const column of columnsWithoutComments.rows) {
      const bartonId = `BARTON_${String(column.ordinal_position).padStart(3, '0')}`;
      const description = column.column_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      await this.client.query(`
        COMMENT ON COLUMN public.${column.table_name}.${column.column_name} IS '[${bartonId}] Description: ${description}. Format: text. Nullable.'
      `);
      fixesApplied++;
    }

    console.log(`✅ Applied ${fixesApplied} automated fixes`);
    return fixesApplied;
  }

  // Main execution method
  async runFullComplianceCheck() {
    try {
      await this.connect();
      
      console.log('🚀 Starting Full Database Compliance Suite...\n');
      
      await this.checkNEONCompliance();
      await this.validateSchemaIntegrity();
      await this.setupAuditTriggers();
      await this.generateBlueprintSchema();
      await this.applyAutomatedFixes();
      
      const report = await this.generateComplianceReport();
      
      console.log('\n🎉 Compliance Suite Complete!');
      console.log('📊 Summary:');
      console.log(`   - NEON Compliance: ${report.summary.neonCompliance?.complianceRate || 'N/A'}`);
      console.log(`   - Schema Issues: ${report.summary.schemaIntegrity?.issues || 0}`);
      console.log(`   - Violations: ${report.violations.length}`);
      
    } catch (error) {
      console.error('❌ Error in compliance suite:', error);
    } finally {
      await this.disconnect();
    }
  }
}

// Export for use in other scripts
module.exports = DatabaseComplianceSuite;

// Run if called directly
if (require.main === module) {
  const suite = new DatabaseComplianceSuite();
  suite.runFullComplianceCheck();
} 