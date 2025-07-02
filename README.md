
# 🛠️ WeeWee Definition Update System

A comprehensive system for managing definitions, schemas, and doctrine with NEON compliance and STAMPED framework integration.

## 🎯 Overview

This system provides automated compliance checking, schema validation, audit logging, and blueprint integration to ensure your database follows the highest standards of data governance.

## 🚀 Quick Deploy

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/weewee-def-update)

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts to connect your repository
```

### Environment Variables

Set these in your Vercel dashboard:

```bash
NEON_DATABASE_URL=postgresql://neondb_owner:npg_U7OnhIbeEw1m@ep-round-bird-a4a7s49a-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NODE_ENV=production
```

## 🏗️ Architecture

### Core Principles

- **NEON Doctrine**: Nuclear Enforcement, Explicit Ownership, Operational Normalization, No Orphan Data
- **STAMPED Framework**: Structured, Traceable, Audit-ready, Mapped, Promotable, Enforced, Documented
- **Barton Numbering**: Unique identification system for all schema elements

## 🚀 Features

### 1. Database Compliance Suite

- Automated NEON doctrine compliance checking
- Schema integrity validation
- Audit logging for schema changes
- Blueprint schema generation
- Automated fixes for common issues

### 2. Schema Validator

- Orphaned record detection
- Duplicate record identification
- Required field validation
- Data type violation checking
- Circular reference detection

### 3. Blueprint Enforcement Engine

- Rule-based enforcement system
- Automated corrections
- Compliance reporting
- Audit trail generation

## 📋 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL/Neon database
- Access to your database connection string

### Installation

```bash
npm install
```

### Basic Usage

#### Run Full Compliance Check

```bash
npm run compliance:full
```

#### Individual Tools

```bash
# Database compliance suite
npm run compliance:check

# Schema validation
npm run compliance:validate

# Blueprint enforcement
npm run compliance:enforce

# Apply NEON doctrine comments
npm run doctrine:apply

# Verify doctrine compliance
npm run doctrine:verify
```

## 🚀 Vercel Deployment

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/weewee-def-update)

### Manual Deployment

1. **Install Vercel CLI**

```bash
npm i -g vercel
```

2. **Login to Vercel**

```bash
vercel login
```

3. **Deploy**

```bash
vercel
```

4. **Set Environment Variables**

```bash
vercel env add NEON_DATABASE_URL
# Enter your Neon connection string
```

### Environment Variables

Add these to your Vercel project:

- `NEON_DATABASE_URL` - Your Neon database connection string
- `NODE_ENV` - Set to `production`

### API Endpoints

Once deployed, your API will be available at:

- `https://your-project.vercel.app/api/compliance?action=status`
- `https://your-project.vercel.app/api/compliance?action=compliance-check`
- `https://your-project.vercel.app/api/compliance?action=schema-validation`
- `https://your-project.vercel.app/api/compliance?action=enforcement`

## 🔧 Configuration

### Database Connection

Update the connection string in the script files:

```javascript
const connectionString = 'your-neon-connection-string';
```

### Custom Rules

Add custom enforcement rules in `scripts/blueprint_enforcement_engine.js`:

```javascript
{
  id: 'CUSTOM_001',
  name: 'Custom Business Rule',
  description: 'Your custom rule description',
  type: 'VALIDATION',
  severity: 'HIGH',
  query: 'YOUR_SQL_QUERY'
}
```

## 📊 Reports

All tools generate detailed reports in the `reports/` directory:

- `compliance_report_[timestamp].json`
- `schema_validation_[timestamp].json`
- `blueprint_enforcement_[timestamp].json`

## 🎯 NEON Doctrine Compliance

### What Gets Checked

- ✅ Table-level doctrine comments
- ✅ Column-level Barton IDs
- ✅ Unique identification system
- ✅ Complete documentation trail
- ✅ Operational normalization

### Compliance Rate

The system calculates and reports compliance rates:

```
📊 NEON Compliance: 80/80 tables compliant (100%)
📊 Schema Integrity: 0 issues found
📊 Violations: 0
```

## 🔍 STAMPED Framework

### Structured

- All tables have consistent doctrine comments
- Standardized naming conventions

### Traceable

- Every column has a unique Barton ID
- Complete audit trail for all changes

### Audit-ready

