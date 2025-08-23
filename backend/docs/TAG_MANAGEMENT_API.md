# Tag Management API Documentation

This document describes the Tag Management API endpoints for the Second Brain application.

## Base URL
```
/api/v1/tags
```

## Authentication
All endpoints require authentication via the `authMiddleware`. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Tag
**POST** `/api/v1/tags/create`

Creates a new tag for the authenticated user.

**Request Body:**
```json
{
  "name": "javascript",
  "color": "#F59E0B",
  "description": "JavaScript related content",
  "isDefault": false,
  "isPublic": false,
  "autoSuggest": true,
  "aiKeywords": ["js", "javascript", "frontend"]
}
```

**Response:**
```json
{
  "message": "Tag created successfully",
  "tag": {
    "_id": "tag-id",
    "name": "javascript",
    "color": "#F59E0B",
    "description": "JavaScript related content",
    "itemCount": 0,
    "usageCount": 0,
    "isDefault": false,
    "isPublic": false,
    "autoSuggest": true,
    "aiKeywords": ["js", "javascript", "frontend"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get Tags
**GET** `/api/v1/tags`

Retrieves tags with optional filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1): Page number for pagination
- `limit` (number, default: 20, max: 100): Number of tags per page
- `search` (string): Search in tag name
- `isDefault` (boolean): Filter by default status
- `isPublic` (boolean): Filter by public status
- `sortBy` (string): Sort field (name, usageCount, itemCount, createdAt, updatedAt, sortOrder)
- `sortOrder` (string): Sort direction (asc, desc)

**Response:**
```json
{
  "message": "Tags retrieved successfully",
  "data": {
    "tags": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalTags": 100,
      "tagsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "applied": {...}
    }
  }
}
```

### 3. Get Tag Suggestions
**GET** `/api/v1/tags/suggestions`

Retrieves tag suggestions for autocomplete functionality.

**Query Parameters:**
- `query` (string, required): Search query
- `limit` (number, default: 10, max: 50): Number of suggestions

**Response:**
```json
{
  "message": "Tag suggestions retrieved successfully",
  "suggestions": [
    {
      "name": "javascript",
      "color": "#F59E0B",
      "usageCount": 15
    }
  ]
}
```

### 4. Get Single Tag
**GET** `/api/v1/tags/:tagId`

Retrieves a specific tag by ID.

**Response:**
```json
{
  "message": "Tag retrieved successfully",
  "tag": {
    "_id": "tag-id",
    "name": "javascript",
    "color": "#F59E0B",
    "description": "JavaScript related content",
    "itemCount": 15,
    "usageCount": 25,
    "isDefault": false,
    "isPublic": false,
    "autoSuggest": true,
    "aiKeywords": ["js", "javascript", "frontend"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Update Tag
**PUT** `/api/v1/tags/:tagId`

Updates an existing tag.

**Request Body:** (All fields optional)
```json
{
  "name": "updated-javascript",
  "color": "#EF4444",
  "description": "Updated description",
  "isDefault": true,
  "isPublic": true,
  "autoSuggest": false,
  "aiKeywords": ["updated", "keywords"]
}
```

**Response:**
```json
{
  "message": "Tag updated successfully",
  "tag": {
    "_id": "tag-id",
    "name": "updated-javascript",
    "color": "#EF4444",
    "description": "Updated description",
    "itemCount": 15,
    "usageCount": 25,
    "isDefault": true,
    "isPublic": true,
    "autoSuggest": false,
    "aiKeywords": ["updated", "keywords"],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 6. Delete Tag
**DELETE** `/api/v1/tags/:tagId`

Soft deletes a tag and removes it from all items.

**Response:**
```json
{
  "message": "Tag deleted successfully",
  "tag": {
    "_id": "tag-id",
    "name": "javascript",
    "isDeleted": true,
    "deletedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 7. Restore Tag
**PATCH** `/api/v1/tags/:tagId/restore`

Restores a previously deleted tag.

**Response:**
```json
{
  "message": "Tag restored successfully",
  "tag": {
    "_id": "tag-id",
    "name": "javascript",
    "isDeleted": false,
    "deletedAt": null
  }
}
```

### 8. Bulk Delete Tags
**POST** `/api/v1/tags/bulk-delete`

Soft deletes multiple tags at once.

**Request Body:**
```json
{
  "ids": ["tag-id-1", "tag-id-2", "tag-id-3"]
}
```

**Response:**
```json
{
  "message": "Successfully deleted 3 tags",
  "deletedCount": 3,
  "tags": [
    {"_id": "tag-id-1", "name": "javascript"},
    {"_id": "tag-id-2", "name": "react"},
    {"_id": "tag-id-3", "name": "typescript"}
  ]
}
```

### 9. Bulk Restore Tags
**POST** `/api/v1/tags/bulk-restore`

Restores multiple deleted tags at once.

**Request Body:**
```json
{
  "ids": ["tag-id-1", "tag-id-2", "tag-id-3"]
}
```

**Response:**
```json
{
  "message": "Successfully restored 3 tags",
  "restoredCount": 3
}
```

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "message": "Validation failed",
  "error": [
    {
      "field": "name",
      "message": "Tag name is required"
    }
  ]
}
```

**401 Unauthorized:**
```json
{
  "message": "Unauthorized",
  "error": "Authentication required"
}
```

**404 Not Found:**
```json
{
  "message": "Tag not found",
  "error": "The requested tag does not exist or you don't have access to it"
}
```

**409 Conflict:**
```json
{
  "message": "Tag already exists",
  "error": "A tag with this name already exists"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Error creating tag",
  "error": "Internal server error"
}
```

## Validation Rules

### Tag Name
- Required
- Minimum 1 character
- Maximum 30 characters
- Must be unique per user
- Can only contain letters, numbers, spaces, hyphens, and underscores
- Automatically converted to lowercase

### Tag Color
- Optional
- Must be valid hex color format (#RRGGBB)
- Default: #6B7280

### Tag Description
- Optional
- Maximum 100 characters

### AI Keywords
- Optional array of strings
- Each keyword must be non-empty
- Used for AI-powered tag suggestions

### Bulk Operations
- Maximum 100 items/tags per operation
- All IDs must be valid ObjectIds
- All resources must belong to the authenticated user

## Integration with Items

Tags are automatically integrated with the Items API:
- Items can have multiple tags
- Tags are stored as strings in the item's `tags` array
- When a tag is deleted, it's automatically removed from all items
- Tag usage counts are updated when items are created/updated/deleted

## Usage Examples

### Create a Tag
```bash
curl -X POST http://localhost:3000/api/v1/tags/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "work",
    "color": "#3B82F6",
    "description": "Work-related content",
    "isDefault": true,
    "autoSuggest": true,
    "aiKeywords": ["work", "job", "career"]
  }'
```

### Get Tags with Filtering
```bash
curl -X GET "http://localhost:3000/api/v1/tags?search=js&isDefault=true&sortBy=usageCount&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Tag Suggestions
```bash
curl -X GET "http://localhost:3000/api/v1/tags/suggestions?query=js&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Notes

1. **Soft Delete**: Tags are soft deleted (isDeleted flag) rather than permanently removed
2. **Automatic Cleanup**: Deleted tags are automatically removed from all items
3. **Case Insensitive**: Tag names are automatically converted to lowercase
4. **Unique Names**: Tag names must be unique per user
5. **AI Integration**: Tags support AI keywords for intelligent suggestions
6. **Bulk Operations**: Support for bulk delete and restore operations
7. **Pagination**: All list endpoints support pagination with configurable limits
8. **Search**: Full-text search across tag names with case-insensitive matching
