import { Request, Response } from 'express';
import { Item, Category, Share, AIUsage, ActivityLog } from '../models';
import mongoose from 'mongoose';
import { AuthRequest } from "../models/interfaces/userModel.interface";

export const getDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    console.log("userId", userId);
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
        { $group: { _id: '$isPublic', count: { $sum: 1 } } }
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
      { $group: { _id: '$requestType', count: { $sum: 1 } } }
    ]);
    res.status(200).json({ aiUsage });
    return;
  } catch (err) {
    res.status(500).json({ message: 'Error fetching AI analytics', error: err });
  }
};

// New Activity Feed endpoint with pagination and filtering
export const getActivityFeed = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const resourceType = req.query.resourceType as string;
    const action = req.query.action as string;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const skip = (page - 1) * limit;

    // Build match conditions
    const matchConditions: any = { userId: userObjectId };
    
    if (startDate && endDate) {
      matchConditions.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (resourceType) {
      matchConditions.resourceType = resourceType;
    }

    if (action) {
      matchConditions.action = action;
    }

    const [activities, total] = await Promise.all([
      ActivityLog.find(matchConditions)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(matchConditions)
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      activities,
      total,
      page,
      limit,
      totalPages
    });
    return;
  } catch (err) {
    res.status(500).json({ message: 'Error fetching activity feed', error: err });
  }
};

// Time-based analytics
export const getTimeBasedAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!startDate || !endDate) {
      res.status(400).json({ message: 'Start date and end date are required' });
      return;
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const dateFilter = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    const [dashboard, usage, item, category, share, ai] = await Promise.all([
      (async () => {
        const [itemCount, categoryCount, shareCount, aiUsageCount] = await Promise.all([
          Item.countDocuments({ userId: userObjectId, ...dateFilter }),
          Category.countDocuments({ userId: userObjectId, ...dateFilter }),
          Share.countDocuments({ userId: userObjectId, ...dateFilter }),
          AIUsage.countDocuments({ userId: userObjectId, ...dateFilter })
        ]);
        return { itemCount, categoryCount, shareCount, aiUsageCount };
      })(),
      ActivityLog.aggregate([
        { $match: { userId: userObjectId, ...dateFilter } },
        { $group: { _id: '$action', count: { $sum: 1 } } }
      ]),
      Promise.all([
        Item.aggregate([
          { $match: { userId: userObjectId, ...dateFilter } },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        Item.aggregate([
          { $match: { userId: userObjectId, ...dateFilter } },
          { $group: { _id: '$isPublic', count: { $sum: 1 } } }
        ])
      ]).then(([byType, byVisibility]) => ({ byType, byVisibility })),
      (async () => {
        const categories = await Category.find({ userId: userObjectId, ...dateFilter }).lean();
        const itemCounts = await Item.aggregate([
          { $match: { userId: userObjectId, ...dateFilter } },
          { $unwind: '$categories' },
          { $group: { _id: '$categories', count: { $sum: 1 } } }
        ]);
        return { categoryCount: categories.length, itemCountsPerCategory: itemCounts };
      })(),
      Promise.all([
        Share.countDocuments({ userId: userObjectId, ...dateFilter }),
        Share.countDocuments({ userId: userObjectId, isPublic: true, ...dateFilter })
      ]).then(([totalShares, activeShares]) => ({ totalShares, activeShares })),
      AIUsage.aggregate([
        { $match: { userId: userObjectId, ...dateFilter } },
        { $group: { _id: '$requestType', count: { $sum: 1 } } }
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
    res.status(500).json({ message: 'Error fetching time-based analytics', error: err });
  }
};

// Growth analytics
export const getGrowthAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const period = req.query.period as string || 'month';
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Calculate date ranges
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        previousStartDate = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }

    // Get current period counts
    const [currentItems, currentCategories, currentShares, currentAI] = await Promise.all([
      Item.countDocuments({ userId: userObjectId, createdAt: { $gte: startDate } }),
      Category.countDocuments({ userId: userObjectId, createdAt: { $gte: startDate } }),
      Share.countDocuments({ userId: userObjectId, createdAt: { $gte: startDate } }),
      AIUsage.countDocuments({ userId: userObjectId, createdAt: { $gte: startDate } })
    ]);

    // Get previous period counts
    const [previousItems, previousCategories, previousShares, previousAI] = await Promise.all([
      Item.countDocuments({ 
        userId: userObjectId, 
        createdAt: { $gte: previousStartDate, $lt: startDate } 
      }),
      Category.countDocuments({ 
        userId: userObjectId, 
        createdAt: { $gte: previousStartDate, $lt: startDate } 
      }),
      Share.countDocuments({ 
        userId: userObjectId, 
        createdAt: { $gte: previousStartDate, $lt: startDate } 
      }),
      AIUsage.countDocuments({ 
        userId: userObjectId, 
        createdAt: { $gte: previousStartDate, $lt: startDate } 
      })
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    res.status(200).json({
      itemGrowth: calculateGrowth(currentItems, previousItems),
      categoryGrowth: calculateGrowth(currentCategories, previousCategories),
      shareGrowth: calculateGrowth(currentShares, previousShares),
      aiUsageGrowth: calculateGrowth(currentAI, previousAI),
      period
    });
    return;
  } catch (err) {
    res.status(500).json({ message: 'Error fetching growth analytics', error: err });
  }
};

// Most used categories
export const getMostUsedCategories = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const categoryStats = await Item.aggregate([
      { $match: { userId: userObjectId } },
      { $unwind: '$categories' },
      { $group: { _id: '$categories', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);

    // Get category names
    const categoryIds = categoryStats.map(stat => stat._id);
    const categories = await Category.find({ 
      _id: { $in: categoryIds } 
    }).lean();

    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat._id.toString()] = cat.name;
      return acc;
    }, {} as Record<string, string>);

    // Calculate total items for percentage
    const totalItems = await Item.countDocuments({ userId: userObjectId });

    const result = categoryStats.map(stat => ({
      categoryId: stat._id.toString(),
      categoryName: categoryMap[stat._id.toString()] || 'Unknown',
      itemCount: stat.count,
      percentage: totalItems > 0 ? (stat.count / totalItems) * 100 : 0
    }));

    res.status(200).json(result);
    return;
  } catch (err) {
    res.status(500).json({ message: 'Error fetching most used categories', error: err });
  }
};

// Activity trends
export const getActivityTrends = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const days = parseInt(req.query.days as string) || 30;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await ActivityLog.aggregate([
      { $match: { userId: userObjectId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            action: "$action"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.date",
          actions: {
            $push: {
              action: "$_id.action",
              count: "$count"
            }
          },
          activityCount: { $sum: "$count" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const result = trends.map(trend => ({
      date: trend._id,
      activityCount: trend.activityCount,
      actions: trend.actions.reduce((acc: Record<string, number>, action: any) => {
        acc[action.action] = action.count;
        return acc;
      }, {})
    }));

    res.status(200).json(result);
    return;
  } catch (err) {
    res.status(500).json({ message: 'Error fetching activity trends', error: err });
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
          { $group: { _id: '$isPublic', count: { $sum: 1 } } }
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
        { $group: { _id: '$requestType', count: { $sum: 1 } } }
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
