/**
 * SAGE-7: VFS Root Validation (Phase 1)
 * PHI_CONSTANT: 0.113
 * Purpose: Verify Stash & Load manifest against IndexedDB persistence.
 */

export interface VFSFile {
  content: any;
  hash?: string;
  lastModified?: string;
}

export interface VFSState {
  files: Record<string, VFSFile>;
  activeProject: string;
}

export interface IntegrityResult {
  file: string;
  status: 'VALID' | 'CORRUPTED' | 'MISSING';
  lastModified: string;
}

/**
 * Generates a simple hash for content validation.
 * In a production SAGE-7 environment, this would use a more robust crypto-subtle hash.
 */
export const generateHash = (content: any): string => {
  const str = typeof content === 'string' ? content : JSON.stringify(content);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString(16);
};

/**
 * Phase 1: VFS Root Validation
 * Verifies core files against the provided VFS state.
 */
export const verifyCoreFiles = (vfsState: VFSState): IntegrityResult[] => {
  const criticalPath = ['sdk_bridge.js', 'vfs_core.js', 'swarm_consensus.js', 'research_metrics.json'];
  
  return criticalPath.map(file => {
    const fileEntry = vfsState.files[file];
    const exists = !!fileEntry;
    
    if (!exists) {
      return {
        file,
        status: 'MISSING',
        lastModified: 'UNKNOWN'
      };
    }

    const currentHash = generateHash(fileEntry.content);
    const isValid = !fileEntry.hash || fileEntry.hash === currentHash;
    
    return {
      file,
      status: isValid ? 'VALID' : 'CORRUPTED',
      lastModified: fileEntry.lastModified || 'UNKNOWN'
    };
  });
};
