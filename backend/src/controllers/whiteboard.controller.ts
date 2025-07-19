import { Request, Response } from 'express';
import Whiteboard from '../models/whiteboard.model';
import { AuthRequest } from '../models/interfaces/userModel.interface';

export const createWhiteboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, scene, workspace } = req.body;
    const user = req.user?.userId;
    const whiteboard = await Whiteboard.create({ title, scene, workspace, user });
    res.status(201).json(whiteboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create whiteboard', details: err });
  }
};

export const getWhiteboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const whiteboard = await Whiteboard.findById(id);
    if (!whiteboard) {
      res.status(404).json({ error: 'Whiteboard not found' });
      return;
    }
    res.json(whiteboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch whiteboard', details: err });
  }
};

export const getWhiteboardsForWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const whiteboards = await Whiteboard.find({ workspace: workspaceId });
    res.json(whiteboards);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch whiteboards', details: err });
  }
};

export const updateWhiteboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, scene } = req.body;
    const whiteboard = await Whiteboard.findByIdAndUpdate(
      id,
      { title, scene },
      { new: true }
    );
    if (!whiteboard) {
      res.status(404).json({ error: 'Whiteboard not found' });
      return;
    }
    res.json(whiteboard);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update whiteboard', details: err });
  }
};

export const deleteWhiteboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const whiteboard = await Whiteboard.findByIdAndDelete(id);
    if (!whiteboard) {
      res.status(404).json({ error: 'Whiteboard not found' });
      return;
    }
    res.json({ message: 'Whiteboard deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete whiteboard', details: err });
  }
}; 