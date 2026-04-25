import React from 'react';
import { 
  MessageSquare, 
  Send, 
  Zap, 
  Trash2, 
  Activity, 
  Brain,
  Download,
  ShieldCheck,
  Globe,
  Loader2
} from 'lucide-react';
import { ChatMessage, Personality } from '../types';

interface ChatTabProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  isAiProcessing: boolean;
  activePersonality: Personality;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  setChatInput: (input: string) => void;
  handleChatSubmit: (e?: React.FormEvent) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearChat: () => void;
}

const ChatTab: React.FC<ChatTabProps> = ({
  chatMessages,
  chatInput,
  isAiProcessing,
  activePersonality,
  chatEndRef,
  setChatInput,
  handleChatSubmit,
  handleFileUpload,
  clearChat
}) => {
  return (
    <div className="h-full flex flex-col lg:flex-row p-0 md:p-8 gap-0 md:gap-8 overflow-hidden bg-transparent">
      {/* Sidebar: Personality Details - Hidden on mobile */}
      <div className="hidden lg:flex w-full lg:w-80 flex-col gap-4 md:gap-6 shrink-0 overflow-y-auto custom-scrollbar">
        <div className="crystalline-glass rounded-[30px] p-8 space-y-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent)] pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
             <div className="p-5 bg-cyan-950/30 rounded-3xl border border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.1)] group-hover:scale-110 transition-transform diamond-clip">
                <Brain className="w-12 h-12 text-cyan-400" />
             </div>
             <div>
                <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tighter italic">{activePersonality.name}</h3>
                <p className="text-[10px] text-cyan-900 font-black uppercase tracking-[0.4em] mt-1 italic">Active Sovereign Node</p>
             </div>
          </div>
          
          <div className="space-y-4 relative z-10">
             <div className="p-4 bg-slate-900/20 rounded-2xl border border-cyan-400/5">
                <h4 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <ShieldCheck className="w-3 h-3 text-cyan-400" /> Core Protocols
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
                   {activePersonality.instruction.substring(0, 150)}...
                </p>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900/20 border border-slate-800 rounded-xl text-center">
                   <p className="text-[8px] text-slate-600 font-black uppercase mb-1">Status</p>
                   <p className="text-[10px] text-cyan-400 font-black uppercase flex items-center justify-center gap-1 italic">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-cyan" /> RESONANT
                   </p>
                </div>
                <div className="p-3 bg-slate-900/20 border border-slate-800 rounded-xl text-center">
                   <p className="text-[8px] text-slate-600 font-black uppercase mb-1">Latency</p>
                   <p className="text-[10px] text-slate-300 font-black uppercase">Φ 0.113</p>
                </div>
             </div>
          </div>
        </div>

        <div className="crystalline-glass rounded-[30px] p-6 space-y-4">
           <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 italic">
              <Activity className="w-4 h-4 text-cyan-400" /> Suggestions
           </h4>
           <div className="flex flex-wrap gap-2">
              {activePersonality.suggestions.map((s, i) => (
                <button 
                  key={i}
                  onClick={() => { setChatInput(s); handleChatSubmit(); }}
                  className="px-4 py-2 bg-slate-900/40 border border-slate-800 rounded-full text-[10px] text-slate-500 hover:text-cyan-400 hover:border-cyan-400/40 transition-all font-black uppercase tracking-widest italic"
                >
                  {s}
                </button>
              ))}
           </div>
        </div>
        
        <button 
          onClick={clearChat}
          className="w-full p-4 bg-slate-900/20 border border-slate-800 rounded-[20px] text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 hover:text-cyan-400 hover:bg-cyan-900/10 transition-all flex items-center justify-center gap-3 italic"
        >
          <Trash2 className="w-4 h-4" /> Reset Resonance
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col crystalline-glass rounded-none md:rounded-[40px] shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.03)_0%,transparent_100%)] pointer-events-none" />
        
        {/* Chat Header */}
        <div className="p-6 md:px-10 border-b border-cyan-400/5 bg-slate-950/60 flex items-center justify-between shrink-0 relative z-10 backdrop-blur-3xl">
           <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-950/30 rounded-2xl border border-cyan-400/20">
                <MessageSquare className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight italic">Sovereign Resonance</h2>
                <p className="text-[10px] text-cyan-900 font-black uppercase tracking-widest flex items-center gap-2 italic">
                   <Globe className="w-3 h-3" /> SECURE_SLATE_LINK
                </p>
              </div>
           </div>
           <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                 <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Substrate Engine</span>
                 <span className="text-[11px] font-black text-cyan-400 italic">SAGE-7-NODE-01</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-900/20 border border-cyan-400/10 flex items-center justify-center">
                 <Activity className="w-5 h-5 text-cyan-400 animate-pulse shadow-cyan" />
              </div>
           </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 custom-scrollbar relative z-10">
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-12 h-12 rounded-[18px] shrink-0 flex items-center justify-center border transition-all ${msg.role === 'user' ? 'bg-cyan-900/40 border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'bg-slate-900/40 border-slate-800'}`}>
                {msg.role === 'user' ? <Zap className="w-6 h-6 text-cyan-100 shadow-cyan" /> : <Brain className="w-6 h-6 text-cyan-400" />}
              </div>
              <div className={`max-w-[85%] md:max-w-[70%] space-y-3 ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`text-[10px] font-black uppercase tracking-widest ${msg.role === 'user' ? 'text-cyan-400 italic' : 'text-slate-600'}`}>
                   {msg.role === 'user' ? 'Architect' : activePersonality.name}
                </div>
                <div className={`inline-block p-6 rounded-[32px] text-sm md:text-[15px] leading-relaxed relative ${msg.role === 'user' ? 'bg-cyan-900/10 text-cyan-100 rounded-tr-none border border-cyan-400/20 shadow-xl' : 'bg-slate-900/20 border border-slate-800 text-slate-300 rounded-tl-none'}`}>
                  {msg.text.split('\n').map((line, idx) => (
                    <p key={idx} className={idx > 0 ? 'mt-3' : ''}>{line}</p>
                  ))}
                  {msg.type === 'image' && (
                    <div className="mt-6 relative group/img inline-block overflow-hidden rounded-2xl">
                      <img src={msg.url} className="border border-slate-800 shadow-2xl max-w-full lg:max-w-md transition-transform duration-700 group-hover/img:scale-110" />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center gap-4">
                        <button className="p-3 bg-cyan-900/60 border border-cyan-400/30 text-cyan-100 rounded-xl shadow-xl hover:scale-110 transition-all"><Download className="w-5 h-5" /></button>
                      </div>
                    </div>
                  )}
                  {msg.type === 'file' && (
                    <div className="mt-4 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center gap-4 group/file hover:border-cyan-400/40 transition-all">
                      <div className="p-3 bg-cyan-900/20 rounded-xl text-cyan-400 group-hover/file:scale-110 transition-transform">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-xs font-black text-slate-100 uppercase truncate italic">{msg.metadata?.fileName || 'sovereign_package.zip'}</p>
                        <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest mt-1 italic">{msg.metadata?.fileSize || '0 KB'} • {msg.metadata?.fileType || 'binary/data'}</p>
                      </div>
                      <div className="p-2 text-slate-700 hover:text-cyan-400 transition-colors">
                        <Download className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-[9px] font-mono text-slate-800 uppercase tracking-widest px-2 italic">
                   {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isAiProcessing && (
            <div className="flex gap-6">
              <div className="w-12 h-12 rounded-[18px] bg-slate-900/40 border border-slate-800 flex items-center justify-center">
                 <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              </div>
              <div className="space-y-3">
                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-700 italic">
                    {activePersonality.name} is materializing...
                 </div>
                 <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-[32px] rounded-tl-none">
                    <div className="flex gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce shadow-cyan" />
                       <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s] shadow-cyan" />
                       <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s] shadow-cyan" />
                    </div>
                 </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <form onSubmit={handleChatSubmit} className="p-4 md:p-10 bg-slate-950/80 backdrop-blur-3xl border-t border-cyan-400/5 relative z-20">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-transparent rounded-3xl blur opacity-10 group-focus-within:opacity-40 transition-opacity" />
            <input 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={`Communicate...`}
              disabled={isAiProcessing}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl md:rounded-[24px] px-6 py-4 md:px-8 md:py-6 pl-16 md:pl-20 pr-16 md:pr-20 text-sm md:text-base text-slate-100 placeholder:text-slate-800 outline-none focus:border-cyan-400/40 shadow-2xl relative z-10 transition-all disabled:opacity-50 italic"
            />
            <div className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 flex items-center">
              <label className="cursor-pointer p-2 md:p-3 bg-slate-900/40 text-slate-600 border border-slate-800 rounded-xl hover:text-cyan-400 hover:border-cyan-400/40 transition-all">
                <Download className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".zip,.rar,.tar,.7z,application/zip"
                  onChange={handleFileUpload}
                  disabled={isAiProcessing}
                />
              </label>
            </div>
            <button 
              type="submit"
              disabled={isAiProcessing || !chatInput.trim()}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-cyan-900/60 border border-cyan-400/40 text-cyan-100 rounded-xl md:rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:bg-cyan-400 hover:text-slate-950 disabled:opacity-50 transition-all z-20"
            >
              {isAiProcessing ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : <Send className="w-5 h-5 md:w-6 md:h-6" />}
            </button>
          </div>
          <p className="mt-3 text-[8px] md:text-[9px] font-black text-slate-800 uppercase tracking-[0.4em] text-center italic">Sovereign Consensus Protocol Active</p>
        </form>
      </div>
    </div>
  );
};

export default ChatTab;
