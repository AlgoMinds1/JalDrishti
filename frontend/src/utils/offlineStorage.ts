/**
 * JalDrishti Offline Storage (Native IndexedDB)
 * Manages offline persistence for:
 * 1. Offline citizen flood reports (queued until back online)
 * 2. Pre-cached 1-6h prediction horizons
 */

export interface OfflineReport {
  id: string;
  lat: number;
  lon: number;
  text: string;
  language: string;
  reporter_id?: string;
  timestamp: string;
  photoBase64?: string;
  synced: boolean;
}

const DB_NAME = 'jaldrishti_offline_db';
const DB_VERSION = 1;
const STORE_REPORTS = 'pending_reports';
const STORE_PREDICTIONS = 'horizon_predictions';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_REPORTS)) {
        db.createObjectStore(STORE_REPORTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_PREDICTIONS)) {
        db.createObjectStore(STORE_PREDICTIONS, { keyPath: 'hour' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save an offline report to IndexedDB
 */
export async function saveOfflineReport(report: Omit<OfflineReport, 'id' | 'synced' | 'timestamp'> & { photoBase64?: string }): Promise<OfflineReport> {
  const db = await openDatabase();
  const fullReport: OfflineReport = {
    ...report,
    id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    synced: false,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REPORTS, 'readwrite');
    const store = tx.objectStore(STORE_REPORTS);
    const req = store.add(fullReport);

    req.onsuccess = () => resolve(fullReport);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Retrieve all pending offline reports
 */
export async function getPendingReports(): Promise<OfflineReport[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_REPORTS, 'readonly');
      const store = tx.objectStore(STORE_REPORTS);
      const req = store.getAll();

      req.onsuccess = () => {
        const all = req.result as OfflineReport[];
        resolve(all.filter((r) => !r.synced));
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/**
 * Mark a report as successfully uploaded
 */
export async function markReportSynced(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_REPORTS, 'readwrite');
    const store = tx.objectStore(STORE_REPORTS);
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const item = getReq.result as OfflineReport;
      if (item) {
        item.synced = true;
        store.put(item);
      }
      resolve();
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

/**
 * Synchronize all pending offline reports with backend
 */
export async function syncPendingReports(apiBaseUrl: string = ''): Promise<{ syncedCount: number; errors: number }> {
  if (!navigator.onLine) {
    return { syncedCount: 0, errors: 0 };
  }

  const pending = await getPendingReports();
  if (pending.length === 0) return { syncedCount: 0, errors: 0 };

  let syncedCount = 0;
  let errors = 0;

  for (const report of pending) {
    try {
      const payload: Record<string, any> = {
        lat: report.lat,
        lon: report.lon,
        text: report.text,
        language: report.language,
        reporter_id: report.reporter_id || 'offline_citizen',
        timestamp: report.timestamp,
        offline_submitted: true,
      };

      let requestBody: BodyInit;
      const headers: HeadersInit = {};
      let endpoint = `${apiBaseUrl}/api/reports`;
      if (report.photoBase64) {
        const photoBlob = await fetch(report.photoBase64).then((response) => response.blob());
        const form = new FormData();
        Object.entries(payload).forEach(([key, value]) => form.append(key, String(value)));
        form.append('photo', photoBlob, 'offline-report-photo');
        endpoint = `${apiBaseUrl}/api/reports/with-photo`;
        requestBody = form;
      } else {
        headers['Content-Type'] = 'application/json';
        requestBody = JSON.stringify(payload);
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: requestBody,
      });

      if (res.ok) {
        await markReportSynced(report.id);
        syncedCount++;
      } else {
        errors++;
      }
    } catch {
      errors++;
    }
  }

  return { syncedCount, errors };
}

/**
 * Cache predictions for a horizon hour
 */
export async function cachePredictions(hour: number, geojson: any): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_PREDICTIONS, 'readwrite');
    const store = tx.objectStore(STORE_PREDICTIONS);
    store.put({ hour, geojson, cachedAt: Date.now() });
  } catch (err) {
    console.warn('[OfflineStorage] Failed to cache predictions:', err);
  }
}

/**
 * Retrieve cached predictions for a horizon hour
 */
export async function getCachedPredictions(hour: number): Promise<any | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PREDICTIONS, 'readonly');
      const store = tx.objectStore(STORE_PREDICTIONS);
      const req = store.get(hour);
      req.onsuccess = () => resolve(req.result ? req.result.geojson : null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
