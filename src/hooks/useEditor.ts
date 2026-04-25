import { useState, useRef, useCallback, useEffect } from 'react';
import { ProjectFile, Personality } from '../types';

export const useEditor = (
  initialFiles: ProjectFile[],
  activePersonality: Personality,
  generateAIResponse: (prompt: string, instruction: string, options?: any) => Promise<string | undefined>
) => {
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>(initialFiles);
  const [activeFileId, setActiveFileId] = useState<string | null>(initialFiles.find(f => f.type === 'file')?.id || null);
  const [editorContent, setEditorContent] = useState('');
  const [editorLanguage, setEditorLanguage] = useState('python');
  const [editorMode, setEditorMode] = useState<'code' | 'preview' | 'debug' | 'git' | 'settings'>('code');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isEditorAssistantOpen, setIsEditorAssistantOpen] = useState(false);
  const [isPairProgrammerActive, setIsPairProgrammerActive] = useState(false);
  const [editorAssistantInput, setEditorAssistantInput] = useState('');
  const [editorAssistantMessages, setEditorAssistantMessages] = useState<{role: 'user' | 'ai', text: string, metadata?: any}[]>([]);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isMobileFileTreeOpen, setIsMobileFileTreeOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  useEffect(() => {
    const activeFile = projectFiles.find(f => f.id === activeFileId);
    if (activeFile && activeFile.type === 'file') {
      setEditorContent(activeFile.content || '');
      setEditorLanguage(activeFile.language || 'text');
    }
  }, [activeFileId, projectFiles]);

  const handleRunCode = useCallback(async () => {
    setIsRunningCode(true);
    // Simulate code execution
    await new Promise(r => setTimeout(r, 1500));
    setIsRunningCode(false);
  }, []);

  const handleExplainCode = useCallback(async () => {
    setIsAiProcessing(true);
    try {
      const response = await generateAIResponse(
        `Explain this ${editorLanguage} code:\n${editorContent}`,
        `You are a senior developer. ${activePersonality.instruction}`,
        { modelType: 'fast' }
      );
      setEditorAssistantMessages(prev => [...prev, { role: 'ai', text: response || 'No explanation available.' }]);
      setIsEditorAssistantOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiProcessing(false);
    }
  }, [editorContent, editorLanguage, activePersonality, generateAIResponse]);

  return {
    projectFiles,
    setProjectFiles,
    activeFileId,
    setActiveFileId,
    editorContent,
    setEditorContent,
    editorLanguage,
    setEditorLanguage,
    editorMode,
    setEditorMode,
    isRunningCode,
    isEditorAssistantOpen,
    setIsEditorAssistantOpen,
    isPairProgrammerActive,
    setIsPairProgrammerActive,
    editorAssistantInput,
    setEditorAssistantInput,
    editorAssistantMessages,
    setEditorAssistantMessages,
    lastSavedTime,
    isMobileFileTreeOpen,
    setIsMobileFileTreeOpen,
    isAiProcessing,
    handleRunCode,
    handleExplainCode
  };
};
