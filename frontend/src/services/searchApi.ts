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
      const transformedItems = response.map((item: any) => ({
        id: item._id || item.id,
        type: item.type || 'text',
        title: item.title || '',
        preview: item.content?.substring(0, 100) || item.summary?.substring(0, 100) || '',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        isFavorite: item.isFavorite || false,
        isPinned: item.isPinned || false,
        tags: item.tags || [],
        searchType: item.searchType || 'item', // 'item' or 'page'
        fileName: item.fileName, // for documents
        url: item.url, // for links
        images: item.images, // for images
        todos: item.todos, // for todos
        src: item.src, // for audio
      }));
      
      return {
        message: "Items retrieved successfully",
        data: {
          items: transformedItems,
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

  async searchPages(filters: SearchFilters = {}): Promise<SearchResponse> {
    const query = filters.search || '';
    const endpoint = `/search/pages?q=${encodeURIComponent(query)}`;
    
    try {
      const response = await this.makeRequest<any>(endpoint);
      
      // Transform pages to match UIItem format
      const transformedPages = response.map((page: any) => ({
        id: page._id || page.id,
        type: 'document' as const,
        title: page.title || '',
        preview: page.summary?.substring(0, 100) || page.content?.substring(0, 100) || '',
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        isFavorite: false,
        isPinned: false,
        tags: page.tags || [],
        searchType: 'page',
        fileName: page.title, // Use title as filename for pages
      }));
      
      return {
        message: "Pages retrieved successfully",
        data: {
          items: transformedPages,
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
      return {
        message: "No pages found",
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
      return {
        totalSearches: 0,
        popularQueries: [],
        searchTrends: [],
      };
    }
  }
}

export const searchApi = new SearchApiService();
