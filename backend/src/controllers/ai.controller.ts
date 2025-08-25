import { Request, Response } from 'express';
import * as aiService from '../services/aiService';
import * as aiValidation from '../validations/aiValidation';
import AIUsage from '../models/aiUsage.model';
import { AI_LIMITS } from '../config/constants';
import mongoose from 'mongoose';
import { AuthRequest } from "../models/interfaces/userModel.interface";

function getUserTier(user: any) {
  return user?.subscription?.plan || 'free';
}

function getUserUsage(user: any) {
  return user?.usage || {};
}

async function checkLimit(user: any, res: Response) {
  // Skip limit check for test endpoints (when user is not authenticated)
  if (!user) {
    return true;
  }
  
  const tier = getUserTier(user);
  const usage = getUserUsage(user);
  const dailyLimit = AI_LIMITS[`${tier.toUpperCase()}_DAILY_REQUESTS` as keyof typeof AI_LIMITS];
  if (usage.aiRequestsToday >= dailyLimit) {
    res.status(429).json({ message: 'AI daily quota exceeded for your plan.' });
    return false;
  }
  return true;
}

async function logAIUsage({ req, requestType, status, errorMessage }: { req: AuthRequest | Request, requestType: string, status: string, errorMessage?: string }) {
  try {
    // Only log usage for authenticated users
    if ('user' in req && req.user?.userId) {
      await AIUsage.create({
        userId: new mongoose.Types.ObjectId(req.user.userId),
        requestType,
        tokensUsed: 0, // Replace with real value if available
        processingTime: 0, // Replace with real value if available
        model: 'gemini', // Replace with real value if available
        cost: 0, // Replace with real value if available
        status,
        errorMessage,
        metadata: {},
      });
    }
  } catch (err) {
    // Don't block user on logging error
    console.error('Failed to log AI usage:', err);
  }
}

export const summarizeContent = async (req: AuthRequest, res: Response) => {
  const validation = aiValidation.summarizeContentSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.issues });
    return;
  }
  if (!(await checkLimit(req.user, res))) return;
  try {
    const result = await aiService.summarizeContent(validation.data.content);
    await logAIUsage({ req, requestType: 'summarize', status: 'success' });
    res.json(result);
  } catch (err) {
    await logAIUsage({ req, requestType: 'summarize', status: 'error', errorMessage: (err as Error).message });
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
};

export const suggestTags = async (req: AuthRequest, res: Response) => {
  const validation = aiValidation.suggestTagsSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.issues });
    return;
  }
  if (!(await checkLimit(req.user, res))) return;
  try {
    const result = await aiService.suggestTags(validation.data.content);
    await logAIUsage({ req, requestType: 'tag_suggest', status: 'success' });
    res.json(result);
  } catch (err) {
    await logAIUsage({ req, requestType: 'tag_suggest', status: 'error', errorMessage: (err as Error).message });
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
};

export const categorizeContent = async (req: AuthRequest, res: Response) => {
  const validation = aiValidation.categorizeContentSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.issues });
    return;
  }
  if (!(await checkLimit(req.user, res))) return;
  try {
    const result = await aiService.categorizeContent(validation.data.content);
    await logAIUsage({ req, requestType: 'auto_categorize', status: 'success' });
    res.json(result);
  } catch (err) {
    await logAIUsage({ req, requestType: 'auto_categorize', status: 'error', errorMessage: (err as Error).message });
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
};

export const chatWithAI = async (req: AuthRequest, res: Response) => {
  const validation = aiValidation.chatWithAISchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.issues });
    return;
  }
  if (!(await checkLimit(req.user, res))) return;
  try {
    const messages = [
      ...(validation.data.contextItemIds || []).map((id: string) => ({ role: 'system', content: `Context item: ${id}` })),
      { role: 'user', content: validation.data.message },
    ];
    const result = await aiService.chatWithAI(messages);
    await logAIUsage({ req, requestType: 'chat', status: 'success' });
    res.json(result);
  } catch (err) {
    await logAIUsage({ req, requestType: 'chat', status: 'error', errorMessage: (err as Error).message });
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getAIInsights = async (req: AuthRequest, res: Response) => {
  const validation = aiValidation.getAIInsightsSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.issues });
    return;
  }
  if (!(await checkLimit(req.user, res))) return;
  try {
    const result = await aiService.getAIInsights(validation.data.itemId);
    await logAIUsage({ req, requestType: 'insights', status: 'success' });
    res.json(result);
  } catch (err) {
    await logAIUsage({ req, requestType: 'insights', status: 'error', errorMessage: (err as Error).message });
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
};

export const generateContent = async (req: AuthRequest, res: Response) => {
  const validation = aiValidation.generateContentSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.issues });
    return;
  }
  if (!(await checkLimit(req.user, res))) return;
  try {
    const result = await aiService.generateContent(validation.data.prompt, validation.data.type);
    await logAIUsage({ req, requestType: 'generate', status: 'success' });
    res.json(result);
  } catch (err) {
    await logAIUsage({ req, requestType: 'generate', status: 'error', errorMessage: (err as Error).message });
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
};

export const extractText = async (req: AuthRequest, res: Response) => {
  const validation = aiValidation.extractTextSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.issues });
    return;
  }
  if (!(await checkLimit(req.user, res))) return;
  try {
    // Placeholder: Gemini does not support file extraction
    const result = await aiService.extractText(validation.data.fileId);
    await logAIUsage({ req, requestType: 'extract', status: 'success' });
    res.json(result);
  } catch (err) {
    await logAIUsage({ req, requestType: 'extract', status: 'error', errorMessage: (err as Error).message });
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
};

export const analyzeContent = async (req: AuthRequest, res: Response) => {
  const validation = aiValidation.analyzeContentSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.issues });
    return;
  }
  if (!(await checkLimit(req.user, res))) return;
  try {
    const result = await aiService.analyzeContent(validation.data.content);
    await logAIUsage({ req, requestType: 'analyze', status: 'success' });
    res.json(result);
  } catch (err) {
    await logAIUsage({ req, requestType: 'analyze', status: 'error', errorMessage: (err as Error).message });
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getAIUsageStats = async (req: AuthRequest, res: Response) => {
  const validation = aiValidation.getAIUsageStatsSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ error: validation.error.issues });
    return;
  }
  try {
    const userId = req.user?.userId;
    const { period } = validation.data;
    let match: any = { userId };
    if (period === 'day') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      match.createdAt = { $gte: start };
    } else if (period === 'month') {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      match.createdAt = { $gte: start };
    }
    const usage = await AIUsage.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$requestType',
          totalRequests: { $sum: 1 },
          tokensUsed: { $sum: '$tokensUsed' },
          cost: { $sum: '$cost' },
        },
      },
    ]);
    const total = usage.reduce((acc, cur) => {
      acc.totalRequests += cur.totalRequests;
      acc.tokensUsed += cur.tokensUsed;
      acc.cost += cur.cost;
      return acc;
    }, { totalRequests: 0, tokensUsed: 0, cost: 0 });
    res.json({ total, breakdown: usage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: (err as Error).message });
  }
};
