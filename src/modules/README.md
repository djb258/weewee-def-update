# Modules

This directory contains the core modules of the WeeWee Definition Update System.

## Module Structure

Each module should follow this structure:

```
module-name/
├── index.ts          # Module entry point
├── types.ts          # TypeScript type definitions
├── schemas/          # Module-specific schemas
├── components/       # React components
├── utils/           # Utility functions
└── README.md        # Module documentation
```

## Core Modules

### Client Management (`clnt`)
- Client process mapping
- Compliance matrix
- Vendor routing
- Group registry

### Command System (`cmd`)
- Command logging
- Engineer logs
- Prep tables

### Doctrine Management (`dpr`)
- Doctrine schema
- Knowledge sync
- Messaging library
- Research library

### Marketing (`marketing`)
- Strategy constants
- ICP assets
- Output logging

### Personal Database (`pers_db`)
- Agent activity
- Finance logs
- Health logs

### SHQ System (`shq`)
- Agent management
- Process library
- Mission management
- System registry

## Module Development Guidelines

1. **Naming Convention**: Use lowercase with hyphens for directory names
2. **Type Safety**: All modules must have proper TypeScript definitions
3. **Schema Validation**: All data structures must have JSON schemas
4. **Documentation**: Each module must have comprehensive documentation
5. **Testing**: All modules must include unit tests
6. **Compliance**: All modules must follow NEON Doctrine and STAMPED Framework 