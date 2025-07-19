import { io } from '../index';
import { Socket } from 'socket.io';

// Event types
const COLLAB_NAMESPACE = '/collab';

// In-memory store for user presence (for demo; replace with Redis for scale)
const activeUsers: Record<string, { userId: string; workspaceId: string }> = {};

export function initCollaborationService() {
  const nsp = io.of(COLLAB_NAMESPACE);

  nsp.on('connection', (socket: Socket) => {
    // Authenticate user (add your own logic)
    const { userId, workspaceId } = socket.handshake.query as { userId: string; workspaceId: string };
    if (!userId || !workspaceId) {
      socket.disconnect();
      return;
    }
    activeUsers[socket.id] = { userId, workspaceId };
    nsp.to(workspaceId).emit('user-joined', { userId, socketId: socket.id });
    socket.join(workspaceId);

    // Handle real-time document/whiteboard updates
    socket.on('collab-update', (payload: any) => {
      // Broadcast to others in the workspace
      socket.to(workspaceId).emit('collab-update', { userId, ...payload });
    });

    // Handle cursor/mouse movement
    socket.on('cursor-move', (data: any) => {
      socket.to(workspaceId).emit('cursor-move', { userId, ...data });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      delete activeUsers[socket.id];
      nsp.to(workspaceId).emit('user-left', { userId, socketId: socket.id });
    });
  });
} 