import React, { useState, useCallback } from 'react';
import { StorageFile } from '../types';

export const useStorage = () => {
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([
    { id: 1, name: 'Neural_Architecture_v4.pdf', size: '2.4MB', type: 'pdf', date: '2024-03-20' },
    { id: 2, name: 'System_Directives.docx', size: '45KB', type: 'docx', date: '2024-03-22' }
  ]);

  const handleStorageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: StorageFile[] = Array.from(files).map((f: File, i: number) => ({
      id: Date.now() + i,
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(2) + 'MB',
      type: f.name.split('.').pop() || 'unknown',
      date: new Date().toLocaleDateString()
    }));

    setStorageFiles(prev => [...newFiles, ...prev]);
  }, []);

  return {
    storageFiles,
    setStorageFiles,
    handleStorageUpload
  };
};
