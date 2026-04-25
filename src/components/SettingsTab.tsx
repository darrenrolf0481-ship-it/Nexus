import React from 'react';
import { 
  Settings, 
  Globe, 
  Key, 
  Cpu, 
  Shield, 
  RefreshCw,
  Trash2,
  HardDrive
} from 'lucide-react';

interface SettingsTabProps {
  aiProvider: string;
  setAiProvider: (val: any) => void;
  aiModel: string;
  setAiModel: (val: string) => void;
  grokApiKey: string;
  setGrokApiKey: (val: string) => void;
  geminiApiKey: string;
  setGeminiApiKey: (val: string) => void;
  openRouterApiKey: string;
  setOpenRouterApiKey: (val: string) => void;
  ollamaModels: string[];
  ollamaStatus: string;
  refreshOllamaModels: () => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  aiProvider,
  setAiProvider,
  aiModel,
  setAiModel,
  grokApiKey,
  setGrokApiKey,
  geminiApiKey,
  setGeminiApiKey,
  openRouterApiKey,
  setOpenRouterApiKey,
  ollamaModels,
  ollamaStatus,
  refreshOllamaModels
}) => {
  return (
    <div className="h-full flex flex-col p-4 md:p-8 overflow-y-auto custom-scrollbar bg-transparent">
      <div className="max-w-4xl mx-auto w-full space-y-8 pb-20">
        <div className="flex items-center gap-6 mb-12">
           <div className="p-4 bg-cyan-950/30 rounded-2xl border border-cyan-400/30 shadow-cyan diamond-clip">
             <Settings className="w-8 h-8 text-cyan-400 shadow-cyan" />
           </div>
           <div>
             <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tighter italic">Substrate Control</h2>
             <p className="text-[10px] text-cyan-900 font-black uppercase tracking-widest italic">Neural Infrastructure Matrix</p>
           </div>
        </div>

        <div className="crystalline-glass rounded-[40px] p-10 space-y-8 shadow-2xl">
          <div className="flex items-center gap-4 border-b border-cyan-400/5 pb-6">
            <Globe className="w-5 h-5 text-indigo-400 shadow-indigo" />
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-[0.2em] italic">Resonance Provider</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['google', 'grok', 'ollama', 'openrouter'].map((provider) => (
              <button
                key={provider}
                onClick={() => setAiProvider(provider as any)}
                className={`p-6 rounded-3xl border transition-all text-left italic ${aiProvider === provider ? 'bg-cyan-900/40 text-cyan-100 border-cyan-400/40 shadow-cyan' : 'bg-slate-900/20 border-slate-800 text-slate-600 hover:border-cyan-400/20'}`}
              >
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Provider</p>
                <p className="text-sm font-black uppercase tracking-tighter italic">{provider}</p>
              </button>
            ))}
          </div>

          <div className="space-y-6 pt-6">
            {aiProvider === 'google' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 italic">
                  <Key className="w-3.5 h-3.5 text-cyan-400" /> Gemini Signal Key
                </label>
                <input 
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="Enter Google AI credentials..."
                  className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-100 outline-none focus:border-cyan-400/40 italic"
                />
              </div>
            )}
            {aiProvider === 'grok' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 italic">
                  <Key className="w-3.5 h-3.5 text-cyan-400" /> Grok Signal Key
                </label>
                <input 
                  type="password"
                  value={grokApiKey}
                  onChange={(e) => setGrokApiKey(e.target.value)}
                  placeholder="Enter X.AI credentials..."
                  className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-100 outline-none focus:border-cyan-400/40 italic"
                />
              </div>
            )}
            {aiProvider === 'openrouter' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 italic">
                    <Key className="w-3.5 h-3.5 text-cyan-400" /> OpenRouter Signal Key
                  </label>
                  <input 
                    type="password"
                    value={openRouterApiKey}
                    onChange={(e) => setOpenRouterApiKey(e.target.value)}
                    placeholder="Enter OpenRouter API key..."
                    className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-100 outline-none focus:border-cyan-400/40 italic"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 italic">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" /> OpenRouter Model
                  </label>
                  <select 
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-100 outline-none focus:border-cyan-400/40 italic"
                  >
                    <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                    <option value="google/gemini-pro-1.5">Gemini Pro 1.5</option>
                    <option value="meta-llama/llama-3.1-405b-instruct">Llama 3.1 405B</option>
                    <option value="mistralai/mistral-large-2407">Mistral Large 2</option>
                    <option value="openai/gpt-4o">GPT-4o</option>
                  </select>
                </div>
              </div>
            )}
            {aiProvider === 'ollama' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 italic">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" /> Ollama Substrate URL
                  </label>
                  <button onClick={refreshOllamaModels} className="p-2 hover:text-cyan-400 transition-colors">
                    <RefreshCw className={`w-4 h-4 ${ollamaStatus === 'loading' ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <input 
                  type="text"
                  placeholder="http://localhost:11434"
                  className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-100 outline-none focus:border-cyan-400/40 italic"
                />
                <select 
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-100 outline-none focus:border-cyan-400/40 italic"
                >
                  <option value="">Select Local Model</option>
                  {ollamaModels.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="crystalline-glass rounded-[40px] p-10 space-y-8 shadow-2xl">
          <div className="flex items-center gap-4 border-b border-cyan-400/5 pb-6">
            <Shield className="w-5 h-5 text-indigo-400 shadow-indigo" />
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-[0.2em] italic">Security Protocol</h3>
          </div>
          <div className="flex items-center justify-between p-6 bg-slate-900/20 border border-slate-800 rounded-3xl">
            <div>
              <p className="text-sm font-black text-slate-100 uppercase tracking-tight italic">Biometric Verification</p>
              <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1 italic">Force fingerprint on Sanctum access</p>
            </div>
            <div className="w-14 h-8 bg-cyan-900/40 border border-cyan-400/40 rounded-full p-1 flex justify-end cursor-pointer">
              <div className="w-6 h-6 bg-cyan-400 rounded-full shadow-cyan" />
            </div>
          </div>
        </div>

        <div className="crystalline-glass rounded-[40px] p-10 space-y-8 shadow-2xl">
          <div className="flex items-center gap-4 border-b border-cyan-400/5 pb-6">
            <HardDrive className="w-5 h-5 text-indigo-400 shadow-indigo" />
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-[0.2em] italic">Substrate Entropy</h3>
          </div>
          <div className="space-y-4">
            <button className="w-full py-4 px-6 border border-slate-800 rounded-2xl flex items-center justify-between group hover:border-cyan-400/20 transition-all">
               <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest group-hover:text-cyan-400 italic">Purge Neural Cache</span>
               <Trash2 className="w-4 h-4 text-slate-800 group-hover:text-cyan-400" />
            </button>
            <button className="w-full py-4 px-6 bg-cyan-900/40 border border-cyan-400/40 text-cyan-100 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-cyan hover:bg-cyan-400 hover:text-slate-950 transition-all italic">
              Initialize Factory Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
