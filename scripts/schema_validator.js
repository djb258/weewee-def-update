const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const connectionString = 'postgresql://neondb_owner:npg_U7OnhIbeEw1m@ep-round-bird-a4a7s49a-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

class SchemaValidator {
  constructor() {
    this.client = new Client({ connectionString });
    this.validationResults = {
      timestamp: new Date().toISOString(),
      checks: [],
      violations: [],
      recommendations: []
    };
  }

  async connect() {
    await this.client.connect();
    console.log('✅ Connected to Neon database for validation');
  }

  async disconnect() {
    await this.client.end();
    console.log('✅ Disconnected from database');
  }

  // Check for orphaned records
  async checkOrphanedRecords() {
    console.log('\n🔍 Checking for orphaned records...');
    
    const foreignKeys = await this.client.query(`
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

    for (const fk of foreignKeys.rows) {
      const orphanedCount = await this.client.query(`
        SELECT COUNT(*) as count
        FROM ${fk.table_name} t1
        LEFT JOIN ${fk.foreign_table_name} t2 
          ON t1.${fk.column_name} = t2.${fk.foreign_column_name}
        WHERE t2.${fk.foreign_column_name} IS NULL
          AND t1.${fk.column_name} IS NOT NULL
      `);

      if (orphanedCount.rows[0].count > 0) {
        this.validationResults.violations.push({
          type: 'ORPHANED_RECORDS',
          table: fk.table_name,
          column: fk.column_name,
          foreign_table: fk.foreign_table_name,
          count: parseInt(orphanedCount.rows[0].count)
        });
      }
    }

    console.log(`📊 Found ${this.validationResults.violations.filter(v => v.type === 'ORPHANED_RECORDS').length} orphaned record violations`);
  }

  // Check for duplicate records
  async checkDuplicateRecords() {
    console.log('\n🔍 Checking for duplicate records...');
    
    const tables = await this.client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);

    for (const table of tables.rows) {
      const tableName = table.table_name;
      
      // Get primary key columns
      const primaryKeys = await this.client.query(`
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'PRIMARY KEY' 
          AND tc.table_name = $1
      `, [tableName]);

      if (primaryKeys.rows.length > 0) {
        const pkColumns = primaryKeys.rows.map(pk => pk.column_name).join(', ');
        const duplicateCount = await this.client.query(`
          SELECT COUNT(*) as count
          FROM (
            SELECT ${pkColumns}, COUNT(*) as cnt
            FROM ${tableName}
            GROUP BY ${pkColumns}
            HAVING COUNT(*) > 1
          ) duplicates
        `);

        if (duplicateCount.rows[0].count > 0) {
          this.validationResults.violations.push({
            type: 'DUPLICATE_RECORDS',
            table: tableName,
            primary_keys: pkColumns,
            count: parseInt(duplicateCount.rows[0].count)
          });
        }
      }
    }

    console.log(`📊 Found ${this.validationResults.violations.filter(v => v.type === 'DUPLICATE_RECORDS').length} duplicate record violations`);
  }

  // Check for null values in required fields
  async checkRequiredFields() {
    console.log('\n🔍 Checking required fields...');
    
    const requiredColumns = await this.client.query(`
      SELECT 
        table_name,
        column_name,
        data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND is_nullable = 'NO'
        AND column_default IS NULL
    `);

    for (const column of requiredColumns.rows) {
      const nullCount = await this.client.query(`
        SELECT COUNT(*) as count
        FROM ${column.table_name}
        WHERE ${column.column_name} IS NULL
      `);

      if (nullCount.rows[0].count > 0) {
        this.validationResults.violations.push({
          type: 'NULL_IN_REQUIRED_FIELD',
          table: column.table_name,
          column: column.column_name,
          data_type: column.data_type,
          count: parseInt(nullCount.rows[0].count)
        });
      }
    }

    console.log(`📊 Found ${this.validationResults.violations.filter(v => v.type === 'NULL_IN_REQUIRED_FIELD').length} null value violations`);
  }

  // Check for data type violations
  async checkDataTypeViolations() {
    console.log('\n🔍 Checking data type violations...');
    
    // Check for invalid UUIDs
    const uuidColumns = await this.client.query(`
      SELECT 
        table_name,
        column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND data_type = 'uuid'
    `);

    for (const column of uuidColumns.rows) {
      const invalidUuidCount = await this.client.query(`
        SELECT COUNT(*) as count
        FROM ${column.table_name}
        WHERE ${column.column_name} IS NOT NULL
          AND ${column.column_name}::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      `);

      if (invalidUuidCount.rows[0].count > 0) {
        this.validationResults.violations.push({
          type: 'INVALID_UUID',
          table: column.table_name,
          column: column.column_name,
          count: parseInt(invalidUuidCount.rows[0].count)
        });
      }
    }

    // Check for invalid timestamps
    const timestampColumns = await this.client.query(`
      SELECT 
        table_name,
        column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND data_type LIKE '%timestamp%'
    `);

    for (const column of timestampColumns.rows) {
      const invalidTimestampCount = await this.client.query(`
        SELECT COUNT(*) as count
        FROM ${column.table_name}
        WHERE ${column.column_name} IS NOT NULL
          AND ${column.column_name} < '1900-01-01'::timestamp
      `);

      if (invalidTimestampCount.rows[0].count > 0) {
        this.validationResults.violations.push({
          type: 'INVALID_TIMESTAMP',
          table: column.table_name,
          column: column.column_name,
          count: parseInt(invalidTimestampCount.rows[0].count)
        });
      }
    }

    console.log(`📊 Found ${this.validationResults.violations.filter(v => v.type.includes('INVALID_')).length} data type violations`);
  }

  // Check for circular references
  async checkCircularReferences() {
    console.log('\n🔍 Checking for circular references...');
    
    const foreignKeys = await this.client.query(`
      SELECT 
        tc.table_name, 
        ccu.table_name AS foreign_table_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
    `);

    const fkMap = {};
    for (const fk of foreignKeys.rows) {
      if (!fkMap[fk.table_name]) {
        fkMap[fk.table_name] = [];
      }
      fkMap[fk.table_name].push(fk.foreign_table_name);
    }

    // Simple circular reference detection
    for (const table in fkMap) {
      for (const foreignTable of fkMap[table]) {
        if (fkMap[foreignTable] && fkMap[foreignTable].includes(table)) {
          this.validationResults.violations.push({
            type: 'CIRCULAR_REFERENCE',
            table1: table,
            table2: foreignTable
          });
        }
      }
    }

    console.log(`📊 Found ${this.validationResults.violations.filter(v => v.type === 'CIRCULAR_REFERENCE').length} circular reference violations`);
  }

  // Generate validation report
  async generateValidationReport() {
    console.log('\n📋 Generating Validation Report...');
    
    const report = {
      ...this.validationResults,
      summary: {
        total_violations: this.validationResults.violations.length,
        by_type: this.validationResults.violations.reduce((acc, v) => {
          acc[v.type] = (acc[v.type] || 0) + 1;
          return acc;
        }, {}),
        recommendations: this.generateRecommendations()
      }
    };

    // Save report
    const reportPath = path.join(__dirname, `../reports/schema_validation_${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`✅ Validation report saved to ${reportPath}`);
    return report;
  }

  // Generate recommendations based on violations
  generateRecommendations() {
    const recommendations = [];

    const orphanedCount = this.validationResults.violations.filter(v => v.type === 'ORPHANED_RECORDS').length;
    if (orphanedCount > 0) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'Orphaned records found',
        action: 'Review and clean up orphaned records or add proper foreign key constraints'
      });
    }

    const duplicateCount = this.validationResults.violations.filter(v => v.type === 'DUPLICATE_RECORDS').length;
    if (duplicateCount > 0) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'Duplicate records found',
        action: 'Implement unique constraints or data deduplication procedures'
      });
    }

    const nullCount = this.validationResults.violations.filter(v => v.type === 'NULL_IN_REQUIRED_FIELD').length;
    if (nullCount > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        issue: 'Null values in required fields',
        action: 'Add NOT NULL constraints or provide default values'
      });
    }

    return recommendations;
  }

  // Main execution method
  async runFullValidation() {
    try {
      await this.connect();
      
      console.log('🚀 Starting Full Schema Validation...\n');
      
      await this.checkOrphanedRecords();
      await this.checkDuplicateRecords();
      await this.checkRequiredFields();
      await this.checkDataTypeViolations();
      await this.checkCircularReferences();
      
      const report = await this.generateValidationReport();
      
      console.log('\n🎉 Schema Validation Complete!');
      console.log('📊 Summary:');
      console.log(`   - Total Violations: ${report.summary.total_violations}`);
      console.log(`   - Recommendations: ${report.summary.recommendations.length}`);
      
      // Log violations by type
      Object.entries(report.summary.by_type).forEach(([type, count]) => {
        console.log(`   - ${type}: ${count}`);
      });
      
    } catch (error) {
      console.error('❌ Error in schema validation:', error);
    } finally {
      await this.disconnect();
    }
  }
}

// Export for use in other scripts
module.exports = SchemaValidator;

// Run if called directly
if (require.main === module) {
  const validator = new SchemaValidator();
  validator.runFullValidation();
} 