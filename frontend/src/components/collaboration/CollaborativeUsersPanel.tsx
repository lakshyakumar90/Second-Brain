import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Circle } from 'lucide-react';

interface CollaborativeUser {
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

interface CollaborativeUsersPanelProps {
  users: CollaborativeUser[];
}

const CollaborativeUsersPanel: React.FC<CollaborativeUsersPanelProps> = ({
  users
}) => {
  if (users.length === 0) return null;

  return (
    <div className="bg-muted/30 rounded-lg p-3 border border-border">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          Collaborating ({users.length + 1})
        </span>
      </div>
      
      <div className="space-y-2">
        {/* Current user */}
        <div className="flex items-center gap-2 p-2 bg-background rounded-md border border-border">
          <div className="relative">
            <Avatar className="w-6 h-6">
              <AvatarImage src="" alt="You" />
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                You
              </AvatarFallback>
            </Avatar>
            <Circle 
              className="w-2 h-2 absolute -bottom-0.5 -right-0.5 text-green-500 fill-current" 
            />
          </div>
          <span className="text-xs font-medium text-foreground">You</span>
          <Badge variant="secondary" className="text-xs">
            Editing
          </Badge>
        </div>

        {/* Other users */}
        {users.map((user) => (
          <div key={user.userId} className="flex items-center gap-2 p-2 bg-background/50 rounded-md border border-border/50">
            <div className="relative">
              <Avatar className="w-6 h-6">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback className="text-xs" style={{ backgroundColor: user.color, color: 'white' }}>
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Circle 
                className="w-2 h-2 absolute -bottom-0.5 -right-0.5 text-blue-500 fill-current" 
              />
            </div>
            <span className="text-xs font-medium text-foreground truncate">
              {user.username}
            </span>
            <Badge variant="outline" className="text-xs">
              {user.isTyping ? 'Typing...' : 'Active'}
            </Badge>
            {user.isTyping && (
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollaborativeUsersPanel;
