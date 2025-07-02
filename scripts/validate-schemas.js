#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

// Initialize AJV
const ajv = new Ajv({
  allErrors: true,
  verbose: true
});

// Add JSON Schema Draft 7 meta-schema
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-07.json'));

/**
 * Validate a JSON schema file
 * @param {string} filePath - Path to the schema file
 * @returns {Object} Validation result
 */
function validateSchema(filePath) {
  try {
    const schemaContent = fs.readFileSync(filePath, 'utf8');
    const schema = JSON.parse(schemaContent);
    
    // Validate the schema itself
    const isValid = ajv.validateSchema(schema);
    
    return {
      file: filePath,
      valid: isValid,
      errors: ajv.errors || []
    };
  } catch (error) {
    return {
      file: filePath,
      valid: false,
      errors: [{ message: error.message }]
    };
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
 * Main validation function
 */
function main() {
  const schemasDir = path.join(__dirname, '..', 'schemas');
  
  if (!fs.existsSync(schemasDir)) {
    console.log('Schemas directory not found. Creating...');
    fs.mkdirSync(schemasDir, { recursive: true });
    return;
  }
  
  const schemaFiles = findSchemaFiles(schemasDir);
  
  if (schemaFiles.length === 0) {
    console.log('No schema files found.');
    return;
  }
  
  console.log(`Found ${schemaFiles.length} schema files. Validating...\n`);
  
  let validCount = 0;
  let invalidCount = 0;
  
  for (const file of schemaFiles) {
    const result = validateSchema(file);
    const relativePath = path.relative(process.cwd(), file);
    
    if (result.valid) {
      console.log(`✅ ${relativePath}`);
      validCount++;
    } else {
      console.log(`❌ ${relativePath}`);
      console.log(`   Errors:`);
      result.errors.forEach(error => {
        console.log(`   - ${error.message}`);
      });
      console.log('');
      invalidCount++;
    }
  }
  
  console.log(`\nValidation Summary:`);
  console.log(`✅ Valid: ${validCount}`);
  console.log(`❌ Invalid: ${invalidCount}`);
  console.log(`📊 Total: ${schemaFiles.length}`);
  
  if (invalidCount > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateSchema, findSchemaFiles }; 