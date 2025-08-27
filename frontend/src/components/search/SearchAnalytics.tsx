import React, { useEffect, useState } from 'react';
import { TrendingUp, Search, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { searchApi } from '@/services/searchApi';

interface SearchAnalyticsProps {
  className?: string;
}

const SearchAnalytics: React.FC<SearchAnalyticsProps> = ({ className = '' }) => {
  const [analytics, setAnalytics] = useState({
    totalSearches: 0,
    popularQueries: [] as Array<{ query: string; count: number }>,
    searchTrends: [] as Array<{ date: string; count: number }>,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await searchApi.getSearchAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load search analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Search Analytics</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{analytics.totalSearches}</div>
          <div className="text-sm text-muted-foreground">Total Searches</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {analytics.popularQueries.length}
          </div>
          <div className="text-sm text-muted-foreground">Popular Queries</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {analytics.searchTrends.length}
          </div>
          <div className="text-sm text-muted-foreground">Days Tracked</div>
        </div>
      </div>

      {/* Popular Queries */}
      <div className="mb-6">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-1">
          <TrendingUp className="h-4 w-4" />
          Popular Queries
        </h4>
        <div className="space-y-2">
          {analytics.popularQueries.slice(0, 5).map((query, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">{query.query}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {query.count}
              </Badge>
            </div>
          ))}
          {analytics.popularQueries.length === 0 && (
            <p className="text-sm text-muted-foreground">No search data available</p>
          )}
        </div>
      </div>

      {/* Search Trends */}
      {analytics.searchTrends.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {analytics.searchTrends.slice(-7).map((trend, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {new Date(trend.date).toLocaleDateString()}
                </span>
                <Badge variant="outline" className="text-xs">
                  {trend.count} searches
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default SearchAnalytics;