- Comprehensive logging of all operations
- Detailed violation reports

### Mapped

- Barton numbering system applied
- Blueprint integration ready

### Promotable

- Clear data type definitions
- Validation rules in place

### Enforced

- Automated rule application
- Real-time compliance checking

### Documented

- Full versioning support
- Source-of-truth established

## 🛠️ Advanced Usage

### Custom Validation Rules

```javascript
const customRule = {
  id: 'CUSTOM_001',
  name: 'Custom Validation',
  description: 'Custom business rule validation',
  type: 'VALIDATION',
  severity: 'MEDIUM',
  query: `
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE your_custom_condition
  `,
};
```

### Automated Fixes

The system can automatically fix common issues:

- Missing table comments
- Missing Barton IDs
- Inconsistent formatting

### Integration with CI/CD

```bash
# Add to your CI pipeline
npm run compliance:full
# Check exit code for compliance status
```

## 📈 Monitoring

### Real-time Compliance

Monitor compliance in real-time:

```bash
# Check current compliance status
npm run compliance:check

# Generate detailed report
npm run compliance:enforce
```

### Alert System

Set up alerts for compliance violations:

```javascript
// In your monitoring system
if (complianceRate < 95) {
  sendAlert('Compliance rate below threshold');
}
```

## 🔒 Security

- Database credentials are handled securely
- Audit logs track all changes
- No sensitive data in reports
- Encrypted connections to database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your changes
4. Run compliance checks
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:

1. Check the reports in `reports/` directory
2. Review the audit logs
3. Run individual compliance tools
4. Check database connection

## 🎉 Success Metrics

Your database is fully compliant when you see:

- ✅ 100% NEON compliance rate
- ✅ 0 schema integrity issues
- ✅ 0 violations in enforcement reports
- ✅ All tables have doctrine comments
- ✅ All columns have Barton IDs

---

**Built with ❤️ for enterprise-grade data governance**

# MantisBT Render-Ready

A Dockerized version of MantisBT (Mantis Bug Tracker) ready for deployment on Render with external database support.

## Features

- ✅ Pre-configured Docker container
- ✅ PHP 8.2 with Apache
- ✅ Automatic MantisBT download and setup
- ✅ External database support (MySQL/PostgreSQL)
- ✅ Environment variable configuration
- ✅ Render deployment ready

## Quick Deploy on Render

1. **Fork this repository** to your GitHub account

2. **Connect to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Environment Variables for External Database:**

   ```
   # Required Database Settings
   DB_HOST=your_external_database_host
   DB_NAME=mantisbt
   DB_USERNAME=your_database_username
   DB_PASSWORD=your_database_password

   # Optional Database Port (if not default)
   DB_PORT=3306  # 3306 for MySQL, 5432 for PostgreSQL

   # Admin Settings
   ADMIN_USERNAME=administrator
   ADMIN_PASSWORD=root

   # Security (generate a random string)
   CRYPTO_SALT=your_random_salt_here
   ```

4. **Deploy:**
   - Render will automatically build and deploy
   - Wait for build to complete
   - Access your MantisBT instance

## External Database Setup

### Supported Databases:

- **MySQL 5.7+** (recommended)
- **MariaDB 10.2+**
- **PostgreSQL 9.6+**

### Database Requirements:

1. **Create a database** named `mantisbt` (or your preferred name)
2. **Create a user** with full permissions on the database
3. **Ensure the database is accessible** from Render's servers
4. **Note the connection details** for environment variables

### Database Connection Checklist:

- [ ] Database server is running and accessible
- [ ] Database `mantisbt` exists
- [ ] User has CREATE, SELECT, INSERT, UPDATE, DELETE permissions
- [ ] Firewall allows connections from Render (0.0.0.0/0)
- [ ] SSL/TLS is configured if required

## Initial Setup

After deployment:

1. **Access the application** at your Render URL
2. **Complete the installation wizard** if needed
3. **Default admin credentials:**
   - Username: `administrator`
   - Password: `root`
4. **Change default password** immediately
5. **Copy config_inc.php** to `config/config_inc.php` if needed

## Environment Variables Reference

### Required:

- `DB_HOST`: Your database server hostname/IP
- `DB_NAME`: Database name (e.g., `mantisbt`)
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password

### Optional:

