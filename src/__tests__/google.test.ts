import { GoogleWorkspaceIntegration, GoogleWorkspaceConfigSchema } from '../../scripts/google_workspace_integration';
import { GoogleDriveFileSchema, GoogleDocsDocumentSchema, GoogleSheetsSpreadsheetSchema, GoogleCalendarEventSchema } from '../../src/schemas/blueprint-schemas';

// Mock googleapis
jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn().mockImplementation(() => ({
        setCredentials: jest.fn(),
        generateAuthUrl: jest.fn().mockReturnValue('https://accounts.google.com/oauth2/auth'),
        getToken: jest.fn().mockResolvedValue({
          tokens: {
            access_token: 'mock-access-token',
            refresh_token: 'mock-refresh-token',
            scope: 'https://www.googleapis.com/auth/drive',
            token_type: 'Bearer',
            expiry_date: Date.now() + 3600000,
          },
        }),
      })),
    },
    drive: jest.fn().mockReturnValue({
      files: {
        list: jest.fn().mockResolvedValue({
          data: {
            files: [
              {
                id: 'file1',
                name: 'test-file.txt',
                mimeType: 'text/plain',
                size: '1024',
                createdTime: '2023-01-01T00:00:00Z',
                modifiedTime: '2023-01-01T00:00:00Z',
              },
            ],
          },
        }),
        create: jest.fn().mockResolvedValue({
          data: {
            id: 'new-file-id',
            name: 'uploaded-file.txt',
            mimeType: 'text/plain',
            size: '2048',
            createdTime: '2023-01-01T00:00:00Z',
            modifiedTime: '2023-01-01T00:00:00Z',
          },
        }),
        get: jest.fn().mockResolvedValue({
          data: {
            id: 'file1',
            name: 'test-file.txt',
            mimeType: 'text/plain',
            size: '1024',
            createdTime: '2023-01-01T00:00:00Z',
            modifiedTime: '2023-01-01T00:00:00Z',
          },
        }),
      },
    }),
    docs: jest.fn().mockReturnValue({
      documents: {
        create: jest.fn().mockResolvedValue({
          data: {
            documentId: 'doc1',
            title: 'Test Document',
            body: { content: [] },
            revisionId: 'rev1',
          },
        }),
        get: jest.fn().mockResolvedValue({
          data: {
            documentId: 'doc1',
            title: 'Test Document',
            body: { content: [] },
            revisionId: 'rev1',
          },
        }),
        batchUpdate: jest.fn().mockResolvedValue({}),
      },
    }),
    sheets: jest.fn().mockReturnValue({
      spreadsheets: {
        create: jest.fn().mockResolvedValue({
          data: {
            spreadsheetId: 'sheet1',
            properties: {
              title: 'Test Spreadsheet',
              locale: 'en_US',
              timeZone: 'America/New_York',
            },
            sheets: [
              {
                properties: {
                  sheetId: 0,
                  title: 'Sheet1',
                  index: 0,
                },
              },
            ],
          },
        }),
        get: jest.fn().mockResolvedValue({
          data: {
            spreadsheetId: 'sheet1',
            properties: {
              title: 'Test Spreadsheet',
              locale: 'en_US',
              timeZone: 'America/New_York',
            },
            sheets: [
              {
                properties: {
                  sheetId: 0,
                  title: 'Sheet1',
                  index: 0,
                },
              },
            ],
          },
        }),
        values: {
          update: jest.fn().mockResolvedValue({}),
          get: jest.fn().mockResolvedValue({
            data: {
              values: [['A1', 'B1'], ['A2', 'B2']],
            },
          }),
        },
      },
    }),
    calendar: jest.fn().mockReturnValue({
      events: {
        list: jest.fn().mockResolvedValue({
          data: {
            items: [
              {
                id: 'event1',
                summary: 'Test Event',
                description: 'Test event description',
                start: {
                  dateTime: '2023-01-01T10:00:00Z',
                  timeZone: 'America/New_York',
                },
                end: {
                  dateTime: '2023-01-01T11:00:00Z',
                  timeZone: 'America/New_York',
                },
                status: 'confirmed',
              },
            ],
          },
        }),
        insert: jest.fn().mockResolvedValue({
          data: {
            id: 'new-event-id',
            summary: 'New Event',
            start: {
              dateTime: '2023-01-01T10:00:00Z',
              timeZone: 'America/New_York',
            },
            end: {
              dateTime: '2023-01-01T11:00:00Z',
              timeZone: 'America/New_York',
            },
          },
        }),
        update: jest.fn().mockResolvedValue({
          data: {
            id: 'event1',
            summary: 'Updated Event',
            start: {
              dateTime: '2023-01-01T10:00:00Z',
              timeZone: 'America/New_York',
            },
            end: {
              dateTime: '2023-01-01T11:00:00Z',
              timeZone: 'America/New_York',
            },
          },
        }),
        delete: jest.fn().mockResolvedValue({}),
      },
      calendarList: {
        list: jest.fn().mockResolvedValue({
          data: {
            items: [
              {
                id: 'primary',
                summary: 'Primary Calendar',
              },
            ],
          },
        }),
      },
    }),
    gmail: jest.fn().mockReturnValue({
      users: {
        messages: {
          list: jest.fn().mockResolvedValue({
            data: {
              messages: [
                {
                  id: 'msg1',
                  threadId: 'thread1',
                },
              ],
            },
          }),
          get: jest.fn().mockResolvedValue({
            data: {
              id: 'msg1',
              threadId: 'thread1',
              labelIds: ['INBOX'],
              snippet: 'Test email snippet',
            },
          }),
        },
        getProfile: jest.fn().mockResolvedValue({
          data: {
            emailAddress: 'test@example.com',
            messagesTotal: 100,
            threadsTotal: 50,
          },
        }),
      },
    }),
  },
}));

