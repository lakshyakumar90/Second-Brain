import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { commentApi, type Comment } from '@/services/commentApi';
import { useCommentSelection } from '@/hooks/useCommentSelection';
import CommentBubble from './CommentBubble';
import CommentIndicator from './CommentIndicator';
import CommentsPanel from './CommentsPanel';

interface CommentableTextProps {
  content: string;
  itemId?: string;
  pageId?: string;
  currentUserId: string;
  className?: string;
}

const CommentableText: React.FC<CommentableTextProps> = ({
  content,
  itemId,
  pageId,
  currentUserId,
  className = '',
}) => {
  const [comments, setComments] = useState<Comment[]>([]);

  const [isCommentsPanelOpen, setIsCommentsPanelOpen] = useState(false);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { selection, closeBubble } = useCommentSelection();

  const loadComments = async () => {
    if (!itemId && !pageId) return;
    
    try {
      const params: any = { limit: 100 };
      if (itemId) {
        params.itemId = itemId;
      } else if (pageId) {
        params.pageId = pageId;
      }
      const response = await commentApi.getComments(params);
      setComments(response.comments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  useEffect(() => {
    loadComments();
  }, [itemId, pageId]);

  const handleCommentCreated = () => {
    loadComments();
    closeBubble();
  };

  const handleCommentClick = (commentId: string) => {
    setHighlightedCommentId(commentId);
    setIsCommentsPanelOpen(true);
  };

  const handleCommentsPanelToggle = () => {
    setIsCommentsPanelOpen(!isCommentsPanelOpen);
    if (isCommentsPanelOpen) {
      setHighlightedCommentId(null);
    }
  };

  const renderContentWithComments = () => {
    if (!content) {
      return <div className="whitespace-pre-wrap">{content}</div>;
    }

    // If no comments, just render content normally
    if (comments.length === 0) {
      return <div className="whitespace-pre-wrap">{content}</div>;
    }

    // Enhanced highlighting: highlight commented text sections
    const commentsWithPosition = comments.filter(c => !c.parentId && c.position?.selectedText);
    
    if (commentsWithPosition.length === 0) {
      return (
        <div className="space-y-4">
          <div className="whitespace-pre-wrap">{content}</div>
          
          {/* Show general comments without position */}
          {comments.filter(c => !c.parentId && !c.position?.selectedText).map((comment) => (
            <div key={comment._id} className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg border-l-4 border-blue-500">
              <CommentIndicator
                comment={comment}
                onClick={() => handleCommentClick(comment._id)}
                isHighlighted={highlightedCommentId === comment._id}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{comment.content}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {comment.replies.length > 0 && `${comment.replies.length} replies`}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Create highlighted content with inline comment indicators
    let processedContent = content;
    const commentMarkers: { position: number; comment: Comment; type: 'start' | 'end' }[] = [];

    // Sort comments by position to avoid overlap issues
    commentsWithPosition.forEach((comment) => {
      if (comment.position?.selectedText) {
        const text = comment.position.selectedText;
        const index = processedContent.indexOf(text);
        if (index !== -1) {
          commentMarkers.push(
            { position: index, comment, type: 'start' },
            { position: index + text.length, comment, type: 'end' }
          );
        }
      }
    });

    // Sort markers by position (reverse order for easier processing)
    commentMarkers.sort((a, b) => b.position - a.position);

    // Insert markers into content
    commentMarkers.forEach(({ position, comment, type }) => {
      if (type === 'start') {
        const isHighlighted = highlightedCommentId === comment._id;
        const highlightClass = isHighlighted 
          ? 'bg-yellow-200/70 border-yellow-400 shadow-sm' 
          : 'bg-blue-100/50 border-blue-300';
        
        processedContent = 
          processedContent.slice(0, position) +
          `<span class="relative inline-block ${highlightClass} border-l-2 px-1 rounded cursor-pointer transition-all duration-200 hover:shadow-md" data-comment-id="${comment._id}">` +
          processedContent.slice(position);
      } else {
        processedContent = 
          processedContent.slice(0, position) +
          `<span class="inline-flex items-center ml-1">
            <span class="w-2 h-2 bg-blue-500 rounded-full opacity-60"></span>
          </span></span>` +
          processedContent.slice(position);
      }
    });

    return (
      <div className="space-y-4">
        <div 
          className="whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: processedContent }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            const commentId = target.getAttribute('data-comment-id');
            if (commentId) {
              handleCommentClick(commentId);
            }
          }}
        />
        
        {/* Show general comments without position */}
        {comments.filter(c => !c.parentId && !c.position?.selectedText).map((comment) => (
          <div key={comment._id} className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg border-l-4 border-blue-500">
            <CommentIndicator
              comment={comment}
              onClick={() => handleCommentClick(comment._id)}
              isHighlighted={highlightedCommentId === comment._id}
            />
            <div className="flex-1">
              <div className="text-sm font-medium">{comment.content}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {comment.replies.length > 0 && `${comment.replies.length} replies`}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const totalComments = comments.length;
  const resolvedComments = comments.filter(c => c.isResolved).length;

  return (
    <div className="relative">
      {/* Content */}
      <div 
        ref={contentRef}
        className={`relative ${className}`}
        data-comment-bubble
      >
        {renderContentWithComments()}
      </div>

      {/* Comment Bubble */}
      <AnimatePresence>
        {selection.isVisible && (
          <CommentBubble
            isVisible={selection.isVisible}
            position={selection.position}
            selectedText={selection.selectedText}
            itemId={itemId}
            pageId={pageId}
            onCommentCreated={handleCommentCreated}
            onClose={closeBubble}
          />
        )}
      </AnimatePresence>

      {/* Comments Panel Toggle */}
      {totalComments > 0 && (
        <motion.div
          className="fixed bottom-4 right-4 z-40"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <Button
            onClick={handleCommentsPanelToggle}
            className="rounded-full shadow-lg"
            size="lg"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Comments
            <Badge variant="secondary" className="ml-2">
              {totalComments}
            </Badge>
            {resolvedComments > 0 && (
              <Badge variant="default" className="ml-1 bg-green-500">
                {resolvedComments}
              </Badge>
            )}
          </Button>
        </motion.div>
      )}

      {/* Comments Panel */}
      <CommentsPanel
        itemId={itemId}
        pageId={pageId}
        currentUserId={currentUserId}
        isOpen={isCommentsPanelOpen}
        onToggle={handleCommentsPanelToggle}
      />
    </div>
  );
};

export default CommentableText;
