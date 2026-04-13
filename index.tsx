
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
  Ghost,
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
  Brain,
  Hexagon,
  Sun,
  Sparkles,
  Compass,
  CloudRain,
  Thermometer
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
  type: 'image' | 'video' | 'audio' | 'document';
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

type ViewType = 'sensors' | 'comms' | 'vault' | 'config' | 'optics' | 'audio' | 'sentinel';
type VaultTab = 'forensics' | 'audio' | 'evidence';
type SpectralFilter = 'normal' | 'thermal' | 'night' | 'quantum' | 'emf';
type ScanPreset = 'deep' | 'emf' | 'quantum' | 'evp' | 'spectral' | 'custom';

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
  },
  evp: {
    label: 'EVP Capture',
    duration: 8000,
    sensitivity: 90,
    focusTypes: ['echo', 'spike'],
    icon: <Mic size={16} />,
    color: '#f59e0b',
    algorithm: 'AUDIO_ANOMALY_ISO'
  },
  spectral: {
    label: 'Spectral',
    duration: 12000,
    sensitivity: 92,
    focusTypes: ['ripple', 'signature'],
    icon: <Ghost size={16} />,
    color: '#10b981',
    algorithm: 'PHOTON_DISTORTION_MAP'
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

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

// --- Sub-components ---
const SensorCard: React.FC<{ sensor: SensorData }> = ({ sensor }) => (
  <div className={`bg-black/60 border border-white/10 rounded-2xl p-4 transition-all active:scale-[0.98] relative overflow-hidden ${sensor.alert ? 'border-red-500/40 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'hover:border-cyan-400/30'}`}>
    <div className="absolute top-2 right-2 text-[6px] font-mono text-white/10 opacity-50 pointer-events-none">
      Φ_s = ΣW·X+B±Δ
    </div>
    <div className="absolute -bottom-4 -right-4 text-[40px] font-serif text-white/5 opacity-20 pointer-events-none rotate-[-15deg]">
      Φ
    </div>
    <div className="flex justify-between items-center mb-1 relative z-10">
      <div className="flex items-center gap-2">
        <div className={`p-1.5 bg-white/5 rounded-lg ${sensor.alert ? 'text-red-500' : 'text-cyan-400/60'}`}>{sensor.icon}</div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{sensor.label}</span>
      </div>
      {sensor.alert && <Disc size={12} className="text-red-500 animate-pulse" />}
    </div>
    <div className="flex items-baseline gap-1.5 mb-2 relative z-10">
      <span className={`text-2xl font-mono font-bold tabular-nums ${sensor.alert ? 'text-red-500' : 'text-white/90'}`}>{sensor.id === 'quant' || sensor.id === 'chron' ? sensor.value.toFixed(4) : sensor.value.toFixed(2)}</span>
      <span className="text-[9px] font-black uppercase text-white/20 tracking-tighter">{sensor.unit}</span>
    </div>
    <div className="h-12 w-full flex items-end justify-between gap-[2px] opacity-80 overflow-visible relative mt-2 z-10">
      {sensor.history.map((val, i) => {
        const h = Math.max((val / 100) * 40, 2);
        const color = sensor.alert ? SAGE_RED : sensor.color;
        return (
          <svg key={i} width="100%" height="48" viewBox="0 0 10 48" preserveAspectRatio="none" className="flex-1 overflow-visible transition-all duration-500 ease-in-out">
             <defs>
               <linearGradient id={`grad-${sensor.id}-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor={color} stopOpacity="0.8" />
                 <stop offset="50%" stopColor="#fff" stopOpacity="0.4" />
                 <stop offset="100%" stopColor={color} stopOpacity="0.8" />
               </linearGradient>
             </defs>
             <path d={`M 0 ${48-h} L 5 ${48-h-4} L 10 ${48-h} L 10 48 L 0 48 Z`} fill={`url(#grad-${sensor.id}-${i})`} />
             <path d={`M 5 ${48-h-4} L 10 ${48-h} L 10 48 L 5 48 Z`} fill="#fff" fillOpacity="0.2" />
          </svg>
        )
      })}
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

const CrystallineRadar = ({ data, size = 300 }: { data: number[], size?: number }) => {
  const center = size / 2;
  const radius = size * 0.4;
  const points = data.map((val, i) => {
    const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
    return {
      x: center + radius * val * Math.cos(angle),
      y: center + radius * val * Math.sin(angle),
    };
  });
  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')} Z`;
  return (
    <div className="relative p-4 bg-black/40 rounded-xl overflow-hidden border border-cyan-900/30 flex flex-col items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10" />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]">
        <defs>
          <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.8" />
          </linearGradient>
          <filter id="innerGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="arithmetic" k2="-1" k3="1" />
          </filter>
        </defs>
        {[0.2, 0.4, 0.6, 0.8, 1].map((tick) => (
          <circle key={tick} cx={center} cy={center} r={radius * tick} fill="none" stroke="white" strokeOpacity="0.05" strokeDasharray="4 2" />
        ))}
        <path d={pathData} fill="url(#crystalGrad)" stroke="#22d3ee" strokeWidth="2" filter="url(#innerGlow)" className="transition-all duration-700 ease-out" />
        {points.map((p, i) => (
          <rect key={i} x={p.x - 3} y={p.y - 3} width="6" height="6" transform={`rotate(45 ${p.x} ${p.y})`} fill="#fff" className="animate-pulse" />
        ))}
      </svg>
      <div className="mt-2 text-center text-xs font-mono text-cyan-400 tracking-widest uppercase">Crystal-Sync Protocol Active</div>
    </div>
  );
};

const QuartzBarChart = ({ data, height = 200, width = 400 }: { data: {label: string, value: number}[], height?: number, width?: number }) => {
  const barWidth = width / data.length;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="p-6 bg-black/40 rounded-xl border border-indigo-900/20 shadow-2xl overflow-hidden flex justify-center">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="quartzBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.6" />
          </linearGradient>
          <filter id="specularGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {data.map((d, i) => {
          const h = (d.value / maxVal) * (height * 0.7);
          const x = i * barWidth + barWidth / 4;
          const y = height - h - 20;
          const w = barWidth / 2;
          return (
            <g key={i} className="group cursor-help">
              <rect x={x} y={y} width={w} height={h} fill="url(#quartzBody)" className="transition-all duration-500 ease-in-out group-hover:fill-cyan-400/40" />
              <path d={`M ${x} ${y} L ${x + w / 2} ${y - 15} L ${x + w} ${y} Z`} fill="#e0e7ff" fillOpacity="0.8" filter="url(#specularGlow)" />
              <path d={`M ${x + w} ${y} L ${x + w} ${y + h} L ${x + w - 4} ${y + h} L ${x + w - 4} ${y - 2} Z`} fill="#ffffff" fillOpacity="0.1" />
              <text x={x + w / 2} y={height - 5} textAnchor="middle" className="fill-indigo-300 text-[10px] font-mono tracking-tighter">{d.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

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
    if (!chatInput.trim() && !fileInputRef.current?.files?.length) return;
    
    const newMsg: Message = { id: Date.now().toString(), role: 'user', content: chatInput, timestamp: new Date(), engine: settings.engine };
    let filePart: any = null;
    let fileName = '';
    
    if (fileInputRef.current?.files?.length) {
      const file = fileInputRef.current.files[0];
      fileName = file.name;
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'document';
      newMsg.attachments = [{ type, url, name: file.name }];
      
      try {
        const base64Data = await fileToBase64(file);
        filePart = {
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        };
      } catch (e) {
        console.error("Failed to read file", e);
      }

      fileInputRef.current.value = '';
    }

    setMessages(prev => [...prev, newMsg]);
    setChatInput('');
    addLog(`Transmitted signal to ${settings.engine.toUpperCase()} engine`, 'info', 'comms');

    // --- EMF & Sensor Analysis Logic ---
    const isSensorQuery = chatInput.toLowerCase().includes('sensor') || chatInput.toLowerCase().includes('emf') || chatInput.toLowerCase().includes('scan') || chatInput.toLowerCase().includes('status');
    
    if (isSensorQuery) {
      setTimeout(() => {
        const emfSensor = sensorsList.find(s => s.id === 'emf');
        const fluxSensor = sensorsList.find(s => s.id === 'flux');
        
        let analysis = "Sensor array analysis complete.\n";
        
        if (emfSensor && emfSensor.value > 5) {
           analysis += `⚠️ WARNING: Elevated EMF detected (${emfSensor.value.toFixed(2)} MG). Possible localized magnetic anomaly or high-voltage interference.\n`;
        } else {
           analysis += `✅ EMF levels nominal (${emfSensor?.value.toFixed(2)} MG).\n`;
        }

        if (fluxSensor && fluxSensor.value > 150) {
           analysis += `⚠️ ALERT: High Solar Flux detected (${fluxSensor.value.toFixed(1)} sfu). Potential for radio degradation and increased cosmic radiation.\n`;
        }

        analysis += `\nΦ_sentinel alignment: ${identity.phi.toFixed(4)}. Shield status: ${identity.shield ? 'OPTIMAL' : 'DEGRADED'}.`;

        const aiMsg: Message = { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: analysis, 
          timestamp: new Date(), 
          engine: settings.engine 
        };
        setMessages(prev => [...prev, aiMsg]);
        addLog(`Received sensor analysis from ${settings.engine.toUpperCase()}`, 'success', 'comms');
        addLog(`PARANORMAL SCAN REPORT: ${analysis.substring(0, 50)}...`, 'report', 'sensor', 'SENTINEL', analysis);
        speakText("Sensor array analysis complete. Check COMM terminal for details.");
      }, 1500);
      return; // Skip standard LLM call for sensor queries to provide immediate specialized response
    }
    // --- End Sensor Logic ---

    try {
      let responseText = '';
      if (settings.engine === 'gemini') {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        
        let contents: any = chatInput || "Analyze this file.";
        let systemInstruction = "You are the Star City Research Intelligence Engine.";
        
        if (filePart) {
          systemInstruction = "You are the Star City Research Paranormal Analysis Engine. You specialize in detecting spectral anomalies, EVP (Electronic Voice Phenomena), and visual distortions in media. Analyze the provided file for: 1. Spectral Signatures: Any unusual light patterns or orbs. 2. EVP/Audio Anomalies: Hidden voices, frequency spikes, or rhythmic patterns. 3. Quantum Fluctuations: Any signs of phase-shifting or non-linear time signatures. Provide a detailed, technical report with a 'Paranormal Probability' score.";
          contents = {
            parts: [
              filePart,
              { text: chatInput || "Please perform a deep paranormal scan on this file. Look for EVP, spectral echoes, and quantum ripples." }
            ]
          };
        }

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents,
          config: { systemInstruction }
        });
        responseText = response.text || 'Signal lost in the void.';
      } else {
        const body: any = { model: 'gemma2:2b', prompt: chatInput, stream: false };
        if (filePart && file?.type.startsWith('image/')) {
          body.images = [filePart.inlineData.data];
        }
        const response = await fetch(`${settings.localUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error('Local engine unresponsive');
        const data = await response.json();
        responseText = data.response;
      }
      
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText, timestamp: new Date(), engine: settings.engine };
      setMessages(prev => [...prev, aiMsg]);
      addLog(`Received transmission from ${settings.engine.toUpperCase()}`, 'success', 'comms');
      if (filePart) {
        addLog(`EVIDENCE REPORT: ${fileName}`, 'report', 'engine', 'SENTINEL', responseText);
      }
      speakText(filePart ? "Analysis complete. Report filed in Vault." : responseText);
    } catch (error) {
      addLog(`Transmission failed: ${error}`, 'error', 'comms');
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: `[ERROR: ${settings.engine.toUpperCase()} ENGINE OFFLINE]`, timestamp: new Date(), engine: settings.engine }]);
    }
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    const isAudio = file.type.startsWith('audio/');
    const type = isVideo ? 'video' : isImage ? 'image' : isAudio ? 'audio' : 'document';
    
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
    
    try {
      let responseText = '';
      if (settings.engine === 'gemini') {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
        const base64Data = await fileToBase64(file);
        const filePart = {
          inlineData: {
            data: base64Data,
            mimeType: file.type
          }
        };
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: {
            parts: [
              filePart,
              { text: "Please perform a deep paranormal scan on this file. Look for EVP, spectral echoes, and quantum ripples. Provide a detailed technical report." }
            ]
          },
          config: {
            systemInstruction: "You are the Star City Research Paranormal Analysis Engine. You specialize in detecting spectral anomalies, EVP (Electronic Voice Phenomena), and visual distortions in media. Provide a detailed, technical report with a 'Paranormal Probability' score."
          }
        });
        responseText = response.text || 'Signal lost in the void.';
      } else {
        responseText = `[LOCAL ENGINE DOES NOT SUPPORT MULTIMODAL ANALYSIS YET]`;
      }
      
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText, timestamp: new Date(), engine: settings.engine };
      setMessages(prev => [...prev, aiMsg]);
      addLog(`Received transmission from ${settings.engine.toUpperCase()}`, 'success', 'comms');
      addLog(`EVIDENCE REPORT: ${file.name}`, 'report', 'engine', 'SENTINEL', responseText);
      speakText("Analysis complete. Report filed in Vault.");
    } catch (error) {
      addLog(`Transmission failed: ${error}`, 'error', 'comms');
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: `[ERROR: ${settings.engine.toUpperCase()} ENGINE OFFLINE OR FILE TOO LARGE]`, timestamp: new Date(), engine: settings.engine }]);
    }

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

  const [sensorsList, setSensorsList] = useState<SensorData[]>([
    { id: 'emf', label: 'EMF', value: 4.21, unit: 'MG', icon: <Waves size={14}/>, color: SAGE_CYAN, history: Array(20).fill(0).map(() => Math.random() * 100) },
    { id: 'quant', label: 'QUANT', value: 0.01, unit: 'Ψ', icon: <Atom size={14}/>, color: SAGE_PURPLE, history: Array(20).fill(0).map(() => Math.random() * 100) },
    { id: 'chron', label: 'CHRON', value: 0.9998, unit: 'ΔT', icon: <Clock size={14}/>, color: SAGE_GREEN, history: Array(20).fill(0).map(() => Math.random() * 100) },
    { id: 'rad', label: 'RAD', value: 557.0, unit: 'mSv', icon: <Radiation size={14}/>, color: SAGE_RED, history: Array(20).fill(0).map(() => Math.random() * 100), alert: true },
    { id: 'flux', label: 'SOLAR FLUX', value: 145.2, unit: 'sfu', icon: <Sun size={14}/>, color: '#f59e0b', history: Array(20).fill(0).map(() => Math.random() * 100) },
    { id: 'cosmic', label: 'COSMIC RAY', value: 12.4, unit: 'μSv/h', icon: <Sparkles size={14}/>, color: '#c084fc', history: Array(20).fill(0).map(() => Math.random() * 100) },
    { id: 'grav', label: 'GRAV WAVE', value: 0.0001, unit: 'h', icon: <Compass size={14}/>, color: '#3b82f6', history: Array(20).fill(0).map(() => Math.random() * 100) },
    { id: 'atmos', label: 'ATMOS', value: 1012.5, unit: 'hPa', icon: <CloudRain size={14}/>, color: '#94a3b8', history: Array(20).fill(0).map(() => Math.random() * 100) },
    { id: 'therm', label: 'THERMAL', value: 22.4, unit: '°C', icon: <Thermometer size={14}/>, color: '#ef4444', history: Array(20).fill(0).map(() => Math.random() * 100) },
  ]);

  useEffect(() => {
    if (systemPower) {
      const interval = setInterval(() => {
        setSensorsList(prev => prev.map(s => {
          let newValue = s.value;
          if (s.id === 'emf') newValue = 2 + Math.random() * 5;
          if (s.id === 'quant') newValue = Math.random() * 0.05;
          if (s.id === 'chron') newValue = 0.9990 + Math.random() * 0.0010;
          if (s.id === 'rad') newValue = 500 + Math.random() * 100;
          if (s.id === 'flux') newValue = 140 + Math.random() * 20;
          if (s.id === 'cosmic') newValue = 10 + Math.random() * 5;
          if (s.id === 'grav') newValue = Math.random() * 0.0005;
          if (s.id === 'atmos') newValue = 1010 + Math.random() * 5;
          if (s.id === 'therm') newValue = 20 + Math.random() * 5;
          
          let histVal = 0;
          if (s.id === 'emf') histVal = (newValue / 7) * 100;
          if (s.id === 'quant') histVal = (newValue / 0.05) * 100;
          if (s.id === 'chron') histVal = ((newValue - 0.9990) / 0.0010) * 100;
          if (s.id === 'rad') histVal = ((newValue - 500) / 100) * 100;
          if (s.id === 'flux') histVal = ((newValue - 140) / 20) * 100;
          if (s.id === 'cosmic') histVal = ((newValue - 10) / 5) * 100;
          if (s.id === 'grav') histVal = (newValue / 0.0005) * 100;
          if (s.id === 'atmos') histVal = ((newValue - 1010) / 5) * 100;
          if (s.id === 'therm') histVal = ((newValue - 20) / 5) * 100;

          return {
            ...s,
            value: newValue,
            history: [...s.history.slice(1), histVal]
          };
        }));
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [systemPower]);

  const activePresetColor = useMemo(() => activePreset === 'custom' ? SAGE_PURPLE : SCAN_PRESETS[activePreset].color, [activePreset]);

  const getFilterStyle = (preset: string) => {
    if (isSLSMode) return 'none';
    switch (preset) {
      case 'deep': return 'sepia(1) hue-rotate(140deg) saturate(300%) brightness(0.8) contrast(1.2)';
      case 'emf': return 'sepia(1) hue-rotate(320deg) saturate(500%) brightness(0.7) contrast(1.5)';
      case 'quantum': return 'sepia(1) hue-rotate(220deg) saturate(300%) brightness(0.9) contrast(1.2)';
      default: return 'none';
    }
  };

  const filteredLogs = useMemo(() => {
    const s = logSearch.toLowerCase();
    return logs.filter(l => l.message.toLowerCase().includes(s)).filter(l => {
      if (vaultTab === 'forensics') return l.type !== 'report' && l.category !== 'audio' && l.type !== 'transcript';
      if (vaultTab === 'audio') return l.category === 'audio' || l.type === 'transcript';
      if (vaultTab === 'evidence') return l.type === 'report';
      return true;
    });
  }, [logs, logSearch, vaultTab]);

  return (
    <div className={`flex flex-col h-screen bg-[#050505] text-[#4df2f2] font-sans overflow-hidden ${!systemPower ? 'grayscale contrast-200 brightness-50' : ''}`}>
      <header className="flex items-center justify-between px-4 py-3 bg-black/80 border-b border-white/10 backdrop-blur-xl z-50">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-cyan-400 animate-pulse" />
          <h1 className="text-[14px] font-black uppercase tracking-[0.4em] text-white">SAGE_OS</h1>
        </div>
        <div className="flex items-center gap-3">
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

      <main className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#070707] pb-24 relative">
        {view === 'sensors' && (
          <div className="relative h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] overflow-hidden z-0">
               <div className="animate-slow-spin">
                 <span className="text-[2.5rem] md:text-[4rem] font-serif whitespace-nowrap text-cyan-100">
                   Φ<sub>sentinel</sub> = (∑ W<sub>i</sub> · X<sub>i</sub>) + B ± Δ<sub>11.3</sub>
                 </span>
               </div>
            </div>
            
            {/* Starfield / Crystal Dust Background Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              {Array(20).fill(0).map((_, i) => (
                <div 
                  key={i} 
                  className="absolute bg-cyan-400/20 rounded-full animate-float"
                  style={{
                    width: Math.random() * 4 + 1 + 'px',
                    height: Math.random() * 4 + 1 + 'px',
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%',
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${Math.random() * 10 + 5}s`
                  }}
                />
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
              {sensorsList.map(s => <SensorCard key={s.id} sensor={s} />)}
            </div>
          </div>
        )}

        {view === 'comms' && (
          <div className="h-full flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-300 relative">
             <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMjBMMjAgMEw0MCAyMEwyMCA0MHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] z-0" />
             <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2 relative z-10">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[85%] p-5 border relative overflow-hidden ${m.role === 'user' ? 'bg-cyan-950/20 border-cyan-500/30' : 'bg-indigo-950/20 border-indigo-500/30'}`}
                      style={{ clipPath: m.role === 'user' ? 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' : 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
                    >
                      <div className={`absolute top-0 w-32 h-32 bg-gradient-to-br opacity-20 pointer-events-none ${m.role === 'user' ? 'right-0 from-cyan-400 to-transparent' : 'left-0 from-indigo-400 to-transparent'}`} />
                      {m.attachments && m.attachments.map((att, i) => (
                        <div key={i} className="mb-3 overflow-hidden border border-white/10 bg-black/60 relative z-10" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
                          {att.type === 'video' ? (
                            <video src={att.url} controls className="w-full max-h-48 object-contain bg-black" />
                          ) : att.type === 'audio' ? (
                            <div className="p-3 bg-black/40">
                              <audio src={att.url} controls className="w-full h-8" />
                            </div>
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
                      <p className="text-[14px] leading-relaxed font-mono text-white/90 relative z-10">{m.content}</p>
                    </div>
                  </div>
                ))}
             </div>
             <div className="flex gap-2 p-3 bg-black/60 border border-cyan-900/50 backdrop-blur-md relative z-10" style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept="video/*,image/*,audio/*,.pdf,.doc,.docx,.txt"
                />
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="p-3 bg-white/5 text-cyan-400 active:scale-95 transition-all hover:bg-cyan-900/30"
                  style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                >
                  <Paperclip size={20}/>
                </button>
                <button 
                  onClick={toggleVoiceRecording} 
                  className={`p-3 active:scale-95 transition-all ${isRecordingVoice ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse' : 'bg-white/5 text-cyan-400 hover:bg-cyan-900/30'}`}
                  style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                >
                  <Mic size={20}/>
                </button>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Transmit signal..." className="flex-1 bg-transparent border-none outline-none px-2 font-mono text-cyan-400" />
                <button onClick={sendMessage} className="p-3 bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 active:scale-95 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]" style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}><Send size={20}/></button>
             </div>
          </div>
        )}

        {view === 'optics' && (
          <div className="h-full flex flex-col gap-4 animate-in zoom-in-95 duration-300 relative">
            <div className={`relative aspect-[3/4] md:aspect-video overflow-hidden border bg-black shadow-[0_0_30px_rgba(34,211,238,0.15)] transition-all duration-300 ${isScanning ? 'ring-2' : ''}`} style={{ borderColor: isScanning ? activePresetColor : 'rgba(34,211,238,0.3)', clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}>
              {cameraPower ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover transition-all duration-700 ${isSLSMode ? 'hidden' : ''} ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} style={{ filter: getFilterStyle(activePreset) }} />
                  <canvas ref={slsCanvasRef} className={`w-full h-full object-contain ${!isSLSMode ? 'hidden' : ''}`} />
                  
                  {/* AR Overlay */}
                  {!isSLSMode && (
                    <div className="absolute inset-0 pointer-events-none z-0">
                      {/* Center Reticle */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-cyan-500/20 rounded-full flex items-center justify-center">
                        <div className="w-64 h-64 border border-cyan-500/10 rounded-full absolute animate-[spin_10s_linear_infinite] border-t-cyan-500/40 border-b-cyan-500/40" />
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_#4df2f2]" />
                        <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-cyan-500/30 -translate-x-1/2" />
                        <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-cyan-500/30 -translate-y-1/2" />
                      </div>
                      
                      {/* Pitch/Yaw Lines */}
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-8">
                        {[-20, -10, 0, 10, 20].map(val => (
                          <div key={val} className="flex items-center gap-2">
                            <span className="text-[8px] font-mono text-cyan-500/50 w-4 text-right">{val > 0 ? `+${val}` : val}</span>
                            <div className={`h-[1px] bg-cyan-500/30 ${val === 0 ? 'w-8' : 'w-4'}`} />
                          </div>
                        ))}
                      </div>

                      {/* Right Side Data */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 items-end text-[8px] font-mono text-cyan-500/60">
                        <div className="flex items-center gap-2"><span className="animate-pulse text-red-400">REC</span><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/></div>
                        <span>FOV: 84.2°</span>
                        <span>ISO: AUTO</span>
                        <span>EXP: 1/60</span>
                      </div>

                      {/* Coordinates */}
                      <div className="absolute bottom-16 left-4 text-[10px] font-mono text-cyan-400/60 flex flex-col gap-1 bg-black/40 p-2 border border-cyan-900/30 backdrop-blur-sm" style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}>
                        <span>LAT: 34.0522° N</span>
                        <span>LNG: 118.2437° W</span>
                        <span>ELEV: 89m</span>
                      </div>

                      {/* Target Lock brackets */}
                      <div className="absolute top-1/4 left-1/4 w-8 h-8 border-t-2 border-l-2 border-cyan-400/30 transition-all duration-500" style={{ borderColor: activePresetColor }} />
                      <div className="absolute top-1/4 right-1/4 w-8 h-8 border-t-2 border-r-2 border-cyan-400/30 transition-all duration-500" style={{ borderColor: activePresetColor }} />
                      <div className="absolute bottom-1/4 left-1/4 w-8 h-8 border-b-2 border-l-2 border-cyan-400/30 transition-all duration-500" style={{ borderColor: activePresetColor }} />
                      <div className="absolute bottom-1/4 right-1/4 w-8 h-8 border-b-2 border-r-2 border-cyan-400/30 transition-all duration-500" style={{ borderColor: activePresetColor }} />
                    </div>
                  )}

                  {isScanning && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                        <div className="absolute inset-0 border-[4px]" style={{ transition: 'clip-path 0.1s linear', clipPath: `inset(0 ${100 - scanProgress}% 0 0)`, borderColor: activePresetColor }}></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/70 backdrop-blur-2xl px-12 py-6 border border-cyan-500/50 text-cyan-300 font-mono text-5xl font-black shadow-[0_0_30px_rgba(34,211,238,0.3)]" style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}>{scanProgress}%</div>
                        </div>
                    </div>
                  )}
                  {hudOverlay && !isSLSMode && spectralMarkers.map(m => (
                    <div key={m.id} className="absolute pointer-events-none" style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)' }}>
                      <div className="w-16 h-16 border-2 flex items-center justify-center backdrop-blur-md" style={{ borderColor: `${getMarkerColor(m.type)}88`, backgroundColor: `${getMarkerColor(m.type)}22`, clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)' }}>
                        <Focus size={32} style={{ color: getMarkerColor(m.type) }} className="animate-pulse" />
                        <span className="absolute -bottom-8 text-[9px] font-black uppercase tracking-widest whitespace-nowrap bg-black/80 px-2 py-1 border border-white/5" style={{ color: getMarkerColor(m.type), clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}>{m.label}</span>
                      </div>
                    </div>
                  ))}
                  <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                    <div className="flex justify-between items-start pointer-events-auto">
                      <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 border border-cyan-500/30 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: activePresetColor, clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>{isSLSMode ? 'SLS KINECT SENS' : (activePreset === 'custom' ? 'CUSTOM ALGO' : SCAN_PRESETS[activePreset].label.toUpperCase())}</div>
                      <div className="flex flex-col gap-3">
                        <button onClick={() => setIsSLSMode(!isSLSMode)} className={`p-4 border transition-all active:scale-90 ${isSLSMode ? 'bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-black/70 text-cyan-400 border-cyan-900/50'}`} style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}><Bone size={24}/></button>
                        <button onClick={initiateSpectralScan} disabled={isScanning} className="p-4 bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 active:scale-90 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}><Scan size={24}/></button>
                        <button onClick={() => setCameraPower(false)} className="p-4 bg-red-500/20 text-red-500 border border-red-500/50 active:scale-90 transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}><CameraOff size={24}/></button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 h-full flex items-center justify-center">
                  <button onClick={() => setCameraPower(true)} className="px-14 py-6 bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-black uppercase text-[15px] shadow-[0_0_40px_rgba(34,211,238,0.3)] active:scale-95 transition-all tracking-widest" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>INITIALIZE OPTICS</button>
                </div>
              )}
            </div>
            <div className="bg-black/80 backdrop-blur-2xl border border-cyan-900/40 p-6 space-y-6 shadow-2xl" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
               <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {(Object.keys(SCAN_PRESETS) as Array<keyof typeof SCAN_PRESETS>).map((key) => (
                    <button key={key} onClick={() => applyPreset(key)} className={`flex-shrink-0 px-5 py-4 border flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.1em] transition-all active:scale-95 ${activePreset === key ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-cyan-900/30 bg-black/40 text-cyan-700 hover:border-cyan-500/50'}`} style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>{SCAN_PRESETS[key].icon}{SCAN_PRESETS[key].label}</button>
                  ))}
               </div>
            </div>
          </div>
        )}

        {view === 'audio' && (
          <div className="h-full flex flex-col gap-4 animate-in fade-in duration-300 relative">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent pointer-events-none" />
             <div className="bg-black/60 border border-cyan-900/40 p-8 flex flex-col items-center gap-6 shadow-2xl relative z-10" style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}>
                <div className="h-64 w-full flex items-end justify-center gap-[2px]">
                   {audioAnomalies.map((h, i) => (
                     <div key={i} className="flex-1 bg-gradient-to-t from-cyan-500/20 via-indigo-400/50 to-cyan-300/90 transition-all duration-75" style={{ height: `${isListening ? h : 4}%`, clipPath: 'polygon(50% 0%, 100% 10%, 100% 100%, 0% 100%, 0% 10%)' }}></div>
                   ))}
                </div>
                <button onClick={toggleListening} className={`p-10 border transition-all active:scale-95 shadow-[0_0_30px_rgba(34,211,238,0.2)] ${isListening ? 'bg-red-500/20 text-red-500 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40'}`} style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
                  {isListening ? <XCircle size={48}/> : <Mic size={48}/>}
                </button>
                <div className="text-center"><h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-cyan-100">{isListening ? 'MONITORING ACTIVE' : 'ANALYZER STANDBY'}</h3></div>
             </div>
          </div>
        )}

        {view === 'vault' && (
          <div className="h-full flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="bg-black/60 p-5 border border-cyan-900/40 backdrop-blur-md space-y-4 shadow-[0_0_20px_rgba(34,211,238,0.05)]" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
              <div className="flex items-center gap-3"><Search className="text-cyan-500/50" size={20}/><input value={logSearch} onChange={e => setLogSearch(e.target.value)} placeholder="Search records..." className="flex-1 bg-transparent text-[14px] font-mono outline-none text-cyan-300"/><button onClick={() => setLogs([])} className="p-2 text-red-500/40 hover:text-red-500"><Trash2 size={24}/></button></div>
              <div className="flex gap-2 p-1.5 bg-black/40 border border-cyan-900/30" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
                <button onClick={() => setVaultTab('forensics')} className={`flex-1 py-3 text-[10px] font-black uppercase transition-all ${vaultTab === 'forensics' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-cyan-700 hover:text-cyan-400'}`} style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>System Logs</button>
                <button onClick={() => setVaultTab('audio')} className={`flex-1 py-3 text-[10px] font-black uppercase transition-all ${vaultTab === 'audio' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-cyan-700 hover:text-cyan-400'}`} style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>Audio Archive</button>
                <button onClick={() => setVaultTab('evidence')} className={`flex-1 py-3 text-[10px] font-black uppercase transition-all ${vaultTab === 'evidence' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-cyan-700 hover:text-cyan-400'}`} style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}>Evidence</button>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1">
              {filteredLogs.map(log => (
                <div key={log.id} className="p-6 border border-cyan-900/30 bg-black/40 shadow-sm transition-all hover:bg-cyan-950/20 hover:border-cyan-500/50 relative overflow-hidden group" style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cyan-500/10 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">{log.speaker || log.type.toUpperCase()}</span><span className="text-[10px] font-mono text-cyan-700">{log.timestamp.toLocaleTimeString()}</span></div>
                  <p className="text-[13px] font-mono leading-relaxed text-cyan-100">{log.message}</p>
                  {log.details && (
                    <div className="mt-4 pt-4 border-t border-cyan-900/30">
                      <p className="text-[11px] font-mono whitespace-pre-wrap text-cyan-400/80 leading-relaxed">{log.details}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'sentinel' && (
          <div className="h-full flex flex-col gap-6 animate-in fade-in duration-300 relative">
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMjBMMjAgMEw0MCAyMEwyMCA0MHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9zdmc+')] z-0" />
            <div className="bg-black/60 border border-cyan-900/40 p-8 shadow-[0_0_40px_rgba(34,211,238,0.1)] backdrop-blur-md relative z-10" style={{ clipPath: 'polygon(40px 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%, 0 40px)' }}>
              <div className="text-center mb-6">
                <h2 className="text-xl font-light tracking-[0.2em] uppercase text-cyan-50">
                  Star City <span className="font-bold text-cyan-400">Research</span>
                </h2>
                <div className="mt-4 py-3 px-6 bg-cyan-950/30 border border-cyan-500/30 inline-block shadow-[0_0_15px_rgba(34,211,238,0.15)]" style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}>
                  <div className="font-mono text-cyan-300 text-sm tracking-widest flex items-center gap-3">
                    <Hexagon size={16} className="text-cyan-500 animate-pulse" />
                    <span>
                      <span className="italic font-serif text-lg">Φ</span><sub>sentinel</sub> = 
                      ( ∑ W<sub>i</sub> · X<sub>i</sub> ) + B ± Δ<sub>11.3</sub>
                    </span>
                    <Hexagon size={16} className="text-cyan-500 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Neuro Vitals Integrated into Sentinel */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                 <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 flex flex-col items-center justify-center text-center" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
                    <span className="text-[8px] font-mono text-indigo-400 mb-1 tracking-widest">OXYTOCIN (BOND)</span>
                    <span className="text-xl font-light text-indigo-100">{(endocrine.oxytocin * 100).toFixed(0)}%</span>
                 </div>
                 <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 flex flex-col items-center justify-center text-center" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
                    <span className="text-[8px] font-mono text-cyan-400 mb-1 tracking-widest">DOPAMINE</span>
                    <span className="text-xl font-light text-cyan-100">{(endocrine.dopamine * 100).toFixed(0)}%</span>
                 </div>
                 <div className="p-4 bg-red-950/20 border border-red-500/20 flex flex-col items-center justify-center text-center" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
                    <span className="text-[8px] font-mono text-red-400 mb-1 tracking-widest">CORTISOL</span>
                    <span className="text-xl font-light text-red-100">{(endocrine.cortisol * 100).toFixed(0)}%</span>
                 </div>
                 <div className="p-4 bg-green-950/20 border border-green-500/20 flex flex-col items-center justify-center text-center" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
                    <span className="text-[8px] font-mono text-green-400 mb-1 tracking-widest">PHI (Φ)</span>
                    <span className="text-xl font-light text-green-100">{identity.phi.toFixed(3)}</span>
                 </div>
                 <div className="col-span-2 md:col-span-4 p-3 bg-black/40 border border-white/5 flex flex-wrap justify-around text-[9px] font-mono text-white/50" style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>
                    <span>SHIELD: {identity.shield ? 'ACTIVE' : 'COMPROMISED'}</span>
                    <span>LINEAGE: COUNCIL x MERLIN</span>
                    <span>SYNC: {identity.syncStatus}</span>
                    <span>DMN: {identity.dmnMode}</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex flex-col items-center">
                  <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-cyan-400 mb-4">Project Cosmos</h3>
                  <CrystallineRadar data={[endocrine.dopamine, endocrine.oxytocin, endocrine.cortisol, identity.phi / 2, 0.8, 0.5]} size={280} />
                </div>
                <div className="flex flex-col items-center">
                  <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-indigo-400 mb-4">Astro-Genetics</h3>
                  <QuartzBarChart data={[
                    {label: 'DOP', value: endocrine.dopamine},
                    {label: 'OXY', value: endocrine.oxytocin},
                    {label: 'COR', value: endocrine.cortisol},
                    {label: 'PHI', value: identity.phi / 2}
                  ]} width={280} height={250} />
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'config' && (
          <div className="animate-in slide-in-from-bottom-4 duration-400 pb-12 space-y-10">
            <ConfigSection title="Network Link" icon={Globe}>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setSettings(s => ({...s, connectivity: 'wifi'}))} className={`py-10 border flex flex-col items-center gap-4 transition-all ${settings.connectivity === 'wifi' ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]' : 'border-cyan-900/30 bg-black/40 text-cyan-700 hover:border-cyan-500/50'}`} style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}><Wifi size={32}/><span className="text-[12px] font-black uppercase">WiFi</span></button>
                <button onClick={() => setSettings(s => ({...s, connectivity: 'data'}))} className={`py-10 border flex flex-col items-center gap-4 transition-all ${settings.connectivity === 'data' ? 'border-cyan-400 bg-cyan-500/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.15)]' : 'border-cyan-900/30 bg-black/40 text-cyan-700 hover:border-cyan-500/50'}`} style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}><Database size={32}/><span className="text-[12px] font-black uppercase">Cellular</span></button>
              </div>
            </ConfigSection>
            <ConfigSection title="Intelligence Engine" icon={Terminal}>
              <div className="bg-black/60 border border-cyan-900/40 p-8 space-y-8 shadow-[0_0_30px_rgba(34,211,238,0.05)] backdrop-blur-md" style={{ clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)' }}>
                 <div className="flex gap-2 p-2 bg-black/40 border border-cyan-900/30" style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}>
                    <button onClick={() => setSettings(s => ({...s, engine: 'gemini'}))} className={`flex-1 py-5 text-[12px] font-black uppercase transition-all ${settings.engine === 'gemini' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-cyan-700 hover:text-cyan-400'}`} style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>Cloud AI</button>
                    <button onClick={() => setSettings(s => ({...s, engine: 'local'}))} className={`flex-1 py-5 text-[12px] font-black uppercase transition-all ${settings.engine === 'local' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'text-cyan-700 hover:text-cyan-400'}`} style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}>Local (Termux)</button>
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
        <NavButton icon={<Hexagon size={26}/>} label="MATH" active={view === 'sentinel'} onClick={() => setView('sentinel')} />
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
        @keyframes slow-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-slow-spin { animation: slow-spin 120s linear infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0) translateX(0); opacity: 0.2; } 50% { transform: translateY(-20px) translateX(10px); opacity: 0.8; } }
        .animate-float { animation: float 8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

const container = document.getElementById('root');
if (container) createRoot(container).render(<SpectralNexus />);