// Mock fs
jest.mock('fs', () => ({
  createReadStream: jest.fn().mockReturnValue({
    pipe: jest.fn().mockReturnThis(),
  }),
  createWriteStream: jest.fn().mockReturnValue({
    on: jest.fn().mockReturnThis(),
  }),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  copyFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn().mockReturnValue('test content'),
  unlinkSync: jest.fn(),
}));

// Mock path
jest.mock('path', () => ({
  extname: jest.fn().mockReturnValue('.txt'),
  basename: jest.fn().mockReturnValue('test-file.txt'),
  join: jest.fn().mockImplementation((...args) => args.join('/')),
  dirname: jest.fn().mockReturnValue('/test/dir'),
}));

describe('GoogleWorkspaceIntegration', () => {
  let googleWorkspace: GoogleWorkspaceIntegration;
  const mockConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/auth/callback',
    refreshToken: 'test-refresh-token',
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.readonly',
    ],
  };

  beforeEach(() => {
    googleWorkspace = new GoogleWorkspaceIntegration(mockConfig);
  });

  describe('Configuration', () => {
    it('should validate configuration schema', () => {
      const result = GoogleWorkspaceConfigSchema.safeParse(mockConfig);
      expect(result.success).toBe(true);
    });

    it('should reject invalid configuration', () => {
      const invalidConfig = {
        clientId: 'test-client-id',
        // Missing required fields
      };
      const result = GoogleWorkspaceConfigSchema.safeParse(invalidConfig);
      expect(result.success).toBe(false);
    });

    it('should validate configuration', () => {
      const validation = googleWorkspace.validateConfig();
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });
  });

  describe('Authentication', () => {
    it('should generate authorization URL', () => {
      const authUrl = googleWorkspace.generateAuthUrl();
      expect(authUrl).toBe('https://accounts.google.com/oauth2/auth');
    });

    it('should exchange code for tokens', async () => {
      const tokens = await googleWorkspace.exchangeCodeForTokens('test-code');
      expect(tokens).toHaveProperty('access_token');
      expect(tokens).toHaveProperty('refresh_token');
    });
  });

  describe('Google Drive Operations', () => {
    it('should list files', async () => {
      const files = await googleWorkspace.listFiles();
      expect(files).toHaveLength(1);
      expect(files[0]).toMatchObject({
        id: 'file1',
        name: 'test-file.txt',
        mimeType: 'text/plain',
      });
    });

    it('should upload file', async () => {
      const file = await googleWorkspace.uploadFile('/test/file.txt', 'test-file.txt');
      expect(file).toMatchObject({
        id: 'new-file-id',
        name: 'uploaded-file.txt',
        mimeType: 'text/plain',
      });
    });

    it('should create folder', async () => {
      const folder = await googleWorkspace.createFolder('Test Folder');
      expect(folder).toMatchObject({
        id: 'new-file-id',
        name: 'uploaded-file.txt',
        mimeType: 'application/vnd.google-apps.folder',
      });
    });

    it('should handle drive errors', async () => {
      const mockDrive = require('googleapis').google.drive();
      mockDrive.files.list.mockRejectedValueOnce(new Error('Drive API error'));

      await expect(googleWorkspace.listFiles()).rejects.toThrow('Failed to list files: Drive API error');
    });
  });

  describe('Google Docs Operations', () => {
    it('should create document', async () => {
      const doc = await googleWorkspace.createDocument('Test Document');
      expect(doc).toMatchObject({
        documentId: 'doc1',
        title: 'Test Document',
      });
    });

    it('should get document', async () => {
      const doc = await googleWorkspace.getDocument('doc1');
      expect(doc).toMatchObject({
        documentId: 'doc1',
        title: 'Test Document',
      });
    });

    it('should update document', async () => {
      await expect(googleWorkspace.updateDocument('doc1', [])).resolves.not.toThrow();
    });

    it('should handle docs errors', async () => {
      const mockDocs = require('googleapis').google.docs();
      mockDocs.documents.create.mockRejectedValueOnce(new Error('Docs API error'));

      await expect(googleWorkspace.createDocument('Test')).rejects.toThrow('Failed to create document: Docs API error');
    });
  });

  describe('Google Sheets Operations', () => {
    it('should create spreadsheet', async () => {
      const sheet = await googleWorkspace.createSpreadsheet('Test Spreadsheet');
      expect(sheet).toMatchObject({
        spreadsheetId: 'sheet1',
        properties: {
          title: 'Test Spreadsheet',
        },
      });
    });

    it('should get spreadsheet', async () => {
      const sheet = await googleWorkspace.getSpreadsheet('sheet1');
      expect(sheet).toMatchObject({
        spreadsheetId: 'sheet1',
        properties: {
          title: 'Test Spreadsheet',
        },
      });
    });

    it('should update sheet', async () => {
      await expect(googleWorkspace.updateSheet('sheet1', 'A1:B2', [['A1', 'B1'], ['A2', 'B2']])).resolves.not.toThrow();
    });

    it('should get sheet values', async () => {
      const values = await googleWorkspace.getSheetValues('sheet1', 'A1:B2');
      expect(values).toEqual([['A1', 'B1'], ['A2', 'B2']]);
    });

    it('should handle sheets errors', async () => {
      const mockSheets = require('googleapis').google.sheets();
      mockSheets.spreadsheets.create.mockRejectedValueOnce(new Error('Sheets API error'));

      await expect(googleWorkspace.createSpreadsheet('Test')).rejects.toThrow('Failed to create spreadsheet: Sheets API error');
    });
  });

  describe('Google Calendar Operations', () => {
    it('should list events', async () => {
      const events = await googleWorkspace.listEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toMatchObject({
        id: 'event1',
        summary: 'Test Event',
      });
    });

    it('should create event', async () => {
      const event = await googleWorkspace.createEvent('primary', {
        summary: 'New Event',
        start: { dateTime: '2023-01-01T10:00:00Z' },
        end: { dateTime: '2023-01-01T11:00:00Z' },
      });
      expect(event).toMatchObject({
        id: 'new-event-id',
        summary: 'New Event',
      });
    });

    it('should update event', async () => {
      const event = await googleWorkspace.updateEvent('primary', 'event1', {
        summary: 'Updated Event',
      });
      expect(event).toMatchObject({
        id: 'event1',
        summary: 'Updated Event',
      });
    });

    it('should delete event', async () => {
      await expect(googleWorkspace.deleteEvent('primary', 'event1')).resolves.not.toThrow();
    });

    it('should handle calendar errors', async () => {
      const mockCalendar = require('googleapis').google.calendar();
      mockCalendar.events.list.mockRejectedValueOnce(new Error('Calendar API error'));

      await expect(googleWorkspace.listEvents()).rejects.toThrow('Failed to list events: Calendar API error');
    });
  });

  describe('Gmail Operations', () => {
    it('should list messages', async () => {
      const messages = await googleWorkspace.listMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({
        id: 'msg1',
        threadId: 'thread1',
      });
    });

    it('should get message', async () => {
      const message = await googleWorkspace.getMessage('msg1');
      expect(message).toMatchObject({
        id: 'msg1',
        threadId: 'thread1',
        labelIds: ['INBOX'],
      });
    });
  });

  describe('Health Check', () => {
    it('should perform health check', async () => {
      const health = await googleWorkspace.healthCheck();
      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('services');
      expect(health).toHaveProperty('errors');
      expect(health.services).toHaveProperty('drive');
      expect(health.services).toHaveProperty('calendar');
      expect(health.services).toHaveProperty('gmail');
    });

    it('should handle health check errors', async () => {
      const mockDrive = require('googleapis').google.drive();
      mockDrive.files.list.mockRejectedValueOnce(new Error('Drive API error'));

      const health = await googleWorkspace.healthCheck();
      expect(health.status).toBe('unhealthy');
      expect(health.services.drive).toBe(false);
      expect(health.errors).toHaveLength(1);
    });
  });

  describe('Schema Validation', () => {
    it('should validate Google Drive file schema', () => {
      const fileData = {
        id: 'file1',
        name: 'test-file.txt',
        mimeType: 'text/plain',
        size: '1024',
        createdTime: '2023-01-01T00:00:00Z',
        modifiedTime: '2023-01-01T00:00:00Z',
      };
      const result = GoogleDriveFileSchema.safeParse(fileData);
      expect(result.success).toBe(true);
    });

    it('should validate Google Docs document schema', () => {
      const docData = {
        documentId: 'doc1',
        title: 'Test Document',
        body: { content: [] },
        revisionId: 'rev1',
      };
      const result = GoogleDocsDocumentSchema.safeParse(docData);
      expect(result.success).toBe(true);
    });

    it('should validate Google Sheets spreadsheet schema', () => {
      const sheetData = {
        spreadsheetId: 'sheet1',
        properties: {
          title: 'Test Spreadsheet',
          locale: 'en_US',
          timeZone: 'America/New_York',
        },
        sheets: [
          {
            properties: {
              sheetId: 0,
              title: 'Sheet1',
              index: 0,
            },
          },
        ],
      };
      const result = GoogleSheetsSpreadsheetSchema.safeParse(sheetData);
      expect(result.success).toBe(true);
    });

    it('should validate Google Calendar event schema', () => {
      const eventData = {
        id: 'event1',
        summary: 'Test Event',
        description: 'Test event description',
        start: {
          dateTime: '2023-01-01T10:00:00Z',
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: '2023-01-01T11:00:00Z',
          timeZone: 'America/New_York',
        },
        status: 'confirmed',
      };
      const result = GoogleCalendarEventSchema.safeParse(eventData);
      expect(result.success).toBe(true);
    });
  });
}); 