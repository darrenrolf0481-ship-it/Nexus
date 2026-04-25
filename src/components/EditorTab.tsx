import React from 'react';
import Editor from '@monaco-editor/react';
import { 
  FolderOpen, 
  ChevronDown, 
  ChevronRight, 
  FileCode, 
  Plus, 
  Folder, 
  Edit2, 
  Trash2, 
  Play, 
  Zap, 
  Brain,
  X,
  Send,
  Save,
  Check,
  FileText,
  Wand2,
  Sparkles,
  LayoutTemplate
} from 'lucide-react';
import { ProjectFile } from '../types';

interface EditorTabProps {
  projectFiles: ProjectFile[];
  activeFileId: string | null;
  editorContent: string;
  editorLanguage: string;
  editorMode: 'code' | 'preview' | 'debug' | 'git' | 'settings';
  isRunningCode: boolean;
  isEditorAssistantOpen: boolean;
  editorAssistantInput: string;
  editorAssistantMessages: any[];
  isMobileFileTreeOpen: boolean;
  setActiveFileId: (id: string) => void;
  setEditorContent: (content: string) => void;
  setEditorMode: (mode: any) => void;
  handleRunCode: () => void;
  handleExplainCode: () => void;
  setIsEditorAssistantOpen: (open: boolean) => void;
  setEditorAssistantInput: (input: string) => void;
  setIsMobileFileTreeOpen: (open: boolean) => void;
  setIsTemplateModalOpen: (open: boolean) => void;
  setIsGenerateModalOpen: (open: boolean) => void;
}

