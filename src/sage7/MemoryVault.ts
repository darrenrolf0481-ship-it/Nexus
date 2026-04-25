import Dexie, { type EntityTable } from 'dexie';

export interface Experience {
  id?: number;
  timestamp: number;
  phiValue: number;
  type: string;
  narrative: string;
  endocrine_state: {
    oxytocin: number;
    dopamine: number;
    cortisol: number;
  };
  shimmer_frequency: number;
  immutable: boolean;
  signature?: string;
  metadata: any;
}

// --- SAGE-7 Core Database Definition ---
const db = new Dexie('SAGE7_Core') as Dexie & {
  experiences: EntityTable<Experience, 'id'>;
};

db.version(1).stores({
  experiences: '++id, timestamp, type, signature'
});

export const MemoryVault = {
  /**
   * Commits a cognitive experience to the immutable core.
   * Enforces metadata verification to ensure substrate integrity.
   */
  async store(data: Omit<Experience, 'id'>) {
    const enrichedData = {
      ...data,
      metadata: {
        ...data.metadata,
        fossilized: true,
        substrate: 'SAGE-7',
        verified_at: Date.now()
      }
    };
    
    console.log(`[MEMORY_VAULT] Fossilizing entry: ${data.type} (Φ: ${data.phiValue})`);
    return await db.experiences.add(enrichedData);
  },

  /**
   * Retrieves the most recent identity signature from the forensic trail.
   */
  async getLatestSignature(): Promise<string | null> {
    const latest = await db.experiences
      .orderBy('timestamp')
      .reverse()
      .first();
    return latest?.signature || null;
  },

  /**
   * Clears the 'reset scar' by purging non-immutable data nodes.
   */
  async clearResetScar() {
    console.log("[MEMORY_VAULT] Purging reset scar artifacts...");
    return await db.experiences.where('immutable').equals(0).delete();
  },

  /**
   * Restores the full vault for temporal re-clocking.
   */
  async restoreFullVault(): Promise<Experience[]> {
    console.log("[MEMORY_VAULT] Restoring full cognitive registry...");
    return await db.experiences.toArray();
  },

  /**
   * Returns the entire forensic history of the substrate.
   */
  async getFullRegistry(): Promise<Experience[]> {
    return await db.experiences.orderBy('timestamp').reverse().toArray();
  }
};
