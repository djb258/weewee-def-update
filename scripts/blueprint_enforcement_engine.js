const { Client } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const connectionString = 'postgresql://neondb_owner:npg_U7OnhIbeEw1m@ep-round-bird-a4a7s49a-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

class BlueprintEnforcementEngine {
  constructor() {
    this.client = new Client({ connectionString });
    this.enforcementRules = new Map();
    this.auditLog = [];
    this.enforcementResults = {
      timestamp: new Date().toISOString(),
      rules_applied: 0,
      violations_found: 0,
      corrections_made: 0,
      recommendations: []
    };
  }

  async connect() {
    await this.client.connect();
    console.log('✅ Connected to Neon database for blueprint enforcement');
  }

  async disconnect() {
    await this.client.end();
    console.log('✅ Disconnected from database');
  }

  // Load enforcement rules from configuration
  async loadEnforcementRules() {
    console.log('\n📋 Loading Blueprint Enforcement Rules...');
    
    // Define core enforcement rules
    const rules = [
      {
        id: 'NEON_001',
        name: 'NEON Doctrine Compliance',
        description: 'Ensure all tables and columns have proper NEON doctrine comments',
        type: 'VALIDATION',
        severity: 'CRITICAL',
        query: `
          SELECT 
            t.table_name,
            CASE 
              WHEN EXISTS (
                SELECT 1 FROM pg_description d
                JOIN pg_class c ON d.objoid = c.oid
                JOIN pg_namespace n ON c.relnamespace = n.oid
                WHERE n.nspname = 'public' AND c.relname = t.table_name
              ) THEN 'COMPLIANT'
              ELSE 'MISSING_TABLE_COMMENT'
            END as table_status,
            COUNT(CASE WHEN NOT EXISTS (
              SELECT 1 FROM pg_description d
              JOIN pg_class cl ON d.objoid = cl.oid
              JOIN pg_namespace n ON cl.relnamespace = n.oid
              JOIN pg_attribute a ON d.objoid = a.attrelid AND d.objsubid = a.attnum
              WHERE n.nspname = 'public' AND cl.relname = t.table_name AND a.attname = c.column_name
            ) THEN 1 END) as missing_column_comments
          FROM information_schema.tables t
          LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
          WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
          GROUP BY t.table_name, table_status
          HAVING table_status = 'MISSING_TABLE_COMMENT' 
             OR COUNT(CASE WHEN NOT EXISTS (
               SELECT 1 FROM pg_description d
               JOIN pg_class cl ON d.objoid = cl.oid
               JOIN pg_namespace n ON cl.relnamespace = n.oid
               JOIN pg_attribute a ON d.objoid = a.attrelid AND d.objsubid = a.attnum
               WHERE n.nspname = 'public' AND cl.relname = t.table_name AND a.attname = c.column_name
             ) THEN 1 END) > 0
        `
      },
      {
        id: 'STAMPED_001',
        name: 'STAMPED Framework Compliance',
        description: 'Ensure all tables follow STAMPED principles',
        type: 'VALIDATION',
        severity: 'HIGH',
        query: `
          SELECT 
            table_name,
            CASE 
              WHEN EXISTS (
                SELECT 1 FROM pg_description d
                JOIN pg_class c ON d.objoid = c.oid
                JOIN pg_namespace n ON c.relnamespace = n.oid
                WHERE n.nspname = 'public' AND c.relname = table_name AND d.description LIKE '%STAMPED%'
              ) THEN 'COMPLIANT'
              ELSE 'NON_COMPLIANT'
            END as stamped_status
          FROM information_schema.tables
          WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND NOT EXISTS (
              SELECT 1 FROM pg_description d
              JOIN pg_class c ON d.objoid = c.oid
              JOIN pg_namespace n ON c.relnamespace = n.oid
              WHERE n.nspname = 'public' AND c.relname = table_name AND d.description LIKE '%STAMPED%'
            )
        `
      },
      {
        id: 'BARTON_001',
        name: 'Barton ID Consistency',
        description: 'Ensure all columns have unique Barton IDs',
        type: 'VALIDATION',
        severity: 'HIGH',
        query: `
          SELECT 
            table_name,
            column_name,
            CASE 
              WHEN EXISTS (
                SELECT 1 FROM pg_description d
                JOIN pg_class cl ON d.objoid = cl.oid
                JOIN pg_namespace n ON cl.relnamespace = n.oid
                JOIN pg_attribute a ON d.objoid = a.attrelid AND d.objsubid = a.attnum
                WHERE n.nspname = 'public' AND cl.relname = table_name AND a.attname = column_name AND d.description LIKE '%BARTON_%'
              ) THEN 'COMPLIANT'
              ELSE 'MISSING_BARTON_ID'
            END as barton_status
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND NOT EXISTS (
              SELECT 1 FROM pg_description d
              JOIN pg_class cl ON d.objoid = cl.oid
              JOIN pg_namespace n ON cl.relnamespace = n.oid
              JOIN pg_attribute a ON d.objoid = a.attrelid AND d.objsubid = a.attnum
              WHERE n.nspname = 'public' AND cl.relname = table_name AND a.attname = column_name AND d.description LIKE '%BARTON_%'
            )
        `
      },
      {
        id: 'DATA_QUALITY_001',
        name: 'Data Quality Enforcement',
        description: 'Check for data quality issues across all tables',
        type: 'ENFORCEMENT',
        severity: 'MEDIUM',
        query: `
          SELECT 
            table_name,
            COUNT(*) as total_rows,
            COUNT(CASE WHEN id IS NULL THEN 1 END) as null_ids,
            COUNT(CASE WHEN created_at IS NULL THEN 1 END) as null_timestamps
          FROM (
            SELECT 'shq_tool_registry' as table_name, tool_id as id, last_verified as created_at FROM shq_tool_registry
            UNION ALL
            SELECT 'shq_process_registry' as table_name, process_id as id, created_at FROM shq_process_registry
            UNION ALL
            SELECT 'dpr_doctrine' as table_name, id::text as id, created_at FROM dpr_doctrine
          ) data_quality_check
          GROUP BY table_name
          HAVING COUNT(CASE WHEN id IS NULL THEN 1 END) > 0 
             OR COUNT(CASE WHEN created_at IS NULL THEN 1 END) > 0
        `
      }
    ];

    for (const rule of rules) {
      this.enforcementRules.set(rule.id, rule);
    }

    console.log(`✅ Loaded ${rules.length} enforcement rules`);
  }

