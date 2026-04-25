import React from 'react';
import { 
  Smartphone, 
  Activity, 
  Network, 
  Plus, 
  Database, 
  HardDrive, 
  Trash2, 
  FileCode,
  Zap,
  Gauge
} from 'lucide-react';

interface TermuxTabProps {
  termuxStatus: 'disconnected' | 'connecting' | 'connected';
  vitals: any;
  sensorData: any;
  termuxFiles: any[];
  handleTermuxFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setTermuxFiles: (files: any) => void;
}

const TermuxTab: React.FC<TermuxTabProps> = ({
  termuxStatus,
  vitals,
  sensorData,
  termuxFiles,
  handleTermuxFileUpload,
  setTermuxFiles
}) => {
  return (
    <div className="h-full flex flex-col p-4 md:p-8 gap-4 md:gap-8 overflow-y-auto custom-scrollbar bg-transparent">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        {/* Connection Status */}
        <div className="crystalline-glass rounded-[30px] p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 ${termuxStatus === 'connected' ? 'bg-cyan-400 shadow-cyan' : 'bg-slate-900'}`} />
          <div className="relative">
            <div className={`absolute inset-0 blur-[40px] opacity-20 ${termuxStatus === 'connected' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-900'}`} />
            <Smartphone className={`w-24 h-24 relative z-10 ${termuxStatus === 'connected' ? 'text-cyan-400 shadow-cyan' : 'text-slate-800'}`} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tighter italic">Substrate Link</h3>
            <p className="text-[10px] text-cyan-900 font-black uppercase tracking-[0.4em] italic">
              {termuxStatus === 'connected' ? 'Neural Link Optimized' : 'Waiting for Signal...'}
            </p>
          </div>
          <button className="px-8 py-3 bg-cyan-900/40 border border-cyan-400/40 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100 hover:bg-cyan-400 hover:text-slate-950 transition-all shadow-cyan italic">
            {termuxStatus === 'connected' ? 'Synchronized' : 'Initialize Bridge'}
          </button>
        </div>

        {/* Vitals */}
        <div className="crystalline-glass rounded-[30px] p-8 space-y-8 shadow-2xl">
          <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.3em] flex items-center gap-3 italic">
            <Activity className="w-4 h-4 shadow-cyan" /> Substrate Vitals
          </h4>
          <div className="grid grid-cols-2 gap-6">
            <VitalCard label="MEM_LOAD" value={`${vitals.mem_load}%`} icon={<Database className="w-4 h-4" />} />
            <VitalCard label="THERMALS" value={`${vitals.thermals}°C`} icon={<Zap className="w-4 h-4" />} />
            <VitalCard label="ENERGY" value={`${vitals.battery}%`} icon={<Gauge className="w-4 h-4" />} />
            <VitalCard label="SYNOID" value={vitals.nucleoid ? 'ACTIVE' : 'IDLE'} icon={<Network className="w-4 h-4" />} />
          </div>
        </div>
      </div>

      {/* Model Stash */}
      <div className="crystalline-glass rounded-[30px] md:rounded-[40px] p-8 md:p-10 shadow-2xl flex-1">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b border-cyan-400/5 pb-8">
          <h3 className="text-xl font-black text-slate-100 flex items-center gap-4 uppercase tracking-tighter italic">
            <Network className="w-7 h-7 text-indigo-400 shadow-indigo" /> Sovereign Weight Stash
          </h3>
          <label className="px-6 py-3 bg-cyan-900/40 border border-cyan-400/40 text-cyan-100 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 cursor-pointer hover:bg-cyan-400 hover:text-slate-950 transition-all shadow-cyan italic">
            <Plus className="w-4 h-4" /> Sync Weights
            <input type="file" className="hidden" onChange={handleTermuxFileUpload} />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {termuxFiles.length > 0 ? termuxFiles.map((f, i) => (
            <div key={i} className="group bg-slate-900/20 border border-slate-800 p-6 rounded-[30px] hover:border-cyan-400/20 transition-all relative">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-cyan-950/30 rounded-2xl border border-cyan-400/10">
                  {f.category === 'model' ? <HardDrive className="w-6 h-6 text-cyan-400" /> : <FileCode className="w-6 h-6 text-indigo-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-slate-100 text-sm truncate uppercase tracking-tight italic">{f.name}</h4>
                  <p className="text-[10px] text-cyan-900 font-mono mt-1 italic">{f.size}</p>
                </div>
                <button 
                  onClick={() => setTermuxFiles(termuxFiles.filter((_, idx) => idx !== i))}
                  className="p-2 text-slate-700 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 border-2 border-dashed border-slate-800 rounded-[40px] flex flex-col items-center justify-center gap-4 opacity-20">
              <Database className="w-16 h-16 text-slate-700" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 italic">Stash Vacuum: No weights detected</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const VitalCard: React.FC<{ label: string, value: string, icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 group hover:border-cyan-400/20 transition-all">
    <div className="flex items-center gap-3 text-slate-600 group-hover:text-cyan-400 transition-colors">
      {icon}
      <span className="text-[9px] font-black uppercase tracking-widest italic">{label}</span>
    </div>
    <div className="text-xl font-black text-slate-100 italic">{value}</div>
  </div>
);

export default TermuxTab;
