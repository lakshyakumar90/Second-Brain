import express from 'express';
import {
  createWhiteboard,
  getWhiteboard,
  getWhiteboardsForWorkspace,
  updateWhiteboard,
  deleteWhiteboard
} from '../controllers/whiteboard.controller';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// Create whiteboard
router.post('/', authMiddleware, createWhiteboard);
// Get a whiteboard by id
router.get('/:id', authMiddleware, getWhiteboard);
// Get all whiteboards for a workspace
router.get('/workspace/:workspaceId', authMiddleware, getWhiteboardsForWorkspace);
// Update a whiteboard
router.put('/:id', authMiddleware, updateWhiteboard);
// Delete a whiteboard
router.delete('/:id', authMiddleware, deleteWhiteboard);

export default router; 