import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import {
  validateBlueprintForFirebase,
  validateAgentTask,
  validateErrorLog,
  validateHumanFirebreakQueue,
  FirebaseBlueprint,
  AgentTask,
  ErrorLog,
  HumanFirebreakQueue
} from '../src/schemas/blueprint-schemas';
import { START_WITH_BARTON_DOCTRINE } from '../src/core/mandatory-barton-doctrine';

dotenv.config({ path: './deerflow.env' });

interface FirebaseConfig {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

type PushDataType = FirebaseBlueprint | AgentTask | ErrorLog | HumanFirebreakQueue | Record<string, unknown>;

type CollectionName = 'blueprints' | 'agent_tasks' | 'error_logs' | 'human_firebreak_queue' | 'orchestration_whiteboard' | 'orchestration_summaries';

interface PushOptions {
  collection: CollectionName;
  data: PushDataType;
  documentId?: string;
  merge?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
const doctrine = START_WITH_BARTON_DOCTRINE('firebase_push'); // Barton Doctrine enforced (required for compliance)

export class FirebasePush {
  private db: admin.firestore.Firestore;
  private config: FirebaseConfig;

  constructor() {
    this.config = {
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      privateKey: process.env.FIREBASE_PRIVATE_KEY || '',
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    };

    if (!this.config.projectId || !this.config.privateKey || !this.config.clientEmail) {
      throw new Error('Firebase configuration missing. Please check environment variables.');
    }

    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.config.projectId,
          privateKey: this.config.privateKey.replace(/\\n/g, '\n'),
          clientEmail: this.config.clientEmail,
        }),
      });
    }

    this.db = admin.firestore();
  }

  async pushData(options: PushOptions): Promise<string> {
    try {
      const collectionRef = this.db.collection(options.collection);
      
      // Validate data based on collection type
      let validatedData: PushDataType;
      switch (options.collection) {
        case 'blueprints':
          validatedData = validateBlueprintForFirebase(options.data);
          break;
        case 'agent_tasks':
          validatedData = validateAgentTask(options.data);
          break;
        case 'error_logs':
          validatedData = validateErrorLog(options.data);
          break;
        case 'human_firebreak_queue':
          validatedData = validateHumanFirebreakQueue(options.data);
          break;
        case 'orchestration_whiteboard':
        case 'orchestration_summaries':
          // For orchestration collections, accept any valid object and replace undefined with null
          validatedData = this.replaceUndefinedWithNull(options.data as Record<string, unknown>);
          break;
        default:
          throw new Error(`No validation schema found for collection: ${options.collection}`);
      }
      
      let docRef: admin.firestore.DocumentReference;
      if (options.documentId) {
        docRef = collectionRef.doc(options.documentId);
        await docRef.set(validatedData, { merge: options.merge || false });
      } else {
        docRef = await collectionRef.add(validatedData);
      }

      console.log(`Data pushed successfully to ${options.collection}`);
      console.log(`Document ID: ${docRef.id}`);
      
      return docRef.id;
    } catch (error) {
      console.error('Error pushing data to Firebase:', error);
      throw error;
    }
  }

  async getDocument(collection: CollectionName, documentId: string): Promise<PushDataType> {
    try {
      const doc = await this.db.collection(collection).doc(documentId).get();
      
      if (!doc.exists) {
        throw new Error(`Document ${documentId} not found in collection ${collection}`);
      }

      return { id: doc.id, ...doc.data() } as PushDataType;
    } catch (error) {
      console.error('Error getting document from Firebase:', error);
      throw error;
    }
  }

  async queryCollection(collection: CollectionName, query?: Partial<PushDataType>): Promise<PushDataType[]> {
    try {
      let queryRef: admin.firestore.CollectionReference | admin.firestore.Query = this.db.collection(collection);
      
      if (query) {
        Object.keys(query).forEach(key => {
          const value = (query as Record<string, unknown>)[key];
          queryRef = queryRef.where(key, '==', value);
        });
      }

      const snapshot = await queryRef.get();
      const documents: PushDataType[] = [];
      
      snapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() } as PushDataType);
      });

      return documents;
    } catch (error) {
      console.error('Error querying Firebase collection:', error);
      throw error;
    }
  }

  async deleteDocument(collection: CollectionName, documentId: string): Promise<void> {
    try {
      await this.db.collection(collection).doc(documentId).delete();
      console.log(`Document ${documentId} deleted successfully from ${collection}`);
    } catch (error) {
      console.error('Error deleting document from Firebase:', error);
      throw error;
    }
  }

  private replaceUndefinedWithNull(data: Record<string, unknown>): Record<string, unknown> {
    const replacedData: Record<string, unknown> = {};
    for (const key in data) {
      if (data[key] === undefined) {
        replacedData[key] = null;
      } else {
        replacedData[key] = data[key];
      }
    }
    return replacedData;
  }
}

// Example usage
if (require.main === module) {
  const firebase = new FirebasePush();
  
  // Example data push
  const sampleData: FirebaseBlueprint = {
    id: 'bp-001',
    name: 'Test Blueprint',
    version: '1.0.0',
    status: 'active',
    author: 'Test User',
    timestamp: new Date().toISOString(),
    description: 'Test blueprint for Firebase validation',
    collection: 'blueprints'
  };

  firebase.pushData({
    collection: 'blueprints',
    data: sampleData,
  }).catch(console.error);
}