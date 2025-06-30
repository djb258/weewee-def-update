import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { z } from 'zod';

// Cursor Configuration Schema
export const CursorConfigSchema = z.object({
  settings: z.record(z.unknown()),
  keybindings: z.array(z.record(z.unknown())),
  extensions: z.array(z.string()),
  snippets: z.record(z.unknown()),
  workspaceSettings: z.record(z.unknown()).optional(),
});

export type CursorConfig = z.infer<typeof CursorConfigSchema>;

export class CursorConfigSynchronizer {
  private cursorPaths: {
    settings: string;
    keybindings: string;
    extensions: string;
    snippets: string;
    workspace: string;
  };

  constructor() {
    // Detect OS and set appropriate paths
    const platform = process.platform;
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';

    if (platform === 'win32') {
      this.cursorPaths = {
        settings: path.join(homeDir, 'AppData', 'Roaming', 'Cursor', 'User', 'settings.json'),
        keybindings: path.join(homeDir, 'AppData', 'Roaming', 'Cursor', 'User', 'keybindings.json'),
        extensions: path.join(homeDir, '.cursor', 'extensions'),
        snippets: path.join(homeDir, 'AppData', 'Roaming', 'Cursor', 'User', 'snippets'),
        workspace: path.join(homeDir, 'AppData', 'Roaming', 'Cursor', 'User', 'workspaceStorage'),
      };
    } else if (platform === 'darwin') {
      this.cursorPaths = {
        settings: path.join(homeDir, 'Library', 'Application Support', 'Cursor', 'User', 'settings.json'),
        keybindings: path.join(homeDir, 'Library', 'Application Support', 'Cursor', 'User', 'keybindings.json'),
        extensions: path.join(homeDir, '.cursor', 'extensions'),
        snippets: path.join(homeDir, 'Library', 'Application Support', 'Cursor', 'User', 'snippets'),
        workspace: path.join(homeDir, 'Library', 'Application Support', 'Cursor', 'User', 'workspaceStorage'),
      };
    } else {
      // Linux
      this.cursorPaths = {
        settings: path.join(homeDir, '.config', 'Cursor', 'User', 'settings.json'),
        keybindings: path.join(homeDir, '.config', 'Cursor', 'User', 'keybindings.json'),
        extensions: path.join(homeDir, '.cursor', 'extensions'),
        snippets: path.join(homeDir, '.config', 'Cursor', 'User', 'snippets'),
        workspace: path.join(homeDir, '.config', 'Cursor', 'User', 'workspaceStorage'),
      };
    }
  }

