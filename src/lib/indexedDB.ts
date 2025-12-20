/**
 * IndexedDB wrapper for offline data storage
 * Supports jobs, machines, techniques, operators, and scan history
 */

const DB_NAME = 'fastgrava-offline';
const DB_VERSION = 1;

// Store names
export const STORES = {
  JOBS: 'jobs',
  MACHINES: 'machines',
  TECHNIQUES: 'techniques',
  OPERATORS: 'operators',
  SCANS: 'scans',
  PENDING_ACTIONS: 'pending_actions',
  SYNC_META: 'sync_meta',
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

// Pending action types for background sync
export interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  store: StoreName;
  data: any;
  timestamp: number;
  retryCount: number;
}

// Sync metadata
export interface SyncMeta {
  store: StoreName;
  lastSync: number;
  version: string;
}

let dbInstance: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Open or create the IndexedDB database
 */
export function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      dbPromise = null;
      reject(new Error(`Failed to open database: ${request.error?.message}`));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      
      // Handle connection close
      dbInstance.onclose = () => {
        dbInstance = null;
        dbPromise = null;
      };

      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Jobs store
      if (!db.objectStoreNames.contains(STORES.JOBS)) {
        const jobsStore = db.createObjectStore(STORES.JOBS, { keyPath: 'id' });
        jobsStore.createIndex('status', 'status', { unique: false });
        jobsStore.createIndex('technique_id', 'technique_id', { unique: false });
        jobsStore.createIndex('machine_id', 'machine_id', { unique: false });
        jobsStore.createIndex('scheduled_date', 'scheduled_date', { unique: false });
        jobsStore.createIndex('order_number', 'order_number', { unique: false });
      }

      // Machines store
      if (!db.objectStoreNames.contains(STORES.MACHINES)) {
        const machinesStore = db.createObjectStore(STORES.MACHINES, { keyPath: 'id' });
        machinesStore.createIndex('technique_id', 'technique_id', { unique: false });
        machinesStore.createIndex('is_active', 'is_active', { unique: false });
      }

      // Techniques store
      if (!db.objectStoreNames.contains(STORES.TECHNIQUES)) {
        const techniquesStore = db.createObjectStore(STORES.TECHNIQUES, { keyPath: 'id' });
        techniquesStore.createIndex('is_active', 'is_active', { unique: false });
      }

      // Operators store
      if (!db.objectStoreNames.contains(STORES.OPERATORS)) {
        const operatorsStore = db.createObjectStore(STORES.OPERATORS, { keyPath: 'id' });
        operatorsStore.createIndex('is_active', 'is_active', { unique: false });
      }

      // Scans store (local scan history)
      if (!db.objectStoreNames.contains(STORES.SCANS)) {
        const scansStore = db.createObjectStore(STORES.SCANS, { keyPath: 'id' });
        scansStore.createIndex('job_id', 'job_id', { unique: false });
        scansStore.createIndex('timestamp', 'timestamp', { unique: false });
        scansStore.createIndex('synced', 'synced', { unique: false });
      }

      // Pending actions for background sync
      if (!db.objectStoreNames.contains(STORES.PENDING_ACTIONS)) {
        const pendingStore = db.createObjectStore(STORES.PENDING_ACTIONS, { keyPath: 'id' });
        pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
        pendingStore.createIndex('store', 'store', { unique: false });
      }

      // Sync metadata
      if (!db.objectStoreNames.contains(STORES.SYNC_META)) {
        db.createObjectStore(STORES.SYNC_META, { keyPath: 'store' });
      }
    };
  });

  return dbPromise;
}

/**
 * Get a single item from a store
 */
export async function getItem<T>(store: StoreName, id: string): Promise<T | null> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readonly');
    const objectStore = transaction.objectStore(store);
    const request = objectStore.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(new Error(`Failed to get item: ${request.error?.message}`));
  });
}

/**
 * Get all items from a store
 */
export async function getAllItems<T>(store: StoreName): Promise<T[]> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readonly');
    const objectStore = transaction.objectStore(store);
    const request = objectStore.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error(`Failed to get all items: ${request.error?.message}`));
  });
}

/**
 * Get items by index
 */
export async function getItemsByIndex<T>(
  store: StoreName,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readonly');
    const objectStore = transaction.objectStore(store);
    const index = objectStore.index(indexName);
    const request = index.getAll(value);

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error(`Failed to get items by index: ${request.error?.message}`));
  });
}

/**
 * Put (upsert) a single item
 */
export async function putItem<T extends { id: string }>(store: StoreName, item: T): Promise<T> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readwrite');
    const objectStore = transaction.objectStore(store);
    const request = objectStore.put(item);

    request.onsuccess = () => resolve(item);
    request.onerror = () => reject(new Error(`Failed to put item: ${request.error?.message}`));
  });
}

/**
 * Put multiple items in a single transaction
 */
export async function putItems<T extends { id: string }>(store: StoreName, items: T[]): Promise<void> {
  if (items.length === 0) return;
  
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readwrite');
    const objectStore = transaction.objectStore(store);

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error(`Failed to put items: ${transaction.error?.message}`));

    items.forEach(item => {
      objectStore.put(item);
    });
  });
}

/**
 * Delete a single item
 */
export async function deleteItem(store: StoreName, id: string): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readwrite');
    const objectStore = transaction.objectStore(store);
    const request = objectStore.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to delete item: ${request.error?.message}`));
  });
}

/**
 * Clear all items from a store
 */
export async function clearStore(store: StoreName): Promise<void> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readwrite');
    const objectStore = transaction.objectStore(store);
    const request = objectStore.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to clear store: ${request.error?.message}`));
  });
}

/**
 * Count items in a store
 */
