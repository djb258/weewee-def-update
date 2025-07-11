const fs = require('fs');
const path = require('path');

// Function to read the Frame phase package
function readFramePackage() {
  const packagePath = path.join(__dirname, '..', 'frame_phase_package.json');
  try {
    const content = fs.readFileSync(packagePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading frame package:', error.message);
    return null;
  }
}

// Function to validate JSON structure (basic validation)
function validateFramePackage(package) {
  const requiredFields = [
    'process_id', 'owner', 'goal', 'type', 'phase',
    'structure', 'routing_plan', 'cursor_scope', 'constants_variables',
    'master_file_merge_plan', 'agent_interaction_map', 'outbox_schema',
    'sustainment_plan', 'audit_maps'
  ];

  const missingFields = requiredFields.filter(field => !package[field]);
  
  if (missingFields.length > 0) {
    console.error('❌ Missing required fields:', missingFields);
    return false;
  }

  // Validate phase is "Frame"
  if (package.phase !== 'Frame') {
    console.error('❌ Phase must be "Frame"');
    return false;
  }

  // Validate structure completeness
  const structureFields = ['process_name', 'description', 'version', 'framework', 'components', 'hierarchy'];
  const missingStructureFields = structureFields.filter(field => !package.structure[field]);
  
  if (missingStructureFields.length > 0) {
    console.error('❌ Missing structure fields:', missingStructureFields);
    return false;
  }

  console.log('✅ Frame package validation passed');
  return true;
}

// Function to post the package
async function postFramePackage() {
  const package = readFramePackage();
  
  if (!package) {
    console.error('❌ Failed to read frame package');
    return false;
  }

  if (!validateFramePackage(package)) {
    console.error('❌ Frame package validation failed');
    return false;
  }

  const targetUrl = 'https://weewee-def-update-git-main-djb258s-projects.vercel.app/';
  
  console.log('🚀 Posting Frame phase package...');
  console.log(`📡 Target URL: ${targetUrl}`);
  console.log(`📦 Package size: ${JSON.stringify(package).length} characters`);
  
  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WeeWee-Definition-Update-System/1.0.0',
        'X-Frame-Phase': 'Frame',
        'X-Process-ID': package.process_id,
        'X-Owner': package.owner
      },
      body: JSON.stringify(package, null, 2)
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const responseText = await response.text();
      console.log('✅ Frame package posted successfully!');
      console.log('📄 Response:', responseText);
      return true;
    } else {
      console.error('❌ Failed to post frame package');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      
      try {
        const errorText = await response.text();
        console.error('Error Response:', errorText);
      } catch (e) {
        console.error('Could not read error response');
      }
      
      return false;
    }
  } catch (error) {
    console.error('❌ Network error posting frame package:', error.message);
    return false;
  }
}

// Function to display package summary
function displayPackageSummary(package) {
  console.log('\n📋 Frame Phase Package Summary:');
  console.log('================================');
  console.log(`Process ID: ${package.process_id}`);
  console.log(`Owner: ${package.owner}`);
  console.log(`Type: ${package.type}`);
  console.log(`Phase: ${package.phase}`);
  console.log(`Framework: ${package.structure.framework}`);
  console.log(`Version: ${package.structure.version}`);
  
  console.log('\n🏗️ Structure Components:');
  Object.keys(package.structure.components).forEach(component => {
    console.log(`  - ${component}: ${package.structure.components[component].type}`);
  });
  
  console.log('\n🔄 Routing Plan:');
  console.log(`  Path: ${package.routing_plan.path}`);
  console.log(`  Human Checkpoint: ${package.routing_plan.human_checkpoint}`);
  console.log(`  Automated Steps: ${package.routing_plan.automated_steps.length}`);
  console.log(`  Manual Steps: ${package.routing_plan.manual_steps.length}`);
  
  console.log('\n📝 Cursor Scope:');
  console.log(`  Templates: ${package.cursor_scope.templates.length}`);
  console.log(`  Data Boundaries: ${Object.keys(package.cursor_scope.data_boundaries).length}`);
  
  console.log('\n🔧 Constants & Variables:');
  console.log(`  Constants: ${package.constants_variables.constants.length}`);
  console.log(`  Variables: ${package.constants_variables.variables.length}`);
  
  console.log('\n🗂️ Master File Merge Plan:');
  console.log(`  Canonical Table: ${package.master_file_merge_plan.canonical_table}`);
  console.log(`  Source Tables: ${package.master_file_merge_plan.source_tables.length}`);
  
  console.log('\n🤖 Agent Interaction Map:');
  console.log(`  Pull Agent: ${package.agent_interaction_map.pull_agent}`);
  console.log(`  Actions: ${package.agent_interaction_map.actions.length}`);
  
  console.log('\n📤 Outbox Schema:');
  console.log(`  Enabled: ${package.outbox_schema.enabled}`);
  console.log(`  Schema Type: ${package.outbox_schema.schema_type}`);
  
  console.log('\n🔍 Sustainment Plan:');
  console.log(`  Health Check: ${package.sustainment_plan.health_check}`);
  console.log(`  Monitoring Metrics: ${package.sustainment_plan.monitoring_metrics.length}`);
  
  console.log('\n📊 Audit Maps:');
  console.log(`  Logs: ${package.audit_maps.logs.length}`);
  console.log(`  SHQ Protocol: ${package.audit_maps.shq_protocol}`);
  console.log(`  Audit Trail: ${package.audit_maps.audit_trail.enabled}`);
}

// Main execution
async function main() {
  const package = readFramePackage();
  
  if (!package) {
    console.error('❌ Could not read frame package');
    process.exit(1);
  }

  displayPackageSummary(package);
  
  console.log('\n' + '='.repeat(50));
  
  const success = await postFramePackage();
  
  if (success) {
    console.log('\n🎉 Frame phase package deployment completed successfully!');
    console.log('✅ Package is now available at the target URL');
    console.log('✅ All required fields are populated and validated');
    console.log('✅ JSON structure is deployment-ready');
  } else {
    console.log('\n❌ Frame phase package deployment failed');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { postFramePackage, validateFramePackage, readFramePackage }; 