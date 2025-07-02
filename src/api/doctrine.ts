import { NEONDoctrine, STAMPEDFramework, BartonNumbering } from '../types/doctrine';
import gbtDoctrineData from '../../gbt_doctrine.json';

/**
 * NEON Doctrine - Nuclear Enforcement, Explicit Ownership, Operational Normalization
 */
export const NEON_DOCTRINE: NEONDoctrine = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  principles: {
    nuclearEnforcement: {
      name: "Nuclear Enforcement",
      description: "Strict validation of all schemas and data structures",
      rules: [
        "All schemas must be validated against JSON Schema Draft 7",
        "All data must conform to defined schemas",
        "No data can exist without proper schema definition",
        "All validation errors must be logged and addressed"
      ]
    },
    explicitOwnership: {
      name: "Explicit Ownership",
      description: "Clear data ownership definitions and responsibilities",
      rules: [
        "Every data structure must have a defined owner",
        "Ownership must be documented in schema metadata",
        "Owners are responsible for data integrity and compliance",
        "Ownership changes must be tracked and audited"
      ]
    },
    operationalNormalization: {
      name: "Operational Normalization",
      description: "Standardized operations across all modules",
      rules: [
        "All operations must follow standardized patterns",
        "Error handling must be consistent across modules",
        "Logging and monitoring must be uniform",
        "Performance metrics must be standardized"
      ]
    },
    noOrphanData: {
      name: "No Orphan Data",
      description: "Complete data lineage tracking",
      rules: [
        "All data must have traceable lineage",
        "Data relationships must be explicitly defined",
        "No data can exist without proper relationships",
        "Data deletion must cascade properly"
      ]
    }
  }
};

/**
 * STAMPED Framework - Structured, Traceable, Audit-ready, Mapped, Promotable, Enforced, Documented
 */
export const STAMPED_FRAMEWORK: STAMPEDFramework = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  principles: {
    structured: {
      name: "Structured",
      description: "Consistent organization across all modules",
      rules: [
        "All modules must follow consistent naming conventions",
        "Directory structure must be standardized",
        "File organization must be logical and predictable",
        "Code structure must follow established patterns"
      ]
    },
    traceable: {
      name: "Traceable",
      description: "Complete audit trail for all changes",
      rules: [
        "All changes must be version controlled",
        "Change history must be preserved",
        "Authorship must be tracked",
        "Change reasons must be documented"
      ]
    },
    auditReady: {
      name: "Audit-ready",
      description: "Compliance-ready structures and documentation",
      rules: [
        "All structures must support audit requirements",
        "Documentation must be comprehensive",
        "Evidence must be preserved",
        "Compliance status must be trackable"
      ]
    },
    mapped: {
      name: "Mapped",
      description: "Clear relationships between all components",
      rules: [
        "Component relationships must be documented",
        "Dependencies must be clearly defined",
        "Data flow must be mapped",
        "Integration points must be identified"
      ]
    },
    promotable: {
      name: "Promotable",
      description: "Version-controlled changes and updates",
      rules: [
        "All changes must be versioned",
        "Promotion process must be defined",
        "Rollback capabilities must exist",
        "Change approval must be tracked"
      ]
    },
    enforced: {
      name: "Enforced",
      description: "Automated validation and compliance checking",
      rules: [
        "Validation must be automated",
        "Compliance checks must run automatically",
        "Policy violations must be prevented",
        "Enforcement must be consistent"
      ]
    },
    documented: {
      name: "Documented",
      description: "Comprehensive documentation for all components",
      rules: [
        "All components must be documented",
        "Documentation must be kept current",
        "Examples must be provided",
        "Usage instructions must be clear"
      ]
    }
  }
};

/**
 * Barton Numbering System for hierarchical organization
 */
export const BARTON_NUMBERING: BartonNumbering = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  system: {
    name: "Barton Numbering System",
    description: "Hierarchical numbering system for organizing system components",
    format: "X.Y.Z where X=major, Y=minor, Z=patch",
    rules: [
      "Major version (X) for breaking changes",
      "Minor version (Y) for new features",
      "Patch version (Z) for bug fixes",
      "All versions must be documented"
    ]
  },
  categories: {
    "1": "Core System",
    "2": "Client Management",
    "3": "Command System", 
    "4": "Doctrine Management",
    "5": "Marketing",
    "6": "Personal Database",
    "7": "SHQ System"
  }
};

/**
 * API endpoint to serve doctrine data
 */
export function getDoctrineData() {
  return {
    neon: NEON_DOCTRINE,
    stamped: STAMPED_FRAMEWORK,
    barton: BARTON_NUMBERING,
    metadata: {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      source: "weewee-def-update",
      endpoint: "/api/doctrine"
    }
  };
}

/**
 * Validate data against doctrine
 */
export function validateAgainstDoctrine(data: any, doctrineType: 'neon' | 'stamped' | 'barton') {
  const validation = {
    valid: true,
    errors: [] as string[],
    warnings: [] as string[]
  };

  switch (doctrineType) {
    case 'neon':
      // Validate against NEON Doctrine
      if (!data.schema) {
        validation.valid = false;
        validation.errors.push("Data must have a schema definition");
      }
      if (!data.owner) {
        validation.valid = false;
        validation.errors.push("Data must have explicit ownership");
      }
      break;
    
    case 'stamped':
      // Validate against STAMPED Framework
      if (!data.documentation) {
        validation.warnings.push("Data should be documented");
      }
      if (!data.version) {
        validation.warnings.push("Data should be versioned");
      }
      break;
    
    case 'barton':
      // Validate against Barton Numbering
      if (!data.category) {
        validation.warnings.push("Data should have a category");
      }
      break;
  }

  return validation;
}

export async function getGbtDoctrine() {
  return {
    status: 200,
    data: gbtDoctrineData,
    timestamp: new Date().toISOString(),
    source: 'weewee-def-update-system'
  };
}

export async function getDoctrineStatus() {
  return {
    status: 200,
    message: 'GBT Doctrine API is operational',
    version: '1.0.0',
    last_updated: new Date().toISOString(),
    total_schemas: gbtDoctrineData.metadata.total_schemas,
    framework: gbtDoctrineData.metadata.framework
  };
} 