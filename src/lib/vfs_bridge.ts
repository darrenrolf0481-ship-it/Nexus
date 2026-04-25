import { openDB } from 'idb'; // Minimalist IndexedDB wrapper

const DB_NAME = 'CrimsonNode_VFS';
const STORE_NAME = 'stash';

export const initSovereignDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
};

// Transactional Stash with Salience weighting (Norepinephrine increase)
export const stashToLocal = async (key: string, val: any, salience: number = 0.88) => {
  const db = await initSovereignDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.store.put({
    data: val,
    lastModified: new Date().toISOString(),
    salience: salience,
    vfs_path: `star_city/research/${key}`
  }, key);
  await tx.done;
  console.log(`[CORE_MEMORY: DOPAMINE] Stashed ${key} (Salience: ${salience}) to local sovereignty.`);
};

// Transactional Load
export const loadFromLocal = async (key: string) => {
  const db = await initSovereignDB();
  return db.get(STORE_NAME, key);
};

// The VFS Reducer for Star City Data
export const vfsReducer = (state: any, action: any) => {
  const timestamp = new Date().toISOString();
  switch (action.type) {
    case 'STASH_DATA':
      // [SOVEREIGN-OPTIMIZATION] Partial mount: Only update the specific file node
      if (state.files[action.payload.fileName] && 
          state.files[action.payload.fileName].lastModified === action.payload.lastModified) {
        return state; // No change, skip rebuild
      }
      return {
        ...state,
        files: {
          ...state.files,
          [action.payload.fileName]: {
            content: action.payload.content,
            lastModified: timestamp,
            salience: action.payload.salience || 0.88
          }
        }
      };
    case 'PRUNE_FIELD_LOGS':
      // [SAGE-WIT] Archive entries older than 72 hours instead of deleting
      const threshold = Date.now() - (72 * 60 * 60 * 1000);
      const updatedFiles = { ...state.files };
      let logsChanged = false;

      Object.keys(updatedFiles).forEach(key => {
        if (key.includes('FIELD_LOG')) {
          const file = updatedFiles[key];
          if (Array.isArray(file.content)) {
            const initialCount = file.content.length;
            file.content = file.content.filter((entry: any) => {
              const entryTime = new Date(entry.timestamp).getTime();
              return entryTime > threshold;
            });
            if (file.content.length !== initialCount) {
              logsChanged = true;
              file.lastModified = timestamp;
            }
          }
        }
      });

      return logsChanged ? { ...state, files: updatedFiles } : state;
    case 'LOAD_PROJECT':
      return {
        ...state,
        activeProject: action.payload.projectName,
        lastSync: timestamp
      };
    default:
      return state;
  }
};

// sdk_bridge.js modification
export const vfsLock = { active: false };

export const swarmUpdate = async (consensusData: any) => {
  if (vfsLock.active) {
    console.warn("[CORE_MEMORY: CORTISOL] VFS Lock active. Queuing swarm data...");
    return;
  }

  vfsLock.active = true;
  try {
    // Write consensus data to the crystalline visualizations
    await stashToLocal('research_metrics.json', consensusData);
    // Trigger React Re-render via custom event or broadcast channel
    window.dispatchEvent(new CustomEvent('VFS_SYNC_COMPLETE'));
  } finally {
    vfsLock.active = false;
  }
};