export async function countItems(store: StoreName): Promise<number> {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readonly');
    const objectStore = transaction.objectStore(store);
    const request = objectStore.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Failed to count items: ${request.error?.message}`));
  });
}

// ============ PENDING ACTIONS (Background Sync Queue) ============

/**
 * Add a pending action to the sync queue
 */
export async function addPendingAction(
  type: PendingAction['type'],
  store: StoreName,
  data: any
): Promise<PendingAction> {
  const action: PendingAction = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    store,
    data,
    timestamp: Date.now(),
    retryCount: 0,
  };

  await putItem(STORES.PENDING_ACTIONS, action);
  return action;
}

/**
 * Get all pending actions ordered by timestamp
 */
export async function getPendingActions(): Promise<PendingAction[]> {
  const actions = await getAllItems<PendingAction>(STORES.PENDING_ACTIONS);
  return actions.sort((a, b) => a.timestamp - b.timestamp);
}

/**
 * Remove a pending action after successful sync
 */
export async function removePendingAction(id: string): Promise<void> {
  await deleteItem(STORES.PENDING_ACTIONS, id);
}

/**
 * Increment retry count for a failed action
 */
export async function incrementRetryCount(id: string): Promise<void> {
  const action = await getItem<PendingAction>(STORES.PENDING_ACTIONS, id);
  if (action) {
    action.retryCount += 1;
    await putItem(STORES.PENDING_ACTIONS, action);
  }
}

/**
 * Get count of pending actions
 */
export async function getPendingActionsCount(): Promise<number> {
  return countItems(STORES.PENDING_ACTIONS);
}

// ============ SYNC METADATA ============

/**
 * Update last sync timestamp for a store
 */
export async function updateSyncMeta(store: StoreName, version?: string): Promise<void> {
  const meta: SyncMeta = {
    store,
    lastSync: Date.now(),
    version: version || '1.0',
  };
  await putItem(STORES.SYNC_META, meta as any);
}

/**
 * Get last sync info for a store
 */
export async function getSyncMeta(store: StoreName): Promise<SyncMeta | null> {
  return getItem<SyncMeta>(STORES.SYNC_META, store);
}

/**
 * Check if store needs sync (older than maxAge ms)
 */
export async function needsSync(store: StoreName, maxAgeMs: number = 5 * 60 * 1000): Promise<boolean> {
  const meta = await getSyncMeta(store);
  if (!meta) return true;
  return Date.now() - meta.lastSync > maxAgeMs;
}

// ============ CONVENIENCE FUNCTIONS ============

/**
 * Sync jobs from server to IndexedDB
 */
export async function syncJobsToOffline(jobs: any[]): Promise<void> {
  await putItems(STORES.JOBS, jobs);
  await updateSyncMeta(STORES.JOBS);
}

/**
 * Sync machines from server to IndexedDB
 */
export async function syncMachinesToOffline(machines: any[]): Promise<void> {
  await putItems(STORES.MACHINES, machines);
  await updateSyncMeta(STORES.MACHINES);
}

/**
 * Sync techniques from server to IndexedDB
 */
export async function syncTechniquesToOffline(techniques: any[]): Promise<void> {
  await putItems(STORES.TECHNIQUES, techniques);
  await updateSyncMeta(STORES.TECHNIQUES);
}

/**
 * Sync operators from server to IndexedDB
 */
export async function syncOperatorsToOffline(operators: any[]): Promise<void> {
  await putItems(STORES.OPERATORS, operators);
  await updateSyncMeta(STORES.OPERATORS);
}

/**
 * Add a scan record (for offline scanning)
 */
export async function addScanRecord(scan: {
  id: string;
  job_id: string;
  operator_id?: string;
  action: string;
  quantity?: number;
  notes?: string;
}): Promise<void> {
  const record = {
    ...scan,
    timestamp: Date.now(),
    synced: false,
  };
  await putItem(STORES.SCANS, record);
  
  // Also add to pending actions for background sync
  await addPendingAction('create', STORES.SCANS, record);
}

/**
 * Get unsynced scans
 */
export async function getUnsyncedScans(): Promise<any[]> {
  const allScans = await getAllItems<any>(STORES.SCANS);
  return allScans.filter(scan => !scan.synced);
}

/**
 * Mark scan as synced
 */
export async function markScanAsSynced(id: string): Promise<void> {
  const scan = await getItem<any>(STORES.SCANS, id);
  if (scan) {
    scan.synced = true;
    await putItem(STORES.SCANS, scan);
  }
}

// ============ OFFLINE STATUS ============

/**
 * Check if we're offline
 */
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

/**
 * Get offline data summary
 */
export async function getOfflineDataSummary(): Promise<{
  jobs: number;
  machines: number;
  techniques: number;
  operators: number;
  pendingActions: number;
  unsyncedScans: number;
}> {
  const [jobs, machines, techniques, operators, pendingActions, unsyncedScans] = await Promise.all([
    countItems(STORES.JOBS),
    countItems(STORES.MACHINES),
    countItems(STORES.TECHNIQUES),
    countItems(STORES.OPERATORS),
    getPendingActionsCount(),
    getUnsyncedScans().then(s => s.length),
  ]);

  return { jobs, machines, techniques, operators, pendingActions, unsyncedScans };
}

/**
 * Clear all offline data
 */
export async function clearAllOfflineData(): Promise<void> {
  await Promise.all([
    clearStore(STORES.JOBS),
    clearStore(STORES.MACHINES),
    clearStore(STORES.TECHNIQUES),
    clearStore(STORES.OPERATORS),
    clearStore(STORES.SCANS),
    clearStore(STORES.PENDING_ACTIONS),
    clearStore(STORES.SYNC_META),
  ]);
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    dbPromise = null;
  }
}
