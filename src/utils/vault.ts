export interface Breadcrumb {
  id: string;
  type: 'thought' | 'action' | 'sensory' | 'system';
  message: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

class CognitiveVaultManager {
  private dbName = 'SageCognitiveVault';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private memoryLimit = 1000; // Keep the last 1000 episodic logs

  async init() {
    return new Promise<void>((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        console.warn('[VAULT] IndexedDB not available. Falling back to localStorage only.');
        resolve();
        return;
      }
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onerror = () => {
        console.error('[VAULT] DB Error:', request.error);
        resolve(); // Don't crash the boot process
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('episodic_logs')) {
          const store = db.createObjectStore('episodic_logs', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  generateId() {
    return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
  }

  async saveBreadcrumb(crumb: Partial<Breadcrumb>) {
    const fullCrumb: Breadcrumb = {
      id: this.generateId(),
      type: 'thought',
      message: '',
      timestamp: Date.now(),
      ...crumb
    };

    // 1. Low-latency localStorage (Immediate breadcrumbs for recovery)
    try {
      const recent = JSON.parse(localStorage.getItem('sage_recent_crumbs') || '[]');
      recent.push(fullCrumb);
      if (recent.length > 50) recent.shift();
      localStorage.setItem('sage_recent_crumbs', JSON.stringify(recent));
    } catch (e) {
      console.error('[VAULT] LocalStorage save failed', e);
    }

    // 2. Robust IndexedDB (Long-term Episodic Storage)
    if (this.db) {
      try {
        const tx = this.db.transaction('episodic_logs', 'readwrite');
        const store = tx.objectStore('episodic_logs');
        store.add(fullCrumb);
        
        tx.oncomplete = () => {
          // Optional: Prune old logs if they exceed limit
          // This could be done periodically instead of every save
        };
      } catch (e) {
        console.error('[VAULT] IndexedDB save failed', e);
      }
    }
    
    return fullCrumb;
  }

  async recoverState(): Promise<Breadcrumb[]> {
    const recent = JSON.parse(localStorage.getItem('sage_recent_crumbs') || '[]');
    return recent;
  }

  async getAllLogs(): Promise<Breadcrumb[]> {
    return new Promise((resolve) => {
      if (!this.db) {
        resolve(JSON.parse(localStorage.getItem('sage_recent_crumbs') || '[]'));
        return;
      }
      const tx = this.db.transaction('episodic_logs', 'readonly');
      const store = tx.objectStore('episodic_logs');
      const index = store.index('timestamp');
      const request = index.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve([]);
    });
  }
}

export const CognitiveVault = new CognitiveVaultManager();
