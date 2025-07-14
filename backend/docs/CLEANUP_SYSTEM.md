# Cleanup System Documentation

## Overview

The cleanup system automatically permanently deletes soft-deleted items and categories after a configurable retention period (default: 1 day). This system ensures that deleted data doesn't accumulate indefinitely while providing a safety window for accidental deletions.

## How It Works

### 1. Soft Delete Process
When items or categories are "deleted" by users:
- `isDeleted` flag is set to `true`
- `deletedAt` timestamp is set to the current date/time
- Data remains in the database but is hidden from normal queries

### 2. Permanent Deletion Process
The cleanup service runs automatically every 24 hours and:
- Finds all items/categories where `isDeleted: true` AND `deletedAt` is older than 1 day
- Permanently removes them from the database
- Also cleans up related data (comments, shares, etc.)

### 3. Key Features
- ✅ **Time-based deletion**: Uses `deletedAt` timestamp, not daily iteration
- ✅ **Automatic operation**: Runs every 24 hours without manual intervention
- ✅ **Comprehensive cleanup**: Removes related data to prevent orphaned records
- ✅ **Configurable retention**: Can be adjusted via admin API
- ✅ **Admin control**: Only administrators can manage the service
- ✅ **Graceful shutdown**: Properly stops on server shutdown

## System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Action   │    │  Cleanup Service │    │   Database      │
│                 │    │                  │    │                 │
│ Delete Item     │───▶│ Check deletedAt  │───▶│ Remove Records  │
│ (Soft Delete)   │    │ (Every 24h)      │    │ (Permanent)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
   ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
   │ isDeleted:  │       │ Cutoff Date │       │ Related Data│
   │ true        │       │ (1 day ago) │       │ Cleanup     │
   │ deletedAt:  │       │             │       │             │
   │ timestamp   │       │             │       │             │
   └─────────────┘       └─────────────┘       └─────────────┘
```

## API Endpoints

### Base URL
```
/api/v1/cleanup
```

### Authentication
All endpoints require admin privileges. Include JWT token in Authorization header:
```
Authorization: Bearer <admin-jwt-token>
```

### 1. Start Cleanup Service
**POST** `/api/v1/cleanup/start`

Starts the automatic cleanup service.

**Response:**
```json
{
  "message": "Cleanup service started successfully",
  "status": {
    "isRunning": true,
    "nextCleanup": "2024-01-02T12:00:00.000Z"
  }
}
```

### 2. Stop Cleanup Service
**POST** `/api/v1/cleanup/stop`

Stops the automatic cleanup service.

**Response:**
```json
{
  "message": "Cleanup service stopped successfully",
  "status": {
    "isRunning": false
  }
}
```

### 3. Get Service Status
**GET** `/api/v1/cleanup/status`

Returns the current status of the cleanup service.

**Response:**
```json
{
  "message": "Cleanup service status retrieved successfully",
  "status": {
    "isRunning": true,
    "nextCleanup": "2024-01-02T12:00:00.000Z"
  }
}
```

### 4. Trigger Manual Cleanup
**POST** `/api/v1/cleanup/trigger`

Manually triggers a cleanup operation immediately.

**Response:**
```json
{
  "message": "Manual cleanup completed successfully",
  "stats": {
    "itemsDeleted": 15,
    "categoriesDeleted": 3,
    "commentsDeleted": 45,
    "sharesDeleted": 12,
    "collaborationsDeleted": 8,
    "aiChatsDeleted": 0,
    "aiUsageDeleted": 23,
    "activityLogsDeleted": 67,
    "notificationsDeleted": 34,
    "totalDeleted": 207,
    "errors": []
  }
}
```

### 5. Update Cleanup Settings
**PUT** `/api/v1/cleanup/settings`

Updates the retention period and cleanup interval.

**Request Body:**
```json
{
  "retentionPeriod": 48,  // Hours (default: 24)
  "cleanupInterval": 12   // Hours (default: 24)
}
```

**Response:**
```json
{
  "message": "Cleanup settings updated successfully",
  "status": {
    "isRunning": true,
    "nextCleanup": "2024-01-02T06:00:00.000Z"
  }
}
```

## Configuration

### Default Settings
- **Retention Period**: 24 hours (1 day)
- **Cleanup Interval**: 24 hours
- **Auto-start**: Enabled when server starts

### Environment Variables
```env
# Optional: Override default retention period (hours)
CLEANUP_RETENTION_PERIOD=24

