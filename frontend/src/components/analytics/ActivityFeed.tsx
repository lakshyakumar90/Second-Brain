import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { analyticsApi, type ActivityLog, type AnalyticsFilters } from '@/services/analyticsApi';

interface ActivityFeedProps {
  className?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ className }) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<AnalyticsFilters>({});

  const loadActivities = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await analyticsApi.getActivityFeed(page, 20, filters);
      setActivities(response.activities);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities(1);
  }, [filters]);

  const handleFilterChange = (key: keyof AnalyticsFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const formatActivityAction = (action: string, resourceType: string) => {
    const actionMap: Record<string, string> = {
      create: 'Created',
      update: 'Updated',
      delete: 'Deleted',
      share: 'Shared',
      view: 'Viewed',
      comment: 'Commented on',
      collaborate: 'Collaborated on',
      aiChat: 'Used AI chat',
      search: 'Searched',
    };

    const resourceMap: Record<string, string> = {
      item: 'item',
      category: 'category',
      workspace: 'workspace',
      share: 'share',
      collaboration: 'collaboration',
      aiChat: 'AI chat',
    };

    return `${actionMap[action] || action} ${resourceMap[resourceType] || resourceType}`;
  };

  const getActionColor = (action: string) => {
    const colorMap: Record<string, string> = {
      create: 'bg-green-100 text-green-800',
      update: 'bg-blue-100 text-blue-800',
      delete: 'bg-red-100 text-red-800',
      share: 'bg-purple-100 text-purple-800',
      view: 'bg-gray-100 text-gray-800',
      comment: 'bg-yellow-100 text-yellow-800',
      collaborate: 'bg-indigo-100 text-indigo-800',
      aiChat: 'bg-pink-100 text-pink-800',
      search: 'bg-orange-100 text-orange-800',
    };
    return colorMap[action] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest workspace activities</CardDescription>
        
        {/* Filters */}
        <div className="flex items-center gap-4 pt-4">
          <Select
            value={filters.resourceType || ''}
            onValueChange={(value) => handleFilterChange('resourceType', value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Resources" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Resources</SelectItem>
              <SelectItem value="item">Items</SelectItem>
              <SelectItem value="category">Categories</SelectItem>
              <SelectItem value="workspace">Workspaces</SelectItem>
              <SelectItem value="share">Shares</SelectItem>
              <SelectItem value="aiChat">AI Chat</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.action || ''}
            onValueChange={(value) => handleFilterChange('action', value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Actions</SelectItem>
              <SelectItem value="create">Created</SelectItem>
              <SelectItem value="update">Updated</SelectItem>
              <SelectItem value="delete">Deleted</SelectItem>
              <SelectItem value="share">Shared</SelectItem>
              <SelectItem value="view">Viewed</SelectItem>
              <SelectItem value="comment">Commented</SelectItem>
              <SelectItem value="search">Searched</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No activities found
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity._id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-shrink-0">
                    <Badge className={getActionColor(activity.action)}>
                      {activity.action}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {formatActivityAction(activity.action, activity.resourceType)}
                    </p>
                    {activity.details?.query && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Query: "{activity.details.query}"
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadActivities(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadActivities(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
