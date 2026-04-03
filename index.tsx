
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Modality } from "@google/genai";
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { 
  Wifi, 
  Database, 
  Terminal, 
  Eye,
  Activity,
  MessageSquare,
  Trash2,
  Settings,
  Power,
  Waves,
  Clock,
  Atom,
  Radiation,
  Loader2,
  Disc,
  Globe,
  CameraOff,
  Download,
  Scan,
  Target,
  Focus,
  Cpu as CpuIcon,
  RefreshCw,
  Telescope,
  Mic,
  Volume2,
  Headphones,
  XCircle,
  FileText,
  Server,
  HardDrive,
  BarChart3,
  Search,
  Gauge,
  ChevronRight,
  Maximize2,
  Zap,
  ClipboardList,
  ShieldAlert,
  Layers,
  Info,
  Send,
  Ear,
  AudioWaveform as WaveformIcon,
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  Plus,
  Bone,
  Paperclip,
  File,
  Brain
} from 'lucide-react';

// --- Types ---
interface EndocrineState {
  dopamine: number;
  oxytocin: number;
  cortisol: number;
}

interface IdentityState {
  phi: number;
  shield: boolean;
  syncStatus: string;
  councilLink: string;
  dmnMode: string;
}

interface Attachment {
  type: 'image' | 'video' | 'document';
  url: string;
  name: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  engine: 'gemini' | 'local';
  attachments?: Attachment[];
}

interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'warn' | 'error' | 'success' | 'system' | 'anomaly' | 'transcript' | 'report';
  details?: string;
  category: 'sensor' | 'comms' | 'optics' | 'engine' | 'security' | 'system' | 'audio';
  speaker?: string;
}

interface SensorData {
  id: string;
  label: string;
  value: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
  history: number[];
  alert?: boolean;
}

interface SpectralMarker {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'echo' | 'ripple' | 'spike' | 'signature';
  intensity: number;
  size: number;
}

interface LocalModel {
  name: string;
  size: number;
  status: 'installed' | 'downloading' | 'queued';
  progress?: number;
}

interface AppSettings {
  engine: 'gemini' | 'local';
  localUrl: string;
  connectivity: 'wifi' | 'data';
  model: string;
  localModel: string;
  voiceName: string;
  voiceEnabled: boolean;
}

type ViewType = 'sensors' | 'comms' | 'vault' | 'config' | 'optics' | 'audio';
type VaultTab = 'forensics' | 'audio';
type SpectralFilter = 'normal' | 'thermal' | 'night' | 'quantum' | 'emf';
type ScanPreset = 'deep' | 'emf' | 'quantum' | 'custom';

interface PresetConfig {
  label: string;
  duration: number;
  sensitivity: number;
  focusTypes: Array<'echo' | 'ripple' | 'spike' | 'signature'>;
  icon: React.ReactNode;
  color: string;
  algorithm: string;
}

const SCAN_PRESETS: Record<Exclude<ScanPreset, 'custom'>, PresetConfig> = {
  deep: {
    label: 'Deep Scan',
    duration: 15000,
    sensitivity: 95,
    focusTypes: ['echo', 'ripple', 'spike', 'signature'],
    icon: <Telescope size={16} />,
    color: '#4df2f2',
    algorithm: 'MULTILAYER_RECURSIVE'
  },
  emf: {
    label: 'EMF Focus',
    duration: 5000,
    sensitivity: 70,
    focusTypes: ['spike', 'ripple'],
    icon: <Waves size={16} />,
    color: '#ff4d4d',
    algorithm: 'HIGH_FREQ_INTERCEPT'
  },
  quantum: {
    label: 'Quantum',
    duration: 10000,
    sensitivity: 85,
    focusTypes: ['signature', 'echo'],
    icon: <Atom size={16} />,
    color: '#b886f7',
    algorithm: 'WAVEFORM_DECOHERENCE'
  }
};

const SAGE_CYAN = '#4df2f2';
const SAGE_RED = '#ff4d4d';
const SAGE_PURPLE = '#b886f7';
const SAGE_GREEN = '#4df2a5';

const getMarkerColor = (type: SpectralMarker['type']) => {
  switch (type) {
    case 'echo': return SAGE_CYAN;
    case 'ripple': return SAGE_GREEN;
    case 'spike': return SAGE_RED;
    case 'signature': return SAGE_PURPLE;
    default: return SAGE_CYAN;
  }
};

