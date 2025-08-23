import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { commentApi, type CreateCommentData } from '@/services/commentApi';

interface CommentBubbleProps {
  isVisible: boolean;
  position: { x: number; y: number };
  selectedText: string;
  itemId?: string;
  pageId?: string;
  onCommentCreated: () => void;
  onClose: () => void;
}

const CommentBubble: React.FC<CommentBubbleProps> = ({
  isVisible,
  position,
  selectedText,
  itemId,
  pageId,
  onCommentCreated,
  onClose,
}) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isVisible && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isVisible]);

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    try {
      setIsSubmitting(true);
      
      const commentData: any = {
        content: comment,
        position: {
          start: 0, // This will be calculated based on selection
          end: selectedText.length,
          selectedText,
        },
      };
      
      if (itemId) {
        commentData.itemId = itemId;
      } else if (pageId) {
        commentData.pageId = pageId;
      }

      await commentApi.createComment(commentData);
      setComment('');
      onCommentCreated();
      onClose();
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        data-comment-bubble
        className="fixed z-50 bg-background border rounded-lg shadow-lg p-3 min-w-[300px] max-w-[400px]"
        style={{
          left: position.x,
          top: position.y,
        }}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Add comment</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>

        {selectedText && (
          <div className="mb-2 p-2 bg-muted rounded text-sm text-muted-foreground">
            "{selectedText}"
          </div>
        )}

        <Textarea
          ref={textareaRef}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your comment..."
          className="min-h-[80px] resize-none"
          disabled={isSubmitting}
        />

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            Press Enter to save, Esc to cancel
          </span>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!comment.trim() || isSubmitting}
            className="flex items-center gap-1"
          >
            {isSubmitting ? (
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3 h-3" />
            )}
            Comment
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommentBubble;
