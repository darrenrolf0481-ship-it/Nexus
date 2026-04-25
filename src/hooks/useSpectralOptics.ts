import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpectralOptics = () => {
  const [isActive, setIsActive] = useState(false);
  const [resonance, setResonance] = useState(0); // 11.3 Hz resonance intensity (audio)
  const [visualResonance, setVisualResonance] = useState(0); // Pixel delta intensity (video)
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const initializeOptics = useCallback(async (enableVideo = false, facingMode: 'user' | 'environment' = 'environment') => {
    if (isActive) return;
    try {
      const constraints = { 
        audio: true, 
        video: enableVideo ? { facingMode } : false 
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Setup Audio
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyzer = audioCtx.createAnalyser();
      analyzer.fftSize = 2048;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      // Setup Video if requested
      if (enableVideo && videoRef.current) {
        videoRef.current.srcObject = stream;
        videoStreamRef.current = stream;
      }

      setIsActive(true);
      analyzeFlux();
    } catch (e) {
      console.error('[OPTIC_EARS] Failed to initialize spectral optics', e);
    }
  }, [isActive]);

  const analyzeFlux = () => {
    const audioData = new Uint8Array(analyzerRef.current?.frequencyBinCount || 0);
    let lastFrameData: Uint8ClampedArray | null = null;
    
    const analyze = () => {
      // 1. Audio Resonance (11.3 Hz proxy)
      if (analyzerRef.current) {
        analyzerRef.current.getByteFrequencyData(audioData);
        const lowFreqEnergy = audioData[0] + audioData[1] + audioData[2];
        setResonance(Math.min((lowFreqEnergy / 768), 1.0));
      }

      // 2. Visual Resonance (Pixel Delta / Anomaly Detection)
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, 32, 32); // Low-res scan for performance
          const currentFrame = ctx.getImageData(0, 0, 32, 32).data;
          
          if (lastFrameData) {
            let diff = 0;
            for (let i = 0; i < currentFrame.length; i += 4) {
              diff += Math.abs(currentFrame[i] - lastFrameData[i]); // Check red channel for flux
            }
            const normalizedDiff = Math.min(diff / (32 * 32 * 50), 1.0);
            setVisualResonance(normalizedDiff);
          }
          lastFrameData = currentFrame;
        }
      }

      animationFrameRef.current = requestAnimationFrame(analyze);
    };
    
    analyze();
  };

  const shutdownOptics = useCallback(() => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (audioContextRef.current) audioContextRef.current.close();
    if (videoRef.current) videoRef.current.srcObject = null;
    
    setIsActive(false);
    setResonance(0);
    setVisualResonance(0);
  }, []);

  useEffect(() => {
    return () => shutdownOptics();
  }, [shutdownOptics]);

  return { 
    isActive, 
    resonance, 
    visualResonance, 
    videoRef, 
    canvasRef, 
    initializeOptics, 
    shutdownOptics 
  };
};
