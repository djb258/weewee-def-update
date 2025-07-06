# Claude Auto Integration

## Overview

Claude Auto is an AI-powered assistant integrated with the weewee-def-update system that provides intelligent automation for schema generation, validation, module creation, and Neon database synchronization.

## Features

- 🤖 **Intelligent Chat**: Ask questions about the project structure, doctrine, and best practices
- 📋 **Schema Generation**: Automatically generate JSON schemas following STAMPED framework principles
- ✅ **Schema Validation**: Validate existing schemas against doctrine and compliance requirements
- 🧩 **Module Generation**: Create new modules with proper structure and documentation
- 🔄 **Neon Sync**: Generate and execute Neon database synchronization scripts
- 📊 **Compliance Checking**: Ensure all changes adhere to NEON doctrine and STAMPED framework

## Installation

The Claude Auto integration is already installed in this repository. To use it:

1. **Set up API Key**: Add your Anthropic API key to the configuration
2. **Install Dependencies**: Ensure all dependencies are installed
3. **Configure Environment**: Set up any required environment variables

### Setting up API Key

You can set your Anthropic API key in several ways:

1. **Environment Variable** (Recommended):
   ```bash
   export ANTHROPIC_API_KEY="your-api-key-here"
   ```

2. **Configuration File**:
   Edit `config/claude-config.json` and add your API key:
   ```json
   {
     "apiKey": "your-api-key-here",
     ...
   }
   ```

3. **GitHub Secrets** (for CI/CD):
   Add `ANTHROPIC_API_KEY` to your GitHub repository secrets

## Usage

### Command Line Interface

The Claude Auto script provides a comprehensive CLI for interacting with the system:

```bash
# Chat with Claude about the project
npm run claude:chat "How do I add a new client schema?"

# Generate a new schema
npm run claude:schema "user_profile" "User profile information"

# Validate an existing schema
npm run claude:validate "schemas/client/client_schema.json"

# Generate a new module
npm run claude:module "analytics" "dashboard"

# Generate Neon sync script
npm run claude:sync

# Show current configuration
npm run claude:config
```

### Direct Script Usage

You can also run the script directly:

```bash
# Chat
node scripts/claude-auto.ts chat "What is the STAMPED framework?"

# Schema generation
node scripts/claude-auto.ts schema "product_catalog" "Product catalog with categories and inventory"

# Schema validation
node scripts/claude-auto.ts validate "schemas/marketing/marketing_strategy_constants_schema.json"

# Module generation
node scripts/claude-auto.ts module "reporting" "analytics"

# Sync script generation
node scripts/claude-auto.ts sync
```

## Examples

### Generating a New Schema

```bash
npm run claude:schema "employee_benefits" "Employee benefits and compensation data"
```

This will generate a JSON schema that:
- Follows the existing naming conventions
- Includes proper validation rules
- Adheres to STAMPED framework principles
- Includes metadata fields (created_at, updated_at, etc.)

### Validating an Existing Schema

```bash
npm run claude:validate "schemas/client/clnt_client_process_map_schema.json"
```

This will:
- Check STAMPED compliance
- Verify NEON doctrine adherence
- Validate naming conventions
- Suggest improvements if needed

### Creating a New Module

```bash
npm run claude:module "inventory" "management"
```

This will generate:
- Module documentation (`docs/modules/inventory.md`)
- Schema definitions (`schemas/inventory/`)
- Configuration templates
- Integration guidelines
- Compliance requirements

## GitHub Integration

### Automated Reviews

The Claude Auto integration includes GitHub Actions that automatically:

1. **Review Pull Requests**: Analyze changes for compliance and best practices
2. **Validate Schemas**: Check all modified schemas against doctrine
3. **Generate Reports**: Provide detailed feedback on changes
4. **Sync to Neon**: Automatically sync approved changes to the database

### Workflow Triggers

The GitHub Actions workflow triggers on:
- Pull requests to main branch
- Pushes to main branch
- Changes to schemas, docs, config, or scripts directories

### Required Secrets

For GitHub Actions to work, add these secrets to your repository:

- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `NEON_DATABASE_URL`: Your Neon database connection string

## Configuration

### Claude Configuration File

The main configuration is in `config/claude-config.json`:

