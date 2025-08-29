import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, FileText, Newspaper, Image, Link, Music, CheckSquare } from 'lucide-react';
import { type UIItem } from '@/types/items';
import { searchApi } from '@/services/searchApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom'; // Added for navigation

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemClick?: (item: UIItem) => void; // Added for custom item click handling
}

const SimplifiedSearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UIItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate(); // Initialize useNavigate

  // Debounced search effect
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (query.trim().length > 1) {
      setIsLoading(true);
      debounceTimeoutRef.current = setTimeout(() => {
        performSearch(query.trim());
      }, 300); // 300ms debounce delay
    } else {
      setResults([]);
      setIsLoading(false);
    }

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query]);

  // Modal lifecycle effects (focus, close on escape/outside click)
  useEffect(() => {
    if (isOpen) {
      // Focus input when modal opens
      inputRef.current?.focus();

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };
      
      const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);


  const performSearch = async (searchQuery: string) => {
    try {
      const response = await searchApi.searchItems({ search: searchQuery });
      setResults(response.data.items);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]); // Clear results on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item: UIItem) => {
    const isPage = (item as any).searchType === "page" || item.type === "document";
    const targetUrl = isPage ? `/pages/${item.id}` : `/items/${item.id}`;
    console.log("SearchModal - Navigating to:", targetUrl);
  
    navigate(targetUrl);
    setTimeout(() => {
      onClose();
    }, 0); // let navigate finish
  };
  
  
  const getItemPreviewText = (item: UIItem): string => {
    switch (item.type) {
      case 'text':
        return item.preview || '';
      case 'document':
        // For pages, show summary or content preview
        if ((item as any).searchType === 'page') {
          return item.preview || 'Page';
        }
        return item.fileName || item.title || 'Document';
      case 'audio':
        return item.src || item.title || 'Audio';
      case 'image':
        return item.images?.[0]?.alt || item.title || 'Image';
      case 'link':
        return item.url;
      case 'todo':
        return item.todos?.[0]?.text || 'Todo list';
      default:
        return '';
    }
  };

  const getItemIcon = (itemType: string, searchType?: string) => {
    // Special handling for pages
    if (searchType === 'page') {
      return <Newspaper className="h-4 w-4 text-blue-500" />;
    }
    
    switch (itemType) {
      case 'document':
        return <Newspaper className="h-4 w-4 text-blue-500" />;
      case 'image':
        return <Image className="h-4 w-4 text-green-500" />;
      case 'link':
        return <Link className="h-4 w-4 text-purple-500" />;
      case 'audio':
        return <Music className="h-4 w-4 text-orange-500" />;
      case 'todo':
        return <CheckSquare className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 pt-[15vh]">
      <div ref={modalRef} className="bg-background rounded-lg shadow-xl w-full max-w-2xl flex flex-col">
        {/* Search Input */}
        <div className="flex items-center gap-2 p-3 border-b">
          <Search className="h-5 w-5 text-muted-foreground ml-1" />
          <Input
            ref={inputRef}
            placeholder="Search for items and pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-none focus-visible:ring-0 text-base"
          />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Results */}
        <div className="overflow-y-auto max-h-[50vh]">
          {isLoading && (
            <div className="p-6 flex items-center justify-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Searching...</span>
            </div>
          )}

          {!isLoading && query.trim().length > 1 && results.length === 0 && (
            <div className="p-6 text-center text-muted-foreground">
              <p>No results found for "{query}"</p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <ul className="p-2">
              {results.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-muted cursor-pointer"
                >
                  {getItemIcon(item.type, (item as any).searchType)}
                  <div className="flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-sm text-muted-foreground line-clamp-1">
                      {getItemPreviewText(item)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimplifiedSearchModal;
