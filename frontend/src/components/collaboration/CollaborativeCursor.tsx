import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface CollaborativeCursorProps {
  userId: string;
  username: string;
  avatar?: string;
  color: string;
  cursor: {
    x: number;
    y: number;
    selection?: {
      start: number;
      end: number;
    };
  };
  isTyping: boolean;
  lastSeen: Date;
}

const CollaborativeCursor: React.FC<CollaborativeCursorProps> = ({
  userId,
  username,
  avatar,
  color,
  cursor,
  isTyping,
  lastSeen
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show cursor when user is actively typing
    setIsVisible(isTyping);
  }, [isTyping]);

  useEffect(() => {
    // Hide cursor after 3 seconds of no typing
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-200 ease-out"
      style={{
        left: cursor.x,
        top: cursor.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Cursor line */}
      <div
        className="w-0.5 h-6"
        style={{ backgroundColor: color }}
      />
      
      {/* User info card */}
      <div className="mt-2 bg-background border border-border rounded-lg shadow-lg p-2 min-w-[120px]">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={avatar} alt={username} />
            <AvatarFallback className="text-xs">
              {username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-foreground truncate">
            {username}
          </span>
        </div>
        
        {/* Selection indicator */}
        {cursor.selection && (
          <div className="mt-1 text-xs text-muted-foreground">
            Selected {cursor.selection.end - cursor.selection.start} characters
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborativeCursor;
