import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useWorkspacePermissions } from '@/hooks/useWorkspacePermissions';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import collaborationService from '@/services/collaborationService';
import { CollaborativeUsersPanel } from '@/components/collaboration';

import WorkspaceGuard from '@/components/workspace/WorkspaceGuard';
import type { Editor, JSONContent } from '@/components/ui/kibo-ui/editor';
import {
  EditorBubbleMenu,
  EditorCharacterCount,
  EditorClearFormatting,
  EditorFloatingMenu,
  EditorFormatBold,
  EditorFormatCode,
  EditorFormatItalic,
  EditorFormatStrike,
  EditorFormatSubscript,
  EditorFormatSuperscript,
  EditorFormatUnderline,
  EditorLinkSelector,
  EditorNodeBulletList,
  EditorNodeCode,
  EditorNodeHeading1,
  EditorNodeHeading2,
  EditorNodeHeading3,
  EditorNodeOrderedList,
  EditorNodeQuote,
  EditorNodeTable,
  EditorNodeTaskList,
  EditorNodeText,
  EditorProvider,
  EditorSelector,
  EditorTableColumnAfter,
  EditorTableColumnBefore,
  EditorTableColumnDelete,
  EditorTableColumnMenu,
  EditorTableDelete,
  EditorTableFix,
  EditorTableGlobalMenu,
  EditorTableHeaderColumnToggle,
  EditorTableHeaderRowToggle,
  EditorTableMenu,
  EditorTableMergeCells,
  EditorTableRowAfter,
  EditorTableRowBefore,
  EditorTableRowDelete,
  EditorTableRowMenu,
  EditorTableSplitCell,
} from '@/components/ui/kibo-ui/editor';
import { pageApi } from '@/services/pageApi';
import { aiApi } from '@/services/aiApi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Sparkles,
  Tag,
  FileText,
  Share2,
  MoreHorizontal,
  X,
  Plus,
  Wand2,
  MessageSquare,
  Settings,
  Globe,
  Lock,
  Archive,
  Lightbulb,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { debounce } from 'lodash';

interface PageData {
  _id: string;
  title: string;
  content: string;
  editorState: JSONContent;
  summary: string;
  tags: string[];
  categories: string[];
  isPublic: boolean;
  isArchived: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface AISuggestions {
  tags: string[];
  summary: string;
  insights: string[];
}

const CompleteTipTapPageEditor: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const { currentWorkspace } = useWorkspace();
  const permissions = useWorkspacePermissions();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Page state
  const [page, setPage] = useState<PageData | null>(null);
  const [title, setTitle] = useState('Untitled');
  const [content, setContent] = useState<JSONContent>({
    type: 'doc',
    content: [{ type: 'paragraph', content: [] }],
  });
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions>({
    tags: [],
    summary: '',
    insights: []
  });
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  // Refs
  const isDirtyRef = useRef(false);
  const editorRef = useRef<Editor | null>(null);
  const isApplyingRemoteRef = useRef(false);
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const summaryRef = useRef(summary);
  const tagsRef = useRef(tags);
  const isPublicRef = useRef(isPublic);
  const isArchivedRef = useRef(isArchived);
  
  // Update refs when state changes
  useEffect(() => { titleRef.current = title; }, [title]);
  useEffect(() => { contentRef.current = content; }, [content]);
  useEffect(() => { summaryRef.current = summary; }, [summary]);
  useEffect(() => { tagsRef.current = tags; }, [tags]);
  useEffect(() => { isPublicRef.current = isPublic; }, [isPublic]);
  useEffect(() => { isArchivedRef.current = isArchived; }, [isArchived]);