```json
{
  "apiKey": "",
  "model": "claude-3-5-sonnet-20241022",
  "maxTokens": 4096,
  "temperature": 0.7,
  "systemPrompt": "Custom system prompt...",
  "features": {
    "schemaGeneration": true,
    "schemaValidation": true,
    "moduleGeneration": true,
    "neonSync": true,
    "doctrineCompliance": true
  }
}
```

### Environment Variables

- `ANTHROPIC_API_KEY`: Anthropic API key
- `NEON_DATABASE_URL`: Neon database connection string
- `CLAUDE_MODEL`: Override default model
- `CLAUDE_MAX_TOKENS`: Override max tokens
- `CLAUDE_TEMPERATURE`: Override temperature

## System Integration

### Project Context

Claude Auto automatically loads and understands:

- **Schemas**: All JSON schema definitions in `schemas/`
- **Doctrine**: NEON doctrine and STAMPED framework rules
- **Modules**: Existing module definitions and patterns
- **Configuration**: System configuration and client settings

### STAMPED Framework Compliance

All generated content follows the STAMPED framework:

- **Structured**: Consistent organization and naming
- **Traceable**: Complete audit trails and versioning
- **Audit-ready**: Compliance-ready documentation
- **Mapped**: Clear relationships between components
- **Promotable**: Version-controlled changes
- **Enforced**: Automated validation and compliance
- **Documented**: Comprehensive documentation

### NEON Doctrine Adherence

Generated content adheres to NEON doctrine principles:

- **Nuclear Enforcement**: Strict validation of all schemas
- **Explicit Ownership**: Clear data ownership definitions
- **Operational Normalization**: Standardized operations
- **No Orphan Data**: Complete data lineage tracking

## Troubleshooting

### Common Issues

1. **API Key Not Set**:
   ```bash
   Error: No API key provided
   ```
   Solution: Set `ANTHROPIC_API_KEY` environment variable or add to config file

2. **Schema Not Found**:
   ```bash
   Error: Schema file not found: schemas/example.json
   ```
   Solution: Check the file path and ensure the schema exists

3. **Validation Errors**:
   ```bash
   Error: Schema validation failed
   ```
   Solution: Review the schema against STAMPED framework and NEON doctrine

### Debug Mode

Enable debug mode by setting the environment variable:

```bash
export CLAUDE_DEBUG=true
node scripts/claude-auto.ts chat "test message"
```

### Logs

Check the console output for detailed error messages and suggestions for resolution.

## Best Practices

### Schema Generation

1. **Use Descriptive Names**: Choose clear, descriptive schema names
2. **Follow Patterns**: Use existing schema patterns as templates
3. **Include Validation**: Always include proper validation rules
4. **Add Metadata**: Include created_at, updated_at, and other metadata fields
5. **Document Fields**: Add descriptions for all fields

### Module Creation

1. **Plan Structure**: Define the module's purpose and scope
2. **Follow Conventions**: Use existing module patterns
3. **Include Documentation**: Generate comprehensive documentation
4. **Consider Integration**: Plan how the module integrates with existing systems
5. **Validate Compliance**: Ensure STAMPED and NEON compliance

### Validation

1. **Regular Checks**: Run validation on all schemas regularly
2. **Pre-commit**: Validate schemas before committing changes
3. **CI/CD Integration**: Use automated validation in pipelines
4. **Document Issues**: Keep track of validation issues and resolutions

## Security Considerations

1. **API Key Protection**: Never commit API keys to version control
2. **Environment Variables**: Use environment variables for sensitive data
3. **GitHub Secrets**: Store sensitive data in GitHub repository secrets
4. **Access Control**: Limit access to Claude Auto configuration
5. **Audit Logging**: Monitor and log all Claude Auto interactions

## Contributing

To contribute to the Claude Auto integration:

1. **Follow Patterns**: Use existing code patterns and conventions
2. **Add Tests**: Include tests for new functionality
3. **Update Documentation**: Keep documentation current
4. **Validate Changes**: Ensure all changes pass validation
5. **Review Compliance**: Verify STAMPED and NEON compliance

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review error logs and console output
3. Validate configuration and environment variables
4. Test with simple commands first
5. Check GitHub Actions logs for CI/CD issues

---

**Claude Auto is your intelligent assistant for maintaining and expanding the weewee-def-update system. Use it to ensure consistency, compliance, and quality across all your schemas, modules, and configurations.** 