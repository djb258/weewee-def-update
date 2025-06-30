import { google } from 'googleapis';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// 🔒 MANDATORY: Barton Doctrine enforcement
import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';


// Google Workspace Configuration Schema
export const GoogleWorkspaceConfigSchema = z.object({
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUri: z.string().url(),
  refreshToken: z.string().optional(),
  scopes: z.array(z.string()).default([
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/gmail.readonly',
  ]),
});

export type GoogleWorkspaceConfig = z.infer<typeof GoogleWorkspaceConfigSchema>;

// Google Drive File Schema
export const GoogleDriveFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.string(),
  size: z.string().optional(),
  createdTime: z.string(),
  modifiedTime: z.string(),
  parents: z.array(z.string()).optional(),
  webViewLink: z.string().optional(),
  webContentLink: z.string().optional(),
});

// Google Docs Document Schema
export const GoogleDocsDocumentSchema = z.object({
  documentId: z.string(),
  title: z.string(),
  body: z.object({
    content: z.array(z.any()),
  }),
  revisionId: z.string(),
  suggestionsViewMode: z.string().optional(),
});

// Google Sheets Spreadsheet Schema
export const GoogleSheetsSpreadsheetSchema = z.object({
  spreadsheetId: z.string(),
  properties: z.object({
    title: z.string(),
    locale: z.string().optional(),
    timeZone: z.string().optional(),
  }),
  sheets: z.array(z.object({
    properties: z.object({
      sheetId: z.number(),
      title: z.string(),
      index: z.number(),
    }),
  })),
});

// Google Calendar Event Schema
export const GoogleCalendarEventSchema = z.object({
  id: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  start: z.object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
    timeZone: z.string().optional(),
  }),
  end: z.object({
    dateTime: z.string().optional(),
    date: z.string().optional(),
    timeZone: z.string().optional(),
  }),
  attendees: z.array(z.object({
    email: z.string(),
    displayName: z.string().optional(),
    responseStatus: z.string().optional(),
  })).optional(),
  location: z.string().optional(),
  status: z.string().optional(),
});


// 🔒 MANDATORY: Initialize Barton Doctrine (CANNOT BE SKIPPED)
const doctrine = START_WITH_BARTON_DOCTRINE('google_workspace');

export class GoogleWorkspaceIntegration {
  private config: GoogleWorkspaceConfig;
  private auth: any;
  private drive: any;
  private docs: any;
  private sheets: any;
  private calendar: any;
  private gmail: any;

  constructor(config: GoogleWorkspaceConfig) {
    this.config = GoogleWorkspaceConfigSchema.parse(config);
    this.initializeAuth();
  }

  /**
   * Initialize Google OAuth2 authentication
   */
  private initializeAuth(): void {
    const oauth2Client = new google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    );

    if (this.config.refreshToken) {
      oauth2Client.setCredentials({
        refresh_token: this.config.refreshToken,
      });
    }

