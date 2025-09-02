import { io } from '../index';
import { Socket } from 'socket.io';

// Event types
const COLLAB_NAMESPACE = '/collab';

// In-memory store for user presence (for demo; replace with Redis for scale)
const activeUsers: Record<string, { userId: string; workspaceId: string; pageId: string; username: string }> = {};

export function initCollaborationService() {
  // Use the main io instance instead of a namespace
  io.on('connection', (socket: Socket) => {
    console.log('New Socket.IO connection:', socket.id);

    // Handle joining collaboration room
    socket.on('join-collab-room', (data: { pageId: string; workspaceId: string; userId: string; username: string }) => {
      const { pageId, workspaceId, userId, username } = data;
      
      if (!userId || !workspaceId || !pageId) {
        console.log('Invalid join-collab-room data:', data);
        socket.disconnect();
        return;
      }

      console.log(`User ${username} (${userId}) joining collaboration room for page ${pageId} in workspace ${workspaceId}`);
      
      // Store user info
      activeUsers[socket.id] = { userId, workspaceId, pageId, username };
      
      // Join the workspace room
      socket.join(workspaceId);
      
      // Notify others in the workspace
      socket.to(workspaceId).emit('user-joined', { 
        userId, 
        socketId: socket.id, 
        username,
        pageId 
      });

      // Send current active users to the new user
      const workspaceUsers = Object.values(activeUsers).filter(user => 
        user.workspaceId === workspaceId && user.userId !== userId
      );
      socket.emit('current-users', workspaceUsers);
    });

    // Handle real-time document/whiteboard updates
    socket.on('collab-update', (payload: any) => {
      const user = activeUsers[socket.id];
      if (!user) return;

      // Broadcast to others in the workspace
      socket.to(user.workspaceId).emit('collab-update', {
        userId: user.userId,
        username: user.username,
        ...payload
      });
    });

    // Handle cursor/mouse movement (only when actively typing)
    socket.on('cursor-move', (data: any) => {
      const user = activeUsers[socket.id];
      if (!user) return;

      socket.to(user.workspaceId).emit('cursor-move', { 
        userId: user.userId, 
        username: user.username,
        ...data 
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const user = activeUsers[socket.id];
      if (user) {
        console.log(`User ${user.username} (${user.userId}) disconnected from collaboration`);
        socket.to(user.workspaceId).emit('user-left', { 
          userId: user.userId, 
          socketId: socket.id,
          username: user.username 
        });
        delete activeUsers[socket.id];
      }
    });
  });
} 