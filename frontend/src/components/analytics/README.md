# Analytics Components

This directory contains reusable analytics components for the dashboard.

## Components

### AnalyticsCard
A reusable card component for displaying analytics metrics with growth indicators.

**Props:**
- `title`: string - The title of the metric
- `value`: number | string - The metric value
- `icon`: React.ReactNode - Icon to display
- `growth?: number` - Growth percentage (optional)
- `loading?: boolean` - Loading state (optional)
- `className?: string` - Additional CSS classes (optional)
- `description?: string` - Description text (optional)

**Usage:**
```tsx
<AnalyticsCard
  title="Total Items"
  value={1234}
  icon={<BarChart3 className="h-4 w-4" />}
  growth={12.5}
  loading={false}
/>
```

### ActivityFeed
A component for displaying user activity with filtering and pagination.

**Props:**
- `className?: string` - Additional CSS classes (optional)

**Features:**
- Real-time activity display
- Filtering by resource type and action
- Pagination
- Loading states
- Error handling

### AnalyticsChart
A reusable chart component supporting multiple chart types.

**Props:**
- `title`: string - Chart title
- `description?: string` - Chart description
- `data`: any[] - Chart data
- `type`: 'bar' | 'line' | 'pie' | 'area' - Chart type
- `dataKey`: string - Data key for the chart
- `xAxisDataKey?: string` - X-axis data key (default: 'name')
- `loading?: boolean` - Loading state
- `height?: number` - Chart height (default: 300)
- `colors?: string[]` - Custom colors
- `className?: string` - Additional CSS classes

**Usage:**
```tsx
<AnalyticsChart
  title="Activity Over Time"
  description="Daily activity trends"
  data={activityData}
  type="area"
  dataKey="activityCount"
  xAxisDataKey="date"
  loading={false}
/>
```

## Hooks

### useAnalytics
A custom hook for managing analytics data with caching and error handling.

**Returns:**
- `data`: AnalyticsData - All analytics data
- `loading`: boolean - Loading state
- `refreshing`: boolean - Refresh state
- `error`: string | null - Error message
- `refreshData`: () => Promise<void> - Function to refresh data
- `loadActivityFeed`: (page?: number, filters?: any) => Promise<void> - Load activity feed
- `setTimeRange`: (timeRange: TimeRange) => void - Set time range filter

**Usage:**
```tsx
const {
  data,
  loading,
  refreshing,
  error,
  refreshData,
  loadActivityFeed,
  setTimeRange,
} = useAnalytics();
```

## API Integration

The analytics components integrate with the backend analytics API endpoints:

- `/analytics/dashboard` - Dashboard overview stats
- `/analytics/usage` - Usage analytics
- `/analytics/item` - Item analytics
- `/analytics/category` - Category analytics
- `/analytics/share` - Share analytics
- `/analytics/ai` - AI usage analytics
- `/analytics/activity` - Activity feed with pagination
- `/analytics/time-based` - Time-based analytics
- `/analytics/growth` - Growth metrics
- `/analytics/categories/most-used` - Most used categories
- `/analytics/activity/trends` - Activity trends

## Caching

The analytics system includes a 5-minute cache for improved performance. Cache is automatically invalidated when:
- Time range changes
- Manual refresh is triggered
- Cache duration expires

## Error Handling

All components include proper error handling with user-friendly error messages and fallback states.
