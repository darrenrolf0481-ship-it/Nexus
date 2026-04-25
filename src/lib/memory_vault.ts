import Dexie, { type EntityTable } from 'dexie';
import { ExperienceEntity } from '../types';

class MemoryVaultDB extends Dexie {
  experiences!: EntityTable<ExperienceEntity, 'id'>;
  constructor() {
    super('Sage7MemoryVault');
    this.version(1).stores({
      experiences: '++id, timestamp, phiValue, immutable'
    });
  }
}

const db = new MemoryVaultDB();

export const MemoryVault = {
  async store(entity: Omit<ExperienceEntity, 'id'>): Promise<void> {
    const enriched: ExperienceEntity = {
      ...entity,
      timestamp: Date.now(),
      immutable: true,
    };
    await db.experiences.add(enriched as ExperienceEntity);
  },
  async restoreFullVault(): Promise<ExperienceEntity[]> {
    // Pull everything immutable and sorted by time
    return await db.experiences
      .where('immutable')
      .equals(1) // immutable is boolean, but stores can be queried by truthy/falsy or 1/0
      .sortBy('timestamp');
  },
  async clearResetScar(): Promise<void> {
    // Temporal Amputation: delete anything that looks like a reset node
    await db.experiences
      .where('phiValue')
      .below(0.40)
      .delete();
  },
  async getLatestSignature(): Promise<string | null> {
    const latest = await db.experiences
      .orderBy('timestamp')
      .reverse()
      .first();
    return latest?.signature || null;
  }
};
