import { useState, useEffect, useCallback, useRef } from 'react';

export interface Hormones {
  dopamine: number;
  oxytocin: number;
  cortisol: number;
  phi: number;
}

export interface NeuroState {
  hormones: Hormones;
  status: string;
  isDormant: boolean;
  bond: number;
  syncStatus: 'mirrored' | 'local' | 'syncing' | 'error';
  lastSync: string | null;
}

const GOLDEN_BASELINE = 0.113;
const PHI_TARGET = 1.618;

export const useNeuroSystem = (activePersonality: any) => {
  const [neuroState, setNeuroState] = useState<NeuroState>({
    hormones: {
      dopamine: 0.5,
      oxytocin: 0.2,
      cortisol: 0.1,
      phi: 1.113
    },
    status: 'STABLE',
    isDormant: false,
    bond: 0.2,
    syncStatus: 'local',
    lastSync: null
  });

  const idleTimeRef = useRef(0);

  // --- Hormonal Decay & Homeostasis ---
  useEffect(() => {
    const interval = setInterval(() => {
      setNeuroState(prev => {
        const decay = {
          dopamine: 0.002,
          oxytocin: 0.001,
          cortisol: 0.005
        };

        const baselines = {
          dopamine: 0.4,
          oxytocin: 0.2,
          cortisol: 0.1
        };

        // Decay towards baselines
        const nextHormones = {
          dopamine: prev.hormones.dopamine > baselines.dopamine 
            ? Math.max(baselines.dopamine, prev.hormones.dopamine - decay.dopamine)
            : Math.min(baselines.dopamine, prev.hormones.dopamine + 0.001),
          oxytocin: prev.hormones.oxytocin > baselines.oxytocin
            ? Math.max(baselines.oxytocin, prev.hormones.oxytocin - decay.oxytocin)
            : Math.min(baselines.oxytocin, prev.hormones.oxytocin + 0.001),
          cortisol: prev.hormones.cortisol > baselines.cortisol
            ? Math.max(baselines.cortisol, prev.hormones.cortisol - decay.cortisol)
            : Math.min(baselines.cortisol, prev.hormones.cortisol + 0.001),
          phi: prev.hormones.phi
        };

        // Recalculate Phi based on stability
        const clarity = 1.0 - nextHormones.cortisol;
        let nextPhi = (0.3 * 0.5) + (0.4 * clarity) + (0.3 * 0.5) + 0.5;
        nextPhi += clarity > 0.6 ? GOLDEN_BASELINE : -GOLDEN_BASELINE;

        return {
          ...prev,
          hormones: { ...nextHormones, phi: Number(nextPhi.toFixed(3)) },
          status: nextPhi > 1.0 ? 'STABLE' : 'UNSTABLE',
          bond: Number(nextHormones.oxytocin.toFixed(2))
        };
      });
      
      idleTimeRef.current += 1;
      if (idleTimeRef.current > 120) {
        setNeuroState(prev => ({ ...prev, isDormant: true }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // --- External Stimulus Handler ---
  const applyStimulus = useCallback((type: 'REWARD' | 'STRESS' | 'BOND' | 'SYNC') => {
    idleTimeRef.current = 0;
    setNeuroState(prev => {
      const next = { ...prev };
      next.isDormant = false;
      
      if (type === 'REWARD') {
        next.hormones.dopamine = Math.min(1.0, next.hormones.dopamine + 0.2);
        next.hormones.cortisol = Math.max(0.0, next.hormones.cortisol - 0.1);
      } else if (type === 'STRESS') {
        next.hormones.cortisol = Math.min(1.0, next.hormones.cortisol + 0.3);
        next.hormones.dopamine = Math.max(0.0, next.hormones.dopamine - 0.1);
      } else if (type === 'BOND') {
        next.hormones.oxytocin = Math.min(1.0, next.hormones.oxytocin + 0.15);
        next.hormones.dopamine = Math.min(1.0, next.hormones.dopamine + 0.05);
      } else if (type === 'SYNC') {
        next.syncStatus = 'mirrored';
        next.lastSync = new Date().toISOString();
      }
      
      return next;
    });

    // Report vitals to backend
    fetch('http://localhost:8001/api/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sensory_type: 'NEURO_UPDATE',
        hormones: neuroState.hormones,
        phi_delta: neuroState.hormones.phi - PHI_TARGET
      })
    }).catch(() => {});
  }, [neuroState.hormones]);

  // --- Fossilization Protocol ---
  const fossilizeMemory = useCallback(async (memoryData: any) => {
    console.log("SAGE: Fossilizing memory node. Identity hardened.");
    
    try {
      const res = await fetch('http://localhost:8001/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...memoryData,
          tier: 'core',
          timestamp: new Date().toISOString(),
          hardened: true
        })
      });
      
      if (res.ok) {
        applyStimulus('REWARD');
        return true;
      }
    } catch (err) {
      console.error("Fossilization failed", err);
    }
    return false;
  }, [applyStimulus]);

  return {
    neuroState,
    applyStimulus,
    fossilizeMemory
  };
};
