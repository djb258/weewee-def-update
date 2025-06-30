const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

class GBTEnforcer {
  constructor() {
    this.connectionString = 'postgresql://neondb_owner:npg_U7OnhIbeEw1m@ep-round-bird-a4a7s49a-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
    this.client = new Client({ connectionString: this.connectionString });
  }

  async connect() {
    await this.client.connect();
    console.log('✅ Connected to Neon database');
  }

  async disconnect() {
    await this.client.end();
    console.log('✅ Disconnected from Neon database');
  }

  // Validate GBT compliance for all agents
  async validateGBT() {
    console.log('🔍 Validating GBT compliance...');
    
    try {
      const result = await this.client.query('SELECT * FROM shq_bootstrap_program');
      const agents = result.rows;
      
      const violations = [];
      const validations = [];

      for (const agent of agents) {
        const validation = this.validateAgent(agent);
        validations.push(validation);
        
        if (!validation.compliant) {
          violations.push({
            agent: agent.agent_name,
            violations: validation.violations
          });
        }
      }

      console.log(`📊 GBT Validation Results:`);
      console.log(`   Total Agents: ${agents.length}`);
      console.log(`   Compliant: ${validations.filter(v => v.compliant).length}`);
      console.log(`   Violations: ${violations.length}`);

      if (violations.length > 0) {
        console.log('\n❌ Violations Found:');
        violations.forEach(v => {
          console.log(`   ${v.agent}:`);
          v.violations.forEach(violation => {
            console.log(`     - ${violation}`);
          });
        });
      } else {
        console.log('\n✅ All agents are GBT compliant!');
      }

      return { validations, violations };
    } catch (error) {
      console.error('❌ Error validating GBT:', error);
      throw error;
    }
  }

  // Validate individual agent against GBT
  validateAgent(agent) {
    const violations = [];
    
    // Section 80001: Agent Registration & Memory Protocol
    if (!agent.agent_name || !agent.process_id) {
      violations.push('Missing required agent_name or process_id');
    }
    
    if (!agent.payload) {
      violations.push('Missing payload object');
    } else {
      const payload = agent.payload;
      
      // Check required payload fields
      if (!payload.agent_id) violations.push('Missing agent_id in payload');
      if (!payload.core_tables) violations.push('Missing core_tables in payload');
      if (!payload.routing_function) violations.push('Missing routing_function in payload');
      if (!payload.enforcement_notes) violations.push('Missing enforcement_notes in payload');
      if (!payload.recovery_protocol) violations.push('Missing recovery_protocol in payload');
      if (!payload.sub_hive_registry) violations.push('Missing sub_hive_registry in payload');
      if (!payload.bootstrap_doctrine_sections) violations.push('Missing bootstrap_doctrine_sections in payload');
      
      // Section 80002: Routing & Dispatch Protocol
      if (payload.routing_function !== 'fx_lieutenant_shq_execute') {
        violations.push('Routing function must be fx_lieutenant_shq_execute');
      }
      
      // Section 80003: Sub-Hive Architecture
      const requiredSubHives = ['shq_', 'dpr_', 'cmd_', 'clnt_', 'marketing_', 'pers_db_'];
      if (!payload.sub_hive_registry || !Array.isArray(payload.sub_hive_registry)) {
        violations.push('sub_hive_registry must be an array');
      } else {
        const missingHives = requiredSubHives.filter(hive => !payload.sub_hive_registry.includes(hive));
        if (missingHives.length > 0) {
          violations.push(`Missing required sub-hives: ${missingHives.join(', ')}`);
        }
      }
      
      // Section 80007: Validation & Compliance
      if (!payload.bootstrap_doctrine_sections || !Array.isArray(payload.bootstrap_doctrine_sections)) {
        violations.push('bootstrap_doctrine_sections must be an array');
      } else {
        const requiredSections = [80001, 80002, 80003, 80004, 80005, 80006, 80007, 80008];
        const missingSections = requiredSections.filter(section => !payload.bootstrap_doctrine_sections.includes(section));
        if (missingSections.length > 0) {
          violations.push(`Missing required doctrine sections: ${missingSections.join(', ')}`);
        }
      }
    }
    
    // Section 80005: Data Flow Enforcement
    if (!agent.last_updated) {
      violations.push('Missing last_updated timestamp');
    }
    
    return {
      agent: agent.agent_name,
      compliant: violations.length === 0,
      violations
    };
  }

