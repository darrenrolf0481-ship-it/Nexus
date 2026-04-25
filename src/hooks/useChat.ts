import { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage, Personality } from '../types';

export const useChat = (
  activePersonality: Personality,
  generateAIResponse: (prompt: string | any[], instruction: string, options?: any) => Promise<string | undefined>,
  applyStimulus?: (type: 'REWARD' | 'STRESS' | 'BOND' | 'SYNC') => void
) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { 
      role: 'ai', 
      text: `Neural interface established with ${activePersonality.name}. System core synchronized. Ready for transmission.`, 
      timestamp: Date.now() 
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Reset chat or add a system message when personality changes
  useEffect(() => {
    setChatMessages(prev => [
      ...prev,
      { 
        role: 'ai', 
        text: `--- Neural Handover: ${activePersonality.name} now online ---`, 
        timestamp: Date.now() 
      }
    ]);
  }, [activePersonality.id]);

  const handleChatSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prompt = chatInput.trim();
    if (!prompt || isAiProcessing) return;

    if (applyStimulus) applyStimulus('BOND');

    const userMsg: ChatMessage = { role: 'user', text: prompt, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiProcessing(true);

    try {
      const response = await generateAIResponse(
        prompt,
        `You are the ${activePersonality.name} AI. ${activePersonality.instruction}. Your tone is professional, technical, and aligned with your personality profile. Focus on providing actionable intelligence and accurate data.`,
        { modelType: 'smart' }
      );
      
      setChatMessages(prev => [...prev, {
        role: 'ai',
        text: response || 'Neural link timeout. Consensus failed.',
        timestamp: Date.now()
      }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'CRITICAL: Neural synchronization failure. Check provider status and network connectivity.', 
        timestamp: Date.now() 
      }]);
    } finally {
      setIsAiProcessing(false);
    }
  }, [chatInput, activePersonality, generateAIResponse, isAiProcessing]);

  const clearChat = () => {
    setChatMessages([{ 
      role: 'ai', 
      text: `Neural link reset. Communication with ${activePersonality.name} re-initialized.`, 
      timestamp: Date.now() 
    }]);
  };

  return {
    chatMessages,
    setChatMessages,
    chatInput,
    setChatInput,
    isAiProcessing,
    chatEndRef,
    handleChatSubmit,
    clearChat,
    handleFileUpload: async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsAiProcessing(true);
      const userMsg: ChatMessage = {
        role: 'user',
        text: `Transmitting file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        type: 'file',
        timestamp: Date.now(),
        metadata: {
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(1) + ' KB',
          fileType: file.type || 'application/zip'
        }
      };
      setChatMessages(prev => [...prev, userMsg]);

      try {
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadRes = await fetch('http://localhost:8001/api/upload', {
          method: 'POST',
          body: formData
        });
        const uploadData = await uploadRes.json();
        
        if (uploadData.error) throw new Error(uploadData.error);

        let aiPrompt = `System alert: User has uploaded a file named "${file.name}". `;
        if (uploadData.extracted && uploadData.extracted.length > 0) {
          aiPrompt += `The following files were extracted from the package: ${uploadData.extracted.join(', ')}. `;
          aiPrompt += `Please analyze this code structure and prepare to assist with coding tasks based on these files.`;
        } else {
          aiPrompt += `Please acknowledge the receipt of this file and prepare for data extraction.`;
        }

        const response = await generateAIResponse(
          aiPrompt,
          `You are the ${activePersonality.name} AI. ${activePersonality.instruction}. An external file package has been uploaded and processed on the server. You now have access to its contents in the local environment.`,
          { modelType: 'smart' }
        );

        setChatMessages(prev => [...prev, {
          role: 'ai',
          text: response || `File ${file.name} received and indexed. I have mapped the following structure: ${uploadData.extracted?.slice(0, 10).join(', ')}${uploadData.extracted?.length > 10 ? '...' : ''}. Ready for coding instructions.`,
          timestamp: Date.now()
        }]);
      } catch (err) {
        setChatMessages(prev => [...prev, { 
          role: 'ai', 
          text: 'CRITICAL: File transmission failure. Neural link could not stabilize for data transfer.', 
          timestamp: Date.now() 
        }]);
      } finally {
        setIsAiProcessing(false);
      }
    }
  };
};
