export interface Category {
  _id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  parentId?: string;
  isDefault: boolean;
  isPublic: boolean;
  sortOrder: number;
  autoClassify: boolean;
  aiKeywords: string[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  color: string;
  icon: string;
  parentId?: string;
  isDefault?: boolean;
  isPublic?: boolean;
  sortOrder?: number;
  autoClassify?: boolean;
  aiKeywords?: string[];
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  _id: string;
}

export interface CategoryFilters {
  page?: number;
  limit?: number;
  isDefault?: boolean;
  isPublic?: boolean;
  parentId?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CategoryResponse {
  message: string;
  category: Category;
}

export interface CategoriesResponse {
  message: string;
  data: {
    categories: Category[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCategories: number;
      categoriesPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters: {
      applied: CategoryFilters;
    };
  };
}

class CategoryApiService {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async createCategory(data: CreateCategoryData): Promise<CategoryResponse> {
    return this.makeRequest<CategoryResponse>('/categories/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCategories(filters: CategoryFilters = {}): Promise<CategoriesResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/categories/all${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await this.makeRequest<any>(endpoint);
      // Transform the response to match our expected format
      return {
        message: "Categories retrieved successfully",
        data: {
          categories: response.categories || response || [],
          pagination: response.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalCategories: (response.categories || response || []).length,
            categoriesPerPage: (response.categories || response || []).length,
            hasNextPage: false,
            hasPrevPage: false,
          },
          filters: {
            applied: filters,
          },
        },
      };
    } catch (error) {
      console.error('Failed to get categories:', error);
      return {
        message: "No categories found",
        data: {
          categories: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalCategories: 0,
            categoriesPerPage: 20,
            hasNextPage: false,
            hasPrevPage: false,
          },
          filters: {
            applied: filters,
          },
        },
      };
    }
  }

  async getCategory(id: string): Promise<CategoryResponse> {
    return this.makeRequest<CategoryResponse>(`/categories/${id}`);
  }

  async updateCategory(data: UpdateCategoryData): Promise<CategoryResponse> {
    return this.makeRequest<CategoryResponse>(`/categories/${data._id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  async assignItemsToCategory(categoryId: string, itemIds: string[]): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/categories/${categoryId}/assign-items`, {
      method: 'POST',
      body: JSON.stringify({ itemIds }),
    });
  }

  async removeItemsFromCategory(categoryId: string, itemIds: string[]): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/categories/${categoryId}/remove-items`, {
      method: 'POST',
      body: JSON.stringify({ itemIds }),
    });
  }

  async getCategoryItems(categoryId: string, page = 1, limit = 20): Promise<any> {
    return this.makeRequest(`/categories/${categoryId}/items?page=${page}&limit=${limit}`);
  }

  async reorderCategories(categoryIds: string[]): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/categories/reorder', {
      method: 'POST',
      body: JSON.stringify({ categoryIds }),
    });
  }

  async duplicateCategory(id: string): Promise<CategoryResponse> {
    return this.makeRequest<CategoryResponse>(`/categories/${id}/duplicate`, {
      method: 'POST',
    });
  }

  async exportCategory(id: string): Promise<Blob> {
    const response = await fetch(`${this.baseURL}/categories/${id}/export`, {
      credentials: 'include', // Include cookies for authentication
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }
}

export const categoryApi = new CategoryApiService();
