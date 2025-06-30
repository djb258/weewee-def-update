## Purpose

Defines the Barton numbering pattern for all schema, tables, and processes. Ensures traceability and compliance across all child repos.

## Version / Status

- Version: 1.0.0
- Status: Foundation locked

## Related Branches / Tags

- doctrine/numbering-system
- v1.0.0-doctrine

## Integration Notes

- All child repos must use this numbering system for all schema and process elements.

## Complete Barton Numbering Schema

For the complete and detailed Barton numbering schema, including:

- Database hierarchy (Command Ops vs Marketing DB)
- Sub-hive architecture (clnt, dpr, marketing, pers_db, shq)
- Section categorization (tone, structure, process, compliance, messaging)
- Numbering format (DB.HQ.SUB.NESTED.INDEX)
- Validation rules and examples

**See**: [`barton-numbering-schema.md`](./barton-numbering-schema.md)

**JSON Schema**: [`../schemas/barton-numbering-schema.json`](../schemas/barton-numbering-schema.json)

## Quick Reference

### Format

`DB.HQ.SUB.NESTED.INDEX`

### Databases

- **1**: Command Ops (Primary operational database)
- **2**: Marketing DB (Marketing-specific database)

### Sub-Hives (Database 1)

- **1**: clnt (Client management)
- **2**: dpr (Doctrine + Library)
- **3**: marketing (Marketing operations)
- **4**: pers_db (Personal — David Barton)
- **5**: shq (Supreme Headquarters)

### Sections

- **0-9**: Messaging Tone / Voice Control
- **10-19**: Structural Schema and Flows
- **20-29**: Operational or Procedural Logic
- **30-39**: Regulatory and Enforcement
- **40-49**: Outbound / Campaign Messaging

## Agent Reference

- **Source**: `shq_bootstrap_program` table
- **Agent**: `shq_validator_gbt`
- **Process ID**: `bootstrap_barton_numbering_schema_v1.1`
