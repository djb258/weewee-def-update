#!/usr/bin/env node

/**
 * Module Generator Tool
 * 
 * This tool generates new modules for the foundational home system,
 * including schemas, doctrine, tools, and documentation.
 * 
 * Purpose: Make it easy to add new modules while maintaining
 * consistency with the existing system structure.
 */

const fs = require('fs');
const path = require('path');

class ModuleGenerator {
    constructor() {
        this.templates = {};
        this.config = {};
    }

    /**
     * Load templates
     */
    loadTemplates() {
        this.templates = {
            schema: this.getSchemaTemplate(),
            doctrine: this.getDoctrineTemplate(),
            tool: this.getToolTemplate(),
            process: this.getProcessTemplate(),
            config: this.getConfigTemplate()
        };
    }

    /**
     * Get schema template
     */
    getSchemaTemplate() {
        return {
            basic: {
                table_name: "{{MODULE_NAME}}_{{SCHEMA_NAME}}",
                description: "{{MODULE_DESCRIPTION}}",
                columns: [
                    {
                        name: "id",
                        type: "UUID",
                        description: "Primary key",
                        constraints: "PRIMARY KEY",
                        barton_id: "{{BARTON_PREFIX}}_001"
                    },
                    {
                        name: "created_at",
                        type: "TIMESTAMP",
                        description: "Creation timestamp",
                        constraints: "NOT NULL DEFAULT CURRENT_TIMESTAMP",
                        barton_id: "{{BARTON_PREFIX}}_002"
                    },
                    {
                        name: "updated_at",
                        type: "TIMESTAMP",
                        description: "Last update timestamp",
                        constraints: "NOT NULL DEFAULT CURRENT_TIMESTAMP",
                        barton_id: "{{BARTON_PREFIX}}_003"
                    }
                ],
                indexes: [],
                relationships: [],
                compliance: {
                    neon_doctrine: true,
                    stamped_framework: true
                }
            }
        };
    }

    /**
     * Get doctrine template
     */
    getDoctrineTemplate() {
        return `# {{MODULE_NAME}} Module Doctrine

## Purpose
{{MODULE_DESCRIPTION}}

## Version / Status
- **Current Version**: 1.0.0
- **Status**: Initial Implementation
- **Last Updated**: {{CURRENT_DATE}}
- **Next Milestone**: {{NEXT_MILESTONE}}

## Related Branches / Tags
- **Active Branch**: \`feat/{{MODULE_NAME}}-v1.0\`
- **Related Tags**: \`module-{{MODULE_NAME}}\`, \`{{MODULE_TYPE}}\`
- **Dependencies**: {{DEPENDENCIES}}
- **Integration Points**: {{INTEGRATION_POINTS}}

## Integration Notes
- **Schema Integration**: {{SCHEMA_INTEGRATION}}
- **Process Integration**: {{PROCESS_INTEGRATION}}
- **Tool Integration**: {{TOOL_INTEGRATION}}
- **Compliance**: {{COMPLIANCE_NOTES}}

### Key Components
- {{KEY_COMPONENTS}}

### Validation Rules
- {{VALIDATION_RULES}}

### Testing Strategy
- {{TESTING_STRATEGY}}
`;
    }

    /**
     * Get tool template
     */
    getToolTemplate() {
        return `#!/usr/bin/env node

/**
 * {{MODULE_NAME}} Tool
 * 
 * {{MODULE_DESCRIPTION}}
 */

const fs = require('fs');
const path = require('path');

class {{MODULE_NAME}}Tool {
    constructor() {
        this.config = {};
        this.data = {};
    }

    /**
     * Initialize tool
     */
    async initialize() {
        // TODO: Add initialization logic
        console.log('{{MODULE_NAME}} tool initialized');
    }

    /**
     * Main execution method
     */
    async execute() {
        // TODO: Add main execution logic
        console.log('{{MODULE_NAME}} tool executed');
    }

    /**
     * Cleanup
     */
    async cleanup() {
        // TODO: Add cleanup logic
        console.log('{{MODULE_NAME}} tool cleanup completed');
    }
}

// CLI interface
if (require.main === module) {
    const tool = new {{MODULE_NAME}}Tool();
    tool.initialize()
        .then(() => tool.execute())
        .then(() => tool.cleanup())
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Tool failed:', error);
            process.exit(1);
        });
}

module.exports = {{MODULE_NAME}}Tool;
`;
    }