  // Collaboration state
  const { user } = useAuth();
  const [collaborativeUsers, setCollaborativeUsers] = useState<Array<{
    userId: string;
    username: string;
    avatar?: string;
    color: string;
    cursor: { x: number; y: number; selection?: { start: number; end: number } };
    isTyping: boolean;
    lastSeen: Date;
  }>>([]);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [collaborationStatus, setCollaborationStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected');
  const collaborationRef = useRef<any>(null);




  // Load page data
  useEffect(() => {
    if (!pageId || !currentWorkspace) return;

    const loadPage = async () => {
      try {
        setIsLoading(true);
        const response = await pageApi.getPage(pageId, currentWorkspace._id);
        const pageData = response.page || response;
        
        setPage(pageData);
        setTitle(pageData.title || 'Untitled');
        setSummary(pageData.summary || '');
        setTags(pageData.tags || []);
        setIsPublic(pageData.isPublic || false);
        setIsArchived(pageData.isArchived || false);
        
        // Handle content - use TipTap format or convert simple text
        if (pageData.editorState && pageData.editorState.type === 'doc') {
          setContent(pageData.editorState);
        } else if (pageData.content) {
          setContent({
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: pageData.content }]
              }
            ]
          });
        }

      } catch (err) {
        console.error('Failed to load page:', err);
        toast({
          title: "Error",
          description: "Failed to load page",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [pageId, currentWorkspace]);

  // Initialize collaboration when page loads
  useEffect(() => {
    if (!pageId || !currentWorkspace || !user) return;

    console.log('Initializing collaboration for:', { pageId, workspaceId: currentWorkspace._id, userId: user._id });

    setCollaborationStatus('connecting');

    // Set up status callback
    collaborationService.setStatusCallback(setCollaborationStatus);

    // Connect to collaboration service
    collaborationService.connect(
      pageId,
      currentWorkspace._id,
      user._id,
      user.username || user.name || 'Unknown User'
    );

    // Set up collaboration event listeners
    const handleCollaborationUpdate = (event: CustomEvent) => {
      const { type, data, pageId: incomingPageId } = event.detail as { type: string; data: any; pageId?: string };
      if (incomingPageId && incomingPageId !== pageId) return;
      if (type !== 'content') return;

      // Apply incoming content directly to editor to avoid local re-renders fighting
      if (editorRef.current) {
        try {
          isApplyingRemoteRef.current = true;
          editorRef.current.commands.setContent(data.content, { emitUpdate: false });
        } finally {
          // small timeout to ensure onUpdate triggered by setContent doesn't schedule autosave
          setTimeout(() => { isApplyingRemoteRef.current = false; }, 0);
        }
      } else {
        setContent(data.content);
      }
      isDirtyRef.current = false; // prevent autosave loop
    };

    // Listen for collaboration updates
    window.addEventListener('collaboration-update', handleCollaborationUpdate as EventListener);

    // Update collaborative users list
    const updateCollaborativeUsers = () => {
      const users = collaborationService.getActiveUsers();
      console.log('Current collaborative users:', users);
      setCollaborativeUsers(users);
      setIsCollaborating(users.length > 0);
    };

    // Update users list every 2 seconds
    const usersInterval = setInterval(updateCollaborativeUsers, 2000);
    updateCollaborativeUsers(); // Initial update

    return () => {
      console.log('Cleaning up collaboration...');
      window.removeEventListener('collaboration-update', handleCollaborationUpdate as EventListener);
      clearInterval(usersInterval);
      collaborationService.disconnect();
    };
  }, [pageId, currentWorkspace, user]);



  // Extract plain text from TipTap content
  const extractTextFromContent = useCallback((content: JSONContent): string => {
    if (!content.content) return '';
    
    const extractText = (nodes: any[]): string => {
      return nodes.map(node => {
        if (node.type === 'text') {
          return node.text || '';
        }
        if (node.content) {
          return extractText(node.content);
        }
        return '';
      }).join(' ');
    };

    return extractText(content.content).trim();
  }, []);

  // Auto-save functionality with stable debounce
  const debouncedSaveRef = useRef<any>(null);

  // Create debounced save function once
  useEffect(() => {
    debouncedSaveRef.current = debounce(async () => {
      if (!pageId || !currentWorkspace || !isDirtyRef.current) return;
      
      if (!permissions.canEditPages) {
        console.warn('User does not have permission to edit pages');
        return;
      }

      try {
        setIsSaving(true);
        
        await pageApi.updatePage({
          pageId,
          title: titleRef.current || 'Untitled',
          editorState: contentRef.current,
          content: extractTextFromContent(contentRef.current),
          summary: summaryRef.current,
          tags: tagsRef.current,
          isPublic: isPublicRef.current,
          isArchived: isArchivedRef.current,
          workspace: currentWorkspace._id
        });

        setLastSavedAt(new Date());
        isDirtyRef.current = false;
        
        // Optional: Show brief success indication
        console.log('Page auto-saved successfully');
        
      } catch (err) {
        console.error('Auto-save failed:', err);
        toast({
          title: "Error",
          description: "Failed to save changes",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }, 1000);

    return () => {
      if (debouncedSaveRef.current) {
        debouncedSaveRef.current.cancel();
      }
    };
  }, []);

  const debouncedSave = useCallback(() => {
    if (debouncedSaveRef.current) {
      debouncedSaveRef.current();
    }
  }, []);



  // Handle editor updates
  const handleEditorUpdate = useCallback(({ editor }: { editor: Editor }) => {
    // Cache editor instance
    if (!editorRef.current) editorRef.current = editor;

    // Ignore updates we just applied from remote
    if (isApplyingRemoteRef.current) {
      return;
    }
    if (!permissions.canEditPages) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit this page.",
        variant: "destructive",
      });
      return;
    }
    const json = editor.getJSON();
    setContent(json);
    isDirtyRef.current = true;
    
    // Send real-time collaboration update (content only)
    if (isCollaborating) {
      collaborationService.sendUpdate('content', { content: json });
    }
    
    debouncedSave();
  }, [debouncedSave, permissions.canEditPages, toast, isCollaborating]);

  // Handle title changes
  const handleTitleChange = useCallback((newTitle: string) => {
    if (!permissions.canEditPages) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit this page.",
        variant: "destructive",
      });
      return;
    }
    setTitle(newTitle);
    isDirtyRef.current = true;
    debouncedSave();
  }, [debouncedSave, permissions.canEditPages, toast]);





  // Handle summary changes
  const handleSummaryChange = useCallback((newSummary: string) => {
    setSummary(newSummary);
    isDirtyRef.current = true;
    debouncedSave();
  }, [debouncedSave]);

  // Handle tag operations
  const handleAddTag = useCallback(() => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      const updatedTags = [...tags, newTag.trim()];
      setTags(updatedTags);
      setNewTag('');
      isDirtyRef.current = true;
      debouncedSave();
    }
  }, [newTag, tags, debouncedSave]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    isDirtyRef.current = true;
    debouncedSave();
  }, [tags, debouncedSave]);

  const handleAddSuggestedTag = useCallback((tag: string) => {
    if (!tags.includes(tag)) {
      const updatedTags = [...tags, tag];
      setTags(updatedTags);
      isDirtyRef.current = true;
      debouncedSave();
    }
  }, [tags, debouncedSave]);

  // Handle settings changes
  const handlePublicToggle = useCallback((checked: boolean) => {
    setIsPublic(checked);
    isDirtyRef.current = true;
    debouncedSave();
  }, [debouncedSave]);

  const handleArchiveToggle = useCallback((checked: boolean) => {
    setIsArchived(checked);
    isDirtyRef.current = true;
    debouncedSave();
  }, [debouncedSave]);

  // AI Features
  const generateAISuggestions = useCallback(async () => {
    const text = extractTextFromContent(content);
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Add some content first to get AI suggestions",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAILoading(true);
      
      const [tagsResponse, summaryResponse, analysisResponse] = await Promise.allSettled([
        aiApi.suggestTags({ content: text }),
        aiApi.summarizeContent({ content: text }),
        aiApi.analyzeContent({ content: text })
      ]);

      const suggestions: AISuggestions = { tags: [], summary: '', insights: [] };

      if (tagsResponse.status === 'fulfilled' && tagsResponse.value.tags) {
        suggestions.tags = tagsResponse.value.tags.filter((tag: string) => !tags.includes(tag));
      }

      if (summaryResponse.status === 'fulfilled' && summaryResponse.value.summary) {
        suggestions.summary = summaryResponse.value.summary;
      }

      if (analysisResponse.status === 'fulfilled') {
        suggestions.insights = [
          ...(analysisResponse.value.insights || []),
          ...(analysisResponse.value.suggestions || [])
        ];
      }

      setAiSuggestions(suggestions);

      if (suggestions.summary && !summary) {
        setSummary(suggestions.summary);
        isDirtyRef.current = true;
        debouncedSave();
      }

      toast({
        title: "Success",
        description: "AI suggestions generated!",
        variant: "success",
      });
      
    } catch (err) {
      console.error('AI suggestions failed:', err);
      toast({
        title: "Error",
        description: "Failed to generate AI suggestions",
        variant: "destructive",
      });
    } finally {
      setIsAILoading(false);
    }
  }, [content, extractTextFromContent, tags, summary, debouncedSave]);

  const handleAIAction = useCallback(async (action: string, data: any) => {
    const { selectedText, editor } = data;
    const textToProcess = selectedText || extractTextFromContent(content);
    
    if (!textToProcess.trim()) {
      toast({
        title: "Error",
        description: "No content to process",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAILoading(true);

      switch (action) {
        case 'improve': {
          const response = await aiApi.generateContent({ 
            prompt: `Improve this text: ${textToProcess}`,
            type: 'text'
          });
          if (selectedText && editor) {
            editor.commands.insertContent(response.content);
          } else {
            toast({
              title: "Success",
              description: "Content improved! Check the suggestions.",
              variant: "success",
            });
          }
          break;
        }
        case 'summarize': {
          const response = await aiApi.summarizeContent({ content: textToProcess });
          setSummary(response.summary);
          isDirtyRef.current = true;
          debouncedSave();
          break;
        }
        case 'suggest-tags': {
          const response = await aiApi.suggestTags({ content: textToProcess });
          setAiSuggestions(prev => ({
            ...prev,
            tags: response.tags.filter((tag: string) => !tags.includes(tag))
          }));
          break;
        }
        case 'chat': {
          const response = await aiApi.chatWithAI({ 
            message: `Analyze this content and provide insights: ${textToProcess}`
          });
          setAiSuggestions(prev => ({
            ...prev,
            insights: [response.message, ...prev.insights]
          }));
          break;
        }
      }
      
    } catch (err) {
      console.error('AI action failed:', err);
      toast({
        title: "Error",
        description: "AI action failed",
        variant: "destructive",
      });
    } finally {
      setIsAILoading(false);
    }
  }, [content, extractTextFromContent, tags, debouncedSave]);

  // Manual save
  const handleManualSave = useCallback(async () => {
    if (!pageId || !currentWorkspace) return;

    try {
      setIsSaving(true);
      
      await pageApi.updatePage({
        pageId,
        title: title || 'Untitled',
        editorState: content,
        content: extractTextFromContent(content),
        summary,
        tags,
        isPublic,
        isArchived,
        workspace: currentWorkspace._id
      });

      setLastSavedAt(new Date());
      isDirtyRef.current = false;
      toast({
        title: "Success",
        description: "Page saved successfully",
        variant: "success",
      });
      
    } catch (err) {
      console.error('Manual save failed:', err);
      toast({
        title: "Error",
        description: "Failed to save page",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [pageId, currentWorkspace, title, content, summary, tags, isPublic, isArchived, extractTextFromContent]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceGuard type="page">
      <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center gap-2">
              {isSaving && (
                <div className="flex items-center text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </div>
              )}
              {lastSavedAt && !isSaving && (
                <div className="flex items-center text-muted-foreground text-sm">
                  <span>Saved {lastSavedAt.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Collaboration Status */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border">
              {collaborationStatus === 'connecting' && (
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-sm font-medium">Connecting...</span>
                </div>
              )}
              {collaborationStatus === 'connected' && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Connected</span>
                </div>
              )}
              {collaborationStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium">Connection Error</span>
                </div>
              )}
              {collaborationStatus === 'disconnected' && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span className="text-sm font-medium">Disconnected</span>
                </div>
              )}
            </div>

            {/* Collaboration Indicator */}
            {isCollaborating && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Live Collaboration
                </span>
                <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  {collaborativeUsers.length + 1} users
                </Badge>
                {collaborativeUsers.some(user => user.isTyping) && (
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-xs font-medium">Someone is typing...</span>
                  </div>
                )}
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={generateAISuggestions}
              disabled={isAILoading}
            >
              {isAILoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              AI Insights
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.location.href)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Dialog open={showPageSettings} onOpenChange={setShowPageSettings}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Settings className="w-4 h-4 mr-2" />
                      Page Settings
                    </DropdownMenuItem>
                  </DialogTrigger>
                </Dialog>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setIsPublic(!isPublic)}
                  className={isPublic ? "text-green-600" : "text-gray-600"}
                >
                  {isPublic ? <Globe className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  {isPublic ? 'Public Page' : 'Private Page'}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setIsArchived(!isArchived)}
                  className={isArchived ? "text-orange-600" : "text-gray-600"}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  {isArchived ? 'Unarchive' : 'Archive'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-5xl mx-auto p-6">
          {/* Title */}
          <div className="mb-6">
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Untitled"
              className="w-full border-none outline-none bg-transparent text-4xl font-bold placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-0"
            />
            
            {/* Save Status Indicator */}
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : lastSavedAt ? (
                <>
                  <span>Saved at {lastSavedAt.toLocaleTimeString()}</span>
                </>
              ) : (
                <span>Auto-save enabled</span>
              )}
            </div>
          </div>

          {/* Collaboration Panel */}
          {isCollaborating && (
            <div className="mb-6">
              <CollaborativeUsersPanel 
                users={collaborativeUsers}
              />
            </div>
          )}

          {/* Tags & Summary Section */}
          <div className="mb-6 space-y-4">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-3">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-muted/60 hover:bg-muted text-foreground px-3 py-2 text-sm font-medium rounded-lg border border-border/50 hover:border-border transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  {tag}
                  <X
                    className="w-3.5 h-3.5 ml-2 cursor-pointer hover:text-destructive transition-colors"
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
              <div className="flex items-center gap-3">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  className="w-36 h-10 text-sm rounded-lg border-border/50 focus:border-border bg-muted/30 focus:bg-background transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button 
                  onClick={handleAddTag} 
                  size="sm" 
                  variant="outline" 
                  className="h-10 px-3 rounded-lg border-border/50 hover:border-border hover:bg-muted transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Summary */}
            {summary && (
              <div className="p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">Summary</span>
                </div>
                <Textarea
                  value={summary}
                  onChange={(e) => handleSummaryChange(e.target.value)}
                  placeholder="Add a summary for this page..."
                  className="border-0 bg-transparent resize-none focus:ring-0 text-green-800 dark:text-green-200 placeholder:text-green-600 dark:placeholder:text-green-400"
                />
              </div>
            )}
          </div>

          {/* AI Suggestions Panel */}
          {(aiSuggestions.tags.length > 0 || aiSuggestions.summary || aiSuggestions.insights.length > 0) && (
            <div className="mb-6">
              <div className="bg-muted/30 border border-border rounded-lg overflow-hidden">
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setShowAISuggestions(!showAISuggestions)}
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium text-foreground">AI Suggestions</span>
                    <Badge variant="secondary" className="text-xs">
                      {aiSuggestions.tags.length + (aiSuggestions.summary ? 1 : 0) + aiSuggestions.insights.length}
                    </Badge>
                  </div>
                  {showAISuggestions ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                
                {showAISuggestions && (
                  <div className="p-4 pt-0 space-y-4">
                    {/* AI Suggested Tags */}
                    {aiSuggestions.tags.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-3">Suggested Tags:</p>
                        <div className="flex flex-wrap gap-3">
                          {aiSuggestions.tags.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="cursor-pointer hover:bg-muted text-muted-foreground hover:text-foreground px-3 py-1.5 text-sm font-medium rounded-md transition-all"
                              onClick={() => handleAddSuggestedTag(tag)}
                            >
                              + {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Summary */}
                    {aiSuggestions.summary && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium text-foreground">AI Generated Summary:</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-3"
                            onClick={() => {
                              setSummary(aiSuggestions.summary);
                              isDirtyRef.current = true;
                              debouncedSave();
                            }}
                          >
                            Use This
                          </Button>
                        </div>
                        <div className="text-sm text-foreground bg-muted/50 p-4 rounded-lg border border-border leading-relaxed">
                          {aiSuggestions.summary.split('\n').map((line, index) => (
                            <p key={index} className={index > 0 ? 'mt-2' : ''}>
                              {line.split('**').map((part, partIndex) => 
                                partIndex % 2 === 1 ? (
                                  <strong key={partIndex} className="font-semibold text-foreground">{part}</strong>
                                ) : (
                                  part
                                )
                              )}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI Insights */}
                    {aiSuggestions.insights.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-foreground mb-3">AI Insights:</p>
                        <div className="space-y-3">
                          {aiSuggestions.insights.slice(0, 3).map((insight, index) => (
                            <div key={index} className="text-sm text-foreground bg-muted/50 p-4 rounded-lg border border-border leading-relaxed">
                              {insight.split('\n').map((line, lineIndex) => {
                                if (!line.trim()) return <br key={lineIndex} />;
                                
                                return (
                                  <p key={lineIndex} className={lineIndex > 0 ? 'mt-2' : ''}>
                                    {line.split('**').map((part, partIndex) => 
                                      partIndex % 2 === 1 ? (
                                        <strong key={partIndex} className="font-semibold text-foreground">{part}</strong>
                                      ) : (
                                        part.split('*').map((subPart, subPartIndex) =>
                                          subPartIndex % 2 === 1 ? (
                                            <em key={subPartIndex} className="italic">{subPart}</em>
                                          ) : (
                                            subPart
                                          )
                                        )
                                      )
                                    )}
                                  </p>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Quick Actions */}
          <div className="mb-6">
            <div className="flex items-center gap-2 p-3 bg-muted/50 border border-border rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAIAction('improve', { editor: null })}
                disabled={isAILoading}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Improve Writing
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAIAction('summarize', { editor: null })}
                disabled={isAILoading}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate Summary
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAIAction('suggest-tags', { editor: null })}
                disabled={isAILoading}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Tag className="w-4 h-4 mr-2" />
                Suggest Tags
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAIAction('chat', { editor: null })}
                disabled={isAILoading}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Ask AI
              </Button>
              
              {isAILoading && (
                <div className="flex items-center text-muted-foreground text-sm ml-auto">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  AI is working...
                </div>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="w-full max-w-full overflow-hidden">
            <EditorProvider
              className="h-full w-full max-w-full overflow-x-hidden overflow-y-auto rounded-lg border bg-secondary/30 dark:bg-secondary/10 shadow-sm p-6 min-h-[600px] focus-within:shadow-md transition-shadow"
              content={content}
              onUpdate={handleEditorUpdate}
              placeholder="Start writing your page..."
              onCreate={({ editor }) => { editorRef.current = editor; }}
            >
              <EditorFloatingMenu>
                <EditorNodeHeading1 hideName />
                <EditorNodeBulletList hideName />
                <EditorNodeQuote hideName />
                <EditorNodeCode hideName />
                <EditorNodeTable hideName />
              </EditorFloatingMenu>
              <EditorBubbleMenu>
                <EditorSelector title="Text">
                  <EditorNodeText />
                  <EditorNodeHeading1 />
                  <EditorNodeHeading2 />
                  <EditorNodeHeading3 />
                  <EditorNodeBulletList />
                  <EditorNodeOrderedList />
                  <EditorNodeTaskList />
                  <EditorNodeQuote />
                  <EditorNodeCode />
                </EditorSelector>
                <EditorSelector title="Format">
                  <EditorFormatBold />
                  <EditorFormatItalic />
                  <EditorFormatUnderline />
                  <EditorFormatStrike />
                  <EditorFormatCode />
                  <EditorFormatSuperscript />
                  <EditorFormatSubscript />
                </EditorSelector>
                <EditorLinkSelector />
                <EditorClearFormatting />
              </EditorBubbleMenu>
              <EditorTableMenu>
                <EditorTableColumnMenu>
                  <EditorTableColumnBefore />
                  <EditorTableColumnAfter />
                  <EditorTableColumnDelete />
                </EditorTableColumnMenu>
                <EditorTableRowMenu>
                  <EditorTableRowBefore />
                  <EditorTableRowAfter />
                  <EditorTableRowDelete />
                </EditorTableRowMenu>
                <EditorTableGlobalMenu>
                  <EditorTableHeaderColumnToggle />
                  <EditorTableHeaderRowToggle />
                  <EditorTableDelete />
                  <EditorTableMergeCells />
                  <EditorTableSplitCell />
                  <EditorTableFix />
                </EditorTableGlobalMenu>
              </EditorTableMenu>
              <div className="mt-4 text-right">
                <EditorCharacterCount.Words className="text-sm text-muted-foreground">Words: </EditorCharacterCount.Words>
              </div>
            </EditorProvider>
          </div>
        </div>

        {/* Page Settings Dialog */}
        <Dialog open={showPageSettings} onOpenChange={setShowPageSettings}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Page Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="public">Make Page Public</Label>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={handlePublicToggle}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="archived">Archive Page</Label>
                <Switch
                  id="archived"
                  checked={isArchived}
                  onCheckedChange={handleArchiveToggle}
                />
              </div>
              {page && (
                <div className="text-sm text-muted-foreground space-y-1 pt-4 border-t">
                  <p>Views: {page.viewCount || 0}</p>
                  <p>Created: {new Date(page.createdAt).toLocaleDateString()}</p>
                  <p>Updated: {new Date(page.updatedAt).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      </div>
      </WorkspaceGuard>
  );
};

export default CompleteTipTapPageEditor;
