import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Download, ExternalLink } from 'lucide-react';

interface AttachmentPreviewProps {
  attachment: {
    _id: string;
    originalName: string;
    url: string;
    mimetype: string;
    size: number;
  };
  onRemove: (attachmentId: string) => void;
}

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachment,
  onRemove,
}) => {
  const isImage = attachment.mimetype.startsWith('image/');
  const isVideo = attachment.mimetype.startsWith('video/');
  const isAudio = attachment.mimetype.startsWith('audio/');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = () => {
    window.open(attachment.url, '_blank');
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Preview */}
          <div className="flex-shrink-0">
            {isImage && (
              <img
                src={attachment.url}
                alt={attachment.originalName}
                className="w-16 h-16 object-cover rounded-md"
              />
            )}
            {isVideo && (
              <video
                src={attachment.url}
                className="w-16 h-16 object-cover rounded-md"
                controls
              />
            )}
            {isAudio && (
              <audio
                src={attachment.url}
                className="w-16 h-16"
                controls
              />
            )}
            {!isImage && !isVideo && !isAudio && (
              <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                <span className="text-2xl">📎</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate" title={attachment.originalName}>
              {attachment.originalName}
            </h4>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(attachment.size)}
            </p>
            
            {/* Actions */}
            <div className="flex items-center gap-1 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-6 px-2 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
              
              {(isImage || isVideo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleView}
                  className="h-6 px-2 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(attachment._id)}
                className="h-6 px-2 text-xs text-destructive hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttachmentPreview;