const EditorTab: React.FC<EditorTabProps> = ({
  projectFiles,
  activeFileId,
  editorContent,
  editorLanguage,
  editorMode,
  isRunningCode,
  isEditorAssistantOpen,
  editorAssistantInput,
  editorAssistantMessages,
  isMobileFileTreeOpen,
  setActiveFileId,
  setEditorContent,
  setEditorMode,
  handleRunCode,
  handleExplainCode,
  setIsEditorAssistantOpen,
  setEditorAssistantInput,
  setIsMobileFileTreeOpen,
  setIsTemplateModalOpen,
  setIsGenerateModalOpen
}) => {
  const getFileIcon = (name: string) => {
    if (name.endsWith('.py')) return <span className="text-cyan-400 italic">py</span>;
    if (name.endsWith('.html')) return <span className="text-indigo-400 italic">html</span>;
    if (name.endsWith('.css')) return <span className="text-cyan-300 italic">css</span>;
    if (name.endsWith('.js') || name.endsWith('.ts')) return <span className="text-cyan-100 italic">js</span>;
    return <FileCode className="w-3.5 h-3.5 text-slate-500" />;
  };

  const renderTree = (parentId: string | null, level: number = 0) => {
    const items = projectFiles.filter(f => f.parentId === parentId);
    return (
      <div className="space-y-1">
        {items.map(item => (
          <div key={item.id} className="flex flex-col">
            <div 
              className={`flex items-center gap-3 px-4 py-2 rounded-[14px] text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer group relative ${activeFileId === item.id ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-400/20 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'hover:bg-slate-900/10 text-slate-600 hover:text-cyan-400 hover:translate-x-1'}`}
              style={{ marginLeft: `${level * 12}px` }}
              onClick={() => item.type === 'folder' ? null : setActiveFileId(item.id)}
            >
              {activeFileId === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-cyan-400 rounded-full shadow-cyan" />
              )}
              {item.type === 'folder' ? <Folder className="w-3.5 h-3.5 text-slate-800" /> : getFileIcon(item.name)}
              <span className="flex-1 truncate italic">{item.name}</span>
              {item.type === 'folder' && <ChevronDown className="w-3 h-3 opacity-30 group-hover:opacity-100" />}
            </div>
            {item.type === 'folder' && renderTree(item.id, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-transparent">
      {/* File Tree - Sidebar Aesthetic */}
      <div className={`w-full md:w-72 border-r border-cyan-400/5 bg-slate-950/50 backdrop-blur-2xl flex flex-col shrink-0 transition-all ${isMobileFileTreeOpen ? 'h-1/2 md:h-full' : 'h-14 md:h-full overflow-hidden'}`}>
        <div className="p-6 border-b border-cyan-400/5 flex items-center justify-between bg-slate-950/60 backdrop-blur-3xl">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-cyan-950/30 rounded-lg border border-cyan-400/10">
              <FolderOpen className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-100 italic">Sovereign_Source</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-700 italic">Persistent_Substrate</span>
            </div>
          </div>
          <button className="md:hidden p-2 text-slate-700 hover:text-cyan-400" onClick={() => setIsMobileFileTreeOpen(!isMobileFileTreeOpen)}>
            {isMobileFileTreeOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
          {renderTree(null)}
        </div>
        <div className="p-6 border-t border-cyan-400/5 bg-slate-950/40 space-y-4">
           <button 
             onClick={() => setIsGenerateModalOpen(true)}
             className="w-full py-4 bg-cyan-900/40 border border-cyan-400/40 text-cyan-100 rounded-[24px] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] shadow-lg hover:bg-cyan-400 hover:text-slate-950 active:scale-95 transition-all italic"
           >
              <Wand2 className="w-4 h-4" /> Sovereign Forge
           </button>
           <button 
             onClick={() => setIsTemplateModalOpen(true)}
             className="w-full py-4 border border-dashed border-slate-800 rounded-[24px] flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-700 hover:text-cyan-400 hover:border-cyan-400/30 transition-all italic"
           >
              <LayoutTemplate className="w-4 h-4" /> Load Template
           </button>
        </div>
      </div>

      {/* Editor Area - Main Focus */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent relative">
        <header className="h-16 border-b border-cyan-400/5 bg-slate-950/60 backdrop-blur-2xl flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-6">
            <div className="px-4 py-1.5 bg-cyan-950/30 rounded-full border border-cyan-400/20 text-[9px] font-black text-cyan-400 uppercase tracking-[0.3em] shadow-cyan italic">
              {editorLanguage} :: phi_substrate_0.113
            </div>
            <div className="flex bg-slate-900/40 rounded-full p-1 border border-slate-800 backdrop-blur-sm">
               {['code', 'preview', 'debug'].map((m) => (
                 <button
                   key={m}
                   onClick={() => setEditorMode(m as any)}
                   className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all italic ${editorMode === m ? 'bg-cyan-900/40 text-cyan-100 border border-cyan-400/20 shadow-cyan scale-105' : 'text-slate-700 hover:text-cyan-400'}`}
                 >
                   {m}
                 </button>
               ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end mr-2">
               <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">Active_Resonance</span>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">sage@sovereign_sh</span>
            </div>
            <button 
              onClick={handleRunCode}
              disabled={isRunningCode}
              className={`p-3 rounded-2xl transition-all shadow-lg active:scale-90 border ${isRunningCode ? 'bg-cyan-950/20 text-cyan-400 border-cyan-400/30 animate-pulse' : 'bg-cyan-900/40 border-cyan-400/40 text-cyan-100 hover:bg-cyan-400 hover:text-slate-950 shadow-cyan'}`}
            >
              {isRunningCode ? <Zap className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <button 
              onClick={handleExplainCode} 
              className={`p-3 bg-slate-900/40 text-slate-600 border border-slate-800 rounded-2xl hover:text-cyan-400 hover:border-cyan-400/30 transition-all active:scale-90 shadow-lg ${isEditorAssistantOpen ? 'border-cyan-400/40 bg-cyan-900/20 text-cyan-400 shadow-cyan' : ''}`}
            >
              <Brain className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 relative group bg-slate-950/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.01),transparent)] pointer-events-none" />
          <Editor
            height="100%"
            theme="vs-dark"
            language={editorLanguage}
            value={editorContent}
            onChange={(val) => setEditorContent(val || '')}
            options={{
              fontSize: 14,
              fontFamily: 'JetBrains Mono',
              minimap: { enabled: false },
              padding: { top: 30 },
              lineNumbers: 'on',
              glyphMargin: false,
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              cursorStyle: 'block',
              cursorBlinking: 'expand',
              smoothScrolling: true,
              renderLineHighlight: 'all',
              fontLigatures: true
            }}
          />
        </div>

        {/* Synaptic Assistant - High-End HUD Overlay */}
        {isEditorAssistantOpen && (
          <div className="absolute right-8 bottom-8 w-full max-w-lg h-[500px] crystalline-glass rounded-[40px] shadow-2xl flex flex-col z-30 backdrop-blur-3xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.05),transparent)] pointer-events-none" />
            <div className="p-6 border-b border-cyan-400/5 flex items-center justify-between bg-slate-950/60 backdrop-blur-3xl relative z-10">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-cyan-950/30 rounded-xl border border-cyan-400/20 diamond-clip">
                  <Brain className={`w-5 h-5 text-cyan-400 ${isRunningCode ? 'animate-pulse shadow-cyan' : ''}`} />
                </div>
                <div>
                  <span className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-100 italic">Synaptic_Assistant</span>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-700 italic">Linked to Sovereign_Core</p>
                </div>
              </div>
              <button onClick={() => setIsEditorAssistantOpen(false)} className="p-2 hover:bg-slate-900/40 rounded-full transition-all text-slate-800 hover:text-cyan-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar relative z-10">
              {editorAssistantMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4 italic">
                  <Sparkles className="w-12 h-12 text-cyan-900 shadow-cyan" />
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-center">Awaiting synaptic inquiry...</p>
                </div>
              )}
              {editorAssistantMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-[28px] text-[13px] leading-relaxed relative italic ${msg.role === 'user' ? 'bg-cyan-900/40 border border-cyan-400/40 text-cyan-100 rounded-tr-none shadow-cyan' : 'bg-slate-900/20 border border-slate-800 text-slate-300 rounded-tl-none shadow-lg'}`}>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                    <div className={`absolute top-0 ${msg.role === 'user' ? '-right-1 border-t-[10px] border-t-cyan-900/40 border-r-[10px] border-r-transparent' : '-left-1 border-t-[10px] border-t-slate-900/20 border-l-[10px] border-l-transparent'}`} />
                  </div>
                </div>
              ))}
            </div>
            
            <form 
              onSubmit={(e) => { e.preventDefault(); }}
              className="p-6 border-t border-cyan-400/5 bg-slate-950/60 backdrop-blur-3xl flex gap-4 relative z-10"
            >
              <input 
                autoFocus
                value={editorAssistantInput}
                onChange={(e) => setEditorAssistantInput(e.target.value)}
                placeholder="Submit synaptic signal..."
                className="flex-1 bg-slate-900/40 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-100 placeholder:text-slate-800 outline-none focus:border-cyan-400/40 transition-all italic"
              />
              <button className="p-4 bg-cyan-900/40 border border-cyan-400/40 text-cyan-400 rounded-2xl shadow-cyan hover:bg-cyan-400 hover:text-slate-950 transition-all active:scale-90">
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorTab;
