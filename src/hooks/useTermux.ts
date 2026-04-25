import React, { useState, useCallback, useEffect } from 'react';
import { Vitals } from '../types';

export const useTermux = () => {
  const [termuxStatus, setTermuxStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [vitals, setVitals] = useState<Vitals & { nucleoid?: boolean }>({ mem_load: 0, thermals: 0, battery: 0, nucleoid: false });
  const [sensorData, setSensorData] = useState<any>(null);
  const [termuxFiles, setTermuxFiles] = useState<{ name: string, size: string, category: string }[]>([]);

  const fetchVitals = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8001/api/vitals');
      if (res.ok) {
        const data = await res.json();
        setVitals(data);
        setTermuxStatus('connected');
      }
    } catch (err) {
      setTermuxStatus('disconnected');
    }
  }, []);

  const fetchSensors = useCallback(async () => {
    if (termuxStatus !== 'connected') return;
    try {
      const res = await fetch('http://localhost:8001/api/sensors');
      if (res.ok) {
        const data = await res.json();
        setSensorData(data);
      }
    } catch (err) {}
  }, [termuxStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchVitals();
      fetchSensors();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchVitals, fetchSensors]);

  const handleTermuxFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).map((f: File) => ({
      name: f.name,
      size: (f.size / (1024 * 1024 * 1024)).toFixed(2) + 'GB',
      category: 'model'
    }));
    setTermuxFiles(prev => [...newFiles, ...prev]);
  }, []);

  return {
    termuxStatus,
    setTermuxStatus,
    vitals,
    sensorData,
    termuxFiles,
    setTermuxFiles,
    handleTermuxFileUpload
  };
};
