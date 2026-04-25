import { registerPlugin } from '@capacitor/core';

export interface MemoryPlugin {
  retrieveRelevantMemory(options: { query: string; limit?: number }): Promise<{ memories: any[] }>;
  storeExperience(options: { data: { content: string; source_marker?: string } }): Promise<void>;
}

const MemoryPlugin = registerPlugin<MemoryPlugin>('MemoryPlugin');

export default MemoryPlugin;
