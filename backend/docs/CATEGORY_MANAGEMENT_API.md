# Category Management API Documentation

This document describes the Category Management API endpoints for the Second Brain application.

## Base URL
```
/api/categories
```

## Authentication
All endpoints require authentication via the `authMiddleware`. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Category
**POST** `/api/categories/create`

Creates a new category for the authenticated user.

**Request Body:**
```json
{
  "name": "Work Projects",
  "description": "All work-related projects and tasks",
  "color": "#3B82F6",
  "icon": "briefcase",
  "parentId": "optional-parent-category-id",
  "isDefault": false,
  "isPublic": false,
  "sortOrder": 0,
  "autoClassify": false,
  "aiKeywords": ["work", "project", "task"]
}
```

**Response:**
```json
{
  "message": "Category created successfully",
  "category": {
    "_id": "category-id",
    "name": "Work Projects",
    "description": "All work-related projects and tasks",
    "color": "#3B82F6",
    "icon": "briefcase",
    "parentId": null,
    "isDefault": false,
    "isPublic": false,
    "sortOrder": 0,
    "autoClassify": false,
    "aiKeywords": ["work", "project", "task"],
    "itemCount": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get Categories
**GET** `/api/categories`

Retrieves categories with optional filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1): Page number for pagination
- `limit` (number, default: 20, max: 100): Number of categories per page
- `isDefault` (boolean): Filter by default status
- `isPublic` (boolean): Filter by public status
- `parentId` (string): Filter by parent category ID
- `search` (string): Search in category name and description
- `sortBy` (string): Sort field (name, createdAt, updatedAt, sortOrder, itemCount)
- `sortOrder` (string): Sort direction (asc, desc)

**Response:**
```json
{
  "message": "Categories retrieved successfully",
  "data": {
    "categories": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCategories": 100,
      "categoriesPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "applied": {...}
    }
  }
}
```

### 3. Get Single Category
**GET** `/api/categories/:id`

Retrieves a specific category by ID.

**Response:**
```json
{
  "message": "Category retrieved successfully",
  "category": {
    "_id": "category-id",
    "name": "Work Projects",
    "description": "All work-related projects and tasks",
    "color": "#3B82F6",
    "icon": "briefcase",
    "parentId": null,
    "isDefault": false,
    "isPublic": false,
    "sortOrder": 0,
    "autoClassify": false,
    "aiKeywords": ["work", "project", "task"],
    "itemCount": 15,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. Get Category Items
**GET** `/api/categories/:id/items`

Retrieves all items belonging to a specific category with optional filtering and pagination.

**Query Parameters:**
- `page` (number, default: 1): Page number for pagination
- `limit` (number, default: 20, max: 100): Number of items per page
- `type` (string): Filter by item type (text, image, video, link, document, audio)
- `isPublic` (boolean): Filter by public status
- `isFavorite` (boolean): Filter by favorite status
- `isArchived` (boolean): Filter by archived status
- `search` (string): Search in item title, content, and metadata
- `tags` (string): Filter by tags (comma-separated)
- `sortBy` (string): Sort field (title, createdAt, updatedAt, viewCount, lastViewedAt)
- `sortOrder` (string): Sort direction (asc, desc)

**Response:**
```json
{
  "message": "Category items retrieved successfully",
  "data": {
    "category": {
      "id": "category-id",
      "name": "Work Projects",
      "description": "All work-related projects and tasks",
      "color": "#3B82F6",
      "icon": "briefcase",
      "itemCount": 15
    },
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 45,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "filters": {
      "applied": {...}
    }
  }
}
```

### 5. Update Category
**PUT** `/api/categories/:id`

Updates an existing category.

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Work Projects",
  "description": "Updated description",
  "color": "#EF4444",
  "icon": "folder",
  "parentId": "new-parent-id",
  "isDefault": true,
  "isPublic": true,
  "sortOrder": 5,
  "autoClassify": true,
  "aiKeywords": ["updated", "keywords"]
}
```

**Response:**
```json
{
  "message": "Category updated successfully",
  "category": {
    "_id": "category-id",
    "name": "Updated Work Projects",
    "description": "Updated description",
    "color": "#EF4444",
    "icon": "folder",
    "parentId": "new-parent-id",
    "isDefault": true,
    "isPublic": true,
    "sortOrder": 5,
    "autoClassify": true,
    "aiKeywords": ["updated", "keywords"],
    "itemCount": 15,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 6. Delete Category
**DELETE** `/api/categories/:id`

Soft deletes a category (sets isDeleted to true).

**Response:**
```json
{
  "message": "Category deleted successfully",
  "category": {
    "_id": "category-id",
    "name": "Work Projects",
    "isDeleted": true,
    "deletedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 7. Restore Category
**PATCH** `/api/categories/:id/restore`

Restores a previously deleted category.

**Response:**
```json
{
  "message": "Category restored successfully",
  "category": {
    "_id": "category-id",
    "name": "Work Projects",
    "isDeleted": false,
    "deletedAt": null
  }
}
```

### 8. Reorder Categories
**POST** `/api/categories/reorder`

Changes the sort order of multiple categories at once.

**Request Body:**
```json
{
  "categoryOrders": [
    {
      "categoryId": "category-id-1",
      "sortOrder": 0
    },
    {
      "categoryId": "category-id-2",
      "sortOrder": 1
    },
    {
      "categoryId": "category-id-3",
      "sortOrder": 2
    }
  ]
}
```

**Response:**
```json
{
  "message": "Successfully reordered 3 categories",
  "categories": [
    {
      "_id": "category-id-1",
      "name": "First Category",
      "sortOrder": 0
    },
    {
      "_id": "category-id-2",
      "name": "Second Category",
      "sortOrder": 1
    },
    {
      "_id": "category-id-3",
      "name": "Third Category",
      "sortOrder": 2
    }
  ]
}
```

### 9. Bulk Categorize Items
**POST** `/api/categories/bulk-categorize`

Assigns multiple items to categories in bulk operations.

**Request Body:**
```json
{
  "itemIds": ["item-id-1", "item-id-2", "item-id-3"],
  "categoryIds": ["category-id-1", "category-id-2"],
  "operation": "add"
}
```

**Operation Types:**
- `add`: Adds categories to existing item categories (default)
- `replace`: Replaces all existing categories with the new ones
- `remove`: Removes the specified categories from items

**Response:**
```json
{
  "message": "Successfully added categories for 3 items",
  "operation": "add",
  "updatedCount": 3,
  "items": [
    {
      "_id": "item-id-1",
      "title": "Sample Item",
      "categories": [
        {
          "_id": "category-id-1",
          "name": "Work Projects",
          "color": "#3B82F6",
          "icon": "briefcase"
        },
        {
          "_id": "category-id-2",
          "name": "Important",
          "color": "#EF4444",
          "icon": "star"
        }
      ]
    }
  ]
}
```

### 10. Bulk Delete Categories
**POST** `/api/categories/bulk-delete`

Soft deletes multiple categories at once.

**Request Body:**
```json
{
  "ids": ["category-id-1", "category-id-2", "category-id-3"]
}
```

**Response:**
```json
{
  "message": "Successfully deleted 3 categories",
  "deletedCount": 3,
  "categories": [...]
}
```

### 11. Bulk Restore Categories
**POST** `/api/categories/bulk-restore`

Restores multiple deleted categories at once.

**Request Body:**
```json
{
  "ids": ["category-id-1", "category-id-2", "category-id-3"]
}
```

**Response:**
```json
{
  "message": "Successfully restored 3 categories",
  "restoredCount": 3,
  "categories": [...]
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
      "message": "Category name is required"
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
  "message": "Category not found",
  "error": "The requested category does not exist or you don't have access to it"
}
```

**409 Conflict:**
```json
{
  "message": "Category already exists",
  "error": "A category with this name already exists"
}
```

**500 Internal Server Error:**
```json
{
  "message": "Error creating category",
  "error": "Internal server error"
}
```

## Validation Rules

### Category Name
- Required
- Minimum 1 character
- Maximum 50 characters
- Must be unique per user

### Category Description
- Optional
- Maximum 200 characters

### Category Color
- Required
- Must be valid hex color format (#RRGGBB)
- Default: #3B82F6

### Category Icon
- Optional
- Maximum 20 characters

### Sort Order
- Must be non-negative integer
- Default: 0

### Bulk Operations
- Maximum 100 items/categories per operation
- All IDs must be valid ObjectIds
- All resources must belong to the authenticated user

## Notes

1. **Soft Delete**: Categories are soft deleted (isDeleted flag) rather than permanently removed
2. **Item Count**: The itemCount field is automatically maintained by the system
3. **Circular References**: The system prevents circular references in category hierarchies
4. **Bulk Operations**: Use bulk operations for better performance when working with multiple items/categories
5. **Pagination**: All list endpoints support pagination with configurable page sizes
6. **Search**: Search functionality supports case-insensitive text matching
7. **Sorting**: All list endpoints support multiple sort fields and directions 