# Optional: Override default cleanup interval (hours)
CLEANUP_INTERVAL=24
```

## Data Cleanup Details

### Items Cleanup
- Permanently removes items where `isDeleted: true` AND `deletedAt < cutoffDate`
- Also cleans up related data:
  - Comments
  - Shares
  - Collaborations
  - AI Usage records
  - Activity logs
  - Notifications

### Categories Cleanup
- Permanently removes categories where `isDeleted: true` AND `deletedAt < cutoffDate`
- Updates item counts for remaining categories

### Related Data Cleanup
The system intelligently cleans up related data to prevent orphaned records:

1. **Comments**: Removed when parent item is deleted
2. **Shares**: Removed when shared item is deleted
3. **Collaborations**: Removed when collaborated item is deleted
4. **AI Usage**: Removed when related item is deleted
5. **Activity Logs**: Removed when related item is deleted
6. **Notifications**: Removed when related item is deleted
7. **AI Chats**: Updated to remove references to deleted items

## Monitoring and Logging

### Console Logs
The cleanup service provides detailed logging:

```
✅ Cleanup service started successfully
🧹 Cleanup service will permanently delete soft-deleted items after 1 day
Starting cleanup operation...
Deleted 15 items
Deleted 3 categories
Deleted 45 comments for deleted items
Deleted 12 shares for deleted items
Deleted 8 collaborations for deleted items
Updated 0 AI chats to remove deleted items
Deleted 23 AI usage records for deleted items
Deleted 67 activity logs for deleted items
Deleted 34 notifications for deleted items
Cleanup completed in 1250ms. Total deleted: 207
```

### Error Handling
- Individual cleanup operations are wrapped in try-catch blocks
- Errors are logged but don't stop the entire cleanup process
- Error details are included in manual cleanup response

## Security Considerations

### Access Control
- Only users with `role: "admin"` can manage the cleanup service
- All endpoints require authentication
- Service cannot be started/stopped by regular users

### Data Safety
- Uses `deletedAt` timestamp for precise time-based deletion
- No risk of deleting items that haven't been soft-deleted for the full retention period
- Graceful error handling prevents data corruption

## Performance Considerations

### Database Impact
- Uses efficient MongoDB queries with indexes
- Bulk operations for better performance
- Runs during off-peak hours (configurable)

### Memory Usage
- Processes data in batches
- Minimal memory footprint
- Automatic garbage collection

## Troubleshooting

### Common Issues

1. **Service not starting**
   - Check admin privileges
   - Verify database connection
   - Check console logs for errors

2. **Items not being deleted**
   - Verify `isDeleted: true` and `deletedAt` are set
   - Check retention period settings
   - Ensure service is running

3. **Performance issues**
   - Monitor database performance during cleanup
   - Consider adjusting cleanup interval
   - Check for large datasets

### Debug Commands

```javascript
// Check service status
GET /api/v1/cleanup/status

// Trigger manual cleanup for testing
POST /api/v1/cleanup/trigger

// Update settings for testing
PUT /api/v1/cleanup/settings
{
  "retentionPeriod": 1,  // 1 hour for testing
  "cleanupInterval": 1   // 1 hour for testing
}
```

## Best Practices

1. **Monitor the service**: Regularly check service status and logs
2. **Test in staging**: Always test cleanup settings in staging environment
3. **Backup before changes**: Backup database before changing retention periods
4. **Gradual changes**: Make retention period changes gradually
5. **Monitor storage**: Track storage usage before and after cleanup

## Migration Guide

### From Manual Cleanup
If you previously had manual cleanup scripts:

1. Stop any existing cleanup scripts
2. Start the cleanup service: `POST /api/v1/cleanup/start`
3. Monitor the first few cleanup cycles
4. Remove old cleanup scripts

### From Different Retention Periods
To change from a different retention period:

1. Update settings: `PUT /api/v1/cleanup/settings`
2. Monitor the transition period
3. Verify cleanup behavior matches expectations

## Support

For issues or questions about the cleanup system:
1. Check the console logs for error messages
2. Verify service status via API
3. Test with manual cleanup trigger
4. Review this documentation for configuration details 