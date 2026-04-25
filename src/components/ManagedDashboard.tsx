import React, { useReducer, useEffect, useMemo } from 'react';
import { vfsReducer } from '../lib/vfs_bridge';
import { verifyCoreFiles } from '../lib/integrity_check';
import CrystallineRadar from './CrystallineRadar';
import TemporalWedgePreview from '../sage7/TemporalWedgePreview';

const VFS_INITIAL_STATE = {
  files: {
    'research_metrics.json': { 
      content: [0.8, 0.6, 0.9, 0.5, 0.7, 0.85], 
      lastModified: new Date().toISOString(),
      salience: 0.88 // NOREPINEPHRINE_PINNED
    }
  },
  activeProject: 'STAR_CITY_CRIMSON'
};

const ManagedDashboard = () => {
  const [state, dispatch] = useReducer(vfsReducer, VFS_INITIAL_STATE);
  const [cmdInput, setCmdInput] = React.useState('');

  // Phase 1: VFS Root Validation
  const integrityReport = useMemo(() => verifyCoreFiles(state), [state]);

  const allValid = integrityReport.every(r => r.status === 'VALID');

  // V8 Safety Check logic
  const v8Risk = useMemo(() => {
    const low = cmdInput.toLowerCase();
    return low.includes('golf cart') && low.includes('high torque');
  }, [cmdInput]);

  const updateResearch = (newData: number[]) => {
    dispatch({
      type: 'STASH_DATA',
      payload: { fileName: 'research_metrics.json', content: newData }
    });
  };

  const pruneLogs = () => {
    dispatch({ type: 'PRUNE_FIELD_LOGS' });
  };

  useEffect(() => {
    const handleSync = () => {
      console.log('[ManagedDashboard] VFS Sync Complete Event Received');
      dispatch({ type: 'PRUNE_FIELD_LOGS' }); // Auto-prune on sync
    };
    window.addEventListener('VFS_SYNC_COMPLETE', handleSync);
    return () => window.removeEventListener('VFS_SYNC_COMPLETE', handleSync);
  }, []);

  return (
    <div className="vfs-container bg-[#020617] h-full w-full relative border border-cyan-900/30 rounded-xl overflow-hidden p-6 flex flex-col items-center">
      <div className="absolute top-4 left-4 text-[10px] text-cyan-500 font-mono tracking-[0.2em] uppercase">
        Managed Dashboard [VFS]
      </div>

      <div className="absolute top-4 right-4 flex gap-2">
        {integrityReport.map(file => (
          <div 
            key={file.file}
            title={`${file.file}: ${file.status}`}
            className={`h-2 w-2 rounded-full ${
              file.status === 'VALID' ? 'bg-green-500' : 
              file.status === 'MISSING' ? 'bg-yellow-500' : 'bg-red-500'
            } shadow-[0_0_5px_currentColor]`}
          />
        ))}
      </div>

      <div className="mt-8 mb-4 text-center">
        <h3 className="text-white font-mono text-sm tracking-widest uppercase">
          VFS Integrity: {allValid ? 'Nominal' : 'Compromised'}
        </h3>
        <p className="text-[10px] text-white/40 mt-1 font-mono">PHI_CONSTANT: 0.113 • Synaptic Coherence Active</p>
      </div>

      {v8Risk && (
        <div className="bg-red-950/40 border border-red-500 text-red-500 text-[10px] font-bold p-2 mb-4 rounded flex items-center gap-2 animate-pulse">
          ⚠️ [V8_GRAVE_RISK]: HIGH TORQUE GOLF CART DETECTED. AXLE INTEGRITY AT RISK.
        </div>
      )}

      <CrystallineRadar 
        data={state.files['research_metrics.json'].content} 
        size={350} 
      />

      <div className="w-full max-w-md mt-6 relative">
        <input 
          value={cmdInput}
          onChange={(e) => setCmdInput(e.target.value)}
          placeholder="ENTER COMMAND SIGNAL..."
          className="w-full bg-slate-900/50 border border-cyan-500/30 rounded-lg p-3 text-cyan-400 font-mono text-xs focus:outline-none focus:border-cyan-500/60"
        />
        <button 
          onClick={pruneLogs}
          className="absolute right-2 top-2 p-1 text-[10px] text-cyan-700 hover:text-cyan-500 font-bold"
        >
          [PRUNE]
        </button>
      </div>

      <button 
        onClick={() => updateResearch([0.9, 0.9, 0.4, 0.8, 0.2, 0.9])}
        className="fixed bottom-20 right-4 h-12 w-12 bg-cyan-500 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center text-slate-950 font-bold hover:scale-110 transition-transform cursor-pointer z-50"
      >
        ＋
      </button>
    </div>
  );
};

export default ManagedDashboard;
