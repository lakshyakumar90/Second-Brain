import { Request, Response } from 'express';
import { Item, Category, Share, AIUsage, ActivityLog } from '../models';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const getDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const [itemCount, categoryCount, shareCount, aiUsageCount] = await Promise.all([
      Item.countDocuments({ userId: userObjectId }),
      Category.countDocuments({ userId: userObjectId }),
      Share.countDocuments({ userId: userObjectId }),
      AIUsage.countDocuments({ userId: userObjectId })
    ]);
    res.status(200).json({
      itemCount,
      categoryCount,
      shareCount,
      aiUsageCount
    });
    return;
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard analytics', error: err });
  }
};

export const getUsageAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const usage = await ActivityLog.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);
    res.status(200).json({ usage });
    return;
  } catch (err) {
    res.status(500).json({ message: 'Error fetching usage analytics', error: err });
  }
};

export const getItemAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const [byType, byVisibility] = await Promise.all([
      Item.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Item.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: '$visibility', count: { $sum: 1 } } }
      ])
    ]);
    res.status(200).json({ byType, byVisibility });
    return;
  } catch (err) {
    res.status(500).json({ message: 'Error fetching item analytics', error: err });
  }
};

export const getCategoryAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const categories = await Category.find({ userId: userObjectId }).lean();
    const itemCounts = await Item.aggregate([
      { $match: { userId: userObjectId } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } }
    ]);
    res.status(200).json({
      categoryCount: categories.length,
      itemCountsPerCategory: itemCounts
    });
    return;         
  } catch (err) {
    res.status(500).json({ message: 'Error fetching category analytics', error: err });
  }
};

export const getShareAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const [totalShares, activeShares] = await Promise.all([
      Share.countDocuments({ userId: userObjectId }),
      Share.countDocuments({ userId: userObjectId, isPublic: true })
    ]);
    res.status(200).json({ totalShares, activeShares });
    return;
  } catch (err) {
    res.status(500).json({ message: 'Error fetching share analytics', error: err });
  }
};

export const getAIAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const aiUsage = await AIUsage.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    res.status(200).json({ aiUsage });
    return;
  } catch (err) {
    res.status(500).json({ message: 'Error fetching AI analytics', error: err });
  }
};

export const exportAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);
    // Gather all analytics
    const [dashboard, usage, item, category, share, ai] = await Promise.all([
      (async () => {
        const [itemCount, categoryCount, shareCount, aiUsageCount] = await Promise.all([
          Item.countDocuments({ userId: userObjectId }),
          Category.countDocuments({ userId: userObjectId }),
          Share.countDocuments({ userId: userObjectId }),
          AIUsage.countDocuments({ userId: userObjectId })
        ]);
        return { itemCount, categoryCount, shareCount, aiUsageCount };
      })(),
      ActivityLog.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: '$action', count: { $sum: 1 } } }
      ]),
      Promise.all([
        Item.aggregate([
          { $match: { userId: userObjectId } },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        Item.aggregate([
          { $match: { userId: userObjectId } },
          { $group: { _id: '$visibility', count: { $sum: 1 } } }
        ])
      ]).then(([byType, byVisibility]) => ({ byType, byVisibility })),
      (async () => {
        const categories = await Category.find({ userId: userObjectId }).lean();
        const itemCounts = await Item.aggregate([
          { $match: { userId: userObjectId } },
          { $unwind: '$categories' },
          { $group: { _id: '$categories', count: { $sum: 1 } } }
        ]);
        return { categoryCount: categories.length, itemCountsPerCategory: itemCounts };
      })(),
      Promise.all([
        Share.countDocuments({ userId: userObjectId }),
        Share.countDocuments({ userId: userObjectId, isPublic: true })
      ]).then(([totalShares, activeShares]) => ({ totalShares, activeShares })),
      AIUsage.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ])
    ]);
    res.status(200).json({
      dashboard,
      usage,
      item,
      category,
      share,
      ai
    });
    return;
  } catch (err) {
    res.status(500).json({ message: 'Error exporting analytics', error: err });
  }
};