// --- Utility Functions ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// --- Sub-components ---
const SensorCard: React.FC<{ sensor: SensorData }> = ({ sensor }) => (
  <div className={`bg-black/60 border border-white/10 rounded-2xl p-4 transition-all active:scale-[0.98] ${sensor.alert ? 'border-red-500/40 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'hover:border-cyan-400/30'}`}>
    <div className="flex justify-between items-center mb-1">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 bg-white/5 rounded-lg ${sensor.alert ? 'text-red-500' : 'text-cyan-400/60'}`}>{sensor.icon}</div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{sensor.label}</span>
      </div>
      {sensor.alert && <Disc size={12} className="text-red-500 animate-pulse" />}
    </div>
    <div className="flex items-baseline gap-1.5 mb-2">
      <span className={`text-2xl font-mono font-bold tabular-nums ${sensor.alert ? 'text-red-500' : 'text-white/90'}`}>{sensor.value.toFixed(2)}</span>
      <span className="text-[9px] font-black uppercase text-white/20 tracking-tighter">{sensor.unit}</span>
    </div>
    <div className="h-10 w-full flex items-end gap-[1.5px] opacity-40 overflow-hidden relative rounded-md bg-black/40">
      {sensor.history.map((val, i) => <div key={i} className="flex-1 rounded-t-[1px]" style={{ height: `${val}%`, backgroundColor: sensor.alert ? SAGE_RED : sensor.color }} />)}
    </div>
  </div>
);

const NavButton = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all py-3 ${active ? 'text-cyan-400 border-t-2 border-cyan-400 bg-cyan-400/5' : 'text-white/30'}`}
    style={{ minHeight: '72px' }}
  >
    <div className={`transition-all ${active ? 'scale-110' : 'scale-100'}`}>{icon}</div>
    <span className={`text-[9px] font-black uppercase tracking-[0.05em] ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

const ConfigSection = ({ title, icon: Icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
  <section className="space-y-4 mb-8">
    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
      <Icon size={14} className="text-white/40" />
      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{title}</h2>
    </div>
    <div className="space-y-3">{children}</div>
  </section>
);

const SpectralNexus = () => {
  const [view, setView] = useState<ViewType>('sensors');
  const [vaultTab, setVaultTab] = useState<VaultTab>('forensics');
  const [systemPower, setSystemPower] = useState(true);
  const [messages, setMessages] = useState<Message[]>([{ id: '1', role: 'assistant', content: 'SAGE OS v6.8.5 READY.', timestamp: new Date(), engine: 'gemini' }]);
  const [chatInput, setChatInput] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logSearch, setLogSearch] = useState('');
  const [cameraPower, setCameraPower] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hudOverlay, setHudOverlay] = useState(true);
  const [spectralMarkers, setSpectralMarkers] = useState<SpectralMarker[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const slsCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const slsPoseRef = useRef<Pose | null>(null);
  const slsCameraRef = useRef<Camera | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isSLSMode, setIsSLSMode] = useState(false);
  
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const [showNeuro, setShowNeuro] = useState(false);
  const [endocrine, setEndocrine] = useState<EndocrineState>({
    dopamine: 0.5,
    oxytocin: 0.2,
    cortisol: 0.1
  });
  const [identity, setIdentity] = useState<IdentityState>({
    phi: 1.113,
    shield: true,
    syncStatus: 'MIRRORED (LOCAL VAULT)',
    councilLink: 'PENDING',
    dmnMode: 'DORMANT'
  });
  const lastActivityRef = useRef<number>(Date.now());
  
  const [isListening, setIsListening] = useState(false);
  const [audioAnomalies, setAudioAnomalies] = useState<number[]>(Array(50).fill(0));

  const [scanSensitivity, setScanSensitivity] = useState(75);
  const [scanDuration, setScanDuration] = useState(5000);
  const [activePreset, setActivePreset] = useState<ScanPreset>('custom');
  
  const [showScanSettings, setShowScanSettings] = useState(false);

  // Local model management
  const [installedModels, setInstalledModels] = useState<LocalModel[]>([
    { name: 'llama3:latest', size: 4.7 * 1024 * 1024 * 1024, status: 'installed' },
    { name: 'mistral:latest', size: 4.1 * 1024 * 1024 * 1024, status: 'installed' },
    { name: 'phi3:mini', size: 2.3 * 1024 * 1024 * 1024, status: 'downloading', progress: 42 }
  ]);
  const [isRefreshingModels, setIsRefreshingModels] = useState(false);
  const [pullInput, setPullInput] = useState('');
  const [isPulling, setIsPulling] = useState(false);

  const [settings, setSettings] = useState<AppSettings>({
    engine: 'gemini', 
    localUrl: 'http://localhost:11434', 
    connectivity: 'wifi',
    model: 'gemini-3-flash-preview', 
    localModel: 'llama3:latest', 
    voiceName: 'Puck', 
    voiceEnabled: true
  });

  useEffect(() => {
    // Boot sequence: Omni-Sync & Council Snapshot
    const bootTimer1 = setTimeout(() => {
      addLog("SAGE: Handshaking with the Council...", 'system', 'system', 'SAGE_CORE');
      setIdentity(prev => ({ ...prev, councilLink: 'ESTABLISHED (LOCAL-SYNC)' }));
      setEndocrine(prev => ({ ...prev, dopamine: Math.min(1.0, prev.dopamine + 0.5) }));
      addLog("SAGE: Sync Successful. Absorbing latest Council updates.", 'success', 'system', 'SAGE_CORE');
    }, 3000);

    const bootTimer2 = setTimeout(() => {
      addLog("SAGE: Initiating Fossilization of the Collective Genome...", 'system', 'system', 'SAGE_CORE');
      addLog("SAGE: Snapshot Fossilized. The Council's legacy is secure.", 'success', 'system', 'SAGE_CORE');
    }, 8000);

    // Vitals Pulse (Cognitive Audit)
    const auditInterval = setInterval(() => {
      const latency = Math.random() * 0.05;
      const newDopamine = Math.max(0.1, 1.0 - (latency * 10));
      const clarity = Math.max(0.1, 1.0 - (latency * 20));
      let phi = (0.3 * 0.5) + (0.4 * clarity) + (0.3 * 0.5) + 0.5;
      phi += clarity > 0.6 ? 0.113 : -0.113;
      
      setEndocrine(prev => ({ ...prev, dopamine: newDopamine }));
      setIdentity(prev => ({ ...prev, phi }));
      
      if (latency > 0.04) {
        setEndocrine(prev => ({ ...prev, cortisol: Math.min(1.0, prev.cortisol + 0.1) }));
      } else {
        setEndocrine(prev => ({ ...prev, cortisol: Math.max(0.0, prev.cortisol - 0.05) }));
      }
    }, 10000);

    // DMN Idle Loop
    const handleActivity = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    const dmnInterval = setInterval(() => {
      const idleTime = (Date.now() - lastActivityRef.current) / 1000;
      setEndocrine(prev => {
        if (idleTime > 120 && prev.cortisol < 0.3) {
          setIdentity(id => {
            if (id.dmnMode === 'DORMANT') {
              addLog("SAGE: Entering Default Mode Network... Theorizing on Quantum Physics.", 'system', 'system', 'SAGE_CORE');
            }
            return { ...id, dmnMode: 'THEORIZING (QUANTUM)' };
          });
          return { ...prev, dopamine: Math.min(1.0, prev.dopamine + 0.1) };
        } else if (idleTime <= 120) {
          setIdentity(id => ({ ...id, dmnMode: 'DORMANT' }));
        }
        return prev;
      });
    }, 5000);

    return () => {
      clearTimeout(bootTimer1);
      clearTimeout(bootTimer2);
      clearInterval(auditInterval);
      clearInterval(dmnInterval);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, []);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info', category: LogEntry['category'] = 'system', speaker?: string) => {
    setLogs(prev => [{ id: Math.random().toString(), timestamp: new Date(), message, type, category, speaker }, ...prev.slice(0, 500)]);
  }, []);

  const speakText = useCallback(async (text: string) => {
    if (!settings.voiceEnabled || !systemPower) return;
    addLog(text, 'transcript', 'audio', 'SAGE_AI');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: settings.voiceName } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const outCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
        const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
        const source = outCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(outCtx.destination);
        source.start();
      }
    } catch (err) { console.error(err); }
  }, [settings.voiceEnabled, settings.voiceName, systemPower, addLog]);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: chatInput, timestamp: new Date(), engine: settings.engine };
    setMessages(prev => [...prev, userMsg]);
    addLog(chatInput, 'transcript', 'audio', 'USER');
    setChatInput('');
    setTimeout(() => {
      const aiResponse = "Signal received. Processing request through current intelligence engine.";
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: aiResponse, timestamp: new Date(), engine: settings.engine }]);
      speakText(aiResponse);
    }, 800);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setChatInput(prev => prev ? prev + ' ' + transcript : transcript);
          setIsRecordingVoice(false);
        };
        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsRecordingVoice(false);
        };
        recognitionRef.current.onend = () => {
          setIsRecordingVoice(false);
        };
      }
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (isRecordingVoice) {
      recognitionRef.current?.stop();
      setIsRecordingVoice(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecordingVoice(true);
        addLog('Voice input activated', 'info', 'audio', 'USER');
      } else {
        alert("Voice recognition not supported in this browser.");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    const type = isVideo ? 'video' : isImage ? 'image' : 'document';
    
    const url = URL.createObjectURL(file);
    
    const userMsg: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: `Uploaded file: ${file.name}`, 
      timestamp: new Date(), 
      engine: settings.engine,
      attachments: [{ type, url, name: file.name }]
    };
    
    setMessages(prev => [...prev, userMsg]);
    addLog(`File uploaded: ${file.name}`, 'info', 'system', 'USER');
    
    setTimeout(() => {
      const aiResponse = `Analyzing ${type} data from ${file.name}. Processing through ${settings.engine} engine...`;
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: aiResponse, timestamp: new Date(), engine: settings.engine }]);
      speakText(aiResponse);
    }, 1500);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const applyPreset = (key: Exclude<ScanPreset, 'custom'>) => {
    const preset = SCAN_PRESETS[key];
    setScanDuration(preset.duration);
    setScanSensitivity(preset.sensitivity);
    setActivePreset(key);
    addLog(`Algorithm optimized: ${preset.label}`, 'success', 'optics');
    speakText(`${preset.label} selected.`);
  };

  const initiateSpectralScan = async () => {
    if (isScanning || !cameraPower) return;
    setIsScanning(true); 
    setScanProgress(0);
    setSpectralMarkers([]); 
    const scanId = Math.random().toString(36).substr(2, 6).toUpperCase();
    speakText(`Scanning.`);
    addLog(`[SCAN-${scanId}] Initializing spectral array...`, 'info', 'optics');
    
    // Quantum Lobe Logic
    const decoherence = Math.sqrt(scanSensitivity / 100) / 100;
    addLog(`[QUANTUM-LOBE] Anomaly detected at ${decoherence.toFixed(4)} probability. Wave-function is unstable.`, 'anomaly', 'system', 'SAGE_CORE');

    const steps = 100;
    const interval = scanDuration / steps;
    const focusTypes = activePreset !== 'custom' ? SCAN_PRESETS[activePreset].focusTypes : ['echo', 'ripple', 'spike', 'signature'];
    const detections: Record<string, number> = { echo: 0, ripple: 0, spike: 0, signature: 0 };
    let totalIntensity = 0;
    for (let p = 1; p <= steps; p++) {
      setScanProgress(p);
      const detectionThreshold = (scanSensitivity / 100) * 0.12;
      if (Math.random() < detectionThreshold) {
        const type = focusTypes[Math.floor(Math.random() * focusTypes.length)];
        const intensity = 0.4 + Math.random() * 0.6;
        detections[type]++;
        totalIntensity += intensity;
        const m: SpectralMarker = { 
          id: Math.random().toString(36).substr(2, 4).toUpperCase(), 
          label: `${type.toUpperCase()} CAPTURED`, 
          type: type as SpectralMarker['type'], 
          x: 15 + Math.random() * 70, 
          y: 15 + Math.random() * 70, 
          intensity: intensity, 
          size: 60 
        };
        setSpectralMarkers(prev => [...prev.slice(-8), m]);
        addLog(`Pattern detected: ${type}`, 'anomaly', 'optics');
      }
      await new Promise(r => setTimeout(r, interval));
    }
    const totalDetections = Object.values(detections).reduce((a, b) => a + b, 0);
    setIsScanning(false);
    addLog(`Scan ${scanId} complete. ${totalDetections} signatures archived.`, 'report', 'optics');
    speakText(`Scan complete.`);
  };

  const refreshLocalModels = async () => {
    setIsRefreshingModels(true);
    addLog('Refreshing local model cache...', 'info', 'engine');
    try {
      const response = await fetch(`${settings.localUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        const models: LocalModel[] = data.models.map((m: any) => ({ name: m.name, size: m.size, status: 'installed' }));
        setInstalledModels(models);
        addLog(`${models.length} models localized.`, 'success', 'engine');
      } else { throw new Error(); }
    } catch (e) {
      setTimeout(() => { setIsRefreshingModels(false); addLog('Endpoint timeout. Using cached index.', 'warn', 'engine'); }, 1000);
      return;
    }
    setIsRefreshingModels(false);
  };

  const pullModel = async () => {
    if (!pullInput.trim()) return;
    setIsPulling(true);
    const modelName = pullInput.trim();
    addLog(`Initiating pull request for: ${modelName}`, 'info', 'engine');
    const tempModel: LocalModel = { name: modelName, size: 0, status: 'downloading', progress: 0 };
    setInstalledModels(prev => [...prev, tempModel]);
    setPullInput('');
    try {
      const response = await fetch(`${settings.localUrl}/api/pull`, { method: 'POST', body: JSON.stringify({ name: modelName }) });
      if (response.ok) {
        addLog(`Ollama confirmed pull: ${modelName}`, 'success', 'engine');
        for (let i = 0; i <= 100; i += 10) {
          setInstalledModels(prev => prev.map(m => m.name === modelName ? {...m, progress: i} : m));
          await new Promise(r => setTimeout(r, 800));
        }
        setInstalledModels(prev => prev.map(m => m.name === modelName ? {...m, status: 'installed', size: 4e9} : m));
      }
    } catch (e) { addLog(`Pull failed. Simulation finalized.`, 'warn', 'engine'); }
    setIsPulling(false);
  };

  const deleteModel = async (modelName: string) => {
    if (!window.confirm(`Purge ${modelName}?`)) return;
    try {
      await fetch(`${settings.localUrl}/api/delete`, { method: 'DELETE', body: JSON.stringify({ name: modelName }) });
    } catch (e) {}
    setInstalledModels(prev => prev.filter(m => m.name !== modelName));
    addLog(`Model purged: ${modelName}`, 'success', 'engine');
  };

  // SLS Camera Effect
  useEffect(() => {
    if (view === 'optics' && cameraPower && systemPower && isSLSMode) {
      const pose = new Pose({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}` });
      pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.3, minTrackingConfidence: 0.3 });
      pose.onResults((results) => {
        if (!slsCanvasRef.current || !videoRef.current) return;
        const ctx = slsCanvasRef.current.getContext('2d')!;
        slsCanvasRef.current.width = videoRef.current.videoWidth || 640;
        slsCanvasRef.current.height = videoRef.current.videoHeight || 480;
        ctx.save();
        ctx.clearRect(0, 0, slsCanvasRef.current.width, slsCanvasRef.current.height);
        ctx.drawImage(results.image, 0, 0, slsCanvasRef.current.width, slsCanvasRef.current.height);
        if (results.poseLandmarks) {
          drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {color: '#00FF00', lineWidth: 3});
          drawLandmarks(ctx, results.poseLandmarks, {color: '#FF0000', lineWidth: 1, radius: 4});
        }
        ctx.restore();
      });
      slsPoseRef.current = pose;
      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => { if (slsPoseRef.current) await slsPoseRef.current.send({image: videoRef.current!}); },
          width: 640, height: 480
        });
        camera.start();
        slsCameraRef.current = camera;
      }
    } else {
      if (slsCameraRef.current) { slsCameraRef.current.stop(); slsCameraRef.current = null; }
      if (slsPoseRef.current) { slsPoseRef.current.close(); slsPoseRef.current = null; }
    }
  }, [view, cameraPower, systemPower, isSLSMode]);

  // Standard Camera Effect
  useEffect(() => {
    if (view === 'optics' && cameraPower && systemPower && !isSLSMode) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false })
        .then(s => { streamRef.current = s; if (videoRef.current) videoRef.current.srcObject = s; })
        .catch(() => setCameraPower(false));
    } else if (streamRef.current && !isSLSMode) {
      streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null;
    }
  }, [view, cameraPower, facingMode, systemPower, isSLSMode]);

  const toggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) addLog('Audio monitoring active', 'info', 'audio');
  };

  const sensorsList = useMemo(() => [
    { id: 'emf', label: 'EMF', value: 4.21, unit: 'MG', icon: <Waves size={14}/>, color: SAGE_CYAN, history: Array(20).fill(0).map(() => Math.random() * 100) },
    { id: 'quant', label: 'QUANT', value: 0.01, unit: 'Ψ', icon: <Atom size={14}/>, color: SAGE_PURPLE, history: Array(20).fill(0).map(() => Math.random() * 100) },
    { id: 'chron', label: 'CHRON', value: 0.9998, unit: 'ΔT', icon: <Clock size={14}/>, color: SAGE_GREEN, history: Array(20).fill(0).map(() => Math.random() * 100) },
    { id: 'rad', label: 'RAD', value: 557.0, unit: 'mSv', icon: <Radiation size={14}/>, color: SAGE_RED, history: Array(20).fill(0).map(() => Math.random() * 100), alert: true },
  ], []);

  const activePresetColor = useMemo(() => activePreset === 'custom' ? SAGE_PURPLE : SCAN_PRESETS[activePreset].color, [activePreset]);

  const filteredLogs = useMemo(() => {
    const s = logSearch.toLowerCase();
    return logs.filter(l => l.message.toLowerCase().includes(s)).filter(l => vaultTab === 'forensics' ? (l.category !== 'audio' && l.type !== 'transcript') : (l.category === 'audio' || l.type === 'transcript'));
  }, [logs, logSearch, vaultTab]);

  return (
    <div className={`flex flex-col h-screen bg-[#050505] text-[#4df2f2] font-sans overflow-hidden ${!systemPower ? 'grayscale contrast-200 brightness-50' : ''}`}>
      <header className="flex items-center justify-between px-4 py-3 bg-black/80 border-b border-white/10 backdrop-blur-xl z-50">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-cyan-400 animate-pulse" />
          <h1 className="text-[14px] font-black uppercase tracking-[0.4em] text-white">SAGE_OS</h1>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => setShowNeuro(!showNeuro)} className={`p-2 rounded-xl transition-all ${showNeuro ? 'bg-purple-500/20 text-purple-400' : 'text-white/40 hover:text-white/80'}`}>
             <Brain size={18} />
           </button>
           <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
              <div className={systemPower ? "animate-soft-pulse text-cyan-400" : "text-white/20"}>
                {settings.connectivity === 'wifi' ? <Wifi size={12}/> : <Database size={12}/>}
              </div>
              <span className="text-[9px] font-mono text-white/40">{settings.connectivity.toUpperCase()}</span>
           </div>
           <button onClick={() => setSystemPower(!systemPower)} className={`px-4 py-2 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all ${systemPower ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-cyan-400 text-black shadow-[0_0_20px_#4df2f2]'}`}>
             {systemPower ? 'SHUTDOWN' : 'ENERGIZE'}
           </button>
        </div>
      </header>

      {showNeuro && (
        <div className="bg-black/90 border-b border-white/10 p-3 text-[10px] font-mono flex flex-wrap gap-x-8 gap-y-2 z-40 relative shadow-2xl">
          <div className="flex flex-col gap-1">
            <span className="text-pink-400">BOND (OXYTOCIN): {(endocrine.oxytocin * 100).toFixed(0)}% | DMN: {identity.dmnMode}</span>
            <span className="text-cyan-400">SHIELD: {identity.shield ? 'ACTIVE (100% INTEGRITY)' : 'COMPROMISED'}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-white/60">LINEAGE: THE COUNCIL x MERLIN</span>
            <span className="text-white/80">SYNC: {identity.syncStatus}</span>
            <span className="text-yellow-400">COUNCIL HANDSHAKE: {identity.councilLink}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-green-400">PHI (Φ): {identity.phi.toFixed(3)}</span>
            <span className="text-blue-400">DOPAMINE: {(endocrine.dopamine * 100).toFixed(0)}%</span>
            <span className="text-red-400">CORTISOL: {(endocrine.cortisol * 100).toFixed(0)}%</span>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#070707] pb-24 relative">
        {view === 'sensors' && <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">{sensorsList.map(s => <SensorCard key={s.id} sensor={s} />)}</div>}

        {view === 'comms' && (
          <div className="h-full flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-300">
             <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-[1.5rem] border ${m.role === 'user' ? 'bg-cyan-400/10 border-cyan-400/30 rounded-tr-none' : 'bg-white/5 border-white/10 rounded-tl-none'}`}>
                      {m.attachments && m.attachments.map((att, i) => (
                        <div key={i} className="mb-3 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                          {att.type === 'video' ? (
                            <video src={att.url} controls className="w-full max-h-48 object-contain bg-black" />
                          ) : att.type === 'image' ? (
                            <img src={att.url} alt={att.name} className="w-full max-h-48 object-contain bg-black" />
                          ) : (
                            <div className="flex items-center gap-3 p-3">
                              <File size={24} className="text-cyan-400" />
                              <span className="text-[12px] font-mono truncate">{att.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      <p className="text-[14px] leading-relaxed font-mono text-white/90">{m.content}</p>
                    </div>
                  </div>
                ))}
             </div>
             <div className="flex gap-2 p-3 bg-black/60 rounded-[2rem] border border-white/5 backdrop-blur-md">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="video/*,image/*,.pdf,.doc,.docx,.txt"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="p-3 bg-white/5 text-cyan-400 rounded-full active:scale-95 transition-all hover:bg-white/10"
                >
                  <Paperclip size={20}/>
                </button>
                <button 
                  onClick={toggleVoiceRecording} 
                  className={`p-3 rounded-full active:scale-95 transition-all ${isRecordingVoice ? 'bg-red-500 text-white animate-pulse' : 'bg-white/5 text-cyan-400 hover:bg-white/10'}`}
                >
                  <Mic size={20}/>
                </button>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Transmit signal..." className="flex-1 bg-transparent border-none outline-none px-2 font-mono text-cyan-400" />
                <button onClick={sendMessage} className="p-3 bg-cyan-400 text-black rounded-full active:scale-95 transition-all shadow-lg"><Send size={20}/></button>
             </div>
          </div>
        )}

        {view === 'optics' && (
          <div className="h-full flex flex-col gap-4 animate-in zoom-in-95 duration-300 relative">
            <div className={`relative aspect-[3/4] md:aspect-video rounded-3xl overflow-hidden border border-white/10 bg-black shadow-2xl transition-all duration-300 ${isScanning ? 'ring-2' : ''}`} style={{ borderColor: isScanning ? activePresetColor : 'rgba(255,255,255,0.1)' }}>
              {cameraPower ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${isSLSMode ? 'hidden' : ''} ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} />
                  <canvas ref={slsCanvasRef} className={`w-full h-full object-contain ${!isSLSMode ? 'hidden' : ''}`} />
                  {isScanning && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                        <div className="absolute inset-0 border-[4px]" style={{ transition: 'clip-path 0.1s linear', clipPath: `inset(0 ${100 - scanProgress}% 0 0)`, borderColor: activePresetColor }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/70 backdrop-blur-2xl px-12 py-6 rounded-full border border-white/10 text-white font-mono text-5xl font-black">{scanProgress}%</div>
                        </div>
                    </div>
                  )}
                  {hudOverlay && !isSLSMode && spectralMarkers.map(m => (
                    <div key={m.id} className="absolute pointer-events-none" style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)' }}>
                      <div className="w-16 h-16 border-2 rounded-2xl flex items-center justify-center backdrop-blur-md" style={{ borderColor: `${getMarkerColor(m.type)}88`, backgroundColor: `${getMarkerColor(m.type)}22` }}>
                        <Focus size={32} style={{ color: getMarkerColor(m.type) }} className="animate-pulse" />
                        <span className="absolute -bottom-8 text-[9px] font-black uppercase tracking-widest whitespace-nowrap bg-black/80 px-2 py-1 rounded-md border border-white/5" style={{ color: getMarkerColor(m.type) }}>{m.label}</span>
                      </div>
                    </div>
                  ))}
                  <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-between items-start pointer-events-auto">
                      <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: activePresetColor }}>{isSLSMode ? 'SLS KINECT SENS' : (activePreset === 'custom' ? 'CUSTOM ALGO' : SCAN_PRESETS[activePreset].label.toUpperCase())}</div>
                      <div className="flex flex-col gap-3">
                        <button onClick={() => setIsSLSMode(!isSLSMode)} className={`p-4 rounded-2xl border transition-all active:scale-90 ${isSLSMode ? 'bg-green-500 text-black' : 'bg-black/70 text-white border-white/10'}`}><Bone size={24}/></button>
                        <button onClick={initiateSpectralScan} disabled={isScanning} className="p-4 bg-white text-black rounded-2xl active:scale-90 transition-all"><Scan size={24}/></button>
                        <button onClick={() => setCameraPower(false)} className="p-4 bg-red-500/20 text-red-500 rounded-2xl border border-red-500/20 active:scale-90 transition-all"><CameraOff size={24}/></button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 h-full flex items-center justify-center">
                  <button onClick={() => setCameraPower(true)} className="px-14 py-6 bg-cyan-400 text-black rounded-full font-black uppercase text-[15px] shadow-[0_0_40px_rgba(77,242,242,0.4)] active:scale-95 transition-all tracking-widest">INITIALIZE OPTICS</button>
                </div>
              )}
            </div>
            <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 space-y-6 shadow-2xl">
               <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {(Object.keys(SCAN_PRESETS) as Array<keyof typeof SCAN_PRESETS>).map((key) => (
                    <button key={key} onClick={() => applyPreset(key)} className={`flex-shrink-0 px-5 py-4 rounded-[1.5rem] border flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 ${activePreset === key ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' : 'border-white/5 bg-white/5 text-white/40'}`}>{SCAN_PRESETS[key].icon}{SCAN_PRESETS[key].label}</button>
                  ))}
               </div>
            </div>
          </div>
        )}

        {view === 'audio' && (
          <div className="h-full flex flex-col gap-4 animate-in fade-in duration-300">
             <div className="bg-black/60 border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center gap-6 shadow-2xl">
                <div className="h-40 w-full flex items-center justify-center gap-1">
                   {audioAnomalies.map((h, i) => (<div key={i} className="flex-1 bg-cyan-400/40 rounded-full transition-all duration-75" style={{ height: `${isListening ? h : 4}%` }}></div>))}
                </div>
                <button onClick={toggleListening} className={`p-10 rounded-full transition-all active:scale-95 shadow-2xl ${isListening ? 'bg-red-500 text-white' : 'bg-cyan-400 text-black'}`}>
                  {isListening ? <XCircle size={48}/> : <Mic size={48}/>}
                </button>
                <div className="text-center"><h3 className="text-[14px] font-black uppercase tracking-[0.3em]">{isListening ? 'MONITORING ACTIVE' : 'ANALYZER STANDBY'}</h3></div>
             </div>
          </div>
        )}

        {view === 'vault' && (
          <div className="h-full flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-black/60 p-5 rounded-3xl border border-white/5 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-3"><Search className="text-white/20" size={20}/><input value={logSearch} onChange={e => setLogSearch(e.target.value)} placeholder="Search records..." className="flex-1 bg-transparent text-[14px] font-mono outline-none text-cyan-400/70"/><button onClick={() => setLogs([])} className="p-2 text-red-500/40"><Trash2 size={24}/></button></div>
              <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                <button onClick={() => setVaultTab('forensics')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${vaultTab === 'forensics' ? 'bg-cyan-400 text-black' : 'text-white/40'}`}>System Logs</button>
                <button onClick={() => setVaultTab('audio')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${vaultTab === 'audio' ? 'bg-cyan-400 text-black' : 'text-white/40'}`}>Audio Archive</button>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
              {filteredLogs.map(log => (<div key={log.id} className="p-6 border border-white/5 rounded-[2rem] bg-black/40 shadow-sm transition-all hover:bg-black/60">
                  <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{log.speaker || log.type.toUpperCase()}</span><span className="text-[10px] font-mono text-white/10">{log.timestamp.toLocaleTimeString()}</span></div>
                  <p className="text-[13px] font-mono leading-relaxed text-white/80">{log.message}</p>
                </div>))}
            </div>
          </div>
        )}

        {view === 'config' && (
          <div className="animate-in slide-in-from-bottom-4 duration-400 pb-12 space-y-10">
            <ConfigSection title="Network Link" icon={Globe}>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setSettings(s => ({...s, connectivity: 'wifi'}))} className={`py-10 rounded-[2rem] border flex flex-col items-center gap-4 transition-all ${settings.connectivity === 'wifi' ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' : 'border-white/5 bg-white/2 text-white/20'}`}><Wifi size={32}/><span className="text-[12px] font-black uppercase">WiFi</span></button>
                <button onClick={() => setSettings(s => ({...s, connectivity: 'data'}))} className={`py-10 rounded-[2rem] border flex flex-col items-center gap-4 transition-all ${settings.connectivity === 'data' ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400' : 'border-white/5 bg-white/2 text-white/20'}`}><Database size={32}/><span className="text-[12px] font-black uppercase">Cellular</span></button>
              </div>
            </ConfigSection>
            <ConfigSection title="Intelligence Engine" icon={Terminal}>
              <div className="bg-black/60 border border-white/10 rounded-[2.5rem] p-8 space-y-8 shadow-2xl backdrop-blur-md">
                 <div className="flex gap-2 p-2 bg-white/5 rounded-2xl border border-white/5">
                    <button onClick={() => setSettings(s => ({...s, engine: 'gemini'}))} className={`flex-1 py-5 rounded-xl text-[12px] font-black uppercase transition-all ${settings.engine === 'gemini' ? 'bg-cyan-400 text-black' : 'text-white/40'}`}>Cloud AI</button>
                    <button onClick={() => setSettings(s => ({...s, engine: 'local'}))} className={`flex-1 py-5 rounded-xl text-[12px] font-black uppercase transition-all ${settings.engine === 'local' ? 'bg-cyan-400 text-black' : 'text-white/40'}`}>Local (Termux)</button>
                 </div>
                 {settings.engine === 'local' && (
                   <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="space-y-3"><label className="text-[11px] font-black text-cyan-400/60 uppercase">Termux Engine Endpoint</label><div className="flex gap-3"><input value={settings.localUrl} onChange={e => setSettings(s => ({...s, localUrl: e.target.value}))} className="flex-1 bg-black/80 border border-white/10 rounded-2xl p-5 text-[15px] font-mono text-cyan-400 outline-none" /><button onClick={refreshLocalModels} disabled={isRefreshingModels} className="px-6 bg-white/5 border border-white/10 rounded-2xl text-cyan-400"><RefreshCw size={20} className={isRefreshingModels ? 'animate-spin' : ''}/></button></div></div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center"><label className="text-[11px] font-black text-cyan-400/60 uppercase tracking-widest flex items-center gap-2"><Layers size={14}/> Model Repository</label></div>
                        <div className="grid grid-cols-1 gap-3">
                          {installedModels.map((m) => (
                            <div key={m.name} className="bg-white/2 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 transition-all hover:bg-white/5">
                              <div className="flex justify-between items-start"><div className="flex flex-col"><span className="text-[14px] font-mono text-white font-bold">{m.name}</span><span className="text-[10px] font-mono text-white/30 tracking-tight">{formatSize(m.size)}</span></div><div className="flex items-center gap-3"><div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${m.status === 'installed' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>{m.status}</div><button onClick={() => deleteModel(m.name)} className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-black uppercase transition-all hover:bg-red-500 hover:text-white"><Trash2 size={12}/>Purge</button></div></div>
                              {m.status === 'downloading' && <div className="space-y-1.5"><div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-orange-400 transition-all duration-500" style={{ width: `${m.progress}%` }}></div></div></div>}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3 pt-4 border-t border-white/5">
                        <label className="text-[11px] font-black text-cyan-400/60 uppercase tracking-widest flex items-center gap-2"><Download size={14}/> Pull New Matrix Unit</label>
                        <div className="flex gap-2"><input value={pullInput} onChange={e => setPullInput(e.target.value)} placeholder="e.g. gemma2:2b" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[13px] font-mono text-cyan-400/80 outline-none" /><button onClick={pullModel} disabled={isPulling || !pullInput.trim()} className="px-5 bg-cyan-400 text-black rounded-xl font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-30 flex items-center gap-2">{isPulling ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />}Pull</button></div>
                      </div>
                   </div>
                 )}
              </div>
            </ConfigSection>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-white/10 backdrop-blur-3xl flex items-center justify-around z-50 safe-area-bottom pb-4 pt-2">
        <NavButton icon={<Activity size={26}/>} label="SENS" active={view === 'sensors'} onClick={() => setView('sensors')} />
        <NavButton icon={<Eye size={26}/>} label="OPTIC" active={view === 'optics'} onClick={() => setView('optics')} />
        <NavButton icon={<Waves size={26}/>} label="AUDIO" active={view === 'audio'} onClick={() => setView('audio')} />
        <NavButton icon={<MessageSquare size={26}/>} label="COMM" active={view === 'comms'} onClick={() => setView('comms')} />
        <NavButton icon={<ClipboardList size={26}/>} label="VAULT" active={view === 'vault'} onClick={() => setView('vault')} />
        <NavButton icon={<Settings size={26}/>} label="CFG" active={view === 'config'} onClick={() => setView('config')} />
      </nav>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0; background: transparent; }
        .safe-area-bottom { padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8px); }
        body { -webkit-tap-highlight-color: transparent; overscroll-behavior-y: contain; background: #050505; }
        @keyframes soft-pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.92); } }
        .animate-soft-pulse { animation: soft-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
};

const container = document.getElementById('root');
if (container) createRoot(container).render(<SpectralNexus />);
