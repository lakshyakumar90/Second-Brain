import { type UIItem } from "@/types/items";

export interface SearchFilters {
  type?: string;
  isPublic?: boolean;
  isFavorite?: boolean;
  isArchived?: boolean;
  search?: string;
  tags?: string[];
  categories?: string[];
  workspace?: string;
  socialPlatform?: string;
  sentiment?: string;
  complexity?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  message: string;
  data: {
    items: UIItem[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    filters: {
      applied: SearchFilters;
    };
  };
}

export interface SearchSuggestion {
  type: 'title' | 'tag' | 'content';
  value: string;
  count: number;
}

class SearchApiService {
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

  async searchItems(filters: SearchFilters = {}): Promise<SearchResponse> {
    const query = filters.search || '';
    const endpoint = `/search/items?q=${encodeURIComponent(query)}`;
    
    try {
      const response = await this.makeRequest<any>(endpoint);
      // Transform the response to match our expected format
      return {
        message: "Items retrieved successfully",
        data: {
          items: response.map((item: any) => ({
            id: item._id,
            type: item.type || 'text',
            title: item.title || '',
            preview: item.content?.substring(0, 100) || '',
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            isFavorite: item.isFavorite || false,
            isPinned: item.isPinned || false,
            tags: item.tags || [],
          })),
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: response.length,
            itemsPerPage: response.length,
            hasNextPage: false,
            hasPrevPage: false,
          },
          filters: {
            applied: filters,
          },
        },
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        message: "No items found",
        data: {
          items: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 20,
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

  async getRecentSearches(): Promise<string[]> {
    try {
      const response = await this.makeRequest<any[]>('/search/history');
      return response.map(item => item.query).filter(Boolean);
    } catch (error) {
      console.error('Failed to get recent searches:', error);
      return [];
    }
  }

  async saveSearch(query: string): Promise<void> {
    return this.makeRequest<void>('/search/history', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const endpoint = `/search/suggestions?q=${encodeURIComponent(query)}`;
      const response = await this.makeRequest<any>(endpoint);
      const suggestions: string[] = [];
      
      if (response.titles) {
        suggestions.push(...response.titles);
      }
      if (response.tags) {
        suggestions.push(...response.tags);
      }
      
      return suggestions.slice(0, 10); // Limit to 10 suggestions
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  // New methods for enhanced search functionality

  async getAdvancedSuggestions(query: string): Promise<SearchSuggestion[]> {
    try {
      const endpoint = `/search/advanced-suggestions?q=${encodeURIComponent(query)}`;
      const response = await this.makeRequest<SearchSuggestion[]>(endpoint);
      return response;
    } catch (error) {
      console.error('Failed to get advanced suggestions:', error);
      return [];
    }
  }

  async searchWithOperators(query: string, operators: {
    exactPhrases?: string[];
    exclusions?: string[];
    fieldSpecific?: Record<string, string>;
  }): Promise<SearchResponse> {
    try {
      const endpoint = '/search/advanced';
      const response = await this.makeRequest<any>(endpoint, {
        method: 'POST',
        body: JSON.stringify({ query, operators }),
      });
      
      return {
        message: "Advanced search completed",
        data: {
          items: response.items || [],
          pagination: response.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: response.items?.length || 0,
            itemsPerPage: response.items?.length || 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
          filters: {
            applied: {},
          },
        },
      };
    } catch (error) {
      console.error('Advanced search error:', error);
      return {
        message: "Advanced search failed",
        data: {
          items: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: 20,
            hasNextPage: false,
            hasPrevPage: false,
          },
          filters: {
            applied: {},
          },
        },
      };
    }
  }

  async exportSearchResults(query: string, filters: SearchFilters): Promise<Blob> {
    try {
      const endpoint = '/search/export';
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ query, filters }),
      });
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }
      
      return response.blob();
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  async getSearchAnalytics(): Promise<{
    totalSearches: number;
    popularQueries: Array<{ query: string; count: number }>;
    searchTrends: Array<{ date: string; count: number }>;
  }> {
    try {
      const response = await this.makeRequest<any>('/search/analytics');
      return response;
    } catch (error) {
      console.error('Failed to get search analytics:', error);
      return {
        totalSearches: 0,
        popularQueries: [],
        searchTrends: [],
      };
    }
  }
}

export const searchApi = new SearchApiService();