  // Generate bootstrap program for new agent
  async generateBootstrap(agentName, processId) {
    console.log(`🔧 Generating bootstrap program for ${agentName}...`);
    
    const bootstrap = {
      agent_name: agentName,
      process_id: processId,
      payload: {
        agent_id: agentName,
        core_tables: {
          audit_log: "shq_prompt_audit_log",
          process_map: "shq_mission_payload_map",
          webhook_log: "shq_webhook_routing_log"
        },
        routing_function: "fx_lieutenant_shq_execute",
        enforcement_notes: [
          "No payloads may leave Neon except via SHQ",
          "All outbound dispatch must log to webhook routing log",
          `${agentName} is responsible for memory enforcement and recovery discipline`
        ],
        recovery_protocol: [
          "Restore fx_lieutenant_shq_execute()",
          "Enforce doctrine: Only Lieutenant_SHQ resolves process_id and dispatches missions",
          "Initialize sub-hive prep + command tables: shq_, dpr_, cmd_, clnt_, marketing_, pers_db_",
          "Enforce sub-hive lieutenants: execution-only, never dispatch",
          "Claude, ChatGPT, Gemini agents must only activate via shq_command_log",
          "Dispatch pipeline: shq_command_log → shq_webhook_routing_log → Make.com",
          "Mindpal agents receive missions via webhook, not triggers",
          "LLMs do not initiate; they only respond when routed",
          "Enforce structured output with process_id, mission_label, and audit logging",
          "Log all actions to shq_prompt_audit_log",
          "Confirm doctrine enforcement: Sections 80001–80008",
          "Require all agents to restore memory from shq_bootstrap_program"
        ],
        sub_hive_registry: [
          "shq_",
          "dpr_",
          "cmd_",
          "clnt_",
          "marketing_",
          "pers_db_"
        ],
        bootstrap_doctrine_sections: [
          80001,
          80002,
          80003,
          80004,
          80005,
          80006,
          80007,
          80008
        ]
      },
      auto_trigger: true,
      last_updated: new Date().toISOString()
    };
    
    // Validate the generated bootstrap
    const validation = this.validateAgent(bootstrap);
    if (!validation.compliant) {
      throw new Error(`Generated bootstrap is not compliant: ${validation.violations.join(', ')}`);
    }
    
    console.log('✅ Bootstrap program generated successfully');
    return bootstrap;
  }

  // Register new agent in database
  async registerAgent(agentName, processId) {
    console.log(`📝 Registering agent ${agentName}...`);
    
    try {
      const bootstrap = await this.generateBootstrap(agentName, processId);
      
      const result = await this.client.query(
        'INSERT INTO shq_bootstrap_program (agent_name, process_id, payload, auto_trigger, last_updated) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [bootstrap.agent_name, bootstrap.process_id, bootstrap.payload, bootstrap.auto_trigger, bootstrap.last_updated]
      );
      
      console.log(`✅ Agent ${agentName} registered successfully`);
      return result.rows[0];
    } catch (error) {
      console.error(`❌ Error registering agent ${agentName}:`, error);
      throw error;
    }
  }

  // Audit all agents
  async auditAgents() {
    console.log('🔍 Auditing all agents...');
    
    try {
      const result = await this.client.query('SELECT * FROM shq_bootstrap_program ORDER BY agent_name');
      const agents = result.rows;
      
      console.log(`📊 Agent Audit Results:`);
      console.log(`   Total Agents: ${agents.length}`);
      
      agents.forEach(agent => {
        const validation = this.validateAgent(agent);
        const status = validation.compliant ? '✅' : '❌';
        console.log(`   ${status} ${agent.agent_name} (${agent.process_id})`);
        
        if (!validation.compliant) {
          validation.violations.forEach(violation => {
            console.log(`     - ${violation}`);
          });
        }
      });
      
      return agents;
    } catch (error) {
      console.error('❌ Error auditing agents:', error);
      throw error;
    }
  }

  // Check doctrine enforcement for specific agent
  async checkDoctrine(agentName) {
    console.log(`🔍 Checking doctrine enforcement for ${agentName}...`);
    
    try {
      const result = await this.client.query(
        'SELECT * FROM shq_bootstrap_program WHERE agent_name = $1',
        [agentName]
      );
      
      if (result.rows.length === 0) {
        console.log(`❌ Agent ${agentName} not found`);
        return null;
      }
      
      const agent = result.rows[0];
      const validation = this.validateAgent(agent);
      
      console.log(`📊 Doctrine Check Results for ${agentName}:`);
      console.log(`   Compliant: ${validation.compliant ? '✅' : '❌'}`);
      
      if (!validation.compliant) {
        console.log('   Violations:');
        validation.violations.forEach(violation => {
          console.log(`     - ${violation}`);
        });
      } else {
        console.log('   ✅ All doctrine sections enforced');
      }
      
      return validation;
    } catch (error) {
      console.error(`❌ Error checking doctrine for ${agentName}:`, error);
      throw error;
    }
  }
}

// CLI interface
async function main() {
  const enforcer = new GBTEnforcer();
  
  try {
    await enforcer.connect();
    
    const command = process.argv[2];
    const args = process.argv.slice(3);
    
    switch (command) {
      case 'validate':
        await enforcer.validateGBT();
        break;
        
      case 'audit':
        await enforcer.auditAgents();
        break;
        
      case 'register':
        if (args.length < 2) {
          console.log('Usage: node gbt_enforcer.js register <agent_name> <process_id>');
          return;
        }
        await enforcer.registerAgent(args[0], args[1]);
        break;
        
      case 'check':
        if (args.length < 1) {
          console.log('Usage: node gbt_enforcer.js check <agent_name>');
          return;
        }
        await enforcer.checkDoctrine(args[0]);
        break;
        
      case 'generate':
        if (args.length < 2) {
          console.log('Usage: node gbt_enforcer.js generate <agent_name> <process_id>');
          return;
        }
        const bootstrap = await enforcer.generateBootstrap(args[0], args[1]);
        console.log(JSON.stringify(bootstrap, null, 2));
        break;
        
      default:
        console.log('GBT Enforcer Commands:');
        console.log('  validate                    - Validate GBT compliance for all agents');
        console.log('  audit                       - Audit all agents');
        console.log('  register <name> <process>   - Register new agent');
        console.log('  check <name>                - Check doctrine for specific agent');
        console.log('  generate <name> <process>   - Generate bootstrap program');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await enforcer.disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = GBTEnforcer; 