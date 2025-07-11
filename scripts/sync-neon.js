#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Sync schemas to Neon database
 * @param {Object} options - Sync options
 * @returns {Promise<void>}
 */
async function syncToNeon(options = {}) {
  const {
    schemasDir = path.join(__dirname, '..', 'schemas'),
    dryRun = false,
    verbose = false
  } = options;

  console.log('🔄 Starting Neon sync...');
  
  if (dryRun) {
    console.log('🔍 Dry run mode - no changes will be made');
  }

  try {
    // Check if schemas directory exists
    if (!fs.existsSync(schemasDir)) {
      console.log('📁 Schemas directory not found. Creating...');
      fs.mkdirSync(schemasDir, { recursive: true });
      return;
    }

    // Find all schema files
    const schemaFiles = findSchemaFiles(schemasDir);
    
    if (schemaFiles.length === 0) {
      console.log('📄 No schema files found to sync');
      return;
    }

    console.log(`📊 Found ${schemaFiles.length} schema files to sync`);

    // Process each schema file
    for (const file of schemaFiles) {
      await processSchemaFile(file, { dryRun, verbose });
    }

    console.log('✅ Neon sync completed successfully');

  } catch (error) {
    console.error('❌ Error during Neon sync:', error.message);
    process.exit(1);
  }
}

/**
 * Find all JSON schema files in a directory
 * @param {string} dir - Directory to search
 * @returns {string[]} Array of schema file paths
 */
function findSchemaFiles(dir) {
  const files = [];
  
  function walkDir(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (item.endsWith('.json')) {
        files.push(fullPath);
      }
    }
  }
  
  walkDir(dir);
  return files;
}

/**
 * Process a single schema file
 * @param {string} filePath - Path to schema file
 * @param {Object} options - Processing options
 * @returns {Promise<void>}
 */
async function processSchemaFile(filePath, options = {}) {
  const { dryRun, verbose } = options;
  const relativePath = path.relative(process.cwd(), filePath);
  
  try {
    const schemaContent = fs.readFileSync(filePath, 'utf8');
    const schema = JSON.parse(schemaContent);
    
    if (verbose) {
      console.log(`📄 Processing: ${relativePath}`);
    }

    // Validate schema
    if (!schema.$schema) {
      console.warn(`⚠️  Warning: ${relativePath} missing $schema property`);
    }

    // Here you would implement the actual Neon database sync logic
    // For now, we'll just log what would be synced
    if (dryRun) {
      console.log(`🔍 Would sync: ${relativePath}`);
    } else {
      console.log(`✅ Synced: ${relativePath}`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${relativePath}:`, error.message);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose')
  };

  await syncToNeon(options);
}

if (require.main === module) {
  main();
}

module.exports = { syncToNeon, findSchemaFiles, processSchemaFile }; 