import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Comment } from '@/services/commentApi';

interface CommentIndicatorProps {
  comment: Comment;
  onClick: () => void;
  isHighlighted?: boolean;
}

const CommentIndicator: React.FC<CommentIndicatorProps> = ({
  comment,
  onClick,
  isHighlighted = false,
}) => {
  const hasReplies = comment.replies.length > 0;
  const isResolved = comment.isResolved;

  return (
    <motion.div
      className={`inline-flex items-center gap-1 px-1 py-0.5 rounded cursor-pointer transition-all duration-200 ${
        isHighlighted 
          ? 'bg-primary/20 border border-primary/30' 
          : 'bg-muted/50 hover:bg-muted/80'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <MessageSquare 
        className={`w-3 h-3 ${
          isResolved ? 'text-green-500' : 'text-blue-500'
        }`} 
      />
      {hasReplies && (
        <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
          {comment.replies.length}
        </Badge>
      )}
      {isResolved && (
        <Badge variant="default" className="text-xs px-1 py-0 h-4 bg-green-500">
          ✓
        </Badge>
      )}
    </motion.div>
  );
};

export default CommentIndicator;
