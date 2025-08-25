import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, BarChart3, PieChart as PieChartIcon, Activity, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsCard, ActivityFeed, AnalyticsChart } from '@/components/analytics';

// Form schema for filters
const filterSchema = z.object({
  timeRange: z.enum(['week', 'month', 'quarter', 'custom']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type FilterFormData = z.infer<typeof filterSchema>;

const AnalyticsPage: React.FC = () => {
  const {
    data,
    loading,
    refreshing,
    error,
    refreshData,
    loadActivityFeed,
    setTimeRange,
  } = useAnalytics();

  const form = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      timeRange: 'month',
    },
  });

  const timeRange = form.watch('timeRange');

  // Handle time range change
  const handleTimeRangeChange = async (value: string) => {
    form.setValue('timeRange', value as any);
    
    // Set time range for analytics data
    if (value === 'custom' && form.getValues('startDate') && form.getValues('endDate')) {
      setTimeRange({
        startDate: form.getValues('startDate')!,
        endDate: form.getValues('endDate')!,
      });
    } else {
      // For predefined ranges, we'll use the existing logic
      // You can extend this to set actual date ranges
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track your workspace activity and insights</p>
        </div>
        <Button onClick={refreshData} disabled={refreshing}>
          {refreshing ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Time Range
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Total Items"
          value={data.dashboardStats?.itemCount || 0}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
          growth={data.growthMetrics?.itemGrowth}
          loading={loading}
        />
        <AnalyticsCard
          title="Categories"
          value={data.dashboardStats?.categoryCount || 0}
          icon={<PieChartIcon className="h-4 w-4 text-muted-foreground" />}
          growth={data.growthMetrics?.categoryGrowth}
          loading={loading}
        />
        <AnalyticsCard
          title="Shared Items"
          value={data.dashboardStats?.shareCount || 0}
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          growth={data.growthMetrics?.shareGrowth}
          loading={loading}
        />
        <AnalyticsCard
          title="AI Usage"
          value={data.dashboardStats?.aiUsageCount || 0}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          growth={data.growthMetrics?.aiUsageGrowth}
          loading={loading}
        />
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList>
          <TabsTrigger value="activity">Activity Trends</TabsTrigger>
          <TabsTrigger value="categories">Category Usage</TabsTrigger>
          <TabsTrigger value="feed">Activity Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsChart
              title="Activity Over Time"
              description="Daily activity trends"
              data={data.activityTrends}
              type="area"
              dataKey="activityCount"
              xAxisDataKey="date"
              loading={loading}
            />
            <AnalyticsChart
              title="Most Used Categories"
              description="Top categories by item count"
              data={data.mostUsedCategories}
              type="pie"
              dataKey="itemCount"
              xAxisDataKey="categoryName"
              loading={loading}
            />
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <AnalyticsChart
            title="Category Distribution"
            description="Items per category"
            data={data.mostUsedCategories}
            type="bar"
            dataKey="itemCount"
            xAxisDataKey="categoryName"
            loading={loading}
            height={400}
          />
        </TabsContent>

        <TabsContent value="feed" className="space-y-6">
          <ActivityFeed />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