  /**
   * Export current Cursor configuration
   */
  async exportConfig(outputDir: string = './cursor-config'): Promise<{
    success: boolean;
    exportedFiles: string[];
    errors: string[];
  }> {
    const exportedFiles: string[] = [];
    const errors: string[] = [];

    try {
      // Create output directory
      fs.mkdirSync(outputDir, { recursive: true });

      // Export settings
      if (fs.existsSync(this.cursorPaths.settings)) {
        const settingsContent = fs.readFileSync(this.cursorPaths.settings, 'utf8');
        const settingsFile = path.join(outputDir, 'settings.json');
        fs.writeFileSync(settingsFile, settingsContent);
        exportedFiles.push(settingsFile);
      } else {
        errors.push('Settings file not found');
      }

      // Export keybindings
      if (fs.existsSync(this.cursorPaths.keybindings)) {
        const keybindingsContent = fs.readFileSync(this.cursorPaths.keybindings, 'utf8');
        const keybindingsFile = path.join(outputDir, 'keybindings.json');
        fs.writeFileSync(keybindingsFile, keybindingsContent);
        exportedFiles.push(keybindingsFile);
      } else {
        errors.push('Keybindings file not found');
      }

      // Export extensions list
      const extensions = this.getInstalledExtensions();
      const extensionsFile = path.join(outputDir, 'extensions.json');
      fs.writeFileSync(extensionsFile, JSON.stringify(extensions, null, 2));
      exportedFiles.push(extensionsFile);

      // Export snippets
      if (fs.existsSync(this.cursorPaths.snippets)) {
        const snippetsDir = path.join(outputDir, 'snippets');
        this.copyDirectory(this.cursorPaths.snippets, snippetsDir);
        exportedFiles.push(snippetsDir);
      } else {
        errors.push('Snippets directory not found');
      }

      // Export workspace settings
      if (fs.existsSync(this.cursorPaths.workspace)) {
        const workspaceDir = path.join(outputDir, 'workspaceStorage');
        this.copyDirectory(this.cursorPaths.workspace, workspaceDir);
        exportedFiles.push(workspaceDir);
      } else {
        errors.push('WorkspaceStorage directory not found');
      }

      // Create configuration summary
      const configSummary = {
        exportedAt: new Date().toISOString(),
        platform: process.platform,
        cursorPaths: this.cursorPaths,
        exportedFiles,
        errors,
      };

      const summaryFile = path.join(outputDir, 'export-summary.json');
      fs.writeFileSync(summaryFile, JSON.stringify(configSummary, null, 2));
      exportedFiles.push(summaryFile);

      return {
        success: errors.length === 0,
        exportedFiles,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        exportedFiles,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Import Cursor configuration
   */
  async importConfig(configDir: string = './cursor-config'): Promise<{
    success: boolean;
    importedFiles: string[];
    errors: string[];
  }> {
    const importedFiles: string[] = [];
    const errors: string[] = [];

    try {
      if (!fs.existsSync(configDir)) {
        throw new Error(`Configuration directory not found: ${configDir}`);
      }

      // Import settings
      const settingsFile = path.join(configDir, 'settings.json');
      if (fs.existsSync(settingsFile)) {
        const settingsContent = fs.readFileSync(settingsFile, 'utf8');
        fs.mkdirSync(path.dirname(this.cursorPaths.settings), { recursive: true });
        fs.writeFileSync(this.cursorPaths.settings, settingsContent);
        importedFiles.push('settings.json');
      } else {
        errors.push('Settings file not found in config directory');
      }

      // Import keybindings
      const keybindingsFile = path.join(configDir, 'keybindings.json');
      if (fs.existsSync(keybindingsFile)) {
        const keybindingsContent = fs.readFileSync(keybindingsFile, 'utf8');
        fs.mkdirSync(path.dirname(this.cursorPaths.keybindings), { recursive: true });
        fs.writeFileSync(this.cursorPaths.keybindings, keybindingsContent);
        importedFiles.push('keybindings.json');
      } else {
        errors.push('Keybindings file not found in config directory');
      }

      // Import extensions
      const extensionsFile = path.join(configDir, 'extensions.json');
      if (fs.existsSync(extensionsFile)) {
        const extensions = JSON.parse(fs.readFileSync(extensionsFile, 'utf8'));
        await this.installExtensions(extensions);
        importedFiles.push('extensions.json');
      } else {
        errors.push('Extensions file not found in config directory');
      }

      // Import snippets
      const snippetsDir = path.join(configDir, 'snippets');
      if (fs.existsSync(snippetsDir)) {
        fs.mkdirSync(path.dirname(this.cursorPaths.snippets), { recursive: true });
        this.copyDirectory(snippetsDir, this.cursorPaths.snippets);
        importedFiles.push('snippets');
      } else {
        errors.push('Snippets directory not found in config directory');
      }

      // Import workspace settings
      const workspaceDir = path.join(configDir, 'workspaceStorage');
      if (fs.existsSync(workspaceDir)) {
        fs.mkdirSync(path.dirname(this.cursorPaths.workspace), { recursive: true });
        this.copyDirectory(workspaceDir, this.cursorPaths.workspace);
        importedFiles.push('workspaceStorage');
      } else {
        errors.push('WorkspaceStorage directory not found in config directory');
      }

      return {
        success: errors.length === 0,
        importedFiles,
        errors,
      };
    } catch (error) {
      return {
        success: false,
        importedFiles,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Get installed extensions
   */
  private getInstalledExtensions(): string[] {
    try {
      const output = execSync('code --list-extensions', { encoding: 'utf8' });
      return output.split('\n').filter(ext => ext.trim());
    } catch (error) {
      console.warn('Failed to get installed extensions:', error);
      return [];
    }
  }

  /**
   * Install extensions
   */
  private async installExtensions(extensions: string[]): Promise<void> {
    for (const extension of extensions) {
      try {
        execSync(`code --install-extension ${extension}`, { stdio: 'pipe' });
        console.log(`Installed extension: ${extension}`);
      } catch (error) {
        console.warn(`Failed to install extension ${extension}:`, error);
      }
    }
  }

  /**
   * Copy directory recursively
   */
  private copyDirectory(source: string, target: string): void {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }

    const files = fs.readdirSync(source);
    
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const targetPath = path.join(target, file);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        this.copyDirectory(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }

  /**
   * Validate Cursor configuration
   */
  async validateConfig(): Promise<{
    isValid: boolean;
    issues: string[];
    config: CursorConfig | null;
  }> {
    const issues: string[] = [];
    let config: CursorConfig | null = null;

    try {
      // Check if settings file exists and is valid JSON
      if (fs.existsSync(this.cursorPaths.settings)) {
        const settingsContent = fs.readFileSync(this.cursorPaths.settings, 'utf8');
        const settings = JSON.parse(settingsContent);
        
        // Check for required settings
        const requiredSettings = [
          'editor.fontSize',
          'editor.fontFamily',
          'editor.tabSize',
          'editor.insertSpaces',
        ];

        for (const setting of requiredSettings) {
          if (!this.hasNestedProperty(settings, setting)) {
            issues.push(`Missing required setting: ${setting}`);
          }
        }
      } else {
        issues.push('Settings file not found');
      }

      // Check if keybindings file exists and is valid JSON
      if (fs.existsSync(this.cursorPaths.keybindings)) {
        const keybindingsContent = fs.readFileSync(this.cursorPaths.keybindings, 'utf8');
        const keybindings = JSON.parse(keybindingsContent);
        
        if (!Array.isArray(keybindings)) {
          issues.push('Keybindings file should contain an array');
        }
      } else {
        issues.push('Keybindings file not found');
      }

      // Check extensions
      const extensions = this.getInstalledExtensions();
      if (extensions.length === 0) {
        issues.push('No extensions found');
      }

      // Check workspaceStorage
      if (fs.existsSync(this.cursorPaths.workspace)) {
        // Optionally, check for at least one workspace folder
        const files = fs.readdirSync(this.cursorPaths.workspace);
        if (files.length === 0) {
          issues.push('WorkspaceStorage is empty');
        }
      } else {
        issues.push('WorkspaceStorage directory not found');
      }

      // Build config object
      config = {
        settings: fs.existsSync(this.cursorPaths.settings) 
          ? JSON.parse(fs.readFileSync(this.cursorPaths.settings, 'utf8'))
          : {},
        keybindings: fs.existsSync(this.cursorPaths.keybindings)
          ? JSON.parse(fs.readFileSync(this.cursorPaths.keybindings, 'utf8'))
          : [],
        extensions,
        snippets: fs.existsSync(this.cursorPaths.snippets)
          ? this.loadSnippets(this.cursorPaths.snippets)
          : {},
      };

      return {
        isValid: issues.length === 0,
        issues,
        config,
      };
    } catch (error) {
      return {
        isValid: false,
        issues: [error instanceof Error ? error.message : 'Unknown error'],
        config: null,
      };
    }
  }

  /**
   * Check if object has nested property
   */
  private hasNestedProperty(obj: any, path: string): boolean {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Load snippets from directory
   */
  private loadSnippets(snippetsDir: string): Record<string, unknown> {
    const snippets: Record<string, unknown> = {};
    
    if (!fs.existsSync(snippetsDir)) {
      return snippets;
    }

    const files = fs.readdirSync(snippetsDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(snippetsDir, file);
        try {
          const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          snippets[file] = content;
        } catch (error) {
          console.warn(`Failed to load snippet file ${file}:`, error);
        }
      }
    }

    return snippets;
  }

  /**
   * Get Cursor paths
   */
  getCursorPaths(): typeof this.cursorPaths {
    return { ...this.cursorPaths };
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const configDir = process.argv[3] || './cursor-config';
  
  const synchronizer = new CursorConfigSynchronizer();

  switch (command) {
    case 'export':
      synchronizer.exportConfig(configDir)
        .then(result => {
          console.log('Export result:', result);
          process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
          console.error('Export failed:', error);
          process.exit(1);
        });
      break;

    case 'import':
      synchronizer.importConfig(configDir)
        .then(result => {
          console.log('Import result:', result);
          process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
          console.error('Import failed:', error);
          process.exit(1);
        });
      break;

    case 'validate':
      synchronizer.validateConfig()
        .then(result => {
          console.log('Validation result:', result);
          process.exit(result.isValid ? 0 : 1);
        })
        .catch(error => {
          console.error('Validation failed:', error);
          process.exit(1);
        });
      break;

    case 'paths':
      console.log('Cursor paths:', synchronizer.getCursorPaths());
      break;

    default:
      console.log('Usage:');
      console.log('  node cursor_config_sync.js export [config-dir]');
      console.log('  node cursor_config_sync.js import [config-dir]');
      console.log('  node cursor_config_sync.js validate');
      console.log('  node cursor_config_sync.js paths');
      console.log('');
      console.log('Note: workspaceStorage (open editors, layout, session) is now included in export/import.');
      process.exit(1);
  }
} 