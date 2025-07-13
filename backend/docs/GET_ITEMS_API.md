# Get Items API Documentation

## Endpoint
```
GET /api/items
```

## Description
Retrieves user items with comprehensive filtering, sorting, and pagination capabilities.

## Authentication
Requires authentication via Bearer token in Authorization header.

## Query Parameters

### Pagination
- `page` (optional, default: 1): Page number for pagination
- `limit` (optional, default: 20, max: 100): Number of items per page

### Basic Filters
- `type` (optional): Filter by content type
  - Values: `text`, `image`, `video`, `link`, `document`, `audio`
- `isPublic` (optional): Filter by public status
  - Values: `true`, `false`
- `isFavorite` (optional): Filter by favorite status
  - Values: `true`, `false`
- `isArchived` (optional): Filter by archived status
  - Values: `true`, `false`

### Search and Content Filters
- `search` (optional): Search in title, content, extracted text, and description
  - Case-insensitive text search
- `tags` (optional): Filter by tags (comma-separated)
  - Example: `tags=javascript,react,frontend`
- `categories` (optional): Filter by categories (comma-separated)
  - Example: `categories=work,personal,ideas`

### Advanced Filters
- `workspace` (optional): Filter by workspace ID
- `socialPlatform` (optional): Filter by social media platform
  - Values: `twitter`, `instagram`, `youtube`, `linkedin`, `tiktok`, `reddit`, `pinterest`
- `sentiment` (optional): Filter by AI-detected sentiment
  - Values: `positive`, `negative`, `neutral`
- `complexity` (optional): Filter by AI-detected complexity
  - Values: `low`, `medium`, `high`

### Date Filters
- `dateFrom` (optional): Filter items created from this date
  - Format: ISO 8601 datetime string
- `dateTo` (optional): Filter items created until this date
  - Format: ISO 8601 datetime string

### Sorting
- `sortBy` (optional, default: `createdAt`): Field to sort by
  - Values: `createdAt`, `updatedAt`, `title`, `viewCount`, `lastViewedAt`, `lastEditedAt`
- `sortOrder` (optional, default: `desc`): Sort order
  - Values: `asc`, `desc`

## Response Format

### Success Response (200)
```json
{
  "message": "Items retrieved successfully",
  "data": {
    "items": [
      {
        "_id": "item_id",
        "userId": "user_id",
        "type": "text",
        "title": "Item Title",
        "content": "Item content...",
        "url": "https://example.com",
        "files": [],
        "metadata": {
          "size": 1024,
          "duration": 120,
          "dimensions": {
            "width": 1920,
            "height": 1080
          },
          "socialPlatform": "twitter",
          "author": "John Doe",
          "description": "Item description",
          "publishedAt": "2024-01-01T00:00:00.000Z",
          "language": "en",
          "wordCount": 500,
          "readingTime": 2,
          "extractedText": "Extracted text content..."
        },
        "categories": [
          {
            "_id": "category_id",
            "name": "Work",
            "color": "#3B82F6",
            "icon": "briefcase"
          }
        ],
        "tags": ["javascript", "react"],
        "workspace": {
          "_id": "workspace_id",
          "name": "My Workspace",
          "description": "Workspace description"
        },
        "aiData": {
          "summary": "AI-generated summary",
          "suggestedTags": ["tag1", "tag2"],
          "suggestedCategories": ["category1"],
          "sentiment": "positive",
          "keyTopics": ["topic1", "topic2"],
          "complexity": "medium",
          "extractedEntities": ["entity1", "entity2"],
          "lastProcessedAt": "2024-01-01T00:00:00.000Z"
        },
        "isPublic": false,
        "shareId": "share_id",
        "collaborators": [],
        "isFavorite": false,
        "isArchived": false,
        "isDeleted": false,
        "viewCount": 5,
        "lastViewedAt": "2024-01-01T00:00:00.000Z",
        "lastEditedAt": "2024-01-01T00:00:00.000Z",
        "lastEditedBy": {
          "_id": "user_id",
          "name": "John Doe",
          "username": "johndoe"
        },
        "version": 1,
        "parentId": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "applied": {
        "type": "text",
        "isPublic": false,
        "isFavorite": true,
        "isArchived": false,
        "search": "javascript",
        "tags": ["javascript", "react"],
        "categories": ["work"],
        "workspace": "workspace_id",
        "socialPlatform": "twitter",
        "sentiment": "positive",
        "complexity": "medium",
        "dateFrom": "2024-01-01T00:00:00.000Z",
        "dateTo": "2024-12-31T23:59:59.999Z",
        "sortBy": "createdAt",
        "sortOrder": "desc"
      }
    }
  }
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "error": "Authentication required"
}
```

#### 400 Bad Request (Validation Error)
```json
{
  "message": "Validation failed",
  "error": [
    {
      "field": "limit",
      "message": "Number must be less than or equal to 100"
    }
  ]
}
```

#### 500 Internal Server Error
```json
{
  "message": "Error retrieving items",
  "error": "Internal server error"
}
```

## Usage Examples

### Get all items (default pagination)
```
GET /api/items
```

### Get items with pagination
```
GET /api/items?page=2&limit=10
```

### Filter by content type
```
GET /api/items?type=text
```

### Search for items
```
GET /api/items?search=javascript
```

### Filter by multiple tags
```
GET /api/items?tags=javascript,react,frontend
```

### Filter by categories
```
GET /api/items?categories=work,personal
```

### Filter by date range
```
GET /api/items?dateFrom=2024-01-01T00:00:00.000Z&dateTo=2024-12-31T23:59:59.999Z
```

### Filter by AI sentiment
```
GET /api/items?sentiment=positive
```

### Filter by social platform
```
GET /api/items?socialPlatform=twitter
```

### Sort by title in ascending order
```
GET /api/items?sortBy=title&sortOrder=asc
```

### Complex filtering example
```
GET /api/items?type=text&search=javascript&tags=react,frontend&isFavorite=true&sortBy=createdAt&sortOrder=desc&page=1&limit=20
```

## Notes

1. **Authentication**: All requests must include a valid Bearer token
2. **Pagination**: Maximum limit is 100 items per page
3. **Search**: Case-insensitive search across multiple fields
4. **Tags/Categories**: Multiple values can be provided as comma-separated strings
5. **Date Format**: Use ISO 8601 datetime format for date filters
6. **Deleted Items**: Items marked as deleted are automatically excluded
7. **Populated Fields**: Categories, workspace, and lastEditedBy are automatically populated
8. **Performance**: Large result sets are paginated for optimal performance 