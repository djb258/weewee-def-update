# Schema Definitions

This directory contains all JSON schema definitions for the WeeWee Definition Update System.

## Schema Categories

### Client Management (`clnt_*`)
- Client process mapping
- Compliance matrix
- Vendor routing
- Group registry

### Command System (`cmd_*`)
- Command logging
- Engineer logs
- Prep tables

### Doctrine Management (`dpr_*`)
- Doctrine schema
- Knowledge sync
- Messaging library
- Research library

### Marketing (`marketing_*`)
- Strategy constants
- ICP assets
- Output logging

### Personal Database (`pers_db_*`)
- Agent activity
- Finance logs
- Health logs

### SHQ System (`shq_*`)
- Agent management
- Process library
- Mission management
- System registry

## Schema Structure

Each schema should follow this structure:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Schema Name",
  "description": "Schema description",
  "type": "object",
  "properties": {
    // Schema properties
  },
  "required": ["required_fields"],
  "additionalProperties": false
}
```

## Validation

Schemas are validated against:
- JSON Schema Draft 7
- NEON Doctrine compliance
- STAMPED Framework requirements 