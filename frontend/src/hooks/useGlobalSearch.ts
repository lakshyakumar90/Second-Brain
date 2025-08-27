import { useState, useCallback } from 'react';

export const useGlobalSearch = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  return { isSearchOpen, openSearch, closeSearch };
};

// Keyboard shortcut hook for global search
export const useSearchKeyboardShortcut = (openSearch: () => void) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Cmd/Ctrl + K to open search
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      openSearch();
    }
  }, [openSearch]);

  // Add event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};