    /**
     * Get process template
     */
    getProcessTemplate() {
        return `# {{MODULE_NAME}} Process Documentation

## Purpose
{{MODULE_DESCRIPTION}}

## Process Flow

### Step 1: Initialization
- {{STEP1_DESCRIPTION}}

### Step 2: Execution
- {{STEP2_DESCRIPTION}}

### Step 3: Validation
- {{STEP3_DESCRIPTION}}

### Step 4: Completion
- {{STEP4_DESCRIPTION}}

## Input/Output

### Input
- {{INPUT_DESCRIPTION}}

### Output
- {{OUTPUT_DESCRIPTION}}

## Error Handling
- {{ERROR_HANDLING}}

## Performance Considerations
- {{PERFORMANCE_NOTES}}
`;
    }

    /**
     * Get config template
     */
    getConfigTemplate() {
        return `{
  "module_name": "{{MODULE_NAME}}",
  "module_type": "{{MODULE_TYPE}}",
  "version": "1.0.0",
  "description": "{{MODULE_DESCRIPTION}}",
  "dependencies": {{DEPENDENCIES_JSON}},
  "integration_points": {{INTEGRATION_POINTS_JSON}},
  "compliance": {
    "neon_doctrine": true,
    "stamped_framework": true,
    "barton_nuclear": true
  },
  "settings": {
    "enabled": true,
    "auto_sync": true,
    "validation_required": true
  }
}`;
    }

