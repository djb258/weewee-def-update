# 🚨 ORBT SYSTEM DOCTRINE

**Status Flag: 🟢 GREEN** - Complete ORBT structure implemented

## 📚 ORBT Acronym Definition

- **O = Operating System** - How the application is intended to run
- **R = Repair System** - How errors and malfunctions are logged, diagnosed, and corrected  
- **B = Build System** - How the application was constructed, including schema, tools, and agents used
- **T = Training System** - What others need to understand how to use, maintain, or extend the system

---

## 🧩 ORBT DOCTRINE REQUIREMENTS

### 1. **Every application must include:**
- ✅ **Operating Manual** (overview, modules, flow)
- ✅ **Repair Manual** (troubleshooting log + known issues + fix history)
- ✅ **Build Manual** (blueprint, agents/tools, dependencies)
- ✅ **Training Manual** (how-to guides + explanations in layman's terms)

### 2. **All output must be validated against the ORBT schema:**
- 🔴 `status_flag: red` - Missing or incorrectly structured output
- 🟡 `status_flag: yellow` - Partial/structural issues
- 🟢 `status_flag: green` - Fully valid output

### 3. **Visual + human-readable documentation required at every level:**
- **30k ft**: App overview (pages/modules)
- **20k ft**: Diagram + clickable visual of modules
- **10k ft**: Module-level logic w/ code + human explanations
- **5k ft**: File-level detail (code breakdown + commentary)
- 🧠 Output must be understandable by non-engineers

### 4. **Every app must track errors via:**
- `error_log` (for live apps)
- `troubleshooting_log` (for Microscope Mode / early development)
- Every error is tagged with `status_flag`, `error_type`, and human-readable message

### 5. **Yellow flags promoted to red after 3 repeat errors of same type**

---

## 🔄 SYSTEM USE

This doctrine must be enforced on:
- ✅ Every new repo and app build
- ✅ Every blueprint execution
- ✅ Every validator run
- ✅ Every Mantis agent check
- ✅ Every dashboard visual

---

## 📋 ORBT MANUALS INDEX

### 📖 Operating Manual
- [System Overview](./ORBT_OPERATING_MANUAL.md) - 30k ft view
- [Module Architecture](./ORBT_OPERATING_MANUAL.md#module-architecture) - 20k ft view
- [Data Flow Diagrams](./ORBT_OPERATING_MANUAL.md#data-flow) - 10k ft view
- [API Endpoints](./ORBT_OPERATING_MANUAL.md#api-endpoints) - 5k ft view

### 🔧 Repair Manual
- [Troubleshooting Log](./ORBT_REPAIR_MANUAL.md) - Live error tracking
- [Known Issues](./ORBT_REPAIR_MANUAL.md#known-issues) - Documented problems
- [Fix History](./ORBT_REPAIR_MANUAL.md#fix-history) - Resolution timeline
- [Error Patterns](./ORBT_REPAIR_MANUAL.md#error-patterns) - Common failure modes

### 🏗️ Build Manual
- [Blueprint Schema](./ORBT_BUILD_MANUAL.md) - System construction
- [Tools & Agents](./ORBT_BUILD_MANUAL.md#tools-and-agents) - Build components
- [Dependencies](./ORBT_BUILD_MANUAL.md#dependencies) - External requirements
- [Deployment Process](./ORBT_BUILD_MANUAL.md#deployment) - Release pipeline

### 🎓 Training Manual
- [Getting Started](./ORBT_TRAINING_MANUAL.md) - New user guide
- [Common Tasks](./ORBT_TRAINING_MANUAL.md#common-tasks) - Daily operations
- [Troubleshooting Guide](./ORBT_TRAINING_MANUAL.md#troubleshooting) - Problem solving
- [Advanced Features](./ORBT_TRAINING_MANUAL.md#advanced-features) - Power user guide

---

## 🎯 ORBT COMPLIANCE STATUS

| Component | Status | Last Updated | Notes |
|-----------|--------|--------------|-------|
| Operating Manual | 🟢 GREEN | 2025-01-01 | Complete with diagrams |
| Repair Manual | 🟢 GREEN | 2025-01-01 | Error tracking active |
| Build Manual | 🟢 GREEN | 2025-01-01 | Blueprint documented |
| Training Manual | 🟢 GREEN | 2025-01-01 | User guides complete |
| Error Logging | 🟢 GREEN | 2025-01-01 | Live tracking enabled |
| Visual Documentation | 🟢 GREEN | 2025-01-01 | Diagrams included |

---

## 🚀 QUICK ACCESS

### For Developers
```bash
# View system status
npm run orbt:status

# Check compliance
npm run orbt:compliance

# Generate documentation
npm run orbt:docs
```

### For Users
- [Quick Start Guide](./ORBT_TRAINING_MANUAL.md#quick-start)
- [Common Issues](./ORBT_REPAIR_MANUAL.md#common-issues)
- [System Overview](./ORBT_OPERATING_MANUAL.md#overview)

### For Operators
- [Deployment Guide](./ORBT_BUILD_MANUAL.md#deployment)
- [Monitoring Setup](./ORBT_OPERATING_MANUAL.md#monitoring)
- [Backup Procedures](./ORBT_OPERATING_MANUAL.md#backup)

---

**🧠 This doctrine supersedes traditional file-based doc systems — the system *is* the documentation.** 