import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Paperclip, 
  Upload, 
  Trash2, 
  Download, 
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { usePageAttachmentUpload } from '@/hooks/usePageAttachmentUpload';
import type { PageAttachment } from '@/services/pageApi';
import { formatDistanceToNow } from 'date-fns';

interface PageAttachmentsProps {
  pageId: string;
  attachments: PageAttachment[];
  onAttachmentsChange: (attachments: PageAttachment[]) => void;
}

const PageAttachments: React.FC<PageAttachmentsProps> = ({
  pageId,
  attachments,
  onAttachmentsChange,
}) => {
  const {
    uploadStatus,
    uploadProgress,
    error,
    uploadAttachment,
    deleteAttachment,
    openFileDialog,
    reset,
    formatFileSize,
    getFileIcon,
  } = usePageAttachmentUpload(pageId);

  const [deletingAttachment, setDeletingAttachment] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    const newAttachment = await uploadAttachment(file);
    if (newAttachment) {
      onAttachmentsChange([...attachments, newAttachment]);
      reset();
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    setDeletingAttachment(attachmentId);
    const success = await deleteAttachment(attachmentId);
    if (success) {
      onAttachmentsChange(attachments.filter(att => att._id !== attachmentId));
    }
    setDeletingAttachment(null);
  };

  const handleDownload = (attachment: PageAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.originalName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleView = (attachment: PageAttachment) => {
    window.open(attachment.url, '_blank');
  };

  const isImage = (mimetype: string) => mimetype.startsWith('image/');
  const isVideo = (mimetype: string) => mimetype.startsWith('video/');
  const isAudio = (mimetype: string) => mimetype.startsWith('audio/');

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Paperclip className="h-5 w-5" />
            Attachments ({attachments.length})
          </CardTitle>
          <Button
            onClick={() => openFileDialog('*/*', handleFileSelect)}
            disabled={uploadStatus === 'uploading'}
            size="sm"
            className="flex items-center gap-2"
          >
            {uploadStatus === 'uploading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Add Attachment
          </Button>
        </div>
        
        {uploadStatus === 'uploading' && (
          <div className="mt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Uploading... {uploadProgress}%
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mt-1">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {uploadStatus === 'success' && (
          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            Attachment uploaded successfully!
          </div>
        )}
      </CardHeader>

      <CardContent>
        {attachments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Paperclip className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No attachments yet</p>
            <p className="text-sm">Click "Add Attachment" to upload files</p>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => (
              <div
                key={attachment._id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-2xl">
                    {getFileIcon(attachment.mimetype)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate" title={attachment.originalName}>
                        {attachment.originalName}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {formatFileSize(attachment.size)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Uploaded {formatDistanceToNow(new Date(attachment.uploadedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Preview button for images/videos */}
                  {(isImage(attachment.mimetype) || isVideo(attachment.mimetype)) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(attachment)}
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Download button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(attachment)}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  {/* Delete button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAttachment(attachment._id)}
                    disabled={deletingAttachment === attachment._id}
                    className="text-destructive hover:text-destructive"
                    title="Delete"
                  >
                    {deletingAttachment === attachment._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PageAttachments;
