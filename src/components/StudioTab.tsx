import React from 'react';
import { 
  MessageSquare, 
  Send, 
  Zap, 
  ImageIcon, 
  Trash2, 
  Sliders, 
  HardDrive, 
  Activity, 
  Gauge, 
  Upload,
  ChevronRight,
  X,
  Brain,
  Download
} from 'lucide-react';
import { ChatMessage, Personality } from '../types';

interface StudioTabProps {
  chatMessages: ChatMessage[];
  studioInput: string;
  isAiProcessing: boolean;
  studioRefImage: { data: string, mimeType: string } | null;
  negativePrompt: string;
  sdParams: any;
  activePersonality: Personality;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  setStudioInput: (input: string) => void;
  setStudioRefImage: (img: any) => void;
  setNegativePrompt: (prompt: string) => void;
  setSdParams: (params: any) => void;
  handleStudioSubmit: (e: React.FormEvent) => void;
}

const StudioTab: React.FC<StudioTabProps> = ({
  chatMessages,
  studioInput,
  isAiProcessing,
  studioRefImage,
  negativePrompt,
  sdParams,
  activePersonality,
  chatEndRef,
  setStudioInput,
  setStudioRefImage,
  setNegativePrompt,
  setSdParams,
  handleStudioSubmit
}) => {
  return (
    <div className="h-full flex flex-col lg:flex-row p-4 md:p-8 gap-4 md:gap-8 overflow-hidden bg-transparent">
      {/* Config Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-4 md:gap-6 shrink-0 overflow-y-auto custom-scrollbar pr-2">
        <div className="crystalline-glass rounded-[30px] p-6 space-y-6 shadow-2xl">
          <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-[0.3em] flex items-center gap-3 italic">
            <Sliders className="w-4 h-4 shadow-cyan" /> Config Matrix
          </h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-cyan-900 uppercase tracking-widest italic">Synaptic Weights</label>
              <select 
                value={sdParams.checkpoint}
                onChange={(e) => setSdParams({...sdParams, checkpoint: e.target.value})}
                className="w-full bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-2 text-[11px] text-slate-100 outline-none focus:border-cyan-400/20 italic"
              >
                <option value="SDXL-V1.0-Base">SDXL-V1.0-Base</option>
                <option value="PHI-V1.0-CRYSTAL">PHI-V1.0-CRYSTAL</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-cyan-900 uppercase tracking-widest italic">Guidance Resonance</label>
              <input 
                type="range" min="1" max="20" step="0.5"
                value={sdParams.cfgScale}
                onChange={(e) => setSdParams({...sdParams, cfgScale: parseFloat(e.target.value)})}
                className="w-full accent-cyan-400 h-1 bg-slate-800 rounded-full appearance-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-600">
                <span>1.0</span>
                <span>{sdParams.cfgScale}</span>
                <span>20.0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="crystalline-glass rounded-[30px] p-6 space-y-4">
          <h4 className="text-[11px] font-black text-cyan-900 uppercase tracking-widest italic">Reference Frame</h4>
          <div className="aspect-square bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl flex items-center justify-center relative group overflow-hidden">
            {studioRefImage ? (
              <div className="relative w-full h-full p-2">
                <img src={`data:${studioRefImage.mimeType};base64,${studioRefImage.data}`} className="w-full h-full object-cover rounded-xl shadow-2xl" />
                <button onClick={() => setStudioRefImage(null)} className="absolute top-4 right-4 p-2 bg-cyan-900/60 border border-cyan-400/40 text-cyan-100 rounded-full hover:bg-cyan-400 hover:text-slate-950 transition-all shadow-cyan">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer flex flex-col items-center gap-3 group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8 text-slate-700 group-hover:text-cyan-400 transition-colors" />
                <span className="text-[9px] font-black text-slate-700 uppercase italic group-hover:text-cyan-400">Inject Visual Data</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64 = (event.target?.result as string).split(',')[1];
                        setStudioRefImage({
                          data: base64,
                          mimeType: file.type
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }} 
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Chat/Generation Area */}
      <div className="flex-1 flex flex-col crystalline-glass rounded-[30px] md:rounded-[40px] shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.02),transparent)] pointer-events-none" />
        
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar relative z-10">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-[14px] shrink-0 flex items-center justify-center border transition-all ${msg.role === 'user' ? 'bg-cyan-900/40 border-cyan-400/40 shadow-cyan' : 'bg-slate-900/40 border-slate-800'}`}>
                {msg.role === 'user' ? <Zap className="w-5 h-5 text-cyan-100 shadow-cyan" /> : <Brain className="w-5 h-5 text-cyan-400" />}
              </div>
              <div className={`max-w-[80%] space-y-4 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block p-5 rounded-3xl text-sm leading-relaxed italic ${msg.role === 'user' ? 'bg-cyan-900/10 text-cyan-100 border border-cyan-400/20' : 'bg-slate-900/20 border border-slate-800 text-slate-300 rounded-tl-none'}`}>
                  {msg.text}
                </div>
                {msg.type === 'image' && (
                  <div className="relative group/img inline-block">
                    <img src={msg.url} className="rounded-3xl border border-slate-800 shadow-2xl max-w-full lg:max-w-md transition-transform duration-700 group-hover/img:scale-[1.02]" />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-all rounded-3xl flex items-center justify-center gap-4">
                      <button className="p-3 bg-cyan-900/60 border border-cyan-400/30 text-cyan-100 rounded-xl shadow-xl hover:scale-110 transition-all"><Download className="w-5 h-5" /></button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleStudioSubmit} className="p-6 md:p-8 bg-slate-950/60 border-t border-cyan-400/5 relative z-20 backdrop-blur-3xl">
          <div className="relative">
            <input 
              value={studioInput}
              onChange={(e) => setStudioInput(e.target.value)}
              placeholder="Describe the crystalline synthesis..."
              className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl px-6 py-5 pr-16 text-sm text-slate-100 placeholder:text-slate-800 outline-none focus:border-cyan-400/20 italic"
            />
            <button 
              type="submit"
              disabled={isAiProcessing}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-cyan-900/60 border border-cyan-400/40 text-cyan-100 rounded-xl shadow-cyan hover:bg-cyan-400 hover:text-slate-950 disabled:opacity-50 transition-all"
            >
              {isAiProcessing ? <Zap className="w-5 h-5 animate-spin shadow-cyan" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudioTab;
