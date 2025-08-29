import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NotionEditor from "@/components/dashboard/notion/NotionEditor";
import { pageApi } from "@/services/pageApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AIEnhancedPageEditor from "@/components/ai/AIEnhancedPageEditor";

import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  WifiOff,
  ArrowLeft,
  Search,
  MessageSquare,
} from "lucide-react";
import PageAttachments from "@/components/dashboard/page/PageAttachments";
import SearchModal from "@/components/search/SearchModal";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { PageAttachment } from "@/services/pageApi";
import type { UIItem } from "@/types/items";
import TagInput from "@/components/tags/TagInput";
import { CommentsPanel } from "@/components/comments";
import { useAppSelector } from "@/store/hooks";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const DRAFT_KEY = "page-editor-draft";

interface DraftData {
  content: string;
  editorState: unknown;
  timestamp: number;
  pageId: string;
  tags?: string[];
}

interface PageData {
  _id: string;
  title: string;
  content: string;
  editorState: unknown;
  tags?: string[];
  attachments?: PageAttachment[];
}

const PageEditor = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [page, setPage] = useState<PageData | null>(null);
  const [initialState, setInitialState] = useState<unknown>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [attachments, setAttachments] = useState<PageAttachment[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [pageSummary, setPageSummary] = useState<string>("");

  // Refs for managing autosave
  const latest = useRef<{ content: string; editorState: unknown } | null>(null);
  const timer = useRef<number | null>(null);
  const dirty = useRef(false);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const pendingSave = useRef(false);

  // Draft management functions
  const saveDraft = useCallback(
    (data: { content: string; editorState: unknown }) => {
      if (!pageId) return;
      try {
        const draft: DraftData = {
          content: data.content,
          editorState: data.editorState,
          timestamp: Date.now(),
          pageId: pageId,
          tags: selectedTags,
        };
        localStorage.setItem(`${DRAFT_KEY}-${pageId}`, JSON.stringify(draft));
      } catch (err) {
        console.warn("Failed to save draft:", err);
      }
    },
    [pageId, selectedTags]
  );

  const loadDraft = useCallback((): DraftData | null => {
    if (!pageId) return null;
    try {
      const stored = localStorage.getItem(`${DRAFT_KEY}-${pageId}`);
      if (!stored) return null;

      const draft: DraftData = JSON.parse(stored);
      // Only use draft if it's less than 24 hours old
      if (Date.now() - draft.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(`${DRAFT_KEY}-${pageId}`);
        return null;
      }
      // Load tags from draft
      if (draft.tags) {
        setSelectedTags(draft.tags);
      }
      return draft;
    } catch (err) {
      console.warn("Failed to load draft:", err);
      return null;
    }
  }, [pageId]);

  const clearDraft = useCallback(() => {
    if (!pageId) return;
    try {
      localStorage.removeItem(`${DRAFT_KEY}-${pageId}`);
      setHasDraft(false);
    } catch (err) {
      console.warn("Failed to clear draft:", err);
    }
  }, [pageId]);

  // Search functionality
  const handleSearchItemClick = useCallback((item: UIItem) => {
    console.log('Search item clicked:', item);
    // Navigate to the item or open it in editor
    if (item.id) {
      navigate(`/pages/${item.id}`);
    }
    setIsSearchModalOpen(false);
  }, [navigate]);

  // Simple formatter for displaying AI text (*** headings, - bullets, ``` code)
  const renderFormatted = useCallback((text: string) => {
    const applyInlineBold = (segment: string) => {
      const parts = segment.split(/(\*\*[^*]+\*\*)/g);
      return parts.map((part, i) => {
        if (/^\*\*[^*]+\*\*$/.test(part)) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
      });
    };

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.length === 0) {
        elements.push(<div key={`sp-${i}`} className="h-2" />);
        continue;
      }

      if (trimmed.startsWith('***')) {
        elements.push(
          <div key={`h3-${i}`} className="font-semibold text-sm">
            {applyInlineBold(trimmed.replace(/^\*\*\*/, '').trim())}
          </div>
        );
        continue;
      }

      if (trimmed.startsWith('**')) {
        elements.push(
          <div key={`h2-${i}`} className="font-semibold text-sm">
            {applyInlineBold(trimmed.replace(/^\*\*/, '').trim())}
          </div>
        );
        continue;
      }

      if (trimmed.startsWith('```')) {
        elements.push(
          <pre key={`code-${i}`} className="bg-muted/50 rounded p-2 text-xs overflow-x-auto">
            {trimmed.replace(/^```/, '')}
          </pre>
        );
        continue;
      }

      if (trimmed.startsWith('- ')) {
        elements.push(
          <div key={`li-${i}`} className="text-sm pl-4">• {applyInlineBold(trimmed.replace(/^-\s*/, ''))}</div>
        );
        continue;
      }

      elements.push(
        <div key={`p-${i}`} className="text-sm text-muted-foreground">
          {applyInlineBold(line)}
        </div>
      );
    }

    return <div className="space-y-1">{elements}</div>;
  }, []);

  // Handle AI suggestions
  const handleAITitleChange = (title: string) => {
    setPageTitle(title);
    if (page) {
      setPage({ ...page, title });
    }
  };

  const handleTitleChange = useCallback((newTitle: string) => {
    setPageTitle(newTitle);
    // Update the page title in the backend
    if (pageId && newTitle.trim()) {
      const updateData = {
        pageId,
        title: newTitle.trim()
      };
      
      // Debounce the title update to avoid too many API calls
      if (timer.current) {
        clearTimeout(timer.current);
      }
      
      timer.current = window.setTimeout(async () => {
        try {
          await pageApi.updatePage(updateData);
          // Update local page state
          setPage(prev => prev ? { ...prev, title: newTitle.trim() } : null);
        } catch (error) {
          console.error('Failed to update page title:', error);
        }
      }, 1000); // 1 second debounce
    }
  }, [pageId]);

  const handleAITagsChange = async (tags: string[]) => {
    setSelectedTags(tags);
    // Persist tags immediately
    try {
      if (pageId) {
        await pageApi.updatePage({ pageId, tags });
      }
    } catch (e) {
      console.error('Failed to update tags immediately:', e);
    }
  };

  const handleAISummaryChange = async (summary: string) => {
    setPageSummary(summary);
    // Persist summary immediately
    try {
      if (pageId) {
        await pageApi.updatePage({ pageId, summary });
      }
    } catch (e) {
      console.error('Failed to update summary immediately:', e);
    }
  };

  // Load page on mount
  useEffect(() => {
    // Flag to check if the component is still mounted
    let isActive = true;

    const loadPage = async () => {
      console.log('PageEditor - Loading page with ID:', pageId);
      
      if (!pageId) {
        console.log('PageEditor - No pageId, navigating to home');
        navigate("/home");
        return;
      }

      try {
        setIsLoading(true);
        console.log('PageEditor - Fetching page data...');
        const response = await pageApi.getPage(pageId);
        const pageData = response.page;
        console.log('PageEditor - Page data received:', pageData);

        if (!isActive) return;

        setPage(pageData);
        setSelectedTags(pageData.tags || []);
        setPageTitle(pageData.title || '');
        setPageContent(pageData.content || '');
        setPageSummary((pageData as any).summary || '');
        
        // Check for draft first
        const draft = loadDraft();
        if (draft) {
          setInitialState(draft.editorState);
          setPageContent(draft.content);
          setHasDraft(true);
        } else {
          setInitialState(pageData.editorState);
          setPageContent(pageData.content || '');
        }

        // Load attachments
        if (pageData.attachments) {
          setAttachments(pageData.attachments);
        }
      } catch (error) {
        console.error("Failed to load page:", error);
        if (isActive) {
          setError("Failed to load page");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadPage();

    // Cleanup function
    return () => {
      isActive = false;
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [pageId, navigate, loadDraft, clearDraft]);

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
    if (!latest.current || !dirty.current || inFlight.current || !pageId)
      return;

    // Don't save when offline
    if (!isOnline) {
      pendingSave.current = true;
      return;
    }

    inFlight.current = true;
    setStatus("saving");

    try {
      await pageApi.updatePage({
        pageId,
        title: page?.title || "Untitled",
        content: latest.current.content,
        editorState: latest.current.editorState,
        tags: selectedTags,
        ...(pageSummary ? { summary: pageSummary } : {}),
      });

      dirty.current = false;
      pendingSave.current = false;
      const now = new Date();
      setLastSavedAt(now);
      setStatus("saved");

      // Clear draft after successful save
      clearDraft();

      // Return to idle after showing "saved" for 1.5 seconds
      setTimeout(() => {
        if (mounted.current) {
          setStatus("idle");
        }
      }, 1500);
    } catch (error) {
      console.error("Autosave failed:", error);

      // Check if it's a network error
      if (error instanceof Error && error.message.includes("Network error")) {
        setStatus("error");
        pendingSave.current = true;
        setIsOnline(false);
        setError("Server unavailable - saving locally");
      } else {
        setStatus("error");
        pendingSave.current = true;
        // Keep dirty=true so next change will retry
      }
    } finally {
      inFlight.current = false;
    }
  }, [pageId, page?.title, clearDraft, isOnline, selectedTags, pageSummary]);

  // Manual save function
  const manualSave = useCallback(async () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    // If we're offline, try to reconnect first
    if (!isOnline) {
      try {
        await pageApi.getPage(pageId!);
        setIsOnline(true);
        setError(null);
      } catch {
        setError("Server still unavailable - saving locally");
        return;
      }
    }

    await performSave();
  }, [performSave, isOnline, pageId]);

  // Handle editor changes
  const handleEditorChange = useCallback(
    (data: { content: string; editorState: unknown }) => {
      latest.current = data;
      dirty.current = true;

      // Update the pageContent state for AI features
      setPageContent(data.content);

      // Save to localStorage immediately for safety
      saveDraft(data);

      if (isOnline) {
        setStatus("saving");
        scheduleSave();
      } else {
        setStatus("error");
      }
    },
    [scheduleSave, saveDraft, isOnline]
  );

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: () => setIsSearchModalOpen(true),
    onSave: manualSave,
  });



  // Auto-discard empty pages
  const checkAndDiscardEmpty = useCallback(async () => {
    if (!pageId || !page) return;

    // Check if page is empty (no content and no editor state)
    const isEmpty =
      (!latest.current?.content || latest.current.content.trim() === "") &&
      (!latest.current?.editorState ||
        !(latest.current.editorState as any)?.root?.children?.length ||
        (latest.current.editorState as any).root.children.every(
          (child: unknown) => {
            const childObj = child as { children?: unknown[] };
            return !childObj.children?.length ||
              childObj.children.every((grandchild: unknown) => {
                const grandchildObj = grandchild as { text?: string };
                return !grandchildObj.text?.trim();
              });
          }
        ));

    if (isEmpty && !dirty.current) {
      try {
        console.log("Auto-discarding empty page:", pageId);
        await pageApi.deletePage(pageId);
        clearDraft();
        console.log("Empty page discarded successfully");
      } catch (error) {
        console.error("Failed to discard empty page:", error);
      }
    }
  }, [pageId, page, clearDraft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Check if page should be discarded before unmounting
      if (mounted.current) {
        checkAndDiscardEmpty();
      }

      mounted.current = false;
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [checkAndDiscardEmpty]);

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
      case "saving":
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving...</span>
          </div>
        );
      case "saved":
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
      case "error":
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

  if (isLoading) {
    return (
      <div className="py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading page...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !page) {
    return (
      <div className="py-6 px-4">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/home")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate("/home")}>
              Create New Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/home")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">{page?.title || "Untitled"}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </Button>

          {pageId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommentsOpen(true)}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Comments</span>
            </Button>
          )}

          <StatusIndicator />
          {hasDraft && (
            <Badge variant="secondary" className="text-xs">
              Local backup available
            </Badge>
          )}
          <Button
            size="sm"
            onClick={manualSave}
            disabled={status === "saving" || !dirty.current || !isOnline}
          >
            {status === "saving" ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* AI-Enhanced Page Editor */}
      <div className="mb-6">
        <AIEnhancedPageEditor
          title={pageTitle}
          content={pageContent}
          onTitleChange={handleTitleChange}
          onContentChange={(content, editorState) => handleEditorChange({ content, editorState })}
          onTagsChange={handleAITagsChange}
          onSummaryChange={handleAISummaryChange}
        />
      </div>

      {/* Tags Section */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">Tags</label>
        <TagInput
          value={selectedTags}
          onChange={handleAITagsChange}
          placeholder="Add tags to organize your page..."
          maxTags={10}
        />
      </div>

      {/* Summary Section */}
      {pageSummary && (
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Summary</label>
          <div className="p-3 bg-muted/50 rounded-md">
            {renderFormatted(pageSummary)}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <div className="flex-1">
              <span className="text-sm font-medium">{error}</span>
              {error.includes("Server unavailable") && (
                <div className="text-xs text-red-600 mt-1">
                  Your work is being saved locally. It will sync when the server
                  is back online.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <NotionEditor
        initialEditorState={initialState}
        onChange={handleEditorChange}
        onTitleChange={handleTitleChange}
      />

      {/* Attachments Section */}
      {pageId && (
        <div className="mt-8">
          <PageAttachments
            pageId={pageId}
            attachments={attachments}
            onAttachmentsChange={setAttachments}
          />
        </div>
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onItemClick={handleSearchItemClick}
      />

      {/* Comments Panel */}
      {pageId && (
        <CommentsPanel
          pageId={pageId}
          currentUserId={user?._id || ""}
          isOpen={commentsOpen}
          onToggle={() => setCommentsOpen(!commentsOpen)}
        />
      )}

    </div>
  );
};

export default PageEditor;
