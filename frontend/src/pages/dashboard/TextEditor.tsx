import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NotionEditor from "@/components/dashboard/notion/NotionEditor";
import { pageApi } from "@/services/pageApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, AlertCircle, Clock, Wifi, WifiOff } from "lucide-react";

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const DRAFT_KEY = 'new-page-draft';

interface DraftData {
  content: string;
  editorState: any;
  timestamp: number;
}

const TextEditor = () => {
  const navigate = useNavigate();
  const [pageId, setPageId] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Refs for managing autosave
  const latest = useRef<{ content: string; editorState: any } | null>(null);
  const timer = useRef<number | null>(null);
  const dirty = useRef(false);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const pendingSave = useRef(false);

  // Draft management functions
  const saveDraft = useCallback((data: { content: string; editorState: any }) => {
    try {
      const draft: DraftData = {
        content: data.content,
        editorState: data.editorState,
        timestamp: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      setHasDraft(true);
    } catch (err) {
      console.warn('Failed to save draft:', err);
    }
  }, []);

  const loadDraft = useCallback((): DraftData | null => {
    try {
      const stored = localStorage.getItem(DRAFT_KEY);
      if (!stored) return null;
      
      const draft: DraftData = JSON.parse(stored);
      // Only use draft if it's less than 24 hours old
      if (Date.now() - draft.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(DRAFT_KEY);
        return null;
      }
      return draft;
    } catch (err) {
      console.warn('Failed to load draft:', err);
      return null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      setHasDraft(false);
    } catch (err) {
      console.warn('Failed to clear draft:', err);
    }
  }, []);

  // Check for draft on mount
  useEffect(() => {
    const draft = loadDraft();
    setHasDraft(!!draft);
  }, [loadDraft]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError(null);
      // Try to save pending changes when coming back online
      if (pendingSave.current && dirty.current) {
        setTimeout(() => {
          if (mounted.current && pendingSave.current && dirty.current) {
            performSave();
          }
        }, 100);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatus('error');
      setError('Network disconnected - saving locally');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Beforeunload handler to prevent data loss
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty.current && latest.current) {
        // Save draft immediately
        saveDraft(latest.current);
        
        // Show warning if there are unsaved changes
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveDraft]);

  // Debounced autosave function
  const scheduleSave = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    
    // Don't schedule saves when offline
    if (!isOnline) {
      pendingSave.current = true;
      return;
    }
    
    timer.current = window.setTimeout(() => {
      performSave();
    }, 1200); // 1.2 second debounce
  }, [isOnline]);

  // Actual save operation
  const performSave = useCallback(async () => {
    if (!latest.current || !dirty.current || inFlight.current) return;
    
    // Don't save when offline
    if (!isOnline) {
      pendingSave.current = true;
      return;
    }
    
    inFlight.current = true;
    setStatus('saving');
    
    try {
      if (pageId) {
        // Update existing page
        await pageApi.updatePage({ 
          pageId, 
          title: 'Untitled', 
          content: latest.current.content, 
          editorState: latest.current.editorState 
        });
      } else {
        // Create new page
        const created = await pageApi.createPage({ 
          title: 'Untitled', 
          content: latest.current.content, 
          editorState: latest.current.editorState 
        });
        const id = created?.page?._id || created?.page?.id;
        if (id) {
          setPageId(id);
          // Navigate to the new page
          navigate(`/pages/${id}`);
          return;
        }
      }
      
      dirty.current = false;
      pendingSave.current = false;
      const now = new Date();
      setLastSavedAt(now);
      setStatus('saved');
      
      // Clear draft after successful save
      clearDraft();
      
      // Return to idle after showing "saved" for 1.5 seconds
      setTimeout(() => {
        if (mounted.current) {
          setStatus('idle');
        }
      }, 1500);
      
    } catch (err) {
      console.error('Autosave failed:', err);
      
      // Check if it's a network error
      if (err instanceof Error && err.message.includes('Network error')) {
        setStatus('error');
        pendingSave.current = true;
        setIsOnline(false);
        setError('Server unavailable - saving locally');
      } else {
        setStatus('error');
        pendingSave.current = true;
        // Keep dirty=true so next change will retry
      }
    } finally {
      inFlight.current = false;
    }
  }, [pageId, navigate, clearDraft, isOnline]);

  // Manual save function
  const manualSave = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    
    // If we're offline, try to reconnect first
    if (!isOnline) {
      try {
        await pageApi.getPages({ page: 1, limit: 1 });
        setIsOnline(true);
        setError(null);
      } catch (err) {
        setError('Server still unavailable - saving locally');
        return;
      }
    }
    
    await performSave();
  }, [performSave, isOnline]);

  // Handle editor changes
  const handleEditorChange = useCallback((data: { content: string; editorState: any }) => {
    latest.current = data;
    dirty.current = true;
    
    // Save to localStorage immediately for safety
    saveDraft(data);
    
    if (isOnline) {
      setStatus('saving');
      scheduleSave();
    } else {
      setStatus('error');
    }
  }, [scheduleSave, saveDraft, isOnline]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  // Status display component
  const StatusIndicator = () => {
    if (!isOnline) {
      return (
        <div className="flex items-center gap-2 text-sm text-orange-600">
          <WifiOff className="h-4 w-4" />
          <span>Offline - saving locally</span>
        </div>
      );
    }

    switch (status) {
      case 'saving':
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span>Saved</span>
            {lastSavedAt && (
              <span className="text-xs text-muted-foreground">
                {lastSavedAt.toLocaleTimeString()}
              </span>
            )}
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>Save failed</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={manualSave}
              className="h-6 px-2 text-xs"
            >
              Retry
            </Button>
          </div>
        );
      default:
        return lastSavedAt ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last saved {lastSavedAt.toLocaleTimeString()}</span>
          </div>
        ) : null;
    }
  };

  return (
    <div className="py-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">New Page</h1>
        <div className="flex items-center gap-4">
          <StatusIndicator />
          {hasDraft && (
            <Badge variant="secondary" className="text-xs">
              Local backup available
            </Badge>
          )}
          <Button 
            size="sm" 
            onClick={manualSave} 
            disabled={status === 'saving' || !dirty.current || !isOnline}
          >
            {status === 'saving' ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <div className="flex-1">
              <span className="text-sm font-medium">{error}</span>
              {error.includes('Server unavailable') && (
                <div className="text-xs text-red-600 mt-1">
                  Your work is being saved locally. It will sync when the server is back online.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <NotionEditor
        onChange={handleEditorChange}
      />
    </div>
  );
};

export default TextEditor;