- `DB_PORT`: Database port (default: 3306 for MySQL, 5432 for PostgreSQL)
- `ADMIN_USERNAME`: Initial admin username (default: `administrator`)
- `ADMIN_PASSWORD`: Initial admin password (default: `root`)
- `CRYPTO_SALT`: Random string for encryption (generate one!)

### Advanced:

- `MANTIS_AGENT_MODE`: Set to `live` for production
- `OPENAI_API_KEY`: For AI features (if using)
- `FIREBASE_CONFIG`: For Firebase integration (if using)

## Troubleshooting

### Build Fails

- Check that Dockerfile is properly named (not Dockerfile.txt)
- Verify all required environment variables are set
- Check Render logs for specific errors

### Database Connection Issues

- Verify database credentials in environment variables
- Ensure database server is accessible from internet
- Check firewall settings on your database server
- Test connection with a database client
- Verify database user has proper permissions

### Application Not Loading

- Check Apache logs in Render dashboard
- Verify PHP extensions are installed
- Ensure proper file permissions
- Check if database connection is successful

### Common Database Errors:

- **Access denied**: Check username/password and permissions
- **Connection timeout**: Check firewall and network settings
- **Database not found**: Create the database first
- **SSL required**: Configure SSL in database settings

## Local Development

To run locally with external database:

```bash
# Build the image
docker build -t mantisbt .

# Run the container with environment variables
docker run -p 8080:80 \
  -e DB_HOST=your_db_host \
  -e DB_NAME=mantisbt \
  -e DB_USERNAME=your_username \
  -e DB_PASSWORD=your_password \
  mantisbt

# Access at http://localhost:8080
```

## Security Notes

1. **Change default admin password** immediately after first login
2. **Generate a strong CRYPTO_SALT** for production
3. **Use strong database passwords**
4. **Enable SSL/TLS** for database connections in production
5. **Restrict database access** to Render's IP ranges if possible

## Support

For issues:

1. Check Render deployment logs
2. Verify environment variables are correct
3. Test database connectivity
4. Check MantisBT error logs in the application

## License

