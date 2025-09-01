import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
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
import { toast } from 'sonner';
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
        toast.error('Failed to load page');
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
  }, [pageId, currentWorkspace]);

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

  // Auto-save functionality
  const debouncedSave = useCallback(
    debounce(async () => {
      if (!pageId || !currentWorkspace || !isDirtyRef.current) return;

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
        
      } catch (err) {
        console.error('Auto-save failed:', err);
        toast.error('Failed to save changes');
      } finally {
        setIsSaving(false);
      }
    }, 2000),
    [pageId, currentWorkspace, title, content, summary, tags, isPublic, isArchived, extractTextFromContent]
  );

  // Handle editor updates
  const handleEditorUpdate = useCallback(({ editor }: { editor: Editor }) => {
    const json = editor.getJSON();
    setContent(json);
    isDirtyRef.current = true;
    debouncedSave();
  }, [debouncedSave]);

  // Handle title changes
  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
    isDirtyRef.current = true;
    debouncedSave();
  }, [debouncedSave]);

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
      toast.error('Add some content first to get AI suggestions');
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

      toast.success('AI suggestions generated!');
      
    } catch (err) {
      console.error('AI suggestions failed:', err);
      toast.error('Failed to generate AI suggestions');
    } finally {
      setIsAILoading(false);
    }
  }, [content, extractTextFromContent, tags, summary, debouncedSave]);

  const handleAIAction = useCallback(async (action: string, data: any) => {
    const { selectedText, editor } = data;
    const textToProcess = selectedText || extractTextFromContent(content);
    
    if (!textToProcess.trim()) {
      toast.error('No content to process');
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
            toast.success('Content improved! Check the suggestions.');
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
      toast.error('AI action failed');
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
      toast.success('Page saved successfully');
      
    } catch (err) {
      console.error('Manual save failed:', err);
      toast.error('Failed to save page');
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
          </div>

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
  );
};

export default CompleteTipTapPageEditor;
