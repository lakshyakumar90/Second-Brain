import { Request, Response } from 'express';
import * as aiService from '../services/aiService';
import * as aiValidation from '../validations/aiValidation';
import AIUsage from '../models/aiUsage.model';
import { AI_LIMITS } from '../config/constants';

interface AuthRequest extends Request {
  user?: any;
}

function getUserTier(user: any) {
  return user?.subscription?.plan || 'free';
}

function getUserUsage(user: any) {
  return user?.usage || {};
}

async function checkLimit(user: any, res: Response) {
  const tier = getUserTier(user);
  const usage = getUserUsage(user);
  const dailyLimit = AI_LIMITS[`${tier.toUpperCase()}_DAILY_REQUESTS` as keyof typeof AI_LIMITS];
  if (usage.aiRequestsToday >= dailyLimit) {
    res.status(429).json({ message: 'AI daily quota exceeded for your plan.' });
    return false;
  }
  return true;
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
    res.json(result);
  } catch (err) {
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
    res.json(result);
  } catch (err) {
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
    res.json(result);
  } catch (err) {
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
    res.json(result);
  } catch (err) {
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
    res.json(result);
  } catch (err) {
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
    res.json(result);
  } catch (err) {
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
    res.json(result);
  } catch (err) {
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
    res.json(result);
  } catch (err) {
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
    const userId = req.user?._id;
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