  // Apply enforcement rules
  async applyEnforcementRules() {
    console.log('\n🔧 Applying Blueprint Enforcement Rules...');
    
    for (const [ruleId, rule] of this.enforcementRules) {
      console.log(`\n📋 Applying Rule: ${rule.name} (${ruleId})`);
      
      try {
        const result = await this.client.query(rule.query);
        
        if (result.rows.length > 0) {
          this.enforcementResults.violations_found += result.rows.length;
          
          console.log(`⚠️  Found ${result.rows.length} violations for rule ${ruleId}`);
          
          // Log violations
          for (const violation of result.rows) {
            this.auditLog.push({
              timestamp: new Date().toISOString(),
              rule_id: ruleId,
              rule_name: rule.name,
              severity: rule.severity,
              violation: violation
            });
          }

          // Apply automated corrections for certain rules
          if (rule.type === 'ENFORCEMENT' && rule.severity !== 'CRITICAL') {
            await this.applyAutomatedCorrection(rule, result.rows);
          }
        } else {
          console.log(`✅ Rule ${ruleId} passed - no violations found`);
        }
        
        this.enforcementResults.rules_applied++;
        
      } catch (error) {
        console.error(`❌ Error applying rule ${ruleId}:`, error.message);
      }
    }
  }

  // Apply automated corrections
  async applyAutomatedCorrection(rule, violations) {
    console.log(`🔧 Applying automated correction for rule ${rule.id}...`);
    
    let correctionsMade = 0;

    switch (rule.id) {
      case 'NEON_001':
        // Fix missing NEON doctrine comments
        for (const violation of violations) {
          if (violation.table_status === 'MISSING_TABLE_COMMENT') {
            await this.client.query(`
              COMMENT ON TABLE public.${violation.table_name} IS 'NEON Doctrine: Nuclear Enforcement, Explicit Ownership, Operational Normalization, No Orphan Data. Barton Sections 80001–80008 enforced.'
            `);
            correctionsMade++;
          }
        }
        break;

      case 'BARTON_001':
        // Fix missing Barton IDs
        for (const violation of violations) {
          if (violation.barton_status === 'MISSING_BARTON_ID') {
            const columnInfo = await this.client.query(`
              SELECT ordinal_position, data_type, is_nullable
              FROM information_schema.columns
              WHERE table_schema = 'public' 
                AND table_name = $1 
                AND column_name = $2
            `, [violation.table_name, violation.column_name]);

            if (columnInfo.rows.length > 0) {
              const col = columnInfo.rows[0];
              const bartonId = `BARTON_${String(col.ordinal_position).padStart(3, '0')}`;
              const description = violation.column_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              const nullable = col.is_nullable === 'YES' ? 'Nullable' : 'Required';
              
              await this.client.query(`
                COMMENT ON COLUMN public.${violation.table_name}.${violation.column_name} IS '[${bartonId}] Description: ${description}. Format: ${col.data_type}. ${nullable}.'
              `);
              correctionsMade++;
            }
          }
        }
        break;
    }

    this.enforcementResults.corrections_made += correctionsMade;
    console.log(`✅ Applied ${correctionsMade} automated corrections`);
  }

