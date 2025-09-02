import { io, Socket } from 'socket.io-client';


interface CursorPosition {
  x: number;
  y: number;
  selection?: {
    start: number;
    end: number;
  };
}

interface CollaborationUser {
  userId: string;
  username: string;
  avatar?: string;
  color: string;
  cursor: CursorPosition;
  isTyping: boolean;
  lastSeen: Date;
}

interface CollaborationUpdate {
  type: 'content' | 'cursor' | 'selection';
  pageId: string;
  userId: string;
  data: any;
  timestamp: Date;
}

class CollaborationService {
  private socket: Socket | null = null;
  private activeUsers: Map<string, CollaborationUser> = new Map();
  private pageId: string | null = null;
  private workspaceId: string | null = null;
  private userId: string | null = null;
  private username: string | null = null;
  private userColor: string | null = null;
  private statusCallback: ((status: 'connecting' | 'connected' | 'error' | 'disconnected') => void) | null = null;

  constructor() {
    this.generateUserColor();
  }

  private generateUserColor(): void {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    this.userColor = colors[Math.floor(Math.random() * colors.length)];
  }

  public connect(pageId: string, workspaceId: string, userId: string, username: string): void {
    this.pageId = pageId;
    this.workspaceId = workspaceId;
    this.userId = userId;
    this.username = username;

    // Connect to the collaboration namespace with proper configuration
    this.socket = io(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}`, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: true,
      query: {
        userId,
        workspaceId,
        pageId
      }
    });

    // Join the collaboration namespace after connection
    this.socket.on('connect', () => {
      console.log('Connected to Socket.IO, joining collaboration room...');
      this.socket?.emit('join-collab-room', {
        pageId,
        workspaceId,
        userId,
        username
      });
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Handle connection established
    this.socket.on('connect', () => {
      console.log('Socket.IO connected successfully');
      if (this.statusCallback) {
        this.statusCallback('connected');
      }
    });

    // Handle connection errors
    this.socket.on('connect_error', (error: any) => {
      console.error('Socket.IO connection error:', error);
      if (this.statusCallback) {
        this.statusCallback('error');
      }
    });

    // Handle current users in the workspace
    this.socket.on('current-users', (users: any[]) => {
      console.log('Received current users:', users);
      users.forEach(user => {
        if (user.userId !== this.userId) {
          this.activeUsers.set(user.userId, {
            userId: user.userId,
            username: user.username || 'Unknown User',
            color: this.generateRandomColor(),
            cursor: { x: 0, y: 0 },
            isTyping: false,
            lastSeen: new Date()
          });
        }
      });
    });

    // Handle user joined
    this.socket.on('user-joined', (data: { userId: string; socketId: string; username: string }) => {
      if (data.userId !== this.userId) {
        console.log('User joined:', data);
        this.activeUsers.set(data.userId, {
          userId: data.userId,
          username: data.username || 'Unknown User',
          color: this.generateRandomColor(),
          cursor: { x: 0, y: 0 },
          isTyping: false,
          lastSeen: new Date()
        });
      }
    });

    // Handle user left
    this.socket.on('user-left', (data: { userId: string; socketId: string; username: string }) => {
      console.log('User left:', data);
      this.activeUsers.delete(data.userId);
    });

      // Handle cursor movement (only when actively typing)
  this.socket.on('cursor-move', (data: { userId: string; username: string; cursor: CursorPosition; isTyping: boolean }) => {
    if (data.userId !== this.userId) {
      const user = this.activeUsers.get(data.userId);
      if (user) {
        user.cursor = data.cursor;
        user.isTyping = data.isTyping;
        user.lastSeen = new Date();
      }
    }
  });

    // Handle collaboration updates
    this.socket.on('collab-update', (data: CollaborationUpdate) => {
      if (data.type !== 'content') return;
      // Always forward; editor code ignores if same user
      window.dispatchEvent(new CustomEvent('collaboration-update', { detail: data }));
    });
  }

  private generateRandomColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  public updateCursor(cursor: CursorPosition, isTyping: boolean = false): void {
    if (this.socket && this.pageId) {
      this.socket.emit('cursor-move', {
        pageId: this.pageId,
        cursor,
        isTyping
      });
      
      // If typing, set a timeout to stop showing cursor
      if (isTyping) {
        setTimeout(() => {
          this.socket?.emit('cursor-move', {
            pageId: this.pageId,
            cursor,
            isTyping: false
          });
        }, 2000); // Hide cursor after 2 seconds of no typing
      }
    }
  }

  public sendUpdate(type: 'content' | 'selection', data: any): void {
    if (this.socket && this.pageId) {
      this.socket.emit('collab-update', {
        type,
        pageId: this.pageId,
        data,
        timestamp: new Date()
      });
    }
  }

  public getActiveUsers(): CollaborationUser[] {
    return Array.from(this.activeUsers.values());
  }

  public getUserColor(): string {
    return this.userColor || '#FF6B6B';
  }

  public setStatusCallback(callback: (status: 'connecting' | 'connected' | 'error' | 'disconnected') => void): void {
    this.statusCallback = callback;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.activeUsers.clear();
    this.pageId = null;
    this.workspaceId = null;
    this.userId = null;
    this.username = null;
    
    if (this.statusCallback) {
      this.statusCallback('disconnected');
    }
  }
}

// Create a singleton instance
const collaborationService = new CollaborationService();
export default collaborationService;
