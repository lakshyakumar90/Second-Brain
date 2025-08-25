import { useState, useEffect, useCallback } from 'react';
import { analyticsApi, type DashboardStats, type ActivityLog, type TimeRange } from '@/services/analyticsApi';

interface AnalyticsData {
  dashboardStats: DashboardStats | null;
  activityTrends: any[];
  mostUsedCategories: any[];
  growthMetrics: any;
  activityFeed: ActivityLog[];
  totalPages: number;
  currentPage: number;
}

interface UseAnalyticsReturn {
  data: AnalyticsData;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  loadActivityFeed: (page?: number, filters?: any) => Promise<void>;
  setTimeRange: (timeRange: TimeRange) => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class AnalyticsCache {
  private cache = new Map<string, { data: any; timestamp: number }>();

  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

const cache = new AnalyticsCache();

export const useAnalytics = (): UseAnalyticsReturn => {
  const [data, setData] = useState<AnalyticsData>({
    dashboardStats: null,
    activityTrends: [],
    mostUsedCategories: [],
    growthMetrics: null,
    activityFeed: [],
    totalPages: 1,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRangeState] = useState<TimeRange | null>(null);

  const loadDashboardData = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      
      const cacheKey = `dashboard-${JSON.stringify(timeRange)}`;
      const cachedData = forceRefresh ? null : cache.get(cacheKey);

      if (cachedData) {
        setData(prev => ({
          ...prev,
          ...cachedData,
        }));
        return;
      }

      const [stats, trends, categories, growth] = await Promise.all([
        analyticsApi.dashboardStats,
        analyticsApi.getActivityTrends(30),
        analyticsApi.getMostUsedCategories(10),
        analyticsApi.getGrowthAnalytics('month'),
      ]);

      const newData = {
        dashboardStats: stats,
        activityTrends: trends,
        mostUsedCategories: categories,
        growthMetrics: growth,
      };

      cache.set(cacheKey, newData);
      setData(prev => ({
        ...prev,
        ...newData,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      console.error('Error loading dashboard data:', err);
    }
  }, [timeRange]);

  const loadActivityFeed = useCallback(async (page = 1, filters = {}) => {
    try {
      setError(null);
      
      const cacheKey = `activity-feed-${page}-${JSON.stringify(filters)}`;
      const cachedData = cache.get(cacheKey);

      if (cachedData) {
        setData(prev => ({
          ...prev,
          activityFeed: cachedData.activities,
          totalPages: cachedData.totalPages,
          currentPage: cachedData.page,
        }));
        return;
      }

      const response = await analyticsApi.getActivityFeed(page, 20, filters);
      
      cache.set(cacheKey, response);
      setData(prev => ({
        ...prev,
        activityFeed: response.activities,
        totalPages: response.totalPages,
        currentPage: response.page,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity feed');
      console.error('Error loading activity feed:', err);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadDashboardData(true),
        loadActivityFeed(1, {}, true),
      ]);
      cache.invalidate('dashboard');
      cache.invalidate('activity-feed');
    } finally {
      setRefreshing(false);
    }
  }, [loadDashboardData, loadActivityFeed]);

  const setTimeRange = useCallback((newTimeRange: TimeRange) => {
    setTimeRangeState(newTimeRange);
    cache.invalidate('dashboard');
    cache.invalidate('activity-feed');
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadDashboardData(),
          loadActivityFeed(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [loadDashboardData, loadActivityFeed]);

  return {
    data,
    loading,
    refreshing,
    error,
    refreshData,
    loadActivityFeed,
    setTimeRange,
  };
};
