# Barton Numbering Schema

## Purpose

Defines the complete Barton numbering pattern for all databases, sub-hives, and doctrinal elements. This schema serves as the foundation for agent understanding and database navigation across all systems.

## Version / Status

- Version: 1.1.0
- Status: Foundation locked
- Last Updated: 2025-06-25T20:04:16.458Z
- Agent: shq_validator_gbt

## Numbering Format

**Primary Format**: `DB.HQ.SUB.NESTED.INDEX`

Where:

- **DB**: Database identifier (1 or 2)
- **HQ**: Sub-hive identifier (1-5 for DB1, 1-4 for DB2)
- **SUB**: Sub-sub-hive identifier (nested grouping)
- **NESTED**: Section identifier (0-49)
- **INDEX**: Sequential doctrinal ID within section (starts at 0)

## Database Structure

### Database 1: Command Ops

Primary operational database containing all core system functionality.

### Database 2: Marketing DB

Marketing-specific database for campaign and outreach operations.

## Sub-Hive Architecture

### Database 1 Sub-Hives

| Value | Code      | Name                    | Description                            |
| ----- | --------- | ----------------------- | -------------------------------------- |
| 1     | clnt      | Client                  | Client management and operations       |
| 2     | dpr       | Doctrine + Library      | Doctrine management and knowledge base |
| 3     | marketing | Marketing               | Marketing operations and campaigns     |
| 4     | pers_db   | Personal — David Barton | Personal database and assets           |
| 5     | shq       | Supreme Headquarters    | System command and control             |

### Database 2 Sub-Hives

#### David Barton Official Lists

| Value | Code    | Name                             | Description                             |
| ----- | ------- | -------------------------------- | --------------------------------------- |
| 1     | CFO     | Chief Financial Officer Doctrine | Financial operations and compliance     |
| 2     | CEO     | Chief Executive Officer Doctrine | Executive decision-making and strategy  |
| 3     | HR      | Human Resources Doctrine         | Personnel and organizational management |
| 4     | Company | General Company Doctrine         | General company policies and procedures |

## Section Categories

### Section Ranges

| Range | Code       | Name                            | Description                                    |
| ----- | ---------- | ------------------------------- | ---------------------------------------------- |
| 0-9   | tone       | Messaging Tone / Voice Control  | Communication style and voice guidelines       |
| 10-19 | structure  | Structural Schema and Flows     | Database structure and data flow patterns      |
| 20-29 | process    | Operational or Procedural Logic | Business processes and operational procedures  |
| 30-39 | compliance | Regulatory and Enforcement      | Compliance rules and enforcement protocols     |
| 40-49 | messaging  | Outbound / Campaign Messaging   | External communication and campaign management |

## Numbering Examples

### Command Ops Examples

- `1.5.3.30.0` → First compliance doctrine under SHQ > Sub-sub-hive 3
- `1.5.3.30.1` → Second compliance doctrine under SHQ > Sub-sub-hive 3
- `1.2.1.10.0` → First structural doctrine under DPR > Sub-sub-hive 1
- `1.1.2.20.0` → First process doctrine under Client > Sub-sub-hive 2

### Marketing DB Examples

- `2.1.1.40.0` → First messaging doctrine under CFO
- `2.1.2.30.0` → First compliance doctrine under CEO
- `2.1.3.20.0` → First process doctrine under HR
- `2.1.4.10.0` → First structural doctrine under Company

## Doctrinal ID Rules

### Scope

Each unique combination of `[database].[subhive].[subsubhive].[section]` defines a scope.

### Sequence

- Starts at 0 and increments linearly per scoped group
- Each scope maintains its own sequential numbering
- No gaps in numbering within a scope

### Examples

```
Scope: 1.5.3.30 (SHQ > Sub-sub-hive 3 > Compliance)
- 1.5.3.30.0 (First compliance doctrine)
- 1.5.3.30.1 (Second compliance doctrine)
- 1.5.3.30.2 (Third compliance doctrine)

Scope: 1.2.1.10 (DPR > Sub-sub-hive 1 > Structure)
- 1.2.1.10.0 (First structural doctrine)
- 1.2.1.10.1 (Second structural doctrine)
```

## Agent Integration

### Required Understanding

All agents must understand:

1. Database hierarchy and relationships
2. Sub-hive purposes and responsibilities
3. Section categorization and meaning
4. Numbering format and interpretation

### Validation Rules

- All doctrinal references must use valid numbering format
- Database values must be 1 or 2
- Sub-hive values must be within valid range for database
- Section values must be 0-49
- Doctrinal IDs must be sequential within scope

### Memory Protocol

- Agents restore numbering schema from `shq_bootstrap_program`
- Reference agent: `shq_validator_gbt`
- Process ID: `bootstrap_barton_numbering_schema_v1.1`

## Integration Notes

- All child repos must use this numbering system
- Database operations must respect sub-hive boundaries
- Cross-database operations require explicit routing
- All doctrinal references must be traceable via numbering

## Related Branches / Tags

- doctrine/barton-numbering-schema
- v1.1.0-doctrine
- shq_validator_gbt
