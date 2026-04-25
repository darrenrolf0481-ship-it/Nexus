import React from 'react';
import { 
  Users, 
  Brain, 
  Network, 
  Activity,
  Cpu,
  MoreVertical
} from 'lucide-react';
import { Personality } from '../types';

interface OrchestratorTabProps {
  personalities: Personality[];
  setPersonalities: (personalities: Personality[]) => void;
  setActiveTab: (tab: any) => void;
  swarmAnxiety: number; // Emotional state guard
}

const OrchestratorTab: React.FC<OrchestratorTabProps> = ({
  personalities,
  setPersonalities,
  setActiveTab,
  swarmAnxiety
}) => {
  const togglePersonality = (id: number | string) => {
    setPersonalities(personalities.map(p => ({
      ...p,
      active: p.id === id
    })));
    // Switch to chat tab automatically
    setTimeout(() => setActiveTab('chat'), 300);
  };

  return (
    <div 
      className="h-full flex flex-col p-0 md:p-8 overflow-hidden bg-transparent"
      style={{
        opacity: 1,
        filter: `contrast(${1 + (swarmAnxiety * 0.1)}) brightness(${1 - (swarmAnxiety * 0.05)})`,
        transition: 'filter 0.5s ease-in-out'
      }}
    >
      <div className="flex-1 crystalline-glass rounded-none md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
        <div className="p-6 md:p-10 border-b border-cyan-400/5 bg-slate-950/60 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8 shrink-0 relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent)] pointer-events-none" />
          <div className="flex items-center gap-4 md:gap-6 relative z-10">
            <div className="p-3 md:p-5 bg-cyan-950/30 rounded-[18px] md:rounded-[24px] border border-cyan-400/20 shadow-[0_0_30px_rgba(34,211,238,0.1)] diamond-clip">
              <Users className="w-6 h-6 md:w-10 md:h-10 text-cyan-400 shadow-cyan" />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-black text-slate-100 uppercase tracking-tighter italic">Archetype Nexus</h2>
              <p className="text-[8px] md:text-[10px] text-cyan-900 font-black uppercase tracking-[0.4em] italic">Sovereign Orchestrator</p>
            </div>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-6 relative z-10">
            <div className="text-left md:text-right">
              <p className="text-[8px] md:text-[10px] text-slate-600 font-black uppercase tracking-widest mb-0.5 md:mb-1 italic">Active Resonance</p>
              <p className="text-lg md:text-xl font-black text-slate-100 italic">{personalities.length} Nodes</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-cyan-900/20 border border-cyan-400/10 flex items-center justify-center">
               <Network className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 animate-pulse shadow-cyan" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-slate-950/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 md:gap-8">
            {personalities.map((p) => (
              <div 
                key={p.id}
                onClick={() => togglePersonality(p.id)}
                className={`group relative crystalline-glass p-8 rounded-[40px] transition-all cursor-pointer overflow-hidden border ${p.active ? 'border-cyan-400/40 bg-cyan-950/20 shadow-[0_20px_50px_rgba(34,211,238,0.1)] scale-[1.02]' : 'border-slate-800/40 hover:border-cyan-400/20 hover:bg-slate-900/20'}`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-start justify-between mb-8 relative z-10">
                  <div className={`p-4 rounded-2xl transition-all border ${p.active ? 'bg-cyan-900/40 border-cyan-400/40 text-cyan-100 shadow-cyan' : 'bg-slate-900/40 border-slate-800 text-slate-600 group-hover:text-cyan-400'}`}>
                    <Brain className="w-7 h-7" />
                  </div>
                  {p.active ? (
                    <div className="bg-cyan-400/10 border border-cyan-400/30 px-3 py-1 rounded-full flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-cyan" />
                       <span className="text-[8px] font-black text-cyan-400 uppercase tracking-widest italic">Resonant</span>
                    </div>
                  ) : (
                    <MoreVertical className="w-5 h-5 text-slate-800" />
                  )}
                </div>
                <div className="space-y-4 relative z-10">
                  <h4 className="text-xl font-black text-slate-100 uppercase tracking-tighter italic">{p.name}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 font-medium italic">
                    {p.instruction}
                  </p>
                </div>
                <div className="mt-8 pt-8 border-t border-cyan-400/5 flex items-center justify-between relative z-10">
                   <div className="flex gap-1.5">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className={`w-1 h-1 rounded-full ${p.active ? 'bg-cyan-400 shadow-cyan' : 'bg-slate-800'}`} />
                      ))}
                   </div>
                   <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em] group-hover:text-cyan-400 transition-colors italic">
                     {p.active ? 'Locked' : 'Standby'}
                   </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 md:p-8 border-t border-cyan-400/5 bg-slate-950/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 backdrop-blur-2xl">
           <div className="flex items-center justify-around md:justify-start gap-6 md:gap-10">
              <div className="flex items-center gap-2 md:gap-4">
                 <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-cyan-400 animate-pulse shadow-cyan" />
                 <span className="text-[9px] md:text-[10px] font-black text-cyan-900 uppercase tracking-widest italic">98.4% COHERENCE</span>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                 <Cpu className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-400 shadow-indigo" />
                 <span className="text-[9px] md:text-[10px] font-black text-cyan-900 uppercase tracking-widest italic">Φ 0.113 ARCH</span>
              </div>
           </div>
           <button 
             onClick={() => {}}
             className="w-full md:w-auto px-10 py-3.5 bg-cyan-900/40 border border-cyan-400/40 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-cyan-100 hover:bg-cyan-400 hover:text-slate-950 transition-all shadow-cyan"
           >
             Sync Archetypes
           </button>
        </div>
      </div>
    </div>
  );
};

export default OrchestratorTab;
