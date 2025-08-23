import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { commentApi, type Comment, type GetCommentsParams } from '@/services/commentApi';
import CommentThread from './CommentThread';

interface CommentsPanelProps {
  itemId?: string;
  pageId?: string;
  currentUserId: string;
  isOpen: boolean;
  onToggle: () => void;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({
  itemId,
  pageId,
  currentUserId,
  isOpen,
  onToggle,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalComments: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState<GetCommentsParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const loadComments = async () => {
    if (!itemId && !pageId) return;
    
    try {
      setLoading(true);
      const params = {
        ...filters,
      };
      
      if (itemId) {
        params.itemId = itemId;
      } else if (pageId) {
        params.pageId = pageId;
      }
      const response = await commentApi.getComments(params);
      setComments(response.comments);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, filters]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const commentData: any = {
        content: newComment,
      };
      
      if (itemId) {
        commentData.itemId = itemId;
      } else if (pageId) {
        commentData.pageId = pageId;
      }
      
      await commentApi.createComment(commentData);
      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentUpdated = () => {
    loadComments();
  };

  const handleCommentDeleted = () => {
    loadComments();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSortChange = (sortBy: 'createdAt' | 'updatedAt') => {
    setFilters(prev => ({ ...prev, sortBy, page: 1 }));
  };

  const handleSortOrderChange = (sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortOrder, page: 1 }));
  };

  const resolvedComments = comments.filter(c => c.isResolved);
  const activeComments = comments.filter(c => !c.isResolved);

  return (
    <motion.div
      className={`fixed right-0 top-0 h-full bg-background border-l shadow-lg transition-all duration-300 ${
        isOpen ? 'w-96' : 'w-0'
      }`}
      initial={false}
      animate={{ width: isOpen ? 384 : 0 }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <h3 className="font-semibold">Comments</h3>
            <Badge variant="secondary">{pagination.totalComments}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b space-y-2">
          <div className="flex gap-2">
            <Select
              value={filters.sortBy}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created</SelectItem>
                <SelectItem value="updatedAt">Updated</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={filters.sortOrder}
              onValueChange={handleSortOrderChange}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest</SelectItem>
                <SelectItem value="asc">Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No comments yet</p>
              <p className="text-sm">Be the first to add a comment!</p>
            </div>
          ) : (
            <>
              {/* Active Comments */}
              {activeComments.length > 0 && (
                <div className="space-y-3">
                  {activeComments.map((comment) => (
                    <CommentThread
                      key={comment._id}
                      comment={comment}
                      currentUserId={currentUserId}
                      onCommentUpdated={handleCommentUpdated}
                      onCommentDeleted={handleCommentDeleted}
                    />
                  ))}
                </div>
              )}

              {/* Resolved Comments */}
              {resolvedComments.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-full h-px bg-border" />
                    <span>Resolved ({resolvedComments.length})</span>
                    <div className="w-full h-px bg-border" />
                  </div>
                  {resolvedComments.map((comment) => (
                    <CommentThread
                      key={comment._id}
                      comment={comment}
                      currentUserId={currentUserId}
                      onCommentUpdated={handleCommentUpdated}
                      onCommentDeleted={handleCommentDeleted}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* New Comment Input */}
        <div className="p-4 border-t">
          <div className="space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a comment..."
              className="min-h-[80px] resize-none"
              disabled={submitting}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Press Enter to send, Shift+Enter for new line
              </span>
              <Button
                size="sm"
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
                className="flex items-center gap-1"
              >
                {submitting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Send className="w-3 h-3" />
                )}
                Comment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CommentsPanel;
