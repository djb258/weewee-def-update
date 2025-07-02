const fs = require('fs');
const path = require('path');

// Function to read and parse JSON files
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    return null;
  }
}

// Function to get all JSON files in a directory
function getJsonFiles(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    return files.filter(file => file.endsWith('.json')).map(file => path.join(dirPath, file));
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
    return [];
  }
}

// Function to generate the comprehensive doctrine file
function generateGbtDoctrine() {
  const doctrineDir = path.join(__dirname, '..', 'schemas', 'doctrine');
  const outputFile = path.join(__dirname, '..', 'gbt_doctrine.json');
  
  console.log('🔍 Scanning doctrine schemas...');
  
  // Get all doctrine schema files
  const schemaFiles = getJsonFiles(doctrineDir);
  console.log(`Found ${schemaFiles.length} doctrine schema files`);
  
  // Read all schema files
  const schemas = {};
  const schemaList = [];
  
  schemaFiles.forEach(filePath => {
    const fileName = path.basename(filePath, '.json');
    const schema = readJsonFile(filePath);
    
    if (schema) {
      schemas[fileName] = schema;
      schemaList.push({
        name: fileName,
        path: filePath,
        description: schema.description || schema.title || fileName,
        fields: Object.keys(schema.properties || {}).length
      });
    }
  });
  
  // Create the comprehensive doctrine structure
  const gbtDoctrine = {
    metadata: {
      generated_at: new Date().toISOString(),
      version: "1.0.0",
      framework: "STAMPED",
      total_schemas: schemaList.length,
      description: "Comprehensive doctrine data for GBT memory updates"
    },
    
    // STAMPED Framework Structure
    stamped_framework: {
      process_id: "weewee-def-update",
      owner: "djb258",
      goal: "Comprehensive system for managing definitions, schemas, and doctrine using NEON Doctrine and STAMPED Framework",
      type: "doctrine_management_system",
      
      phase_structure: {
        phase_1: "Frame",
        phase_2: "Blueprint", 
        phase_3: "Process"
      },
      
      structure_definition: {
        process_name: "WeeWee Definition Update System",
        description: "A comprehensive system for managing definitions, schemas, and doctrine using the STAMPED framework with NEON Doctrine integration"
      },
      
      constants_variables_map: {
        constants: [
          "doctrine_schema_version",
          "stamped_framework_version", 
          "neon_integration_enabled",
          "gbt_compliance_required"
        ],
        variables: [
          "current_doctrine_version",
          "last_sync_timestamp",
          "active_schemas_count",
          "pending_updates"
        ]
      },
      
      master_file_plan: {
        canonical_table: "dpr_doctrine_schema",
        mapping_logic: "All doctrine schemas map to the canonical doctrine table with category-based organization"
      },
      
      merge_plan: {
        source_tables: schemaList.map(s => s.name),
        join_logic: "Doctrine schemas are joined by category and type with hierarchical relationships"
      },
      
      cursor_scope: {
        templates: [
          {
            name: "doctrine_schema_template",
            type: "json_schema",
            io_fields: ["properties", "required", "type", "description"]
          },
          {
            name: "stamped_process_template", 
            type: "process_definition",
            io_fields: ["process_id", "phases", "structure", "routing"]
          }
        ]
      },
      
      agent_interaction_map: {
        pull_agent: "GBT_Doctrine_Agent",
        actions: [
          "fetch_doctrine_updates",
          "validate_schema_compliance", 
          "sync_with_neon",
          "update_memory"
        ],
        forward_route: "doctrine_processing_pipeline"
      },
      
      routing_plan: {
        path: "doctrine_update_workflow",
        human_checkpoint: true
      },
      
      outbox_schema: null,
      
      sustainment_plan: {
        health_check: "doctrine_schema_validation",
        status_visibility: "real_time_monitoring"
      },
      
      audit_map: {
        logs: [
          "doctrine_update_log",
          "schema_validation_log", 
          "gbt_memory_update_log"
        ],
        shq_protocol: true
      }
    },
    
    // All doctrine schemas
    doctrine_schemas: schemas,
    
    // Schema index for quick lookup
    schema_index: schemaList,
    
    // Category mapping
    categories: {
      core_doctrine: [
        "dpr_doctrine_schema",
        "dpr_doctrine_sections_schema", 
        "dpr_doctrine_christmas_tree_schema",
        "dpr_doctrine_notional_schema"
      ],
      management: [
        "dpr_doctrine_category_map_schema",
        "dpr_doctrine_table_map_schema",
        "dpr_index_key_schema"
      ],
      assets: [
        "dpr_sub_hive_assets_schema",
        "dpr_sub_hive_registry_schema",
        "dpr_sub_hive_doctrine_map_schema"
      ],
      communication: [
        "dpr_messaging_library_schema",
        "dpr_research_library_schema",
        "dpr_knowledge_sync_schema"
      ],
      operations: [
        "dpr_command_log_schema",
        "dpr_prep_table_schema",
        "dpr_system_key_registry_schema"
      ]
    },
    
    // GBT Integration Instructions
    gbt_integration: {
      update_frequency: "on_demand",
      memory_update_method: "replace_all",
      validation_required: true,
      backup_before_update: true,
      
      instructions: [
        "1. Fetch this file from the repository",
        "2. Validate JSON structure",
        "3. Update GBT memory with doctrine_schemas section",
        "4. Update STAMPED framework knowledge with stamped_framework section",
        "5. Log the update timestamp",
        "6. Verify memory update success"
      ],
      
      api_endpoints: {
        doctrine: "/api/doctrine",
        schemas: "/api/schemas",
        status: "/api/status"
      }
    }
  };
  
  // Write the comprehensive doctrine file
  try {
    fs.writeFileSync(outputFile, JSON.stringify(gbtDoctrine, null, 2));
    console.log(`✅ Generated comprehensive GBT doctrine file: ${outputFile}`);
    console.log(`📊 Total schemas included: ${schemaList.length}`);
    console.log(`📁 File size: ${(fs.statSync(outputFile).size / 1024).toFixed(2)} KB`);
    
    // Log schema details
    console.log('\n📋 Schema Summary:');
    schemaList.forEach(schema => {
      console.log(`  - ${schema.name}: ${schema.fields} fields`);
    });
    
    return outputFile;
  } catch (error) {
    console.error('❌ Error writing doctrine file:', error.message);
    return null;
  }
}

// Run the generation
if (require.main === module) {
  const outputFile = generateGbtDoctrine();
  if (outputFile) {
    console.log('\n🎉 GBT Doctrine generation completed successfully!');
    console.log(`📄 File ready for GBT memory update: ${outputFile}`);
  } else {
    console.error('\n❌ GBT Doctrine generation failed!');
    process.exit(1);
  }
}

module.exports = { generateGbtDoctrine }; 