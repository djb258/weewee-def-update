# GBT Configuration for WeeWee Definition Update System

## 🎯 Purpose

This repository serves as the **parent/master foundation** for the WeeWee Definition Update System. It provides structured doctrine data, schemas, and configuration that GBTs can use for validation and compliance.

## 📍 Correct Repository Information

- **Repository URL**: `https://github.com/djb258/weewee-def-update.git`
- **Type**: Parent/Master Foundation Repository
- **Branch**: `main`
- **Doctrine Endpoint**: `/api/doctrine.json`

## 🔗 Doctrine API Endpoints

### Primary Endpoints (Use These)
1. **Production**: `https://weewee-def-update.vercel.app/api/doctrine`
2. **Local Development**: `http://localhost:3000/api/doctrine.json`
3. **Local File**: `./public/api/doctrine.json`

### ❌ Incorrect Endpoints (Do NOT Use)
- `cursor-blueprint-directory` (This is wrong)
- Any endpoint that returns HTML instead of JSON

## 📊 Available Doctrine Data

### NEON Doctrine
- **Nuclear Enforcement**: Strict validation of all schemas
- **Explicit Ownership**: Clear data ownership definitions
- **Operational Normalization**: Standardized operations
- **No Orphan Data**: Complete data lineage tracking

### STAMPED Framework
- **Structured**: Consistent organization across modules
- **Traceable**: Complete audit trail for changes
- **Audit-ready**: Compliance-ready structures
- **Mapped**: Clear relationships between components
- **Promotable**: Version-controlled changes
- **Enforced**: Automated validation and compliance
- **Documented**: Comprehensive documentation

### Barton Numbering System
- **Format**: X.Y.Z (Major.Minor.Patch)
- **Categories**: 1-7 for different system areas
- **Rules**: Version control and documentation requirements

## 🏗️ Module Structure

### Core Modules (with prefixes)
- **Client Management** (`clnt_*`): Category 2
- **Command System** (`cmd_*`): Category 3
- **Doctrine Management** (`dpr_*`): Category 4
- **Marketing** (`marketing_*`): Category 5
- **Personal Database** (`pers_db_*`): Category 6
- **SHQ System** (`shq_*`): Category 7

## 🔧 GBT Configuration

### Configuration File
- **Location**: `config/gbt-config.json`
- **Purpose**: Defines endpoints, modules, validation rules
- **Usage**: Load this file to understand system structure

### Validation Rules
- **Schema Validation**: JSON Schema Draft 7
- **Doctrine Compliance**: NEON + STAMPED + Barton
- **Strict Mode**: Enabled by default

## 📁 Repository Structure

```
weewee-def-update/
├── public/api/doctrine.json    # ✅ CORRECT doctrine endpoint
├── config/gbt-config.json      # GBT configuration
├── src/                        # Source code
├── schemas/                    # Schema definitions
├── docs/                       # Documentation
└── scripts/                    # Build and sync tools
```

## 🚀 Getting Started for GBT

### 1. Load Configuration
```json
{
  "doctrineEndpoint": "https://weewee-def-update.vercel.app/api/doctrine",
  "repository": "https://github.com/djb258/weewee-def-update.git"
}
```

### 2. Validate Against Doctrine
- Check all schemas against NEON Doctrine
- Verify STAMPED Framework compliance
- Apply Barton Numbering System

### 3. Use Correct Endpoints
- ✅ Use `/api/doctrine.json` for structured data
- ❌ Don't use `cursor-blueprint-directory`
- ❌ Don't expect HTML responses

## 🔍 Troubleshooting

### Issue: Getting HTML instead of JSON
**Solution**: Use the correct endpoint `/api/doctrine.json`

### Issue: Can't find doctrine data
**Solution**: Check the repository URL and ensure it's `weewee-def-update`

### Issue: Validation failing
**Solution**: Ensure you're using the latest doctrine version from the API

## 📞 Support

If the GBT encounters issues:
1. Check the doctrine endpoint is accessible
2. Verify the repository URL is correct
3. Ensure JSON responses (not HTML)
4. Use the provided configuration file

---

**This repository is the single source of truth for WeeWee Definition Update System doctrine and should be used as the primary reference for all GBT operations.** 