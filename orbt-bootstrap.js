#!/usr/bin/env node

/**
 * ORBT Doctrine Bootstrap Script
 *
 * Usage: node orbt-bootstrap.js
 *
 * - Creates /orbt/ directory at repo root if missing
 * - Injects 4 standard manuals (Operating, Repair, Build, Training) if missing
 * - Sets up compliance flags
 * - Idempotent: safe to run multiple times
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ORBT_DIR = path.join(process.cwd(), 'orbt');
const MANUALS = [
  {
    file: 'OPERATING_MANUAL.md',
    title: 'Operating Manual',
    template: `# OPERATING MANUAL\nOverview of system operation and flow.\n\n## Modules:\n- [ ] Module 1\n- [ ] Module 2\n\n## Notes:\n(Explain how the app is expected to run)\n`
  },
  {
    file: 'REPAIR_MANUAL.md',
    title: 'Repair Manual',
    template: `# REPAIR MANUAL\nOverview of troubleshooting, error logging, and repair flow.\n\n## Error Types:\n- [ ] Error Type 1\n- [ ] Error Type 2\n\n## Troubleshooting Log:\n(Describe how errors are tracked and resolved)\n`
  },
  {
    file: 'BUILD_MANUAL.md',
    title: 'Build Manual',
    template: `# BUILD MANUAL\nOverview of system construction, tools, and dependencies.\n\n## Build Steps:\n- [ ] Step 1\n- [ ] Step 2\n\n## Tools & Agents:\n- [ ] Tool/Agent 1\n- [ ] Tool/Agent 2\n\n## Notes:\n(Explain how the app was built and what is required to rebuild)\n`
  },
  {
    file: 'TRAINING_MANUAL.md',
    title: 'Training Manual',
    template: `# TRAINING MANUAL\nHow-to guides and explanations for users and maintainers.\n\n## Guides:\n- [ ] Getting Started\n- [ ] Common Tasks\n- [ ] Troubleshooting\n\n## Notes:\n(Explain in layman's terms how to use, maintain, or extend the system)\n`
  }
];

function ensureOrbtDirectory() {
  if (!fs.existsSync(ORBT_DIR)) {
    fs.mkdirSync(ORBT_DIR);
    console.log('✅ Created /orbt/ directory');
  } else {
    console.log('ℹ️  /orbt/ directory already exists');
  }
}

function injectManuals() {
  let allPresent = true;
  MANUALS.forEach(manual => {
    const manualPath = path.join(ORBT_DIR, manual.file);
    if (!fs.existsSync(manualPath)) {
      fs.writeFileSync(manualPath, manual.template, 'utf8');
      console.log(`✅ Injected ${manual.title}`);
      allPresent = false;
    } else {
      console.log(`ℹ️  ${manual.title} already exists`);
    }
  });
  return allPresent;
}

function writeComplianceStatus(allManualsPresent) {
  const status = {
    status_flag: allManualsPresent ? 'yellow' : 'yellow',
    message: allManualsPresent
      ? 'Legacy repo: ORBT manuals present, please review and customize.'
      : 'ORBT manuals injected, please complete customization for full compliance.'
  };
  fs.writeFileSync(
    path.join(ORBT_DIR, 'ORBT_STATUS.json'),
    JSON.stringify(status, null, 2),
    'utf8'
  );
  console.log('✅ ORBT compliance status written to /orbt/ORBT_STATUS.json');
}

function main() {
  console.log('🚀 ORBT Doctrine Bootstrap Initiated');
  ensureOrbtDirectory();
  const allManualsPresent = injectManuals();
  writeComplianceStatus(allManualsPresent);
  console.log('\n🟡 Repo flagged as YELLOW until all manuals are fully customized and reviewed.');
  console.log('Please edit the manuals in /orbt/ and update status to GREEN when complete.');
}

main(); 