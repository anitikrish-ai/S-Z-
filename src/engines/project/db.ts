import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'css_studio_db';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const STORE_SETTINGS = 'settings';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
          db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
          db.createObjectStore(STORE_SETTINGS);
        }
      },
    });
  }
  return dbPromise;
}

export async function saveProjectToDb(project: any): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORE_PROJECTS, project);
  } catch (err) {
    console.warn('IndexedDB save failed, falling back to localStorage', err);
    try {
      localStorage.setItem(`css_studio_proj_${project.id}`, JSON.stringify(project));
    } catch (e) {
      console.error('LocalStorage save failed', e);
    }
  }
}

export async function getProjectFromDb(id: string): Promise<any | null> {
  try {
    const db = await getDb();
    const proj = await db.get(STORE_PROJECTS, id);
    if (proj) return proj;
  } catch (err) {
    console.warn('IndexedDB read failed, trying localStorage', err);
  }

  try {
    const raw = localStorage.getItem(`css_studio_proj_${id}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }

  return null;
}

export async function getAllProjectsFromDb(): Promise<any[]> {
  try {
    const db = await getDb();
    const list = await db.getAll(STORE_PROJECTS);
    if (list && list.length > 0) return list;
  } catch (err) {
    console.warn('IndexedDB getAll failed', err);
  }

  // Fallback to localStorage scan
  const fallbackList: any[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('css_studio_proj_')) {
        const val = localStorage.getItem(key);
        if (val) fallbackList.push(JSON.parse(val));
      }
    }
  } catch (e) {
    // ignore
  }
  return fallbackList;
}

export async function deleteProjectFromDb(id: string): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(STORE_PROJECTS, id);
  } catch (err) {
    console.warn('IndexedDB delete failed', err);
  }
  try {
    localStorage.removeItem(`css_studio_proj_${id}`);
  } catch (e) {
    // ignore
  }
}

