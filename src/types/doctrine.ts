export interface NEONDoctrine {
  version: string;
  lastUpdated: string;
  principles: {
    nuclearEnforcement: DoctrinePrinciple;
    explicitOwnership: DoctrinePrinciple;
    operationalNormalization: DoctrinePrinciple;
    noOrphanData: DoctrinePrinciple;
  };
}

export interface STAMPEDFramework {
  version: string;
  lastUpdated: string;
  principles: {
    structured: DoctrinePrinciple;
    traceable: DoctrinePrinciple;
    auditReady: DoctrinePrinciple;
    mapped: DoctrinePrinciple;
    promotable: DoctrinePrinciple;
    enforced: DoctrinePrinciple;
    documented: DoctrinePrinciple;
  };
}

export interface BartonNumbering {
  version: string;
  lastUpdated: string;
  system: {
    name: string;
    description: string;
    format: string;
    rules: string[];
  };
  categories: Record<string, string>;
}

export interface DoctrinePrinciple {
  name: string;
  description: string;
  rules: string[];
}

export interface DoctrineValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
} 