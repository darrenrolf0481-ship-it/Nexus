import React from 'react';
import { 
  HardDrive, 
  Upload, 
  Database, 
  Trash2, 
  FileText, 
  FileCode,
  Search
} from 'lucide-react';
import { StorageFile } from '../types';

interface StorageTabProps {
  storageFiles: StorageFile[];
  handleStorageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setStorageFiles: (files: StorageFile[]) => void;
}

const StorageTab: React.FC<StorageTabProps> = ({
  storageFiles,
  handleStorageUpload,
  setStorageFiles
}) => {
  return (
    <div className="h-full flex flex-col p-4 md:p-8 overflow-hidden bg-transparent">
      <div className="flex-1 crystalline-glass rounded-[30px] md:rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-cyan-400/5 bg-slate-950/60 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 backdrop-blur-3xl">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-cyan-950/30 rounded-2xl border border-cyan-400/20 shadow-cyan diamond-clip">
              <HardDrive className="w-8 h-8 text-cyan-400 shadow-cyan" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tighter italic">Sovereign Vault</h2>
              <p className="text-[10px] text-cyan-900 font-black uppercase tracking-widest italic">Persistent Crystalline Knowledge Base</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
              <input 
                placeholder="Search resonance..." 
                className="bg-slate-900/40 border border-slate-800 rounded-xl pl-12 pr-6 py-3 text-[11px] text-slate-100 outline-none focus:border-cyan-400/40 w-64 italic"
              />
            </div>
            <label className="px-8 py-3 bg-cyan-900/40 border border-cyan-400/40 text-cyan-100 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 cursor-pointer hover:bg-cyan-400 hover:text-slate-950 transition-all shadow-cyan italic">
              <Upload className="w-4 h-4" /> Ingest Resonance
              <input type="file" className="hidden" multiple onChange={handleStorageUpload} />
            </label>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-950/20">
          {storageFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {storageFiles.map((f) => (
                <div key={f.id} className="group crystalline-glass border-slate-800/40 p-6 rounded-[30px] hover:border-cyan-400/30 transition-all relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-start justify-between relative z-10">
                    <div className="p-4 bg-cyan-900/10 rounded-2xl mb-4 border border-cyan-400/10">
                      {f.type === 'pdf' ? <FileText className="w-6 h-6 text-indigo-400" /> : <FileCode className="w-6 h-6 text-cyan-400" />}
                    </div>
                    <button 
                      onClick={() => setStorageFiles(storageFiles.filter(file => file.id !== f.id))}
                      className="p-2 text-slate-700 hover:text-cyan-400 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative z-10">
                    <h4 className="font-black text-slate-100 text-sm truncate uppercase tracking-tight italic">{f.name}</h4>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[9px] text-cyan-900 font-black uppercase tracking-widest italic">{f.type} Resonance</span>
                      <span className="text-[9px] text-slate-500 font-mono">{f.size}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-cyan-400/5 flex items-center justify-between text-[8px] font-black text-slate-800 uppercase tracking-[0.2em] italic">
                      <span>Indexed: {f.date}</span>
                      <span className="text-cyan-900">Synchronized</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-6 opacity-20 py-20">
              <Database className="w-24 h-24 text-slate-700" />
              <div className="text-center space-y-2">
                <p className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-100 italic">Vault Vacuum</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 italic">Awaiting Crystalline Ingestion</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-6 bg-slate-950/80 border-t border-cyan-400/5 flex justify-between items-center px-10 shrink-0 backdrop-blur-3xl">
          <div className="flex gap-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-cyan" />
              <span className="text-[9px] font-black text-cyan-900 uppercase tracking-widest italic">Core Status: Resonant</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Matrix Occupancy: {(storageFiles.length * 4.2).toFixed(1)}%</span>
            </div>
          </div>
          <span className="text-[9px] font-mono text-slate-800 uppercase italic">{storageFiles.length} Nodes Active</span>
        </div>
      </div>
    </div>
  );
};

export default StorageTab;
