import { useState } from 'react';
import axios from 'axios';

export interface PageAttachment {
  _id: string;
  originalName: string;
  filename: string;
  url: string;
  publicId: string;
  size: number;
  mimetype: string;
  uploadedAt: string;
  uploadedBy: string;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export const usePageAttachmentUpload = (pageId: string) => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadAttachment = async (file: File): Promise<PageAttachment | null> => {
    setUploadStatus('uploading');
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const response = await axios.post(`${apiUrl}/pages/${pageId}/attachments`, formData, {
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

      setUploadStatus('success');
      return response.data.attachment;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Upload failed';
      setError(errorMessage);
      setUploadStatus('error');
      return null;
    }
  };

  const deleteAttachment = async (attachmentId: string): Promise<boolean> => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      await axios.delete(`${apiUrl}/pages/${pageId}/attachments/${attachmentId}`, {
        withCredentials: true,
      });
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Delete failed';
      setError(errorMessage);
      return false;
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
    setError(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype: string): string => {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎥';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype === 'application/pdf') return '📄';
    if (mimetype.includes('word')) return '📝';
    if (mimetype.includes('text/')) return '📄';
    return '📎';
  };

  return {
    uploadStatus,
    uploadProgress,
    error,
    uploadAttachment,
    deleteAttachment,
    openFileDialog,
    reset,
    formatFileSize,
    getFileIcon,
  };
};