MantisBT is licensed under the GPL v2. See the [MantisBT repository](https://github.com/mantisbt/mantisbt) for details.

# Ping-Pong Prompt Refinement Template

A modular, reusable engine and UI for iterative prompt refinement, designed for integration across multiple UIs and tools (e.g., lovable.dev, custom apps, research workflows).

## Folder Structure

```
/core        # Core logic (engine, types, state management)
/components  # UI components (React, Tailwind, etc.)
/examples    # Example usage and integration patterns
```

## Usage

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Import and instantiate the engine:**
   ```ts
   import { PingPongEngine } from './core/pingPongEngine';
   const engine = new PingPongEngine({ initialPrompt: 'Start here...' });
   ```
3. **Use the UI component:**
   ```tsx
   import { PingPongPromptUI } from './components/PingPongPromptUI';
   <PingPongPromptUI engine={engine} />;
   ```

## Extension Points

- **Add new agent types:** Extend the engine logic to support more agents or custom refinement strategies.
- **Swap UI:** Use the core engine in any frontend (React, Vue, CLI, etc.). Only the UI component is React-specific.
- **Integrate APIs:** Hook in external APIs for the `GO` phase or for agent logic.
- **Custom versioning:** Change how versions are named or stored.

## Integration Example

See `/examples` for sample usage in different frameworks and workflows.

## STAMPED/SPVPET/STACKED Compliance

All outputs are valid, parsable JSON objects suitable for storage in Firebase, Neon, or BigQuery, following the STAMPED/SPVPET/STACKED doctrine.

## Contributing

- Keep core logic UI-agnostic and well-documented.
- Add new UI components in `/components`.
- Add new integration examples in `/examples`.

---

**Built for composability, clarity, and research-grade traceability.**

# Ping-Pong Prompt Engine Template

This is a minimal, modular React/TypeScript Vite app providing a reusable ping-pong prompt refinement engine for lovable.dev and similar projects.

## Features

- Modular core logic (`src/core/pingPongEngine.ts`)
- Reusable, live-updating UI (`src/components/PingPongPromptUI.tsx`)
- Clean separation of logic and presentation
- Version history, JSON output, and agent/finalization controls

## Usage

1. Clone the repo and install dependencies:
   ```sh
   npm install
   ```
2. Start the dev server:
   ```sh
   npm run dev
   ```
3. Extend or integrate the engine/UI as needed in your own projects.

## File Structure

- `src/core/pingPongEngine.ts` — Core engine logic
- `src/components/PingPongPromptUI.tsx` — UI component
- `src/App.tsx` — Minimal app entry

---

MIT License

# weewee-def-update

This repository is the source of truth for the Barton Nuclear Doctrine, STAMPED/SPVPET/STACKED schema, and agent memory/tool registry. All GDTs and agents must reference this repo for compliance, blueprinting, and schema validation.

## Contents

- `BARTON_NUCLEAR_DOCTRINE.md`: The master doctrine and enforcement rules
- `STAMPED_SCHEMA.json`: The schema definition for all payloads and DB writes
- `AGENT_MEMORY_REGISTRY.json`: Registry for agent/tool memory and blueprint traceability

## Usage

- **Do not invent new logic or schema.** Always check this repo first.
- **All new tables/columns must have explicit Barton numbering.**
- **All blueprints and payloads must reference the agent memory registry.**
- **All code and schema changes must be validated against the doctrine and schema.**

## For GDTs and Agents

- Validate all generated code and blueprints against `STAMPED_SCHEMA.json`.
- Reject or flag any code that tries to write to Neon, Firebase, or BigQuery outside the approved schema.
- Require explicit Barton numbering for new tables or columns.
- Insert agent memory references to the tool registry when building blueprints or payloads.

## Change Management

- All changes must be proposed via pull request and reviewed by a doctrine enforcer.

---

**This repository is mandatory for all blueprinting, schema, and doctrine enforcement.**

# New Client Setup - Client Onboarding System

A structured repository for building a comprehensive client onboarding system with modular components that will be merged into a unified template.

## 📚 Documentation System

The `docs/` directory provides comprehensive documentation and tracking structure to support modular development, selective client updates, and Git management. This documentation system is designed for use with **Obsidian** (for system knowledge mapping) and **GitKraken** (for branch and merge orchestration).

### Documentation Structure

```
docs/
├── modules/              # Module-specific documentation
│   ├── forms.md         # Forms module documentation
│   ├── neon.md          # Database module documentation
│   ├── vendor-router.md # Vendor routing documentation
│   └── dashboards.md    # Client UI documentation
├── clients/             # Client-specific documentation
│   ├── acmeco.md        # ACME Co client documentation
│   ├── betacorp.md      # BetaCorp client documentation
│   └── deltatest.md     # DeltaTest client documentation
├── processes/           # Development and deployment processes
│   ├── update-flow.md   # Update flow process documentation
│   ├── deployment-checklist.md # Deployment checklist
│   └── merge-strategy.md # Git merge strategy documentation
└── graphs/              # Visual documentation and diagrams
    └── README.md        # Graph documentation guidelines
```

### Recommended Tools

#### Obsidian for Knowledge Tracking

- **System Knowledge Mapping**: Use Obsidian to create interconnected knowledge graphs of the system architecture
- **Module Relationships**: Visualize dependencies and integration points between modules
- **Client Configurations**: Map client-specific customizations and requirements
- **Process Flows**: Document development and deployment processes with Mermaid diagrams

#### GitKraken for Branch Management

- **Branch Visualization**: Visual representation of feature branches and their relationships
- **Merge Strategy**: Orchestrate complex merge strategies across multiple modules
- **Submodule/Subtree Management**: Manage modular components and their integration
- **Release Tracking**: Track version releases and deployment coordination

### Documentation Purpose

The documentation system supports:

- **Modular Development**: Track development progress across independent modules
- **Selective Client Updates**: Manage client-specific configurations and deployments
- **Version Control**: Maintain version history and change tracking
- **Process Management**: Standardize development and deployment procedures
- **Knowledge Transfer**: Ensure system knowledge is preserved and accessible

## 🏗️ Project Structure

```
new-client-setup/
├── forms/                 # Form components + form submission API handlers
│   ├── components/        # Reusable form components
│   ├── api/              # API endpoints for form submission
│   └── README.md
├── neon/                 # Neon database integration
│   ├── schema/           # Table definitions and schema tools
│   ├── seed/             # Database seed scripts
│   └── README.md
├── landing/              # Landing pages and client-specific content
│   ├── pages/            # Landing page templates
│   ├── components/       # Landing page components
│   └── README.md
├── vendor-router/        # Email routing + vendor mapping logic
│   ├── logic/            # Routing algorithms and business logic
│   ├── config/           # Routing configuration files
│   └── README.md
├── client-ui/            # Role-specific client dashboards
│   ├── pages/            # Dashboard pages
│   │   └── dashboard/    # Role-specific dashboard views
│   ├── components/       # Dashboard components
│   └── README.md
└── config/               # Global configuration
    ├── clients.json      # Client + vendor mapping config
    └── .env.example      # Example environment variables
```

## 🌿 Git Branch Strategy

This project uses feature branches for focused development:

- `main` - Unified template (merge target)
- `feat/forms-build` - Form components and API development
- `feat/neon-tables` - Database schema and seed scripts
- `feat/landing-pages` - Landing page templates and components
- `feat/vendor-routing` - Email routing and vendor mapping logic
- `feat/client-ui` - Role-specific client dashboards

## 🔄 Merge Strategy

Each feature branch will be developed independently and then merged into `main` to create the unified template.

### Development Workflow

1. **Branch Development**: Work on each feature branch independently
2. **Integration Testing**: Test components together before merging
3. **Merge to Main**: Combine all features into unified template
4. **Template Finalization**: Polish and document the complete system

## ✅ Merge Checklist

Before merging all feature branches into `main`, ensure:

- [ ] **Forms Integration**
  - [ ] Forms submit data with correct fields mapped
  - [ ] Form validation works across all client types
  - [ ] API endpoints handle all form submissions properly
  - [ ] Error handling and user feedback implemented

- [ ] **Database Integration**
  - [ ] Neon tables align with form field names + types
  - [ ] Database schema supports all client configurations
  - [ ] Seed scripts populate test data correctly
  - [ ] Database connections and queries optimized

- [ ] **Landing Pages**
  - [ ] Landing pages load form correctly and pass client_id
  - [ ] Client-specific branding and content displays properly
  - [ ] Responsive design works across all devices
  - [ ] Page performance optimized

- [ ] **Vendor Routing**
  - [ ] Vendor router maps issue types to correct destinations
  - [ ] Email routing logic handles all client scenarios
  - [ ] Vendor mapping configuration is flexible and maintainable
  - [ ] Routing rules are properly validated

- [ ] **Client UI Dashboards**
  - [ ] Client UI dashboards pull correct data from Neon for each role
  - [ ] Role-based access control works properly
  - [ ] Dashboard components display data accurately
  - [ ] Real-time updates function correctly
  - [ ] Dashboard performance optimized for large datasets

- [ ] **Configuration**
  - [ ] All env vars defined and documented
  - [ ] Client configurations are properly structured
  - [ ] Environment-specific settings are separated
  - [ ] Configuration validation implemented

- [ ] **Integration Testing**
  - [ ] End-to-end workflow tested with multiple clients
  - [ ] Data flow from form → database → vendor routing verified
  - [ ] Dashboard data reflects form submissions and routing status
  - [ ] Error scenarios handled gracefully
  - [ ] Performance benchmarks met

## 🚀 Getting Started

1. Clone the repository
2. Checkout the appropriate feature branch for your work
3. Follow the README.md in each directory for specific instructions
4. Develop and test your component independently
5. Submit pull request to merge into main when ready

## 📋 Next Steps

1. Set up feature branches
2. Develop each component module independently
3. Test integration points between modules
4. Merge all features into unified template
5. Deploy and document the complete system

---

**Note**: Each directory contains its own README.md with specific development instructions and integration considerations.

# Weewee Definition Update - Foundational Home System

**Your Single Source of Truth for All Doctrine, Data Schemas, Tools, and Processes**

This repository serves as the foundational home system that contains all your doctrine, data schemas, tools, and processes in one centralized location. It's designed to be referenced by Cursor AI and other tools to ensure consistency and prevent knowledge loss.

## 🎯 Purpose

This repository is the **foundation of your home system** that:

1. **Centralizes All Knowledge**: All doctrine, schemas, tools, and processes in one place
2. **Enables Cursor AI Access**: Provides structured data for AI tools to understand your system
3. **Syncs with Neon Database**: Updates bootstrap tables to prevent data loss
4. **Supports Module Expansion**: Easy addition of new modules and processes
5. **Maintains Version Control**: Tracks all changes and updates systematically

## 🏗️ System Architecture

### Core Components

```
weewee-def-update/
├── doctrine/              # All doctrine and principles
│   ├── barton-nuclear/    # Barton Nuclear Doctrine
│   ├── stamped/          # STAMPED Framework
│   ├── neon/             # NEON Doctrine
│   └── compliance/       # Compliance frameworks
├── schemas/              # All data schemas
│   ├── client/           # Client management schemas
│   ├── command/          # Command system schemas
│   ├── doctrine/         # Doctrine management schemas
│   ├── marketing/        # Marketing schemas
│   ├── personal/         # Personal database schemas
│   └── shq/             # SHQ system schemas
├── tools/                # All tools and utilities
│   ├── validation/       # Schema validation tools
│   ├── sync/            # Database sync tools
│   ├── compliance/      # Compliance checking tools
│   └── generation/      # Code generation tools
├── processes/            # All business processes
│   ├── workflows/        # Process workflows
│   ├── templates/        # Process templates
│   └── documentation/    # Process documentation
├── config/               # Configuration files
│   ├── neon/            # Neon database config
│   ├── cursor/          # Cursor AI config
│   └── bootstrap/       # Bootstrap table config
└── sync/                 # Synchronization tools
    ├── neon-sync/        # Neon database sync
    ├── cursor-sync/      # Cursor AI sync
    └── backup/           # Backup and recovery
```

## 🔄 Integration Points

### Cursor AI Integration

- **Knowledge Base**: Structured data for AI understanding
- **Schema Reference**: All data schemas for validation
- **Process Templates**: Standardized processes for AI execution
- **Tool Registry**: Complete tool inventory for AI access

### Neon Database Sync

- **Bootstrap Table Updates**: Automatic sync of all schemas
- **Version Control**: Track schema changes and updates
- **Compliance Tracking**: Monitor doctrine compliance
- **Backup System**: Prevent data loss through regular syncs

### Module Management

- **Easy Addition**: Simple process for adding new modules
- **Version Control**: Track module versions and dependencies
- **Integration Testing**: Ensure new modules work with existing system
- **Documentation**: Automatic documentation generation

## 📋 Current Schema Inventory

### Client Management (`clnt_*`)

- Client Process Mapping
- Compliance Matrix
- Group Registry
- Vendor Benefits
- Input/Output Logic
- Validation Maps
- Master Eligibility
- Participant Management
- Vendor Routing

### Command System (`cmd_*`)

- Command Logging
- Engineer Logs
- Prep Tables

### Doctrine Management (`dpr_*`)

- Doctrine Schema
- Christmas Tree Structure
- Category Mapping
- Section Management
- Table Mapping
- Knowledge Sync
- Messaging Library
- Research Library
- Sub-hive Management
- System Keys

### Marketing (`marketing_*`)

- Strategy Constants
- ICP Assets
- Output Logging
- Command Logging

### Personal Database (`pers_db_*`)

- Agent Activity
- Command Logging
- Finance Logs
- Health Logs
- Prep Tables

### SHQ System (`shq_*`)

- Agent Management
- Bootstrap Programs
- Process Library
- API Keys
- Command Logging
- Error Logging
- Mission Management
- Order Queue
- System Registry

## 🚀 Usage

### For Cursor AI

```bash
# Reference this repository in Cursor
# All schemas and doctrine are available for AI understanding
# Use structured queries to access specific knowledge
```

### For Neon Sync

```bash
# Sync all schemas to Neon bootstrap table
npm run sync:neon

# Update specific module schemas
npm run sync:neon -- --module=client

# Validate sync status
npm run sync:validate
```

### For Module Addition

```bash
# Add new module
npm run module:add -- --name=new-module --type=process

# Generate module schemas
npm run module:generate -- --name=new-module

# Update documentation
npm run module:docs -- --name=new-module
```

## 🔧 Development Workflow

### Adding New Modules

1. **Create Module Structure**: Use template to create new module
2. **Define Schemas**: Create JSON schemas for all data structures
3. **Add Doctrine**: Include relevant doctrine and compliance rules
4. **Create Tools**: Build validation and sync tools
5. **Update Documentation**: Generate comprehensive documentation
6. **Sync to Neon**: Update bootstrap table with new schemas
7. **Test Integration**: Ensure compatibility with existing system

### Updating Existing Modules

1. **Modify Schemas**: Update JSON schema definitions
2. **Version Control**: Track changes and create migration scripts
3. **Update Doctrine**: Modify relevant doctrine and compliance rules
4. **Sync Changes**: Update Neon database with changes
5. **Update Documentation**: Refresh all related documentation
6. **Test Compatibility**: Ensure changes don't break existing functionality

## 📊 Compliance Framework

### NEON Doctrine

- **Nuclear Enforcement**: Strict validation of all schemas
- **Explicit Ownership**: Clear data ownership definitions
- **Operational Normalization**: Standardized operations across modules
- **No Orphan Data**: Complete data lineage tracking

### STAMPED Framework

- **Structured**: Consistent organization across all modules
- **Traceable**: Complete audit trail for all changes
- **Audit-ready**: Compliance-ready structures and documentation
- **Mapped**: Clear relationships between all components
- **Promotable**: Version-controlled changes and updates
- **Enforced**: Automated validation and compliance checking
- **Documented**: Comprehensive documentation for all components

## 🛠️ Tools and Scripts

### Schema Management

- `schema-validator.js`: Validate all schemas against doctrine
- `schema-generator.js`: Generate new schemas from templates
- `schema-sync.js`: Sync schemas to Neon database
- `schema-docs.js`: Generate documentation from schemas

### Doctrine Management

- `doctrine-validator.js`: Validate doctrine compliance
- `doctrine-sync.js`: Sync doctrine to Neon database
- `doctrine-docs.js`: Generate doctrine documentation

### Module Management

- `module-generator.js`: Generate new module structure
- `module-validator.js`: Validate module integration
- `module-sync.js`: Sync module to Neon database

### Compliance Tools

- `compliance-checker.js`: Check overall system compliance
- `compliance-report.js`: Generate compliance reports
- `compliance-sync.js`: Sync compliance status to Neon

## 📈 Monitoring and Reporting

### System Health

- Schema validation status
- Doctrine compliance metrics
- Module integration status
- Sync status with Neon database

### Performance Metrics

- Schema validation performance
- Sync operation efficiency
- Compliance check duration
- Error rate tracking

## 🔒 Security and Backup

### Data Protection

- All schemas are version controlled
- Regular backups to Neon database
- Audit logging for all changes
- Access control for modifications

### Recovery Procedures

- Automated backup to Neon
- Version rollback capabilities
- Schema recovery tools
- Documentation recovery

## 🤝 Contributing

1. **Fork Repository**: Create your own fork
2. **Create Feature Branch**: Work on specific features
3. **Follow Standards**: Use established naming and structure conventions
4. **Validate Changes**: Run all validation tests
5. **Update Documentation**: Keep documentation current
6. **Submit Pull Request**: Request review and merge

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:

1. Check schema validation reports
2. Review compliance documentation
3. Run individual validation tools
4. Check Neon database sync status
5. Review audit logs for recent changes

---

**This is your foundational home system - the single source of truth for all your knowledge, tools, and processes. Keep it updated, validated, and synchronized to prevent knowledge loss and ensure consistency across all your systems.**

# new-client-setup: Parent/Master Foundation Repository

## Purpose

This repository is the **parent/master foundation** for all system doctrine, modules, and configuration. All child repositories and processes must conform to the doctrine, structure, and rules defined here.

- **All child repos derive their structure, rules, and modules from this repository.**
- **Updates flow parent → child via controlled tooling or merge processes.**
- **This repo defines the foundation for Neon bootstrap data and all system compliance.**

## Structure

- `modules/` — Canonical module implementations (forms, neon, vendor-router, dashboards, client-ui)
- `docs/` — Doctrine, module, and process documentation (including parent-child architecture)
- `config/` — Machine-readable doctrine, client config, and environment templates

## Usage

- All new modules, processes, and tools must be defined here first.
- Child repos must regularly sync/merge from this parent to remain compliant.
- Neon bootstrap and all system data must be seeded from this foundation.

---

**This is the single source of truth for your system's doctrine, modules, and compliance.**