    this.auth = oauth2Client;
    this.initializeServices();
  }

  /**
   * Initialize Google Workspace services
   */
  private initializeServices(): void {
    this.drive = google.drive({ version: 'v3', auth: this.auth });
    this.docs = google.docs({ version: 'v1', auth: this.auth });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
    this.gmail = google.gmail({ version: 'v1', auth: this.auth });
  }

  /**
   * Generate OAuth2 authorization URL
   */
  generateAuthUrl(): string {
    const oauth2Client = new google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    );

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.scopes,
      prompt: 'consent',
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    scope: string;
    token_type: string;
    expiry_date: number;
  }> {
    const oauth2Client = new google.auth.OAuth2(
      this.config.clientId,
      this.config.clientSecret,
      this.config.redirectUri
    );

    const { tokens } = await oauth2Client.getToken(code);
    return tokens as any;
  }

  /**
   * Google Drive Operations
   */
  async listFiles(query?: string): Promise<GoogleDriveFileSchema[]> {
    try {
      const response = await this.drive.files.list({
        pageSize: 100,
        fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink, webContentLink)',
        q: query,
      });

      return response.data.files?.map(file => GoogleDriveFileSchema.parse(file)) || [];
    } catch (error) {
      throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadFile(filePath: string, fileName?: string, folderId?: string): Promise<GoogleDriveFileSchema> {
    try {
      const fileMetadata = {
        name: fileName || path.basename(filePath),
        parents: folderId ? [folderId] : undefined,
      };

      const media = {
        mimeType: this.getMimeType(filePath),
        body: fs.createReadStream(filePath),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink, webContentLink',
      });

      return GoogleDriveFileSchema.parse(response.data);
    } catch (error) {
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async downloadFile(fileId: string, outputPath: string): Promise<void> {
    try {
      const response = await this.drive.files.get({
        fileId: fileId,
        alt: 'media',
      }, { responseType: 'stream' });

      const writer = fs.createWriteStream(outputPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createFolder(folderName: string, parentFolderId?: string): Promise<GoogleDriveFileSchema> {
    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : undefined,
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name, mimeType, createdTime, modifiedTime, parents',
      });

      return GoogleDriveFileSchema.parse(response.data);
    } catch (error) {
      throw new Error(`Failed to create folder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Google Docs Operations
   */
  async createDocument(title: string): Promise<GoogleDocsDocumentSchema> {
    try {
      const response = await this.docs.documents.create({
        requestBody: {
          title: title,
        },
      });

      return GoogleDocsDocumentSchema.parse(response.data);
    } catch (error) {
      throw new Error(`Failed to create document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDocument(documentId: string): Promise<GoogleDocsDocumentSchema> {
    try {
      const response = await this.docs.documents.get({
        documentId: documentId,
      });

      return GoogleDocsDocumentSchema.parse(response.data);
    } catch (error) {
      throw new Error(`Failed to get document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateDocument(documentId: string, requests: any[]): Promise<void> {
    try {
      await this.docs.documents.batchUpdate({
        documentId: documentId,
        requestBody: {
          requests: requests,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Google Sheets Operations
   */
  async createSpreadsheet(title: string): Promise<GoogleSheetsSpreadsheetSchema> {
    try {
      const response = await this.sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: title,
          },
        },
      });

      return GoogleSheetsSpreadsheetSchema.parse(response.data);
    } catch (error) {
      throw new Error(`Failed to create spreadsheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSpreadsheet(spreadsheetId: string): Promise<GoogleSheetsSpreadsheetSchema> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: spreadsheetId,
      });

      return GoogleSheetsSpreadsheetSchema.parse(response.data);
    } catch (error) {
      throw new Error(`Failed to get spreadsheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateSheet(spreadsheetId: string, range: string, values: any[][]): Promise<void> {
    try {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        requestBody: {
          values: values,
        },
      });
    } catch (error) {
      throw new Error(`Failed to update sheet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSheetValues(spreadsheetId: string, range: string): Promise<any[][]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range,
      });

      return response.data.values || [];
    } catch (error) {
      throw new Error(`Failed to get sheet values: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Google Calendar Operations
   */
  async listEvents(calendarId: string = 'primary', timeMin?: string, timeMax?: string): Promise<GoogleCalendarEventSchema[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: calendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax: timeMax,
        maxResults: 100,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items?.map(event => GoogleCalendarEventSchema.parse(event)) || [];
    } catch (error) {
      throw new Error(`Failed to list events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createEvent(calendarId: string, event: Partial<GoogleCalendarEventSchema>): Promise<GoogleCalendarEventSchema> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: calendarId,
        requestBody: event,
      });

      return GoogleCalendarEventSchema.parse(response.data);
    } catch (error) {
      throw new Error(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateEvent(calendarId: string, eventId: string, event: Partial<GoogleCalendarEventSchema>): Promise<GoogleCalendarEventSchema> {
    try {
      const response = await this.calendar.events.update({
        calendarId: calendarId,
        eventId: eventId,
        requestBody: event,
      });

      return GoogleCalendarEventSchema.parse(response.data);
    } catch (error) {
      throw new Error(`Failed to update event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: calendarId,
        eventId: eventId,
      });
    } catch (error) {
      throw new Error(`Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gmail Operations
   */
  async listMessages(query?: string, maxResults: number = 100): Promise<any[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: maxResults,
      });

      return response.data.messages || [];
    } catch (error) {
      throw new Error(`Failed to list messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMessage(messageId: string): Promise<any> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Utility Methods
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.zip': 'application/zip',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    services: Record<string, boolean>;
    errors: string[];
  }> {
    const services: Record<string, boolean> = {};
    const errors: string[] = [];

    try {
      // Test Drive
      await this.drive.files.list({ pageSize: 1 });
      services.drive = true;
    } catch (error) {
      services.drive = false;
      errors.push(`Drive: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      // Test Calendar
      await this.calendar.calendarList.list({ maxResults: 1 });
      services.calendar = true;
    } catch (error) {
      services.calendar = false;
      errors.push(`Calendar: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      // Test Gmail
      await this.gmail.users.getProfile({ userId: 'me' });
      services.gmail = true;
    } catch (error) {
      services.gmail = false;
      errors.push(`Gmail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      status: errors.length === 0 ? 'healthy' : 'unhealthy',
      services,
      errors,
    };
  }

  /**
   * Validate configuration
   */
  validateConfig(): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (!this.config.clientId) {
      issues.push('Client ID is required');
    }

    if (!this.config.clientSecret) {
      issues.push('Client Secret is required');
    }

    if (!this.config.redirectUri) {
      issues.push('Redirect URI is required');
    }

    if (!this.config.refreshToken) {
      issues.push('Refresh token is required for API access');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const configPath = process.argv[3] || 'google-workspace-config.json';

  if (!fs.existsSync(configPath)) {
    console.log('Creating Google Workspace configuration template...');
    const template = {
      clientId: 'your-google-client-id',
      clientSecret: 'your-google-client-secret',
      redirectUri: 'http://localhost:3000/auth/callback',
      refreshToken: 'your-refresh-token',
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
    };
    fs.writeFileSync(configPath, JSON.stringify(template, null, 2));
    console.log(`Configuration template created at ${configPath}`);
    console.log('Please edit the configuration file and run the command again.');
    process.exit(0);
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const googleWorkspace = new GoogleWorkspaceIntegration(config);

    switch (command) {
      case 'auth':
        console.log('Authorization URL:', googleWorkspace.generateAuthUrl());
        console.log('Please visit this URL and authorize the application.');
        break;

      case 'health':
        googleWorkspace.healthCheck()
          .then(result => {
            console.log('Health Check Result:', result);
            process.exit(result.status === 'healthy' ? 0 : 1);
          })
          .catch(error => {
            console.error('Health check failed:', error);
            process.exit(1);
          });
        break;

      case 'validate':
        const validation = googleWorkspace.validateConfig();
        console.log('Configuration Validation:', validation);
        process.exit(validation.isValid ? 0 : 1);
        break;

      case 'drive':
        const driveCommand = process.argv[3];
        switch (driveCommand) {
          case 'list':
            googleWorkspace.listFiles()
              .then(files => {
                console.log('Files:', files);
              })
              .catch(error => {
                console.error('Failed to list files:', error);
                process.exit(1);
              });
            break;
          default:
            console.log('Available drive commands: list, upload, download, create-folder');
        }
        break;

      case 'docs':
        const docsCommand = process.argv[3];
        switch (docsCommand) {
          case 'create':
            const title = process.argv[4] || 'New Document';
            googleWorkspace.createDocument(title)
              .then(doc => {
                console.log('Created document:', doc);
              })
              .catch(error => {
                console.error('Failed to create document:', error);
                process.exit(1);
              });
            break;
          default:
            console.log('Available docs commands: create, get, update');
        }
        break;

      case 'sheets':
        const sheetsCommand = process.argv[3];
        switch (sheetsCommand) {
          case 'create':
            const title = process.argv[4] || 'New Spreadsheet';
            googleWorkspace.createSpreadsheet(title)
              .then(sheet => {
                console.log('Created spreadsheet:', sheet);
              })
              .catch(error => {
                console.error('Failed to create spreadsheet:', error);
                process.exit(1);
              });
            break;
          default:
            console.log('Available sheets commands: create, get, update, get-values');
        }
        break;

      case 'calendar':
        const calendarCommand = process.argv[3];
        switch (calendarCommand) {
          case 'list':
            googleWorkspace.listEvents()
              .then(events => {
                console.log('Events:', events);
              })
              .catch(error => {
                console.error('Failed to list events:', error);
                process.exit(1);
              });
            break;
          default:
            console.log('Available calendar commands: list, create, update, delete');
        }
        break;

      default:
        console.log('Usage:');
        console.log('  node google_workspace_integration.js auth');
        console.log('  node google_workspace_integration.js health');
        console.log('  node google_workspace_integration.js validate');
        console.log('  node google_workspace_integration.js drive list');
        console.log('  node google_workspace_integration.js docs create [title]');
        console.log('  node google_workspace_integration.js sheets create [title]');
        console.log('  node google_workspace_integration.js calendar list');
        process.exit(1);
    }
  } catch (error) {
    console.error('Failed to load configuration:', error);
    process.exit(1);
  }
} 