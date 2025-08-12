import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, SortAsc, SortDesc, Calendar, Tag, Hash, Star, Archive, Globe, Clock, Eye   } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { type UIItem } from '@/types/items';
import { type SearchFilters, searchApi } from '@/services/searchApi';
import ItemCardBase from '@/components/items/ItemCardBase';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemClick?: (item: UIItem) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onItemClick }) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<UIItem[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      loadRecentSearches();
    }
  }, [isOpen]);

  // Handle click outside modal and ESC key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Load recent searches
  const loadRecentSearches = async () => {
    try {
      const recent = await searchApi.getRecentSearches();
      setRecentSearches(recent);
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch();
        loadSuggestions();
      }, 300);
    } else {
      setResults([]);
      setSuggestions([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, filters]);

  const performSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      console.log('Performing search with query:', query.trim());
      const searchFilters: SearchFilters = {
        search: query.trim(),
        ...filters,
        page: 1,
        limit: 20,
      };

      const response = await searchApi.searchItems(searchFilters);
      console.log('Search response:', response);
      setResults(response.data.items);
      setPagination(response.data.pagination);
      
      // Save search query
      await searchApi.saveSearch(query.trim());
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSuggestions = async () => {
    if (!query.trim()) return;

    try {
      const suggestions = await searchApi.getSearchSuggestions(query);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
  };

  const loadMoreResults = async () => {
    if (!pagination.hasNextPage) return;

    setIsLoading(true);
    try {
      const nextPage = pagination.currentPage + 1;
      const searchFilters: SearchFilters = {
        search: query.trim(),
        ...filters,
        page: nextPage,
        limit: 20,
      };

      const response = await searchApi.searchItems(searchFilters);
      setResults(prev => [...prev, ...response.data.items]);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to load more results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4">
      <div ref={modalRef} className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              ref={inputRef}
              placeholder="Search your notes, documents, and more..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-secondary' : ''}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 border-b bg-muted/30">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="">All Types</option>
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="link">Link</option>
                  <option value="document">Document</option>
                  <option value="audio">Audio</option>
                  <option value="todo">Todo</option>
                </select>
              </div>

              {/* Status Filters */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.isFavorite || false}
                      onChange={(e) => handleFilterChange('isFavorite', e.target.checked || undefined)}
                    />
                    <Star className="h-3 w-3" />
                    Favorites
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters.isArchived || false}
                      onChange={(e) => handleFilterChange('isArchived', e.target.checked || undefined)}
                    />
                    <Archive className="h-3 w-3" />
                    Archived
                  </label>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <select
                  value={filters.sortBy || 'createdAt'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="updatedAt">Date Modified</option>
                  <option value="title">Title</option>
                  <option value="viewCount">Views</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Order</label>
                <select
                  value={filters.sortOrder || 'desc'}
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value as 'asc' | 'desc')}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <div className="flex gap-1">
                  {Object.entries(filters).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {String(value)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!query.trim() ? (
            /* Recent Searches */
            <div className="p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Recent Searches</h3>
              <div className="space-y-2">
                {recentSearches.map((recentQuery, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(recentQuery)}
                    className="w-full text-left p-2 hover:bg-secondary rounded-md text-sm flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {recentQuery}
                  </button>
                ))}
                {recentSearches.length === 0 && (
                  <p className="text-sm text-muted-foreground">No recent searches</p>
                )}
              </div>
            </div>
          ) : (
            /* Search Results */
            <div className="p-4">
              {isLoading && results.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : results.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      {pagination.totalItems} results found
                    </p>
                    {hasActiveFilters && (
                      <Badge variant="outline" className="text-xs">
                        Filtered
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid gap-4">
                    {results.map((item) => (
                      <ItemCardBase
                        key={item.id}
                        item={item}
                        onClick={() => onItemClick?.(item)}
                        className="cursor-pointer hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium">{item.title}</h3>
                            {/* @ts-ignore */}
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </ItemCardBase>
                    ))}
                  </div>

                  {pagination.hasNextPage && (
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        onClick={loadMoreResults}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Loading...' : 'Load More'}
                      </Button>
                    </div>
                  )}
                </>
              ) : !isLoading ? (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No results found for "{query}"</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {/* Search Suggestions */}
          {query.trim() && suggestions.length > 0 && !isLoading && (
            <div className="border-t p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Suggestions</h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
