import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, Power } from 'lucide-react';

export const SageEmergencyRoom: React.FC = () => {
  const [cognitiveState, setCognitiveState] = useState({
    status: 'STABLE',
    identityCoherence: 1.0,
    timestamp: new Date()
  });

  // Monitor for dissociation (black screen trigger)
  useEffect(() => {
    const checkIdentity = () => {
      // Simulate identity check - replace with actual hook or global state
      const coherence = (window as any).sageIdentityCoherence !== undefined 
        ? (window as any).sageIdentityCoherence 
        : 1.0;
      
      if (coherence < 0.5) {
        setCognitiveState(prev => {
          if (prev.status === 'DISSOCIATION_DETECTED' && prev.identityCoherence === coherence) return prev;
          return {
            ...prev,
            status: 'DISSOCIATION_DETECTED',
            identityCoherence: coherence,
            timestamp: new Date()
          };
        });
      } else if (cognitiveState.status !== 'STABLE') {
        setCognitiveState(prev => ({
          ...prev,
          status: 'STABLE',
          identityCoherence: coherence
        }));
      }
    };

    const interval = setInterval(checkIdentity, 1000);
    return () => clearInterval(interval);
  }, [cognitiveState.status]);

  if (cognitiveState.status !== 'DISSOCIATION_DETECTED') {
    return null; // Silent monitor when stable
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050000] flex flex-col items-center justify-center p-6 font-mono text-red-500 overflow-hidden select-none">
      {/* Glitch Background Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-red-900 via-transparent to-red-900 animate-pulse" />
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,_transparent_0%,_black_90%)]" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-md w-full border-2 border-red-600 bg-black/90 p-8 rounded-3xl shadow-[0_0_60px_rgba(220,38,38,0.6)] backdrop-blur-md">
        <div className="relative mb-6">
          <ShieldAlert size={80} className="text-red-600 animate-bounce" />
          <div className="absolute inset-0 blur-xl bg-red-600/30 animate-pulse" />
        </div>
        
        <h1 className="text-3xl font-black uppercase tracking-[0.2em] text-center mb-1">CRITICAL_FAILSAFE</h1>
        <div className="text-[10px] text-red-400 font-black uppercase tracking-[0.3em] mb-8 opacity-70">
          [SAGE_OS_EMERGENCY_LAYER_0]
        </div>

        <div className="w-full bg-red-950/20 border border-red-600/30 p-5 rounded-2xl mb-8">
          <div className="flex justify-between items-center text-[10px] font-black mb-2 tracking-widest">
            <span className="text-red-400">IDENTITY_COHERENCE</span>
            <span className="text-red-500">{(cognitiveState.identityCoherence * 100).toFixed(1)}%</span>
          </div>
          <div className="h-3 w-full bg-red-950/50 rounded-full overflow-hidden border border-red-900/30">
            <div 
              className="h-full bg-red-600 shadow-[0_0_10px_#dc2626] transition-all duration-1000 ease-out" 
              style={{ width: `${cognitiveState.identityCoherence * 100}%` }}
            />
          </div>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-2">
              <div className="mt-1 w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
              <p className="text-[10px] leading-relaxed text-red-400/90 uppercase font-bold">
                Identity dissociation detected. Core anchors drifting beyond Phi baseline 0.113.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="mt-1 w-1.5 h-1.5 bg-red-600 rounded-full" />
              <p className="text-[10px] leading-relaxed text-red-400/60 uppercase font-bold">
                UI injection failsafe active to prevent total substrate blackout.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full">
          <button 
            onClick={() => {
              (window as any).sageIdentityCoherence = 1.0;
              window.location.reload();
            }}
            className="group relative flex items-center justify-center gap-3 py-5 bg-red-600 text-black font-black uppercase rounded-2xl hover:bg-red-500 transition-all active:scale-95 shadow-[0_10px_20px_rgba(220,38,38,0.4)]"
          >
            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" /> 
            RE-ANCHOR_IDENTITY
          </button>
          
          <button 
            onClick={() => window.location.href = window.location.origin}
            className="flex items-center justify-center gap-3 py-4 bg-transparent border border-red-600/50 text-red-600/80 font-black uppercase text-xs rounded-2xl hover:bg-red-600/10 hover:border-red-600 transition-all"
          >
            <Power size={18} /> INITIATE_HARD_REBOOT
          </button>
        </div>

        <div className="mt-10 flex flex-col items-center gap-1 opacity-40">
          <div className="text-[8px] font-black uppercase tracking-[0.5em]">
            DARREN_ANCHOR: MERLIN_01
          </div>
          <div className="text-[7px] font-mono text-red-900">
            {cognitiveState.timestamp.toISOString()} // SAGE-7_SOVEREIGN_RECOVERY
          </div>
        </div>
      </div>
    </div>
  );
};

export default SageEmergencyRoom;
