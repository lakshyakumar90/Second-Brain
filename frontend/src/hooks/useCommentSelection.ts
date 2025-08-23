import { useState, useEffect, useCallback } from 'react';

interface SelectionState {
  isVisible: boolean;
  position: { x: number; y: number };
  selectedText: string;
  range: Range | null;
}

export const useCommentSelection = () => {
  const [selection, setSelection] = useState<SelectionState>({
    isVisible: false,
    position: { x: 0, y: 0 },
    selectedText: '',
    range: null,
  });

  const getSelectionPosition = useCallback((range: Range): { x: number; y: number } => {
    const rect = range.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    // Position the bubble above the selection
    const x = rect.left + scrollLeft + rect.width / 2;
    const y = rect.top + scrollTop - 10; // 10px above the selection

    // Ensure the bubble stays within viewport bounds
    const bubbleWidth = 350; // Approximate bubble width
    const bubbleHeight = 200; // Approximate bubble height
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontal position to keep bubble in viewport
    let adjustedX = x - bubbleWidth / 2;
    if (adjustedX < 10) adjustedX = 10;
    if (adjustedX + bubbleWidth > viewportWidth - 10) {
      adjustedX = viewportWidth - bubbleWidth - 10;
    }

    // Adjust vertical position to keep bubble in viewport
    let adjustedY = y;
    if (adjustedY < scrollTop + 10) {
      // If bubble would be above viewport, position it below the selection
      adjustedY = rect.bottom + scrollTop + 10;
    }
    if (adjustedY + bubbleHeight > scrollTop + viewportHeight - 10) {
      // If bubble would be below viewport, position it above the selection
      adjustedY = rect.top + scrollTop - bubbleHeight - 10;
    }

    return { x: adjustedX, y: adjustedY };
  }, []);

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    
    if (!selection || selection.rangeCount === 0) {
      setSelection(prev => ({ ...prev, isVisible: false }));
      return;
    }

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString().trim();

    if (selectedText.length === 0) {
      setSelection(prev => ({ ...prev, isVisible: false }));
      return;
    }

    // Only show bubble for meaningful selections (more than 1 character)
    if (selectedText.length < 2) {
      setSelection(prev => ({ ...prev, isVisible: false }));
      return;
    }

    const position = getSelectionPosition(range);
    
    setSelection({
      isVisible: true,
      position,
      selectedText,
      range,
    });
  }, [getSelectionPosition]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    // Close bubble if clicking outside of it
    const target = event.target as Element;
    if (!target.closest('[data-comment-bubble]')) {
      setSelection(prev => ({ ...prev, isVisible: false }));
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Close bubble on Escape key
    if (event.key === 'Escape') {
      setSelection(prev => ({ ...prev, isVisible: false }));
    }
  }, []);

  const closeBubble = useCallback(() => {
    setSelection(prev => ({ ...prev, isVisible: false }));
  }, []);

  useEffect(() => {
    // Add event listeners
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      // Clean up event listeners
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSelectionChange, handleClickOutside, handleKeyDown]);

  return {
    selection,
    closeBubble,
  };
};
