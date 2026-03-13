import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface UserProfile {
  id: string;
  name: string;
  patientId: string;
  phone: string;
  email: string;
  avatar?: string;
  createdAt: number;
}

export interface MedicalRecord {
  id: string;
  userId: string;
  type: 'bill' | 'invoice' | 'test_report' | 'appointment' | 'prescription';
  title: string;
  date: number;
  description: string;
  amount?: number;
  doctorName?: string;
  department?: string;
  status?: string;
  fileData?: string; // base64 encoded file or image
  fileType?: string;
  analysis?: string; // AI analysis result
  createdAt: number;
}

interface HospitalDB extends DBSchema {
  users: {
    key: string;
    value: UserProfile;
    indexes: { 'by-patientId': string };
  };
  records: {
    key: string;
    value: MedicalRecord;
    indexes: { 'by-userId': string; 'by-type': string };
  };
}

let dbPromise: Promise<IDBPDatabase<HospitalDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<HospitalDB>('nori-hospital-db', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('by-patientId', 'patientId');
        }
        if (!db.objectStoreNames.contains('records')) {
          const recordStore = db.createObjectStore('records', { keyPath: 'id' });
          recordStore.createIndex('by-userId', 'userId');
          recordStore.createIndex('by-type', 'type');
        }
      },
    });
  }
  return dbPromise;
};

export const dbService = {
  // Users
  async addUser(user: UserProfile) {
    const db = await initDB();
    return db.put('users', user);
  },
  async getUser(id: string) {
    const db = await initDB();
    return db.get('users', id);
  },
  async getAllUsers() {
    const db = await initDB();
    return db.getAll('users');
  },
  async deleteUser(id: string) {
    const db = await initDB();
    return db.delete('users', id);
  },

  // Records
  async addRecord(record: MedicalRecord) {
    const db = await initDB();
    return db.put('records', record);
  },
  async getRecord(id: string) {
    const db = await initDB();
    return db.get('records', id);
  },
  async getRecordsByUser(userId: string) {
    const db = await initDB();
    return db.getAllFromIndex('records', 'by-userId', userId);
  },
  async deleteRecord(id: string) {
    const db = await initDB();
    return db.delete('records', id);
  },
};
