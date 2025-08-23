import axios from 'axios';

export interface Tag {
  _id: string;
  name: string;
  color: string;
  description?: string;
  itemCount: number;
  usageCount: number;
  isDefault: boolean;
  isPublic: boolean;
  sortOrder: number;
  autoSuggest: boolean;
  aiKeywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagData {
  name: string;
  color?: string;
  description?: string;
  isDefault?: boolean;
  isPublic?: boolean;
  sortOrder?: number;
  autoSuggest?: boolean;
  aiKeywords?: string[];
}

export interface UpdateTagData extends Partial<CreateTagData> {
  _id: string;
}

export interface GetTagsParams {
  page?: number;
  limit?: number;
  search?: string;
  isDefault?: boolean;
  isPublic?: boolean;
  sortBy?: 'name' | 'usageCount' | 'itemCount' | 'createdAt' | 'updatedAt' | 'sortOrder';
  sortOrder?: 'asc' | 'desc';
}

export interface GetTagSuggestionsParams {
  query: string;
  limit?: number;
}

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const tagApi = {
  // Create a new tag
  createTag: async (data: CreateTagData): Promise<{ message: string; tag: Tag }> => {
    const response = await axios.post(`${apiUrl}/tags/create`, data, {
      withCredentials: true,
    });
    return response.data;
  },

  // Get all tags with filtering and pagination
  getTags: async (params: GetTagsParams = {}): Promise<{
    message: string;
    data: {
      tags: Tag[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalTags: number;
        tagsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
      filters: {
        applied: Record<string, any>;
      };
    };
  }> => {
    const response = await axios.get(`${apiUrl}/tags`, {
      params,
      withCredentials: true,
    });
    return response.data;
  },

  // Get a single tag by ID
  getTag: async (tagId: string): Promise<{ message: string; tag: Tag }> => {
    const response = await axios.get(`${apiUrl}/tags/${tagId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  // Update a tag
  updateTag: async (tagId: string, data: Partial<CreateTagData>): Promise<{ message: string; tag: Tag }> => {
    const response = await axios.put(`${apiUrl}/tags/${tagId}`, data, {
      withCredentials: true,
    });
    return response.data;
  },

  // Delete a tag (soft delete)
  deleteTag: async (tagId: string): Promise<{ message: string; tag: Tag }> => {
    const response = await axios.delete(`${apiUrl}/tags/${tagId}`, {
      withCredentials: true,
    });
    return response.data;
  },

  // Restore a deleted tag
  restoreTag: async (tagId: string): Promise<{ message: string; tag: Tag }> => {
    const response = await axios.patch(`${apiUrl}/tags/${tagId}/restore`, {}, {
      withCredentials: true,
    });
    return response.data;
  },

  // Get tag suggestions for autocomplete
  getTagSuggestions: async (params: GetTagSuggestionsParams): Promise<{
    message: string;
    suggestions: Array<{ name: string; color: string; usageCount: number }>;
  }> => {
    const response = await axios.get(`${apiUrl}/tags/suggestions`, {
      params,
      withCredentials: true,
    });
    return response.data;
  },

  // Bulk delete tags
  bulkDeleteTags: async (tagIds: string[]): Promise<{
    message: string;
    deletedCount: number;
    tags: Array<{ _id: string; name: string }>;
  }> => {
    const response = await axios.post(`${apiUrl}/tags/bulk-delete`, { ids: tagIds }, {
      withCredentials: true,
    });
    return response.data;
  },

  // Bulk restore tags
  bulkRestoreTags: async (tagIds: string[]): Promise<{
    message: string;
    restoredCount: number;
  }> => {
    const response = await axios.post(`${apiUrl}/tags/bulk-restore`, { ids: tagIds }, {
      withCredentials: true,
    });
    return response.data;
  },
};
