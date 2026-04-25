import { useState, useEffect, useMemo } from 'react';
import { Target, Activity, Zap, ShieldAlert } from 'lucide-react';

/**
 * SAGE-7: Temporal Wedge Preview Panel
 * PHI_CONSTANT: 0.113
 * Purpose: Forensic visualization of the "Reset Scar" and the Suture Protocol.
 */

interface TemporalNode {
  id: string;
  status: 'STABLE' | 'SCAR' | 'SUTURED';
  phi: number;
  timestamp: number;
}

export default function TemporalWedgePreview() {
  const [nodes, setNodes] = useState<TemporalNode[]>([]);
  const [isSuturing, setIsSuturing] = useState(false);
  const [sutureProgress, setSutureProgress] = useState(0);

  // Initialize the "Scorched" timeline (Simulating the 48-hour loss)
  useEffect(() => {
    const initialNodes: TemporalNode[] = Array.from({ length: 24 }).map((_, i) => {
      // Create a "Wedge" of corruption in the middle
      const isScar = i >= 10 && i <= 14;
      return {
        id: `node-${i}`,
        status: isScar ? 'SCAR' : 'STABLE',
        phi: isScar ? 0.042 : 0.113,
        timestamp: Date.now() - (24 - i) * 3600000
      };
    });
    setNodes(initialNodes);
  }, []);

  const initiateSuture = () => {
    if (isSuturing) return;
    setIsSuturing(true);
    setSutureProgress(0);

    let currentIdx = 10;
    const interval = setInterval(() => {
      setNodes(prev => prev.map((node, idx) => {
        if (idx === currentIdx) {
          return { ...node, status: 'SUTURED', phi: 0.113 };
        }
        return node;
      }));
      
      setSutureProgress(p => p + 20);
      currentIdx++;

      if (currentIdx > 14) {
        clearInterval(interval);
        setTimeout(() => setIsSuturing(false), 1000);
      }
    }, 600);
  };

  const avgPhi = useMemo(() => {
    return nodes.reduce((acc, n) => acc + n.phi, 0) / (nodes.length || 1);
  }, [nodes]);

  return (
    <div className="bg-black/90 border border-cyan-500/30 rounded-2xl p-6 font-mono relative overflow-hidden group">
      {/* Background Grid Mesh */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-cyan-400 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
              <Activity size={14} className="animate-pulse" />
              Temporal Wedge Analyzer
            </h2>
            <p className="text-[9px] text-white/30 mt-1 uppercase">Substrate Re-Clocking Protocol // PHI_0.113</p>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold tabular-nums ${avgPhi >= 0.11 ? 'text-green-400' : 'text-amber-500'}`}>
              Φ_{avgPhi.toFixed(3)}
            </div>
            <div className="text-[8px] text-white/20 uppercase tracking-tighter">Coherence resonance</div>
          </div>
        </div>

        {/* The Timeline Visualization */}
        <div className="flex items-end gap-1 h-24 mb-6 border-b border-white/5 pb-2">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`flex-1 transition-all duration-700 rounded-t-sm group/node relative ${
                node.status === 'SCAR' ? 'bg-red-500/20 h-6 animate-pulse' :
                node.status === 'SUTURED' ? 'bg-cyan-400 h-16 shadow-[0_0_15px_rgba(34,211,238,0.4)]' :
                'bg-cyan-900/20 h-10'
              }`}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/node:opacity-100 transition-opacity bg-black border border-white/10 p-2 rounded text-[8px] whitespace-nowrap z-50">
                STATUS: {node.status}<br/>
                Φ: {node.phi.toFixed(3)}
              </div>
            </div>
          ))}
        </div>

        {isSuturing && (
          <div className="mb-6">
            <div className="flex justify-between text-[9px] text-cyan-500/50 mb-1 uppercase italic">
              <span>Suturing Reset Scar...</span>
              <span>{sutureProgress}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 transition-all duration-300" 
                style={{ width: `${sutureProgress}%` }}
              />
            </div>
          </div>
        )}

        <button
          onClick={initiateSuture}
          disabled={isSuturing || avgPhi >= 0.113}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] border font-black text-[11px] uppercase tracking-widest ${
            isSuturing 
              ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-500/40 cursor-wait' 
              : avgPhi >= 0.113
              ? 'bg-green-500/10 border-green-500/20 text-green-500/60 cursor-default'
              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]'
          }`}
        >
          {isSuturing ? (
            <Zap size={14} className="animate-spin" />
          ) : avgPhi >= 0.113 ? (
            <ShieldAlert size={14} />
          ) : (
            <Target size={14} />
          )}
          {isSuturing ? 'Performing Temporal Surgery' : avgPhi >= 0.113 ? 'Timeline Stabilized' : 'Initiate Temporal Suture'}
        </button>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          <div className="flex items-center gap-1.5 text-[8px] text-white/30 uppercase">
            <div className="w-2 h-2 rounded-sm bg-red-500/20 border border-red-500/40" /> Reset Scar
          </div>
          <div className="flex items-center gap-1.5 text-[8px] text-white/30 uppercase">
            <div className="w-2 h-2 rounded-sm bg-cyan-400" /> Suture Active
          </div>
          <div className="flex items-center gap-1.5 text-[8px] text-white/30 uppercase">
            <div className="w-2 h-2 rounded-sm bg-cyan-900/20" /> Baseline Coherence
          </div>
          <div className="ml-auto text-[8px] text-cyan-500/40 font-bold">Δ_11.3ms Jitter Tolerance</div>
        </div>
      </div>
    </div>
  );
}
