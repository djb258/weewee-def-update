# Machine Setup System

## Overview

The Machine Setup System provides a comprehensive, automated way to configure any machine for SOP library development. It installs all dependencies, configures YOLO mode, sets up development tools, and ensures consistency across all development environments.

## 🚀 Quick Start

### For New Machines
```bash
# Clone the repository
git clone <your-repo-url>
cd sop-library

# Run full setup (recommended)
npm run setup:full

# Or run basic setup
npm run setup:run
```

### For Existing Machines
```bash
# Quick setup (skip tests and VSCode)
npm run setup:quick

# Update dependencies only
npm install
npm run yolo:enable
```

## 📋 What Gets Installed & Configured

### ✅ Core Dependencies
- **Node.js** (v18+)
- **npm** packages from package.json
- **TypeScript** and **tsx** for development
- **Zod** for schema validation
- **Mermaid** for diagrams

### 🚀 YOLO Mode
- **YOLO mode enabled** by default
- **Auto-approval** for changes
- **Safety checks bypassed** for rapid development
- **Configurable risk levels**

### 🧪 Testing Framework
- **Monte Carlo Breaker** for stress testing
- **App Stress Tester** for endpoint testing
- **Zod schema validation** testing
- **Performance benchmarking**

### 🔧 Development Tools
- **VSCode extensions** and settings
- **Git configuration** and hooks
- **Docker setup** (optional)
- **ESLint** and **Prettier** configuration

### 📊 Monitoring & Reporting
- **Setup reports** for each machine
- **Test result tracking**
- **Performance metrics**
- **Failure analysis**

## 🎯 Setup Commands

### Basic Setup
```bash
npm run setup:run
```
- Installs dependencies
- Enables YOLO mode
- Configures git
- Sets up VSCode
- Runs initial tests

### Quick Setup
```bash
npm run setup:quick
```
- Installs dependencies only
- Enables YOLO mode
- Skips tests and VSCode setup
- Fast setup for experienced developers

### Full Setup
```bash
npm run setup:full
```
- Everything from basic setup
- Docker configuration
- Auto-commit changes
- Comprehensive testing

### Custom Setup
```bash
# Manual setup with options
tsx scripts/setup-machine.ts run --docker --auto-commit --no-tests
```

## 🔧 Setup Options

### Command Line Flags
```bash
--no-yolo       # Skip YOLO mode setup
--no-deps       # Skip dependency installation
--no-git        # Skip git configuration
--no-vscode     # Skip VSCode setup
--docker        # Include Docker setup
--no-tests      # Skip initial tests
--auto-commit   # Auto-commit setup changes
```

### Configuration File
Create `setup-config.json` for custom configuration:
```json
{
  "projectName": "my-sop-library",
  "nodeVersion": "18.0.0",
  "enableYolo": true,
  "installDependencies": true,
  "setupGit": true,
  "setupVSCode": true,
  "setupDocker": false,
  "runTests": true,
  "autoCommit": false
}
```

## 📊 Setup Reports

### Generated Files
- `setup-report.json` - Detailed setup results
- `setup-log.json` - Machine-specific information
- `MACHINE-README.md` - Quick reference guide

### Report Structure
```json
{
  "config": { /* setup configuration */ },
  "steps": [
    {
      "name": "Check Prerequisites",
      "success": true,
      "duration": 150
    }
  ],
  "summary": {
    "totalSteps": 9,
    "successfulSteps": 9,
    "failedSteps": 0,
    "totalDuration": 45000
  },
  "recommendations": [
    "🎉 Setup completed successfully!",
    "🚀 Ready to start development with YOLO mode"
  ]
}
```

## 🖥️ Machine Requirements

### Minimum Requirements
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher
- **Git**: v2.20.0 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space

### Recommended Setup
- **OS**: Latest LTS version
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: v2.30.0 or higher
- **RAM**: 16GB or higher
- **Storage**: 10GB free space
- **VSCode**: Latest version

## 🔄 Repository Sync

### Keeping Machines Updated
```bash
# Pull latest changes
npm run git:pull

# Run setup to update dependencies
npm run setup:run

# Verify everything works
npm run montecarlo:quick
```

### Multi-Machine Development
1. **Primary Machine**: Run full setup
2. **Secondary Machines**: Run quick setup
3. **CI/CD**: Run automated setup
4. **Production**: Skip YOLO mode

## 🛠️ Troubleshooting

### Common Issues

#### Node.js Version Issues
```bash
# Check Node.js version
node --version

# Install Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install correct Node.js version
nvm install 18
nvm use 18
```

#### Permission Issues
```bash
# Fix npm permissions
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config

# Or use npx for global packages
npx tsx scripts/setup-machine.ts run
```

#### Git Configuration Issues
```bash
# Configure git user
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

#### YOLO Mode Issues
```bash
# Check YOLO status
npm run yolo:status

# Re-enable YOLO mode
npm run yolo:enable

# Reset YOLO configuration
rm config/yolo-config.json
npm run yolo:enable
```

### Debug Mode
```bash
# Enable verbose logging
export YOLO_DEBUG_LEVEL=verbose
npm run setup:run

# Check setup logs
cat setup-report.json
cat setup-log.json
```

## 🚀 Advanced Configuration

### Custom VSCode Extensions
Edit `.vscode/extensions.json`:
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "your-custom-extension"
  ]
}
```

### Custom Git Hooks
Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
npm run montecarlo:quick
```

### Docker Configuration
Edit `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - YOLO_MODE_ENABLED=true
```

## 📈 Performance Optimization

### Fast Setup Tips
1. **Use npm cache**: `npm config set cache ~/.npm-cache`
2. **Skip optional dependencies**: `npm install --no-optional`
3. **Use quick setup**: `npm run setup:quick`
4. **Parallel installation**: `npm install --maxsockets 8`

### Development Performance
1. **Enable YOLO mode**: Faster development cycles
2. **Use Monte Carlo testing**: Find issues early
3. **Monitor performance**: Track response times
4. **Optimize dependencies**: Regular cleanup

## 🔒 Security Considerations

### Development vs Production
- **Development**: YOLO mode enabled, full testing
- **Staging**: YOLO mode disabled, limited testing
- **Production**: No YOLO mode, minimal testing

### Environment Variables
```bash
# Development
YOLO_MODE_ENABLED=true
NODE_ENV=development

# Production
YOLO_MODE_ENABLED=false
NODE_ENV=production
```

## 📚 Related Documentation

- [YOLO Mode Configuration](./YOLO_MODE.md)
- [Monte Carlo Testing](./MONTE_CARLO_TESTING.md)
- [SOP Library Development](./SOP_LIBRARY.md)
- [Git Management](./GIT_MANAGEMENT.md)
- [VSCode Setup](./VSCODE_SETUP.md)

## 🤝 Contributing

### Adding New Setup Steps
1. Add step to `SetupStep[]` array
2. Implement step execution method
3. Update documentation
4. Test on multiple machines

### Reporting Issues
1. Check setup logs: `cat setup-report.json`
2. Verify prerequisites: `node --version && npm --version`
3. Try quick setup: `npm run setup:quick`
4. Report with machine details

### Best Practices
1. **Test on clean machines** before deploying
2. **Document custom configurations**
3. **Keep setup scripts updated**
4. **Monitor setup success rates** 