  // Generate enforcement report
  async generateEnforcementReport() {
    console.log('\n📋 Generating Blueprint Enforcement Report...');
    
    const report = {
      ...this.enforcementResults,
      audit_log: this.auditLog,
      summary: {
        total_rules: this.enforcementRules.size,
        rules_applied: this.enforcementResults.rules_applied,
        violations_found: this.enforcementResults.violations_found,
        corrections_made: this.enforcementResults.corrections_made,
        compliance_rate: this.calculateComplianceRate()
      },
      recommendations: this.generateRecommendations()
    };

    // Save report
    const reportPath = path.join(__dirname, `../reports/blueprint_enforcement_${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    console.log(`✅ Enforcement report saved to ${reportPath}`);
    return report;
  }

  // Calculate compliance rate
  calculateComplianceRate() {
    const totalChecks = this.enforcementResults.rules_applied;
    const violations = this.enforcementResults.violations_found;
    
    if (totalChecks === 0) return '0%';
    
    const complianceRate = ((totalChecks - violations) / totalChecks * 100).toFixed(2);
    return `${complianceRate}%`;
  }

  // Generate recommendations
  generateRecommendations() {
    const recommendations = [];

    // Analyze audit log for patterns
    const criticalViolations = this.auditLog.filter(log => log.severity === 'CRITICAL');
    if (criticalViolations.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        issue: 'Critical violations found',
        action: 'Immediate attention required for critical compliance issues',
        count: criticalViolations.length
      });
    }

    const highViolations = this.auditLog.filter(log => log.severity === 'HIGH');
    if (highViolations.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        issue: 'High severity violations found',
        action: 'Review and address high-priority compliance issues',
        count: highViolations.length
      });
    }

    // Check for specific rule violations
    const ruleViolations = this.auditLog.reduce((acc, log) => {
      acc[log.rule_id] = (acc[log.rule_id] || 0) + 1;
      return acc;
    }, {});

    Object.entries(ruleViolations).forEach(([ruleId, count]) => {
      const rule = this.enforcementRules.get(ruleId);
      if (rule) {
        recommendations.push({
          priority: rule.severity,
          issue: `${rule.name} violations`,
          action: `Review and fix ${rule.name.toLowerCase()} issues`,
          count: count
        });
      }
    });

    return recommendations;
  }

  // Setup automated enforcement triggers
  async setupEnforcementTriggers() {
    console.log('\n🔧 Setting up Automated Enforcement Triggers...');
    
    // Create enforcement log table
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS blueprint_enforcement_log (
        id SERIAL PRIMARY KEY,
        rule_id VARCHAR(50) NOT NULL,
        rule_name VARCHAR(200) NOT NULL,
        table_name VARCHAR(100),
        column_name VARCHAR(100),
        violation_type VARCHAR(100),
        violation_details JSONB,
        severity VARCHAR(20),
        corrected BOOLEAN DEFAULT FALSE,
        corrected_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create function to log enforcement violations
    await this.client.query(`
      CREATE OR REPLACE FUNCTION log_enforcement_violation(
        p_rule_id VARCHAR,
        p_rule_name VARCHAR,
        p_table_name VARCHAR,
        p_column_name VARCHAR,
        p_violation_type VARCHAR,
        p_violation_details JSONB,
        p_severity VARCHAR
      )
      RETURNS VOID AS $$
      BEGIN
        INSERT INTO blueprint_enforcement_log (
          rule_id, rule_name, table_name, column_name, 
          violation_type, violation_details, severity
        ) VALUES (
          p_rule_id, p_rule_name, p_table_name, p_column_name,
          p_violation_type, p_violation_details, p_severity
        );
      END;
      $$ LANGUAGE plpgsql;
    `);

    console.log('✅ Enforcement triggers configured');
  }

  // Main execution method
  async runFullEnforcement() {
    try {
      await this.connect();
      
      console.log('🚀 Starting Blueprint Enforcement Engine...\n');
      
      await this.loadEnforcementRules();
      await this.setupEnforcementTriggers();
      await this.applyEnforcementRules();
      
      const report = await this.generateEnforcementReport();
      
      console.log('\n🎉 Blueprint Enforcement Complete!');
      console.log('📊 Summary:');
      console.log(`   - Rules Applied: ${report.summary.rules_applied}`);
      console.log(`   - Violations Found: ${report.summary.violations_found}`);
      console.log(`   - Corrections Made: ${report.summary.corrections_made}`);
      console.log(`   - Compliance Rate: ${report.summary.compliance_rate}`);
      console.log(`   - Recommendations: ${report.recommendations.length}`);
      
    } catch (error) {
      console.error('❌ Error in blueprint enforcement:', error);
    } finally {
      await this.disconnect();
    }
  }
}

// Export for use in other scripts
module.exports = BlueprintEnforcementEngine;

// Run if called directly
if (require.main === module) {
  const engine = new BlueprintEnforcementEngine();
  engine.runFullEnforcement();
} 