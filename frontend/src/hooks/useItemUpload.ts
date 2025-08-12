import { useState } from 'react';
import axios from 'axios';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export const useItemUpload = () => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const triggerUpload = async (file: File) => {
    setUploadStatus('uploading');
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || '';

      const response = await axios.post(`${apiUrl}/api/v1/items/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percentCompleted);
        },
      });

      setUploadedUrl(response.data.url);
      setUploadStatus('success');
      return response.data.url;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
      setUploadStatus('error');
      return null;
    }
  };

  const openFileDialog = (accept: string, callback: (file: File) => void) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        callback(target.files[0]);
      }
    };
    input.click();
  };
  
  const reset = () => {
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploadedUrl(null);
    setError(null);
  }

  return { 
    uploadStatus, 
    uploadProgress, 
    uploadedUrl, 
    error, 
    triggerUpload,
    openFileDialog,
    reset
  };
};
