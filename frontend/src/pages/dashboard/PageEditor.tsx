import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NotionEditor from "@/components/dashboard/notion/NotionEditor";
import { pageApi } from "@/services/pageApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  WifiOff,
  ArrowLeft,
} from "lucide-react";
import PageAttachments from "@/components/dashboard/page/PageAttachments";
import type { PageAttachment } from "@/services/pageApi";
import TagInput from "@/components/tags/TagInput";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const DRAFT_KEY = "page-editor-draft";

interface DraftData {
  content: string;
  editorState: any;
  timestamp: number;
  pageId: string;
  tags?: string[];
}

const PageEditor = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<any>(null);
  const [initialState, setInitialState] = useState<any>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [attachments, setAttachments] = useState<PageAttachment[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Refs for managing autosave
  const latest = useRef<{ content: string; editorState: any } | null>(null);
  const timer = useRef<number | null>(null);
  const dirty = useRef(false);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const pendingSave = useRef(false);

  // Draft management functions
  const saveDraft = useCallback(
    (data: { content: string; editorState: any }) => {
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

  // Load page on mount
  useEffect(() => {
    // Flag to check if the component is still mounted
    let isActive = true;

    const loadPage = async () => {
      if (!pageId) {
        navigate("/text-editor");
        return;
      }

      try {
        setIsLoading(true);
        const response = await pageApi.getPage(pageId);
        const pageData = response.page;

        if (!isActive) return;

        setPage(pageData);
        setSelectedTags(pageData.tags || []);
        
        // Check for draft first
        const draft = loadDraft();
        if (draft) {
          setInitialState(draft.editorState);
          setHasDraft(true);
        } else {
          setInitialState(pageData.editorState);
        }

        // Load attachments
        if (pageData.attachments) {
          setAttachments(pageData.attachments);
        }
      } catch (err) {
        console.error("Failed to load page:", err);
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
    } catch (err) {
      console.error("Autosave failed:", err);

      // Check if it's a network error
      if (err instanceof Error && err.message.includes("Network error")) {
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
  }, [pageId, page?.title, clearDraft, isOnline, selectedTags]);

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
      } catch (err) {
        setError("Server still unavailable - saving locally");
        return;
      }
    }

    await performSave();
  }, [performSave, isOnline, pageId]);

  // Handle editor changes
  const handleEditorChange = useCallback(
    (data: { content: string; editorState: any }) => {
      latest.current = data;
      dirty.current = true;

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

  // Auto-discard empty pages
  const checkAndDiscardEmpty = useCallback(async () => {
    if (!pageId || !page) return;

    // Check if page is empty (no content and no editor state)
    const isEmpty =
      (!latest.current?.content || latest.current.content.trim() === "") &&
      (!latest.current?.editorState ||
        !latest.current.editorState.root?.children?.length ||
        latest.current.editorState.root.children.every(
          (child: any) =>
            !child.children?.length ||
            child.children.every((grandchild: any) => !grandchild.text?.trim())
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
            onClick={() => navigate("/text-editor")}
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
            <Button onClick={() => navigate("/text-editor")}>
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
            onClick={() => navigate("/text-editor")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold">{page?.title || "Untitled"}</h1>
        </div>
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
            disabled={status === "saving" || !dirty.current || !isOnline}
          >
            {status === "saving" ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Tags Section */}
      <div className="mb-4">
        <label className="text-sm font-medium mb-2 block">Tags</label>
        <TagInput
          value={selectedTags}
          onChange={setSelectedTags}
          placeholder="Add tags to organize your page..."
          maxTags={10}
        />
      </div>

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
    </div>
  );
};

export default PageEditor;
