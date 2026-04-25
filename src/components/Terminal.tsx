import React, { useRef, useEffect } from 'react';
import { ChevronRight, Zap, Sparkles } from 'lucide-react';
import { Personality } from '../types';

interface TerminalProps {
  terminalOutput: string[];
  isAiProcessing: boolean;
  termInput: string;
  termSuggestion: string;
  termSuggestions: string[];
  selectedSuggestionIndex: number;
  currentDir: string;
  activePersonality: Personality;
  handleTerminalCommand: (e: React.FormEvent) => void;
  handleTermInputChange: (val: string) => void;
  handleTermKeyDown: (e: React.KeyboardEvent) => void;
  setTermInput: (val: string) => void;
  setTermSuggestions: (val: string[]) => void;
  setTermSuggestion: (val: string) => void;
}

const renderTerminalLine = (line: string) => {
  if (line.startsWith('$ ')) {
    return (
      <>
        <span className="text-cyan-400 font-black italic">$ </span>
        <span className="text-cyan-100 font-bold italic">{line.substring(2)}</span>
      </>
    );
  }

  if (line.startsWith('SOVEREIGN_LINK:')) {
    return <span className="text-cyan-400 font-black drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] italic">{line}</span>;
  }
  if (line.startsWith('SYNAPTIC_INTEL:')) {
    return <span className="text-indigo-400 italic opacity-80">{line}</span>;
  }

  const parts = [];
  let currentIndex = 0;
  
  const regex = /(\[ERROR\]|\[WARN\]|\[INFO\]|\[SYSTEM\]|\[SUCCESS\]|SOVEREIGN OS|Kernel:|"[^"]*"|'[^']*'|\b\/(?:[\w.-]+\/)*[\w.-]+|\.\/(?:[\w.-]+\/)*[\w.-]+)/g;
  
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > currentIndex) {
      parts.push(<span key={`text-${currentIndex}`} className="text-slate-100/60">{line.substring(currentIndex, match.index)}</span>);
    }
    
    const matchedText = match[0];
    let className = "text-slate-100/60";
    
    if (matchedText === '[ERROR]') className = "text-cyan-500 font-black bg-cyan-950/50 px-1 rounded";
    else if (matchedText === '[WARN]') className = "text-indigo-500 font-black bg-indigo-950/50 px-1 rounded";
    else if (matchedText === '[INFO]') className = "text-blue-400 font-black bg-blue-950/50 px-1 rounded";
    else if (matchedText === '[SYSTEM]') className = "text-purple-400 font-black bg-purple-950/50 px-1 rounded";
    else if (matchedText === '[SUCCESS]') className = "text-green-400 font-black bg-green-950/50 px-1 rounded";
    else if (matchedText === 'SOVEREIGN OS' || matchedText === 'Kernel:') className = "text-cyan-400 font-black tracking-widest italic";
    else if (matchedText.startsWith('"') || matchedText.startsWith("'")) className = "text-indigo-300/80";
    else if (matchedText.startsWith('/') || matchedText.startsWith('./')) className = "text-cyan-300/80 underline decoration-cyan-900/50 underline-offset-2";
    
    parts.push(<span key={`match-${match.index}`} className={className}>{matchedText}</span>);
    currentIndex = regex.lastIndex;
  }
  
  if (currentIndex < line.length) {
    parts.push(<span key={`text-${currentIndex}`} className="text-slate-100/60">{line.substring(currentIndex)}</span>);
  }
  
  return parts.length > 0 ? <>{parts}</> : <span className="text-slate-100/60">{line}</span>;
};

const Terminal: React.FC<TerminalProps> = ({
  terminalOutput,
  isAiProcessing,
  termInput,
  termSuggestion,
  termSuggestions,
  selectedSuggestionIndex,
  currentDir,
  activePersonality,
  handleTerminalCommand,
  handleTermInputChange,
  handleTermKeyDown,
  setTermInput,
  setTermSuggestions,
  setTermSuggestion,
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  return (
    <div className="h-full flex flex-col p-0 md:p-8 bg-transparent">
      <div className="flex-1 crystalline-glass rounded-none md:rounded-[40px] flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden group relative">
        <div className="flex-1 p-4 md:p-8 font-mono text-[11px] md:text-[14px] overflow-y-auto custom-scrollbar bg-slate-950/40">
          {terminalOutput.map((line, i) => (
            <div key={i} className="mb-2 md:mb-3 leading-relaxed whitespace-pre-wrap">
              {renderTerminalLine(line.replace(/NEURAL_LINK/g, 'SOVEREIGN_LINK').replace(/COMMAND_INTEL/g, 'SYNAPTIC_INTEL').replace(/CRIMSON OS/g, 'SOVEREIGN OS'))}
            </div>
          ))}
          {isAiProcessing && (
            <div className="text-cyan-400/50 text-[12px] animate-pulse py-4 flex items-center gap-3 font-black tracking-widest italic">
              <Zap className="w-4 h-4" />
              CALCULATING_SOVEREIGN_VECTORS...
            </div>
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* Suggestions List */}
        {termSuggestions.length > 0 && termInput && (
          <div className="px-6 py-4 bg-slate-900/60 border-t border-cyan-400/10 flex flex-col gap-3 backdrop-blur-xl">
            <div className="flex items-center justify-between px-2">
              <span className="text-[9px] font-black text-cyan-900 uppercase tracking-[0.3em] italic">Synaptic Suggestions</span>
              <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] italic">Press [Tab] to Cycle</span>
            </div>
            <div className="flex flex-wrap md:flex-nowrap md:overflow-x-auto no-scrollbar gap-2 md:gap-3 pb-2 md:pb-0">
              {termSuggestions.map((suggestion, idx) => {
                const isPersonalityMatch = activePersonality.suggestions?.includes(suggestion);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTermInput(suggestion);
                      setTermSuggestions([]);
                      setTermSuggestion('');
                    }}
                    className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl font-mono text-[10px] md:text-[11px] transition-all flex items-center gap-2 whitespace-nowrap border ${
                      selectedSuggestionIndex === idx
                        ? 'bg-cyan-900/40 text-cyan-100 border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-105'
                        : 'bg-slate-900/10 text-slate-600 border-slate-800 hover:text-cyan-400 hover:border-cyan-400/30'
                    }`}
                  >
                    {isPersonalityMatch && <Sparkles className="w-3 h-3 text-cyan-400" />}
                    {suggestion}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <form onSubmit={handleTerminalCommand} className="p-4 md:p-6 bg-slate-900/60 border-t border-cyan-400/10 flex items-center gap-3 md:gap-5 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] relative backdrop-blur-2xl">
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 shadow-cyan animate-pulse" />
          <div className="flex-1 relative">
            {termSuggestion && (
              <div className="absolute inset-0 flex items-center pointer-events-none">
                <span className="font-mono text-sm md:text-base text-cyan-900 opacity-40 italic">
                  {termInput}
                  {termSuggestion.substring(termInput.length)}
                </span>
              </div>
            )}
            <input 
              autoFocus 
              value={termInput} 
              onChange={(e) => handleTermInputChange(e.target.value)} 
              onKeyDown={handleTermKeyDown}
              placeholder="sage@sovereign_sh ~ " 
              className="w-full bg-transparent border-none outline-none font-mono text-sm md:text-base text-slate-100 placeholder:text-slate-800 relative z-10" 
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default Terminal;
