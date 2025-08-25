const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Types for analytics data
export interface DashboardStats {
  itemCount: number;
  categoryCount: number;
  shareCount: number;
  aiUsageCount: number;
}

export interface UsageAnalytics {
  usage: Array<{
    _id: string;
    count: number;
  }>;
}

export interface ItemAnalytics {
  byType: Array<{
    _id: string;
    count: number;
  }>;
  byVisibility: Array<{
    _id: string;
    count: number;
  }>;
}

export interface CategoryAnalytics {
  categoryCount: number;
  itemCountsPerCategory: Array<{
    _id: string;
    count: number;
  }>;
}

export interface ShareAnalytics {
  totalShares: number;
  activeShares: number;
}

export interface AIAnalytics {
  aiUsage: Array<{
    _id: string;
    count: number;
  }>;
}

export interface ActivityLog {
  _id: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: {
    query?: string;
    oldValues?: any;
    newValues?: any;
    metadata?: any;
  };
  createdAt: string;
}

export interface TimeRange {
  startDate: string;
  endDate: string;
}

export interface AnalyticsFilters {
  timeRange?: TimeRange;
  resourceType?: string;
  action?: string;
}

class AnalyticsApiService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const config: RequestInit = {
            ...options,
            credentials: 'include', // Include cookies for authentication
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            }
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Dashboard Overview
    get dashboardStats() {
        return this.request<DashboardStats>('/analytics/dashboard');
    }

    // Usage Analytics
    get usageAnalytics() {
        return this.request<UsageAnalytics>('/analytics/usage');
    }

    // Item Analytics
    get itemAnalytics() {
        return this.request<ItemAnalytics>('/analytics/item');
    }

    // Category Analytics
    get categoryAnalytics() {
        return this.request<CategoryAnalytics>('/analytics/category');
    }

    // Share Analytics
    get shareAnalytics() {
        return this.request<ShareAnalytics>('/analytics/share');
    }

    // AI Analytics
    get aiAnalytics() {
        return this.request<AIAnalytics>('/analytics/ai');
    }

    // Activity Feed
    getActivityFeed(page: number = 1, limit: number = 20, filters?: AnalyticsFilters) {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (filters?.timeRange) {
            params.append('startDate', filters.timeRange.startDate);
            params.append('endDate', filters.timeRange.endDate);
        }

        if (filters?.resourceType) {
            params.append('resourceType', filters.resourceType);
        }

        if (filters?.action) {
            params.append('action', filters.action);
        }

        return this.request<{
            activities: ActivityLog[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        }>(`/analytics/activity?${params.toString()}`);
    }

    // Time-based Analytics
    getTimeBasedAnalytics(timeRange: TimeRange) {
        const params = new URLSearchParams({
            startDate: timeRange.startDate,
            endDate: timeRange.endDate,
        });

        return this.request<{
            dashboard: DashboardStats;
            usage: UsageAnalytics;
            item: ItemAnalytics;
            category: CategoryAnalytics;
            share: ShareAnalytics;
            ai: AIAnalytics;
        }>(`/analytics/time-based?${params.toString()}`);
    }

    // Export Analytics
    exportAnalytics(timeRange?: TimeRange) {
        const params = timeRange ? new URLSearchParams({
            startDate: timeRange.startDate,
            endDate: timeRange.endDate,
        }) : new URLSearchParams();

        return this.request<{
            dashboard: DashboardStats;
            usage: UsageAnalytics;
            item: ItemAnalytics;
            category: CategoryAnalytics;
            share: ShareAnalytics;
            ai: AIAnalytics;
        }>(`/analytics/export?${params.toString()}`);
    }

    // Growth Analytics (comparative metrics)
    getGrowthAnalytics(period: 'week' | 'month' | 'quarter' = 'month') {
        return this.request<{
            itemGrowth: number;
            categoryGrowth: number;
            shareGrowth: number;
            aiUsageGrowth: number;
            period: string;
        }>(`/analytics/growth?period=${period}`);
    }

    // Most Used Categories
    getMostUsedCategories(limit: number = 10) {
        return this.request<Array<{
            categoryId: string;
            categoryName: string;
            itemCount: number;
            percentage: number;
        }>>(`/analytics/categories/most-used?limit=${limit}`);
    }

    // Recent Activity Trends
    getActivityTrends(days: number = 30) {
        return this.request<Array<{
            date: string;
            activityCount: number;
            actions: Record<string, number>;
        }>>(`/analytics/activity/trends?days=${days}`);
    }
}

export const analyticsApi = new AnalyticsApiService();