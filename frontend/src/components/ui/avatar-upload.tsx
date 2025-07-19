import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, AlertCircle, Check } from 'lucide-react';
import { Button } from './button';
import { authApi } from '../../services/authApi';

interface AvatarUploadProps {
  currentAvatar?: string;
  onAvatarChange?: (avatarUrl: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  onAvatarChange,
  className = '',
  size = 'md',
  disabled = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Size configurations
  const sizeConfig = {
    sm: { avatar: 'w-16 h-16', button: 'w-6 h-6', icon: 'w-3 h-3' },
    md: { avatar: 'w-24 h-24', button: 'w-8 h-8', icon: 'w-4 h-4' },
    lg: { avatar: 'w-32 h-32', button: 'w-10 h-10', icon: 'w-5 h-5' },
  };

  const config = sizeConfig[size];

  // File validation
  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, GIF, and WebP images are allowed.';
    }

    if (file.size > maxSize) {
      return 'Image must be less than 5MB.';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setSuccess(false);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Auto-upload
    uploadFile(file);
  }, []);

  // Upload file to backend
  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      // Simulate progress (since we can't track actual upload progress with fetch)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await authApi.uploadAvatar(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Handle success
      if (response.avatar) {
        onAvatarChange?.(response.avatar);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setPreviewUrl(null);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle click on avatar/upload area
  const handleClick = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  // Remove preview
  const handleRemovePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayAvatar = previewUrl || currentAvatar;

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Avatar Display */}
      <div 
        className={`
          relative ${config.avatar} rounded-full overflow-hidden border-2 border-dashed border-gray-300 
          ${!displayAvatar ? 'bg-gray-100' : ''} 
          ${!disabled && !uploading ? 'cursor-pointer hover:border-gray-400' : ''} 
          ${uploading ? 'opacity-50' : ''}
          transition-all duration-200
        `}
        onClick={handleClick}
      >
        {displayAvatar ? (
          <img 
            src={displayAvatar} 
            alt="Avatar preview" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className={`${config.icon} text-gray-400`} />
          </div>
        )}

        {/* Upload Progress Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-xs font-medium">
              {uploadProgress}%
            </div>
          </div>
        )}

        {/* Success Overlay */}
        {success && (
          <div className="absolute inset-0 bg-green-500 bg-opacity-75 flex items-center justify-center">
            <Check className={`${config.icon} text-white`} />
          </div>
        )}
      </div>

      {/* Upload Button */}
      {!disabled && (
        <Button
          type="button"
          size="sm"
          className={`
            absolute -bottom-1 -right-1 ${config.button} rounded-full p-0 shadow-lg
            ${uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
          `}
          onClick={handleClick}
          disabled={disabled || uploading}
        >
          <Upload className={config.icon} />
        </Button>
      )}

      {/* Remove Preview Button */}
      {previewUrl && !uploading && (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          className={`absolute -top-1 -right-1 ${config.button} rounded-full p-0 shadow-lg`}
          onClick={handleRemovePreview}
        >
          <X className={config.icon} />
        </Button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {/* Error Message */}
      {error && (
        <div className="absolute top-full mt-2 left-0 right-0">
          <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      {!displayAvatar && !error && (
        <div className="absolute top-full mt-2 left-0 right-0">
          <p className="text-xs text-gray-500 text-center">
            Click to upload avatar
            <br />
            Max 5MB, JPEG/PNG/GIF/WebP
          </p>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload; 