    /**
     * Replace template variables
     */
    replaceTemplateVariables(template, variables) {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            const placeholder = `{{${key}}}`;
            result = result.replace(new RegExp(placeholder, 'g'), value);
        }
        return result;
    }

    /**
     * Generate module structure
     */
    async generateModule(moduleName, moduleType, description, options = {}) {
        const variables = {
            MODULE_NAME: moduleName,
            MODULE_TYPE: moduleType,
            MODULE_DESCRIPTION: description,
            CURRENT_DATE: new Date().toISOString().split('T')[0],
            NEXT_MILESTONE: options.nextMilestone || 'Initial implementation',
            DEPENDENCIES: options.dependencies || 'None',
            INTEGRATION_POINTS: options.integrationPoints || 'Core system',
            SCHEMA_INTEGRATION: options.schemaIntegration || 'Standard schema integration',
            PROCESS_INTEGRATION: options.processIntegration || 'Standard process integration',
            TOOL_INTEGRATION: options.toolIntegration || 'Standard tool integration',
            COMPLIANCE_NOTES: options.complianceNotes || 'Follows all doctrine requirements',
            KEY_COMPONENTS: options.keyComponents || 'Core module components',
            VALIDATION_RULES: options.validationRules || 'Standard validation rules',
            TESTING_STRATEGY: options.testingStrategy || 'Unit and integration testing',
            BARTON_PREFIX: `${moduleName.toUpperCase()}_${moduleType.toUpperCase()}`,
            STEP1_DESCRIPTION: options.step1Description || 'Initialize module',
            STEP2_DESCRIPTION: options.step2Description || 'Execute main logic',
            STEP3_DESCRIPTION: options.step3Description || 'Validate results',
            STEP4_DESCRIPTION: options.step4Description || 'Complete process',
            INPUT_DESCRIPTION: options.inputDescription || 'Module input data',
            OUTPUT_DESCRIPTION: options.outputDescription || 'Module output data',
            ERROR_HANDLING: options.errorHandling || 'Standard error handling',
            PERFORMANCE_NOTES: options.performanceNotes || 'Standard performance considerations',
            DEPENDENCIES_JSON: JSON.stringify(options.dependenciesArray || []),
            INTEGRATION_POINTS_JSON: JSON.stringify(options.integrationPointsArray || [])
        };

        // Create module directories
        const moduleDirs = [
            `schemas/${moduleName}`,
            `doctrine/${moduleName}`,
            `tools/${moduleName}`,
            `processes/${moduleName}`,
            `config/${moduleName}`
        ];

        for (const dir of moduleDirs) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Generate schema files
        const schemaTemplate = this.templates.schema.basic;
        const schemaContent = this.replaceTemplateVariables(JSON.stringify(schemaTemplate, null, 2), variables);
        fs.writeFileSync(`schemas/${moduleName}/${moduleName}_basic_schema.json`, schemaContent);

        // Generate doctrine file
        const doctrineContent = this.replaceTemplateVariables(this.templates.doctrine, variables);
        fs.writeFileSync(`doctrine/${moduleName}/README.md`, doctrineContent);

        // Generate tool file
        const toolContent = this.replaceTemplateVariables(this.templates.tool, variables);
        fs.writeFileSync(`tools/${moduleName}/${moduleName}-tool.js`, toolContent);

        // Generate process file
        const processContent = this.replaceTemplateVariables(this.templates.process, variables);
        fs.writeFileSync(`processes/${moduleName}/process.md`, processContent);

        // Generate config file
        const configContent = this.replaceTemplateVariables(this.templates.config, variables);
        fs.writeFileSync(`config/${moduleName}/config.json`, configContent);

        // Generate module README
        const moduleReadme = this.generateModuleReadme(variables);
        fs.writeFileSync(`${moduleName}/README.md`, moduleReadme);

        console.log(`✅ Generated module: ${moduleName}`);
        console.log(`📁 Created directories: ${moduleDirs.join(', ')}`);
        console.log(`📄 Generated files:`);
        console.log(`   - schemas/${moduleName}/${moduleName}_basic_schema.json`);
        console.log(`   - doctrine/${moduleName}/README.md`);
        console.log(`   - tools/${moduleName}/${moduleName}-tool.js`);
        console.log(`   - processes/${moduleName}/process.md`);
        console.log(`   - config/${moduleName}/config.json`);
        console.log(`   - ${moduleName}/README.md`);
    }

    /**
     * Generate module README
     */
    generateModuleReadme(variables) {
        return `# ${variables.MODULE_NAME} Module

## Overview
${variables.MODULE_DESCRIPTION}

## Structure
\`\`\`
${variables.MODULE_NAME}/
├── schemas/           # Data schemas
├── doctrine/          # Module doctrine
├── tools/            # Module tools
├── processes/        # Process documentation
└── config/           # Configuration files
\`\`\`

## Quick Start
1. Review the generated files
2. Customize schemas for your specific needs
3. Update doctrine and compliance requirements
4. Implement tool logic
5. Document processes
6. Configure settings

## Integration
This module integrates with the foundational home system and follows all established patterns and conventions.

## Compliance
- ✅ NEON Doctrine
- ✅ STAMPED Framework
- ✅ Barton Nuclear Doctrine

## Next Steps
1. Customize generated files
2. Add specific business logic
3. Implement validation rules
4. Create tests
5. Update documentation
`;
    }

    /**
     * Parse command line arguments
     */
    parseArguments() {
        const args = process.argv.slice(2);
        const options = {};

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg.startsWith('--')) {
                const key = arg.slice(2);
                const value = args[i + 1];
                if (value && !value.startsWith('--')) {
                    options[key] = value;
                    i++;
                } else {
                    options[key] = true;
                }
            }
        }

        return options;
    }

    /**
     * Run module generation
     */
    async run() {
        const options = this.parseArguments();
        
        if (!options.name || !options.type || !options.description) {
            console.error('Usage: node module-generator.js --name <module-name> --type <module-type> --description "<description>" [options]');
            console.error('');
            console.error('Required options:');
            console.error('  --name        Module name (e.g., "analytics")');
            console.error('  --type        Module type (e.g., "process", "tool", "schema")');
            console.error('  --description Module description');
            console.error('');
            console.error('Optional options:');
            console.error('  --dependencies        Dependencies (comma-separated)');
            console.error('  --integration-points  Integration points');
            console.error('  --next-milestone      Next milestone');
            process.exit(1);
        }

        this.loadTemplates();

        const moduleOptions = {
            dependencies: options.dependencies || 'None',
            integrationPoints: options.integration_points || 'Core system',
            nextMilestone: options.next_milestone || 'Initial implementation',
            dependenciesArray: options.dependencies ? options.dependencies.split(',').map(d => d.trim()) : [],
            integrationPointsArray: options.integration_points ? options.integration_points.split(',').map(i => i.trim()) : []
        };

        await this.generateModule(
            options.name,
            options.type,
            options.description,
            moduleOptions
        );
    }
}

// CLI interface
if (require.main === module) {
    const generator = new ModuleGenerator();
    generator.run()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Module generation failed:', error);
            process.exit(1);
        });
}

module.exports = ModuleGenerator; 