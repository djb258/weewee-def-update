# 🚨 ORBT DOCTRINE CI/CD INTEGRATION

**Status Flag: 🟢 GREEN** - Complete CI/CD integration guide

## 🎯 SUPREME ENFORCEMENT

ORBT Doctrine is **SUPREME LAW** - no deployment can proceed without full ORBT compliance.

---

## 🔧 INTEGRATION METHODS

### Method 1: GitHub Actions (Recommended)

Add this to your `.github/workflows/deploy.yml`:

```yaml
name: Deploy with ORBT Enforcement

on:
  push:
    branches: [main, production]
  pull_request:
    branches: [main]

jobs:
  orbt-compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: ORBT Bootstrap (if needed)
        run: node orbt-bootstrap.js
        
      - name: ORBT Validation - SUPREME ENFORCEMENT
        run: node orbt-validate.js
        # Exit code 1 = deployment BLOCKED
        
      - name: ORBT Deployment Gate
        run: node orbt-deployment-gate.js
        # Exit code 1 = deployment BLOCKED
        
  deploy:
    needs: orbt-compliance
    runs-on: ubuntu-latest
    if: success() # Only runs if ORBT compliance passed
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel --prod
```

### Method 2: Vercel Pre-deploy Hook

Add to your `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "preDeployCommand": "node orbt-deployment-gate.js"
}
```

### Method 3: Custom Script Integration

Add to your `package.json`:

```json
{
  "scripts": {
    "predeploy": "node orbt-deployment-gate.js",
    "deploy": "vercel --prod",
    "orbt:check": "node orbt-validate.js",
    "orbt:bootstrap": "node orbt-bootstrap.js"
  }
}
```

---

## 🚨 ENFORCEMENT RULES

### Mandatory Checks

| Check | Description | Failure Action |
|-------|-------------|----------------|
| **ORBT Directory** | `/orbt/` must exist | Block deployment |
| **4 Manuals** | All manuals present | Block deployment |
| **Required Sections** | All sections complete | Block deployment |
| **Checklists** | All checkboxes filled | Block deployment |
| **Notes Content** | No placeholder text | Block deployment |
| **Status File** | `ORBT_STATUS.json` green | Block deployment |

### Exit Codes

| Code | Meaning | Action |
|------|---------|--------|
| **0** | ORBT compliant | Allow deployment |
| **1** | ORBT non-compliant | **BLOCK deployment** |

---

## 🔧 SETUP INSTRUCTIONS

### Step 1: Add Scripts to Repository

Copy these files to your repo root:
- `orbt-bootstrap.js`
- `orbt-validate.js` 
- `orbt-deployment-gate.js`

### Step 2: Update package.json

```json
{
  "scripts": {
    "orbt:bootstrap": "node orbt-bootstrap.js",
    "orbt:validate": "node orbt-validate.js",
    "orbt:gate": "node orbt-deployment-gate.js",
    "predeploy": "node orbt-deployment-gate.js"
  }
}
```

### Step 3: Configure CI/CD

Choose your integration method above and add the appropriate configuration.

### Step 4: Test Enforcement

```bash
# Test bootstrap
npm run orbt:bootstrap

# Test validation (should fail initially)
npm run orbt:validate

# Complete manuals and test again
npm run orbt:validate

# Test deployment gate
npm run orbt:gate
```

---

## 📋 COMPLIANCE CHECKLIST

### Before Deployment

- [ ] `/orbt/` directory exists
- [ ] All 4 manuals present:
  - [ ] `OPERATING_MANUAL.md`
  - [ ] `REPAIR_MANUAL.md`
  - [ ] `BUILD_MANUAL.md`
  - [ ] `TRAINING_MANUAL.md`
- [ ] All required sections complete
- [ ] All checklists filled (no empty checkboxes)
- [ ] All notes customized (no placeholder text)
- [ ] `ORBT_STATUS.json` shows `"status_flag": "green"`
- [ ] `orbt-validate.js` exits with code 0
- [ ] `orbt-deployment-gate.js` exits with code 0

### Manual Sections Required

#### Operating Manual
- [ ] Modules: (checklist)
- [ ] Notes: (explanation)

#### Repair Manual  
- [ ] Error Types: (checklist)
- [ ] Troubleshooting Log: (explanation)

#### Build Manual
- [ ] Build Steps: (checklist)
- [ ] Tools & Agents: (checklist)
- [ ] Notes: (explanation)

#### Training Manual
- [ ] Guides: (checklist)
- [ ] Notes: (explanation)

---

## 🚨 TROUBLESHOOTING

### Common Issues

#### "ORBT bootstrap not run"
```bash
# Solution: Run bootstrap
npm run orbt:bootstrap
```

#### "Required manual missing"
```bash
# Solution: Check /orbt/ directory
ls -la orbt/
# Re-run bootstrap if needed
npm run orbt:bootstrap
```

#### "Incomplete checklists"
```bash
# Solution: Fill all checkboxes
# Change: - [ ] to - [x] in manuals
```

#### "Notes section contains placeholder text"
```bash
# Solution: Customize all notes sections
# Remove: (Explain how...), (Describe how...), etc.
```

#### "ORBT validation failed"
```bash
# Solution: Fix all violations and re-run
npm run orbt:validate
```

---

## 🔒 SECURITY CONSIDERATIONS

### Environment Variables

Set these in your CI/CD environment:

```bash
# GitHub Actions Secrets
ORBT_ENFORCEMENT=true
ORBT_STRICT_MODE=true

# Vercel Environment Variables  
ORBT_COMPLIANCE_REQUIRED=true
```

### Access Control

- Only authorized users can bypass ORBT enforcement
- All bypasses must be logged and reviewed
- ORBT compliance is audited regularly

---

## 📊 MONITORING

### Compliance Dashboard

Track ORBT compliance across all repositories:

```bash
# Generate compliance report
npm run orbt:report

# Check compliance status
cat orbt/ORBT_STATUS.json
```

### Metrics to Track

- Number of deployments blocked by ORBT
- Time to achieve ORBT compliance
- Violation types and frequency
- Compliance improvement over time

---

## 🎯 BEST PRACTICES

### Development Workflow

1. **Start new project**: Run `npm run orbt:bootstrap`
2. **During development**: Update manuals as system evolves
3. **Before deployment**: Run `npm run orbt:validate`
4. **Deploy only when**: Status is green

### Documentation Maintenance

- Keep manuals updated with system changes
- Review compliance monthly
- Update checklists as features are added
- Maintain clear, actionable notes

### Team Training

- Train all developers on ORBT requirements
- Include ORBT compliance in code reviews
- Make ORBT part of onboarding process
- Regular compliance audits

---

**🚨 ORBT DOCTRINE IS SUPREME LAW - NO EXCEPTIONS** 