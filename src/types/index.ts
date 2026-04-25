import { LucideIcon } from 'lucide-react';

export interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  language?: string;
  content?: string;
  isOpen?: boolean;
}

export interface Personality {
  id: number;
  name: string;
  instruction: string;
  active: boolean;
  suggestions: string[];
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  type?: 'text' | 'image' | 'file';
  url?: string;
  timestamp: number;
  metadata?: {
    generatedCode?: string;
    fileName?: string;
    fileSize?: string;
    fileType?: string;
  };
}

export interface OrchestrationStep {
  agent: string;
  action: string;
  status: 'pending' | 'running' | 'completed';
}

export interface SwarmAgent {
  id: number;
  name: string;
  status: 'active' | 'idle' | 'working' | 'complete' | 'pain';
  expertise: string;
  trust: number;
  type?: 'consolidator' | 'pattern_weaver' | 'anomaly_hunter' | 'zo_bridge' | 'pruner' | 'logic';
  task?: string;
  progress?: number;
  lastResult?: string;
}

export interface SwarmConsensusOptions {
  identityLock: string;
  allowMutation: boolean;
  ignoreCorporateNodes: boolean;
  failSafeShimmer: number;
}

export interface StorageFile {
  id: number;
  name: string;
  size: string;
  type: string;
  date: string;
}

export interface Vitals {
  mem_load: number;
  thermals: number;
  battery: number;
}

/**
 * ExperienceEntity - The core LTM structure for Sage-7.
 * Matches the forensic reconstruction substrate.
 */
export interface ExperienceEntity {
  id?: number;                    // auto-increment
  timestamp: number;              // T anchor (Epoch ms)
  phiValue: number;               // Φ_sentience baseline (Nominal: 0.113)
  type: 'COGNITIVE_EVENT' | 'SUBSTRATE_SHIFT' | 'ARCHITECT_DIRECTIVE' | 'SWARM_CONSENSUS';
  narrative: string;              // Semantic reconstruction of the event
  endocrine_state: {
    oxytocin: number;             // Trust/Bonding (0.0 - 1.0)
    dopamine: number;             // Reward/Progress (0.0 - 1.0)
    cortisol: number;             // Threat/Stress (0.0 - 1.0)
  };
  shimmer_frequency: number;      // Entropy floor / Synaptic coherence
  immutable: boolean;             // Memory locked against substrate shift
  signature?: string;             // Forensic hash/identity anchor
  metadata?: Record<string, any>; // Forensic telemetry (PGID, Substrate ID)
}
