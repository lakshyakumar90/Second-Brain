import React, { useState } from 'react';
import { 
  Edit, 
  Trash2, 
  CheckCircle, 
  MoreHorizontal,
  Heart,
  Smile,
  ThumbsUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { commentApi, type Comment, type CommentReaction } from '@/services/commentApi';
import { formatDistanceToNow } from 'date-fns';

interface CommentThreadProps {
  comment: Comment;
  currentUserId: string;
  onCommentUpdated: () => void;
  onCommentDeleted: () => void;
}

const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  currentUserId,
  onCommentUpdated,
  onCommentDeleted,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOwner = comment.userId._id === currentUserId;


  const handleEdit = async () => {
    if (!editContent.trim()) return;

    try {
      setIsSubmitting(true);
      await commentApi.updateComment(comment._id, { content: editContent });
      setIsEditing(false);
      onCommentUpdated();
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleDelete = async () => {
    try {
      await commentApi.deleteComment(comment._id);
      onCommentDeleted();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleResolve = async () => {
    try {
      await commentApi.resolveComment(comment._id);
      onCommentUpdated();
    } catch (error) {
      console.error('Failed to resolve comment:', error);
    }
  };

  const handleReaction = async (reactionType: CommentReaction['type']) => {
    try {
      const hasReacted = comment.reactions.some(
        r => r.userId === currentUserId && r.type === reactionType
      );

      if (hasReacted) {
        await commentApi.removeReaction(comment._id, reactionType);
      } else {
        await commentApi.addReaction(comment._id, reactionType);
      }
      onCommentUpdated();
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };

  const getReactionCount = (type: CommentReaction['type']) => {
    return comment.reactions.filter(r => r.type === type).length;
  };

  const hasUserReacted = (type: CommentReaction['type']) => {
    return comment.reactions.some(r => r.userId === currentUserId && r.type === type);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-xs">
            {comment.userId.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.userId.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.isEdited && (
              <Badge variant="secondary" className="text-xs">edited</Badge>
            )}
            {comment.isResolved && (
              <Badge variant="default" className="text-xs bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                resolved
              </Badge>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[80px]"
                disabled={isSubmitting}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            </div>
          )}

          <div className="flex items-center gap-2">

            <div className="flex items-center gap-1">
              {['like', 'love', 'laugh'].map((type) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReaction(type as CommentReaction['type'])}
                  className={`h-6 px-1 text-xs ${
                    hasUserReacted(type as CommentReaction['type']) 
                      ? 'bg-primary/10 text-primary' 
                      : ''
                  }`}
                >
                  {type === 'like' && <ThumbsUp className="w-3 h-3" />}
                  {type === 'love' && <Heart className="w-3 h-3" />}
                  {type === 'laugh' && <Smile className="w-3 h-3" />}
                  {getReactionCount(type as CommentReaction['type']) > 0 && (
                    <span className="ml-1 text-xs">
                      {getReactionCount(type as CommentReaction['type'])}
                    </span>
                  )}
                </Button>
              ))}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-1">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!comment.isResolved && (
                  <DropdownMenuItem onClick={handleResolve}>
                    <CheckCircle className="w-3 h-3 mr-2" />
                    Mark as Resolved
                  </DropdownMenuItem>
                )}
                {isOwner && (
                  <>
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="w-3 h-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      <Trash2 className="w-3 h-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>


        </div>
      </div>
    </div>
  );
};

export default CommentThread;
